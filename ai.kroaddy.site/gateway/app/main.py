from fastapi import FastAPI, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import uvicorn
import httpx
import os
from app.agent.main import agent_router

app = FastAPI(title="Gateway Service", version="1.0.0")

# 환경 변수로 서비스 URL 설정 (Docker 네트워크 또는 로컬)
FEED_SERVICE_URL = os.getenv("FEED_SERVICE_URL", "http://feedservice:9003")
RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", "http://ragservice:9002")
CHATBOT_SERVICE_URL = os.getenv("CHATBOT_SERVICE_URL", "http://chatbotservice:9004")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용 (프로덕션에서는 특정 origin만 허용 권장)
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# 메인 라우터 생성
main_router = APIRouter()

@main_router.get("/")
async def root():
    return {
        "service": "Gateway Service",
        "status": "running",
        "version": "1.0.0"
    }

# 서브라우터 생성 (feedservice 프록시)
feed_router = APIRouter()

@feed_router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_feed(request: Request, path: str):
    async with httpx.AsyncClient() as client:
        url = f"{FEED_SERVICE_URL}/{path}"
        params = dict(request.query_params)
        headers = dict(request.headers)
        headers.pop("host", None)
        
        if request.method == "GET":
            response = await client.get(url, params=params, headers=headers)
        elif request.method == "POST":
            body = await request.body()
            response = await client.post(url, content=body, params=params, headers=headers)
        elif request.method == "PUT":
            body = await request.body()
            response = await client.put(url, content=body, params=params, headers=headers)
        elif request.method == "DELETE":
            response = await client.delete(url, params=params, headers=headers)
        elif request.method == "PATCH":
            body = await request.body()
            response = await client.patch(url, content=body, params=params, headers=headers)
        elif request.method == "OPTIONS":
            response = await client.options(url, params=params, headers=headers)
        else:
            return Response(status_code=405)
        
        # CORS 헤더 추가
        response_headers = dict(response.headers)
        response_headers["Access-Control-Allow-Origin"] = "*"
        response_headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response_headers["Access-Control-Allow-Headers"] = "*"
        response_headers["Access-Control-Allow-Credentials"] = "true"
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers,
            media_type=response.headers.get("content-type")
        )

# 서브라우터 생성 (ragservice 프록시)
rag_router = APIRouter()

@rag_router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_rag(request: Request, path: str):
    async with httpx.AsyncClient() as client:
        url = f"{RAG_SERVICE_URL}/{path}"
        params = dict(request.query_params)
        headers = dict(request.headers)
        headers.pop("host", None)
        
        if request.method == "GET":
            response = await client.get(url, params=params, headers=headers)
        elif request.method == "POST":
            body = await request.body()
            response = await client.post(url, content=body, params=params, headers=headers)
        elif request.method == "PUT":
            body = await request.body()
            response = await client.put(url, content=body, params=params, headers=headers)
        elif request.method == "DELETE":
            response = await client.delete(url, params=params, headers=headers)
        elif request.method == "PATCH":
            body = await request.body()
            response = await client.patch(url, content=body, params=params, headers=headers)
        elif request.method == "OPTIONS":
            response = await client.options(url, params=params, headers=headers)
        else:
            return Response(status_code=405)
        
        # CORS 헤더 추가
        response_headers = dict(response.headers)
        response_headers["Access-Control-Allow-Origin"] = "*"
        response_headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response_headers["Access-Control-Allow-Headers"] = "*"
        response_headers["Access-Control-Allow-Credentials"] = "true"
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers,
            media_type=response.headers.get("content-type")
        )

# 서브라우터 생성 (chatbotservice 프록시)
chatbot_router = APIRouter()

@chatbot_router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_chatbot(request: Request, path: str):
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            url = f"{CHATBOT_SERVICE_URL}/{path}"
            params = dict(request.query_params)
            headers = dict(request.headers)
            headers.pop("host", None)
            headers.pop("content-length", None)  # content-length는 자동 계산됨
            
            logger.info(f"프록시 요청: {request.method} {url}")
            
            if request.method == "GET":
                response = await client.get(url, params=params, headers=headers)
            elif request.method == "POST":
                body = await request.body()
                logger.info(f"요청 본문 길이: {len(body)} bytes")
                response = await client.post(url, content=body, params=params, headers=headers)
            elif request.method == "PUT":
                body = await request.body()
                response = await client.put(url, content=body, params=params, headers=headers)
            elif request.method == "DELETE":
                response = await client.delete(url, params=params, headers=headers)
            elif request.method == "PATCH":
                body = await request.body()
                response = await client.patch(url, content=body, params=params, headers=headers)
            elif request.method == "OPTIONS":
                response = await client.options(url, params=params, headers=headers)
            else:
                return Response(status_code=405)
            
            logger.info(f"프록시 응답: {response.status_code}, Content-Type: {response.headers.get('content-type')}")
            logger.info(f"응답 본문 길이: {len(response.content)} bytes")
            
            # CORS 헤더 추가
            response_headers = dict(response.headers)
            response_headers["Access-Control-Allow-Origin"] = "*"
            response_headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
            response_headers["Access-Control-Allow-Headers"] = "*"
            response_headers["Access-Control-Allow-Credentials"] = "true"
            
            # Content-Type 명시적 설정
            content_type = response.headers.get("content-type", "application/json")
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=response_headers,
                media_type=content_type
            )
    except Exception as e:
        logger.error(f"프록시 에러: {e}", exc_info=True)
        return Response(
            content=f'{{"detail": "Gateway proxy error: {str(e)}"}}',
            status_code=500,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            }
        )

# 서브라우터를 메인 라우터에 연결
main_router.include_router(feed_router, prefix="/feed", tags=["feed"])
main_router.include_router(rag_router, prefix="/rag", tags=["rag"])
main_router.include_router(chatbot_router, prefix="/chatbot", tags=["chatbot"])

# Agent 라우터 추가 (내부 서비스)
app.include_router(agent_router)

# 메인 라우터를 앱에 포함
app.include_router(main_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)

