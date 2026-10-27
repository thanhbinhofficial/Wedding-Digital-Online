import React from 'react';

/**
 * Authentic Khmer Wedding Traditional Ornaments & Patterns (ក្បាច់រចនាធៀបការខ្មែរបុរាណ)
 * Including:
 * - Kbach Chroung (ក្បាច់ជ្រុង): Traditional Khmer golden corner filigree flourishes
 * - Kbach Kbal Phni (ក្បាច់កំពូល): Royal Khmer header crest & flanking wings
 * - Kbach Phka Chan (ក្បាច់ផ្កាច័ន្ទ): Traditional Khmer sacred lotus mandala & watermarks
 * - Kbach Phni Tes Divider (ក្បាច់បន្ទាត់មាសផ្កាភ្ញីទេស): Khmer traditional golden ornamental dividers
 */

interface KhmerCornerKbachProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
  className?: string;
}

export const KhmerCornerKbach: React.FC<KhmerCornerKbachProps> = ({
  position = 'top-left',
  size = 48,
  className = '',
}) => {
  const getTransform = () => {
    switch (position) {
      case 'top-right':
        return 'scaleX(-1)';
      case 'bottom-left':
        return 'scaleY(-1)';
      case 'bottom-right':
        return 'scale(-1, -1)';
      default:
        return 'none';
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: getTransform() }}
      className={`pointer-events-none drop-shadow-sm ${className}`}
    >
      <defs>
        <linearGradient id="khmerGoldGradCorner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CF9E42" />
          <stop offset="30%" stopColor="#F5D77F" />
          <stop offset="70%" stopColor="#B88329" />
          <stop offset="90%" stopColor="#FDE792" />
          <stop offset="100%" stopColor="#956515" />
        </linearGradient>
      </defs>

      {/* Main Outer Corner Frame Spine */}
      <path
        d="M 6 6 L 68 6 C 52 14 36 28 28 44 C 20 60 14 76 6 88 Z"
        fill="url(#khmerGoldGradCorner)"
        opacity="0.25"
      />

      {/* Kbach Angkor Flame Vines (ក្បាច់រងើកភ្លើង និងផ្កាភ្ញីទេស) */}
      <path
        d="M 8 8 L 62 8 C 50 14 42 22 36 32 C 30 42 22 50 8 62 Z"
        stroke="url(#khmerGoldGradCorner)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Primary Khmer Spiral / Kbach Phni Flame */}
      <path
        d="M 12 12 Q 38 14 48 30 Q 36 38 28 32 Q 22 46 14 54"
        stroke="url(#khmerGoldGradCorner)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Secondary Inner Scroll / Lotus Petal Leaf */}
      <path
        d="M 16 16 Q 28 20 32 30 C 26 34 22 28 16 26 Z"
        fill="url(#khmerGoldGradCorner)"
      />

      {/* Golden Lotus Bud Spire at Root (ត្រួយផ្កាឈូក) */}
      <path
        d="M 12 12 C 16 6 22 10 20 16 C 16 20 10 18 12 12 Z"
        fill="url(#khmerGoldGradCorner)"
      />

      {/* Corner Pearl Beads (កម្រងអង្កាំមាស) */}
      <circle cx="8" cy="8" r="3.5" fill="url(#khmerGoldGradCorner)" />
      <circle cx="20" cy="8" r="2.2" fill="url(#khmerGoldGradCorner)" />
      <circle cx="32" cy="8" r="2" fill="url(#khmerGoldGradCorner)" />
      <circle cx="44" cy="8" r="1.8" fill="url(#khmerGoldGradCorner)" />
      <circle cx="56" cy="8" r="1.5" fill="url(#khmerGoldGradCorner)" />
      <circle cx="8" cy="20" r="2.2" fill="url(#khmerGoldGradCorner)" />
      <circle cx="8" cy="32" r="2" fill="url(#khmerGoldGradCorner)" />
      <circle cx="8" cy="44" r="1.8" fill="url(#khmerGoldGradCorner)" />
      <circle cx="8" cy="56" r="1.5" fill="url(#khmerGoldGradCorner)" />

      {/* Fine Khmer Delicate Flourish Tendril */}
      <path
        d="M 28 44 Q 38 48 42 58 Q 36 62 30 54"
        stroke="url(#khmerGoldGradCorner)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="42" cy="58" r="2" fill="url(#khmerGoldGradCorner)" />
    </svg>
  );
};

/**
 * Traditional Khmer Royal Header Crest & Scroll Wings
 * Placed around headers like "( ខ្ញុំជាគូ )"
 */
export const KhmerHeaderFlourish: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-1 sm:gap-2 pointer-events-none ${className}`}>
      {/* Left Khmer Wing / Kbach Kantoey Hong (ក្បាច់កន្ទុយហង្សឆ្វេង) */}
      <svg width="48" height="24" viewBox="0 0 60 24" fill="none" className="drop-shadow-xs">
        <defs>
          <linearGradient id="khmerGoldGradFlourish" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#956515" />
            <stop offset="30%" stopColor="#CF9E42" />
            <stop offset="70%" stopColor="#F5D77F" />
            <stop offset="100%" stopColor="#FDE792" />
          </linearGradient>
        </defs>
        <path
          d="M 60 12 C 45 10 32 3 20 4 C 12 5 5 10 0 16 C 8 16 16 14 24 18 C 36 24 48 18 60 12 Z"
          fill="url(#khmerGoldGradFlourish)"
        />
        <path
          d="M 50 12 C 40 7 28 6 18 10 C 26 12 36 12 45 15 Z"
          fill="#FFFDF8"
          opacity="0.4"
        />
        <circle cx="8" cy="14" r="2" fill="#FDE792" />
        <circle cx="18" cy="10" r="2" fill="#FDE792" />
      </svg>

      {/* Sacred Royal Lotus Bud Motif (ផ្កាឈូករាជានិយម) */}
      <div className="text-[#F5D77F] text-lg sm:text-xl drop-shadow animate-pulse">
        🪷
      </div>

      {/* Right Khmer Wing / Kbach Kantoey Hong (ក្បាច់កន្ទុយហង្សស្តាំ) */}
      <svg width="48" height="24" viewBox="0 0 60 24" fill="none" className="drop-shadow-xs scale-x-[-1]">
        <path
          d="M 60 12 C 45 10 32 3 20 4 C 12 5 5 10 0 16 C 8 16 16 14 24 18 C 36 24 48 18 60 12 Z"
          fill="url(#khmerGoldGradFlourish)"
        />
        <path
          d="M 50 12 C 40 7 28 6 18 10 C 26 12 36 12 45 15 Z"
          fill="#FFFDF8"
          opacity="0.4"
        />
        <circle cx="8" cy="14" r="2" fill="#FDE792" />
        <circle cx="18" cy="10" r="2" fill="#FDE792" />
      </svg>
    </div>
  );
};

/**
 * Khmer Royal Lotus Petal Mandala (ក្បាច់ស្រទាប់ផ្កាឈូកព័ទ្ធជុំវិញមេដាយអាពាហ៍ពិពាហ៍)
 * Wraps around the center Double Happiness (囍) seal
 */
export const KhmerLotusMandala: React.FC<{ size?: number; className?: string }> = ({
  size = 170,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-md ${className}`}
    >
      <defs>
        <linearGradient id="mandalaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CF9E42" />
          <stop offset="35%" stopColor="#F5D77F" />
          <stop offset="70%" stopColor="#B88329" />
          <stop offset="90%" stopColor="#FDE792" />
          <stop offset="100%" stopColor="#956515" />
        </linearGradient>
      </defs>

      {/* 12 Traditional Khmer Lotus Petals Radiating Outward (ស្រទាប់ឈូក ១២ ទិស) */}
      {[...Array(12)].map((_, i) => {
        const angle = i * 30;
        return (
          <g key={i} transform={`rotate(${angle} 100 100)`}>
            {/* Outer Lotus Tip */}
            <path
              d="M 100 8 C 94 20 90 32 100 42 C 110 32 106 20 100 8 Z"
              fill="url(#mandalaGoldGrad)"
            />
            {/* Fine Inner Spine */}
            <line x1="100" y1="12" x2="100" y2="38" stroke="#FAF7F2" strokeWidth="1" opacity="0.6" />
            {/* Pearl Accent on Tip */}
            <circle cx="100" cy="6" r="2.2" fill="#FDE792" />
          </g>
        );
      })}

      {/* Secondary 12 In-Between Shorter Petals */}
      {[...Array(12)].map((_, i) => {
        const angle = i * 30 + 15;
        return (
          <g key={`inner-${i}`} transform={`rotate(${angle} 100 100)`}>
            <path
              d="M 100 22 C 96 30 92 38 100 46 C 108 38 104 30 100 22 Z"
              fill="url(#mandalaGoldGrad)"
              opacity="0.8"
            />
          </g>
        );
      })}

      {/* Circular Gold Beaded Rim (កម្រងអង្កាំមាសរង្វង់) */}
      <circle cx="100" cy="100" r="62" stroke="url(#mandalaGoldGrad)" strokeWidth="2.5" fill="none" />
      <circle cx="100" cy="100" r="56" stroke="url(#mandalaGoldGrad)" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
    </svg>
  );
};

/**
 * Traditional Khmer Floral Vine Divider (ក្បាច់បន្ទាត់មាសផ្កាភ្ញីទេសខ្មែរ)
 * Used beneath center emblem & between sections
 */
export const KhmerFloralDivider: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-2 pointer-events-none ${className}`}>
      {/* Left Khmer Filigree Vine */}
      <svg width="70" height="18" viewBox="0 0 100 24" fill="none" className="drop-shadow-xs">
        <defs>
          <linearGradient id="khmerDividerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#956515" />
            <stop offset="35%" stopColor="#CF9E42" />
            <stop offset="70%" stopColor="#F5D77F" />
            <stop offset="100%" stopColor="#FDE792" />
          </linearGradient>
        </defs>
        <path
          d="M 100 12 L 40 12 C 30 12 24 6 16 6 C 8 6 2 12 0 18 C 8 18 14 14 22 14 C 32 14 38 18 50 18 L 100 18 Z"
          fill="url(#khmerDividerGrad)"
        />
        <circle cx="12" cy="10" r="2.5" fill="#FDE792" />
        <circle cx="26" cy="12" r="2" fill="#FDE792" />
      </svg>

      {/* Center Sacred Heart & Gold Lotus Star */}
      <div className="flex items-center gap-1 text-[#D4AF37]">
        <span className="text-xs">✦</span>
        <span className="text-sm text-[#8A0F1A] drop-shadow-xs">♥</span>
        <span className="text-xs">✦</span>
      </div>

      {/* Right Khmer Filigree Vine (Mirrored) */}
      <svg width="70" height="18" viewBox="0 0 100 24" fill="none" className="drop-shadow-xs scale-x-[-1]">
        <path
          d="M 100 12 L 40 12 C 30 12 24 6 16 6 C 8 6 2 12 0 18 C 8 18 14 14 22 14 C 32 14 38 18 50 18 L 100 18 Z"
          fill="url(#khmerDividerGrad)"
        />
        <circle cx="12" cy="10" r="2.5" fill="#FDE792" />
        <circle cx="26" cy="12" r="2" fill="#FDE792" />
      </svg>
    </div>
  );
};

/**
 * Khmer Royal Watermark Pattern (ក្បាច់ផ្ទៃទឹកមាសផ្កាច័ន្ទបុរាណខ្មែរ)
 * Subtle, luxury watermark background pattern embedded across the wedding card
 */
export const KhmerWatermarkPattern: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none opacity-[0.06] select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="khmerKbachChanPattern" width="90" height="90" patternUnits="userSpaceOnUse">
            {/* Center Sacred Khmer 8-Pointed Lotus (ក្បាច់ផ្កាច័ន្ទ) */}
            <g transform="translate(45, 45)">
              <circle cx="0" cy="0" r="5" fill="#B88329" />
              {/* 4 Cardinal Petals */}
              <path d="M 0 -18 C -4 -10 -4 -4 0 0 C 4 -4 4 -10 0 -18 Z" fill="#B88329" />
              <path d="M 0 18 C -4 10 -4 4 0 0 C 4 4 4 10 0 18 Z" fill="#B88329" />
              <path d="M -18 0 C -10 -4 -4 -4 0 0 C -4 4 -10 4 -18 0 Z" fill="#B88329" />
              <path d="M 18 0 C 10 -4 4 -4 0 0 C 4 4 10 4 18 0 Z" fill="#B88329" />
              {/* 4 Diagonal Petals */}
              <path d="M -12 -12 C -11 -6 -6 -4 0 0 C -4 -6 -6 -11 -12 -12 Z" fill="#B88329" opacity="0.8" />
              <path d="M 12 -12 C 11 -6 6 -4 0 0 C 4 -6 6 -11 12 -12 Z" fill="#B88329" opacity="0.8" />
              <path d="M -12 12 C -11 6 -6 4 0 0 C -4 6 -6 11 -12 12 Z" fill="#B88329" opacity="0.8" />
              <path d="M 12 12 C 11 6 6 4 0 0 C 4 6 6 11 12 12 Z" fill="#B88329" opacity="0.8" />
              {/* Diamond Frame */}
              <rect x="-24" y="-24" width="48" height="48" transform="rotate(45)" fill="none" stroke="#B88329" strokeWidth="1" strokeDasharray="3 2" />
            </g>
            {/* Corner Half-Medallions for seamless tiling */}
            <g transform="translate(0, 0)">
              <circle cx="0" cy="0" r="3" fill="#B88329" />
              <path d="M 0 12 C 2 6 2 2 0 0 C -2 2 -2 6 0 12 Z" fill="#B88329" />
              <path d="M 12 0 C 6 2 2 2 0 0 C 2 -2 6 -2 12 0 Z" fill="#B88329" />
            </g>
            <g transform="translate(90, 0)">
              <circle cx="0" cy="0" r="3" fill="#B88329" />
              <path d="M 0 12 C 2 6 2 2 0 0 C -2 2 -2 6 0 12 Z" fill="#B88329" />
              <path d="M -12 0 C -6 2 -2 2 0 0 C -2 -2 -6 -2 -12 0 Z" fill="#B88329" />
            </g>
            <g transform="translate(0, 90)">
              <circle cx="0" cy="0" r="3" fill="#B88329" />
              <path d="M 0 -12 C 2 -6 2 -2 0 0 C -2 -2 -2 -6 0 -12 Z" fill="#B88329" />
              <path d="M 12 0 C 6 2 2 2 0 0 C 2 -2 6 -2 12 0 Z" fill="#B88329" />
            </g>
            <g transform="translate(90, 90)">
              <circle cx="0" cy="0" r="3" fill="#B88329" />
              <path d="M 0 -12 C 2 -6 2 -2 0 0 C -2 -2 -2 -6 0 -12 Z" fill="#B88329" />
              <path d="M -12 0 C -6 2 -2 2 0 0 C -2 -2 -6 -2 -12 0 Z" fill="#B88329" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#khmerKbachChanPattern)" />
      </svg>
    </div>
  );
};

/**
 * Royal Khmer Hollow Decorative Border Frame ("Khung Không Hoa Văn Hoàng Gia")
 * Designed as a pure transparent/hollow frame with multi-tier gold borders,
 * Kbach Angkor corner spires, and royal top/bottom crests.
 */
export type HollowFrameVariant =
  | 'khmer-traditional'
  | 'royal-lotus'
  | 'golden-filigree'
  | 'minimal-gold'
  | 'custom'
  | 'none';

interface KhmerHollowFrameProps {
  variant?: HollowFrameVariant;
  className?: string;
}

/**
 * Royal Khmer Hollow Decorative Border Frame ("Khung Không Hoa Văn Hoàng Gia")
 * Designed as a pure transparent/hollow frame with multi-tier gold borders,
 * Kbach Angkor corner spires, and royal top/bottom crests. Center is completely empty (khung không).
 */
export const KhmerHollowFrame: React.FC<KhmerHollowFrameProps> = ({
  variant = 'khmer-traditional',
  className = '',
}) => {
  if (variant === 'none') return null;

  return (
    <div className={`absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-[32px] select-none ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 1200"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="hollowFrameGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CF9E42" />
            <stop offset="25%" stopColor="#F5D77F" />
            <stop offset="50%" stopColor="#B88329" />
            <stop offset="75%" stopColor="#FDE792" />
            <stop offset="100%" stopColor="#956515" />
          </linearGradient>
          <linearGradient id="hollowFrameRose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#AA1926" />
            <stop offset="100%" stopColor="#68050E" />
          </linearGradient>
        </defs>

        {/* 1. OUTER HEAVY GOLD FILIGREE BORDER */}
        <rect
          x="10"
          y="10"
          width="780"
          height="1180"
          rx="32"
          stroke="url(#hollowFrameGold)"
          strokeWidth="3.5"
          fill="none"
        />

        {/* 2. INNER DELICATE GOLD BEADED BORDER */}
        <rect
          x="20"
          y="20"
          width="760"
          height="1160"
          rx="24"
          stroke="url(#hollowFrameGold)"
          strokeWidth="1.5"
          strokeDasharray={variant === 'minimal-gold' ? 'none' : '6 3'}
          fill="none"
          opacity="0.85"
        />

        {/* 3. THIRD INNER THIN BORDER */}
        <rect
          x="26"
          y="26"
          width="748"
          height="1148"
          rx="20"
          stroke="#FAF7F0"
          strokeWidth="1"
          fill="none"
          opacity="0.45"
        />

        {/* VARIANT-SPECIFIC ORNAMENTS */}
        {variant === 'royal-lotus' ? (
          /* ROYAL LOTUS FLOURISHES */
          <>
            {/* Top Crown Lotus */}
            <g transform="translate(400, 18)">
              <circle cx="0" cy="-6" r="4" fill="#FFF" />
              <path d="M 0 -10 C -22 6 -32 28 0 36 C 32 28 22 6 0 -10 Z" fill="url(#hollowFrameGold)" />
              <path d="M -8 18 C -40 14 -80 26 -110 12 C -80 34 -40 30 -8 26 Z" fill="url(#hollowFrameGold)" />
              <path d="M 8 18 C 40 14 80 26 110 12 C 80 34 40 30 8 26 Z" fill="url(#hollowFrameGold)" />
            </g>
            {/* Bottom Crown Lotus */}
            <g transform="translate(400, 1182)">
              <circle cx="0" cy="6" r="4" fill="#FFF" />
              <path d="M 0 10 C -22 -6 -32 -28 0 -36 C 32 -28 22 -6 0 10 Z" fill="url(#hollowFrameGold)" />
              <path d="M -8 -18 C -40 -14 -80 -26 -110 -12 C -80 -34 -40 -30 -8 -26 Z" fill="url(#hollowFrameGold)" />
              <path d="M 8 -18 C 40 -14 80 -26 110 -12 C 80 -34 40 -30 8 -26 Z" fill="url(#hollowFrameGold)" />
            </g>
          </>
        ) : variant === 'golden-filigree' ? (
          /* FINE GOLDEN FILIGREE */
          <>
            <g transform="translate(400, 16)">
              <circle cx="0" cy="0" r="5" fill="url(#hollowFrameGold)" />
              <circle cx="-16" cy="0" r="3" fill="url(#hollowFrameGold)" />
              <circle cx="16" cy="0" r="3" fill="url(#hollowFrameGold)" />
              <path d="M -30 0 C -60 -10 -90 10 -120 0 C -90 18 -60 5 -30 0 Z" fill="url(#hollowFrameGold)" />
              <path d="M 30 0 C 60 -10 90 10 120 0 C 90 18 60 5 30 0 Z" fill="url(#hollowFrameGold)" />
            </g>
            <g transform="translate(400, 1184)">
              <circle cx="0" cy="0" r="5" fill="url(#hollowFrameGold)" />
              <path d="M -30 0 C -60 10 -90 -10 -120 0 C -90 -18 -60 -5 -30 0 Z" fill="url(#hollowFrameGold)" />
              <path d="M 30 0 C 60 10 90 -10 120 0 C 90 -18 60 -5 30 0 Z" fill="url(#hollowFrameGold)" />
            </g>
          </>
        ) : variant === 'minimal-gold' ? (
          /* MINIMALIST METALLIC NOTCHES */
          <>
            <circle cx="400" cy="10" r="4" fill="url(#hollowFrameGold)" />
            <circle cx="400" cy="1190" r="4" fill="url(#hollowFrameGold)" />
            <circle cx="10" cy="600" r="4" fill="url(#hollowFrameGold)" />
            <circle cx="790" cy="600" r="4" fill="url(#hollowFrameGold)" />
          </>
        ) : (
          /* KHMER TRADITIONAL (DEFAULT) */
          <>
            {/* Top Royal Khmer Arch Crest */}
            <g transform="translate(400, 16)">
              <path d="M 0 -8 C -15 8 -25 24 0 32 C 25 24 15 8 0 -8 Z" fill="url(#hollowFrameGold)" />
              <circle cx="0" cy="-10" r="3" fill="#FFF" />
              <path d="M -6 18 C -30 14 -60 22 -85 10 C -60 28 -30 26 -6 24 Z" fill="url(#hollowFrameGold)" />
              <path d="M 6 18 C 30 14 60 22 85 10 C 60 28 30 26 6 24 Z" fill="url(#hollowFrameGold)" />
            </g>
            {/* Bottom Royal Lotus Pedestal */}
            <g transform="translate(400, 1184)">
              <path d="M 0 8 C -15 -8 -25 -24 0 -32 C 25 -24 15 -8 0 8 Z" fill="url(#hollowFrameGold)" />
              <circle cx="0" cy="10" r="3" fill="#FFF" />
              <path d="M -6 -18 C -30 -14 -60 -22 -85 -10 C -60 -28 -30 -26 -6 -24 Z" fill="url(#hollowFrameGold)" />
              <path d="M 6 -18 C 30 -14 60 -22 85 -10 C 60 -28 30 -26 6 -24 Z" fill="url(#hollowFrameGold)" />
            </g>
          </>
        )}

        {/* 4 ORNATE KHMER CORNER MOTIFS */}
        {variant !== 'minimal-gold' && (
          <>
            <g transform="translate(24, 24)">
              <path d="M 0 0 L 70 0 C 45 12 25 32 12 55 L 0 70 Z" fill="url(#hollowFrameGold)" opacity="0.25" />
              <path d="M 0 0 Q 35 10 45 35 Q 20 40 0 50 Z" stroke="url(#hollowFrameGold)" strokeWidth="2" fill="none" />
              <circle cx="8" cy="8" r="4" fill="url(#hollowFrameGold)" />
              <circle cx="22" cy="8" r="2.5" fill="url(#hollowFrameGold)" />
              <circle cx="8" cy="22" r="2.5" fill="url(#hollowFrameGold)" />
            </g>
            <g transform="translate(776, 24) scale(-1, 1)">
              <path d="M 0 0 L 70 0 C 45 12 25 32 12 55 L 0 70 Z" fill="url(#hollowFrameGold)" opacity="0.25" />
              <path d="M 0 0 Q 35 10 45 35 Q 20 40 0 50 Z" stroke="url(#hollowFrameGold)" strokeWidth="2" fill="none" />
              <circle cx="8" cy="8" r="4" fill="url(#hollowFrameGold)" />
              <circle cx="22" cy="8" r="2.5" fill="url(#hollowFrameGold)" />
              <circle cx="8" cy="22" r="2.5" fill="url(#hollowFrameGold)" />
            </g>
            <g transform="translate(24, 1176) scale(1, -1)">
              <path d="M 0 0 L 70 0 C 45 12 25 32 12 55 L 0 70 Z" fill="url(#hollowFrameGold)" opacity="0.25" />
              <path d="M 0 0 Q 35 10 45 35 Q 20 40 0 50 Z" stroke="url(#hollowFrameGold)" strokeWidth="2" fill="none" />
              <circle cx="8" cy="8" r="4" fill="url(#hollowFrameGold)" />
              <circle cx="22" cy="8" r="2.5" fill="url(#hollowFrameGold)" />
              <circle cx="8" cy="22" r="2.5" fill="url(#hollowFrameGold)" />
            </g>
            <g transform="translate(776, 1176) scale(-1, -1)">
              <path d="M 0 0 L 70 0 C 45 12 25 32 12 55 L 0 70 Z" fill="url(#hollowFrameGold)" opacity="0.25" />
              <path d="M 0 0 Q 35 10 45 35 Q 20 40 0 50 Z" stroke="url(#hollowFrameGold)" strokeWidth="2" fill="none" />
              <circle cx="8" cy="8" r="4" fill="url(#hollowFrameGold)" />
              <circle cx="22" cy="8" r="2.5" fill="url(#hollowFrameGold)" />
              <circle cx="8" cy="22" r="2.5" fill="url(#hollowFrameGold)" />
            </g>
          </>
        )}
      </svg>
    </div>
  );
};

interface HollowFrameOverlayProps {
  customFrameUrl?: string;
  frameStyle?: HollowFrameVariant | string;
  frameOpacity?: number;
  frameInset?: number;
  frameFit?: 'fill' | 'contain' | 'cover';
  className?: string;
}

/**
 * Universal Hollow Wedding Frame Overlay Renderer ("Khung Hoa Văn Rỗng / Khung Không")
 * - If customFrameUrl exists: renders as an empty/hollow PNG overlay without solid background
 * - Otherwise: renders the chosen vector SVG Khmer hollow frame variant
 */
export const HollowFrameOverlay: React.FC<HollowFrameOverlayProps> = ({
  customFrameUrl,
  frameStyle = 'khmer-traditional',
  frameOpacity = 1,
  frameInset = 0,
  frameFit = 'fill',
  className = '',
}) => {
  if (frameStyle === 'none' && !customFrameUrl) return null;

  if (customFrameUrl) {
    const fitClass =
      frameFit === 'contain'
        ? 'object-contain'
        : frameFit === 'cover'
        ? 'object-cover'
        : 'object-fill';

    return (
      <div
        className={`absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-[32px] select-none ${className}`}
        style={{
          padding: `${frameInset}px`,
        }}
      >
        <img
          src={customFrameUrl}
          alt="Khung hoa văn rỗng"
          className={`w-full h-full ${fitClass} pointer-events-none drop-shadow-lg select-none transition-all duration-300`}
          style={{ opacity: frameOpacity }}
        />
      </div>
    );
  }

  // Render SVG Hollow Frame
  const validVariant = (
    ['khmer-traditional', 'royal-lotus', 'golden-filigree', 'minimal-gold', 'none'].includes(
      frameStyle
    )
      ? frameStyle
      : 'khmer-traditional'
  ) as HollowFrameVariant;

  return (
    <KhmerHollowFrame
      variant={validVariant}
      className={className}
    />
  );
};
