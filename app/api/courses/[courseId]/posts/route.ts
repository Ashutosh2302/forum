import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getFeedPage, isEnrolled } from "@/lib/posts-db";

const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { ctx, error } = requireAuth(req);
  if (error) return error;

  const { courseId } = await params;
  const { searchParams } = new URL(req.url);
  const query = QuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!query.success) {
    return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
  }

  // Moderators bypass the enrollment check — they can see any course
  if (ctx.role === "student") {
    const enrolled = await isEnrolled(ctx.userId, courseId);
    if (!enrolled) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { posts, total } = await getFeedPage(courseId, ctx.userId, query.data.page, query.data.limit);

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
