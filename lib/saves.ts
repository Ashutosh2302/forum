// Pure business logic for save / un-save.
// No database imports — all functions here are testable without a DB.

export type SaveState = "none" | "active" | "deleted";

// Saving an already-active record is a no-op (idempotent).
// Saving a soft-deleted record reactivates it (preserves history, no duplicate row).
export function computeSave(state: SaveState): "insert" | "reactivate" | "noop" {
  if (state === "active") return "noop";
  if (state === "deleted") return "reactivate";
  return "insert";
}

// Un-saving a record that isn't active is a no-op.
export function computeUnsave(state: SaveState): "deactivate" | "noop" {
  if (state === "active") return "deactivate";
  return "noop";
}

// Given an action and whether the save is now active, compute the new savesCount delta.
// Used by the API to return an accurate count after a mutation without a second query.
export function countDelta(action: ReturnType<typeof computeSave> | ReturnType<typeof computeUnsave>): number {
  if (action === "insert" || action === "reactivate") return 1;
  if (action === "deactivate") return -1;
  return 0; // noop
}
