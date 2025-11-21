/**
 * API Client (Axios)
 * - Gateway로 모든 요청 전달
 * - Next.js API Routes를 통해 프록시
 */

import axios from 'axios';

// Gateway URL (Next.js API Routes를 통해 프록시)
const API_BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: '/api', // Next.js API Routes
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // HttpOnly Cookie 전송
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Request ID 생성 (디버깅용)
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    config.headers['X-Request-Id'] = requestId;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        params: config.params,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버 응답 에러
      const { status, data } = error.response;
      
      console.error(`[API Response Error] ${status}`, {
        url: error.config?.url,
        message: data?.message || error.message,
        data,
      });
      
      // 에러 메시지 통일
      const errorMessage = data?.message || data?.error || 'An error occurred';
      error.message = errorMessage;
    } else if (error.request) {
      // 요청 전송 실패
      console.error('[API Network Error]', error.message);
      error.message = 'Network error. Please check your connection.';
    } else {
      // 기타 에러
      console.error('[API Error]', error.message);
    }
    
    return Promise.reject(error);
  }
);

