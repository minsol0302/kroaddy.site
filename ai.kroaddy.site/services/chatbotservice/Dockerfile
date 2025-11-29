FROM python:3.11-slim

WORKDIR /app

# requirements.txt 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY gateway/ ./gateway/

# 포트 노출
EXPOSE 9000

# 애플리케이션 실행
CMD ["python", "gateway/app/main.py"]

