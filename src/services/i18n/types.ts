// NERVES Localization Types (SIH26002)
export type SupportedLanguage =
  | 'en'
  | 'as'
  | 'bn'
  | 'mni'
  | 'brx'
  | 'kh'
  | 'lus'
  | 'ne'
  | 'hi'
  | 'grt'
  | 'nag';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  localName: string;
  region: string;
  displayName: string;
}

export interface NavigationTranslations {
  commandCenter: string;
  gisMap: string;
  explainableAi: string;
  smartRouting: string;
  fleet: string;
  supplies: string;
  fieldMobile: string;
  incidents: string;
  alerts: string;
  analytics: string;
  auditTrail: string;
  whatIf: string;
  simulation: string;
  driverCockpit: string;
}

export interface HeaderTranslations {
  liveRegionalNet: string;
  subtitle: string;
  startDemo: string;
  demoStep: string;
  whatIfSandbox: string;
  aiSitRep: string;
  aarDebrief: string;
  emergencyMode: string;
  emergencyActive: string;
  selectLanguage: string;
  signOut: string;
  switchRole: string;
}

export interface DashboardTranslations {
  activeVehicles: string;
  highRiskRoads: string;
  restrictedRoads: string;
  blockedRoads: string;
  activeConvoys: string;
  delayedFreight: string;
  criticalSupplies: string;
  openIncidents: string;
  tracked: string;
  caution: string;
  severed: string;
  clear: string;
  priority: string;
  impacted: string;
  onTime: string;
  emergencyProtocol: string;
  redAlert: string;
  emergencyDescription: string;
  generateSitRep: string;
  corridorsOverview: string;
  recentAlerts: string;
  viewAll: string;
  stagingNotice: string;
  quickActions: string;
  weatherTitle: string;
}

export interface RoutingTranslations {
  title: string;
  subtitle: string;
  recommended: string;
  alternative: string;
  safest: string;
  fastest: string;
  accessible: string;
  restricted: string;
  blocked: string;
  notViable: string;
  overallScore: string;
  disruptionRisk: string;
  safetyScore: string;
  travelTime: string;
  distance: string;
  roadCondition: string;
  elevationGain: string;
  winningReasons: string;
  tradeoffs: string;
  generateReasoning: string;
  evaluating: string;
  scenarioProfile: string;
  vehicleProfile: string;
  judgeDrawer: string;
  selectCorridor: string;
  scoreBreakdown: string;
  safetyGates: string;
  passedGate: string;
  failedGate: string;
}

export interface MatrixTranslations {
  title: string;
  factor: string;
  weight: string;
  routeA: string;
  routeB: string;
  winner: string;
}

export interface GisTranslations {
  title: string;
  subtitle: string;
  layers: string;
  inspector: string;
  terrain: string;
  satellite: string;
  radar: string;
  landslides: string;
  stagingDepots: string;
  convoys: string;
  legend: string;
  clickInspect: string;
  accessible: string;
  restricted: string;
  blocked: string;
  stagingYard: string;
}

export interface FleetTranslations {
  title: string;
  subtitle: string;
  vehicleId: string;
  driver: string;
  cargo: string;
  status: string;
  speed: string;
  eta: string;
  destination: string;
  stagingYard: string;
  dispatch: string;
  holdConvoy: string;
}

export interface SuppliesTranslations {
  title: string;
  subtitle: string;
  medical: string;
  oxygen: string;
  food: string;
  fuel: string;
  runwayDays: string;
  criticalShortage: string;
  allocate: string;
  requisition: string;
}

export interface IncidentsTranslations {
  title: string;
  subtitle: string;
  reportIncident: string;
  severity: string;
  critical: string;
  high: string;
  moderate: string;
  status: string;
  verified: string;
  underReview: string;
  verify: string;
  reject: string;
}

export interface AlertsTranslations {
  title: string;
  subtitle: string;
  broadcastSos: string;
  markAllRead: string;
  targetRole: string;
  unread: string;
}

export interface FieldTranslations {
  title: string;
  offlineActive: string;
  onlineConnected: string;
  submitReport: string;
  captureGps: string;
  takePhoto: string;
  syncQueue: string;
  markArrived: string;
  emergencyAction: string;
}

export interface DriverTranslations {
  title: string;
  cockpit: string;
  speed: string;
  nextWaypoint: string;
  currentCorridor: string;
  stagingDirective: string;
  acknowledge: string;
  reportHazard: string;
  callDispatch: string;
}

export interface WhatIfTranslations {
  title: string;
  subtitle: string;
  rainIncrease: string;
  nh37Severed: string;
  truckUnavailable: string;
  runStressTest: string;
  resetLive: string;
  baselineRisk: string;
  simulatedRisk: string;
}

export interface SimulationTranslations {
  title: string;
  scenarioPicker: string;
  monsoonCloudburst: string;
  landslideDam: string;
  cyclonicSurge: string;
  postDisaster: string;
  triggerScenario: string;
}

export interface SitRepTranslations {
  title: string;
  generating: string;
  copy: string;
  refresh: string;
  close: string;
}

export interface AarTranslations {
  title: string;
  exportPdf: string;
  duration: string;
  resolved: string;
  effectiveness: string;
}

export interface AiIntelligenceTranslations {
  title: string;
  askAssistant: string;
  queryPlaceholder: string;
  sendQuery: string;
  factorWeights: string;
}

export interface CommonTranslations {
  save: string;
  cancel: string;
  close: string;
  loading: string;
  refresh: string;
  search: string;
  filter: string;
  status: string;
  actions: string;
  details: string;
  offline: string;
  online: string;
  error: string;
  success: string;
  na: string;
  back: string;
  next: string;
}

export interface StatusTranslations {
  accessible: string;
  restricted: string;
  blocked: string;
  lowRisk: string;
  mediumRisk: string;
  highRisk: string;
  criticalRisk: string;
}

export interface AuthTranslations {
  portalTitle: string;
  portalSubtitle: string;
  loginTitle: string;
  roleSelectTitle: string;
  registerTitle: string;
  verificationTitle: string;
  loginButton: string;
  demoVerifyPrompt: string;
  signIn: string;
  createAccount: string;
  emailLabel: string;
  passwordLabel: string;
  fullNameLabel: string;
  phoneLabel: string;
  orgLabel: string;
  stateLabel: string;
  districtLabel: string;
  confirmPasswordLabel: string;
  forgotPassword: string;
  rememberMe: string;
  demoSignIn: string;
  verificationRequired: string;
  demoVerifyBtn: string;
  accountVerified: string;
  accessGranted: string;
}

export interface RolesTranslations {
  adminName: string;
  adminDesc: string;
  adminResp: string;
  districtName: string;
  districtDesc: string;
  districtResp: string;
  logisticsName: string;
  logisticsDesc: string;
  logisticsResp: string;
  driverName: string;
  driverDesc: string;
  driverResp: string;
  responderName: string;
  responderDesc: string;
  responderResp: string;
}

export interface AppTranslationBundle {
  navigation: NavigationTranslations;
  header: HeaderTranslations;
  dashboard: DashboardTranslations;
  routing: RoutingTranslations;
  matrix: MatrixTranslations;
  gis: GisTranslations;
  fleet: FleetTranslations;
  supplies: SuppliesTranslations;
  incidents: IncidentsTranslations;
  alerts: AlertsTranslations;
  field: FieldTranslations;
  driver: DriverTranslations;
  whatIf: WhatIfTranslations;
  simulation: SimulationTranslations;
  sitrep: SitRepTranslations;
  aar: AarTranslations;
  aiIntelligence: AiIntelligenceTranslations;
  common: CommonTranslations;
  status: StatusTranslations;
  auth: AuthTranslations;
  roles: RolesTranslations;
}

export interface LegacyTranslationDictionary {
  platformName: string;
  platformSubtitle: string;
  tagline: string;
  region: string;
  sihCode: string;
  liveOperations: string;
  simulationMode: string;
  emergencyMode: string;
  emergencyActive: string;
  languageLabel: string;
  startDemo: string;
  demoStep: string;
  aiSitRep: string;
  signOut: string;
  changeRole: string;
  navCommand: string;
  navMap: string;
  navAiIntelligence: string;
  navRoutes: string;
  navVehicles: string;
  navSupplies: string;
  navField: string;
  navIncidents: string;
  navAlerts: string;
  navAnalytics: string;
  navAudit: string;
  navSimulation: string;
  navWhatIf: string;
  navAar: string;
  statusAccessible: string;
  statusRestricted: string;
  statusBlocked: string;
  riskLow: string;
  riskMedium: string;
  riskHigh: string;
  riskCritical: string;
  riskScoreLabel: string;
  whyRiskScore: string;
  regionalSituation: string;
  incidentsAttention: string;
  recommendedAction: string;
  roadAccessibility: string;
  disruptionRisk: string;
  safeStagingPoint: string;
  noSafeRoute: string;
  activeVehicles: string;
  blockedCorridors: string;
  criticalSupplies: string;
  peopleAffected: string;
  emergencyAction: string;
  viewRoute: string;
  contactControl: string;
  markArrived: string;
  submitGroundReport: string;
  offlineModeActive: string;
  onlineModeActive: string;
  syncQueue: string;
  recordsQueued: string;
  takePhoto: string;
  gpsCaptured: string;
  roleAdminName: string;
  roleAdminDesc: string;
  roleAdminResp: string;
  roleDistrictName: string;
  roleDistrictDesc: string;
  roleDistrictResp: string;
  roleLogisticsName: string;
  roleLogisticsDesc: string;
  roleLogisticsResp: string;
  roleDriverName: string;
  roleDriverDesc: string;
  roleDriverResp: string;
  roleResponderName: string;
  roleResponderDesc: string;
  roleResponderResp: string;
  portalTitle: string;
  portalSubtitle: string;
  selectRole: string;
  signIn: string;
  createAccount: string;
  emailLabel: string;
  passwordLabel: string;
  fullNameLabel: string;
  phoneLabel: string;
  orgLabel: string;
  stateLabel: string;
  districtLabel: string;
  confirmPasswordLabel: string;
  forgotPassword: string;
  rememberMe: string;
  demoSignIn: string;
  verificationRequired: string;
  demoVerifyBtn: string;
  accountVerified: string;
  accessGranted: string;
}

export type FullTranslationDictionary = AppTranslationBundle & LegacyTranslationDictionary;
