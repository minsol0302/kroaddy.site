# Zustand Store 전략 문서

## 1. 개요

이 문서는 frontend 프로젝트에서 Zustand를 사용하여 **단일 store**를 Context로 관리하는 전략을 설명합니다.

### 목표
- Zustand를 사용한 전역 상태 관리
- Context Provider를 통한 단일 store 인스턴스 보장
- 타입 안전성 보장
- 확장 가능한 구조 설계

---

## 2. 아키텍처 설계

### 2.1 디렉토리 구조

```
frontend/
├── lib/
│   ├── store/
│   │   ├── index.ts              # Store 생성 및 Context Provider
│   │   ├── types.ts              # Store 타입 정의
│   │   └── slices/               # 기능별 슬라이스 (선택사항)
│   │       ├── playerSlice.ts
│   │       ├── teamSlice.ts
│   │       └── uiSlice.ts
│   └── api.ts                    # 기존 API 클라이언트
├── app/
│   ├── layout.tsx                # StoreProvider 추가
│   └── page.tsx
└── package.json
```

### 2.2 Store 구조

**단일 Store 패턴:**
- 하나의 Zustand store에 모든 상태를 포함
- 기능별로 슬라이스(slice)로 분리하여 관리 (선택사항)
- Context Provider로 store 인스턴스를 제공하여 싱글톤 보장

---

## 3. 구현 단계

### 3.1 의존성 설치

```bash
npm install zustand
```

### 3.2 타입 정의 (`lib/store/types.ts`)

```typescript
// 애플리케이션 전체 상태 타입 정의
export interface AppState {
  // UI 상태
  ui: {
    isLoading: boolean;
    error: string | null;
    theme: 'light' | 'dark';
  };
  
  // Player 상태
  players: {
    data: any[];
    selectedPlayer: any | null;
    searchKeyword: string;
  };
  
  // Team 상태
  teams: {
    data: any[];
    selectedTeam: any | null;
  };
  
  // Message 상태 (현재 page.tsx에서 사용 중)
  messages: {
    data: Message[];
    isLoading: boolean;
  };
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Actions 타입
export interface AppActions {
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Player Actions
  setPlayers: (players: any[]) => void;
  setSelectedPlayer: (player: any | null) => void;
  setSearchKeyword: (keyword: string) => void;
  fetchPlayers: (keyword?: string) => Promise<void>;
  
  // Team Actions
  setTeams: (teams: any[]) => void;
  setSelectedTeam: (team: any | null) => void;
  fetchTeams: () => Promise<void>;
  
  // Message Actions
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  sendMessage: (content: string) => Promise<void>;
}

// Store 타입 = State + Actions
export type AppStore = AppState & AppActions;
```

### 3.3 Store 생성 (`lib/store/index.ts`)

```typescript
'use client';

import { create } from 'zustand';
import { createContext, useContext, useRef, ReactNode } from 'react';
import { AppStore } from './types';
import { soccerApi } from '../api';

// 초기 상태
const initialState: AppStore = {
  // UI
  ui: {
    isLoading: false,
    error: null,
    theme: 'light',
  },
  
  // Players
  players: {
    data: [],
    selectedPlayer: null,
    searchKeyword: '',
  },
  
  // Teams
  teams: {
    data: [],
    selectedTeam: null,
  },
  
  // Messages
  messages: {
    data: [
      {
        id: "1",
        role: "assistant",
        content: "축구 선수 정보를 검색할 수 있습니다.",
        timestamp: new Date(),
      },
    ],
    isLoading: false,
  },
  
  // Actions
  setLoading: () => {},
  setError: () => {},
  setTheme: () => {},
  setPlayers: () => {},
  setSelectedPlayer: () => {},
  setSearchKeyword: () => {},
  fetchPlayers: async () => {},
  setTeams: () => {},
  setSelectedTeam: () => {},
  fetchTeams: async () => {},
  addMessage: () => {},
  setMessages: () => {},
  clearMessages: () => {},
  sendMessage: async () => {},
};

// Zustand Store 생성 함수
function createAppStore() {
  return create<AppStore>((set, get) => ({
    ...initialState,
    
    // UI Actions
    setLoading: (loading: boolean) =>
      set((state) => ({
        ui: { ...state.ui, isLoading: loading },
      })),
    
    setError: (error: string | null) =>
      set((state) => ({
        ui: { ...state.ui, error },
      })),
    
    setTheme: (theme: 'light' | 'dark') =>
      set((state) => ({
        ui: { ...state.ui, theme },
      })),
    
    // Player Actions
    setPlayers: (players: any[]) =>
      set((state) => ({
        players: { ...state.players, data: players },
      })),
    
    setSelectedPlayer: (player: any | null) =>
      set((state) => ({
        players: { ...state.players, selectedPlayer: player },
      })),
    
    setSearchKeyword: (keyword: string) =>
      set((state) => ({
        players: { ...state.players, searchKeyword: keyword },
      })),
    
    fetchPlayers: async (keyword?: string) => {
      set((state) => ({
        ui: { ...state.ui, isLoading: true, error: null },
        players: { ...state.players, searchKeyword: keyword || '' },
      }));
      
      try {
        const response = await soccerApi.getPlayers(keyword);
        const players = response.data?.message || [];
        
        set((state) => ({
          players: { ...state.players, data: players },
          ui: { ...state.ui, isLoading: false },
        }));
      } catch (error: any) {
        const errorMessage = error?.response
          ? `상태 코드: ${error.response.status}, 메시지: ${error.response.statusText}`
          : error?.message || '알 수 없는 오류';
        
        set((state) => ({
          ui: { ...state.ui, isLoading: false, error: errorMessage },
        }));
      }
    },
    
    // Team Actions
    setTeams: (teams: any[]) =>
      set((state) => ({
        teams: { ...state.teams, data: teams },
      })),
    
    setSelectedTeam: (team: any | null) =>
      set((state) => ({
        teams: { ...state.teams, selectedTeam: team },
      })),
    
    fetchTeams: async () => {
      set((state) => ({
        ui: { ...state.ui, isLoading: true, error: null },
      }));
      
      try {
        const response = await soccerApi.getTeams();
        const teams = response.data || [];
        
        set((state) => ({
          teams: { ...state.teams, data: teams },
          ui: { ...state.ui, isLoading: false },
        }));
      } catch (error: any) {
        const errorMessage = error?.response
          ? `상태 코드: ${error.response.status}, 메시지: ${error.response.statusText}`
          : error?.message || '알 수 없는 오류';
        
        set((state) => ({
          ui: { ...state.ui, isLoading: false, error: errorMessage },
        }));
      }
    },
    
    // Message Actions
    addMessage: (message: Message) =>
      set((state) => ({
        messages: {
          ...state.messages,
          data: [...state.messages.data, message],
        },
      })),
    
    setMessages: (messages: Message[]) =>
      set((state) => ({
        messages: { ...state.messages, data: messages },
      })),
    
    clearMessages: () =>
      set((state) => ({
        messages: { ...state.messages, data: [] },
      })),
    
    sendMessage: async (content: string) => {
      const { addMessage, setLoading } = get();
      
      // 사용자 메시지 추가
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      addMessage(userMessage);
      
      setLoading(true);
      
      try {
        const response = await soccerApi.getPlayers(content);
        const responseData = response.data?.message || 
          JSON.stringify(response.data, null, 2) || 
          '선수 데이터를 가져왔습니다.';
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `[검색 키워드: ${content}]\n\n${responseData}`,
          timestamp: new Date(),
        };
        addMessage(assistantMessage);
      } catch (error: any) {
        const errorDetails = error?.response
          ? `상태 코드: ${error.response.status}, 메시지: ${error.response.statusText}`
          : error?.message || '알 수 없는 오류';
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `서버 연결 오류: ${errorDetails}\n\n요청 URL: ${error?.config?.url || 'N/A'}\nBase URL: ${error?.config?.baseURL || 'N/A'}`,
          timestamp: new Date(),
        };
        addMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  }));
}

// Context 생성
type StoreContextType = ReturnType<typeof createAppStore>;

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// StoreProvider 컴포넌트
export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<StoreContextType>();
  
  // 단일 store 인스턴스 보장
  if (!storeRef.current) {
    storeRef.current = createAppStore();
  }
  
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

// useStore 훅
export function useStore() {
  const store = useContext(StoreContext);
  
  if (!store) {
    throw new Error('useStore must be used within StoreProvider');
  }
  
  return store;
}

// 편의 훅들 (선택사항)
export const useUI = () => {
  const store = useStore();
  return {
    isLoading: store((state) => state.ui.isLoading),
    error: store((state) => state.ui.error),
    theme: store((state) => state.ui.theme),
    setLoading: store((state) => state.setLoading),
    setError: store((state) => state.setError),
    setTheme: store((state) => state.setTheme),
  };
};

export const usePlayers = () => {
  const store = useStore();
  return {
    players: store((state) => state.players.data),
    selectedPlayer: store((state) => state.players.selectedPlayer),
    searchKeyword: store((state) => state.players.searchKeyword),
    setPlayers: store((state) => state.setPlayers),
    setSelectedPlayer: store((state) => state.setSelectedPlayer),
    setSearchKeyword: store((state) => state.setSearchKeyword),
    fetchPlayers: store((state) => state.fetchPlayers),
  };
};

export const useTeams = () => {
  const store = useStore();
  return {
    teams: store((state) => state.teams.data),
    selectedTeam: store((state) => state.teams.selectedTeam),
    setTeams: store((state) => state.setTeams),
    setSelectedTeam: store((state) => state.setSelectedTeam),
    fetchTeams: store((state) => state.fetchTeams),
  };
};

export const useMessages = () => {
  const store = useStore();
  return {
    messages: store((state) => state.messages.data),
    isLoading: store((state) => state.messages.isLoading),
    addMessage: store((state) => state.addMessage),
    setMessages: store((state) => state.setMessages),
    clearMessages: store((state) => state.clearMessages),
    sendMessage: store((state) => state.sendMessage),
  };
};
```

### 3.4 Layout에 Provider 추가 (`app/layout.tsx`)

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
```

### 3.5 page.tsx에서 Store 사용

```typescript
'use client';

import { useRef, useEffect } from "react";
import { useMessages, useUI } from "@/lib/store";

export default function Home() {
  const { messages, sendMessage } = useMessages();
  const { isLoading, setLoading } = useUI();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (input: string) => {
    if (!input.trim() || isLoading) return;

    const trimmedMessage = input.trim();

    try {
      alert(`"${trimmedMessage}" 키워드로 검색을 시작합니다.`);
    } catch (e) {
      console.error("Alert 표시 실패:", e);
    }

    await sendMessage(trimmedMessage);
  };

  // ... 나머지 UI 코드
}
```

---

## 4. 장점

### 4.1 단일 Store 패턴의 장점
- **일관성**: 하나의 store로 모든 상태 관리
- **디버깅 용이**: 모든 상태가 한 곳에 집중
- **타입 안전성**: TypeScript로 전체 상태 타입 보장
- **Context 보장**: Provider를 통한 싱글톤 인스턴스 보장

### 4.2 Zustand의 장점
- **경량**: 작은 번들 사이즈
- **간단한 API**: 학습 곡선이 낮음
- **성능**: 불필요한 리렌더링 최소화
- **React 외부 사용 가능**: 컴포넌트 외부에서도 사용 가능

---

## 5. 확장 전략

### 5.1 슬라이스 패턴 (선택사항)

큰 애플리케이션의 경우 기능별로 슬라이스를 분리할 수 있습니다:

```typescript
// lib/store/slices/playerSlice.ts
export const createPlayerSlice = (set, get) => ({
  players: {
    data: [],
    selectedPlayer: null,
    searchKeyword: '',
  },
  setPlayers: (players) => set((state) => ({
    players: { ...state.players, data: players },
  })),
  // ... 기타 player 관련 actions
});

// lib/store/index.ts에서 조합
import { createPlayerSlice } from './slices/playerSlice';
import { createTeamSlice } from './slices/teamSlice';

function createAppStore() {
  return create<AppStore>((set, get) => ({
    ...createPlayerSlice(set, get),
    ...createTeamSlice(set, get),
    // ... 기타 슬라이스
  }));
}
```

### 5.2 미들웨어 추가

필요시 미들웨어를 추가할 수 있습니다:

```typescript
import { devtools, persist } from 'zustand/middleware';

function createAppStore() {
  return create<AppStore>()(
    devtools(
      persist(
        (set, get) => ({
          // ... store 구현
        }),
        { name: 'app-store' }
      ),
      { name: 'AppStore' }
    )
  );
}
```

---

## 6. 마이그레이션 가이드

### 6.1 기존 useState 마이그레이션

1. **상태 추출**: `useState`로 관리하던 상태를 store로 이동
2. **액션 추출**: 상태 변경 로직을 store actions로 이동
3. **컴포넌트 수정**: `useState` 대신 `useStore` 훅 사용

### 6.2 예시: page.tsx 마이그레이션

**Before:**
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);
```

**After:**
```typescript
const { messages, sendMessage } = useMessages();
const { isLoading } = useUI();
```

---

## 7. 모범 사례

### 7.1 선택적 구독
- 필요한 상태만 구독하여 불필요한 리렌더링 방지
- `useStore((state) => state.ui.isLoading)` 형태로 사용

### 7.2 액션 분리
- 비동기 로직은 store actions에 포함
- 컴포넌트는 UI 로직에만 집중

### 7.3 타입 안전성
- 모든 상태와 액션에 타입 정의
- `AppStore` 타입으로 전체 store 타입 보장

---

## 8. 체크리스트

- [ ] Zustand 설치 (`npm install zustand`)
- [ ] `lib/store/types.ts` 생성 및 타입 정의
- [ ] `lib/store/index.ts` 생성 및 store 구현
- [ ] `app/layout.tsx`에 `StoreProvider` 추가
- [ ] 기존 컴포넌트에서 store 사용으로 마이그레이션
- [ ] 타입 에러 확인 및 수정
- [ ] 테스트 및 검증

---

## 9. 참고 자료

- [Zustand 공식 문서](https://zustand-demo.pmnd.rs/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Next.js App Router와 Zustand](https://github.com/pmndrs/zustand#typescript)

