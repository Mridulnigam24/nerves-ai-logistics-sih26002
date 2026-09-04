export type UserRole =
  | 'admin'
  | 'district_officer'
  | 'logistics_operator'
  | 'field_officer'
  | 'driver'
  | 'emergency_responder'
  | 'supply_manager';

export type AppTheme = 'dark' | 'light';

export type AccessibilityStatus = 'ACCESSIBLE' | 'RESTRICTED' | 'BLOCKED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type WeatherCondition = 'NORMAL' | 'HEAVY_RAIN' | 'EXTREME_RAIN';

export type SimulationScenario =
  | 'NORMAL'
  | 'HEAVY_RAIN'
  | 'FLOOD'
  | 'LANDSLIDE'
  | 'ROAD_BLOCKAGE'
  | 'RECOVERY';

export interface FactorWeights {
  heavyRain: number;
  historicalHazards: number;
  roadCondition: number;
  slope: number;
  floodExposure: number;
  fieldReport?: number;
}

export interface Corridor {
  id: string;
  code: string; // e.g., NH-27, NH-6, NH-29
  name: string;
  state: 'Assam' | 'Arunachal Pradesh' | 'Meghalaya' | 'Manipur' | 'Mizoram' | 'Nagaland' | 'Tripura' | 'Sikkim';
  startPoint: string;
  endPoint: string;
  coordinates: [number, number][];
  lengthKm: number;
  accessibility: AccessibilityStatus;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidenceScore: number; // e.g. 91%
  rainfallMm: number;
  slopeAngleDeg: number;
  historicalLandslidesCount: number;
  floodExposurePct: number;
  roadCondition: 'Paved & Clear' | 'Rough Surface' | 'Partial Obstruction' | 'Severe Debris Blockage';
  latestFieldReport?: string;
  disruptionRiskPct: number;
  estimatedDelayMinutes: number;
  recommendedAction: string;
  factorWeights: FactorWeights;
  alternativeRouteAvailable: boolean;
  alternateRouteSummary?: string;
}

export type VehicleDeliveryStatus =
  | 'ON_ROUTE'
  | 'DELAYED'
  | 'RESTRICTED'
  | 'STOPPED'
  | 'ARRIVED'
  | 'EMERGENCY';

export interface Vehicle {
  id: string;
  type: string;
  driver: string;
  driverPhone: string;
  cargo: string;
  cargoType: 'MEDICINES' | 'FOOD' | 'WATER' | 'RELIEF_MATERIALS' | 'AGRICULTURAL_SUPPLIES';
  currentCoordinates: [number, number];
  origin: string;
  destination: string;
  corridorId: string;
  speedKmH: number;
  speedKmh?: number;
  temperatureCelsius?: number;
  fuelLevelPct?: number;
  originalEta: string;
  currentEta: string;
  delayMinutes: number;
  delayReason?: string;
  riskScore: number;
  accessibility: AccessibilityStatus;
  deliveryStatus: VehicleDeliveryStatus;
  affected: boolean;
  safeStagingPoint?: string;
}

export interface SmartRoute {
  id: string;
  name: string;
  via: string;
  distanceKm: number;
  etaHours: number;
  etaMinutes: number;
  riskScore: number;
  accessibility: AccessibilityStatus;
  category: 'FASTEST' | 'SAFEST' | 'LOWEST_RISK' | 'RECOMMENDED' | 'RESTRICTED' | 'NOT_OPERATIONALLY_VIABLE' | 'VIABLE_ALTERNATE';
  isFeasible: boolean;
  roadCondition: string;
  elevationGainM: number;
  notes: string;
  score?: number;
  decision?: any;
}

export type SupplyPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface EssentialSupply {
  id: string;
  category: 'MEDICINES' | 'FOOD' | 'WATER' | 'RELIEF_MATERIALS' | 'AGRICULTURAL_SUPPLIES';
  name: string;
  requiredQty: number;
  availableQty: number;
  unit: string;
  shortage: number;
  priority: SupplyPriority;
  warehouse: string;
  destination: string;
  deliveryStatus: string;
  eta: string;
  vehicleId?: string;
  aiRecommendation?: string;
}

export type IncidentStatus = 'NEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'RESOLVED' | 'REJECTED';

export interface FieldIncident {
  id: string;
  incidentType: 'Flood' | 'Landslide' | 'Road Damage' | 'Accident' | 'Road Blockage' | 'Other';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  coordinates: [number, number];
  roadName: string;
  corridorId?: string;
  accessibility: AccessibilityStatus;
  description: string;
  photoUrl?: string;
  videoUrl?: string;
  timestamp: string;
  reportedBy: string;
  officerDesignation: string;
  status: IncidentStatus;
  isOfflineCreated?: boolean;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  targetRoles: UserRole[];
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  corridorId?: string;
  vehicleId?: string;
  isRead: boolean;
  actionRequired?: string;
}

export interface HumanOverrideAudit {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  previousAiRecommendation: string;
  officialAction: string;
  reason: string;
  targetEntity: string;
  officerName?: string;
  officerDesignation?: string;
  targetName?: string;
  previousStatus?: string;
  previousScore?: number;
  newStatus?: string;
  newScore?: number;
}

export interface GISPOI {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'RELIEF_CENTER' | 'WAREHOUSE' | 'SAFE_STAGING_POINT';
  state: string;
  coordinates: [number, number];
  capacity: string;
  status: 'Operational' | 'High Demand' | 'Standby' | 'Active Shelter';
  contact: string;
}

export interface WeatherData {
  city?: string;
  state: string;
  temperatureC: number;
  rainfallMm24h: number;
  humidityPct: number;
  precipitationIntensity: 'Light' | 'Moderate' | 'Heavy' | 'Extreme Cloudburst';
  trend: 'Worsening' | 'Stable' | 'Improving';
  activeAlert: string;
  weatherCondition?: string;
  description?: string;
  windSpeedKmh?: number;
  source?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organization: string;
  state: string;
  district: string;
  verified: boolean;
  clearanceLevel: string;
  assignedCorridorOrVehicle?: string;
}

export interface WhatIfScenarioState {
  nh37Blocked: boolean;
  rainIncreasePct: number; // 0, 30, 50
  medicalTruckUnavailable: boolean;
  insulinBelow20Pct: boolean;
  multipleRoadsRestricted: boolean;
}

export interface AfterActionMetrics {
  durationMinutes: number;
  totalIncidents: number;
  resolvedIncidents: number;
  criticalIncidents: number;
  averageResponseMinutes: number;
  vehiclesDispatched: number;
  vehiclesStaged: number;
  suppliesDeliveredTonnes: number;
  blockedCorridorsCleared: number;
  groundReportsProcessed: number;
  alertsBroadcast: number;
}
