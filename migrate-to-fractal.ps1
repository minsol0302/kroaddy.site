# Frontend 프렉탈 구조 마이그레이션 스크립트
# PowerShell에서 실행: .\migrate-to-fractal.ps1

Write-Host "Frontend 프렉탈 구조로 마이그레이션 시작..." -ForegroundColor Green

# src/app 디렉토리 생성
Write-Host "src/app 디렉토리 생성 중..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "src\app" | Out-Null

# app 폴더 내용을 src/app으로 이동
Write-Host "app 폴더를 src/app으로 이동 중..." -ForegroundColor Yellow
if (Test-Path "app") {
    Get-ChildItem -Path "app" -Recurse | ForEach-Object {
        $destPath = $_.FullName.Replace((Get-Location).Path + "\app", (Get-Location).Path + "\src\app")
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        }
        Copy-Item -Path $_.FullName -Destination $destPath -Force
    }
    Write-Host "app 폴더 내용을 src/app으로 복사 완료" -ForegroundColor Green
} else {
    Write-Host "app 폴더를 찾을 수 없습니다." -ForegroundColor Red
}

# src/test 디렉토리 생성 (향후 테스트 코드용)
Write-Host "src/test 디렉토리 생성 중..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "src\test" | Out-Null

Write-Host "마이그레이션 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Cyan
Write-Host "1. 기존 app 폴더를 삭제하세요 (선택사항)" -ForegroundColor White
Write-Host "2. pnpm dev로 개발 서버를 실행하여 정상 작동 확인" -ForegroundColor White
Write-Host "3. 문제가 있으면 tsconfig.json의 paths 설정을 확인하세요" -ForegroundColor White

