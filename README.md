# AI-Powered Paddy Health Classification and Monitoring System

An edge-ready, machine learning-powered health assessment and threshold-indication system for paddy (*Oryza sativa*) crops. Developed to classify plant health into four core categories, provide confidence-based threshold alerts, and deliver an interactive web monitoring dashboard with future Raspberry Pi Zero 2W edge deployment support.

---

## 1. Target Health Categories

| Category | Description | Primary Visual / Sensor Symptoms |
| :--- | :--- | :--- |
| **Healthy** | Vigorous growth, optimal hydration & nutrition | Uniform green pigmentation, upright leaf posture, clear blade |
| **Water_Stressed** | Moisture deficit / transpiration stress | Inward leaf rolling, tip withering, canopy temperature elevation |
| **Nutrient_deficient** | Essential nutrient deficiency (N, P, K) | Chlorosis (yellowing), marginal scorch, purpling or stunted leaf blade |
| **Diseased** | Biotic pathogen damage (fungal / bacterial / pest) | Lesions, water-soaked streaks, blast spots, hispa trails, leaf folder damage |

---

## 2. System Architecture

* **Machine Learning Pipeline:** MobileNetV2 with Transfer Learning, quantized to TFLite for edge execution.
* **Inference Engine:** Confidence thresholding ($\tau_{\text{min}} = 65\%$) and margin uncertainty handling to prevent false diagnoses.
* **Backend API:** FastAPI with asynchronous image processing, SQLite/Supabase history storage, and threshold customization.
* **Frontend Dashboard:** React.js + Tailwind CSS + Chart.js / Recharts for real-time predictions, health trends, and agronomic recommendations.
* **Edge Integration:** Raspberry Pi Zero 2W support with Pi Camera and DHT22/Soil Moisture telemetry scripts.

---

## 3. Directory Layout

```text
paddy-health-monitoring/
├── backend/                  # FastAPI REST service & database
│   ├── app/                  # Application code (API endpoints, services)
<<<<<<< HEAD
│   ├── models/               # Serialized models (.keras, .tflite) and metrics
=======
│   ├── models/               # Serialized models (.h5, .tflite) and metrics
>>>>>>> 01d314d (Initial commit: AI-powered Paddy Health Classification & Monitoring System)
│   └── requirements.txt      # Python dependencies
├── ml_pipeline/              # Dataset builders, model training & evaluation
│   ├── data/                 # Raw and processed datasets (4 classes)
│   ├── train.py              # MobileNetV2 training pipeline
│   ├── evaluate.py           # Metrics, confusion matrix, ROC-AUC
│   └── export_tflite.py      # Edge quantization for Raspberry Pi
├── frontend/                 # React + Tailwind web interface
│   ├── src/                  # Components, pages, and chart visualizations
│   └── package.json
├── edge_raspberry_pi/        # Hardware scripts for Pi Zero 2W & sensors
└── README.md
```

---

<<<<<<< HEAD
## 4. Quick Start

### Start Local Servers
Run the one-click startup script on Windows:
```cmd
start_system.bat
```
Or start manually:
```bash
# 1. Backend API
cd backend
python run_server.py

# 2. Frontend Web UI
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
=======
## 4. Development Workflow

1. **Stage 1:** Feasibility Analysis & Dataset Mapping *(Completed)*
2. **Stage 2:** Dataset Sourcing, Curation & Preprocessing for the 4 Classes
3. **Stage 3:** Model Training (MobileNetV2 Transfer Learning) & TFLite Quantization
4. **Stage 4:** Model Evaluation (Confusion Matrix, Precision/Recall/F1, Threshold Tuning)
5. **Stage 5:** FastAPI Backend Service Implementation
6. **Stage 6:** React Frontend & Dashboard Development
7. **Stage 7:** End-to-End System Testing & Raspberry Pi Deployment Validation
>>>>>>> 01d314d (Initial commit: AI-powered Paddy Health Classification & Monitoring System)
