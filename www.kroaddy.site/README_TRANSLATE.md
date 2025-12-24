# 번역 기능 구현 가이드

## 개요
이 프로젝트에 번역 기능이 구현되었습니다. 사용자는 채팅 메시지를 여러 언어로 번역할 수 있습니다.

## 구현된 기능

### 1. 번역 API
- **위치**: `app/api/translate/route.ts`
- **기능**: 단일 텍스트 번역
- **지원 방법**:
  - Google Translate (무료 버전, 기본)
  - Papago API (네이버, 한국어 번역 최적화)

### 2. 배치 번역 API
- **위치**: `app/api/translate/batch/route.ts`
- **기능**: 여러 텍스트를 한 번에 번역

### 3. 번역 서비스
- **위치**: `service/translateService.ts`
- **기능**: 번역 API 호출 및 언어 코드 관리

### 4. UI 컴포넌트
- **Chatbot**: 번역 토글 스위치 및 번역된 메시지 표시
- **Sidebar**: 언어 선택 다이얼로그

## 사용 방법

### 1. 환경 변수 설정 (선택사항)

Papago API를 사용하려면 `.env.local` 파일에 다음을 추가하세요:

```env
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

Papago API 키 발급:
1. https://developers.naver.com/apps/#/register 접속
2. 애플리케이션 등록
3. Client ID와 Client Secret 발급

### 2. 번역 기능 사용

1. **번역 활성화**: Chatbot 헤더의 "Translate" 토글을 켭니다.
2. **언어 선택**: Sidebar의 "Languages" 버튼을 클릭하여 번역할 언어를 선택합니다.
3. **자동 번역**: 번역이 활성화되면 모든 메시지가 선택한 언어로 자동 번역됩니다.

## 지원 언어

- 한국어 (ko)
- 영어 (en)
- 일본어 (ja)
- 중국어 간체 (zh-CN)
- 중국어 번체 (zh-TW)
- 프랑스어 (fr)
- 독일어 (de)
- 베트남어 (vi)
- 이탈리아어 (it)
- 아랍어 (ar)
- 인도네시아어 (id)
- 태국어 (th)
- 몽골어 (mn)
- 포르투갈어 (pt)
- 스페인어 (es)
- 우즈베크어 (uz)
- 크메르어 (km)
- 네팔어 (ne)

## API 사용 예시

### 단일 텍스트 번역

```typescript
import { translateText } from '@/service/translateService';

const translated = await translateText('안녕하세요', 'ko', 'en');
console.log(translated); // "Hello"
```

### 배치 번역

```typescript
import { translateMessages } from '@/service/translateService';

const messages = [
  { content: '안녕하세요' },
  { content: '감사합니다' }
];
const translated = await translateMessages(messages, 'ko', 'en');
```

## 주의사항

1. **Google Translate 무료 버전**: 
   - 제한이 있을 수 있습니다.
   - 프로덕션 환경에서는 유료 API 사용을 권장합니다.

2. **Papago API**:
   - 한국어 번역에 최적화되어 있습니다.
   - 무료 할당량이 있습니다 (월 10,000자).

3. **에러 처리**:
   - 번역 실패 시 원본 텍스트가 표시됩니다.
   - 콘솔에 에러가 기록됩니다.

## 향후 개선 사항

- [ ] 번역 캐싱 (같은 텍스트 재번역 방지)
- [ ] 번역 히스토리 저장
- [ ] 실시간 번역 (타이핑 중 자동 번역)
- [ ] 번역 품질 개선 (컨텍스트 고려)
- [ ] 더 많은 언어 지원

