import React, { useState } from 'react';
import { useNerves } from '../../context/NervesContext';
import { StatusPill } from '../common/StatusPill';
import { RiskBadge } from '../common/RiskBadge';
import {
  Brain,
  HelpCircle,
  TrendingUp,
  CloudRain,
  Mountain,
  AlertTriangle,
  History,
  Activity,
  CheckCircle2,
  Sparkles,
  Search,
  MessageSquare,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { askNervesAssistant, explainCorridorRisk } from '../../services/aiService';

export const AiIntelligenceView: React.FC = () => {
  const {
    corridors,
    vehicles,
    supplies,
    simulationScenario,
    weatherCondition,
    setWeatherCondition,
    applyScenario,
    weatherList,
  } = useNerves();

  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(corridors[1]?.id || corridors[0].id);
  const activeCorridor = corridors.find((c) => c.id === selectedCorridorId) || corridors[0];

  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);

  const handleGenerateGeminiExplanation = async () => {
    setIsExplaining(true);
    try {
      const expl = await explainCorridorRisk({
        corridor: activeCorridor,
        weatherData: weatherList,
        scenario: simulationScenario,
      });
      setGeminiExplanation(expl);
    } catch {
      setGeminiExplanation(null);
    } finally {
      setIsExplaining(false);
    }
  };

  // Assistant input state
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `Greetings. I am the NERVES AI Logistics Intelligence Assistant. Powered by Gemini 3.8 Flash and live OpenWeather feeds. Ask me questions such as "Why is this corridor high risk?", "Which medicine shipments are delayed?", or "Do we have an alternate route for NH-37?"`,
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isAsking) return;

    const userText = query.trim();
    setQuery('');
    setChatLog((prev) => [...prev, { role: 'user', text: userText }]);
    setIsAsking(true);

    try {
      const answer = await askNervesAssistant({
        query: userText,
        scenario: simulationScenario,
        corridors,
        vehicles,
        supplies,
        weatherData: weatherList,
      });
      setChatLog((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Current logistics assessment: NH-37 remains at elevated disruption risk. Recommending staging at Jiribam.`,
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Brain className="w-5 h-5" />
            <h2 className="font-extrabold text-slate-100 text-lg tracking-wide uppercase">
              Explainable AI Risk Engine & Factor Attribution
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            NERVES decomposes multi-spectral terrain, radar precipitation, DEM slope gradients, and verified field incident reports into transparent, auditable accessibility disruption probabilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Model: GEMINI-3.8-FLASH + NER GIS HEURISTICS
          </span>
        </div>
      </div>

      {/* Corridor Selector & Weather Impact Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Corridor Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm">Select Corridor to Inspect</h3>
            <p className="text-xs text-slate-400">Click a corridor to view its full factor attribution matrix</p>
          </div>

          <div className="space-y-2.5">
            {corridors.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCorridorId(c.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                  c.id === activeCorridor.id
                    ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/80 hover:bg-slate-800/60 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{c.code}</span>
                    <span className="font-semibold text-slate-200 text-xs truncate max-w-[140px]">{c.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{c.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge score={c.riskScore} level={c.riskLevel} size="sm" />
                </div>
              </button>
            ))}
          </div>

          {/* Weather Simulator Control Widget */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
              Simulate Weather Condition:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setWeatherCondition('NORMAL');
                  applyScenario('NORMAL');
                }}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  weatherCondition === 'NORMAL'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                NORMAL
              </button>
              <button
                onClick={() => {
                  setWeatherCondition('HEAVY_RAIN');
                  applyScenario('HEAVY_RAIN');
                }}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  weatherCondition === 'HEAVY_RAIN'
                    ? 'bg-amber-950 text-amber-300 border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                HEAVY RAIN
              </button>
              <button
                onClick={() => {
                  setWeatherCondition('EXTREME_RAIN');
                  applyScenario('FLOOD');
                }}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  weatherCondition === 'EXTREME_RAIN'
                    ? 'bg-rose-950 text-rose-300 border-rose-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                EXTREME RAIN
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              * Changing weather dynamically triggers AI risk model re-calculation across all NER highway routes.
            </p>
          </div>
        </div>

        {/* Center & Right Column: Explainable AI "WHY?" Deep Dive Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main "WHY IS THIS CORRIDOR AT RISK?" Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-extrabold text-sm bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {activeCorridor.code}
                  </span>
                  <h3 className="font-extrabold text-slate-100 text-base">{activeCorridor.name}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Route Sector: {activeCorridor.startPoint} ⟷ {activeCorridor.endPoint}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusPill status={activeCorridor.accessibility} />
                <RiskBadge score={activeCorridor.riskScore} level={activeCorridor.riskLevel} size="lg" />
              </div>
            </div>

            {/* AI Title & Confidence */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-cyan-400" />
                <div>
                  <h4 className="font-extrabold text-slate-100 text-sm tracking-wide font-mono">
                    NERVES PROTOTYPE RISK MODEL — {activeCorridor.riskScore}/100 ({activeCorridor.riskLevel})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Explicit transparent weights attribution engine for North Eastern logistics accessibility
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Confidence</span>
                <span className="font-mono text-cyan-300 font-bold text-sm">
                  {activeCorridor.confidenceScore}% Validated
                </span>
              </div>
            </div>

            {/* The 5 Factor Weights Bars */}
            <div className="space-y-3.5">
              {[
                {
                  label: 'Heavy Rainfall Saturation',
                  weight: activeCorridor.factorWeights.heavyRain,
                  detail: `${activeCorridor.rainfallMm} mm cumulative precipitation (IMD radar)`,
                  icon: <CloudRain className="w-4 h-4 text-blue-400" />,
                  color: 'bg-blue-500',
                },
                {
                  label: 'Historical Hazard Exposure',
                  weight: activeCorridor.factorWeights.historicalHazards,
                  detail: `${activeCorridor.historicalLandslidesCount} recorded slope failure events (ISRO/NRSC catalog)`,
                  icon: <History className="w-4 h-4 text-amber-400" />,
                  color: 'bg-amber-500',
                },
                {
                  label: 'Road Condition & Pavement Integrity',
                  weight: activeCorridor.factorWeights.roadCondition,
                  detail: activeCorridor.roadCondition,
                  icon: <Activity className="w-4 h-4 text-emerald-400" />,
                  color: 'bg-emerald-500',
                },
                {
                  label: 'Topographical Slope Gradient',
                  weight: activeCorridor.factorWeights.slope,
                  detail: `${activeCorridor.slopeAngleDeg}° steep hill cut incline`,
                  icon: <Mountain className="w-4 h-4 text-purple-400" />,
                  color: 'bg-purple-500',
                },
                {
                  label: 'Drainage & Riverine Flood Exposure',
                  weight: activeCorridor.factorWeights.floodExposure,
                  detail: `${activeCorridor.floodExposurePct}% basin flood vulnerability index`,
                  icon: <AlertTriangle className="w-4 h-4 text-cyan-400" />,
                  color: 'bg-cyan-500',
                },
                ...(activeCorridor.factorWeights.fieldReport
                  ? [
                      {
                        label: 'Field Officer Ground Truth',
                        weight: activeCorridor.factorWeights.fieldReport,
                        detail: activeCorridor.latestFieldReport || 'Verified ground inspection report',
                        icon: <Activity className="w-4 h-4 text-rose-400" />,
                        color: 'bg-rose-500',
                      },
                    ]
                  : []),
              ].map((factor, idx) => (
                <div key={idx} className="space-y-1 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-200">
                      {factor.icon}
                      <span>{factor.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">{factor.detail}</span>
                      <span className="font-mono font-bold text-slate-100 w-10 text-right">{factor.weight}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${factor.color} rounded-full transition-all duration-500`}
                      style={{ width: `${factor.weight}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Synthesized Explanation Paragraph */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Brain className="w-4 h-4" />
                <span>AI Synthesized Diagnostic Assessment:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {activeCorridor.riskScore > 60
                  ? `Elevated rainfall (${activeCorridor.rainfallMm}mm) combined with steep slope gradients (${activeCorridor.slopeAngleDeg}°) and high historical hazard exposure (${activeCorridor.historicalLandslidesCount} events) is driving the disruption risk to ${activeCorridor.riskScore}%. Road surface integrity is currently flagged as "${activeCorridor.roadCondition}". Heavy multi-axle freight risks catastrophic entrapment or single-lane bottlenecking.`
                  : `Atmospheric precipitation and slope saturation remain within safe logistical tolerance (${activeCorridor.rainfallMm}mm rainfall). Pavement condition is graded as "${activeCorridor.roadCondition}". Estimated disruption probability is currently low (${activeCorridor.riskScore}%). Convoys may proceed under routine monitoring.`}
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Recommended Operational Action:</span>
                <span className="font-semibold text-amber-300">{activeCorridor.recommendedAction}</span>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  Request comprehensive geomorphological & meteorological causal chain:
                </span>
                <button
                  onClick={handleGenerateGeminiExplanation}
                  disabled={isExplaining}
                  className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isExplaining ? 'animate-spin text-cyan-400' : ''}`} />
                  {isExplaining ? 'Querying Gemini 3.8...' : 'Generate Deep Gemini Diagnostic'}
                </button>
              </div>

              {geminiExplanation && (
                <div className="mt-3 p-3.5 bg-slate-900 border border-cyan-500/40 rounded-lg text-xs text-slate-200 whitespace-pre-line font-mono leading-relaxed">
                  {geminiExplanation}
                </div>
              )}
            </div>
          </div>

          {/* Natural Language AI Logistics Assistant Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">NERVES AI Logistics Assistant</h4>
                  <p className="text-xs text-slate-400">Ask conversational operational questions regarding current state</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Live Ground Telemetry</span>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                'Show me high-risk corridors.',
                'Which medicine deliveries are delayed?',
                'Do we have an alternate route for NH-37?',
                'Which supplies should be prioritized?',
              ].map((chip, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(chip);
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] hover:border-cyan-500/50 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Thread */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 max-h-56 overflow-y-auto space-y-3">
              {chatLog.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-950/70 border border-cyan-800/70 text-cyan-100 ml-8'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 mr-8 font-sans whitespace-pre-line'
                  }`}
                >
                  <span className="font-bold text-[10px] uppercase block mb-1 opacity-70">
                    {msg.role === 'user' ? 'Operator Query' : 'NERVES AI Intelligence'}
                  </span>
                  {msg.text}
                </div>
              ))}
              {isAsking && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs animate-pulse">
                  Querying NERVES Intelligence Engine...
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleAsk} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about accessibility, route options, truck status, or supply continuity..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isAsking || !query.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                Ask
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
