"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { logout } from "@/lib/actions";

export default function NavBar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-40 bg-navy-900 text-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Design KPIs
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/about"
            className="text-navy-200 transition-colors hover:text-white"
          >
            About
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/settings"
                className="text-navy-200 transition-colors hover:text-white"
              >
                {session.user.name}
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-navy-300 transition-colors hover:text-white"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-navy-700 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-navy-600"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
