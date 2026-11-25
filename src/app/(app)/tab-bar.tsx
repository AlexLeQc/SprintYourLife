import Link from "next/link";

export type Tab = "tasks" | "sidequests";

/** A checklist: a ticked circle and two lines. Decorative: the label names the tab. */
function TasksIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="7" r="3" />
      <path d="m4.8 7 1 1 1.6-1.8" />
      <path d="M12 7h9M4 15h17M4 20h11" />
    </svg>
  );
}

/** A compass. Decorative: the label names the tab. */
function SidequestsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </svg>
  );
}

const TABS = [
  { id: "tasks", href: "/", label: "Tasks", Icon: TasksIcon },
  { id: "sidequests", href: "/sidequests", label: "Sidequests", Icon: SidequestsIcon },
] as const;

/**
 * Spec 004 US-3: "Tasks | Sidequests" on every screen size (plan D-2). After T08 (PO, 2026-11-25):
 * a floating rounded bar lifted above the bottom edge, 64 px targets with an icon and a label.
 * A server component told which tab is current by its page (plan §5.2): no URL reading needed.
 * The current tab is marked by aria-current, a filled highlight and bold text, not colour alone.
 * Its height is --tab-bar-height in globals.css: pages and the undo bar keep clear of it.
 */
export function TabBar({ current }: { current: Tab }) {
  return (
    <nav aria-label="Main" className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-10">
      <ul className="mx-auto grid max-w-sm grid-cols-2 gap-1 rounded-full border border-zinc-200 bg-zinc-100 p-1.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
        {TABS.map(({ id, href, label, Icon }) => {
          const isCurrent = id === current;
          return (
            <li key={id}>
              <Link
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-0.5 rounded-full text-sm ${
                  isCurrent
                    ? "bg-white font-semibold text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-white"
                    : "text-zinc-600 dark:text-zinc-300"
                }`}
              >
                <Icon />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
