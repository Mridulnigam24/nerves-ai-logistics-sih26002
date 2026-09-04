import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Corridor,
  Vehicle,
  EssentialSupply,
  FieldIncident,
  AlertItem,
  SimulationScenario,
  UserRole,
  WeatherCondition,
} from '../types';

let supabaseInstance: SupabaseClient | null = null;
let isConfigLoaded = false;
let isSupabaseAvailable = false;

// Attempt to load Supabase configuration from server or env
export async function initSupabase(): Promise<SupabaseClient | null> {
  if (isConfigLoaded && supabaseInstance) {
    return supabaseInstance;
  }

  let url = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  let key = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  // If not found in client env, fetch from server configuration API
  if (!url || !key) {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        url = data.supabaseUrl || url;
        key = data.supabasePublishableKey || key;
      }
    } catch {
      // Server might be starting or offline
    }
  }

  if (url && key && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      isSupabaseAvailable = true;
      console.log('Supabase client initialized successfully with project endpoint');
    } catch (e) {
      console.warn('Supabase initialization failed, falling back to local persistence', e);
      isSupabaseAvailable = false;
    }
  } else {
    console.info('Supabase credentials not fully configured, utilizing high-performance offline/localStorage persistence');
    isSupabaseAvailable = false;
  }

  isConfigLoaded = true;
  return supabaseInstance;
}

export function getSupabaseStatus(): { configured: boolean; isOnline: boolean } {
  return {
    configured: isSupabaseAvailable,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };
}

// ----------------------------------------------------
// Table Names
// ----------------------------------------------------
const TABLES = {
  INCIDENTS: 'nerves_incidents',
  VEHICLES: 'nerves_vehicles',
  SUPPLIES: 'nerves_supplies',
  ALERTS: 'nerves_alerts',
  CORRIDORS: 'nerves_corridors',
  SIMULATION: 'nerves_simulation_state',
  USERS: 'nerves_user_profiles',
};

// ----------------------------------------------------
// Offline Storage Keys
// ----------------------------------------------------
const STORAGE_KEYS = {
  CORRIDORS: 'nerves_cache_corridors',
  VEHICLES: 'nerves_cache_vehicles',
  SUPPLIES: 'nerves_cache_supplies',
  INCIDENTS: 'nerves_cache_incidents',
  ALERTS: 'nerves_cache_alerts',
  SIMULATION: 'nerves_cache_simulation',
  USER_ROLE: 'nerves_cache_user_role',
  OFFLINE_QUEUE: 'nerves_offline_queue',
};

// ----------------------------------------------------
// Persistence Handlers with Offline Graceful Fallback
// ----------------------------------------------------

export async function persistIncidents(incidents: FieldIncident[]): Promise<void> {
  // Always save locally first
  try {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  } catch {
    // ignore
  }

  const client = await initSupabase();
  if (!client || !isSupabaseAvailable) return;

  try {
    const formatted = incidents.slice(0, 50).map((inc) => ({
      id: inc.id,
      incident_type: inc.incidentType,
      severity: inc.severity,
      coordinates: inc.coordinates,
      road_name: inc.roadName,
      corridor_id: inc.corridorId || null,
      accessibility: inc.accessibility,
      description: inc.description,
      reported_by: inc.reportedBy,
      status: inc.status,
      timestamp: inc.timestamp,
    }));

    await client.from(TABLES.INCIDENTS).upsert(formatted, { onConflict: 'id' });
  } catch (err) {
    console.debug('Supabase incident upsert notice (fallback to local state)', err);
  }
}

export async function persistVehicles(vehicles: Vehicle[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  } catch {
    // ignore
  }

  const client = await initSupabase();
  if (!client || !isSupabaseAvailable) return;

  try {
    const formatted = vehicles.map((v) => ({
      id: v.id,
      type: v.type,
      driver: v.driver,
      driver_phone: v.driverPhone,
      cargo: v.cargo,
      cargo_type: v.cargoType,
      destination: v.destination,
      delivery_status: v.deliveryStatus,
      delay_minutes: v.delayMinutes,
      current_eta: v.currentEta,
      safe_staging_point: v.safeStagingPoint || null,
      risk_score: v.riskScore,
    }));

    await client.from(TABLES.VEHICLES).upsert(formatted, { onConflict: 'id' });
  } catch (err) {
    console.debug('Supabase vehicle sync notice', err);
  }
}

export async function persistSupplies(supplies: EssentialSupply[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.SUPPLIES, JSON.stringify(supplies));
  } catch {
    // ignore
  }

  const client = await initSupabase();
  if (!client || !isSupabaseAvailable) return;

  try {
    const formatted = supplies.map((s) => ({
      id: s.id,
      category: s.category,
      name: s.name,
      required_qty: s.requiredQty,
      available_qty: s.availableQty,
      unit: s.unit,
      shortage: s.shortage,
      priority: s.priority,
      destination: s.destination,
    }));

    await client.from(TABLES.SUPPLIES).upsert(formatted, { onConflict: 'id' });
  } catch (err) {
    console.debug('Supabase supplies sync notice', err);
  }
}

export async function persistCorridors(corridors: Corridor[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.CORRIDORS, JSON.stringify(corridors));
  } catch {
    // ignore
  }

  const client = await initSupabase();
  if (!client || !isSupabaseAvailable) return;

  try {
    const formatted = corridors.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      state: c.state,
      accessibility: c.accessibility,
      risk_score: c.riskScore,
      risk_level: c.riskLevel,
      rainfall_mm: c.rainfallMm,
      road_condition: c.roadCondition,
      recommended_action: c.recommendedAction,
    }));

    await client.from(TABLES.CORRIDORS).upsert(formatted, { onConflict: 'id' });
  } catch (err) {
    console.debug('Supabase corridors sync notice', err);
  }
}

export async function persistSimulationState(
  scenario: SimulationScenario,
  emergencyMode: boolean,
  weather: WeatherCondition
): Promise<void> {
  try {
    localStorage.setItem(
      STORAGE_KEYS.SIMULATION,
      JSON.stringify({ scenario, emergencyMode, weather, timestamp: new Date().toISOString() })
    );
  } catch {
    // ignore
  }

  const client = await initSupabase();
  if (!client || !isSupabaseAvailable) return;

  try {
    await client.from(TABLES.SIMULATION).upsert(
      {
        id: 'current_simulation',
        scenario,
        emergency_mode: emergencyMode,
        weather,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.debug('Supabase simulation state sync notice', err);
  }
}

export async function persistUserRole(role: UserRole): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  } catch {
    // ignore
  }

  const client = await initSupabase();
  if (!client || !isSupabaseAvailable) return;

  try {
    await client.from(TABLES.USERS).upsert(
      {
        user_id: 'default_operator',
        active_role: role,
        last_active: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  } catch (err) {
    console.debug('Supabase user role sync notice', err);
  }
}

export async function syncOfflineQueueToSupabase(queue: FieldIncident[]): Promise<FieldIncident[]> {
  if (queue.length === 0) return [];

  const client = await initSupabase();
  if (!client || !isSupabaseAvailable) {
    // Keep in offline queue
    return queue;
  }

  try {
    const records = queue.map((inc) => ({
      id: inc.id,
      incident_type: inc.incidentType,
      severity: inc.severity,
      coordinates: inc.coordinates,
      road_name: inc.roadName,
      corridor_id: inc.corridorId || null,
      accessibility: inc.accessibility,
      description: inc.description,
      reported_by: inc.reportedBy,
      status: 'VERIFIED',
      timestamp: inc.timestamp,
    }));

    const { error } = await client.from(TABLES.INCIDENTS).insert(records);
    if (!error) {
      console.log(`Successfully synchronized ${queue.length} offline field incident reports to Supabase`);
      return []; // queue cleared
    }
  } catch (err) {
    console.warn('Offline sync to Supabase failed, maintaining local offline buffer', err);
  }

  return queue;
}
