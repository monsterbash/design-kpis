"use client";

import { useState } from "react";
import type { Metric, Entry, User } from "@/lib/schema";

type SafeUser = Omit<User, "password">;
import { computeMetricValue } from "@/lib/queries-client";

export default function MetricTile({
  metric,
  owner,
  entries,
  isExpanded,
  onToggle,
}: {
  metric: Metric;
  owner: SafeUser;
  entries: Entry[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const value = computeMetricValue(metric, entries);

  return (
    <button
      onClick={onToggle}
      className={`group relative w-full rounded-xl border bg-surface p-5 text-left transition-all hover:shadow-md ${
        isExpanded
          ? "border-navy-300 shadow-md ring-1 ring-navy-200"
          : "border-border hover:border-navy-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text-primary truncate">
            {metric.name}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">{owner.name}</p>
        </div>

        <div className="relative ml-3 flex-shrink-0">
          <span
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-navy-50 hover:text-navy-600"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="8"
                cy="8"
                r="7"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 7V11.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="8" cy="5" r="0.75" fill="currentColor" />
            </svg>
          </span>

          {showTooltip && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-surface p-3 text-sm text-text-secondary shadow-lg">
              {metric.shortDescription}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-navy-800">{value}</span>
          <span className="ml-1.5 text-xs text-text-muted">
            {metric.displayType === "percentage"
              ? "adoption"
              : metric.displayType === "computed_average"
                ? "avg score"
                : "avg"}
          </span>
        </div>
        <span className="text-xs text-text-muted">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </div>
    </button>
  );
}
