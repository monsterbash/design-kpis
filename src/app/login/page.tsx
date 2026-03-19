"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions";

export default function LoginPage() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-text-primary">Log in</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Sign in to add and edit metric entries.
        </p>

        <form action={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
              placeholder="you@team.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-coral-500">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-navy-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-navy-700 hover:text-navy-600"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
