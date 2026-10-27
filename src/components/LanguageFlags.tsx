import React from 'react';
import { Language } from '../types/wedding';

export const VietnamFlag: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg viewBox="0 0 30 20" className={`rounded-xs overflow-hidden shadow-xs shrink-0 inline-block ${className}`}>
    <rect width="30" height="20" fill="#DA251D" />
    <polygon
      points="15,4 16.5,8.5 21.2,8.5 17.4,11.3 18.9,15.8 15,13 11.1,15.8 12.6,11.3 8.8,8.5 13.5,8.5"
      fill="#FFFF00"
    />
  </svg>
);

export const CambodiaFlag: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg viewBox="0 0 30 20" className={`rounded-xs overflow-hidden shadow-xs shrink-0 inline-block ${className}`}>
    <rect width="30" height="5" fill="#032EA6" />
    <rect y="5" width="30" height="10" fill="#E00025" />
    <rect y="15" width="30" height="5" fill="#032EA6" />
    {/* Angkor Wat Silhouette */}
    <path
      d="M11 13h8v-1h-1v-2h-1v2h-2v-3h-1v3h-2v-2h-1v2h-1z"
      fill="#FFFFFF"
    />
  </svg>
);

export const UKFlag: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg viewBox="0 0 30 20" className={`rounded-xs overflow-hidden shadow-xs shrink-0 inline-block ${className}`}>
    <rect width="30" height="20" fill="#00247D" />
    <path d="M0,0 L30,20 M30,0 L0,20" stroke="#FFFFFF" strokeWidth="3" />
    <path d="M0,0 L30,20 M30,0 L0,20" stroke="#CF142B" strokeWidth="1.5" />
    <path d="M15,0 V20 M0,10 H30" stroke="#FFFFFF" strokeWidth="5" />
    <path d="M15,0 V20 M0,10 H30" stroke="#CF142B" strokeWidth="3" />
  </svg>
);

interface LanguageSelectorProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  variant?: 'floating-dark' | 'floating-light' | 'admin';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onLanguageChange,
  variant = 'floating-light',
  className = '',
}) => {
  const options: Array<{ code: Language; label: string; Flag: React.FC<{ className?: string }> }> = [
    { code: 'vi', label: 'VI', Flag: VietnamFlag },
    { code: 'km', label: 'ខ្មែរ', Flag: CambodiaFlag },
    { code: 'en', label: 'EN', Flag: UKFlag },
  ];

  if (variant === 'floating-dark') {
    return (
      <div className={`flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20 text-xs shadow-lg ${className}`}>
        {options.map(({ code, label, Flag }) => (
          <button
            key={code}
            onClick={() => onLanguageChange(code)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition cursor-pointer ${
              currentLang === code
                ? 'bg-[#8A0F1A] text-[#FDE792] font-bold shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title={code === 'vi' ? 'Tiếng Việt' : code === 'km' ? 'ភាសាខ្មែរ (Khmer)' : 'English'}
          >
            <Flag className="w-4 h-3" />
            <span className={code === 'km' ? 'font-battambang text-[11px]' : 'font-sans text-[11px]'}>{label}</span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'admin') {
    return (
      <div className={`flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-300 text-xs ${className}`}>
        {options.map(({ code, label, Flag }) => (
          <button
            key={code}
            onClick={() => onLanguageChange(code)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              currentLang === code
                ? 'bg-[#8A0F1A] text-[#FDE792] font-bold shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Flag className="w-4 h-3" />
            <span className={code === 'km' ? 'font-battambang text-xs' : 'font-sans text-xs'}>{label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Default: floating-light
  return (
    <div className={`flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-full border border-[#D4AF37]/50 shadow-md text-xs ${className}`}>
      {options.map(({ code, label, Flag }) => (
        <button
          key={code}
          onClick={() => onLanguageChange(code)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition cursor-pointer ${
            currentLang === code
              ? 'red-royal-gradient text-[#FDE792] font-bold shadow-xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
          title={code === 'vi' ? 'Tiếng Việt' : code === 'km' ? 'ភាសាខ្មែរ (Khmer)' : 'English'}
        >
          <Flag className="w-4 h-3" />
          <span className={code === 'km' ? 'font-battambang text-[11px]' : 'font-sans text-[11px]'}>{label}</span>
        </button>
      ))}
    </div>
  );
};
