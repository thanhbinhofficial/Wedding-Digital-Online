import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, Share2 } from 'lucide-react';
import { Language } from '../types/wedding';
import { getTranslation } from '../i18n/translations';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  lang: Language;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
  lang,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = getTranslation(lang);

  useEffect(() => {
    if (isOpen && url) {
      QRCode.toDataURL(url, {
        width: 380,
        margin: 2,
        color: {
          dark: '#8A0F1A', // Royal red
          light: '#FFFFFF',
        },
      })
        .then((dataUri) => {
          setQrDataUrl(dataUri);
        })
        .catch((err) => {
          console.error('Failed to generate QR:', err);
        });
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR_${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title} - Trân trọng kính mời quý khách!`,
          url,
        });
      } catch (e) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#D4AF37]/40">
        {/* Header with Royal Red Pattern */}
        <div className="red-royal-gradient p-5 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
          <span className="text-2xl mb-1 block">囍</span>
          <h3 className="font-serif-luxury text-xl font-bold tracking-wide text-[#F9E29B]">
            {t.qrCode}
          </h3>
          <p className="text-xs text-white/80 line-clamp-1 mt-1 px-4">{title}</p>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          <p className="text-sm text-gray-600 mb-4">
            {lang === 'vi'
              ? 'Quét mã QR bằng máy ảnh điện thoại hoặc Zalo để mở thiệp trực tiếp'
              : lang === 'en'
              ? 'Scan this QR code with your mobile camera to open the invitation'
              : 'ស្កេនកូដ QR នេះដោយប្រើកាមេរ៉ាទូរស័ព្ទដើម្បីបើកលិខិតអញ្ជើញ'}
          </p>

          <div className="p-3 bg-gradient-to-tr from-[#B37D28] via-[#F5D77F] to-[#B37D28] rounded-xl shadow-lg mb-5">
            <div className="bg-white p-3 rounded-lg">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-gray-400">
                  {t.loading}
                </div>
              )}
            </div>
          </div>

          {/* URL box */}
          <div className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-gray-600 mb-5 break-all">
            <span className="truncate mr-2 font-mono text-left">{url}</span>
            <button
              onClick={handleCopy}
              className="text-[#8A0F1A] hover:text-[#5B0910] font-semibold flex items-center gap-1 shrink-0 px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? t.copied : t.copyLink}</span>
            </button>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#D4AF37] text-[#8A0F1A] font-medium text-sm hover:bg-[#FAF7F2] transition shadow-sm"
            >
              <Download size={16} />
              <span>{lang === 'vi' ? 'Tải ảnh QR' : lang === 'en' ? 'Download QR' : 'ទាញយក QR'}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl red-royal-gradient text-[#FDE792] font-semibold text-sm hover:brightness-110 transition shadow-md"
            >
              <Share2 size={16} />
              <span>{t.share}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
