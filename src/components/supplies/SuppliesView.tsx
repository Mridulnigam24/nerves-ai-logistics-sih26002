import React, { useState } from 'react';
import { useNerves } from '../../context/NervesContext';
import {
  Package,
  AlertCircle,
  TrendingDown,
  Building,
  MapPin,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { EssentialSupply, SupplyPriority } from '../../types';
import { prioritizeSupplies } from '../../services/aiService';

export const SuppliesView: React.FC = () => {
  const { supplies, vehicles, corridors } = useNerves();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [geminiSupplyAnalysis, setGeminiSupplyAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  const handleRunAiPrioritization = async () => {
    setIsLoadingAi(true);
    try {
      const res = await prioritizeSupplies({ supplies, vehicles, corridors });
      setGeminiSupplyAnalysis(res);
    } catch {
      setGeminiSupplyAnalysis(null);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const filteredSupplies =
    selectedCategory === 'ALL'
      ? supplies
      : supplies.filter((s) => s.category === selectedCategory);

  const criticalCount = supplies.filter((s) => s.priority === 'CRITICAL').length;
  const highCount = supplies.filter((s) => s.priority === 'HIGH').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Package className="w-5 h-5" />
            <h2 className="font-extrabold text-slate-100 text-lg tracking-wide uppercase">
              Essential Supply Lifeline & Stock Prioritization
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Monitoring critical inventory runway across remote district hospitals, flood shelters, and grain depots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-rose-950/80 border border-rose-500/50 text-rose-300 font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            {criticalCount} Critical Shortage
          </span>
          <span className="bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-xs px-3 py-1.5 rounded-lg font-bold">
            {highCount} High Priority
          </span>
        </div>
      </div>

      {/* AI Supply Chain Prioritization Alert Box */}
      <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Gemini AI Supply Lifeline & Stock Prioritization</span>
          </div>
          <button
            onClick={handleRunAiPrioritization}
            disabled={isLoadingAi}
            className="px-3 py-1.5 bg-cyan-900/80 hover:bg-cyan-800 border border-cyan-500/60 text-cyan-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin text-cyan-300' : ''}`} />
            {isLoadingAi ? 'Evaluating Runways...' : 'Run Gemini Lifeline Analysis'}
          </button>
        </div>

        {geminiSupplyAnalysis ? (
          <div className="p-3.5 bg-slate-950 border border-cyan-500/40 rounded-lg text-xs text-slate-200 whitespace-pre-line font-mono leading-relaxed">
            {geminiSupplyAnalysis}
          </div>
        ) : (
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            &quot;Life-saving medicine shipment (TRUCK-001) for Imphal Valley District Hospital requires absolute green-corridor priority. Destination stock is currently at 3.5 days runway. If highway clearance exceeds 8 hours, logistics command must trigger immediate Indian Air Force / civilian emergency helicopter airlift.&quot;
          </p>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Category:
        </span>
        {['ALL', 'MEDICINES', 'FOOD', 'WATER', 'RELIEF_MATERIALS', 'AGRICULTURAL_SUPPLIES'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              selectedCategory === cat
                ? 'bg-cyan-600 text-white border-cyan-400 shadow'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Supply Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSupplies.map((supply) => {
          const matchedVehicle = vehicles.find((v) => v.id === supply.vehicleId);
          const percentAvailable = Math.round((supply.availableQty / supply.requiredQty) * 100);

          return (
            <div
              key={supply.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span
                    className={`font-mono font-bold text-[10px] uppercase px-2.5 py-1 rounded tracking-wider border ${
                      supply.priority === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border-rose-500/60 animate-pulse'
                        : supply.priority === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {supply.priority} PRIORITY
                  </span>
                  <span className="font-mono text-xs text-slate-400">{supply.category}</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm">{supply.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    Dest: <span className="text-slate-200 font-medium">{supply.destination}</span>
                  </p>
                </div>

                {/* Shortage & Quantity Metric */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Available / Required:</span>
                    <span className="font-mono font-bold text-slate-100">
                      {supply.availableQty} / {supply.requiredQty} {supply.unit}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percentAvailable < 70 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percentAvailable)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Inventory Shortfall:</span>
                    <span className="font-bold text-rose-400 font-mono">
                      -{supply.shortage} {supply.unit}
                    </span>
                  </div>
                </div>

                {/* AI Logistics Recommendation */}
                {supply.aiRecommendation && (
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    <span className="font-semibold text-cyan-400 block mb-0.5">AI Recommendation:</span>
                    {supply.aiRecommendation}
                  </div>
                )}
              </div>

              {/* In-Transit Freight Status Footer */}
              <div className="pt-3 border-t border-slate-800 text-xs flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-cyan-300 font-bold">{supply.vehicleId || 'Unassigned'}</span>
                  <span>•</span>
                  <span>{supply.deliveryStatus}</span>
                </div>
                <span className="font-mono text-slate-200 font-semibold">{supply.eta}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
