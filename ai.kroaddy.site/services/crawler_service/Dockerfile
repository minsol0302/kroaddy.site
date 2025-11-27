FROM python:3.11-slim

WORKDIR /app

# Chrome 설치
RUN apt-get update && apt-get install -y \
    wget \
    && wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && apt-get install -y ./google-chrome-stable_current_amd64.deb \
    && rm google-chrome-stable_current_amd64.deb \
    && rm -rf /var/lib/apt/lists/*

# Python 패키지 설치
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY app/ ./app/

WORKDIR /app/app

EXPOSE 9003

CMD ["python", "main.py"]

