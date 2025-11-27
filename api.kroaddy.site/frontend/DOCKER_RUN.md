# Docker로 Frontend 실행 가이드

## ✅ 현재 설정 상태

현재 Dockerfile은 **프로덕션 모드**로 빌드하고 실행하도록 설정되어 있습니다.

### 실행 방법

```powershell
# 프로젝트 루트에서
docker compose up --build
```

이 명령어만으로:
1. ✅ 모든 서비스 빌드 (frontend 포함)
2. ✅ Next.js 프로덕션 빌드 (`pnpm build`)
3. ✅ 프로덕션 서버 실행 (`node server.js`)
4. ✅ `http://localhost:3000`에서 접속 가능

### 개발 모드 vs 프로덕션 모드

| 모드 | 명령어 | 특징 |
|------|--------|------|
| **개발 모드** | `pnpm dev` | Hot reload, 빠른 재시작, 디버깅 용이 |
| **프로덕션 모드** | `docker compose up` | 최적화된 빌드, 빠른 실행, 프로덕션 환경 |

## 🚀 Docker 실행 (권장)

```powershell
# 전체 서비스 실행
docker compose up --build

# Frontend만 실행 (다른 서비스는 이미 실행 중일 때)
docker compose up --build frontend

# 백그라운드 실행
docker compose up -d --build
```

## 📝 로컬 개발 모드 (선택사항)

개발 중에 Hot reload가 필요하면:

```powershell
cd frontend
pnpm dev
```

## ⚠️ 주의사항

1. **포트 충돌**: 로컬에서 `pnpm dev`가 실행 중이면 Docker와 포트 3000 충돌
2. **빌드 시간**: 첫 빌드는 시간이 걸릴 수 있음
3. **환경 변수**: Docker에서는 `API_BASE_URL=http://discovery:8080` 사용

## 🔍 문제 해결

### 빌드 실패 시
```powershell
docker compose build --no-cache frontend
docker compose up frontend
```

### 로그 확인
```powershell
docker compose logs -f frontend
```

### 컨테이너 재시작
```powershell
docker compose restart frontend
```

