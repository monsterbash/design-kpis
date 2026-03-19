"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { Metric, Entry, User } from "@/lib/schema";
import MetricTile from "./MetricTile";
import MetricDetail from "./MetricDetail";

type SafeUser = Omit<User, "password">;

type MetricWithData = {
  metric: Metric;
  owner: SafeUser;
  entries: Entry[];
};

export default function Dashboard({
  activeMetrics,
  archivedMetrics,
  users,
}: {
  activeMetrics: MetricWithData[];
  archivedMetrics: MetricWithData[];
  users: SafeUser[];
}) {
  const { data: session } = useSession();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const isLoggedIn = !!session?.user;

  const expanded = [...activeMetrics, ...archivedMetrics].find(
    (m) => m.metric.id === expandedId
  );

  const hasNoMetrics =
    activeMetrics.length === 0 && archivedMetrics.length === 0;

  return (
    <div>
      {/* New Metric button */}
      {isLoggedIn && !hasNoMetrics && (
        <div className="mb-4 flex justify-end">
          <Link
            href="/metrics/new"
            className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            New Metric
          </Link>
        </div>
      )}

      {/* Empty state */}
      {hasNoMetrics && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 3v18h18"
                stroke="currentColor"
                className="text-navy-500"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 16l4-6 4 4 5-8"
                stroke="currentColor"
                className="text-navy-500"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-text-primary">
            No metrics yet
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            {isLoggedIn
              ? "Create your first metric to get started."
              : "Log in and create your first metric to get started."}
          </p>
          {isLoggedIn && (
            <Link
              href="/metrics/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              New Metric
            </Link>
          )}
        </div>
      )}

      {/* Active Metrics Grid */}
      {activeMetrics.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeMetrics.map(({ metric, owner, entries }) => (
            <MetricTile
              key={metric.id}
              metric={metric}
              owner={owner}
              entries={entries}
              isExpanded={expandedId === metric.id}
              onToggle={() =>
                setExpandedId(expandedId === metric.id ? null : metric.id)
              }
            />
          ))}
        </div>
      )}

      {/* Expanded Detail */}
      {expanded && !showArchived && (
        <div className="mt-4">
          <MetricDetail
            metric={expanded.metric}
            entries={expanded.entries}
            owner={expanded.owner}
            users={users}
          />
        </div>
      )}

      {/* Archived Toggle */}
      {archivedMetrics.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`transition-transform ${showArchived ? "rotate-180" : ""}`}
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            View archived ({archivedMetrics.length})
          </button>

          {showArchived && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {archivedMetrics.map(({ metric, owner, entries }) => (
                  <div key={metric.id} className="opacity-60">
                    <MetricTile
                      metric={metric}
                      owner={owner}
                      entries={entries}
                      isExpanded={expandedId === metric.id}
                      onToggle={() =>
                        setExpandedId(
                          expandedId === metric.id ? null : metric.id
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              {expanded && showArchived && (
                <MetricDetail
                  metric={expanded.metric}
                  entries={expanded.entries}
                  owner={expanded.owner}
                  users={users}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
