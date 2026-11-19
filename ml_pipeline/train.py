"""
Paddy Health Model Training Pipeline
Uses MobileNetV2 with Transfer Learning for 4-Class Classification:
1. Healthy
2. Water_Stressed
3. Nutrient_deficient
4. Diseased
"""

import os
import sys
import json
import logging
from pathlib import Path
import numpy as np
import tensorflow as tf

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Suppress verbose TF warnings
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data" / "processed"
TRAIN_DIR = DATA_DIR / "train"
VAL_DIR = DATA_DIR / "val"

BACKEND_MODELS_DIR = BASE_DIR.parent / "backend" / "models"
BACKEND_MODELS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_OUTPUT_PATH = BACKEND_MODELS_DIR / "paddy_mobilenetv2_4class.keras"
LABELS_OUTPUT_PATH = BACKEND_MODELS_DIR / "class_labels.json"

CATEGORIES = ["Healthy", "Water_Stressed", "Nutrient_deficient", "Diseased"]
IMG_SIZE = (224, 224)
BATCH_SIZE = 16

def create_datasets():
    logger.info("Loading training and validation datasets...")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        TRAIN_DIR,
        labels="inferred",
        label_mode="categorical",
        class_names=CATEGORIES,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=True,
        seed=42
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        VAL_DIR,
        labels="inferred",
        label_mode="categorical",
        class_names=CATEGORIES,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=False,
        seed=42
    )

    # Performance optimization
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    return train_ds, val_ds

def build_model(num_classes: int = 4):
    logger.info("Instantiating MobileNetV2 backbone with ImageNet pretrained weights...")

    # Data Augmentation layer
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.08),
        tf.keras.layers.RandomZoom(0.08),
    ], name="data_augmentation")

    # MobileNetV2 base
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3),
        include_top=False,
        weights="imagenet"
    )
    base_model.trainable = False  # Freeze for initial transfer learning

    # Model definition
    inputs = tf.keras.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3), name="leaf_image_input")
    x = data_augmentation(inputs)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D(name="avg_pool")(x)
    x = tf.keras.layers.BatchNormalization(name="batch_norm")(x)
    x = tf.keras.layers.Dropout(0.35, name="dropout_1")(x)
    x = tf.keras.layers.Dense(128, activation="relu", name="dense_features")(x)
    x = tf.keras.layers.Dropout(0.2, name="dropout_2")(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="paddy_class_probabilities")(x)

    model = tf.keras.Model(inputs, outputs, name="Paddy_MobileNetV2_Classifier")
    return model, base_model

def train():
    train_ds, val_ds = create_datasets()
    model, base_model = build_model(num_classes=len(CATEGORIES))

    # Phase 1: Feature Extraction
    logger.info("Phase 1: Training top classification layers...")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.Precision(name="precision"), tf.keras.metrics.Recall(name="recall")]
    )

    history_phase1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=6,
        verbose=1
    )

    # Phase 2: Fine-Tuning
    logger.info("Phase 2: Fine-tuning top layers of MobileNetV2...")
    base_model.trainable = True
    # Freeze the first 100 layers and unfreeze the remaining
    for layer in base_model.layers[:100]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),  # Low learning rate for fine tuning
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.Precision(name="precision"), tf.keras.metrics.Recall(name="recall")]
    )

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=3,
            restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-6
        )
    ]

    history_phase2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=8,
        callbacks=callbacks,
        verbose=1
    )

    # Save model and labels
    logger.info("Saving trained Keras model to %s", MODEL_OUTPUT_PATH)
    model.save(str(MODEL_OUTPUT_PATH))

    with open(LABELS_OUTPUT_PATH, "w") as f:
        json.dump(CATEGORIES, f, indent=2)
    logger.info("Saved class labels to %s", LABELS_OUTPUT_PATH)

    return model

if __name__ == "__main__":
    train()
