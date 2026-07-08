import { eq, and, isNull, desc, sql, count } from "drizzle-orm";
import { db as defaultDb, type DB } from "./db/index";
import { posts, savedPosts, enrollments } from "./db/schema";

export type HydratedPost = {
  id: string;
  courseId: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: Date;
  hasSaved: boolean;
  savesCount: number;
};

// Single JOIN query: no N+1 regardless of page size.
// hasSaved and savesCount are computed per-post for the requesting user in one pass.
export async function getFeedPage(
  courseId: string,
  userId: string,
  page: number,
  limit = 10,
  db: DB = defaultDb
): Promise<{ posts: HydratedPost[]; total: number }> {
  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      id: posts.id,
      courseId: posts.courseId,
      authorId: posts.authorId,
      title: posts.title,
      body: posts.body,
      createdAt: posts.createdAt,
      savesCount: sql<number>`cast(count(case when ${savedPosts.deletedAt} is null then 1 end) as integer)`,
      hasSaved: sql<number>`cast(max(case when ${savedPosts.userId} = ${userId} and ${savedPosts.deletedAt} is null then 1 else 0 end) as integer)`,
    })
    .from(posts)
    .leftJoin(savedPosts, eq(savedPosts.postId, posts.id))
    .where(and(eq(posts.courseId, courseId), isNull(posts.deletedAt)))
    .groupBy(posts.id)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  const totalResult = await db
    .select({ value: count() })
    .from(posts)
    .where(and(eq(posts.courseId, courseId), isNull(posts.deletedAt)));

  return {
    posts: rows.map((r) => ({ ...r, hasSaved: r.hasSaved === 1, createdAt: r.createdAt ?? new Date() })),
    total: totalResult[0]?.value ?? 0,
  };
}

export async function getSavedPostsPage(
  userId: string,
  page: number,
  limit = 10,
  db: DB = defaultDb
): Promise<{ posts: HydratedPost[]; total: number }> {
  const offset = (page - 1) * limit;

  // ORDER BY saved_at DESC (not posts.createdAt) — most-recently-saved first.
  // When a post is re-saved, savedAt is updated, so it rises to the top.
  // sp2 is a self-join on saved_posts to count ALL users' active saves for each post.
  // The main saved_posts alias is filtered to the current user only (WHERE clause),
  // so counting from it would always return 1. sp2 has no user filter.
  const rows = await db
    .select({
      id: posts.id,
      courseId: posts.courseId,
      authorId: posts.authorId,
      title: posts.title,
      body: posts.body,
      createdAt: posts.createdAt,
      savedAt: savedPosts.savedAt,
      savesCount: sql<number>`cast(count(sp2.id) as integer)`,
      hasSaved: sql<number>`1`,
    })
    .from(savedPosts)
    .innerJoin(posts, eq(posts.id, savedPosts.postId))
    .leftJoin(
      sql`saved_posts sp2`,
      sql`sp2.post_id = ${posts.id} and sp2.deleted_at is null`
    )
    .where(and(eq(savedPosts.userId, userId), isNull(savedPosts.deletedAt), isNull(posts.deletedAt)))
    .groupBy(posts.id, savedPosts.savedAt)
    .orderBy(desc(savedPosts.savedAt))
    .limit(limit)
    .offset(offset);

  const totalResult = await db
    .select({ value: count() })
    .from(savedPosts)
    .innerJoin(posts, eq(posts.id, savedPosts.postId))
    .where(and(eq(savedPosts.userId, userId), isNull(savedPosts.deletedAt), isNull(posts.deletedAt)));

  return {
    posts: rows.map((r) => ({ ...r, hasSaved: true, createdAt: r.createdAt ?? new Date() })),
    total: totalResult[0]?.value ?? 0,
  };
}

export async function isEnrolled(userId: string, courseId: string, db: DB = defaultDb): Promise<boolean> {
  const row = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
    .limit(1);
  return row.length > 0;
}

export async function getPostById(postId: string, db: DB = defaultDb) {
  const row = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, postId), isNull(posts.deletedAt)))
    .limit(1);
  return row[0] ?? null;
}

export async function softDeletePost(postId: string, db: DB = defaultDb) {
  await db.update(posts).set({ deletedAt: new Date() }).where(eq(posts.id, postId));
}
