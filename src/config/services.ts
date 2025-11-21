// @ts-nocheck
/**
 * 서비스 설정
 * API 엔드포인트 및 서비스 관련 설정
 */

export const API_ENDPOINTS = {
  SEARCH: '/api/search',
  SOCCER: '/api/soccer',
  PLAYERS: '/api/players',
  TEAMS: '/api/teams',
  STADIUMS: '/api/stadiums',
  SCHEDULES: '/api/schedules',
} as const;

export const SERVICE_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  DISCOVERY_GATEWAY_URL: process.env.NEXT_PUBLIC_DISCOVERY_URL || 'http://discovery:8080',
  EUREKA_URL: process.env.NEXT_PUBLIC_EUREKA_URL || 'http://localhost:8761',
} as const;

