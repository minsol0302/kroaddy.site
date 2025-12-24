# Zustand Store 리팩토링 전략

## 1. 변경 사항 요약

### 현재 구조
- Context Provider를 통한 단일 store 인스턴스 보장
- 하나의 큰 store에 모든 상태 포함
- 복잡한 Context 관리

### 변경할 구조
- **Provider 제거**: Context 없이 직접 store 사용
- **슬라이스 패턴**: 기능별로 슬라이스 분리
- **단순 create store**: 직접 `create()`로 store 생성

---

## 2. 변경의 장단점 분석

### 장점

#### 2.1 Provider 제거의 장점
- **간단함**: Context Provider 설정 불필요
- **성능**: Context 래퍼 제거로 약간의 성능 향상
- **직관적**: store를 직접 import하여 사용
- **Zustand 권장 방식**: Zustand는 Provider 없이도 잘 작동

#### 2.2 슬라이스 패턴의 장점
- **모듈화**: 기능별로 코드 분리
- **유지보수성**: 각 슬라이스가 독립적으로 관리됨
- **확장성**: 새로운 기능 추가 시 새 슬라이스만 추가
- **가독성**: 코드 구조가 명확해짐

#### 2.3 단순 create store의 장점
- **간결함**: 불필요한 추상화 제거
- **표준 패턴**: Zustand의 표준 사용 방식
- **디버깅 용이**: 구조가 단순하여 디버깅이 쉬움

### 단점 및 고려사항

#### 2.1 Provider 제거의 단점
- **테스트 어려움**: Provider를 통한 store 교체가 어려움
- **SSR 고려**: Next.js SSR에서 store 인스턴스 관리 필요 (하지만 Zustand는 이를 잘 처리함)

#### 2.2 슬라이스 패턴의 단점
- **초기 복잡도**: 처음 설정 시 약간의 복잡도 증가
- **타입 관리**: 슬라이스 타입을 조합해야 함

---

## 3. 새로운 구조 설계

### 3.1 디렉토리 구조

```
frontend/
├── lib/
│   └── store/
│       ├── index.ts              # Store 조합 및 export
│       ├── types.ts              # 공통 타입 정의
│       └── slices/
│           ├── uiSlice.ts        # UI 상태 슬라이스
│           ├── playerSlice.ts    # Player 상태 슬라이스
│           ├── teamSlice.ts      # Team 상태 슬라이스
│           └── messageSlice.ts   # Message 상태 슬라이스
```

### 3.2 슬라이스 구조 예시

```typescript
// lib/store/slices/uiSlice.ts
import { StateCreator } from 'zustand';

export interface UISlice {
  ui: {
    isLoading: boolean;
    error: string | null;
    theme: 'light' | 'dark';
  };
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  ui: {
    isLoading: false,
    error: null,
    theme: 'light',
  },
  setLoading: (loading) =>
    set((state) => ({
      ui: { ...state.ui, isLoading: loading },
    })),
  setError: (error) =>
    set((state) => ({
      ui: { ...state.ui, error },
    })),
  setTheme: (theme) =>
    set((state) => ({
      ui: { ...state.ui, theme },
    })),
});
```

### 3.3 Store 조합

```typescript
// lib/store/index.ts
import { create } from 'zustand';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createPlayerSlice, PlayerSlice } from './slices/playerSlice';
import { createTeamSlice, TeamSlice } from './slices/teamSlice';
import { createMessageSlice, MessageSlice } from './slices/messageSlice';

// 전체 Store 타입
export type AppStore = UISlice & PlayerSlice & TeamSlice & MessageSlice;

// Store 생성
export const useAppStore = create<AppStore>()((...a) => ({
  ...createUISlice(...a),
  ...createPlayerSlice(...a),
  ...createTeamSlice(...a),
  ...createMessageSlice(...a),
}));
```

### 3.4 사용 방법

```typescript
// 컴포넌트에서 사용
import { useAppStore } from '@/lib/store';

function MyComponent() {
  // 전체 store 사용
  const isLoading = useAppStore((state) => state.ui.isLoading);
  const setLoading = useAppStore((state) => state.setLoading);
  
  // 또는 선택적 구독
  const { isLoading, setLoading } = useAppStore((state) => ({
    isLoading: state.ui.isLoading,
    setLoading: state.setLoading,
  }));
}
```

---

## 4. 마이그레이션 전략

### 4.1 단계별 마이그레이션

1. **슬라이스 생성**
   - `lib/store/slices/` 디렉토리 생성
   - 각 기능별로 슬라이스 파일 생성
   - 기존 store 로직을 슬라이스로 분리

2. **Store 조합**
   - `lib/store/index.ts`에서 슬라이스들을 조합
   - `create()`로 단순하게 store 생성
   - 타입 정의

3. **Provider 제거**
   - `app/layout.tsx`에서 `StoreProvider` 제거
   - 컴포넌트에서 직접 `useAppStore` 사용

4. **편의 훅 업데이트 (선택사항)**
   - 기존 편의 훅들을 새로운 store 구조에 맞게 수정
   - 또는 제거하고 직접 `useAppStore` 사용

### 4.2 호환성 유지

기존 코드와의 호환성을 위해 편의 훅을 유지할 수 있습니다:

```typescript
// lib/store/index.ts
export const useUI = () => {
  const isLoading = useAppStore((state) => state.ui.isLoading);
  const error = useAppStore((state) => state.ui.error);
  const theme = useAppStore((state) => state.ui.theme);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);
  const setTheme = useAppStore((state) => state.setTheme);
  
  return { isLoading, error, theme, setLoading, setError, setTheme };
};
```

---

## 5. 장점 요약

### 5.1 코드 간결성
- Provider 래퍼 제거로 코드가 더 간결해짐
- Context 관리 로직 제거

### 5.2 모듈화
- 슬라이스별로 독립적인 파일 관리
- 기능 추가/수정이 용이

### 5.3 표준 패턴
- Zustand의 표준 사용 방식
- 커뮤니티에서 널리 사용되는 패턴

### 5.4 성능
- Context 래퍼 제거로 약간의 성능 향상
- 불필요한 리렌더링 감소

---

## 6. 주의사항

### 6.1 SSR (Server-Side Rendering)
- Next.js SSR에서 Zustand는 기본적으로 잘 작동함
- 하지만 서버와 클라이언트에서 다른 인스턴스를 사용할 수 있음
- 필요시 `useStore`를 통해 안전하게 사용

### 6.2 테스트
- Provider 없이 테스트 시 store를 직접 모킹해야 함
- 하지만 Zustand는 테스트가 용이함

### 6.3 타입 안전성
- 슬라이스 타입을 조합할 때 타입 안전성 유지 필요
- `StateCreator` 타입 사용 권장

---

## 7. 결론

**변경이 적절합니다!**

이유:
1. ✅ **Zustand 권장 방식**: Provider 없이 사용하는 것이 Zustand의 표준
2. ✅ **코드 간결성**: 불필요한 추상화 제거
3. ✅ **모듈화**: 슬라이스 패턴으로 유지보수성 향상
4. ✅ **성능**: Context 래퍼 제거로 약간의 성능 향상
5. ✅ **확장성**: 새로운 기능 추가가 용이

**권장 사항:**
- 슬라이스 패턴으로 기능별 분리
- `StateCreator` 타입 사용으로 타입 안전성 보장
- 기존 편의 훅은 선택적으로 유지 (호환성)
- Provider 완전 제거

---

## 8. 체크리스트

변경 시 확인 사항:
- [ ] 슬라이스 파일 생성 (uiSlice, playerSlice, teamSlice, messageSlice)
- [ ] Store 조합 로직 구현
- [ ] `app/layout.tsx`에서 Provider 제거
- [ ] 컴포넌트에서 `useAppStore` 직접 사용
- [ ] 편의 훅 업데이트 또는 제거 결정
- [ ] 타입 에러 확인
- [ ] 빌드 및 테스트

