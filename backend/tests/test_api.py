"""
Integration and Unit Tests for Paddy Health API
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.main import app
from app.config import SAMPLES_DIR

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["model_loaded"] is True
    assert "Healthy" in data["categories"]

def test_samples_endpoint():
    response = client.get("/api/samples")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
    assert len(data["samples"]) >= 4

def test_model_metrics():
    response = client.get("/api/model-metrics")
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert "confusion_matrix" in data

def test_predict_endpoint_healthy():
    sample_file = SAMPLES_DIR / "sample_Healthy.jpg"
    assert sample_file.exists(), f"Sample file {sample_file} not found"

    with open(sample_file, "rb") as f:
        response = client.post(
            "/api/predict",
            files={"file": ("sample_Healthy.jpg", f, "image/jpeg")},
            data={"threshold": "0.65"}
        )

    assert response.status_code == 200
    data = response.json()
    assert "predicted_category" in data
    assert "confidence_percentage" in data
    assert "probabilities" in data
    assert len(data["recommendations"]) > 0

def test_predict_with_sensor_data():
    sample_file = SAMPLES_DIR / "sample_Water_Stressed.jpg"
    with open(sample_file, "rb") as f:
        response = client.post(
            "/api/predict",
            files={"file": ("sample_Water_Stressed.jpg", f, "image/jpeg")},
            data={
                "threshold": "0.65",
                "soil_moisture": "28.5",
                "canopy_temp": "34.2",
                "ambient_temp": "31.0"
            }
        )

    assert response.status_code == 200
    data = response.json()
    assert data["sensor_evaluation"] is not None
    assert "soil_moisture" in data["sensor_evaluation"]

def test_history_and_stats():
    h_resp = client.get("/api/history?limit=10")
    assert h_resp.status_code == 200
    assert "history" in h_resp.json()

    s_resp = client.get("/api/stats")
    assert s_resp.status_code == 200
    s_data = s_resp.json()
    assert "total_predictions" in s_data
    assert s_data["total_predictions"] >= 1

if __name__ == "__main__":
    test_health_check()
    test_samples_endpoint()
    test_model_metrics()
    test_predict_endpoint_healthy()
    test_predict_with_sensor_data()
    test_history_and_stats()
    print("ALL API TESTS PASSED SUCCESSFULLY!")
