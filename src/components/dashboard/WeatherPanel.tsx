import React, { useState } from 'react';
import { useNerves } from '../../context/NervesContext';
import { WeatherData } from '../../types';
import {
  CloudRain,
  CloudLightning,
  Sun,
  Cloud,
  Droplets,
  Wind,
  RefreshCw,
  AlertTriangle,
  Radio,
  ExternalLink,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const WeatherPanel: React.FC = () => {
  const { weatherList, refreshWeather, isWeatherLoading, weatherSource, setSelectedCorridorId } = useNerves();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const getWeatherIcon = (condition?: string, rainMm?: number) => {
    if ((rainMm && rainMm > 80) || condition === 'Thunderstorm') {
      return <CloudLightning className="w-5 h-5 text-amber-400" />;
    }
    if ((rainMm && rainMm > 40) || condition === 'Rain') {
      return <CloudRain className="w-5 h-5 text-blue-400" />;
    }
    if (condition === 'Clear') {
      return <Sun className="w-5 h-5 text-amber-300" />;
    }
    return <Cloud className="w-5 h-5 text-slate-400" />;
  };

  const getIntensityBadge = (intensity: string) => {
    if (intensity === 'Extreme Cloudburst') {
      return (
        <span className="bg-rose-950 text-rose-300 border border-rose-600/40 text-[10px] font-mono font-black px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          CLOUDBURST
        </span>
      );
    }
    if (intensity === 'Heavy') {
      return (
        <span className="bg-amber-950 text-amber-300 border border-amber-600/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
          HEAVY RAIN
        </span>
      );
    }
    if (intensity === 'Moderate') {
      return (
        <span className="bg-blue-950 text-blue-300 border border-blue-600/40 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
          MODERATE
        </span>
      );
    }
    return (
      <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-full">
        LIGHT
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h4 className="font-bold text-slate-100 text-sm tracking-wide uppercase">
              Live Meteorological Telemetry (8 North Eastern Capitals & Sectors)
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time radar precipitation feeds directly into AI Slope Saturation, Corridor Risk Scoring, and Smart Routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {weatherSource || 'OpenWeather Live Feed'}
          </span>

          <button
            onClick={refreshWeather}
            disabled={isWeatherLoading}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
            title="Refresh OpenWeather telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isWeatherLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 8-City Weather Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {weatherList.map((item, idx) => {
          const isSelected = selectedCity === item.city;
          return (
            <div
              key={idx}
              onClick={() => setSelectedCity(isSelected ? null : item.city || item.state)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                  : 'bg-slate-950/70 hover:bg-slate-800/50 border-slate-800/90'
              }`}
            >
              {/* City Title & Condition */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold text-slate-100 text-xs">{item.city || item.state}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[130px]">
                    {item.state}
                  </span>
                </div>
                <div>{getWeatherIcon(item.weatherCondition, item.rainfallMm24h)}</div>
              </div>

              {/* Temp & Rain Stats */}
              <div className="flex items-baseline justify-between pt-1 border-t border-slate-800/60">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black font-mono text-slate-100">{item.temperatureC}°</span>
                  <span className="text-[10px] text-slate-400">C</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">24h Rain</span>
                  <span className="font-mono text-xs font-black text-cyan-300">
                    {item.rainfallMm24h} <span className="text-[9px] font-normal text-slate-400">mm</span>
                  </span>
                </div>
              </div>

              {/* Humidity & Wind */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-400" />
                  {item.humidityPct}%
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3 text-slate-400" />
                  {item.windSpeedKmh || 12} km/h
                </span>
              </div>

              {/* Intensity & Alert Banner */}
              <div className="pt-1 flex items-center justify-between gap-1">
                {getIntensityBadge(item.precipitationIntensity)}
                <span className="text-[9px] font-mono text-slate-400 truncate max-w-[80px]">
                  {item.trend}
                </span>
              </div>

              {item.activeAlert && (
                <div className="text-[10px] text-amber-300/90 bg-amber-950/40 border border-amber-900/50 p-1.5 rounded leading-tight">
                  {item.activeAlert}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Integration Impact Summary Strip */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Atmospheric Risk Coupling:</strong> High precipitation in Meghalaya & Manipur automatically triggers speed restrictions and elevates NH-6 & NH-37 disruption risk.
          </span>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 shrink-0">
          Coupled to Explainable AI Engine
        </span>
      </div>
    </div>
  );
};
