import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/jwt-verification";

// DigitalOcean Spaces configuration (S3-compatible)
const spacesClient = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT!, // e.g., "https://nyc3.digitaloceanspaces.com"
  region: process.env.DO_SPACES_REGION || "us-east-1", // DigitalOcean Spaces uses "us-east-1" as default
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
  forcePathStyle: false, // Required for DigitalOcean Spaces
});

export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `hobbies/${timestamp}-${sanitizedFilename}`;
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to DigitalOcean Spaces
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Make file publicly accessible
      Metadata: {
        'original-filename': file.name,
        'uploaded-at': new Date().toISOString(),
      },
    });

    await spacesClient.send(uploadCommand);

    // Construct public URL
    // Format: https://{bucket}.{region}.digitaloceanspaces.com/{key}
    const bucketName = process.env.DO_SPACES_BUCKET!;
    const region = process.env.DO_SPACES_REGION || 'nyc3';
    const fileUrl = `https://${bucketName}.${region}.digitaloceanspaces.com/${key}`;

    console.log('Hobby image uploaded successfully:', fileUrl);
    
    return NextResponse.json({ 
      filename: file.name,
      fileUrl: fileUrl,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
