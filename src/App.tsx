import React, { useState, useEffect } from 'react';
import { NervesProvider, useNerves } from './context/NervesContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { CommandCenter } from './components/dashboard/CommandCenter';
import { NervesGISMap } from './components/map/NervesGISMap';
import { AiIntelligenceView } from './components/ai/AiIntelligenceView';
import { SmartRoutingView } from './components/routes/SmartRoutingView';
import { VehiclesView } from './components/vehicles/VehiclesView';
import { SuppliesView } from './components/supplies/SuppliesView';
import { FieldOfficerMobileView } from './components/field/FieldOfficerMobileView';
import { DriverCockpitView } from './components/driver/DriverCockpitView';
import { IncidentsView } from './components/incidents/IncidentsView';
import { AlertsView } from './components/alerts/AlertsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AuditLogView } from './components/audit/AuditLogView';
import { SimulationControlModal } from './components/simulation/SimulationControlModal';
import { AiSituationReportModal } from './components/ai/AiSituationReportModal';
import { WhatIfScenarioSandbox } from './components/simulation/WhatIfScenarioSandbox';
import { AfterActionReportModal } from './components/aar/AfterActionReportModal';
import { AccessRestrictedView } from './components/common/AccessRestrictedView';
import { NetworkStatusPanel } from './components/common/NetworkStatusPanel';
import { ThemeToggle } from './components/common/ThemeToggle';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from './services/i18n';
import {
  canAccessTab,
  getDefaultTabForRole,
  canRunSimulation,
  canAccessWhatIf,
  canAccessSitRep,
  canAccessAar,
  canToggleEmergency,
} from './services/rbac';
import {
  Activity,
  Map,
  Brain,
  Navigation,
  Truck,
  Package,
  Radio,
  FileCheck,
  Bell,
  BarChart3,
  Scale,
  Play,
  FileText,
  ShieldAlert,
  Wifi,
  WifiOff,
  User,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Globe,
  LogOut,
  Sliders,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { UserRole } from './types';

function MainLayout() {
  const {
    currentRole,
    setCurrentRole,
    emergencyMode,
    setEmergencyMode,
    simulationScenario,
    offlineMode,
    setOfflineMode,
    offlineQueue,
    alerts,
    guidedStep,
    runNextGuidedStep,
    isAuthenticated,
    currentUser,
    logout,
    language,
    setLanguage,
    t,
  } = useNerves();

  // If user is not authenticated, strictly show the official authentication gate!
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const [activeTab, setActiveTab] = useState<string>(() => getDefaultTabForRole(currentRole));
  const [showSituationReport, setShowSituationReport] = useState<boolean>(false);
  const [showWhatIfModal, setShowWhatIfModal] = useState<boolean>(false);
  const [showAarModal, setShowAarModal] = useState<boolean>(false);

  // Sync default tab if role changes
  useEffect(() => {
    setActiveTab(getDefaultTabForRole(currentRole));
  }, [currentRole]);

  const unreadAlerts = alerts.filter((a) => !a.isRead).length;

  const ALL_NAVIGATION_TABS = [
    { id: 'command', label: t('navigation.commandCenter', 'Command Center'), icon: Activity },
    { id: 'map', label: t('navigation.gisMap', 'GIS Live Map'), icon: Map },
    { id: 'ai-intelligence', label: t('navigation.explainableAi', 'Explainable AI'), icon: Brain },
    { id: 'routes', label: t('navigation.smartRouting', 'Smart Routing'), icon: Navigation },
    { id: 'vehicles', label: t('navigation.fleet', 'Fleets & Vehicles'), icon: Truck },
    { id: 'supplies', label: t('navigation.supplies', 'Essential Supplies'), icon: Package },
    { id: 'field', label: t('navigation.fieldMobile', 'Field Officer Mobile'), icon: Radio },
    { id: 'incidents', label: t('navigation.incidents', 'Incident Registry'), icon: FileCheck },
    { id: 'alerts', label: t('navigation.alerts', 'Targeted Alerts'), icon: Bell, badge: unreadAlerts },
    { id: 'analytics', label: t('navigation.analytics', 'Analytics'), icon: BarChart3 },
    { id: 'audit', label: t('navigation.auditTrail', 'Audit Trail'), icon: Scale },
    { id: 'what-if', label: t('navigation.whatIf', 'What-If Sandbox'), icon: Sliders, highlight: true },
    { id: 'simulation', label: t('navigation.simulation', 'Simulation & Demo'), icon: Play },
    { id: 'driver-cockpit', label: t('navigation.driverCockpit', 'Driver Cockpit'), icon: Truck, highlight: true },
  ];

  // Role-specific navigation tabs strictly determined by RBAC configuration
  const navigationTabs = ALL_NAVIGATION_TABS.filter((tab) => canAccessTab(currentRole, tab.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Government Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-cyan-950 ring-1 ring-cyan-400/40">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  NERVES
                  <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded">
                    SIH26002
                  </span>
                </h1>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase hidden sm:inline">
                  {t('header.liveRegionalNet', 'Live Regional Net')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {t('header.subtitle', 'North Eastern Region — AI Logistics & Accessibility Intelligence')}
              </p>
            </div>
          </div>

          {/* Quick Controls: Language, Officer Badge, AAR, SitRep, Sandbox, Emergency Mode */}
          <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-between lg:justify-end">
            {/* Regional Language Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-slate-200 text-[11px] font-semibold focus:outline-none cursor-pointer"
                title={t('header.selectLanguage', 'Select Regional Language')}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                    {lang.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Guided Demo Shortcut */}
            {canRunSimulation(currentRole) && (
              <button
                onClick={runNextGuidedStep}
                className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5"
                title="Run 5-Step Jury Demo"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">
                  {guidedStep === 0 ? t('header.startDemo', 'Start Demo') : `${t('header.demoStep', 'Demo Step')} ${guidedStep}`}
                </span>
              </button>
            )}

            {/* What-If Sandbox Trigger */}
            {canAccessWhatIf(currentRole) && (
              <button
                onClick={() => setActiveTab('what-if')}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 hover:border-amber-500/50 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                title="What-If Disaster Stress-Testing Sandbox"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t('header.whatIfSandbox', 'What-If Sandbox')}</span>
              </button>
            )}

            {/* AI Situation Report Trigger */}
            {canAccessSitRep(currentRole) && (
              <button
                onClick={() => setShowSituationReport(true)}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">{t('header.aiSitRep', 'AI SitRep')}</span>
              </button>
            )}

            {/* After-Action Report (AAR) Trigger */}
            {canAccessAar(currentRole) && (
              <button
                onClick={() => setShowAarModal(true)}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 hover:border-emerald-500/50 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                title="After-Action Report Debrief"
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{t('header.aarDebrief', 'AAR Debrief')}</span>
              </button>
            )}

            {/* Emergency Mode Toggle */}
            {canToggleEmergency(currentRole) && (
              <button
                onClick={() => setEmergencyMode(!emergencyMode)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  emergencyMode
                    ? 'bg-rose-950 text-rose-200 border-rose-500 animate-pulse shadow-lg shadow-rose-950'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>{emergencyMode ? t('header.emergencyActive', 'EMERGENCY ACTIVE') : t('header.emergencyMode', 'Emergency Mode')}</span>
              </button>
            )}

            {/* Network & Infrastructure Status Panel (Section 47) */}
            <NetworkStatusPanel />

            {/* Visual Theme Toggle (Dark / Light) */}
            <ThemeToggle />

            {/* Officer Profile & Role Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-transparent text-[11px] font-semibold text-slate-200 focus:outline-none cursor-pointer max-w-[140px] truncate"
                title={t('header.switchRole', 'Switch Role')}
              >
                <option value="admin" className="bg-slate-900 text-slate-200">
                  {t('roles.adminName', 'SDMA Command (Admin)')}
                </option>
                <option value="district_officer" className="bg-slate-900 text-slate-200">
                  {t('roles.districtName', 'District Officer (BRO/PWD)')}
                </option>
                <option value="logistics_operator" className="bg-slate-900 text-slate-200">
                  {t('roles.logisticsName', 'Fleet Logistics Operator')}
                </option>
                <option value="driver" className="bg-slate-900 text-slate-200">
                  {t('roles.driverName', 'Lifeline Convoy Driver')}
                </option>
                <option value="emergency_responder" className="bg-slate-900 text-slate-200">
                  {t('roles.responderName', 'NDRF/SDRF Responder')}
                </option>
              </select>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg transition-colors"
              title={t('header.signOut', 'Sign Out')}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800/60 overflow-x-auto scrollbar-none">
          <div className="flex space-x-1 py-1 min-w-max">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                      : tab.highlight
                      ? 'text-amber-400 hover:text-amber-200 hover:bg-slate-900'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-0.5 bg-rose-600 text-white font-mono text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Dynamic View Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {!canAccessTab(currentRole, activeTab) ? (
          <AccessRestrictedView
            attemptedModule={activeTab}
            userRole={currentRole}
            onReturnHome={() => setActiveTab(getDefaultTabForRole(currentRole))}
          />
        ) : (
          <>
            {activeTab === 'driver-cockpit' && <DriverCockpitView />}

            {activeTab === 'command' && (
              <CommandCenter
                onNavigateTab={setActiveTab}
                onOpenSituationReport={() => setShowSituationReport(true)}
                onOpenAssistant={() => setActiveTab('ai-intelligence')}
                onOpenSimulation={() => setActiveTab('simulation')}
              />
            )}

            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
                  <div>
                    <h2 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                      <Map className="w-5 h-5 text-cyan-400" />
                      Full GIS Spatial Intelligence & Layer Matrix
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Interactive multi-layer map covering Assam, Meghalaya, Manipur, Mizoram, Nagaland, Arunachal, Tripura, and Sikkim.
                    </p>
                  </div>
                </div>
                <NervesGISMap />
              </div>
            )}

            {activeTab === 'ai-intelligence' && <AiIntelligenceView />}

            {activeTab === 'routes' && <SmartRoutingView />}

            {activeTab === 'vehicles' && <VehiclesView />}

            {activeTab === 'supplies' && <SuppliesView />}

            {activeTab === 'field' && <FieldOfficerMobileView />}

            {activeTab === 'incidents' && <IncidentsView />}

            {activeTab === 'alerts' && <AlertsView />}

            {activeTab === 'analytics' && <AnalyticsView />}

            {activeTab === 'audit' && <AuditLogView />}

            {activeTab === 'what-if' && <WhatIfScenarioSandbox />}

            {activeTab === 'simulation' && (
              <SimulationControlModal
                onOpenSituationReport={() => setShowSituationReport(true)}
                onNavigateTab={setActiveTab}
              />
            )}
          </>
        )}
      </main>

      {/* Situation Report Modal */}
      {showSituationReport && canAccessSitRep(currentRole) && (
        <AiSituationReportModal onClose={() => setShowSituationReport(false)} />
      )}

      {/* After-Action Report (AAR) Modal */}
      {showAarModal && canAccessAar(currentRole) && (
        <AfterActionReportModal onClose={() => setShowAarModal(false)} />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NERVES — AI Logistics & Accessibility Platform • SIH26002 Prototype</span>
          <span className="font-mono text-[11px] text-slate-400">
            "We don't just navigate roads — we predict their accessibility."
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <NervesProvider>
      <MainLayout />
    </NervesProvider>
  );
}
