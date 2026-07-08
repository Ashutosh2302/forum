import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getSavedPostsPage } from "@/lib/posts-db";

const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// userId comes from the auth header — never a URL param.
// This makes it structurally impossible to read another user's saved list.
export async function GET(req: NextRequest) {
  const { ctx, error } = requireAuth(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const query = QuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!query.success) {
    return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
  }

  const { posts, total } = await getSavedPostsPage(ctx.userId, query.data.page, query.data.limit);

  return NextResponse.json({
    posts,
    pagination: {
      page: query.data.page,
      limit: query.data.limit,
      total,
      totalPages: Math.ceil(total / query.data.limit),
    },
  });
}
