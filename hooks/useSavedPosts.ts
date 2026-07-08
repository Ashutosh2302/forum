"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { postKeys } from "@/lib/query-keys";

export function useSavedPosts(page: number) {
  return useQuery({
    queryKey: postKeys.saved(page),
    queryFn: () => apiClient.getSavedPosts(page),
  });
}
