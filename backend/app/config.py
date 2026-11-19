import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_KERAS_PATH = MODELS_DIR / "paddy_mobilenetv2_4class.keras"
MODEL_H5_PATH = MODELS_DIR / "paddy_mobilenetv2_4class.h5"
MODEL_TFLITE_PATH = MODELS_DIR / "paddy_mobilenetv2_4class.tflite"
LABELS_PATH = MODELS_DIR / "class_labels.json"
METRICS_PATH = MODELS_DIR / "evaluation_report.json"

SAMPLES_DIR = PROJECT_ROOT / "ml_pipeline" / "data" / "samples"
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = BASE_DIR / "paddy_history.db"

# Threshold Settings
DEFAULT_CONFIDENCE_THRESHOLD = 0.65
MARGIN_UNCERTAINTY_THRESHOLD = 0.15

# Supported Categories in exact order
CATEGORIES = [
    "Healthy",
    "Water_Stressed",
    "Nutrient_deficient",
    "Diseased"
]
