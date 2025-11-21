// @ts-nocheck
/**
 * UI Slice - UI 상태 관리
 */
import { StateCreator } from 'zustand';
import { UISlice } from '../types';

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (
  set
) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
});

