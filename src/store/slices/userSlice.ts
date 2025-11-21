// @ts-nocheck
/**
 * 사용자 Slice - 사용자 인증 및 프로필 상태 관리
 */
import { StateCreator } from 'zustand';
import { UserSlice } from '../types';

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (
  set
) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
});

