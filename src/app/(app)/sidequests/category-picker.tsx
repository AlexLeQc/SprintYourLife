import { CATEGORIES, type Category } from "@/domain/sidequest";

/**
 * Spec 004 AC-1.2, plan §5.4, D-1: five chips, all visible, one tap. Native radio buttons give
 * keyboard and screen-reader behaviour for free. Nothing is checked unless `initial` is given
 * (edit view): the owner chooses a category for every new sidequest (OQ-2).
 * The emoji is decorative: a screen reader reads "Create", not the emoji's name (BR-6).
 */
export function CategoryPicker({ idPrefix, initial }: { idPrefix: string; initial?: Category }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="sr-only">Category</legend>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <label
            key={category.id}
            htmlFor={`${idPrefix}-${category.id}`}
            // 44 px tall for the thumb (AC-2.5). Checked = filled AND bold, not colour alone.
            className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-zinc-300 px-3 text-base has-checked:border-zinc-900 has-checked:bg-zinc-900 has-checked:font-semibold has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-zinc-900 dark:border-zinc-700 dark:has-checked:border-zinc-100 dark:has-checked:bg-zinc-100 dark:has-checked:text-zinc-900 dark:has-focus-visible:outline-zinc-100"
          >
            <input
              type="radio"
              id={`${idPrefix}-${category.id}`}
              name="category"
              value={category.id}
              defaultChecked={category.id === initial}
              className="sr-only"
            />
            <span aria-hidden="true">{category.emoji}</span>
            {category.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
