"use client";
import { useTranslations } from "next-intl";
import { useRemovePost } from "@/hooks/useRemovePost";

type Props = { postId: string; courseId: string };

export default function RemoveButton({ postId, courseId }: Props) {
  const t = useTranslations("post");
  const { mutate, isPending, isSuccess } = useRemovePost(courseId);

  if (isSuccess) return null;

  return (
    <button
      onClick={() => mutate(postId)}
      disabled={isPending}
      aria-label={t("remove")}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
        bg-red-50 text-red-600 hover:bg-red-100 transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? t("removing") : t("remove")}
    </button>
  );
}
