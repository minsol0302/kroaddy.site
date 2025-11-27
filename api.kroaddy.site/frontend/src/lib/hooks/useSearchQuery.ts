// @ts-nocheck
import { useMutation } from '@tanstack/react-query';
import { searchApi } from '../api/searchApi';
import { SearchRequest, SearchResponse, ApiError } from '../types';

/**
 * 검색 Mutation Hook
 * React Query를 사용하여 검색 API 호출 관리
 */
export const useSearchMutation = () => {
  return useMutation<SearchResponse, ApiError, SearchRequest>({
    mutationFn: searchApi,
    onSuccess: (data, variables) => {
      // 성공 시 alert 표시
      alert(`✅ 검색 성공!\n\n검색어: ${variables.keyword}\n타입: ${variables.type}\n\n결과: ${data?.message || '검색 완료'}`);
      console.log('검색 성공:', data);
    },
    onError: (error: ApiError, variables) => {
      // 에러 시 alert 표시
      alert(`❌ 검색 실패\n\n검색어: ${variables.keyword}\n타입: ${variables.type}\n\n${error.error}`);
      console.error('검색 실패:', error);
    },
  });
};

