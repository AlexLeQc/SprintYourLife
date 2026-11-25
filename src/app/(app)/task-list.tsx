"use client";

import { startTransition, useEffect, useOptimistic, useRef, useState } from "react";
import { compareOpenTasks, type Due } from "@/domain/task";
import type { LocalNow } from "@/domain/local-date";
import { AddTaskForm } from "./add-task-form";
import { completeTask, deleteTask, reopenTask, restoreTask, updateTask } from "./task-actions";
import { TaskRow } from "./task-row";
import { SAVE_ERROR } from "./ui";

/** A task as sent from the server to the browser. */
export interface TaskView {
  id: string;
  title: string;
  due: Due;
  createdAt: string; // ISO instant
  pending?: boolean; // shown before the server has confirmed it (plan §5.2)
}

type Change = { type: "add"; task: TaskView } | { type: "remove"; id: string } | { type: "update"; task: TaskView };

function applyChange(state: TaskView[], change: Change): TaskView[] {
  switch (change.type) {
    case "add":
      return [...state.filter((t) => t.id !== change.task.id), change.task];
    case "remove":
      return state.filter((t) => t.id !== change.id);
    case "update":
      return state.map((t) => (t.id === change.task.id ? change.task : t));
  }
}

/** The last action that can be undone (AC-6.x). A new action replaces it. */
type Undoable = { kind: "done" | "deleted"; task: TaskView };

const UNDO_MS = 5000;

/**
 * The open-task list (AC-2.1) with optimistic changes (plan §5.2): adds, done, edits and
 * deletes show at once, then the server render (refresh) takes over. "now" comes from the
 * server, so labels and colours match what the server computed.
 */
export function TaskList({ tasks, now }: { tasks: TaskView[]; now: LocalNow }) {
  const [shown, apply] = useOptimistic(tasks, applyChange);
  const [undoable, setUndoable] = useState<Undoable | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Undo waits for the action it undoes, so the two requests can't cross (plan §5.2).
  const lastAction = useRef<Promise<unknown>>(Promise.resolve());

  // AC-6.1 / AC-6.2: the undo bar shows for about 5 seconds; then the action is final (AC-6.3).
  useEffect(() => {
    if (!undoable) return;
    const timer = setTimeout(() => setUndoable(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [undoable]);

  function removeWithUndo(kind: Undoable["kind"], task: TaskView, action: (id: string) => Promise<void>) {
    setError(null);
    setUndoable({ kind, task });
    startTransition(async () => {
      apply({ type: "remove", id: task.id });
      const done = action(task.id);
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
    const { kind, task } = undoable;
    setUndoable(null);
    startTransition(async () => {
      apply({ type: "add", task: { ...task, pending: true } });
      await lastAction.current;
      try {
        await (kind === "done" ? reopenTask(task.id) : restoreTask(task.id));
      } catch {
        setError(SAVE_ERROR);
      }
    });
  }

  function save(task: TaskView, title: string, due: Due) {
    setError(null);
    startTransition(async () => {
      apply({ type: "update", task: { ...task, title, due, pending: true } });
      try {
        const result = await updateTask({ id: task.id, title, dueDate: due.date, dueTime: due.time });
        if (!result.ok) setError(result.error);
      } catch {
        setError(SAVE_ERROR);
      }
    });
  }

  const sorted = [...shown].sort((a, b) =>
    compareOpenTasks(
      { due: a.due, createdAt: new Date(a.createdAt) },
      { due: b.due, createdAt: new Date(b.createdAt) },
    ),
  );

  return (
    <section aria-label="Tasks" className="flex w-full flex-col gap-4">
      <AddTaskForm today={now.date} onAdd={(task) => apply({ type: "add", task })} />

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {sorted.length === 0 ? (
        // AC-2.7: calm, no celebration, no nudge.
        <p className="py-8 text-center text-zinc-500 dark:text-zinc-400">Nothing to do.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              now={now}
              onComplete={() => removeWithUndo("done", task, completeTask)}
              onDelete={() => removeWithUndo("deleted", task, deleteTask)}
              onSave={(title, due) => save(task, title, due)}
            />
          ))}
        </ul>
      )}

      {undoable && (
        // Sits just above the tab bar (spec 004 plan §5.2), so Undo stays reachable.
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom))] z-20 flex justify-center px-4 pb-3">
          <div
            role="status"
            className="pointer-events-auto flex items-center gap-4 rounded-full bg-zinc-900 py-2 pl-5 pr-2 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
          >
            <span>{undoable.kind === "done" ? "Task done" : "Task deleted"}</span>
            <button type="button" onClick={undo} className="rounded-full px-4 py-2 font-semibold underline">
              Undo
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
