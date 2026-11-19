import React from 'react';
import { 
  Activity, ShieldCheck, Droplets, Zap, AlertTriangle, 
  HelpCircle, TrendingUp, Cpu, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function Dashboard({ stats, history, setActiveTab }) {
  const categoryCounts = stats?.category_counts || {
    Healthy: 0,
    Water_Stressed: 0,
    Nutrient_deficient: 0,
    Diseased: 0
  };

  const total = stats?.total_predictions || 0;
  const uncertainCount = stats?.uncertain_count || 0;
  const avgConfidence = stats?.average_confidence || 0;

  const chartData = [
    { name: 'Healthy', count: categoryCounts.Healthy, color: '#10b981' },
    { name: 'Water Stressed', count: categoryCounts.Water_Stressed, color: '#f59e0b' },
    { name: 'Nutrient Deficient', count: categoryCounts.Nutrient_deficient, color: '#8b5cf6' },
    { name: 'Diseased', count: categoryCounts.Diseased, color: '#f43f5e' },
  ];

  const pieData = chartData.filter(d => d.count > 0);
  if (uncertainCount > 0) {
    pieData.push({ name: 'Uncertain', count: uncertainCount, color: '#64748b' });
  }

  const latestScan = history && history.length > 0 ? history[0] : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-950/80">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Operational Stage • 4-Class Threshold Indicator Active</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Paddy Health Classification & Monitoring Dashboard
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Edge-calibrated AI system assessing Oryza sativa health across four distinct categories. Equipped with dynamic confidence thresholding, uncertainty mitigation, and edge sensor fusion ready for Raspberry Pi Zero 2W.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('predictor')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition-all duration-200"
            >
              <Zap className="w-4 h-4" />
              <span>Run Leaf Scan</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-sm font-medium border border-slate-700 transition"
            >
              <span>Field Pathology Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Scans */}
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Total Scans</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">{total}</p>
          <p className="mt-1 text-[11px] text-slate-400">Processed in SQLite</p>
        </div>

        {/* Healthy */}
        <div className="glass-card p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase">Healthy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-300">{categoryCounts.Healthy}</p>
          <p className="mt-1 text-[11px] text-emerald-400/80">
            {total > 0 ? `${Math.round((categoryCounts.Healthy / total) * 100)}% of total` : '0%'}
          </p>
        </div>

        {/* Water Stressed */}
        <div className="glass-card p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase">Water Stressed</span>
            <Droplets className="w-4 h-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-300">{categoryCounts.Water_Stressed}</p>
          <p className="mt-1 text-[11px] text-amber-400/80">
            {total > 0 ? `${Math.round((categoryCounts.Water_Stressed / total) * 100)}% of total` : '0%'}
          </p>
        </div>

        {/* Nutrient Deficient */}
        <div className="glass-card p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-semibold uppercase">Nutrient Def.</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-purple-300">{categoryCounts.Nutrient_deficient}</p>
          <p className="mt-1 text-[11px] text-purple-400/80">
            {total > 0 ? `${Math.round((categoryCounts.Nutrient_deficient / total) * 100)}% of total` : '0%'}
          </p>
        </div>

        {/* Diseased */}
        <div className="glass-card p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase">Diseased</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-rose-300">{categoryCounts.Diseased}</p>
          <p className="mt-1 text-[11px] text-rose-400/80">
            {total > 0 ? `${Math.round((categoryCounts.Diseased / total) * 100)}% of total` : '0%'}
          </p>
        </div>

        {/* Uncertain / Low Conf */}
        <div className="glass-card p-4 rounded-xl border border-slate-700 bg-slate-800/40">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Uncertain</span>
            <HelpCircle className="w-4 h-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-300">{uncertainCount}</p>
          <p className="mt-1 text-[11px] text-slate-400">&lt; Minimum Threshold</p>
        </div>
      </div>

      {/* Visual Analytics & Latest Scan Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart Distribution */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Health Classification Distribution</h2>
              <p className="text-xs text-slate-400">Comparison across the 4 primary health categories</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-emerald-400">
              Avg Conf: {avgConfidence}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Prediction Spotlight */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Latest Assessment</span>
              <span className="text-xs text-slate-500 font-mono">
                {latestScan ? new Date(latestScan.timestamp).toLocaleTimeString() : 'N/A'}
              </span>
            </div>

            {latestScan ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Identified Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    latestScan.is_uncertain 
                      ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                      : latestScan.predicted_category === 'Healthy'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : latestScan.predicted_category === 'Water_Stressed'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : latestScan.predicted_category === 'Nutrient_deficient'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {latestScan.is_uncertain ? 'Uncertain / Low Conf' : latestScan.predicted_category.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Model Confidence</span>
                    <span className="font-mono text-white font-bold">{Math.round(latestScan.confidence_score * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        latestScan.is_uncertain ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.round(latestScan.confidence_score * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                  <span className="font-semibold text-slate-200">Applied Threshold:</span>
                  <p className="text-slate-400">Min. required: {Math.round(latestScan.threshold_applied * 100)}%</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                No recent predictions logged yet. Run your first leaf scan to see live feedback.
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('history')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition text-center"
          >
            View Complete Scan History
          </button>
        </div>
      </div>
    </div>
  );
}
