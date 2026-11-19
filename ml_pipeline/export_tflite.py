"""
TFLite Model Exporter for Edge Deployment
Quantizes MobileNetV2 for Raspberry Pi Zero 2W execution.
"""

import os
import logging
from pathlib import Path
import numpy as np
import tensorflow as tf

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

BASE_DIR = Path(__file__).resolve().parent
BACKEND_MODELS_DIR = BASE_DIR.parent / "backend" / "models"
MODEL_KERAS_PATH = BACKEND_MODELS_DIR / "paddy_mobilenetv2_4class.keras"
MODEL_TFLITE_PATH = BACKEND_MODELS_DIR / "paddy_mobilenetv2_4class.tflite"

def export_tflite():
    logger.info("Loading Keras model from %s", MODEL_KERAS_PATH)
    model = tf.keras.models.load_model(str(MODEL_KERAS_PATH))

    logger.info("Converting to TensorFlow Lite with dynamic range quantization...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    # Set supported types for optimal ARM / Pi Zero 2W compatibility
    converter.target_spec.supported_types = [tf.float16]

    tflite_model = converter.convert()

    with open(MODEL_TFLITE_PATH, "wb") as f:
        f.write(tflite_model)

    keras_size_mb = os.path.getsize(MODEL_KERAS_PATH) / (1024 * 1024)
    tflite_size_mb = os.path.getsize(MODEL_TFLITE_PATH) / (1024 * 1024)

    logger.info("TFLite Model successfully generated!")
    logger.info("Original Keras Model Size: %.2f MB", keras_size_mb)
    logger.info("Quantized TFLite Model Size: %.2f MB (%.1f%% reduction)", tflite_size_mb, (1 - tflite_size_mb / keras_size_mb) * 100)
    logger.info("Edge Model saved to: %s", MODEL_TFLITE_PATH)

    # Sanity check TFLite inference
    interpreter = tf.lite.Interpreter(model_path=str(MODEL_TFLITE_PATH))
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    dummy_input = np.random.uniform(0, 255, (1, 224, 224, 3)).astype(np.float32)
    interpreter.set_tensor(input_details[0]['index'], dummy_input)
    interpreter.invoke()
    preds = interpreter.get_tensor(output_details[0]['index'])[0]

    logger.info("TFLite verification inference successful! Output shape: %s, sum: %.4f", preds.shape, float(preds.sum()))

if __name__ == "__main__":
    export_tflite()
