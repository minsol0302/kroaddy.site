# Docker 빌드 문제 해결

## 문제
```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json
```

## 원인
- `package.json`에 새로운 의존성이 추가되었지만 `pnpm-lock.yaml`이 업데이트되지 않음
- kroaddy 통합 과정에서 많은 Radix UI 패키지가 추가됨

## 해결
✅ `pnpm install` 실행 완료 - lockfile 업데이트됨

## 다음 단계
이제 Docker 빌드를 다시 실행하세요:

```powershell
docker compose up --build
```

또는 frontend만 빌드:

```powershell
docker compose up --build frontend
```

## 참고
- `--frozen-lockfile` 플래그는 lockfile과 package.json이 정확히 일치할 때만 작동
- 개발 중에는 `pnpm install`로 lockfile을 업데이트한 후 커밋해야 함

