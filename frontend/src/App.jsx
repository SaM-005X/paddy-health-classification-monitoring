import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Predictor from './pages/Predictor';
import ResultsHistory from './pages/ResultsHistory';
import AgronomicGuide from './pages/AgronomicGuide';
import EdgeDeployment from './pages/EdgeDeployment';
import { checkHealth, fetchStats, fetchHistory, fetchSampleLeaves } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendHealth, setBackendHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [sampleLeaves, setSampleLeaves] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadData = async () => {
    try {
      const [healthRes, statsRes, historyRes, samplesRes] = await Promise.all([
        checkHealth().catch(() => ({ status: 'offline' })),
        fetchStats().catch(() => null),
        fetchHistory(50).catch(() => ({ history: [] })),
        fetchSampleLeaves().catch(() => ({ samples: [] }))
      ]);

      setBackendHealth(healthRes);
      setStats(statsRes);
      setHistory(historyRes.history || []);
      setSampleLeaves(samplesRes.samples || []);
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh stats every 15 seconds
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handlePredictionSuccess = () => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        backendHealth={backendHealth} 
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            history={history} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'predictor' && (
          <Predictor 
            sampleLeaves={sampleLeaves} 
            onPredictionSuccess={handlePredictionSuccess} 
          />
        )}

        {activeTab === 'history' && (
          <ResultsHistory 
            history={history} 
          />
        )}

        {activeTab === 'guide' && (
          <AgronomicGuide />
        )}

        {activeTab === 'edge' && (
          <EdgeDeployment />
        )}
      </main>

      {/* Global Footer */}
      <footer className="glass-panel border-t border-slate-900 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Paddy Health Classification and Monitoring System • B.Tech Capstone Project</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>MobileNetV2 (Keras & TFLite)</span>
            <span>•</span>
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>React + Tailwind</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
