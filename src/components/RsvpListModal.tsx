import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, Search, CheckCircle, AlertCircle, HelpCircle, Users, Heart } from 'lucide-react';
import { RSVP, Language } from '../types/wedding';
import { getTranslation } from '../i18n/translations';

interface RsvpListModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationId: string;
  invitationTitle: string;
  token: string;
  lang: Language;
}

export const RsvpListModal: React.FC<RsvpListModalProps> = ({
  isOpen,
  onClose,
  invitationId,
  invitationTitle,
  token,
  lang,
}) => {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'attending' | 'not_attending' | 'undecided'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const t = getTranslation(lang);

  const fetchRsvps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/rsvps`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRsvps(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && invitationId) {
      fetchRsvps();
    }
  }, [isOpen, invitationId]);

  if (!isOpen) return null;

  const handleDelete = async (rsvpId: string) => {
    if (!confirm(lang === 'vi' ? 'Bạn có chắc chắn muốn xóa phản hồi này?' : 'តើលោកអ្នកចង់លុបការឆ្លើយតបនេះមែនទេ?')) return;
    try {
      const res = await fetch(`/api/rsvps/${rsvpId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRsvps(rsvps.filter((r) => r.id !== rsvpId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCsv = () => {
    window.open(`/api/invitations/${invitationId}/rsvps/export?token=${token}`, '_blank');
  };

  // Filtered list
  const filteredRsvps = rsvps.filter((r) => {
    const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch =
      !searchTerm ||
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.phone && r.phone.includes(searchTerm));
    return matchesFilter && matchesSearch;
  });

  // Calculate metrics
  const attendingCount = rsvps.filter((r) => r.status === 'attending').length;
  const notAttendingCount = rsvps.filter((r) => r.status === 'not_attending').length;
  const undecidedCount = rsvps.filter((r) => r.status === 'undecided').length;
  const totalAttendingGuests = rsvps
    .filter((r) => r.status === 'attending')
    .reduce((sum, r) => sum + (r.accompanyCount || 1), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#D4AF37]/50 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="red-royal-gradient p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-[#FDE792]">
              {lang === 'vi' ? 'Danh Sách Khách Phản Hồi (RSVP)' : 'បញ្ជីភ្ញៀវឆ្លើយតប (RSVP)'}
            </h3>
            <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{invitationTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm transition"
            >
              <Download size={14} />
              <span>{t.exportCsv}</span>
            </button>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#FAF7F2] border-b border-stone-200 text-center">
          <div className="p-3 bg-white rounded-2xl border border-stone-200">
            <span className="text-[11px] text-gray-500 block uppercase font-bold">{t.totalRsvps}</span>
            <span className="font-serif-luxury text-xl font-bold text-gray-900">{rsvps.length}</span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-emerald-200">
            <span className="text-[11px] text-emerald-700 block uppercase font-bold">Tham gia</span>
            <span className="font-serif-luxury text-xl font-bold text-emerald-700">{attendingCount}</span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-emerald-200">
            <span className="text-[11px] text-emerald-700 block uppercase font-bold">Tổng số khách</span>
            <span className="font-serif-luxury text-xl font-bold text-emerald-700">{totalAttendingGuests}</span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-red-200">
            <span className="text-[11px] text-red-700 block uppercase font-bold">Vắng mặt / Chưa chắc</span>
            <span className="font-serif-luxury text-xl font-bold text-stone-700">{notAttendingCount + undecidedCount}</span>
          </div>
        </div>

        {/* Filter and search */}
        <div className="p-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: t.filterAll },
              { id: 'attending', label: 'Tham gia' },
              { id: 'not_attending', label: 'Không tham gia' },
              { id: 'undecided', label: 'Chưa chắc' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterStatus === f.id
                    ? 'red-royal-gradient text-[#FDE792]'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, SĐT..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-xl"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-xs text-gray-400 py-10 text-center">{t.loading}</p>
          ) : filteredRsvps.length === 0 ? (
            <p className="text-xs text-gray-500 py-10 text-center italic">{t.noRsvpsYet}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-gray-500 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Khách mời</th>
                    <th className="py-2.5 px-3">Điện thoại</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3">Số người</th>
                    <th className="py-2.5 px-3">Bên khách</th>
                    <th className="py-2.5 px-3">Lời chúc</th>
                    <th className="py-2.5 px-3">Thời gian</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredRsvps.map((r) => (
                    <tr key={r.id} className="hover:bg-stone-50 transition">
                      <td className="py-3 px-3 font-bold text-gray-900">{r.guestName}</td>
                      <td className="py-3 px-3 font-mono text-gray-600">{r.phone || '—'}</td>
                      <td className="py-3 px-3">
                        {r.status === 'attending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <CheckCircle size={12} /> Tham gia
                          </span>
                        )}
                        {r.status === 'not_attending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-bold">
                            <X size={12} /> Không thể đến
                          </span>
                        )}
                        {r.status === 'undecided' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                            <HelpCircle size={12} /> Chưa rõ
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-700">{r.accompanyCount || 1}</td>
                      <td className="py-3 px-3 text-gray-600">
                        {r.side === 'groom' ? 'Nhà Trai' : r.side === 'bride' ? 'Nhà Gái' : 'Chung'}
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate italic text-gray-500">
                        {r.message || '—'}
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-[10px]">
                        {new Date(r.submittedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                          title="Xóa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
