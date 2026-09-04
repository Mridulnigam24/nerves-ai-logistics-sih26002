import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserRole,
  AccessibilityStatus,
  WeatherCondition,
  SimulationScenario,
  Corridor,
  Vehicle,
  EssentialSupply,
  FieldIncident,
  AlertItem,
  HumanOverrideAudit,
  GISPOI,
  WeatherData,
  RiskLevel,
  UserProfile,
  WhatIfScenarioState,
  AfterActionMetrics,
} from '../types';
import {
  SupportedLanguage,
  getTranslation,
  TranslationDictionary,
  createTranslator,
  TranslatorFunction,
} from '../services/i18n';
import {
  INITIAL_CORRIDORS,
  INITIAL_VEHICLES,
  INITIAL_SUPPLIES,
  INITIAL_INCIDENTS,
  INITIAL_POIS,
  INITIAL_WEATHER,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import {
  initSupabase,
  getSupabaseStatus,
  persistIncidents,
  persistVehicles,
  persistSupplies,
  persistCorridors,
  persistSimulationState,
  persistUserRole,
  syncOfflineQueueToSupabase,
} from '../services/supabaseClient';

interface NervesContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  setCurrentRole: (role: UserRole) => void;
  emergencyMode: boolean;
  setEmergencyMode: (mode: boolean) => void;
  toggleEmergencyMode: () => void;
  weatherCondition: WeatherCondition;
  setWeatherCondition: (cond: WeatherCondition) => void;
  simulationScenario: SimulationScenario;
  applyScenario: (scenario: SimulationScenario) => void;
  resetSimulation: () => void;
  corridors: Corridor[];
  vehicles: Vehicle[];
  supplies: EssentialSupply[];
  incidents: FieldIncident[];
  alerts: AlertItem[];
  pois: GISPOI[];
  weatherList: WeatherData[];
  weatherSource: string;
  isWeatherLoading: boolean;
  refreshWeather: () => Promise<void>;
  supabaseStatus: { configured: boolean; isOnline: boolean };
  auditLogs: HumanOverrideAudit[];
  selectedCorridorId: string | null;
  setSelectedCorridorId: (id: string | null) => void;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  offlineMode: boolean;
  setOfflineMode: (offline: boolean) => void;
  offlineQueue: FieldIncident[];
  isSyncing: boolean;
  syncOfflineQueue: () => void;
  reportIncident: (incident: Omit<FieldIncident, 'id' | 'timestamp' | 'status'>) => void;
  verifyIncident: (id: string, status: 'VERIFIED' | 'REJECTED' | 'RESOLVED') => void;
  applyHumanOverride: (
    corridorId: string,
    action: 'MARK_ACCESSIBLE' | 'MARK_RESTRICTED' | 'MARK_BLOCKED' | 'HOLD_VEHICLE' | 'PRIORITIZE_SUPPLY',
    reason: string
  ) => void;
  markAlertRead: (id: string) => void;
  dismissAllAlerts: () => void;
  guidedStep: number;
  setGuidedStep: (step: number) => void;
  runNextGuidedStep: () => void;
  stageVehicle: (vehicleId: string, stagingPoint: string) => void;

  // Language & i18n
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslatorFunction;

  // Authentication & Clearance
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole, name?: string) => void;
  register: (userData: Partial<UserProfile>) => void;
  verifyDemo: () => void;
  logout: () => void;

  // What-If Analysis
  whatIfState: WhatIfScenarioState;
  setWhatIfState: React.Dispatch<React.SetStateAction<WhatIfScenarioState>>;
  isWhatIfActive: boolean;
  resetWhatIf: () => void;

  // After-Action Report
  afterActionMetrics: AfterActionMetrics;

  // Visual Theme (Dark Mode / Light Mode)
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

const NervesContext = createContext<NervesContextType | undefined>(undefined);

export const NervesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme System (Dark Mode / Light Mode)
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nerves_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark'; // Dark mode is default
  });

  const setTheme = useCallback((newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nerves_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // Language & i18n
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nerves_lang');
      if (saved) return saved as SupportedLanguage;
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nerves_lang', lang);
    }
  };

  const t = useMemo(() => createTranslator(language), [language]);

  // Authentication & Clearance
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nerves_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const isAuthenticated = !!currentUser && currentUser.verified;

  const [currentRole, setRole] = useState<UserRole>(() => {
    if (currentUser?.role) return currentUser.role;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nerves_cache_user_role');
      if (saved) return saved as UserRole;
    }
    return 'admin';
  });

  const login = (email: string, role: UserRole, name?: string) => {
    const defaultProfiles: Record<UserRole, Partial<UserProfile>> = {
      admin: {
        name: 'Shri Rajiv Sarma, IAS',
        organization: 'SDMA / State Disaster Management Authority',
        state: 'Assam',
        district: 'Kamrup Metro (Guwahati)',
        clearanceLevel: 'LEVEL 1 (Full Strategic Command)',
      },
      district_officer: {
        name: 'Er. T. Jamir, EE (Border Roads)',
        organization: 'Border Roads Organisation / PWD (NH)',
        state: 'Manipur',
        district: 'Noney / Tamenglong',
        clearanceLevel: 'LEVEL 2 (District Engineering & Clearances)',
      },
      logistics_operator: {
        name: 'Smt. Priyanka Baruah',
        organization: 'Regional Emergency Relief Logistics Cell',
        state: 'Assam',
        district: 'Cachar (Silchar)',
        clearanceLevel: 'LEVEL 3 (Fleet & Warehouse Logistics)',
      },
      driver: {
        name: 'Havildar B. Singh',
        organization: 'Heavy Relief Convoy Unit (Truck-001)',
        state: 'Manipur',
        district: 'Jiribam Border Sector',
        clearanceLevel: 'LEVEL 4 (Transit & Driver Advisory)',
        assignedCorridorOrVehicle: 'TRUCK-001 (Silchar - Imphal)',
      },
      emergency_responder: {
        name: 'Inspector L. Rongmei',
        organization: '12 Bn NDRF / SDRF Rapid Response Unit',
        state: 'Manipur',
        district: 'Noney District HQ',
        clearanceLevel: 'LEVEL 5 (Ground Triage & Rapid Response)',
      },
      field_officer: {
        name: 'Officer K. Debbarma',
        organization: 'State Disaster Response Force',
        state: 'Tripura',
        district: 'Dhalai',
        clearanceLevel: 'LEVEL 5 (Field Ground Ops)',
      },
      supply_manager: {
        name: 'Dr. A. Dasgupta',
        organization: 'Directorate of Health Services',
        state: 'Assam',
        district: 'Silchar Civil Hospital Depot',
        clearanceLevel: 'LEVEL 3 (Medical Runway Supply)',
      },
    };

    const base = defaultProfiles[role] || defaultProfiles.admin;
    const profile: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      name: name || base.name || 'Officer',
      email,
      role,
      organization: base.organization || 'Disaster Response Authority',
      state: base.state || 'Assam',
      district: base.district || 'Regional Operations',
      verified: true,
      clearanceLevel: base.clearanceLevel || 'LEVEL 1',
      assignedCorridorOrVehicle: base.assignedCorridorOrVehicle,
    };

    setCurrentUser(profile);
    setRole(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nerves_user', JSON.stringify(profile));
      localStorage.setItem('nerves_cache_user_role', role);
    }
    persistUserRole(role);
  };

  const register = (userData: Partial<UserProfile>) => {
    const role = userData.role || 'emergency_responder';
    const profile: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      name: userData.name || 'Registered Officer',
      email: userData.email || 'officer@nerves.gov.in',
      role,
      phone: userData.phone,
      organization: userData.organization || 'Disaster Response',
      state: userData.state || 'Assam',
      district: userData.district || 'Regional Operations',
      verified: false, // Requires verification step
      clearanceLevel: role === 'admin' ? 'LEVEL 1' : role === 'district_officer' ? 'LEVEL 2' : 'LEVEL 3-5',
      assignedCorridorOrVehicle: userData.assignedCorridorOrVehicle,
    };

    setCurrentUser(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nerves_user', JSON.stringify(profile));
    }
  };

  const verifyDemo = () => {
    if (!currentUser) {
      login('officer.demo@nerves.gov.in', 'admin', 'Official Demo Officer');
      return;
    }
    const verifiedUser: UserProfile = {
      ...currentUser,
      verified: true,
    };
    setCurrentUser(verifiedUser);
    setRole(verifiedUser.role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nerves_user', JSON.stringify(verifiedUser));
      localStorage.setItem('nerves_cache_user_role', verifiedUser.role);
    }
    persistUserRole(verifiedUser.role);
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nerves_user');
    }
  };

  // What-If Scenario Sandbox State
  const [whatIfState, setWhatIfState] = useState<WhatIfScenarioState>({
    nh37Blocked: false,
    rainIncreasePct: 0,
    medicalTruckUnavailable: false,
    insulinBelow20Pct: false,
    multipleRoadsRestricted: false,
  });

  const isWhatIfActive =
    whatIfState.nh37Blocked ||
    whatIfState.rainIncreasePct > 0 ||
    whatIfState.medicalTruckUnavailable ||
    whatIfState.insulinBelow20Pct ||
    whatIfState.multipleRoadsRestricted;

  const resetWhatIf = () => {
    setWhatIfState({
      nh37Blocked: false,
      rainIncreasePct: 0,
      medicalTruckUnavailable: false,
      insulinBelow20Pct: false,
      multipleRoadsRestricted: false,
    });
  };

  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('NORMAL');
  const [simulationScenario, setSimulationScenario] = useState<SimulationScenario>('NORMAL');
  const [corridors, setCorridors] = useState<Corridor[]>(INITIAL_CORRIDORS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [supplies, setSupplies] = useState<EssentialSupply[]>(INITIAL_SUPPLIES);
  const [incidents, setIncidents] = useState<FieldIncident[]>(INITIAL_INCIDENTS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [pois] = useState<GISPOI[]>(INITIAL_POIS);
  const [weatherList, setWeatherList] = useState<WeatherData[]>(INITIAL_WEATHER);
  const [auditLogs, setAuditLogs] = useState<HumanOverrideAudit[]>(INITIAL_AUDIT_LOGS);

  const [selectedCorridorId, setSelectedCorridorId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Field Officer Offline Mode state
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<FieldIncident[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Guided demo scenario step (0 = not running, 1 to 5)
  const [guidedStep, setGuidedStep] = useState<number>(0);

  // OpenWeather & Supabase Status
  const [weatherSource, setWeatherSource] = useState<string>('OpenWeather Live Feed');
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState({ configured: false, isOnline: true });

  const refreshWeather = useCallback(async () => {
    setIsWeatherLoading(true);
    try {
      const res = await fetch('/api/weather');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setWeatherList(json.data);
          if (json.source) {
            setWeatherSource(json.source);
          }

          // Feed rainfall into corridors and calculate risk dynamically
          const weatherByCity: Record<string, number> = {};
          json.data.forEach((w: any) => {
            if (w.city) weatherByCity[w.city.toLowerCase()] = w.rainfallMm24h;
          });

          setCorridors((prev) =>
            prev.map((c) => {
              let cityRain = 0;
              if (c.code === 'NH-37') {
                cityRain = Math.max(weatherByCity['silchar'] || 0, weatherByCity['imphal'] || 0);
              } else if (c.code === 'NH-6') {
                cityRain = weatherByCity['shillong'] || weatherByCity['silchar'] || 0;
              } else if (c.code === 'NH-27') {
                cityRain = weatherByCity['guwahati'] || 0;
              } else if (c.code === 'NH-29') {
                cityRain = weatherByCity['kohima'] || 0;
              } else if (c.code === 'NH-13') {
                cityRain = weatherByCity['itanagar'] || 0;
              } else if (c.code === 'NH-8') {
                cityRain = weatherByCity['agartala'] || 0;
              }

              if (cityRain > 0) {
                const rainDelta = cityRain - c.rainfallMm;
                const riskAdjustment = Math.round(rainDelta * 0.25);
                const updatedScore = Math.max(10, Math.min(98, c.riskScore + riskAdjustment));
                const updatedLevel: RiskLevel =
                  updatedScore >= 75 ? 'CRITICAL' : updatedScore >= 50 ? 'HIGH' : updatedScore >= 30 ? 'MEDIUM' : 'LOW';

                return {
                  ...c,
                  rainfallMm: cityRain,
                  riskScore: updatedScore,
                  riskLevel: updatedLevel,
                  factorWeights: {
                    ...c.factorWeights,
                    heavyRain: Math.min(50, Math.max(20, Math.round(c.factorWeights.heavyRain + rainDelta * 0.1))),
                  },
                };
              }
              return c;
            })
          );
        }
      }
    } catch (e) {
      console.warn('Weather fetch warning, keeping active state', e);
    } finally {
      setIsWeatherLoading(false);
    }
  }, []);

  // Supabase & Weather initialization on mount
  useEffect(() => {
    initSupabase().then(() => {
      setSupabaseStatus(getSupabaseStatus());
    });
    refreshWeather();

    const handleOnline = () => setSupabaseStatus(getSupabaseStatus());
    const handleOffline = () => setSupabaseStatus(getSupabaseStatus());
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshWeather]);

  // Persist states to Supabase & local cache
  useEffect(() => {
    persistIncidents(incidents);
  }, [incidents]);

  useEffect(() => {
    persistVehicles(vehicles);
  }, [vehicles]);

  useEffect(() => {
    persistSupplies(supplies);
  }, [supplies]);

  useEffect(() => {
    persistCorridors(corridors);
  }, [corridors]);

  useEffect(() => {
    persistSimulationState(simulationScenario, emergencyMode, weatherCondition);
  }, [simulationScenario, emergencyMode, weatherCondition]);

  useEffect(() => {
    persistUserRole(currentRole);
  }, [currentRole]);

  const toggleEmergencyMode = () => {
    setEmergencyMode((prev) => !prev);
  };

  // Centralized state reaction when scenario changes
  const applyScenario = (scenario: SimulationScenario) => {
    setSimulationScenario(scenario);

    if (scenario === 'NORMAL') {
      setCorridors(INITIAL_CORRIDORS);
      setVehicles(INITIAL_VEHICLES);
      setWeatherCondition('NORMAL');
      setWeatherList(INITIAL_WEATHER);
      setEmergencyMode(false);
    } else if (scenario === 'HEAVY_RAIN') {
      setWeatherCondition('HEAVY_RAIN');
      setCorridors((prev) =>
        prev.map((c) => {
          if (c.id === 'corridor-nh6') {
            return {
              ...c,
              rainfallMm: 95,
              riskScore: 54,
              riskLevel: 'MEDIUM',
              accessibility: 'RESTRICTED',
              roadCondition: 'Rough Surface',
              disruptionRiskPct: 54,
              estimatedDelayMinutes: 70,
              recommendedAction: 'Advisory: Restrict heavy tankers; reduce speed to 30 km/h.',
              factorWeights: { ...c.factorWeights, heavyRain: 45 },
            };
          }
          if (c.id === 'corridor-nh37') {
            return {
              ...c,
              rainfallMm: 110,
              riskScore: 68,
              riskLevel: 'HIGH',
              accessibility: 'RESTRICTED',
              disruptionRiskPct: 68,
              estimatedDelayMinutes: 140,
              recommendedAction: 'Prepare for staging at Jiribam. Slopes showing rapid saturation.',
              factorWeights: { ...c.factorWeights, heavyRain: 50 },
            };
          }
          return c;
        })
      );

      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === 'TRUCK-001') {
            return {
              ...v,
              currentEta: '17:55 IST (+70m)',
              delayMinutes: 70,
              delayReason: 'Heavy rain downpour and slope slippage caution on NH-37.',
              riskScore: 52,
              accessibility: 'RESTRICTED',
              deliveryStatus: 'DELAYED',
              affected: true,
            };
          }
          if (v.id === 'TRUCK-002') {
            return {
              ...v,
              currentEta: '20:20 IST (+70m)',
              delayMinutes: 70,
              delayReason: 'Reduced visibility on Shillong plateau.',
              riskScore: 45,
              accessibility: 'RESTRICTED',
              deliveryStatus: 'DELAYED',
              affected: true,
            };
          }
          return v;
        })
      );

      const newAlert: AlertItem = {
        id: `alt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        targetRoles: ['driver', 'logistics_operator', 'admin'],
        title: 'Heavy Rainfall Warning — Meghalaya & Manipur Sectors',
        message: 'Precipitation exceeded 90mm. Speed restricted on NH-6 and NH-37. Estimated delay: +70 to +140 mins.',
        severity: 'HIGH',
        corridorId: 'corridor-nh37',
        isRead: false,
      };
      setAlerts((prev) => [newAlert, ...prev]);
    } else if (scenario === 'LANDSLIDE') {
      setWeatherCondition('HEAVY_RAIN');
      setEmergencyMode(true);
      setCorridors((prev) =>
        prev.map((c) => {
          if (c.id === 'corridor-nh37') {
            return {
              ...c,
              accessibility: 'BLOCKED',
              riskScore: 89,
              riskLevel: 'CRITICAL',
              roadCondition: 'Severe Debris Blockage',
              latestFieldReport: 'HIGH-SEVERITY LANDSLIDE: 300m mud and rock debris at Makru River approach. Both lanes blocked.',
              disruptionRiskPct: 89,
              estimatedDelayMinutes: 280,
              recommendedAction: 'HALT ALL CONVOYS. Move vehicles to Jiribam Safe Staging Yard. BRO clearance in progress.',
              factorWeights: {
                heavyRain: 32,
                historicalHazards: 25,
                roadCondition: 18,
                slope: 14,
                floodExposure: 11,
              },
            };
          }
          return c;
        })
      );

      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === 'TRUCK-001') {
            return {
              ...v,
              accessibility: 'BLOCKED',
              riskScore: 89,
              deliveryStatus: 'STOPPED',
              currentEta: '21:25 IST (+280m)',
              delayMinutes: 280,
              delayReason: 'NH-37 Blocked due to major landslide near Makru bridge. Staged at Jiribam.',
              affected: true,
              safeStagingPoint: 'Jiribam Border Safe Staging Yard',
            };
          }
          return v;
        })
      );

      // Add field incident for the landslide
      const landslideIncident: FieldIncident = {
        id: `INC-LS-${Date.now()}`,
        incidentType: 'Landslide',
        severity: 'CRITICAL',
        coordinates: [24.8512, 93.4561],
        roadName: 'NH-37 (Makru River Sector, Noney)',
        corridorId: 'corridor-nh37',
        accessibility: 'BLOCKED',
        description: 'Major slope failure and rockslide blocking full width of NH-37. Estimated 350 MT debris. BRO excavators engaged.',
        photoUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        reportedBy: 'Field Officer N. Sharma',
        officerDesignation: 'Assistant Executive Engineer, PWD Manipur',
        status: 'VERIFIED',
      };
      setIncidents((prev) => [landslideIncident, ...prev]);

      const alertItem: AlertItem = {
        id: `alt-ls-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        targetRoles: ['driver', 'logistics_operator', 'admin', 'emergency_responder', 'supply_manager'],
        title: 'CRITICAL: Landslide Blocks NH-37 (Silchar–Imphal Lifeline)',
        message: 'Makru sector blocked. TRUCK-001 with emergency medicines diverted to Jiribam Staging Yard. NO FEASIBLE CONNECTED ALTERNATE ROUTE.',
        severity: 'CRITICAL',
        corridorId: 'corridor-nh37',
        vehicleId: 'TRUCK-001',
        isRead: false,
        actionRequired: 'Hold all traffic at Jiribam. Prioritize medical flight standby.',
      };
      setAlerts((prev) => [alertItem, ...prev]);
    } else if (scenario === 'FLOOD') {
      setWeatherCondition('EXTREME_RAIN');
      setEmergencyMode(true);
      setCorridors((prev) =>
        prev.map((c) => {
          if (c.id === 'corridor-nh715') {
            return {
              ...c,
              accessibility: 'RESTRICTED',
              riskScore: 78,
              riskLevel: 'HIGH',
              floodExposurePct: 88,
              roadCondition: 'Partial Obstruction',
              latestFieldReport: 'Brahmaputra backflow inundated highway culverts between Bokakhat and Kaziranga. 0.4m standing water.',
              disruptionRiskPct: 78,
              estimatedDelayMinutes: 180,
              recommendedAction: 'One-way regulated pilot convoy for essential relief and water tankers only.',
              factorWeights: {
                heavyRain: 25,
                historicalHazards: 10,
                roadCondition: 15,
                slope: 5,
                floodExposure: 45,
              },
            };
          }
          return c;
        })
      );

      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === 'TRUCK-003') {
            return {
              ...v,
              deliveryStatus: 'RESTRICTED',
              currentEta: '17:20 IST (+180m)',
              delayMinutes: 180,
              delayReason: 'Navigating waterlogged culvert zones under SDRF pilot escort.',
              riskScore: 72,
              accessibility: 'RESTRICTED',
              affected: true,
            };
          }
          return v;
        })
      );

      const floodAlert: AlertItem = {
        id: `alt-fl-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        targetRoles: ['logistics_operator', 'admin', 'district_officer'],
        title: 'Brahmaputra Flash Flood Inundation — NH-715 Kaziranga Sector',
        message: 'Water levels crossing danger mark. TRUCK-003 (Potable Water) operating under SDRF escort.',
        severity: 'HIGH',
        corridorId: 'corridor-nh715',
        isRead: false,
      };
      setAlerts((prev) => [floodAlert, ...prev]);
    } else if (scenario === 'ROAD_BLOCKAGE') {
      setEmergencyMode(true);
      setCorridors((prev) =>
        prev.map((c) => {
          if (c.id === 'corridor-nh6') {
            return {
              ...c,
              accessibility: 'BLOCKED',
              riskScore: 84,
              riskLevel: 'CRITICAL',
              roadCondition: 'Severe Debris Blockage',
              latestFieldReport: 'Multi-axle fuel tanker overturned inside Sonapur tunnel sector. Hazmat safety perimeter established.',
              disruptionRiskPct: 84,
              estimatedDelayMinutes: 240,
              recommendedAction: 'Divert light traffic via Umrangso. Hold heavy multi-axles at Nongpoh Staging Depot.',
            };
          }
          return c;
        })
      );

      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === 'TRUCK-002' || v.id === 'TRUCK-004') {
            return {
              ...v,
              accessibility: 'BLOCKED',
              deliveryStatus: 'STOPPED',
              delayMinutes: 240,
              delayReason: 'NH-6 Sonapur tunnel blockage.',
              affected: true,
              safeStagingPoint: 'Nongpoh Safe Staging Depot',
            };
          }
          return v;
        })
      );
    } else if (scenario === 'RECOVERY') {
      setEmergencyMode(false);
      setCorridors((prev) =>
        prev.map((c) => ({
          ...c,
          accessibility: 'RESTRICTED',
          riskScore: Math.max(25, Math.floor(c.riskScore * 0.45)),
          riskLevel: 'LOW',
          roadCondition: 'Rough Surface',
          estimatedDelayMinutes: Math.floor(c.estimatedDelayMinutes * 0.3),
          recommendedAction: 'Pavement cleared for regulated convoys. Emergency escort active.',
        }))
      );

      setVehicles((prev) =>
        prev.map((v) => ({
          ...v,
          accessibility: 'RESTRICTED',
          deliveryStatus: 'ON_ROUTE',
          delayMinutes: Math.floor(v.delayMinutes * 0.35),
          delayReason: 'Moving under controlled green-corridor clearance.',
          affected: false,
        }))
      );

      const recoveryAlert: AlertItem = {
        id: `alt-rec-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        targetRoles: ['driver', 'logistics_operator', 'admin'],
        title: 'Clearance Update: Controlled Re-opening',
        message: 'BRO and PWD have cleared single-lane passage on NH-37 and NH-6. Medical priority convoys released first.',
        severity: 'LOW',
        isRead: false,
      };
      setAlerts((prev) => [recoveryAlert, ...prev]);
    }
  };

  const resetSimulation = () => {
    setSimulationScenario('NORMAL');
    setWeatherCondition('NORMAL');
    setCorridors(INITIAL_CORRIDORS);
    setVehicles(INITIAL_VEHICLES);
    setSupplies(INITIAL_SUPPLIES);
    setIncidents(INITIAL_INCIDENTS);
    setAlerts(INITIAL_ALERTS);
    setEmergencyMode(false);
    setSelectedCorridorId(null);
    setSelectedVehicleId(null);
    setSelectedIncidentId(null);
    setGuidedStep(0);
  };

  // Guided demo steps (1 -> 2 -> 3 -> 4 -> 5)
  const runNextGuidedStep = () => {
    const nextStep = guidedStep >= 5 ? 1 : guidedStep + 1;
    setGuidedStep(nextStep);

    if (nextStep === 1) {
      // Step 1: Heavy Rainfall begins
      applyScenario('HEAVY_RAIN');
    } else if (nextStep === 2) {
      // Step 2: Landslide reported & verified
      applyScenario('LANDSLIDE');
    } else if (nextStep === 3) {
      // Step 3: Routing engine identifies NO FEASIBLE ALTERNATE ROUTE
      // Selected corridor is NH-37, vehicle is TRUCK-001
      setSelectedCorridorId('corridor-nh37');
      setSelectedVehicleId('TRUCK-001');
    } else if (nextStep === 4) {
      // Step 4: Targeted alerts generated
      const alert1: AlertItem = {
        id: `alt-guide-1-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        targetRoles: ['driver'],
        title: 'DRIVER ADVISORY (TRUCK-001)',
        message: 'NH-37 Makru sector is completely impassable. Do NOT proceed past Jiribam. Divert to Jiribam Border Safe Staging Yard immediately.',
        severity: 'CRITICAL',
        vehicleId: 'TRUCK-001',
        corridorId: 'corridor-nh37',
        isRead: false,
      };
      const alert2: AlertItem = {
        id: `alt-guide-2-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        targetRoles: ['admin', 'supply_manager'],
        title: 'SUPPLY CHAIN CONTINGENCY: Imphal Hospital Insulin Runway',
        message: 'Ground transit halted. Triggering civil helicopter / drone logistics contingency requisition for life-saving cargo.',
        severity: 'CRITICAL',
        corridorId: 'corridor-nh37',
        vehicleId: 'TRUCK-001',
        isRead: false,
      };
      setAlerts((prev) => [alert1, alert2, ...prev]);
    } else if (nextStep === 5) {
      // Step 5: Recovery initiated
      applyScenario('RECOVERY');
    }
  };

  // Report Incident (with offline simulation support and full closed loop)
  const reportIncident = (incidentData: Omit<FieldIncident, 'id' | 'timestamp' | 'status'>) => {
    const newInc: FieldIncident = {
      ...incidentData,
      id: `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      status: 'NEW',
      isOfflineCreated: offlineMode,
    };

    // 1. Save report locally in incidents state immediately (works offline and online)
    setIncidents((prev) => [newInc, ...prev]);

    // 2. If offline, track in offlineQueue for eventual server sync
    if (offlineMode) {
      setOfflineQueue((prev) => [newInc, ...prev]);
    }

    // 3. Recalculate Corridor Risk and update accessibility if blocked or critical
    if (newInc.corridorId) {
      const isSevere = newInc.accessibility === 'BLOCKED' || newInc.severity === 'CRITICAL';
      setCorridors((prev) =>
        prev.map((c) => {
          if (c.id === newInc.corridorId) {
            const addedScore = isSevere ? 30 : 15;
            const updatedScore = Math.min(100, c.riskScore + addedScore);
            const updatedLevel: RiskLevel =
              updatedScore >= 75 ? 'CRITICAL' : updatedScore >= 50 ? 'HIGH' : updatedScore >= 30 ? 'MEDIUM' : 'LOW';

            return {
              ...c,
              accessibility: newInc.accessibility === 'BLOCKED' ? 'BLOCKED' : newInc.accessibility === 'RESTRICTED' ? 'RESTRICTED' : c.accessibility,
              riskScore: updatedScore,
              riskLevel: updatedLevel,
              roadCondition: newInc.accessibility === 'BLOCKED' ? 'Severe Debris Blockage' : 'Partial Obstruction',
              latestFieldReport: `GROUND TRUTH (${newInc.incidentType}): ${newInc.description}`,
              factorWeights: {
                ...c.factorWeights,
                fieldReport: Math.min(40, (c.factorWeights.fieldReport || 0) + 15),
              },
            };
          }
          return c;
        })
      );

      // 4. Update affected vehicles on this corridor
      if (isSevere) {
        setVehicles((prev) =>
          prev.map((v) =>
            v.corridorId === newInc.corridorId
              ? {
                  ...v,
                  deliveryStatus: 'STOPPED',
                  delayMinutes: v.delayMinutes + 120,
                  safeStagingPoint: v.safeStagingPoint || 'Nearest Safe Depot / Jiribam Yard',
                  delayReason: `Ground report (${newInc.incidentType}): Corridor blocked. Held safely at staging point.`,
                }
              : v
          )
        );
      }
    }

    // 5. Generate targeted operational alert
    const newAlert: AlertItem = {
      id: `alt-inc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      severity: newInc.severity === 'CRITICAL' || newInc.accessibility === 'BLOCKED' ? 'CRITICAL' : 'HIGH',
      targetRoles: ['driver', 'admin', 'district_officer', 'logistics_operator'],
      title: `GROUND TRUTH: ${newInc.incidentType} on ${newInc.roadName}`,
      message: `${newInc.description}. Accessibility marked as ${newInc.accessibility}. Convoys advised to divert or stage safely.`,
      corridorId: newInc.corridorId,
      isRead: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    // 6. Record in Audit Trail
    const auditEntry: HumanOverrideAudit = {
      id: `aud-field-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      user: newInc.reportedBy || 'Field Officer / NDRF Responder',
      role: 'GROUND_RESPONDER',
      previousAiRecommendation: 'Pre-inspection automated corridor rating',
      officialAction: `GROUND REPORT: ${newInc.incidentType} (${newInc.accessibility})`,
      reason: newInc.description,
      targetEntity: `${newInc.roadName}`,
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);
    try {
      await syncOfflineQueueToSupabase(offlineQueue);
    } catch {
      // ignore network errors
    }
    setTimeout(() => {
      // Mark all queued items as synchronized and avoid duplicate IDs
      setIncidents((prev) => {
        const queuedIds = new Set(offlineQueue.map((q) => q.id));
        return prev.map((inc) => (queuedIds.has(inc.id) ? { ...inc, isOfflineCreated: false } : inc));
      });
      setOfflineQueue([]);
      setIsSyncing(false);
      setOfflineMode(false);

      // Create sync notification alert
      const syncAlert: AlertItem = {
        id: `alt-sync-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        severity: 'LOW',
        targetRoles: ['admin', 'logistics_operator', 'district_officer', 'driver', 'emergency_responder'],
        title: 'CONNECTION RESTORED — ALL DATA SYNCHRONIZED',
        message: 'All local field reports, incident verifications, and audit logs have been successfully synchronized to the central cloud repository.',
        isRead: false,
      };
      setAlerts((prev) => [syncAlert, ...prev]);
    }, 800);
  };

  const verifyIncident = (id: string, status: 'VERIFIED' | 'REJECTED' | 'RESOLVED') => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          return { ...inc, status };
        }
        return inc;
      })
    );

    // If verified as blocked, update the corresponding corridor
    const target = incidents.find((i) => i.id === id);
    if (target && target.corridorId && status === 'VERIFIED') {
      setCorridors((prev) =>
        prev.map((c) =>
          c.id === target.corridorId
            ? {
                ...c,
                accessibility: target.accessibility,
                roadCondition: target.accessibility === 'BLOCKED' ? 'Severe Debris Blockage' : 'Rough Surface',
                latestFieldReport: `VERIFIED OFFICIAL REPORT: ${target.description}`,
              }
            : c
        )
      );
    }
  };

  const applyHumanOverride = (
    corridorId: string,
    action: 'MARK_ACCESSIBLE' | 'MARK_RESTRICTED' | 'MARK_BLOCKED' | 'HOLD_VEHICLE' | 'PRIORITIZE_SUPPLY',
    reason: string
  ) => {
    const target = corridors.find((c) => c.id === corridorId);
    if (!target) return;

    let newAccessibility: AccessibilityStatus = target.accessibility;
    let actionLabel = '';

    if (action === 'MARK_ACCESSIBLE') {
      newAccessibility = 'ACCESSIBLE';
      actionLabel = 'OVERRIDE: Marked Corridor as ACCESSIBLE';
    } else if (action === 'MARK_RESTRICTED') {
      newAccessibility = 'RESTRICTED';
      actionLabel = 'OVERRIDE: Marked Corridor as RESTRICTED';
    } else if (action === 'MARK_BLOCKED') {
      newAccessibility = 'BLOCKED';
      actionLabel = 'OVERRIDE: Marked Corridor as BLOCKED';
    } else if (action === 'HOLD_VEHICLE') {
      actionLabel = 'OFFICIAL DIRECTIVE: Enforced Vehicle Hold at Staging Yard';
      setVehicles((prev) =>
        prev.map((v) =>
          v.corridorId === corridorId
            ? { ...v, deliveryStatus: 'STOPPED', safeStagingPoint: v.safeStagingPoint || 'Nearest Safe Depot' }
            : v
        )
      );
    }

    setCorridors((prev) =>
      prev.map((c) =>
        c.id === corridorId
          ? {
              ...c,
              accessibility: newAccessibility,
              recommendedAction: `HUMAN OVERRIDE: ${reason}`,
            }
          : c
      )
    );

    const auditEntry: HumanOverrideAudit = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      user: currentRole === 'admin' ? 'Shri R. Sarma, IAS' : 'District Collector / SDM',
      role: currentRole.toUpperCase().replace('_', ' '),
      previousAiRecommendation: `AI Predicted: ${target.riskLevel} Risk (${target.riskScore}%) — ${target.accessibility}`,
      officialAction: actionLabel,
      reason,
      targetEntity: `${target.code} (${target.name})`,
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  const markAlertRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  };

  const dismissAllAlerts = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const stageVehicle = (vehicleId: string, stagingPoint: string) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              deliveryStatus: 'STOPPED',
              safeStagingPoint: stagingPoint,
              delayReason: `Held safely at ${stagingPoint} per emergency logistics protocol.`,
            }
          : v
      )
    );
  };

  // After-Action Report Metrics
  const afterActionMetrics: AfterActionMetrics = {
    durationMinutes: 48,
    totalIncidents: incidents.length,
    resolvedIncidents: incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'VERIFIED').length,
    criticalIncidents: incidents.filter((i) => i.severity === 'CRITICAL').length,
    averageResponseMinutes: 14,
    vehiclesDispatched: vehicles.length,
    vehiclesStaged: vehicles.filter((v) => v.deliveryStatus === 'STOPPED').length || 1,
    suppliesDeliveredTonnes: 18.5,
    blockedCorridorsCleared: corridors.filter((c) => c.accessibility === 'ACCESSIBLE').length,
    groundReportsProcessed: incidents.length + offlineQueue.length,
    alertsBroadcast: alerts.length,
  };

  return (
    <NervesContext.Provider
      value={{
        currentRole,
        setRole,
        setCurrentRole: setRole,
        emergencyMode,
        setEmergencyMode,
        toggleEmergencyMode,
        weatherCondition,
        setWeatherCondition,
        simulationScenario,
        applyScenario,
        resetSimulation,
        corridors,
        vehicles,
        supplies,
        incidents,
        alerts,
        pois,
        weatherList,
        weatherSource,
        isWeatherLoading,
        refreshWeather,
        supabaseStatus,
        auditLogs,
        selectedCorridorId,
        setSelectedCorridorId,
        selectedVehicleId,
        setSelectedVehicleId,
        selectedIncidentId,
        setSelectedIncidentId,
        offlineMode,
        setOfflineMode,
        offlineQueue,
        isSyncing,
        syncOfflineQueue,
        reportIncident,
        verifyIncident,
        applyHumanOverride,
        markAlertRead,
        dismissAllAlerts,
        guidedStep,
        setGuidedStep,
        runNextGuidedStep,
        stageVehicle,
        language,
        setLanguage,
        t,
        currentUser,
        isAuthenticated,
        login,
        register,
        verifyDemo,
        logout,
        whatIfState,
        setWhatIfState,
        isWhatIfActive,
        resetWhatIf,
        afterActionMetrics,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </NervesContext.Provider>
  );
};

export const useNerves = () => {
  const context = useContext(NervesContext);
  if (!context) {
    throw new Error('useNerves must be used within a NervesProvider');
  }
  return context;
};
