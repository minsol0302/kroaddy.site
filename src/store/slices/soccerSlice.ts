// @ts-nocheck
/**
 * 축구 검색 Slice - 축구 관련 검색 상태 및 액션
 */
import { StateCreator } from 'zustand';
import { SearchType } from '../../lib/types';
import { SoccerSlice } from '../types';

export const createSoccerSlice: StateCreator<
  SoccerSlice,
  [],
  [],
  SoccerSlice
> = (set) => ({
  searchInput: '',
  searchType: SearchType.PLAYER,
  setSearchInput: (input) => set({ searchInput: input }),
  setSearchType: (type) => set({ searchType: type }),
  resetSearch: () =>
    set({
      searchInput: '',
      searchType: SearchType.PLAYER,
    }),
});

