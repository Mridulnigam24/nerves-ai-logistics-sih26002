import { SmartRoute, AccessibilityStatus } from '../types';

export type RoutingScenarioProfile =
  | 'DISASTER_RESPONSE'
  | 'NORMAL_LOGISTICS'
  | 'MEDICAL_EMERGENCY'
  | 'HEAVY_SUPPLY_CONVOY';

export type VehicleRoutingProfile =
  | 'HEAVY_TRUCK'
  | 'MULTI_AXLE_TANKER'
  | 'LIGHT_NDRF_4X4'
  | 'MEDICAL_VAN';

export interface ScenarioWeights {
  id: RoutingScenarioProfile;
  name: string;
  badge: string;
  description: string;
  safetyWeight: number;        // e.g. 0.40
  accessibilityWeight: number; // e.g. 0.30
  roadTerrainWeight: number;   // e.g. 0.15
  travelTimeWeight: number;    // e.g. 0.10
  distanceWeight: number;      // e.g. 0.05
}

export const SCENARIO_PROFILES: Record<RoutingScenarioProfile, ScenarioWeights> = {
  DISASTER_RESPONSE: {
    id: 'DISASTER_RESPONSE',
    name: 'Disaster Response (Crisis Mode)',
    badge: '40% Safety | 30% Access',
    description: 'Prioritizes operational safety (40%) and corridor accessibility (30%) over speed and distance.',
    safetyWeight: 0.40,
    accessibilityWeight: 0.30,
    roadTerrainWeight: 0.15,
    travelTimeWeight: 0.10,
    distanceWeight: 0.05,
  },
  NORMAL_LOGISTICS: {
    id: 'NORMAL_LOGISTICS',
    name: 'Normal Logistics (Routine Commercial)',
    badge: 'Balanced Efficiency',
    description: 'Balanced optimization between highway safety, commercial transit time, and mileage costs.',
    safetyWeight: 0.30,
    accessibilityWeight: 0.25,
    roadTerrainWeight: 0.15,
    travelTimeWeight: 0.15,
    distanceWeight: 0.15,
  },
  MEDICAL_EMERGENCY: {
    id: 'MEDICAL_EMERGENCY',
    name: 'Medical Emergency (Trauma & Cold-Chain)',
    badge: 'High Transit Time Weight',
    description: 'Zero distance penalty, elevated transit speed (20%) while maintaining strict safety standards.',
    safetyWeight: 0.35,
    accessibilityWeight: 0.30,
    roadTerrainWeight: 0.15,
    travelTimeWeight: 0.20,
    distanceWeight: 0.00,
  },
  HEAVY_SUPPLY_CONVOY: {
    id: 'HEAVY_SUPPLY_CONVOY',
    name: 'Heavy Supply Convoy (Multi-Axle / 20T+)',
    badge: 'Terrain & Incline Sensitive',
    description: 'Heightened road surface & terrain incline weight (20%) to prevent vehicle tip-over and mud entrapment.',
    safetyWeight: 0.40,
    accessibilityWeight: 0.25,
    roadTerrainWeight: 0.20,
    travelTimeWeight: 0.10,
    distanceWeight: 0.05,
  },
};

export interface VehicleRoutingConfig {
  id: VehicleRoutingProfile;
  name: string;
  category: string;
  maxInclineAscentM: number;
  requiresPaved: boolean;
  minLaneWidthM: number;
  description: string;
}

export const VEHICLE_PROFILES: Record<VehicleRoutingProfile, VehicleRoutingConfig> = {
  HEAVY_TRUCK: {
    id: 'HEAVY_TRUCK',
    name: 'Heavy Supply Truck (16T / Multi-Axle)',
    category: 'Commercial Heavy Freight',
    maxInclineAscentM: 1800,
    requiresPaved: true,
    minLaneWidthM: 6.5,
    description: 'High gross axle weight. Strictly prohibited on unpaved hill tracks or seasonal mud slurries.',
  },
  MULTI_AXLE_TANKER: {
    id: 'MULTI_AXLE_TANKER',
    name: 'Petroleum & Cryogenic Tanker',
    category: 'Hazardous Materials / Fuel',
    maxInclineAscentM: 1600,
    requiresPaved: true,
    minLaneWidthM: 7.0,
    description: 'Liquid slosh and rollover hazard on narrow hill cuts. Requires paved bypass alignment.',
  },
  LIGHT_NDRF_4X4: {
    id: 'LIGHT_NDRF_4X4',
    name: 'Light 4x4 Quick Response (NDRF/SDRF)',
    category: 'Search & Rescue 4WD',
    maxInclineAscentM: 2500,
    requiresPaved: false,
    minLaneWidthM: 3.5,
    description: 'High ground clearance 4WD. Capable of rough gravel sections, but zero bulk cargo capacity.',
  },
  MEDICAL_VAN: {
    id: 'MEDICAL_VAN',
    name: 'Cold-Chain Medical Van / Ambulance',
    category: 'Emergency Medical Logistics',
    maxInclineAscentM: 2000,
    requiresPaved: true,
    minLaneWidthM: 4.5,
    description: 'Requires paved pavement to protect temperature-controlled vaccine vials and trauma patients.',
  },
};

export interface RouteFactorBreakdown {
  factor: string;
  weightPct: number;
  normalizedScore: number;
  weightedScore: number;
  formula: string;
}

export interface RouteDecision {
  routeId: string;
  safetyScore: number;
  accessibilityScore: number;
  roadConditionScore: number;
  terrainScore: number;
  roadTerrainScore: number;
  travelTimeScore: number;
  distanceScore: number;
  overallScore: number;
  operationalStatus: 'RECOMMENDED' | 'SAFEST' | 'VIABLE_ALTERNATE' | 'RESTRICTED' | 'NOT_OPERATIONALLY_VIABLE';
  passedSafetyGate: boolean;
  gateFailureReason?: string;
  reasons: string[];
  tradeoffs: string[];
  scoreBreakdown: RouteFactorBreakdown[];
  decisionPrinciple: string;
}

/**
 * Calculates deterministic Road & Terrain condition score (0-100)
 */
export function calculateRoadTerrainScore(route: SmartRoute): {
  roadScore: number;
  terrainScore: number;
  combined: number;
} {
  const cond = route.roadCondition.toLowerCase();
  let roadScore = 65;

  if (cond.includes('four-lane') || cond.includes('paved & clear') || cond.includes('paved bypass')) {
    roadScore = 96;
  } else if (cond.includes('paved')) {
    roadScore = 78;
  } else if (cond.includes('rough') || cond.includes('localized')) {
    roadScore = 42;
  } else if (cond.includes('unpaved') || cond.includes('mud') || cond.includes('debris')) {
    roadScore = 12;
  }

  // Terrain incline score based on elevation ascent
  const elevation = route.elevationGainM || 1500;
  let terrainScore = 60;
  if (elevation <= 1100) {
    terrainScore = 92;
  } else if (elevation <= 1300) {
    terrainScore = 80;
  } else if (elevation <= 1500) {
    terrainScore = 68;
  } else if (elevation <= 1700) {
    terrainScore = 52;
  } else if (elevation <= 1900) {
    terrainScore = 38;
  } else {
    terrainScore = 18;
  }

  const combined = Math.round(0.55 * roadScore + 0.45 * terrainScore);
  return { roadScore, terrainScore, combined };
}

/**
 * Deterministic Route Scoring Engine
 * Evaluates candidate routes against active operational scenario and vehicle profile
 */
export function evaluateRoutes(
  routes: SmartRoute[],
  scenarioProfile: RoutingScenarioProfile = 'DISASTER_RESPONSE',
  vehicleProfile: VehicleRoutingProfile = 'HEAVY_TRUCK'
): {
  evaluatedRoutes: (SmartRoute & { decision: RouteDecision })[];
  recommendedRouteId: string | null;
} {
  if (!routes || routes.length === 0) {
    return { evaluatedRoutes: [], recommendedRouteId: null };
  }

  const weights = SCENARIO_PROFILES[scenarioProfile] || SCENARIO_PROFILES.DISASTER_RESPONSE;
  const vehicle = VEHICLE_PROFILES[vehicleProfile] || VEHICLE_PROFILES.HEAVY_TRUCK;

  // Find min distance and min travel time for relative normalization
  const minDistance = Math.min(...routes.map((r) => r.distanceKm || 300));
  const minTimeMinutes = Math.min(
    ...routes.map((r) => (r.etaHours || 0) * 60 + (r.etaMinutes || 0) || 300)
  );

  const evaluated = routes.map((route) => {
    // 1. Safety Score: safetyScore = 100 - disruptionRiskPercentage
    const riskPct = Math.max(0, Math.min(100, route.riskScore));
    const safetyScore = Math.max(0, Math.min(100, 100 - riskPct));

    // 2. Accessibility Score:
    // ACCESSIBLE = high (100)
    // RESTRICTED = significantly lower (35)
    // BLOCKED = 0
    let accessibilityScore = 0;
    if (route.accessibility === 'ACCESSIBLE') {
      accessibilityScore = 100;
    } else if (route.accessibility === 'RESTRICTED') {
      accessibilityScore = 35;
    } else {
      accessibilityScore = 0;
    }

    // 3. Road & Terrain Condition Score (15% or scenario weight)
    const { roadScore, terrainScore, combined: roadTerrainScore } = calculateRoadTerrainScore(route);

    // 4. Travel Time Score (10% or scenario weight)
    const routeTimeMinutes = (route.etaHours || 0) * 60 + (route.etaMinutes || 0);
    const timeDeltaPct = (routeTimeMinutes - minTimeMinutes) / (minTimeMinutes || 1);
    const travelTimeScore = Math.max(10, Math.min(100, Math.round(100 - timeDeltaPct * 75)));

    // 5. Distance Score (5% or scenario weight)
    const distDeltaPct = (route.distanceKm - minDistance) / (minDistance || 1);
    const distanceScore = Math.max(10, Math.min(100, Math.round(100 - distDeltaPct * 75)));

    // HARD SAFETY & ACCESSIBILITY GATES
    let passedSafetyGate = true;
    let gateFailureReason: string | undefined;

    // Gate 1: Confirmed Road Closure / Impassability
    const notesLower = (route.notes || '').toLowerCase();
    const roadCondLower = (route.roadCondition || '').toLowerCase();
    if (
      route.accessibility === 'BLOCKED' ||
      notesLower.includes('zero motorable width') ||
      notesLower.includes('impassable') ||
      roadCondLower.includes('severe rockfall') ||
      roadCondLower.includes('mud slurry — impassable')
    ) {
      passedSafetyGate = false;
      gateFailureReason = 'Active highway impassability: severe rockfall debris / zero motorable clearance.';
    }

    // Gate 2: Vehicle Compatibility
    if (passedSafetyGate) {
      if (
        (vehicle.id === 'HEAVY_TRUCK' || vehicle.id === 'MULTI_AXLE_TANKER') &&
        (roadCondLower.includes('unpaved') ||
          roadCondLower.includes('mud slurry') ||
          notesLower.includes('unpaved') ||
          route.elevationGainM > vehicle.maxInclineAscentM)
      ) {
        passedSafetyGate = false;
        gateFailureReason = `Vehicle Incompatible: Axle weight/gradient exceeds structural limit for ${vehicle.name}.`;
      }
    }

    // Gate 3: Extreme Disruption Risk
    if (passedSafetyGate && route.riskScore >= 75) {
      passedSafetyGate = false;
      gateFailureReason = `Extreme disruption risk (${route.riskScore}%): Exceeds safe convoy transit threshold.`;
    }

    // Calculate raw weighted score
    const weightedSafety = Math.round(safetyScore * weights.safetyWeight * 10) / 10;
    const weightedAccess = Math.round(accessibilityScore * weights.accessibilityWeight * 10) / 10;
    const weightedRoadTerrain = Math.round(roadTerrainScore * weights.roadTerrainWeight * 10) / 10;
    const weightedTime = Math.round(travelTimeScore * weights.travelTimeWeight * 10) / 10;
    const weightedDistance = Math.round(distanceScore * weights.distanceWeight * 10) / 10;

    let overallScore = Math.round(
      weightedSafety + weightedAccess + weightedRoadTerrain + weightedTime + weightedDistance
    );

    // If route failed safety gate, penalize overall score so it cannot win
    if (!passedSafetyGate) {
      overallScore = Math.min(overallScore, 24);
    }

    const scoreBreakdown: RouteFactorBreakdown[] = [
      {
        factor: 'Safety / Disruption Risk',
        weightPct: Math.round(weights.safetyWeight * 100),
        normalizedScore: safetyScore,
        weightedScore: weightedSafety,
        formula: `100 - ${riskPct}% risk = ${safetyScore} pts`,
      },
      {
        factor: 'Corridor Accessibility',
        weightPct: Math.round(weights.accessibilityWeight * 100),
        normalizedScore: accessibilityScore,
        weightedScore: weightedAccess,
        formula: `${route.accessibility} status = ${accessibilityScore} pts`,
      },
      {
        factor: 'Road & Terrain Condition',
        weightPct: Math.round(weights.roadTerrainWeight * 100),
        normalizedScore: roadTerrainScore,
        weightedScore: weightedRoadTerrain,
        formula: `Road: ${roadScore} + Incline (${route.elevationGainM}m): ${terrainScore} = ${roadTerrainScore} pts`,
      },
      {
        factor: 'Estimated Transit Time',
        weightPct: Math.round(weights.travelTimeWeight * 100),
        normalizedScore: travelTimeScore,
        weightedScore: weightedTime,
        formula: `${route.etaHours}h ${route.etaMinutes}m (${timeDeltaPct > 0 ? `+${Math.round(timeDeltaPct * 100)}%` : 'Fastest'}) = ${travelTimeScore} pts`,
      },
      {
        factor: 'Total Transit Distance',
        weightPct: Math.round(weights.distanceWeight * 100),
        normalizedScore: distanceScore,
        weightedScore: weightedDistance,
        formula: `${route.distanceKm} km (${distDeltaPct > 0 ? `+${Math.round(distDeltaPct * 100)}%` : 'Shortest'}) = ${distanceScore} pts`,
      },
    ];

    const decision: RouteDecision = {
      routeId: route.id,
      safetyScore,
      accessibilityScore,
      roadConditionScore: roadScore,
      terrainScore,
      roadTerrainScore,
      travelTimeScore,
      distanceScore,
      overallScore,
      operationalStatus: !passedSafetyGate
        ? 'NOT_OPERATIONALLY_VIABLE'
        : route.accessibility === 'RESTRICTED'
        ? 'RESTRICTED'
        : 'VIABLE_ALTERNATE',
      passedSafetyGate,
      gateFailureReason,
      reasons: [],
      tradeoffs: [],
      scoreBreakdown,
      decisionPrinciple: 'SAFETY & ACCESSIBILITY PRIORITIZED OVER SPEED',
    };

    return {
      ...route,
      decision,
    };
  });

  // CONFLICT RESOLUTION & RANKING HIERARCHY
  // 1. Viable routes (passed gates) rank above non-viable routes
  // 2. Higher overallScore wins
  // 3. Conflict resolution hierarchy:
  //    - Safety + Accessibility wins over Distance/Time
  //    - If two routes are approximately equal in safety & accessibility (<= 3 pts diff),
  //      travel time and distance serve as decisive tie-breakers.
  const viableRoutes = evaluated.filter((r) => r.decision.passedSafetyGate);

  let recommendedRoute: (SmartRoute & { decision: RouteDecision }) | null = null;

  if (viableRoutes.length > 0) {
    // Check if an accessible route exists vs restricted routes
    const accessibleViable = viableRoutes.filter((r) => r.accessibility === 'ACCESSIBLE');
    const candidates = accessibleViable.length > 0 ? accessibleViable : viableRoutes;

    candidates.sort((a, b) => {
      // Tie-breaker check:
      const safetyDiff = Math.abs(a.decision.safetyScore - b.decision.safetyScore);
      const accessDiff = Math.abs(a.decision.accessibilityScore - b.decision.accessibilityScore);
      if (safetyDiff <= 3 && accessDiff <= 3) {
        // Tie-breaker: travel time & distance
        return (
          b.decision.travelTimeScore + b.decision.distanceScore -
          (a.decision.travelTimeScore + a.decision.distanceScore)
        );
      }
      return b.decision.overallScore - a.decision.overallScore;
    });

    recommendedRoute = candidates[0];
  }

  // Populate operational statuses, reasons, and trade-offs
  evaluated.forEach((item) => {
    if (recommendedRoute && item.id === recommendedRoute.id) {
      item.decision.operationalStatus = 'RECOMMENDED';
      item.category = 'RECOMMENDED';

      // Reasons why this route won
      item.decision.reasons = [
        `Lowest disruption risk (${item.riskScore}% vs competitors)`,
        `${item.accessibility} operational corridor status`,
        `Better road & pavement surface (${item.roadCondition})`,
        `Manageable hill incline (${item.elevationGainM}m ascent)`,
        `Vehicle compatible with ${vehicle.name}`,
      ];

      // Trade-offs compared to shortest/fastest route
      const shortest = routes.find((r) => r.distanceKm === minDistance) || item;
      const fastest = routes.find(
        (r) => (r.etaHours * 60 + r.etaMinutes) === minTimeMinutes
      ) || item;

      const extraKm = item.distanceKm - shortest.distanceKm;
      const fastestMinutes = fastest.etaHours * 60 + fastest.etaMinutes;
      const itemMinutes = item.etaHours * 60 + item.etaMinutes;
      const extraMinutes = itemMinutes - fastestMinutes;

      if (extraKm > 0 || extraMinutes > 0) {
        const extraH = Math.floor(extraMinutes / 60);
        const extraM = extraMinutes % 60;
        item.decision.tradeoffs = [
          extraKm > 0 ? `+${extraKm} km additional bypass mileage` : 'Direct distance alignment',
          extraMinutes > 0
            ? `+${extraH > 0 ? `${extraH}h ` : ''}${extraM}m additional estimated transit time`
            : 'Optimal transit duration',
          'Trade-off accepted: Mission completion probability maximized over transit efficiency',
        ];
      } else {
        item.decision.tradeoffs = ['No distance or time penalty: optimal direct corridor alignment'];
      }
    } else {
      if (!item.decision.passedSafetyGate) {
        item.decision.operationalStatus = 'NOT_OPERATIONALLY_VIABLE';
        item.category = 'NOT_OPERATIONALLY_VIABLE' as any;
        item.decision.reasons = [
          `Fails safety gate: ${item.decision.gateFailureReason || 'Critical hazard barrier'}`,
          'Zero motorable corridor safety clearance',
        ];
      } else if (item.accessibility === 'RESTRICTED') {
        item.decision.operationalStatus = 'RESTRICTED';
        item.category = 'RESTRICTED' as any;
        item.decision.reasons = [
          `Restricted corridor status (elevated ${item.riskScore}% hazard risk)`,
          'Non-preferred while accessible bypass alternative is active',
        ];
      } else {
        item.decision.operationalStatus = 'VIABLE_ALTERNATE';
        item.category = 'SAFEST';
        item.decision.reasons = [
          'Operationally viable backup corridor',
          `Secondary score (${item.decision.overallScore}/100)`,
        ];
      }
    }
  });

  return {
    evaluatedRoutes: evaluated,
    recommendedRouteId: recommendedRoute ? recommendedRoute.id : null,
  };
}

/**
 * Pre-configured Judge Verification Test Scenarios (Section 15)
 */
export interface JudgeTestCase {
  id: string;
  name: string;
  description: string;
  expectedOutcome: string;
  routes: SmartRoute[];
}

export const OPERATIONAL_TEST_CASES: Record<string, JudgeTestCase> = {
  TEST_1_SHORT_RESTRICTED_VS_LONG_ACCESSIBLE: {
    id: 'TEST_1_SHORT_RESTRICTED_VS_LONG_ACCESSIBLE',
    name: 'Test 1: Short Restricted (43%) vs Long Accessible (32%)',
    description: 'Direct route is shorter (310km) but restricted with 43% risk. Bypass is longer (420km) but accessible with 32% risk.',
    expectedOutcome: 'Route B recommended (81/100) over Route A (55/100). Safety and accessibility supersede distance.',
    routes: [
      {
        id: 'test-1-route-a',
        name: 'Route A: Direct NH-6 via Shillong & Jowai',
        via: 'GS Road & East Jaintia Hills',
        distanceKm: 310,
        etaHours: 7,
        etaMinutes: 15,
        riskScore: 43,
        accessibility: 'RESTRICTED',
        category: 'RESTRICTED' as any,
        isFeasible: true,
        roadCondition: 'Rough Surface',
        elevationGainM: 1600,
        notes: 'Standard arterial freight route connecting Assam valley and Barak valley. High slope slippage caution.',
      },
      {
        id: 'test-1-route-b',
        name: 'Route B: Via Halflong – Umrangso Spur (NH-27 / NH-627)',
        via: 'Dima Hasao Hill District Bypass',
        distanceKm: 420,
        etaHours: 10,
        etaMinutes: 30,
        riskScore: 32,
        accessibility: 'ACCESSIBLE',
        category: 'RECOMMENDED',
        isFeasible: true,
        roadCondition: 'Paved four-lane & two-lane bypass',
        elevationGainM: 1100,
        notes: '+110 km bypass, but avoids high-risk Sonapur landslide zone with gentle grade.',
      },
    ],
  },
  TEST_2_SHORT_SAFE_VS_LONG_SAFE: {
    id: 'TEST_2_SHORT_SAFE_VS_LONG_SAFE',
    name: 'Test 2: Short Safe (20%) vs Long Safe (30%)',
    description: 'Both routes are accessible and safe, but Route A has lower risk (20% vs 30%) and shorter distance (310km vs 420km).',
    expectedOutcome: 'Route A recommended (88/100). When safety is equal or superior, shorter distance and time prevail.',
    routes: [
      {
        id: 'test-2-route-a',
        name: 'Route A: Direct NH-6 (Cleared & Stabilized)',
        via: 'Direct Highway Lifeline',
        distanceKm: 310,
        etaHours: 7,
        etaMinutes: 0,
        riskScore: 20,
        accessibility: 'ACCESSIBLE',
        category: 'RECOMMENDED',
        isFeasible: true,
        roadCondition: 'Paved & Clear',
        elevationGainM: 1600,
        notes: 'BRO rockfall sheds functioning smoothly. Weather clear across Meghalaya plateau.',
      },
      {
        id: 'test-2-route-b',
        name: 'Route B: Via Halflong – Umrangso Bypass',
        via: 'Dima Hasao Hill District',
        distanceKm: 420,
        etaHours: 10,
        etaMinutes: 30,
        riskScore: 30,
        accessibility: 'ACCESSIBLE',
        category: 'SAFEST',
        isFeasible: true,
        roadCondition: 'Paved four-lane & two-lane bypass',
        elevationGainM: 1100,
        notes: '+110 km bypass route available as alternate.',
      },
    ],
  },
  TEST_3_SHORT_INACCESSIBLE_VS_LONG_ACCESSIBLE: {
    id: 'TEST_3_SHORT_INACCESSIBLE_VS_LONG_ACCESSIBLE',
    name: 'Test 3: Short Inaccessible vs Long Accessible',
    description: 'Route A is short (215km) but restricted under emergency conditions. Route B is 420km but accessible.',
    expectedOutcome: 'Route B recommended. Restricted corridor penalized heavily; accessible corridor selected.',
    routes: [
      {
        id: 'test-3-route-a',
        name: 'Route A: Direct NH-37 (Restricted Lifeline)',
        via: 'Silchar – Jiribam – Noney',
        distanceKm: 215,
        etaHours: 6,
        etaMinutes: 40,
        riskScore: 68,
        accessibility: 'RESTRICTED',
        category: 'RESTRICTED' as any,
        isFeasible: true,
        roadCondition: 'Rough Surface with Single-Lane Restriction',
        elevationGainM: 1450,
        notes: 'Single lane convoy only. High vulnerability to afternoon monsoon cloudburst.',
      },
      {
        id: 'test-3-route-b',
        name: 'Route B: Northern Arc via Dimapur & Senapati',
        via: 'NH-29 / NH-2',
        distanceKm: 420,
        etaHours: 11,
        etaMinutes: 45,
        riskScore: 35,
        accessibility: 'ACCESSIBLE',
        category: 'RECOMMENDED',
        isFeasible: true,
        roadCondition: 'Paved bypass alignment',
        elevationGainM: 1300,
        notes: 'Extended northern approach with steady transit and operational service bays.',
      },
    ],
  },
  TEST_4_SAFE_ACCESSIBLE_VS_UNSAFE_ACCESSIBLE: {
    id: 'TEST_4_SAFE_ACCESSIBLE_VS_UNSAFE_ACCESSIBLE',
    name: 'Test 4: Safe Accessible vs Unsafe Accessible',
    description: 'Both corridors accessible, but Route A has 18% risk while Route B has 65% disruption risk.',
    expectedOutcome: 'Route A recommended with commanding score. High disruption risk heavily penalized.',
    routes: [
      {
        id: 'test-4-route-a',
        name: 'Route A: Hardened Arterial Corridor',
        via: 'National Highway Express Alignment',
        distanceKm: 310,
        etaHours: 7,
        etaMinutes: 15,
        riskScore: 18,
        accessibility: 'ACCESSIBLE',
        category: 'RECOMMENDED',
        isFeasible: true,
        roadCondition: 'Paved & Clear',
        elevationGainM: 1200,
        notes: 'Reinforced rockfall netting and telemetry monitoring active.',
      },
      {
        id: 'test-4-route-b',
        name: 'Route B: Unmonitored Ghat Section',
        via: 'Saturated Western Ridgeline',
        distanceKm: 340,
        etaHours: 8,
        etaMinutes: 10,
        riskScore: 65,
        accessibility: 'ACCESSIBLE',
        category: 'SAFEST',
        isFeasible: true,
        roadCondition: 'Rough Surface with Active Seepage',
        elevationGainM: 1850,
        notes: 'High groundwater pore pressure detected by piezometer sensors.',
      },
    ],
  },
  TEST_5_TIE_BREAKER_IDENTICAL_SAFETY: {
    id: 'TEST_5_TIE_BREAKER_IDENTICAL_SAFETY',
    name: 'Test 5: Tie-Breaker (Near-Identical Safety & Accessibility)',
    description: 'Both routes accessible with identical 25% safety risk. Route A is 310km (7h 15m), Route B is 420km (10h 30m).',
    expectedOutcome: 'Route A recommended. Travel time and distance serve as tie-breakers when safety is equal.',
    routes: [
      {
        id: 'test-5-route-a',
        name: 'Route A: Direct Arterial Alignment',
        via: 'Primary National Highway',
        distanceKm: 310,
        etaHours: 7,
        etaMinutes: 15,
        riskScore: 25,
        accessibility: 'ACCESSIBLE',
        category: 'RECOMMENDED',
        isFeasible: true,
        roadCondition: 'Paved & Clear',
        elevationGainM: 1300,
        notes: 'Identical low risk profile. Faster transit and shorter logistics distance.',
      },
      {
        id: 'test-5-route-b',
        name: 'Route B: Secondary Bypass Alignment',
        via: 'Regional Ring Corridor',
        distanceKm: 420,
        etaHours: 10,
        etaMinutes: 30,
        riskScore: 25,
        accessibility: 'ACCESSIBLE',
        category: 'SAFEST',
        isFeasible: true,
        roadCondition: 'Paved & Clear',
        elevationGainM: 1300,
        notes: 'Identical low risk profile, but incurs +110 km and +3h 15m time overhead.',
      },
    ],
  },
  TEST_6_OPERATIONALLY_BLOCKED_VS_ACCESSIBLE: {
    id: 'TEST_6_OPERATIONALLY_BLOCKED_VS_ACCESSIBLE',
    name: 'Test 6: Operationally Blocked vs Accessible Bypass',
    description: 'Route A is short (215km) but blocked by severe landslide. Route B is 420km but accessible.',
    expectedOutcome: 'Route B recommended. Route A fails safety gate and is marked NOT OPERATIONALLY VIABLE.',
    routes: [
      {
        id: 'test-6-route-a',
        name: 'Route A: Direct NH-37 (Makru Bridgehead Blockage)',
        via: 'Direct Highway Lifeline',
        distanceKm: 215,
        etaHours: 9,
        etaMinutes: 15,
        riskScore: 89,
        accessibility: 'BLOCKED',
        category: 'NOT_OPERATIONALLY_VIABLE' as any,
        isFeasible: false,
        roadCondition: 'Severe Rockfall Debris at Makru Bridge',
        elevationGainM: 1450,
        notes: 'Zero motorable width. Multiple BRO earthmovers engaged in clearance.',
      },
      {
        id: 'test-6-route-b',
        name: 'Route B: Northern Relief Corridor via Dimapur',
        via: 'NH-29 / NH-2 Bypass',
        distanceKm: 420,
        etaHours: 11,
        etaMinutes: 30,
        riskScore: 35,
        accessibility: 'ACCESSIBLE',
        category: 'RECOMMENDED',
        isFeasible: true,
        roadCondition: 'Paved four-lane & two-lane bypass',
        elevationGainM: 1100,
        notes: 'Open and motorable for emergency supplies. Verified by state traffic police.',
      },
    ],
  },
};

/**
 * Generates dynamic, explainable reasoning from deterministic route decision factors
 */
export function generateDeterministicReasoning(
  recommended: SmartRoute & { decision: RouteDecision },
  competitors: (SmartRoute & { decision: RouteDecision })[],
  scenarioProfile: RoutingScenarioProfile,
  vehicleProfile: VehicleRoutingProfile
): string {
  const scenario = SCENARIO_PROFILES[scenarioProfile];
  const vehicle = VEHICLE_PROFILES[vehicleProfile];
  const primaryCompetitor = competitors.find((c) => c.id !== recommended.id) || competitors[0];

  const riskDiff = primaryCompetitor
    ? primaryCompetitor.riskScore - recommended.riskScore
    : 0;

  const extraKm = primaryCompetitor
    ? recommended.distanceKm - primaryCompetitor.distanceKm
    : 0;

  const recMinutes = recommended.etaHours * 60 + recommended.etaMinutes;
  const compMinutes = primaryCompetitor
    ? primaryCompetitor.etaHours * 60 + primaryCompetitor.etaMinutes
    : recMinutes;
  const extraMinutes = recMinutes - compMinutes;
  const extraH = Math.floor(Math.abs(extraMinutes) / 60);
  const extraM = Math.abs(extraMinutes) % 60;
  const timeStr = extraH > 0 ? `${extraH}h ${extraM}m` : `${extraM} minutes`;

  const competitorGateFail = primaryCompetitor && !primaryCompetitor.decision.passedSafetyGate;

  return `OPERATIONAL ROUTING DECISION & MATHEMATICAL REASONING:
• ENGINE VERDICT: NERVES recommends ${recommended.name} (NERVES Score: ${recommended.decision.overallScore}/100) under the active "${scenario.name}" operational profile.

• WHY THIS ROUTE WON:
  1. Operational Safety: Disruption risk is ${recommended.riskScore}% (${riskDiff > 0 ? `${riskDiff}% lower disruption hazard than ${primaryCompetitor?.name}` : 'optimized under active conditions'}).
  2. Accessibility Assurance: Corridor is verified as ${recommended.accessibility} with zero structural blockages.
  3. Terrain & Surface: Features ${recommended.roadCondition} with a controlled ${recommended.elevationGainM}m elevation ascent, fully certified for ${vehicle.name}.
${
  competitorGateFail
    ? `  4. Safety Gate Enforcement: Alternative route (${primaryCompetitor.name}) FAILED hard safety gates: ${primaryCompetitor.decision.gateFailureReason || 'severe road hazard'}. Consumer navigation algorithms that route here risk catastrophic vehicle entrapment.`
    : primaryCompetitor?.accessibility === 'RESTRICTED'
    ? `  4. Corridor Gate Enforcement: Alternative route (${primaryCompetitor.name}) is classified as RESTRICTED with unverified hill cuts. NERVES prioritizes mission success over distance.`
    : `  4. Tie-Breaker Resolution: Evaluated under scenario weights (Safety ${scenario.safetyWeight * 100}%, Access ${scenario.accessibilityWeight * 100}%, Road ${scenario.roadTerrainWeight * 100}%, Time ${scenario.travelTimeWeight * 100}%, Distance ${scenario.distanceWeight * 100}%).`
}

• ACCEPTED OPERATIONAL TRADE-OFF:
${
  extraKm > 0 || extraMinutes > 0
    ? `  Although ${recommended.name} incurs ${extraKm > 0 ? `+${extraKm} km extra distance` : ''}${extraKm > 0 && extraMinutes > 0 ? ' and ' : ''}${extraMinutes > 0 ? `approximately +${timeStr} additional transit time` : ''}, this trade-off is deliberately accepted. Unlike commercial GPS navigation that optimizes solely for speed, NERVES maximizes mission completion probability and vehicle survivability in disaster-prone terrain.`
    : '  Optimal alignment: Zero mileage or travel time penalty while securing maximum safety resilience.'
}

• DECISION PRINCIPLE:
  ${recommended.decision.decisionPrinciple}`;
}
