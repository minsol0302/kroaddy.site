# Rebase 전 변경사항 처리

## 문제
```
error: cannot rebase: You have unstaged changes.
error: Please commit or stash them.
```

## 해결 방법

### 옵션 1: 변경사항 커밋 (권장)

```powershell
# 1. 변경사항 확인
git status

# 2. 변경사항 스테이징
git add .

# 3. 커밋
git commit -m "Update .gitignore and remove .env from tracking"

# 4. 이제 rebase 가능
git rebase -i HEAD~2
# (이제 2개 커밋을 수정해야 함)
```

### 옵션 2: 변경사항 임시 저장 (Stash)

```powershell
# 1. 변경사항 임시 저장
git stash

# 2. Rebase 실행
git rebase -i HEAD~1

# 3. Rebase 완료 후 변경사항 복원
git stash pop
```

### 옵션 3: 변경사항 확인 후 선택적 처리

```powershell
# 1. 변경사항 확인
git status

# 2. .gitignore만 추가하고 싶다면
git add .gitignore
git commit -m "Update .gitignore"

# 3. Rebase 실행
git rebase -i HEAD~2
```

## 추천 순서

1. **먼저 현재 상태 확인**:
   ```powershell
   git status
   ```

2. **변경사항이 .gitignore만이라면 커밋**:
   ```powershell
   git add .gitignore
   git commit -m "Update .gitignore to ignore all .env files"
   ```

3. **이제 2개 커밋을 수정해야 하므로**:
   ```powershell
   git rebase -i HEAD~2
   ```

4. **편집기에서 두 커밋 중 문제 커밋(0e8ea55)만 'edit'으로 변경**

5. **나머지는 이전 가이드대로 진행**

