import React, { useState } from 'react';
import { X, Upload, Palette, Sparkles, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Language, TemplateId } from '../types/wedding';
import { LanguageSelector } from './LanguageFlags';

interface DefaultTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onToggleLang?: (lang: Language) => void;
}

export const DefaultTemplateModal: React.FC<DefaultTemplateModalProps> = ({
  isOpen,
  onClose,
  lang,
  onToggleLang,
}) => {
  const [currentLang, setCurrentLang] = useState<Language>(lang);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync internal state with prop if changed
  React.useEffect(() => {
    setCurrentLang(lang);
  }, [lang]);

  const handleLangChange = (newLang: Language) => {
    setCurrentLang(newLang);
    if (onToggleLang) {
      onToggleLang(newLang);
    }
  };

  // Load existing default template settings
  const [templateConfig, setTemplateConfig] = useState(() => {
    try {
      const raw = localStorage.getItem('wedding_default_custom_template');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return {
      templateId: 'royal-red' as TemplateId,
      frameStyle: 'royal-red-filigree',
      customFrameUrl: '',
      rsvpFrameUrl: '',
    };
  });

  if (!isOpen) return null;

  const handleFileUpload = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, filename: file.name }),
        });
        const data = await res.json();
        if (data.url) {
          callback(data.url);
        } else {
          callback(dataUrl);
        }
      } catch (err) {
        callback(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem('wedding_default_custom_template', JSON.stringify(templateConfig));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  // Translations dictionary for the modal
  const modalText = {
    vi: {
      title: 'Đăng Mẫu Thiệp & Cấu Hình Khung Mặc Định',
      subtitle: 'Tất cả mẫu thiệp mới được tạo sẽ tự động thay đổi theo mẫu & khung bạn chọn ở đây',
      saveSuccessMsg: 'Đã đăng mẫu thiệp & lưu làm Mặc Định thành công! Khi bấm "Tạo Thiệp Mới", hệ thống sẽ tự động áp dụng mẫu này.',
      section1Title: '1. Chọn Phong Cách Mẫu Thiệp Đăng Mới',
      section2Title: '2. Tự Upload Khung Mẫu Thiệp Cưới (Chính)',
      section2Sub: 'Khung viền ảnh nền hiển thị trên trang thiệp cưới chính',
      placeholderMain: 'Dán link ảnh khung mẫu (http...)',
      uploadMainBtn: 'Tải Lên Khung',
      frameSetMsg: '✓ Khung Mẫu Đã Đặt',
      deleteFrameBtn: 'Xóa khung',
      section3Title: '3. Tự Upload Khung Thiệp Xác Nhận Tham Dự (RSVP)',
      section3Sub: 'Khung viền cho form xác nhận tham dự cưới',
      placeholderRsvp: 'Dán link ảnh khung RSVP...',
      uploadRsvpBtn: 'Tải Khung RSVP',
      rsvpSetMsg: '✓ Khung RSVP Đã Đặt',
      deleteRsvpBtn: 'Xóa khung RSVP',
      cancelBtn: 'Hủy',
      saveBtn: 'Đăng & Lưu Mẫu Mặc Định',
      templates: [
        { id: 'royal-red', name: 'Hoàng Gia Đỏ Kim', desc: 'Sắc đỏ may mắn hoa văn mạ vàng', color: 'from-[#8A0F1A] to-[#60050E]' },
        { id: 'golden-elegance', name: 'Vàng Hoàng Kim', desc: 'Sắc vàng kim sang trọng quý phái', color: 'from-[#CF9E42] to-[#8C6219]' },
        { id: 'floral-cream', name: 'Kem Hoa Tinh Khôi', desc: 'Tông kem hoa mềm mại nhẹ nhàng', color: 'from-[#FDFBF7] to-[#EFE8DC]' },
        { id: 'khmer-traditional', name: 'Khmer Truyền Thống', desc: 'Hoa văn Khmer truyền thống tinh xảo', color: 'from-[#9B111E] to-[#D4AF37]' },
        { id: 'emerald-gold', name: 'Xanh Ngọc Bích', desc: 'Xanh bích vòm vàng kim đẳng cấp', color: 'from-[#047857] to-[#065F46]' },
      ],
    },
    km: {
      title: 'ចុះផ្សាយគំរូសំបុត្រ & កំណត់ស៊ុមរូបភាព Mặc Định',
      subtitle: 'រាល់ពេលបង្កើតសំបុត្រការថ្មី ប្រព័ន្ធនឹងអនុវត្តគំរូ និងស៊ុមដែលអ្នកបានជ្រើសរើសនៅទីនេះដោយស្វ័យប្រវត្តិ',
      saveSuccessMsg: 'បានចុះផ្សាយគំរូសំបុត្រ និងរក្សាទុកជា Mặc Định រួចរាល់! ប្រព័ន្ធនឹងអនុវត្តគំរូនេះចំពោះសំបុត្រថ្មីៗ។',
      section1Title: '១. ជ្រើសរើសរចនាបថគំរូសំបុត្រការ',
      section2Title: '២. បញ្ចូលរូបភាពស៊ុមសំបុត្រការចម្បង',
      section2Sub: 'រូបភាពស៊ុមបង្ហាញលើសំបុត្រការចម្បង',
      placeholderMain: 'បិទភ្ជាប់តំណរូបភាពស៊ុម (http...)',
      uploadMainBtn: 'បញ្ចូលរូបស៊ុម',
      frameSetMsg: '✓ បានកំណត់ស៊ុមរួចរាល់',
      deleteFrameBtn: 'លុបស៊ុម',
      section3Title: '៣. បញ្ចូលស៊ុមសំបុត្រឆ្លើយតប RSVP',
      section3Sub: 'ស៊ុមសម្រាប់ទម្រង់ឆ្លើយតប RSVP',
      placeholderRsvp: 'បិទភ្ជាប់តំណរូបភាពស៊ុម RSVP...',
      uploadRsvpBtn: 'បញ្ចូលស៊ុម RSVP',
      rsvpSetMsg: '✓ បានកំណត់ស៊ុម RSVP រួចរាល់',
      deleteRsvpBtn: 'លុបស៊ុម RSVP',
      cancelBtn: 'បោះបង់',
      saveBtn: 'ចុះផ្សាយ & រក្សាទុកជា Mặc Định',
      templates: [
        { id: 'royal-red', name: 'គំរូក្រហមមាសរាជវាំង', desc: 'ពណ៌ក្រហមឆើត ជាមួយក្បាច់រោងមាស', color: 'from-[#8A0F1A] to-[#60050E]' },
        { id: 'golden-elegance', name: 'គំរូមាសប្រណិត', desc: 'ពណ៌មាសចែងចាំង រចនាបថទាន់សម័យ', color: 'from-[#CF9E42] to-[#8C6219]' },
        { id: 'floral-cream', name: 'គំរូផ្កាពណ៌ក្រែម', desc: 'ពណ៌ក្រែមទន់ភ្លន់ ជាមួយរូបផ្កាស្រស់', color: 'from-[#FDFBF7] to-[#EFE8DC]' },
        { id: 'khmer-traditional', name: 'គំរូប្រពៃណីខ្មែរ', desc: 'ផ្កាក្បាច់បុរាណខ្មែរវិចិត្រ និងសិរីមង្គល', color: 'from-[#9B111E] to-[#D4AF37]' },
        { id: 'emerald-gold', name: 'គំរូបៃតងត្បូងមាស', desc: 'ផ្ទៃបៃតងត្បូង ជាមួយក្បាច់មាសរាជវាំង', color: 'from-[#047857] to-[#065F46]' },
      ],
    },
    en: {
      title: 'Publish Invitation Template & Default Frame Configuration',
      subtitle: 'All newly created invitations will automatically use the template & frames selected here',
      saveSuccessMsg: 'Template published & set as Default successfully! New invitations will automatically apply this template.',
      section1Title: '1. Select Invitation Template Style',
      section2Title: '2. Upload Custom Main Wedding Frame',
      section2Sub: 'Background frame displayed on the main wedding invitation card',
      placeholderMain: 'Paste frame image URL (http...)',
      uploadMainBtn: 'Upload Frame',
      frameSetMsg: '✓ Frame Applied',
      deleteFrameBtn: 'Remove frame',
      section3Title: '3. Upload Custom RSVP Confirmation Frame',
      section3Sub: 'Border frame for the RSVP attendance modal',
      placeholderRsvp: 'Paste RSVP frame URL...',
      uploadRsvpBtn: 'Upload RSVP Frame',
      rsvpSetMsg: '✓ RSVP Frame Applied',
      deleteRsvpBtn: 'Remove RSVP frame',
      cancelBtn: 'Cancel',
      saveBtn: 'Publish & Set as Default',
      templates: [
        { id: 'royal-red', name: 'Royal Gold Red', desc: 'Velvet red with royal gold ornament', color: 'from-[#8A0F1A] to-[#60050E]' },
        { id: 'golden-elegance', name: 'Golden Elegance', desc: 'Refined noble golden pattern', color: 'from-[#CF9E42] to-[#8C6219]' },
        { id: 'floral-cream', name: 'Floral Cream', desc: 'Soft elegant cream floral palette', color: 'from-[#FDFBF7] to-[#EFE8DC]' },
        { id: 'khmer-traditional', name: 'Khmer Traditional', desc: 'Exquisite traditional Khmer filigree', color: 'from-[#9B111E] to-[#D4AF37]' },
        { id: 'emerald-gold', name: 'Emerald Royal Gold', desc: 'Deep emerald with golden arch', color: 'from-[#047857] to-[#065F46]' },
      ],
    },
  };

  const activeText = modalText[currentLang] || modalText.vi;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-[#D4AF37]/50 relative max-h-[90vh] overflow-y-auto">
        {/* Top Header with Close & Language Switcher */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl red-royal-gradient text-[#FDE792] flex items-center justify-center shadow shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-serif-luxury text-lg lg:text-xl font-bold text-[#8A0F1A]">
                {activeText.title}
              </h2>
              <p className="text-xs text-stone-500">
                {activeText.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector
              currentLang={currentLang}
              onLanguageChange={handleLangChange}
              variant="admin"
            />
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-fadeIn">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <span>{activeText.saveSuccessMsg}</span>
          </div>
        )}

        <div className="space-y-6 mt-6">
          {/* 1. Theme Template Preset Selection */}
          <div>
            <label className="block text-xs font-bold text-[#8A0F1A] uppercase tracking-wider mb-2">
              {activeText.section1Title}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeText.templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setTemplateConfig({ ...templateConfig, templateId: tmpl.id as TemplateId })}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${
                    templateConfig.templateId === tmpl.id
                      ? 'border-[#8A0F1A] bg-red-50/40 ring-2 ring-[#8A0F1A]/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tmpl.color} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs`}>
                    囍
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900">{tmpl.name}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{tmpl.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Custom Main Frame Image Upload */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="block text-xs font-bold text-gray-800">
                {activeText.section2Title}
              </label>
            </div>
            <p className="text-[11px] text-stone-500 mb-3">
              {activeText.section2Sub}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={templateConfig.customFrameUrl || ''}
                onChange={(e) =>
                  setTemplateConfig({
                    ...templateConfig,
                    frameStyle: 'custom',
                    customFrameUrl: e.target.value,
                  })
                }
                placeholder={activeText.placeholderMain}
                className="flex-1 w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl"
              />
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#8A0F1A] hover:bg-[#60050E] text-white text-xs font-semibold rounded-xl cursor-pointer transition whitespace-nowrap">
                <Upload size={14} />
                <span>{activeText.uploadMainBtn}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0], (url) => {
                        setTemplateConfig({
                          ...templateConfig,
                          frameStyle: 'custom',
                          customFrameUrl: url,
                        });
                      });
                    }
                  }}
                />
              </label>
            </div>
            {templateConfig.customFrameUrl && (
              <div className="mt-3 flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200">
                <img src={templateConfig.customFrameUrl} alt="Custom Frame" className="w-14 h-14 object-contain rounded border" />
                <div className="text-xs">
                  <span className="font-bold text-green-700 block">{activeText.frameSetMsg}</span>
                  <button
                    type="button"
                    onClick={() => setTemplateConfig({ ...templateConfig, customFrameUrl: '', frameStyle: 'royal-red-filigree' })}
                    className="text-red-600 hover:underline text-[11px]"
                  >
                    {activeText.deleteFrameBtn}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Custom RSVP Frame Upload */}
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80">
            <label className="block text-xs font-bold text-gray-800 mb-1">
              {activeText.section3Title}
            </label>
            <p className="text-[11px] text-stone-500 mb-3">
              {activeText.section3Sub}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={templateConfig.rsvpFrameUrl || ''}
                onChange={(e) =>
                  setTemplateConfig({
                    ...templateConfig,
                    rsvpFrameUrl: e.target.value,
                  })
                }
                placeholder={activeText.placeholderRsvp}
                className="flex-1 w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl"
              />
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#8A0F1A] hover:bg-[#60050E] text-white text-xs font-semibold rounded-xl cursor-pointer transition whitespace-nowrap">
                <Upload size={14} />
                <span>{activeText.uploadRsvpBtn}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0], (url) => {
                        setTemplateConfig({
                          ...templateConfig,
                          rsvpFrameUrl: url,
                        });
                      });
                    }
                  }}
                />
              </label>
            </div>
            {templateConfig.rsvpFrameUrl && (
              <div className="mt-3 flex items-center gap-3 p-2 bg-white rounded-xl border border-amber-200">
                <img src={templateConfig.rsvpFrameUrl} alt="RSVP Frame" className="w-14 h-14 object-contain rounded border" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-700 block">{activeText.rsvpSetMsg}</span>
                  <button
                    type="button"
                    onClick={() => setTemplateConfig({ ...templateConfig, rsvpFrameUrl: '' })}
                    className="text-red-600 hover:underline text-[11px]"
                  >
                    {activeText.deleteRsvpBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition"
          >
            {activeText.cancelBtn}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 red-royal-gradient text-[#FDE792] font-bold text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 transition"
          >
            {activeText.saveBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

