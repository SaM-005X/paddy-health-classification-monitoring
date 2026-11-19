import sqlite3
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional
from .config import DB_PATH

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        image_name TEXT NOT NULL,
        predicted_category TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        threshold_applied REAL NOT NULL,
        is_uncertain INTEGER NOT NULL,
        status_label TEXT NOT NULL,
        probabilities_json TEXT NOT NULL,
        sensor_json TEXT,
        recommendations_json TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()

# Auto-initialize on import
init_db()

def save_prediction(
    image_name: str,
    predicted_category: str,
    confidence_score: float,
    threshold_applied: float,
    is_uncertain: bool,
    status_label: str,
    probabilities: Dict[str, float],
    recommendations: List[str],
    sensor_data: Optional[Dict] = None
) -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    record_id = str(uuid.uuid4())
    ts = datetime.now().isoformat()

    cursor.execute("""
    INSERT INTO predictions (
        id, timestamp, image_name, predicted_category,
        confidence_score, threshold_applied, is_uncertain,
        status_label, probabilities_json, sensor_json, recommendations_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record_id,
        ts,
        image_name,
        predicted_category,
        float(confidence_score),
        float(threshold_applied),
        1 if is_uncertain else 0,
        status_label,
        json.dumps(probabilities),
        json.dumps(sensor_data) if sensor_data else None,
        json.dumps(recommendations)
    ))
    conn.commit()
    conn.close()
    return record_id

def get_history(limit: int = 50) -> List[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, timestamp, image_name, predicted_category,
           confidence_score, threshold_applied, is_uncertain,
           status_label, probabilities_json, sensor_json, recommendations_json
    FROM predictions
    ORDER BY timestamp DESC
    LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()

    history = []
    for row in rows:
        history.append({
            "id": row["id"],
            "timestamp": row["timestamp"],
            "image_name": row["image_name"],
            "predicted_category": row["predicted_category"],
            "confidence_score": row["confidence_score"],
            "threshold_applied": row["threshold_applied"],
            "is_uncertain": bool(row["is_uncertain"]),
            "status_label": row["status_label"],
            "probabilities": json.loads(row["probabilities_json"]),
            "sensor_data": json.loads(row["sensor_json"]) if row["sensor_json"] else None,
            "recommendations": json.loads(row["recommendations_json"])
        })
    return history

def get_stats() -> Dict:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM predictions")
    total = cursor.fetchone()[0]

    category_counts = {
        "Healthy": 0,
        "Water_Stressed": 0,
        "Nutrient_deficient": 0,
        "Diseased": 0
    }

    cursor.execute("""
    SELECT predicted_category, COUNT(*) 
    FROM predictions 
    WHERE is_uncertain = 0 
    GROUP BY predicted_category
    """)
    for row in cursor.fetchall():
        if row[0] in category_counts:
            category_counts[row[0]] = row[1]

    cursor.execute("SELECT COUNT(*) FROM predictions WHERE is_uncertain = 1")
    uncertain_count = cursor.fetchone()[0]

    cursor.execute("SELECT AVG(confidence_score) FROM predictions")
    avg_conf_row = cursor.fetchone()
    avg_confidence = float(avg_conf_row[0]) if avg_conf_row[0] is not None else 0.0

    cursor.execute("""
    SELECT timestamp, predicted_category, confidence_score, is_uncertain
    FROM predictions
    ORDER BY timestamp DESC
    LIMIT 10
    """)
    recent = []
    for r in cursor.fetchall():
        recent.append({
            "timestamp": r["timestamp"],
            "category": "Uncertain" if r["is_uncertain"] else r["predicted_category"],
            "confidence": round(r["confidence_score"] * 100, 1)
        })

    conn.close()

    return {
        "total_predictions": total,
        "category_counts": category_counts,
        "uncertain_count": uncertain_count,
        "average_confidence": round(avg_confidence * 100, 1),
        "recent_trend": recent
    }
