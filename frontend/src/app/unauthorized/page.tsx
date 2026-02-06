export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-red-500 mb-4"
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You must be authenticated to access the admin dashboard. Please log in first.
          </p>
        </div>

        <a
          href="/login?redirect=/dashboard"
          className="inline-block px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Go to Login
        </a>

        <p className="text-sm text-muted-foreground mt-6">
          <a href="/" className="text-accent hover:underline">
            ← Back to portfolio
          </a>
        </p>
      </div>
    </div>
  );
}
