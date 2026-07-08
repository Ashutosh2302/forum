"use client";
import { useTranslations } from "next-intl";
import { useToggleSave } from "@/hooks/useToggleSave";

type Props = {
  postId: string;
  hasSaved: boolean;
  courseId: string;
  feedPage: number;
};

export default function BookmarkButton({ postId, hasSaved, courseId, feedPage }: Props) {
  const t = useTranslations("post");
  const { mutate, isPending } = useToggleSave(courseId, feedPage);

  return (
    <button
      onClick={() => mutate({ postId, hasSaved })}
      disabled={isPending}
      aria-label={hasSaved ? t("unsave") : t("save")}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
        ${hasSaved
          ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <BookmarkIcon filled={hasSaved} />
      {isPending ? t("saving") : hasSaved ? t("unsave") : t("save")}
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
      />
    </svg>
  );
}
