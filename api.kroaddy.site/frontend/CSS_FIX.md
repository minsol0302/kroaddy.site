# CSS 빌드 오류 해결

## 문제
```
Syntax error: The `border-border` class does not exist
```

## 원인
1. `globals.css`에서 `@apply border-border` 사용했지만 Tailwind 설정에 `border` 색상이 정의되지 않음
2. Tailwind v4 문법(`@theme inline`, `@custom-variant`)을 Tailwind v3에서 사용

## 해결

### 1. `tailwind.config.ts`에 색상 추가
- `border`, `background`, `foreground` 등 모든 CSS 변수를 Tailwind 색상으로 매핑

### 2. `globals.css` 수정
- `@apply border-border` → 직접 CSS 속성 사용: `border-color: var(--border)`
- `@theme inline` 제거 (Tailwind v4 전용)
- `@custom-variant` 제거 (Tailwind v4 전용)

## 결과
✅ Tailwind v3와 호환되는 CSS로 수정 완료

