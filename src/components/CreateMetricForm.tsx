"use client";

import { useState } from "react";
import { createMetric } from "@/lib/actions";
import { FIELD_TEMPLATES } from "@/lib/field-templates";
import type { User } from "@/lib/schema";

type SafeUser = Omit<User, "password">;

export default function CreateMetricForm({ users }: { users: SafeUser[] }) {
  const [error, setError] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = await createMetric(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Metric name
        </label>
        <input
          type="text"
          name="name"
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
          placeholder="e.g. Handoff Quality Score"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Short description
        </label>
        <input
          type="text"
          name="shortDescription"
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
          placeholder="Shown in the tooltip on the metric tile"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Full description
        </label>
        <textarea
          name="fullDescription"
          required
          rows={3}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
          placeholder="Detailed explanation of what this metric measures and how entries are collected"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Owner
        </label>
        <select
          name="ownerId"
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
        >
          <option value="">Select owner...</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            Cadence
          </label>
          <input
            type="text"
            name="cadence"
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
            placeholder="e.g. Monthly"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            Target
          </label>
          <input
            type="text"
            name="target"
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
            placeholder="e.g. Higher is better (→ 5)"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Rating type
        </label>
        <div className="space-y-2">
          {FIELD_TEMPLATES.map((template) => (
            <label
              key={template.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                selectedTemplate === template.id
                  ? "border-navy-400 bg-navy-50"
                  : "border-border hover:border-navy-200 hover:bg-navy-50"
              }`}
            >
              <input
                type="radio"
                name="fieldTemplate"
                value={template.id}
                required
                onChange={() => setSelectedTemplate(template.id)}
                className="mt-0.5"
              />
              <div>
                <span className="text-sm font-medium text-text-primary">
                  {template.label}
                </span>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {template.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-coral-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-navy-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
        >
          Create Metric
        </button>
        <a
          href="/"
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-navy-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
