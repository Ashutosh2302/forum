"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, type PaginatedResponse } from "@/lib/api-client";
import { postKeys } from "@/lib/query-keys";

export function useToggleSave(courseId: string, feedPage: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, hasSaved }: { postId: string; hasSaved: boolean }) =>
      hasSaved ? apiClient.unsavePost(postId) : apiClient.savePost(postId),

    // Optimistic update: flip hasSaved and adjust savesCount immediately.
    // Snapshot lets us roll back if the server request fails.
    onMutate: async ({ postId, hasSaved }) => {
      await queryClient.cancelQueries({ queryKey: postKeys.feedAll(courseId) });
      await queryClient.cancelQueries({ queryKey: postKeys.savedAll() });

      const previousFeed = queryClient.getQueryData<PaginatedResponse>(postKeys.feed(courseId, feedPage));
      const previousSaved = queryClient.getQueryData<PaginatedResponse>(postKeys.saved(1));

      queryClient.setQueryData<PaginatedResponse>(postKeys.feed(courseId, feedPage), (old) => {
        if (!old) return old;
        return {
          ...old,
          posts: old.posts.map((p) =>
            p.id === postId
              ? { ...p, hasSaved: !hasSaved, savesCount: p.savesCount + (hasSaved ? -1 : 1) }
              : p
          ),
        };
      });

      return { previousFeed, previousSaved };
    },

    onError: (_err, _vars, context) => {
      // Roll back to the snapshot on failure
      if (context?.previousFeed) {
        queryClient.setQueryData(postKeys.feed(courseId, feedPage), context.previousFeed);
      }
      if (context?.previousSaved) {
        queryClient.setQueryData(postKeys.saved(1), context.previousSaved);
      }
    },

    onSettled: () => {
      // Always sync with server state after mutation settles
      queryClient.invalidateQueries({ queryKey: postKeys.feedAll(courseId) });
      queryClient.invalidateQueries({ queryKey: postKeys.savedAll() });
    },
  });
}
