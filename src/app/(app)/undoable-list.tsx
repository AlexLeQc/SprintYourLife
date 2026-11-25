"use client";

import { startTransition, useEffect, useOptimistic, useRef, useState } from "react";
import { SAVE_ERROR } from "./ui";

/**
 * The optimistic list with one-step undo, shared by tasks (spec 002 US-3 to US-6) and sidequests
 * (spec 004 US-1, US-4, US-5): plan 004 D-3, "reuse first". Behaviour is spec 002's:
 * - changes show at once (useOptimistic), then the server render (refresh) takes over;
 * - only the last removal can be undone, for about 5 seconds, then it is final;
 * - Undo waits for the action it undoes, so the two requests can't cross (plan 002 §5.2);
 * - a failed save rolls back on its own and shows a short message.
 */

type FormResult = { ok: true } | { ok: false; error: string };

interface Item {
  id: string;
  pending?: boolean;
}

type Change<T> = { type: "add"; item: T } | { type: "remove"; id: string } | { type: "update"; item: T };

function applyChange<T extends Item>(state: T[], change: Change<T>): T[] {
  switch (change.type) {
    case "add":
      return [...state.filter((i) => i.id !== change.item.id), change.item];
    case "remove":
      return state.filter((i) => i.id !== change.id);
    case "update":
      return state.map((i) => (i.id === change.item.id ? change.item : i));
  }
}

/** The last removal that can be undone. `message` is what the bar says, e.g. "Task done". */
interface Undoable<T> {
  item: T;
  message: string;
  restore: (id: string) => Promise<void>;
}

export const UNDO_MS = 5000;

export function useUndoableList<T extends Item>(items: T[]) {
  const [shown, apply] = useOptimistic(items, applyChange<T>);
  const [undoable, setUndoable] = useState<Undoable<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastAction = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    if (!undoable) return;
    const timer = setTimeout(() => setUndoable(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [undoable]);

  /** Shows an item added by a form, before the server confirms it. */
  function add(item: T) {
    apply({ type: "add", item });
  }

  /** Removes an item at once (done, delete), offering Undo, which calls `restore`. */
  function removeWithUndo(item: T, message: string, action: (id: string) => Promise<void>, restore: (id: string) => Promise<void>) {
    setError(null);
    setUndoable({ item, message, restore });
    startTransition(async () => {
      apply({ type: "remove", id: item.id });
      const done = action(item.id);
      lastAction.current = done.catch(() => {});
      try {
        await done;
      } catch {
        setError(SAVE_ERROR); // the optimistic removal rolls back on its own
        setUndoable(null);
      }
    });
  }

  function undo() {
    if (!undoable) return;
    const { item, restore } = undoable;
    setUndoable(null);
    startTransition(async () => {
      apply({ type: "add", item: { ...item, pending: true } });
      await lastAction.current;
      try {
        await restore(item.id);
      } catch {
        setError(SAVE_ERROR);
      }
    });
  }

  /** Shows an edit at once, then saves it; a refusal from the server shows its message. */
  function update(item: T, save: () => Promise<FormResult>) {
    setError(null);
    startTransition(async () => {
      apply({ type: "update", item: { ...item, pending: true } });
      try {
        const result = await save();
        if (!result.ok) setError(result.error);
      } catch {
        setError(SAVE_ERROR);
      }
    });
  }

  return { shown, add, removeWithUndo, undo, update, undoable, error };
}

/** "Task done · Undo", "Sidequest deleted · Undo": just above the floating tab bar (plan 004 §5.2). */
export function UndoBar({ message, onUndo }: { message: string; onUndo: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom))] z-20 flex justify-center px-4 pb-3">
      <div
        role="status"
        className="pointer-events-auto flex items-center gap-4 rounded-full bg-zinc-900 py-2 pl-5 pr-2 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
      >
        <span>{message}</span>
        <button type="button" onClick={onUndo} className="rounded-full px-4 py-2 font-semibold underline">
          Undo
        </button>
      </div>
    </div>
  );
}
