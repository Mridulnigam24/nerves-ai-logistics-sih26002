import React, { useState, useRef, useEffect } from 'react';
import { Shield, ChevronDown, UserCheck, Check, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';
import { OPERATIONAL_ROLES, getRoleBadgeLabel, normalizeRole } from '../../services/rbac';

interface DemoRoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

const ROLES_ORDER: UserRole[] = [
  'admin',
  'district_officer',
  'logistics_operator',
  'driver',
  'emergency_responder',
];

export const DemoRoleSelector: React.FC<DemoRoleSelectorProps> = ({
  currentRole,
  onRoleChange,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const normalized = normalizeRole(currentRole);
  const currentConfig = OPERATIONAL_ROLES[normalized];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = (role: UserRole) => {
    onRoleChange(role);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Demo Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 rounded-lg text-xs font-bold transition-all shadow-sm group"
        title="Prototype Role Switcher: Demonstrate NERVES from the perspective of all 5 operational roles"
      >
        <div className="flex items-center gap-1.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="hidden xl:inline text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
            PROTOTYPE DEMO ROLE:
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-mono text-[11px] font-black tracking-wide">
            {currentConfig?.badge || 'ROLE'}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Role Selection Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-950 border border-cyan-500/40 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
          {/* Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                DEMO ROLE SELECTOR
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded font-mono border border-cyan-800">
                SIH Prototype Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Select an operational role to dynamically reload permissions, navigation, dashboards, and data scoping.
            </p>
          </div>

          {/* List of 5 Roles */}
          <div className="p-2 space-y-1 max-h-[380px] overflow-y-auto">
            {ROLES_ORDER.map((roleKey) => {
              const cfg = OPERATIONAL_ROLES[roleKey];
              const isSelected = normalized === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => handleSelectRole(roleKey)}
                  className={`w-full p-2.5 rounded-lg text-left transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-cyan-950/70 border border-cyan-500/60 text-white'
                      : 'hover:bg-slate-900 text-slate-300 border border-transparent'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Shield className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs font-mono tracking-wide text-slate-100">
                        {cfg.badge}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {cfg.title}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-tight">
                      {cfg.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-slate-900/80 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>Principle of Least Privilege</span>
            <span className="text-cyan-400">SIH26002 RBAC</span>
          </div>
        </div>
      )}
    </div>
  );
};
