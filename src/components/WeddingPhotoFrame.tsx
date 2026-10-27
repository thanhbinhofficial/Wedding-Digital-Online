import React, { useRef } from 'react';
import { Move, Upload } from 'lucide-react';
import { Language } from '../types/wedding';

interface WeddingGalleryFrameProps {
  src: string;
  alt: string;
  caption?: string;
  photoOffset?: { x: number; y: number; zoom: number };
  onAdjustClick?: (e: React.MouseEvent) => void;
  onPhotoUpload?: (url: string) => void;
  lang?: Language;
  onClick?: () => void;
  className?: string;
}

/**
 * Modern Wedding Gallery Photo Frame ("Khung hoa văn album cưới")
 * Features gold filigree corners, double metallic border, drag alignment & photo upload.
 */
export const WeddingGalleryFrame: React.FC<WeddingGalleryFrameProps> = ({
  src,
  alt,
  caption,
  photoOffset,
  onAdjustClick,
  onPhotoUpload,
  lang = 'vi',
  onClick,
  className = '',
}) => {
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const transformStyle = photoOffset
    ? { transform: `translate(${photoOffset.x}px, ${photoOffset.y}px) scale(${photoOffset.zoom})` }
    : undefined;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPhotoUpload) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onPhotoUpload(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden shadow-lg border-2 border-[#D4AF37]/60 bg-stone-900 transition-all duration-500 hover:shadow-2xl hover:border-[#F5D77F] ${className}`}
    >
      {/* Inner Double Inset Border Frame */}
      <div className="absolute inset-1.5 rounded-xl border border-[#D4AF37]/40 pointer-events-none z-10 group-hover:border-[#F5D77F] transition-colors" />

      {/* Interactive Action Buttons (Rê / Căn Chỉnh & Upload) - Accessible on Touch & Mouse */}
      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 flex items-center gap-1.5 opacity-95 sm:opacity-90 group-hover:opacity-100 transition">
        {onAdjustClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdjustClick(e);
            }}
            className="p-2 sm:p-1.5 rounded-full bg-black/80 hover:bg-black text-[#FDE792] border border-[#F5D77F] shadow-md active:scale-95 transition cursor-pointer"
            title={lang === 'vi' ? 'Rê / Căn chỉnh vị trí ảnh' : 'Adjust photo position'}
          >
            <Move size={13} />
          </button>
        )}
        {onPhotoUpload && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              galleryFileInputRef.current?.click();
            }}
            className="p-2 sm:p-1.5 rounded-full bg-[#8A0F1A] hover:bg-[#60050E] text-[#FDE792] border border-[#F5D77F] shadow-md active:scale-95 transition cursor-pointer"
            title={lang === 'vi' ? 'Tải lên / Đổi ảnh này' : 'Upload photo'}
          >
            <Upload size={13} />
          </button>
        )}
        <input
          ref={galleryFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Photo Image */}
      <div
        onClick={onClick}
        className="aspect-square w-full overflow-hidden relative cursor-pointer"
      >
        <img
          src={src}
          alt={alt}
          style={transformStyle}
          draggable={false}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 select-none"
        />

        {/* Touch & Hover Dark Gradient Overlay & Zoom Hint */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5 sm:p-3 text-white z-20 pointer-events-none">
          <span className="text-[#FDE792] text-[11px] sm:text-xs font-bold flex items-center gap-1">
            <span>✤</span>
            <span className="truncate">{caption || (lang === 'vi' ? 'Xem ảnh phóng to' : 'View enlarged photo')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

interface WeddingLogoFrameProps {
  logoUrl?: string | null;
  onUploadClick: () => void;
  logoOffset?: { x: number; y: number; zoom: number };
  onAdjustClick?: () => void;
  lang?: Language;
  className?: string;
}

/**
 * Modern Wedding Logo Frame with Ornate Gold Crest Accent
 */
export const WeddingLogoFrame: React.FC<WeddingLogoFrameProps> = ({
  logoUrl,
  onUploadClick,
  logoOffset,
  onAdjustClick,
  lang,
  className = '',
}) => {
  const transformStyle = logoOffset
    ? { transform: `translate(${logoOffset.x}px, ${logoOffset.y}px) scale(${logoOffset.zoom})` }
    : undefined;

  return (
    <div className={`relative group inline-flex flex-col items-center justify-center -translate-y-2 sm:-translate-y-4 my-2 ${className}`}>
      {/* Outer Golden Halo Glow */}
      <div className="absolute inset-0 rounded-3xl bg-[#D4AF37]/20 blur-md group-hover:scale-110 transition-transform duration-500 pointer-events-none" />

      <div
        onClick={onUploadClick}
        title={lang === 'vi' ? 'Nhấn để tải/đổi Logo' : lang === 'en' ? 'Click to change Logo' : 'ចុចដើម្បីប្តូរ Logo'}
        className="relative p-2 rounded-3xl red-royal-gradient border-2 border-[#F5D77F] shadow-xl group-hover:scale-105 transition-transform duration-300 overflow-hidden cursor-pointer"
      >
        <div className="w-[94px] h-[94px] sm:w-[110px] sm:h-[110px] bg-white rounded-2xl flex items-center justify-center p-2 overflow-hidden relative shadow-inner">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Wedding Logo"
              style={transformStyle}
              className="w-full h-full object-contain rounded-xl transition-transform duration-200"
            />
          ) : (
            <div className="text-center">
              <span className="text-5xl sm:text-6xl text-[#8A0F1A] font-muol font-normal block leading-none drop-shadow">
                囍
              </span>
              <span className="text-[11px] sm:text-[12px] uppercase font-bold text-[#B88329] tracking-wider block mt-1">
                LOGO
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold text-center p-1 rounded-2xl">
            <span>{lang === 'vi' ? 'Tải Logo' : lang === 'en' ? 'Upload Logo' : 'ប្តូរ Logo'}</span>
          </div>
        </div>
      </div>

      {/* Adjust Logo Position Drag Button */}
      {logoUrl && onAdjustClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdjustClick();
          }}
          className="mt-1.5 px-2.5 py-0.5 rounded-full shadow border border-[#F5D77F] bg-stone-900 text-[#FDE792] hover:bg-black text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
          title={lang === 'vi' ? 'Chỉnh / Rê vị trí Logo' : lang === 'en' ? 'Adjust Logo Position' : 'តម្រឹម Logo'}
        >
          <span>🖐️</span>
          <span>{lang === 'vi' ? 'Rê Logo' : lang === 'en' ? 'Drag Logo' : 'តម្រឹម Logo'}</span>
        </button>
      )}
    </div>
  );
};

interface WeddingHeartFrameProps {
  src: string;
  alt: string;
  roleTitle?: string;
  badgeBgClass?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'heart' | 'square' | 'oval';
  effect?: 'glow' | 'warm' | 'vintage' | 'sparkle' | 'none';
  className?: string;
  onClick?: () => void;
  onPhotoUpload?: (dataUrl: string) => void;
  photoOffset?: { x: number; y: number; zoom: number };
  onAdjustClick?: () => void;
  lang?: Language;
  uploadLabel?: string;
}

/**
 * Ornate Golden Heart Wedding Frame ("Khung Hình Trái Tim Hoa Văn Mạ Vàng")
 * Features handcrafted golden heart filigree outline, crown crest, interactive photo effects, and direct photo upload support.
 */
export const WeddingHeartFrame: React.FC<WeddingHeartFrameProps> = ({
  src,
  alt,
  roleTitle,
  badgeBgClass = 'bg-[#8A0F1A] text-[#FDE792]',
  size = 'lg',
  shape = 'circle',
  effect = 'glow',
  className = '',
  onClick,
  onPhotoUpload,
  photoOffset,
  onAdjustClick,
  lang = 'vi',
  uploadLabel,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Responsive dimensions across small phones (320px+), tablets, and desktops
  const containerSizeClass = {
    sm: 'w-36 h-36 sm:w-40 sm:h-40',
    md: 'w-44 h-44 sm:w-52 sm:h-52',
    lg: 'w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72',
    xl: 'w-64 h-64 sm:w-72 sm:h-72 md:w-88 md:h-88',
  }[size];

  const imageFilterClass = {
    glow: 'contrast-[1.05] brightness-[1.03] saturate-[1.1]',
    warm: 'sepia-[15%] contrast-[1.08] brightness-[1.02] saturate-[1.15]',
    vintage: 'sepia-[30%] contrast-[1.1] brightness-[0.98]',
    sparkle: 'contrast-[1.05] brightness-[1.08] saturate-[1.2]',
    none: '',
  }[effect];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPhotoUpload) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContainerClick = () => {
    if (onPhotoUpload) {
      fileInputRef.current?.click();
    } else if (onClick) {
      onClick();
    }
  };

  const isVi = lang === 'vi';
  const isEn = lang === 'en';
  const fontRoleClass = isVi ? 'font-times font-bold' : isEn ? 'font-cinzel font-bold' : 'font-muol font-normal';

  const transformStyle = photoOffset
    ? { transform: `translate(${photoOffset.x}px, ${photoOffset.y}px) scale(${photoOffset.zoom})` }
    : undefined;

  const isCircle = shape === 'circle';
  const isSquare = shape === 'square';
  const isOval = shape === 'oval';

  return (
    <div
      onClick={handleContainerClick}
      title={onPhotoUpload ? (isVi ? 'Nhấn để tải/đổi hình ảnh' : isEn ? 'Click to change photo' : 'ចុចដើម្បីប្តូររូបថត') : undefined}
      className={`relative flex flex-col items-center justify-center group ${
        onPhotoUpload || onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Hidden file input for quick direct upload */}
      {onPhotoUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {/* Outer Shimmering Glow */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-r from-[#D4AF37]/40 via-[#F5D77F]/60 to-[#8A0F1A]/30 blur-xl group-hover:scale-110 transition-transform duration-700 animate-pulse" />

      {/* Frame Container */}
      <div className={`relative ${containerSizeClass} flex items-center justify-center transition-transform duration-500 group-hover:scale-105`}>
        {/* SVG Ornate Golden Filigree Frame Border */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full z-20 pointer-events-none drop-shadow-xl"
        >
          <defs>
            <linearGradient id="goldenFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CF9E42" />
              <stop offset="25%" stopColor="#F5D77F" />
              <stop offset="60%" stopColor="#B88329" />
              <stop offset="85%" stopColor="#FDE792" />
              <stop offset="100%" stopColor="#9E6E1A" />
            </linearGradient>
            <linearGradient id="roseRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#AA1926" />
              <stop offset="100%" stopColor="#68050E" />
            </linearGradient>
          </defs>

          {isSquare ? (
            <g>
              <rect x="12" y="12" width="176" height="176" rx="20" fill="none" stroke="url(#goldenFrameGrad)" strokeWidth="4" />
              <rect x="18" y="18" width="164" height="164" rx="16" fill="none" stroke="#FAF7F2" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
              <circle cx="100" cy="12" r="4" fill="url(#goldenFrameGrad)" />
            </g>
          ) : isOval ? (
            <g>
              <ellipse cx="100" cy="100" rx="80" ry="92" fill="none" stroke="url(#goldenFrameGrad)" strokeWidth="4" />
              <ellipse cx="100" cy="100" rx="74" ry="86" fill="none" stroke="#FAF7F2" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
            </g>
          ) : isCircle ? (
            /* Circular Gold Border Frame */
            <g>
              <circle cx="100" cy="100" r="92" fill="none" stroke="url(#goldenFrameGrad)" strokeWidth="2.5" />
              <circle cx="100" cy="100" r="86" fill="none" stroke="url(#goldenFrameGrad)" strokeWidth="3.5" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#FAF7F2" strokeWidth="1.5" opacity="0.8" />
            </g>
          ) : (
            /* Heart Border Path */
            <g>
              <path
                d="M100 182 C100 182 18 115 18 62 C18 34 38 18 64 18 C80 18 93 27 100 38 C107 27 120 18 136 18 C162 18 182 34 182 62 C182 115 100 182 100 182 Z"
                fill="none"
                stroke="url(#goldenFrameGrad)"
                strokeWidth="4"
              />
              <path
                d="M100 174 C100 174 24 111 24 62 C24 38 42 24 64 24 C78 24 90 32 100 42 C110 32 122 24 136 24 C158 24 176 38 176 62 C176 111 100 174 100 174 Z"
                fill="none"
                stroke="#FAF7F2"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                opacity="0.8"
              />
            </g>
          )}
        </svg>

        {/* Masked Image Container */}
        <div
          className={`relative overflow-hidden group-hover:scale-108 transition-transform duration-700 shadow-2xl ${
            isSquare
              ? 'w-[82%] h-[82%] rounded-2xl border-2 border-[#FAF7F2]'
              : isOval
              ? 'w-[78%] h-[88%] rounded-[50%] border-2 border-[#FAF7F2]'
              : isCircle
              ? 'w-[80%] h-[80%] rounded-full border-2 border-[#FAF7F2]'
              : 'w-[82%] h-[82%]'
          }`}
          style={
            shape === 'heart'
              ? {
                  clipPath:
                    'path("M 100 182 C 100 182 18 115 18 62 C 18 34 38 18 64 18 C 80 18 93 27 100 38 C 107 27 120 18 136 18 C 162 18 182 34 182 62 C 182 115 100 182 100 182 Z")',
                }
              : undefined
          }
        >
          {/* Background red royal backing tint */}
          <div className="absolute inset-0 red-royal-gradient" />

          {/* Actual Photo Image */}
          {src ? (
            <img
              src={src}
              alt={alt}
              style={transformStyle}
              className={`w-full h-full object-cover object-center relative z-10 ${imageFilterClass} group-hover:scale-105 transition-transform duration-300`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-amber-200 z-10 p-2 text-center">
              <span className="text-2xl sm:text-3xl">📷</span>
              <span className={`text-[10px] mt-1 font-semibold ${fontRoleClass}`}>
                {uploadLabel || (isVi ? 'Tải ảnh lên' : isEn ? 'Upload Photo' : 'បញ្ចូលរូបថត')}
              </span>
            </div>
          )}

          {/* Sparkle Light / Upload Hover Overlay */}
          <div className={`absolute inset-0 bg-black/50 opacity-0 ${onPhotoUpload ? 'group-hover:opacity-100' : ''} transition-opacity duration-300 z-30 flex flex-col items-center justify-center text-white text-[11px] font-bold p-1 text-center`}>
            <span className="text-base mb-0.5">📷</span>
            <span>{uploadLabel || (isVi ? 'Đổi/Tải ảnh' : isEn ? 'Change Photo' : 'ប្តូររូបថត')}</span>
          </div>
        </div>
      </div>

      {/* Role Badge Tag & Drag Adjust Button */}
      <div className="relative z-30 -mt-2 flex items-center gap-1.5">
        {roleTitle && (
          <div className={`px-4 py-1 rounded-full shadow-lg border border-[#F5D77F] ${fontRoleClass} text-xs tracking-wide uppercase flex items-center gap-1.5 transition-transform duration-300 group-hover:-translate-y-0.5`}>
            <span className={`px-3 py-0.5 rounded-full ${badgeBgClass} shadow-inner`}>
              {roleTitle}
            </span>
          </div>
        )}

        {onAdjustClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdjustClick();
            }}
            className="px-2.5 py-1 rounded-full shadow-lg border border-[#F5D77F] bg-stone-900 text-[#FDE792] hover:bg-black text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
            title={isVi ? 'Rê / Chỉnh vị trí hình ảnh' : isEn ? 'Adjust photo position' : 'តម្រឹមទីតាំងរូប'}
          >
            <span>🖐️</span>
            <span>{isVi ? 'Rê hình' : isEn ? 'Drag image' : 'តម្រឹមរូប'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const WeddingAvatarFrame = WeddingHeartFrame;
