# Raspberry Pi Zero 2W Edge Deployment Guide

This guide details how to flash, wire, and execute the quantized TFLite Paddy Health Classification model on a Raspberry Pi Zero 2W for in-field crop health monitoring.

---

## 1. Hardware Bill of Materials (BOM)

| Component | Function | Interface |
| :--- | :--- | :--- |
| **Raspberry Pi Zero 2W** | Edge Compute (ARM Cortex-A53 quad-core, 512MB RAM) | Host Controller |
| **Raspberry Pi Camera Module v2 / v3** | Captures high-res leaf images (resized to 224x224 RGB) | Mini CSI Port |
| **Capacitive Soil Moisture Sensor v1.2** | Corrosion-resistant root-zone soil water content | ADC (ADS1115 I2C) |
| **MLX90614 or AMG8833 Thermal IR** | Non-contact canopy temperature (CWSI index) | I2C (Pin 3 SDA, Pin 5 SCL) |
| **DHT22 / AM2302 Sensor** | Ambient temperature & relative humidity | GPIO 4 (Pin 7) |

---

## 2. Raspberry Pi OS Setup

1. **Flash OS:** Flash **Raspberry Pi OS Lite (64-bit)** using Raspberry Pi Imager.
2. **Enable Interfaces:**
   ```bash
   sudo raspi-config
   # Interface Options -> Enable Camera (libcamera / picam2)
   # Interface Options -> Enable I2C
   ```
3. **Install Dependencies:**
   ```bash
   sudo apt update && sudo apt install -y python3-pip python3-pil python3-numpy libcamera-dev
   pip3 install tflite-runtime requests
   ```

---

## 3. Running Edge Inference

Copy the quantized model and script to the Raspberry Pi:
```bash
scp backend/models/paddy_mobilenetv2_4class.tflite pi@raspberrypi.local:~/
scp edge_raspberry_pi/pi_zero_camera_inference.py pi@raspberrypi.local:~/
```

Execute on the Pi:
```bash
python3 pi_zero_camera_inference.py \
  --model paddy_mobilenetv2_4class.tflite \
  --image camera \
  --threshold 0.65 \
  --api-sync http://<SERVER_IP>:8000/api/predict
```

---

## 4. Running as a Systemd Service (Autonomous Field Mode)

To run continuously upon boot:
1. Create `/etc/systemd/system/paddy-edge.service`:
   ```ini
   [Unit]
   Description=Paddy Health Edge IoT Classifier
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi
   ExecStart=/usr/bin/python3 /home/pi/pi_zero_camera_inference.py --model /home/pi/paddy_mobilenetv2_4class.tflite --image camera --threshold 0.65
   Restart=always
   RestartSec=30

   [Install]
   WantedBy=multi-user.target
   ```
2. Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable paddy-edge.service
   sudo systemctl start paddy-edge.service
   ```
