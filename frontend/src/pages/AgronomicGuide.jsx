import React, { useState } from 'react';
import { 
  Sprout, Droplets, Zap, AlertTriangle, ShieldAlert, 
  CheckCircle2, BookOpen, Layers, Info 
} from 'lucide-react';

export default function AgronomicGuide() {
  const [selectedCat, setSelectedCat] = useState('Healthy');

  const categories = [
    {
      id: 'Healthy',
      title: 'Healthy Condition',
      icon: Sprout,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      symptoms: [
        'Uniform chlorophyll distribution with deep green pigmentation.',
        'Turgid, upright leaf posture with no inward longitudinal rolling.',
        'Absence of fungal lesions, bacterial water-soaked streaks, or insect scraping.',
        'Balanced vegetative tillering and clean leaf sheaths.'
      ],
      sensorBenchmarks: 'Soil Moisture: 45% - 75% • Canopy-Air Temperature Delta: -1.0°C to +0.5°C',
      recommendedPractices: [
        'Maintain recommended water level of 2-5 cm during vegetative tillering.',
        'Follow scheduled NPK split-dosing (avoid excessive nitrogen which predisposes crop to blast).',
        'Weed field bunds regularly to eliminate secondary pathogen hosts.'
      ]
    },
    {
      id: 'Water_Stressed',
      title: 'Water Stressed (Drought / Transpiration Deficit)',
      icon: Droplets,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      symptoms: [
        'Inward longitudinal leaf rolling (wilting) along the midrib (IRRI SES Score 1 to 5).',
        'Dull grayish-green leaf blade losing natural turgor pressure.',
        'Drying and tip scorching without fungal halos.',
        'Stunted tiller emergence and reduced transpiration rate.'
      ],
      sensorBenchmarks: 'Soil Moisture: < 35% • Canopy-Air Temperature Delta: > +1.5°C (Stomatal closure)',
      recommendedPractices: [
        'Provide immediate supplemental irrigation to replenish root-zone saturation.',
        'Avoid applying urea fertilizers while leaves are wilted or curled.',
        'Inspect bund boundaries for burrow holes or perimeter seepage.',
        'For rainfed plots, practice intermittent drying with timely re-flooding.'
      ]
    },
    {
      id: 'Nutrient_deficient',
      title: 'Nutrient Deficient (N, P, K Stress)',
      icon: Zap,
      color: 'text-purple-400',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      symptoms: [
        'Nitrogen (N): General chlorosis starting as uniform pale yellowing on older leaf tips moving downward.',
        'Potassium (K): Marginal leaf scorch, dark brown necrosis along blade edges with yellowish midribs.',
        'Phosphorus (P): Stunted tillering, narrow dark bluish-green leaves with purplish pigmentation.',
        'Absence of discrete sporulating pathogen centers.'
      ],
      sensorBenchmarks: 'Soil pH: 5.5 - 6.8 • Visual Chlorophyll Meter (SPAD) Index < 32',
      recommendedPractices: [
        'For N-deficiency: Top-dress with Urea (20-25 kg/ha) or neem-coated slow-release urea.',
        'For K-deficiency: Apply Muriate of Potash (MOP) to enhance stalk strength and drought tolerance.',
        'For P-deficiency: Apply Single Super Phosphate (SSP) or DAP at early tillering.',
        'Conduct a comprehensive soil laboratory nutrient profile (EC, pH, organic carbon).'
      ]
    },
    {
      id: 'Diseased',
      title: 'Diseased (Biotic Pathogens & Insect Damage)',
      icon: AlertTriangle,
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      symptoms: [
        'Bacterial Leaf Blight (BLB): Water-soaked lesions starting at margins turning yellow to grayish-white.',
        'Blast (Pyricularia oryzae): Spindle/diamond-shaped eye spots with dark brown margins and gray ash centers.',
        'Brown Spot (Bipolaris oryzae): Oval, circular dark brown lesions with yellow halo rings.',
        'Hispa & Leaf Folder: Longitudinal white scrape marks or rolled leaf blades stitched with silk.'
      ],
      sensorBenchmarks: 'Relative Humidity > 85% • Wet foliage duration > 8 hours',
      recommendedPractices: [
        'For Bacterial Blight: Drain standing water temporarily; avoid high nitrogen fertilization.',
        'For Blast: Apply approved fungicides (e.g. Tricyclazole 75 WP or Azoxystrobin) per extension guidelines.',
        'For Hispa/Leaf Folder: Clip damaged leaf tips during weeding; deploy light traps.',
        'Adhere to Integrated Pest Management (IPM) thresholds before chemical spray.'
      ]
    }
  ];

  const current = categories.find(c => c.id === selectedCat) || categories[0];
  const Icon = current.icon;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Paddy Health Field Pathology & Agronomic Guide
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Diagnostic symptom profiles, sensor benchmarks, and remediation protocols for the four target health conditions.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map((c) => {
          const TabIcon = c.icon;
          const isSelected = selectedCat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`p-4 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'glass-panel border-emerald-500/50 bg-emerald-500/10 shadow-lg'
                  : 'glass-card border-slate-800 hover:border-slate-700'
              }`}
            >
              <TabIcon className={`w-5 h-5 ${c.color}`} />
              <span className="font-bold text-xs text-white block mt-2">
                {c.title.split(' (')[0]}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {c.id.replace('_', ' ')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Condition Detail Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <Icon className={`w-6 h-6 ${current.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{current.title}</h2>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border mt-1 ${current.badgeBg}`}>
                Target Health Category: {current.id}
              </span>
            </div>
          </div>
        </div>

        {/* Symptoms Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Primary Visual & Agronomic Symptoms
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {current.symptoms.map((s, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-2.5">
                <span className={`font-bold text-sm ${current.color}`}>•</span>
                <span className="text-xs text-slate-300 leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sensor Benchmarks */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider block">
            Correlated Edge Sensor Benchmarks (Raspberry Pi Zero 2W)
          </span>
          <p className="text-xs text-slate-300 font-mono">{current.sensorBenchmarks}</p>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Recommended Management Protocols
          </h3>
          <ul className="space-y-2">
            {current.recommendedPractices.map((act, i) => (
              <li key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <p>
            Disclaimer: All predictions generated by the AI classifier represent preliminary screening indications. For statutory agricultural subsidies, insurance claims, or heavy pesticide applications, always consult a certified agricultural officer or district university extension pathologist.
          </p>
        </div>
      </div>
    </div>
  );
}
