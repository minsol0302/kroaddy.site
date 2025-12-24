"""
Agent Service - FastAPI 애플리케이션
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .agent_router import agent_router
import uvicorn

app = FastAPI(title="Agent Service", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agent 라우터 추가
app.include_router(agent_router)

@app.get("/")
async def root():
    return {
        "service": "Agent Service",
        "status": "running",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9005)
