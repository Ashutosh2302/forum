import { sqliteTable, text, integer, primaryKey, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role", { enum: ["student", "moderator"] }).notNull(),
});

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const enrollments = sqliteTable(
  "enrollments",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.courseId] })]
);

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

// UNIQUE(userId, postId) ensures at most one record per pair.
// Soft delete (deletedAt) preserves history — re-saving reactivates this row
// rather than inserting a duplicate. savesCount = COUNT WHERE deletedAt IS NULL.
export const savedPosts = sqliteTable(
  "saved_posts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id),
    savedAt: integer("saved_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (t) => [uniqueIndex("saved_posts_user_post_idx").on(t.userId, t.postId)]
);

export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type SavedPost = typeof savedPosts.$inferSelect;
