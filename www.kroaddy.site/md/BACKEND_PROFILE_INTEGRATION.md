# 온보딩 프로필 데이터 백엔드 연동 가이드

## 📋 개요

이 문서는 온보딩에서 수집한 사용자 프로필 데이터를 백엔드와 연동하는 방법을 설명합니다.

현재 프론트엔드에서는 로컬 스토리지에 데이터를 저장하고 있으며, 백엔드 연동을 위해 다음 작업이 필요합니다.

---

## 🔄 데이터 흐름

```
온보딩 완료 → 로컬 스토리지 저장 → 백엔드 API 호출 (POST)
프로필 페이지 접근 → 백엔드 API 호출 (GET) → 로컬 스토리지 fallback
프로필 수정 → 백엔드 API 호출 (PUT) → 로컬 스토리지 업데이트
```

---

## 📦 수집되는 데이터 구조

```typescript
interface OnboardingData {
    gender: string;        // 'Male', 'Female', 'Other/Non-disclosure'
    age: string;          // 사용자 입력 나이 (예: '28')
    nationality: string;  // 'South Korea', 'United States', 'China', etc.
    religion: string;     // 'No Religion', 'Christianity', 'Islam', etc.
    dietary: string;      // 'Normal', 'Vegetarian(Lacto/Ovo)', 'Vegan', etc.
}
```

---

## 🔧 구현 방법

### 1. 온보딩 완료 시 백엔드 저장

**파일**: `components/Onboarding.tsx`

**위치**: `handleNext()` 함수의 완료 처리 부분

```typescript
const handleNext = async () => {
    if (step < questions.length - 1) {
        setStep(step + 1);
    } else {
        // 모든 질문 완료
        console.log('완료된 데이터:', formData);
        
        // 로컬 스토리지에 온보딩 데이터 저장 (fallback)
        if (typeof window !== 'undefined') {
            localStorage.setItem('onboardingData', JSON.stringify(formData));
            localStorage.setItem('onboardingCompletedAt', new Date().toISOString());
        }
        
        // 백엔드 API 호출
        try {
            const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 인증 토큰 포함 (쿠키 기반 인증 사용 시 생략 가능)
                    // 'Authorization': `Bearer ${token}`
                },
                credentials: 'include', // 쿠키 포함
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('프로필 저장 완료:', result);
            } else {
                console.error('프로필 저장 실패:', response.statusText);
                // 실패해도 로컬 스토리지에 저장되어 있으므로 계속 진행
            }
        } catch (error) {
            console.error('프로필 저장 중 오류:', error);
            // 네트워크 오류 시에도 로컬 스토리지 데이터로 계속 진행
        }
        
        // 홈으로 이동
        router.replace('/home');
    }
};
```

---

### 2. 프로필 페이지에서 데이터 조회

**파일**: `app/mypage/profile/page.tsx`

**위치**: `useEffect` 훅

```typescript
useEffect(() => {
    const fetchProfile = async () => {
        try {
            // 백엔드에서 프로필 데이터 조회
            const response = await fetch('/api/user/profile', {
                method: 'GET',
                headers: {
                    // 인증 토큰 포함 (쿠키 기반 인증 사용 시 생략 가능)
                    // 'Authorization': `Bearer ${token}`
                },
                credentials: 'include' // 쿠키 포함
            });
            
            if (response.ok) {
                const data = await response.json();
                setOnboardingData(data);
                
                // 백엔드 데이터를 로컬 스토리지에도 저장 (동기화)
                if (typeof window !== 'undefined') {
                    localStorage.setItem('onboardingData', JSON.stringify(data));
                }
            } else if (response.status === 404) {
                // 프로필이 없을 경우 로컬 스토리지에서 불러오기
                console.log('백엔드에 프로필이 없습니다. 로컬 스토리지에서 불러옵니다.');
                loadFromLocalStorage();
            } else {
                throw new Error('프로필 조회 실패');
            }
        } catch (error) {
            console.error('프로필 조회 중 오류:', error);
            // 오류 발생 시 로컬 스토리지에서 불러오기 (fallback)
            loadFromLocalStorage();
        }
    };
    
    const loadFromLocalStorage = () => {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem('onboardingData');
            const savedDate = localStorage.getItem('onboardingCompletedAt');
            
            if (savedData) {
                try {
                    setOnboardingData(JSON.parse(savedData));
                } catch (error) {
                    console.error('로컬 스토리지 데이터 파싱 실패:', error);
                }
            }
            
            if (savedDate) {
                setCompletedAt(savedDate);
            }
        }
    };
    
    fetchProfile();
}, []);
```

---

### 3. 프로필 수정 기능

**파일**: `app/mypage/profile/page.tsx`

**위치**: 수정 버튼 클릭 핸들러

```typescript
const handleUpdateProfile = async (updatedData: OnboardingData) => {
    try {
        const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify(updatedData)
        });
        
        if (response.ok) {
            const result = await response.json();
            setOnboardingData(result);
            
            // 로컬 스토리지도 업데이트
            if (typeof window !== 'undefined') {
                localStorage.setItem('onboardingData', JSON.stringify(result));
            }
            
            alert('프로필이 성공적으로 업데이트되었습니다.');
        } else {
            throw new Error('프로필 업데이트 실패');
        }
    } catch (error) {
        console.error('프로필 업데이트 중 오류:', error);
        alert('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
    }
};
```

---

## 🌐 백엔드 API 엔드포인트 명세

### POST /api/user/profile
프로필 데이터 저장

**Request Body:**
```json
{
    "gender": "Male",
    "age": "28",
    "nationality": "South Korea",
    "religion": "No Religion",
    "dietary": "Normal"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Profile saved successfully",
    "data": {
        "gender": "Male",
        "age": "28",
        "nationality": "South Korea",
        "religion": "No Religion",
        "dietary": "Normal"
    }
}
```

---

### GET /api/user/profile
프로필 데이터 조회

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "gender": "Male",
        "age": "28",
        "nationality": "South Korea",
        "religion": "No Religion",
        "dietary": "Normal"
    }
}
```

**Response (404 Not Found):**
```json
{
    "success": false,
    "message": "Profile not found"
}
```

---

### PUT /api/user/profile
프로필 데이터 수정

**Request Body:**
```json
{
    "gender": "Female",
    "age": "30",
    "nationality": "United States",
    "religion": "Christianity",
    "dietary": "Vegetarian(Lacto/Ovo)"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "gender": "Female",
        "age": "30",
        "nationality": "United States",
        "religion": "Christianity",
        "dietary": "Vegetarian(Lacto/Ovo)"
    }
}
```

---

## 🔐 인증 처리

### 쿠키 기반 인증 (현재 사용 중)
```typescript
fetch('/api/user/profile', {
    method: 'POST',
    credentials: 'include', // 쿠키 자동 포함
    // Authorization 헤더 불필요
});
```

### JWT 토큰 기반 인증
```typescript
// 토큰 가져오기 (예: 로컬 스토리지, 쿠키, 또는 상태 관리)
const token = localStorage.getItem('authToken');

fetch('/api/user/profile', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
});
```

---

## 🛡️ 에러 처리 및 Fallback 전략

1. **네트워크 오류**: 로컬 스토리지 데이터 사용
2. **401 Unauthorized**: 로그인 페이지로 리다이렉트
3. **404 Not Found**: 로컬 스토리지에서 데이터 불러오기
4. **500 Server Error**: 사용자에게 오류 메시지 표시, 로컬 스토리지 데이터 유지

```typescript
const handleApiCall = async () => {
    try {
        const response = await fetch('/api/user/profile', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        
        if (response.status === 401) {
            // 인증 실패 - 로그인 페이지로 이동
            router.push('/login');
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof TypeError) {
            // 네트워크 오류
            console.error('네트워크 오류:', error);
            // 로컬 스토리지 데이터 사용
            return getFromLocalStorage();
        } else {
            // 기타 오류
            console.error('API 호출 실패:', error);
            throw error;
        }
    }
};
```

---

## 📝 구현 체크리스트

- [ ] `components/Onboarding.tsx`에 POST API 호출 추가
- [ ] `app/mypage/profile/page.tsx`에 GET API 호출 추가
- [ ] 프로필 수정 기능에 PUT API 호출 추가
- [ ] 인증 토큰/쿠키 처리 구현
- [ ] 에러 처리 및 fallback 로직 구현
- [ ] 로딩 상태 표시 (선택사항)
- [ ] 성공/실패 알림 메시지 (선택사항)

---

## 🔄 동기화 전략

1. **온보딩 완료 시**: 로컬 스토리지 저장 → 백엔드 저장 시도
2. **프로필 조회 시**: 백엔드 조회 → 실패 시 로컬 스토리지 사용
3. **프로필 수정 시**: 백엔드 업데이트 → 성공 시 로컬 스토리지 동기화

이렇게 하면 네트워크 오류나 백엔드 장애 시에도 사용자가 데이터를 볼 수 있습니다.

---

## 💡 추가 고려사항

1. **로딩 상태**: API 호출 중 로딩 스피너 표시
2. **낙관적 업데이트**: UI를 먼저 업데이트하고 백엔드 동기화
3. **재시도 로직**: 실패 시 자동 재시도 (exponential backoff)
4. **데이터 검증**: 프론트엔드에서 데이터 유효성 검사
5. **타임스탬프**: 마지막 동기화 시간 표시

---

## 📚 참고 파일

- `components/Onboarding.tsx` - 온보딩 컴포넌트
- `app/mypage/profile/page.tsx` - 프로필 페이지
- `lib/api.ts` - API 클라이언트 설정 (공통 설정 사용 가능)

