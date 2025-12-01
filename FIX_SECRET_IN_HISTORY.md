# Git 히스토리에서 시크릿 제거 방법

현재 문제: 커밋 `0e8ea55a35ed46e1316abbebf7d26b7687bf126c`에 `.env` 파일이 포함되어 있습니다.

## 해결 방법

### 방법 1: Interactive Rebase로 커밋 수정 (권장)

```powershell
# 1. 최근 커밋들 확인
git log --oneline -10

# 2. 문제가 있는 커밋 이전으로 rebase
# 커밋 해시가 0e8ea55라면, 그 이전 커밋으로
git rebase -i 0e8ea55^
# 또는 최근 3개 커밋 수정
git rebase -i HEAD~3

# 3. 편집기에서 해당 커밋의 'pick'을 'edit'으로 변경
# 4. 저장 후 종료

# 5. .env 파일 제거
git rm --cached ai.kroaddy.site/.env

# 6. 커밋 수정
git commit --amend --no-edit

# 7. Rebase 계속
git rebase --continue

# 8. 강제 푸시
git push --force-with-lease origin feature-lee
```

### 방법 2: 커밋 수정 (가장 간단)

```powershell
# 1. 문제 커밋으로 이동
git checkout 0e8ea55a35ed46e1316abbebf7d26b7687bf126c

# 2. .env 파일 제거
git rm --cached ai.kroaddy.site/.env

# 3. 커밋 수정
git commit --amend --no-edit

# 4. 브랜치로 돌아가기
git checkout feature-lee

# 5. Rebase로 수정된 커밋 적용
git rebase 0e8ea55a35ed46e1316abbebf7d26b7687bf126c

# 6. 강제 푸시
git push --force-with-lease origin feature-lee
```

### 방법 3: GitHub에서 시크릿 허용 (임시 해결)

GitHub에서 제공한 URL로 접속하여 시크릿을 허용:
```
https://github.com/minsol0302/kroaddy_project_dacon_test/security/secret-scanning/unblock-secret/36E0cvOYT9G0VUoRuhwlISOV4DB
```

⚠️ **주의**: 이 방법은 시크릿이 히스토리에 남아있으므로 권장하지 않습니다.

### 방법 4: 새 브랜치로 시작 (가장 안전)

```powershell
# 1. 현재 브랜치에서 .env 제거된 상태 확인
git status

# 2. 새 브랜치 생성
git checkout -b feature-lee-clean

# 3. 푸시
git push origin feature-lee-clean

# 4. 기존 브랜치 삭제 (선택사항)
git push origin --delete feature-lee
```

## 가장 빠른 해결 (방법 2 간소화)

```powershell
# 1. 최근 커밋에서 .env 제거
git rebase -i HEAD~5

# 편집기에서 문제 커밋의 'pick'을 'edit'으로 변경

# 2. .env 제거 및 커밋 수정
git rm --cached ai.kroaddy.site/.env
git commit --amend --no-edit
git rebase --continue

# 3. 강제 푸시
git push --force-with-lease origin feature-lee
```

## ⚠️ 중요: API 키 교체

히스토리에 노출된 API 키는 반드시 교체하세요:
1. OpenAI Platform에서 기존 키 삭제
2. 새 키 생성
3. .env 파일 업데이트

