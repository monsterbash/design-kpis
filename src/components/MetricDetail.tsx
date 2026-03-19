"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { Metric, Entry, User, FieldDefinition } from "@/lib/schema";

type SafeUser = Omit<User, "password">;
import { deleteEntry, archiveMetric } from "@/lib/actions";
import EntryDrawer from "./EntryDrawer";

function formatRating(
  metric: Metric,
  entry: Entry
): string {
  const fields = metric.fieldDefinitions as FieldDefinition[];
  const ratings = entry.ratings as Record<string, number | string>;

  return fields
    .map((field) => {
      const val = ratings[field.name];
      if (field.type === "radio") return `${val}`;
      if (field.name === "yes_count")
        return `Yes: ${val}`;
      if (field.name === "somewhat_count")
        return `Somewhat: ${val}`;
      if (field.name === "no_count")
        return `No: ${val}`;
      return `${val}`;
    })
    .join(" · ");
}

function computeEntryScore(metric: Metric, entry: Entry): string | null {
  if (metric.displayType !== "computed_average") return null;
  const r = entry.ratings as Record<string, number>;
  const yes = r.yes_count || 0;
  const somewhat = r.somewhat_count || 0;
  const no = r.no_count || 0;
  const total = yes + somewhat + no;
  if (total === 0) return "—";
  return ((yes * 3 + somewhat * 2 + no * 1) / total).toFixed(2);
}

export default function MetricDetail({
  metric,
  entries,
  owner,
  users,
}: {
  metric: Metric;
  entries: Entry[];
  owner: SafeUser;
  users: SafeUser[];
}) {
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const isArchived = metric.status === "archived";
  const isLoggedIn = !!session?.user;

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-text-primary">
              {metric.name}
            </h2>
            {isArchived && (
              <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-600">
                Archived
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Owned by {owner.name} · {metric.cadence}
          </p>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed">
            {metric.fullDescription}
          </p>
        </div>

        {isLoggedIn && !isArchived && (
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <button
              onClick={() => {
                setEditingEntry(null);
                setDrawerOpen(true);
              }}
              className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700"
            >
              Add Entry
            </button>
            <button
              onClick={() => setConfirmArchive(true)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:border-coral-300 hover:text-coral-500"
            >
              Archive
            </button>
          </div>
        )}
      </div>

      {confirmArchive && (
        <div className="mt-4 rounded-lg border border-coral-200 bg-coral-100 p-4">
          <p className="text-sm font-medium text-text-primary">
            Archive this metric?
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            This action cannot be undone. The metric will become read-only.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={async () => {
                await archiveMetric(metric.id);
                setConfirmArchive(false);
              }}
              className="rounded-lg bg-coral-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-400"
            >
              Yes, archive
            </button>
            <button
              onClick={() => setConfirmArchive(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-navy-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        {sortedEntries.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            No entries yet.{" "}
            {isLoggedIn && !isArchived && 'Click "Add Entry" to get started.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">Rating</th>
                  {metric.displayType === "computed_average" && (
                    <th className="pb-3 pr-4">Score</th>
                  )}
                  <th className="pb-3 pr-4">Submitted by</th>
                  {isLoggedIn && !isArchived && (
                    <th className="pb-3 w-20"></th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {sortedEntries.map((entry) => {
                  const submitter = userMap[entry.submittedBy];
                  const entryScore = computeEntryScore(metric, entry);
                  return (
                    <tr key={entry.id} className="group">
                      <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 pr-4 text-text-primary max-w-xs truncate">
                        {entry.description}
                      </td>
                      <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                        {formatRating(metric, entry)}
                      </td>
                      {metric.displayType === "computed_average" && (
                        <td className="py-3 pr-4 font-medium text-navy-800 whitespace-nowrap">
                          {entryScore}
                        </td>
                      )}
                      <td className="py-3 pr-4 text-text-secondary">
                        {submitter?.name ?? "Unknown"}
                      </td>
                      {isLoggedIn && !isArchived && (
                        <td className="py-3">
                          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => {
                                setEditingEntry(entry);
                                setDrawerOpen(true);
                              }}
                              className="rounded px-2 py-1 text-xs text-text-secondary hover:bg-navy-50 hover:text-navy-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm("Delete this entry?")) {
                                  await deleteEntry(entry.id);
                                }
                              }}
                              className="rounded px-2 py-1 text-xs text-text-secondary hover:bg-coral-100 hover:text-coral-500"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {drawerOpen && (
        <EntryDrawer
          metric={metric}
          entry={editingEntry}
          onClose={() => {
            setDrawerOpen(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
}
