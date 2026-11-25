"use client";

import { startTransition, useRef, useState } from "react";
import { normalizeTitle, parseCategory } from "@/domain/sidequest";
import { SAVE_ERROR, errorText, field, primaryButton } from "../ui";
import type { SidequestView } from "./bank";
import { CategoryPicker } from "./category-picker";
import { createSidequest } from "./sidequest-actions";

/**
 * Spec 004 AC-1.1 to AC-1.5. Same shape as the task form (reuse first): title + Add on one line,
 * then the category chips. After an add, the form resets to no category (AC-1.2).
 */
export function AddSidequestForm({ onAdd }: { onAdd: (sidequest: SidequestView) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    const title = normalizeTitle(String(formData.get("title") ?? ""));
    if (!title.ok) {
      // AC-1.4: blank → nothing happens. AC-1.5: too long → short message, text kept.
      setError(title.error === "too_long" ? "Title is too long (200 characters max)." : null);
      return;
    }
    const category = parseCategory(formData.get("category"));
    if (!category.ok) {
      setError("Pick a category."); // AC-1.3: nothing saved, the title stays in its field
      return;
    }

    // AC-1.1, AC-1.2: cleared, no category checked, ready for the next one.
    formRef.current?.reset();
    onAdd({
      id: `pending-${crypto.randomUUID()}`,
      title: title.value,
      category: category.value,
      createdAt: new Date().toISOString(),
      pending: true,
    });
    setError(null);

    try {
      const result = await createSidequest({ title: title.value, category: category.value });
      if (!result.ok) setError(result.error);
    } catch {
      setError(SAVE_ERROR);
    }
  }

  return (
    <form
      ref={formRef}
      // Not `action={submit}`: React would reset the form even when the add is refused,
      // wiping the title (AC-1.3, AC-1.5). We reset ourselves, only on success.
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => submit(formData));
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex gap-2">
        <label htmlFor="new-sidequest-title" className="sr-only">
          New sidequest
        </label>
        <input
          id="new-sidequest-title"
          name="title"
          placeholder="New sidequest"
          autoComplete="off"
          enterKeyHint="done"
          className={`${field} min-w-0 flex-1`}
          onChange={() => error && setError(null)}
        />
        <button type="submit" className={primaryButton}>
          Add
        </button>
      </div>

      <CategoryPicker idPrefix="new-sidequest" />

      {error && (
        <p role="alert" className={errorText}>
          {error}
        </p>
      )}
    </form>
  );
}
