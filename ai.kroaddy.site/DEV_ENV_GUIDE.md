# 개발 환경 실행 가이드

## ✅ 개발 환경에서 실행 가능

현재 Docker Compose 설정은 **개발 환경용으로 사용 가능**합니다.

## 🚀 실행 방법

```bash
cd ai.kroaddy.site
docker compose up
```

또는 백그라운드 실행:

```bash
docker compose up -d
```

## ⚠️ 개발 환경 주의사항

### 1. 로컬 네트워크에서만 접근
- 외부 인터넷에 노출하지 마세요
- 방화벽 설정 확인
- 공용 Wi-Fi에서는 사용 주의

### 2. 환경 변수 설정
개발 환경에서 필요한 환경 변수는 각 서비스 폴더의 `.env` 파일에 설정하세요:

**RAG Service** (`rag.kroaddy.site/.env`):
```env
OPENAI_API_KEY=your_key_here
HUGGINGFACE_API_KEY=your_key_here
```

**Agent Service** (`ai.kroaddy.site/gateway/.env`):
```env
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

### 3. .env 파일 보안
- `.env` 파일은 절대 Git에 커밋하지 마세요
- `.gitignore`에 추가되어 있는지 확인

### 4. 포트 충돌 확인
다음 포트들이 사용 중인지 확인:
- `9000` - Gateway
- `9001` - Crawler Service
- `9002` - RAG Service
- `9003` - Feed Service
- `8003` - POI Recommend Service

### 5. 데이터 영속성
- `rag.kroaddy.site/vector_db` - 벡터 데이터베이스
- `rag.kroaddy.site/data` - 문서 데이터
- 이 폴더들은 컨테이너 재시작 후에도 유지됩니다

## 🔧 문제 해결

### 포트가 이미 사용 중인 경우
```bash
# Windows PowerShell
netstat -ano | findstr :9000
# 사용 중인 프로세스 종료 후 재시작
```

### 컨테이너 재빌드가 필요한 경우
```bash
docker compose up --build
```

### 로그 확인
```bash
docker compose logs -f
# 특정 서비스만
docker compose logs -f gateway
docker compose logs -f feedservice
docker compose logs -f ragservice
```

### 컨테이너 중지 및 삭제
```bash
docker compose down
# 볼륨까지 삭제하려면
docker compose down -v
```

## 📋 서비스 접근 URL

- **Gateway**: http://localhost:9000
- **Feed Service** (직접 접근): http://localhost:9003
- **RAG Service** (직접 접근): http://localhost:9002
- **Crawler Service**: http://localhost:9001
- **POI Recommend Service**: http://localhost:8003

## 🔗 Gateway 프록시 경로

- `/feed/*` → Feed Service
- `/rag/*` → RAG Service
- `/agent/*` → Agent Service (Gateway 내부)

## ⚡ 빠른 시작

1. 환경 변수 설정 (필요한 경우)
2. `cd ai.kroaddy.site`
3. `docker compose up`
4. http://localhost:9000 접속

## 🛑 프로덕션 배포 전 필수 사항

개발 환경에서 테스트 후 프로덕션 배포 시에는 반드시:
- `SECURITY_ANALYSIS.md`의 개선 사항 적용
- CORS 설정 제한
- 인증/인가 미들웨어 추가
- HTTPS 설정
- Rate Limiting 구현

