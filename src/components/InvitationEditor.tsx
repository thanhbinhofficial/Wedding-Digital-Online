import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Heart,
  Palette,
  Shield,
  Music,
  CreditCard,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Sliders,
  Sparkles,
  LayoutGrid,
  Edit3,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { Invitation, Language, TemplateId } from '../types/wedding';
import { getTranslation } from '../i18n/translations';
import { WeddingHeartFrame, WeddingAvatarFrame, WeddingLogoFrame } from './WeddingPhotoFrame';
import { PhotoAdjustModal } from './PhotoAdjustModal';
import { PublicInvitation } from './PublicInvitation';

interface InvitationEditorProps {
  initialData?: Invitation | null;
  onSave: (inv: Invitation) => Promise<void>;
  onCancel: () => void;
  onPreview: (inv: Invitation) => void;
  lang: Language;
}

export const InvitationEditor: React.FC<InvitationEditorProps> = ({
  initialData,
  onSave,
  onCancel,
  onPreview,
  lang,
}) => {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<'couple' | 'schedule' | 'story_gallery' | 'gift_music' | 'theme_security'>('couple');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Photo Position Drag Adjust Modal State
  const [adjustModal, setAdjustModal] = useState<{
    isOpen: boolean;
    imageSrc: string;
    title: string;
    initialOffset?: { x: number; y: number; zoom: number };
    frameType: 'heart' | 'circle' | 'square' | 'logo';
    target: 'groom' | 'bride' | 'logo' | 'cover' | 'customFrame' | 'gallery';
    galleryIndex?: number;
  }>({
    isOpen: false,
    imageSrc: '',
    title: '',
    frameType: 'circle',
    target: 'groom',
  });

  // Form state initialized from initialData or defaults
  const [formData, setFormData] = useState<Invitation>(() => {
    if (initialData) return JSON.parse(JSON.stringify(initialData));

    // Retrieve default saved custom template configuration if available
    let savedDefault: any = {};
    try {
      const raw = localStorage.getItem('wedding_default_custom_template');
      if (raw) savedDefault = JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing default template settings', e);
    }

    const defaultDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0];
    return {
      id: '',
      slug: '',
      title: 'Lễ Thành Hôn: Chú Rể & Cô Dâu',
      templateId: savedDefault.templateId || 'royal-red',
      frameStyle: savedDefault.frameStyle || 'royal-red-filigree',
      customFrameUrl: savedDefault.customFrameUrl || undefined,
      customOrnamentUrl: savedDefault.customOrnamentUrl || undefined,
      rsvpFrameUrl: savedDefault.rsvpFrameUrl || undefined,
      hostEmail: savedDefault.hostEmail || 'kungseyhaofficial@gmail.com',
      status: 'draft',
      isPasswordProtected: false,
      password: '',
      primaryLanguage: 'vi',
      allowLanguageToggle: true,
      groom: {
        fullName: '',
        parents: { father: '', mother: '' },
        representative: '',
        hometown: '',
        familyAddress: '',
        phone: '',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        familyMessage: '',
      },
      bride: {
        fullName: '',
        parents: { father: '', mother: '' },
        representative: '',
        hometown: '',
        familyAddress: '',
        phone: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        familyMessage: '',
      },
      solarDate: defaultDate,
      lunarDate: '',
      weddingTime: '11:00',
      separateSchedules: true,
      groomCeremony: {
        title: lang === 'km' ? 'ពិធីហែជំនូន & កាត់សក់បង្កក់សិរី' : 'Lễ Thành Hôn (Nhà Trai)',
        time: '09:00',
        date: defaultDate,
        venueName: lang === 'km' ? 'គេហដ្ឋានខាងស្រី (Bride Residence)' : 'Tư gia Nhà Trai',
        address: '',
        mapUrl: '',
        customFrameUrl: savedDefault.groomCeremony?.customFrameUrl,
      },
      brideCeremony: {
        title: lang === 'km' ? 'ពិធីសំពះផ្ទឹម & ចងដៃសិរីមង្គល' : 'Lễ Vu Quy (Nhà Gái)',
        time: '10:00',
        date: defaultDate,
        venueName: lang === 'km' ? 'គេហដ្ឋានខាងស្រី' : 'Tư gia Nhà Gái',
        address: '',
        mapUrl: '',
        customFrameUrl: savedDefault.brideCeremony?.customFrameUrl,
      },
      reception: {
        title: lang === 'km' ? 'ពិធីពិសាភោជនាហារពេលល្ងាច' : 'Tiệc Cưới Mừng Hạnh Phúc',
        time: '11:30',
        date: defaultDate,
        venueName: lang === 'km' ? 'មជ្ឈមណ្ឌលសន្និបាត និងពិព័រណ៍' : 'Trung Tâm Yến Tiệc',
        address: '',
        mapUrl: '',
        customFrameUrl: savedDefault.reception?.customFrameUrl,
      },
      personalizedMessage: lang === 'km'
        ? 'សិរីសួស្តីជ័យមង្គល! យើងខ្ញុំមានសេចក្តីសោមនស្សរីករាយ និងកិត្តិយសយ៉ាងក្រៃលែង សូមគោរពអញ្ជើញសម្ដេច ឯកឧត្ដម លោកជំទាវ លោក លោកស្រី និងមិត្តភក្តិទាំងអស់ ចូលរួមពិធីអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ។'
        : 'Hân hạnh được đón tiếp quý khách đến chung vui cùng gia đình chúng tôi trong ngày trọng đại!',
      typography: savedDefault.typography || {
        alignment: 'center',
        fontFamily: lang === 'km' ? 'muol' : 'battambang',
        fontSize: 'large',
        textColor: '#8A0F1A',
      },
      layoutSettings: savedDefault.layoutSettings || {
        sectionSpacing: 'normal',
        frameCornerRadius: 'xl',
        photoShape: 'circle',
        photoSize: 'md',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        cardWidth: 'normal',
        bgTexture: 'none',
      },
      story: [
        {
          year: '2022',
          title: 'Ngày đầu quen nhau',
          description: 'Những rung động đầu tiên gắn kết hai tâm hồn.',
          image: '',
        },
      ],
      coverPhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      photoGallery: [
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      ],
      familyPhotos: [],
      bgMusicPreset: 'romantic-piano',
      customMusicUrl: '',
      bankInfo: {
        groom: { bankName: '', accountNumber: '', accountName: '', qrImage: '' },
        bride: { bankName: '', accountNumber: '', accountName: '', qrImage: '' },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Handle local image upload via base64 to /api/upload
  const handleFileUpload = async (file: File, callback: (url: string) => void) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, filename: file.name }),
        });
        const data = await res.json();
        if (data.url) {
          callback(data.url);
        } else {
          // If server upload failed, fallback to dataUrl
          callback(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File upload error:', err);
    }
  };

  const [defaultSavedMsg, setDefaultSavedMsg] = useState<string | null>(null);

  const handleSaveAsSystemDefaultTemplate = () => {
    const templatePreset = {
      templateId: formData.templateId,
      frameStyle: formData.frameStyle,
      customFrameUrl: formData.customFrameUrl,
      customOrnamentUrl: formData.customOrnamentUrl,
      rsvpFrameUrl: formData.rsvpFrameUrl,
      hostEmail: formData.hostEmail,
      groomCeremony: { customFrameUrl: formData.groomCeremony?.customFrameUrl },
      brideCeremony: { customFrameUrl: formData.brideCeremony?.customFrameUrl },
      reception: { customFrameUrl: formData.reception?.customFrameUrl },
      typography: formData.typography,
      layoutSettings: formData.layoutSettings,
    };
    localStorage.setItem('wedding_default_custom_template', JSON.stringify(templatePreset));
    setDefaultSavedMsg(
      lang === 'vi'
        ? '✓ Đã lưu Mẫu Thiệp làm Mặc Định! Tất cả các mẫu thiệp mới tạo sau này sẽ tự động thay đổi theo mẫu & khung bạn vừa chọn.'
        : '✓ បានរក្សាទុកគំរូជា Mặc Định! រាល់ពេលបង្កើតសំបុត្រថ្មី ប្រព័ន្ធនឹងអនុវត្តគំរូនេះដោយស្វ័យប្រវត្តិ។'
    );
    setTimeout(() => setDefaultSavedMsg(null), 4000);
  };

  const handleSaveForm = async (statusOverride?: 'draft' | 'published') => {
    if (!formData.groom.fullName || !formData.bride.fullName) {
      setErrorMsg(lang === 'vi' ? 'Vui lòng nhập họ tên Chú rể và Cô dâu!' : 'សូមបញ្ចូលឈ្មោះកូនកំលោះ និងកូនក្រមុំ!');
      setActiveTab('couple');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const toSave = {
        ...formData,
        status: statusOverride || formData.status,
      };
      await onSave(toSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu thiệp cưới');
    } finally {
      setSaving(false);
    }
  };

  // Add / remove photo gallery
  const addGalleryUrl = (url: string) => {
    if (!url.trim()) return;
    setFormData((prev) => ({
      ...prev,
      photoGallery: [...prev.photoGallery, url.trim()],
    }));
  };

  const removeGalleryUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photoGallery: prev.photoGallery.filter((_, i) => i !== index),
    }));
  };

  // Story management
  const addStoryItem = () => {
    setFormData((prev) => ({
      ...prev,
      story: [
        ...prev.story,
        {
          year: new Date().getFullYear().toString(),
          title: 'Cột mốc mới',
          description: 'Ghi lại khoảnh khắc ý nghĩa...',
          image: '',
        },
      ],
    }));
  };

  const removeStoryItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      story: prev.story.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] pb-24">
      {/* Top action header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-sm px-4 lg:px-8 py-3">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-stone-100 rounded-full text-gray-600 transition"
              title="Quay lại"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-serif-luxury text-base lg:text-lg font-bold text-[#8A0F1A]">
                {initialData ? (lang === 'vi' ? 'Chỉnh Sửa Thiệp Cưới' : 'កែសម្រួលសំបុត្រការ') : (lang === 'vi' ? 'Tạo Thiệp Cưới Mới' : 'បង្កើតសំបុត្រការថ្មី')}
              </h1>
              <p className="text-xs text-gray-500 line-clamp-1">
                {formData.title || (lang === 'vi' ? 'Thiệp cưới' : 'សំបុត្រការ')}
              </p>
            </div>
          </div>

          {/* SIDE-BY-SIDE SPLIT VIEW MODE CONTROL TOOLBAR */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setViewMode('split');
                setMobileTab('edit');
              }}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                viewMode === 'split'
                  ? 'bg-[#8A0F1A] text-[#FDE792] shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
              title={lang === 'vi' ? 'Chế độ 1 bên chỉnh sửa - 1 bên hiện thị thực tế' : 'Split View'}
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">{lang === 'vi' ? 'Chia đôi 1 bên sửa 1 bên live' : 'Side-by-side View'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('edit');
                setMobileTab('edit');
              }}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                viewMode === 'edit'
                  ? 'bg-[#8A0F1A] text-[#FDE792] shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
              title={lang === 'vi' ? 'Chỉ hiển thị form chỉnh sửa' : 'Edit Form Only'}
            >
              <Edit3 size={15} />
              <span className="hidden sm:inline">{lang === 'vi' ? 'Chỉ Form' : 'Edit Only'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('preview');
                setMobileTab('preview');
              }}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                viewMode === 'preview'
                  ? 'bg-[#8A0F1A] text-[#FDE792] shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
              title={lang === 'vi' ? 'Xem thực tế toàn màn hình trước khi xuất bản' : 'Live Preview Only'}
            >
              <Eye size={15} />
              <span className="hidden sm:inline">{lang === 'vi' ? 'Xem thực tế Live' : 'Live Preview'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveForm('draft')}
              className="flex items-center gap-1.5 py-2 px-3.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
            >
              <Save size={15} />
              <span>{lang === 'vi' ? 'Lưu nháp' : 'រក្សាទុកព្រាង'}</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveForm('published')}
              className="flex items-center gap-1.5 py-2 px-4 text-xs font-bold rounded-xl red-royal-gradient text-[#FDE792] hover:brightness-110 shadow-md transition"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={15} />
              )}
              <span>{t.publish}</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`${viewMode === 'split' ? 'max-w-[1700px]' : 'max-w-6xl'} mx-auto px-3 sm:px-6 lg:px-8 mt-6`}>
        {saveSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm animate-fadeIn shadow-sm">
            <CheckCircle size={20} className="text-emerald-600" />
            <span>{lang === 'vi' ? 'Đã lưu thông tin thiệp cưới thành công!' : 'បានរក្សាទុកព័ត៌មានដោយជោគជ័យ!'}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 text-sm animate-fadeIn shadow-sm">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mobile View Switcher when in Split Mode */}
        {viewMode === 'split' && (
          <div className="lg:hidden flex items-center justify-center gap-2 mb-4 p-1.5 bg-white rounded-2xl border-2 border-[#D4AF37] shadow-sm">
            <button
              type="button"
              onClick={() => setMobileTab('edit')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
                mobileTab === 'edit'
                  ? 'bg-[#8A0F1A] text-[#FDE792] shadow-sm'
                  : 'text-stone-700 bg-stone-100 hover:bg-stone-200'
              }`}
            >
              <Edit3 size={15} />
              <span>{lang === 'vi' ? '📝 Form Sửa Nội Dung' : 'Edit Form'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
                mobileTab === 'preview'
                  ? 'bg-[#8A0F1A] text-[#FDE792] shadow-sm'
                  : 'text-stone-700 bg-stone-100 hover:bg-stone-200'
              }`}
            >
              <Eye size={15} />
              <span>{lang === 'vi' ? '👁️ Xem Live Thực Tế' : 'Live Preview'}</span>
            </button>
          </div>
        )}

        {/* MAIN SIDE-BY-SIDE SPLIT GRID CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: EDITING FORM */}
          <div
            className={`${
              viewMode === 'split'
                ? 'lg:col-span-6 xl:col-span-6'
                : viewMode === 'edit'
                ? 'lg:col-span-12'
                : 'hidden'
            } ${viewMode === 'split' && mobileTab === 'preview' ? 'hidden lg:block' : 'block'} space-y-6`}
          >

        {/* MULTI-FEATURED TEMPLATE EDIT & ALIGNMENT TOOLBAR (THANH CÔNG CỤ CĂN CHỈNH MẪU ĐA TÍNH NĂNG) */}
        <div className="mb-6 p-4 bg-white rounded-3xl border-2 border-[#D4AF37] shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Font Family Selector */}
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <Type size={16} className="text-[#8A0F1A] ml-2 shrink-0" />
              <select
                value={formData.typography?.fontFamily || 'battambang'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    typography: {
                      alignment: formData.typography?.alignment || 'center',
                      fontFamily: e.target.value as any,
                      fontSize: formData.typography?.fontSize || 'large',
                      textColor: formData.typography?.textColor || '#8A0F1A',
                    },
                  })
                }
                className="bg-transparent text-xs font-bold text-stone-800 px-2 py-1 focus:outline-none cursor-pointer"
                title="Chọn phông chữ"
              >
                <option value="muol">Khmer OS Muol Light</option>
                <option value="battambang">Khmer OS Battambang</option>
                <option value="times">Times New Roman</option>
                <option value="cinzel">Cinzel Imperial</option>
                <option value="playfair">Playfair Luxury</option>
                <option value="script">Script Romantic</option>
                <option value="khmer">Noto Serif Khmer</option>
              </select>
            </div>

            {/* Text Alignment Group */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              {[
                { id: 'left', icon: AlignLeft, label: 'Căn trái' },
                { id: 'center', icon: AlignCenter, label: 'Căn giữa' },
                { id: 'right', icon: AlignRight, label: 'Căn phải' },
                { id: 'justify', icon: AlignJustify, label: 'Căn đều' },
              ].map((al) => {
                const Icon = al.icon;
                const isSelected = (formData.typography?.alignment || 'center') === al.id;
                return (
                  <button
                    key={al.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        typography: {
                          alignment: al.id as any,
                          fontFamily: formData.typography?.fontFamily || 'battambang',
                          fontSize: formData.typography?.fontSize || 'large',
                          textColor: formData.typography?.textColor || '#8A0F1A',
                        },
                      })
                    }
                    className={`p-1.5 rounded-lg text-xs transition ${
                      isSelected
                        ? 'bg-[#8A0F1A] text-[#FDE792] shadow-xs'
                        : 'text-stone-600 hover:bg-stone-200'
                    }`}
                    title={al.label}
                  >
                    <Icon size={15} />
                  </button>
                );
              })}
            </div>

            {/* Font Scale & Size Picker */}
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 px-2.5 rounded-xl border border-stone-200">
              <Sliders size={15} className="text-[#8A0F1A] shrink-0" />
              <span className="text-[11px] font-bold text-stone-700">Cỡ chữ:</span>
              <select
                value={formData.typography?.fontSize || 'large'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    typography: {
                      alignment: formData.typography?.alignment || 'center',
                      fontFamily: formData.typography?.fontFamily || 'battambang',
                      fontSize: e.target.value as any,
                      textColor: formData.typography?.textColor || '#8A0F1A',
                    },
                  })
                }
                className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="normal">Vừa (Normal)</option>
                <option value="large">Lớn (30px / 25px)</option>
                <option value="xlarge">Rất Lớn (38px)</option>
                <option value="huge">Cực Đại (48px)</option>
              </select>
            </div>
          </div>

          {/* Quick Drag & Position Adjust Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-500 hidden sm:inline">Rê vị trí:</span>
            <button
              type="button"
              onClick={() =>
                setAdjustModal({
                  isOpen: true,
                  imageSrc: formData.groom.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
                  title: lang === 'vi' ? 'Rê / Chỉnh vị trí ảnh Chú Rể' : 'Adjust Groom Photo',
                  initialOffset: formData.groom.avatarOffset,
                  frameType: (formData.layoutSettings?.photoShape as any) || 'circle',
                  target: 'groom',
                })
              }
              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-[#8A0F1A] border border-red-200 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
            >
              <span>🖐️ Ảnh Chú Rể</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setAdjustModal({
                  isOpen: true,
                  imageSrc: formData.bride.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                  title: lang === 'vi' ? 'Rê / Chỉnh vị trí ảnh Cô Dâu' : 'Adjust Bride Photo',
                  initialOffset: formData.bride.avatarOffset,
                  frameType: (formData.layoutSettings?.photoShape as any) || 'circle',
                  target: 'bride',
                })
              }
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
            >
              <span>🖐️ Ảnh Cô Dâu</span>
            </button>

            {formData.logoUrl && (
              <button
                type="button"
                onClick={() =>
                  setAdjustModal({
                    isOpen: true,
                    imageSrc: formData.logoUrl || '',
                    title: lang === 'vi' ? 'Rê / Chỉnh vị trí Logo' : 'Adjust Logo',
                    initialOffset: formData.logoOffset,
                    frameType: 'logo',
                    target: 'logo',
                  })
                }
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>🖐️ Logo</span>
              </button>
            )}

            {formData.customFrameUrl && (
              <button
                type="button"
                onClick={() =>
                  setAdjustModal({
                    isOpen: true,
                    imageSrc: formData.customFrameUrl || '',
                    title: lang === 'vi' ? 'Rê / Chỉnh vị trí Khung Thiệp Custom' : 'Adjust Custom Frame',
                    initialOffset: formData.customFrameOffset,
                    frameType: 'square',
                    target: 'customFrame',
                  })
                }
                className="px-2.5 py-1.5 bg-[#8A0F1A] text-[#FDE792] border border-[#F5D77F] rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>🖐️ Khung Thiệp</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab navigation buttons */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-6 border-b border-stone-200 no-scrollbar">
          <button
            onClick={() => setActiveTab('couple')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition whitespace-nowrap ${
              activeTab === 'couple'
                ? 'red-royal-gradient text-[#FDE792] shadow-md'
                : 'bg-white text-gray-700 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <Heart size={16} />
            <span>1. {lang === 'vi' ? 'Cô Dâu & Chú Rể' : 'កូនកំលោះ & កូនក្រមុំ'}</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'red-royal-gradient text-[#FDE792] shadow-md'
                : 'bg-white text-gray-700 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <Calendar size={16} />
            <span>2. {lang === 'vi' ? 'Thời Gian & Địa Điểm' : 'កាលបរិច្ឆេទ & ទីតាំង'}</span>
          </button>

          <button
            onClick={() => setActiveTab('story_gallery')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition whitespace-nowrap ${
              activeTab === 'story_gallery'
                ? 'red-royal-gradient text-[#FDE792] shadow-md'
                : 'bg-white text-gray-700 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <ImageIcon size={16} />
            <span>3. {lang === 'vi' ? 'Ảnh Cưới & Lời Nhắn' : 'រូបថត & សារជូនពរ'}</span>
          </button>

          <button
            onClick={() => setActiveTab('gift_music')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition whitespace-nowrap ${
              activeTab === 'gift_music'
                ? 'red-royal-gradient text-[#FDE792] shadow-md'
                : 'bg-white text-gray-700 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <Music size={16} />
            <span>4. {lang === 'vi' ? 'Mừng Cưới & Âm Nhạc' : 'ចំណងដៃ & តន្ត្រី'}</span>
          </button>

          <button
            onClick={() => setActiveTab('theme_security')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition whitespace-nowrap ${
              activeTab === 'theme_security'
                ? 'red-royal-gradient text-[#FDE792] shadow-md'
                : 'bg-white text-gray-700 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <Palette size={16} />
            <span>5. {lang === 'vi' ? 'Giao Diện, Font & Căn Chỉnh' : 'រចនាបថ, ពុម្ពអក្សរ & តម្រឹម'}</span>
          </button>
        </div>

        {/* TAB 1: COUPLE & FAMILIES */}
        {activeTab === 'couple' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Heart size={18} className="text-[#8A0F1A]" />
                <span>{lang === 'vi' ? 'Thông Tin Chung Thiệp Cưới' : 'ព័ត៌មានទូទៅនៃសំបុត្រការ'}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {lang === 'vi' ? 'Tiêu đề thiệp cưới' : 'ចំណងជើងសំបុត្រការ'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A0F1A] focus:outline-none"
                    placeholder="VD: Lễ Thành Hôn: Minh Quân & Lan Anh"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {lang === 'vi' ? 'Đường dẫn riêng biệt (URL Slug)' : 'តំណភ្ជាប់ URL (Slug)'}
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A0F1A] focus:outline-none"
                    placeholder="VD: minh-quan-lan-anh"
                  />
                  <span className="text-[11px] text-gray-400 mt-0.5 block">
                    Đường dẫn truy cập: /w/{formData.slug || 'slug-thiep'}
                  </span>
                </div>

                <div className="md:col-span-2 p-4 rounded-2xl bg-amber-50/70 border border-[#D4AF37]/60 mt-2">
                  <label className="block text-xs font-bold text-[#8A0F1A] mb-1">
                    {lang === 'vi'
                      ? '📧 Email Chủ Hôn Nhận Thông Báo Khi Khách Bấm (ការឆ្លើយតបចូលរួម - RSVP)'
                      : '📧 អ៊ីមែលម្ចាស់ដើមការសម្រាប់ទទួលដំណឹងពេលភ្ញៀវចុច (ការឆ្លើយតបចូលរួម)'}
                  </label>
                  <input
                    type="email"
                    value={formData.hostEmail || ''}
                    onChange={(e) => setFormData({ ...formData, hostEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4AF37] rounded-xl focus:ring-2 focus:ring-[#8A0F1A] focus:outline-none font-medium"
                    placeholder="VD: kungseyhaofficial@gmail.com"
                  />
                  <span className="text-[11px] text-stone-600 mt-1 block">
                    {lang === 'vi'
                      ? 'Khi khách mời điền thông tin và bấm nút (ការឆ្លើយតបចូលរួម), hệ thống sẽ tự động gửi thông báo chi tiết qua Email này cho chủ hôn.'
                      : 'នៅពេលភ្ញៀវចុចប៊ូតុង (ការឆ្លើយតបចូលរួម) ប្រព័ន្ធនឹងផ្ញើសារជូនដំណឹងទៅកាន់អ៊ីមែលម្ចាស់ដើមការនេះដោយស្វ័យប្រវត្តិ។'}
                  </span>
                </div>
              </div>
            </div>

            {/* LOGO & CUSTOM INVITATION FRAME UPLOAD SECTION */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border-2 border-[#D4AF37]/60 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={18} className="text-[#D4AF37]" />
                  <span>{lang === 'vi' ? 'Tự Upload Khung Thiệp Cưới & Logo Mẫu' : lang === 'en' ? 'Upload Custom Frame & Logo' : 'បញ្ចូលរូបស៊ុម & អក្សរ Logo'}</span>
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                  {lang === 'vi' ? 'Áp dụng toàn bộ thiệp' : 'Apply to all'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                {lang === 'vi'
                  ? 'Tải lên hình ảnh khung thiệp viền riêng (PNG/JPG) và Logo biểu tượng đám cưới của bạn để áp dụng vào tất cả các phần thiệp.'
                  : 'បញ្ចូលរូបភាពស៊ុមផ្ទាល់ខ្លួន និងអក្សរ Logo សម្រាប់ប្រើប្រាស់លើសំបុត្រទាំងមូល។'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Custom Invitation Frame Upload Box */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
                  <label className="block text-xs font-bold text-[#8A0F1A] mb-1.5 flex items-center gap-1.5">
                    <ImageIcon size={15} />
                    <span>{lang === 'vi' ? '1. Khung Thiệp Cưới Tự Tải Lên (Custom Invitation Frame)' : '១. រូបភាពស៊ុមផ្ទាល់ខ្លួន'}</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={formData.customFrameUrl || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          frameStyle: 'custom',
                          customFrameUrl: e.target.value,
                        })
                      }
                      placeholder="URL/Link hình khung viền thiệp..."
                      className="flex-1 w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 red-royal-gradient text-[#FDE792] text-xs font-bold rounded-xl cursor-pointer hover:brightness-110 transition whitespace-nowrap shadow-sm">
                      <Upload size={14} />
                      <span>{lang === 'vi' ? 'Tải Khung Thiệp' : 'បញ្ចូលស៊ុម'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0], (url) => {
                              setFormData((prev) => ({
                                ...prev,
                                frameStyle: 'custom',
                                customFrameUrl: url,
                              }));
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  {formData.customFrameUrl ? (
                    <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-amber-300 shadow-xs">
                      <img src={formData.customFrameUrl} alt="Custom Frame Preview" className="w-14 h-14 object-cover rounded-lg border border-stone-200" />
                      <div className="text-xs flex-1">
                        <span className="font-bold text-emerald-700 block">✓ Đã cài đặt Khung thiệp Custom</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, customFrameUrl: '', frameStyle: 'royal-red-filigree' })}
                          className="text-red-600 hover:underline text-[11px] font-semibold mt-0.5 block"
                        >
                          Xóa khung mẫu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-stone-500 italic block">
                      * Mặc định sử dụng Khung Hoàng Gia Viền Kim Cổ Điển
                    </span>
                  )}
                </div>

                {/* Custom Logo / Badge Upload Box */}
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-stone-300">
                  <label className="block text-xs font-bold text-[#8A0F1A] mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={15} />
                    <span>{lang === 'vi' ? '2. Logo Biểu Tượng Đám Cưới (Wedding Logo)' : '២. អក្សរ Logo ឬ និមិត្តសញ្ញា'}</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={formData.logoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="URL Logo biểu tượng..."
                      className="flex-1 w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 text-[#FDE792] text-xs font-bold rounded-xl cursor-pointer hover:bg-black transition whitespace-nowrap shadow-sm">
                      <Upload size={14} />
                      <span>{lang === 'vi' ? 'Tải Logo' : 'បញ្ចូល Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0], (url) => {
                              setFormData((prev) => ({
                                ...prev,
                                logoUrl: url,
                              }));
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  {formData.logoUrl ? (
                    <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-300 shadow-xs">
                      <img src={formData.logoUrl} alt="Logo Preview" className="w-12 h-12 object-contain rounded-lg border border-stone-200 p-1 bg-white" />
                      <div className="text-xs flex-1">
                        <span className="font-bold text-emerald-700 block">✓ Đã áp dụng Logo riêng</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              setAdjustModal({
                                isOpen: true,
                                imageSrc: formData.logoUrl || '',
                                title: lang === 'vi' ? 'Rê / Chỉnh vị trí Logo' : 'តម្រឹមទីតាំង Logo',
                                initialOffset: formData.logoOffset,
                                frameType: 'logo',
                                target: 'logo',
                              })
                            }
                            className="text-[#8A0F1A] hover:underline text-[11px] font-bold"
                          >
                            Rê / Căn chỉnh Logo
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, logoUrl: '' })}
                            className="text-red-600 hover:underline text-[11px] font-semibold"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-stone-500 italic block">
                      * Mặc định hiển thị chữ Song Hỷ (囍)
                    </span>
                  )}
                </div>

                {/* Custom Ornament (Hoa Văn) Upload Box */}
                <div className="md:col-span-2 p-4 bg-amber-50/40 rounded-2xl border border-[#D4AF37]/60">
                  <label className="block text-xs font-bold text-[#8A0F1A] mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={15} />
                    <span>
                      {lang === 'vi'
                        ? '3. Tự Upload Hoa Văn Trang Trí (Custom Ornament PNG/JPG - Đã xóa hoa văn mặc định để tự tải lên)'
                        : '៣. បញ្ចូលក្បាច់ផ្កាផ្ទាល់ខ្លួន (Custom Ornament)'}
                    </span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={formData.customOrnamentUrl || ''}
                      onChange={(e) => setFormData({ ...formData, customOrnamentUrl: e.target.value })}
                      placeholder="URL hình hoa văn trang trí (PNG tách nền hoặc JPG)..."
                      className="flex-1 w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 red-royal-gradient text-[#FDE792] text-xs font-bold rounded-xl cursor-pointer hover:brightness-110 transition whitespace-nowrap shadow-sm">
                      <Upload size={14} />
                      <span>{lang === 'vi' ? '🌸 Tải Hoa Văn Lên' : '🌸 បញ្ចូលក្បាច់ផ្កា'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0], (url) => {
                              setFormData((prev) => ({
                                ...prev,
                                customOrnamentUrl: url,
                              }));
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  {formData.customOrnamentUrl ? (
                    <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-amber-300 shadow-xs">
                      <img src={formData.customOrnamentUrl} alt="Ornament Preview" className="w-12 h-12 object-contain rounded-lg border border-stone-200 p-1 bg-white" />
                      <div className="text-xs flex-1">
                        <span className="font-bold text-emerald-700 block">✓ Đã tải lên Hoa Văn tùy chỉnh</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, customOrnamentUrl: '' })}
                          className="text-red-600 hover:underline text-[11px] font-semibold mt-0.5 block"
                        >
                          Xóa hoa văn
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-stone-500 italic block">
                      * Các hoa văn mặc định đã được xóa sạch để bạn tự upload hoa văn riêng của mình lên.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GROOM BOX */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200 border-t-4 border-t-[#8A0F1A]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif-luxury text-xl font-bold text-[#8A0F1A]">
                    {lang === 'vi' ? 'Chú Rể & Nhà Trai' : 'កូនកំលោះ & គ្រួសារខាងប្រុស'}
                  </h3>
                  <span className="text-xs px-2.5 py-1 bg-red-100 text-red-800 rounded-full font-bold">
                    {t.groomFamily}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <WeddingHeartFrame
                      src={formData.groom.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                      alt="Groom avatar"
                      size="sm"
                      shape="circle"
                      effect="glow"
                      lang={lang}
                      uploadLabel={lang === 'vi' ? 'Tải ảnh Chú rể' : lang === 'en' ? "Groom's Photo" : 'រូបថតកូនកំលោះ'}
                      photoOffset={formData.groom.avatarOffset}
                      onAdjustClick={() =>
                        setAdjustModal({
                          isOpen: true,
                          imageSrc: formData.groom.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
                          title: lang === 'vi' ? 'Rê / Chỉnh vị trí ảnh Chú Rể' : lang === 'en' ? "Adjust Groom's Photo" : 'តម្រឹមរូបថតកូនកំលោះ',
                          initialOffset: formData.groom.avatarOffset,
                          frameType: 'circle',
                          target: 'groom',
                        })
                      }
                      onPhotoUpload={(url) => {
                        setFormData((prev) => ({
                          ...prev,
                          groom: { ...prev.groom, avatar: url },
                        }));
                      }}
                    />
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {lang === 'vi' ? 'Ảnh đại diện Chú rể' : 'រូបថតកូនកំលោះ'}
                      </label>
                      <input
                        type="text"
                        value={formData.groom.avatar}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            groom: { ...formData.groom, avatar: e.target.value },
                          })
                        }
                        placeholder="URL hình ảnh hoặc tải lên..."
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg mb-2"
                      />
                      <label className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded-lg cursor-pointer transition">
                        <Upload size={13} />
                        <span>{lang === 'vi' ? 'Tải ảnh từ máy' : 'បញ្ចូលរូបថត'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0], (url) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  groom: { ...prev.groom, avatar: url },
                                }));
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {lang === 'vi' ? 'Họ và tên Chú rể *' : 'ឈ្មោះកូនកំលោះ *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.groom.fullName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groom: { ...formData.groom, fullName: e.target.value },
                        })
                      }
                      placeholder="VD: គង់ សីហា (Kong Seyha)"
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A0F1A] focus:outline-none"
                    />
                    <span className="text-[11px] text-stone-500 mt-1 block">
                      {lang === 'vi'
                        ? 'Hiển thị 2 dòng: Dòng 1 phông chữ to (30px), dòng 2 phông chữ nhỏ (20px). Ví dụ: គង់ សីហា (Kong Seyha)'
                        : 'បង្ហាញ ២ ជួរ៖ ជួរលើធំ (30px) ជួរក្រោមតូច (20px)។ ឧទាហរណ៍៖ គង់ សីហា (Kong Seyha)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {lang === 'vi' ? 'Thân phụ (Bố)' : 'ឪពុកបង្កើត'}
                      </label>
                      <input
                        type="text"
                        value={formData.groom.parents.father}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            groom: {
                              ...formData.groom,
                              parents: { ...formData.groom.parents, father: e.target.value },
                            },
                          })
                        }
                        placeholder={lang === 'vi' ? 'VD: គង់ សុជាតិ hoặc Trần Văn Hưng' : 'ឧ. លោក គង់ សុជាតិ'}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {lang === 'vi' ? 'Thân mẫu (Mẹ)' : 'ម្តាយបង្កើត'}
                      </label>
                      <input
                        type="text"
                        value={formData.groom.parents.mother}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            groom: {
                              ...formData.groom,
                              parents: { ...formData.groom.parents, mother: e.target.value },
                            },
                          })
                        }
                        placeholder={lang === 'vi' ? 'VD: អ៊ុក គឹមហុង hoặc Nguyễn Thị Tuyết' : 'ឧ. លោកស្រី អ៊ុក គឹមហុង'}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {lang === 'vi' ? 'Đại diện gia đình (Tùy chọn)' : 'តំណាងគ្រួសារ'}
                    </label>
                    <input
                      type="text"
                      value={formData.groom.representative}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groom: { ...formData.groom, representative: e.target.value },
                        })
                      }
                      placeholder="VD: Ông Trần Văn Nam (Bác ruột)"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {lang === 'vi' ? 'Quê quán' : 'ស្រុកកំណើត'}
                      </label>
                      <input
                        type="text"
                        value={formData.groom.hometown}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            groom: { ...formData.groom, hometown: e.target.value },
                          })
                        }
                        placeholder="VD: Hà Nội"
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {lang === 'vi' ? 'Điện thoại liên hệ' : 'លេខទូរស័ព្ទ'}
                      </label>
                      <input
                        type="text"
                        value={formData.groom.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            groom: { ...formData.groom, phone: e.target.value },
                          })
                        }
                        placeholder="VD: 0912 345 678"
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {lang === 'vi' ? 'Địa chỉ gia đình Nhà Trai' : 'អាសយដ្ឋានគ្រួសារខាងប្រុស'}
                    </label>
                    <input
                      type="text"
                      value={formData.groom.familyAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groom: { ...formData.groom, familyAddress: e.target.value },
                        })
                      }
                      placeholder="VD: Số 88 Phố Huế, Quận Hai Bà Trưng, TP. Hà Nội"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {lang === 'vi' ? 'Lời nhắn từ gia đình Nhà Trai' : 'សារពីគ្រួសារខាងប្រុស'}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.groom.familyMessage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groom: { ...formData.groom, familyMessage: e.target.value },
                        })
                      }
                      placeholder="Gia đình trân trọng kính mời quý quan khách..."
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* BRIDE BOX */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200 border-t-4 border-t-[#D4AF37]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif-luxury text-xl font-bold text-[#8A0F1A]">
                    {lang === 'vi' ? 'Cô Dâu & Nhà Gái' : 'កូនក្រមុំ & គ្រួសារខាងស្រី'}
                  </h3>
                  <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold">
                    {t.brideFamily}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <WeddingHeartFrame
                      src={formData.bride.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt="Bride avatar"
                      size="sm"
                      shape="circle"
                      effect="glow"
                      lang={lang}
                      uploadLabel={lang === 'vi' ? 'Tải ảnh Cô dâu' : lang === 'en' ? "Bride's Photo" : 'រូបថតកូនក្រមុំ'}
                      photoOffset={formData.bride.avatarOffset}
                      onAdjustClick={() =>
                        setAdjustModal({
                          isOpen: true,
                          imageSrc: formData.bride.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                          title: lang === 'vi' ? 'Rê / Chỉnh vị trí ảnh Cô Dâu' : lang === 'en' ? "Adjust Bride's Photo" : 'តម្រឹមរូបថតកូនក្រមុំ',
                          initialOffset: formData.bride.avatarOffset,
                          frameType: 'circle',
                          target: 'bride',
                        })
                      }
                      onPhotoUpload={(url) => {
                        setFormData((prev) => ({
                          ...prev,
                          bride: { ...prev.bride, avatar: url },
                        }));
                      }}
                    />
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {lang === 'vi' ? 'Ảnh đại diện Cô dâu' : 'រូបថតកូនក្រមុំ'}
                      </label>
                      <input
                        type="text"
                        value={formData.bride.avatar}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bride: { ...formData.bride, avatar: e.target.value },
                          })
                        }
                        placeholder="URL hình ảnh hoặc tải lên..."
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg mb-2"
                      />
                      <label className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded-lg cursor-pointer transition">
                        <Upload size={13} />
                        <span>{lang === 'vi' ? 'Tải ảnh từ máy' : 'បញ្ចូលរូបថត'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0], (url) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  bride: { ...prev.bride, avatar: url },
                                }));
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {lang === 'vi' ? 'Họ và tên Cô dâu *' : 'ឈ្មោះកូនក្រមុំ *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bride.fullName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bride: { ...formData.bride, fullName: e.target.value },
                        })
                      }
                      placeholder="VD: ងួន សុវណ្ណា (Nguon Sovanna)"
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A0F1A] focus:outline-none"
                    />
                    <span className="text-[11px] text-stone-500 mt-1 block">
                      {lang === 'vi'
                        ? 'Hiển thị 2 dòng: Dòng 1 phông chữ to (30px), dòng 2 phông chữ nhỏ (20px). Ví dụ: ងួន សុវណ្ណា (Nguon Sovanna)'
                        : 'បង្ហាញ ២ ជួរ៖ ជួរលើធំ (30px) ជួរក្រោមតូច (20px)។ ឧទាហរណ៍៖ ងួន សុវណ្ណា (Nguon Sovanna)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {lang === 'vi' ? 'Thân phụ (Bố)' : 'ឪពុកបង្កើត'}
                      </label>
                      <input
                        type="text"
                        value={formData.bride.parents.father}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bride: {
                              ...formData.bride,
                              parents: { ...formData.bride.parents, father: e.target.value },
                            },
                          })
                        }
                        placeholder={lang === 'vi' ? 'VD: ម៉ៅ សុផល hoặc Lê Quang Dũng' : 'ឧ. លោក ម៉ៅ សុផល'}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {lang === 'vi' ? 'Thân mẫu (Mẹ)' : 'ម្តាយបង្កើត'}
                      </label>
                      <input
                        type="text"
                        value={formData.bride.parents.mother}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bride: {
                              ...formData.bride,
                              parents: { ...formData.bride.parents, mother: e.target.value },
                            },
                          })
                        }
                        placeholder={lang === 'vi' ? 'VD: សុខ គឹមលាង hoặc Phạm Thị Thúy' : 'ឧ. លោកស្រី សុខ គឹមលាង'}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {lang === 'vi' ? 'Đại diện gia đình (Tùy chọn)' : 'តំណាងគ្រួសារ'}
                    </label>
                    <input
                      type="text"
                      value={formData.bride.representative}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bride: { ...formData.bride, representative: e.target.value },
                        })
                      }
                      placeholder="VD: Ông Lê Quang Thành"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {lang === 'vi' ? 'Quê quán' : 'ស្រុកកំណើត'}
                      </label>
                      <input
                        type="text"
                        value={formData.bride.hometown}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bride: { ...formData.bride, hometown: e.target.value },
                          })
                        }
                        placeholder="VD: TP. Hồ Chí Minh"
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {lang === 'vi' ? 'Điện thoại liên hệ' : 'លេខទូរស័ព្ទ'}
                      </label>
                      <input
                        type="text"
                        value={formData.bride.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bride: { ...formData.bride, phone: e.target.value },
                          })
                        }
                        placeholder="VD: 0988 765 432"
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {lang === 'vi' ? 'Địa chỉ gia đình Nhà Gái' : 'អាសយដ្ឋានគ្រួសារខាងស្រី'}
                    </label>
                    <input
                      type="text"
                      value={formData.bride.familyAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bride: { ...formData.bride, familyAddress: e.target.value },
                        })
                      }
                      placeholder="VD: Số 152 Đường Nguyễn Đình Chiểu, Quận 3, TP. Hồ Chí Minh"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {lang === 'vi' ? 'Lời nhắn từ gia đình Nhà Gái' : 'សារពីគ្រួសារខាងស្រី'}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.bride.familyMessage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bride: { ...formData.bride, familyMessage: e.target.value },
                        })
                      }
                      placeholder="Gia đình rất vinh hạnh được đón tiếp quý khách..."
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE & VENUES */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-[#8A0F1A]" />
                <span>{lang === 'vi' ? 'Ngày Giờ Hôn Lễ' : 'កាលបរិច្ឆេទនៃពិធីមង្គលការ'}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {lang === 'vi' ? 'Ngày Dương Lịch (Chính thức)' : 'កាលបរិច្ឆេទសុរិយគតិ (ផ្លូវការ)'}
                  </label>
                  <input
                    type="date"
                    value={formData.solarDate}
                    onChange={(e) => setFormData({ ...formData, solarDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {lang === 'vi' ? 'Ngày Âm Lịch (Nếu có)' : 'កាលបរិច្ឆេទចន្ទគតិ'}
                  </label>
                  <input
                    type="text"
                    value={formData.lunarDate}
                    onChange={(e) => setFormData({ ...formData, lunarDate: e.target.value })}
                    placeholder="VD: Ngày 19 tháng 10 năm Bính Ngọ"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {lang === 'vi' ? 'Giờ đón khách / Khai mạc' : 'ម៉ោងទទួលភ្ញៀវ'}
                  </label>
                  <input
                    type="text"
                    value={formData.weddingTime}
                    onChange={(e) => setFormData({ ...formData, weddingTime: e.target.value })}
                    placeholder="VD: 11:00 hoặc 17:30"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="separateSchedules"
                  checked={formData.separateSchedules}
                  onChange={(e) => setFormData({ ...formData, separateSchedules: e.target.checked })}
                  className="w-4 h-4 text-[#8A0F1A] rounded"
                />
                <label htmlFor="separateSchedules" className="text-xs font-medium text-gray-700 cursor-pointer">
                  {lang === 'vi'
                    ? 'Tách riêng lịch trình và địa điểm cho Nhà Trai và Nhà Gái (Lễ Vu Quy & Thành Hôn)'
                    : 'បំបែកកាលវិភាគ និងទីតាំងដាច់ដោយឡែករវាងខាងប្រុស និងខាងស្រី'}
                </label>
              </div>
            </div>

            {/* Separate Schedules */}
            {formData.separateSchedules && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Groom Ceremony */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
                  <h3 className="font-serif-luxury text-base font-bold text-[#8A0F1A] mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    <span>{lang === 'vi' ? 'Lễ Thành Hôn (Nhà Trai)' : 'ពិធីខាងប្រុស'}</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Tên buổi lễ</label>
                      <input
                        type="text"
                        value={formData.groomCeremony.title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            groomCeremony: { ...formData.groomCeremony, title: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Thời gian</label>
                        <input
                          type="text"
                          value={formData.groomCeremony.time}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              groomCeremony: { ...formData.groomCeremony, time: e.target.value },
                            })
                          }
                          placeholder="09:00"
                          className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày diễn ra</label>
                        <input
                          type="date"
                          value={formData.groomCeremony.date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              groomCeremony: { ...formData.groomCeremony, date: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Tên địa điểm / Tư gia</label>
                      <input
                        type="text"
                        value={formData.groomCeremony.venueName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            groomCeremony: { ...formData.groomCeremony, venueName: e.target.value },
                          })
                        }
                        placeholder="Tư gia Nhà Trai"
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ cụ thể</label>
                      <input
                        type="text"
                        value={formData.groomCeremony.address}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            groomCeremony: { ...formData.groomCeremony, address: e.target.value },
                          })
                        }
                        placeholder="Số nhà, tên đường, quận/huyện..."
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Link chỉ đường Google Maps</label>
                      <input
                        type="url"
                        value={formData.groomCeremony.mapUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            groomCeremony: { ...formData.groomCeremony, mapUrl: e.target.value },
                          })
                        }
                        placeholder="https://maps.google.com/..."
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {lang === 'vi' ? 'Tự Upload Khung Thiệp Riêng (Nhà Trai)' : 'ផ្ទុកឡើងស៊ុមសម្រាប់ពិធីខាងប្រុស'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({
                                  ...formData,
                                  groomCeremony: { ...formData.groomCeremony, customFrameUrl: reader.result as string }
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs text-stone-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                        />
                        {formData.groomCeremony.customFrameUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                groomCeremony: { ...formData.groomCeremony, customFrameUrl: undefined }
                              })
                            }
                            className="px-2.5 py-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium"
                          >
                            Xóa khung
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bride Ceremony */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
                  <h3 className="font-serif-luxury text-base font-bold text-[#8A0F1A] mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    <span>{lang === 'vi' ? 'Lễ Vu Quy (Nhà Gái)' : 'ពិធីខាងស្រី'}</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Tên buổi lễ</label>
                      <input
                        type="text"
                        value={formData.brideCeremony.title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brideCeremony: { ...formData.brideCeremony, title: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Thời gian</label>
                        <input
                          type="text"
                          value={formData.brideCeremony.time}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              brideCeremony: { ...formData.brideCeremony, time: e.target.value },
                            })
                          }
                          placeholder="10:00"
                          className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày diễn ra</label>
                        <input
                          type="date"
                          value={formData.brideCeremony.date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              brideCeremony: { ...formData.brideCeremony, date: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Tên địa điểm / Tư gia</label>
                      <input
                        type="text"
                        value={formData.brideCeremony.venueName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brideCeremony: { ...formData.brideCeremony, venueName: e.target.value },
                          })
                        }
                        placeholder="Tư gia Nhà Gái"
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ cụ thể</label>
                      <input
                        type="text"
                        value={formData.brideCeremony.address}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brideCeremony: { ...formData.brideCeremony, address: e.target.value },
                          })
                        }
                        placeholder="Số nhà, tên đường, quận/huyện..."
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Link chỉ đường Google Maps</label>
                      <input
                        type="url"
                        value={formData.brideCeremony.mapUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brideCeremony: { ...formData.brideCeremony, mapUrl: e.target.value },
                          })
                        }
                        placeholder="https://maps.google.com/..."
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {lang === 'vi' ? 'Tự Upload Khung Thiệp Riêng (Nhà Gái)' : 'ផ្ទុកឡើងស៊ុមសម្រាប់ពិធីខាងស្រី'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({
                                  ...formData,
                                  brideCeremony: { ...formData.brideCeremony, customFrameUrl: reader.result as string }
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs text-stone-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                        />
                        {formData.brideCeremony.customFrameUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                brideCeremony: { ...formData.brideCeremony, customFrameUrl: undefined }
                              })
                            }
                            className="px-2.5 py-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium"
                          >
                            Xóa khung
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reception Venue */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <h3 className="font-serif-luxury text-lg font-bold text-[#8A0F1A] mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#8A0F1A]" />
                <span>{lang === 'vi' ? 'Tiệc Cưới Chiêu Đãi (Trung Tâm Yến Tiệc / Nhà Hàng)' : 'ពិធីពិសាភោជនាហារ (ភោជនីយដ្ឋាន)'}</span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tên tiệc cưới</label>
                    <input
                      type="text"
                      value={formData.reception.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reception: { ...formData.reception, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Thời gian nhập tiệc</label>
                    <input
                      type="text"
                      value={formData.reception.time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reception: { ...formData.reception, time: e.target.value },
                        })
                      }
                      placeholder="VD: 11:30 hoặc 18:00"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày đãi tiệc</label>
                    <input
                      type="date"
                      value={formData.reception.date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reception: { ...formData.reception, date: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tên Trung tâm / Nhà hàng tiệc cưới & Sảnh tiệc
                  </label>
                  <input
                    type="text"
                    value={formData.reception.venueName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reception: { ...formData.reception, venueName: e.target.value },
                      })
                    }
                    placeholder="VD: Sảnh Diamond - Trung tâm Hội nghị The Adora Grand View"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Địa chỉ chi tiết nhà hàng
                  </label>
                  <input
                    type="text"
                    value={formData.reception.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reception: { ...formData.reception, address: e.target.value },
                      })
                    }
                    placeholder="VD: Số 421 Ngô Gia Tự, Phường 9, Quận 5, TP.HCM"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Đường dẫn Google Maps (Mở trực tiếp trên điện thoại khách mời)
                  </label>
                  <input
                    type="url"
                    value={formData.reception.mapUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reception: { ...formData.reception, mapUrl: e.target.value },
                      })
                    }
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {lang === 'vi' ? 'Tự Upload Khung Thiệp Riêng (Tiệc Cưới Chiêu Đãi)' : 'ផ្ទុកឡើងស៊ុមសម្រាប់ពិធីពិសាភោជនាហារ'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({
                              ...formData,
                              reception: { ...formData.reception, customFrameUrl: reader.result as string }
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-stone-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                    />
                    {formData.reception.customFrameUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            reception: { ...formData.reception, customFrameUrl: undefined }
                          })
                        }
                        className="px-2.5 py-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium"
                      >
                        Xóa khung
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STORY & GALLERY */}
        {activeTab === 'story_gallery' && (
          <div className="space-y-6">
            {/* Personalized Invitation Message */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Heart size={18} />
                <span>{lang === 'vi' ? 'Lời Nhắn Thiệp Mời Riêng' : 'សារអញ្ជើញពិសេស'}</span>
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                {lang === 'vi'
                  ? 'Thông điệp thân tình gửi tới quan khách được hiển thị trang trọng trên thiệp cưới'
                  : 'សារស្វាគមន៍ដែលបង្ហាញលើលិខិតអញ្ជើញ'}
              </p>
              <textarea
                rows={3}
                value={formData.personalizedMessage}
                onChange={(e) => setFormData({ ...formData, personalizedMessage: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A0F1A] focus:outline-none"
                placeholder="Nhập lời mời thiệp cưới..."
              />
            </div>

            {/* Custom Wedding Logo / Emblem */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles size={18} />
                <span>{lang === 'vi' ? 'Logo / Biểu Tượng Thiệp Cưới (Custom Logo & Emblem)' : 'Logo / និមិត្តសញ្ញាសំបុត្រការ (Custom Logo)'}</span>
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                {lang === 'vi'
                  ? 'Tự tải lên logo riêng của bạn (tên viết tắt chú rể - cô dâu, họa tiết truyền thống, con dấu hoàng gia...). Nếu chưa tải, hệ thống dùng biểu tượng chữ 囍.'
                  : 'បញ្ចូល Logo ផ្ទាល់ខ្លួនរបស់អ្នក ឬប្រើនិមិត្តសញ្ញា 囍'}
              </p>
              <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
                <div className="w-24 h-24 rounded-2xl border-2 border-[#D4AF37] shadow-md bg-[#FAF7F2] flex items-center justify-center overflow-hidden shrink-0">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Wedding Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-4xl text-[#8A0F1A] font-bold">囍</span>
                  )}
                </div>
                <div className="flex-1 w-full space-y-3">
                  <input
                    type="text"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="Nhập URL ảnh logo (hoặc tải từ thiết bị)..."
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl"
                  />
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 red-royal-gradient text-[#FDE792] text-xs font-bold rounded-xl cursor-pointer shadow-sm hover:brightness-110 transition">
                      <Upload size={14} />
                      <span>{lang === 'vi' ? 'Tải Logo từ thiết bị' : 'បញ្ចូល Logo ពីឧបករណ៍'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0], (url) => {
                              setFormData((prev) => ({ ...prev, logoUrl: url }));
                              localStorage.setItem('wedding_admin_logo', url);
                            });
                          }
                        }}
                      />
                    </label>
                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, logoUrl: '' }));
                        }}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                      >
                        <Trash2 size={13} />
                        <span>{lang === 'vi' ? 'Xóa logo' : 'លុប Logo'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Photo */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider mb-2 flex items-center gap-2">
                <ImageIcon size={18} />
                <span>{lang === 'vi' ? 'Ảnh Bìa Thiệp Cưới (Cover Photo)' : 'រូបភាពក្របសំបុត្រ (Cover)'}</span>
              </h2>
              <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
                <div className="w-full md:w-64 h-40 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-md bg-stone-100 shrink-0">
                  <img
                    src={formData.coverPhoto}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 w-full space-y-3">
                  <input
                    type="text"
                    value={formData.coverPhoto}
                    onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
                    placeholder="Nhập link ảnh bìa..."
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl"
                  />
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl cursor-pointer transition">
                      <Upload size={14} />
                      <span>{lang === 'vi' ? 'Tải ảnh bìa từ thiết bị' : lang === 'en' ? 'Upload Cover Image' : 'បញ្ចូលរូបភាពក្រប'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0], (url) => {
                              setFormData((prev) => ({ ...prev, coverPhoto: url }));
                            });
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setAdjustModal({
                          isOpen: true,
                          imageSrc: formData.coverPhoto,
                          title: lang === 'vi' ? 'Rê / Chỉnh vị trí ảnh bìa' : lang === 'en' ? 'Adjust Cover Position' : 'តម្រឹមរូបភាពក្រប',
                          initialOffset: formData.coverPhotoOffset,
                          frameType: 'square',
                          target: 'cover',
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-[#FDE792] hover:bg-black text-xs font-bold rounded-xl shadow transition cursor-pointer"
                    >
                      <span>🖐️</span>
                      <span>{lang === 'vi' ? 'Rê vị trí ảnh bìa' : lang === 'en' ? 'Drag Cover Position' : 'តម្រឹមរូបភាពក្រប'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={18} />
                    <span>{lang === 'vi' ? 'Album Ảnh Cưới (Photo Gallery)' : 'កម្រងរូបថតអាពាហ៍ពិពាហ៍'}</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lang === 'vi' ? 'Khách mời có thể xem phóng to từng bức ảnh trên thiệp' : 'ភ្ញៀវអាចមើលរូបភាពធំ'}
                  </p>
                </div>
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 red-royal-gradient text-[#FDE792] text-xs font-bold rounded-xl cursor-pointer shadow-sm hover:brightness-110 transition">
                  <Plus size={15} />
                  <span>{lang === 'vi' ? 'Thêm ảnh mới' : 'បន្ថែមរូបថត'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach((file) => {
                          handleFileUpload(file, (url) => addGalleryUrl(url));
                        });
                      }
                    }}
                  />
                </label>
              </div>

              {/* Grid of gallery photos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {formData.photoGallery.map((url, idx) => {
                  const offset = formData.galleryPhotoOffsets?.[idx];
                  const transformStyle = offset
                    ? { transform: `translate(${offset.x}px, ${offset.y}px) scale(${offset.zoom})` }
                    : undefined;
                  return (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden border border-stone-200 shadow-sm aspect-square bg-stone-100">
                      <img src={url} alt={`Gallery ${idx}`} style={transformStyle} className="w-full h-full object-cover" />
                      
                      {/* Drag Alignment Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setAdjustModal({
                            isOpen: true,
                            imageSrc: url,
                            title: lang === 'vi' ? `Rê / Chỉnh vị trí ảnh album ${idx + 1}` : 'Adjust Photo Position',
                            initialOffset: offset,
                            frameType: 'square',
                            target: 'gallery',
                            galleryIndex: idx,
                          })
                        }
                        className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 text-[#FDE792] rounded-lg opacity-90 sm:opacity-0 group-hover:opacity-100 transition shadow cursor-pointer text-[10px] font-bold flex items-center gap-1"
                        title="Rê / Căn chỉnh vị trí"
                      >
                        <Sliders size={12} />
                        <span>Rê ảnh</span>
                      </button>

                      {/* Delete Photo Button */}
                      <button
                        type="button"
                        onClick={() => removeGalleryUrl(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-full opacity-90 sm:opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Love Story Timeline */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider flex items-center gap-2">
                    <Heart size={18} />
                    <span>{lang === 'vi' ? 'Câu Chuyện Tình Yêu (Love Story)' : 'ដំណើរនៃសេចក្តីស្រឡាញ់'}</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lang === 'vi' ? 'Các cột mốc đáng nhớ từ khi quen nhau đến lúc kết hôn' : 'អនុស្សាវរីយ៍សំខាន់ៗ'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addStoryItem}
                  className="flex items-center gap-1 px-3 py-1.5 border border-[#D4AF37] text-[#8A0F1A] rounded-xl text-xs font-semibold hover:bg-stone-50 transition"
                >
                  <Plus size={14} />
                  <span>{lang === 'vi' ? 'Thêm mốc' : 'បន្ថែម'}</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.story.map((item, idx) => (
                  <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 relative">
                    <button
                      type="button"
                      onClick={() => removeStoryItem(idx)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Năm / Thời gian</label>
                        <input
                          type="text"
                          value={item.year}
                          onChange={(e) => {
                            const newStory = [...formData.story];
                            newStory[idx].year = e.target.value;
                            setFormData({ ...formData, story: newStory });
                          }}
                          placeholder="2022"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Tiêu đề mốc thời gian</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const newStory = [...formData.story];
                            newStory[idx].title = e.target.value;
                            setFormData({ ...formData, story: newStory });
                          }}
                          placeholder="Lần đầu gặp gỡ..."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Mô tả chi tiết</label>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => {
                            const newStory = [...formData.story];
                            newStory[idx].description = e.target.value;
                            setFormData({ ...formData, story: newStory });
                          }}
                          placeholder="Kể lại kỷ niệm đáng nhớ..."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BANK & MUSIC */}
        {activeTab === 'gift_music' && (
          <div className="space-y-6">
            {/* Music settings */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Music size={18} />
                <span>{lang === 'vi' ? 'Nhạc Nền Hôn Lễ (Background Music)' : 'តន្ត្រីអមសំបុត្រការ'}</span>
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                {lang === 'vi'
                  ? 'Âm nhạc lãng mạn du dương tự động phát khi khách mời mở bao thiệp'
                  : 'តន្ត្រីរ៉ូមែនទិកនឹងបន្លឺឡើងនៅពេលភ្ញៀវបើកសំបុត្រ'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Giai điệu cài sẵn</label>
                  <select
                    value={formData.bgMusicPreset}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bgMusicPreset: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="romantic-piano">Canon In D - Piano & Harp Lãng Mạn</option>
                    <option value="traditional-royal">Khmer Traditional Royal Court Music</option>
                    <option value="wedding-bells">Wedding Bells & Classic Romance</option>
                    <option value="none">Không phát nhạc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tải nhạc nền từ máy (MP3 / WAV) hoặc Link MP3</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.customMusicUrl || ''}
                      onChange={(e) => setFormData({ ...formData, customMusicUrl: e.target.value })}
                      placeholder="Link nhạc MP3 hoặc tải lên file nhạc bên dưới..."
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
                    />

                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer transition border border-stone-300">
                        <Upload size={14} className="text-[#8A0F1A]" />
                        <span>{lang === 'vi' ? 'Tải lên file nhạc MP3 từ thiết bị' : 'បញ្ចូលឯកសារតន្ត្រី (MP3)'}</span>
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              const audioFile = e.target.files[0];
                              handleFileUpload(audioFile, (url) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  customMusicUrl: url,
                                  bgMusicPreset: 'romantic-piano',
                                }));
                              });
                            }
                          }}
                        />
                      </label>
                      {formData.customMusicUrl && (
                        <audio
                          controls
                          src={formData.customMusicUrl}
                          className="h-8 max-w-[200px]"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gift Box & Bank QR */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider mb-2 flex items-center gap-2">
                <CreditCard size={18} />
                <span>{lang === 'vi' ? 'Hộp Mừng Cưới & Tài Khoản Ngân Hàng' : 'ព័ត៌មានចំណងដៃ & គណនីធនាគារ'}</span>
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                {lang === 'vi'
                  ? 'Cho phép bạn bè ở xa gửi lời chúc phúc và mừng cưới tiện lợi qua ngân hàng hoặc mã VietQR / ABA'
                  : 'សម្រាប់ភ្ញៀវនៅឆ្ងាយអាចផ្ញើចំណងដៃតាមរយៈគណនីធនាគារ'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Groom Bank */}
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200">
                  <h3 className="font-serif-luxury font-bold text-[#8A0F1A] mb-3 text-sm">
                    {lang === 'vi' ? 'Mừng Cưới Chú Rể (Nhà Trai)' : 'ចំណងដៃខាងកូនកំលោះ'}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Ngân hàng</label>
                      <input
                        type="text"
                        value={formData.bankInfo.groom.bankName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankInfo: {
                              ...formData.bankInfo,
                              groom: { ...formData.bankInfo.groom, bankName: e.target.value },
                            },
                          })
                        }
                        placeholder="VD: Vietcombank / ABA Bank"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Số tài khoản</label>
                      <input
                        type="text"
                        value={formData.bankInfo.groom.accountNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankInfo: {
                              ...formData.bankInfo,
                              groom: { ...formData.bankInfo.groom, accountNumber: e.target.value },
                            },
                          })
                        }
                        placeholder="0123456789"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Tên chủ tài khoản</label>
                      <input
                        type="text"
                        value={formData.bankInfo.groom.accountName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankInfo: {
                              ...formData.bankInfo,
                              groom: { ...formData.bankInfo.groom, accountName: e.target.value },
                            },
                          })
                        }
                        placeholder="TRAN MINH QUAN"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Bride Bank */}
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200">
                  <h3 className="font-serif-luxury font-bold text-[#8A0F1A] mb-3 text-sm">
                    {lang === 'vi' ? 'Mừng Cưới Cô Dâu (Nhà Gái)' : 'ចំណងដៃខាងកូនក្រមុំ'}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Ngân hàng</label>
                      <input
                        type="text"
                        value={formData.bankInfo.bride.bankName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankInfo: {
                              ...formData.bankInfo,
                              bride: { ...formData.bankInfo.bride, bankName: e.target.value },
                            },
                          })
                        }
                        placeholder="VD: Techcombank / ACLEDA Bank"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Số tài khoản</label>
                      <input
                        type="text"
                        value={formData.bankInfo.bride.accountNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankInfo: {
                              ...formData.bankInfo,
                              bride: { ...formData.bankInfo.bride, accountNumber: e.target.value },
                            },
                          })
                        }
                        placeholder="9876543210"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Tên chủ tài khoản</label>
                      <input
                        type="text"
                        value={formData.bankInfo.bride.accountName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankInfo: {
                              ...formData.bankInfo,
                              bride: { ...formData.bankInfo.bride, accountName: e.target.value },
                            },
                          })
                        }
                        placeholder="LE HOANG LAN ANH"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: THEME & SECURITY */}
        {activeTab === 'theme_security' && (
          <div className="space-y-6">
            {/* Template Selector */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Palette size={18} />
                <span>{lang === 'vi' ? 'Chọn Giao Diện Thiệp Cưới (Theme)' : 'ជ្រើសរើសរចនាបថសំបុត្រ (Template)'}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    id: 'royal-red' as TemplateId,
                    name: 'Hoàng Gia Đỏ Kim',
                    desc: 'Sắc đỏ hoàng gia kết hợp hoa văn vàng kim cổ điển',
                    color: 'from-[#8A0F1A] to-[#60050E]',
                  },
                  {
                    id: 'golden-elegance' as TemplateId,
                    name: 'Vàng Hoàng Kim',
                    desc: 'Ánh kim quý phái, thanh lịch và ấm áp',
                    color: 'from-[#CF9E42] to-[#8C6219]',
                  },
                  {
                    id: 'floral-cream' as TemplateId,
                    name: 'Kem Hoa Tinh Khôi',
                    desc: 'Gam màu kem ngọc bích hòa cùng hoa sen nhẹ nhàng',
                    color: 'from-[#FDFBF7] to-[#EFE8DC]',
                  },
                  {
                    id: 'khmer-traditional' as TemplateId,
                    name: 'Khmer Traditional',
                    desc: 'Hoa văn Khmer truyền thống lộng lẫy và thiêng liêng',
                    color: 'from-[#9B111E] to-[#D4AF37]',
                  },
                ].map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => setFormData({ ...formData, templateId: tmpl.id })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                      formData.templateId === tmpl.id
                        ? 'border-[#8A0F1A] ring-2 ring-[#8A0F1A]/20 bg-red-50/30'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className={`h-20 rounded-xl bg-gradient-to-br ${tmpl.color} mb-3 shadow-inner flex items-center justify-center text-white font-bold text-2xl`}>
                      囍
                    </div>
                    <div className="font-bold text-sm text-[#8A0F1A]">{tmpl.name}</div>
                    <div className="text-[11px] text-gray-500 mt-1 leading-snug">{tmpl.desc}</div>
                    {formData.templateId === tmpl.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-[#8A0F1A] text-white rounded-full flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Frame Style & Custom Frame Upload Section */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles size={18} />
                <span>{lang === 'vi' ? 'Khung Mẫu Thiệp Cưới & Thay Khung Mẫu Tự Upload' : 'ជ្រើសរើស ឬ បញ្ចូលស៊ុមគំរូថ្មី (Frame Template)'}</span>
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                {lang === 'vi'
                  ? 'Chọn khung viền mẫu hoàng gia, khung xanh bích kim, hoặc tự tải lên hình ảnh khung mẫu riêng của bạn.'
                  : 'ជ្រើសរើសស៊ុមគំរូ ឬ បញ្ចូលរូបភាពស៊ុមផ្ទាល់ខ្លួនរបស់អ្នក។'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {[
                  {
                    id: 'royal-red-filigree',
                    name: lang === 'vi' ? 'Khung Vàng Bo Cong Cổ Điển' : lang === 'km' ? 'ស៊ុមមាសរលកបុរាណ (Royal Red)' : 'Classic Golden Filigree Frame',
                    desc: lang === 'vi' ? 'Bo góc bo tròn 2 lớp viền vàng hoa văn góc' : lang === 'km' ? 'ស៊ុមមាស ២ ជាន់ មានផ្កាក្បាច់ជ្រុង' : 'Rounded 2-layer golden filigree corner frame',
                    badge: lang === 'vi' ? 'Mẫu Đỏ Vàng' : lang === 'km' ? 'ម៉ូដក្រហមមាស' : 'Red Gold',
                  },
                  {
                    id: 'emerald-gold-arch',
                    name: lang === 'vi' ? 'Khung Xanh Ngọc Bích Hoàng Gia' : lang === 'km' ? 'ស៊ុមបៃតងត្បូងមាសរាជវាំង' : 'Royal Emerald Gold Arch Frame',
                    desc: lang === 'vi' ? 'Nền xanh bích đậm vòm hoa văn kim hoàng sang trọng' : lang === 'km' ? 'ផ្ទៃបៃតងចាស់ ជាមួយក្បាច់រោងមាសប្រណិត' : 'Deep emerald background with elegant gold arch filigree',
                    badge: lang === 'vi' ? 'Mẫu Xanh Bích' : lang === 'km' ? 'ម៉ូដបៃតង' : 'Emerald Gold',
                  },
                  {
                    id: 'golden-elegance',
                    name: lang === 'vi' ? 'Khung Viền Vàng Kim' : lang === 'km' ? 'ស៊ុមមាសប្រណិត' : 'Golden Elegance Frame',
                    desc: lang === 'vi' ? 'Khung viền vàng kim sắc nét thanh lịch' : lang === 'km' ? 'ស៊ុមមាសយ៉ាងស្រស់ស្អាតនិងទាន់សម័យ' : 'Sleek & elegant pure golden border frame',
                    badge: lang === 'vi' ? 'Hoàng Kim' : lang === 'km' ? 'មាសប្រណិត' : 'Golden',
                  },
                  {
                    id: 'khmer-traditional',
                    name: lang === 'vi' ? 'Khung Hoa Văn Khmer Truyền Thống' : lang === 'km' ? 'ស៊ុមផ្កាក្បាច់បុរាណខ្មែរ' : 'Khmer Traditional Filigree Frame',
                    desc: lang === 'vi' ? 'Khung hoa văn truyền thống Khmer sang trọng' : lang === 'km' ? 'ស៊ុមផ្កាក្បាច់ខ្មែរបុរាណយ៉ាងវិចិត្រ' : 'Authentic traditional Khmer ornate border frame',
                    badge: lang === 'vi' ? 'Khmer Style' : lang === 'km' ? 'រចនាបថខ្មែរ' : 'Khmer Style',
                  },
                ].map((fr) => (
                  <div
                    key={fr.id}
                    onClick={() => setFormData({ ...formData, frameStyle: fr.id as any })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                      (formData.frameStyle || 'royal-red-filigree') === fr.id
                        ? 'border-[#8A0F1A] ring-2 ring-[#8A0F1A]/20 bg-red-50/30'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 mb-2 inline-block">
                        {fr.badge}
                      </span>
                      <div className="font-bold text-sm text-[#8A0F1A]">{fr.name}</div>
                      <div className="text-[11px] text-gray-500 mt-1 leading-snug">{fr.desc}</div>
                    </div>
                    {(formData.frameStyle || 'royal-red-filigree') === fr.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-[#8A0F1A] text-white rounded-full flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom Frame Upload Box */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 mt-4">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'vi' ? 'Tải Lên Hình Khung Mẫu Mới Của Bạn (Upload Custom Frame Image)' : 'បញ្ចូលរូបភាពស៊ុមផ្ទាល់ខ្លួន'}
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={formData.customFrameUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        frameStyle: 'custom',
                        customFrameUrl: e.target.value,
                      })
                    }
                    placeholder="Dán link ảnh khung mẫu (http...) hoặc ấn nút Tải lên bên cạnh..."
                    className="flex-1 w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                  />
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#8A0F1A] hover:bg-[#60050E] text-white text-xs font-semibold rounded-xl cursor-pointer transition whitespace-nowrap">
                    <Upload size={14} />
                    <span>{lang === 'vi' ? 'Tải Lên Khung Mẫu' : 'បញ្ចូលរូបស៊ុម'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          handleFileUpload(file, (url) => {
                            setFormData((prev) => ({
                              ...prev,
                              frameStyle: 'custom',
                              customFrameUrl: url,
                            }));
                          });
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.customFrameUrl && (
                  <div className="mt-3 flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200">
                    <img src={formData.customFrameUrl} alt="Custom Frame Preview" className="w-16 h-16 object-contain rounded border" />
                    <div className="text-xs">
                      <span className="font-bold text-green-700 block">✓ Đã áp dụng Khung Mẫu Tự Tải Lên</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, customFrameUrl: '', frameStyle: 'royal-red-filigree' })}
                        className="text-red-600 hover:underline text-[11px] mt-0.5"
                      >
                        Xóa khung mẫu custom
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RSVP Custom Frame Upload Box */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 mt-4">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  {lang === 'vi' ? 'Tải Lên Khung Viền Riêng Cho Thiệp Xác Nhận Tham Dự (RSVP)' : 'បញ្ចូលរូបភាពស៊ុមសម្រាប់សំបុត្រឆ្លើយតប (RSVP Frame)'}
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={formData.rsvpFrameUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rsvpFrameUrl: e.target.value,
                      })
                    }
                    placeholder="Dán link ảnh khung RSVP hoặc chọn file tải lên..."
                    className="flex-1 w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                  />
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#8A0F1A] hover:bg-[#60050E] text-white text-xs font-semibold rounded-xl cursor-pointer transition whitespace-nowrap">
                    <Upload size={14} />
                    <span>{lang === 'vi' ? 'Tải Khung RSVP' : 'បញ្ចូលស៊ុម RSVP'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          handleFileUpload(file, (url) => {
                            setFormData((prev) => ({
                              ...prev,
                              rsvpFrameUrl: url,
                            }));
                          });
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.rsvpFrameUrl && (
                  <div className="mt-3 flex items-center gap-3 p-2 bg-white rounded-xl border border-amber-200">
                    <img src={formData.rsvpFrameUrl} alt="RSVP Frame Preview" className="w-16 h-16 object-contain rounded border" />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-700 block">✓ Đã áp dụng Khung Thiệp RSVP</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, rsvpFrameUrl: undefined })}
                        className="text-red-600 hover:underline text-[11px] mt-0.5"
                      >
                        Xóa khung RSVP
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* TEMPLATE LAYOUT & FINE-TUNING ALIGNMENT PANEL */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border-2 border-[#D4AF37]/50 mt-6">
                <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Sliders size={18} className="text-[#D4AF37]" />
                  <span>{lang === 'vi' ? 'Căn Chỉnh & Cân Đối Bố Cục Mẫu Thiệp Theo Ý' : lang === 'en' ? 'Template Alignment & Layout Tuning' : 'តម្រឹមគំរូប្លង់សំបុត្រតាមតម្រូវការ'}</span>
                </h2>
                <p className="text-xs text-gray-500 mb-6">
                  {lang === 'vi'
                    ? 'Tùy chỉnh khoảng cách giữa các phần, hình dáng khung ảnh dâu rể, độ bo góc thiệp, giãn dòng & giãn chữ để thiệp cưới cân đối hoàn hảo.'
                    : 'តម្រឹមគម្លាត ទំហំស៊ុមរូបថត ភាពកោងជ្រុង និងចន្លោះអក្សរដើម្បីឱ្យសំបុត្រមានតុល្យភាពឥតខ្ចោះ។'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* 1. PHOTO FRAME SHAPE */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <label className="block text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
                      <span>1. Hình Dáng Khung Ảnh Dâu Rể</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'circle', label: '🔴 Hình Tròn', desc: 'Cổ điển' },
                        { id: 'heart', label: '💖 Trái Tim', desc: 'Lãng mạn' },
                        { id: 'square', label: '⏹️ Vuông Vắn', desc: 'Hoa văn' },
                        { id: 'oval', label: '🥚 Oval', desc: 'Hoàng gia' },
                      ].map((sh) => (
                        <button
                          key={sh.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              layoutSettings: {
                                ...formData.layoutSettings,
                                photoShape: sh.id as any,
                              },
                            })
                          }
                          className={`p-2.5 rounded-xl border-2 text-left transition ${
                            (formData.layoutSettings?.photoShape || 'circle') === sh.id
                              ? 'border-[#8A0F1A] bg-red-50 text-[#8A0F1A] font-bold shadow-xs'
                              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          <span className="block text-xs font-bold">{sh.label}</span>
                          <span className="text-[10px] text-stone-400 block">{sh.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. PHOTO FRAME SIZE */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <label className="block text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
                      <span>2. Kích Thước Khung Ảnh Dâu Rể</span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'sm', label: 'S (80%)' },
                        { id: 'md', label: 'M (100%)' },
                        { id: 'lg', label: 'L (120%)' },
                        { id: 'xl', label: 'XL (140%)' },
                      ].map((sz) => (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              layoutSettings: {
                                ...formData.layoutSettings,
                                photoSize: sz.id as any,
                              },
                            })
                          }
                          className={`py-2 px-1 text-center rounded-xl border-2 transition text-xs font-bold ${
                            (formData.layoutSettings?.photoSize || 'md') === sz.id
                              ? 'border-[#8A0F1A] bg-[#8A0F1A] text-[#FDE792]'
                              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. SECTION SPACING */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <label className="block text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
                      <span>3. Khoảng Cách Các Phần Bố Cục</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'compact', label: 'Khít (Compact)', desc: 'Tiết kiệm diện tích' },
                        { id: 'normal', label: 'Vừa (Normal)', desc: 'Cân đối chuẩn' },
                        { id: 'relaxed', label: 'Thưa (Relaxed)', desc: 'Thoáng đãng' },
                        { id: 'loose', label: 'Rất Thưa (Loose)', desc: 'Rộng rãi' },
                      ].map((sp) => (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              layoutSettings: {
                                ...formData.layoutSettings,
                                sectionSpacing: sp.id as any,
                              },
                            })
                          }
                          className={`p-2 rounded-xl border-2 text-left transition ${
                            (formData.layoutSettings?.sectionSpacing || 'normal') === sp.id
                              ? 'border-[#8A0F1A] bg-red-50 text-[#8A0F1A] font-bold shadow-xs'
                              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          <span className="block text-[11px] font-bold">{sp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. FRAME CORNER RADIUS */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <label className="block text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
                      <span>4. Độ Bo Góc Khung Thiệp</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'none', label: 'Vuông vắn (0px)' },
                        { id: 'md', label: 'Bo vừa (16px)' },
                        { id: 'xl', label: 'Bo tròn lớn (36px)' },
                        { id: 'full', label: 'Khung vòm (48px)' },
                      ].map((cr) => (
                        <button
                          key={cr.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              layoutSettings: {
                                ...formData.layoutSettings,
                                frameCornerRadius: cr.id as any,
                              },
                            })
                          }
                          className={`p-2 rounded-xl border-2 text-left transition text-[11px] font-bold ${
                            (formData.layoutSettings?.frameCornerRadius || 'xl') === cr.id
                              ? 'border-[#8A0F1A] bg-red-50 text-[#8A0F1A]'
                              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          {cr.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. DRAG CUSTOM FRAME POSITION BUTTON */}
                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-300 col-span-1 md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-bold text-[#8A0F1A] mb-1 flex items-center gap-1.5">
                      <span>🖐️ Rê / Căn Chỉnh Vị Trí Khung Mẫu & Ảnh Dâu Rể Trực Tiếp</span>
                    </label>
                    <p className="text-[11px] text-stone-600 mb-3">
                      Bấm các nút dưới đây để mở bảng rê chuột căn chỉnh tọa độ X, Y và Thu/Phóng (Zoom) hình ảnh trực quan:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.customFrameUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setAdjustModal({
                              isOpen: true,
                              imageSrc: formData.customFrameUrl || '',
                              title: lang === 'vi' ? 'Rê / Căn chỉnh Khung Thiệp Cưới Custom' : 'Adjust Custom Frame',
                              initialOffset: formData.customFrameOffset,
                              frameType: 'square',
                              target: 'customFrame',
                            })
                          }
                          className="px-3.5 py-2 bg-[#8A0F1A] text-[#FDE792] font-bold text-xs rounded-xl shadow hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>🖐️ Rê Khung Mẫu Custom</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setAdjustModal({
                            isOpen: true,
                            imageSrc: formData.groom.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
                            title: lang === 'vi' ? 'Rê / Chỉnh vị trí ảnh Chú Rể' : 'Adjust Groom Photo',
                            initialOffset: formData.groom.avatarOffset,
                            frameType: (formData.layoutSettings?.photoShape as any) || 'circle',
                            target: 'groom',
                          })
                        }
                        className="px-3.5 py-2 bg-stone-900 text-[#FDE792] font-bold text-xs rounded-xl shadow hover:bg-black transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>🖐️ Rê Ảnh Chú Rể</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setAdjustModal({
                            isOpen: true,
                            imageSrc: formData.bride.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                            title: lang === 'vi' ? 'Rê / Chỉnh vị trí ảnh Cô Dâu' : 'Adjust Bride Photo',
                            initialOffset: formData.bride.avatarOffset,
                            frameType: (formData.layoutSettings?.photoShape as any) || 'circle',
                            target: 'bride',
                          })
                        }
                        className="px-3.5 py-2 bg-stone-900 text-[#FDE792] font-bold text-xs rounded-xl shadow hover:bg-black transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>🖐️ Rê Ảnh Cô Dâu</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Template Setting Card */}
              <div className="p-5 bg-gradient-to-r from-amber-50 via-red-50/50 to-amber-50 rounded-2xl border-2 border-[#D4AF37]/60 mt-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#8A0F1A] flex items-center gap-2">
                      <Sparkles size={16} className="text-[#D4AF37]" />
                      <span>{lang === 'vi' ? 'Đặt Mẫu Thiệp Hiện Tại Làm Mặc Định Cho Mọi Thiệp Mới' : 'កំណត់គំរូបច្ចុប្បន្នជា Mặc Định សម្រាប់សំបុត្រថ្មី'}</span>
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 max-w-xl leading-relaxed">
                      {lang === 'vi'
                        ? 'Khi bấm nút bên dưới, mẫu thiệp, kiểu dáng viền, khung tự upload (Khung Thiệp Cưới & Khung RSVP) và font chữ hiện tại sẽ được hệ thống lưu làm Mẫu Mặc Định. Mỗi khi tạo mẫu thiệp mới, hệ thống sẽ tự động áp dụng đúng mẫu bạn đã lưu.'
                        : 'នៅពេលចុចប៊ូតុង គំរូសំបុត្រ និងស៊ុមបច្ចុប្បន្ននឹងត្រូវរក្សាទុកជា Mặc Định សម្រាប់សំបុត្រថ្មីទាំងអស់។'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAsSystemDefaultTemplate}
                    className="px-4 py-2.5 bg-[#8A0F1A] hover:bg-[#60050E] text-[#FDE792] font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0 border border-[#F5D77F]/40 cursor-pointer"
                  >
                    <Save size={15} />
                    <span>{lang === 'vi' ? 'Lưu Mẫu Mặc Định Mới' : 'រក្សាទុកជា Mặc Định'}</span>
                  </button>
                </div>
                {defaultSavedMsg && (
                  <div className="mt-3 p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold animate-fadeIn flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-700 shrink-0" />
                    <span>{defaultSavedMsg}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Typography & Design Controls */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Type size={18} />
                <span>{lang === 'vi' ? 'Định Dạng Font Chữ, Kích Thước & Căn Chỉnh' : 'តម្រឹមពុម្ពអក្សរ, ទំហំ & ពណ៌'}</span>
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                {lang === 'vi'
                  ? 'Chỉnh sửa font chữ (Khmer OS Battambang, Times New Roman, Playfair...), kích thước, căn chỉnh và màu chữ như trong phần mềm thiết kế'
                  : 'កែសម្រួលពុម្ពអក្សរ (Khmer OS Battambang, Times New Roman), ទំហំ, តម្រឹម និងពណ៌អក្សរ'}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  {/* Font Family Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      1. Kiểu Font Chữ (Font Family)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'muol', name: 'Khmer OS Muol Light', fontClass: 'font-muol' },
                        { id: 'battambang', name: 'Khmer OS Battambang', fontClass: 'font-battambang' },
                        { id: 'times', name: 'Times New Roman', fontClass: 'font-times' },
                        { id: 'playfair', name: 'Playfair Display', fontClass: 'font-serif-luxury' },
                        { id: 'khmer', name: 'Noto Serif Khmer', fontClass: 'font-khmer' },
                        { id: 'cinzel', name: 'Cinzel Imperial', fontClass: 'font-cinzel' },
                        { id: 'script', name: 'Alex Brush (Nghệ thuật)', fontClass: 'font-script' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              typography: {
                                alignment: formData.typography?.alignment || 'center',
                                fontFamily: f.id as any,
                                fontSize: formData.typography?.fontSize || 'large',
                                textColor: formData.typography?.textColor || '#8A0F1A',
                              },
                            })
                          }
                          className={`p-3 rounded-xl border-2 text-left transition ${
                            (formData.typography?.fontFamily || 'battambang') === f.id
                              ? 'border-[#8A0F1A] bg-red-50/50 text-[#8A0F1A] font-bold'
                              : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-gray-700'
                          }`}
                        >
                          <span className={`block text-sm ${f.fontClass}`}>{f.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alignment Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      2. {lang === 'vi' ? 'Căn Chỉnh Văn Bản (Text Alignment)' : lang === 'km' ? 'តម្រឹមអត្ថបទ' : 'Text Alignment'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'left', label: lang === 'vi' ? 'Trái' : lang === 'km' ? 'ឆ្វេង' : 'Left', icon: AlignLeft },
                        { id: 'center', label: lang === 'vi' ? 'Giữa' : lang === 'km' ? 'កណ្តាល' : 'Center', icon: AlignCenter },
                        { id: 'right', label: lang === 'vi' ? 'Phải' : lang === 'km' ? 'ស្តាំ' : 'Right', icon: AlignRight },
                        { id: 'justify', label: lang === 'vi' ? 'Đều' : lang === 'km' ? 'ស្មើ' : 'Justify', icon: AlignJustify },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = (formData.typography?.alignment || 'center') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                typography: {
                                  alignment: item.id as any,
                                  fontFamily: formData.typography?.fontFamily || 'battambang',
                                  fontSize: formData.typography?.fontSize || 'large',
                                  textColor: formData.typography?.textColor || '#8A0F1A',
                                },
                              })
                            }
                            className={`py-2.5 px-3 rounded-xl border-2 flex items-center justify-center gap-1.5 text-xs font-bold transition ${
                              isSelected
                                ? 'border-[#8A0F1A] bg-[#8A0F1A] text-[#FDE792]'
                                : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-gray-700'
                            }`}
                          >
                            <Icon size={16} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Font Size Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      3. {lang === 'vi' ? 'Kích Thước Chữ (Font Size)' : lang === 'km' ? 'ទំហំអក្សរ' : 'Font Size'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'normal', label: lang === 'vi' ? 'Vừa' : lang === 'km' ? 'មធ្យម' : 'Medium' },
                        { id: 'large', label: lang === 'vi' ? 'Lớn' : lang === 'km' ? 'ធំ' : 'Large' },
                        { id: 'xlarge', label: lang === 'vi' ? 'Rất lớn' : lang === 'km' ? 'ធំខ្លាំង' : 'Extra Large' },
                        { id: 'huge', label: lang === 'vi' ? 'Cực đại' : lang === 'km' ? 'ធំបំផុត' : 'Huge' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              typography: {
                                alignment: formData.typography?.alignment || 'center',
                                fontFamily: formData.typography?.fontFamily || 'battambang',
                                fontSize: s.id as any,
                                textColor: formData.typography?.textColor || '#8A0F1A',
                              },
                            })
                          }
                          className={`py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition ${
                            (formData.typography?.fontSize || 'large') === s.id
                              ? 'border-[#8A0F1A] bg-[#8A0F1A] text-[#FDE792]'
                              : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-gray-700'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Color Picker */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      4. Màu Chữ Tùy Chỉnh (Text Color)
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        '#8A0F1A',
                        '#D4AF37',
                        '#1A1204',
                        '#B31D28',
                        '#047857',
                        '#1D4ED8',
                        '#7C3AED',
                        '#000000',
                      ].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              typography: {
                                alignment: formData.typography?.alignment || 'center',
                                fontFamily: formData.typography?.fontFamily || 'battambang',
                                fontSize: formData.typography?.fontSize || 'large',
                                textColor: hex,
                              },
                            })
                          }
                          style={{ backgroundColor: hex }}
                          className={`w-8 h-8 rounded-full border-2 transition shadow-sm ${
                            (formData.typography?.textColor || '#8A0F1A') === hex
                              ? 'ring-2 ring-offset-2 ring-[#8A0F1A] scale-110'
                              : 'border-white'
                          }`}
                        />
                      ))}
                      <div className="flex items-center gap-1.5 ml-2 border border-stone-300 rounded-xl px-2 py-1 bg-stone-50">
                        <input
                          type="color"
                          value={formData.typography?.textColor || '#8A0F1A'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              typography: {
                                alignment: formData.typography?.alignment || 'center',
                                fontFamily: formData.typography?.fontFamily || 'battambang',
                                fontSize: formData.typography?.fontSize || 'large',
                                textColor: e.target.value,
                              },
                            })
                          }
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-xs font-mono font-semibold text-gray-700">
                          {formData.typography?.textColor || '#8A0F1A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Design Canvas Preview */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    📱 Khung Thiết Kế Trực Tiếp (Live Design Studio Canvas)
                  </label>
                  <div className="p-6 bg-[#FAF7F2] rounded-3xl border-2 border-[#D4AF37] shadow-inner text-center relative overflow-hidden min-h-[380px] flex flex-col items-center justify-center">
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#8A0F1A] text-[#FDE792] rounded-full text-[10px] font-bold shadow">
                      Mẫu Xem Trước
                    </div>

                    <span className="text-3xl block mb-2" style={{ color: formData.typography?.textColor || '#8A0F1A' }}>
                      囍
                    </span>

                    {/* Preview Groom & Bride */}
                    <div
                      className={`w-full transition-all duration-300 ${
                        formData.typography?.fontFamily === 'muol'
                          ? 'font-muol'
                          : formData.typography?.fontFamily === 'battambang'
                          ? 'font-battambang'
                          : formData.typography?.fontFamily === 'times'
                          ? 'font-times'
                          : formData.typography?.fontFamily === 'khmer'
                          ? 'font-khmer'
                          : formData.typography?.fontFamily === 'cinzel'
                          ? 'font-cinzel'
                          : formData.typography?.fontFamily === 'script'
                          ? 'font-script'
                          : 'font-serif-luxury'
                      } ${
                        formData.typography?.alignment === 'left'
                          ? 'text-left'
                          : formData.typography?.alignment === 'right'
                          ? 'text-right'
                          : formData.typography?.alignment === 'justify'
                          ? 'text-justify'
                          : 'text-center'
                      }`}
                      style={{ color: formData.typography?.textColor || '#8A0F1A' }}
                    >
                      <h3
                        className={`font-black tracking-wide my-1 ${
                          formData.typography?.fontSize === 'huge'
                            ? 'text-3xl'
                            : formData.typography?.fontSize === 'xlarge'
                            ? 'text-2xl'
                            : formData.typography?.fontSize === 'large'
                            ? 'text-xl'
                            : 'text-lg'
                        }`}
                      >
                        {formData.groom.fullName || 'គង់ សីហា (Kong Seyha)'}
                      </h3>
                      <div className="text-lg my-1 font-script">&</div>
                      <h3
                        className={`font-black tracking-wide my-1 ${
                          formData.typography?.fontSize === 'huge'
                            ? 'text-3xl'
                            : formData.typography?.fontSize === 'xlarge'
                            ? 'text-2xl'
                            : formData.typography?.fontSize === 'large'
                            ? 'text-xl'
                            : 'text-lg'
                        }`}
                      >
                        {formData.bride.fullName || 'ងួន សុវណ្ណា (Nguon Sovanna)'}
                      </h3>

                      <p className="text-xs mt-4 opacity-90 italic px-4 font-normal">
                        "{formData.personalizedMessage}"
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-[#D4AF37]/40 w-full text-[11px] text-stone-600">
                      {formData.solarDate} • {formData.reception.venueName}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Language and Privacy */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-200">
              <h2 className="text-base font-bold text-[#8A0F1A] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield size={18} />
                <span>{lang === 'vi' ? 'Bảo Mật & Ngôn Ngữ' : 'សុវត្ថិភាព & ភាសា'}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ngôn ngữ chính mặc định
                  </label>
                  <select
                    value={formData.primaryLanguage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryLanguage: e.target.value as Language,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="km">🇰🇭 ភាសាខ្មែរ (Khmer)</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allowToggle"
                      checked={formData.allowLanguageToggle}
                      onChange={(e) =>
                        setFormData({ ...formData, allowLanguageToggle: e.target.checked })
                      }
                      className="w-4 h-4 text-[#8A0F1A] rounded"
                    />
                    <label htmlFor="allowToggle" className="text-xs text-gray-700 cursor-pointer">
                      Cho phép đổi 3 ngôn ngữ (Tiếng Việt, Tiếng Khmer, Tiếng Anh có icon cờ)
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-800">
                      Bảo vệ thiệp bằng mật khẩu (Riêng tư)
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.isPasswordProtected}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isPasswordProtected: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#8A0F1A] rounded"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mb-3">
                    Chỉ khách có mật khẩu mới có thể mở xem nội dung thiệp cưới.
                  </p>
                  {formData.isPasswordProtected && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Đặt mật khẩu mở thiệp
                      </label>
                      <input
                        type="text"
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="VD: 123456"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: REAL-TIME LIVE PREVIEW (Cột bên phải: Xem trực tiếp thực tế) */}
          <div
            className={`${
              viewMode === 'split'
                ? 'lg:col-span-6 xl:col-span-6 lg:sticky lg:top-20 h-[calc(100vh-100px)] overflow-y-auto'
                : viewMode === 'preview'
                ? 'lg:col-span-12'
                : 'hidden'
            } ${viewMode === 'split' && mobileTab === 'edit' ? 'hidden lg:block' : 'block'} rounded-3xl border-2 border-[#D4AF37] shadow-2xl bg-[#FAF7F2] p-2 sm:p-4 transition-all duration-300 no-scrollbar`}
          >
            {/* Live Preview Header Badge */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3 border-2 border-[#D4AF37]/60 mb-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2 text-[#8A0F1A]">
                <Sparkles size={18} className="text-[#D4AF37] animate-pulse" />
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                  {lang === 'vi'
                    ? '👁️ XEM THỰC TẾ LIVE (Cập nhật tức thì khi chỉnh sửa)'
                    : '👁️ REAL-TIME LIVE INVITATION PREVIEW'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300 flex items-center gap-1 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  REAL-TIME
                </span>
              </div>
            </div>

            {/* Embedded Live PublicInvitation */}
            <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
              <PublicInvitation invitation={formData} lang={lang} />
            </div>
          </div>
        </div>

        {/* PHOTO ADJUSTMENT MODAL */}
        <PhotoAdjustModal
          isOpen={adjustModal.isOpen}
          imageSrc={adjustModal.imageSrc}
          title={adjustModal.title}
          initialOffset={adjustModal.initialOffset}
          frameType={adjustModal.frameType}
          lang={lang}
          onClose={() => setAdjustModal((prev) => ({ ...prev, isOpen: false }))}
          onSave={(newOffset) => {
            if (adjustModal.target === 'groom') {
              setFormData((prev) => ({
                ...prev,
                groom: { ...prev.groom, avatarOffset: newOffset },
              }));
            } else if (adjustModal.target === 'bride') {
              setFormData((prev) => ({
                ...prev,
                bride: { ...prev.bride, avatarOffset: newOffset },
              }));
            } else if (adjustModal.target === 'logo') {
              setFormData((prev) => ({
                ...prev,
                logoOffset: newOffset,
              }));
            } else if (adjustModal.target === 'cover') {
              setFormData((prev) => ({
                ...prev,
                coverPhotoOffset: newOffset,
              }));
            } else if (adjustModal.target === 'customFrame') {
              setFormData((prev) => ({
                ...prev,
                customFrameOffset: newOffset,
              }));
            } else if (adjustModal.target === 'gallery' && adjustModal.galleryIndex !== undefined) {
              setFormData((prev) => ({
                ...prev,
                galleryPhotoOffsets: {
                  ...(prev.galleryPhotoOffsets || {}),
                  [adjustModal.galleryIndex!]: newOffset,
                },
              }));
            }
            setAdjustModal((prev) => ({ ...prev, isOpen: false }));
          }}
        />
      </div>
    </div>
  );
};
