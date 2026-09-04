import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, AlertTriangle, UserCheck } from 'lucide-react';
import { UserRole } from '../../types';
import { getRoleBadgeLabel, getRoleTitle, getDefaultTabForRole, OPERATIONAL_ROLES } from '../../services/rbac';

interface AccessRestrictedViewProps {
  attemptedModule: string;
  userRole: UserRole;
  onReturnHome: () => void;
  onSwitchRole?: (role: UserRole) => void;
}

const MODULE_DISPLAY_NAMES: Record<string, string> = {
  command: 'Command Center & State Overview',
  map: 'Full GIS Spatial Intelligence & Layer Matrix',
  'ai-intelligence': 'Explainable AI & Factor Diagnostics',
  routes: 'Smart Disaster Routing Engine',
  vehicles: 'Fleets & Vehicles Telemetry',
  supplies: 'Essential Supplies & Warehouse Cell',
  field: 'Field Officer Mobile Console',
  incidents: 'Field Incident Verification & Hazard Registry',
  alerts: 'Targeted Alert Dispatch Hub',
  analytics: 'Regional Disruption Analytics & Trends',
  audit: 'Human-in-the-Loop Override Audit Trail',
  'what-if': 'What-If Disaster Stress-Testing Sandbox',
  simulation: 'Simulation Controls & Guided Demonstration',
  'driver-cockpit': 'Lifeline Freight Driver Cockpit',
};

export const AccessRestrictedView: React.FC<AccessRestrictedViewProps> = ({
  attemptedModule,
  userRole,
  onReturnHome,
  onSwitchRole,
}) => {
  const roleBadge = getRoleBadgeLabel(userRole);
  const roleTitle = getRoleTitle(userRole);
  const moduleName = MODULE_DISPLAY_NAMES[attemptedModule] || attemptedModule;
  const roleConfig = OPERATIONAL_ROLES[userRole];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-rose-600/70 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* Security Crest & Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-950/80 border-2 border-rose-500/60 flex items-center justify-center text-rose-400 shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Access Restricted Primary Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-mono font-bold tracking-widest uppercase">
            <Lock className="w-3 h-3" />
            SECURITY POLICY ENFORCEMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ACCESS RESTRICTED
          </h1>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            You do not have permission to access this operational module.
          </p>
        </div>

        {/* Context Details Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">
              Attempted Module:
            </span>
            <span className="font-bold text-rose-300">{moduleName}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">
              Active User Role:
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-cyan-400">
              <UserCheck className="w-3.5 h-3.5" />
              {roleBadge}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">
              Security Rule:
            </span>
            <span className="text-slate-300">
              Principle of Least Privilege (SIH26002 PoLP)
            </span>
          </div>
        </div>

        {/* Explanatory notice */}
        <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          Operational roles within NERVES are strictly partitioned to protect sensitive disaster
          logistics telemetry, avoid conflicting orders during emergencies, and enforce verified
          decision hierarchies.
        </p>

        {/* Action Button: Return to Dashboard */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onReturnHome}
            className="w-full sm:w-auto px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950 transition-all flex items-center justify-center gap-2 tracking-wider uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            RETURN TO MY DASHBOARD
          </button>
        </div>

        {/* Demonstration Helper Note */}
        <div className="pt-4 border-t border-slate-800/60 text-[11px] text-slate-500">
          <span>Prototype Demonstration: </span>
          <span className="text-slate-400">
            Use the{' '}
            <strong className="text-cyan-400">PROTOTYPE DEMO ROLE SELECTOR</strong> in the top header
            to experience the application from the perspective of other operational roles.
          </span>
        </div>
      </div>
    </div>
  );
};
