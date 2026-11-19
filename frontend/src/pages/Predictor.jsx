import React, { useState, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, Sliders, CheckCircle2, 
  AlertTriangle, Droplets, Zap, HelpCircle, ShieldAlert, 
  RotateCcw, Sparkles, Thermometer, Wind, Gauge, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { predictPlantHealth } from '../services/api';

export default function Predictor({ sampleLeaves, onPredictionSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [threshold, setThreshold] = useState(0.65);
  const [showSensors, setShowSensors] = useState(false);
  
  // Sensor fields
  const [soilMoisture, setSoilMoisture] = useState('');
  const [canopyTemp, setCanopyTemp] = useState('');
  const [ambientTemp, setAmbientTemp] = useState('');
  const [humidity, setHumidity] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleSampleClick = async (sample) => {
    try {
      setLoading(true);
      setError(null);
      // Fetch sample image from backend
      const res = await fetch(`/api/samples/${sample.filename}`);
      if (!res.ok) throw new Error('Could not load sample image');
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Auto-set realistic sensor values for water-stressed sample to show fusion
      if (sample.category === 'Water_Stressed') {
        setSoilMoisture('27.5');
        setCanopyTemp('33.8');
        setAmbientTemp('31.2');
        setHumidity('52');
        setShowSensors(true);
      } else {
        setSoilMoisture('');
        setCanopyTemp('');
        setAmbientTemp('');
        setHumidity('');
      }

      setResult(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      setError('Please select or upload a paddy leaf image first.');
      return;
    }

    setLoading(true);
    setError(null);

    const sensorData = {
      soil_moisture: soilMoisture,
      canopy_temp: canopyTemp,
      ambient_temp: ambientTemp,
      humidity: humidity
    };

    try {
      const data = await predictPlantHealth(selectedFile, threshold, sensorData);
      setResult(data);
      if (onPredictionSuccess) onPredictionSuccess();
    } catch (err) {
      setError(err.message || 'Inference failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setSoilMoisture('');
    setCanopyTemp('');
    setAmbientTemp('');
    setHumidity('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Prepare chart data for probabilities
  const probData = result ? [
    { name: 'Healthy', prob: Math.round(result.probabilities.Healthy * 100), color: '#10b981' },
    { name: 'Water Stressed', prob: Math.round(result.probabilities.Water_Stressed * 100), color: '#f59e0b' },
    { name: 'Nutrient Def.', prob: Math.round(result.probabilities.Nutrient_deficient * 100), color: '#8b5cf6' },
    { name: 'Diseased', prob: Math.round(result.probabilities.Diseased * 100), color: '#f43f5e' },
  ] : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Paddy Health Prediction & Threshold Assessment
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Upload a high-resolution paddy leaf image, tune the minimum confidence threshold, and inspect sensor-augmented classification.
        </p>
      </div>

      {/* Main Grid: Upload & Inputs on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Parameters */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upload Area */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              1. Leaf Imagery Upload
            </label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                previewUrl 
                  ? 'border-emerald-500/40 bg-emerald-500/5' 
                  : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-900/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <div className="relative mx-auto w-44 h-44 rounded-lg overflow-hidden border border-emerald-500/30 shadow-lg bg-black">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-slate-300 font-mono truncate max-w-xs mx-auto">
                    {selectedFile?.name}
                  </p>
                  <p className="text-[11px] text-emerald-400">Click to choose a different photo</p>
                </div>
              ) : (
                <div className="py-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-emerald-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    Drag & drop leaf photo here, or browse
                  </p>
                  <p className="text-xs text-slate-500">
                    Supports JPG, PNG, WEBP (Standard RGB)
                  </p>
                </div>
              )}
            </div>

            {/* Quick Test Samples */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or test with verified sample leaves:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {sampleLeaves?.map((sample) => (
                  <button
                    key={sample.filename}
                    onClick={() => handleSampleClick(sample)}
                    className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/30 text-left transition text-xs"
                  >
                    <span className="font-semibold block text-slate-200 truncate">
                      {sample.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Click to load
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Threshold Slider */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  2. Minimum Confidence Threshold
                </label>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {Math.round(threshold * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0.50"
              max="0.90"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>50% (Permissive)</span>
              <span>Default (65%)</span>
              <span>90% (Strict)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Predictions with confidence below this threshold will be flagged as <strong>Uncertain / Inconclusive</strong> to avoid premature or inaccurate agricultural interventions.
            </p>
          </div>

          {/* Optional Edge Sensors Form (Accordion) */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setShowSensors(!showSensors)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  3. Edge Sensor Validation (Optional)
                </span>
              </div>
              {showSensors ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showSensors && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                <p className="text-[11px] text-slate-400">
                  Integrates with Raspberry Pi Zero 2W sensor telemetry (soil moisture probe & thermal camera) to validate transpiration and moisture stress.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Droplets className="w-3 h-3 text-amber-400" />
                      <span>Soil Moisture (%)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 28.5"
                      value={soilMoisture}
                      onChange={(e) => setSoilMoisture(e.target.value)}
                      className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Thermometer className="w-3 h-3 text-rose-400" />
                      <span>Canopy Temp (°C)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 34.0"
                      value={canopyTemp}
                      onChange={(e) => setCanopyTemp(e.target.value)}
                      className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Thermometer className="w-3 h-3 text-slate-400" />
                      <span>Ambient Temp (°C)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 31.0"
                      value={ambientTemp}
                      onChange={(e) => setAmbientTemp(e.target.value)}
                      className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Wind className="w-3 h-3 text-cyan-400" />
                      <span>Humidity (%)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 65"
                      value={humidity}
                      onChange={(e) => setHumidity(e.target.value)}
                      className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handlePredict}
              disabled={loading || !selectedFile}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-lg transition ${
                loading || !selectedFile
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Processing Model Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Classify Plant Health</span>
                </>
              )}
            </button>

            {previewUrl && (
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm transition"
                title="Reset Image"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Prediction Results & Agronomic Guidance */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Classification Outcome Card */}
              <div className={`glass-panel p-6 rounded-2xl border ${
                result.is_uncertain 
                  ? 'border-amber-500/40 bg-amber-500/5' 
                  : result.predicted_category === 'Healthy'
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : result.predicted_category === 'Water_Stressed'
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : result.predicted_category === 'Nutrient_deficient'
                  ? 'border-purple-500/40 bg-purple-500/5'
                  : 'border-rose-500/40 bg-rose-500/5'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                    Preliminary Classification Result
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ID: {result.id.slice(0, 8)}...
                  </span>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Assessed Status:</span>
                    <span className={`text-2xl sm:text-3xl font-extrabold uppercase tracking-tight ${
                      result.is_uncertain 
                        ? 'text-amber-300' 
                        : result.predicted_category === 'Healthy'
                        ? 'text-emerald-400'
                        : result.predicted_category === 'Water_Stressed'
                        ? 'text-amber-400'
                        : result.predicted_category === 'Nutrient_deficient'
                        ? 'text-purple-400'
                        : 'text-rose-400'
                    }`}>
                      {result.status_label}
                    </span>
                  </div>

                  {/* Confidence Badge */}
                  <div className="bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-800 text-right">
                    <span className="text-[11px] text-slate-400 block">Model Confidence</span>
                    <span className="text-2xl font-mono font-extrabold text-white">
                      {result.confidence_percentage}%
                    </span>
                  </div>
                </div>

                {/* Threshold Alert & Warning */}
                {result.is_uncertain && (
                  <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Threshold Warning:</span>
                      <p className="mt-0.5 text-amber-300/90">{result.warning}</p>
                    </div>
                  </div>
                )}

                {/* Sensor Fusion Assessment if available */}
                {result.sensor_evaluation && (
                  <div className="mt-4 p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-200 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-teal-300">
                      <Gauge className="w-4 h-4" />
                      <span>Edge Sensor Correlation</span>
                    </div>
                    {Object.entries(result.sensor_evaluation).map(([k, v]) => (
                      <p key={k} className="text-teal-200/90">• {v}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Probabilities Distribution */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Category Probability Breakdown
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Full 4-class Softmax distribution produced by MobileNetV2
                </p>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={probData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
                      <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={90} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(val) => [`${val}%`, 'Probability']}
                      />
                      <Bar dataKey="prob" radius={[0, 4, 4, 0]}>
                        {probData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Agronomic Recommendations */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Recommended Agronomic Actions
                  </h3>
                </div>
                <ul className="space-y-2 mt-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mandatory Agricultural Disclaimer */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <p>{result.disclaimer}</p>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-200">Awaiting Leaf Image</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Select an image on the left or click any sample leaf button to view the prediction breakdown, threshold assessment, and field guidelines.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
