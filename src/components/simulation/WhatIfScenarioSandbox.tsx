import React, { useState } from 'react';
import { useNerves } from '../../context/NervesContext';
import {
  Sliders,
  AlertTriangle,
  Flame,
  CloudRain,
  Truck,
  HeartPulse,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Shield,
  MapPin,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { generateWhatIfAnalysis } from '../../services/aiService';

interface WhatIfScenarioSandboxProps {
  onClose?: () => void;
}

export const WhatIfScenarioSandbox: React.FC<WhatIfScenarioSandboxProps> = ({ onClose }) => {
  const {
    corridors,
    vehicles,
    supplies,
    whatIfState,
    setWhatIfState,
    isWhatIfActive,
    resetWhatIf,
    language,
    t,
  } = useNerves();

  const [aiReport, setAiReport] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Calculate baseline average risk
  const baselineRisk = Math.round(
    corridors.reduce((acc, c) => acc + c.riskScore, 0) / corridors.length
  );

  // Compute stressed risk based on What-If toggles
  let stressedRisk = baselineRisk;
  if (whatIfState.nh37Blocked) stressedRisk += 28;
  stressedRisk += Math.round(whatIfState.rainIncreasePct * 0.35);
  if (whatIfState.medicalTruckUnavailable) stressedRisk += 14;
  if (whatIfState.insulinBelow20Pct) stressedRisk += 16;
  if (whatIfState.multipleRoadsRestricted) stressedRisk += 22;
  stressedRisk = Math.min(99, Math.max(baselineRisk, stressedRisk));

  // Medical runway hours calculation
  let medicalRunwayHours = 42;
  if (whatIfState.nh37Blocked) medicalRunwayHours -= 16;
  if (whatIfState.insulinBelow20Pct) medicalRunwayHours -= 18;
  if (whatIfState.medicalTruckUnavailable) medicalRunwayHours -= 8;
  medicalRunwayHours = Math.max(4, medicalRunwayHours);

  const runAiStressAnalysis = async () => {
    setLoadingAi(true);
    try {
      const analysis = await generateWhatIfAnalysis({
        scenarioState: whatIfState,
        baselineRisk,
        corridors,
        vehicles,
        language,
      });
      setAiReport(analysis);
    } catch {
      setAiReport('Failed to generate What-If analysis.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 lg:p-6 shadow-xl space-y-6">
      {/* Sandbox Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold tracking-wider uppercase">
              Sandbox Stress-Testing
            </span>
            <span className="text-xs text-slate-400 font-mono">
              SIH26002 Predictive Modeling
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            {t.whatIf.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.whatIf.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isWhatIfActive && (
            <button
              onClick={resetWhatIf}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t.whatIf.resetButton}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Controls vs Impact Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stress Variables (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Inject Hypothetical Ground Disruptions
          </h3>

          <div className="space-y-3">
            {/* NH-37 Severance */}
            <div
              onClick={() =>
                setWhatIfState((prev) => ({ ...prev, nh37Blocked: !prev.nh37Blocked }))
              }
              className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                whatIfState.nh37Blocked
                  ? 'border-rose-500 bg-rose-950/20'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    whatIfState.nh37Blocked
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    Sever NH-37 Lifeline Corridor (Makru Bridge Slurry Failure)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Cuts direct heavy supply artery between Silchar and Imphal Valley
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={whatIfState.nh37Blocked}
                onChange={() => {}}
                className="w-4 h-4 rounded text-rose-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Precipitation Surge Slider */}
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <CloudRain className="w-4 h-4 text-blue-400" />
                  Monsoon Cloudburst Surge: +{whatIfState.rainIncreasePct}% Rainfall
                </div>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {whatIfState.rainIncreasePct === 0 ? 'Baseline Telemetry' : `+${whatIfState.rainIncreasePct}%`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={25}
                value={whatIfState.rainIncreasePct}
                onChange={(e) =>
                  setWhatIfState((prev) => ({
                    ...prev,
                    rainIncreasePct: parseInt(e.target.value),
                  }))
                }
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% (Normal)</span>
                <span>+25%</span>
                <span>+50% (Heavy)</span>
                <span>+75%</span>
                <span>+100% (Extreme Cloudburst)</span>
              </div>
            </div>

            {/* Medical Truck Halted */}
            <div
              onClick={() =>
                setWhatIfState((prev) => ({
                  ...prev,
                  medicalTruckUnavailable: !prev.medicalTruckUnavailable,
                }))
              }
              className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                whatIfState.medicalTruckUnavailable
                  ? 'border-amber-500 bg-amber-950/20'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    whatIfState.medicalTruckUnavailable
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    Disable TRUCK-001 (Critical Cold-Chain Insulin Convoy)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Simulates mechanical failure or mud slurry entrapment
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={whatIfState.medicalTruckUnavailable}
                onChange={() => {}}
                className="w-4 h-4 rounded text-amber-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Hospital Insulin Reserves Depleted */}
            <div
              onClick={() =>
                setWhatIfState((prev) => ({
                  ...prev,
                  insulinBelow20Pct: !prev.insulinBelow20Pct,
                }))
              }
              className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                whatIfState.insulinBelow20Pct
                  ? 'border-rose-500 bg-rose-950/20'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    whatIfState.insulinBelow20Pct
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    Emergency Hospital Drug Reserves Drop Below 20%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Triggers immediate high-priority air-drop threshold
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={whatIfState.insulinBelow20Pct}
                onChange={() => {}}
                className="w-4 h-4 rounded text-rose-600 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Cascading Impact Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            2. Real-Time Cascading Impact Assessment
          </h3>

          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-4">
            {/* Risk Index Delta */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400">
                  Regional Disruption Risk
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span
                    className={`text-2xl font-black font-mono ${
                      stressedRisk > 75
                        ? 'text-rose-400'
                        : stressedRisk > 50
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {stressedRisk}%
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    (Baseline: {baselineRisk}%)
                  </span>
                </div>
              </div>

              <div
                className={`text-xs font-bold px-2 py-1 rounded border ${
                  stressedRisk > 75
                    ? 'bg-rose-500/10 text-rose-400 border-rose-800'
                    : stressedRisk > 50
                    ? 'bg-amber-500/10 text-amber-400 border-amber-800'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-800'
                }`}
              >
                {stressedRisk > 75 ? 'CRITICAL DISRUPT' : stressedRisk > 50 ? 'HIGH STRESS' : 'STABLE'}
              </div>
            </div>

            {/* Medical Runway */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400">
                  Hospital Trauma/Insulin Runway
                </span>
                <div className="text-xl font-black font-mono text-white mt-0.5 flex items-center gap-1.5">
                  <span className={medicalRunwayHours < 12 ? 'text-rose-400' : 'text-amber-300'}>
                    {medicalRunwayHours} Hours
                  </span>
                  <span className="text-xs text-slate-500 font-normal">to critical shortage</span>
                </div>
              </div>

              {medicalRunwayHours < 18 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-700 uppercase">
                  Airlift Required
                </span>
              )}
            </div>

            {/* Recommended Staging Haven */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-semibold uppercase text-slate-400">
                Safe Staging Mandate
              </span>
              <div className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-300 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Jiribam Safe Staging Yard (NH-37 West Entry)</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Hold convoys under secure military shed. Do NOT allow heavy trucks onto Tamenglong dirt tracks.
                  </p>
                </div>
              </div>
            </div>

            {/* Gemini AI Stress Evaluation Button */}
            <button
              onClick={runAiStressAnalysis}
              disabled={loadingAi}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-md shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {loadingAi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating Stress Assessment...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.whatIf.runAnalysisButton}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Detailed Stress Evaluation Result */}
      {aiReport && (
        <div className="bg-slate-950 border border-amber-800/40 rounded-lg p-5 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            AI Stress-Test Strategic Report ({language.toUpperCase()})
          </div>
          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded border border-slate-800">
            {aiReport}
          </pre>
        </div>
      )}
    </div>
  );
};
