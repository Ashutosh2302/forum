"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

export default function SavedPostsPage() {
  const t = useTranslations("saved");
  const tError = useTranslations("error");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useSavedPosts(page);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-6">{t("title")}</h1>
        <div className="space-y-3">
          {[1, 2].map((i) => (
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
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-medium">{tError("generic")}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">{t("title")}</h1>
      {data?.posts.length === 0 ? (
        <div className="text-center py-16">
          <BookmarkEmptyIcon />
          <p className="text-gray-500 text-sm mt-4">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              courseId={post.courseId}
              feedPage={1}
            />
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

function BookmarkEmptyIcon() {
  return (
    <svg className="mx-auto w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}
