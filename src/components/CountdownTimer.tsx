import React, { useState, useEffect } from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { Language } from '../types/wedding';
import { getTranslation } from '../i18n/translations';

interface CountdownTimerProps {
  solarDate: string;
  weddingTime?: string;
  lang: Language;
  className?: string;
  variant?: 'royal-dark' | 'royal-light';
  showSeconds?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  solarDate,
  weddingTime = '11:00',
  lang = 'vi',
  className = '',
  variant = 'royal-dark',
  showSeconds = true,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [isPassed, setIsPassed] = useState<boolean>(false);
  const t = getTranslation(lang);

  useEffect(() => {
    const calculateTime = () => {
      if (!solarDate) return;
      // Parse solarDate and weddingTime safely
      const timeStr = weddingTime || '11:00';
      const weddingDateStr = `${solarDate}T${timeStr.length === 5 ? timeStr + ':00' : timeStr}`;
      const targetTime = new Date(weddingDateStr).getTime();
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setIsPassed(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsPassed(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [solarDate, weddingTime]);

  const isKm = lang === 'km';
  const isVi = lang === 'vi';
  const isDark = variant === 'royal-dark';

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Title with sparkles */}
      <div className="flex items-center gap-1.5 mb-2 select-none">
        <Sparkles size={13} className={isDark ? 'text-[#FDE792]' : 'text-[#B88329]'} />
        <span
          className={`text-xs sm:text-sm uppercase tracking-wider font-bold drop-shadow-xs ${
            isDark ? 'text-[#F5D77F]' : 'text-[#8A0F1A]'
          } ${isKm ? 'font-muol' : isVi ? 'font-times' : 'font-cinzel'}`}
        >
          {t.daysUntilWedding}
        </span>
        <Sparkles size={13} className={isDark ? 'text-[#FDE792]' : 'text-[#B88329]'} />
      </div>

      {isPassed ? (
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8A0F1A] via-[#B88329] to-[#8A0F1A] text-[#FDE792] border-2 border-[#F5D77F] shadow-lg animate-pulse">
          <span className="text-lg">🎉</span>
          <span
            className={`text-xs sm:text-sm font-bold tracking-wide ${
              isKm ? 'font-muol' : isVi ? 'font-times' : 'font-cinzel'
            }`}
          >
            {t.weddingDayArrived}
          </span>
          <span className="text-lg">🎉</span>
        </div>
      ) : (
        /* Countdown Units Box Container */
        <div
          className={`inline-flex items-center gap-1.5 sm:gap-3 p-2 sm:p-2.5 rounded-2xl border shadow-xl ${
            isDark
              ? 'bg-black/50 backdrop-blur-md border-[#D4AF37]/60 text-white'
              : 'bg-[#FFFDF8] border-[#D4AF37] text-[#2C1810]'
          }`}
        >
          {/* Days Unit */}
          <div
            className={`flex flex-col items-center justify-center min-w-[56px] sm:min-w-[68px] py-1.5 sm:py-2 px-2 rounded-xl border shadow-md transition-transform hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-b from-[#8A0F1A] to-[#55040C] border-[#F5D77F]/60'
                : 'bg-gradient-to-b from-[#FFFDF8] via-amber-50 to-[#FAF4E4] border-[#D4AF37]'
            }`}
          >
            <span
              className={`text-lg sm:text-2xl font-bold leading-none tabular-nums drop-shadow ${
                isDark ? 'text-[#FDE792]' : 'text-[#8A0F1A]'
              }`}
            >
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span
              className={`text-[9px] sm:text-[11px] uppercase font-bold mt-1 tracking-wider ${
                isDark ? 'text-amber-200' : 'text-[#8A0F1A]'
              } ${isKm ? 'font-battambang' : isVi ? 'font-times' : 'font-sans'}`}
            >
              {t.countdownDays}
            </span>
          </div>

          <span className={`font-bold text-base sm:text-xl ${isDark ? 'text-[#F5D77F]' : 'text-[#8A0F1A]'}`}>
            :
          </span>

          {/* Hours Unit */}
          <div
            className={`flex flex-col items-center justify-center min-w-[56px] sm:min-w-[68px] py-1.5 sm:py-2 px-2 rounded-xl border shadow-md transition-transform hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-b from-[#8A0F1A] to-[#55040C] border-[#F5D77F]/60'
                : 'bg-gradient-to-b from-[#FFFDF8] via-amber-50 to-[#FAF4E4] border-[#D4AF37]'
            }`}
          >
            <span
              className={`text-lg sm:text-2xl font-bold leading-none tabular-nums drop-shadow ${
                isDark ? 'text-[#FDE792]' : 'text-[#8A0F1A]'
              }`}
            >
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span
              className={`text-[9px] sm:text-[11px] uppercase font-bold mt-1 tracking-wider ${
                isDark ? 'text-amber-200' : 'text-[#8A0F1A]'
              } ${isKm ? 'font-battambang' : isVi ? 'font-times' : 'font-sans'}`}
            >
              {t.countdownHours}
            </span>
          </div>

          <span className={`font-bold text-base sm:text-xl ${isDark ? 'text-[#F5D77F]' : 'text-[#8A0F1A]'}`}>
            :
          </span>

          {/* Minutes Unit */}
          <div
            className={`flex flex-col items-center justify-center min-w-[56px] sm:min-w-[68px] py-1.5 sm:py-2 px-2 rounded-xl border shadow-md transition-transform hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-b from-[#8A0F1A] to-[#55040C] border-[#F5D77F]/60'
                : 'bg-gradient-to-b from-[#FFFDF8] via-amber-50 to-[#FAF4E4] border-[#D4AF37]'
            }`}
          >
            <span
              className={`text-lg sm:text-2xl font-bold leading-none tabular-nums drop-shadow ${
                isDark ? 'text-[#FDE792]' : 'text-[#8A0F1A]'
              }`}
            >
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span
              className={`text-[9px] sm:text-[11px] uppercase font-bold mt-1 tracking-wider ${
                isDark ? 'text-amber-200' : 'text-[#8A0F1A]'
              } ${isKm ? 'font-battambang' : isVi ? 'font-times' : 'font-sans'}`}
            >
              {t.countdownMinutes}
            </span>
          </div>

          {/* Seconds Unit */}
          {showSeconds && (
            <>
              <span className={`font-bold text-base sm:text-xl ${isDark ? 'text-[#F5D77F]' : 'text-[#8A0F1A]'}`}>
                :
              </span>
              <div
                className={`flex flex-col items-center justify-center min-w-[56px] sm:min-w-[68px] py-1.5 sm:py-2 px-2 rounded-xl border shadow-md transition-transform hover:scale-105 ${
                  isDark
                    ? 'bg-gradient-to-b from-[#8A0F1A] to-[#55040C] border-[#F5D77F]/60'
                    : 'bg-gradient-to-b from-[#FFFDF8] via-amber-50 to-[#FAF4E4] border-[#D4AF37]'
                }`}
              >
                <span
                  className={`text-lg sm:text-2xl font-bold leading-none tabular-nums drop-shadow ${
                    isDark ? 'text-[#FDE792]' : 'text-[#8A0F1A]'
                  }`}
                >
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span
                  className={`text-[9px] sm:text-[11px] uppercase font-bold mt-1 tracking-wider ${
                    isDark ? 'text-amber-200' : 'text-[#8A0F1A]'
                  } ${isKm ? 'font-battambang' : isVi ? 'font-times' : 'font-sans'}`}
                >
                  {t.countdownSeconds}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
