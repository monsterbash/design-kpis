"use client";

import { useState, useEffect } from "react";
import type { Metric, Entry, FieldDefinition } from "@/lib/schema";
import { createEntry, updateEntry } from "@/lib/actions";

export default function EntryDrawer({
  metric,
  entry,
  onClose,
}: {
  metric: Metric;
  entry: Entry | null;
  onClose: () => void;
}) {
  const fields = metric.fieldDefinitions as FieldDefinition[];
  const isEditing = !!entry;

  const [description, setDescription] = useState(entry?.description ?? "");
  const [ratings, setRatings] = useState<Record<string, string>>(() => {
    if (entry) {
      const r = entry.ratings as Record<string, number | string>;
      return Object.fromEntries(
        Object.entries(r).map(([k, v]) => [k, String(v)])
      );
    }
    return Object.fromEntries(fields.map((f) => [f.name, ""]));
  });
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setErrorMessage("Description is required");
      setStatus("error");
      return;
    }

    const parsedRatings: Record<string, number | string | boolean> = {};
    for (const field of fields) {
      const val = ratings[field.name];
      if (field.type === "radio") {
        if (!val) {
          setErrorMessage(`"${field.name}" is required`);
          setStatus("error");
          return;
        }
        parsedRatings[field.name] = val;
      } else {
        const num = parseFloat(val);
        if (isNaN(num)) {
          setErrorMessage(`"${field.name}" must be a number`);
          setStatus("error");
          return;
        }
        if (field.min !== undefined && num < field.min) {
          setErrorMessage(`"${field.name}" must be at least ${field.min}`);
          setStatus("error");
          return;
        }
        if (field.max !== undefined && num > field.max) {
          setErrorMessage(`"${field.name}" must be at most ${field.max}`);
          setStatus("error");
          return;
        }
        parsedRatings[field.name] = num;
      }
    }

    setStatus("saving");
    setErrorMessage("");

    const formData = new FormData();
    formData.set("description", description);
    formData.set("ratings", JSON.stringify(parsedRatings));

    let result;
    if (isEditing) {
      formData.set("entryId", String(entry.id));
      result = await updateEntry(formData);
    } else {
      formData.set("metricId", String(metric.id));
      result = await createEntry(formData);
    }

    if (result?.error) {
      setErrorMessage(result.error);
      setStatus("error");
    } else {
      setStatus("success");
      setTimeout(onClose, 1200);
    }
  };

  const fieldLabel = (name: string) =>
    name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-navy-900/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-lg font-semibold text-text-primary">
            {isEditing ? "Edit Entry" : "Add Entry"}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-navy-50 hover:text-text-primary"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-text-muted">
            {metric.name}
          </div>

          {status === "success" ? (
            <div className="mt-12 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-teal-600"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="mt-4 text-lg font-semibold text-text-primary">
                Entry {isEditing ? "updated" : "submitted"}!
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-5">
              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What was the project or context?"
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
                />
              </div>

              {/* Rating fields */}
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    {fieldLabel(field.name)}
                    {field.min !== undefined && field.max !== undefined && (
                      <span className="ml-1 font-normal text-text-muted">
                        ({field.min}–{field.max})
                      </span>
                    )}
                  </label>

                  {field.type === "radio" && field.options ? (
                    <div className="flex gap-2">
                      {field.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setRatings((prev) => ({
                              ...prev,
                              [field.name]: opt,
                            }))
                          }
                          className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                            ratings[field.name] === opt
                              ? "border-navy-400 bg-navy-50 text-navy-800"
                              : "border-border text-text-secondary hover:border-navy-200 hover:bg-navy-50"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="number"
                      step={field.type === "decimal" ? "0.1" : "1"}
                      min={field.min}
                      max={field.max}
                      value={ratings[field.name]}
                      onChange={(e) =>
                        setRatings((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
                    />
                  )}
                </div>
              ))}

              {status === "error" && errorMessage && (
                <p className="text-sm text-coral-500">{errorMessage}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {status !== "success" && (
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-navy-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={status === "saving"}
              className="rounded-lg bg-navy-800 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700 disabled:opacity-50"
            >
              {status === "saving"
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Submit"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
