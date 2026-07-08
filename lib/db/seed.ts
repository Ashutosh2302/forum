import { db } from "./index";
import { users, courses, enrollments, posts, savedPosts } from "./schema";

async function seed() {
  // Delete children before parents to satisfy foreign key constraints
  await db.delete(savedPosts);
  await db.delete(enrollments);
  await db.delete(posts);
  await db.delete(users);
  await db.delete(courses);

  await db.insert(courses).values([
    { id: "course-1", name: "Introduction to TypeScript" },
    { id: "course-2", name: "Advanced React Patterns" },
  ]);

  await db.insert(users).values([
    { id: "student-1", name: "Alice Chen", role: "student" },
    { id: "student-2", name: "Bob Smith", role: "student" },
    { id: "student-3", name: "Carol Lee", role: "student" },
    { id: "mod-1", name: "Dave Mod", role: "moderator" },
  ]);

  // Alice and Bob are in course-1; Carol is in course-2 only
  await db.insert(enrollments).values([
    { userId: "student-1", courseId: "course-1" },
    { userId: "student-2", courseId: "course-1" },
    { userId: "student-3", courseId: "course-2" },
    // Moderator has no enrollments — access bypasses the enrollment check
  ]);

  await db.insert(posts).values([
    // course-1: TypeScript — 14 posts, shows 2 pages at limit=10
    {
      id: "post-1",
      courseId: "course-1",
      authorId: "student-1",
      title: "What's the difference between type and interface?",
      body: "I keep seeing both used interchangeably but they behave differently in some edge cases.",
      createdAt: new Date("2025-01-01T10:00:00Z"),
    },
    {
      id: "post-2",
      courseId: "course-1",
      authorId: "student-2",
      title: "Union types are blowing my mind",
      body: "Just discovered discriminated unions — they make state machines so clean.",
      createdAt: new Date("2025-01-02T11:00:00Z"),
    },
    {
      id: "post-3",
      courseId: "course-1",
      authorId: "student-1",
      title: "Mapped types vs conditional types",
      body: "When should I reach for each? Looking for real-world examples.",
      createdAt: new Date("2025-01-03T09:00:00Z"),
    },
    {
      id: "post-6",
      courseId: "course-1",
      authorId: "student-2",
      title: "TypeScript generics finally clicked for me",
      body: "The key insight: generics are just type-level function parameters. Once I saw that, everything made sense.",
      createdAt: new Date("2025-01-04T10:00:00Z"),
    },
    {
      id: "post-7",
      courseId: "course-1",
      authorId: "student-1",
      title: "When should I use unknown vs any?",
      body: "I know any is bad practice but unknown feels overly restrictive. What's the right mental model?",
      createdAt: new Date("2025-01-05T09:00:00Z"),
    },
    {
      id: "post-8",
      courseId: "course-1",
      authorId: "student-2",
      title: "Strict mode caught a real bug today",
      body: "Enabled strictNullChecks and immediately found a case where I was accessing a property on something that could be undefined. Worth the noise.",
      createdAt: new Date("2025-01-06T11:00:00Z"),
    },
    {
      id: "post-9",
      courseId: "course-1",
      authorId: "student-1",
      title: "Readonly and const — what's the difference?",
      body: "const prevents rebinding, Readonly prevents mutation. But Readonly is shallow — nested objects can still be mutated.",
      createdAt: new Date("2025-01-07T08:00:00Z"),
    },
    {
      id: "post-10",
      courseId: "course-1",
      authorId: "student-2",
      title: "Utility types cheat sheet",
      body: "Partial, Required, Pick, Omit, Record, Exclude, Extract — I made a cheat sheet. Happy to share if anyone wants it.",
      createdAt: new Date("2025-01-08T14:00:00Z"),
    },
    {
      id: "post-11",
      courseId: "course-1",
      authorId: "student-1",
      title: "Template literal types are wild",
      body: "You can do type-level string manipulation with template literals. Building a typed event system with them right now.",
      createdAt: new Date("2025-01-09T10:00:00Z"),
    },
    {
      id: "post-12",
      courseId: "course-1",
      authorId: "student-2",
      title: "infer keyword — can someone explain this?",
      body: "I see infer used in conditional types but I can't wrap my head around what it actually does.",
      createdAt: new Date("2025-01-10T09:00:00Z"),
    },
    {
      id: "post-13",
      courseId: "course-1",
      authorId: "student-1",
      title: "Discriminated unions for error handling",
      body: "Using { ok: true; value: T } | { ok: false; error: string } instead of throwing. Way cleaner than try/catch everywhere.",
      createdAt: new Date("2025-01-11T11:00:00Z"),
    },
    {
      id: "post-14",
      courseId: "course-1",
      authorId: "student-2",
      title: "Declaration merging tripped me up",
      body: "Added a property to an interface in two separate files and they merged silently. Took me an hour to figure out what happened.",
      createdAt: new Date("2025-01-12T08:00:00Z"),
    },
    {
      id: "post-15",
      courseId: "course-1",
      authorId: "student-1",
      title: "satisfies operator — new favourite feature",
      body: "satisfies lets you validate a value against a type without widening it. Perfect for config objects.",
      createdAt: new Date("2025-01-13T10:00:00Z"),
    },
    {
      id: "post-16",
      courseId: "course-1",
      authorId: "student-2",
      title: "noUncheckedIndexedAccess — enable it",
      body: "Makes array indexing return T | undefined instead of T. Catches so many off-by-one bugs at compile time.",
      createdAt: new Date("2025-01-14T09:00:00Z"),
    },
    // course-2: React — 12 posts, shows 2 pages at limit=10
    {
      id: "post-4",
      courseId: "course-2",
      authorId: "student-3",
      title: "useReducer vs useState for complex state",
      body: "My component has 8 useState calls. Time to refactor?",
      createdAt: new Date("2025-01-02T14:00:00Z"),
    },
    {
      id: "post-5",
      courseId: "course-2",
      authorId: "student-3",
      title: "Context API causes too many re-renders",
      body: "Every consumer re-renders when any value changes. How do you split context correctly?",
      createdAt: new Date("2025-01-04T08:00:00Z"),
    },
    {
      id: "post-17",
      courseId: "course-2",
      authorId: "student-3",
      title: "useMemo vs useCallback — when does it actually help?",
      body: "I've been wrapping everything in useMemo but I've heard it can actually hurt performance if overused.",
      createdAt: new Date("2025-01-05T10:00:00Z"),
    },
    {
      id: "post-18",
      courseId: "course-2",
      authorId: "student-3",
      title: "Compound components pattern",
      body: "Building a Tabs component using compound components and Context. The API feels really clean — no prop drilling.",
      createdAt: new Date("2025-01-06T09:00:00Z"),
    },
    {
      id: "post-19",
      courseId: "course-2",
      authorId: "student-3",
      title: "React 19 use() hook is confusing me",
      body: "The new use() hook can suspend on a promise or read context. When should I use it over useContext?",
      createdAt: new Date("2025-01-07T11:00:00Z"),
    },
    {
      id: "post-20",
      courseId: "course-2",
      authorId: "student-3",
      title: "Custom hook for debounced search",
      body: "Extracted a useDebounce hook and now my search input only fires after 300ms of no typing. Sharing the code below.",
      createdAt: new Date("2025-01-08T10:00:00Z"),
    },
    {
      id: "post-21",
      courseId: "course-2",
      authorId: "student-3",
      title: "React Query vs useEffect for data fetching",
      body: "Replaced all my useEffect data fetching with React Query. Caching, refetching, loading states — all handled. Should have done this sooner.",
      createdAt: new Date("2025-01-09T08:00:00Z"),
    },
    {
      id: "post-22",
      courseId: "course-2",
      authorId: "student-3",
      title: "Render prop pattern — still useful?",
      body: "With hooks everywhere I rarely see render props anymore. Are there cases where they're still the right choice?",
      createdAt: new Date("2025-01-10T14:00:00Z"),
    },
    {
      id: "post-23",
      courseId: "course-2",
      authorId: "student-3",
      title: "Optimistic UI with React Query",
      body: "Implemented optimistic updates for a like button. The snapshot/rollback pattern in onMutate is very clean once you understand it.",
      createdAt: new Date("2025-01-11T10:00:00Z"),
    },
    {
      id: "post-24",
      courseId: "course-2",
      authorId: "student-3",
      title: "Avoid prop drilling without Context",
      body: "Component composition (passing elements as props) often solves the same problem as Context without the re-render cost.",
      createdAt: new Date("2025-01-12T09:00:00Z"),
    },
    {
      id: "post-25",
      courseId: "course-2",
      authorId: "student-3",
      title: "Server Components changed how I think about data fetching",
      body: "Data fetching moves to the server, no useEffect, no loading spinners for initial data. The mental model is simpler than I expected.",
      createdAt: new Date("2025-01-13T11:00:00Z"),
    },
    {
      id: "post-26",
      courseId: "course-2",
      authorId: "student-3",
      title: "Key prop gotcha with animations",
      body: "Changing the key on an animated element unmounts and remounts it, resetting the animation. Spent two hours on this.",
      createdAt: new Date("2025-01-14T08:00:00Z"),
    },
  ]);

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
