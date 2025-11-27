from fastapi import FastAPI, APIRouter
import uvicorn
from bs_demo.bugs import crawl_bugs_chart
from sel_demo.naver_news import crawl_naver_news

app = FastAPI()
crawler_router = APIRouter(prefix="/crawler", tags=["crawler"])

@crawler_router.get("/")
async def root():
    return {"message": "crawler Service API"}

@crawler_router.get("/bugsmusic")
async def get_bugs_music_chart():
    """벅스 실시간 음악 차트 크롤링"""
    chart_data = crawl_bugs_chart()
    
    if chart_data:
        return {
            "success": True,
            "count": len(chart_data),
            "data": chart_data
        }
    else:
        return {
            "success": False,
            "message": "크롤링 실패 또는 데이터 없음",
            "data": []
        }

@crawler_router.get("/navernews")
async def get_naver_news():
    """네이버 뉴스 도로/교통 섹션 크롤링"""
    news_data = crawl_naver_news()
    
    if news_data:
        return {
            "success": True,
            "count": len(news_data),
            "data": news_data
        }
    else:
        return {
            "success": False,
            "message": "크롤링 실패 또는 데이터 없음",
            "data": []
        }

app.include_router(crawler_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9003)

