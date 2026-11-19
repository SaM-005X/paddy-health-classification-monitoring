from typing import Dict, Optional, Tuple
from ..config import DEFAULT_CONFIDENCE_THRESHOLD, MARGIN_UNCERTAINTY_THRESHOLD, CATEGORIES
from .recommendations import get_recommendations_for

def evaluate_threshold_and_sensors(
    probabilities: Dict[str, float],
    threshold: float = DEFAULT_CONFIDENCE_THRESHOLD,
    sensor_data: Optional[Dict[str, float]] = None
) -> Dict:
    """
    Evaluates model probabilities against minimum confidence threshold
    and validates with optional edge sensor readings (soil moisture & thermal differential).
    """
    # Sort categories by probability descending
    sorted_classes = sorted(probabilities.items(), key=lambda x: x[1], reverse=True)
    top_class, top_prob = sorted_classes[0]
    second_class, second_prob = sorted_classes[1] if len(sorted_classes) > 1 else ("", 0.0)

    margin = top_prob - second_prob
    is_uncertain = False
    warning = None
    sensor_eval = {}

    # Check 1: Minimum Confidence Threshold
    if top_prob < threshold:
        is_uncertain = True
        warning = (
            f"Confidence score ({round(top_prob * 100, 1)}%) is below the required threshold of "
            f"{round(threshold * 100, 1)}%. Visual features are ambiguous or inconclusive."
        )
    # Check 2: Close Margin Uncertainty (e.g. 42% vs 40%)
    elif margin < MARGIN_UNCERTAINTY_THRESHOLD:
        is_uncertain = True
        warning = (
            f"Ambiguous prediction between '{top_class}' ({round(top_prob * 100, 1)}%) and "
            f"'{second_class}' ({round(second_prob * 100, 1)}%). The classification margin is too narrow."
        )

    # Check 3: Optional Sensor Fusion (matching Raspberry Pi Zero 2W hardware sensors)
    if sensor_data:
        soil_m = sensor_data.get("soil_moisture")
        canopy_t = sensor_data.get("canopy_temp")
        ambient_t = sensor_data.get("ambient_temp")
        humidity = sensor_data.get("humidity")

        # Soil moisture validation
        if soil_m is not None:
            if soil_m < 35.0:
                sensor_eval["soil_moisture"] = f"CRITICAL: Soil moisture at {soil_m}% indicates moisture deficit."
                if top_class != "Water_Stressed" and not is_uncertain:
                    warning = (warning or "") + " [Sensor Note: Soil moisture is below 35%, crop is at imminent risk of water stress]."
            elif soil_m > 75.0 and top_class == "Water_Stressed":
                sensor_eval["soil_moisture"] = f"ABNORMAL: Soil moisture at {soil_m}% is high, yet water stress symptoms detected. Check for root damage or waterlogging."
            else:
                sensor_eval["soil_moisture"] = f"NORMAL: Soil moisture at {soil_m}% is within nominal range."

        # Thermal differential (CWSI indication)
        if canopy_t is not None and ambient_t is not None:
            delta_t = canopy_t - ambient_t
            sensor_eval["thermal_diff"] = f"Canopy-air temperature delta is {round(delta_t, 2)}°C."
            if delta_t > 1.5:
                sensor_eval["thermal_alert"] = "ELEVATED: Canopy is warmer than ambient air, indicating stomatal closure / transpiration distress."
                if top_class == "Healthy":
                    warning = (warning or "") + " [Thermal Alert: Elevated canopy temperature indicates early unseen water stress]."

        if humidity is not None and humidity > 85.0 and top_class == "Diseased":
            sensor_eval["humidity_alert"] = f"HIGH HUMIDITY: Relative humidity is {humidity}%, creating conducive conditions for fungal sporulation and blast spread."

    # Final status label
    if is_uncertain:
        status_label = "Uncertain / Inconclusive"
        effective_category = "Uncertain"
    else:
        status_label = top_class
        effective_category = top_class

    recs = get_recommendations_for(top_class, is_uncertain=is_uncertain)

    return {
        "predicted_category": top_class,
        "is_uncertain": is_uncertain,
        "status_label": status_label,
        "confidence_score": round(top_prob, 4),
        "confidence_percentage": round(top_prob * 100, 2),
        "threshold_applied": threshold,
        "probabilities": {k: round(v, 4) for k, v in probabilities.items()},
        "sensor_evaluation": sensor_eval if sensor_eval else None,
        "warning": warning,
        "recommendations": recs["actions"],
        "disclaimer": recs["disclaimer"]
    }
