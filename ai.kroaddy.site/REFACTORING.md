# 리팩토링 가이드

## 변경 사항 요약

### 1. Feed Service 생성
- **기존**: `crawlerservice` (포트 9001)
- **신규**: `feedservice` (포트 9003)
- **변경**: crawlerservice의 모든 기능을 feedservice로 통합

### 2. RAG Service
- **위치**: `services/ragservice` (포트 9002)
- **상태**: 독립적인 MSA 서비스로 유지

### 3. Gateway Agent 모듈 추가
- **위치**: `gateway/app/agent/`
- **기능**:
  - LLM API 통신 (OpenAI, Anthropic)
  - SLLM 로컬 DB 관리 (SQLite)

## 새로운 구조

```
ai.kroaddy.site/
├── gateway/                    # Gateway 서비스 (포트 9000)
│   ├── app/
│   │   ├── main.py            # 메인 애플리케이션
│   │   └── agent/             # Agent 모듈 (내부)
│   │       ├── llm_api.py     # LLM API 통신
│   │       ├── sllm_db.py     # SLLM 로컬 DB
│   │       └── main.py        # Agent API
│   └── requirements.txt
└── services/
    ├── feedservice/           # Feed 서비스 (포트 9003) - 신규
    │   ├── app/
    │   │   ├── main.py
    │   │   ├── bs_demo/       # crawlerservice에서 이동
    │   │   └── sel_demo/      # crawlerservice에서 이동
    │   └── Dockerfile
    └── ragservice/            # RAG 서비스 (포트 9002)
        └── ...
```

## 서비스 포트

- **Gateway**: 9000
- **Feed Service**: 9003
- **RAG Service**: 9002
- **POI Recommend Service**: (기존 유지)

## Gateway 라우팅

- `/feed/*` → Feed Service (포트 9003)
- `/rag/*` → RAG Service (포트 9002)
- `/agent/*` → Gateway 내부 Agent 모듈

## 마이그레이션 가이드

### 1. 기존 crawlerservice 사용 중인 경우

**변경 전:**
```bash
GET http://gateway:9000/crawler/bugsmusic
```

**변경 후:**
```bash
GET http://gateway:9000/feed/bugsmusic
```

### 2. Docker Compose 업데이트

기존 `crawlerservice`를 `feedservice`로 변경:

```yaml
services:
  feedservice:  # crawlerservice → feedservice
    build: ./services/feedservice
    ports:
      - "9003:9003"
    # ...
```

## 주의사항

1. **crawlerservice는 더 이상 사용하지 않습니다**
   - 모든 기능이 feedservice로 이동했습니다
   - 기존 crawlerservice는 제거하거나 보관용으로만 유지

2. **Agent 모듈은 Gateway 내부 서비스입니다**
   - 별도의 컨테이너가 아닙니다
   - Gateway와 함께 실행됩니다

3. **포트 변경**
   - Feed Service: 9001 → 9003
   - Gateway는 프록시를 통해 접근하므로 클라이언트는 변경 없음

