from fastapi import FastAPI, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import uvicorn
import httpx

app = FastAPI()
main_router = APIRouter()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용 (프로덕션에서는 특정 origin만 허용 권장)
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# 서비스 URL 설정 (Docker Compose 서비스 이름 사용)
SERVICE_URLS = {
    "crawler": "http://crawler-service:9003",
    "alram": "http://alram-service:9001",
    "chatbot": "http://chatbot-service:9002",
    "map": "http://map-service:9004",
    "translate": "http://translate-service:9005",
}

@main_router.get("/")
async def root():
    return {"message": "Gateway API"}

def create_proxy_router(service_name: str, service_url: str):
    """서비스 프록시 라우터 생성"""
    router = APIRouter(prefix=f"/{service_name}", tags=[service_name])
    
    @router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
    async def proxy(request: Request, path: str):
        """서비스로 요청을 프록시"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # 요청 URL 구성
                url = f"{service_url}/{path}"
                
                # 쿼리 파라미터 포함
                if request.url.query:
                    url += f"?{request.url.query}"
                
                # 요청 본문 가져오기
                body = await request.body()
                
                # 요청 헤더 복사 (필요한 헤더만)
                headers = dict(request.headers)
                headers.pop("host", None)
                headers.pop("content-length", None)
                
                # HTTP 요청 전달
                response = await client.request(
                    method=request.method,
                    url=url,
                    content=body if body else None,
                    headers=headers,
                )
                
                # 응답 헤더에서 불필요한 것 제거
                response_headers = dict(response.headers)
                response_headers.pop("content-encoding", None)
                response_headers.pop("transfer-encoding", None)
                
                # 응답 반환
                return Response(
                    content=response.content,
                    status_code=response.status_code,
                    headers=response_headers,
                    media_type=response.headers.get("content-type")
                )
        except httpx.RequestError as e:
            return Response(
                content=f"Service unavailable: {str(e)}",
                status_code=503
            )
        except Exception as e:
            return Response(
                content=f"Internal server error: {str(e)}",
                status_code=500
            )
    
    return router

# 각 서비스에 대한 프록시 라우터 생성 및 등록
app.include_router(main_router)
for service_name, service_url in SERVICE_URLS.items():
    proxy_router = create_proxy_router(service_name, service_url)
    app.include_router(proxy_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)

