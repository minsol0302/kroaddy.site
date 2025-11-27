from fastapi import FastAPI, APIRouter
import uvicorn

app = FastAPI()
translate_router = APIRouter(prefix="/translate", tags=["translate"])

@translate_router.get("/")
async def root():
    return {"message": "Translate Service API"}

app.include_router(translate_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9005)

