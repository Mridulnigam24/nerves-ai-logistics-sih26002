import React, { useState } from 'react';
import { useNerves } from '../../context/NervesContext';
import {
  Truck,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Fuel,
  Thermometer,
  Radio,
  Navigation,
  CheckCircle2,
  PhoneCall,
  Clock,
  Compass,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Eye,
  Camera,
  Layers,
} from 'lucide-react';
import { getScopedCorridors, getScopedVehicles, getScopedAlerts } from '../../services/rbac';

export const DriverCockpitView: React.FC = () => {
  const {
    vehicles,
    corridors,
    stageVehicle,
    reportIncident,
    alerts,
    currentRole,
    currentUser,
    theme,
  } = useNerves();

  // Scoped strictly to Driver's assigned vehicle and corridor
  const scopedVehicles = getScopedVehicles(vehicles, currentRole, currentUser);
  const scopedCorridors = getScopedCorridors(corridors, currentRole, currentUser);
  const scopedAlerts = getScopedAlerts(alerts, currentRole, currentUser);

  const activeVehicle = scopedVehicles[0] || vehicles[0];
  const assignedCorridor = scopedCorridors[0] || corridors[0];

  const isBlocked = assignedCorridor?.accessibility === 'BLOCKED';
  const isRestricted = assignedCorridor?.accessibility === 'RESTRICTED' || assignedCorridor?.riskScore > 60;
  const isSafeStaged = activeVehicle?.deliveryStatus === 'STOPPED';

  // State modals
  const [activeModal, setActiveModal] = useState<
    'route' | 'staging' | 'eoc' | 'sos' | 'delivery' | 'report' | null
  >(null);
  const [sosTriggered, setSosTriggered] = useState<boolean>(false);
  const [stagedConfirmed, setStagedConfirmed] = useState<boolean>(isSafeStaged);

  // Delivery status update state
  const [deliveryStatusNote, setDeliveryStatusNote] = useState<string>('En-route on schedule');
  const [deliveryUpdatedMessage, setDeliveryUpdatedMessage] = useState<string | null>(null);

  // Road condition report state (Driver ground truth)
  const [reportType, setReportType] = useState<string>('LANDSLIDE');
  const [reportSeverity, setReportSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [reportRoadCondition, setReportRoadCondition] = useState<string>('Partial Obstruction');
  const [reportDescription, setReportDescription] = useState<string>('Mud slurry and loose boulders sliding from hillside near Makru approaches.');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);

  const handleHoldAtStaging = () => {
    if (activeVehicle) {
      stageVehicle(activeVehicle.id, 'Jiribam Border Safe Staging Yard');
      setStagedConfirmed(true);
    }
  };

  const handleDriverReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportIncident({
      corridorId: assignedCorridor.id,
      roadName: `${assignedCorridor.name} (${assignedCorridor.code})`,
      incidentType: reportType as any,
      severity: reportSeverity,
      description: `[DRIVER GROUND TRUTH]: ${reportDescription}`,
      coordinates: [24.8021, 93.1254],
      reportedBy: `Driver: ${activeVehicle.driver} (${activeVehicle.id})`,
      officerDesignation: 'Lifeline Convoy Driver (Commercial Heavy Freight)',
      accessibility: reportSeverity === 'CRITICAL' ? 'BLOCKED' : 'RESTRICTED',
      photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    });

    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setActiveModal(null);
    }, 2000);
  };

  const handleUpdateDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDeliveryUpdatedMessage('Delivery telemetry successfully updated to Logistics Operations dispatch.');
    setTimeout(() => {
      setDeliveryUpdatedMessage(null);
      setActiveModal(null);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-16">
      {/* Top Banner: Official Driver Cockpit & Identification */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-400 uppercase font-mono tracking-wider">
                {activeVehicle.id}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                P1 CRITICAL LIFELINE
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              NERVES DRIVER COCKPIT
            </h1>
            <p className="text-xs text-slate-400">
              Driver: <strong className="text-slate-200">{activeVehicle.driver}</strong> • License: TR-IND-9024 • Tel: {activeVehicle.driverPhone}
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">GPS Speed</span>
          <span className="text-xl font-mono font-black text-white">
            {isSafeStaged ? '0' : (activeVehicle.speedKmh ?? activeVehicle.speedKmH ?? 28)}{' '}
            <span className="text-xs font-normal text-slate-400">km/h</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">
            {isSafeStaged ? 'SAFELY STAGED' : 'GPS LOCKED'}
          </span>
        </div>
      </div>

      {/* Safety Instructions Banner (Exact Format Required by User Spec) */}
      {isBlocked ? (
        <div className="bg-rose-950/90 border-2 border-rose-500 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-lg animate-pulse">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-900 border border-rose-600 text-white font-mono font-black text-xs uppercase tracking-wider">
                🔴 CRITICAL
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                ROAD BLOCKED — DO NOT PROCEED
              </h2>
              <p className="text-xs sm:text-sm text-rose-100 font-medium">
                {assignedCorridor.name} ({assignedCorridor.code}) is completely severed by severe debris and hill embankment collapse.
              </p>
            </div>
          </div>

          <div className="bg-rose-900/60 border border-rose-600/70 rounded-xl p-4 text-xs text-white space-y-2">
            <div className="font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              NERVES RECOMMENDS: SAFE STAGING
            </div>
            <div className="text-base font-black text-white">
              Jiribam Safe Staging Yard (NH-37 Entry Checkpost)
            </div>
            <p className="text-xs text-rose-100 leading-relaxed">
              • Secure armed military yard with 24/7 auxiliary diesel power for insulin refrigeration.
              <br />• Drinking water, food rations, and satellite radio available.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {stagedConfirmed ? (
              <div className="py-3 bg-emerald-600/30 border border-emerald-500 rounded-xl text-center text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                VEHICLE SAFELY STAGED AT JIRIBAM YARD (REPORTED)
              </div>
            ) : (
              <button
                type="button"
                onClick={handleHoldAtStaging}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 tracking-wide uppercase"
              >
                <ShieldCheck className="w-4 h-4" />
                NAVIGATE TO STAGING (HOLD VEHICLE)
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveModal('eoc')}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              CONTACT EOC DISPATCH
            </button>
          </div>
        </div>
      ) : isRestricted ? (
        <div className="bg-amber-950/80 border-2 border-amber-500 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-slate-950 shrink-0 font-bold">
              <AlertTriangle className="w-6 h-6 text-slate-950" />
            </div>
            <div className="space-y-1">
              <span className="font-mono font-black text-xs text-amber-300 uppercase tracking-widest">
                ⚠ HIGH DISRUPTION RISK
              </span>
              <h2 className="text-lg font-black text-white">
                Risk: {assignedCorridor.riskScore}% • Road: RESTRICTED
              </h2>
              <div className="text-xs font-bold text-amber-200">
                Recommendation: PROCEED WITH CAUTION
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed mt-1">
                Continuous heavy rainfall and localized slope slippage. Single-lane convoy control enforced. Maximum speed: 25 km/h. Maintain 50m vehicle headway.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                HIGHWAY PASSABLE & CLEAR
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                {assignedCorridor.name} (Risk: {assignedCorridor.riskScore}%)
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                All bridges motorable. Proceed on scheduled convoy timeline.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Driver Telemetry & Consignment Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Current GPS</span>
          <div className="font-bold text-white mt-1 font-mono text-[11px]">
            24.8021° N, 93.1254° E
          </div>
          <span className="text-[10px] text-cyan-400">Jiribam Border Post</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Assigned Route</span>
          <div className="font-bold text-white mt-1 truncate">
            Silchar → Imphal (NH-37)
          </div>
          <span className="text-[10px] text-slate-400">Lifeline Mountain Highway</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Destination</span>
          <div className="font-bold text-white mt-1 truncate">
            RIMS Hospital, Imphal
          </div>
          <span className="text-[10px] text-emerald-400">Regional Cold Storage</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Current ETA</span>
          <div className="font-bold text-amber-400 mt-1 font-mono">
            {activeVehicle.currentEta || '17:55 IST (+70m)'}
          </div>
          <span className="text-[10px] text-slate-400">Delay: +{activeVehicle.delayMinutes} mins</span>
        </div>
      </div>

      {/* Cargo & Cold-Chain Integrity */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Cargo Cold-Chain Telemetry
            </h3>
          </div>
          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
            OPTIMAL REFRIGERATION
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase">Cargo Item</span>
            <div className="font-bold text-white mt-0.5 truncate">{activeVehicle.cargo}</div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase">Reefer Chamber</span>
            <div className="font-bold text-emerald-400 mt-0.5 font-mono flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5" />
              {activeVehicle.temperatureCelsius ?? 4.2}°C (Safe: 2-8°C)
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase">Fuel Level</span>
            <div className="font-bold text-cyan-400 mt-0.5 font-mono flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5" />
              {activeVehicle.fuelLevelPct ?? 82}% (Diesel)
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase">Aux Generator</span>
            <div className="font-bold text-emerald-400 mt-0.5 font-mono">
              ONLINE (100%)
            </div>
          </div>
        </div>
      </div>

      {/* Relevant Alerts for Driver */}
      {scopedAlerts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Relevant Route & Safety Alerts ({scopedAlerts.length})
          </h3>

          <div className="space-y-2">
            {scopedAlerts.slice(0, 3).map((alt) => (
              <div
                key={alt.id}
                className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex items-start gap-2.5"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    alt.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{alt.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{alt.timestamp}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{alt.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Six Primary Action Buttons for Driver (Exact User Specification) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Convoy Cockpit Action Controls
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {/* 1. VIEW ROUTE */}
          <button
            type="button"
            onClick={() => setActiveModal('route')}
            className="p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl font-bold text-slate-200 transition-all flex flex-col items-center justify-center gap-2 text-center group"
          >
            <Navigation className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>VIEW ROUTE</span>
          </button>

          {/* 2. VIEW SAFE STAGING */}
          <button
            type="button"
            onClick={() => setActiveModal('staging')}
            className="p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl font-bold text-slate-200 transition-all flex flex-col items-center justify-center gap-2 text-center group"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>VIEW SAFE STAGING</span>
          </button>

          {/* 3. CONTACT EOC */}
          <button
            type="button"
            onClick={() => setActiveModal('eoc')}
            className="p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl font-bold text-slate-200 transition-all flex flex-col items-center justify-center gap-2 text-center group"
          >
            <PhoneCall className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>CONTACT EOC</span>
          </button>

          {/* 4. EMERGENCY / SOS */}
          <button
            type="button"
            onClick={() => setActiveModal('sos')}
            className="p-3.5 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-700/60 hover:border-rose-500 rounded-xl font-bold text-rose-300 transition-all flex flex-col items-center justify-center gap-2 text-center group"
          >
            <Radio className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            <span>EMERGENCY / SOS</span>
          </button>

          {/* 5. UPDATE DELIVERY */}
          <button
            type="button"
            onClick={() => setActiveModal('delivery')}
            className="p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-xl font-bold text-slate-200 transition-all flex flex-col items-center justify-center gap-2 text-center group"
          >
            <CheckCircle2 className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>UPDATE DELIVERY</span>
          </button>

          {/* 6. REPORT ROAD CONDITION */}
          <button
            type="button"
            onClick={() => setActiveModal('report')}
            className="p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl font-bold text-slate-200 transition-all flex flex-col items-center justify-center gap-2 text-center group"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>REPORT ROAD CONDITION</span>
          </button>
        </div>
      </div>

      {/* Safety & PoLP Compliance Notice */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 text-[11px] text-slate-500 flex items-center justify-between">
        <span>NERVES Principle of Least Privilege: Driver is authorized for ground reporting and convoy staging.</span>
        <span className="font-mono text-emerald-400">PoLP SECURE</span>
      </div>

      {/* MODAL 1: VIEW ROUTE */}
      {activeModal === 'route' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Navigation className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Assigned Lifeline Highway Route</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Corridor:</span>
                  <span className="font-bold text-white">NH-37 (Silchar – Jiribam – Imphal)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Distance:</span>
                  <span className="font-bold text-white">225 km</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ghat Section Length:</span>
                  <span className="font-bold text-amber-300">140 km (High Mountain Incline)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Current GPS Location:</span>
                  <span className="font-bold text-emerald-400">km 42.5 (Jiribam Border Gate)</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-200">Route Waypoints:</h4>
                <ol className="space-y-1.5 pl-4 list-decimal text-slate-400">
                  <li>Silchar Central Logistics Depot (Origin) — PASSED</li>
                  <li>Jiribam Border Safe Staging Yard — CURRENT MILESTONE</li>
                  <li>Makru River Bridgehead (Elevation 450m) — HIGH LANDSLIDE RISK</li>
                  <li>Noney & Tamenglong Ghat Pavement — SINGLE-LANE RESTRICTION</li>
                  <li>RIMS Hospital Complex, Imphal (Final Destination)</li>
                </ol>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-600/40 text-amber-200 text-[11px]">
                ⚠ CAUTION: Heavy multi-axle freight cannot use unpaved hill bypasses. Stay on NH-37 or hold at Jiribam Safe Staging Yard.
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Close Route View
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW SAFE STAGING */}
      {activeModal === 'staging' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Authorized Safe Staging Facility</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-1">
                <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold">
                  DESIGNATED HAVEN:
                </span>
                <div className="font-bold text-base text-white">
                  Jiribam Border Safe Staging Yard (NH-37 Entry Checkpost)
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Established by State Disaster Management Authority & Manipur Police for extreme weather holding.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Cold-Chain Power</span>
                  <span className="text-emerald-400 font-bold">24/7 Aux 125kVA Genset</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Security</span>
                  <span className="text-white font-bold">Assam Rifles / State Police</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Driver Welfare</span>
                  <span className="text-white font-bold">Driver Rest Barracks & Mess</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Capacity</span>
                  <span className="text-cyan-400 font-bold">60 Heavy Freight Bays</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleHoldAtStaging();
                  setActiveModal(null);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <ShieldCheck className="w-4 h-4" />
                Confirm Staging at Jiribam (Notify Dispatch)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONTACT EOC */}
      {activeModal === 'eoc' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400">
                <PhoneCall className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Emergency Operations Center (EOC)</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <a
                href="tel:1077"
                className="p-3.5 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 flex items-center gap-3 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">State EOC Toll-Free: 1077</div>
                  <div className="text-[11px] text-slate-400">24/7 Disaster Control Room Desk</div>
                </div>
              </a>

              <a
                href="tel:112"
                className="p-3.5 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 flex items-center gap-3 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Emergency Police & Rescue: 112</div>
                  <div className="text-[11px] text-slate-400">Highway Patrol & Ambulance Dispatch</div>
                </div>
              </a>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Jiribam Checkpost Commander:</div>
                <div className="font-bold text-white">+91 94350 88214 (Sub-Divisional Officer)</div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: EMERGENCY / SOS */}
      {activeModal === 'sos' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-600 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Radio className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold text-white text-base">Convoy SOS & Distress Beacon</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed">
                Triggering the SOS beacon immediately broadcasts your exact coordinates to BRO Project Pushpak, 12 Bn NDRF, and State Police Highway Patrol.
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                <div>Vehicle: {activeVehicle.id} (Driver: {activeVehicle.driver})</div>
                <div>Telemetry: 24.8021° N, 93.1254° E • NH-37 Makru Sector</div>
                <div>Cargo at Stake: {activeVehicle.cargo}</div>
              </div>

              {sosTriggered ? (
                <div className="p-4 bg-rose-950 border border-rose-500 rounded-xl text-center space-y-2">
                  <div className="font-mono font-bold text-rose-300 animate-pulse">
                    🚨 SOS BROADCAST TRANSMITTED
                  </div>
                  <p className="text-xs text-rose-100">
                    Rescue teams have received your distress telemetry. Maintain your safe position inside the cab. Auxiliary heater and beacon active.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSosTriggered(true)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <Radio className="w-4 h-4" />
                  CONFIRM & BROADCAST SOS DISTRESS BEACON
                </button>
              )}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: UPDATE DELIVERY */}
      {activeModal === 'delivery' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Update Delivery & Convoy Status</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {deliveryUpdatedMessage ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500 rounded-xl text-center text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {deliveryUpdatedMessage}
              </div>
            ) : (
              <form onSubmit={handleUpdateDeliverySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Current Convoy Milestone</label>
                  <select
                    value={deliveryStatusNote}
                    onChange={(e) => setDeliveryStatusNote(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                  >
                    <option value="En-route on schedule">En-route on schedule</option>
                    <option value="Safely Staged at Jiribam Border Yard">Safely Staged at Jiribam Border Yard</option>
                    <option value="Stopped at police escort checkpoint">Stopped at police escort checkpoint</option>
                    <option value="Cold-chain temperature confirmed 4.2°C">Cold-chain temperature confirmed 4.2°C</option>
                    <option value="Arrived at RIMS Hospital Gate">Arrived at RIMS Hospital Gate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Driver Remarks (Optional)</label>
                  <input
                    type="text"
                    defaultValue="Vehicle parked safely in reefer bay with aux generator connected."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg uppercase tracking-wide"
                >
                  Transmit Status Update to Dispatch
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 6: REPORT ROAD CONDITION (Driver Ground Truth) */}
      {activeModal === 'report' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-white text-base">Report Road Condition (Ground Truth)</h3>
                  <span className="text-[10px] text-slate-400">Status: AI / FIELD REPORT PENDING VERIFICATION</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="p-4 bg-emerald-950/70 border border-emerald-500 rounded-xl text-center space-y-2">
                <div className="font-mono font-bold text-emerald-300 text-sm">
                  GROUND TRUTH REPORT SUBMITTED!
                </div>
                <div className="inline-block px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-600 font-mono text-[10px] uppercase">
                  AI / FIELD REPORT PENDING VERIFICATION
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Authorized District Officer / SDMA Command will verify official road accessibility.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDriverReportSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Observed Hazard Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="LANDSLIDE">Active Landslide / Mud Debris</option>
                    <option value="FLOOD">Waterlogging / Riverine Overflow</option>
                    <option value="ROAD_DAMAGE">Pavement Fracture / Subsidence</option>
                    <option value="WEATHER_HAZARD">Extreme Low Visibility / Cloudburst</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Severity</label>
                    <select
                      value={reportSeverity}
                      onChange={(e) => setReportSeverity(e.target.value as any)}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    >
                      <option value="CRITICAL">CRITICAL (Total Blockage)</option>
                      <option value="HIGH">HIGH (Dangerous Single Lane)</option>
                      <option value="MEDIUM">MEDIUM (Rough Slow Surface)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Road Condition</label>
                    <select
                      value={reportRoadCondition}
                      onChange={(e) => setReportRoadCondition(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    >
                      <option value="Severe Debris Blockage">Severe Debris Blockage</option>
                      <option value="Partial Obstruction">Partial Obstruction</option>
                      <option value="Rough Surface">Rough Surface</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Observed Hazard Description</label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white resize-none"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                  ℹ Human-in-the-Loop Safety Rule: Driver ground reports provide crucial live truth, but official corridor status is confirmed by the assigned District Officer or SDMA Command.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg uppercase tracking-wide"
                >
                  Submit Ground Truth Report
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
