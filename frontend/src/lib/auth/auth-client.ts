import { createAuthClient } from 'better-auth/react';

// Better Auth client automatically appends /api/auth to the baseURL
// So baseURL should be just the service root
const authServiceUrl = 
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001'
    : process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

export const authClient = createAuthClient({
  baseURL: authServiceUrl,
});
