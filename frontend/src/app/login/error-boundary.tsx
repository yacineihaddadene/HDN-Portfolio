"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export function LoginErrorBoundary() {
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for error from redirect
    const errorParam = searchParams.get("error");
    const messageParam = searchParams.get("message");
    
    if (errorParam === "unauthorized") {
      setError(messageParam ? decodeURIComponent(messageParam) : "Access Denied: You must be authenticated to access the admin dashboard");
    }
  }, [searchParams]);

  return error ? (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-start gap-3"
    >
      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <span>{error}</span>
    </motion.div>
  ) : null;
}
