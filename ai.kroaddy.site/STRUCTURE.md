# ai.kroaddy.site 프로젝트 구조

## 개요
이 프로젝트는 마이크로서비스 아키텍처를 기반으로 한 AI 서비스 플랫폼입니다. FastAPI를 사용하여 여러 서비스를 구성하고, Docker Compose로 오케스트레이션합니다.

## 프로젝트 구조

```
ai.kroaddy.site/
├── docker-compose.yaml          # 서비스 오케스트레이션 설정
├── Dockerfile                   # 루트 Dockerfile (사용 안 함)
├── requirements.txt             # 루트 requirements (사용 안 함)
├── gateway/                     # API Gateway 서비스
│   ├── app/
│   │   └── main.py             # Gateway 메인 애플리케이션
│   ├── Dockerfile              # Gateway Docker 이미지 설정
│   └── requirements.txt        # Gateway 의존성
└── services/                    # 마이크로서비스들
    ├── crawlerservice/         # 크롤링 서비스
    │   ├── app/
    │   │   ├── main.py        # Crawler 서비스 메인 애플리케이션
    │   │   ├── bs_demo/       # BeautifulSoup 기반 크롤러
    │   │   │   ├── aggregate.py      # 뉴스 통합 및 위험 분석
    │   │   │   ├── bugsmusic.py      # Bugs Music 차트 크롤링
    │   │   │   ├── daum.py           # Daum 뉴스 크롤링
    │   │   │   ├── google.py         # Google 뉴스 크롤링
    │   │   │   ├── hazard_analyzer.py # 위험도 분석
    │   │   │   └── naver.py          # Naver 뉴스 크롤링
    │   │   └── sel_demo/      # Selenium 기반 크롤러
    │   │       └── danawa.py         # 다나와 제품 크롤링
    │   ├── Dockerfile          # Crawler 서비스 Docker 이미지 설정
    │   └── requirements.txt    # Crawler 서비스 의존성
    └── chatbotservice/         # 챗봇 서비스
        ├── app/
        │   └── price_analyzer.py  # 가격 분석 모듈 (현재 비어있음)
        ├── Dockerfile          # Chatbot 서비스 Docker 이미지 설정
        └── requirements.txt    # Chatbot 서비스 의존성
```

## 서비스 상세

### 1. Gateway Service (포트: 9000)
**위치**: `gateway/app/main.py`

**역할**:
- API Gateway 역할로 모든 외부 요청의 진입점
- CORS 설정 및 요청 라우팅
- Crawler 서비스로의 프록시 역할

**주요 기능**:
- 루트 엔드포인트: `/` - 헬스체크
- Crawler 프록시: `/crawler/{path}` - 모든 HTTP 메서드를 crawlerservice로 프록시

**의존성**:
- `fastapi==0.104.1`
- `uvicorn==0.24.0`
- `httpx==0.25.0`

**실행 명령**:
```bash
uvicorn gateway.app.main:app --host 0.0.0.0 --port 9000
```

### 2. Crawler Service (포트: 9001)
**위치**: `services/crawlerservice/app/main.py`

**역할**:
- 웹 크롤링 및 데이터 수집
- 뉴스 통합 및 위험 지역 분석
- 스케줄링된 자동 크롤링

**주요 엔드포인트**:
- `GET /` - 헬스체크
- `GET /bugsmusic` - Bugs Music 실시간 차트 크롤링
- `GET /danawa` - 다나와 매트 제품 크롤링
- `GET /news?keywords=키워드1,키워드2` - 여러 뉴스 소스 통합 검색
- `GET /risk?keywords=키워드1,키워드2` - 위험 지역 분석
- `GET /hazard?keywords=키워드1,키워드2` - 위험도 상세 분석 (점수, 위치, 좌표 포함)

**크롤러 모듈**:

#### BeautifulSoup 기반 (`bs_demo/`)
- **google.py**: Google 뉴스 크롤링
- **naver.py**: Naver 뉴스 크롤링
- **daum.py**: Daum 뉴스 크롤링
- **bugsmusic.py**: Bugs Music 차트 크롤링
- **aggregate.py**: 뉴스 통합 및 위험 지역 추출
- **hazard_analyzer.py**: 기사별 위험도 점수 계산 및 위치 정보 추출

#### Selenium 기반 (`sel_demo/`)
- **danawa.py**: 다나와 제품 크롤링 (동적 콘텐츠)

**스케줄러**:
- 5분마다 자동으로 뉴스 크롤링 및 위험 지역 분석 실행
- 기본 키워드: ["시위", "폭행", "속보", "테러", "위험", "사고", "범죄"]

**의존성**:
- `fastapi==0.104.1`
- `uvicorn==0.24.0`
- `requests`, `httpx`, `aiohttp`
- `beautifulsoup4`, `lxml`, `html5lib`
- `Selenium`, `Playwright`
- `apscheduler==3.10.4`

**Docker 설정**:
- Chrome 및 ChromeDriver 설치 포함
- Selenium/Playwright 실행 환경 구성

**실행 명령**:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 9001
```

### 3. Chatbot Service
**위치**: `services/chatbotservice/app/price_analyzer.py`

**역할**:
- 챗봇 관련 AI 서비스 (현재 개발 중)
- 가격 분석 기능 (현재 비어있음)

**의존성**:
- `fastapi==0.104.1`
- `uvicorn==0.24.0`

## Docker Compose 설정

**파일**: `docker-compose.yaml`

**서비스 구성**:
1. **gateway**: 포트 9000
2. **crawlerservice**: 포트 9001

**실행 방법**:
```bash
docker-compose up --build
```

## API 사용 예시

### Gateway를 통한 Crawler 서비스 호출
```bash
# Bugs Music 차트
GET http://localhost:9000/crawler/bugsmusic

# 뉴스 통합 검색
GET http://localhost:9000/crawler/news?keywords=시위,폭행

# 위험 지역 분석
GET http://localhost:9000/crawler/risk?keywords=시위,폭행,속보

# 위험도 상세 분석
GET http://localhost:9000/crawler/hazard?keywords=시위,폭행,속보,테러,위험
```

### Crawler 서비스 직접 호출
```bash
# Bugs Music 차트
GET http://localhost:9001/bugsmusic

# 뉴스 통합 검색
GET http://localhost:9001/news?keywords=시위,폭행
```

## 주요 기능

### 1. 뉴스 통합 검색
- Google, Naver, Daum 3개 소스에서 키워드 검색
- 중복 제거 및 통합 결과 반환

### 2. 위험 지역 분석
- 뉴스 기사에서 위치 정보 추출
- 지역별 위험도 집계
- 위도/경도 좌표 포함

### 3. 위험도 상세 분석
- 각 기사별 위험도 점수 계산 (0-100)
- 위치 정보 및 좌표 추출
- 위험도 점수 순 정렬

### 4. 자동 스케줄링
- 5분마다 자동 크롤링 실행
- 위험 키워드 모니터링
- 위험 지역 자동 감지

## 기술 스택

- **프레임워크**: FastAPI
- **서버**: Uvicorn
- **크롤링**: BeautifulSoup4, Selenium, Playwright
- **스케줄링**: APScheduler
- **컨테이너화**: Docker, Docker Compose
- **언어**: Python 3.11

## 환경 변수

현재 환경 변수 설정은 없습니다. 향후 추가 가능합니다.

## 향후 개발 계획

1. **Chatbot Service**: 가격 분석 및 AI 챗봇 기능 구현
2. **인증/인가**: API 키 또는 JWT 토큰 기반 인증
3. **데이터베이스**: 수집된 데이터 저장 및 조회
4. **로깅**: 구조화된 로깅 시스템
5. **모니터링**: 서비스 헬스체크 및 메트릭 수집

