import React, { useState } from 'react';
import { useNerves } from '../../context/NervesContext';
import { StatusPill } from '../common/StatusPill';
import {
  Wifi,
  WifiOff,
  Camera,
  MapPin,
  AlertTriangle,
  Upload,
  RefreshCw,
  CheckCircle,
  FileCheck,
  Send,
  Navigation,
  Shield,
  Layers,
} from 'lucide-react';
import { AccessibilityStatus } from '../../types';

export const FieldOfficerMobileView: React.FC = () => {
  const {
    offlineMode,
    setOfflineMode,
    offlineQueue,
    isSyncing,
    syncOfflineQueue,
    reportIncident,
    corridors,
    incidents,
  } = useNerves();

  // Form State
  const [incidentType, setIncidentType] = useState<
    'Flood' | 'Landslide' | 'Road Damage' | 'Accident' | 'Road Blockage' | 'Other'
  >('Landslide');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [corridorId, setCorridorId] = useState<string>('corridor-nh37');
  const [accessibility, setAccessibility] = useState<AccessibilityStatus>('BLOCKED');
  const [description, setDescription] = useState<string>('');
  const [coords, setCoords] = useState<[number, number]>([24.8512, 93.4561]); // Makru River coords
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const selectedCorridor = corridors.find((c) => c.id === corridorId);

  const handleSimulateGPS = () => {
    // Generate realistic jitter near the selected corridor
    const lat = Number((24.8 + Math.random() * 0.2).toFixed(4));
    const lng = Number((93.3 + Math.random() * 0.3).toFixed(4));
    setCoords([lat, lng]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    reportIncident({
      incidentType,
      severity,
      coordinates: coords,
      roadName: selectedCorridor ? `${selectedCorridor.code} (${selectedCorridor.name})` : 'NH-37 Lifeline',
      corridorId,
      accessibility,
      description,
      photoUrl:
        photoPreview ||
        'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80',
      reportedBy: 'Field Officer (Ground Patrol)',
      officerDesignation: 'Assistant Executive Engineer / BRO Ground Unit',
    });

    setSubmitSuccess(true);
    setDescription('');
    setPhotoPreview(null);
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Network Connectivity & Offline Mode Simulation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg border flex items-center justify-center ${
              offlineMode
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-400'
                : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
            }`}
          >
            {offlineMode ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-100 text-sm">
                {offlineMode ? 'OFFLINE FIELD MODE (No Cellular Tower)' : 'CONNECTED (4G / Satellite Uplink)'}
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  offlineMode ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                }`}
              >
                {offlineMode ? 'LOCAL STORAGE ACTIVE' : 'REAL-TIME SYNC'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {offlineMode
                ? 'Reports are secured in local indexed storage. Sync queue is held until connectivity is re-established.'
                : 'Direct connection to State Emergency Operations Command.'}
            </p>
          </div>
        </div>

        {/* Offline Toggle & Sync Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setOfflineMode(!offlineMode)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 shadow ${
              offlineMode
                ? 'bg-slate-800 text-amber-300 border-amber-500/50 hover:bg-slate-700'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {offlineMode ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {offlineMode ? 'Simulate Reconnect' : 'Simulate Offline Mode'}
          </button>

          {offlineQueue.length > 0 && (
            <button
              onClick={syncOfflineQueue}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : `Sync Queue (${offlineQueue.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Offline Queue Indicator Alert if records waiting */}
      {offlineQueue.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>{offlineQueue.length} field records</strong> queued in local device cache waiting to synchronize.
            </span>
          </div>
          <span className="text-[11px] font-mono text-amber-300 font-bold">Encrypted Local SQLite / Cache</span>
        </div>
      )}

      {/* Main Incident Reporting Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">Geo-Tagged Field Incident Form</h3>
              <p className="text-xs text-slate-400">Standardized Disaster & Highway Obstruction Protocol</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {new Date().toLocaleDateString('en-IN')} IST
          </span>
        </div>

        {submitSuccess && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              {offlineMode
                ? 'Incident report saved into local offline cache! It will automatically sync once connectivity returns.'
                : 'Incident report verified and broadcast to State Emergency Operations Command!'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Incident Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-300">
                Incident Hazard Type:
              </label>
              <select
                value={incidentType}
                onChange={(e: any) => setIncidentType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="Landslide">Landslide / Slope Failure</option>
                <option value="Flood">Flash Flood / Road Submersion</option>
                <option value="Road Damage">Road Damage / Pavement Washout</option>
                <option value="Road Blockage">Heavy Vehicle Overturned / Obstruction</option>
                <option value="Accident">Major Traffic Accident</option>
                <option value="Other">Other Hazardous Condition</option>
              </select>
            </div>

            {/* Severity */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-300">
                Ground Severity Assessment:
              </label>
              <select
                value={severity}
                onChange={(e: any) => setSeverity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="LOW">LOW (Slowdown only, road passable)</option>
                <option value="MEDIUM">MEDIUM (Caution, debris on shoulder)</option>
                <option value="HIGH">HIGH (Single-lane restricted convoy)</option>
                <option value="CRITICAL">CRITICAL (Total blockage, impassable)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Road / Corridor */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-300">
                Nearest Strategic Corridor:
              </label>
              <select
                value={corridorId}
                onChange={(e) => setCorridorId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
              >
                {corridors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Resulting Road Accessibility */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-300">
                Road Accessibility Classification:
              </label>
              <select
                value={accessibility}
                onChange={(e: any) => setAccessibility(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="ACCESSIBLE">ACCESSIBLE (Full motorable capacity)</option>
                <option value="RESTRICTED">RESTRICTED (Single-lane or light vehicles only)</option>
                <option value="BLOCKED">BLOCKED (Impassable for all vehicles)</option>
              </select>
            </div>
          </div>

          {/* GPS Coordinates & Capture Widget */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold uppercase">GPS Coordinate Stamping:</span>
              <button
                type="button"
                onClick={handleSimulateGPS}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] font-bold flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                Auto-Capture GPS Telemetry
              </button>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-slate-200">
              <span className="bg-slate-900 px-3 py-1.5 rounded border border-slate-700">
                LAT: {coords[0].toFixed(4)}° N
              </span>
              <span className="bg-slate-900 px-3 py-1.5 rounded border border-slate-700">
                LNG: {coords[1].toFixed(4)}° E
              </span>
              <span className="text-[11px] text-emerald-400">✓ Accuracy ±3.2m</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-300">
              Field Incident Observations & Ground Notes:
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe slope condition, estimated debris volume, river water levels, or vehicle blockages..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Photo Attachment (Drag & Drop or File Picker) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-300">
              Attach Photographic Evidence:
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-4 bg-slate-950/60 text-center cursor-pointer relative transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {photoPreview ? (
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-20 w-32 object-cover rounded-lg border border-slate-700 shadow"
                  />
                  <div className="text-left text-xs">
                    <span className="text-emerald-400 font-bold block">✓ Photo Evidence Loaded</span>
                    <span className="text-slate-400 text-[11px]">Click or drag to replace image</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 text-slate-400 space-y-1">
                  <Camera className="w-8 h-8 text-cyan-400/80 mb-1" />
                  <span className="text-xs font-semibold text-slate-200">
                    Click to take/upload photo or drag file here
                  </span>
                  <span className="text-[11px] text-slate-500">Supports JPG, PNG, WebP up to 15MB</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/30 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {offlineMode ? 'Queue In Offline Storage' : 'Broadcast Incident Report'}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Incidents Submitted */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
          Active Field Incidents in Region ({incidents.length})
        </h4>
        <div className="space-y-2">
          {incidents.slice(0, 4).map((inc) => (
            <div
              key={inc.id}
              className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-bold">{inc.id}</span>
                  <span className="font-bold text-slate-200">{inc.incidentType}</span>
                  <span className="text-slate-400">({inc.roadName})</span>
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5">{inc.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusPill status={inc.accessibility} size="sm" />
                <span className="text-[10px] font-mono text-slate-400">{inc.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
