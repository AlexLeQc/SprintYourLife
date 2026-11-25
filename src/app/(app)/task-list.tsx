"use client";

import { compareOpenTasks, type Due } from "@/domain/task";
import type { LocalNow } from "@/domain/local-date";
import { AddTaskForm } from "./add-task-form";
import { completeTask, deleteTask, reopenTask, restoreTask, updateTask } from "./task-actions";
import { TaskRow } from "./task-row";
import { errorText } from "./ui";
import { UndoBar, useUndoableList } from "./undoable-list";

/** A task as sent from the server to the browser. */
export interface TaskView {
  id: string;
  title: string;
  due: Due;
  createdAt: string; // ISO instant
  pending?: boolean; // shown before the server has confirmed it (plan §5.2)
}

/**
 * The open-task list (AC-2.1) with optimistic changes and one-step undo (plan §5.2, AC-6.x),
 * from the list behaviour shared with sidequests (undoable-list.tsx, plan 004 D-3).
 * "now" comes from the server, so labels and colours match what the server computed.
 */
export function TaskList({ tasks, now }: { tasks: TaskView[]; now: LocalNow }) {
  const { shown, add, removeWithUndo, undo, update, undoable, error } = useUndoableList(tasks);

  const sorted = [...shown].sort((a, b) =>
    compareOpenTasks(
      { due: a.due, createdAt: new Date(a.createdAt) },
      { due: b.due, createdAt: new Date(b.createdAt) },
    ),
  );

  return (
    <section aria-label="Tasks" className="flex w-full flex-col gap-4">
      <AddTaskForm today={now.date} onAdd={add} />

      {error && (
        <p role="alert" className={errorText}>
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
              onComplete={() => removeWithUndo(task, "Task done", completeTask, reopenTask)}
              onDelete={() => removeWithUndo(task, "Task deleted", deleteTask, restoreTask)}
              onSave={(title, due) =>
                update({ ...task, title, due }, () =>
                  updateTask({ id: task.id, title, dueDate: due.date, dueTime: due.time }),
                )
              }
            />
          ))}
        </ul>
      )}

      {/* AC-6.1 to AC-6.3: about 5 seconds, then final. */}
      {undoable && <UndoBar message={undoable.message} onUndo={undo} />}
    </section>
  );
}
