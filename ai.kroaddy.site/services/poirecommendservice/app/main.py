from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import logging
from app.model_runner import RecommendationModel

# 로거 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="POI Recommend Service")

# 모델 초기화
logger.info("=" * 80)
logger.info("[서비스 시작] POI Recommend Service 초기화 중...")
logger.info("=" * 80)

try:
    model = RecommendationModel(
        model_path="app/models/svd_model_E.pkl",
        preprocessed_csv="app/preprocessed/dfE.csv"
    )
    logger.info("=" * 80)
    logger.info("[서비스 준비 완료] POI Recommend Service가 정상적으로 시작되었습니다")
    logger.info("=" * 80)
except Exception as e:
    logger.error(f"[초기화 실패] 모델 로드 중 오류 발생: {str(e)}", exc_info=True)
    raise

class RecommendRequest(BaseModel):
    userID: str
    topN: int = 5

class RecommendResponseItem(BaseModel):
    itemID: str
    predicted_rating: float

class RecommendResponse(BaseModel):
    userID: str
    recommendations: List[RecommendResponseItem]

@app.post("/recommend", response_model=RecommendResponse)
def recommend(request: RecommendRequest):
    user_id = request.userID
    top_n = request.topN
    
    logger.info(f"[API 요청] /recommend - userID: {user_id}, topN: {top_n}")

    try:
        recs = model.recommend_for_user(user_id, top_n)
        
        if not recs:
            logger.warning(f"[API 응답 실패] 사용자 {user_id}에 대한 추천을 찾을 수 없음")
            raise HTTPException(status_code=404, detail="User not found or no recommendations available")

        response = RecommendResponse(
            userID=user_id,
            recommendations=[
                RecommendResponseItem(itemID=item, predicted_rating=round(pred, 3))
                for item, pred in recs
            ]
        )
        
        logger.info(f"[API 응답 성공] userID: {user_id}, 추천 아이템 수: {len(response.recommendations)}개")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[API 오류] 추천 처리 중 예외 발생: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
