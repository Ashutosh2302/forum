# Community Forum — Saved Posts

## Setup

```bash
bun install
bun run db:generate   # generate SQL migration files
bun run db:migrate    # apply schema to forum.db
bun run db:seed       # insert 2 courses, 4 users, 26 posts
bun run dev           # start app at http://localhost:3000
bun run test          # unit + integration tests (21 tests)
```

The app redirects to `/en/courses/course-1` on load. Switch locale via `/es/courses/course-1`.

---

## Seeded Users & Access

Authentication is stubbed — identity is stored in `localStorage` and sent as `x-user-id` / `x-user-role` request headers by the API client.

**For demo convenience, a user switcher is built into the nav bar** (top-right corner). Click your current user name to open a dropdown and select any seeded user — the page reloads automatically to clear the React Query cache. This is intentionally a demo-only affordance; in production, identity would come from a signed JWT validated server-side and no client-side switcher would exist.

| User | Role | Enrolled in |
|------|------|-------------|
| Alice Chen (`student-1`) | student | TS Course only |
| Bob Smith (`student-2`) | student | TS Course only |
| Carol Lee (`student-3`) | student | React Course only |
| Dave Mod (`mod-1`) | moderator | All courses (bypasses enrollment check) |

### Access rules in practice

- **Alice / Bob** — can view the TS Course feed, save/unsave posts; navigating to React Course returns **403 Forbidden**; each user's Saved Posts list is private to them
- **Carol** — same as above but for React Course; TS Course returns **403**
- **Dave Mod** — can view both feeds; sees a red **Remove** button on every post (soft-deletes it); can also save/unsave like a student

---

## Testing Authorization Rules

| Scenario | How to trigger | Expected |
|----------|---------------|----------|
| 401 Unauthorized | Remove headers: `localStorage.clear()` then refresh | API returns 401 on any request |
| 403 Forbidden | Log in as `student-1`, navigate to `/en/courses/course-2` | Feed shows "You are not enrolled in this course" |
| 404 Not Found | `curl -X PUT http://localhost:3000/api/posts/fake-id/saves -H "x-user-id: student-1" -H "x-user-role: student"` | `{"error":"Not found"}` |
| OWN rule | Log in as `student-1`; the `/api/me/saved-posts` endpoint is structurally locked to the auth header — no userId URL param exists to attempt | Cannot read another user's list |
| Moderator remove | Log in as `mod-1`, click Remove on any post | Post disappears from feed and saved lists |

---

## Key Design Decisions

### Schema: `UNIQUE(userId, postId)` on `saved_posts`

The unique constraint on `(user_id, post_id)` is the foundation of the entire save/unsave feature. It guarantees at most one row per user-post pair at the database level — no application-level race condition can create a duplicate. Combined with soft delete (`deleted_at`), it enables:

- **Idempotent save:** `computeSave('active') → 'noop'` — already saved, no write, no count change.
- **History preserved:** un-saving sets `deleted_at`, the row survives.
- **Reactivation:** re-saving calls `UPDATE SET deleted_at = NULL, saved_at = now()` on the existing row — no new row inserted.
- **`savedAt` updates on re-save:** the post rises to the top of the saved list (ordered by `saved_at DESC`), which matches the expectation that "most-recently-saved" reflects the latest intent.

### `savesCount` is computed, never stored

A stored counter would require an atomic increment/decrement on every save/unsave, adding concurrency risk and possible drift if a request fails mid-flight. Computing `COUNT(CASE WHEN deleted_at IS NULL THEN 1 END)` in the query is always consistent and costs one aggregation per page, not per post (GROUP BY).

### Hydrating `hasSaved` and `savesCount` without N+1

Both the feed and saved list use a single LEFT JOIN + GROUP BY query regardless of page size. The per-user `hasSaved` is a `MAX(CASE WHEN userId = $me ...)` — one pass through the join produces both the global count and the user-specific flag.

### Auth lives in `requireAuth()` — not inline in handlers

A single function that parses and validates `x-user-id` / `x-user-role` headers. Every route handler calls it first and returns its error early. This makes it structurally impossible to forget authentication on a new endpoint.

Authorization order in each handler:
1. **401** — missing/invalid auth headers
2. **404** — post doesn't exist (checked before enrollment so we don't reveal post existence to unenrolled students via 403)
3. **403** — student not enrolled in the post's course

### The `OWN` rule is enforced by API design

`GET /api/me/saved-posts` derives `userId` from the auth header only — there is no `:userId` URL parameter. It is structurally impossible to request another user's saved list through this API.

### Pure business logic in `lib/saves.ts`

`computeSave()` and `computeUnsave()` are pure functions with no imports. They encode all the decision logic: idempotency, reactivation, and the distinction between "save" (ensure-active) and "un-save" (ensure-inactive). This layer is unit-tested without any database setup.

The DB execution layer (`lib/saves-db.ts`) accepts a `db` parameter (default = production singleton), enabling clean dependency injection in tests without module patching.

### Save vs toggle

`PUT /saves` means "ensure saved" and `DELETE /saves` means "ensure unsaved" — both idempotent. The UI reads `hasSaved` to decide which to call. This correctly satisfies *"saving twice is a no-op, not an error and not a double-count"* — a toggle would violate this by unsaving on the second click.

---

## Tradeoffs and Descoped Items

- **SQLite instead of PostgreSQL.** Same Drizzle ORM, same SQL semantics for everything relevant (`ON CONFLICT`, soft deletes, JOINs). Switching to Postgres is one line in `drizzle.config.ts`.
- **Offset pagination instead of cursor.** Simpler for a timebox. Cursor pagination (using `saved_at` as the cursor) would avoid count queries and be stable under concurrent inserts — noted as a next-step below.
- **No 401 test via HTTP.** `requireAuth()` is pure header-parsing, tested structurally (all routes call it first). A full HTTP integration test would need a running Next.js server.
- **No real-time count updates.** Counts reflect server state after React Query invalidation on mutation settle.
- **Moderator UI.** The remove-post endpoint (`DELETE /api/posts/:postId`) is implemented and authorization-enforced, but there is no moderator UI panel — descoped given the timebox.

---

## What I'd Do Next

1. **Cursor pagination** — use `saved_at` + `id` as a stable cursor for the saved list, avoiding count queries and rank instability under concurrent saves.
2. **Real-time save counts** — Server-Sent Events broadcasting count updates; the query is unchanged, just pushed instead of pulled.
3. **Proper JWT middleware** — replace header stubs with signed tokens; `requireAuth` already has the right shape (returns `{ ctx, error }`), so the internals swap without touching any handler.
4. **Optimistic UI for saved list** — currently the saved list refetches after a toggle; could apply the same snapshot/rollback pattern from the feed hook.
5. **Rate limiting on saves** — middleware layer, could add per-user save-per-minute limit without touching business logic.
6. **Likes and comments** — same table pattern as `saved_posts`: `post_likes(userId, postId)` + unique constraint, same JOIN for hydration.