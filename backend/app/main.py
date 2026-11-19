import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router
from .database import init_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("paddy_health_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and verify environment
    logger.info("Initializing Paddy Health Database...")
    init_db()
    logger.info("Paddy Health Backend ready to serve predictions.")
    yield
    # Shutdown
    logger.info("Shutting down Paddy Health Backend.")

app = FastAPI(
    title="Paddy Health Classification & Monitoring API",
    description="Edge-ready 4-Category Plant Health & Threshold Assessment System (Healthy, Water_Stressed, Nutrient_deficient, Diseased)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
