from fastapi import FastAPI, APIRouter
import uvicorn

app = FastAPI()
map_router = APIRouter(prefix="/map", tags=["map"])

@map_router.get("/")
async def root():
    return {"message": "Map Service API"}

app.include_router(map_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9004)

