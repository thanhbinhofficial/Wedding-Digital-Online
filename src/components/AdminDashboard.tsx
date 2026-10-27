import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  Share2,
  QrCode,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  LogOut,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Lock,
  Globe,
  RefreshCw,
  Heart,
  Download,
  Link2,
  Upload,
  Palette,
} from 'lucide-react';
import { Invitation, Language } from '../types/wedding';
import { getTranslation } from '../i18n/translations';
import { QRCodeModal } from './QRCodeModal';
import { LanguageSelector } from './LanguageFlags';
import { GuestLinkModal } from './GuestLinkModal';
import { RsvpListModal } from './RsvpListModal';
import { DefaultTemplateModal } from './DefaultTemplateModal';

interface AdminDashboardProps {
  token: string;
  adminEmail: string;
  onLogout: () => void;
  onCreateNew: () => void;
  onEdit: (inv: Invitation) => void;
  onPreview: (inv: Invitation) => void;
  lang: Language;
  onToggleLang: (lang?: Language) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  adminEmail,
  onLogout,
  onCreateNew,
  onEdit,
  onPreview,
  lang,
  onToggleLang,
}) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [search, setSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals state
  const [activeQR, setActiveQR] = useState<{ url: string; title: string } | null>(null);
  const [activeGuestLinkInv, setActiveGuestLinkInv] = useState<Invitation | null>(null);
  const [activeRsvpInv, setActiveRsvpInv] = useState<Invitation | null>(null);
  const [showDefaultTemplateModal, setShowDefaultTemplateModal] = useState(false);

  // Custom logo state
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem('wedding_admin_logo') || null;
  });
  const logoInputRef = useRef<HTMLInputElement>(null);

  const t = getTranslation(lang);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification(lang === 'vi' ? 'Dung lượng logo không quá 5MB' : 'ទំហំរូបភាពត្រូវតែតូចជាង 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomLogo(base64);
        localStorage.setItem('wedding_admin_logo', base64);
        showNotification(lang === 'vi' ? 'Đã cập nhật logo thành công' : 'បានប្តូរ Logo រួចរាល់');
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchInvitations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/invitations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          onLogout();
          return;
        }
        throw new Error('Lỗi khi tải danh sách thiệp cưới');
      }
      const data = await res.json();
      setInvitations(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [token]);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/invitations/${id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showNotification(lang === 'vi' ? 'Đã nhân bản thiệp cưới thành công' : 'បានចម្លងសំបុត្រការជោគជ័យ');
        fetchInvitations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/invitations/${id}/publish-toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        showNotification(
          data.status === 'published'
            ? lang === 'vi' ? 'Đã xuất bản thiệp cưới!' : 'បានផ្សព្វផ្សាយសំបុត្រការ!'
            : lang === 'vi' ? 'Đã chuyển về bản nháp!' : 'បានប្តូរទៅជាព្រាង!'
        );
        fetchInvitations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`${t.deleteConfirm}\n\n${title}`)) return;
    try {
      const res = await fetch(`/api/invitations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showNotification(lang === 'vi' ? 'Đã xóa thiệp cưới' : 'បានលុបសំបុត្រការ');
        setInvitations(invitations.filter((i) => i.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getPublicUrl = (slug: string) => {
    return `${window.location.origin}/w/${slug}`;
  };

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(getPublicUrl(slug));
    showNotification(t.copied);
  };

  // Filtered invitations
  const filteredList = invitations.filter((inv) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'published' && inv.status === 'published') ||
      (filter === 'draft' && inv.status === 'draft');

    const matchesSearch =
      !search ||
      inv.title.toLowerCase().includes(search.toLowerCase()) ||
      inv.groom.fullName.toLowerCase().includes(search.toLowerCase()) ||
      inv.bride.fullName.toLowerCase().includes(search.toLowerCase()) ||
      inv.slug.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Overview metrics
  const totalInvs = invitations.length;
  const publishedInvs = invitations.filter((i) => i.status === 'published').length;
  const totalRsvps = invitations.reduce((sum, i) => sum + (i.stats?.rsvpCount || 0), 0);
  const totalAttending = invitations.reduce((sum, i) => sum + (i.stats?.totalGuests || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-sm px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              onClick={() => logoInputRef.current?.click()}
              title={lang === 'vi' ? 'Nhấn để thay đổi Logo' : 'ចុចដើម្បីប្តូរ Logo'}
              className="w-11 h-11 rounded-2xl red-royal-gradient flex items-center justify-center text-[#FDE792] shadow-md border border-[#F5D77F]/60 overflow-hidden relative group cursor-pointer shrink-0"
            >
              {customLogo ? (
                <img src={customLogo} alt="Logo" className="w-full h-full object-contain rounded-2xl p-0.5 bg-white" />
              ) : (
                <span className="font-muol text-xl font-normal drop-shadow">囍</span>
              )}
              <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-2xl">
                <Upload size={14} />
              </div>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div>
              <h1 className="font-muol text-lg lg:text-xl font-normal text-[#8A0F1A] leading-snug">
                {t.adminDashboard}
              </h1>
              <p className="text-[12px] font-normal text-stone-500 hidden sm:block">
                {adminEmail} • Wedding Studio Pro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language switch button */}
            <LanguageSelector
              currentLang={lang}
              onLanguageChange={(newLang) => onToggleLang(newLang as any)}
              variant="admin"
            />

            {/* Default Template Config Button */}
            <button
              onClick={() => setShowDefaultTemplateModal(true)}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#8A0F1A] border border-[#D4AF37]/60 font-bold text-xs transition shadow-sm"
              title={lang === 'vi' ? 'Đăng Mẫu Thiệp & Upload Khung Mẫu' : lang === 'km' ? 'ចុះផ្សាយគំរូសំបុត្រ & បញ្ចូលស៊ុម' : 'Publish Template & Custom Frames'}
            >
              <Palette size={15} className="text-[#D4AF37]" />
              <span className="hidden md:inline">{lang === 'vi' ? 'Đăng Mẫu Thiệp' : lang === 'km' ? 'ចុះផ្សាយគំរូសំបុត្រ' : 'Post Template'}</span>
            </button>

            {/* Create new button */}
            <button
              onClick={onCreateNew}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl red-royal-gradient text-[#FDE792] font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">{t.createNewInvitation}</span>
              <span className="sm:hidden">{lang === 'vi' ? 'Tạo mới' : 'ថ្មី'}</span>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-gray-500 hover:text-red-700 hover:bg-red-50 transition"
              title={t.logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 mt-6 space-y-6">
        {/* Action toast */}
        {actionSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-medium shadow-sm animate-fadeIn">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl red-royal-gradient text-[#FDE792] flex items-center justify-center shadow shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                {t.totalInvitations}
              </span>
              <span className="font-serif-luxury text-2xl font-black text-gray-900">
                {totalInvs}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gold-gradient-bg text-stone-900 flex items-center justify-center shadow shrink-0">
              <CheckCircle size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                {lang === 'vi' ? 'Đã Xuất Bản' : 'បានផ្សព្វផ្សាយ'}
              </span>
              <span className="font-serif-luxury text-2xl font-black text-[#8A0F1A]">
                {publishedInvs}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow shrink-0">
              <Users size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                {t.totalRsvps}
              </span>
              <span className="font-serif-luxury text-2xl font-black text-amber-900">
                {totalRsvps}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow shrink-0">
              <Heart size={22} className="fill-emerald-700" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                {t.totalAttending}
              </span>
              <span className="font-serif-luxury text-2xl font-black text-emerald-700">
                {totalAttending}
              </span>
            </div>
          </div>
        </div>

        {/* TOOLBAR & SEARCH */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: t.filterAll },
              { id: 'published', label: t.filterPublished },
              { id: 'draft', label: t.filterDraft },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id as any)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition ${
                  filter === item.id
                    ? 'red-royal-gradient text-[#FDE792] shadow'
                    : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'vi' ? 'Tìm thiệp theo tên, đường dẫn...' : 'ស្វែងរកសំបុត្រការ...'}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#8A0F1A] focus:outline-none"
              />
            </div>
            <button
              onClick={fetchInvitations}
              className="p-2 border border-stone-300 rounded-xl hover:bg-stone-50 text-gray-600 transition"
              title="Làm mới"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* INVITATION CARDS GRID */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <div className="w-8 h-8 border-3 border-[#8A0F1A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs">{t.loading}</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300">
            <span className="text-4xl block mb-2">💌</span>
            <h3 className="font-serif-luxury text-lg font-bold text-gray-800">
              {t.noInvitationsYet}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {lang === 'vi'
                ? 'Hãy bấm vào nút Tạo Thiệp Mới để bắt đầu tạo trang thiệp cưới tuyệt đẹp.'
                : 'សូមចុចប៊ូតុងបង្កើតថ្មីដើម្បីចាប់ផ្តើម។'}
            </p>
            <button
              onClick={onCreateNew}
              className="mt-4 px-5 py-2.5 red-royal-gradient text-[#FDE792] font-bold text-xs rounded-xl shadow inline-flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>{t.createNewInvitation}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-stone-200 transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Cover with Badges */}
                  <div className="relative h-44 bg-stone-100 overflow-hidden">
                    <img
                      src={inv.coverPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'}
                      alt={inv.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ${
                          inv.status === 'published'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-800/90 text-stone-200'
                        }`}
                      >
                        {inv.status === 'published' ? t.published : t.draft}
                      </span>
                      {inv.isPasswordProtected && (
                        <span className="p-1 rounded-full bg-black/60 text-amber-300" title="Bảo vệ mật khẩu">
                          <Lock size={12} />
                        </span>
                      )}
                    </div>

                    {/* Language Badge */}
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-bold text-white border border-white/20">
                      {inv.primaryLanguage === 'vi' ? 'VI' : 'KM'}
                    </div>

                    {/* Names over cover */}
                    <div className="absolute bottom-3 inset-x-3 text-white">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#FDE792]">
                        {inv.templateId}
                      </span>
                      <h3 className="font-serif-luxury text-base font-bold line-clamp-1 drop-shadow">
                        {inv.groom.fullName} & {inv.bride.fullName}
                      </h3>
                      <p className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5">
                        <Calendar size={12} />
                        <span>{new Date(inv.solarDate).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'km-KH')}</span>
                        {inv.weddingTime && <span>• {inv.weddingTime}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-gray-600 line-clamp-1 font-medium">
                      {inv.title}
                    </p>

                    {/* Public URL Box */}
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-[11px] text-gray-600">
                      <span className="font-mono truncate mr-2">/w/{inv.slug}</span>
                      <button
                        onClick={() => handleCopyLink(inv.slug)}
                        className="text-[#8A0F1A] hover:text-[#5B0910] font-semibold flex items-center gap-1 shrink-0 bg-white px-2 py-0.5 rounded shadow-xs"
                      >
                        <Copy size={12} />
                        <span>{t.copyLink}</span>
                      </button>
                    </div>

                    {/* RSVP Summary Counter */}
                    <div className="flex items-center justify-between p-2.5 bg-red-50/60 rounded-xl border border-red-100 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Users size={15} className="text-[#8A0F1A]" />
                        <span>{t.totalRsvps}:</span>
                        <strong className="text-[#8A0F1A]">{inv.stats?.rsvpCount || 0}</strong>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold">
                        Tham dự: {inv.stats?.totalGuests || 0} khách
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 pt-0 border-t border-stone-100 flex flex-col gap-2">
                  <div className="grid grid-cols-4 gap-1.5 pt-3">
                    {/* Preview */}
                    <button
                      onClick={() => onPreview(inv)}
                      className="py-2 px-1 rounded-xl border border-stone-300 hover:bg-stone-50 text-[11px] font-semibold text-gray-700 flex flex-col items-center justify-center gap-1 transition"
                      title={t.preview}
                    >
                      <Eye size={15} className="text-gray-600" />
                      <span>{t.preview}</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(inv)}
                      className="py-2 px-1 rounded-xl border border-[#D4AF37] hover:bg-amber-50 text-[11px] font-semibold text-[#8A0F1A] flex flex-col items-center justify-center gap-1 transition"
                      title={t.edit}
                    >
                      <Edit size={15} />
                      <span>{t.edit}</span>
                    </button>

                    {/* QR Code */}
                    <button
                      onClick={() =>
                        setActiveQR({
                          url: getPublicUrl(inv.slug),
                          title: inv.title,
                        })
                      }
                      className="py-2 px-1 rounded-xl border border-stone-300 hover:bg-stone-50 text-[11px] font-semibold text-gray-700 flex flex-col items-center justify-center gap-1 transition"
                      title={t.qrCode}
                    >
                      <QrCode size={15} className="text-stone-700" />
                      <span>QR</span>
                    </button>

                    {/* RSVP list */}
                    <button
                      onClick={() => setActiveRsvpInv(inv)}
                      className="py-2 px-1 rounded-xl red-royal-gradient text-[#FDE792] text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition shadow-xs"
                      title="Xem RSVP"
                    >
                      <Users size={15} />
                      <span>RSVP</span>
                    </button>
                  </div>

                  {/* Secondary actions: Personalized guest link, Duplicate, Toggle Publish, Delete */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <button
                      onClick={() => setActiveGuestLinkInv(inv)}
                      className="text-stone-600 hover:text-[#8A0F1A] font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <Link2 size={13} />
                      <span>{lang === 'vi' ? 'Link riêng' : 'តំណភ្ជាប់ភ្ញៀវ'}</span>
                    </button>

                    <button
                      onClick={() => handleTogglePublish(inv.id)}
                      className={`font-semibold text-[11px] ${
                        inv.status === 'published'
                          ? 'text-amber-700 hover:text-amber-800'
                          : 'text-emerald-700 hover:text-emerald-800'
                      }`}
                    >
                      {inv.status === 'published' ? t.unpublish : t.publish}
                    </button>

                    <button
                      onClick={() => handleDuplicate(inv.id)}
                      className="text-stone-500 hover:text-stone-800 text-[11px] font-medium"
                    >
                      {t.duplicateInvitation}
                    </button>

                    <button
                      onClick={() => handleDelete(inv.id, inv.title)}
                      className="text-stone-400 hover:text-red-600 transition"
                      title={t.delete}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* QR MODAL */}
      {activeQR && (
        <QRCodeModal
          isOpen={Boolean(activeQR)}
          onClose={() => setActiveQR(null)}
          url={activeQR.url}
          title={activeQR.title}
          lang={lang}
        />
      )}

      {/* GUEST LINK MODAL */}
      {activeGuestLinkInv && (
        <GuestLinkModal
          isOpen={Boolean(activeGuestLinkInv)}
          onClose={() => setActiveGuestLinkInv(null)}
          invitationId={activeGuestLinkInv.id}
          invitationSlug={activeGuestLinkInv.slug}
          token={token}
          lang={lang}
        />
      )}

      {/* RSVP LIST MODAL */}
      {activeRsvpInv && (
        <RsvpListModal
          isOpen={Boolean(activeRsvpInv)}
          onClose={() => setActiveRsvpInv(null)}
          invitationId={activeRsvpInv.id}
          invitationTitle={activeRsvpInv.title}
          token={token}
          lang={lang}
        />
      )}

      {/* DEFAULT TEMPLATE MODAL */}
      <DefaultTemplateModal
        isOpen={showDefaultTemplateModal}
        onClose={() => setShowDefaultTemplateModal(false)}
        lang={lang}
        onToggleLang={onToggleLang}
      />
    </div>
  );
};
