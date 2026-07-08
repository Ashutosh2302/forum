"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { postKeys } from "@/lib/query-keys";

export function useFeed(courseId: string, page: number) {
  return useQuery({
    queryKey: postKeys.feed(courseId, page),
    queryFn: () => apiClient.getFeed(courseId, page),
  });
}
