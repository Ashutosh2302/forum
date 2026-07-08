import { eq, and, isNull, count } from "drizzle-orm";
import { db as defaultDb, type DB } from "./db/index";
import { savedPosts } from "./db/schema";
import { computeSave, computeUnsave, type SaveState } from "./saves";
import { randomUUID } from "crypto";

// DB is accepted as a parameter for dependency injection in tests.
// Production callers omit it and get the default singleton.

export async function getSaveState(userId: string, postId: string, db: DB = defaultDb): Promise<SaveState> {
  const row = await db
    .select({ deletedAt: savedPosts.deletedAt })
    .from(savedPosts)
    .where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId)))
    .limit(1);

  if (row.length === 0) return "none";
  return row[0].deletedAt === null ? "active" : "deleted";
}

export async function getActiveSavesCount(postId: string, db: DB = defaultDb): Promise<number> {
  const result = await db
    .select({ value: count() })
    .from(savedPosts)
    .where(and(eq(savedPosts.postId, postId), isNull(savedPosts.deletedAt)));
  return result[0]?.value ?? 0;
}

export async function executeSave(
  userId: string,
  postId: string,
  db: DB = defaultDb
): Promise<{ hasSaved: boolean; savesCount: number }> {
  const state = await getSaveState(userId, postId, db);
  const action = computeSave(state);

  if (action === "insert") {
    await db.insert(savedPosts).values({
      id: randomUUID(),
      userId,
      postId,
      savedAt: new Date(),
      deletedAt: null,
    });
  } else if (action === "reactivate") {
    // Update savedAt so the post rises to the top of the saved list on re-save
    await db
      .update(savedPosts)
      .set({ deletedAt: null, savedAt: new Date() })
      .where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId)));
  }
  // noop: no DB write, count stays the same

  const currentCount = await getActiveSavesCount(postId, db);
  return { hasSaved: action !== "noop" ? true : state === "active", savesCount: currentCount };
}

export async function executeUnsave(
  userId: string,
  postId: string,
  db: DB = defaultDb
): Promise<{ hasSaved: boolean; savesCount: number }> {
  const state = await getSaveState(userId, postId, db);
  const action = computeUnsave(state);

  if (action === "deactivate") {
    await db
      .update(savedPosts)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(savedPosts.userId, userId),
          eq(savedPosts.postId, postId),
          isNull(savedPosts.deletedAt)
        )
      );
  }

  const currentCount = await getActiveSavesCount(postId, db);
  return { hasSaved: false, savesCount: currentCount };
}
