"use client";

import { useState } from "react";
import { normalizeTitle, parseCategory, type Category } from "@/domain/sidequest";
import { errorText, field, primaryButton, secondaryButton, titleErrorMessage } from "../ui";
import type { SidequestView } from "./bank";
import { CategoryPicker } from "./category-picker";

interface Props {
  sidequest: SidequestView;
  onDelete: () => void;
  onSave: (title: string, category: Category) => void;
}

/**
 * Spec 004 US-4, US-5: tap the title to edit it inline (title, category, Save, Cancel, Delete),
 * the same pattern as a task row (reuse first).
 */
export function SidequestRow({ sidequest, onDelete, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Not yet confirmed by the server: no real id, nothing to act on yet.
  const locked = sidequest.pending === true;

  function submitEdit(formData: FormData) {
    const title = normalizeTitle(String(formData.get("title") ?? ""));
    if (!title.ok) {
      setError(titleErrorMessage(title.error)); // AC-4.2: same title rules as creation
      return;
    }
    const category = parseCategory(formData.get("category"));
    if (!category.ok) {
      setError("Pick a category.");
      return;
    }
    setError(null);
    setEditing(false);
    onSave(title.value, category.value);
  }

  return (
    <li
      aria-busy={locked || undefined}
      className={`rounded-lg bg-zinc-50 dark:bg-zinc-900 ${locked ? "opacity-60" : ""}`}
    >
      {!editing ? (
        <button
          type="button"
          disabled={locked}
          onClick={() => setEditing(true)}
          className="block w-full break-words px-3 py-3 text-left text-base"
        >
          {/* WCAG 2.5.3 (spec 003 A1): the name is what the button shows, plus a hidden "Edit". */}
          <span className="sr-only">Edit </span>
          {sidequest.title}
        </button>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitEdit(new FormData(event.currentTarget));
          }}
          className="flex flex-col gap-3 p-3"
        >
          <label htmlFor={`edit-${sidequest.id}-title`} className="sr-only">
            Title
          </label>
          <input
            id={`edit-${sidequest.id}-title`}
            name="title"
            defaultValue={sidequest.title}
            autoComplete="off"
            autoFocus
            className={`${field} w-full`}
          />
          <CategoryPicker idPrefix={`edit-${sidequest.id}`} initial={sidequest.category} />
          {error && (
            <p role="alert" className={errorText}>
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" className={primaryButton}>
              Save
            </button>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => {
                setError(null);
                setEditing(false);
              }}
            >
              Cancel
            </button>
            {/* AC-5.1: no "Are you sure?" — the undo bar is the safety net (AC-5.2). */}
            <button type="button" onClick={onDelete} className="ml-auto rounded-full px-3 py-1.5 text-sm text-red-700 dark:text-red-400">
              Delete
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
