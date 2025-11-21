// @ts-nocheck
/**
 * API 클라이언트
 * 모든 API 호출의 중앙 관리
 */
import axios, { AxiosError } from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 요청 전 처리 (인증 토큰 추가 등)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // 에러 처리
    return Promise.reject(error);
  }
);

/**
 * API 에러 메시지 파싱
 */
export const parseApiError = (error: any): string => {
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
        const details = errorData?.details || errorData?.error || '서버에 연결할 수 없습니다.';
        errorMessage = `⚠️ 서버 연결 실패\n\n${details}`;
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

