import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English',  native: 'English',  flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi',    native: 'हिन्दी',   flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi',  native: 'मराठी',    flag: '🇮🇳' },
  { code: 'es', label: 'Spanish',  native: 'Español',  flag: '🇪🇸' },
  { code: 'de', label: 'German',   native: 'Deutsch',  flag: '🇩🇪' },
];

/**
 * LanguageSwitcher
 * dark=true  → designed for dark backgrounds (Navbar desktop bar)
 * dark=false → designed for light/panel backgrounds (mobile drawer)
 */
const LanguageSwitcher = ({ dark = false }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentCode = i18n.language?.split('-')[0] || 'en';
  const current = LANGUAGES.find(l => l.code === currentCode) || LANGUAGES[0];

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (code) => { i18n.changeLanguage(code); setOpen(false); };

  /* ── Styles ── */
  const triggerBase = dark
    ? 'flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer text-white/70 border-white/10 hover:text-white hover:border-white/25 hover:bg-white/[0.06] active:scale-[0.97]'
    : 'flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer text-[#4a4038] border-[#ddd6cc] hover:text-[#163d25] hover:border-[#4db87a]/50 hover:bg-[#4db87a]/[0.06] active:scale-[0.97]';

  const panelBase = 'absolute z-[999] mt-2 w-52 rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.22)] border backdrop-blur-xl';
  const panelTheme = dark
    ? 'right-0 bg-[#0d1f13]/95 border-white/[0.12]'
    : 'left-0 bg-white/95 border-[#e8e2d8]';

  return (
    <div ref={ref} className="relative inline-block" style={{ userSelect: 'none' }}>
      {/* ── Trigger button ── */}
      <button
        className={triggerBase}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch language"
      >
        <Globe className="w-[15px] h-[15px] shrink-0 opacity-75" />
        <span className="text-[11.5px] font-semibold tracking-[0.12em] uppercase opacity-90 leading-none">
          {current.code}
        </span>
        {/* chevron */}
        <svg
          width="9" height="9" viewBox="0 0 9 9" fill="none"
          className={`shrink-0 opacity-50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M1.5 3L4.5 6L7.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className={`${panelBase} ${panelTheme}`}
          role="listbox"
          aria-label="Language selection"
          style={{
            animation: 'ls-in 0.18s cubic-bezier(.22,1,.36,1)',
          }}
        >
          <style>{`
            @keyframes ls-in {
              from { opacity: 0; transform: scale(0.95) translateY(-6px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          {/* Header strip */}
          <div className={`px-3.5 pt-3 pb-2 text-[9.5px] font-semibold tracking-[0.2em] uppercase ${dark ? 'text-white/25' : 'text-[#0c1e11]/30'}`}>
            Language
          </div>

          <div className="pb-2">
            {LANGUAGES.map(({ code, label, native, flag }) => {
              const active = currentCode === code;
              return (
                <button
                  key={code}
                  role="option"
                  aria-selected={active}
                  onClick={() => select(code)}
                  className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 transition-all duration-150 group ${
                    active
                      ? dark
                        ? 'bg-[#4db87a]/15 text-[#4db87a]'
                        : 'bg-[#4db87a]/10 text-[#163d25]'
                      : dark
                        ? 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                        : 'text-[#3a3530] hover:bg-[#f5f1ec] hover:text-[#0c1e11]'
                  }`}
                >
                  {/* Flag */}
                  <span className="text-[18px] leading-none">{flag}</span>

                  {/* Labels */}
                  <span className="flex flex-col min-w-0">
                    <span className={`text-[13px] font-${active ? 'semibold' : 'medium'} leading-tight`}>{native}</span>
                    <span className={`text-[10px] leading-tight mt-0.5 ${dark ? 'text-white/30' : 'text-[#8a7e74]'}`}>{label}</span>
                  </span>

                  {/* Checkmark */}
                  {active && (
                    <Check className={`ml-auto w-3.5 h-3.5 shrink-0 ${dark ? 'text-[#4db87a]' : 'text-[#2d8a55]'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
