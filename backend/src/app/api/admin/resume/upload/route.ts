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

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `resumes/${timestamp}-${sanitizedFilename}`;
    
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

    console.log('Resume uploaded successfully:', fileUrl);
    
    return NextResponse.json({ 
      filename: file.name,
      fileUrl: fileUrl,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Optional: DELETE endpoint to remove files from Spaces
export async function DELETE(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('fileUrl');
    
    if (!fileUrl) {
      return NextResponse.json(
        { error: 'File URL is required' },
        { status: 400 }
      );
    }

    // Extract key from URL
    const urlParts = fileUrl.split('/');
    const key = urlParts.slice(-2).join('/'); // e.g., "resumes/123456-file.pdf"

    // Delete from DigitalOcean Spaces
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET!,
      Key: key,
    });

    await spacesClient.send(deleteCommand);

    return NextResponse.json({ 
      success: true,
      message: 'File deleted successfully' 
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete file',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
