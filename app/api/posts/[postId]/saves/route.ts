import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getPostById, isEnrolled } from "@/lib/posts-db";
import { executeSave, executeUnsave } from "@/lib/saves-db";

async function authorizePostAccess(
  req: NextRequest,
  postId: string
): Promise<
  | { ctx: { userId: string; role: "student" | "moderator" }; post: NonNullable<Awaited<ReturnType<typeof getPostById>>>; error: null }
  | { ctx: null; post: null; error: NextResponse }
> {
  const { ctx, error } = requireAuth(req);
  if (error) return { ctx: null, post: null, error };

  const post = await getPostById(postId);
  if (!post) {
    return { ctx: null, post: null, error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  if (ctx.role === "student") {
    const enrolled = await isEnrolled(ctx.userId, post.courseId);
    if (!enrolled) {
      return { ctx: null, post: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
  }

  return { ctx, post, error: null };
}

// PUT — ensure saved (idempotent: saving an already-saved post is a no-op, not an error)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const { ctx, error } = await authorizePostAccess(req, postId);
  if (error) return error;

  const result = await executeSave(ctx.userId, postId);
  return NextResponse.json(result);
}

// DELETE — ensure unsaved (idempotent: un-saving a post that isn't saved is a no-op)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const { ctx, error } = await authorizePostAccess(req, postId);
  if (error) return error;

  const result = await executeUnsave(ctx.userId, postId);
  return NextResponse.json(result);
}
