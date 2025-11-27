# ESLint 오류 수정 완료

## ✅ 수정된 파일

### 1. `src/components/Chatbot.tsx`
- **문제**: 46번째 줄에서 `you're`의 `'` 문자가 이스케이프되지 않음
- **수정**: `you're` → `you&apos;re`

### 2. `src/components/PlacePopup.tsx`
- **문제**: 69번째 줄에서 `"Palace Greatly Blessed by Heaven"`의 `"` 문자가 이스케이프되지 않음
- **수정**: `"` → `&quot;`

## 📝 참고

- ESLint의 `react/no-unescaped-entities` 규칙은 JSX에서 특수 문자를 HTML 엔티티로 변환하도록 요구합니다.
- 프로덕션 빌드에서는 이 오류가 빌드를 막습니다.
- 개발 모드에서는 경고로만 표시됩니다.

## 🚀 다음 단계

이제 Docker 빌드를 다시 실행하세요:

```powershell
docker compose up --build
```

빌드가 성공적으로 완료될 것입니다!

