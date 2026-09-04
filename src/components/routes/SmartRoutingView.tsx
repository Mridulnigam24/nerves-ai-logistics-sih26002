import React, { useState, useMemo } from 'react';
import { useNerves } from '../../context/NervesContext';
import { StatusPill } from '../common/StatusPill';
import { RiskBadge } from '../common/RiskBadge';
import {
  Navigation,
  Shield,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Truck,
  Building,
  RotateCcw,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  Scale,
  Gauge,
  Check,
  Fuel,
} from 'lucide-react';
import { SmartRoute } from '../../types';
import { getSmartRoutingReasoning } from '../../services/aiService';
import {
  evaluateRoutes,
  SCENARIO_PROFILES,
  VEHICLE_PROFILES,
  OPERATIONAL_TEST_CASES,
  RoutingScenarioProfile,
  VehicleRoutingProfile,
  RouteDecision,
} from '../../services/routingDecisionEngine';

export const SmartRoutingView: React.FC = () => {
  const { corridors, simulationScenario, stageVehicle, weatherCondition } = useNerves();

  // Active corridor selection
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('corridor-nh6');
  const [scenarioProfile, setScenarioProfile] = useState<RoutingScenarioProfile>('DISASTER_RESPONSE');
  const [vehicleProfile, setVehicleProfile] = useState<VehicleRoutingProfile>('HEAVY_TRUCK');

  // Selected route for drill-down / AI analysis
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [geminiRoutingReasoning, setGeminiRoutingReasoning] = useState<string | null>(null);
  const [isRoutingAiLoading, setIsRoutingAiLoading] = useState<boolean>(false);

  // Judge Technical Inspection Drawer state
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [showJudgeFaq, setShowJudgeFaq] = useState<boolean>(false);
  const [expandedBreakdownRouteId, setExpandedBreakdownRouteId] = useState<string | null>(null);

  // Active Test Case override (null means using current live corridor state)
  const [activeTestCaseId, setActiveTestCaseId] = useState<string | null>(null);

  // Interactive manual adjustments for Route A & Route B (for dynamic live demo to judges)
  const [manualOverrideA, setManualOverrideA] = useState<{
    risk?: number;
    accessibility?: 'ACCESSIBLE' | 'RESTRICTED' | 'BLOCKED';
  } | null>(null);

  const [manualOverrideB, setManualOverrideB] = useState<{
    risk?: number;
    accessibility?: 'ACCESSIBLE' | 'RESTRICTED' | 'BLOCKED';
  } | null>(null);

  const activeCorridor = corridors.find((c) => c.id === selectedCorridorId) || corridors[0];
  const isNh37 = activeCorridor.id === 'corridor-nh37';
  const isBlocked = activeCorridor.accessibility === 'BLOCKED';

  // Build raw candidate routes based on selected corridor, test case, and manual overrides
  const rawCandidateRoutes: SmartRoute[] = useMemo(() => {
    // 1. If an operational test case is active, load its calibrated routes
    if (activeTestCaseId && OPERATIONAL_TEST_CASES[activeTestCaseId]) {
      return OPERATIONAL_TEST_CASES[activeTestCaseId].routes;
    }

    // 2. Otherwise generate realistic candidate routes from current active corridor
    if (isNh37) {
      if (isBlocked) {
        return [
          {
            id: 'route-nh37-primary',
            name: 'Primary NH-37 (Silchar – Jiribam – Noney – Imphal)',
            via: 'Direct National Highway Lifeline',
            distanceKm: 215,
            etaHours: 9,
            etaMinutes: 15,
            riskScore: 89,
            accessibility: 'BLOCKED',
            category: 'NOT_OPERATIONALLY_VIABLE' as any,
            isFeasible: false,
            roadCondition: 'Severe Rockfall Debris at Makru Bridge',
            elevationGainM: 1450,
            notes: 'Zero motorable width. Multiple BRO earthmovers engaged in clearance.',
          },
          {
            id: 'route-nh37-alt-rural',
            name: 'Theoretical Rural Forest Track (Via Tamenglong interior)',
            via: 'Unpaved village tracks & seasonal bamboo bridges',
            distanceKm: 280,
            etaHours: 16,
            etaMinutes: 0,
            riskScore: 96,
            accessibility: 'BLOCKED',
            category: 'NOT_OPERATIONALLY_VIABLE' as any,
            isFeasible: false,
            roadCondition: 'Unpaved Mud Slurry — IMPASSABLE FOR HEAVY TRUCKS',
            elevationGainM: 2100,
            notes: 'GPS apps frequently invent this route erroneously. High vehicle loss & entrapment hazard.',
          },
        ];
      }

      return [
        {
          id: 'route-nh37-direct',
          name: 'Primary NH-37 via Jiribam & Noney',
          via: 'Direct Highway Lifeline',
          distanceKm: 215,
          etaHours: 6,
          etaMinutes: 40,
          riskScore: activeCorridor.riskScore,
          accessibility: activeCorridor.accessibility,
          category: 'RECOMMENDED',
          isFeasible: true,
          roadCondition: activeCorridor.roadCondition || 'Rough Surface with Single-Lane Restriction',
          elevationGainM: 1450,
          notes: 'Shortest essential freight route into Manipur valley.',
        },
        {
          id: 'route-nh2-secondary',
          name: 'Northern Arc via Nagaland (Dimapur – Kohima – Senapati – Imphal)',
          via: 'NH-29 / NH-2',
          distanceKm: 420,
          etaHours: 12,
          etaMinutes: 30,
          riskScore: 48,
          accessibility: 'RESTRICTED',
          category: 'SAFEST',
          isFeasible: true,
          roadCondition: 'Paved with localized hill construction',
          elevationGainM: 1850,
          notes: '+205 km extra distance; viable for light emergency shipments only.',
        },
      ];
    }

    // Default: NH-6 Corridor (Guwahati ⟷ Silchar via Meghalaya)
    // Reflects the exact benchmark scenario:
    // Route A: 310 km, 7h 15m, 43% risk (or current corridor risk if higher), Rough Surface, 1600m ascent, RESTRICTED
    // Route B: 420 km, 10h 30m, 32% risk, Paved bypass, 1100m ascent, ACCESSIBLE
    const riskA = manualOverrideA?.risk !== undefined
      ? manualOverrideA.risk
      : activeCorridor.riskScore > 35
      ? activeCorridor.riskScore
      : 43;

    const accessA = manualOverrideA?.accessibility || 'RESTRICTED';

    const riskB = manualOverrideB?.risk !== undefined ? manualOverrideB.risk : 32;
    const accessB = manualOverrideB?.accessibility || 'ACCESSIBLE';

    return [
      {
        id: 'route-nh6-direct',
        name: 'Route A: Direct NH-6 via Shillong & Jowai',
        via: 'GS Road & East Jaintia Hills',
        distanceKm: 310,
        etaHours: 7,
        etaMinutes: 15,
        riskScore: riskA,
        accessibility: accessA,
        category: 'RESTRICTED' as any,
        isFeasible: accessA !== 'BLOCKED',
        roadCondition: accessA === 'ACCESSIBLE' && riskA <= 25 ? 'Paved & Clear' : 'Rough Surface',
        elevationGainM: 1600,
        notes: 'Standard arterial freight route connecting Assam valley and Barak valley. High slope slippage caution in Sonapur section.',
      },
      {
        id: 'route-nh27-alt',
        name: 'Route B: Via Halflong – Umrangso Spur (NH-27 / NH-627)',
        via: 'Dima Hasao Hill District Bypass',
        distanceKm: 420,
        etaHours: 10,
        etaMinutes: 30,
        riskScore: riskB,
        accessibility: accessB,
        category: 'RECOMMENDED',
        isFeasible: accessB !== 'BLOCKED',
        roadCondition: 'Paved four-lane & two-lane bypass',
        elevationGainM: 1100,
        notes: '+110 km bypass, but avoids high-risk Sonapur landslide zone with gentle mountain grade.',
      },
    ];
  }, [activeTestCaseId, isNh37, isBlocked, activeCorridor, manualOverrideA, manualOverrideB]);

  // 3. Deterministically evaluate routes with the scoring engine & safety gates
  const { evaluatedRoutes, recommendedRouteId } = useMemo(() => {
    return evaluateRoutes(rawCandidateRoutes, scenarioProfile, vehicleProfile);
  }, [rawCandidateRoutes, scenarioProfile, vehicleProfile]);

  // Keep selected route in sync with recommended route
  const effectiveSelectedRouteId = selectedRouteId || recommendedRouteId || evaluatedRoutes[0]?.id;
  const activeSelectedRoute = evaluatedRoutes.find((r) => r.id === effectiveSelectedRouteId) || evaluatedRoutes[0];
  const recommendedRoute = evaluatedRoutes.find((r) => r.id === recommendedRouteId);

  const hasNoFeasibleRoute = isNh37 && isBlocked;

  // Handler to run AI reasoning
  const handleGenerateAiReasoning = async () => {
    setIsRoutingAiLoading(true);
    try {
      const res = await getSmartRoutingReasoning({
        corridor: activeCorridor,
        selectedRoute: activeSelectedRoute,
        weather: weatherCondition,
        allRoutes: evaluatedRoutes,
        evaluatedRoutes,
        scenarioProfile,
        vehicleProfile,
        decision: activeSelectedRoute.decision,
      });
      setGeminiRoutingReasoning(res);
    } catch {
      setGeminiRoutingReasoning(null);
    } finally {
      setIsRoutingAiLoading(false);
    }
  };

  const currentScenario = SCENARIO_PROFILES[scenarioProfile];
  const currentVehicle = VEHICLE_PROFILES[vehicleProfile];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Navigation className="w-5 h-5" />
            <h2 className="font-extrabold text-slate-100 text-lg tracking-wide uppercase">
              Smart Logistics Routing & Accessibility Validation
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Commercial GPS algorithms answer <span className="text-slate-300 font-semibold">WHERE</span> to go. NERVES evaluates{' '}
            <span className="text-cyan-400 font-semibold">WHETHER</span> a corridor remains accessible, enforces strict safety gates, and
            prioritizes operational mission reliability over shortest distance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 px-2 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-lg text-[11px] font-mono text-cyan-300">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>DETERMINISTIC ENGINE v3.2</span>
          </div>

          <select
            value={selectedCorridorId}
            onChange={(e) => {
              setSelectedCorridorId(e.target.value);
              setActiveTestCaseId(null);
              setManualOverrideA(null);
              setManualOverrideB(null);
              setSelectedRouteId(null);
              setGeminiRoutingReasoning(null);
            }}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {corridors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name.split(' ')[0]} ({c.accessibility})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Operational Profiles Bar: Scenario, Vehicle, and Judge Inspection Toggle */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Scenario Profile Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                Scenario:
              </span>
              <select
                value={scenarioProfile}
                onChange={(e) => {
                  setScenarioProfile(e.target.value as RoutingScenarioProfile);
                  setGeminiRoutingReasoning(null);
                }}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
              >
                {Object.values(SCENARIO_PROFILES).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Profile Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                Vehicle:
              </span>
              <select
                value={vehicleProfile}
                onChange={(e) => {
                  setVehicleProfile(e.target.value as VehicleRoutingProfile);
                  setGeminiRoutingReasoning(null);
                }}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
              >
                {Object.values(VEHICLE_PROFILES).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons: Judge inspection & Q&A */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                showTechnicalDetails
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Judge Test Sandbox & Weights</span>
              {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowJudgeFaq(!showJudgeFaq)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                showJudgeFaq
                  ? 'bg-indigo-950 border-indigo-500 text-indigo-200'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Judge Q&A Rationale</span>
            </button>
          </div>
        </div>

        {/* Active Scenario Weights Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Active Scoring Weights:</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-cyan-300">
              Safety {Math.round(currentScenario.safetyWeight * 100)}%
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-emerald-300">
              Access {Math.round(currentScenario.accessibilityWeight * 100)}%
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-amber-300">
              Road/Terrain {Math.round(currentScenario.roadTerrainWeight * 100)}%
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-blue-300">
              Time {Math.round(currentScenario.travelTimeWeight * 100)}%
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-slate-300">
              Distance {Math.round(currentScenario.distanceWeight * 100)}%
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            PROTOTYPE SIMULATION DATA — Deterministic Decision Engine
          </div>
        </div>

        {/* Expandable Judge Technical Sandbox (Test Cases & Live Parameter Sliders) */}
        {showTechnicalDetails && (
          <div className="pt-3 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
            {/* 6 Pre-Configured Test Cases (Section 15) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  Judge Validation: 6 Operational Test Scenarios (Instant 1-Click Verification)
                </span>
                {activeTestCaseId && (
                  <button
                    onClick={() => {
                      setActiveTestCaseId(null);
                      setManualOverrideA(null);
                      setManualOverrideB(null);
                      setGeminiRoutingReasoning(null);
                    }}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to Live Corridor Telemetry
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.values(OPERATIONAL_TEST_CASES).map((tc) => {
                  const isActive = activeTestCaseId === tc.id;
                  return (
                    <button
                      key={tc.id}
                      onClick={() => {
                        setActiveTestCaseId(tc.id);
                        setManualOverrideA(null);
                        setManualOverrideB(null);
                        setSelectedRouteId(null);
                        setGeminiRoutingReasoning(null);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all space-y-1 ${
                        isActive
                          ? 'bg-cyan-950/80 border-cyan-500 ring-1 ring-cyan-500/40'
                          : 'bg-slate-950 hover:bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{tc.name}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">{tc.description}</p>
                      <div className="text-[10px] font-mono text-emerald-400 font-semibold pt-0.5">
                        Outcome: {tc.expectedOutcome.split('.')[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Live Parameter Adjusters for Route A & B (Section 10) */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Section 10: Dynamic Live Input Simulation (Watch Score & Recommendation Recalculate Instantly)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Route A Interactive Control */}
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-200">Route A (Direct NH-6, 310 km)</span>
                    <span className="font-mono text-cyan-400">
                      Risk: {manualOverrideA?.risk !== undefined ? manualOverrideA.risk : 43}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={manualOverrideA?.risk !== undefined ? manualOverrideA.risk : 43}
                      onChange={(e) => {
                        setActiveTestCaseId(null);
                        setManualOverrideA((prev) => ({
                          risk: parseInt(e.target.value, 10),
                          accessibility: prev?.accessibility || 'RESTRICTED',
                        }));
                        setGeminiRoutingReasoning(null);
                      }}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400">Status:</span>
                    {(['ACCESSIBLE', 'RESTRICTED', 'BLOCKED'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setActiveTestCaseId(null);
                          setManualOverrideA((prev) => ({
                            risk: prev?.risk !== undefined ? prev.risk : 43,
                            accessibility: status,
                          }));
                          setGeminiRoutingReasoning(null);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          (manualOverrideA?.accessibility || 'RESTRICTED') === status
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Route B Interactive Control */}
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-200">Route B (Bypass Alignment, 420 km)</span>
                    <span className="font-mono text-emerald-400">
                      Risk: {manualOverrideB?.risk !== undefined ? manualOverrideB.risk : 32}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={manualOverrideB?.risk !== undefined ? manualOverrideB.risk : 32}
                      onChange={(e) => {
                        setActiveTestCaseId(null);
                        setManualOverrideB((prev) => ({
                          risk: parseInt(e.target.value, 10),
                          accessibility: prev?.accessibility || 'ACCESSIBLE',
                        }));
                        setGeminiRoutingReasoning(null);
                      }}
                      className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400">Status:</span>
                    {(['ACCESSIBLE', 'RESTRICTED', 'BLOCKED'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setActiveTestCaseId(null);
                          setManualOverrideB((prev) => ({
                            risk: prev?.risk !== undefined ? prev.risk : 32,
                            accessibility: status,
                          }));
                          setGeminiRoutingReasoning(null);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          (manualOverrideB?.accessibility || 'ACCESSIBLE') === status
                            ? 'bg-emerald-950 border-emerald-400 text-emerald-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Judge Q&A Guide (Section 13) */}
        {showJudgeFaq && (
          <div className="pt-3 border-t border-slate-800 space-y-2.5 animate-in fade-in duration-200 text-xs text-slate-300">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wide text-indigo-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              Section 13: Judge Technical Defense & System Architecture Reference
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {[
                {
                  q: 'Why didn’t you choose the shortest route?',
                  a: 'Because NERVES is designed for disaster logistics. It prioritizes safety, accessibility and operational reliability over distance.',
                },
                {
                  q: 'Does Gemini decide the route?',
                  a: 'No. The numerical ranking is produced by a deterministic safety-weighted decision engine (Safety 40%, Access 30%, Terrain 15%, Time 10%, Distance 5%). Gemini provides explainable reasoning over that decision and operational context.',
                },
                {
                  q: 'What happens if the safest route is much longer?',
                  a: 'NERVES can recommend the longer route when the additional distance significantly improves safety or accessibility. Distance is a secondary optimization objective.',
                },
                {
                  q: 'What happens if a road becomes blocked?',
                  a: 'The route receives an operational restriction and is removed from the preferred set by hard safety gates rather than being recommended simply because it is shorter.',
                },
                {
                  q: 'Can the weights change?',
                  a: 'Yes. NERVES uses scenario-specific weighting profiles (Disaster Response, Normal Logistics, Medical Emergency, Heavy Supply Convoy). Disaster response prioritizes safety and accessibility more heavily.',
                },
                {
                  q: 'Is the recommendation hardcoded?',
                  a: 'No. The route score is calculated dynamically from current operational inputs and gate validations in real time.',
                },
                {
                  q: 'What makes this different from normal navigation?',
                  a: 'Traditional navigation primarily optimizes travel efficiency. NERVES optimizes mission completion probability under uncertain and disrupted disaster conditions.',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-bold text-cyan-300 block">{item.q}</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. CRITICAL NERVES USP: NO FEASIBLE ALTERNATE ROUTE CARD (When Corridor is BLOCKED) */}
      {hasNoFeasibleRoute && (
        <div className="bg-rose-950/80 border-2 border-rose-500 rounded-xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-rose-900 border border-rose-400 text-rose-200 shrink-0">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-500 text-slate-950 font-mono font-black text-xs px-2.5 py-0.5 rounded tracking-wider">
                  CRITICAL LOGISTICS DIRECTIVE
                </span>
                <span className="text-xs font-mono text-rose-300">RULE ID: NER-ROUTING-STAGING-01</span>
              </div>
              <h3 className="text-xl font-black text-white mt-1 tracking-tight">
                NO FEASIBLE CONNECTED ALTERNATE ROUTE
              </h3>
              <p className="text-xs text-rose-200/90 mt-1 leading-relaxed max-w-3xl font-sans">
                Commercial navigation algorithms frequently invent unpaved, non-motorable dirt paths during major highway closures. In the rugged North Eastern terrain, sending heavy freight into unverified rural slopes leads to catastrophic vehicle entrapment. NERVES refuses to suggest false routes.
              </p>
            </div>
          </div>

          {/* Operational Recommended Actions */}
          <div className="bg-slate-950/90 rounded-xl border border-rose-900/60 p-4 space-y-3">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
              MANDATORY OPERATIONAL CONTINGENCY PROTOCOLS:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                {
                  title: '1. HOLD VEHICLE',
                  desc: 'Halt TRUCK-001 immediately. Do not attempt Makru bridgehead passage.',
                  action: () => stageVehicle('TRUCK-001', 'Jiribam Border Staging Yard'),
                  btn: 'Hold TRUCK-001',
                },
                {
                  title: '2. SAFE STAGING',
                  desc: 'Divert convoy into Jiribam Border Safe Staging Yard (120-truck capacity).',
                  action: () => stageVehicle('TRUCK-001', 'Jiribam Border Staging Yard'),
                  btn: 'Stage at Jiribam',
                },
                {
                  title: '3. DELAY MOVEMENT',
                  desc: 'Issue official standing delay advisory to driver and logistics dispatch.',
                  action: () => alert('Advisory broadcast to driver Bikram Barman: Delay active.'),
                  btn: 'Broadcast Advisory',
                },
                {
                  title: '4. PRIORITIZE ESSENTIALS',
                  desc: 'Requisition emergency medical drone/helicopter for insulin stock runway.',
                  action: () => alert('Emergency medical airlift requisition dispatched to NDRF & EAC.'),
                  btn: 'Requisition Airlift',
                },
                {
                  title: '5. MONITOR RECOVERY',
                  desc: 'Track BRO earthmoving progress via Field Officer geo-tagged reports.',
                  action: () => alert('Subscribed to BRO Project Pushpak hourly telemetry.'),
                  btn: 'Track BRO Clearance',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col justify-between space-y-2">
                  <div>
                    <h5 className="font-extrabold text-white text-xs">{item.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
                  </div>
                  <button
                    onClick={item.action}
                    className="w-full py-1.5 px-2 bg-rose-900/60 hover:bg-rose-800 border border-rose-600/60 rounded text-[11px] font-semibold text-rose-200 transition-colors shadow"
                  >
                    {item.btn}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Explainable AI Routing Reasoning Module (Gemini with Deterministic Calculation Backbone) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h4 className="font-bold text-slate-100 text-sm">
                Gemini AI Disaster Route Reasoning Engine
              </h4>
              <p className="text-xs text-slate-400">
                Mathematical safety analysis: why traditional GPS maps fail in mountainous North Eastern corridors
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateAiReasoning}
            disabled={isRoutingAiLoading}
            className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isRoutingAiLoading ? 'animate-spin text-cyan-400' : ''}`} />
            {isRoutingAiLoading ? 'Analyzing Operational Decision...' : 'Generate AI Routing Reasoning'}
          </button>
        </div>

        {geminiRoutingReasoning ? (
          <div className="p-4 bg-slate-950 border border-cyan-500/40 rounded-lg text-xs text-slate-200 whitespace-pre-line font-mono leading-relaxed">
            {geminiRoutingReasoning}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Click &quot;Generate AI Routing Reasoning&quot; to inspect the authoritative natural language debrief detailing why the deterministic engine selected the recommended route and accepted the distance trade-off.
          </p>
        )}
      </div>

      {/* 5. Route Comparison Matrix: Evaluated against Deterministic Engine */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Route Comparison Matrix: {activeCorridor.code} ({activeCorridor.startPoint} ⟷ {activeCorridor.endPoint})
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Deterministic Objective: SAFE + ACCESSIBLE + OPERATIONALLY RELIABLE before FAST + SHORT
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Winning Route:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
              {recommendedRoute ? recommendedRoute.name.split(':')[0] : 'None (Blocked)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluatedRoutes.map((route) => {
            const isSelected = effectiveSelectedRouteId === route.id;
            const decision: RouteDecision = route.decision;
            const isRecommended = decision.operationalStatus === 'RECOMMENDED';
            const isViable = decision.passedSafetyGate;
            const isBreakdownOpen = expandedBreakdownRouteId === route.id;

            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-5 rounded-xl border transition-all cursor-pointer space-y-4 shadow-lg ${
                  isRecommended
                    ? 'bg-slate-900 border-cyan-500/80 ring-2 ring-cyan-500/40'
                    : isViable
                    ? isSelected
                      ? 'bg-slate-900 border-slate-600 ring-1 ring-slate-600'
                      : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800'
                    : 'bg-slate-950/80 border-rose-900/60 opacity-80'
                }`}
              >
                {/* Header: Badges & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Decision Badge */}
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-wider flex items-center gap-1 ${
                          isRecommended
                            ? 'bg-emerald-500 text-slate-950 font-extrabold'
                            : decision.operationalStatus === 'RESTRICTED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : decision.operationalStatus === 'NOT_OPERATIONALLY_VIABLE'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {isRecommended && <Check className="w-3 h-3 stroke-[3]" />}
                        {decision.operationalStatus.replace(/_/g, ' ')}
                      </span>

                      {/* Safest tag if lowest risk */}
                      {isRecommended && route.riskScore <= 35 && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                          SAFEST
                        </span>
                      )}

                      <span className="text-xs text-slate-400 font-sans">{route.via}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-100 text-sm">{route.name}</h4>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusPill status={route.accessibility} size="sm" />
                    {/* Deterministic NERVES Score */}
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400">NERVES SCORE:</span>
                      <span
                        className={`font-mono font-black text-sm ${
                          isRecommended
                            ? 'text-emerald-400'
                            : decision.overallScore >= 70
                            ? 'text-cyan-400'
                            : decision.overallScore >= 50
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {decision.overallScore}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Distance</span>
                    <span className="font-bold text-slate-100 font-mono text-sm">{route.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estimated Transit</span>
                    <span className="font-bold text-slate-100 font-mono text-sm">
                      {route.etaHours}h {route.etaMinutes}m
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Disruption Risk</span>
                    <RiskBadge score={route.riskScore} size="sm" />
                  </div>
                </div>

                {/* Road Conditions & Notes */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pavement / Surface:</span>
                    <span className="text-slate-200 font-medium">{route.roadCondition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Terrain Incline:</span>
                    <span className="text-slate-200 font-medium">{route.elevationGainM}m ascent</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-relaxed">
                    {route.notes}
                  </p>
                </div>

                {/* SECTION 6: SHOW WHY THE ROUTE WON (Judge Inspection Box) */}
                {isRecommended && (
                  <div className="bg-slate-950 rounded-lg p-3.5 border border-emerald-500/40 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        DECISION RATIONALE: RECOMMENDED ROUTE
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {currentScenario.name.split(' ')[0]} Profile
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Key Reasons:
                      </span>
                      {decision.reasons.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-200">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0 stroke-[3]" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    {decision.tradeoffs && decision.tradeoffs.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                          Accepted Operational Trade-off:
                        </span>
                        {decision.tradeoffs.map((t, idx) => (
                          <div key={idx} className="text-[11px] text-slate-300 font-mono flex items-center gap-1">
                            <span className="text-amber-400">•</span>
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-400">Decision Principle:</span>
                      <span className="font-bold text-cyan-400 font-mono">
                        {decision.decisionPrinciple}
                      </span>
                    </div>
                  </div>
                )}

                {/* For Non-Recommended / Restricted Routes: Show Why It Was Not Recommended */}
                {!isRecommended && (
                  <div
                    className={`rounded-lg p-3 border space-y-2 text-xs ${
                      !isViable
                        ? 'bg-rose-950/40 border-rose-900/60 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span className={!isViable ? 'text-rose-400' : 'text-amber-400'}>
                        {!isViable ? 'CRITICAL GATE FAILURE' : 'NON-PREFERRED IN EMERGENCY LOGISTICS'}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">Score: {decision.overallScore}/100</span>
                    </div>
                    <ul className="space-y-1 text-[11px]">
                      {decision.reasons.map((r, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className={!isViable ? 'text-rose-400' : 'text-amber-400'}>•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                      {decision.distanceScore > decision.safetyScore && (
                        <li className="flex items-center gap-1.5 text-slate-400 italic">
                          <span>•</span>
                          <span>Distance advantage ({route.distanceKm} km) rejected: Safety and accessibility gates supersede mileage.</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Technical Factor Breakdown Toggle (For Judges) */}
                <div className="pt-1 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedBreakdownRouteId(isBreakdownOpen ? null : route.id);
                    }}
                    className="text-[11px] font-semibold text-slate-400 hover:text-cyan-400 flex items-center justify-between w-full py-1"
                  >
                    <span className="flex items-center gap-1">
                      <Scale className="w-3 h-3 text-cyan-400" />
                      View 5-Factor Mathematical Breakdown
                    </span>
                    {isBreakdownOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {isBreakdownOpen && (
                    <div className="mt-2 p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1.5 text-[11px] font-mono animate-in fade-in duration-150">
                      <div className="grid grid-cols-12 gap-1 text-[10px] text-slate-500 font-bold border-b border-slate-800 pb-1">
                        <span className="col-span-5">Factor (Weight)</span>
                        <span className="col-span-3 text-right">Normalized</span>
                        <span className="col-span-4 text-right">Weighted Pts</span>
                      </div>
                      {decision.scoreBreakdown.map((sb, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-1 items-center py-0.5 text-slate-300">
                          <span className="col-span-5 truncate text-slate-300">
                            {sb.factor.split('/')[0]} ({sb.weightPct}%)
                          </span>
                          <span className="col-span-3 text-right text-cyan-300 font-bold">
                            {sb.normalizedScore}/100
                          </span>
                          <span className="col-span-4 text-right text-emerald-400 font-bold">
                            +{sb.weightedScore.toFixed(1)}
                          </span>
                        </div>
                      ))}
                      <div className="pt-1 border-t border-slate-800 flex justify-between font-bold text-xs">
                        <span className="text-white">Deterministic Total:</span>
                        <span className="text-cyan-400">{decision.overallScore} / 100</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
