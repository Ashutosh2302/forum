// Centralised query key factory.
// All cache invalidations reference these keys — never inline strings.
export const postKeys = {
  feed: (courseId: string, page: number) => ["posts", "feed", courseId, page] as const,
  feedAll: (courseId: string) => ["posts", "feed", courseId] as const,
  saved: (page: number) => ["posts", "saved", page] as const,
  savedAll: () => ["posts", "saved"] as const,
};
