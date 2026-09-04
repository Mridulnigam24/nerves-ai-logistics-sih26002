import React, { useState } from 'react';
import { useNerves } from '../../context/NervesContext';
import { StatusPill } from '../common/StatusPill';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Camera,
  MapPin,
  ShieldCheck,
  Filter,
  Sparkles,
} from 'lucide-react';
import { FieldIncident, IncidentStatus } from '../../types';
import { prioritizeIncidents } from '../../services/aiService';
import { canVerifyFieldIncidents } from '../../services/rbac';

export const IncidentsView: React.FC = () => {
  const { incidents, verifyIncident, currentRole, corridors, supplies } = useNerves();
  const [selectedIncident, setSelectedIncident] = useState<FieldIncident | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [aiPrioritization, setAiPrioritization] = useState<string | null>(null);
  const [isPrioritizing, setIsPrioritizing] = useState<boolean>(false);

  const handlePrioritize = async () => {
    setIsPrioritizing(true);
    try {
      const res = await prioritizeIncidents({ incidents, corridors, supplies });
      setAiPrioritization(res);
    } catch {
      setAiPrioritization(null);
    } finally {
      setIsPrioritizing(false);
    }
  };

  const filteredIncidents =
    statusFilter === 'ALL' ? incidents : incidents.filter((i) => i.status === statusFilter);

  const canVerify = canVerifyFieldIncidents(currentRole);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-extrabold text-slate-100 text-lg tracking-wide uppercase">
              Field Incident Verification & Hazard Registry
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Reviewing geo-tagged photographic and ground sensor evidence submitted by BRO engineers and district field patrols.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'NEW', 'VERIFIED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === st
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Gemini AI Incident Prioritization Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                Gemini Multi-Hazard Incident Prioritization Engine
              </h3>
              <p className="text-xs text-slate-400">
                Correlates field sensor damage reports with critical lifeline corridors to determine clearance urgency
              </p>
            </div>
          </div>
          <button
            onClick={handlePrioritize}
            disabled={isPrioritizing}
            className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-600/60 text-amber-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isPrioritizing ? 'animate-spin text-amber-400' : ''}`} />
            {isPrioritizing ? 'Analyzing Urgency...' : 'Run Gemini Prioritization'}
          </button>
        </div>

        {aiPrioritization ? (
          <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-lg text-xs text-slate-200 whitespace-pre-line font-mono leading-relaxed">
            {aiPrioritization}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Click &quot;Run Gemini Prioritization&quot; to synthesize incident severity, convoy blockage impact, and BRO machinery deployment hierarchy.
          </p>
        )}
      </div>

      {/* Incidents Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredIncidents.map((incident) => (
          <div
            key={incident.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                      {incident.id}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-100 uppercase">
                      {incident.incidentType}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-200 text-sm mt-1">{incident.roadName}</h4>
                </div>

                <span
                  className={`font-mono font-bold text-[10px] px-2.5 py-1 rounded tracking-wider uppercase border ${
                    incident.status === 'VERIFIED'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                      : incident.status === 'NEW'
                      ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {incident.status}
                </span>
              </div>

              {/* Photo Evidence Preview */}
              {incident.photoUrl && (
                <div className="relative rounded-lg overflow-hidden border border-slate-800 group">
                  <img
                    src={incident.photoUrl}
                    alt="Field evidence"
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-950/90 backdrop-blur text-[10px] text-slate-300 px-2 py-1 rounded border border-slate-800 flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {incident.coordinates[0]}° N, {incident.coordinates[1]}° E
                  </div>
                </div>
              )}

              {/* Description & Details */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                {incident.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div>
                  Reported By: <span className="text-slate-200 font-medium">{incident.reportedBy}</span>
                </div>
                <div className="text-right">
                  Designation: <span className="text-slate-200">{incident.officerDesignation}</span>
                </div>
              </div>
            </div>

            {/* Verification Controls for Authorized Officials */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">{incident.timestamp}</span>

              {canVerify && incident.status !== 'VERIFIED' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => verifyIncident(incident.id, 'VERIFIED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verify Incident
                  </button>
                  <button
                    onClick={() => verifyIncident(incident.id, 'REJECTED')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    Reject
                  </button>
                </div>
              )}

              {incident.status === 'VERIFIED' && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Official Verified
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
