from fastapi import FastAPI, APIRouter
import uvicorn

app = FastAPI()
alram_router = APIRouter(prefix="/alram", tags=["alram"])

@alram_router.get("/")
async def root():
    return {"message": "Alram Service API"}

app.include_router(alram_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9001)

