// @ts-nocheck
import axios, { AxiosError } from 'axios';
import { SearchRequest, SearchResponse, ApiError } from '../types';

/**
 * API 에러 메시지 파싱
 */
const parseErrorMessage = (error: any): string => {
  let errorMessage = '알 수 없는 오류';

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ details?: string; error?: string }>;

    if (axiosError.response) {
      const errorData = axiosError.response.data;
      const status = axiosError.response.status;

      if (status === 400) {
        const details = errorData?.details || errorData?.error || '잘못된 요청입니다.';
        errorMessage = `⚠️ 잘못된 요청 (400)\n\n${details}`;
      } else if (status === 404) {
        const details = errorData?.error || 'API 엔드포인트를 찾을 수 없습니다.';
        errorMessage = `⚠️ API를 찾을 수 없음 (404)\n\n${details}`;
      } else if (status === 503) {
        const details = errorData?.details || errorData?.error || 'Java 백엔드 서버에 연결할 수 없습니다.';
        errorMessage = `⚠️ Java 백엔드 서버 연결 실패\n\n${details}`;
      } else {
        errorMessage = `서버 오류 (${status}): ${errorData?.error || errorData?.details || axiosError.message}`;
      }
    } else if (axiosError.request) {
      errorMessage = '⚠️ 서버에 연결할 수 없습니다.\n\nCORS 오류가 발생했을 수 있습니다.';
    } else {
      errorMessage = `요청 설정 오류: ${axiosError.message}`;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return errorMessage;
};

/**
 * 검색 API 호출
 * Next.js API Route를 통해 백엔드로 요청 전송
 * API Route가 서버 사이드에서 Discovery Gateway를 통해 백엔드에 접근
 */
export const searchApi = async (params: SearchRequest): Promise<SearchResponse> => {
  try {
    const response = await axios.get<SearchResponse>('/api/search', {
      params: {
        type: params.type,
        keyword: params.keyword,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage = parseErrorMessage(error);

    // 에러 객체로 변환하여 throw
    const apiError: ApiError = {
      error: errorMessage,
      status: axios.isAxiosError(error) && error.response?.status
        ? error.response.status
        : 500,
      details: axios.isAxiosError(error) && error.response?.data?.details
        ? error.response.data.details
        : undefined,
    };

    throw apiError;
  }
};

