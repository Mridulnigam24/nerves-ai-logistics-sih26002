import React, { useState, useEffect } from 'react';
import { useNerves } from '../../context/NervesContext';
import {
  FileText,
  Copy,
  Check,
  RefreshCw,
  X,
  Printer,
  Sparkles,
  ShieldAlert,
  Globe,
} from 'lucide-react';
import { generateSituationReport } from '../../services/aiService';
import { SupportedLanguage } from '../../services/i18n';

interface AiSituationReportModalProps {
  onClose: () => void;
}

export const AiSituationReportModal: React.FC<AiSituationReportModalProps> = ({ onClose }) => {
  const {
    simulationScenario,
    weatherCondition,
    corridors,
    vehicles,
    supplies,
    incidents,
    weatherList,
    language,
    setLanguage,
  } = useNerves();

  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const liveWeatherSummary = weatherList
        .map((w) => `${w.city || w.state}: ${w.rainfallMm24h}mm rain (${w.precipitationIntensity})`)
        .join(', ');

      const generated = await generateSituationReport({
        scenario: simulationScenario,
        weather: weatherCondition,
        corridors,
        vehicles,
        supplies,
        incidentCount: incidents.length,
        liveWeatherSummary,
        language,
      });
      setReport(generated);
    } catch {
      setReport('Failed to generate situation report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [simulationScenario, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                AI Logistics Situation Report (State EOC Briefing)
              </h3>
              <p className="text-[11px] text-slate-400">
                Live State Assessment • Scenario: {simulationScenario}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              onClick={fetchReport}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              title="Regenerate Report"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              title="Copy to Clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-200 leading-relaxed bg-slate-950 space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="font-sans text-xs">
                Generating AI Operational Situation Briefing via Gemini Intelligence...
              </p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-200 select-text">
              {report}
            </pre>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-sans text-[11px]">
            * Prototype Risk Intelligence Report for SIH26002 Logistics Operations.
          </span>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard' : 'Copy Briefing'}
          </button>
        </div>
      </div>
    </div>
  );
};
