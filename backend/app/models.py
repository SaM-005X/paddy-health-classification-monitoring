from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class SensorReading(BaseModel):
    soil_moisture: Optional[float] = Field(None, description="Soil moisture percentage (0-100%)")
    canopy_temp: Optional[float] = Field(None, description="Canopy temperature in Celsius")
    ambient_temp: Optional[float] = Field(None, description="Ambient air temperature in Celsius")
    humidity: Optional[float] = Field(None, description="Ambient relative humidity (0-100%)")

class PredictionResponse(BaseModel):
    id: str
    timestamp: str
    predicted_category: str
    is_uncertain: bool
    status_label: str
    confidence_score: float
    confidence_percentage: float
    threshold_applied: float
    probabilities: Dict[str, float]
    sensor_evaluation: Optional[Dict[str, str]] = None
    warning: Optional[str] = None
    recommendations: List[str]
    disclaimer: str

class HistoryItem(BaseModel):
    id: str
    timestamp: str
    image_name: str
    predicted_category: str
    confidence_score: float
    is_uncertain: bool
    threshold_applied: float
    probabilities: Dict[str, float]

class StatsResponse(BaseModel):
    total_predictions: int
    category_counts: Dict[str, int]
    uncertain_count: int
    average_confidence: float
    recent_trend: List[Dict[str, Any]]

class ModelMetricsResponse(BaseModel):
    model_name: str
    input_resolution: List[int]
    classes: List[str]
    accuracy: float
    macro_f1: float
    class_metrics: Dict[str, Dict[str, float]]
    confusion_matrix: List[List[int]]
    threshold_policy: Dict[str, float]
