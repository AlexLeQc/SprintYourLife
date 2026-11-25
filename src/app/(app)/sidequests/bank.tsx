"use client";

import { useOptimistic } from "react";
import { groupByCategory, type Category } from "@/domain/sidequest";
import { AddSidequestForm } from "./add-sidequest-form";

/** A sidequest as sent from the server to the browser. */
export interface SidequestView {
  id: string;
  title: string;
  category: Category;
  createdAt: string; // ISO instant
  pending?: boolean; // shown before the server has confirmed it (plan 004 §5.5)
}

function addSidequest(state: SidequestView[], added: SidequestView): SidequestView[] {
  return [...state.filter((s) => s.id !== added.id), added];
}

/**
 * Spec 004 US-2: the Bank, one heading per category (emoji + name, BR-6), filled categories first
 * and empty ones after (BR-3), each sorted alphabetically (BR-4). Adds show at once (useOptimistic,
 * same pattern as the task list); the server render then takes over.
 */
export function Bank({ sidequests }: { sidequests: SidequestView[] }) {
  const [shown, add] = useOptimistic(sidequests, addSidequest);
  const groups = groupByCategory(shown.map((s) => ({ ...s, createdAt: new Date(s.createdAt) })));

  return (
    <section aria-label="Sidequests" className="flex w-full flex-col gap-6">
      <AddSidequestForm onAdd={add} />

      {groups.map(({ category, sidequests: items }) => (
        <section key={category.id} aria-labelledby={`category-${category.id}`} className="flex flex-col gap-2">
          <h2 id={`category-${category.id}`} className="flex items-center gap-2 text-base font-semibold">
            <span aria-hidden="true">{category.emoji}</span>
            {category.name}
          </h2>
          {items.length === 0 ? (
            // AC-2.2, AC-2.3: calm; an empty category is an opportunity, not a form to fill.
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No sidequest yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((sidequest) => (
                <li
                  key={sidequest.id}
                  aria-busy={sidequest.pending || undefined}
                  className={`break-words rounded-lg bg-zinc-50 px-3 py-3 text-base dark:bg-zinc-900 ${
                    sidequest.pending ? "opacity-60" : ""
                  }`}
                >
                  {sidequest.title}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </section>
  );
}
