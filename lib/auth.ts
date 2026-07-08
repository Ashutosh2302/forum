import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const AuthSchema = z.object({
  "x-user-id": z.string().min(1),
  "x-user-role": z.enum(["student", "moderator"]),
});

export type AuthContext = {
  userId: string;
  role: "student" | "moderator";
};

// Accepts Request or NextRequest — keeps the function testable without the Next.js runtime.
// Auth lives here (not inline in handlers) so it cannot be accidentally omitted.
export function requireAuth(
  req: Request | NextRequest
): { ctx: AuthContext; error: null } | { ctx: null; error: NextResponse } {
  const parsed = AuthSchema.safeParse({
    "x-user-id": req.headers.get("x-user-id"),
    "x-user-role": req.headers.get("x-user-role"),
  });

  if (!parsed.success) {
    return {
      ctx: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    ctx: {
      userId: parsed.data["x-user-id"],
      role: parsed.data["x-user-role"],
    },
    error: null,
  };
}
