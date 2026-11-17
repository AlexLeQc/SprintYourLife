import { dueLabel, urgency, type Urgency } from "@/domain/task";
import type { LocalNow } from "@/domain/local-date";
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

export function TaskRow({ task, now }: { task: TaskView; now: LocalNow }) {
  const label = dueLabel(task.due, now);
  const style = STYLES[urgency(task.due, now)];

  return (
    <li
      className={`border-l-4 ${style.border} rounded-r-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-900 ${task.pending ? "opacity-60" : ""}`}
      aria-busy={task.pending || undefined}
    >
      <p className="break-words text-base">{task.title}</p>
      {label && <p className={`mt-0.5 text-sm font-medium ${style.label}`}>{label}</p>}
    </li>
  );
}
