const API_BASE = '/api';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function predictPlantHealth(file, threshold = 0.65, sensorData = null) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('threshold', threshold.toString());

  if (sensorData) {
    if (sensorData.soil_moisture !== undefined && sensorData.soil_moisture !== '') {
      formData.append('soil_moisture', sensorData.soil_moisture);
    }
    if (sensorData.canopy_temp !== undefined && sensorData.canopy_temp !== '') {
      formData.append('canopy_temp', sensorData.canopy_temp);
    }
    if (sensorData.ambient_temp !== undefined && sensorData.ambient_temp !== '') {
      formData.append('ambient_temp', sensorData.ambient_temp);
    }
    if (sensorData.humidity !== undefined && sensorData.humidity !== '') {
      formData.append('humidity', sensorData.humidity);
    }
  }

  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Prediction request failed' }));
    throw new Error(errorData.detail || 'Prediction failed');
  }

  return res.json();
}

export async function fetchHistory(limit = 50) {
  const res = await fetch(`${API_BASE}/history?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to load history');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export async function fetchSampleLeaves() {
  const res = await fetch(`${API_BASE}/samples`);
  if (!res.ok) throw new Error('Failed to load sample leaves');
  return res.json();
}

export async function fetchModelMetrics() {
  const res = await fetch(`${API_BASE}/model-metrics`);
  if (!res.ok) throw new Error('Failed to load model metrics');
  return res.json();
}
