from fastapi import FastAPI, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import uvicorn
import httpx

app = FastAPI()

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
    return "안녕 파이썬"

# 서브라우터 생성 (crawlerservice 프록시)
clawler_router = APIRouter()
CRAWLER_SERVICE_URL = "http://crawlerservice:9001"

@clawler_router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_clawler(request: Request, path: str):
    async with httpx.AsyncClient() as client:
        url = f"{CRAWLER_SERVICE_URL}/{path}"
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
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type")
        )

# 서브라우터를 메인 라우터에 연결
main_router.include_router(clawler_router, prefix="/crawler", tags=["crawler"])

# 메인 라우터를 앱에 포함
app.include_router(main_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)

