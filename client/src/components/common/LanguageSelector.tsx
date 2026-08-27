import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { changeLanguage } from '../../i18n';

interface LanguageOption {
  code: 'en' | 'ta' | 'hi';
  label: string;
  nativeLabel: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
];

interface LanguageSelectorProps {
  variant?: 'header' | 'drawer';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'header' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: 'en' | 'ta' | 'hi') => {
    changeLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'drawer') {
    return (
      <div className="space-y-1.5 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#4B5563] px-1 pb-1">
          <Globe size={14} className="text-[#15803D]" />
          <span>Language / மொழி / भाषा</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`py-1.5 px-2 text-xs font-bold rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                i18n.language === lang.code
                  ? 'bg-[#15803D] text-white shadow-2xs'
                  : 'bg-white text-[#1F2937] hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{lang.nativeLabel}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change Language"
        aria-expanded={isOpen}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-[#1F2937] border border-slate-200 transition-all cursor-pointer"
      >
        <Globe size={14} className="text-[#15803D] shrink-0" />
        <span className="font-semibold">{currentLang.nativeLabel}</span>
        <ChevronDown size={12} className={`text-[#4B5563] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#4B5563] border-b border-slate-100 mb-1">
            Select Language
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`w-full px-3.5 py-2 text-xs font-medium flex items-center justify-between text-left transition hover:bg-slate-50 cursor-pointer ${
                i18n.language === lang.code ? 'text-[#15803D] font-bold bg-emerald-50/50' : 'text-[#1F2937]'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">{lang.nativeLabel}</span>
                <span className="text-[10px] text-[#4B5563]">{lang.label}</span>
              </div>
              {i18n.language === lang.code && <Check size={14} className="text-[#15803D]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
