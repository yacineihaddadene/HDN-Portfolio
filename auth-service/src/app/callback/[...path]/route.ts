import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { toNextJsHandler } from 'better-auth/next-js';

const handler = toNextJsHandler(auth);

/**
 * Catch-all route handler for OAuth callbacks at /callback/*
 * 
 * This handles cases where OAuth providers redirect to /callback/google
 * instead of /api/auth/callback/google. We forward the request to the
 * Better Auth handler which is at /api/auth/[...all]
 * 
 * DigitalOcean routes /auth/* to auth-service and strips /auth prefix
 * So /auth/callback/google becomes /callback/google in Next.js
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const url = new URL(request.url);
    
    // In Next.js 15, params is a Promise and must be awaited
    const resolvedParams = await params;
    
    // Get the callback path from route params (e.g., ['google'] from /callback/google)
    // Join array in case of nested paths (shouldn't happen for OAuth, but be safe)
    const callbackPath = Array.isArray(resolvedParams.path) 
      ? resolvedParams.path.join('/') 
      : resolvedParams.path || '';
    
    console.log('[OAuth Callback] Received request:', {
      pathname: url.pathname,
      callbackPath,
      search: url.search,
      origin: url.origin,
      params: resolvedParams.path,
    });
    
    if (!callbackPath) {
      console.error('[OAuth Callback] No callback path provided');
      return NextResponse.json({ error: 'Invalid callback path' }, { status: 400 });
    }
    
    // Construct the internal API path to Better Auth
    const apiPath = `/api/auth/callback/${callbackPath}`;
    const apiUrl = new URL(apiPath, request.url);
    apiUrl.search = url.search; // Preserve all query parameters (state, code, etc.)
    
    console.log('[OAuth Callback] Forwarding to Better Auth:', apiUrl.toString());
    
    // Create a new request that points to the Better Auth handler
    const apiRequest = new NextRequest(apiUrl, {
      method: 'GET',
      headers: request.headers,
    });
    
    // Forward to Better Auth handler
    const response = await handler.GET(apiRequest);
    
    console.log('[OAuth Callback] Better Auth response:', {
      status: response.status,
      statusText: response.statusText,
    });
    
    // Better Auth handles the OAuth callback and should redirect to callbackURL
    // We just need to ensure the response is returned properly
    // The redirect will be handled by Better Auth based on the callbackURL parameter
    return response;
  } catch (error) {
    console.error('[OAuth Callback] Route error:', error);
    if (error instanceof Error) {
      console.error('[OAuth Callback] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Forward POST requests as well (some OAuth flows use POST)
  const url = new URL(request.url);
  
  // In Next.js 15, params is a Promise and must be awaited
  const resolvedParams = await params;
  
  // Get the callback path from route params
  const callbackPath = Array.isArray(resolvedParams.path) 
    ? resolvedParams.path.join('/') 
    : resolvedParams.path || '';
  
  if (!callbackPath) {
    return NextResponse.json({ error: 'Invalid callback path' }, { status: 400 });
  }
  
  const rewriteUrl = new URL(`/api/auth/callback/${callbackPath}`, request.url);
  rewriteUrl.search = url.search;
  
  // Read body before creating new request
  const body = await request.text();
  
  const rewriteRequest = new NextRequest(rewriteUrl, {
    method: 'POST',
    headers: request.headers,
    body: body,
  });
  
  return handler.POST(rewriteRequest);
}
