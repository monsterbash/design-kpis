"use client";

import { useState, useEffect } from "react";
import { updateSiteProtection } from "@/lib/actions";

type Props = {
  initialEnabled: boolean;
  hasPassword: boolean;
};

export default function SiteProtectionSettings({
  initialEnabled,
  hasPassword,
}: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEnabled(initialEnabled);
  }, [initialEnabled]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.set("enabled", String(enabled));
    if (password) formData.set("password", password);

    const result = await updateSiteProtection(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setMessage("Site protection updated.");
      setPassword("");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-base font-semibold text-text-primary">
        Site protection
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Require a shared password before anyone can access the app. Useful for
        keeping the site private when deployed to a public URL.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
              enabled ? "bg-teal-500" : "bg-navy-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-text-primary">
            {enabled ? "Protection enabled" : "Protection disabled"}
          </span>
        </label>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {hasPassword ? "Change password" : "Set password"}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={hasPassword ? "Leave blank to keep current" : "Choose a site password"}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
          />
          {hasPassword && (
            <p className="mt-1 text-xs text-text-muted">
              A password is currently set. Enter a new one to change it, or
              leave blank to keep the existing password.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-coral-500">{error}</p>}
        {message && <p className="text-sm text-teal-600">{message}</p>}

        <button
          type="submit"
          className="rounded-lg bg-navy-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
        >
          Save
        </button>
      </form>
    </div>
  );
}
