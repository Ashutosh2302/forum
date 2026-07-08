import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getPostById, softDeletePost } from "@/lib/posts-db";

// DELETE — moderator only: remove a post (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { ctx, error } = requireAuth(req);
  if (error) return error;

  if (ctx.role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { postId } = await params;
  const post = await getPostById(postId);
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await softDeletePost(postId);
  return NextResponse.json({ success: true });
}
