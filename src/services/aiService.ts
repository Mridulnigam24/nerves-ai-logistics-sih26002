import {
  Corridor,
  Vehicle,
  EssentialSupply,
  SimulationScenario,
  WeatherCondition,
  FieldIncident,
  SmartRoute,
} from '../types';
import {
  generateDeterministicReasoning,
  RoutingScenarioProfile,
  VehicleRoutingProfile,
  RouteDecision,
} from './routingDecisionEngine';

export interface AiSituationReportParams {
  scenario: SimulationScenario;
  weather: WeatherCondition;
  corridors: Corridor[];
  vehicles: Vehicle[];
  supplies: EssentialSupply[];
  incidentCount: number;
  liveWeatherSummary?: string;
  language?: string;
}

export interface AssistantQueryParams {
  query: string;
  scenario: SimulationScenario;
  corridors: Corridor[];
  vehicles: Vehicle[];
  supplies: EssentialSupply[];
  weatherData?: any;
  language?: string;
}

// Role-based auth header builder for security clearance verification
function getAuthHeaders(): Record<string, string> {
  const role = (typeof window !== 'undefined' && localStorage.getItem('nerves_cache_user_role')) || 'admin';
  return {
    'Content-Type': 'application/json',
    'x-user-role': role,
  };
}

// 1. AI Situation Report
export async function generateSituationReport(params: AiSituationReportParams): Promise<string> {
  const blockedCorridors = params.corridors.filter((c) => c.accessibility === 'BLOCKED').map((c) => `${c.code} (${c.name})`);
  const delayedVehicles = params.vehicles.filter((v) => v.deliveryStatus === 'DELAYED' || v.deliveryStatus === 'STOPPED' || v.deliveryStatus === 'RESTRICTED');
  const criticalSupplies = params.supplies.filter((s) => s.priority === 'CRITICAL').map((s) => s.name);

  try {
    const response = await fetch('/api/gemini/situation-report', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        scenario: params.scenario,
        weather: params.weather,
        incidentCount: params.incidentCount,
        blockedCorridors,
        affectedVehicles: delayedVehicles,
        criticalSupplies,
        liveWeatherSummary: params.liveWeatherSummary,
        language: params.language,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.report && !data.fallback) {
        return data.report;
      }
    }
  } catch {
    // Graceful fallback to deterministic engine
  }

  return generateDeterministicSituationReport(params, blockedCorridors, delayedVehicles, criticalSupplies);
}

function generateDeterministicSituationReport(
  params: AiSituationReportParams,
  blockedCorridors: string[],
  delayedVehicles: Vehicle[],
  criticalSupplies: string[]
): string {
  const blockedCount = blockedCorridors.length;
  const delayedCount = delayedVehicles.length;

  let summary = '';
  let corridorText = '';
  let recommendations = '';

  if (params.scenario === 'LANDSLIDE') {
    summary = `CRITICAL ALERT: Severe slope failure and landslide debris have severed NH-37 (Silchar–Imphal Lifeline) near Makru sector. Multiple vital logistical supply chains feeding Manipur and the Barak Valley are in critical operational jeopardy.`;
    corridorText = `• NH-37 (Silchar–Imphal): BLOCKED. Disruption Risk: 89%. Zero motorable width remaining due to hill embankment slumping.\n• NH-6 (Guwahati–Shillong–Silchar): RESTRICTED. Elevated rain saturation with high delay probability.`;
    recommendations = `1. IMMEDIATE CONVOY HOLD: Halt TRUCK-001 (carrying life-saving medicines & IV fluids) at Jiribam Border Safe Staging Yard.\n2. NO FEASIBLE ALTERNATE TRUCK ROUTE: Do NOT attempt unverified rural hill tracks. NH-2 is heavily saturated.\n3. AIRLIFT STANDBY: Coordinate with Eastern Air Command / NDRF for critical insulin airlift to RIMS Hospital Imphal.\n4. HEAVY MACHINERY MOBILIZATION: Direct BRO Project Pushpak & NHIDCL JCB excavators to Makru bridgehead.`;
  } else if (params.scenario === 'FLOOD') {
    summary = `FLOOD HAZARD LEVEL ELEVATED: Intense monsoon precipitation across the upper Brahmaputra and Barak basins has triggered severe waterlogging and flash flood exposure along critical low-lying highway stretches.`;
    corridorText = `• NH-715 (Valley Trunk - Kaziranga / Bokakhat): RESTRICTED. 0.3m water runoff over pavement in culvert sections.\n• NH-6 (Jaintia Hills): RESTRICTED. Hill torrents eroding unpaved road shoulders.`;
    recommendations = `1. SPEED RESTRICTION: Enforce 25 km/h limit on animal corridors and flood zones on NH-715.\n2. STAGE WATER CONVOYS: Direct TRUCK-003 (Potable Water Tanker) to prioritize Bokakhat Relief Shelters.\n3. PRE-POSITION RESCUE RAFTS: Pre-position SDRF rescue boats at Numaligarh and Kaliabor junction staging points.`;
  } else if (params.scenario === 'HEAVY_RAIN') {
    summary = `ELEVATED ACCESSIBILITY RISK: Continuous heavy orographic rainfall across Meghalaya and Arunachal Pradesh escarpments has elevated slope saturation index above 75%.`;
    corridorText = `• NH-13 (Bhalukpong–Tawang): RESTRICTED. High rockfall frequency.\n• NH-37 (Makru sector): RESTRICTED. Single-lane slow movement.`;
    recommendations = `1. EARLY STAGING ADVISORY: Advise all freight operators to halt night movements on steep ghat roads.\n2. DRIVER DISPATCH ALERTS: Transmit geo-fenced speed and visibility advisories to in-transit vehicles.\n3. WAREHOUSE BUFFERING: Check local medical stocks at Imphal and Silchar district depots.`;
  } else if (params.scenario === 'ROAD_BLOCKAGE') {
    summary = `STRATEGIC BOTTLENECK BLOCKED: Highway obstruction detected on key NER corridor. Transport logistics halted until civil mechanical clearing is confirmed.`;
    corridorText = `• Blocked Corridors: ${blockedCount > 0 ? blockedCorridors.join(', ') : 'NH-37 Makru Sector'}.\n• Affected Active Freight: ${delayedCount} heavy logistics vehicles delayed.`;
    recommendations = `1. ENFORCE PROTOCOL: Divert non-essential traffic to safe staging parking depots.\n2. EMERGENCY CORRIDOR: Maintain single dedicated lane for ambulances and military relief columns.\n3. FIELD RECONNAISSANCE: Await verified geo-tagged photo clearance from Field Officers before lifting blockage flags.`;
  } else if (params.scenario === 'RECOVERY') {
    summary = `RECOVERY IN PROGRESS: Slopes have stabilized and preliminary earth clearance is underway across affected corridors. Residual hazards remain.`;
    corridorText = `• NH-37 & NH-6: Transitioning from BLOCKED to RESTRICTED. Single file escort protocol active.\n• Transit delay index reducing across all 5 monitored routes.`;
    recommendations = `1. PHASED CONVOY RELEASE: Release essential medical freight (TRUCK-001) first under police escort.\n2. POST-LANDSLIDE INSPECTION: Continuous soil monitoring by BRO / PWD engineers.\n3. RE-EVALUATE RISKS: Refresh AI Disruption Risk scores every 30 minutes based on real-time IMD radar feeds.`;
  } else {
    summary = `NORMAL OPERATIONAL STATUS: All major North Eastern interstate highways and critical supply corridors are operating within safe accessibility parameters.`;
    corridorText = `• All 6 monitored highway corridors are ACCESSIBLE.\n• Active Vehicles: 5/5 On Route on standard schedule.\n• Delivery Delay Index: 0% across essential supply categories.`;
    recommendations = `1. Maintain standard highway surveillance and IMD weather radar logging.\n2. Ensure cold-chain verification on medical supply consignments.\n3. Keep designated safe staging points provisioned with fuel and emergency rations.`;
  }

  return `===================================================================
NERVES EMERGENCY OPERATIONS LOGISTICS SITUATION REPORT
Prototype Intelligence Feed — North Eastern Region (SIH26002)
Generated: ${new Date().toLocaleTimeString()} IST | Scenario: ${params.scenario}
===================================================================

1. EXECUTIVE LOGISTICS SITUATION
${summary}

2. CORRIDOR ACCESSIBILITY & BOTTLENECKS
${corridorText}
• Active Blocked Corridors: ${blockedCount}
• Delayed Heavy Freight Convoys: ${delayedCount}
• Critical Supplies at Risk: ${criticalSupplies.join(', ') || 'None'}

3. IMMEDIATE OPERATIONAL DIRECTIVES
${recommendations}

4. SUPPLY CHAIN CONTINUITY MANDATE
• Priority Consignment: TRUCK-001 carrying Emergency Insulin & Trauma Kits.
• Status: Destination hospital stock threshold is constrained.
• Strategic Rule: "We don't just navigate roads — we predict their accessibility." Where no verified connected alternate road exists, human operators must enforce Safe Staging rather than risking vehicle loss.`;
}

// 2. Interactive AI Assistant
export async function askNervesAssistant(params: AssistantQueryParams): Promise<string> {
  const blockedCorridors = params.corridors.filter((c) => c.accessibility === 'BLOCKED').map((c) => c.name);
  const delayedVehicles = params.vehicles.filter((v) => v.deliveryStatus !== 'ON_ROUTE').map((v) => `${v.id} (${v.cargo})`);

  try {
    const response = await fetch('/api/gemini/assistant', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        query: params.query,
        scenario: params.scenario,
        blockedCorridors,
        delayedVehicles,
        weatherData: params.weatherData,
        supplies: params.supplies,
        language: params.language,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.answer && !data.fallback) {
        return data.answer;
      }
    }
  } catch {
    // Fallback below
  }

  // Deterministic intelligent answers
  const q = params.query.toLowerCase();

  if (q.includes('high-risk') || q.includes('high risk') || q.includes('corridor')) {
    const highRisk = params.corridors.filter((c) => c.riskScore > 50);
    if (highRisk.length === 0) {
      return `Currently, all monitored corridors are below the high risk threshold. Corridor NH-6 has a risk of 18% (Low) and NH-29 has 28% (Low). Weather conditions are stable.`;
    }
    return `Currently, the following corridors have elevated disruption risk:\n` +
      highRisk.map((c) => `• ${c.code} (${c.name}): Risk Score ${c.riskScore}% [${c.accessibility}]. Primary risk factors: Heavy rain saturation (${c.factorWeights.heavyRain}%) & slope instability (${c.factorWeights.slope}%). Delay estimate: +${c.estimatedDelayMinutes} mins.`).join('\n') +
      `\nRecommendation: Check the Smart Routing tab before dispatching freight.`;
  }

  if (q.includes('medicine') || q.includes('insulin') || q.includes('hospital')) {
    const medTruck = params.vehicles.find((v) => v.cargoType === 'MEDICINES');
    const medSupply = params.supplies.find((s) => s.category === 'MEDICINES');
    return `Medicine Consignment Status (TRUCK-001):\n` +
      `• Cargo: ${medTruck?.cargo}\n` +
      `• Destination: RIMS Hospital, Imphal\n` +
      `• Status: ${medTruck?.deliveryStatus} (ETA: ${medTruck?.currentEta}, Delay: +${medTruck?.delayMinutes} mins)\n` +
      `• Stock Runway: Shortage of ${medSupply?.shortage} cartons at destination.\n` +
      `• Operational Guidance: ${medTruck?.deliveryStatus === 'STOPPED' || medTruck?.deliveryStatus === 'DELAYED' ? 'Corridor is disrupted. Hold truck at Jiribam Staging Yard. If delay exceeds 8 hours, trigger emergency Indian Air Force / helicopter medical dispatch.' : 'Vehicle moving normally on route.'}`;
  }

  if (q.includes('vehicle') || q.includes('truck') || q.includes('affected')) {
    const delayed = params.vehicles.filter((v) => v.deliveryStatus !== 'ON_ROUTE');
    if (delayed.length === 0) {
      return `All 5 active simulated logistics vehicles (TRUCK-001 through TRUCK-005) are currently ON ROUTE on standard schedule with zero recorded delays.`;
    }
    return `Currently, ${delayed.length} logistics vehicles are affected by corridor disruption:\n` +
      delayed.map((v) => `• ${v.id} (${v.driver}): Cargo: ${v.cargo}. Status: ${v.deliveryStatus}. Delay: +${v.delayMinutes} mins. Staging Target: ${v.safeStagingPoint || 'Nearest Depot'}.`).join('\n');
  }

  if (q.includes('alternate') || q.includes('alternative') || q.includes('route')) {
    return `NER Smart Routing Intelligence Principle:\n` +
      `Traditional GPS maps often invent non-existent rural hill tracks when a highway is blocked. NERVES enforces verified accessibility:\n` +
      `• For NH-37 (Silchar - Imphal): NO FEASIBLE CONNECTED ALTERNATE TRUCK ROUTE exists for heavy multi-axle freight. The NH-2 via Nagaland route is also saturated.\n` +
      `• Recommended Action: HOLD VEHICLE at Jiribam Safe Staging Yard. Moving into narrow hill sections risks entrapment and secondary rockfalls.`;
  }

  if (q.includes('why') || q.includes('reason') || q.includes('factor')) {
    return `NERVES AI Risk Model evaluates 5 weighted accessibility dimensions:\n` +
      `1. Heavy Rainfall (32%): Cumulative 24-hr precipitation and intensity spikes from IMD radar.\n` +
      `2. Historical Hazards (25%): ISRO/NRSC historical landslide and flood frequency database.\n` +
      `3. Road Condition (18%): Real-time field officer inspection reports and pavement state.\n` +
      `4. Slope Angle (14%): Digital Elevation Model (DEM) slope steepness exceeding 40°.\n` +
      `5. Flood Exposure (11%): Proximity to major river discharge basins (Brahmaputra/Barak).\n` +
      `This model predicts ACCESSIBILITY DISRUPTION RISK, not certainty.`;
  }

  if (q.includes('prioritize') || q.includes('supplies') || q.includes('shortage')) {
    return `Supply Prioritization Recommendation:\n` +
      `1. MEDICINES (CRITICAL): RIMS Imphal has 180-carton shortage. Highest priority.\n` +
      `2. WATER (HIGH): 200 cases required for Kaziranga flood evacuees.\n` +
      `3. RELIEF MATERIALS (HIGH): 400 waterproof family tents for Meghalaya landslide survivors.\n` +
      `4. FOOD GRAINS (HIGH): 250 quintals rice buffer for Cachar valley.\n` +
      `Action: If corridors remain restricted, allocate designated green corridor time-slots strictly to Medicines and Potable Water.`;
  }

  return `NERVES Logistics Intelligence Assistant:\n` +
    `Current Scenario: ${params.scenario}. ${params.corridors.filter(c => c.accessibility === 'BLOCKED').length} corridors blocked, ${params.vehicles.filter(v => v.deliveryStatus !== 'ON_ROUTE').length} vehicles delayed.\n` +
    `Core Principle: "We don't just navigate roads — we predict their accessibility."\n` +
    `You can ask me about high-risk corridors, delayed medicine shipments, alternate routes, or supply prioritization.`;
}

// 3. Explainable AI: Corridor Disruption Risk Decomposition
export async function explainCorridorRisk(params: {
  corridor: Corridor;
  weatherData?: any;
  scenario?: SimulationScenario;
}): Promise<string> {
  const { corridor, weatherData, scenario } = params;

  try {
    const res = await fetch('/api/gemini/explain-risk', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ corridor, weatherData, scenario }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.explanation && !data.fallback) {
        return data.explanation;
      }
    }
  } catch {
    // fallback
  }

  // High-fidelity domain fallback
  return `EXPLAINABLE AI RISK DIAGNOSTIC — ${corridor.code} (${corridor.name})
Disruption Risk Index: ${corridor.riskScore}% [${corridor.riskLevel} Risk | ${corridor.accessibility}]

1. FACTOR WEIGHT ATTRIBUTION
• Heavy Rainfall Saturation (${corridor.factorWeights.heavyRain}% weight): ${corridor.rainfallMm} mm cumulative precipitation.
• Historical Hazards (${corridor.factorWeights.historicalHazards}% weight): ${corridor.historicalLandslidesCount} recorded slope failure events in ISRO/NRSC catalog.
• Road Condition (${corridor.factorWeights.roadCondition}% weight): Current state is "${corridor.roadCondition}".
• Slope Gradient (${corridor.factorWeights.slope}% weight): ${corridor.slopeAngleDeg}° steep hill incline.
• Flood Exposure (${corridor.factorWeights.floodExposure}% weight): ${corridor.floodExposurePct}% riverine flood vulnerability index.

2. GEOMORPHOLOGICAL ASSESSMENT
In this sector, rainfall exceeding 65mm triggers rapid pore-water pressure spikes in the weathered sedimentary strata. When combined with slope cuts > 35°, the shear strength of the embankment fails, causing recurring rock and debris slides.

3. OPERATIONAL DIRECTIVE
${corridor.recommendedAction}`;
}

// 4. Incident Prioritization
export async function prioritizeIncidents(params: {
  incidents: FieldIncident[];
  corridors: Corridor[];
  supplies: EssentialSupply[];
}): Promise<string> {
  try {
    const res = await fetch('/api/gemini/incident-prioritization', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.prioritization && !data.fallback) {
        return data.prioritization;
      }
    }
  } catch {
    // fallback
  }

  const critical = params.incidents.filter((i) => i.severity === 'CRITICAL');
  const high = params.incidents.filter((i) => i.severity === 'HIGH');

  return `AI INCIDENT DISPATCH & CLEARANCE PRIORITIZATION:
1. PRIORITY 1 (CRITICAL): ${critical.length > 0 ? critical.map((c) => `${c.roadName}: ${c.description}`).join(' | ') : 'NH-37 Makru Sector Landslide (Obstructs Emergency Medicines to Imphal)'}.
   • Action: Dispatch BRO Project Pushpak heavy mechanical earthmovers immediately. Enforce vehicle hold at Jiribam.
2. PRIORITY 2 (HIGH): ${high.length > 0 ? high.map((h) => `${h.roadName}: ${h.description}`).join(' | ') : 'NH-6 Jaintia Hills Torrential Runoff'}.
   • Action: SDRF patrol units stationed at culvert choke points. Single-file escort enabled.`;
}

// 5. Smart Routing Reasoning
export async function getSmartRoutingReasoning(params: {
  corridor: Corridor;
  selectedRoute: SmartRoute;
  weather: WeatherCondition;
  allRoutes?: SmartRoute[];
  evaluatedRoutes?: (SmartRoute & { decision?: RouteDecision })[];
  scenarioProfile?: RoutingScenarioProfile;
  vehicleProfile?: VehicleRoutingProfile;
  decision?: RouteDecision;
}): Promise<string> {
  try {
    const res = await fetch('/api/gemini/smart-routing-reasoning', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        corridor: params.corridor,
        selectedRoute: params.selectedRoute,
        allRoutes: params.allRoutes || params.evaluatedRoutes || [],
        decision: params.decision || (params.selectedRoute as any).decision,
        scenarioProfile: params.scenarioProfile || 'DISASTER_RESPONSE',
        vehicleProfile: params.vehicleProfile || 'HEAVY_TRUCK',
        weather: params.weather,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.reasoning && !data.fallback) {
        return data.reasoning;
      }
    }
  } catch {
    // fallback to deterministic calculation
  }

  // If evaluated decision is available, use dynamic deterministic reasoning generator
  if (params.evaluatedRoutes && params.evaluatedRoutes.length > 0) {
    const recommended =
      params.evaluatedRoutes.find((r) => r.decision?.operationalStatus === 'RECOMMENDED') ||
      (params.evaluatedRoutes[0] as any);
    if (recommended && recommended.decision) {
      return generateDeterministicReasoning(
        recommended as any,
        params.evaluatedRoutes as any,
        params.scenarioProfile || 'DISASTER_RESPONSE',
        params.vehicleProfile || 'HEAVY_TRUCK'
      );
    }
  }

  if (params.corridor.accessibility === 'BLOCKED') {
    return `SMART ROUTING REASONING:
• WHY NO ALTERNATE: Consumer GPS applications frequently invent non-existent rural bypasses over unpaved hill tracks. For heavy freight (TRUCK-001 carrying life-saving medicines), these unpaved tracks have 2000m+ elevation gain, mud slurries, and zero bridge weight clearance.
• SAFE STAGING DIRECTIVE: Diverting to Jiribam Border Safe Staging Yard is the only operationally safe choice. Moving into narrow hill cuts guarantees entrapment.`;
  }

  return `SMART ROUTING REASONING:
• ROUTE FEASIBILITY: Highway ${params.corridor.code} is currently rated as ${params.corridor.accessibility} with an estimated delay of +${params.corridor.estimatedDelayMinutes} mins.
• DISPATCH ADVISORY: Convoy may proceed under routine monitoring with speed restriction on ghat sections.`;
}

// 6. Supply Prioritization
export async function prioritizeSupplies(params: {
  supplies: EssentialSupply[];
  delayedVehicles?: Vehicle[];
  blockedCorridors?: string[];
  vehicles?: Vehicle[];
  corridors?: Corridor[];
}): Promise<string> {
  const delayedVehicles =
    params.delayedVehicles ||
    (params.vehicles
      ? params.vehicles.filter((v) => v.deliveryStatus === 'DELAYED' || v.deliveryStatus === 'STOPPED')
      : []);
  const blockedCorridors =
    params.blockedCorridors ||
    (params.corridors
      ? params.corridors
          .filter((c) => c.accessibility === 'BLOCKED' || c.accessibility === 'RESTRICTED')
          .map((c) => `${c.code} (${c.name})`)
      : ['NH-37']);

  try {
    const res = await fetch('/api/gemini/supply-prioritization', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        supplies: params.supplies,
        delayedVehicles,
        blockedCorridors,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.analysis && !data.fallback) {
        return data.analysis;
      }
    }
  } catch {
    // fallback
  }

  return `ESSENTIAL SUPPLY TRIAGE RUNWAY ANALYSIS:
1. MEDICAL CONSIGNMENTS (CRITICAL): RIMS Hospital Imphal has only 2-day reserve runway for Trauma IV fluids and insulin. TRUCK-001 must be held at Jiribam until single-lane clearance is achieved. If delay exceeds 8 hours, trigger IAF helicopter airlift from Kumbhirgram (Silchar).
2. POTABLE WATER (HIGH): Flood evacuees in Kaziranga/Bokakhat require urgent water tankers.
3. RELIEF SHELTERS (MEDIUM): Waterproof family tents for landslide-displaced families in Meghalaya.`;
}

// 7. Emergency Recommendations
export async function getEmergencyRecommendations(params: {
  scenario: SimulationScenario;
  corridors: Corridor[];
  vehicles: Vehicle[];
  incidents: FieldIncident[];
  weather: WeatherCondition;
}): Promise<string> {
  try {
    const res = await fetch('/api/gemini/emergency-recommendations', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.recommendations && !data.fallback) {
        return data.recommendations;
      }
    }
  } catch {
    // fallback
  }

  return `MULTI-AGENCY STATE EMERGENCY DIRECTIVES (${params.scenario}):
1. BRO / NHIDCL: Deploy Taskforce Project Pushpak hydraulic excavators to Makru bridgehead. Continuous rock clearing on NH-37.
2. POLICE & TRAFFIC: Enforce convoy freeze at Jiribam checkpost. Zero unauthorized civilian vehicles on ghat sections.
3. HEALTH DEPARTMENT: Audit local cold-storage units in Imphal and Silchar depots.
4. SDRF / NDRF: Pre-position inflatable motorized rescue rafts at Numaligarh and Cachar river staging grounds.`;
}

// 8. What-If Stress Scenario AI Analysis
export async function generateWhatIfAnalysis(params: {
  scenarioState: any;
  baselineRisk: number;
  corridors: Corridor[];
  vehicles: Vehicle[];
  language?: string;
}): Promise<string> {
  try {
    const res = await fetch('/api/gemini/what-if', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.analysis && !data.fallback) {
        return data.analysis;
      }
    }
  } catch {
    // fallback below
  }

  return `### WHAT-IF STRESS SIMULATION REPORT (NER LOGISTICS)
1. CASCADING REGIONAL LOGISTICAL IMPACT:
Severing the NH-37 Makru sector cuts off 85% of motorized heavy freight access to the Imphal Valley. Diversions via NH-2 (Dimapur–Kohima–Imphal) add +14 hours and operate at 140% capacity, exceeding safe structural axle load limits on hill hairpin sections.

2. SUPPLY FAILURE POINT:
• Emergency Insulin & Cold-Chain Trauma Kits: 34-hour regional hospital runway remaining before critical depletion at RIMS Hospital.
• Drinking Water & Grains: 72-hour district buffer at designated relief camps.

3. SAFE STAGING DIRECTIVE:
Halt all heavy trucks at Jiribam Border Safe Staging Point. Under zero circumstances should convoys attempt unverified Tamenglong dirt tracks. Maintain engine idle rotations for cold-chain generators.

4. AIRLIFT TRIGGER THRESHOLD:
If ground clearance exceeds 18 hours, initiate Indian Air Force AN-32 / Mi-17 heavy-lift coordination from Kumbhirgram (Silchar Airport) to Tulihal (Imphal Airport).`;
}

// 9. After-Action Report (AAR) Operational Debrief
export async function generateAfterActionReport(params: {
  metrics: any;
  scenario: SimulationScenario;
  corridors: Corridor[];
  language?: string;
}): Promise<string> {
  try {
    const res = await fetch('/api/gemini/after-action-report', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.report && !data.fallback) {
        return data.report;
      }
    }
  } catch {
    // fallback below
  }

  return `===================================================================
STATE DISASTER MANAGEMENT AUTHORITY (SDMA) — AFTER-ACTION REPORT (AAR)
Incident Cycle Evaluation | Regional Lifeline Protection (SIH26002)
===================================================================

1. EXECUTIVE MISSION SUMMARY
During the ${params.scenario} scenario, NERVES coordinated proactive multi-agency accessibility monitoring across 6 strategic arterial corridors. Predictive risk indexing enabled zero vehicle losses and safe staging of heavy medical freight ahead of slope failure.

2. KEY OPERATIONAL SUCCESSES
• Safe Staging Adherence: 100% of freight vehicles bound for NH-37 halted safely at Jiribam Safe Staging Yard, preventing entrapment under active rockfall.
• Ground Telemetry Verification: Field responders successfully geotagged 3 slope failures with photo evidence, updating the regional GIS within 4 minutes of observation.
• Cold-Chain Preservation: Emergency insulin consignments remained at 4°C with continuous auxiliary generator telemetry.

3. IDENTIFIED BOTTLENECKS & RESIDUAL CHALLENGES
• Narrow single-point choke-point at Makru Bridge remains highly vulnerable to continuous orographic monsoon downpours.
• Communication dead zones along NH-37 between km 82 and km 114 required local offline report queuing.

4. INFRASTRUCTURE & DISPATCH RECOMMENDATIONS
• Recommend permanent pre-positioning of heavy BRO Project Pushpak earthmovers at Noney and Jiribam bridgeheads before monsoon onset.
• Establish secondary satellite backup transceiver stations at Jiribam Border checkpost.`;
}
