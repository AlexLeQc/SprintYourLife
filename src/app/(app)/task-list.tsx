"use client";

import { useOptimistic } from "react";
import { compareOpenTasks, type Due } from "@/domain/task";
import type { LocalNow } from "@/domain/local-date";
import { AddTaskForm } from "./add-task-form";
import { TaskRow } from "./task-row";

/** A task as sent from the server to the browser. */
export interface TaskView {
  id: string;
  title: string;
  due: Due;
  createdAt: string; // ISO instant
  pending?: boolean; // shown before the server has confirmed it (plan §5.2)
}

/**
 * The open-task list (AC-2.1) with optimistic adds: a new task shows at once, in its sorted
 * place, then the server render replaces it. "now" comes from the server so labels and
 * colours match what the server computed (no hydration mismatch).
 */
export function TaskList({ tasks, now }: { tasks: TaskView[]; now: LocalNow }) {
  const [shown, addPending] = useOptimistic(tasks, (state, added: TaskView) => [...state, added]);

  const sorted = [...shown].sort((a, b) =>
    compareOpenTasks(
      { due: a.due, createdAt: new Date(a.createdAt) },
      { due: b.due, createdAt: new Date(b.createdAt) },
    ),
  );

  return (
    <section aria-label="Tasks" className="flex w-full flex-col gap-4">
      <AddTaskForm today={now.date} onAdd={addPending} />
      {sorted.length === 0 ? (
        // AC-2.7: calm, no celebration, no nudge.
        <p className="py-8 text-center text-zinc-500 dark:text-zinc-400">Nothing to do.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((task) => (
            <TaskRow key={task.id} task={task} now={now} />
          ))}
        </ul>
      )}
    </section>
  );
}
