"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useFeed } from "@/hooks/useFeed";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import { use } from "react";

export default function CourseFeedPage({ params }: { params: Promise<{ courseId: string; locale: string }> }) {
  const { courseId } = use(params);
  const t = useTranslations("feed");
  const tError = useTranslations("error");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useFeed(courseId, page);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-6">{t("title")}</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    const isForbidden = error instanceof Error && /forbidden/i.test(error.message);
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-medium">
          {isForbidden ? tError("forbidden") : tError("generic")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">{t("title")}</h1>
      {data?.posts.length === 0 ? (
        <p className="text-gray-500 text-sm">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          {data?.posts.map((post) => (
            <PostCard key={post.id} post={post} courseId={courseId} feedPage={page} />
          ))}
        </div>
      )}
      {data && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
