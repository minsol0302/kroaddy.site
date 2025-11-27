# Next.js 프로젝트를 위한 Dockerfile (프렉탈 구조)

# 1단계: 의존성 설치
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# 2단계: 빌드
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 환경 변수 설정
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js 빌드
RUN pnpm build

# 3단계: 프로덕션 실행
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# standalone 모드 빌드 결과물 복사 (의존성 포함)
# standalone 폴더의 내용을 루트로 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# standalone 모드에서는 server.js가 루트에 있음
CMD ["node", "server.js"]
