"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Never retry 4xx errors — they won't resolve on retry
        retry: (count, error) => {
          if (error instanceof Error && /Forbidden|Unauthorized|Not found/i.test(error.message)) return false;
          return count < 2;
        },
      },
    },
  }));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
