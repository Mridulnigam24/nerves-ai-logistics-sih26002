import React, { useState } from 'react';
import { useNerves } from '../../context/NervesContext';
import { NervesGISMap } from '../map/NervesGISMap';
import { StatusPill } from '../common/StatusPill';
import { RiskBadge } from '../common/RiskBadge';
import { WeatherPanel } from './WeatherPanel';
import {
  Truck,
  AlertTriangle,
  ShieldCheck,
  Ban,
  Clock,
  Package,
  Activity,
  Radio,
  FileText,
  Bot,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  MapPin,
  ShieldAlert,
} from 'lucide-react';

interface CommandCenterProps {
  onNavigateTab: (tab: string) => void;
  onOpenSituationReport: () => void;
  onOpenAssistant: () => void;
  onOpenSimulation: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onNavigateTab,
  onOpenSituationReport,
  onOpenAssistant,
  onOpenSimulation,
}) => {
  const {
    corridors,
    vehicles,
    supplies,
    incidents,
    alerts,
    simulationScenario,
    emergencyMode,
    setSelectedCorridorId,
    setSelectedVehicleId,
    t,
  } = useNerves();

  // Calculate dynamic KPIs
  const activeVehicles = vehicles.length;
  const highRiskCorridors = corridors.filter((c) => c.riskScore > 60).length;
  const restrictedRoads = corridors.filter((c) => c.accessibility === 'RESTRICTED').length;
  const blockedRoads = corridors.filter((c) => c.accessibility === 'BLOCKED').length;
  const delayedVehicles = vehicles.filter((v) => v.deliveryStatus === 'DELAYED' || v.deliveryStatus === 'STOPPED').length;
  const criticalSupplies = supplies.filter((s) => s.priority === 'CRITICAL').length;
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Emergency Warning if Active */}
      {emergencyMode && (
        <div className="bg-rose-950/70 border border-rose-500/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-900/60 border border-rose-500/50 text-rose-300 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-rose-100 text-sm tracking-wide uppercase">
                  {t('dashboard.emergencyProtocol', 'State Emergency Operations Active — Level 1 Disaster Protocol')}
                </h4>
                <span className="bg-rose-500 text-slate-950 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                  {t('dashboard.redAlert', 'RED ALERT')}
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-0.5">
                {t('dashboard.emergencyDescription', 'Severed corridors detected. Ground convoys staged. Life-saving medical cargo given priority clearance.')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenSituationReport}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              {t('dashboard.generateSitRep', 'Generate AI Situation Brief')}
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Active Vehicles */}
        <div
          onClick={() => onNavigateTab('vehicles')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.activeVehicles', 'Active Vehicles')}</span>
            <Truck className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-100 font-mono">{activeVehicles}</span>
            <span className="text-[10px] text-emerald-400 font-semibold">{t('dashboard.tracked', 'Tracked')}</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block mt-0.5">5 In-Transit Freight</span>
        </div>

        {/* 2. High Risk Corridors */}
        <div
          onClick={() => onNavigateTab('ai-intelligence')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 p-3 rounded-xl cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.highRiskRoads', 'High Risk Roads')}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-400 font-mono">{highRiskCorridors}</span>
            <span className="text-[10px] text-slate-400">/ {corridors.length}</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block mt-0.5">&gt;60% Disruption Index</span>
        </div>

        {/* 3. Restricted Roads */}
        <div
          onClick={() => onNavigateTab('map')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 p-3 rounded-xl cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.restrictedRoads', 'Restricted Roads')}</span>
            <Activity className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-300 font-mono">{restrictedRoads}</span>
            <span className="text-[10px] text-amber-400 font-semibold">{t('dashboard.caution', 'Caution')}</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block mt-0.5">Single-Lane Convoy</span>
        </div>

        {/* 4. Blocked Roads */}
        <div
          onClick={() => onNavigateTab('map')}
          className={`bg-slate-900/90 hover:bg-slate-800/90 border p-3 rounded-xl cursor-pointer transition-all shadow-md group ${
            blockedRoads > 0 ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.blockedRoads', 'Blocked Roads')}</span>
            <Ban className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black font-mono ${blockedRoads > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
              {blockedRoads}
            </span>
            <span className="text-[10px] text-rose-400 font-semibold">{blockedRoads > 0 ? t('dashboard.severed', 'Severed') : t('dashboard.clear', 'Clear')}</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block mt-0.5">Zero Motorable Width</span>
        </div>

        {/* 5. Active Deliveries */}
        <div
          onClick={() => onNavigateTab('supplies')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.activeConvoys', 'Active Convoys')}</span>
            <Package className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-100 font-mono">5</span>
            <span className="text-[10px] text-cyan-400 font-semibold">{t('dashboard.priority', 'Priority')}</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block mt-0.5">Medical, Food, Relief</span>
        </div>

        {/* 6. Delayed Deliveries */}
        <div
          onClick={() => onNavigateTab('vehicles')}
          className={`bg-slate-900/90 hover:bg-slate-800/90 border p-3 rounded-xl cursor-pointer transition-all shadow-md group ${
            delayedVehicles > 0 ? 'border-amber-500/50 bg-amber-950/20' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.delayedFreight', 'Delayed Freight')}</span>
            <Clock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black font-mono ${delayedVehicles > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {delayedVehicles}
            </span>
            <span className="text-[10px] text-amber-300 font-semibold">{delayedVehicles > 0 ? t('dashboard.impacted', 'Impacted') : t('dashboard.onTime', 'On-Time')}</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block mt-0.5">
            {delayedVehicles > 0 ? 'Staged / Slow' : 'Zero Recorded Delay'}
          </span>
        </div>

        {/* 7. Critical Supplies */}
        <div
          onClick={() => onNavigateTab('supplies')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/40 p-3 rounded-xl cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.criticalSupplies', 'Critical Supplies')}</span>
            <Package className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-400 font-mono">{criticalSupplies}</span>
            <span className="text-[10px] text-rose-400 font-semibold">Threshold</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block mt-0.5">Medicines (Imphal)</span>
        </div>

        {/* 8. Active Incidents */}
        <div
          onClick={() => onNavigateTab('incidents')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard.openIncidents', 'Field Incidents')}</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-100 font-mono">{activeIncidents}</span>
            <span className="text-[10px] text-cyan-400 font-semibold">{t('dashboard.tracked', 'Active')}</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block mt-0.5">Verified Geo-Tags</span>
        </div>
      </div>

      {/* Main Interactive Map Stage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              NER Interactive Accessibility & Corridor Matrix
            </h3>
            <span className="text-xs text-slate-400 hidden sm:inline">
              (Live spatial telemetry across 8 North Eastern States)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('routes')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              Inspect Smart Routing <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <NervesGISMap />
      </div>

      {/* Live Meteorological Telemetry (OpenWeather for 8 North Eastern Cities) */}
      <WeatherPanel />

      {/* Live Operational Corridors & Priority Freight Status (2-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Monitored Corridors */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Strategic Highway Corridors Status
              </h4>
              <p className="text-xs text-slate-400">Real-time risk scoring and accessibility index</p>
            </div>
            <button
              onClick={() => onNavigateTab('ai-intelligence')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              Why High Risk? <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {corridors.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCorridorId(c.id);
                  onNavigateTab('map');
                }}
                className="p-3 bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800/80 rounded-lg cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
                      {c.code}
                    </span>
                    <span className="font-semibold text-slate-200 text-xs group-hover:text-cyan-300 transition-colors">
                      {c.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>{c.state}</span>
                    <span>•</span>
                    <span>Rainfall: {c.rainfallMm}mm</span>
                    <span>•</span>
                    <span>Est. Delay: +{c.estimatedDelayMinutes}m</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <RiskBadge score={c.riskScore} level={c.riskLevel} size="sm" />
                  <StatusPill status={c.accessibility} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: In-Transit Essential Logistics Vehicles */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                Active Essential Freight Tracking
              </h4>
              <p className="text-xs text-slate-400">Real-time GPS status, cargo runway, and staging directives</p>
            </div>
            <button
              onClick={() => onNavigateTab('vehicles')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              View All Freight <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {vehicles.map((v) => (
              <div
                key={v.id}
                onClick={() => {
                  setSelectedVehicleId(v.id);
                  onNavigateTab('vehicles');
                }}
                className="p-3 bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800/80 rounded-lg cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {v.id}
                    </span>
                    <span className="font-semibold text-slate-200 text-xs">{v.cargo}</span>
                  </div>
                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                      v.deliveryStatus === 'ON_ROUTE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : v.deliveryStatus === 'STOPPED'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {v.deliveryStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Destination: <span className="text-slate-300">{v.destination}</span>
                  </span>
                  <span>
                    ETA: <span className="text-cyan-300 font-medium">{v.currentEta}</span>
                  </span>
                </div>

                {v.delayReason && (
                  <div className="text-[11px] text-rose-300/90 bg-rose-950/30 border border-rose-900/40 p-2 rounded">
                    ⚠️ {v.delayReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
