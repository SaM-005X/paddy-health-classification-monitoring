import React, { useState, useEffect } from 'react';
import { 
  Clock, Download, Filter, Search, CheckCircle2, 
  AlertTriangle, Droplets, Zap, HelpCircle, FileText, BarChart2 
} from 'lucide-react';
import { fetchModelMetrics } from '../services/api';

export default function ResultsHistory({ history }) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [activeView, setActiveView] = useState('history'); // 'history' or 'metrics'

  useEffect(() => {
    fetchModelMetrics()
      .then(data => setMetrics(data))
      .catch(err => console.error("Could not fetch metrics:", err));
  }, []);

  const filteredHistory = (history || []).filter((item) => {
    const matchesCategory = 
      filterCategory === 'ALL' || 
      (filterCategory === 'UNCERTAIN' ? item.is_uncertain : item.predicted_category === filterCategory);
    
    const matchesSearch = 
      item.image_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.predicted_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const exportCSV = () => {
    if (!history || history.length === 0) return;
    const headers = ["ID", "Timestamp", "Image_Name", "Predicted_Category", "Confidence_Score", "Threshold_Applied", "Is_Uncertain"];
    const rows = history.map(h => [
      h.id,
      h.timestamp,
      h.image_name,
      h.predicted_category,
      h.confidence_score,
      h.threshold_applied,
      h.is_uncertain ? "YES" : "NO"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `paddy_health_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Prediction History & Model Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Review persistent scan records or inspect the rigorous 4-class evaluation scorecard.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveView('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              activeView === 'history' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Scan History ({history?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveView('metrics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              activeView === 'metrics' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Model Scorecard</span>
          </button>
        </div>
      </div>

      {activeView === 'history' ? (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          {/* Controls: Search, Filter, Export */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by file or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value="ALL">All Categories</option>
                <option value="Healthy">Healthy</option>
                <option value="Water_Stressed">Water Stressed</option>
                <option value="Nutrient_deficient">Nutrient Deficient</option>
                <option value="Diseased">Diseased</option>
                <option value="UNCERTAIN">Uncertain Only</option>
              </select>
            </div>

            <button
              onClick={exportCSV}
              disabled={!history || history.length === 0}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Report</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Image Source</th>
                  <th className="py-3 px-4">Classified Status</th>
                  <th className="py-3 px-4 text-center">Confidence</th>
                  <th className="py-3 px-4 text-center">Threshold</th>
                  <th className="py-3 px-4">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-mono">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(row.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-white font-medium max-w-xs truncate">
                        {row.image_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                          row.is_uncertain 
                            ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                            : row.predicted_category === 'Healthy'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : row.predicted_category === 'Water_Stressed'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : row.predicted_category === 'Nutrient_deficient'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {row.is_uncertain ? 'Uncertain' : row.predicted_category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-200">
                        {Math.round(row.confidence_score * 100)}%
                      </td>
                      <td className="py-3 px-4 text-center text-slate-400">
                        {Math.round(row.threshold_applied * 100)}%
                      </td>
                      <td className="py-3 px-4 font-sans text-xs">
                        {row.is_uncertain ? (
                          <span className="text-amber-400 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Inconclusive</span>
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Accepted</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 font-sans">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Model Scorecard View */
        <div className="space-y-6">
          {metrics ? (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                  <span className="text-xs font-bold text-emerald-400 uppercase">Test Accuracy</span>
                  <p className="mt-1 text-3xl font-extrabold text-white">
                    {Math.round(metrics.accuracy * 100)}%
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Evaluated on 72 unseen test samples</p>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-teal-500/20 bg-teal-500/5">
                  <span className="text-xs font-bold text-teal-400 uppercase">Macro F1-Score</span>
                  <p className="mt-1 text-3xl font-extrabold text-white">
                    {metrics.macro_f1}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Balanced harmonic mean across all 4 classes</p>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
                  <span className="text-xs font-bold text-cyan-400 uppercase">Edge Architecture</span>
                  <p className="mt-1 text-xl font-extrabold text-white">
                    MobileNetV2 (TFLite)
                  </p>
                  <p className="mt-1 text-xs text-slate-400">4.65 MB Quantized • 224x224 RGB Input</p>
                </div>
              </div>

              {/* Confusion Matrix & Class Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Confusion Matrix Table */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-1">
                    4-Class Confusion Matrix
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Rows: True Class • Columns: Predicted Class
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-xs font-mono">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                          <th className="py-2 text-left">True \ Pred</th>
                          {metrics.classes.map(c => (
                            <th key={c} className="py-2 px-2 max-w-[80px] truncate">{c.slice(0, 7)}..</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {metrics.confusion_matrix.map((row, i) => (
                          <tr key={i}>
                            <td className="py-2.5 text-left font-sans text-slate-300 font-semibold">
                              {metrics.classes[i].replace('_', ' ')}
                            </td>
                            {row.map((val, j) => (
                              <td 
                                key={j} 
                                className={`py-2.5 px-3 font-bold rounded ${
                                  i === j && val > 0 
                                    ? 'bg-emerald-500/20 text-emerald-300' 
                                    : val > 0 
                                    ? 'bg-rose-500/20 text-rose-300' 
                                    : 'text-slate-600'
                                }`}
                              >
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Per Class Metrics */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-1">
                    Per-Category Classification Metrics
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Precision, Recall, and F1 performance per target condition
                  </p>

                  <div className="space-y-3">
                    {Object.entries(metrics.class_metrics || {}).map(([cat, m]) => (
                      <div key={cat} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-slate-200 block">
                            {cat.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-500">Support: {m.support} samples</span>
                        </div>
                        <div className="flex space-x-3 text-xs font-mono">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-sans">Prec</span>
                            <span className="text-emerald-400 font-bold">{Math.round(m.precision * 100)}%</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-sans">Rec</span>
                            <span className="text-teal-400 font-bold">{Math.round(m.recall * 100)}%</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-sans">F1</span>
                            <span className="text-white font-bold">{m.f1_score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              Loading model evaluation scorecard...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
