# Docker 통합 실행 보안 분석

## 🔴 발견된 보안 문제점

### 1. **CORS 설정 과도하게 개방**
**위험도: 높음**

```python
# 모든 서비스에서 발견
allow_origins=["*"]  # 모든 origin 허용
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]
```

**문제점:**
- 모든 도메인에서 API 접근 가능
- CSRF 공격 위험
- 자격 증명 탈취 위험

**영향받는 서비스:**
- Gateway (`ai.kroaddy.site/gateway/app/main.py`)
- Feed Service (`feed.kroaddy.site/app/main.py`)
- RAG Service (`rag.kroaddy.site/app/main.py`)

---

### 2. **네트워크 격리 부재**
**위험도: 중간**

**현재 상태:**
- Docker Compose에 네트워크 설정 없음
- 모든 서비스가 기본 bridge 네트워크에서 실행
- 서비스 간 통신이 완전히 격리되지 않음

**문제점:**
- 불필요한 서비스 간 통신 가능
- 네트워크 트래픽 모니터링 어려움

---

### 3. **포트 직접 노출**
**위험도: 중간**

**현재 노출된 포트:**
- Gateway: `9000`
- Feed Service: `9003`
- RAG Service: `9002`
- Crawler Service: `9001`
- POI Recommend Service: `8003`

**문제점:**
- 모든 서비스가 호스트에 직접 노출
- Gateway를 통하지 않고 직접 접근 가능
- 방화벽 규칙 없음

---

### 4. **인증/인가 미들웨어 부재**
**위험도: 높음**

**현재 상태:**
- Gateway에 인증 체크 없음
- 모든 엔드포인트가 공개적으로 접근 가능
- Rate limiting 없음

**문제점:**
- 무제한 API 호출 가능
- DDoS 공격 취약
- 민감한 데이터 접근 가능

---

### 5. **환경 변수 관리 미흡**
**위험도: 중간**

**현재 상태:**
- `.env` 파일 사용하지만 docker-compose에 명시되지 않음
- API 키들이 환경 변수로 관리되지만 컨테이너에 전달되지 않음

**영향받는 서비스:**
- RAG Service: `OPENAI_API_KEY`, `HUGGINGFACE_API_KEY`
- Agent Service: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`

**문제점:**
- 환경 변수가 컨테이너에 전달되지 않으면 서비스 실패
- `.env` 파일이 Git에 커밋될 위험

---

### 6. **볼륨 마운트 보안**
**위험도: 낮음-중간**

**현재 마운트:**
```yaml
volumes:
  - ../rag.kroaddy.site/vector_db:/app/vector_db
  - ../rag.kroaddy.site/data:/app/data
  - ./services/poirecommendservice/app:/app/app
```

**문제점:**
- 호스트 파일 시스템에 직접 접근
- 파일 권한 관리 필요
- 데이터 유출 위험

---

## ✅ 보안 개선 방안

### 1. CORS 설정 제한

**개선안:**
```python
# 프로덕션 환경
allowed_origins = [
    "https://www.kroaddy.site",
    "https://api.kroaddy.site"
]

# 개발 환경
if os.getenv("ENV") == "development":
    allowed_origins = ["http://localhost:3000", "http://localhost:3001"]
```

---

### 2. 네트워크 격리 추가

**개선안:**
```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # 외부 접근 차단

services:
  gateway:
    networks:
      - frontend
      - backend
  
  feedservice:
    networks:
      - backend  # 내부 네트워크만
  
  ragservice:
    networks:
      - backend  # 내부 네트워크만
```

---

### 3. 포트 노출 최소화

**개선안:**
```yaml
services:
  gateway:
    ports:
      - "9000:9000"  # Gateway만 노출
  
  feedservice:
    # ports 제거 - Gateway를 통해서만 접근
    expose:
      - "9003"  # 내부 네트워크에서만 접근 가능
  
  ragservice:
    # ports 제거
    expose:
      - "9002"
```

---

### 4. 인증/인가 미들웨어 추가

**개선안:**
```python
# Gateway에 인증 미들웨어 추가
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(token: str = Depends(security)):
    # JWT 토큰 검증
    # Rate limiting
    pass
```

---

### 5. 환경 변수 관리 개선

**개선안:**
```yaml
services:
  ragservice:
    env_file:
      - ../rag.kroaddy.site/.env
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - HUGGINGFACE_API_KEY=${HUGGINGFACE_API_KEY}
    secrets:
      - openai_api_key
      - huggingface_api_key

secrets:
  openai_api_key:
    file: ./secrets/openai_api_key.txt
  huggingface_api_key:
    file: ./secrets/huggingface_api_key.txt
```

---

### 6. Rate Limiting 추가

**개선안:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/")
@limiter.limit("10/minute")
async def root():
    pass
```

---

## 🎯 권장 실행 전략

### 개발 환경
- ✅ 현재 설정으로 실행 가능 (주의 필요)
- ⚠️ CORS는 개발용으로만 허용
- ⚠️ 로컬 네트워크에서만 접근

### 프로덕션 환경
- ❌ 현재 설정으로는 **실행하지 않는 것을 강력 권장**
- ✅ 위 개선 사항 모두 적용 필수
- ✅ HTTPS 필수
- ✅ 방화벽 규칙 설정
- ✅ 모니터링 및 로깅 추가

---

## 📋 보안 체크리스트

- [ ] CORS 설정 제한
- [ ] 네트워크 격리 설정
- [ ] 포트 노출 최소화
- [ ] 인증/인가 미들웨어 추가
- [ ] 환경 변수 안전 관리
- [ ] Rate Limiting 구현
- [ ] HTTPS 설정
- [ ] 로깅 및 모니터링
- [ ] 정기 보안 업데이트

---

## 🔐 즉시 조치 사항

1. **CORS 설정 변경** (최우선)
2. **환경 변수 docker-compose에 추가**
3. **불필요한 포트 노출 제거**
4. **.env 파일 .gitignore 확인**

