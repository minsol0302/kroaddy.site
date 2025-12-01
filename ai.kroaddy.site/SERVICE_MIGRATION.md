# 서비스 마이그레이션 안내

## 현재 상황

### 이동된 서비스
- ✅ `ai.kroaddy.site/services/feedservice` → `feed.kroaddy.site` (루트)
- ✅ `ai.kroaddy.site/services/ragservice` → `rag.kroaddy.site` (루트)

### Gateway 설정
현재 Gateway는 다음 URL로 프록시하도록 설정되어 있습니다:
- `http://feedservice:9003` (Docker 네트워크 내)
- `http://ragservice:9002` (Docker 네트워크 내)

## 삭제 가능 여부

### ✅ 삭제 가능
`ai.kroaddy.site/services/feedservice`와 `ai.kroaddy.site/services/ragservice`는 **삭제해도 됩니다**.

이유:
1. 이미 `feed.kroaddy.site`와 `rag.kroaddy.site`로 완전히 이동했습니다
2. Docker Compose에 feedservice와 ragservice가 정의되어 있지 않습니다
3. Gateway의 프록시 URL은 나중에 업데이트할 수 있습니다

### ⚠️ 주의사항

**Gateway 프록시 URL 업데이트 필요**

현재 Gateway는 Docker 네트워크 내의 서비스명을 참조하고 있지만, 
실제 서비스는 루트의 독립적인 폴더에 있습니다.

**옵션 1: Docker Compose에 추가 (권장)**
```yaml
services:
  feedservice:
    build: ../feed.kroaddy.site
    ports:
      - "9003:9003"
    container_name: feedservice

  ragservice:
    build: ../rag.kroaddy.site
    ports:
      - "9002:9002"
    container_name: ragservice
```

**옵션 2: Gateway URL 변경**
- `http://feedservice:9003` → `http://localhost:9003` (독립 실행 시)
- `http://ragservice:9002` → `http://localhost:9002` (독립 실행 시)

## 삭제 후 작업

1. Gateway의 프록시 URL 업데이트
2. Docker Compose에 서비스 추가 (Docker 사용 시)
3. 테스트하여 정상 작동 확인

