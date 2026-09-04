import React, { useState, useEffect } from 'react';
import { useNerves } from '../../context/NervesContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Database,
  CloudSun,
  Bot,
  MapPin,
  HardDrive,
  Activity,
  X,
} from 'lucide-react';

export const NetworkStatusPanel: React.FC = () => {
  const {
    offlineMode,
    setOfflineMode,
    offlineQueue,
    isSyncing,
    syncOfflineQueue,
    supabaseStatus,
    weatherSource,
  } = useNerves();

  const [isOpen, setIsOpen] = useState(false);
  const [backendHealth, setBackendHealth] = useState<{
    geminiConfigured: boolean;
    openWeatherConfigured: boolean;
    supabaseConfigured: boolean;
    status: string;
  } | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Check health on mount or when opening panel
  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setBackendHealth(data);
      }
    } catch {
      // Offline
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

  const isDegraded = !offlineMode && backendHealth && (!backendHealth.geminiConfigured || !backendHealth.openWeatherConfigured);

  return (
    <div className="relative">
      {/* Compact Operational Status Indicator in Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
          offlineMode
            ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 hover:bg-amber-900/80'
            : isSyncing
            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60'
            : isDegraded
            ? 'bg-orange-950/80 text-orange-300 border-orange-500/60'
            : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
        }`}
        title="NERVES Regional Network & Infrastructure Status"
      >
        {offlineMode ? (
          <>
            <span className="w-2 h-2 rounded-full border border-amber-400 bg-amber-400" />
            <span className="font-mono text-[11px]">OFFLINE</span>
            {offlineQueue.length > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {offlineQueue.length}
              </span>
            )}
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
            <span className="font-mono text-[11px]">SYNCING</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">ONLINE</span>
          </>
        )}
      </button>

      {/* Connection Status Modal/Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">CONNECTION & SERVICE STATUS</h3>
                  <p className="text-[11px] text-slate-400">NERVES Regional Node Telemetry (SIH26002)</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Service Status Grid */}
            <div className="space-y-2 text-xs">
              {/* Internet Connectivity */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  {offlineMode ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
                  <span>Internet Uplink</span>
                </div>
                <span
                  className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                    offlineMode
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {offlineMode ? 'OFFLINE' : 'ONLINE'}
                </span>
              </div>

              {/* Gemini AI Service */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>Gemini AI Engine</span>
                </div>
                <span
                  className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                    offlineMode
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : backendHealth?.geminiConfigured
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {offlineMode
                    ? 'LOCAL DECISION ENGINE'
                    : backendHealth?.geminiConfigured
                    ? 'AVAILABLE'
                    : 'STANDBY'}
                </span>
              </div>

              {/* OpenWeather Service */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <CloudSun className="w-4 h-4 text-amber-400" />
                  <span>Meteorological Telemetry</span>
                </div>
                <span
                  className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                    offlineMode
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : weatherSource === 'LIVE_OPENWEATHER'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {offlineMode
                    ? 'DEMO / LAST KNOWN'
                    : weatherSource === 'LIVE_OPENWEATHER'
                    ? 'LIVE OPENWEATHER'
                    : 'ACTIVE SENSOR FEED'}
                </span>
              </div>

              {/* Supabase Database */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span>Cloud Database (Supabase)</span>
                </div>
                <span
                  className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                    offlineMode
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : (supabaseStatus.configured && supabaseStatus.isOnline)
                      ? 'bg-purple-950 text-purple-400 border border-purple-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {offlineMode
                    ? 'DISCONNECTED'
                    : (supabaseStatus.configured && supabaseStatus.isOnline)
                    ? 'CONNECTED'
                    : 'LOCAL HYBRID'}
                </span>
              </div>

              {/* GIS Map Tiles */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>GIS Map Tiles</span>
                </div>
                <span
                  className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                    offlineMode
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {offlineMode ? 'CACHED / LOCAL VECTORS' : 'LIVE (OpenStreetMap)'}
                </span>
              </div>

              {/* Local Storage / IndexedDB */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span>Local Data (Browser Storage)</span>
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  AVAILABLE
                </span>
              </div>

              {/* Pending Sync Queue */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
                  <span>Offline Actions Pending Sync</span>
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                  {offlineQueue.length} {offlineQueue.length === 1 ? 'action' : 'actions'}
                </span>
              </div>
            </div>

            {/* Offline Mode Switch & Sync Actions */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setOfflineMode(!offlineMode)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                    offlineMode
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {offlineMode ? (
                    <>
                      <Wifi className="w-4 h-4" />
                      Restore Online Network
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4" />
                      Simulate Offline Mode
                    </>
                  )}
                </button>

                {offlineQueue.length > 0 && (
                  <button
                    onClick={syncOfflineQueue}
                    disabled={isSyncing}
                    className="py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync Now
                  </button>
                )}
              </div>

              <button
                onClick={checkHealth}
                disabled={isCheckingHealth}
                className="w-full py-1.5 text-slate-400 hover:text-slate-200 text-xs font-medium text-center transition-colors"
              >
                {isCheckingHealth ? 'Pinging Services...' : 'Refresh Service Health'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
