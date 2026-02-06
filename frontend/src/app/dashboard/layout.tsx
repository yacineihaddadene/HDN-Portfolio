import { headers } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  const headersList = headers();
  const cookies = headersList.get('cookie');
  
  // Check if session cookie exists
  const hasSession = cookies?.includes('better-auth.session_token');
  
  if (!hasSession) {
    // Return error page instead of rendering children
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border border-red-500/50 mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 4v2m0-12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>
            <p className="text-gray-400 mb-8">
              You must be authenticated to access the admin dashboard. Please log in with your credentials.
            </p>
          </div>

          <a
            href="/login"
            className="inline-block w-full px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-semibold mb-4"
          >
            Go to Login
          </a>

          <a
            href="/"
            className="inline-block text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to portfolio
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
