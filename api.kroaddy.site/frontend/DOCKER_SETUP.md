# Docker Compose로 Frontend 실행 가이드

## ✅ 현재 설정 상태

### docker-compose.yaml
- ✅ frontend 서비스가 이미 설정되어 있음
- ✅ 포트 매핑: `3000:3000`
- ✅ 네트워크: `spring-network`에 연결
- ✅ API_BASE_URL: `http://discovery:8080`
- ✅ depends_on: `discovery` 서비스

### Dockerfile
- ✅ Multi-stage build (deps → builder → runner)
- ✅ standalone 모드 사용
- ✅ pnpm 사용
- ✅ 프로덕션 최적화

### next.config.mjs
- ✅ `output: 'standalone'` 설정됨

## 🚀 실행 방법

### 전체 서비스 실행
```powershell
docker compose up --build
```

### Frontend만 실행 (다른 서비스는 이미 실행 중일 때)
```powershell
docker compose up --build frontend
```

### 백그라운드 실행
```powershell
docker compose up -d --build
```

## ⚠️ 주의사항

1. **프로덕션 모드**: 현재 Dockerfile은 프로덕션 모드로 빌드합니다.
   - Hot reload 없음
   - 최적화된 빌드
   - 빠른 실행 속도

2. **개발 모드가 필요하면**:
   - `pnpm dev`를 로컬에서 실행
   - 또는 docker-compose에 dev 서비스 추가

3. **빌드 시간**: 첫 빌드는 시간이 걸릴 수 있습니다.
   - 의존성 설치
   - Next.js 빌드
   - 이미지 생성

4. **포트 충돌**: 
   - 로컬에서 `pnpm dev`가 실행 중이면 포트 3000 충돌 가능
   - `docker compose down`으로 기존 컨테이너 정리

## 🔍 문제 해결

### 빌드 실패 시
```powershell
# 캐시 없이 재빌드
docker compose build --no-cache frontend
docker compose up frontend
```

### 로그 확인
```powershell
docker compose logs frontend
docker compose logs -f frontend  # 실시간 로그
```

### 컨테이너 재시작
```powershell
docker compose restart frontend
```

## 📝 확인 사항

- ✅ src/app 구조 인식 (Next.js 자동 인식)
- ✅ Tailwind CSS 설정 (tailwind.config.ts)
- ✅ TypeScript 설정 (tsconfig.json)
- ✅ 환경 변수 설정 (API_BASE_URL)

