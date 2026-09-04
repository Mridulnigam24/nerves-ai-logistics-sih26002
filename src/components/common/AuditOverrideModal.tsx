import React, { useState } from 'react';
import { useNerves } from '../../context/NervesContext';
import { Corridor } from '../../types';
import { ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { canPerformRoadOverride } from '../../services/rbac';

interface AuditOverrideModalProps {
  corridor: Corridor;
  onClose: () => void;
}

export const AuditOverrideModal: React.FC<AuditOverrideModalProps> = ({ corridor, onClose }) => {
  const { applyHumanOverride, currentRole } = useNerves();
  const [action, setAction] = useState<
    'MARK_ACCESSIBLE' | 'MARK_RESTRICTED' | 'MARK_BLOCKED' | 'HOLD_VEHICLE' | 'PRIORITIZE_SUPPLY'
  >('MARK_ACCESSIBLE');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    if (!canPerformRoadOverride(currentRole)) {
      alert('Access Denied: Government Road Overrides require SDMA Command (Admin) authorization.');
      return;
    }
    setIsSubmitting(true);
    applyHumanOverride(corridor.id, action, reason);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-slate-100 text-base">Human-in-the-Loop Government Override</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>TARGET CORRIDOR:</span>
              <span className="font-mono text-cyan-400 font-semibold">{corridor.code}</span>
            </div>
            <p className="font-semibold text-slate-200">{corridor.name}</p>
            <div className="flex items-center gap-3 pt-1 text-xs">
              <span className="text-slate-400">
                AI Prediction:{' '}
                <span className="text-amber-400 font-semibold">
                  {corridor.riskScore}% Risk ({corridor.accessibility})
                </span>
              </span>
              <span className="text-slate-400">
                Authority Role: <span className="text-cyan-300 capitalize">{currentRole.replace('_', ' ')}</span>
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-300">
              Select Official Intervention Action:
            </label>
            <select
              value={action}
              onChange={(e: any) => setAction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="MARK_ACCESSIBLE">OVERRIDE TO ACCESSIBLE (Verified safe on ground)</option>
              <option value="MARK_RESTRICTED">OVERRIDE TO RESTRICTED (Permit light/escorted convoy only)</option>
              <option value="MARK_BLOCKED">OVERRIDE TO BLOCKED (Order full civil road closure)</option>
              <option value="HOLD_VEHICLE">HOLD FREIGHT CONVOYS (Divert to Safe Staging Yard)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-300">
              Ground Verification Justification & Audit Reason:
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Ground inspection by BRO Executive Engineer confirms embankment has stabilized; pilot convoy cleared."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[11px] text-slate-400">
              * This override will be stamped with your timestamp and entered into the immutable emergency audit log.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-900/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Recording Audit...' : 'Authorize Override'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
