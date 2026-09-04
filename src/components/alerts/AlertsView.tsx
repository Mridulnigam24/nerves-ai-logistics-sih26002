import React, { useState } from 'react';
import { useNerves } from '../../context/NervesContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Clock,
  Trash2,
  Filter,
} from 'lucide-react';
import { AlertItem, UserRole } from '../../types';

export const AlertsView: React.FC = () => {
  const { alerts, markAlertRead, dismissAllAlerts, currentRole } = useNerves();
  const [filterRole, setFilterRole] = useState<string>('MY_ROLE');

  const filteredAlerts = alerts.filter((a) => {
    if (filterRole === 'ALL') return true;
    if (filterRole === 'MY_ROLE') {
      if (currentRole === 'admin') return true;
      return a.targetRoles.includes(currentRole);
    }
    return a.targetRoles.includes(filterRole as UserRole);
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Bell className="w-5 h-5" />
            <h2 className="font-extrabold text-slate-100 text-lg tracking-wide uppercase">
              Targeted Role-Based Logistics Alert Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Intelligent spatial dispatch filtering: Operators, drivers, and state disaster commanders receive only pertinent situational alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={dismissAllAlerts}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Role Filter Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Target Role:
        </span>
        {[
          { key: 'MY_ROLE', label: `My Role (${currentRole.replace('_', ' ')})` },
          { key: 'ALL', label: 'All Alerts' },
          { key: 'driver', label: 'Drivers' },
          { key: 'logistics_operator', label: 'Logistics Operators' },
          { key: 'district_officer', label: 'District Officers' },
          { key: 'emergency_responder', label: 'Emergency Responders' },
          { key: 'supply_manager', label: 'Supply Managers' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilterRole(item.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filterRole === item.key
                ? 'bg-cyan-600 text-white border-cyan-400 shadow'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/60 border border-slate-800 rounded-xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No active alerts for the selected criteria.</p>
            <p className="text-xs text-slate-500 mt-0.5">All monitored freight arteries operating smoothly.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md ${
                alert.severity === 'CRITICAL'
                  ? 'bg-rose-950/40 border-rose-500/60'
                  : alert.severity === 'HIGH'
                  ? 'bg-amber-950/40 border-amber-500/50'
                  : 'bg-slate-900 border-slate-800'
              } ${alert.isRead ? 'opacity-70' : 'opacity-100'}`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : alert.severity === 'HIGH'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <h4 className="font-extrabold text-slate-100 text-sm">{alert.title}</h4>
                  <span className="text-[11px] font-mono text-slate-400">({alert.timestamp})</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl font-sans">{alert.message}</p>
                {alert.actionRequired && (
                  <p className="text-[11px] text-cyan-300/90 font-medium">
                    ⚡ Directive: {alert.actionRequired}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {!alert.isRead && (
                  <button
                    onClick={() => markAlertRead(alert.id)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
