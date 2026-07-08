"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { postKeys } from "@/lib/query-keys";

export function useRemovePost(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => apiClient.removePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.feedAll(courseId) });
      queryClient.invalidateQueries({ queryKey: postKeys.savedAll() });
    },
  });
}
