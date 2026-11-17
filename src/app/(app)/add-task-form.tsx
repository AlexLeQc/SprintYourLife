"use client";

import { startTransition, useRef, useState } from "react";
import { normalizeTitle, parseDue } from "@/domain/task";
import { createTask } from "./task-actions";
import type { TaskView } from "./task-list";

/**
 * AC-1.1 to AC-1.5. Title first; the date is hidden behind "Add date" and the time behind
 * "Add time" (principle 3: minimal input; BR-2: no time without a date). Native pickers on
 * the iPhone (plan §5.4). Inputs use 16 px text so iOS doesn't zoom in on focus (AC-2.8).
 */
export function AddTaskForm({ today, onAdd }: { today: string; onAdd: (task: TaskView) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [withDate, setWithDate] = useState(false);
  const [withTime, setWithTime] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function removeDate() {
    setWithDate(false);
    setWithTime(false);
  }

  async function submit(formData: FormData) {
    const rawTitle = String(formData.get("title") ?? "");
    const dueDate = withDate ? String(formData.get("dueDate") ?? "") : "";
    const dueTime = withDate && withTime ? String(formData.get("dueTime") ?? "") : "";

    const title = normalizeTitle(rawTitle);
    if (!title.ok) {
      // AC-1.4: blank → nothing happens. AC-1.5: too long → short message, text kept.
      setError(title.error === "too_long" ? "Title is too long (200 characters max)." : null);
      return;
    }
    const due = parseDue(dueDate, dueTime);
    if (!due.ok) {
      setError("That date or time isn't valid.");
      return;
    }

    // AC-1.1: clear and get ready for the next one right away (applies on this frame).
    formRef.current?.reset();
    onAdd({
      id: `pending-${crypto.randomUUID()}`,
      title: title.value,
      due: due.value,
      createdAt: new Date().toISOString(),
      pending: true,
    });
    setError(null);
    setWithDate(false);
    setWithTime(false);

    const result = await createTask({ title: title.value, dueDate, dueTime });
    if (!result.ok) setError(result.error);
  }

  const secondaryButton =
    "rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300";
  const field =
    "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-950";

  return (
    <form
      ref={formRef}
      // Not `action={submit}`: React resets a form after its action runs, which would wipe
      // a refused (too long) title. We reset ourselves, only when the task is accepted.
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => submit(formData));
      }}
      className="flex flex-col gap-2"
    >
      <div className="flex gap-2">
        <label htmlFor="new-task-title" className="sr-only">
          New task
        </label>
        <input
          id="new-task-title"
          name="title"
          placeholder="New task"
          autoComplete="off"
          enterKeyHint="done"
          className={`${field} min-w-0 flex-1`}
          onChange={() => error && setError(null)}
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-base font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!withDate ? (
          <button type="button" className={secondaryButton} onClick={() => setWithDate(true)}>
            Add date
          </button>
        ) : (
          <>
            <label className="sr-only" htmlFor="new-task-date">
              Due date
            </label>
            <input id="new-task-date" name="dueDate" type="date" defaultValue={today} required className={field} />
            {!withTime ? (
              <button type="button" className={secondaryButton} onClick={() => setWithTime(true)}>
                Add time
              </button>
            ) : (
              <>
                <label className="sr-only" htmlFor="new-task-time">
                  Due time
                </label>
                <input id="new-task-time" name="dueTime" type="time" className={field} />
              </>
            )}
            <button type="button" className={secondaryButton} onClick={removeDate}>
              Remove date
            </button>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
