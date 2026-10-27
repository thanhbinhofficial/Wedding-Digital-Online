import React, { useState, useEffect } from 'react';
import { Invitation, Language } from './types/wedding';
import { getTranslation } from './i18n/translations';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { InvitationEditor } from './components/InvitationEditor';
import { PublicInvitation } from './components/PublicInvitation';
import {
  Heart,
  QrCode,
  ShieldCheck,
  Globe,
  Sparkles,
  ArrowRight,
  Eye,
  Calendar,
  CheckCircle,
  MapPin,
  Lock,
} from 'lucide-react';

import { LanguageSelector } from './components/LanguageFlags';

export default function App() {
  const [lang, setLang] = useState<Language>('vi');
  const t = getTranslation(lang);

  // App routing mode
  // 'landing' | 'login' | 'dashboard' | 'editor' | 'public_view'
  const [viewMode, setViewMode] = useState<string>('landing');

  // Auth state
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('wedding_admin_token') || null;
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem('wedding_admin_email') || 'admin@wedding.com';
  });

  // Active editing or previewing invitation
  const [currentInvitation, setCurrentInvitation] = useState<Invitation | null>(null);
  const [personalizedGuestCode, setPersonalizedGuestCode] = useState<string | undefined>(undefined);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState<string | null>(null);

  // Handle URL path on first load (e.g. /w/minh-quan-lan-anh?guest=xxx)
  useEffect(() => {
    const handleUrlRoute = async () => {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const guestCode = searchParams.get('guest') || undefined;
      setPersonalizedGuestCode(guestCode);

      // Check if viewing invitation by slug: /w/:slug or /invitation/:slug
      const match = pathname.match(/^\/(?:w|invitation)\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const slug = match[1];
        setPublicLoading(true);
        try {
          const res = await fetch(`/api/public/invitations/${slug}`);
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Không tìm thấy thiệp cưới');
          }
          const invData: Invitation = await res.json();
          setCurrentInvitation(invData);
          if (invData.primaryLanguage) {
            setLang(invData.primaryLanguage);
          }
          setViewMode('public_view');
        } catch (err: any) {
          setPublicError(err.message || 'Thiệp cưới không khả dụng');
          setViewMode('landing');
        } finally {
          setPublicLoading(false);
        }
        return;
      }

      // If root and has valid auth token -> dashboard
      if (authToken) {
        setViewMode('dashboard');
        return;
      }

      // Default root route: Automatically load weddingkongseyha invitation preview
      setPublicLoading(true);
      try {
        const res = await fetch(`/api/public/invitations/weddingkongseyha`);
        if (res.ok) {
          const invData: Invitation = await res.json();
          setCurrentInvitation(invData);
          if (invData.primaryLanguage) {
            setLang(invData.primaryLanguage);
          }
          setViewMode('public_view');
        } else {
          setViewMode('landing');
        }
      } catch (e) {
        setViewMode('landing');
      } finally {
        setPublicLoading(false);
      }
    };

    handleUrlRoute();

    // Listen to popstate (back/forward browser navigation)
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [authToken]);

  // Handle save from editor
  const handleSaveInvitation = async (inv: Invitation) => {
    const isNew = !inv.id;
    const url = isNew ? '/api/invitations' : `/api/invitations/${inv.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(inv),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Lỗi khi lưu thiệp cưới');
    }

    const saved: Invitation = await res.json();
    setCurrentInvitation(saved);
  };

  const handleLogout = () => {
    localStorage.removeItem('wedding_admin_token');
    localStorage.removeItem('wedding_admin_email');
    setAuthToken(null);
    setViewMode('landing');
  };

  const handleToggleLang = (newLang?: Language) => {
    if (newLang) {
      setLang(newLang);
    } else {
      setLang((prev) => (prev === 'vi' ? 'km' : prev === 'km' ? 'en' : 'vi'));
    }
  };

  // Open public view by slug
  const openPublicBySlug = async (slug: string) => {
    setPublicLoading(true);
    setPublicError(null);
    try {
      const res = await fetch(`/api/public/invitations/${slug}`);
      if (!res.ok) {
        throw new Error('Không thể tải thiệp cưới');
      }
      const data = await res.json();
      setCurrentInvitation(data);
      if (data.primaryLanguage) {
        setLang(data.primaryLanguage);
      }
      window.history.pushState({}, '', `/w/${slug}`);
      setViewMode('public_view');
    } catch (e: any) {
      setPublicError(e.message);
    } finally {
      setPublicLoading(false);
    }
  };

  // ==================== RENDER VIEWS ====================

  // 1. PUBLIC INVITATION VIEW
  if (viewMode === 'public_view' && currentInvitation) {
    return (
      <PublicInvitation
        invitation={currentInvitation}
        personalizedGuestCode={personalizedGuestCode}
        isAdmin={Boolean(authToken)}
        lang={lang}
        onLanguageChange={handleToggleLang}
        onBackToDashboard={() => {
          window.history.pushState({}, '', '/');
          setViewMode(authToken ? 'dashboard' : 'landing');
        }}
        onGoHome={() => {
          window.history.pushState({}, '', '/');
          setViewMode('landing');
        }}
        onOpenLogin={() => {
          setViewMode('login');
        }}
      />
    );
  }

  // 2. ADMIN LOGIN VIEW
  if (viewMode === 'login') {
    return (
      <AdminLogin
        onSuccess={(token, email) => {
          setAuthToken(token);
          setAdminEmail(email);
          window.history.pushState({}, '', '/');
          setViewMode('dashboard');
        }}
        onCancel={() => setViewMode('landing')}
        lang={lang}
        onLanguageChange={handleToggleLang}
      />
    );
  }

  // 3. INVITATION EDITOR VIEW
  if (viewMode === 'editor' && authToken) {
    return (
      <InvitationEditor
        initialData={currentInvitation}
        onSave={handleSaveInvitation}
        onCancel={() => setViewMode('dashboard')}
        onPreview={(inv) => {
          setCurrentInvitation(inv);
          setViewMode('public_view');
        }}
        lang={lang}
      />
    );
  }

  // 4. ADMIN DASHBOARD VIEW
  if (viewMode === 'dashboard' && authToken) {
    return (
      <AdminDashboard
        token={authToken}
        adminEmail={adminEmail}
        onLogout={handleLogout}
        onCreateNew={() => {
          setCurrentInvitation(null);
          setViewMode('editor');
        }}
        onEdit={(inv) => {
          setCurrentInvitation(inv);
          setViewMode('editor');
        }}
        onPreview={(inv) => {
          setCurrentInvitation(inv);
          window.history.pushState({}, '', `/w/${inv.slug}`);
          setViewMode('public_view');
        }}
        lang={lang}
        onToggleLang={handleToggleLang}
      />
    );
  }

  // 5. LANDING & PORTAL VIEW (DEFAULT)
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] selection:bg-[#8A0F1A] selection:text-white flex flex-col justify-between">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-sm px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl red-royal-gradient flex items-center justify-center text-[#FDE792] shadow border border-[#F5D77F]/60 overflow-hidden shrink-0">
              {localStorage.getItem('wedding_admin_logo') ? (
                <img
                  src={localStorage.getItem('wedding_admin_logo')!}
                  alt="Logo"
                  className="w-full h-full object-contain rounded-xl p-0.5 bg-white"
                />
              ) : (
                <span className="font-muol text-xl font-normal drop-shadow">囍</span>
              )}
            </div>
            <div>
              <h1 className="font-muol text-lg lg:text-xl font-normal text-[#8A0F1A] leading-snug">
                {t.appTitle}
              </h1>
              <p className="text-[11px] text-stone-500 font-battambang font-normal">
                {lang === 'vi' ? 'Thiết kế thiệp cưới online cao cấp' : 'ស្ទូឌីយោសំបុត្រការតាមអនឡាញ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector
              currentLang={lang}
              onLanguageChange={setLang}
              variant="admin"
            />

            {authToken ? (
              <button
                onClick={() => setViewMode('dashboard')}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl red-royal-gradient text-[#FDE792] font-bold text-xs shadow-md hover:brightness-110 transition"
              >
                <span>{t.adminDashboard}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => setViewMode('login')}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl red-royal-gradient text-[#FDE792] font-bold text-xs shadow-md hover:brightness-110 transition"
              >
                <ShieldCheck size={15} />
                <span>{t.adminLogin}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <main className="max-w-6xl mx-auto px-4 py-12 lg:py-20 text-center space-y-6">
        {publicError && (
          <div className="max-w-md mx-auto p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs">
            {publicError}
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-[#D4AF37]/50 text-xs font-normal text-[#8A0F1A] uppercase tracking-widest shadow-xs font-muol">
          <Sparkles size={14} className="text-[#D4AF37]" />
          <span>{lang === 'vi' ? 'Nền Tảng Thiệp Cưới Trực Tuyến Đẳng Cấp' : 'អញ្ជើញចូលរួមការឌីជីថល'}</span>
        </div>

        <h1 className="font-muol text-xl sm:text-3xl lg:text-4xl font-normal text-[#8A0F1A] tracking-tight leading-relaxed max-w-4xl mx-auto my-3">
          {lang === 'vi' ? (
            <>
              <span className="block whitespace-nowrap">Thiệp Cưới Online Sang Trọng</span>
              <span className="gold-gradient-text block whitespace-nowrap mt-1">Đậm Nét Văn Hóa Hoàng Gia</span>
            </>
          ) : lang === 'en' ? (
            <>
              <span className="block whitespace-nowrap">Luxury Online Invitations</span>
              <span className="gold-gradient-text block whitespace-nowrap mt-1">With Royal Cultural Elegance</span>
            </>
          ) : (
            <>
              <span className="block whitespace-nowrap">លិខិតអញ្ជើញ អនឡាញ</span>
              <span className="gold-gradient-text block whitespace-nowrap mt-1">រចនាបថប្រណិត និងសិរីមង្គល</span>
            </>
          )}
        </h1>

        <p className="text-[18px] sm:text-[25px] text-gray-700 max-w-none mx-auto font-battambang font-normal leading-relaxed sm:whitespace-nowrap overflow-x-auto px-2">
          {lang === 'vi'
            ? 'Tạo trang thiệp cưới điện tử tinh tế với tông màu Đỏ Hoàng Gia - Vàng Kim, tương thích hoàn hảo mọi thiết bị, tích hợp mã QR, chỉ đường Google Maps và hệ thống xác nhận tham dự (RSVP).'
            : 'បង្កើតសំបុត្រការឌីជីថលដ៏ស្រស់ស្អាតជាមួយពណ៌ក្រហម និងមាស បំពាក់ដោយកូដ QR ផែនទី Google Maps និងការឆ្លើយតប RSVP។'}
        </p>

        {/* Action CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setViewMode(authToken ? 'dashboard' : 'login')}
            className="py-3 px-6 rounded-2xl red-royal-gradient text-[#FDE792] font-bold text-sm shadow-xl hover:brightness-110 active:scale-95 transition flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck size={18} />
            <span>{authToken ? t.adminDashboard : (lang === 'vi' ? 'Quản Trị Thiệp Cưới' : 'ចូលផ្ទាំងគ្រប់គ្រង')}</span>
          </button>

          <button
            onClick={() => openPublicBySlug('weddingkongseyha')}
            className="py-3 px-6 rounded-2xl red-royal-gradient border-2 border-[#F5D77F] text-[#FDE792] font-bold text-sm shadow-lg hover:brightness-110 transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles size={18} />
            <span>{lang === 'vi' ? 'Xem Thiệp Kong Seyha' : 'មើលសំបុត្រ គង់ សីហា'}</span>
          </button>

          <button
            onClick={() => openPublicBySlug('minh-quan-lan-anh')}
            className="py-3 px-6 rounded-2xl bg-white border-2 border-[#D4AF37] text-[#8A0F1A] font-bold text-sm shadow-md hover:bg-stone-50 transition flex items-center gap-2 cursor-pointer"
          >
            <Eye size={18} />
            <span>{lang === 'vi' ? 'Thiệp Mẫu Việt Nam' : 'មើលគំរូសំបុត្រការ'}</span>
          </button>

          <button
            onClick={() => openPublicBySlug('rathana-sophia')}
            className="py-3 px-6 rounded-2xl bg-white border-2 border-[#D4AF37] text-[#8A0F1A] font-bold text-sm shadow-md hover:bg-stone-50 transition flex items-center gap-2 cursor-pointer"
          >
            <Eye size={18} />
            <span>{lang === 'vi' ? 'Thiệp Mẫu Khmer' : 'មើលគំរូ Khmer Traditional'}</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
            <div className="w-12 h-12 rounded-2xl red-royal-gradient text-[#FDE792] flex items-center justify-center mb-4 shadow">
              <QrCode size={22} />
            </div>
            <h3 className="font-serif-luxury font-bold text-base text-[#8A0F1A] mb-1">
              {lang === 'vi' ? 'Mã QR & Link Cá Nhân Hóa' : 'កូដ QR & តំណភ្ជាប់ផ្ទាល់ខ្លួន'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {lang === 'vi'
                ? 'Tự động tạo mã QR quét mở thiệp ngay tức thì và tạo link riêng biệt đính kèm lời chào thân mật cho từng vị khách quý.'
                : 'បង្កើតកូដ QR ដោយស្វ័យប្រវត្តិ និងតំណភ្ជាប់ជាក់លាក់សម្រាប់ភ្ញៀវនីមួយៗ។'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
            <div className="w-12 h-12 rounded-2xl gold-gradient-bg text-stone-900 flex items-center justify-center mb-4 shadow">
              <CheckCircle size={22} />
            </div>
            <h3 className="font-serif-luxury font-bold text-base text-[#8A0F1A] mb-1">
              {lang === 'vi' ? 'Hệ Thống Phản Hồi RSVP' : 'ប្រព័ន្ធឆ្លើយតប RSVP'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {lang === 'vi'
                ? 'Khách mời xác nhận số lượng tham dự, gửi lời chúc phúc, chống trùng lặp và xuất dữ liệu sang file Excel/CSV nhanh chóng.'
                : 'ទទួលការឆ្លើយតបពីភ្ញៀវ ចំនួនអ្នកចូលរួម និងទាញយកទិន្នន័យជាឯកសារ Excel/CSV។'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
            <div className="w-12 h-12 rounded-2xl red-royal-gradient text-[#FDE792] flex items-center justify-center mb-4 shadow">
              <MapPin size={22} />
            </div>
            <h3 className="font-serif-luxury font-bold text-base text-[#8A0F1A] mb-1">
              {lang === 'vi' ? 'Bản Đồ Chỉ Đường & Lịch Trình' : 'ផែនទី Google Maps & កាលវិភាគ'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {lang === 'vi'
                ? 'Tách riêng lịch trình Nhà Trai, Nhà Gái và Tiệc Cưới. Nút chỉ đường Google Maps 1 chạm đưa khách đến tận nơi.'
                : 'បំបែកកាលវិភាគពិធី និងទីតាំងច្បាស់លាស់ ភ្ជាប់ជាមួយ Google Maps ងាយស្រួលធ្វើដំណើរ។'}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D4AF37]/30 bg-white/60 py-6 px-4 text-center text-xs text-gray-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-serif-luxury text-[#8A0F1A] font-semibold">
            囍 Thiệp Cưới Online Studio • Tiếng Việt & ភាសាខ្មែរ
          </p>
          <div className="flex items-center gap-4 text-gray-600">
            <button
              onClick={() => openPublicBySlug('minh-quan-lan-anh')}
              className="hover:text-[#8A0F1A] transition"
            >
              Thiệp Minh Quân & Lan Anh
            </button>
            <span>•</span>
            <button
              onClick={() => openPublicBySlug('rathana-sophia')}
              className="hover:text-[#8A0F1A] transition"
            >
              Thiệp Rathana & Sophia
            </button>
            <span>•</span>
            <button
              onClick={() => setViewMode(authToken ? 'dashboard' : 'login')}
              className="hover:text-[#8A0F1A] font-bold text-[#8A0F1A] transition"
            >
              {t.adminLogin}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
