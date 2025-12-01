"""
Chatbot Service - FastAPI 애플리케이션
가격 분석 챗봇 서비스
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.price_analyzer import chatbot, simple_chat, analyze_price
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Chatbot Service", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# 요청/응답 모델
# ============================================================================

class ChatRequest(BaseModel):
    """챗봇 대화 요청"""
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    """챗봇 대화 응답"""
    response: str

class PriceAnalysisRequest(BaseModel):
    """가격 분석 요청"""
    product_name: str
    price: Optional[float] = None
    context: Optional[str] = None

class PriceAnalysisResponse(BaseModel):
    """가격 분석 응답"""
    analysis: str

# ============================================================================
# API 엔드포인트
# ============================================================================

@app.get("/")
async def root():
    """서비스 상태 확인"""
    return {
        "service": "Chatbot Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "chatbot_ready": True
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    챗봇과 대화
    
    Args:
        request: 대화 요청 (메시지, 대화 이력)
    
    Returns:
        챗봇 응답
    """
    try:
        logger.info(f"챗봇 요청 수신: {request.message}")
        logger.info(f"대화 이력 길이: {len(request.conversation_history) if request.conversation_history else 0}")
        
        if request.conversation_history:
            # 대화 이력이 있으면 전달
            response = chatbot.chat(
                request.message,
                conversation_history=request.conversation_history
            )
        else:
            # 대화 이력이 없으면 간단한 호출
            response = simple_chat(request.message)
        
        logger.info(f"챗봇 응답 생성 완료 (길이: {len(response)} 문자)")
        return ChatResponse(response=response)
        
    except Exception as e:
        logger.error(f"챗봇 호출 실패: {e}", exc_info=True)
        import traceback
        logger.error(f"에러 상세: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-price", response_model=PriceAnalysisResponse)
async def analyze_price_endpoint(request: PriceAnalysisRequest):
    """
    가격 분석 요청
    
    Args:
        request: 가격 분석 요청 (상품명, 가격, 컨텍스트)
    
    Returns:
        가격 분석 결과
    """
    try:
        logger.info(f"가격 분석 요청: {request.product_name}, 가격: {request.price}")
        
        analysis = analyze_price(
            request.product_name,
            request.price,
            request.context
        )
        
        logger.info("가격 분석 완료")
        return PriceAnalysisResponse(analysis=analysis)
        
    except Exception as e:
        logger.error(f"가격 분석 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9004)

