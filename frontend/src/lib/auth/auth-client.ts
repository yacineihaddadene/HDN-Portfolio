import { createAuthClient } from 'better-auth/react';

// Better Auth client constructs URLs as: baseURL + /sign-in/email
// So baseURL must point to the auth API root: /auth/api/auth
const authServiceUrl = 
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001/api/auth'
    : process.env.AUTH_SERVICE_URL || 'http://auth-service:3001/api/auth';

export const authClient = createAuthClient({
  baseURL: authServiceUrl,
});
