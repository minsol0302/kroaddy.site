// @ts-nocheck
"use client";

import { create } from 'zustand';
import { createSoccerSlice } from './slices/soccerSlice';
import { createUISlice } from './slices/uiSlice';
import { createUserSlice } from './slices/userSlice';
import type { StoreState } from './types';

/**
 * Zustand Store 생성 (SSR 호환)
 * - 클라이언트 사이드에서만 동작하도록 보장
 * - Slice 패턴으로 논리적 분리
 */
export const useStore = create<StoreState>()((...a) => ({
  ...createSoccerSlice(...a),
  ...createUISlice(...a),
  ...createUserSlice(...a),
}));

