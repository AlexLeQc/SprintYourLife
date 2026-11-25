import Link from "next/link";

export type Tab = "tasks" | "sidequests";

const TABS: { id: Tab; href: string; label: string }[] = [
  { id: "tasks", href: "/", label: "Tasks" },
  { id: "sidequests", href: "/sidequests", label: "Sidequests" },
];

/**
 * Spec 004 US-3: "Tasks | Sidequests", fixed at the bottom on every screen size (plan D-2).
 * A server component told which tab is current by its page (plan §5.2): no URL reading needed.
 * The current tab is marked by aria-current, bold text and a bar, never by colour alone (AC-3.1).
 */
export function TabBar({ current }: { current: Tab }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-background pb-[env(safe-area-inset-bottom)] dark:border-zinc-800"
    >
      <ul className="mx-auto grid max-w-md grid-cols-2">
        {TABS.map((tab) => {
          const isCurrent = tab.id === current;
          return (
            <li key={tab.id}>
              <Link
                href={tab.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`relative flex h-[var(--tab-bar-height)] items-center justify-center text-base ${
                  isCurrent ? "font-semibold" : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {isCurrent && <span aria-hidden="true" className="absolute inset-x-8 top-0 h-1 rounded-b bg-current" />}
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
