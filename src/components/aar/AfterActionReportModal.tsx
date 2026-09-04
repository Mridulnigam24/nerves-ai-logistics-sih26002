import React, { useState, useEffect } from 'react';
import { useNerves } from '../../context/NervesContext';
import {
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  Shield,
  Truck,
  Package,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  Building2,
  Radio,
  Globe,
} from 'lucide-react';
import { generateAfterActionReport } from '../../services/aiService';
import { SupportedLanguage } from '../../services/i18n';

interface AfterActionReportModalProps {
  onClose: () => void;
}

export const AfterActionReportModal: React.FC<AfterActionReportModalProps> = ({ onClose }) => {
  const {
    afterActionMetrics,
    simulationScenario,
    corridors,
    language,
    setLanguage,
    t,
  } = useNerves();

  const [aiReport, setAiReport] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(true);

  const fetchAiDebrief = async () => {
    setLoadingAi(true);
    try {
      const generated = await generateAfterActionReport({
        metrics: afterActionMetrics,
        scenario: simulationScenario,
        corridors,
        language,
      });
      setAiReport(generated);
    } catch {
      setAiReport('Failed to generate After-Action Report debrief.');
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAiDebrief();
  }, [simulationScenario, language]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 print:p-0 print:bg-white print:text-black">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:bg-white animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 print:bg-white print:border-b print:border-black">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 print:hidden">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase font-mono">
                  Official Debrief
                </span>
                <span className="text-xs text-slate-400 print:text-black font-medium">
                  SDMA / EOC Post-Operation Audit
                </span>
              </div>
              <h2 className="text-base font-bold text-white print:text-black tracking-tight">
                {t.aar.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="en">English (National)</option>
                <option value="as">অসমীয়া (Assamese)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="mni">মৈতৈলোন্ (Manipuri)</option>
                <option value="brx">बड़ो (Bodo)</option>
                <option value="kh">Khasi (Meghalaya)</option>
                <option value="lus">Mizo (Mizoram)</option>
                <option value="ne">नेपाली (Nepali)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="grt">Garo (Meghalaya)</option>
                <option value="nag">Nagamese</option>
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              title="Print Official Debrief"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300 print:text-black print:bg-white">
          {/* Key Quantitative Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1 print:border-slate-300">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Average Field Response
              </span>
              <div className="text-xl font-mono font-bold text-emerald-400 print:text-black">
                {afterActionMetrics.averageResponseMinutes} Min
              </div>
              <p className="text-[10px] text-slate-500">From alert to verified triage</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1 print:border-slate-300">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Critical Hazards Mitigated
              </span>
              <div className="text-xl font-mono font-bold text-cyan-400 print:text-black">
                {afterActionMetrics.resolvedIncidents} / {afterActionMetrics.criticalIncidents}
              </div>
              <p className="text-[10px] text-slate-500">100% life-safety adherence</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1 print:border-slate-300">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Safe Staging Compliance
              </span>
              <div className="text-xl font-mono font-bold text-amber-400 print:text-black">
                100%
              </div>
              <p className="text-[10px] text-slate-500">Zero trucks trapped on pass</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1 print:border-slate-300">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Relief Delivered
              </span>
              <div className="text-xl font-mono font-bold text-purple-400 print:text-black">
                {afterActionMetrics.suppliesDeliveredTonnes} Tonnes
              </div>
              <p className="text-[10px] text-slate-500">Essential insulin & foodstock</p>
            </div>
          </div>

          {/* Operational Interventions Breakdown */}
          <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/60 space-y-3 print:border-slate-300">
            <h3 className="font-bold text-sm text-white print:text-black flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Inter-Agency Interventions Logged
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded border border-slate-800/80 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  BRO / PWD Pushpak
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Excavator deployment to NH-37 Makru Bridgehead within 18 minutes. Continuous rockfall clearance achieved single-lane emergency clearance.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded border border-slate-800/80 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                  Safe Staging Yards
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  2 heavy freight trucks halted safely at Jiribam Border Station. Refused entry onto unverified hill bypasses, preventing vehicle rollover.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded border border-slate-800/80 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  NDRF / SDRF Triage
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Offline geotagged field reports queued during mountain dead-zone transit synced automatically upon cellular link restoration.
                </p>
              </div>
            </div>
          </div>

          {/* Gemini AI Formal Audit Assessment */}
          <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/90 space-y-3 print:border-slate-300">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white print:text-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                AI Inspector Tactical Evaluation ({language.toUpperCase()})
              </h3>
              <button
                onClick={fetchAiDebrief}
                disabled={loadingAi}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 print:hidden"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                Re-evaluate
              </button>
            </div>

            {loadingAi ? (
              <div className="py-8 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                Compiling multi-agency post-disaster audit report...
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-200 print:text-black leading-relaxed bg-slate-900/60 p-4 rounded border border-slate-800 print:bg-transparent print:border-none">
                {aiReport}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs print:hidden">
          <span className="text-slate-500 text-[11px]">
            Certified for State Disaster Management Authority & National Highway Logistics Cells.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              {t.aar.printButton}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
            >
              Close Debrief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
