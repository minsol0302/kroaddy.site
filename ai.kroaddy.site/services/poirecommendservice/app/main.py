from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from app.model_runner import RecommendationModel

app = FastAPI(title="POI Recommend Service")

# 모델 초기화
model = RecommendationModel(
    model_path="app/models/svd_model_E.pkl",
    preprocessed_csv="app/preprocessed/dfE.csv"
)

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

    recs = model.recommend_for_user(user_id, top_n)
    if not recs:
        raise HTTPException(status_code=404, detail="User not found or no recommendations available")

    response = RecommendResponse(
        userID=user_id,
        recommendations=[
            RecommendResponseItem(itemID=item, predicted_rating=round(pred, 3))
            for item, pred in recs
        ]
    )
    return response
