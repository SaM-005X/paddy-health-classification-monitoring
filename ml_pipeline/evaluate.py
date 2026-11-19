"""
Paddy Health Model Evaluation Script
Computes Accuracy, Precision, Recall, F1-Score, and Confusion Matrix
on the unseen test dataset split.
"""

import os
import json
import logging
from pathlib import Path
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

BASE_DIR = Path(__file__).resolve().parent
TEST_DIR = BASE_DIR / "data" / "processed" / "test"
BACKEND_MODELS_DIR = BASE_DIR.parent / "backend" / "models"
MODEL_PATH = BACKEND_MODELS_DIR / "paddy_mobilenetv2_4class.keras"
LABELS_PATH = BACKEND_MODELS_DIR / "class_labels.json"
REPORT_PATH = BACKEND_MODELS_DIR / "evaluation_report.json"

CATEGORIES = ["Healthy", "Water_Stressed", "Nutrient_deficient", "Diseased"]
IMG_SIZE = (224, 224)

def evaluate():
    logger.info("Loading test dataset from %s", TEST_DIR)
    test_ds = tf.keras.utils.image_dataset_from_directory(
        TEST_DIR,
        labels="inferred",
        label_mode="categorical",
        class_names=CATEGORIES,
        image_size=IMG_SIZE,
        batch_size=16,
        shuffle=False
    )

    logger.info("Loading trained model from %s", MODEL_PATH)
    model = tf.keras.models.load_model(str(MODEL_PATH))

    # Collect true labels and predictions
    y_true_list = []
    y_pred_probs_list = []

    for images, labels in test_ds:
        probs = model.predict(images, verbose=0)
        y_true_list.append(labels.numpy())
        y_pred_probs_list.append(probs)

    y_true = np.concatenate(y_true_list, axis=0)
    y_pred_probs = np.concatenate(y_pred_probs_list, axis=0)

    y_true_idx = np.argmax(y_true, axis=1)
    y_pred_idx = np.argmax(y_pred_probs, axis=1)

    acc = float(accuracy_score(y_true_idx, y_pred_idx))
    macro_f1 = float(f1_score(y_true_idx, y_pred_idx, average="macro"))
    weighted_f1 = float(f1_score(y_true_idx, y_pred_idx, average="weighted"))

    cm = confusion_matrix(y_true_idx, y_pred_idx).tolist()
    clf_report = classification_report(
        y_true_idx,
        y_pred_idx,
        target_names=CATEGORIES,
        output_dict=True
    )

    class_metrics = {}
    for cat in CATEGORIES:
        if cat in clf_report:
            class_metrics[cat] = {
                "precision": round(clf_report[cat]["precision"], 4),
                "recall": round(clf_report[cat]["recall"], 4),
                "f1_score": round(clf_report[cat]["f1-score"], 4),
                "support": int(clf_report[cat]["support"])
            }

    evaluation_summary = {
        "model_name": "MobileNetV2 (4-Class Paddy Health)",
        "input_resolution": [224, 224, 3],
        "classes": CATEGORIES,
        "total_test_samples": len(y_true_idx),
        "accuracy": round(acc, 4),
        "macro_f1": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
        "class_metrics": class_metrics,
        "confusion_matrix": cm,
        "threshold_policy": {
            "default_threshold": 0.65,
            "margin_uncertainty_threshold": 0.15
        }
    }

    with open(REPORT_PATH, "w") as f:
        json.dump(evaluation_summary, f, indent=2)

    logger.info("Evaluation Complete!")
    logger.info("Accuracy: %.2f%% | Macro F1: %.4f", acc * 100, macro_f1)
    logger.info("Confusion Matrix: %s", cm)
    logger.info("Saved evaluation report to %s", REPORT_PATH)

if __name__ == "__main__":
    evaluate()
