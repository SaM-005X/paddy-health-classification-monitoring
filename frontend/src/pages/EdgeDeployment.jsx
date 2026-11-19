import React, { useState } from 'react';
import { Cpu, Camera, Droplets, Thermometer, Terminal, CheckCircle2, Copy, Download, HardDrive } from 'lucide-react';

export default function EdgeDeployment() {
  const [copied, setCopied] = useState(false);

  const command = `python3 pi_zero_camera_inference.py --model paddy_mobilenetv2_4class.tflite --threshold 0.65 --api-sync http://<SERVER_IP>:8000/api/predict`;

  const copyCommand = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Raspberry Pi Zero 2W Edge Deployment
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Hardware configuration, edge sensor integration, and standalone TFLite inference for in-field IoT monitoring.
        </p>
      </div>

      {/* Hardware Specs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-teal-500/20 bg-teal-500/5">
          <div className="flex items-center space-x-2 text-teal-400 mb-2">
            <Cpu className="w-5 h-5" />
            <span className="text-xs font-bold uppercase">Target Hardware</span>
          </div>
          <p className="text-xl font-bold text-white">Raspberry Pi Zero 2W</p>
          <p className="mt-1 text-xs text-slate-400">Quad-core 64-bit ARM Cortex-A53 @ 1.0 GHz, 512 MB LPDDR2</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center space-x-2 text-emerald-400 mb-2">
            <HardDrive className="w-5 h-5" />
            <span className="text-xs font-bold uppercase">Edge Model</span>
          </div>
          <p className="text-xl font-bold text-white">MobileNetV2 (TFLite)</p>
          <p className="mt-1 text-xs text-slate-400">4.65 MB Quantized (FP16/XNNPACK) • ~110 ms latency</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
          <div className="flex items-center space-x-2 text-cyan-400 mb-2">
            <Droplets className="w-5 h-5" />
            <span className="text-xs font-bold uppercase">Sensors Integrated</span>
          </div>
          <p className="text-xl font-bold text-white">Multimodal Fusion</p>
          <p className="mt-1 text-xs text-slate-400">Pi Camera + Soil Moisture + DHT22 + Thermal IR</p>
        </div>
      </div>

      {/* GPIO Wiring & Pinout Guide */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white">Hardware Wiring & Sensor Pinout</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase">
              <Camera className="w-4 h-4" />
              <span>1. Raspberry Pi Camera Module</span>
            </div>
            <p className="text-xs text-slate-300">
              Connect to the mini CSI ribbon cable port on the Pi Zero 2W. Enables real-time video capture and periodic leaf snapshots at 224x224 RGB.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase">
              <Droplets className="w-4 h-4" />
              <span>2. Capacitive Soil Moisture Sensor</span>
            </div>
            <p className="text-xs text-slate-300">
              Connected via ADS1115 I2C ADC (SDA GPIO 2, SCL GPIO 3). VCC to 3.3V, GND to Pin 6. Provides 0-100% soil moisture telemetry.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase">
              <Thermometer className="w-4 h-4" />
              <span>3. MLX90614 Infrared Thermal Sensor</span>
            </div>
            <p className="text-xs text-slate-300">
              Measures non-contact canopy temperature. Connected to I2C bus (0x5A). Computes Crop Water Stress Index via ΔT = T_canopy - T_air.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase">
              <Thermometer className="w-4 h-4" />
              <span>4. DHT22 Ambient Sensor</span>
            </div>
            <p className="text-xs text-slate-300">
              Data pin connected to GPIO 4 (Pin 7). 10k pull-up resistor to 3.3V. Measures ambient air temperature and relative humidity.
            </p>
          </div>
        </div>
      </div>

      {/* Terminal Command for Running Edge Script */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Running the Edge Inference Script
            </h3>
          </div>
          <button
            onClick={copyCommand}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Command'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
          {command}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The edge script runs directly on the Raspberry Pi Zero 2W using the TFLite runtime. It periodically captures leaf frames from the camera, queries I2C/GPIO sensors, performs local inference with confidence thresholding, and syncs telemetry with this web monitoring server.
        </p>
      </div>
    </div>
  );
}
