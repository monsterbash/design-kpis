"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { archiveUser } from "@/lib/actions";

export default function AccountPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [confirmArchive, setConfirmArchive] = useState(false);

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const user = session.user;

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-12">
      <h1 className="text-2xl font-bold text-text-primary">Account</h1>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Name
            </span>
            <p className="mt-0.5 text-sm text-text-primary">{user.name}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Email
            </span>
            <p className="mt-0.5 text-sm text-text-primary">{user.email}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Role
            </span>
            <p className="mt-0.5 text-sm text-text-primary">
              {(user as { role?: string }).role || "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-coral-200 bg-coral-100 p-6">
        <h2 className="text-base font-semibold text-text-primary">
          Archive account
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Archiving your account is permanent. You will no longer be able to
          log in, and all your metrics will be archived.
        </p>

        {!confirmArchive ? (
          <button
            onClick={() => setConfirmArchive(true)}
            className="mt-4 rounded-lg border border-coral-300 px-4 py-2 text-sm font-medium text-coral-500 transition-colors hover:bg-coral-200"
          >
            Archive my account
          </button>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={async () => {
                await archiveUser(Number(user.id));
              }}
              className="rounded-lg bg-coral-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-400"
            >
              Yes, archive permanently
            </button>
            <button
              onClick={() => setConfirmArchive(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-navy-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
