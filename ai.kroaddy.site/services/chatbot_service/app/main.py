from fastapi import FastAPI, APIRouter
import uvicorn

app = FastAPI()
chatbot_router = APIRouter(prefix="/chatbot", tags=["chatbot"])

@chatbot_router.get("/")
async def root():
    return {"message": "Chatbot Service API"}

app.include_router(chatbot_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9002)

