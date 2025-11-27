/**
 * Soccer Players API
 * - Gateway를 통한 Soccer Service 호출
 */

import { apiClient } from '../client';
import type { Player, CreatePlayerDTO, UpdatePlayerDTO } from './types';

const BASE_PATH = '/soccer/players';

export const playersApi = {
  /**
   * 전체 선수 목록 조회
   */
  getAll: async (): Promise<Player[]> => {
    const { data } = await apiClient.get<Player[]>(`${BASE_PATH}/all`);
    return data;
  },

  /**
   * 선수 ID로 조회
   */
  getById: async (id: number): Promise<Player> => {
    const { data } = await apiClient.get<Player>(`${BASE_PATH}/${id}`);
    return data;
  },

  /**
   * 선수 검색 (이름 기반)
   */
  search: async (query: string): Promise<Player[]> => {
    const { data } = await apiClient.get<Player[]>(`${BASE_PATH}/search`, {
      params: { query },
    });
    return data;
  },

  /**
   * 선수 생성
   */
  create: async (playerData: CreatePlayerDTO): Promise<Player> => {
    const { data } = await apiClient.post<Player>(BASE_PATH, playerData);
    return data;
  },

  /**
   * 선수 정보 수정
   */
  update: async (id: number, playerData: UpdatePlayerDTO): Promise<Player> => {
    const { data } = await apiClient.put<Player>(`${BASE_PATH}/${id}`, playerData);
    return data;
  },

  /**
   * 선수 삭제
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};

