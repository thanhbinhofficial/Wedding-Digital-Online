import React, { useState, useRef } from 'react';
import {
  Mail,
  KeyRound,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Trash2,
  Globe,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { Language } from '../types/wedding';
import { getTranslation } from '../i18n/translations';
import { WeddingLogoFrame } from './WeddingPhotoFrame';

interface AdminLoginProps {
  onSuccess: (token: string, email: string) => void;
  onCancel: () => void;
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel, lang: initialLang, onLanguageChange }) => {
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);

  React.useEffect(() => {
    if (initialLang) {
      setCurrentLang(initialLang);
    }
  }, [initialLang]);

  const handleLangToggle = () => {
    const nextLang: Language = currentLang === 'vi' ? 'km' : currentLang === 'km' ? 'en' : 'vi';
    setCurrentLang(nextLang);
    if (onLanguageChange) {
      onLanguageChange(nextLang);
    }
  };

  const [email, setEmail] = useState('admin@wedding.com');
  const [password, setPassword] = useState('Wedding@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(true);

  // Custom logo state (separated logo slot)
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem('wedding_admin_logo') || null;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = getTranslation(currentLang);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(
          currentLang === 'vi'
            ? 'Dung lượng logo không quá 5MB'
            : currentLang === 'en'
            ? 'Logo file size must be under 5MB'
            : 'ទំហំរូបភាពត្រូវតែតូចជាង 5MB'
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomLogo(base64);
        localStorage.setItem('wedding_admin_logo', base64);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCustomLogo(null);
    localStorage.removeItem('wedding_admin_logo');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error ||
            (currentLang === 'vi'
              ? 'Đăng nhập không thành công'
              : currentLang === 'en'
              ? 'Login failed'
              : 'ការចូលមិនបានសម្រេច')
        );
      }

      localStorage.setItem('wedding_admin_token', data.token);
      localStorage.setItem('wedding_admin_email', data.admin.email);
      onSuccess(data.token, data.admin.email);
    } catch (err: any) {
      setError(
        err.message ||
          (currentLang === 'vi'
            ? 'Lỗi kết nối máy chủ'
            : currentLang === 'en'
            ? 'Server connection error'
            : 'មានបញ្ហាតភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើ')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-gradient-to-br from-[#1F0306] via-[#3B070D] to-[#140103] text-[#FAF7F2] relative overflow-hidden font-battambang py-8 sm:py-12">
      {/* Background Decorative Gold Halo Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#8A0F1A]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Gold Sparkle Accents */}
      <div className="absolute top-12 left-10 text-[#F5D77F]/40 text-xl animate-pulse pointer-events-none">✨</div>
      <div className="absolute bottom-16 left-16 text-[#F5D77F]/40 text-2xl animate-pulse pointer-events-none">✤</div>
      <div className="absolute top-24 right-12 text-[#F5D77F]/40 text-2xl animate-pulse pointer-events-none">✨</div>

      {/* ==================================================================== */}
      {/* MAIN WEDDING INVITATION ENVELOPE BOX CONTAINER (HỘP BAO THIỆP CƯỚI)  */}
      {/* ==================================================================== */}
      <div className="w-full max-w-xl relative z-10 my-4">
        {/* ENVELOPE SHADOW & OUTER LUXURY FRAME */}
        <div className="relative bg-gradient-to-b from-[#4A0A12] via-[#2D060B] to-[#1F0407] rounded-[36px] p-3 sm:p-5 border-4 border-[#D4AF37] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {/* Inner Golden Foil Outline Frame */}
          <div className="border-2 border-dashed border-[#F5D77F]/60 rounded-[28px] p-2 relative bg-[#2A050A]">
            
            {/* Top Envelope Flap Crest / V-Shape Flap Design (Nắp Hộp Bao Thiệp) */}
            <div className="relative mb-3 pt-2">
              {/* V-Shape Flap Graphic */}
              <div className="relative w-full overflow-hidden flex flex-col items-center">
                <svg
                  viewBox="0 0 500 120"
                  className="w-full h-auto drop-shadow-md"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="envelopeFlapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#7A0D17" />
                      <stop offset="50%" stopColor="#52070E" />
                      <stop offset="100%" stopColor="#320307" />
                    </linearGradient>
                    <linearGradient id="goldBorderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#CF9E42" />
                      <stop offset="30%" stopColor="#F5D77F" />
                      <stop offset="70%" stopColor="#B88329" />
                      <stop offset="100%" stopColor="#FDE792" />
                    </linearGradient>
                  </defs>
                  
                  {/* Flap Outer Triangle Path */}
                  <path
                    d="M 0,0 L 250,110 L 500,0 Z"
                    fill="url(#envelopeFlapGrad)"
                    stroke="url(#goldBorderGrad)"
                    strokeWidth="4"
                  />
                  {/* Flap Inner Lace Accent Line */}
                  <path
                    d="M 20,0 L 250,100 L 480,0"
                    fill="none"
                    stroke="#F5D77F"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity="0.85"
                  />
                </svg>

                {/* ROYAL WAX SEAL EMBLEM (CON DẤU SÁP HOÀNG GIA 3D) */}
                <button
                  type="button"
                  onClick={() => setIsEnvelopeOpen(!isEnvelopeOpen)}
                  title={
                    currentLang === 'vi'
                      ? 'Nhấn để đóng/mở nắp thiệp'
                      : currentLang === 'en'
                      ? 'Click to toggle envelope flap'
                      : 'ចុចដើម្បីបើក/បិទគម្របសំបុត្រ'
                  }
                  className="absolute top-6 sm:top-8 -translate-y-1/2 group cursor-pointer focus:outline-none z-30"
                >
                  {/* Outer Wax Seal Glow */}
                  <div className="absolute inset-0 rounded-full bg-[#D4AF37]/40 blur-md group-hover:scale-125 transition-transform duration-500" />

                  {/* Metallic 3D Wax Seal Circle */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full red-royal-gradient border-2 border-[#FDE792] shadow-[0_8px_20px_rgba(0,0,0,0.6)] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 active:scale-95">
                    {/* Inner Gold Laurel Ring */}
                    <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-[#F5D77F] flex items-center justify-center bg-gradient-to-br from-[#8A0F1A] via-[#A01522] to-[#5C0810]">
                      {customLogo ? (
                        <img
                          src={customLogo}
                          alt="Seal Logo"
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full drop-shadow"
                        />
                      ) : (
                        <span className="font-muol text-2xl sm:text-3xl text-[#FDE792] drop-shadow-md select-none">
                          囍
                        </span>
                      )}
                    </div>

                    {/* Wax Seal Ribbon Tail */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-90 pointer-events-none">
                      <div className="w-2.5 h-4 bg-gradient-to-b from-[#D4AF37] to-[#8A0F1A] rotate-12 rounded-b shadow" />
                      <div className="w-2.5 h-4 bg-gradient-to-b from-[#D4AF37] to-[#8A0F1A] -rotate-12 rounded-b shadow" />
                    </div>
                  </div>
                </button>
              </div>

              {/* Envelope Title Label Banner */}
              <div className="mt-8 sm:mt-10 text-center">
                <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#1A0306] border border-[#D4AF37]/70 text-[#F5D77F] text-[11px] font-semibold uppercase tracking-widest shadow-md">
                  <Sparkles size={12} className="text-[#D4AF37]" />
                  <span>
                    {currentLang === 'vi'
                      ? 'BAO THIỆP CƯỚI HOÀNG GIA • ĐĂNG NHẬP'
                      : currentLang === 'en'
                      ? 'ROYAL WEDDING ENVELOPE • ADMIN PORTAL'
                      : 'ប្រអប់សំបុត្រការសិរីមង្គល • ចូលប្រព័ន្ធ'}
                  </span>
                </span>
              </div>
            </div>

            {/* ==================================================================== */}
            {/* INNER PARCHMENT INVITATION CARD (THẺ THIỆP ĐĂNG NHẬP BÊN TRONG)     */}
            {/* ==================================================================== */}
            <div
              className={`transition-all duration-700 ease-in-out ${
                isEnvelopeOpen
                  ? 'opacity-100 translate-y-0 max-h-[1600px]'
                  : 'opacity-0 -translate-y-8 max-h-0 overflow-hidden pointer-events-none'
              }`}
            >
              <div className="bg-[#FFFDF9] text-[#2C1810] rounded-2xl p-5 sm:p-8 border-2 border-[#D4AF37] shadow-2xl relative overflow-hidden mt-3">
                {/* Gold Foil Lace Inset Frame Border */}
                <div className="absolute inset-2 border border-[#D4AF37]/40 rounded-xl pointer-events-none" />

                {/* Top Corner Filigree SVG Ornaments */}
                <div className="absolute top-3 left-3 text-[#D4AF37] pointer-events-none opacity-85">
                  <svg width="32" height="32" viewBox="0 0 40 40" fill="currentColor">
                    <path d="M0,0 L18,0 C18,10 10,18 0,18 L0,0 Z" />
                    <circle cx="6" cy="6" r="2" fill="#8A0F1A" />
                  </svg>
                </div>
                <div className="absolute top-3 right-3 text-[#D4AF37] pointer-events-none opacity-85 rotate-90">
                  <svg width="32" height="32" viewBox="0 0 40 40" fill="currentColor">
                    <path d="M0,0 L18,0 C18,10 10,18 0,18 L0,0 Z" />
                    <circle cx="6" cy="6" r="2" fill="#8A0F1A" />
                  </svg>
                </div>

                {/* TOP NAVIGATION BAR: Home & Language Selector */}
                <div className="flex items-center justify-between mb-6 pt-1 relative z-20">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-xs font-semibold text-stone-700 transition cursor-pointer shadow-xs"
                  >
                    <ArrowLeft size={15} className="text-[#8A0F1A]" />
                    <span>
                      {currentLang === 'vi'
                        ? 'Trang chủ'
                        : currentLang === 'en'
                        ? 'Home'
                        : 'ទំព័រដើម'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLangToggle}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#D4AF37] bg-amber-50 hover:bg-amber-100 text-xs font-bold text-[#8A0F1A] transition cursor-pointer shadow-xs"
                  >
                    <Globe size={14} className="text-[#D4AF37]" />
                    <span>
                      {currentLang === 'vi'
                        ? '🇻🇳 VI'
                        : currentLang === 'km'
                        ? '🇰🇭 ខ្មែរ'
                        : '🇬🇧 EN'}
                    </span>
                  </button>
                </div>

                {/* LOGO SECTION WITH SEPARATED EMBEDDED WEDDING FRAME */}
                <div className="flex flex-col items-center justify-center mb-6 text-center relative z-20">
                  <WeddingLogoFrame
                    logoUrl={customLogo}
                    onUploadClick={() => fileInputRef.current?.click()}
                    lang={currentLang}
                    className="mb-2"
                  />

                  {/* Hidden File Input for Custom Logo */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  {/* Custom Logo Actions */}
                  <div className="flex items-center gap-2 text-xs text-stone-600 mt-1">
                    {customLogo ? (
                      <>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[#8A0F1A] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Upload size={12} />
                          <span>
                            {currentLang === 'vi'
                              ? 'Đổi logo'
                              : currentLang === 'en'
                              ? 'Change logo'
                              : 'ផ្លាស់ប្តូរ'}
                          </span>
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>
                            {currentLang === 'vi'
                              ? 'Xóa logo'
                              : currentLang === 'en'
                              ? 'Remove logo'
                              : 'លុប'}
                          </span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[#8A0F1A] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon size={14} className="text-[#D4AF37]" />
                        <span>
                          {currentLang === 'vi'
                            ? 'Tải logo riêng của bạn (tùy chọn)'
                            : currentLang === 'en'
                            ? 'Upload custom logo (optional)'
                            : 'ចុចដើម្បីបង្ហោះ Logo ផ្ទាល់ខ្លួន'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* MAIN INVITATION CARD TITLE */}
                <div className="text-center mb-6 space-y-1 relative z-20">
                  <h2 className="font-muol text-2xl sm:text-3xl font-normal text-[#8A0F1A] leading-tight tracking-wide drop-shadow-xs">
                    {currentLang === 'vi'
                      ? 'Đăng Nhập Quản Trị Viên'
                      : currentLang === 'en'
                      ? 'Admin Login Portal'
                      : 'លិខិតអញ្ជើញសិរីសួស្តីអាពាហ៍ពិពាហ៍'}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 font-normal">
                    {currentLang === 'vi'
                      ? 'Hệ thống tạo & quản lý thiệp cưới trực tuyến cao cấp'
                      : currentLang === 'en'
                      ? 'Premium Online Wedding Invitation Management System'
                      : 'ផ្ទាំងចូលប្រព័ន្ធគ្រប់គ្រងសំបុត្រការ'}
                  </p>
                </div>

                {error && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 relative z-20 shadow-xs">
                    <AlertCircle size={16} className="shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                {/* LOGIN FORM */}
                <form onSubmit={handleSubmit} className="space-y-4 relative z-20">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      {currentLang === 'vi'
                        ? 'Địa chỉ Email'
                        : currentLang === 'en'
                        ? 'Email Address'
                        : 'អាសយដ្ឋាន អ៊ីមែល'}
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@wedding.com"
                        className="w-full pl-10 pr-4 py-3 bg-stone-50/80 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8A0F1A] focus:bg-white focus:border-transparent transition shadow-inner font-sans-clean"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      {currentLang === 'vi'
                        ? 'Mật khẩu'
                        : currentLang === 'en'
                        ? 'Password'
                        : 'ពាក្យសម្ងាត់'}
                    </label>
                    <div className="relative">
                      <KeyRound
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]"
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-stone-50/80 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8A0F1A] focus:bg-white focus:border-transparent transition shadow-inner font-sans-clean"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* QUICK CREDENTIALS HELPER BOX */}
                  <div className="p-3.5 bg-amber-50/90 border border-[#D4AF37]/50 rounded-2xl text-xs text-amber-950 flex flex-col gap-1 shadow-xs">
                    <div className="flex items-center justify-between font-bold text-[#8A0F1A]">
                      <div className="flex items-center gap-1">
                        <Sparkles size={14} className="text-[#D4AF37]" />
                        <span>
                          {currentLang === 'vi'
                            ? 'Tài khoản quản trị mặc định:'
                            : currentLang === 'en'
                            ? 'Default Admin Account:'
                            : 'គណនីគ្រប់គ្រងដើម៖'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('admin@wedding.com');
                          setPassword('Wedding@2026');
                        }}
                        className="text-[11px] font-bold text-[#8A0F1A] hover:underline flex items-center gap-1 cursor-pointer bg-amber-100/80 px-2 py-0.5 rounded-lg border border-amber-300/80"
                      >
                        <CheckCircle2 size={12} className="text-[#D4AF37]" />
                        <span>
                          {currentLang === 'vi'
                            ? 'Tự điền'
                            : currentLang === 'en'
                            ? 'Auto-fill'
                            : 'បំពេញអូតូ'}
                        </span>
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
                      <span>
                        Email:{' '}
                        <code className="font-mono bg-white px-2 py-0.5 rounded-md border border-amber-200 font-bold text-stone-800">
                          admin@wedding.com
                        </code>
                      </span>
                      <span>
                        Pass:{' '}
                        <code className="font-mono bg-white px-2 py-0.5 rounded-md border border-amber-200 font-bold text-stone-800">
                          Wedding@2026
                        </code>
                      </span>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-4 rounded-xl red-royal-gradient text-[#FDE792] font-bold text-sm sm:text-base shadow-xl hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer border-2 border-[#F5D77F]/80 disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-[#FDE792] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck size={20} />
                        <span>
                          {currentLang === 'vi'
                            ? 'Đăng Nhập Quản Trị'
                            : currentLang === 'en'
                            ? 'Log In as Admin'
                            : 'ចូលប្រព័ន្ធគ្រប់គ្រង'}
                        </span>
                      </>
                    )}
                  </button>
                </form>

                {/* Bottom Corner Filigree SVG Ornaments */}
                <div className="absolute bottom-3 left-3 text-[#D4AF37] pointer-events-none opacity-85 -rotate-90">
                  <svg width="32" height="32" viewBox="0 0 40 40" fill="currentColor">
                    <path d="M0,0 L18,0 C18,10 10,18 0,18 L0,0 Z" />
                    <circle cx="6" cy="6" r="2" fill="#8A0F1A" />
                  </svg>
                </div>
                <div className="absolute bottom-3 right-3 text-[#D4AF37] pointer-events-none opacity-85 rotate-180">
                  <svg width="32" height="32" viewBox="0 0 40 40" fill="currentColor">
                    <path d="M0,0 L18,0 C18,10 10,18 0,18 L0,0 Z" />
                    <circle cx="6" cy="6" r="2" fill="#8A0F1A" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Gold Footer Accent of Envelope Box */}
            <div className="mt-3 text-center text-[11px] text-[#F5D77F]/80 pb-1">
              <span>囍 Thiệp Cưới Hoàng Gia • Royal Wedding Invitation Box 囍</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
