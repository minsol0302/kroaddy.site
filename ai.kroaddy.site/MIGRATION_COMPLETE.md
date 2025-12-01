# 마이그레이션 완료

## ✅ 완료된 작업

### 1. Gateway 설정 업데이트
- ✅ 환경 변수로 서비스 URL 설정 (유연한 구성)
- ✅ `FEED_SERVICE_URL`: `http://feedservice:9003` (기본값)
- ✅ `RAG_SERVICE_URL`: `http://ragservice:9002` (기본값)

### 2. Docker Compose 업데이트
- ✅ `feedservice` 서비스 추가 (포트 9003)
- ✅ `ragservice` 서비스 추가 (포트 9002)
- ✅ Gateway에 `depends_on` 추가

### 3. 기존 서비스 삭제
- ✅ `ai.kroaddy.site/services/feedservice` 삭제
- ✅ `ai.kroaddy.site/services/ragservice` 삭제

## 📁 새로운 구조

```
프로젝트 루트/
├── feed.kroaddy.site/        # Feed 서비스 (포트 9003)
│   ├── app/
│   ├── Dockerfile
│   └── requirements.txt
├── rag.kroaddy.site/         # RAG 서비스 (포트 9002)
│   ├── app/
│   ├── Dockerfile
│   └── requirements.txt
└── ai.kroaddy.site/
    ├── gateway/              # Gateway (포트 9000)
    │   └── app/
    │       ├── main.py       # 프록시 설정
    │       └── agent/       # Agent 모듈
    └── services/
        ├── crawlerservice/   # (기존 유지)
        ├── poirecommendservice/
        └── chatbotservice/
```

## 🚀 실행 방법

### Docker Compose 사용
```bash
cd ai.kroaddy.site
docker-compose up -d
```

### 독립 실행
```bash
# Feed Service
cd feed.kroaddy.site
uvicorn app.main:app --host 0.0.0.0 --port 9003

# RAG Service
cd rag.kroaddy.site
uvicorn app.main:app --host 0.0.0.0 --port 9002

# Gateway (환경 변수 설정)
cd ai.kroaddy.site/gateway
$env:FEED_SERVICE_URL="http://localhost:9003"
$env:RAG_SERVICE_URL="http://localhost:9002"
uvicorn app.main:app --host 0.0.0.0 --port 9000
```

## 🔗 Gateway 프록시 경로

- `/feed/*` → Feed Service (포트 9003)
- `/rag/*` → RAG Service (포트 9002)
- `/agent/*` → Gateway 내부 Agent 모듈

## ✅ 검증

마이그레이션이 완료되었습니다. 다음을 확인하세요:

1. ✅ feed.kroaddy.site 폴더에 모든 파일 존재
2. ✅ rag.kroaddy.site 폴더에 모든 파일 존재
3. ✅ Gateway 설정 업데이트 완료
4. ✅ Docker Compose 업데이트 완료
5. ✅ 기존 services 폴더의 중복 서비스 삭제 완료

