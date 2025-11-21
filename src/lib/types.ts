// @ts-nocheck
/**
 * 공통 타입 정의
 * 모든 도메인에서 사용하는 공통 타입
 */

// 검색 관련 타입
export enum SearchType {
  PLAYER = 'player',
  TEAM = 'team',
  STADIUM = 'stadium',
  SCHEDULE = 'schedule',
}

export type SearchTypeValue = SearchType | 'player' | 'team' | 'stadium' | 'schedule';

export interface SearchRequest {
  type: SearchTypeValue;
  keyword: string;
}

export interface SearchResponse {
  message?: string;
  data?: any[];
  error?: string;
  details?: string;
  status?: number;
}

export interface ApiError {
  error: string;
  details?: string;
  status: number;
}

// 메시지 타입
export interface Message {
  role: "user" | "assistant";
  content: string;
}

// 위치 타입
export interface Location {
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  image?: string;
  category?: string;
}

