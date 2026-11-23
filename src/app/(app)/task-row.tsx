"use client";

import { useState } from "react";
import { dueLabel, normalizeTitle, parseDue, urgency, type Due, type Urgency } from "@/domain/task";
import type { LocalNow } from "@/domain/local-date";
import { DueFields, field, secondaryButton } from "./due-fields";
import type { TaskView } from "./task-list";

/**
 * AC-2.3 to AC-2.6: red = overdue, amber = due today or tomorrow, no colour otherwise.
 * The due label is always written out, so colour is never the only signal (WCAG 1.4.1).
 * Shades keep ≥ 4.5:1 contrast in light and dark mode (plan §5.5).
 */
const STYLES: Record<Urgency, { border: string; label: string }> = {
  overdue: { border: "border-red-600 dark:border-red-400", label: "text-red-700 dark:text-red-400" },
  soon: { border: "border-amber-500 dark:border-amber-400", label: "text-amber-700 dark:text-amber-400" },
  none: { border: "border-transparent", label: "text-zinc-500 dark:text-zinc-400" },
};

interface Props {
  task: TaskView;
  now: LocalNow;
  onComplete: () => void;
  onDelete: () => void;
  onSave: (title: string, due: Due) => void;
}

export function TaskRow({ task, now, onComplete, onDelete, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = dueLabel(task.due, now);
  const level = urgency(task.due, now);
  const style = STYLES[level];
  // A task not yet confirmed by the server has no real id: nothing to act on yet.
  const locked = task.pending === true;

  function submitEdit(formData: FormData) {
    const title = normalizeTitle(String(formData.get("title") ?? ""));
    if (!title.ok) {
      // AC-4.3: same title rules as creation (BR-1); keep editing.
      setError(title.error === "too_long" ? "Title is too long (200 characters max)." : "Title is empty.");
      return;
    }
    const due = parseDue(String(formData.get("dueDate") ?? ""), String(formData.get("dueTime") ?? ""));
    if (!due.ok) {
      setError("That date or time isn't valid.");
      return;
    }
    setError(null);
    setEditing(false);
    onSave(title.value, due.value);
  }

  return (
    <li
      className={`flex items-start gap-1 border-l-4 ${style.border} rounded-r-lg bg-zinc-50 py-1 pr-3 dark:bg-zinc-900 ${locked ? "opacity-60" : ""}`}
      aria-busy={locked || undefined}
    >
      {/* AC-3.1, AC-2.8: one tap, a 44 px target for the thumb. */}
      <button
        type="button"
        role="checkbox"
        aria-checked="false"
        aria-label={`Mark "${task.title}" done`}
        disabled={locked || editing}
        onClick={onComplete}
        className="flex size-11 shrink-0 items-center justify-center disabled:opacity-40"
      >
        <span className="size-5 rounded-full border-2 border-zinc-400 dark:border-zinc-500" />
      </button>

      {!editing ? (
        // AC-4.1: tap the title to edit.
        <button
          type="button"
          disabled={locked}
          onClick={() => setEditing(true)}
          className="min-w-0 flex-1 py-2 text-left"
        >
          {/* WCAG 2.5.3 (spec 003 A1): the name is what the button shows, so voice control can use it. */}
          <span className="sr-only">Edit </span>
          <span className="block break-words text-base">{task.title}</span>
          {/* data-urgency: the colour's meaning, readable by end-to-end tests (plan 003 §5.4). */}
          {label && (
            <span data-urgency={level} className={`mt-0.5 block text-sm font-medium ${style.label}`}>
              {label}
            </span>
          )}
        </button>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitEdit(new FormData(event.currentTarget));
          }}
          className="flex min-w-0 flex-1 flex-col gap-2 py-2"
        >
          <label htmlFor={`edit-${task.id}-title`} className="sr-only">
            Title
          </label>
          <input
            id={`edit-${task.id}-title`}
            name="title"
            defaultValue={task.title}
            autoComplete="off"
            autoFocus
            className={`${field} w-full`}
          />
          <DueFields idPrefix={`edit-${task.id}`} today={now.date} initial={task.due} />
          {error && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Save
            </button>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => {
                setError(null);
                setEditing(false);
              }}
            >
              Cancel
            </button>
            {/* AC-5.1: no "Are you sure?" — the undo bar is the safety net (AC-6.2). */}
            <button
              type="button"
              onClick={onDelete}
              className="ml-auto rounded-full px-3 py-1.5 text-sm text-red-700 dark:text-red-400"
            >
              Delete
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
