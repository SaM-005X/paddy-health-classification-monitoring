import os
import shutil
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
import json

from ..config import (
    CATEGORIES,
    DEFAULT_CONFIDENCE_THRESHOLD,
    SAMPLES_DIR,
    METRICS_PATH,
    MODEL_KERAS_PATH,
    MODEL_TFLITE_PATH
)
from ..models import (
    PredictionResponse,
    HistoryItem,
    StatsResponse,
    ModelMetricsResponse
)
from ..services.classifier import classifier_instance
from ..services.threshold_engine import evaluate_threshold_and_sensors
from ..database import save_prediction, get_history, get_stats

router = APIRouter(prefix="/api", tags=["Paddy Health API"])

@router.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "Paddy Health Classification & Monitoring API",
        "model_loaded": classifier_instance.is_loaded,
        "model_backend": classifier_instance.model_type,
        "edge_tflite_available": MODEL_TFLITE_PATH.exists(),
        "keras_model_available": MODEL_KERAS_PATH.exists(),
        "categories": CATEGORIES
    }

@router.post("/predict", response_model=PredictionResponse)
async def predict_plant_health(
    file: UploadFile = File(...),
    threshold: float = Form(DEFAULT_CONFIDENCE_THRESHOLD),
    soil_moisture: Optional[float] = Form(None),
    canopy_temp: Optional[float] = Form(None),
    ambient_temp: Optional[float] = Form(None),
    humidity: Optional[float] = Form(None)
):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/jpg"]
    if file.content_type not in allowed_types and not file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        raise HTTPException(status_code=400, detail="Invalid image file format. Supported: JPG, PNG, WEBP.")

    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # 1. Run inference
        probabilities = classifier_instance.predict(contents)

        # 2. Package sensor data if supplied
        sensor_data = {}
        if soil_moisture is not None:
            sensor_data["soil_moisture"] = soil_moisture
        if canopy_temp is not None:
            sensor_data["canopy_temp"] = canopy_temp
        if ambient_temp is not None:
            sensor_data["ambient_temp"] = ambient_temp
        if humidity is not None:
            sensor_data["humidity"] = humidity

        # 3. Evaluate confidence threshold & edge sensor validation
        evaluation = evaluate_threshold_and_sensors(
            probabilities=probabilities,
            threshold=threshold,
            sensor_data=sensor_data if sensor_data else None
        )

        # 4. Persist to database
        record_id = save_prediction(
            image_name=file.filename,
            predicted_category=evaluation["predicted_category"],
            confidence_score=evaluation["confidence_score"],
            threshold_applied=evaluation["threshold_applied"],
            is_uncertain=evaluation["is_uncertain"],
            status_label=evaluation["status_label"],
            probabilities=evaluation["probabilities"],
            recommendations=evaluation["recommendations"],
            sensor_data=sensor_data if sensor_data else None
        )

        from datetime import datetime
        return PredictionResponse(
            id=record_id,
            timestamp=datetime.now().isoformat(),
            predicted_category=evaluation["predicted_category"],
            is_uncertain=evaluation["is_uncertain"],
            status_label=evaluation["status_label"],
            confidence_score=evaluation["confidence_score"],
            confidence_percentage=evaluation["confidence_percentage"],
            threshold_applied=evaluation["threshold_applied"],
            probabilities=evaluation["probabilities"],
            sensor_evaluation=evaluation["sensor_evaluation"],
            warning=evaluation["warning"],
            recommendations=evaluation["recommendations"],
            disclaimer=evaluation["disclaimer"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.get("/history")
async def fetch_history(limit: int = Query(50, ge=1, le=200)):
    records = get_history(limit=limit)
    return {"history": records, "count": len(records)}

@router.get("/stats", response_model=StatsResponse)
async def fetch_stats():
    return get_stats()

@router.get("/model-metrics")
async def fetch_model_metrics():
    if not METRICS_PATH.exists():
        raise HTTPException(status_code=404, detail="Model evaluation report not generated yet.")
    with open(METRICS_PATH, "r") as f:
        metrics = json.load(f)
    return metrics

@router.get("/samples")
async def list_sample_leaves():
    """Returns curated demo samples for instant UI testing."""
    sample_files = [
        {
            "category": "Healthy",
            "filename": "sample_Healthy.jpg",
            "description": "Vigorous green leaf with uniform chlorophyll and intact blade."
        },
        {
            "category": "Water_Stressed",
            "filename": "sample_Water_Stressed.jpg",
            "description": "Inward leaf rolling, grayish-green tone, and wilting tip."
        },
        {
            "category": "Nutrient_deficient",
            "filename": "sample_Nutrient_deficient.jpg",
            "description": "Chlorosis / yellowing and marginal leaf scorch (NPK deficiency)."
        },
        {
            "category": "Diseased",
            "filename": "sample_Diseased.jpg",
            "description": "Necrotic blast eye-spots and brown fungal lesions."
        },
        {
            "category": "Uncertain",
            "filename": "sample_Uncertain.jpg",
            "description": "Borderline / ambiguous sample to demonstrate minimum confidence rejection."
        }
    ]
    return {"samples": sample_files}

@router.get("/samples/{filename}")
async def get_sample_leaf_image(filename: str):
    file_path = SAMPLES_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Sample image not found.")
    return FileResponse(file_path)
