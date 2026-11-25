/** The outcome of a validation: a value, or a short error code the UI turns into a message. */
export type Result<T, E extends string> = { ok: true; value: T } | { ok: false; error: E };
