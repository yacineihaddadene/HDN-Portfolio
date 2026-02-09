"use client";

import { Suspense, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LoginErrorBoundary } from "./error-boundary";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Login failed");
        setLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="admin-theme min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background gradients */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, hsl(270 80% 65% / 0.3) 0%, transparent 50%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 70% 70%, hsl(220 90% 60% / 0.3) 0%, transparent 50%)",
        }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-4 border border-border shadow-lg"
          >
            <Lock className="w-8 h-8 text-foreground" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold mb-2 text-foreground">
            Admin Login
          </h1>
          <p className="text-muted-foreground">
            Enter your credentials to continue
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        <Suspense fallback={<div className="mb-6 h-12 bg-muted rounded-lg animate-pulse" />}>
          <LoginErrorBoundary />
        </Suspense>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder-muted-foreground transition-all"
              placeholder=""
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-card border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder-muted-foreground pr-12 transition-all"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-foreground text-background hover:bg-foreground/90 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to portfolio
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
