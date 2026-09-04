import React, { useEffect, useRef, useState } from 'react';
import { useNerves } from '../../context/NervesContext';
import { StatusPill } from '../common/StatusPill';
import { RiskBadge } from '../common/RiskBadge';
import { AuditOverrideModal } from '../common/AuditOverrideModal';
import { canPerformRoadOverride } from '../../services/rbac';
import {
  Layers,
  Truck,
  Building2,
  AlertTriangle,
  Hospital,
  Shield,
  Maximize2,
  Navigation,
  Info,
  MapPin,
  Flame,
  CloudRain,
  Eye,
  SlidersHorizontal,
  WifiOff,
} from 'lucide-react';
import { Corridor } from '../../types';

export const NervesGISMap: React.FC = () => {
  const {
    corridors,
    vehicles,
    incidents,
    pois,
    selectedCorridorId,
    setSelectedCorridorId,
    selectedVehicleId,
    setSelectedVehicleId,
    selectedIncidentId,
    setSelectedIncidentId,
    simulationScenario,
    emergencyMode,
    offlineMode,
    currentRole,
    t,
  } = useNerves();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const corridorsGroupRef = useRef<any>(null);

  // Layer Toggles
  const [layers, setLayers] = useState({
    roadNetwork: true,
    accessibility: true,
    floodRisk: true,
    landslideRisk: true,
    vehicles: true,
    incidents: true,
    hospitals: true,
    reliefCenters: true,
    warehouses: true,
    stagingPoints: true,
  });

  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [overrideModalCorridor, setOverrideModalCorridor] = useState<Corridor | null>(null);

  const selectedCorridor = corridors.find((c) => c.id === selectedCorridorId);
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || leafletMapRef.current) return;

      try {
        const L = await import('leaflet');

        if (!isMounted || !mapContainerRef.current) return;

        // Default center on Guwahati / NER region
        const map = L.map(mapContainerRef.current, {
          center: [25.8, 92.8],
          zoom: 7,
          minZoom: 6,
          maxZoom: 14,
          zoomControl: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Standard OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const corridorGroup = L.layerGroup().addTo(map);
        const markerGroup = L.layerGroup().addTo(map);

        corridorsGroupRef.current = corridorGroup;
        markersGroupRef.current = markerGroup;
        leafletMapRef.current = map;
      } catch (e) {
        console.error('Leaflet map initialization error', e);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Polylines and Markers when data or layers change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !corridorsGroupRef.current || !markersGroupRef.current) return;

    import('leaflet').then((L) => {
      corridorsGroupRef.current.clearLayers();
      markersGroupRef.current.clearLayers();

      // 1. Draw Corridors
      if (layers.roadNetwork || layers.accessibility) {
        corridors.forEach((corridor) => {
          let color = '#10b981'; // green for accessible
          let weight = 5;
          let dashArray = undefined;

          if (corridor.accessibility === 'RESTRICTED') {
            color = '#f59e0b'; // orange/amber
            weight = 6;
          } else if (corridor.accessibility === 'BLOCKED') {
            color = '#ef4444'; // red
            weight = 7;
            dashArray = '8, 8';
          }

          if (selectedCorridorId === corridor.id) {
            weight += 3;
          }

          const polyline = L.polyline(corridor.coordinates as any, {
            color,
            weight,
            opacity: 0.9,
            dashArray,
          });

          polyline.on('click', () => {
            setSelectedCorridorId(corridor.id);
            setSelectedVehicleId(null);
            setSelectedIncidentId(null);
          });

          polyline.bindTooltip(
            `<div class="font-sans text-xs font-semibold p-1">
              <span class="font-bold text-cyan-400">${corridor.code}:</span> ${corridor.name}<br/>
              Status: <span class="${
                corridor.accessibility === 'ACCESSIBLE'
                  ? 'text-emerald-400'
                  : corridor.accessibility === 'RESTRICTED'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }">${corridor.accessibility}</span> (Risk: ${corridor.riskScore}%)
            </div>`,
            { sticky: true, className: 'leaflet-dark-tooltip' }
          );

          corridorGroup.addLayer(polyline);
        });
      }

      // 2. Draw Vehicles
      if (layers.vehicles) {
        vehicles.forEach((vehicle) => {
          const isSelected = selectedVehicleId === vehicle.id;
          const statusBg =
            vehicle.deliveryStatus === 'ON_ROUTE'
              ? 'bg-emerald-500'
              : vehicle.deliveryStatus === 'STOPPED' || vehicle.deliveryStatus === 'EMERGENCY'
              ? 'bg-rose-500 animate-pulse'
              : 'bg-amber-500';

          const iconHtml = `
            <div class="relative cursor-pointer flex items-center justify-center">
              <div class="w-8 h-8 rounded-full ${statusBg} text-slate-950 flex items-center justify-center font-bold text-xs shadow-lg border-2 ${
            isSelected ? 'border-cyan-300 scale-125' : 'border-slate-900'
          }">
                🚛
              </div>
              <span class="absolute -bottom-4 bg-slate-950 text-slate-100 font-mono text-[9px] px-1 py-0.2 rounded border border-slate-700 whitespace-nowrap shadow">
                ${vehicle.id}
              </span>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'vehicle-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker(vehicle.currentCoordinates as any, { icon: customIcon });
          marker.on('click', () => {
            setSelectedVehicleId(vehicle.id);
            setSelectedCorridorId(vehicle.corridorId);
            setSelectedIncidentId(null);
          });

          markersGroup.addLayer(marker);
        });
      }

      // 3. Draw Incidents
      if (layers.incidents) {
        incidents.forEach((incident) => {
          const isSelected = selectedIncidentId === incident.id;
          const iconType = incident.incidentType === 'Landslide' ? '⚠️' : incident.incidentType === 'Flood' ? '🌊' : '⛔';

          const iconHtml = `
            <div class="cursor-pointer flex items-center justify-center">
              <div class="w-7 h-7 rounded-full bg-rose-950 border border-rose-500 text-rose-300 flex items-center justify-center text-xs shadow-xl ${
                incident.severity === 'CRITICAL' ? 'animate-bounce' : ''
              } ${isSelected ? 'ring-2 ring-cyan-400' : ''}">
                ${iconType}
              </div>
            </div>
          `;

          const divIcon = L.divIcon({
            html: iconHtml,
            className: 'incident-marker',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker(incident.coordinates as any, { icon: divIcon });
          marker.on('click', () => {
            setSelectedIncidentId(incident.id);
            if (incident.corridorId) setSelectedCorridorId(incident.corridorId);
          });

          markersGroup.addLayer(marker);
        });
      }

      // 4. Draw POIs (Hospitals, Safe Staging Points, Warehouses, Relief Centers)
      pois.forEach((poi) => {
        let shouldShow = false;
        let badgeIcon = '🏥';
        let badgeBg = 'bg-blue-600';

        if (poi.type === 'HOSPITAL' && layers.hospitals) {
          shouldShow = true;
          badgeIcon = '🏥';
          badgeBg = 'bg-blue-600';
        } else if (poi.type === 'SAFE_STAGING_POINT' && layers.stagingPoints) {
          shouldShow = true;
          badgeIcon = '🛡️';
          badgeBg = 'bg-emerald-600';
        } else if (poi.type === 'WAREHOUSE' && layers.warehouses) {
          shouldShow = true;
          badgeIcon = '🏬';
          badgeBg = 'bg-indigo-600';
        } else if (poi.type === 'RELIEF_CENTER' && layers.reliefCenters) {
          shouldShow = true;
          badgeIcon = '⛺';
          badgeBg = 'bg-amber-600';
        }

        if (shouldShow) {
          const poiHtml = `
            <div class="cursor-pointer group relative">
              <div class="w-6 h-6 rounded-md ${badgeBg} text-white flex items-center justify-center text-[11px] shadow-md border border-slate-900">
                ${badgeIcon}
              </div>
            </div>
          `;

          const poiIcon = L.divIcon({
            html: poiHtml,
            className: 'poi-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const marker = L.marker(poi.coordinates as any, { icon: poiIcon });
          marker.bindTooltip(`<b>${poi.name}</b><br/>${poi.capacity}<br/>Status: ${poi.status}`, {
            direction: 'top',
          });
          markersGroup.addLayer(marker);
        }
      });
    });

    const corridorGroup = corridorsGroupRef.current;
    const markersGroup = markersGroupRef.current;
  }, [corridors, vehicles, incidents, pois, layers, selectedCorridorId, selectedVehicleId, selectedIncidentId]);

  // Center on selected corridor if changed
  useEffect(() => {
    if (selectedCorridor && leafletMapRef.current) {
      const midCoord = selectedCorridor.coordinates[Math.floor(selectedCorridor.coordinates.length / 2)];
      if (midCoord) {
        leafletMapRef.current.flyTo(midCoord, 8, { duration: 0.8 });
      }
    }
  }, [selectedCorridorId]);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[580px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-xl flex flex-col md:flex-row">
      {/* Map Canvas */}
      <div className="relative flex-1 h-full min-h-[400px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top Floating Bar: Scenario Status & Disclaimer */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 max-w-xl pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-semibold text-slate-200">GIS Engine: North Eastern Region (8 States)</span>
            <span className="text-slate-500">|</span>
            <span className="text-[11px] font-mono text-cyan-300">EPSG:4326</span>
          </div>

          {offlineMode && (
            <div className="bg-amber-950/95 border border-amber-500/80 px-3 py-1.5 rounded-lg text-xs text-amber-200 font-bold flex items-center gap-2 shadow-lg backdrop-blur animate-in fade-in">
              <WifiOff className="w-4 h-4 text-amber-400" />
              <span>OFFLINE MAP — LAST KNOWN / DEMO GEOGRAPHIC DATA</span>
            </div>
          )}

          <div className="bg-amber-950/80 backdrop-blur border border-amber-500/40 px-2.5 py-1 rounded-md text-[11px] text-amber-200 flex items-center gap-1 font-medium shadow">
            <Info className="w-3.5 h-3.5" />
            <span>Prototype Simulation Data</span>
          </div>

          {emergencyMode && (
            <div className="bg-rose-950/90 backdrop-blur border border-rose-500/60 px-2.5 py-1 rounded-md text-[11px] text-rose-200 font-bold flex items-center gap-1.5 shadow animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>EMERGENCY DISPATCH PROTOCOL ACTIVE</span>
            </div>
          )}
        </div>

        {/* Map Controls: Layer Toggle & Reset View */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`p-2.5 rounded-lg border shadow-lg backdrop-blur transition-all flex items-center gap-1.5 text-xs font-semibold ${
              showLayerPanel
                ? 'bg-cyan-600 text-white border-cyan-400'
                : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title="Toggle GIS Layers"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">GIS Layers</span>
          </button>

          <button
            onClick={() => {
              if (leafletMapRef.current) {
                leafletMapRef.current.flyTo([25.8, 92.8], 7);
              }
            }}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg shadow-lg backdrop-blur text-xs flex items-center justify-center"
            title="Reset Map Center"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Layer Toggle Floating Drawer */}
        {showLayerPanel && (
          <div className="absolute top-16 right-4 z-20 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                Active GIS Overlays
              </span>
              <button onClick={() => setShowLayerPanel(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {[
                { key: 'roadNetwork', label: 'Road Network & Highways', icon: '🛣️' },
                { key: 'accessibility', label: 'Accessibility Status Color', icon: '🟢' },
                { key: 'vehicles', label: 'Live Logistics Freight (5 Trucks)', icon: '🚛' },
                { key: 'incidents', label: 'Field Incident Reports', icon: '⚠️' },
                { key: 'stagingPoints', label: 'Safe Staging Points & Depots', icon: '🛡️' },
                { key: 'hospitals', label: 'District Hospitals & Trauma Centers', icon: '🏥' },
                { key: 'reliefCenters', label: 'Evacuation & Relief Camps', icon: '⛺' },
                { key: 'warehouses', label: 'FCI & Essential Warehouses', icon: '🏬' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 cursor-pointer text-slate-300"
                >
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={(layers as any)[item.key]}
                    onChange={(e) => setLayers({ ...layers, [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700 focus:ring-0 focus:ring-offset-0"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Map Legend Overlay at Bottom-Left */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg px-3 py-2 text-[11px] shadow-lg flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-sm bg-emerald-500" />
            <span className="text-slate-300">Accessible Road</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-sm bg-amber-500" />
            <span className="text-slate-300">Restricted Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-sm bg-rose-500" />
            <span className="text-slate-300">Blocked / Severed</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-xs">🛡️</span>
            <span className="text-slate-400">Safe Staging Point</span>
          </div>
        </div>
      </div>

      {/* Right Drawer / Inspector Panel */}
      <div className="w-full md:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col h-full overflow-y-auto p-4 space-y-4">
        {/* If a Corridor is Selected */}
        {selectedCorridor ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-cyan-400 font-bold text-xs bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                  {selectedCorridor.code}
                </span>
                <h3 className="font-bold text-slate-100 text-sm mt-1">{selectedCorridor.name}</h3>
                <p className="text-xs text-slate-400">{selectedCorridor.state} • {selectedCorridor.lengthKm} km</p>
              </div>
              <button
                onClick={() => setSelectedCorridorId(null)}
                className="text-slate-400 hover:text-slate-200 text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* Status & Risk Pill */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Accessibility</span>
                <StatusPill status={selectedCorridor.accessibility} />
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Disruption Risk</span>
                <RiskBadge score={selectedCorridor.riskScore} level={selectedCorridor.riskLevel} />
              </div>
            </div>

            {/* Operational Impact Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">24h Rainfall:</span>
                <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                  {selectedCorridor.rainfallMm} mm
                </span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Estimated Delay:</span>
                <span className="font-bold text-amber-400 mt-0.5 block">
                  +{selectedCorridor.estimatedDelayMinutes} mins
                </span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Slope Steepness:</span>
                <span className="font-bold text-slate-200 mt-0.5 block">
                  {selectedCorridor.slopeAngleDeg}° Grade
                </span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Historical Landslides:</span>
                <span className="font-bold text-slate-200 mt-0.5 block">
                  {selectedCorridor.historicalLandslidesCount} events
                </span>
              </div>
            </div>

            {/* Latest Ground Report */}
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block">
                Latest Ground Report
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedCorridor.latestFieldReport || 'No reports logged in the last 6 hours.'}
              </p>
            </div>

            {/* Operational Directive */}
            <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-500/30 space-y-1">
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                Recommended Logistics Action
              </span>
              <p className="text-xs text-amber-200 font-medium">
                {selectedCorridor.recommendedAction}
              </p>
            </div>

            {/* Alternate Route Status */}
            <div className="p-3 rounded-lg border bg-slate-950 border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Connected Alternate Route:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedCorridor.alternativeRouteAvailable
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {selectedCorridor.alternativeRouteAvailable ? 'AVAILABLE' : 'NO FEASIBLE ROUTE'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                {selectedCorridor.alternateRouteSummary}
              </p>
            </div>

            {/* Human Override Action Button */}
            {canPerformRoadOverride(currentRole) && (
              <button
                onClick={() => setOverrideModalCorridor(selectedCorridor)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-slate-100 flex items-center justify-center gap-1.5 shadow"
              >
                <Shield className="w-4 h-4 text-cyan-400" />
                Government Override AI Recommendation
              </button>
            )}
          </div>
        ) : selectedVehicle ? (
          /* If a Vehicle is Selected */
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-cyan-400 font-bold text-xs bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                  {selectedVehicle.id}
                </span>
                <h3 className="font-bold text-slate-100 text-sm mt-1">{selectedVehicle.type}</h3>
                <p className="text-xs text-slate-400">Driver: {selectedVehicle.driver} ({selectedVehicle.driverPhone})</p>
              </div>
              <button onClick={() => setSelectedVehicleId(null)} className="text-slate-400 hover:text-slate-200 text-xs p-1">
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cargo:</span>
                <span className="font-semibold text-slate-100 text-right">{selectedVehicle.cargo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Category:</span>
                <span className="font-mono text-cyan-400 font-semibold">{selectedVehicle.cargoType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Origin → Destination:</span>
                <span className="text-slate-200 font-medium text-right text-[11px]">
                  {selectedVehicle.origin} → {selectedVehicle.destination}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-mono font-bold text-amber-300">{selectedVehicle.deliveryStatus}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current ETA:</span>
                <span className="font-bold text-slate-100">{selectedVehicle.currentEta}</span>
              </div>
              {selectedVehicle.delayMinutes > 0 && (
                <div className="flex justify-between items-center text-rose-400">
                  <span>Recorded Delay:</span>
                  <span className="font-bold">+{selectedVehicle.delayMinutes} mins</span>
                </div>
              )}
            </div>

            {selectedVehicle.delayReason && (
              <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-rose-300 block">Delay Explanation</span>
                <p className="text-slate-300">{selectedVehicle.delayReason}</p>
              </div>
            )}

            {selectedVehicle.safeStagingPoint && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-emerald-300 block">Designated Safe Staging Point</span>
                <p className="text-slate-200 font-medium">🛡️ {selectedVehicle.safeStagingPoint}</p>
              </div>
            )}
          </div>
        ) : selectedIncident ? (
          /* If an Incident is Selected */
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-rose-400 font-bold text-xs bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">
                  {selectedIncident.id}
                </span>
                <h3 className="font-bold text-slate-100 text-sm mt-1">{selectedIncident.incidentType} Alert</h3>
                <p className="text-xs text-slate-400">{selectedIncident.roadName}</p>
              </div>
              <button onClick={() => setSelectedIncidentId(null)} className="text-slate-400 hover:text-slate-200 text-xs p-1">
                ✕
              </button>
            </div>

            {selectedIncident.photoUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-800">
                <img
                  src={selectedIncident.photoUrl}
                  alt="Incident Evidence"
                  className="w-full h-36 object-cover"
                />
                <div className="p-1.5 bg-slate-950 text-[10px] text-slate-400 text-center">
                  Geo-Tagged Field Photo Evidence (Verified Coordinates)
                </div>
              </div>
            )}

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Severity:</span>
                <span className="font-bold text-rose-400">{selectedIncident.severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reported By:</span>
                <span className="text-slate-200">{selectedIncident.reportedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Designation:</span>
                <span className="text-slate-300 text-[11px]">{selectedIncident.officerDesignation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-mono font-bold text-cyan-400">{selectedIncident.status}</span>
              </div>
              <p className="pt-2 border-t border-slate-800 text-slate-300 text-xs leading-relaxed">
                {selectedIncident.description}
              </p>
            </div>
          </div>
        ) : (
          /* Default Empty State */
          <div className="h-full flex flex-col justify-center items-center text-center text-slate-400 p-6 space-y-3">
            <MapPin className="w-10 h-10 text-cyan-500/60 animate-pulse" />
            <h4 className="font-bold text-slate-200 text-sm">Interactive GIS Inspector</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click on any highway corridor polyline, vehicle truck icon, or field incident marker on the map to inspect live accessibility metrics and operational actions.
            </p>
            <div className="pt-4 border-t border-slate-800 w-full space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Quick Focus Corridor:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {corridors.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCorridorId(c.id)}
                    className="p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs"
                  >
                    <span className="font-mono text-cyan-400 font-bold block">{c.code}</span>
                    <span className="text-[10px] text-slate-400 truncate block">{c.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Human Override Modal */}
      {overrideModalCorridor && (
        <AuditOverrideModal
          corridor={overrideModalCorridor}
          onClose={() => setOverrideModalCorridor(null)}
        />
      )}
    </div>
  );
};
