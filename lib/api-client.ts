import type { HydratedPost } from "./posts-db";

export type PaginatedResponse = {
  posts: HydratedPost[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type SaveResponse = { hasSaved: boolean; savesCount: number };

// Auth headers are read from localStorage in the browser (stubbed identity).
// In production this would be a signed JWT in a cookie or Authorization header.
function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const userId = localStorage.getItem("userId") ?? "student-1";
  const role = localStorage.getItem("userRole") ?? "student";
  return { "x-user-id": userId, "x-user-role": role };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...getAuthHeaders(), ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const apiClient = {
  getFeed: (courseId: string, page: number) =>
    apiFetch<PaginatedResponse>(`/api/courses/${courseId}/posts?page=${page}`),

  getSavedPosts: (page: number) =>
    apiFetch<PaginatedResponse>(`/api/me/saved-posts?page=${page}`),

  savePost: (postId: string) =>
    apiFetch<SaveResponse>(`/api/posts/${postId}/saves`, { method: "PUT" }),

  unsavePost: (postId: string) =>
    apiFetch<SaveResponse>(`/api/posts/${postId}/saves`, { method: "DELETE" }),

  removePost: (postId: string) =>
    apiFetch<{ success: boolean }>(`/api/posts/${postId}`, { method: "DELETE" }),
};
