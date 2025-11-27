FROM python:3.11-slim

WORKDIR /app

# 필요한 패키지 설치
COPY gateway/app/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY gateway/app/ ./app/

WORKDIR /app/app

# 포트 7000 노출
EXPOSE 9000

# main.py 실행
CMD ["python", "main.py"]

