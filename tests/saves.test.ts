import { describe, it, expect } from "vitest";
import { computeSave, computeUnsave, countDelta, type SaveState } from "@/lib/saves";

describe("computeSave", () => {
  it("inserts when no record exists", () => {
    expect(computeSave("none")).toBe("insert");
  });

  it("reactivates when record is soft-deleted (preserves history, no duplicate row)", () => {
    expect(computeSave("deleted")).toBe("reactivate");
  });

  it("is a no-op when already saved — saving twice is not an error", () => {
    expect(computeSave("active")).toBe("noop");
  });
});

describe("computeUnsave", () => {
  it("deactivates an active save", () => {
    expect(computeUnsave("active")).toBe("deactivate");
  });

  it("is a no-op when not saved — un-saving twice is not an error", () => {
    expect(computeUnsave("none")).toBe("noop");
    expect(computeUnsave("deleted")).toBe("noop");
  });
});

describe("countDelta", () => {
  it("increments count on insert", () => {
    expect(countDelta("insert")).toBe(1);
  });

  it("increments count on reactivate", () => {
    expect(countDelta("reactivate")).toBe(1);
  });

  it("decrements count on deactivate", () => {
    expect(countDelta("deactivate")).toBe(-1);
  });

  it("does not change count on noop — double-save does not double-count", () => {
    expect(countDelta("noop")).toBe(0);
  });
});

describe("save / un-save sequence", () => {
  it("save → unsave → save reactivates rather than inserting", () => {
    // State transitions the DB record goes through
    const states: SaveState[] = ["none", "active", "deleted", "active"];
    const actions = ["insert", "deactivate", "reactivate"];

    expect(computeSave("none")).toBe(actions[0]);
    expect(computeUnsave("active")).toBe(actions[1]);
    expect(computeSave("deleted")).toBe(actions[2]); // reactivate, not insert
  });
});
