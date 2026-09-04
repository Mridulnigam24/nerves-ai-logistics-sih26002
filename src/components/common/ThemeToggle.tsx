import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useNerves } from '../../context/NervesContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = true }) => {
  const { theme, toggleTheme } = useNerves();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      id="nerves-theme-toggle"
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
        isDark
          ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Theme (Daytime Operations)' : 'Switch to Dark Theme (Command Operations)'}
      aria-label={`Visual theme: currently ${isDark ? 'Dark Mode' : 'Light Mode'}. Click to toggle.`}
      aria-pressed={!isDark}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform duration-200 hover:rotate-12" />
          {showLabel && <span className="text-[11px] font-medium tracking-wide">Light</span>}
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-blue-600 transition-transform duration-200 hover:-rotate-12" />
          {showLabel && <span className="text-[11px] font-medium tracking-wide">Dark</span>}
        </>
      )}
    </button>
  );
};
