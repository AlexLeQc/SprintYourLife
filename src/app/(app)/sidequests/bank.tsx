"use client";

import { groupByCategory, type Category } from "@/domain/sidequest";
import { errorText } from "../ui";
import { UndoBar, useUndoableList } from "../undoable-list";
import { AddSidequestForm } from "./add-sidequest-form";
import { deleteSidequest, restoreSidequest, updateSidequest } from "./sidequest-actions";
import { SidequestRow } from "./sidequest-row";

/** A sidequest as sent from the server to the browser. */
export interface SidequestView {
  id: string;
  title: string;
  category: Category;
  createdAt: string; // ISO instant
  pending?: boolean; // shown before the server has confirmed it (plan 004 §5.5)
}

/**
 * Spec 004 US-2: the Bank, one heading per category (emoji + name, BR-6), filled categories first
 * and empty ones after (BR-3), each sorted alphabetically (BR-4). Adds, edits and deletes show at
 * once, with one-step undo: the list behaviour shared with tasks (undoable-list.tsx, plan D-3).
 */
export function Bank({ sidequests }: { sidequests: SidequestView[] }) {
  const { shown, add, removeWithUndo, undo, update, undoable, error } = useUndoableList(sidequests);
  const groups = groupByCategory(shown.map((s) => ({ ...s, createdAt: new Date(s.createdAt) })));
  const byId = new Map(shown.map((s) => [s.id, s]));

  return (
    <section aria-label="Sidequests" className="flex w-full flex-col gap-6">
      <AddSidequestForm onAdd={add} />

      {error && (
        <p role="alert" className={errorText}>
          {error}
        </p>
      )}

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
              {items.map(({ id }) => {
                const sidequest = byId.get(id)!;
                return (
                  <SidequestRow
                    key={id}
                    sidequest={sidequest}
                    onDelete={() => removeWithUndo(sidequest, "Sidequest deleted", deleteSidequest, restoreSidequest)}
                    onSave={(title, category) =>
                      update({ ...sidequest, title, category }, () => updateSidequest({ id, title, category }))
                    }
                  />
                );
              })}
            </ul>
          )}
        </section>
      ))}

      {/* AC-5.2, AC-5.3: about 5 seconds, then final. */}
      {undoable && <UndoBar message={undoable.message} onUndo={undo} />}
    </section>
  );
}
