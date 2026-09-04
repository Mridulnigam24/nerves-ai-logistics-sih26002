import React, { useState } from 'react';
import { useNerves } from '../../context/NervesContext';
import {
  ShieldCheck,
  UserCheck,
  Clock,
  History,
  AlertCircle,
  FileCheck,
  Scale,
} from 'lucide-react';
import { AuditOverrideModal } from '../common/AuditOverrideModal';

export const AuditLogView: React.FC = () => {
  const { auditLogs, corridors } = useNerves();
  const [overrideModalCorridorId, setOverrideModalCorridorId] = useState<string | null>(null);

  const selectedCorridor = corridors.find((c) => c.id === overrideModalCorridorId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Scale className="w-5 h-5" />
            <h2 className="font-extrabold text-slate-100 text-lg tracking-wide uppercase">
              Human-In-The-Loop Governance & Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            "Government officials must be able to audit and override AI recommendations. Every override requires an official justification and is permanently stamped into the immutable audit registry."
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOverrideModalCorridorId(corridors[1].id)}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Initiate Manual State Override
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Permanent Operational Audit Log Records ({auditLogs.length})
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Certified ISO/DISASTER-GOV Record</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No manual overrides recorded. AI models currently operating in automated mode.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Timestamp (IST)</th>
                  <th className="py-3 px-3">Authorized Officer</th>
                  <th className="py-3 px-3">Target Corridor</th>
                  <th className="py-3 px-3">AI Prediction</th>
                  <th className="py-3 px-3">Human Override</th>
                  <th className="py-3 px-3">Official Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-200">{log.officerName || log.user}</div>
                      <div className="text-[10px] text-slate-400">{log.officerDesignation || log.role}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                      {log.targetName || log.targetEntity}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono text-[11px] text-slate-400">
                        {log.previousStatus ? `${log.previousStatus} (${log.previousScore}%)` : log.previousAiRecommendation}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-cyan-950 text-cyan-300 px-2 py-1 rounded border border-cyan-800/60 font-mono text-[11px] font-bold">
                        {log.newStatus ? `${log.newStatus} (${log.newScore}%)` : log.officialAction}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs text-slate-300 leading-snug">
                      "{log.reason}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Override */}
      {selectedCorridor && (
        <AuditOverrideModal
          corridor={selectedCorridor}
          onClose={() => setOverrideModalCorridorId(null)}
        />
      )}
    </div>
  );
};
