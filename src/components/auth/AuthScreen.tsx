import React, { useState } from 'react';
import {
  Shield,
  Lock,
  UserCheck,
  Truck,
  Radio,
  Building2,
  Package,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Globe,
  ArrowRight,
  Sparkles,
  KeyRound,
  FileCheck,
  ChevronRight,
  Boxes,
} from 'lucide-react';
import { useNerves } from '../../context/NervesContext';
import { UserRole, UserProfile } from '../../types';
import { SupportedLanguage } from '../../services/i18n';
import { ThemeToggle } from '../common/ThemeToggle';

type AuthStep = 'login' | 'select_role' | 'register' | 'verify';

interface RoleOption {
  role: UserRole;
  title: string;
  subtitle: string;
  clearance: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  defaultEmail: string;
  description: string;
  capabilities: string[];
  state: string;
  district: string;
}

const PRIMARY_ROLES: RoleOption[] = [
  {
    role: 'admin',
    title: 'State Disaster Management Authority (SDMA)',
    subtitle: 'State Command & Executive Decisions',
    clearance: 'Clearance Level 1 (Full Strategic Command)',
    icon: Shield,
    badgeColor: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900',
    defaultEmail: 'sdma.director@nerves.gov.in',
    description: 'Autonomous disaster escalation, regional highway directives, multi-agency resource allocation, and AI SitRep authoring.',
    capabilities: [
      'Statewide Emergency Escalation',
      'Civil Airlift & Defense Coordination',
      'AI Situation Report Authoring',
      'Inter-Agency Resource Triage',
    ],
    state: 'Assam',
    district: 'Kamrup Metro (Guwahati)',
  },
  {
    role: 'district_officer',
    title: 'District Logistics & PWD / BRO Officer',
    subtitle: 'Highway Clearance & Heavy Machinery',
    clearance: 'Clearance Level 2 (Corridor Engineering)',
    icon: Building2,
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    defaultEmail: 'ee.pwd.tamenglong@nerves.gov.in',
    description: 'Corridor risk override, BRO Project Pushpak earthmover dispatch, and bridgehead clearance telemetry.',
    capabilities: [
      'Highway Accessibility Overrides',
      'BRO Heavy Earthmover Mobilization',
      'Bridgehead Clearance Telemetry',
      'District Debris Clearing Supervision',
    ],
    state: 'Manipur',
    district: 'Tamenglong / Noney',
  },
  {
    role: 'logistics_operator',
    title: 'Emergency Fleet Logistics Operator',
    subtitle: 'Convoy Tracking & Warehouse Staging',
    clearance: 'Clearance Level 3 (Logistics Coordination)',
    icon: Package,
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    defaultEmail: 'fleet.silchar@nerves.gov.in',
    description: 'Convoy waypoint monitoring, safe staging yard enforcement at Jiribam, and freight triage for life-saving cargo.',
    capabilities: [
      'Convoy Waypoint GPS Monitoring',
      'Jiribam Safe Staging Yard Enforcement',
      'Cold-Chain Insulin & Medical Triage',
      'Warehouse Buffer Threshold Tracking',
    ],
    state: 'Assam',
    district: 'Cachar (Silchar Depot)',
  },
  {
    role: 'driver',
    title: 'Lifeline Convoy Driver',
    subtitle: 'Tactical Route & Safe Haven Staging',
    clearance: 'Clearance Level 4 (Transit & Driver Advisory)',
    icon: Truck,
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    defaultEmail: 'driver.truck001@nerves.gov.in',
    description: 'High-contrast mobile cockpit, safe staging notifications, and real-time mountain terrain warnings.',
    capabilities: [
      'Tactical Mountain Mobile Cockpit',
      'Immediate Safe Haven Staging Alerts',
      'Slope Saturation & Hazard Warnings',
      'Emergency Staging Check-In',
    ],
    state: 'Manipur',
    district: 'Jiribam Border Sector',
  },
  {
    role: 'emergency_responder',
    title: 'NDRF / SDRF Field Responder',
    subtitle: 'Rapid Ground Triage & Offline GIS Reporting',
    clearance: 'Clearance Level 5 (Ground Operations)',
    icon: Radio,
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    defaultEmail: 'sdrf.responder12@nerves.gov.in',
    description: 'Geotagged landslide hazard logs, offline incident queueing, and flood barrier deployment verification.',
    capabilities: [
      'Geo-Tagged Incident Field Logging',
      'Offline Storage & Queue Sync',
      'Culvert & Slurry Runoff Inspection',
      'Ground-Truth Incident Verification',
    ],
    state: 'Manipur',
    district: 'Noney / Makru Bridgehead',
  },
];

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; region: string }[] = [
  { code: 'en', label: 'English', region: 'National' },
  { code: 'as', label: 'অসমীয়া (Assamese)', region: 'Assam' },
  { code: 'bn', label: 'বাংলা (Bengali)', region: 'Barak Valley / Tripura' },
  { code: 'mni', label: 'মৈতৈলোন্ (Manipuri)', region: 'Manipur' },
  { code: 'brx', label: 'बड़ो (Bodo)', region: 'BTR / Assam' },
  { code: 'kh', label: 'Ka Ktien Khasi', region: 'Meghalaya' },
  { code: 'lus', label: 'Mizo ṭawng', region: 'Mizoram' },
  { code: 'ne', label: 'नेपाली (Nepali)', region: 'Sikkim / Assam' },
  { code: 'hi', label: 'हिन्दी (Hindi)', region: 'National' },
  { code: 'grt', label: 'A·chik (Garo)', region: 'Meghalaya' },
  { code: 'nag', label: 'Nagamese', region: 'Nagaland' },
];

export const AuthScreen: React.FC = () => {
  const { login, register, verifyDemo, language, setLanguage, t, offlineMode } = useNerves();

  const [step, setStep] = useState<AuthStep>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState<string>('sdma.director@nerves.gov.in');
  const [password, setPassword] = useState<string>('••••••••');
  const [officerName, setOfficerName] = useState<string>('Shri Rajiv Sarma, IAS');
  const [organization, setOrganization] = useState<string>('State Disaster Management Authority (SDMA)');
  const [stateName, setStateName] = useState<string>('Assam');
  const [district, setDistrict] = useState<string>('Kamrup Metro (Guwahati)');
  const [phone, setPhone] = useState<string>('+91 94350 12345');
  const [otp, setOtp] = useState<string>('729401');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);

  // Professional transition state (Section 9)
  const [authTransitionStage, setAuthTransitionStage] = useState<number | null>(null);

  const activeRoleOption = PRIMARY_ROLES.find((r) => r.role === selectedRole) || PRIMARY_ROLES[0];

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    const roleOpt = PRIMARY_ROLES.find((r) => r.role === newRole);
    if (roleOpt) {
      setEmail(roleOpt.defaultEmail);
      setOfficerName(
        roleOpt.role === 'admin'
          ? 'Shri Rajiv Sarma, IAS'
          : roleOpt.role === 'district_officer'
          ? 'Er. T. Jamir, EE (Border Roads)'
          : roleOpt.role === 'logistics_operator'
          ? 'Smt. Priyanka Baruah'
          : roleOpt.role === 'driver'
          ? 'Havildar B. Singh'
          : 'Inspector L. Rongmei'
      );
      setOrganization(roleOpt.title);
      setStateName(roleOpt.state);
      setDistrict(roleOpt.district);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Execute professional authentication transition sequence (Section 9)
    setAuthTransitionStage(1);
    setTimeout(() => setAuthTransitionStage(2), 350);
    setTimeout(() => setAuthTransitionStage(3), 700);
    setTimeout(() => setAuthTransitionStage(4), 1050);
    setTimeout(() => {
      login(email, selectedRole, officerName);
    }, 1300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: Partial<UserProfile> = {
      name: officerName,
      email,
      role: selectedRole,
      phone,
      organization,
      state: stateName,
      district,
    };
    register(newUser);
    setStep('verify');
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      verifyDemo();
    }, 600);
  };

  // If undergoing professional transition sequence
  if (authTransitionStage !== null) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-cyan-500 selection:text-slate-950">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-xl p-8 shadow-2xl space-y-6 text-center animate-in fade-in duration-200">
          <div className="w-14 h-14 mx-auto rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Shield className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h2 className="text-sm font-mono font-bold tracking-widest text-cyan-400 uppercase">
              AUTHENTICATING...
            </h2>
            <p className="text-xs text-slate-400">NERVES Operational Security Gateway</p>
          </div>

          <div className="space-y-3 text-left font-mono text-xs bg-slate-950/80 p-4 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 ${authTransitionStage >= 1 ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span className={authTransitionStage >= 1 ? 'text-slate-200' : 'text-slate-600'}>
                Identity verified ({officerName})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 ${authTransitionStage >= 2 ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span className={authTransitionStage >= 2 ? 'text-slate-200' : 'text-slate-600'}>
                Operational clearance verified ({activeRoleOption.clearance.split('(')[0]})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 ${authTransitionStage >= 3 ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span className={authTransitionStage >= 3 ? 'text-slate-200' : 'text-slate-600'}>
                Regional network connected ({offlineMode ? 'Local Cache Mode' : 'Live Node'})
              </span>
            </div>
          </div>

          {authTransitionStage >= 4 && (
            <div className="pt-2 text-xs font-bold text-cyan-300 tracking-wider animate-pulse flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              ENTERING NERVES COMMAND CENTER
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Bar: Official Seals and Language Selector */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 lg:px-8 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-900/60 border border-blue-700/40 text-blue-300">
                SIH26002
              </span>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Govt. of India • North Eastern Regional Council
              </span>
            </div>
            <h1 className="text-sm lg:text-base font-bold text-white tracking-tight">
              NERVES — AI Logistics & Disaster Accessibility Platform
            </h1>
          </div>
        </div>

        {/* Top Controls: Language & Visual Theme */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <label htmlFor="auth-lang-select" className="sr-only">
              Regional Language
            </label>
            <select
              id="auth-lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label} ({lang.region})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Authentication Flow Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        {/* Step Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setStep('login')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              step === 'login'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            1. {t?.auth?.loginTitle || 'Portal Login'}
          </button>
          <button
            type="button"
            onClick={() => setStep('select_role')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              step === 'select_role'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            2. {t?.auth?.roleSelectTitle || 'Operational Role'}
          </button>
          <button
            type="button"
            onClick={() => setStep('register')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              step === 'register'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            3. {t?.auth?.registerTitle || 'Register Profile'}
          </button>
          <button
            type="button"
            onClick={() => setStep('verify')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              step === 'verify'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            4. {t?.auth?.verificationTitle || 'Identity Verification'}
          </button>
        </div>

        {/* STEP 1: Streamlined Operational Login */}
        {step === 'login' && (
          <div className="max-w-xl mx-auto w-full bg-slate-950 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header Branding */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white font-mono">NERVES</h1>
              </div>
              <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">
                AI Logistics & Accessibility Platform • SIH26002
              </div>
              <p className="text-xs text-slate-400 italic">
                &quot;Resilient mobility for emergency response.&quot;
              </p>
            </div>

            <div className="border-t border-slate-800/80 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  SECURE OPERATIONAL ACCESS
                </h2>
                {offlineMode ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    OFFLINE SESSION
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    ONLINE VERIFICATION
                  </span>
                )}
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Clean Operational Role Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Operational Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium cursor-pointer"
                  >
                    {PRIMARY_ROLES.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Details Panel (Clearance level, description, major capabilities) */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200">{activeRoleOption.subtitle}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${activeRoleOption.badgeColor}`}>
                      {activeRoleOption.clearance}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activeRoleOption.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Major Permitted Capabilities:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeRoleOption.capabilities.map((cap, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700"
                        >
                          • {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Email / Officer ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Email / Officer ID
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                    placeholder="officer@nerves.gov.in"
                  />
                </div>

                {/* Password / Access PIN */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password / Access PIN
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>

                {/* Remember this device checkbox */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>Remember this device</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('verify')}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Instant Evaluator Demo OTP →
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-sm shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Lock className="w-4 h-4" />
                  SIGN IN TO NERVES
                </button>
              </form>

              {/* Status Indicators */}
              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${offlineMode ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                  <span>{offlineMode ? '○ OFFLINE SESSION' : '● NERVES NETWORK ONLINE'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>● SECURE CONNECTION</span>
                </div>
              </div>

              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Need new agency clearance? Register field officer profile →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Dedicated Role Selection Grid */}
        {step === 'select_role' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 lg:p-8 shadow-2xl">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold tracking-wider text-blue-400 uppercase">
                Access Control & Responsibilities
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Select Your Disaster Operations Role
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                NERVES adapts the entire UI, map overlays, alert channels, and routing actions specifically to each responder level.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRIMARY_ROLES.map((roleOpt) => {
                const Icon = roleOpt.icon;
                const isSelected = selectedRole === roleOpt.role;
                return (
                  <div
                    key={roleOpt.role}
                    onClick={() => {
                      handleRoleChange(roleOpt.role);
                      login(roleOpt.defaultEmail, roleOpt.role, officerName);
                    }}
                    className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500 shadow-lg'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${roleOpt.badgeColor}`}>
                          {roleOpt.clearance.split('(')[0]}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mb-1">{roleOpt.title}</h3>
                      <p className="text-xs text-blue-400 font-medium mb-2">{roleOpt.subtitle}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{roleOpt.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {roleOpt.district}, {roleOpt.state}
                      </span>
                      <span className="text-xs font-semibold text-blue-400 flex items-center gap-1 group">
                        Enter Dashboard <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Register New Personnel */}
        {step === 'register' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 lg:p-8 shadow-2xl max-w-2xl mx-auto">
            <div className="mb-6">
              <span className="text-xs font-bold tracking-wider text-blue-400 uppercase">
                Official Credential Request
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                Register New Disaster Response Personnel
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Authorized government, military, NDRF, or logistics operators in the North Eastern states.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Officer Name</label>
                  <input
                    type="text"
                    required
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    placeholder="e.g. Major R. K. Thapa"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email / Service ID</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@disaster.gov.in"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Designated Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="admin">State Disaster Management Authority (Admin)</option>
                    <option value="district_officer">District Logistics & PWD / BRO Officer</option>
                    <option value="logistics_operator">Emergency Fleet Logistics Operator</option>
                    <option value="driver">Lifeline Convoy Driver</option>
                    <option value="emergency_responder">NDRF / SDRF Field Responder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Contact (+91)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94350 12345"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Assam">Assam</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Sikkim">Sikkim</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    District / Sector of Posting
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Tamenglong, Noney, Cachar"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department / Agency Name
                </label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Border Roads Organisation Project Pushpak"
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-md text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-600/30"
                >
                  Proceed to Operational Verification <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: Verification / Instant Demo Verification */}
        {step === 'verify' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 lg:p-8 shadow-2xl max-w-xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                <FileCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {t?.auth?.verificationTitle || 'Identity Verification'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                A verification code has been dispatched to {email} and {phone}.
              </p>
            </div>

            {/* Quick Demo Bypass Banner */}
            <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                    Evaluator Demo Notice (SIH26002)
                  </h4>
                  <p className="text-xs text-emerald-200/80 mt-0.5 leading-relaxed">
                    For hackathon evaluation and field simulations, you can instantly verify with one click or enter the pre-filled operational OTP below.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={verifyDemo}
                className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-md shadow flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {t?.auth?.demoVerifyPrompt || 'Instant Evaluator Verification (Bypass OTP)'}
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 text-center">
                  6-Digit Emergency Response OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-48 mx-auto block bg-slate-900 border border-slate-700 text-center tracking-[0.5em] text-xl font-mono text-white rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md text-sm shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isVerifying ? 'Authorizing Credentials...' : 'Submit Verification & Enter Operations'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer: Official Disclaimers */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 px-4 py-3 text-center text-xs text-slate-500 flex items-center justify-center flex-wrap gap-4">
        <span>NERVES • Smart India Hackathon (SIH26002)</span>
        <span>•</span>
        <span>Operational Lifeline Accessibility: NH-37, NH-6, NH-29, NH-102</span>
        <span>•</span>
        <span className="text-slate-400">Strictly for Authorized Disaster Management Personnel</span>
      </footer>
    </div>
  );
};
