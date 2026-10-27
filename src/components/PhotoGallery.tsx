import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Grid,
  Film,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Move,
  Upload,
} from 'lucide-react';
import { Language } from '../types/wedding';
import {
  KhmerCornerKbach,
  KhmerHeaderFlourish,
  KhmerWatermarkPattern,
  KhmerFloralDivider,
} from './KhmerWeddingPatterns';

interface PhotoGalleryProps {
  photos: string[];
  photoOffsets?: Record<number, { x: number; y: number; zoom: number }>;
  lang: Language;
  onPhotoUpload?: (index: number, dataUrl: string) => void;
  onAdjustClick?: (index: number, url: string) => void;
  onAddPhoto?: (dataUrl: string) => void;
  className?: string;
  enableUpload?: boolean;
}

const DEFAULT_COUPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
];

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos: initialPhotos,
  photoOffsets = {},
  lang = 'vi',
  onPhotoUpload,
  onAdjustClick,
  onAddPhoto,
  className = '',
  enableUpload = true,
}) => {
  // Use provided photos or fallback to rich sample photos
  const displayPhotos =
    initialPhotos && initialPhotos.length > 0 ? initialPhotos : DEFAULT_COUPLE_PHOTOS;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slideshow' | 'grid'>('slideshow');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleUploadRef = useRef<HTMLInputElement>(null);
  const [uploadTargetIdx, setUploadTargetIdx] = useState<number | null>(null);

  const isVi = lang === 'vi';
  const isKm = lang === 'km';
  const isEn = lang === 'en';

  const total = displayPhotos.length;

  // Next / Prev slide handlers
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Slideshow auto-advance timer (every 4.5s)
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, handleNext]);

  // Keyboard navigation for lightbox & slideshow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, handleNext, handlePrev]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    setTouchStartX(null);
  };

  const openLightboxAt = (index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
    setLightboxOpen(true);
  };

  const handleSinglePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPhotoUpload && uploadTargetIdx !== null) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onPhotoUpload(uploadTargetIdx, reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAddPhoto) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onAddPhoto(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentPhoto = displayPhotos[currentIndex] || displayPhotos[0];
  const currentOffset = photoOffsets[currentIndex];
  const offsetStyle = currentOffset
    ? {
        transform: `translate(${currentOffset.x}px, ${currentOffset.y}px) scale(${currentOffset.zoom})`,
      }
    : undefined;

  return (
    <section className={`max-w-6xl mx-auto px-4 py-14 sm:py-20 ${className}`}>
      {/* Hidden file inputs for photo upload */}
      <input
        ref={singleUploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSinglePhotoFile}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAddPhotoFile}
      />

      {/* HEADER SECTION WITH KHMER ORNAMENTS */}
      <div className="text-center mb-10 relative z-10">
        <KhmerHeaderFlourish className="mb-3" />

        <div className="inline-flex items-center gap-3 px-7 sm:px-10 py-2.5 rounded-full bg-gradient-to-r from-[#8A0F1A] via-[#60050E] to-[#8A0F1A] text-[#FDE792] border-2 border-[#D4AF37] shadow-xl backdrop-blur-md mb-3">
          <span className="text-[#F5D77F] text-base sm:text-2xl drop-shadow">🪷</span>
          <h2
            className={`text-xl sm:text-3xl font-bold uppercase tracking-wider text-[#FDE792] drop-shadow-md ${
              isVi ? 'font-times' : isEn ? 'font-cinzel' : 'font-muol'
            }`}
          >
            {isVi
              ? 'ALBUM ẢNH CƯỚI HẠNH PHÚC'
              : isEn
              ? 'WEDDING PHOTO GALLERY'
              : 'កម្រងរូបភាពអនុស្សាវរីយ៍'}
          </h2>
          <span className="text-[#F5D77F] text-base sm:text-2xl drop-shadow">🪷</span>
        </div>

        <p className="text-stone-600 text-sm sm:text-base font-medium max-w-xl mx-auto mt-2">
          {isVi
            ? 'Những khoảnh khắc ngọt ngào nhất ghi dấu hành trình tình yêu đôi lứa'
            : isEn
            ? 'Sweetest memories celebrating the romantic journey of our love'
            : 'ទស្សនាកម្រងរូបភាពផ្អែមល្ហែម និងអនុស្សាវរីយ៍នៃក្តីស្រឡាញ់'}
        </p>

        {/* View Mode Switcher (Slideshow vs Grid) */}
        <div className="inline-flex items-center gap-1.5 p-1 bg-[#FAF7F0] border border-[#D4AF37]/50 rounded-full shadow-inner mt-4">
          <button
            type="button"
            onClick={() => setViewMode('slideshow')}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'slideshow'
                ? 'bg-[#8A0F1A] text-[#FDE792] shadow-md border border-[#F5D77F]'
                : 'text-stone-700 hover:text-[#8A0F1A]'
            }`}
          >
            <Film size={15} />
            <span>{isVi ? 'Trình Chiếu' : isEn ? 'Slideshow' : 'បញ្ចាំងស្លាយ'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#8A0F1A] text-[#FDE792] shadow-md border border-[#F5D77F]'
                : 'text-stone-700 hover:text-[#8A0F1A]'
            }`}
          >
            <Grid size={15} />
            <span>{isVi ? 'Lưới Ảnh' : isEn ? 'Grid View' : 'ក្រឡារូបភាព'}</span>
          </button>
        </div>
      </div>

      {/* 1. SLIDESHOW VIEW */}
      {viewMode === 'slideshow' ? (
        <div className="relative max-w-4xl mx-auto">
          {/* Main Ornate Slideshow Card Frame */}
          <div className="relative rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-[#FFFDF8] via-[#FAF7F0] to-[#FFFDF8] border-3 border-[#D4AF37] shadow-2xl overflow-hidden">
            {/* Subtle Khmer Royal Watermark Damask */}
            <KhmerWatermarkPattern className="opacity-[0.04]" />

            {/* Khmer Golden Corners */}
            <KhmerCornerKbach position="top-left" size={48} className="absolute top-2 left-2 z-20" />
            <KhmerCornerKbach position="top-right" size={48} className="absolute top-2 right-2 z-20" />
            <KhmerCornerKbach position="bottom-left" size={48} className="absolute bottom-2 left-2 z-20" />
            <KhmerCornerKbach position="bottom-right" size={48} className="absolute bottom-2 right-2 z-20" />

            {/* Main Slide Image Display */}
            <div
              onClick={() => openLightboxAt(currentIndex)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              title={isVi ? 'Nhấp để xem phóng to (Lightbox)' : isEn ? 'Click to enlarge (Lightbox)' : 'ចុចដើម្បីមើលទំហំធំ'}
              className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-stone-900 group cursor-pointer shadow-inner border border-[#D4AF37]/40"
            >
              <img
                key={currentIndex}
                src={currentPhoto}
                alt={`Wedding Photo ${currentIndex + 1}`}
                style={offsetStyle}
                className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
              />

              {/* Shading Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              {/* Top Banner: Photo Counter & Lightbox Expand Button */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-white pointer-events-auto">
                <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/70 text-[#FDE792] text-xs font-bold shadow-md">
                  {isVi
                    ? `Ảnh ${currentIndex + 1} / ${total}`
                    : isEn
                    ? `Photo ${currentIndex + 1} of ${total}`
                    : `រូបថត ${currentIndex + 1} / ${total}`}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightboxAt(currentIndex);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-[#D4AF37]/70 text-[#FDE792] text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  title={isVi ? 'Phóng to ảnh' : isEn ? 'Enlarge Photo' : 'ពង្រីករូបថត'}
                >
                  <Maximize2 size={14} />
                  <span>{isVi ? 'Phóng to' : isEn ? 'Full Screen' : 'ពង្រីកធំ'}</span>
                </button>
              </div>

              {/* Left / Right Slide Navigation Buttons */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/55 hover:bg-black/85 text-[#FDE792] border border-[#D4AF37] shadow-xl flex items-center justify-center transition-all duration-200 z-20 group-hover:scale-110 cursor-pointer backdrop-blur-sm"
                title={isVi ? 'Ảnh trước' : isEn ? 'Previous' : 'រូបថតមុន'}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/55 hover:bg-black/85 text-[#FDE792] border border-[#D4AF37] shadow-xl flex items-center justify-center transition-all duration-200 z-20 group-hover:scale-110 cursor-pointer backdrop-blur-sm"
                title={isVi ? 'Ảnh tiếp theo' : isEn ? 'Next' : 'រូបថតបន្ទាប់'}
              >
                <ChevronRight size={24} />
              </button>

              {/* Bottom Quick Actions: Play/Pause, Adjust Position, Upload */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying((p) => !p);
                    }}
                    className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 text-[#FDE792] border border-[#D4AF37]/70 text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isPlaying ? (isVi ? 'Tạm dừng' : isEn ? 'Pause' : 'ផ្អាក') : (isVi ? 'Tự động chạy' : isEn ? 'Auto Play' : 'ចាក់បន្ត')}</span>
                  </button>

                  {/* Adjust photo position if custom handler available */}
                  {onAdjustClick && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdjustClick(currentIndex, currentPhoto);
                      }}
                      className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 text-[#FDE792] border border-[#D4AF37]/70 text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                      title={isVi ? 'Rê / Chỉnh vị trí ảnh này' : 'តម្រឹមរូបថត'}
                    >
                      <Move size={13} />
                      <span>{isVi ? 'Rê ảnh' : isEn ? 'Adjust' : 'តម្រឹម'}</span>
                    </button>
                  )}
                </div>

                {/* Change photo button */}
                {enableUpload && onPhotoUpload && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadTargetIdx(currentIndex);
                      singleUploadRef.current?.click();
                    }}
                    className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 text-[#FDE792] border border-[#D4AF37]/70 text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                  >
                    <Upload size={13} />
                    <span>{isVi ? 'Đổi ảnh' : isEn ? 'Change' : 'ប្តូររូប'}</span>
                  </button>
                )}
              </div>

              {/* Autoplay Progress Line */}
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 z-30">
                  <div
                    key={currentIndex}
                    className="h-full bg-gradient-to-r from-[#CF9E42] via-[#F5D77F] to-[#FDE792] animate-[galleryProgress_4.5s_linear]"
                  />
                </div>
              )}
            </div>

            {/* Thumbnail Strip Below Main Slide */}
            <div className="mt-4 pt-3 border-t border-[#D4AF37]/30">
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#D4AF37]/50">
                {displayPhotos.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                      currentIndex === idx
                        ? 'ring-3 ring-[#D4AF37] ring-offset-2 ring-offset-[#FAF7F0] scale-105 shadow-lg'
                        : 'opacity-65 hover:opacity-100 hover:scale-102 border border-[#D4AF37]/40'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                    {currentIndex === idx && (
                      <div className="absolute inset-0 bg-[#8A0F1A]/20 flex items-center justify-center">
                        <Sparkles size={14} className="text-[#FDE792] drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}

                {/* Add Photo Button if enabled */}
                {enableUpload && onAddPhoto && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-[#D4AF37] hover:border-[#8A0F1A] bg-amber-50/60 hover:bg-amber-100/80 flex flex-col items-center justify-center text-[#8A0F1A] transition text-xs font-bold cursor-pointer"
                    title={isVi ? 'Thêm ảnh mới vào album' : isEn ? 'Add Photo' : 'បញ្ចូលរូបថតបន្ថែម'}
                  >
                    <Upload size={16} />
                    <span className="text-[10px] mt-0.5">{isVi ? '+ Thêm' : isEn ? '+ Add' : '+ បន្ថែម'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. GRID VIEW WITH ROYAL GOLD FRAMES */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayPhotos.map((url, idx) => {
            const offset = photoOffsets[idx];
            const itemStyle = offset
              ? {
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${offset.zoom})`,
                }
              : undefined;

            return (
              <div
                key={idx}
                onClick={() => openLightboxAt(idx)}
                className="group relative rounded-2xl overflow-hidden shadow-lg border-2 border-[#D4AF37]/70 bg-gradient-to-b from-[#FFFDF8] to-[#FAF7F0] p-1.5 transition-all duration-300 hover:shadow-2xl hover:border-[#F5D77F] hover:-translate-y-1 cursor-pointer"
              >
                {/* Khmer Miniature Corner Accent */}
                <div className="absolute top-2 left-2 z-20 text-[#F5D77F] pointer-events-none opacity-85 text-xs drop-shadow">
                  🪷
                </div>

                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-900">
                  <img
                    src={url}
                    alt={`Gallery Photo ${idx + 1}`}
                    style={itemStyle}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Dark Shimmer Overlay with Expand Icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-[#FDE792] p-2 text-center">
                    <Maximize2 size={24} className="mb-1 drop-shadow" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isVi ? 'Xem ảnh' : isEn ? 'View Photo' : 'មើលរូបថត'}
                    </span>
                  </div>
                </div>

                {/* Card Footer with Index & Quick Adjust */}
                <div className="mt-1.5 px-1 flex items-center justify-between text-[11px] text-stone-600 font-semibold">
                  <span>
                    {isVi ? `Ảnh #${idx + 1}` : isEn ? `Photo #${idx + 1}` : `រូប #${idx + 1}`}
                  </span>
                  {onAdjustClick && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdjustClick(idx, url);
                      }}
                      className="text-[#8A0F1A] hover:text-[#B88329] flex items-center gap-0.5"
                    >
                      <Move size={11} />
                      <span>{isVi ? 'Rê' : 'តម្រឹម'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Photo Card in Grid View */}
          {enableUpload && onAddPhoto && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-[#D4AF37] hover:border-[#8A0F1A] bg-amber-50/40 hover:bg-amber-100/60 p-4 aspect-square flex flex-col items-center justify-center text-center cursor-pointer transition text-[#8A0F1A] group"
            >
              <div className="w-12 h-12 rounded-full bg-[#8A0F1A] text-[#FDE792] flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform">
                <Upload size={20} />
              </div>
              <span className="text-xs font-bold">
                {isVi ? 'Thêm ảnh mới' : isEn ? 'Add New Photo' : 'បញ្ចូលរូបថតបន្ថែម'}
              </span>
              <span className="text-[10px] text-stone-500 mt-1">
                {isVi ? 'Tải lên từ máy' : isEn ? 'Upload from device' : 'ផ្ទុកឡើងពីទូរស័ព្ទ/កុំព្យូទ័រ'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Centered Khmer Floral Divider */}
      <div className="mt-12">
        <KhmerFloralDivider />
      </div>

      {/* 3. FULL-SCREEN LIGHTBOX MODAL WITH SLIDESHOW CONTROLS */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-6 animate-fadeIn"
        >
          {/* Top Bar: Title, Counter, Zoom, Slideshow Toggle & Close Button */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl flex items-center justify-between text-white z-20 pb-3 border-b border-[#D4AF37]/30"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[#F5D77F] text-lg sm:text-xl">🪷</span>
              <div>
                <h3
                  className={`text-sm sm:text-lg font-bold text-[#FDE792] ${
                    isVi ? 'font-times' : isEn ? 'font-cinzel' : 'font-muol'
                  }`}
                >
                  {isVi
                    ? 'KHOẢNH KHẮC TÌNH YÊU'
                    : isEn
                    ? 'WEDDING ALBUM'
                    : 'កម្រងរូបភាពអនុស្សាវរីយ៍'}
                </h3>
                <span className="text-xs text-stone-300">
                  {isVi
                    ? `Ảnh ${currentIndex + 1} trên tổng số ${total} ảnh`
                    : isEn
                    ? `Photo ${currentIndex + 1} of ${total}`
                    : `រូបថតទី ${currentIndex + 1} នៃ ${total}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Play / Pause Toggle in Lightbox */}
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="px-3 py-1.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-[#FDE792] border border-[#D4AF37]/50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title={isPlaying ? 'Dừng chiếu' : 'Tự động chiếu'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span className="hidden sm:inline">
                  {isPlaying ? (isVi ? 'Dừng' : isEn ? 'Pause' : 'ផ្អាក') : (isVi ? 'Chạy' : isEn ? 'Play' : 'ចាក់')}
                </span>
              </button>

              {/* Zoom In/Out Toggle */}
              <button
                type="button"
                onClick={() => setIsZoomed((z) => !z)}
                className="p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-[#FDE792] border border-[#D4AF37]/50 transition cursor-pointer"
                title={isZoomed ? 'Thu nhỏ' : 'Phóng to'}
              >
                {isZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-full bg-[#8A0F1A] hover:bg-[#AA1926] text-[#FDE792] border border-[#D4AF37] transition cursor-pointer shadow-lg"
                title={isVi ? 'Đóng (Esc)' : 'Close (Esc)'}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Main Lightbox Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-2 sm:my-4 overflow-hidden"
          >
            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-[#FDE792] border-2 border-[#D4AF37] shadow-2xl flex items-center justify-center transition-all duration-200 z-30 hover:scale-110 cursor-pointer backdrop-blur-md"
              title={isVi ? 'Ảnh trước (←)' : 'Previous (←)'}
            >
              <ChevronLeft size={28} />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-[#FDE792] border-2 border-[#D4AF37] shadow-2xl flex items-center justify-center transition-all duration-200 z-30 hover:scale-110 cursor-pointer backdrop-blur-md"
              title={isVi ? 'Ảnh tiếp theo (→)' : 'Next (→)'}
            >
              <ChevronRight size={28} />
            </button>

            {/* Enlarged Photo Image */}
            <div className="relative max-h-[75vh] max-w-full flex items-center justify-center">
              <img
                src={currentPhoto}
                alt={`Lightbox Wedding Photo ${currentIndex + 1}`}
                style={
                  isZoomed
                    ? { transform: 'scale(1.45)', cursor: 'zoom-out' }
                    : offsetStyle
                }
                onClick={() => setIsZoomed((z) => !z)}
                className={`max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl border-2 border-[#D4AF37]/60 transition-transform duration-300 select-none ${
                  isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                }`}
              />
            </div>
          </div>

          {/* Bottom Thumbnails Strip in Lightbox */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl z-20 pt-2 border-t border-[#D4AF37]/30"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-[#D4AF37]/50">
              {displayPhotos.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                    currentIndex === idx
                      ? 'ring-2 ring-[#F5D77F] scale-110 shadow-lg border border-white'
                      : 'opacity-40 hover:opacity-85'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
