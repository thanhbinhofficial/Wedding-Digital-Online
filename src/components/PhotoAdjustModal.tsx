import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Move, Upload } from 'lucide-react';
import { Language } from '../types/wedding';

interface PhotoOffset {
  x: number;
  y: number;
  zoom: number;
}

interface PhotoAdjustModalProps {
  isOpen: boolean;
  imageSrc: string;
  title: string;
  initialOffset?: PhotoOffset;
  frameType?: 'heart' | 'circle' | 'square' | 'logo';
  lang?: Language;
  onSave: (newOffset: PhotoOffset) => void;
  onClose: () => void;
  onReplacePhoto?: (newFile: File) => void;
}

export const PhotoAdjustModal: React.FC<PhotoAdjustModalProps> = ({
  isOpen,
  imageSrc,
  title,
  initialOffset = { x: 0, y: 0, zoom: 1 },
  frameType = 'heart',
  lang = 'vi',
  onSave,
  onClose,
  onReplacePhoto,
}) => {
  const [offset, setOffset] = useState<PhotoOffset>(initialOffset);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setOffset(initialOffset || { x: 0, y: 0, zoom: 1 });
    }
  }, [isOpen, initialOffset]);

  if (!isOpen) return null;

  const isVi = lang === 'vi';
  const isKm = lang === 'km';

  const labels = {
    dragHint: isVi
      ? 'Chạm / nhấp và rê chuột để di chuyển ảnh'
      : isKm
      ? 'ចុច & អូសរូបថតដើម្បីផ្លាស់ទី'
      : 'Click & drag to position image',
    zoomLabel: isVi ? 'Phóng to / Thu nhỏ' : isKm ? 'ពង្រីក / បង្រួម' : 'Zoom Level',
    reset: isVi ? 'Đặt lại' : isKm ? 'កំណត់ឡើងវិញ' : 'Reset',
    save: isVi ? 'Xác nhận vị trí' : isKm ? 'រក្សាទុកទីតាំង' : 'Save Position',
    replace: isVi ? 'Đổi ảnh khác' : isKm ? 'ប្តូររូបផ្សេង' : 'Replace Photo',
    cancel: isVi ? 'Hủy' : isKm ? 'បោះបង់' : 'Cancel',
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: offset.x,
      initY: offset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    setOffset((prev) => ({
      ...prev,
      x: dragStartRef.current.initX + deltaX,
      y: dragStartRef.current.initY + deltaY,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Drag Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        initX: offset.x,
        initY: offset.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.startX;
    const deltaY = e.touches[0].clientY - dragStartRef.current.startY;
    setOffset((prev) => ({
      ...prev,
      x: dragStartRef.current.initX + deltaX,
      y: dragStartRef.current.initY + deltaY,
    }));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onReplacePhoto) {
      onReplacePhoto(file);
    }
  };

  // Render Frame Clip Path
  const getClipPathStyle = () => {
    if (frameType === 'heart') {
      return {
        clipPath:
          'path("M 100 182 C 100 182 18 115 18 62 C 18 34 38 18 64 18 C 80 18 93 27 100 38 C 107 27 120 18 136 18 C 162 18 182 34 182 62 C 182 115 100 182 100 182 Z")',
      };
    }
    return {};
  };

  const getContainerShapeClass = () => {
    if (frameType === 'circle') return 'rounded-full';
    if (frameType === 'logo') return 'rounded-2xl border-2 border-[#D4AF37] p-2 bg-white';
    return 'rounded-2xl';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-2 border-[#D4AF37] relative flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2 text-[#8A0F1A]">
            <Move size={20} className="text-[#D4AF37] animate-pulse" />
            <h3 className="font-serif-luxury font-bold text-base sm:text-lg">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full text-stone-500 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drag Hint Banner */}
        <div className="w-full bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-3 py-2 text-xs font-semibold flex items-center justify-center gap-2 mb-4 shadow-xs text-center">
          <Move size={14} className="text-[#8A0F1A] shrink-0" />
          <span>{labels.dragHint}</span>
        </div>

        {/* Interactive Draggable Viewport */}
        <div
          className="relative w-64 h-64 sm:w-72 sm:h-72 bg-stone-900 rounded-2xl flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing border-4 border-[#D4AF37] shadow-inner my-2"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Heart/Ornate Frame Mask SVG Background */}
          {frameType === 'heart' ? (
            <div className="w-full h-full relative flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 w-full h-full z-20 pointer-events-none drop-shadow-md"
              >
                <defs>
                  <linearGradient id="modalGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#CF9E42" />
                    <stop offset="50%" stopColor="#F5D77F" />
                    <stop offset="100%" stopColor="#B88329" />
                  </linearGradient>
                </defs>
                <path
                  d="M100 182 C100 182 18 115 18 62 C18 34 38 18 64 18 C80 18 93 27 100 38 C107 27 120 18 136 18 C162 18 182 34 182 62 C182 115 100 182 100 182 Z"
                  fill="none"
                  stroke="url(#modalGoldGrad)"
                  strokeWidth="5"
                />
              </svg>
              <div
                className="w-full h-full relative overflow-hidden"
                style={getClipPathStyle()}
              >
                <img
                  src={imageSrc}
                  alt="Draggable Preview"
                  className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-75"
                  style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${offset.zoom})`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              className={`w-full h-full relative overflow-hidden ${getContainerShapeClass()}`}
            >
              <img
                src={imageSrc}
                alt="Draggable Preview"
                className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-75"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${offset.zoom})`,
                }}
              />
            </div>
          )}

          {/* Active Drag Overlay Indicator */}
          {isDragging && (
            <div className="absolute inset-0 border-2 border-dashed border-[#F5D77F] pointer-events-none z-30 rounded-2xl flex items-center justify-center">
              <span className="bg-black/60 text-[#FDE792] px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                x: {Math.round(offset.x)}px, y: {Math.round(offset.y)}px
              </span>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="w-full mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-700">
            <span className="flex items-center gap-1">
              <ZoomIn size={14} className="text-[#8A0F1A]" />
              {labels.zoomLabel}
            </span>
            <span className="text-[#8A0F1A] font-mono">{Math.round(offset.zoom * 100)}%</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOffset((p) => ({ ...p, zoom: Math.max(0.5, p.zoom - 0.1) }))}
              className="p-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700 transition"
              title="Thu nhỏ"
            >
              <ZoomOut size={16} />
            </button>

            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.02"
              value={offset.zoom}
              onChange={(e) => setOffset((p) => ({ ...p, zoom: parseFloat(e.target.value) }))}
              className="w-full accent-[#8A0F1A] h-2 bg-stone-200 rounded-lg cursor-pointer"
            />

            <button
              onClick={() => setOffset((p) => ({ ...p, zoom: Math.min(2.5, p.zoom + 0.1) }))}
              className="p-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700 transition"
              title="Phóng to"
            >
              <ZoomIn size={16} />
            </button>

            <button
              onClick={() => setOffset({ x: 0, y: 0, zoom: 1 })}
              className="p-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700 transition flex items-center gap-1 text-xs font-bold"
              title={labels.reset}
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-6 pt-4 border-t border-stone-200 flex flex-col sm:flex-row gap-2">
          {onReplacePhoto && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Upload size={15} className="text-[#8A0F1A]" />
                <span>{labels.replace}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              onSave(offset);
              onClose();
            }}
            className="flex-1 py-2.5 px-4 red-royal-gradient text-[#FDE792] border border-[#F5D77F] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 transition"
          >
            <Check size={16} />
            <span>{labels.save}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
