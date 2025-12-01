# OpenAI 챗봇 사용 가이드

## 🎯 개요

프론트엔드에서 OpenAI 챗봇을 사용하는 방법입니다. 이미 코드가 구현되어 있으므로 환경 변수만 설정하면 바로 사용할 수 있습니다.

## 📋 설정 방법

### 1단계: 환경 변수 설정

`www.kroaddy.site` 폴더에 `.env.local` 파일을 생성하거나 수정하세요:

```bash
# .env.local
NEXT_PUBLIC_CHATBOT_API_URL=http://localhost:9000/chatbot
```

**참고**: 
- Gateway를 통해 접근하므로 `http://localhost:9000/chatbot`을 사용합니다
- 직접 chatbotservice에 접근하려면 `http://localhost:9004`를 사용할 수 있지만, Gateway를 통한 접근을 권장합니다

### 2단계: 서비스 실행 확인

```powershell
# Docker 컨테이너가 실행 중인지 확인
cd ai.kroaddy.site
docker compose ps

# Gateway와 Chatbotservice가 모두 실행 중이어야 합니다
```

### 3단계: 프론트엔드 실행

```powershell
cd www.kroaddy.site
npm run dev
```

## 🚀 사용 방법

### 기본 사용

1. **챗봇 화면 열기**
   - 사이드바에서 챗봇 아이콘 클릭
   - 또는 화면 하단의 챗봇 입력창 사용

2. **메시지 입력**
   - 하단 입력창에 메시지 입력
   - Enter 키 또는 전송 버튼 클릭

3. **응답 확인**
   - "작성중..." 메시지가 표시됨
   - OpenAI API 응답이 오면 자동으로 교체됨
   - 타이핑 효과로 응답이 표시됨

### 대화 이력

- 이전 대화 내용이 자동으로 저장됨
- 연속된 대화에서 컨텍스트를 유지함
- "초기화" 버튼으로 대화 이력 초기화 가능

## 🔧 API 엔드포인트

### POST `/chatbot/chat`

**요청:**
```json
{
  "message": "안녕하세요",
  "conversation_history": [
    {
      "role": "user",
      "content": "이전 메시지"
    },
    {
      "role": "assistant",
      "content": "이전 응답"
    }
  ]
}
```

**응답:**
```json
{
  "response": "안녕하세요! 무엇을 도와드릴까요?"
}
```

## 🎨 UI 특징

1. **타이핑 효과**: Assistant 메시지가 타이핑되는 것처럼 표시됨
2. **로딩 상태**: "작성중..." 메시지로 로딩 상태 표시
3. **에러 처리**: 
   - 타임아웃 (30초): "응답 시간이 초과되었습니다"
   - 네트워크 에러: "오류가 발생했습니다"
4. **다국어 지원**: UI 언어에 따라 메시지가 번역됨

## 🧪 테스트 방법

### 1. 브라우저 콘솔 확인

```javascript
// 개발자 도구 (F12) → Console 탭
// API 호출 로그 확인
```

### 2. 네트워크 탭 확인

```
개발자 도구 (F12) → Network 탭
→ POST /chatbot/chat 요청 확인
→ 응답 상태 코드 및 데이터 확인
```

### 3. 직접 API 테스트

```powershell
# PowerShell에서 테스트
$body = @{
    message = "안녕하세요"
    conversation_history = @()
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9000/chatbot/chat" -Method Post -Body $body -ContentType "application/json"
```

## ⚠️ 주의사항

1. **환경 변수**: `NEXT_PUBLIC_` 접두사가 필요합니다 (Next.js 클라이언트 사이드 변수)
2. **CORS**: Gateway에서 CORS가 설정되어 있어야 합니다
3. **타임아웃**: 30초 내에 응답이 없으면 타임아웃됩니다
4. **API 키**: `ai.kroaddy.site/.env` 또는 Docker 환경 변수에 `OPENAI_API_KEY`가 설정되어 있어야 합니다

## 🐛 문제 해결

### 문제 1: "응답을 받을 수 없습니다"

**원인**: API 서버가 실행되지 않았거나 연결할 수 없음

**해결**:
```powershell
# 서비스 상태 확인
cd ai.kroaddy.site
docker compose ps

# 서비스 재시작
docker compose restart gateway chatbotservice
```

### 문제 2: CORS 에러

**원인**: Gateway CORS 설정 문제

**해결**: `ai.kroaddy.site/gateway/app/main.py`에서 CORS 설정 확인

### 문제 3: 타임아웃

**원인**: OpenAI API 응답이 너무 느림

**해결**: 
- 네트워크 연결 확인
- OpenAI API 상태 확인
- 타임아웃 시간 조정 (코드에서 30000ms 변경)

## 📝 코드 위치

- **프론트엔드 API 호출**: `www.kroaddy.site/app/home/page.tsx` (354-433줄)
- **챗봇 UI 컴포넌트**: `www.kroaddy.site/components/Chatbot.tsx`
- **백엔드 API**: `ai.kroaddy.site/services/chatbotservice/app/main.py`
- **챗봇 로직**: `ai.kroaddy.site/services/chatbotservice/app/price_analyzer.py`

