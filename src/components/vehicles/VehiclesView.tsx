import React, { useState } from 'react';
import { useNerves } from '../../context/NervesContext';
import { StatusPill } from '../common/StatusPill';
import { RiskBadge } from '../common/RiskBadge';
import {
  Truck,
  MapPin,
  Clock,
  Gauge,
  Phone,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Vehicle } from '../../types';
import { canManageFleet } from '../../services/rbac';

export const VehiclesView: React.FC = () => {
  const { vehicles, corridors, setSelectedCorridorId, stageVehicle, setSelectedVehicleId, currentRole } = useNerves();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(vehicles[0]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Truck className="w-5 h-5" />
            <h2 className="font-extrabold text-slate-100 text-lg tracking-wide uppercase">
              Live Logistics Freight Telemetry & Fleet Operations
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time tracking of essential supply consignments transiting North Eastern interstate highway arteries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs px-3 py-1.5 rounded-lg">
            Active Vehicles: <span className="text-cyan-400 font-bold">{vehicles.length} Convoys</span>
          </span>
        </div>
      </div>

      {/* Vehicle Grid and Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of 5 Trucks */}
        <div className="space-y-3">
          {vehicles.map((v) => {
            const isSelected = selectedVehicle.id === v.id;
            return (
              <div
                key={v.id}
                onClick={() => {
                  setSelectedVehicle(v);
                  setSelectedVehicleId(v.id);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 shadow-md ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/90 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                      {v.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        v.cargoType === 'MEDICINES'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : v.cargoType === 'FOOD'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : v.cargoType === 'WATER'
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {v.cargoType}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      v.deliveryStatus === 'ON_ROUTE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : v.deliveryStatus === 'STOPPED'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {v.deliveryStatus}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-200 text-xs truncate">{v.cargo}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {v.origin} ➔ {v.destination}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-400">Driver: {v.driver}</span>
                  <span className="font-mono font-bold text-slate-200">{v.currentEta}</span>
                </div>

                {v.delayMinutes > 0 && (
                  <div className="text-[11px] font-semibold text-rose-400 bg-rose-950/30 border border-rose-900/40 px-2 py-1 rounded flex items-center justify-between">
                    <span>Recorded Delay</span>
                    <span>+{v.delayMinutes} mins</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right 2-Columns: Selected Vehicle Live Operations Sheet */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-extrabold text-sm bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {selectedVehicle.id}
                  </span>
                  <h3 className="font-extrabold text-slate-100 text-base">{selectedVehicle.type}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Consignment Cargo: <span className="text-slate-200 font-semibold">{selectedVehicle.cargo}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`font-mono font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider ${
                    selectedVehicle.deliveryStatus === 'ON_ROUTE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : selectedVehicle.deliveryStatus === 'STOPPED'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/60 animate-pulse'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {selectedVehicle.deliveryStatus}
                </span>
                <RiskBadge score={selectedVehicle.riskScore} size="md" />
              </div>
            </div>

            {/* Telemetry Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Speed Telemetry</span>
                <span className="font-bold text-slate-100 font-mono text-sm flex items-center gap-1 mt-0.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  {selectedVehicle.deliveryStatus === 'STOPPED' ? '0' : selectedVehicle.speedKmH} km/h
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Original ETA</span>
                <span className="font-bold text-slate-300 font-mono text-sm mt-0.5 block">
                  {selectedVehicle.originalEta}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Adjusted ETA</span>
                <span className="font-bold text-cyan-300 font-mono text-sm mt-0.5 block">
                  {selectedVehicle.currentEta}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Delay Assessment</span>
                <span
                  className={`font-bold font-mono text-sm mt-0.5 block ${
                    selectedVehicle.delayMinutes > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {selectedVehicle.delayMinutes > 0 ? `+${selectedVehicle.delayMinutes} mins` : 'On Schedule'}
                </span>
              </div>
            </div>

            {/* Delay & Disruption Alert Box if Affected */}
            {selectedVehicle.delayReason && (
              <div className="bg-rose-950/40 border border-rose-500/50 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Logistics Disruption Incident Cause:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{selectedVehicle.delayReason}</p>
                {selectedVehicle.safeStagingPoint && (
                  <div className="pt-2 border-t border-rose-900/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Designated Holding Facility:</span>
                    <span className="font-bold text-emerald-300">🛡️ {selectedVehicle.safeStagingPoint}</span>
                  </div>
                )}
              </div>
            )}

            {/* Driver & Origin / Destination Information */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Driver & Communications</span>
                <p className="font-bold text-slate-200">{selectedVehicle.driver}</p>
                <p className="text-slate-400 font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  {selectedVehicle.driverPhone}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Route & Corridor</span>
                <p className="text-slate-300 font-medium">
                  <span className="text-slate-400">From:</span> {selectedVehicle.origin}
                </p>
                <p className="text-slate-300 font-medium">
                  <span className="text-slate-400">To:</span> {selectedVehicle.destination}
                </p>
              </div>
            </div>

            {/* Operational Actions: Hold Vehicle / Move to Safe Staging Yard */}
            {canManageFleet(currentRole) && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-slate-200 text-xs">Direct Logistics Command</h5>
                  <p className="text-[11px] text-slate-400">Override in-transit instructions for vehicle driver</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      stageVehicle(
                        selectedVehicle.id,
                        selectedVehicle.safeStagingPoint || 'Nearest Safe Border Staging Depot'
                      )
                    }
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow flex items-center gap-1.5"
                  >
                    <Shield className="w-4 h-4" />
                    Hold at Safe Staging Point
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
