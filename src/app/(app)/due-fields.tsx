"use client";

import { useState } from "react";
import type { Due } from "@/domain/task";

export const secondaryButton =
  "rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300";
export const field =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-950";

/**
 * Optional due date, then optional time (BR-2: no time without a date), with native iOS
 * pickers (plan §5.4). Hidden fields are not rendered, so the form simply doesn't send them.
 * "Remove date" clears both (AC-4.2). To reset, remount with a new `key`.
 */
export function DueFields({ idPrefix, today, initial }: { idPrefix: string; today: string; initial: Due }) {
  const [withDate, setWithDate] = useState(initial.date !== null);
  const [withTime, setWithTime] = useState(initial.time !== null);

  if (!withDate) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={secondaryButton} onClick={() => setWithDate(true)}>
          Add date
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor={`${idPrefix}-date`}>
        Due date
      </label>
      <input
        id={`${idPrefix}-date`}
        name="dueDate"
        type="date"
        defaultValue={initial.date ?? today}
        required
        className={field}
      />
      {!withTime ? (
        <button type="button" className={secondaryButton} onClick={() => setWithTime(true)}>
          Add time
        </button>
      ) : (
        <>
          <label className="sr-only" htmlFor={`${idPrefix}-time`}>
            Due time
          </label>
          <input id={`${idPrefix}-time`} name="dueTime" type="time" defaultValue={initial.time ?? ""} className={field} />
        </>
      )}
      <button
        type="button"
        className={secondaryButton}
        onClick={() => {
          setWithDate(false);
          setWithTime(false);
        }}
      >
        Remove date
      </button>
    </div>
  );
}
