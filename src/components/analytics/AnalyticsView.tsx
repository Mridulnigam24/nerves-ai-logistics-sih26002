import React from 'react';
import { useNerves } from '../../context/NervesContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  ShieldCheck,
  Clock,
  Package,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { corridors, vehicles, supplies, incidents, theme } = useNerves();
  const isLight = theme === 'light';

  const gridStroke = isLight ? '#E2E8F0' : '#1e293b';
  const axisStroke = isLight ? '#475569' : '#64748b';
  const tooltipStyle = isLight
    ? { backgroundColor: '#FFFFFF', borderColor: '#D7E0E8', color: '#17212B', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
    : { backgroundColor: '#020617', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' };

  // Corridor Risk vs Delay Data
  const corridorChartData = corridors.map((c) => ({
    name: c.code,
    risk: c.riskScore,
    delay: c.estimatedDelayMinutes,
    rainfall: c.rainfallMm,
  }));

  // Accessibility Breakdown Data
  const accessibleCount = corridors.filter((c) => c.accessibility === 'ACCESSIBLE').length;
  const restrictedCount = corridors.filter((c) => c.accessibility === 'RESTRICTED').length;
  const blockedCount = corridors.filter((c) => c.accessibility === 'BLOCKED').length;

  const accessibilityData = [
    { name: 'Accessible', value: accessibleCount, color: '#10b981' },
    { name: 'Restricted', value: restrictedCount, color: '#f59e0b' },
    { name: 'Blocked', value: blockedCount, color: '#ef4444' },
  ];

  // Supply Shortages Data
  const supplyShortageData = supplies.map((s) => ({
    name: s.category.split('_')[0],
    required: s.requiredQty,
    available: s.availableQty,
    shortage: s.shortage,
  }));

  // Multi-dimensional Factor Radar Data for NH-37 vs NH-6
  const radarData = [
    { subject: 'Rainfall', NH37: 85, NH6: 45, NH29: 25 },
    { subject: 'Slope Grade', NH37: 92, NH6: 76, NH29: 80 },
    { subject: 'Historical Slides', NH37: 88, NH6: 65, NH29: 45 },
    { subject: 'Flood Hazard', NH37: 35, NH6: 25, NH29: 10 },
    { subject: 'Pavement Stress', NH37: 75, NH6: 50, NH29: 30 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <BarChart3 className="w-5 h-5" />
            <h2 className="font-extrabold text-slate-100 text-lg tracking-wide uppercase">
              NER Logistics Disruption Trends & Predictive Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Longitudinal corridor reliability indexes, stock shortage projections, and multi-factor hazard comparisons.
          </p>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Corridor Risk Score vs Estimated Delay */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Corridor Disruption Risk vs Transit Delay (Mins)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Real-time Telemetry</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={corridorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={axisStroke} tick={{ fontSize: 11 }} />
                <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: isLight ? '#17212B' : '#cbd5e1' }} />
                <Bar dataKey="risk" name="Disruption Risk Score (%)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delay" name="Estimated Delay (Mins)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Accessibility Status Breakdown (Pie Chart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              Road Network Accessibility Breakdown
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{corridors.length} Monitored Arteries</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accessibilityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {accessibilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: isLight ? '#17212B' : '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Essential Supply Inventory vs Shortage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-rose-400" />
              Essential Supply Shortages by Category
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Stock Runways</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplyShortageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={axisStroke} tick={{ fontSize: 11 }} />
                <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: isLight ? '#17212B' : '#cbd5e1' }} />
                <Bar dataKey="available" name="Available Inventory" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shortage" name="Shortage Deficit" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Multi-Spectral Terrain Hazard Radar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Multi-Spectral Hazard Radar Profile
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">NH-37 vs NH-6 vs NH-29</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke={gridStroke} />
                <PolarAngleAxis dataKey="subject" stroke={isLight ? '#334155' : '#94a3b8'} tick={{ fontSize: 11 }} />
                <PolarRadiusAxis stroke={axisStroke} angle={30} domain={[0, 100]} />
                <Radar name="NH-37 (Makru/Imphal)" dataKey="NH37" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                <Radar name="NH-6 (Meghalaya)" dataKey="NH6" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Radar name="NH-29 (Nagaland)" dataKey="NH29" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: '11px', color: isLight ? '#17212B' : '#cbd5e1' }} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
