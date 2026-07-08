import { describe, it, expect, beforeAll } from "vitest";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "@/lib/db/schema";
import { users, courses, enrollments, posts } from "@/lib/db/schema";
import { executeSave, executeUnsave, getSaveState } from "@/lib/saves-db";
import { isEnrolled, getPostById } from "@/lib/posts-db";
import { requireAuth } from "@/lib/auth";

// In-memory SQLite: tests run from a clean checkout with zero infra setup.
// DB is injected into each function — no module patching required.
const client = createClient({ url: ":memory:" });
const testDb = drizzle(client, { schema });

beforeAll(async () => {
  await migrate(testDb, { migrationsFolder: "./drizzle" });

  await testDb.insert(courses).values([
    { id: "c1", name: "Course 1" },
    { id: "c2", name: "Course 2" },
  ]);
  await testDb.insert(users).values([
    { id: "u1", name: "Alice", role: "student" },
    { id: "u2", name: "Bob", role: "student" },   // not enrolled in c1
    { id: "mod1", name: "Mod", role: "moderator" },
  ]);
  // Alice is in c1; Bob is in c2 only; moderator has no enrollments
  await testDb.insert(enrollments).values([
    { userId: "u1", courseId: "c1" },
    { userId: "u2", courseId: "c2" },
  ]);
  await testDb.insert(posts).values([
    { id: "p1", courseId: "c1", authorId: "u1", title: "Post 1", body: "Body 1", createdAt: new Date() },
  ]);
});

// --- Authorization boundary ---

describe("authorization: enrollment check (403 boundary)", () => {
  it("enrolled student can access post in their course", async () => {
    expect(await isEnrolled("u1", "c1", testDb)).toBe(true);
  });

  it("student NOT enrolled in a course is denied", async () => {
    expect(await isEnrolled("u2", "c1", testDb)).toBe(false);
  });

  it("returns 401 when auth headers are missing", () => {
    const req = new Request("http://localhost/api/test");
    const result = requireAuth(req);
    expect(result.ctx).toBeNull();
    expect(result.error?.status).toBe(401);
  });

  it("returns auth context when valid headers are present", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { "x-user-id": "u1", "x-user-role": "student" },
    });
    const result = requireAuth(req);
    expect(result.error).toBeNull();
    expect(result.ctx?.userId).toBe("u1");
    expect(result.ctx?.role).toBe("student");
  });

  it("returns 401 for an invalid role value", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { "x-user-id": "u1", "x-user-role": "admin" }, // not a valid role
    });
    const result = requireAuth(req);
    expect(result.ctx).toBeNull();
    expect(result.error?.status).toBe(401);
  });
});

describe("authorization: post existence (404 boundary)", () => {
  it("returns null for a non-existent post", async () => {
    expect(await getPostById("does-not-exist", testDb)).toBeNull();
  });

  it("returns the post for a valid id", async () => {
    const post = await getPostById("p1", testDb);
    expect(post?.id).toBe("p1");
  });
});

// --- Happy path: full save/unsave/re-save lifecycle ---

describe("save happy path", () => {
  it("saves a post — hasSaved:true, savesCount:1", async () => {
    const result = await executeSave("u1", "p1", testDb);
    expect(result.hasSaved).toBe(true);
    expect(result.savesCount).toBe(1);
  });

  it("saving the same post again is a no-op — count does not increment", async () => {
    const result = await executeSave("u1", "p1", testDb);
    expect(result.hasSaved).toBe(true);
    expect(result.savesCount).toBe(1); // not 2
  });

  it("un-saves the post — hasSaved:false, savesCount:0", async () => {
    const result = await executeUnsave("u1", "p1", testDb);
    expect(result.hasSaved).toBe(false);
    expect(result.savesCount).toBe(0);
  });

  it("record is soft-deleted — row still exists in DB (history preserved)", async () => {
    const state = await getSaveState("u1", "p1", testDb);
    expect(state).toBe("deleted");
  });

  it("re-saving reactivates the existing record (no duplicate row)", async () => {
    const result = await executeSave("u1", "p1", testDb);
    expect(result.hasSaved).toBe(true);
    expect(await getSaveState("u1", "p1", testDb)).toBe("active");
  });

  it("un-saving again is a no-op when already unsaved", async () => {
    await executeUnsave("u1", "p1", testDb);
    const result = await executeUnsave("u1", "p1", testDb); // second unsave
    expect(result.hasSaved).toBe(false);
    expect(result.savesCount).toBe(0);
  });
});
