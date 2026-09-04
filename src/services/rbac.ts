import {
  UserRole,
  UserProfile,
  Corridor,
  Vehicle,
  FieldIncident,
  EssentialSupply,
  AlertItem,
} from '../types';

export interface RoleCapabilities {
  canManageUsers: boolean;
  canChangeGlobalSettings: boolean;
  canReviewAuditTrail: boolean;
  canRunSimulation: boolean;
  canAccessWhatIf: boolean;
  canAccessSitRep: boolean;
  canAccessAar: boolean;
  canToggleEmergency: boolean;
  canPerformRoadOverride: boolean;
  canVerifyFieldIncidents: boolean;
  canSubmitFieldReport: boolean;
  canViewFinancialExposure: boolean;
  canViewAllNERData: boolean;
  canManageFleet: boolean;
  canManageFleetRerouting: boolean;
  canManageSupplies: boolean;
}

export interface RoleConfig {
  id: UserRole;
  title: string;
  shortLabel: string;
  badge: string;
  description: string;
  defaultTab: string;
  allowedTabs: string[];
  capabilities: RoleCapabilities;
}

/**
 * STRICT ROLE-BASED ACCESS CONTROL (RBAC) PERMISSION MATRIX
 * 
 * Hierarchy:
 * - SDMA Command (Admin): Unrestricted access to ALL 14 tabs and ALL administrative actions.
 * - District Officer (BRO/PWD): District operational tabs and district hazard verification.
 * - Fleet Logistics Operator: Fleet freight, routing, supply tracking, and logistics alerts.
 * - Lifeline Convoy Driver: Driver cockpit + route/GIS telemetry, hazard alerts, and ground report.
 * - NDRF / SDRF Field Responder: Field officer mobile triage, ground incident reporting, routing & emergency alerts.
 */
export const ROLE_PERMISSIONS: Record<
  UserRole,
  {
    access: 'FULL' | 'RESTRICTED';
    tabs: string[];
    capabilities: RoleCapabilities;
  }
> = {
  admin: {
    access: 'FULL',
    tabs: [
      'command',
      'map',
      'ai-intelligence',
      'routes',
      'vehicles',
      'supplies',
      'field',
      'incidents',
      'alerts',
      'analytics',
      'audit',
      'what-if',
      'simulation',
      'driver-cockpit',
    ],
    capabilities: {
      canManageUsers: true,
      canChangeGlobalSettings: true,
      canReviewAuditTrail: true,
      canRunSimulation: true,
      canAccessWhatIf: true,
      canAccessSitRep: true,
      canAccessAar: true,
      canToggleEmergency: true,
      canPerformRoadOverride: true,
      canVerifyFieldIncidents: true,
      canSubmitFieldReport: true,
      canViewFinancialExposure: true,
      canViewAllNERData: true,
      canManageFleet: true,
      canManageFleetRerouting: true,
      canManageSupplies: true,
    },
  },
  district_officer: {
    access: 'RESTRICTED',
    tabs: [
      'command',
      'map',
      'routes',
      'vehicles',
      'supplies',
      'incidents',
      'alerts',
      'what-if',
    ],
    capabilities: {
      canManageUsers: false,
      canChangeGlobalSettings: false,
      canReviewAuditTrail: false,
      canRunSimulation: false,
      canAccessWhatIf: true,
      canAccessSitRep: false,
      canAccessAar: false,
      canToggleEmergency: false,
      canPerformRoadOverride: false, // SDMA-only executive action
      canVerifyFieldIncidents: true,
      canSubmitFieldReport: true,
      canViewFinancialExposure: true,
      canViewAllNERData: false,
      canManageFleet: false,
      canManageFleetRerouting: true,
      canManageSupplies: false,
    },
  },
  logistics_operator: {
    access: 'RESTRICTED',
    tabs: [
      'map',
      'routes',
      'vehicles',
      'supplies',
      'incidents',
      'alerts',
    ],
    capabilities: {
      canManageUsers: false,
      canChangeGlobalSettings: false,
      canReviewAuditTrail: false,
      canRunSimulation: false,
      canAccessWhatIf: false,
      canAccessSitRep: false,
      canAccessAar: false,
      canToggleEmergency: false,
      canPerformRoadOverride: false,
      canVerifyFieldIncidents: false,
      canSubmitFieldReport: false,
      canViewFinancialExposure: true,
      canViewAllNERData: false,
      canManageFleet: true,
      canManageFleetRerouting: true,
      canManageSupplies: true,
    },
  },
  driver: {
    access: 'RESTRICTED',
    tabs: [
      'driver-cockpit',
      'map',
      'routes',
      'incidents',
      'alerts',
    ],
    capabilities: {
      canManageUsers: false,
      canChangeGlobalSettings: false,
      canReviewAuditTrail: false,
      canRunSimulation: false,
      canAccessWhatIf: false,
      canAccessSitRep: false,
      canAccessAar: false,
      canToggleEmergency: false,
      canPerformRoadOverride: false,
      canVerifyFieldIncidents: false,
      canSubmitFieldReport: true, // Driver can submit road obstruction report
      canViewFinancialExposure: false,
      canViewAllNERData: false,
      canManageFleet: false,
      canManageFleetRerouting: false,
      canManageSupplies: false,
    },
  },
  emergency_responder: {
    access: 'RESTRICTED',
    tabs: [
      'field',
      'map',
      'incidents',
      'routes',
      'alerts',
    ],
    capabilities: {
      canManageUsers: false,
      canChangeGlobalSettings: false,
      canReviewAuditTrail: false,
      canRunSimulation: false,
      canAccessWhatIf: false,
      canAccessSitRep: false,
      canAccessAar: false,
      canToggleEmergency: false,
      canPerformRoadOverride: false,
      canVerifyFieldIncidents: false,
      canSubmitFieldReport: true,
      canViewFinancialExposure: false,
      canViewAllNERData: false,
      canManageFleet: false,
      canManageFleetRerouting: false,
      canManageSupplies: false,
    },
  },
  // Legacy aliases mapped strictly to canonical roles
  field_officer: {
    access: 'RESTRICTED',
    tabs: ['field', 'map', 'incidents', 'routes', 'alerts'],
    capabilities: {
      canManageUsers: false,
      canChangeGlobalSettings: false,
      canReviewAuditTrail: false,
      canRunSimulation: false,
      canAccessWhatIf: false,
      canAccessSitRep: false,
      canAccessAar: false,
      canToggleEmergency: false,
      canPerformRoadOverride: false,
      canVerifyFieldIncidents: false,
      canSubmitFieldReport: true,
      canViewFinancialExposure: false,
      canViewAllNERData: false,
      canManageFleet: false,
      canManageFleetRerouting: false,
      canManageSupplies: false,
    },
  },
  supply_manager: {
    access: 'RESTRICTED',
    tabs: ['map', 'routes', 'vehicles', 'supplies', 'incidents', 'alerts'],
    capabilities: {
      canManageUsers: false,
      canChangeGlobalSettings: false,
      canReviewAuditTrail: false,
      canRunSimulation: false,
      canAccessWhatIf: false,
      canAccessSitRep: false,
      canAccessAar: false,
      canToggleEmergency: false,
      canPerformRoadOverride: false,
      canVerifyFieldIncidents: false,
      canSubmitFieldReport: false,
      canViewFinancialExposure: true,
      canViewAllNERData: false,
      canManageFleet: true,
      canManageFleetRerouting: true,
      canManageSupplies: true,
    },
  },
};

export const OPERATIONAL_ROLES: Record<UserRole, RoleConfig> = {
  admin: {
    id: 'admin',
    title: 'SDMA COMMAND (ADMIN)',
    shortLabel: 'SDMA COMMAND',
    badge: 'SDMA COMMAND (FULL)',
    description:
      'Supreme state command authority over all 8 North Eastern states with full unrestricted access to all modules, corridors, overrides, simulation controls, and audit trails.',
    defaultTab: 'command',
    allowedTabs: ROLE_PERMISSIONS.admin.tabs,
    capabilities: ROLE_PERMISSIONS.admin.capabilities,
  },
  district_officer: {
    id: 'district_officer',
    title: 'DISTRICT OFFICER (BRO/PWD)',
    shortLabel: 'DISTRICT OFFICER',
    badge: 'DISTRICT OFFICER',
    description:
      'District Disaster Management & PWD/BRO engineering authority. Scoped to district operations, corridor monitoring, incident verification, and district what-if stress testing.',
    defaultTab: 'command',
    allowedTabs: ROLE_PERMISSIONS.district_officer.tabs,
    capabilities: ROLE_PERMISSIONS.district_officer.capabilities,
  },
  logistics_operator: {
    id: 'logistics_operator',
    title: 'FLEET LOGISTICS OPERATOR',
    shortLabel: 'LOGISTICS OPERATOR',
    badge: 'LOGISTICS OPERATOR',
    description:
      'Civil supplies & freight logistics operations. Oversees convoy dispatch, vehicle telemetry, cold-chain cargo integrity, and arterial highway routing.',
    defaultTab: 'vehicles',
    allowedTabs: ROLE_PERMISSIONS.logistics_operator.tabs,
    capabilities: ROLE_PERMISSIONS.logistics_operator.capabilities,
  },
  driver: {
    id: 'driver',
    title: 'LIFELINE CONVOY DRIVER',
    shortLabel: 'CONVOY DRIVER',
    badge: 'CONVOY DRIVER',
    description:
      'Frontline convoy driver cockpit for vehicle telemetry, waypoint navigation, route hazard caching, communication, and emergency SOS reporting.',
    defaultTab: 'driver-cockpit',
    allowedTabs: ROLE_PERMISSIONS.driver.tabs,
    capabilities: ROLE_PERMISSIONS.driver.capabilities,
  },
  emergency_responder: {
    id: 'emergency_responder',
    title: 'NDRF / SDRF FIELD RESPONDER',
    shortLabel: 'FIELD RESPONDER',
    badge: 'FIELD RESPONDER',
    description:
      'Rapid response triage & search-and-rescue team. Submits ground evidence, reports road hazards, and receives field dispatches.',
    defaultTab: 'field',
    allowedTabs: ROLE_PERMISSIONS.emergency_responder.tabs,
    capabilities: ROLE_PERMISSIONS.emergency_responder.capabilities,
  },
  field_officer: {
    id: 'field_officer' as UserRole,
    title: 'NDRF / SDRF FIELD RESPONDER',
    shortLabel: 'FIELD RESPONDER',
    badge: 'FIELD RESPONDER',
    description:
      'Rapid response triage & search-and-rescue team. Submits ground evidence, reports road hazards, and receives field dispatches.',
    defaultTab: 'field',
    allowedTabs: ROLE_PERMISSIONS.emergency_responder.tabs,
    capabilities: ROLE_PERMISSIONS.emergency_responder.capabilities,
  },
  supply_manager: {
    id: 'supply_manager' as UserRole,
    title: 'FLEET LOGISTICS OPERATOR',
    shortLabel: 'LOGISTICS OPERATOR',
    badge: 'LOGISTICS OPERATOR',
    description:
      'Civil supplies & freight logistics operations. Oversees convoy dispatch, vehicle telemetry, cold-chain cargo integrity, and arterial highway routing.',
    defaultTab: 'vehicles',
    allowedTabs: ROLE_PERMISSIONS.logistics_operator.tabs,
    capabilities: ROLE_PERMISSIONS.logistics_operator.capabilities,
  },
};

/** Normalize role to one of the 5 canonical operational roles */
export function normalizeRole(role?: string): UserRole {
  if (!role) return 'driver';
  if (role === 'field_officer') return 'emergency_responder';
  if (role === 'supply_manager') return 'logistics_operator';
  if (
    role === 'admin' ||
    role === 'district_officer' ||
    role === 'logistics_operator' ||
    role === 'driver' ||
    role === 'emergency_responder'
  ) {
    return role as UserRole;
  }
  return 'driver';
}

/** Check if role can access a specific tab */
export function canAccessTab(role: UserRole, tabId: string): boolean {
  const norm = normalizeRole(role);
  const perms = ROLE_PERMISSIONS[norm];
  if (!perms) return false;
  if (perms.access === 'FULL') return true;
  return perms.tabs.includes(tabId);
}

/** Check if role can access a specific module (alias for canAccessTab) */
export function canAccessModule(role: UserRole, moduleId: string): boolean {
  return canAccessTab(role, moduleId);
}

/** Get default home tab for role */
export function getDefaultTabForRole(role: UserRole): string {
  const norm = normalizeRole(role);
  const cfg = OPERATIONAL_ROLES[norm];
  return cfg ? cfg.defaultTab : 'driver-cockpit';
}

/** Action-level permission check */
export function canPerformAction(role: UserRole, action: string): boolean {
  const norm = normalizeRole(role);
  const perms = ROLE_PERMISSIONS[norm];
  if (!perms) return false;
  if (perms.access === 'FULL') return true;

  switch (action) {
    case 'road_override':
    case 'gis_road_override':
    case 'canPerformRoadOverride':
      return perms.capabilities.canPerformRoadOverride;

    case 'audit_trail':
    case 'audit_functions':
    case 'canAccessAuditTrail':
      return perms.capabilities.canReviewAuditTrail;

    case 'simulation':
    case 'run_simulation':
    case 'simulation_controls':
    case 'canRunSimulation':
      return perms.capabilities.canRunSimulation;

    case 'what_if':
    case 'canUseWhatIf':
      return perms.capabilities.canAccessWhatIf;

    case 'manage_fleet':
    case 'canManageFleet':
      return perms.capabilities.canManageFleet;

    case 'manage_supplies':
    case 'canManageSupplies':
      return perms.capabilities.canManageSupplies;

    case 'emergency_command':
    case 'emergency_mode':
    case 'toggle_emergency':
    case 'canToggleEmergency':
      return perms.capabilities.canToggleEmergency;

    case 'sitrep':
    case 'ai_sitrep':
    case 'canAccessSitRep':
      return perms.capabilities.canAccessSitRep;

    case 'aar':
    case 'aar_debrief':
    case 'canAccessAar':
      return perms.capabilities.canAccessAar;

    case 'verify_incident':
    case 'canVerifyFieldIncidents':
      return perms.capabilities.canVerifyFieldIncidents;

    case 'submit_field_report':
    case 'canSubmitFieldReport':
      return perms.capabilities.canSubmitFieldReport;

    case 'view_financial_exposure':
      return perms.capabilities.canViewFinancialExposure;

    case 'view_all_ner_data':
      return perms.capabilities.canViewAllNERData;

    default:
      return false;
  }
}

/** Dedicated Action & Capability RBAC Helpers */

export function canPerformRoadOverride(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canPerformRoadOverride ?? false;
}

export function canAccessAuditTrail(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canReviewAuditTrail ?? false;
}

export function canRunSimulation(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canRunSimulation ?? false;
}

export function canUseWhatIf(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canAccessWhatIf ?? false;
}

export const canAccessWhatIf = canUseWhatIf;

export function canManageFleet(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canManageFleet ?? false;
}

export function canManageSupplies(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canManageSupplies ?? false;
}

export function canUseEmergencyCommand(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canToggleEmergency ?? false;
}

export function canToggleEmergency(role: UserRole): boolean {
  return canUseEmergencyCommand(role);
}

export function canAccessSitRep(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canAccessSitRep ?? false;
}

export function canAccessAar(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canAccessAar ?? false;
}

export function canVerifyFieldIncidents(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canVerifyFieldIncidents ?? false;
}

export function canSubmitFieldReport(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canSubmitFieldReport ?? false;
}

export function canManageUsers(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canManageUsers ?? false;
}

export function canReviewAuditTrail(role: UserRole): boolean {
  return canAccessAuditTrail(role);
}

export function canViewFinancialExposure(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canViewFinancialExposure ?? false;
}

export function canViewAllNERData(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm]?.capabilities.canViewAllNERData ?? false;
}

export function getRoleBadgeLabel(role: UserRole): string {
  return OPERATIONAL_ROLES[normalizeRole(role)]?.badge ?? 'OPERATIONAL USER';
}

export function getRoleTitle(role: UserRole): string {
  return OPERATIONAL_ROLES[normalizeRole(role)]?.title ?? 'Operational Role';
}

export function getRoleDescription(role: UserRole): string {
  return OPERATIONAL_ROLES[normalizeRole(role)]?.description ?? '';
}

// ============================================================
// DATA SCOPING LOGIC ACCORDING TO PRINCIPLE OF LEAST PRIVILEGE
// ============================================================

/** Filter corridors based on user role and jurisdiction */
export function getScopedCorridors(
  corridors: Corridor[],
  role: UserRole,
  user?: UserProfile | null
): Corridor[] {
  const norm = normalizeRole(role);

  switch (norm) {
    case 'admin':
      // SDMA Command has complete oversight over all 8 NER states
      return corridors;

    case 'district_officer': {
      // Scoped strictly to corridors in user's state or district jurisdiction (e.g. Manipur, NH-37, NH-29)
      const targetState = user?.state || 'Manipur';
      const districtCorridors = corridors.filter(
        (c) => c.state === targetState || c.id === 'corridor-nh37' || c.id === 'corridor-nh29'
      );
      return districtCorridors.length > 0 ? districtCorridors : corridors.slice(0, 3);
    }

    case 'logistics_operator':
      // Monitored arterial freight transport corridors (NH-37, NH-6, NH-29, NH-27)
      return corridors.filter((c) =>
        ['corridor-nh37', 'corridor-nh6', 'corridor-nh29', 'corridor-nh27'].includes(c.id)
      );

    case 'emergency_responder':
      // Corridors with active hazards, high risk (>40%) or severe restriction/blockage
      return corridors.filter(
        (c) => c.riskScore >= 40 || c.accessibility !== 'ACCESSIBLE' || c.id === 'corridor-nh37'
      );

    case 'supply_manager':
      // Critical supply supply-chain corridors (NH-37 to Imphal, NH-6 to Silchar, NH-29 to Kohima)
      return corridors.filter((c) =>
        ['corridor-nh37', 'corridor-nh6', 'corridor-nh29'].includes(c.id)
      );

    case 'driver': {
      // Driver ONLY sees the assigned corridor (corridor-nh37: Silchar - Imphal Lifeline)
      const assignedId = user?.assignedCorridorOrVehicle || 'corridor-nh37';
      const driverCorridor = corridors.filter((c) => c.id === assignedId);
      return driverCorridor.length > 0 ? driverCorridor : [corridors[0]];
    }

    default:
      return corridors;
  }
}

/** Filter vehicles based on user role */
export function getScopedVehicles(
  vehicles: Vehicle[],
  role: UserRole,
  user?: UserProfile | null
): Vehicle[] {
  const norm = normalizeRole(role);

  switch (norm) {
    case 'admin':
      // Complete oversight of all vehicles across all states
      return vehicles;

    case 'district_officer':
      // Vehicles active in or heading to assigned district (NH-37 / Imphal / Jiribam)
      return vehicles.filter(
        (v) =>
          v.corridorId === 'corridor-nh37' ||
          v.destination.toLowerCase().includes('imphal') ||
          v.origin.toLowerCase().includes('silchar') ||
          v.id === 'TRUCK-001'
      );

    case 'logistics_operator':
      // All commercial & emergency freight fleet
      return vehicles;

    case 'emergency_responder':
      // Emergency, high-risk, delayed or safely staged convoys requiring escort or medical support
      return vehicles.filter(
        (v) =>
          v.deliveryStatus === 'STOPPED' ||
          v.deliveryStatus === 'DELAYED' ||
          v.riskScore >= 45 ||
          v.id === 'TRUCK-001'
      );

    case 'supply_manager':
      // Supply carrying trucks (Medicines, Food rations, Cold-Chain)
      return vehicles.filter(
        (v) =>
          v.cargo.toLowerCase().includes('insulin') ||
          v.cargo.toLowerCase().includes('food') ||
          v.cargo.toLowerCase().includes('medicine') ||
          v.cargo.toLowerCase().includes('water')
      );

    case 'driver': {
      // LIFELINE DRIVER SEES ONLY THEIR ASSIGNED VEHICLE (TRUCK-001)!
      const assignedId = user?.assignedCorridorOrVehicle || 'TRUCK-001';
      const driverTruck = vehicles.filter((v) => v.id === assignedId || v.id === 'TRUCK-001');
      return driverTruck.length > 0 ? driverTruck.slice(0, 1) : [vehicles[0]];
    }

    default:
      return vehicles;
  }
}

/** Filter field incidents based on user role */
export function getScopedIncidents(
  incidents: FieldIncident[],
  role: UserRole,
  user?: UserProfile | null
): FieldIncident[] {
  const norm = normalizeRole(role);

  switch (norm) {
    case 'admin':
      return incidents;

    case 'district_officer':
      // Incidents on district corridors (NH-37 / NH-29)
      return incidents.filter(
        (i) =>
          i.corridorId === 'corridor-nh37' ||
          i.corridorId === 'corridor-nh29' ||
          i.roadName.toLowerCase().includes('nh-37') ||
          i.roadName.toLowerCase().includes('makru')
      );

    case 'logistics_operator':
      // Incidents directly impacting logistics corridors
      return incidents.filter(
        (i) => i.accessibility === 'BLOCKED' || i.accessibility === 'RESTRICTED'
      );

    case 'emergency_responder':
      // All active and verified incidents requiring ground triage
      return incidents;

    case 'supply_manager':
      // Incidents on supply corridors
      return incidents.filter(
        (i) => i.corridorId === 'corridor-nh37' || i.corridorId === 'corridor-nh6'
      );

    case 'driver':
      // Driver ONLY sees incidents on their assigned route (NH-37 / Makru)
      return incidents.filter(
        (i) =>
          i.corridorId === 'corridor-nh37' ||
          i.roadName.toLowerCase().includes('nh-37') ||
          i.roadName.toLowerCase().includes('makru')
      );

    default:
      return incidents;
  }
}

/** Filter essential supplies based on user role */
export function getScopedSupplies(
  supplies: EssentialSupply[],
  role: UserRole,
  user?: UserProfile | null
): EssentialSupply[] {
  const norm = normalizeRole(role);

  switch (norm) {
    case 'admin':
    case 'supply_manager':
      return supplies;

    case 'district_officer':
      // Supplies in or destined for district hospital (Imphal / Manipur / RIMS)
      return supplies.filter(
        (s) =>
          s.destination.toLowerCase().includes('imphal') ||
          s.destination.toLowerCase().includes('manipur') ||
          s.warehouse.toLowerCase().includes('imphal') ||
          s.priority === 'CRITICAL'
      );

    case 'logistics_operator':
      // In-transit supplies and critical shortages
      return supplies.filter(
        (s) => s.priority === 'CRITICAL' || s.priority === 'HIGH' || s.shortage > 0
      );

    case 'emergency_responder':
      // Critical life-saving supplies (Medical trauma packs, Insulin, Water)
      return supplies.filter((s) => s.category === 'MEDICINES' || s.category === 'WATER' || s.priority === 'CRITICAL');

    case 'driver':
      // Driver ONLY sees the consignment carried in TRUCK-001 (Insulin & Cold-Chain Units)
      return supplies.filter(
        (s) =>
          s.name.toLowerCase().includes('insulin') ||
          s.category === 'MEDICINES' ||
          s.id === 'sup-insulin-imphal'
      );

    default:
      return supplies;
  }
}

/** Filter alerts based on user role */
export function getScopedAlerts(
  alerts: AlertItem[],
  role: UserRole,
  user?: UserProfile | null
): AlertItem[] {
  const norm = normalizeRole(role);

  return alerts.filter((alert) => {
    // If targeted specifically to this role
    if (alert.targetRoles && alert.targetRoles.includes(norm)) {
      // For driver, only if it pertains to driver's vehicle or corridor
      if (norm === 'driver') {
        if (alert.vehicleId && alert.vehicleId !== 'TRUCK-001') return false;
        if (alert.corridorId && alert.corridorId !== 'corridor-nh37') return false;
      }
      return true;
    }

    // For admin, show all critical and high alerts
    if (norm === 'admin') return true;

    // For emergency responder, show all CRITICAL alerts
    if (norm === 'emergency_responder' && alert.severity === 'CRITICAL') return true;

    // General broadcast without targetRoles
    if (!alert.targetRoles || alert.targetRoles.length === 0) {
      if (norm === 'driver') {
        return (
          alert.corridorId === 'corridor-nh37' ||
          alert.vehicleId === 'TRUCK-001' ||
          alert.severity === 'CRITICAL'
        );
      }
      return true;
    }

    return false;
  });
}
