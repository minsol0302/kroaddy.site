// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * React Query Provider
 * - 클라이언트 사이드에서만 동작
 * - QueryClient를 useState로 관리하여 SSR 호환성 보장
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // SSR 시 refetch 방지
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5분
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

