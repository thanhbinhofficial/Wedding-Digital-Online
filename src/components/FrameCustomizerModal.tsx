import React, { useState, useRef } from 'react';
import { Upload, X, Check, Sparkles, Image as ImageIcon, Sliders, Trash2, Eye } from 'lucide-react';
import { Language } from '../types/wedding';
import { HollowFrameVariant, KhmerHollowFrame } from './KhmerWeddingPatterns';

interface FrameCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentFrameStyle?: HollowFrameVariant | string;
  currentCustomFrameUrl?: string;
  currentFrameFit?: 'fill' | 'contain' | 'cover';
  currentFrameOpacity?: number;
  currentFrameInset?: number;
  onApplyFrame: (settings: {
    frameStyle: HollowFrameVariant;
    customFrameUrl?: string;
    frameFit: 'fill' | 'contain' | 'cover';
    frameOpacity: number;
    frameInset: number;
  }) => void;
}

export const FrameCustomizerModal: React.FC<FrameCustomizerModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentFrameStyle = 'khmer-traditional',
  currentCustomFrameUrl = '',
  currentFrameFit = 'fill',
  currentFrameOpacity = 1,
  currentFrameInset = 0,
  onApplyFrame,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'upload'>('preset');
  const [selectedStyle, setSelectedStyle] = useState<HollowFrameVariant>(
    (currentCustomFrameUrl ? 'custom' : (currentFrameStyle as HollowFrameVariant)) || 'khmer-traditional'
  );
  const [customUrl, setCustomUrl] = useState<string>(currentCustomFrameUrl || '');
  const [fit, setFit] = useState<'fill' | 'contain' | 'cover'>(currentFrameFit);
  const [opacity, setOpacity] = useState<number>(currentFrameOpacity);
  const [inset, setInset] = useState<number>(currentFrameInset);
  const [urlInput, setUrlInput] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isVi = lang === 'vi';
  const isKm = lang === 'km';
  const isEn = lang === 'en';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomUrl(result);
        setSelectedStyle('custom');
        setActiveTab('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setCustomUrl(urlInput.trim());
      setSelectedStyle('custom');
      setUrlInput('');
    }
  };

  const handleRemoveCustom = () => {
    setCustomUrl('');
    setSelectedStyle('khmer-traditional');
  };

  const handleSave = () => {
    onApplyFrame({
      frameStyle: selectedStyle,
      customFrameUrl: selectedStyle === 'custom' ? customUrl : undefined,
      frameFit: fit,
      frameOpacity: opacity,
      frameInset: inset,
    });
    onClose();
  };

  const presetList: Array<{
    id: HollowFrameVariant;
    nameVi: string;
    nameKm: string;
    nameEn: string;
    descVi: string;
    descKm: string;
    descEn: string;
    badgeVi: string;
    badgeKm: string;
    badgeEn: string;
  }> = [
    {
      id: 'khmer-traditional',
      nameVi: 'Khung Không Khmer Hoàng Gia',
      nameKm: 'ស៊ុមផ្កាក្បាច់ខ្មែររាជានិយម',
      nameEn: 'Royal Khmer Hollow Frame',
      descVi: 'Khung rỗng hoa văn Kbach Angkor & hoa sen hoàng gia truyền thống',
      descKm: 'ស៊ុមប្រហោងក្បាច់អង្គរ និងផ្កាឈូកមាសបុរាណប្រណិត',
      descEn: 'Authentic royal Khmer Kbach filigree with transparent center',
      badgeVi: 'Truyền Thống',
      badgeKm: 'ប្រពៃណី',
      badgeEn: 'Traditional',
    },
    {
      id: 'royal-lotus',
      nameVi: 'Khung Không Hoa Sen Cung Đình',
      nameKm: 'ស៊ុមផ្កាឈូកហ្លួង',
      nameEn: 'Royal Lotus Palace Frame',
      descVi: 'Viền vương miện búp sen và cánh sen vàng cung đình thanh nhã',
      descKm: 'ស៊ុមត្រួយផ្កាឈូក និងស្រទាប់ផ្កាឈូកមាសរាជវាំង',
      descEn: 'Royal court lotus crest with delicate petals and hollow center',
      badgeVi: 'Cung Đình',
      badgeKm: 'រាជវាំង',
      badgeEn: 'Palace',
    },
    {
      id: 'golden-filigree',
      nameVi: 'Khung Không Kim Tuyến Cổ Điển',
      nameKm: 'ស៊ុមមាសវិចិត្រ',
      nameEn: 'Vintage Golden Filigree',
      descVi: 'Viền ren kim tuyến đôi baroque uốn lượn sang trọng',
      descKm: 'ស៊ុមបន្ទាត់មាសភ្លោះ រចនាបថបុរាណទាក់ទាញ',
      descEn: 'Intricate vintage double-gold filigree lace frame',
      badgeVi: 'Quý Tộc',
      badgeKm: 'អភិជន',
      badgeEn: 'Noble',
    },
    {
      id: 'minimal-gold',
      nameVi: 'Khung Không Viền Tối Giản',
      nameKm: 'ស៊ុមមាសរលោង',
      nameEn: 'Minimalist Metallic Frame',
      descVi: 'Viền đôi mạ vàng tối giản, hiện đại và tinh tế',
      descKm: 'ស៊ុមមាសបន្ទាត់ភ្លោះ សាមញ្ញ និងទាន់សម័យ',
      descEn: 'Clean modern double metallic gold inset borders',
      badgeVi: 'Hiện Đại',
      badgeKm: 'ទាន់សម័យ',
      badgeEn: 'Modern',
    },
    {
      id: 'none',
      nameVi: 'Không Khung Viền',
      nameKm: 'គ្មានស៊ុម',
      nameEn: 'No Frame Overlay',
      descVi: 'Ẩn lớp khung hoa văn ngoài, giữ nguyên nền thiệp',
      descKm: 'មិនបង្ហាញស្រទាប់ស៊ុមខាងក្រៅ',
      descEn: 'Hide the decorative outer frame overlay',
      badgeVi: 'Tối Giản',
      badgeKm: 'ទទេ',
      badgeEn: 'None',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border-2 border-[#D4AF37] relative max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-[#D4AF37] flex items-center justify-center text-amber-900 shadow-xs">
              <Sparkles size={20} className="text-[#8A0F1A]" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#8A0F1A]">
                {isVi
                  ? 'Khung Hoa Văn Thiệp Cưới (Khung Không & Tải Lên)'
                  : isKm
                  ? 'រចនាស៊ុមផ្កាក្បាច់អាពាហ៍ពិពាហ៍ (ស៊ុមប្រហោង & បញ្ចូលរូប)'
                  : 'Wedding Frame Customizer (Hollow Frame & Upload)'}
              </h3>
              <p className="text-xs text-stone-500">
                {isVi
                  ? 'Thiết kế theo dạng khung rỗng (không che nền) để viền quanh thiệp cưới trang trọng'
                  : isKm
                  ? 'រចនាជាស៊ុមប្រហោង (គ្មានផ្ទៃបាំង) ដើម្បីលម្អជុំវិញសំបុត្រការ'
                  : 'Designed with a transparent cutout center to elegantly border the invitation'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 mt-3">
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'preset'
                ? 'border-[#8A0F1A] text-[#8A0F1A] bg-amber-50/50'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>🪷</span>
            <span>
              {isVi ? '1. Khung Không Hoa Văn Có Sẵn' : isKm ? '១. ស៊ុមប្រហោងគំរូ' : '1. Preset Hollow Frames'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#8A0F1A] text-[#8A0F1A] bg-amber-50/50'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>📤</span>
            <span>
              {isVi ? '2. Tải Lên Khung Riêng (PNG Khung Không)' : isKm ? '២. បញ្ចូលរូបស៊ុមផ្ទាល់ខ្លួន' : '2. Upload Custom Frame'}
            </span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {activeTab === 'preset' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presetList.map((preset) => {
                  const isSelected = selectedStyle === preset.id && !customUrl;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSelectedStyle(preset.id);
                        setCustomUrl('');
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#8A0F1A] ring-2 ring-[#8A0F1A]/20 bg-amber-50/70 shadow-sm'
                          : 'border-stone-200 hover:border-amber-400 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-[#8A0F1A] border border-amber-200">
                            {isVi ? preset.badgeVi : isKm ? preset.badgeKm : preset.badgeEn}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#8A0F1A] text-white flex items-center justify-center text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-[#8A0F1A]">
                          {isVi ? preset.nameVi : isKm ? preset.nameKm : preset.nameEn}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                          {isVi ? preset.descVi : isKm ? preset.descKm : preset.descEn}
                        </p>
                      </div>

                      {/* Mini Live Preview Box with Checkerboard Background */}
                      <div className="mt-3 h-16 w-full rounded-xl bg-gradient-to-br from-[#023b28] via-[#054a38] to-[#012217] relative overflow-hidden flex items-center justify-center border border-[#D4AF37]/50 shadow-inner">
                        {preset.id !== 'none' ? (
                          <KhmerHollowFrame variant={preset.id} className="scale-95" />
                        ) : null}
                        <span className="text-[10px] text-[#FDE792] font-semibold opacity-80 z-20">
                          {isVi ? 'Thiệp Cưới' : isKm ? 'សំបុត្រការ' : 'Wedding'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {customUrl && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <img src={customUrl} alt="Custom Frame" className="w-10 h-10 object-contain rounded border border-emerald-300 bg-stone-100" />
                    <span className="text-xs font-bold text-emerald-800">
                      {isVi ? '✓ Bạn đang có khung tự tải lên' : '✓ Custom frame uploaded'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStyle('custom');
                      setActiveTab('upload');
                    }}
                    className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition cursor-pointer"
                  >
                    {isVi ? 'Xem & Chỉnh' : 'Edit Frame'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Notice regarding Transparent Hollow Frame */}
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
                <span className="text-base leading-none">💡</span>
                <p className="leading-relaxed">
                  <strong className="font-bold">
                    {isVi ? 'Định dạng chuẩn "Khung Không": ' : isKm ? 'ទ្រង់ទ្រាយស៊ុមប្រហោង៖ ' : 'Transparent Hollow Frame: '}
                  </strong>
                  {isVi
                    ? 'Nên sử dụng ảnh PNG hoặc SVG trong suốt (có phần giữa rỗng ruột) để viền hoa văn ôm trọn lấy thiệp cưới và không che lấp chữ.'
                    : isKm
                    ? 'សូមប្រើប្រាស់រូបភាព PNG ឬ SVG ដែលមានផ្ទៃកណ្តាលថ្លា (ប្រហោង) ដើម្បីកុំឱ្យបាំងអក្សរសំបុត្រការ។'
                    : 'Use transparent PNG or SVG with a hollow cutout center so the ornate border frames the text without obscuring it.'}
                </p>
              </div>

              {/* Upload Drop Zone & File Selector */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D4AF37] hover:border-[#8A0F1A] hover:bg-amber-50/30 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 text-[#8A0F1A] flex items-center justify-center shadow-xs">
                  <Upload size={22} />
                </div>
                <div>
                  <span className="font-bold text-sm text-[#8A0F1A] block">
                    {isVi ? 'Nhấn để chọn file ảnh khung hoặc kéo thả vào đây' : isKm ? 'ចុចដើម្បីជ្រើសរើសរូបស៊ុម' : 'Click to select frame or drag & drop'}
                  </span>
                  <span className="text-[11px] text-stone-500 mt-0.5 block">
                    Hỗ trợ PNG trong suốt, SVG, WebP, JPG (Tối đa 15MB)
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/webp,image/jpeg"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Or paste link URL */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={isVi ? 'Dán link hình ảnh khung mẫu (http...)' : 'Paste frame image URL...'}
                  className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-[#8A0F1A]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-[#8A0F1A] hover:bg-[#60050E] text-[#FDE792] rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs"
                >
                  {isVi ? 'Dùng Link' : 'Use URL'}
                </button>
              </div>

              {/* Preview & Fine-tuning controls if customUrl is present */}
              {customUrl ? (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Eye size={14} className="text-[#8A0F1A]" />
                      <span>{isVi ? 'Xem trước Khung Không Tự Tải Lên' : 'Custom Frame Preview'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCustom}
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>{isVi ? 'Xóa khung này' : 'Remove'}</span>
                    </button>
                  </div>

                  {/* Checkerboard Preview Area */}
                  <div className="h-44 w-full rounded-xl bg-gradient-to-br from-[#023b28] via-[#054a38] to-[#012217] relative overflow-hidden flex items-center justify-center p-3 border border-[#D4AF37] shadow-inner">
                    {/* Simulated Card Content */}
                    <div className="w-[85%] h-[80%] rounded-xl bg-[#FAF7F0]/90 border border-[#D4AF37]/50 flex flex-col items-center justify-center p-2 text-center text-[#2C1810]">
                      <span className="text-[10px] text-[#8A0F1A] font-bold uppercase tracking-wider">
                        {isVi ? 'Lễ Thành Hôn & Tiệc Cưới' : 'សិរីសួស្តី អាពាហ៍ពិពាហ៍'}
                      </span>
                      <span className="text-xs font-bold text-stone-800 mt-1">
                        គង់ សីហា ♥ មាស សុវណ្ណារី
                      </span>
                      <span className="text-[9px] text-stone-500 mt-0.5">
                        {isVi ? '(Nội dung thiệp hiển thị trọn vẹn qua khung rỗng)' : '(Content shows through hollow frame)'}
                      </span>
                    </div>

                    {/* Frame Overlay Preview */}
                    <div
                      className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
                      style={{ padding: `${inset}px` }}
                    >
                      <img
                        src={customUrl}
                        alt="Uploaded Frame"
                        className={`w-full h-full ${
                          fit === 'contain' ? 'object-contain' : fit === 'cover' ? 'object-cover' : 'object-fill'
                        }`}
                        style={{ opacity: opacity }}
                      />
                    </div>
                  </div>

                  {/* Adjustment Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {/* Frame Fit */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {isVi ? 'Cách Lồng Viền (Fit)' : 'Fit Mode'}
                      </label>
                      <select
                        value={fit}
                        onChange={(e) => setFit(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                      >
                        <option value="fill">{isVi ? 'Kéo giãn đều (Fill)' : 'Stretch Fill'}</option>
                        <option value="contain">{isVi ? 'Vừa vặn (Contain)' : 'Contain'}</option>
                        <option value="cover">{isVi ? 'Bao phủ mép (Cover)' : 'Cover'}</option>
                      </select>
                    </div>

                    {/* Frame Inset */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-stone-700 mb-1">
                        <span>{isVi ? 'Khoảng cách lề (Inset)' : 'Inset'}</span>
                        <span>{inset}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        value={inset}
                        onChange={(e) => setInset(Number(e.target.value))}
                        className="w-full accent-[#8A0F1A]"
                      />
                    </div>

                    {/* Frame Opacity */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-stone-700 mb-1">
                        <span>{isVi ? 'Độ mờ / Đậm' : 'Opacity'}</span>
                        <span>{Math.round(opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.4"
                        max="1"
                        step="0.05"
                        value={opacity}
                        onChange={(e) => setOpacity(Number(e.target.value))}
                        className="w-full accent-[#8A0F1A]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-stone-400 italic">
                  {isVi
                    ? 'Chưa có khung custom. Hãy chọn file tải lên hoặc dùng khung không có sẵn ở Tab 1.'
                    : 'No custom frame uploaded yet. Upload a file or pick from Tab 1.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {isVi ? 'Đóng' : isKm ? 'បិទ' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-[#8A0F1A] via-[#B88329] to-[#8A0F1A] hover:brightness-110 text-[#FDE792] border border-[#F5D77F] text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={14} />
            <span>
              {isVi ? 'Áp Dụng Khung Thiệp Cưới' : isKm ? 'អនុវត្តស៊ុមសំបុត្រការ' : 'Apply Wedding Frame'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
