import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Copy, Check, ExternalLink, Link2, UserCheck } from 'lucide-react';
import { PersonalizedGuest, Language } from '../types/wedding';
import { getTranslation } from '../i18n/translations';

interface GuestLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationId: string;
  invitationSlug: string;
  token: string;
  lang: Language;
}

export const GuestLinkModal: React.FC<GuestLinkModalProps> = ({
  isOpen,
  onClose,
  invitationId,
  invitationSlug,
  token,
  lang,
}) => {
  const [guests, setGuests] = useState<PersonalizedGuest[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New guest input form
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Bạn');
  const [phone, setPhone] = useState('');
  const [side, setSide] = useState<'groom' | 'bride' | 'mutual'>('mutual');
  const [customGreeting, setCustomGreeting] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const t = getTranslation(lang);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/guests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGuests(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && invitationId) {
      fetchGuests();
    }
  }, [isOpen, invitationId]);

  if (!isOpen) return null;

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/guests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          title: title.trim(),
          phone: phone.trim(),
          side,
          customGreeting: customGreeting.trim(),
        }),
      });
      if (res.ok) {
        const newGuest = await res.json();
        setGuests([newGuest, ...guests]);
        setName('');
        setPhone('');
        setCustomGreeting('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    try {
      const res = await fetch(`/api/invitations/${invitationId}/guests/${guestId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setGuests(guests.filter((g) => g.id !== guestId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getGuestUrl = (code: string) => {
    const origin = window.location.origin;
    return `${origin}/w/${invitationSlug}?guest=${code}`;
  };

  const handleCopyLink = (code: string, id: string) => {
    navigator.clipboard.writeText(getGuestUrl(code));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#D4AF37]/50 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="red-royal-gradient p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 size={20} className="text-[#FDE792]" />
            <h3 className="font-serif-luxury text-lg font-bold text-[#FDE792]">
              {lang === 'vi' ? 'Tạo Link Mời Riêng Cho Từng Khách Mời' : 'បង្កើតតំណភ្ជាប់សម្រាប់ភ្ញៀវជាក់លាក់'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Add guest form */}
          <form onSubmit={handleAddGuest} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A0F1A] block">
              {lang === 'vi' ? 'Thêm khách mời mới' : 'បន្ថែមភ្ញៀវថ្មី'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Xưng hô</label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                >
                  <option value="Anh">Anh</option>
                  <option value="Chị">Chị</option>
                  <option value="Em">Em</option>
                  <option value="Bạn">Bạn</option>
                  <option value="Cô/Chú">Cô/Chú</option>
                  <option value="Bác">Bác</option>
                  <option value="Gia đình">Gia đình</option>
                  <option value="លោក (Mr.)">លោក (Mr.)</option>
                  <option value="លោកស្រី (Mrs.)">លោកស្រី (Mrs.)</option>
                  <option value="កញ្ញា (Ms.)">កញ្ញា (Ms.)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Họ và tên khách mời *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Hùng"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Khách của bên</label>
                <select
                  value={side}
                  onChange={(e) => setSide(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                >
                  <option value="mutual">Chung</option>
                  <option value="groom">Nhà Trai</option>
                  <option value="bride">Nhà Gái</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Lời mời thân mật riêng (Hiển thị đầu thiệp khi khách mở link)
              </label>
              <input
                type="text"
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                placeholder="VD: Trân trọng kính mời Anh Hùng và gia đình đến chung vui cùng tụi mình nhé!"
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 red-royal-gradient text-[#FDE792] font-semibold text-xs rounded-xl shadow hover:brightness-110 flex items-center gap-1.5 transition ml-auto"
            >
              <Plus size={14} />
              <span>{lang === 'vi' ? 'Tạo Link Khách Mời' : 'បង្កើតតំណភ្ជាប់'}</span>
            </button>
          </form>

          {/* List of guest links */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              {lang === 'vi' ? `Danh sách link khách mời (${guests.length})` : `បញ្ជីតំណភ្ជាប់ភ្ញៀវ (${guests.length})`}
            </h4>

            {loading ? (
              <p className="text-xs text-gray-400 py-4 text-center">{t.loading}</p>
            ) : guests.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center italic bg-stone-50 rounded-xl border border-dashed border-stone-300">
                {lang === 'vi'
                  ? 'Chưa có link khách mời riêng nào. Hãy thêm khách mời ở trên!'
                  : 'មិនទាន់មានតំណភ្ជាប់ភ្ញៀវនៅឡើយទេ។'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {guests.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 bg-white rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#8A0F1A]">
                          {g.title} {g.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                          {g.side === 'groom' ? 'Nhà Trai' : g.side === 'bride' ? 'Nhà Gái' : 'Chung'}
                        </span>
                      </div>
                      {g.customGreeting && (
                        <p className="text-xs text-gray-500 italic mt-0.5">
                          "{g.customGreeting}"
                        </p>
                      )}
                      <span className="text-[11px] text-gray-400 font-mono block mt-1">
                        .../w/{invitationSlug}?guest={g.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyLink(g.code, g.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-gray-700 transition"
                      >
                        {copiedId === g.id ? (
                          <>
                            <Check size={14} className="text-emerald-600" />
                            <span className="text-emerald-600">{t.copied}</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>{t.copyLink}</span>
                          </>
                        )}
                      </button>

                      <a
                        href={getGuestUrl(g.code)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#8A0F1A] hover:bg-stone-100 transition"
                        title="Mở thiệp"
                      >
                        <ExternalLink size={16} />
                      </a>

                      <button
                        onClick={() => handleDeleteGuest(g.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
