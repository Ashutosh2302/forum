"use client";
import { useTranslations } from "next-intl";
import type { HydratedPost } from "@/lib/posts-db";
import BookmarkButton from "./BookmarkButton";
import RemoveButton from "./RemoveButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type Props = {
  post: HydratedPost;
  courseId: string;
  feedPage: number;
};

const COURSE_LABELS: Record<string, string> = {
  "course-1": "TS Course",
  "course-2": "React Course",
};

// Presentation only — receives data as props, no fetching here.
export default function PostCard({ post, courseId, feedPage }: Props) {
  const t = useTranslations("post");
  const { role } = useCurrentUser();
  const courseLabel = COURSE_LABELS[courseId] ?? courseId;

  return (
    <article className="bg-white border border-gray-200 rounded-lg p-5 flex gap-4">
      <div className="flex-1 min-w-0">
        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 mb-2">
          {courseLabel}
        </span>
        <h2 className="text-base font-semibold text-gray-900 mb-1">{post.title}</h2>
        <p className="text-sm text-gray-600 line-clamp-2">{post.body}</p>
        <p className="text-xs text-gray-400 mt-2">
          {t("saves", { count: post.savesCount })}
        </p>
      </div>
      <div className="shrink-0 flex items-start gap-2">
        <BookmarkButton
          postId={post.id}
          hasSaved={post.hasSaved}
          courseId={courseId}
          feedPage={feedPage}
        />
        {role === "moderator" && (
          <RemoveButton postId={post.id} courseId={courseId} />
        )}
      </div>
    </article>
  );
}
