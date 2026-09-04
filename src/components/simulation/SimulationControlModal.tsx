import React from 'react';
import { useNerves } from '../../context/NervesContext';
import {
  Play,
  RotateCcw,
  CloudRain,
  Mountain,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Flame,
  ArrowRight,
  Sparkles,
  Shield,
  FileText,
  Navigation,
} from 'lucide-react';
import { SimulationScenario } from '../../types';

interface SimulationControlModalProps {
  onOpenSituationReport?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const SimulationControlModal: React.FC<SimulationControlModalProps> = ({
  onOpenSituationReport,
  onNavigateTab,
}) => {
  const {
    simulationScenario,
    applyScenario,
    resetSimulation,
    guidedStep,
    runNextGuidedStep,
    vehicles,
    corridors,
  } = useNerves();

  const medTruck = vehicles.find((v) => v.id === 'TRUCK-001') || vehicles[0];
  const nh37 = corridors.find((c) => c.id === 'corridor-nh37') || corridors[0];

  const scenarios: {
    key: SimulationScenario;
    label: string;
    description: string;
    badge: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      key: 'NORMAL',
      label: '1. NORMAL CONDITIONS',
      description: 'Clear skies across NER. All 6 corridors accessible. Convoys moving on schedule.',
      badge: 'Baseline (18% Risk)',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      color: 'hover:border-emerald-500/60 bg-slate-900',
    },
    {
      key: 'HEAVY_RAIN',
      label: '2. HEAVY RAINFALL EVENT',
      description: 'Precipitation >90mm. Hill saturation increases. Speeds restricted on NH-6 and NH-37.',
      badge: 'Restricted (+70m Delay)',
      icon: <CloudRain className="w-5 h-5 text-blue-400" />,
      color: 'hover:border-blue-500/60 bg-slate-900',
    },
    {
      key: 'LANDSLIDE',
      label: '3. MAJOR LANDSLIDE (MAKRU SECTOR)',
      description: 'Slope collapse on NH-37. 350 MT debris. Road BLOCKED. TRUCK-001 halted at Jiribam.',
      badge: 'Critical (89% Risk)',
      icon: <Mountain className="w-5 h-5 text-rose-400" />,
      color: 'hover:border-rose-500/60 bg-slate-900',
    },
    {
      key: 'FLOOD',
      label: '4. BRAHMAPUTRA FLASH FLOOD',
      description: 'NH-715 submerged in Kaziranga. SDRF pilot convoys. Potable water delivery priority.',
      badge: 'High Flood Hazard',
      icon: <AlertTriangle className="w-5 h-5 text-cyan-400" />,
      color: 'hover:border-cyan-500/60 bg-slate-900',
    },
    {
      key: 'ROAD_BLOCKAGE',
      label: '5. TUNNEL HAZMAT BLOCKAGE',
      description: 'Overturned tanker inside Sonapur tunnel (NH-6). Jaintia hills passage severed.',
      badge: 'Total Tunnel Blockage',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      color: 'hover:border-amber-500/60 bg-slate-900',
    },
    {
      key: 'RECOVERY',
      label: '6. POST-DISASTER RECOVERY',
      description: 'BRO heavy excavators establish single-lane green corridor. Priority medical freight cleared.',
      badge: 'Controlled Clearance',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      color: 'hover:border-emerald-500/60 bg-slate-900',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Play className="w-5 h-5" />
            <h2 className="font-extrabold text-slate-100 text-lg tracking-wide uppercase">
              NER Disaster & Accessibility Simulation Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulate realistic monsoon weather spikes, landslides, flash floods, and evaluate the full end-to-end operational state reaction across maps, routes, and convoys.
          </p>
        </div>

        <button
          onClick={resetSimulation}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          Reset All Simulation Data
        </button>
      </div>

      {/* GUIDED 5-STEP JURY DEMO SCENARIO WIDGET */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border-2 border-cyan-500/60 rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500 text-slate-950 font-mono font-black text-xs px-2.5 py-0.5 rounded tracking-wider">
                SIH26002 JURY DEMO
              </span>
              <h3 className="font-extrabold text-slate-100 text-base">
                Guided 5-Step Disaster Logistics Journey
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Follow TRUCK-001 (Life-saving Insulin & IV Fluids) navigating NH-37 to Imphal Regional Hospital.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={runNextGuidedStep}
              className="w-full sm:w-auto px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-lg shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              {guidedStep === 0
                ? 'Start Guided Demo (Step 1)'
                : guidedStep >= 5
                ? 'Restart Guided Demo'
                : `Proceed to Step ${guidedStep + 1}`}
            </button>
          </div>
        </div>

        {/* 5 Step Indicator Progression */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
          {[
            { step: 1, title: 'Event 1: Heavy Rain', status: 'Risk Rises & Restricts' },
            { step: 2, title: 'Event 2: Landslide Report', status: 'Road BLOCKED' },
            { step: 3, title: 'Event 3: No Alternate Route', status: 'Safe Staging Logic' },
            { step: 4, title: 'Event 4: Targeted Alerts', status: 'Driver & Admin Dispatched' },
            { step: 5, title: 'Event 5: AI Situation Brief', status: 'Recovery & Airlift' },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-3 rounded-lg border text-xs transition-all ${
                guidedStep === item.step
                  ? 'bg-cyan-950/80 border-cyan-400 ring-1 ring-cyan-400 shadow-md'
                  : guidedStep > item.step
                  ? 'bg-slate-950/80 border-emerald-500/40 text-slate-400'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between font-mono font-bold text-[11px]">
                <span className={guidedStep === item.step ? 'text-cyan-300' : 'text-slate-400'}>
                  STEP 0{item.step}
                </span>
                {guidedStep > item.step && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <h5 className="font-extrabold text-slate-200 text-xs mt-1">{item.title}</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.status}</p>
            </div>
          ))}
        </div>

        {/* Live Truck Telemetry Snapshot in Scenario */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">TARGET FREIGHT:</span>
            <span className="font-bold text-slate-100">{medTruck.id} (Medicines)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">CORRIDOR STATUS:</span>
            <span
              className={`font-bold ${
                nh37.accessibility === 'BLOCKED'
                  ? 'text-rose-400'
                  : nh37.accessibility === 'RESTRICTED'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {nh37.code} [{nh37.accessibility}]
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">CURRENT ETA:</span>
            <span className="font-bold text-cyan-300">{medTruck.currentEta}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">DELIVERY STATUS:</span>
            <span className="font-bold text-amber-300">{medTruck.deliveryStatus}</span>
          </div>
        </div>
      </div>

      {/* One-Click Scenario Trigger Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Individual Scenario Simulation Triggers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((sc) => {
            const isActive = simulationScenario === sc.key;
            return (
              <div
                key={sc.key}
                onClick={() => applyScenario(sc.key)}
                className={`p-5 rounded-xl border transition-all cursor-pointer space-y-3 shadow-md ${
                  sc.color
                } ${isActive ? 'border-cyan-400 ring-2 ring-cyan-400/40 bg-slate-800' : 'border-slate-800'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                    {sc.icon}
                    <span>{sc.label}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-700">
                    {sc.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">{sc.description}</p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {isActive ? '● CURRENTLY ACTIVE' : 'Click to Trigger'}
                  </span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1 text-[11px]">
                    Activate Scenario <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
