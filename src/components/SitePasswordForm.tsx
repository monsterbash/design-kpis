"use client";

import { useState } from "react";
import { verifySitePassword } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function SitePasswordForm() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = await verifySitePassword(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-text-primary">Design KPIs</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Enter the site password to continue.
        </p>

        <form action={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-coral-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-navy-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
