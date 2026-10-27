import React, { useRef } from 'react';
import { Sparkles, Upload, Calendar, Clock, MapPin, Heart, Trash2 } from 'lucide-react';
import { Invitation, Language } from '../types/wedding';
import {
  getTranslation,
  translateParentsName,
  translateCoupleName,
  formatSolarDate,
  translateLunarDate,
  translatePersonalizedMessage,
  translateAddress,
  translateRepresentative,
  translateHometown,
} from '../i18n/translations';
import { CoupleNameDisplay, translateVenueName } from './PublicInvitation';
import { WeddingHeartFrame } from './WeddingPhotoFrame';
import { ScrollReveal } from './ScrollReveal';

interface LotusFrameCardProps {
  invitation: Invitation;
  lang: Language;
  customFrameUrl?: string;
  customOrnamentUrl?: string;
  onUploadFrameClick?: () => void;
  onDeleteFrameClick?: () => void;
  onUploadOrnamentClick?: () => void;
  onDeleteOrnamentClick?: () => void;
  onUploadLogoClick?: () => void;
  onUploadPhotoClick?: (target: 'groom' | 'bride') => void;
  onAdjustPhotoClick?: (target: 'groom' | 'bride' | 'logo') => void;
  className?: string;
}

export const LotusFrameCard: React.FC<LotusFrameCardProps> = ({
  invitation,
  lang,
  customFrameUrl,
  customOrnamentUrl,
  onUploadFrameClick,
  onDeleteFrameClick,
  onUploadOrnamentClick,
  onDeleteOrnamentClick,
  onUploadLogoClick,
  onUploadPhotoClick,
  onAdjustPhotoClick,
  className = '',
}) => {
  const groomInputRef = useRef<HTMLInputElement>(null);
  const brideInputRef = useRef<HTMLInputElement>(null);

  const t = getTranslation(lang);
  const isVi = lang === 'vi';
  const isKm = lang === 'km';
  const isEn = lang === 'en';

  const activeOrnamentUrl = customOrnamentUrl ?? invitation.customOrnamentUrl;

  const groomParents = translateParentsName(
    invitation.groom.parents.father,
    invitation.groom.parents.mother,
    lang
  );

  const brideParents = translateParentsName(
    invitation.bride.parents.father,
    invitation.bride.parents.mother,
    lang
  );

  // Helper to format parent names cleanly on 1 single line with Khmer OS Muol Light 20px
  const cleanAndFormatKmParent = (rawName: string | undefined, defaultName: string, prefix: 'លោក' | 'លោកស្រី') => {
    let name = rawName ? rawName.trim() : '';
    name = name.replace(/^(លោកស្រី៖|លោកស្រី:|លោកស្រី|អ្នកស្រី៖|អ្នកស្រី:|អ្នកស្រី|លោក៖|លោក:|លោក)\s*/, '').trim();
    if (!name) name = defaultName;
    return `${prefix} ${name}`;
  };

  const cleanAndFormatViParent = (rawName: string | undefined, defaultName: string, prefix: 'Ông' | 'Bà') => {
    let name = rawName ? rawName.trim() : '';
    name = name.replace(/^(Ông:|Ông|Bà:|Bà)\s*/, '').trim();
    if (!name) name = defaultName;
    return `${prefix}: ${name}`;
  };

  const cleanAndFormatEnParent = (rawName: string | undefined, defaultName: string, prefix: 'Mr.' | 'Mrs.') => {
    let name = rawName ? rawName.trim() : '';
    name = name.replace(/^(Mr\.:|Mr\.|Mrs\.:|Mrs\.)\s*/, '').trim();
    if (!name) name = defaultName;
    return `${prefix} ${name}`;
  };

  const handleGroomPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          invitation.groom.avatar = reader.result as string;
          if (onUploadPhotoClick) onUploadPhotoClick('groom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBridePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          invitation.bride.avatar = reader.result as string;
          if (onUploadPhotoClick) onUploadPhotoClick('bride');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const frameBgStyle = customFrameUrl
    ? {
        backgroundImage: `url(${customFrameUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  const logoTransformStyle = invitation.logoOffset
    ? { transform: `translate(${invitation.logoOffset.x}px, ${invitation.logoOffset.y}px) scale(${invitation.logoOffset.zoom})` }
    : undefined;

  const photoShape = invitation.layoutSettings?.photoShape || 'circle';
  const photoSize = invitation.layoutSettings?.photoSize || 'md';
  const sectionSpacingClass = invitation.layoutSettings?.sectionSpacing === 'compact'
    ? 'space-y-3'
    : invitation.layoutSettings?.sectionSpacing === 'relaxed'
    ? 'space-y-8'
    : invitation.layoutSettings?.sectionSpacing === 'loose'
    ? 'space-y-10'
    : 'space-y-6';

  const cardRadiusClass = invitation.layoutSettings?.frameCornerRadius === 'none'
    ? 'rounded-none'
    : invitation.layoutSettings?.frameCornerRadius === 'md'
    ? 'rounded-2xl'
    : invitation.layoutSettings?.frameCornerRadius === 'full'
    ? 'rounded-[48px]'
    : 'rounded-[36px]';

  return (
    <div
      className={`relative w-full max-w-4xl mx-auto ${cardRadiusClass} border-4 border-[#D4AF37] shadow-2xl overflow-hidden bg-gradient-to-br from-[#023b28] via-[#054a38] to-[#012217] text-[#FAF7F0] p-4 sm:p-8 transition-all duration-300 ${className}`}
      style={frameBgStyle}
    >
      {/* Hidden File Inputs for Direct Photo Upload */}
      <input
        ref={groomInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGroomPhotoChange}
      />
      <input
        ref={brideInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBridePhotoChange}
      />

      {/* Dark semi-transparent overlay if custom frame image is uploaded */}
      {customFrameUrl && (
        <div className="absolute inset-0 bg-black/40 rounded-[32px] pointer-events-none z-0" />
      )}

      {/* Frame & Custom Ornament Upload / Delete Action Buttons */}
      <div className="relative z-30 flex flex-wrap items-center justify-end gap-2 mb-2">
        {onUploadOrnamentClick && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onUploadOrnamentClick}
              className="px-3 py-1.5 bg-amber-500/90 hover:bg-amber-600 text-stone-950 border border-[#F5D77F] rounded-full text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
            >
              <Upload size={13} />
              <span>
                {isVi ? '🌸 Tự Upload Hoa Văn' : isEn ? '🌸 Upload Ornament' : '🌸 បញ្ចូលក្បាច់ផ្កាផ្ទាល់ខ្លួន'}
              </span>
            </button>
            {activeOrnamentUrl && onDeleteOrnamentClick && (
              <button
                type="button"
                onClick={onDeleteOrnamentClick}
                className="p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-full text-xs font-bold shadow-md transition cursor-pointer"
                title={isVi ? 'Xóa hoa văn đã tải lên' : 'លុបក្បាច់ផ្កា'}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}

        {onUploadFrameClick && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onUploadFrameClick}
              className="px-3.5 py-1.5 bg-black/60 hover:bg-black/80 text-[#FDE792] border border-[#D4AF37] rounded-full text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
            >
              <Upload size={13} className="text-[#F5D77F]" />
              <span>
                {isVi ? '🖼️ Tải Khung Thiệp Lên' : isEn ? '🖼️ Upload Frame' : '🖼️ បញ្ចូលស៊ុមផ្ទាល់ខ្លួន'}
              </span>
            </button>
            {customFrameUrl && onDeleteFrameClick && (
              <button
                type="button"
                onClick={onDeleteFrameClick}
                className="p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-full text-xs font-bold shadow-md transition cursor-pointer"
                title={isVi ? 'Xóa khung nền' : 'លុបស៊ុម'}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Custom Uploaded Corners (Only shown if user uploaded customOrnamentUrl) */}
      {activeOrnamentUrl && (
        <>
          <img
            src={activeOrnamentUrl}
            alt="Custom Ornament"
            className="absolute top-3 left-3 z-10 w-10 h-10 sm:w-14 sm:h-14 object-contain pointer-events-none drop-shadow"
          />
          <img
            src={activeOrnamentUrl}
            alt="Custom Ornament"
            className="absolute top-3 right-3 z-10 w-10 h-10 sm:w-14 sm:h-14 object-contain pointer-events-none drop-shadow -scale-x-100"
          />
        </>
      )}

      <div className={`relative z-10 ${sectionSpacingClass}`}>
        {/* 1. TOP CURVED ARCH HEADER BANNER */}
        <ScrollReveal variant="zoom-in" duration={800}>
          <div className="text-center pt-1 pb-1">
            <div className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8A0F1A] via-[#B88329] to-[#8A0F1A] text-[#FDE792] border-2 border-[#F5D77F] shadow-xl backdrop-blur-md">
              <span
                className={`text-lg sm:text-2xl font-bold tracking-wider uppercase block drop-shadow ${
                  isVi ? 'font-times' : isEn ? 'font-cinzel' : 'font-muol'
                }`}
              >
                {isVi
                  ? 'LỄ THÀNH HÔN & TIỆC CƯỚI'
                  : isEn
                  ? 'WEDDING INVITATION'
                  : 'សិរីសួស្តី អាពាហ៍ពិពាហ៍'}
              </span>
            </div>
            <p
              className={`text-xs sm:text-sm text-[#F5D77F] mt-2 font-bold tracking-wide uppercase drop-shadow ${
                isVi ? 'font-times' : isEn ? 'font-cinzel' : 'font-muol'
              }`}
            >
              {t.saveTheDate} • {formatSolarDate(invitation.solarDate, lang)}
            </p>
          </div>
        </ScrollReveal>

        {/* 2. UNIFIED SINGLE FRAME FOR BOTH FAMILIES & COUPLE PHOTOS */}
        <div className="bg-[#FAF7F0]/95 text-[#2C1810] backdrop-blur-md p-5 sm:p-8 rounded-3xl border-4 border-[#D4AF37] shadow-2xl relative overflow-hidden">
          {/* Inner filigree gold line */}
          <div className="absolute inset-1.5 border border-[#D4AF37]/50 rounded-[22px] pointer-events-none" />

          {/* 1. PARENTS SECTION */}
          <ScrollReveal variant="flip-up" duration={900} shimmer className="mb-8 relative z-10 rounded-3xl">
            <div className="bg-gradient-to-b from-[#FFFDF8] via-white to-[#FFFDF8] border-2 border-[#D4AF37] rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden">
              {/* Inner Double Gold Line */}
              <div className="absolute inset-1.5 border border-[#D4AF37]/40 rounded-[20px] pointer-events-none" />

              {/* Custom Uploaded Corner Ornaments (Only rendered if user uploaded customOrnamentUrl) */}
              {activeOrnamentUrl && (
                <>
                  <img src={activeOrnamentUrl} alt="" className="absolute top-2 left-2 w-7 h-7 sm:w-9 sm:h-9 object-contain pointer-events-none" />
                  <img src={activeOrnamentUrl} alt="" className="absolute top-2 right-2 w-7 h-7 sm:w-9 sm:h-9 object-contain pointer-events-none -scale-x-100" />
                  <img src={activeOrnamentUrl} alt="" className="absolute bottom-2 left-2 w-7 h-7 sm:w-9 sm:h-9 object-contain pointer-events-none -scale-y-100" />
                  <img src={activeOrnamentUrl} alt="" className="absolute bottom-2 right-2 w-7 h-7 sm:w-9 sm:h-9 object-contain pointer-events-none -scale-x-100 -scale-y-100" />
                </>
              )}

              {/* Header Badge */}
              <div className="text-center mb-5 relative z-10">
                <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-8 md:px-10 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#8A0F1A] via-[#60050E] to-[#8A0F1A] text-[#FDE792] border-2 border-[#D4AF37] text-[16px] sm:text-[24px] md:text-[30px] font-bold uppercase tracking-wider shadow-md max-w-full">
                  {activeOrnamentUrl && (
                    <img src={activeOrnamentUrl} alt="" className="w-5 h-5 sm:w-8 sm:h-8 object-contain shrink-0" />
                  )}
                  <span className={`${isVi ? 'font-times' : isEn ? 'font-cinzel' : 'font-muol'} leading-snug`}>
                    {isVi
                      ? 'THÂN PHỤ & THÂN MẪU HAI HỌ'
                      : isEn
                      ? 'PARENTS OF BOTH FAMILIES'
                      : 'យើងខ្ញុំជាមាតាបិតា'}
                  </span>
                  {activeOrnamentUrl && (
                    <img src={activeOrnamentUrl} alt="" className="w-5 h-5 sm:w-8 sm:h-8 object-contain -scale-x-100 shrink-0" />
                  )}
                </div>
              </div>

              {/* Parents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center relative z-10">
                {/* GROOM PARENTS SIDE */}
                <ScrollReveal variant="fade-left" delay={120} className="md:col-span-5 text-center flex flex-col items-center justify-center h-full space-y-2.5 sm:space-y-3">
                  <p className="text-[#8A0F1A] text-center leading-normal py-0.5 w-full flex items-center justify-center">
                    {isKm ? (
                      <span className="font-muol text-[16px] sm:text-[20px] inline-block">
                        {cleanAndFormatKmParent(groomParents.father, 'គង់ សុជាតិ', 'លោក')}
                      </span>
                    ) : isVi ? (
                      <span className="font-times font-bold text-[16px] sm:text-[20px] inline-block">
                        {cleanAndFormatViParent(groomParents.father, 'គង់ សុជាតិ', 'Ông')}
                      </span>
                    ) : (
                      <span className="font-sans font-bold text-[16px] sm:text-[20px] inline-block">
                        {cleanAndFormatEnParent(groomParents.father, 'Kong Socheat', 'Mr.')}
                      </span>
                    )}
                  </p>
                  <p className="text-[#8A0F1A] text-center leading-normal py-0.5 w-full flex items-center justify-center">
                    {isKm ? (
                      <span className="font-muol text-[16px] sm:text-[20px] inline-block">
                        {cleanAndFormatKmParent(groomParents.mother, 'អ៊ុក គឹមហុង', 'លោកស្រី')}
                      </span>
                    ) : isVi ? (
                      <span className="font-times font-bold text-[16px] sm:text-[20px] inline-block">
                        {cleanAndFormatViParent(groomParents.mother, 'អ៊ុក គឹមហុង', 'Bà')}
                      </span>
                    ) : (
                      <span className="font-sans font-bold text-[16px] sm:text-[20px] inline-block">
                        {cleanAndFormatEnParent(groomParents.mother, 'Ouk Kimhong', 'Mrs.')}
                      </span>
                    )}
                  </p>
                </ScrollReveal>

                {/* CENTER CONNECTOR DIVIDER */}
                <ScrollReveal variant="zoom-in" delay={220} className="md:col-span-2 flex flex-col items-center justify-center my-1.5 md:my-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full red-royal-gradient border-2 border-[#F5D77F] shadow-lg flex items-center justify-center text-[#FDE792] text-xl sm:text-2xl font-bold">
                    囍
                  </div>
                </ScrollReveal>

                {/* BRIDE PARENTS SIDE */}
                <ScrollReveal variant="fade-right" delay={120} className="md:col-span-5 text-center flex flex-col items-center justify-center h-full space-y-2.5 sm:space-y-3">
                  <p className="text-[#8A0F1A] text-center leading-normal py-0.5 w-full flex items-center justify-center">
                    {isKm ? (
                      <span className="font-muol text-[16px] sm:text-[20px] inline-block">
                        {cleanAndFormatKmParent(brideParents.father, 'ម៉ៅ សុផល', 'លោក')}
                      </span>
                    ) : isVi ? (
                      <span className="font-times font-bold text-[16px] sm:text-[20px] inline-block">
                        {cleanAndFormatViParent(brideParents.father, 'ម៉ៅ សុផល', 'Ông')}
                      </span>
                    ) : (
                      <span className="font-sans font-bold text-[16px] sm:text-[20px] inline-block">
                        {cleanAndFormatEnParent(brideParents.father, 'Mao Sophal', 'Mr.')}
                      </span>
                    )}
                  </p>
                  <p className="text-[#8A0F1A] text-center leading-normal py-0.5 w-full flex items-center justify-center">
                    {isKm ? (
                      <span className="font-muol text-[16px] sm:text-[20px] inline-block">
                        {cleanAndFormatKmParent(brideParents.mother, 'សុខ គឹមលាង', 'លោកស្រី')}
                      </span>
                    ) : isVi ? (
                      <span className="font-times font-bold text-[16px] sm:text-[20px] inline-block">
                        {cleanAndFormatViParent(brideParents.mother, 'សុខ គឹមលាង', 'Bà')}
                      </span>
                    ) : (
                      <span className="font-sans font-bold text-[16px] sm:text-[20px] inline-block">
                        {cleanAndFormatEnParent(brideParents.mother, 'Sok Kimleang', 'Mrs.')}
                      </span>
                    )}
                  </p>
                </ScrollReveal>
              </div>
            </div>
          </ScrollReveal>

          {/* 2. COUPLE SECTION WITH 30PX BANNER (ខ្ញុំជាគូ) */}
          <ScrollReveal variant="zoom-in" duration={800} className="text-center mb-8 sm:mb-10 relative z-10">
            <div className="inline-flex items-center gap-3 px-6 sm:px-8 py-2.5 rounded-full bg-gradient-to-r from-[#8A0F1A] via-[#60050E] to-[#8A0F1A] text-[#FDE792] border-2 border-[#D4AF37] shadow-xl backdrop-blur-md">
              {activeOrnamentUrl && (
                <img src={activeOrnamentUrl} alt="" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
              )}
              <span
                className={`text-[20px] sm:text-[30px] font-bold uppercase tracking-wider text-[#FDE792] drop-shadow-md ${
                  isVi ? 'font-times' : isEn ? 'font-cinzel' : 'font-muol'
                }`}
              >
                {isKm
                  ? '(ខ្ញុំជាគូ)'
                  : isVi
                  ? 'ĐÔI TÂN LANG TÂN NƯƠNG'
                  : 'THE HAPPY COUPLE'}
              </span>
              {activeOrnamentUrl && (
                <img src={activeOrnamentUrl} alt="" className="w-6 h-6 sm:w-8 sm:h-8 object-contain -scale-x-100" />
              )}
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
            {/* LEFT BOX: GROOM (CHÚ RỂ / ខាងប្រុស) */}
            <ScrollReveal variant="fade-left" delay={100} className="md:col-span-5 text-center flex flex-col items-center justify-between h-full space-y-4">
              <div className="my-1">
                <WeddingHeartFrame
                  src={invitation.groom.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                  alt={invitation.groom.fullName}
                  roleTitle={isKm ? 'កូនប្រុស' : t.groom}
                  badgeBgClass="bg-[#8A0F1A] text-[#FDE792]"
                  size={photoSize}
                  shape={photoShape}
                  effect="glow"
                  lang={lang}
                  uploadLabel={isVi ? 'Tải ảnh Chú rể' : isEn ? "Groom's Photo" : 'រូបថតកូនកំលោះ'}
                  photoOffset={invitation.groom.avatarOffset}
                  onPhotoUpload={(dataUrl) => {
                    invitation.groom.avatar = dataUrl;
                    if (onUploadPhotoClick) onUploadPhotoClick('groom');
                  }}
                  onAdjustClick={
                    onAdjustPhotoClick ? () => onAdjustPhotoClick('groom') : undefined
                  }
                />
              </div>

              <div className="w-full text-center space-y-2 mt-2">
                <span
                  className={`text-xs sm:text-sm text-stone-600 block mb-1.5 uppercase font-bold tracking-wide leading-normal ${
                    isVi ? 'font-times' : isEn ? 'font-sans' : 'font-muol'
                  }`}
                >
                  {isKm ? 'កូនប្រុស' : isVi ? 'Chú Rể' : 'Groom'}
                </span>
                <CoupleNameDisplay
                  fullName={translateCoupleName(invitation.groom.fullName, lang) || (isKm ? 'គង់ សីហា' : 'Kong Seyha')}
                  textColorClass="text-[#8A0F1A]"
                  mainSizeClass="text-[28px] sm:text-[32px]"
                  subSizeClass="text-[18px] sm:text-[20px]"
                  className="mb-3"
                  lang={lang}
                />
              </div>

              {/* Groom Family Details & Address (25px) - Generous line-height so text doesn't stick */}
              <div className="w-full border-t border-[#D4AF37]/40 pt-3.5 mt-2 space-y-2 text-[#2C1810]">
                {invitation.groom.representative && (
                  <p className="text-stone-700 text-[16px] sm:text-[25px] leading-relaxed font-medium">
                    <span className="font-bold">{t.representative}:</span> {translateRepresentative(invitation.groom.representative, lang)}
                  </p>
                )}
                {invitation.groom.hometown && (
                  <p className="text-stone-700 text-[16px] sm:text-[25px] leading-relaxed font-medium">
                    <span className="font-bold">{t.hometown}:</span> {translateHometown(invitation.groom.hometown, lang)}
                  </p>
                )}
                {invitation.groom.familyAddress && (
                  <p className="text-stone-800 text-[16px] sm:text-[25px] leading-relaxed font-semibold">
                    <span className="font-bold text-[#8A0F1A]">{t.address}:</span> {translateAddress(invitation.groom.familyAddress, lang)}
                  </p>
                )}
              </div>
            </ScrollReveal>

            {/* CENTER EMBLEM: LOTUS CIRCLE WITH GOLDEN DOUBLE HAPPINESS (囍) - INCREASED BY 30PX, MOVED UPWARDS (RÊ LÊN TRÊN) */}
            <ScrollReveal variant="royal-bloom" delay={240} className="md:col-span-2 flex flex-col items-center justify-center my-3 md:my-0 -translate-y-4 sm:-translate-y-6 md:-translate-y-8 z-20">
              <div className="hidden md:block w-px h-10 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent mb-3" />
              <div
                onClick={onUploadLogoClick}
                title={isVi ? 'Nhấn để tải/đổi Logo' : isEn ? 'Click to change Logo' : 'ចុចដើម្បីប្តូរ Logo'}
                className="relative w-[110px] h-[110px] sm:w-[126px] sm:h-[126px] rounded-full red-royal-gradient border-4 border-[#F5D77F] shadow-2xl flex items-center justify-center text-center p-2 group cursor-pointer hover:scale-105 transition overflow-hidden"
              >
                {invitation.logoUrl ? (
                  <img
                    src={invitation.logoUrl}
                    alt="Wedding Monogram"
                    style={logoTransformStyle}
                    className="w-full h-full object-contain rounded-full transition-transform duration-200"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-5xl sm:text-6xl text-[#FDE792] font-bold block drop-shadow-md leading-none">
                      囍
                    </span>
                    <span
                      className={`text-[10px] sm:text-[11px] text-[#FDE792] block uppercase font-bold mt-1 tracking-wider ${
                        isVi ? 'font-times' : isEn ? 'font-cinzel' : 'font-muol'
                      }`}
                    >
                      {isVi ? 'Hôn Lễ' : isEn ? 'Wedding' : 'អាពាហ៍ពិពាហ៍'}
                    </span>
                  </div>
                )}

                {/* Hover overlay for quick upload */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold text-center p-1 rounded-full">
                  <span>{isVi ? 'Đổi Logo' : isEn ? 'Change Logo' : 'ប្តូរ Logo'}</span>
                </div>
              </div>

              {/* Adjust position button if logo exists */}
              {invitation.logoUrl && onAdjustPhotoClick && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdjustPhotoClick('logo');
                  }}
                  className="mt-2 px-2.5 py-1 bg-black/70 hover:bg-black/90 text-[#FDE792] border border-[#D4AF37] rounded-full text-[10px] font-bold shadow-md transition flex items-center gap-1 cursor-pointer backdrop-blur-md"
                  title={isVi ? 'Rê / Chỉnh vị trí Logo' : 'តម្រឹមទីតាំង Logo'}
                >
                  <span>↔ ↕ {isVi ? 'Rê Logo' : 'តម្រឹម Logo'}</span>
                </button>
              )}

              <div className="flex items-center gap-1.5 mt-3 text-[#D4AF37]">
                <Sparkles size={14} />
                <Heart size={14} className="fill-[#8A0F1A] text-[#8A0F1A]" />
                <Sparkles size={14} />
              </div>
              <div className="hidden md:block w-px h-10 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent mt-3" />
            </ScrollReveal>

            {/* RIGHT BOX: BRIDE (CÔ DÂU / ខាងស្រី) */}
            <ScrollReveal variant="fade-right" delay={100} className="md:col-span-5 text-center flex flex-col items-center justify-between h-full space-y-4">
              <div className="my-1">
                <WeddingHeartFrame
                  src={invitation.bride.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={invitation.bride.fullName}
                  roleTitle={isKm ? 'កូនស្រី' : t.bride}
                  badgeBgClass="bg-[#B37D28] text-amber-50"
                  size={photoSize}
                  shape={photoShape}
                  effect="glow"
                  lang={lang}
                  uploadLabel={isVi ? 'Tải ảnh Cô dâu' : isEn ? "Bride's Photo" : 'រូបថតកូនក្រមុំ'}
                  photoOffset={invitation.bride.avatarOffset}
                  onPhotoUpload={(dataUrl) => {
                    invitation.bride.avatar = dataUrl;
                    if (onUploadPhotoClick) onUploadPhotoClick('bride');
                  }}
                  onAdjustClick={
                    onAdjustPhotoClick ? () => onAdjustPhotoClick('bride') : undefined
                  }
                />
              </div>

              <div className="w-full text-center space-y-2 mt-2">
                <span
                  className={`text-xs sm:text-sm text-stone-600 block mb-1.5 uppercase font-bold tracking-wide leading-normal ${
                    isVi ? 'font-times' : isEn ? 'font-sans' : 'font-muol'
                  }`}
                >
                  {isKm ? 'កូនស្រី' : isVi ? 'Cô Dâu' : 'Bride'}
                </span>
                <CoupleNameDisplay
                  fullName={translateCoupleName(invitation.bride.fullName, lang) || (isKm ? 'ងួន សុវណ្ណា' : 'Nguon Sovanna')}
                  textColorClass="text-[#8A0F1A]"
                  mainSizeClass="text-[28px] sm:text-[32px]"
                  subSizeClass="text-[18px] sm:text-[20px]"
                  className="mb-3"
                  lang={lang}
                />
              </div>

              {/* Bride Family Details & Address (25px) - Generous line-height so text doesn't stick */}
              <div className="w-full border-t border-[#D4AF37]/40 pt-3.5 mt-2 space-y-2 text-[#2C1810]">
                {invitation.bride.representative && (
                  <p className="text-stone-700 text-[16px] sm:text-[25px] leading-relaxed font-medium">
                    <span className="font-bold">{t.representative}:</span> {translateRepresentative(invitation.bride.representative, lang)}
                  </p>
                )}
                {invitation.bride.hometown && (
                  <p className="text-stone-700 text-[16px] sm:text-[25px] leading-relaxed font-medium">
                    <span className="font-bold">{t.hometown}:</span> {translateHometown(invitation.bride.hometown, lang)}
                  </p>
                )}
                {invitation.bride.familyAddress && (
                  <p className="text-stone-800 text-[16px] sm:text-[25px] leading-relaxed font-semibold">
                    <span className="font-bold text-[#8A0F1A]">{t.address}:</span> {translateAddress(invitation.bride.familyAddress, lang)}
                  </p>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* 3. CENTRAL LOWER BOX: CEREMONY SCHEDULE & INVITATION MESSAGE */}
        <ScrollReveal variant="flip-up" delay={140} shimmer>
          <div className="bg-[#FAF7F0]/95 text-[#2C1810] backdrop-blur-xs p-4 sm:p-7 rounded-3xl border-2 border-[#D4AF37] shadow-xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-8 py-2 sm:py-2.5 rounded-full bg-[#023b28] text-[#FDE792] border border-[#D4AF37] shadow-md max-w-full">
            <Calendar size={18} className="text-[#F5D77F] shrink-0" />
            <span className={`text-[15px] sm:text-[20px] leading-snug ${isVi ? 'font-times font-bold' : isEn ? 'font-cinzel font-bold' : 'font-muol font-normal'}`}>
              {isVi
                ? 'THỜI GIAN & ĐỊA ĐIỂM TỔ CHỨC LỄ CƯỚI'
                : isEn
                ? 'TIME & VENUE OF CELEBRATION'
                : 'ពេលវេលា និងទីតាំងប្រារព្ធពិធីអាពាហ៍ពិពាហ៍'}
            </span>
          </div>

          {/* Date & Time display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto font-semibold">
            {/* Box 1: Time */}
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-[#D4AF37]/50 flex items-center justify-center gap-2 shadow-xs">
              <Clock size={20} className="text-[#8A0F1A] shrink-0" />
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <span className={`text-[20px] text-stone-800 ${isKm ? 'font-muol font-normal' : isVi ? 'font-times font-bold' : 'font-cinzel font-bold'}`}>
                  {isVi ? 'Giờ Cử Hành:' : isEn ? 'Time:' : 'ម៉ោងប្រារព្ធពិធី:'}
                </span>
                <strong className="text-[#8A0F1A] font-bold text-[18px]">
                  {invitation.weddingTime || '08:00'}
                </strong>
              </div>
            </div>

            {/* Box 2: Date */}
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-[#D4AF37]/50 flex items-center justify-center gap-2 shadow-xs text-center">
              <Calendar size={20} className="text-[#8A0F1A] shrink-0" />
              <div className="flex flex-col items-center">
                <span className={`text-[20px] text-stone-900 ${isKm ? 'font-muol font-normal' : isVi ? 'font-times font-bold' : 'font-cinzel font-bold'}`}>
                  {formatSolarDate(invitation.solarDate, lang)}
                </span>
                {invitation.lunarDate && (
                  <span className={`text-[18px] text-stone-600 mt-0.5 ${isKm ? 'font-battambang' : 'font-times'}`}>
                    ({translateLunarDate(invitation.lunarDate, lang)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Venue & Location Address */}
          {invitation.reception?.venueName && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 max-w-2xl mx-auto shadow-xs text-center space-y-1">
              <div className="flex items-center justify-center gap-2 font-bold text-[#8A0F1A]">
                <MapPin size={20} className="shrink-0" />
                <span className={`text-[20px] leading-snug ${isKm ? 'font-muol font-normal' : isVi ? 'font-times font-bold' : 'font-cinzel font-bold'}`}>
                  {translateVenueName(invitation.reception.venueName, 'reception', lang)}
                </span>
              </div>
              {invitation.reception.address && (
                <p className={`text-[18px] text-stone-600 font-medium leading-relaxed ${isKm ? 'font-battambang' : 'font-times'}`}>
                  {translateAddress(invitation.reception.address, lang)}
                </p>
              )}
            </div>
          )}

          {/* Personalized Message */}
          <div className="pt-3 border-t border-stone-200 max-w-2xl mx-auto">
            <p
              className={`text-[18px] text-[#8A0F1A] italic leading-relaxed ${
                isVi ? 'font-times' : isEn ? 'font-sans' : 'font-battambang'
              }`}
            >
              "{translatePersonalizedMessage(invitation.personalizedMessage, lang)}"
            </p>
          </div>
        </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

