import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Music,
  Volume2,
  VolumeX,
  Share2,
  QrCode,
  CheckCircle,
  AlertCircle,
  Copy,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Lock,
  ArrowRight,
  Globe,
  X,
  Users,
  Home,
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
  Mail,
  Bell,
  Eye,
  Settings,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Plus,
  LayoutGrid,
} from 'lucide-react';
import { Invitation, Language, RSVP, TemplateId, EmailNotificationLog } from '../types/wedding';
import {
  getTranslation,
  translateText,
  translatePersonalizedMessage,
  translateStoryTitle,
  translateStoryDescription,
  translateFamilyMessage,
  translateAddress,
  translateLunarDate,
  formatSolarDate,
  translateRepresentative,
  translateHometown,
  translateParentsName,
  translateCoupleName,
  translateInvitationTitle,
} from '../i18n/translations';
import { LanguageSelector } from './LanguageFlags';
import { weddingAudio } from '../utils/audioPlayer';
import { QRCodeModal } from './QRCodeModal';
import {
  WeddingAvatarFrame,
  WeddingHeartFrame,
  WeddingGalleryFrame,
  WeddingLogoFrame,
} from './WeddingPhotoFrame';
import { PhotoAdjustModal } from './PhotoAdjustModal';
import { LotusFrameCard } from './LotusFrameCard';
import { ScrollReveal } from './ScrollReveal';

// Helper to split couple names into 2 lines (Top big 30px, Bottom small 20px, font-muol font-normal - NOT BOLD)
export function splitCoupleName(fullName: string) {
  if (!fullName) return { mainName: '', subName: '' };
  
  const trimmed = fullName.trim();

  // 1. If explicit newline exists
  if (trimmed.includes('\n')) {
    const lines = trimmed.split('\n').map(s => s.trim()).filter(Boolean);
    return {
      mainName: lines[0] || '',
      subName: lines.slice(1).join(' ') || '',
    };
  }

  // 2. If name contains parentheses, e.g. "គង់ សីហា (Kong Seyha)" or "ងួន សុវណ្ណា (Nguon Sovanna)"
  const parenMatch = trimmed.match(/^(.*?)\s*[\(\（](.*?)[\)\）]\s*$/);
  if (parenMatch) {
    return {
      mainName: parenMatch[1].trim(),
      subName: `(${parenMatch[2].trim()})`,
    };
  }

  // 3. If separated by hyphen, en-dash, em-dash, or slash (e.g. "ងួន សុវណ្ណា-Nguon Sovanna" or "A - B")
  const separatorMatch = trimmed.match(/^(.*?)\s*[-–—\/]\s*(.*?)$/);
  if (separatorMatch) {
    const main = separatorMatch[1].trim();
    let sub = separatorMatch[2].trim();
    if (sub && !sub.startsWith('(') && !sub.endsWith(')')) {
      sub = `(${sub})`;
    }
    return { mainName: main, subName: sub };
  }

  return { mainName: trimmed, subName: '' };
}

interface CoupleNameDisplayProps {
  fullName: string;
  textColorClass?: string;
  mainSizeClass?: string;
  subSizeClass?: string;
  className?: string;
  lang?: Language;
}

export const getHeaderFontClass = (lang: Language = 'vi') => {
  if (lang === 'vi') return 'font-times font-bold';
  if (lang === 'en') return 'font-cinzel font-bold';
  return 'font-muol font-normal';
};

export const getBodyFontClass = (lang: Language = 'vi') => {
  if (lang === 'vi') return 'font-times';
  if (lang === 'en') return 'font-sans';
  return 'font-battambang';
};

export function translateVenueName(rawVenue: string | undefined, side: 'groom' | 'bride' | 'reception', lang: Language): string {
  if (!rawVenue) return '';
  const textLower = rawVenue.trim().toLowerCase();

  if (side === 'groom' && (textLower.includes('tư gia') || textLower.includes('nhà trai') || textLower.includes('គេហដ្ឋាន'))) {
    if (lang === 'vi') return 'Tư gia Nhà Trai';
    if (lang === 'km') return 'គេហដ្ឋានខាងប្រុស';
    return "Groom's Residence";
  }
  if (side === 'bride' && (textLower.includes('tư gia') || textLower.includes('nhà gái') || textLower.includes('គេហដ្ឋាន'))) {
    if (lang === 'vi') return 'Tư gia Nhà Gái';
    if (lang === 'km') return 'គេហដ្ឋានខាងស្រី';
    return "Bride's Residence";
  }
  if (side === 'reception' && (textLower.includes('trung tâm') || textLower.includes('yến tiệc') || textLower.includes('មជ្ឈមណ្ឌល'))) {
    if (lang === 'vi') return 'Trung Tâm Yến Tiệc';
    if (lang === 'km') return 'មជ្ឈមណ្ឌលសន្និបាត និងពិព័រណ៍';
    return 'Wedding Banquet Hall';
  }
  return rawVenue;
}

export const CoupleNameDisplay: React.FC<CoupleNameDisplayProps> = ({
  fullName,
  textColorClass = 'text-[#8A0F1A]',
  mainSizeClass = 'text-[30px]',
  subSizeClass = 'text-[20px]',
  className = '',
  lang = 'vi',
}) => {
  const { mainName, subName } = splitCoupleName(fullName);
  const isVi = lang === 'vi';
  const isEn = lang === 'en';

  const mainFontClass = isVi ? 'font-times font-bold' : isEn ? 'font-cinzel font-bold' : 'font-muol font-normal';
  const subFontClass = isVi ? 'font-times font-normal opacity-90' : isEn ? 'font-serif-luxury font-normal opacity-90' : 'font-battambang font-normal opacity-90';

  return (
    <div className={`flex flex-col items-center text-center my-1 ${className}`}>
      {/* Top Line: Main Name */}
      <h1 className={`${mainFontClass} ${mainSizeClass} ${textColorClass} tracking-tight leading-tight drop-shadow-xs`}>
        {mainName}
      </h1>
      
      {/* Bottom Line: Secondary Name */}
      {subName && (
        <span className={`${subFontClass} ${subSizeClass} ${textColorClass} mt-1 leading-snug block`}>
          {subName}
        </span>
      )}
    </div>
  );
};

interface PublicInvitationProps {
  invitation: Invitation;
  personalizedGuestCode?: string;
  onBackToDashboard?: () => void;
  onGoHome?: () => void;
  onOpenLogin?: () => void;
  isAdmin?: boolean;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const PublicInvitation: React.FC<PublicInvitationProps> = ({
  invitation,
  personalizedGuestCode,
  onBackToDashboard,
  onGoHome,
  onOpenLogin,
  isAdmin = false,
  lang: propLang,
  onLanguageChange,
}) => {
  const [currentLang, setCurrentLang] = useState<Language>(propLang || invitation.primaryLanguage || 'vi');

  useEffect(() => {
    if (propLang) {
      setCurrentLang(propLang);
    } else if (invitation.primaryLanguage) {
      setCurrentLang(invitation.primaryLanguage);
    }
  }, [propLang, invitation.id, invitation.primaryLanguage]);

  const handleLanguageChange = (newLang: Language) => {
    setCurrentLang(newLang);
    invitation.primaryLanguage = newLang;
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const t = getTranslation(currentLang);

  // Custom Logo upload state
  const [logoUrl, setLogoUrl] = useState<string>(
    invitation.logoUrl || localStorage.getItem('wedding_admin_logo') || ''
  );
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (invitation.logoUrl) {
      setLogoUrl(invitation.logoUrl);
    } else {
      const stored = localStorage.getItem('wedding_admin_logo');
      if (stored) setLogoUrl(stored);
    }
  }, [invitation.logoUrl]);

  // Custom Cover Photo Background state
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string>(
    invitation.coverPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80'
  );
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (invitation.coverPhoto) {
      setCoverPhotoUrl(invitation.coverPhoto);
    }
  }, [invitation.coverPhoto]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        localStorage.setItem('wedding_admin_logo', result);
        invitation.logoUrl = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCoverPhotoUrl(result);
        invitation.coverPhoto = result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to persist public customizations (frames, ornaments, hostEmail, smtpConfig) to server DB
  const saveCustomizationToServer = async (patch: Record<string, any>) => {
    if (!invitation.slug) return;
    try {
      await fetch(`/api/public/invitations/${invitation.slug}/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    } catch (err) {
      console.error('Error saving customization:', err);
    }
  };

  // Custom Invitation Frame & Custom Ornament Upload State
  const [customFrameUrl, setCustomFrameUrl] = useState<string | undefined>(invitation.customFrameUrl);
  const frameFileInputRef = useRef<HTMLInputElement>(null);

  const [customOrnamentUrl, setCustomOrnamentUrl] = useState<string | undefined>(invitation.customOrnamentUrl);
  const ornamentFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCustomFrameUrl(invitation.customFrameUrl);
    setCustomOrnamentUrl(invitation.customOrnamentUrl);
  }, [invitation.customFrameUrl, invitation.customOrnamentUrl]);

  // Individual Schedule Card Custom Frame Upload Refs & Handler
  const groomScheduleFrameRef = useRef<HTMLInputElement>(null);
  const brideScheduleFrameRef = useRef<HTMLInputElement>(null);
  const receptionScheduleFrameRef = useRef<HTMLInputElement>(null);

  // RSVP Form Custom Frame Upload Ref & Handler
  const rsvpFrameRef = useRef<HTMLInputElement>(null);
  const [rsvpCustomFrameUrl, setRsvpCustomFrameUrl] = useState<string | undefined>(invitation.rsvpFrameUrl);

  // Bank QR Card Custom Frame Upload Ref & Handler
  const bankFrameRef = useRef<HTMLInputElement>(null);
  const [bankCustomFrameUrl, setBankCustomFrameUrl] = useState<string | undefined>(invitation.bankFrameUrl);

  const handleBankFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        invitation.bankFrameUrl = result;
        setBankCustomFrameUrl(result);
        setRsvpForm((prev) => ({ ...prev }));
        saveCustomizationToServer({ bankFrameUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRsvpFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        invitation.rsvpFrameUrl = result;
        setRsvpCustomFrameUrl(result);
        setRsvpForm((prev) => ({ ...prev }));
        saveCustomizationToServer({ rsvpFrameUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCardFrameUpload = (
    cardTarget: 'groomCeremony' | 'brideCeremony' | 'reception',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (cardTarget === 'groomCeremony') {
          invitation.groomCeremony.customFrameUrl = result;
          saveCustomizationToServer({ groomCeremonyFrameUrl: result });
        } else if (cardTarget === 'brideCeremony') {
          invitation.brideCeremony.customFrameUrl = result;
          saveCustomizationToServer({ brideCeremonyFrameUrl: result });
        } else if (cardTarget === 'reception') {
          invitation.reception.customFrameUrl = result;
          saveCustomizationToServer({ receptionFrameUrl: result });
        }
        setRsvpForm((prev) => ({ ...prev }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomFrameUrl(result);
        invitation.customFrameUrl = result;
        invitation.frameStyle = 'custom';
        saveCustomizationToServer({ customFrameUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteCustomFrame = () => {
    setCustomFrameUrl('');
    invitation.customFrameUrl = undefined;
    setRsvpForm((prev) => ({ ...prev }));
    saveCustomizationToServer({ customFrameUrl: '' });
  };

  const handleCustomOrnamentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomOrnamentUrl(result);
        invitation.customOrnamentUrl = result;
        setRsvpForm((prev) => ({ ...prev }));
        saveCustomizationToServer({ customOrnamentUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteOrnament = () => {
    setCustomOrnamentUrl('');
    invitation.customOrnamentUrl = undefined;
    setRsvpForm((prev) => ({ ...prev }));
    saveCustomizationToServer({ customOrnamentUrl: '' });
  };

  // Photo Drag / Position Adjustment State
  const [adjustModal, setAdjustModal] = useState<{
    isOpen: boolean;
    imageSrc: string;
    title: string;
    initialOffset?: { x: number; y: number; zoom: number };
    frameType: 'heart' | 'circle' | 'square' | 'logo';
    target: 'groom' | 'bride' | 'logo' | 'cover' | 'customFrame' | 'gallery' | 'qrGroom' | 'qrBride';
    galleryIndex?: number;
  }>({
    isOpen: false,
    imageSrc: '',
    title: '',
    frameType: 'heart',
    target: 'groom',
  });

  // Envelope open state
  const [isOpened, setIsOpened] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Password state if locked
  const [isUnlocked, setIsUnlocked] = useState(!invitation.isPasswordProtected);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Personalized guest data
  const [personalizedGuest, setPersonalizedGuest] = useState<{
    name: string;
    title: string;
    customGreeting?: string;
  } | null>(null);

  // Lightbox photo
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Photo Gallery Slider / Carousel State (supports Touch, Mouse Drag, Keyboard & All Screen Sizes)
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isGalleryAutoPlay, setIsGalleryAutoPlay] = useState<boolean>(true);
  const [isGalleryHovered, setIsGalleryHovered] = useState<boolean>(false);
  const [galleryViewMode, setGalleryViewMode] = useState<'slider' | 'strip' | 'grid'>('slider');
  const galleryTouchStartX = useRef<number | null>(null);
  const galleryMouseStartX = useRef<number | null>(null);
  const galleryStripRef = useRef<HTMLDivElement>(null);
  const addGalleryPhotoInputRef = useRef<HTMLInputElement>(null);

  const galleryLength = invitation.photoGallery?.length || 0;

  const handlePrevSlide = () => {
    if (galleryLength <= 1) return;
    setActiveSlideIndex((prev) => {
      const nextIdx = (prev - 1 + galleryLength) % galleryLength;
      if (galleryViewMode === 'strip' && galleryStripRef.current) {
        const cardEl = galleryStripRef.current.children[nextIdx] as HTMLElement | undefined;
        cardEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
      return nextIdx;
    });
  };

  const handleNextSlide = () => {
    if (galleryLength <= 1) return;
    setActiveSlideIndex((prev) => {
      const nextIdx = (prev + 1) % galleryLength;
      if (galleryViewMode === 'strip' && galleryStripRef.current) {
        const cardEl = galleryStripRef.current.children[nextIdx] as HTMLElement | undefined;
        cardEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
      return nextIdx;
    });
  };

  useEffect(() => {
    if (!isGalleryAutoPlay || isGalleryHovered || galleryViewMode === 'grid' || galleryLength <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => {
        const nextIdx = (prev + 1) % galleryLength;
        if (galleryViewMode === 'strip' && galleryStripRef.current) {
          const cardEl = galleryStripRef.current.children[nextIdx] as HTMLElement | undefined;
          cardEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
        return nextIdx;
      });
    }, 3200);
    return () => clearInterval(timer);
  }, [isGalleryAutoPlay, isGalleryHovered, galleryViewMode, galleryLength]);

  // Keyboard navigation (ArrowLeft / ArrowRight / Escape) for desktop & laptop users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (lightboxUrl && invitation.photoGallery && invitation.photoGallery.length > 1) {
        if (e.key === 'ArrowLeft') {
          const currIdx = invitation.photoGallery.indexOf(lightboxUrl);
          const prevIdx = currIdx >= 0 ? (currIdx - 1 + invitation.photoGallery.length) % invitation.photoGallery.length : 0;
          setLightboxUrl(invitation.photoGallery[prevIdx]);
          setActiveSlideIndex(prevIdx);
        } else if (e.key === 'ArrowRight') {
          const currIdx = invitation.photoGallery.indexOf(lightboxUrl);
          const nextIdx = currIdx >= 0 ? (currIdx + 1) % invitation.photoGallery.length : 0;
          setLightboxUrl(invitation.photoGallery[nextIdx]);
          setActiveSlideIndex(nextIdx);
        } else if (e.key === 'Escape') {
          setLightboxUrl(null);
        }
      } else if (galleryLength > 1) {
        if (e.key === 'ArrowLeft') handlePrevSlide();
        else if (e.key === 'ArrowRight') handleNextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxUrl, galleryLength, galleryViewMode]);

  const handleAddGalleryPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const newUrl = reader.result as string;
          const updatedGallery = [...(invitation.photoGallery || []), newUrl];
          invitation.photoGallery = updatedGallery;
          setActiveSlideIndex(updatedGallery.length - 1);
          setRsvpForm((prev) => ({ ...prev }));
          saveCustomizationToServer({ photoGallery: updatedGallery });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // QR Modal
  const [showQRModal, setShowQRModal] = useState(false);

  // Bank copy & Bank QR upload states
  const [copiedBankGroom, setCopiedBankGroom] = useState(false);
  const [copiedBankBride, setCopiedBankBride] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [editingBankSide, setEditingBankSide] = useState<'groom' | 'bride' | null>(null);
  const groomQrInputRef = useRef<HTMLInputElement>(null);
  const brideQrInputRef = useRef<HTMLInputElement>(null);

  const handleBankQrUpload = (side: 'groom' | 'bride', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const qrDataUrl = reader.result as string;
          invitation.bankInfo[side] = {
            ...invitation.bankInfo[side],
            qrImage: qrDataUrl,
          };
          setRsvpForm((prev) => ({ ...prev }));
          saveCustomizationToServer({ bankInfo: invitation.bankInfo });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteBankQr = (side: 'groom' | 'bride') => {
    invitation.bankInfo[side] = {
      ...invitation.bankInfo[side],
      qrImage: '',
      qrOffset: undefined,
    };
    setRsvpForm((prev) => ({ ...prev }));
    saveCustomizationToServer({ bankInfo: invitation.bankInfo });
  };

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // RSVP Form State
  const [rsvpForm, setRsvpForm] = useState<{
    guestName: string;
    phone: string;
    status: 'attending' | 'not_attending' | 'undecided';
    accompanyCount: number;
    side: 'groom' | 'bride' | 'mutual';
    message: string;
  }>({
    guestName: '',
    phone: '',
    status: 'attending',
    accompanyCount: 1,
    side: 'mutual',
    message: '',
  });

  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState<string | null>(null);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  // Host Email Notification State (for ការឆ្លើយតបចូលរួម)
  const [hostEmail, setHostEmail] = useState<string>(invitation.hostEmail || 'kungseyhaofficial@gmail.com');
  const [smtpGmailUser, setSmtpGmailUser] = useState<string>(invitation.smtpConfig?.gmailUser || '');
  const [smtpGmailAppPassword, setSmtpGmailAppPassword] = useState<string>(invitation.smtpConfig?.gmailAppPassword || '');
  const [showHostEmailPanel, setShowHostEmailPanel] = useState<boolean>(false);
  const [showSmtpAdvanced, setShowSmtpAdvanced] = useState<boolean>(false);
  const [hostEmailSaving, setHostEmailSaving] = useState<boolean>(false);
  const [hostEmailSaveMsg, setHostEmailSaveMsg] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState<boolean>(false);
  const [emailNotificationInfo, setEmailNotificationInfo] = useState<{
    sent: boolean;
    toEmail?: string;
    subject?: string;
    deliveryMethod?: string;
    previewUrl?: string;
    mailtoUrl?: string;
    htmlPreview?: string;
  } | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>([]);
  const [showEmailLogs, setShowEmailLogs] = useState<boolean>(false);
  const [emailPreviewHtml, setEmailPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    if (invitation.hostEmail) {
      setHostEmail(invitation.hostEmail);
    }
    if (invitation.smtpConfig?.gmailUser) {
      setSmtpGmailUser(invitation.smtpConfig.gmailUser);
    }
    if (invitation.smtpConfig?.gmailAppPassword) {
      setSmtpGmailAppPassword(invitation.smtpConfig.gmailAppPassword);
    }
  }, [invitation.hostEmail, invitation.smtpConfig]);

  const fetchEmailLogs = async () => {
    if (!invitation.slug) return;
    try {
      const res = await fetch(`/api/public/invitations/${invitation.slug}/email-logs`);
      if (res.ok) {
        const data = await res.json();
        setEmailLogs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEmailLogs();
  }, [invitation.slug]);

  const handleSaveHostEmail = async () => {
    setHostEmailSaving(true);
    setHostEmailSaveMsg(null);
    invitation.hostEmail = hostEmail.trim();
    invitation.smtpConfig = {
      gmailUser: smtpGmailUser.trim(),
      gmailAppPassword: smtpGmailAppPassword.trim(),
    };
    await saveCustomizationToServer({
      hostEmail: hostEmail.trim(),
      smtpConfig: {
        gmailUser: smtpGmailUser.trim(),
        gmailAppPassword: smtpGmailAppPassword.trim(),
      },
    });
    setHostEmailSaving(false);
    setHostEmailSaveMsg(
      currentLang === 'vi'
        ? `✓ Đã lưu Email chủ hôn (${hostEmail.trim()}). Khi khách bấm (ការឆ្លើយតបចូលរួម), hệ thống sẽ gửi thông báo qua Email này!`
        : currentLang === 'en'
        ? `✓ Saved Host Email (${hostEmail.trim()}). You will receive email notifications when guests submit RSVP!`
        : `✓ បានរក្សាទុកអ៊ីមែលម្ចាស់ដើមការ (${hostEmail.trim()}) រួចរាល់! ពេលភ្ញៀវចុច (ការឆ្លើយតបចូលរួម) ប្រព័ន្ធនឹងផ្ញើដំណឹងទៅអ៊ីមែលនេះ។`
    );
    setTimeout(() => setHostEmailSaveMsg(null), 5000);
  };

  const handleTestHostEmail = async () => {
    if (!hostEmail.trim()) return;
    setTestingEmail(true);
    setEmailNotificationInfo(null);
    try {
      await handleSaveHostEmail();
      const res = await fetch(`/api/public/invitations/${invitation.slug}/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostEmail: hostEmail.trim() }),
      });
      const data = await res.json();
      if (data.emailResult) {
        setEmailNotificationInfo(data.emailResult);
        fetchEmailLogs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTestingEmail(false);
    }
  };

  // Public wishes list
  const [recentWishes, setRecentWishes] = useState<RSVP[]>([]);

  // Calculate countdown
  useEffect(() => {
    const calculateTime = () => {
      const weddingDateStr = `${invitation.solarDate}T${invitation.weddingTime || '11:00'}:00`;
      const targetTime = new Date(weddingDateStr).getTime();
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [invitation.solarDate, invitation.weddingTime]);

  // Sync music state with audio player
  useEffect(() => {
    weddingAudio.setListener((playing) => {
      setIsPlayingMusic(playing);
    });
    return () => {
      weddingAudio.pause();
    };
  }, []);

  // Fetch personalized guest info if guest code present
  useEffect(() => {
    if (personalizedGuestCode) {
      fetch(`/api/public/invitations/${invitation.slug}/guest-info?code=${personalizedGuestCode}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setPersonalizedGuest(data);
            setRsvpForm((prev) => ({
              ...prev,
              guestName: data.name,
              phone: data.phone || '',
              side: data.side || 'mutual',
            }));
          }
        })
        .catch((e) => console.error(e));
    }
  }, [personalizedGuestCode, invitation.slug]);

  // Handle open envelope with audio & confetti
  const handleOpenEnvelope = () => {
    setIsOpened(true);
    // Start music
    if (invitation.bgMusicPreset !== 'none') {
      weddingAudio.play(invitation.customMusicUrl);
    }
    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#8A0F1A', '#FFD700', '#F9E29B'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handleToggleMusic = () => {
    weddingAudio.toggle(invitation.customMusicUrl);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === invitation.password) {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpForm.guestName.trim()) {
      setRsvpError(t.guestNamePlaceholder);
      return;
    }

    setRsvpSubmitting(true);
    setRsvpError(null);
    try {
      const res = await fetch(`/api/public/invitations/${invitation.slug}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...rsvpForm,
          guestCode: personalizedGuestCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi gửi phản hồi');
      }

      const notifiedEmail = data.emailNotification?.toEmail || hostEmail;
      const emailNotice = notifiedEmail
        ? currentLang === 'vi'
          ? ` (Đã gửi thông báo Email đến chủ hôn: ${notifiedEmail})`
          : currentLang === 'en'
          ? ` (Email notification sent to host: ${notifiedEmail})`
          : ` (បានផ្ញើសារជូនដំណឹងទៅអ៊ីមែលម្ចាស់ដើមការ៖ ${notifiedEmail})`
        : '';

      setRsvpSuccess(`${t.rsvpSuccessAlert}${emailNotice}`);
      if (data.emailNotification) {
        setEmailNotificationInfo(data.emailNotification);
        fetchEmailLogs();
      }
      if (rsvpForm.message.trim()) {
        setRecentWishes((prev) => [data.rsvp, ...prev]);
      }

      // Confetti on RSVP
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#D4AF37', '#8A0F1A', '#FFD700'],
        });
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      setRsvpError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setRsvpSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Theme-specific color accents
  const getThemeClasses = () => {
    switch (invitation.templateId) {
      case 'golden-elegance':
        return {
          heroBg: 'from-[#2D1F08] via-[#4A340C] to-[#1A1204]',
          accentBorder: 'border-[#E8BE65]',
          badgeBg: 'bg-[#D4AF37] text-white',
          headingColor: 'text-[#B88329]',
        };
      case 'floral-cream':
        return {
          heroBg: 'from-[#421D22] via-[#5F2A30] to-[#2E1216]',
          accentBorder: 'border-[#D4AF37]',
          badgeBg: 'bg-[#8A0F1A] text-[#FDE792]',
          headingColor: 'text-[#8A0F1A]',
        };
      case 'khmer-traditional':
        return {
          heroBg: 'from-[#3A0A0E] via-[#5A0F15] to-[#260508]',
          accentBorder: 'border-[#F5D77F]',
          badgeBg: 'bg-[#8A0F1A] text-[#F5D77F]',
          headingColor: 'text-[#9B111E]',
        };
      case 'royal-red':
      default:
        return {
          heroBg: 'from-[#3A0A0E] via-[#60050E] to-[#200205]',
          accentBorder: 'border-[#F5D77F]',
          badgeBg: 'bg-[#8A0F1A] text-[#FDE792]',
          headingColor: 'text-[#8A0F1A]',
        };
    }
  };

  // Typography helpers
  const getFontFamilyClass = (fontFamily?: string) => {
    switch (fontFamily) {
      case 'muol':
        return 'font-muol';
      case 'battambang':
        return 'font-battambang';
      case 'times':
        return 'font-times';
      case 'khmer':
        return 'font-khmer';
      case 'cinzel':
        return 'font-cinzel';
      case 'script':
        return 'font-script';
      case 'playfair':
      default:
        return 'font-serif-luxury';
    }
  };

  const getAlignmentClass = (alignment?: string) => {
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      case 'justify':
        return 'text-justify';
      case 'center':
      default:
        return 'text-center';
    }
  };

  const getFontSizeClass = (fontSize?: string) => {
    switch (fontSize) {
      case 'huge':
        return 'text-3xl sm:text-5xl md:text-6xl lg:text-7xl';
      case 'xlarge':
        return 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl';
      case 'large':
        return 'text-xl sm:text-3xl md:text-4xl lg:text-5xl';
      case 'normal':
      default:
        return 'text-lg sm:text-2xl md:text-3xl';
    }
  };

  const themeStyles = getThemeClasses();
  const publicUrl = window.location.href;

  // PASSWORD PROMPT VIEW
  if (invitation.isPasswordProtected && !isUnlocked) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br ${themeStyles.heroBg} text-[#FAF7F2]`}>
        <div className="w-full max-w-md bg-[#FAF7F2] text-[#2C1810] rounded-3xl p-8 shadow-2xl border-2 border-[#D4AF37] text-center">
          <div className="w-16 h-16 mx-auto mb-4 red-royal-gradient rounded-full flex items-center justify-center border-2 border-[#F5D77F]">
            <Lock size={28} className="text-[#F9E29B]" />
          </div>
          <span className="text-3xl block mb-1">囍</span>
          <h2 className="font-serif-luxury text-xl font-bold text-[#8A0F1A] mb-1">
            {invitation.groom.fullName} & {invitation.bride.fullName}
          </h2>
          <p className="text-xs text-gray-600 mb-6">{t.enterPassword}</p>

          {passwordError && (
            <div className="mb-4 p-2.5 bg-red-100 text-red-700 rounded-xl text-xs flex items-center justify-center gap-1.5">
              <AlertCircle size={15} />
              <span>{t.wrongPassword}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-center text-lg tracking-widest focus:ring-2 focus:ring-[#8A0F1A] focus:outline-none"
            />
            <button
              type="submit"
              className="w-full py-3 red-royal-gradient text-[#FDE792] font-bold rounded-xl shadow-lg hover:brightness-110 transition"
            >
              {t.submitPassword}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ENVELOPE OPENING VIEW (BEFORE USER CLICKS OPEN)
  if (!isOpened) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-2.5 sm:p-4 bg-gradient-to-br ${themeStyles.heroBg} text-[#FAF7F2] relative overflow-hidden select-none`}>
        {/* Subtle floating gold & red particles */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#D4AF37] blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#8A0F1A] blur-3xl" />
        </div>

        {/* Navigation buttons: Home & Admin Back */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-50 flex items-center gap-2">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full text-xs font-semibold backdrop-blur-md border border-white/20 transition cursor-pointer"
              title={t.backToHome}
            >
              <Home size={15} className="text-[#F5D77F]" />
              <span>{t.backToHome}</span>
            </button>
          )}
          {isAdmin && onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full text-xs font-semibold backdrop-blur-md border border-white/20 transition cursor-pointer"
            >
              ← {t.backToDashboard}
            </button>
          )}
        </div>

        {/* Envelope Top Controls: Custom Frame Upload & Language switch */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => frameFileInputRef.current?.click()}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-black/50 hover:bg-black/70 text-[#FDE792] border border-[#D4AF37]/60 shadow-lg flex items-center gap-1.5 backdrop-blur-md transition text-xs font-bold cursor-pointer"
            title={currentLang === 'vi' ? 'Tải / Đổi Khung Thiệp Mẫu Custom' : 'Upload Custom Frame'}
          >
            <Sparkles size={14} className="text-[#F5D77F]" />
            <span>{currentLang === 'vi' ? '🖼️ Upload Khung Thiệp' : currentLang === 'en' ? '🖼️ Upload Frame' : '🖼️ ប្តូររូបស៊ុម'}</span>
          </button>

          {invitation.allowLanguageToggle && (
            <LanguageSelector
              currentLang={currentLang}
              onLanguageChange={handleLanguageChange}
              variant="floating-dark"
            />
          )}
        </div>

        {/* The Animated Wedding Envelope matching image 1 & custom frame */}
        <div className="relative w-full max-w-md sm:max-w-xl md:max-w-2xl">
          {/* Outer Frame with support for Custom Uploaded Frame & Emerald Arch */}
          <div
            className={`p-3 sm:p-4 rounded-[36px] border-2 border-[#D4AF37]/60 shadow-2xl relative overflow-hidden ${
              invitation.frameStyle === 'emerald-gold-arch'
                ? 'bg-[#062c22] text-emerald-100'
                : 'bg-[#3A0A0E] text-stone-100'
            }`}
            style={
              (customFrameUrl || invitation.customFrameUrl)
                ? {
                    backgroundImage: `url(${customFrameUrl || invitation.customFrameUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          >
            {/* Custom frame dark overlay if image is set */}
            {(customFrameUrl || invitation.customFrameUrl) && (
              <div className="absolute inset-0 bg-black/40 rounded-[36px] pointer-events-none" />
            )}

            {/* Inner Cream Card with Gold Double Border */}
            <div className="bg-[#FAF7F2]/95 backdrop-blur-xs text-[#2C1810] rounded-[28px] p-6 sm:p-8 border-2 border-[#D4AF37] relative text-center shadow-inner">
              {/* Direct Envelope Frame Upload Badge */}
              <div className="mb-2 flex justify-center">
                <button
                  onClick={() => frameFileInputRef.current?.click()}
                  className="px-3 py-1 bg-amber-100/90 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-full text-[11px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Upload size={12} className="text-[#8A0F1A]" />
                  <span>
                    {currentLang === 'vi'
                      ? '🖼️ Tự Tải Lên Khung Thiệp Mẫu'
                      : currentLang === 'en'
                      ? '🖼️ Self-Upload Invitation Frame'
                      : '🖼️ បញ្ចូលរូបស៊ុមផ្ទាល់ខ្លួន'}
                  </span>
                </button>
              </div>

              {/* SAVE THE DATE Header */}
              <div className="text-[#CF9E42] text-xs sm:text-sm tracking-widest uppercase font-serif-luxury font-bold mb-2 flex items-center justify-center gap-3">
                <span className="h-[1px] w-8 bg-[#CF9E42]" />
                <span>SAVE THE DATE</span>
                <span className="h-[1px] w-8 bg-[#CF9E42]" />
              </div>

              {/* Logo / Double Happiness Badge with Custom Upload */}
              <div className="my-2 flex justify-center">
                <div
                  onClick={() => logoFileInputRef.current?.click()}
                  title={currentLang === 'vi' ? 'Nhấn để tải lên/thay đổi Logo' : 'ចុចដើម្បីប្តូរ Logo'}
                  className="relative group cursor-pointer inline-block"
                >
                  {logoUrl ? (
                    <div className="relative">
                      <img
                        src={logoUrl}
                        alt="Wedding Logo"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto rounded-2xl border-2 border-[#D4AF37] p-1 bg-white/95 shadow-md group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                        <span>{currentLang === 'vi' ? 'Đổi Logo' : 'ប្តូរ Logo'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative p-1">
                      <span className="text-4xl sm:text-5xl text-[#8A0F1A] inline-block font-bold drop-shadow-xs group-hover:scale-110 transition">囍</span>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-[#8A0F1A] text-[#FDE792] text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow border border-[#F5D77F]">
                        + {currentLang === 'vi' ? 'Tải Logo' : 'បញ្ចូល Logo'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtitle in Khmer or Vietnamese */}
              <p className={`text-[22px] sm:text-[30px] text-stone-700 my-2 font-normal leading-snug ${currentLang === 'vi' ? 'font-times font-bold' : 'font-muol'}`}>
                {t.theWeddingOf}
              </p>

              {/* Groom & Bride Names */}
              <div className="space-y-2 my-3">
                <CoupleNameDisplay
                  fullName={invitation.groom.fullName || 'គង់ សីហា (Kong Seyha)'}
                  textColorClass="text-[#8A0F1A]"
                  mainSizeClass="text-[30px]"
                  subSizeClass="text-[20px]"
                  lang={currentLang}
                />
                <div className="flex items-center justify-center gap-2 my-1 text-[#CF9E42]">
                  <span className="h-[1px] w-10 bg-[#CF9E42]/60" />
                  <Heart size={16} className="fill-[#8A0F1A] text-[#8A0F1A]" />
                  <span className="h-[1px] w-10 bg-[#CF9E42]/60" />
                </div>
                <CoupleNameDisplay
                  fullName={invitation.bride.fullName || 'ងួន សុវណ្ណា (Nguon Sovanna)'}
                  textColorClass="text-[#8A0F1A]"
                  mainSizeClass="text-[30px]"
                  subSizeClass="text-[20px]"
                  lang={currentLang}
                />
              </div>

              {/* Wedding Date Badge */}
              <div className="my-4 py-2 border-y border-[#D4AF37]/50 text-xs sm:text-sm font-semibold text-gray-800 flex justify-center items-center gap-2">
                <Calendar size={16} className="text-[#8A0F1A]" />
                <span>{formatSolarDate(invitation.solarDate, currentLang)}</span>
              </div>

              {/* Personalized Guest Badge */}
              {personalizedGuest && (
                <div className="my-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900">
                  <span className="block font-bold text-amber-800">
                    {t.specialGreeting}: {personalizedGuest.title} {personalizedGuest.name}
                  </span>
                  {personalizedGuest.customGreeting && (
                    <p className="italic text-[11px] mt-0.5 text-gray-600">
                      "{personalizedGuest.customGreeting}"
                    </p>
                  )}
                </div>
              )}

              {/* Circular Red Wax Seal Button to Open */}
              <div className="mt-6 flex flex-col items-center">
                <button
                  onClick={handleOpenEnvelope}
                  className="group relative w-18 h-18 sm:w-20 sm:h-20 red-royal-gradient rounded-full border-4 border-[#F5D77F] shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer pulse-gold"
                >
                  <div className="text-center text-[#FDE792]">
                    <Sparkles size={20} className="mx-auto group-hover:rotate-12 transition duration-300" />
                    <span className={`text-[11px] block mt-0.5 ${currentLang === 'vi' ? 'font-times font-bold' : currentLang === 'en' ? 'font-cinzel font-bold' : 'font-muol font-normal'}`}>
                      {currentLang === 'vi' ? 'MỞ' : currentLang === 'en' ? 'OPEN' : 'បើក'}
                    </span>
                  </div>
                </button>
                <span className={`text-xs text-stone-600 mt-2.5 animate-pulse ${currentLang === 'vi' ? 'font-times font-bold' : currentLang === 'en' ? 'font-cinzel font-bold' : 'font-muol font-normal'}`}>
                  {t.openInvitation}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PUBLIC INVITATION PAGE
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] selection:bg-[#8A0F1A] selection:text-white pb-32">
      {/* UNIFIED RESPONSIVE FLOATING TOP BAR FOR ALL DEVICES (320px Mobile -> Tablet -> Desktop) */}
      <div className="fixed top-2.5 sm:top-4 inset-x-2.5 sm:inset-x-4 z-50 flex items-center justify-between gap-1.5 pointer-events-none">
        {/* Top Left Group: Home & Login */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-white/95 text-[#8A0F1A] border-2 border-[#D4AF37] rounded-full text-xs font-bold shadow-lg hover:bg-[#FAF7F2] backdrop-blur-md transition cursor-pointer"
              title={t.backToHome}
            >
              <Home size={15} className="text-[#8A0F1A]" />
              <span className="hidden md:inline">{t.backToHome}</span>
            </button>
          )}
          {onOpenLogin && !isAdmin && (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 red-royal-gradient text-[#FDE792] border-2 border-[#F5D77F] rounded-full text-[11px] sm:text-xs font-bold shadow-lg hover:brightness-110 backdrop-blur-md transition cursor-pointer"
              title={t.adminLogin}
            >
              <Lock size={13} className="text-[#FDE792]" />
              <span className="hidden xs:inline sm:inline">{currentLang === 'vi' ? 'Đăng nhập' : currentLang === 'en' ? 'Login' : 'ចូលប្រព័ន្ធ'}</span>
            </button>
          )}
        </div>

        {/* Top Right Group: Ornament Upload, Frame Upload, Language, Music, QR & Admin */}
        <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto overflow-x-auto no-scrollbar py-0.5">
          {/* Custom Ornament Upload button */}
          <button
            onClick={() => ornamentFileInputRef.current?.click()}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-amber-50 text-[#8A0F1A] border-2 border-[#D4AF37] shadow-lg flex items-center gap-1.5 hover:bg-amber-100 backdrop-blur-md transition text-xs font-bold cursor-pointer shrink-0"
            title={
              currentLang === 'vi'
                ? 'Tự Upload Hoa Văn Trang Trí'
                : currentLang === 'en'
                ? 'Upload Custom Ornament'
                : 'បញ្ចូលក្បាច់ផ្កាផ្ទាល់ខ្លួន'
            }
          >
            <Upload size={14} className="text-[#8A0F1A]" />
            <span className="hidden lg:inline">
              {currentLang === 'vi'
                ? '🌸 Upload Hoa Văn'
                : currentLang === 'en'
                ? '🌸 Upload Ornament'
                : '🌸 បញ្ចូលក្បាច់ផ្កា'}
            </span>
          </button>

          {(customOrnamentUrl || invitation.customOrnamentUrl) && (
            <button
              onClick={handleDeleteOrnament}
              className="p-1.5 sm:p-2 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition cursor-pointer shrink-0"
              title={currentLang === 'vi' ? 'Xóa hoa văn đã tải lên' : 'Delete uploaded ornament'}
            >
              <Trash2 size={13} />
            </button>
          )}

          {/* Custom Frame Upload button */}
          <button
            onClick={() => frameFileInputRef.current?.click()}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-white text-[#8A0F1A] border-2 border-[#D4AF37] shadow-lg flex items-center gap-1.5 hover:bg-amber-50 backdrop-blur-md transition text-xs font-bold cursor-pointer shrink-0"
            title={
              currentLang === 'vi'
                ? 'Tải / Đổi Khung Thiệp Tùy Chỉnh'
                : currentLang === 'en'
                ? 'Upload Custom Frame'
                : 'ប្តូររូបស៊ុម'
            }
          >
            <Sparkles size={14} className="text-[#D4AF37]" />
            <span className="hidden lg:inline">
              {currentLang === 'vi'
                ? '🖼️ Đổi Khung Thiệp'
                : currentLang === 'en'
                ? '🖼️ Change Frame'
                : '🖼️ ប្តូររូបស៊ុម'}
            </span>
          </button>

          {(customFrameUrl || invitation.customFrameUrl) && (
            <button
              onClick={handleDeleteCustomFrame}
              className="p-1.5 sm:p-2 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition cursor-pointer shrink-0"
              title={currentLang === 'vi' ? 'Xóa khung thiệp đã tải lên' : 'Delete uploaded frame'}
            >
              <Trash2 size={13} />
            </button>
          )}

          <input
            ref={frameFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCustomFrameUpload}
          />

          <input
            ref={ornamentFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCustomOrnamentUpload}
          />

          {/* Language switch */}
          {invitation.allowLanguageToggle && (
            <div className="shrink-0">
              <LanguageSelector
                currentLang={currentLang}
                onLanguageChange={handleLanguageChange}
                variant="floating-light"
              />
            </div>
          )}

          {/* Music Player Control */}
          {invitation.bgMusicPreset !== 'none' && (
            <button
              onClick={handleToggleMusic}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full red-royal-gradient text-[#FDE792] border-2 border-[#F5D77F] shadow-lg flex items-center justify-center hover:scale-105 transition shrink-0 cursor-pointer"
              title={isPlayingMusic ? t.musicPlaying : t.musicPaused}
            >
              {isPlayingMusic ? (
                <Volume2 size={16} className="animate-spin text-[#FDE792]" style={{ animationDuration: '4s' }} />
              ) : (
                <VolumeX size={16} />
              )}
            </button>
          )}

          {/* QR Code button */}
          <button
            onClick={() => setShowQRModal(true)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-[#8A0F1A] border border-[#D4AF37] shadow-lg flex items-center justify-center hover:bg-stone-50 transition shrink-0 cursor-pointer"
            title={t.qrCode}
          >
            <QrCode size={16} />
          </button>

          {/* Admin Return button */}
          {isAdmin && onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-stone-900/90 text-white text-xs font-semibold backdrop-blur-md shadow-md hover:bg-black transition shrink-0 cursor-pointer"
            >
              {t.backToDashboard}
            </button>
          )}
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden min-h-[90vh] flex flex-col items-center justify-center text-center px-4 py-20 text-white">
        {/* Cover Photo Backdrop with Upload & Position Adjust Controls */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={coverPhotoUrl}
            alt="Wedding Cover"
            style={
              invitation.coverPhotoOffset
                ? {
                    transform: `translate(${invitation.coverPhotoOffset.x}px, ${invitation.coverPhotoOffset.y}px) scale(${invitation.coverPhotoOffset.zoom})`,
                  }
                : undefined
            }
            className="w-full h-full object-cover scale-105 filter brightness-50 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#FAF7F2]" />

          {/* Hidden File Input for Cover Photo Upload */}
          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />

          {/* Floating Action Buttons to Upload Background & Drag Position */}
          <div className="absolute bottom-6 right-6 z-20 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => coverFileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-full bg-black/70 hover:bg-black/90 text-[#FDE792] border border-[#F5D77F]/90 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 shadow-xl hover:scale-105 transition cursor-pointer"
              title={
                currentLang === 'vi'
                  ? 'Tải / Đổi ảnh nền'
                  : currentLang === 'en'
                  ? 'Upload / Change Background'
                  : 'ប្តូររូបភាពផ្ទៃខាងក្រោយ'
              }
            >
              <Upload size={14} className="text-[#F5D77F]" />
              <span>
                {currentLang === 'vi'
                  ? '📷 Đổi ảnh nền'
                  : currentLang === 'en'
                  ? '📷 Change Background'
                  : '📷 ប្តូររូបភាពផ្ទៃខាងក្រោយ'}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setAdjustModal({
                  isOpen: true,
                  imageSrc: coverPhotoUrl,
                  title:
                    currentLang === 'vi'
                      ? 'Rê / Chỉnh vị trí ảnh nền'
                      : currentLang === 'en'
                      ? 'Adjust Background Position'
                      : 'តម្រឹមរូបភាពផ្ទៃខាងក្រោយ',
                  initialOffset: invitation.coverPhotoOffset,
                  frameType: 'square',
                  target: 'cover',
                })
              }
              className="px-3 py-2 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/40 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 shadow-xl hover:scale-105 transition cursor-pointer"
              title={
                currentLang === 'vi'
                  ? 'Rê vị trí ảnh nền'
                  : currentLang === 'en'
                  ? 'Drag Background Position'
                  : 'តម្រឹមរូបភាព'
              }
            >
              <span>🖐️</span>
              <span>
                {currentLang === 'vi'
                  ? 'Rê vị trí nền'
                  : currentLang === 'en'
                  ? 'Drag Position'
                  : 'តម្រឹមរូបភាព'}
              </span>
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <ScrollReveal variant="royal-bloom" duration={950} className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-[#F5D77F]/60 text-xs font-semibold tracking-widest text-[#FDE792] uppercase">
            <Sparkles size={14} />
            <span>{t.saveTheDate}</span>
          </div>

          {/* Custom Logo / Double Happiness Emblem with Wedding Ornate Frame & Drag Adjust */}
          <div className="my-2 flex justify-center">
            <WeddingLogoFrame
              logoUrl={logoUrl}
              logoOffset={invitation.logoOffset}
              onUploadClick={() => logoFileInputRef.current?.click()}
              onAdjustClick={
                logoUrl
                  ? () =>
                      setAdjustModal({
                        isOpen: true,
                        imageSrc: logoUrl,
                        title:
                          currentLang === 'vi'
                            ? 'Rê / Chỉnh vị trí Logo'
                            : currentLang === 'en'
                            ? 'Adjust Logo Position'
                            : 'តម្រឹមទីតាំង Logo',
                        initialOffset: invitation.logoOffset,
                        frameType: 'logo',
                        target: 'logo',
                      })
                  : undefined
              }
              lang={currentLang}
            />
            {/* Hidden shared file input for logo */}
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>

          {/* Section subtitle */}
          <p className={`text-[22px] sm:text-[30px] font-normal text-[#F5D77F] tracking-wide my-3 drop-shadow leading-snug ${currentLang === 'vi' ? 'font-times font-bold' : currentLang === 'en' ? 'font-cinzel font-bold' : 'font-muol'}`}>
            {t.theWeddingOf}
          </p>

          {/* Groom & Bride names */}
          <div className="space-y-3 py-2">
            <CoupleNameDisplay
              fullName={translateCoupleName(invitation.groom.fullName, currentLang) || (currentLang === 'km' ? 'គង់ សីហា' : 'Kong Seyha')}
              textColorClass="text-white"
              mainSizeClass="text-[30px]"
              subSizeClass="text-[20px]"
              lang={currentLang}
            />
            <div className="text-2xl text-[#F5D77F] font-script my-1">&</div>
            <CoupleNameDisplay
              fullName={translateCoupleName(invitation.bride.fullName, currentLang) || (currentLang === 'km' ? 'ងួន សុវណ្ណា' : 'Nguon Sovanna')}
              textColorClass="text-white"
              mainSizeClass="text-[30px]"
              subSizeClass="text-[20px]"
              lang={currentLang}
            />
          </div>

          <div className="pt-4 pb-2">
            <div className="inline-block px-6 py-2.5 rounded-2xl bg-black/50 backdrop-blur-md border border-[#D4AF37]/40 text-sm font-semibold text-[#FDE792]">
              {formatSolarDate(invitation.solarDate, currentLang)}
              {invitation.lunarDate && (
                <span className="block text-xs text-white/80 font-normal mt-0.5">
                  ({translateLunarDate(invitation.lunarDate, currentLang)})
                </span>
              )}
            </div>
          </div>

          {/* Personalized Guest Welcome Header */}
          {personalizedGuest && (
            <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs max-w-md mx-auto">
              <span className="text-white/80 block">{t.specialGreeting}</span>
              <span className="text-base font-bold text-[#FDE792] block mt-0.5">
                {personalizedGuest.title} {personalizedGuest.name}
              </span>
              {personalizedGuest.customGreeting && (
                <p className="text-white/90 italic mt-1.5 text-xs">
                  "{personalizedGuest.customGreeting}"
                </p>
              )}
            </div>
          )}

          <div className="pt-6">
            <ChevronDown size={28} className="mx-auto text-white/70 animate-bounce" />
          </div>
        </ScrollReveal>
      </section>

      {/* COUNTDOWN TIMER SECTION */}
      <section className="max-w-4xl mx-auto px-4 -mt-12 relative z-20">
        <ScrollReveal variant="flip-up" duration={900} shimmer className="rounded-3xl">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-[#D4AF37]/50 text-center">
            <p className={`text-[20px] sm:text-[30px] leading-snug tracking-wide text-[#8A0F1A] mb-4 ${currentLang === 'vi' ? 'font-times font-bold' : currentLang === 'en' ? 'font-cinzel font-bold' : 'font-muol font-normal'}`}>
              {t.daysUntilWedding}
            </p>

            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto">
              {[
                { val: timeLeft.days, label: t.countdownDays },
                { val: timeLeft.hours, label: t.countdownHours },
                { val: timeLeft.minutes, label: t.countdownMinutes },
                { val: timeLeft.seconds, label: t.countdownSeconds },
              ].map((item, idx) => (
                <ScrollReveal key={idx} variant="zoom-in" delay={idx * 90}>
                  <div className="p-3 sm:p-4 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 text-center">
                    <span className="font-serif-luxury text-2xl sm:text-4xl font-black text-[#8A0F1A] block">
                      {String(item.val).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mt-1">
                      {item.label}
                    </span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ORNATE GOLDEN LOTUS FRAME TEMPLATE CARD SECTION */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <ScrollReveal variant="fade-up" duration={900}>
          <LotusFrameCard
            invitation={invitation}
            lang={currentLang}
            customFrameUrl={customFrameUrl ?? invitation.customFrameUrl}
            customOrnamentUrl={customOrnamentUrl ?? invitation.customOrnamentUrl}
            onUploadFrameClick={() => frameFileInputRef.current?.click()}
            onDeleteFrameClick={handleDeleteCustomFrame}
            onUploadOrnamentClick={() => ornamentFileInputRef.current?.click()}
            onDeleteOrnamentClick={handleDeleteOrnament}
            onUploadLogoClick={() => logoFileInputRef.current?.click()}
            onUploadPhotoClick={() => setRsvpForm((prev) => ({ ...prev }))}
            onAdjustPhotoClick={(target) =>
              setAdjustModal({
                isOpen: true,
                imageSrc:
                  target === 'groom'
                    ? invitation.groom.avatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
                    : invitation.bride.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                title:
                  currentLang === 'vi'
                    ? target === 'groom'
                      ? 'Rê / Chỉnh vị trí ảnh Chú Rể'
                      : 'Rê / Chỉnh vị trí ảnh Cô Dâu'
                    : currentLang === 'en'
                    ? target === 'groom'
                      ? "Adjust Groom's Photo"
                      : "Adjust Bride's Photo"
                    : target === 'groom'
                    ? 'តម្រឹមរូបថតកូនកំលោះ'
                    : 'តម្រឹមរូបថតកូនក្រមុំ',
                initialOffset:
                  target === 'groom'
                    ? invitation.groom.avatarOffset
                    : invitation.bride.avatarOffset,
                frameType: 'circle',
                target: target,
              })
            }
          />
        </ScrollReveal>
      </section>



      {/* CEREMONY & RECEPTION SCHEDULE */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <ScrollReveal variant="zoom-in" duration={850} className="text-center mb-12 flex flex-col items-center">
          {/* 90px Logo Emblem with generous spacing to avoid touching Khmer text */}
          <div className="mb-6 sm:mb-8 flex flex-col items-center">
            <div
              onClick={() => logoFileInputRef.current?.click()}
              title={currentLang === 'vi' ? 'Logo Đám Cưới / Song Hỷ (90px)' : currentLang === 'en' ? 'Wedding Logo / Monogram' : 'និមិត្តសញ្ញាអាពាហ៍ពិពាហ៍ (Logo 90px)'}
              className="w-[90px] h-[90px] rounded-full bg-gradient-to-b from-[#FFFDF8] via-amber-50/90 to-[#FAF4E4] border-[3px] border-[#D4AF37] shadow-xl flex flex-col items-center justify-center p-2 group hover:scale-105 transition-all duration-300 relative cursor-pointer"
            >
              {/* Inner Decorative Golden Ring */}
              <div className="absolute inset-1 rounded-full border border-[#D4AF37]/40 pointer-events-none" />

              {invitation.logoUrl ? (
                <img
                  src={invitation.logoUrl}
                  alt="Wedding Logo"
                  className="w-full h-full object-contain rounded-full relative z-10"
                />
              ) : (
                <div className="text-center relative z-10 flex flex-col items-center justify-center">
                  <span className="text-4xl text-[#8A0F1A] font-bold block drop-shadow-sm leading-none">
                    囍
                  </span>
                  <span
                    className={`text-[8px] text-[#B88329] uppercase font-bold tracking-wider mt-0.5 ${
                      currentLang === 'vi' ? 'font-times' : currentLang === 'en' ? 'font-cinzel' : 'font-muol'
                    }`}
                  >
                    {currentLang === 'vi' ? 'Hôn Lễ' : currentLang === 'en' ? 'Wedding' : 'មង្គលការ'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <h2 className={`text-2xl sm:text-4xl text-[#8A0F1A] drop-shadow-xs leading-normal pt-1 ${currentLang === 'vi' ? 'font-times font-bold' : 'font-muol font-normal'}`}>
            {t.ceremonySchedule}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-[1px] w-8 sm:w-12 bg-[#D4AF37]" />
            <p className={`text-[16px] sm:text-[20px] font-bold text-[#B88329] uppercase tracking-wider ${currentLang === 'vi' ? 'font-times font-bold' : currentLang === 'en' ? 'font-cinzel font-bold' : 'font-muol font-normal'}`}>
              ✦ {currentLang === 'vi' ? 'Thời gian & Địa điểm đón tiếp quan khách' : currentLang === 'en' ? 'Time & Reception Venue' : 'ពេលវេលា និងទីតាំងប្រារព្ធពិធីអាពាហ៍ពិពាហ៍'} ✦
            </p>
            <span className="h-[1px] w-8 sm:w-12 bg-[#D4AF37]" />
          </div>
        </ScrollReveal>

        {/* Hidden File Inputs for Schedule Card Frames */}
        <input
          type="file"
          ref={groomScheduleFrameRef}
          onChange={(e) => handleCardFrameUpload('groomCeremony', e)}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={brideScheduleFrameRef}
          onChange={(e) => handleCardFrameUpload('brideCeremony', e)}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={receptionScheduleFrameRef}
          onChange={(e) => handleCardFrameUpload('reception', e)}
          accept="image/*"
          className="hidden"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Schedule 1: Groom Family Ceremony */}
          {invitation.separateSchedules && (
            <ScrollReveal variant="fade-left" delay={60} shimmer className="h-full rounded-[32px]">
            <div
              className="bg-white rounded-[32px] p-7 sm:p-9 shadow-xl border-2 border-[#D4AF37] relative overflow-hidden flex flex-col justify-between hover:shadow-2xl transition duration-300 group h-full"
              style={
                (invitation.groomCeremony?.customFrameUrl || customFrameUrl || invitation.customFrameUrl)
                  ? {
                      backgroundImage: `url(${invitation.groomCeremony?.customFrameUrl || customFrameUrl || invitation.customFrameUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : undefined
              }
            >
              {/* Direct Upload Frame Button for Card 1 */}
              <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={() => groomScheduleFrameRef.current?.click()}
                  className="px-2.5 py-1 rounded-full bg-amber-500/90 hover:bg-amber-600 text-white text-[11px] font-bold shadow-md flex items-center gap-1 transition"
                  title="Upload khung riêng cho thẻ này"
                >
                  <Upload size={12} />
                  <span>{currentLang === 'vi' ? 'Upload khung' : currentLang === 'en' ? 'Upload Frame' : 'ផ្ទុកឡើងស៊ុម'}</span>
                </button>
                {invitation.groomCeremony?.customFrameUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      invitation.groomCeremony.customFrameUrl = undefined;
                      setRsvpForm((prev) => ({ ...prev }));
                    }}
                    className="p-1 rounded-full bg-red-600/90 hover:bg-red-700 text-white text-[11px] shadow-md transition"
                    title="Xóa khung riêng"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Top Royal Red Bar */}
              <div className="absolute top-0 inset-x-0 h-2 red-royal-gradient" />

              {/* Custom Uploaded Corner Ornaments (only shown if user uploaded hoa văn) */}
              {(customOrnamentUrl || invitation.customOrnamentUrl) && (
                <>
                  <img
                    src={customOrnamentUrl || invitation.customOrnamentUrl}
                    alt="Corner Ornament"
                    className="absolute top-2.5 left-2.5 w-7 h-7 object-contain pointer-events-none opacity-90"
                  />
                  <img
                    src={customOrnamentUrl || invitation.customOrnamentUrl}
                    alt="Corner Ornament"
                    className="absolute top-2.5 right-2.5 w-7 h-7 object-contain pointer-events-none opacity-90 scale-x-[-1]"
                  />
                  <img
                    src={customOrnamentUrl || invitation.customOrnamentUrl}
                    alt="Corner Ornament"
                    className="absolute bottom-2.5 left-2.5 w-7 h-7 object-contain pointer-events-none opacity-90 scale-y-[-1]"
                  />
                  <img
                    src={customOrnamentUrl || invitation.customOrnamentUrl}
                    alt="Corner Ornament"
                    className="absolute bottom-2.5 right-2.5 w-7 h-7 object-contain pointer-events-none opacity-90 scale-[-1]"
                  />
                </>
              )}

              {/* Inner Gold Frame Accent */}
              <div className="absolute inset-2 rounded-[24px] border border-[#D4AF37]/40 pointer-events-none" />

              <div className="relative z-10 pt-2">
                <div className="w-14 h-14 rounded-2xl red-royal-gradient text-[#FDE792] border border-[#F5D77F] flex items-center justify-center mb-5 shadow-lg">
                  <Clock size={26} />
                </div>
                <h3 className={`text-lg sm:text-xl md:text-2xl text-[#8A0F1A] mb-3 leading-snug ${getHeaderFontClass(currentLang)}`}>
                  {translateText(invitation.groomCeremony.title, 'ceremonyGroom', currentLang)}
                </h3>
                <div className="space-y-3 text-xs sm:text-sm text-gray-800">
                  <p className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#8A0F1A] shrink-0" />
                    <span className="font-semibold text-gray-900">
                      {formatSolarDate(invitation.groomCeremony.date || invitation.solarDate, currentLang)}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock size={16} className="text-[#8A0F1A] shrink-0" />
                    <span className="font-bold text-base text-[#8A0F1A]">
                      {invitation.groomCeremony.time || '09:00'}
                    </span>
                  </p>
                  <p className="flex items-start gap-2 pt-1 border-t border-stone-100">
                    <MapPin size={16} className="text-[#8A0F1A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="block text-sm sm:text-base text-gray-900 font-bold">
                        {translateVenueName(invitation.groomCeremony.venueName, 'groom', currentLang)}
                      </strong>
                      <span className="text-xs sm:text-sm text-gray-600 block mt-0.5">
                        {translateAddress(invitation.groomCeremony.address, currentLang)}
                      </span>
                    </span>
                  </p>
                </div>
              </div>

              {invitation.groomCeremony.mapUrl && (
                <a
                  href={invitation.groomCeremony.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 relative z-10 w-full py-3 px-4 rounded-2xl border-2 border-[#D4AF37] text-[#8A0F1A] hover:bg-amber-50 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <MapPin size={16} />
                  <span>{t.getDirections}</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
            </ScrollReveal>
          )}

          {/* Schedule 2: Bride Family Ceremony */}
          {invitation.separateSchedules && (
            <ScrollReveal variant="flip-up" delay={160} shimmer className="h-full rounded-[32px]">
            <div
              className="bg-white rounded-[32px] p-7 sm:p-9 shadow-xl border-2 border-[#D4AF37] relative overflow-hidden flex flex-col justify-between hover:shadow-2xl transition duration-300 group h-full"
              style={
                (invitation.brideCeremony?.customFrameUrl || customFrameUrl || invitation.customFrameUrl)
                  ? {
                      backgroundImage: `url(${invitation.brideCeremony?.customFrameUrl || customFrameUrl || invitation.customFrameUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : undefined
              }
            >
              {/* Direct Upload Frame Button for Card 2 */}
              <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={() => brideScheduleFrameRef.current?.click()}
                  className="px-2.5 py-1 rounded-full bg-amber-500/90 hover:bg-amber-600 text-white text-[11px] font-bold shadow-md flex items-center gap-1 transition"
                  title="Upload khung riêng cho thẻ này"
                >
                  <Upload size={12} />
                  <span>{currentLang === 'vi' ? 'Upload khung' : currentLang === 'en' ? 'Upload Frame' : 'ផ្ទុកឡើងស៊ុម'}</span>
                </button>
                {invitation.brideCeremony?.customFrameUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      invitation.brideCeremony.customFrameUrl = undefined;
                      setRsvpForm((prev) => ({ ...prev }));
                    }}
                    className="p-1 rounded-full bg-red-600/90 hover:bg-red-700 text-white text-[11px] shadow-md transition"
                    title="Xóa khung riêng"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Top Gold Bar */}
              <div className="absolute top-0 inset-x-0 h-2 gold-gradient-bg" />

              {/* Custom Uploaded Corner Ornaments (only shown if user uploaded hoa văn) */}
              {(customOrnamentUrl || invitation.customOrnamentUrl) && (
                <>
                  <img
                    src={customOrnamentUrl || invitation.customOrnamentUrl}
                    alt="Corner Ornament"
                    className="absolute top-2.5 left-2.5 w-7 h-7 object-contain pointer-events-none opacity-90"
                  />
                  <img
                    src={customOrnamentUrl || invitation.customOrnamentUrl}
                    alt="Corner Ornament"
                    className="absolute top-2.5 right-2.5 w-7 h-7 object-contain pointer-events-none opacity-90 scale-x-[-1]"
                  />
                  <img
                    src={customOrnamentUrl || invitation.customOrnamentUrl}
                    alt="Corner Ornament"
                    className="absolute bottom-2.5 left-2.5 w-7 h-7 object-contain pointer-events-none opacity-90 scale-y-[-1]"
                  />
                  <img
                    src={customOrnamentUrl || invitation.customOrnamentUrl}
                    alt="Corner Ornament"
                    className="absolute bottom-2.5 right-2.5 w-7 h-7 object-contain pointer-events-none opacity-90 scale-[-1]"
                  />
                </>
              )}

              {/* Inner Gold Frame Accent */}
              <div className="absolute inset-2 rounded-[24px] border border-[#D4AF37]/40 pointer-events-none" />

              <div className="relative z-10 pt-2">
                <div className="w-14 h-14 rounded-2xl gold-gradient-bg text-stone-900 border border-[#FAF7F2] flex items-center justify-center mb-5 shadow-lg">
                  <Clock size={26} />
                </div>
                <h3 className={`text-lg sm:text-xl md:text-2xl text-[#8A0F1A] mb-3 leading-snug ${getHeaderFontClass(currentLang)}`}>
                  {translateText(invitation.brideCeremony.title, 'ceremonyBride', currentLang)}
                </h3>
                <div className="space-y-3 text-xs sm:text-sm text-gray-800">
                  <p className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#8A0F1A] shrink-0" />
                    <span className="font-semibold text-gray-900">
                      {formatSolarDate(invitation.brideCeremony.date || invitation.solarDate, currentLang)}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock size={16} className="text-[#8A0F1A] shrink-0" />
                    <span className="font-bold text-base text-[#8A0F1A]">
                      {invitation.brideCeremony.time || '10:00'}
                    </span>
                  </p>
                  <p className="flex items-start gap-2 pt-1 border-t border-stone-100">
                    <MapPin size={16} className="text-[#8A0F1A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="block text-sm sm:text-base text-gray-900 font-bold">
                        {translateVenueName(invitation.brideCeremony.venueName, 'bride', currentLang)}
                      </strong>
                      <span className="text-xs sm:text-sm text-gray-600 block mt-0.5">
                        {translateAddress(invitation.brideCeremony.address, currentLang)}
                      </span>
                    </span>
                  </p>
                </div>
              </div>

              {invitation.brideCeremony.mapUrl && (
                <a
                  href={invitation.brideCeremony.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 relative z-10 w-full py-3 px-4 rounded-2xl border-2 border-[#D4AF37] text-[#8A0F1A] hover:bg-amber-50 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <MapPin size={16} />
                  <span>{t.getDirections}</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
            </ScrollReveal>
          )}

          {/* Schedule 3: Main Reception Banquet */}
          <ScrollReveal
            variant="fade-right"
            delay={260}
            shimmer
            className={`h-full rounded-[32px] ${!invitation.separateSchedules ? 'md:col-span-2 lg:col-span-3 max-w-xl mx-auto w-full' : ''}`}
          >
          <div
            className="bg-white rounded-[32px] p-7 sm:p-9 shadow-xl border-2 border-[#D4AF37] relative overflow-hidden flex flex-col justify-between hover:shadow-2xl transition duration-300 group h-full"
            style={
              (invitation.reception?.customFrameUrl || customFrameUrl || invitation.customFrameUrl)
                ? {
                    backgroundImage: `url(${invitation.reception?.customFrameUrl || customFrameUrl || invitation.customFrameUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          >
            {/* Direct Upload Frame Button for Card 3 */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
              <button
                type="button"
                onClick={() => receptionScheduleFrameRef.current?.click()}
                className="px-2.5 py-1 rounded-full bg-amber-500/90 hover:bg-amber-600 text-white text-[11px] font-bold shadow-md flex items-center gap-1 transition"
                title="Upload khung riêng cho thẻ này"
              >
                <Upload size={12} />
                <span>{currentLang === 'vi' ? 'Upload khung' : currentLang === 'en' ? 'Upload Frame' : 'ផ្ទុកឡើងស៊ុម'}</span>
              </button>
              {invitation.reception?.customFrameUrl && (
                <button
                  type="button"
                  onClick={() => {
                    invitation.reception.customFrameUrl = undefined;
                    setRsvpForm((prev) => ({ ...prev }));
                  }}
                  className="p-1 rounded-full bg-red-600/90 hover:bg-red-700 text-white text-[11px] shadow-md transition"
                  title="Xóa khung riêng"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            {/* Top Royal Red Bar */}
            <div className="absolute top-0 inset-x-0 h-2 red-royal-gradient" />

            {/* Custom Uploaded Corner Ornaments (only shown if user uploaded hoa văn) */}
            {(customOrnamentUrl || invitation.customOrnamentUrl) && (
              <>
                <img
                  src={customOrnamentUrl || invitation.customOrnamentUrl}
                  alt="Corner Ornament"
                  className="absolute top-2.5 left-2.5 w-7 h-7 object-contain pointer-events-none opacity-90"
                />
                <img
                  src={customOrnamentUrl || invitation.customOrnamentUrl}
                  alt="Corner Ornament"
                  className="absolute top-2.5 right-2.5 w-7 h-7 object-contain pointer-events-none opacity-90 scale-x-[-1]"
                />
                <img
                  src={customOrnamentUrl || invitation.customOrnamentUrl}
                  alt="Corner Ornament"
                  className="absolute bottom-2.5 left-2.5 w-7 h-7 object-contain pointer-events-none opacity-90 scale-y-[-1]"
                />
                <img
                  src={customOrnamentUrl || invitation.customOrnamentUrl}
                  alt="Corner Ornament"
                  className="absolute bottom-2.5 right-2.5 w-7 h-7 object-contain pointer-events-none opacity-90 scale-[-1]"
                />
              </>
            )}

            {/* Inner Gold Frame Accent */}
            <div className="absolute inset-2 rounded-[24px] border border-[#D4AF37]/40 pointer-events-none" />

            <div className="relative z-10 pt-2">
              <div className="w-14 h-14 rounded-2xl red-royal-gradient text-[#FDE792] border border-[#F5D77F] flex items-center justify-center mb-5 shadow-lg">
                <Heart size={26} className="fill-[#FDE792]" />
              </div>
              <h3 className={`text-lg sm:text-xl md:text-2xl text-[#8A0F1A] mb-3 leading-snug ${getHeaderFontClass(currentLang)}`}>
                {translateText(invitation.reception.title, 'receptionTitle', currentLang)}
              </h3>
              <div className="space-y-3 text-xs sm:text-sm text-gray-800">
                <p className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#8A0F1A] shrink-0" />
                  <span className="font-semibold text-gray-900">
                    {formatSolarDate(invitation.reception.date || invitation.solarDate, currentLang)}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={16} className="text-[#8A0F1A] shrink-0" />
                  <span className="font-bold text-base text-[#8A0F1A]">
                    {invitation.reception.time || invitation.weddingTime || '11:30'}
                  </span>
                </p>
                <p className="flex items-start gap-2 pt-1 border-t border-stone-100">
                  <MapPin size={16} className="text-[#8A0F1A] shrink-0 mt-0.5" />
                  <span>
                    <strong className="block text-sm sm:text-base text-gray-900 font-bold">
                      {translateVenueName(invitation.reception.venueName, 'reception', currentLang)}
                    </strong>
                    <span className="text-xs sm:text-sm text-gray-600 block mt-0.5">
                      {translateAddress(invitation.reception.address, currentLang)}
                    </span>
                  </span>
                </p>
              </div>
            </div>

            {invitation.reception.mapUrl && (
              <a
                href={invitation.reception.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 relative z-10 w-full py-3 px-4 rounded-2xl red-royal-gradient text-[#FDE792] border border-[#F5D77F] hover:brightness-110 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition"
              >
                <MapPin size={16} />
                <span>{t.getDirections}</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* LOVE STORY SECTION */}
      {invitation.story && invitation.story.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <ScrollReveal variant="zoom-in" className="text-center mb-10">
            <span className="text-2xl text-[#8A0F1A]">♡</span>
            <h2 className={`text-2xl sm:text-3xl text-[#8A0F1A] ${currentLang === 'vi' ? 'font-times font-bold' : 'font-muol font-normal'}`}>
              {t.ourStory}
            </h2>
          </ScrollReveal>

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:bg-[#D4AF37]/40">
            {invitation.story.map((item, idx) => (
              <ScrollReveal
                key={idx}
                variant={idx % 2 === 0 ? 'fade-left' : 'fade-right'}
                delay={idx * 100}
              >
                <div
                  className={`relative flex items-center gap-6 ${
                    idx % 2 === 0 ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row-reverse'
                  }`}
                >
                  {/* Year Marker Badge */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full red-royal-gradient text-[#FDE792] border-2 border-[#F5D77F] flex items-center justify-center text-xs font-bold shadow z-10">
                    {item.year}
                  </div>

                  {/* Content Box */}
                  <div className="w-full sm:w-1/2 p-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
                      <h4 className={`text-base font-bold text-[#8A0F1A] mb-1 ${currentLang === 'vi' ? 'font-times' : 'font-muol'}`}>
                        {translateStoryTitle(item.title, idx, currentLang)}
                      </h4>
                      <p className={`text-xs text-gray-600 leading-relaxed ${currentLang === 'vi' ? 'font-times' : 'font-battambang'}`}>
                        {translateStoryDescription(item.description, idx, currentLang)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-1/2" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* PHOTO GALLERY SECTION WITH MULTI-DEVICE INTERACTIVE SLIDER / CAROUSEL EFFECT */}
      {invitation.photoGallery && invitation.photoGallery.length > 0 && (
        <section
          className="max-w-7xl mx-auto px-3 sm:px-6 py-12 sm:py-16 overflow-hidden"
          onMouseEnter={() => setIsGalleryHovered(true)}
          onMouseLeave={() => setIsGalleryHovered(false)}
        >
          <ScrollReveal variant="zoom-in" className="text-center mb-6 sm:mb-8">
            <span className="text-2xl text-[#8A0F1A] mb-2 sm:mb-3 block">囍</span>
            <h2 className={`text-xl sm:text-3xl md:text-4xl text-[#8A0F1A] ${currentLang === 'vi' ? 'font-times font-bold' : 'font-muol font-normal'}`}>
              {t.photoGallery}
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1.5 px-2">
              {currentLang === 'vi'
                ? 'Hỗ trợ mọi thiết bị: Vuốt tay (Điện thoại/iPad), Kéo chuột hoặc Phím mũi tên (Máy tính) • Nhấp ảnh để phóng to'
                : currentLang === 'en'
                ? 'All-device support: Touch swipe (Phone/Tablet), Mouse drag or Arrow keys (Desktop) • Tap photo to enlarge'
                : 'គាំទ្រគ្រប់ឧបករណ៍៖ អូសដៃលើទូរស័ព្ទ/iPad ឬចុចសញ្ញាព្រួញលើកុំព្យូទ័រ • ចុចលើរូបដើម្បីមើលទំហំធំ'}
            </p>

            {/* Slider Toolbar: Auto-Play Toggle, Mode Switcher (3D Slider / Strip Carousel / Grid), and Add Photo */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {galleryViewMode !== 'grid' && invitation.photoGallery.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsGalleryAutoPlay(!isGalleryAutoPlay)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-full bg-white border border-[#D4AF37] text-[#8A0F1A] hover:bg-amber-50 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  {isGalleryAutoPlay ? <Pause size={13} /> : <Play size={13} />}
                  <span>
                    {isGalleryAutoPlay
                      ? currentLang === 'vi'
                        ? 'Tự trượt: Bật'
                        : currentLang === 'en'
                        ? 'Auto-Slide: ON'
                        : 'រំកិលស្វ័យប្រវត្តិ៖ បើក'
                      : currentLang === 'vi'
                      ? 'Tự trượt: Tắt'
                      : currentLang === 'en'
                      ? 'Auto-Slide: OFF'
                      : 'រំកិលស្វ័យប្រវត្តិ៖ បិទ'}
                  </span>
                </button>
              )}

              {/* Mode Switcher Pills for All Devices */}
              <div className="inline-flex items-center rounded-full bg-white border border-[#D4AF37] p-0.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => setGalleryViewMode('slider')}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                    galleryViewMode === 'slider'
                      ? 'red-royal-gradient text-[#FDE792] shadow-xs'
                      : 'text-stone-700 hover:text-[#8A0F1A]'
                  }`}
                >
                  {currentLang === 'vi' ? 'Slider 3D' : currentLang === 'en' ? '3D Slider' : 'Slider 3D'}
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryViewMode('strip')}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                    galleryViewMode === 'strip'
                      ? 'red-royal-gradient text-[#FDE792] shadow-xs'
                      : 'text-stone-700 hover:text-[#8A0F1A]'
                  }`}
                >
                  {currentLang === 'vi' ? 'Slider Ngang' : currentLang === 'en' ? 'Strip Slider' : 'Slider ជួរដេក'}
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryViewMode('grid')}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    galleryViewMode === 'grid'
                      ? 'red-royal-gradient text-[#FDE792] shadow-xs'
                      : 'text-stone-700 hover:text-[#8A0F1A]'
                  }`}
                >
                  <LayoutGrid size={12} />
                  <span>{currentLang === 'vi' ? 'Lưới' : currentLang === 'en' ? 'Grid' : 'ក្រឡា'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => addGalleryPhotoInputRef.current?.click()}
                className="px-2.5 sm:px-3 py-1.5 rounded-full red-royal-gradient text-[#FDE792] border border-[#F5D77F] text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110 transition cursor-pointer"
              >
                <Plus size={13} />
                <span>
                  {currentLang === 'vi'
                    ? 'Thêm ảnh'
                    : currentLang === 'en'
                    ? 'Add Photo'
                    : 'បន្ថែមរូបថត'}
                </span>
              </button>
              <input
                ref={addGalleryPhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAddGalleryPhoto}
              />
            </div>
          </ScrollReveal>

          <ScrollReveal variant="royal-bloom" delay={120}>
          {galleryViewMode === 'slider' ? (
            <div
              className="relative select-none touch-pan-y cursor-grab active:cursor-grabbing"
              onTouchStart={(e) => {
                galleryTouchStartX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (galleryTouchStartX.current === null) return;
                const diff = galleryTouchStartX.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 35) {
                  if (diff > 0) handleNextSlide();
                  else handlePrevSlide();
                }
                galleryTouchStartX.current = null;
              }}
              onMouseDown={(e) => {
                galleryMouseStartX.current = e.clientX;
              }}
              onMouseUp={(e) => {
                if (galleryMouseStartX.current === null) return;
                const diff = galleryMouseStartX.current - e.clientX;
                if (Math.abs(diff) > 45) {
                  if (diff > 0) handleNextSlide();
                  else handlePrevSlide();
                }
                galleryMouseStartX.current = null;
              }}
              onMouseLeave={() => {
                galleryMouseStartX.current = null;
              }}
            >
              {/* Left Navigation Button */}
              {invitation.photoGallery.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  aria-label="Previous photo"
                  className="absolute left-0.5 sm:left-3 md:left-5 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full red-royal-gradient text-[#FDE792] border-2 border-[#F5D77F] shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition cursor-pointer"
                >
                  <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Right Navigation Button */}
              {invitation.photoGallery.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextSlide}
                  aria-label="Next photo"
                  className="absolute right-0.5 sm:right-3 md:right-5 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full red-royal-gradient text-[#FDE792] border-2 border-[#F5D77F] shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition cursor-pointer"
                >
                  <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                </button>
              )}

              {/* 3D Coverflow / Center-Focus Spotlight Slider Stage (Responsive for 320px Mobile -> Tablet -> 4K Desktop) */}
              <div className="relative h-[275px] xs:h-[300px] sm:h-[380px] md:h-[430px] lg:h-[460px] flex items-center justify-center">
                {invitation.photoGallery.map((url, idx) => {
                  const total = invitation.photoGallery.length;
                  const currentIdx = activeSlideIndex % total;
                  const prevIdx = (currentIdx - 1 + total) % total;
                  const nextIdx = (currentIdx + 1) % total;
                  const farPrevIdx = (currentIdx - 2 + total) % total;
                  const farNextIdx = (currentIdx + 2) % total;

                  let positionState:
                    | 'active'
                    | 'prev'
                    | 'next'
                    | 'far-prev'
                    | 'far-next'
                    | 'hidden-left'
                    | 'hidden-right' = 'hidden-right';

                  if (idx === currentIdx) {
                    positionState = 'active';
                  } else if (idx === prevIdx) {
                    positionState = 'prev';
                  } else if (idx === nextIdx && total > 2) {
                    positionState = 'next';
                  } else if (idx === farPrevIdx && total >= 4) {
                    positionState = 'far-prev';
                  } else if (idx === farNextIdx && total >= 5) {
                    positionState = 'far-next';
                  } else {
                    const diff = (idx - currentIdx + total) % total;
                    positionState = diff > total / 2 ? 'hidden-left' : 'hidden-right';
                  }

                  const slideTransformStyle =
                    positionState === 'active'
                      ? 'translate-x-0 scale-100 z-30 opacity-100'
                      : positionState === 'prev'
                      ? '-translate-x-[48%] xs:-translate-x-[55%] sm:-translate-x-[72%] md:-translate-x-[84%] lg:-translate-x-[92%] scale-[0.78] sm:scale-[0.84] z-20 opacity-65 hover:opacity-95 -rotate-3'
                      : positionState === 'next'
                      ? 'translate-x-[48%] xs:translate-x-[55%] sm:translate-x-[72%] md:translate-x-[84%] lg:translate-x-[92%] scale-[0.78] sm:scale-[0.84] z-20 opacity-65 hover:opacity-95 rotate-3'
                      : positionState === 'far-prev'
                      ? '-translate-x-[95%] lg:-translate-x-[155%] scale-[0.65] z-10 opacity-0 lg:opacity-35 hover:opacity-75 -rotate-6 pointer-events-none lg:pointer-events-auto'
                      : positionState === 'far-next'
                      ? 'translate-x-[95%] lg:translate-x-[155%] scale-[0.65] z-10 opacity-0 lg:opacity-35 hover:opacity-75 rotate-6 pointer-events-none lg:pointer-events-auto'
                      : positionState === 'hidden-left'
                      ? '-translate-x-[140%] scale-60 z-0 opacity-0 pointer-events-none'
                      : 'translate-x-[140%] scale-60 z-0 opacity-0 pointer-events-none';

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (positionState !== 'active') {
                          setActiveSlideIndex(idx);
                        }
                      }}
                      className={`absolute w-[215px] xs:w-[240px] sm:w-[310px] md:w-[350px] lg:w-[380px] transition-all duration-700 ease-out ${slideTransformStyle}`}
                    >
                      <div
                        className={`rounded-2xl transition-all duration-500 ${
                          positionState === 'active'
                            ? 'ring-4 ring-[#D4AF37] shadow-[0_20px_50px_rgba(138,15,26,0.35)]'
                            : 'shadow-lg'
                        }`}
                      >
                        <WeddingGalleryFrame
                          src={url}
                          alt={`Wedding Photo ${idx + 1}`}
                          caption={`${idx + 1}/${total} • ${t.viewLarge}`}
                          onClick={() => {
                            if (positionState === 'active') {
                              setLightboxUrl(url);
                            } else {
                              setActiveSlideIndex(idx);
                            }
                          }}
                          photoOffset={invitation.galleryPhotoOffsets?.[idx]}
                          onAdjustClick={() =>
                            setAdjustModal({
                              isOpen: true,
                              imageSrc: url,
                              title:
                                currentLang === 'vi'
                                  ? `Rê / Chỉnh vị trí ảnh album ${idx + 1}`
                                  : currentLang === 'en'
                                  ? `Adjust Photo Position ${idx + 1}`
                                  : `តម្រឹមរូបថត ${idx + 1}`,
                              initialOffset: invitation.galleryPhotoOffsets?.[idx],
                              frameType: 'square',
                              target: 'gallery',
                              galleryIndex: idx,
                            })
                          }
                          onPhotoUpload={(newUrl) => {
                            const newGallery = [...invitation.photoGallery];
                            newGallery[idx] = newUrl;
                            invitation.photoGallery = newGallery;
                            setRsvpForm((prev) => ({ ...prev }));
                            saveCustomizationToServer({ photoGallery: newGallery });
                          }}
                          lang={currentLang}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Thumbnail Strip & Slide Indicator Dots */}
              <div className="mt-4 sm:mt-6 flex flex-col items-center gap-3">
                <div className="flex items-center justify-center gap-2 sm:gap-3.5 overflow-x-auto max-w-full py-2 px-3 no-scrollbar">
                  {invitation.photoGallery.map((url, idx) => {
                    const isActive = (activeSlideIndex % invitation.photoGallery.length) === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`relative w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-xl overflow-hidden shrink-0 transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'ring-3 ring-[#8A0F1A] border-2 border-[#F5D77F] scale-110 shadow-md -translate-y-1'
                            : 'border border-[#D4AF37]/50 opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                        title={`${currentLang === 'vi' ? 'Ảnh' : 'រូបទី'} ${idx + 1}`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${idx + 1}`}
                          draggable={false}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0.5 right-1 px-1 rounded bg-black/65 text-[#FDE792] text-[9px] font-bold">
                          {idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Progress Pill Dots */}
                <div className="flex items-center justify-center gap-1.5 flex-wrap px-2">
                  {invitation.photoGallery.map((_, idx) => {
                    const isActive = (activeSlideIndex % invitation.photoGallery.length) === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSlideIndex(idx)}
                        aria-label={`Slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'w-7 bg-[#8A0F1A] ring-1 ring-[#D4AF37]'
                            : 'w-2 bg-[#D4AF37]/50 hover:bg-[#D4AF37]'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ) : galleryViewMode === 'strip' ? (
            /* Multi-Card Horizontal Strip Carousel (Responsive 1 card on phone, 2 on tablet, 3-4 on laptop/desktop) */
            <div className="relative">
              {invitation.photoGallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    aria-label="Scroll left"
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full red-royal-gradient text-[#FDE792] border-2 border-[#F5D77F] shadow-xl flex items-center justify-center hover:scale-110 transition cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    aria-label="Scroll right"
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full red-royal-gradient text-[#FDE792] border-2 border-[#F5D77F] shadow-xl flex items-center justify-center hover:scale-110 transition cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              <div
                ref={galleryStripRef}
                className="flex items-center gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory py-4 px-4 sm:px-8 no-scrollbar scroll-smooth"
              >
                {invitation.photoGallery.map((url, idx) => {
                  const isActive = (activeSlideIndex % invitation.photoGallery.length) === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`snap-center shrink-0 w-[78vw] xs:w-[70vw] sm:w-[44vw] md:w-[30vw] lg:w-[260px] xl:w-[280px] transition-all duration-500 ${
                        isActive
                          ? 'scale-[1.03] ring-3 ring-[#D4AF37] rounded-2xl shadow-xl'
                          : 'opacity-90 hover:opacity-100'
                      }`}
                    >
                      <WeddingGalleryFrame
                        src={url}
                        alt={`Wedding Photo ${idx + 1}`}
                        caption={`${idx + 1}/${invitation.photoGallery.length} • ${t.viewLarge}`}
                        onClick={() => {
                          setActiveSlideIndex(idx);
                          setLightboxUrl(url);
                        }}
                        photoOffset={invitation.galleryPhotoOffsets?.[idx]}
                        onAdjustClick={() =>
                          setAdjustModal({
                            isOpen: true,
                            imageSrc: url,
                            title:
                              currentLang === 'vi'
                                ? `Rê / Chỉnh vị trí ảnh album ${idx + 1}`
                                : currentLang === 'en'
                                ? `Adjust Photo Position ${idx + 1}`
                                : `តម្រឹមរូបថត ${idx + 1}`,
                            initialOffset: invitation.galleryPhotoOffsets?.[idx],
                            frameType: 'square',
                            target: 'gallery',
                            galleryIndex: idx,
                          })
                        }
                        onPhotoUpload={(newUrl) => {
                          const newGallery = [...invitation.photoGallery];
                          newGallery[idx] = newUrl;
                          invitation.photoGallery = newGallery;
                          setRsvpForm((prev) => ({ ...prev }));
                          saveCustomizationToServer({ photoGallery: newGallery });
                        }}
                        lang={currentLang}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Responsive Multi-Device Grid View Option (1 col on tiny screen, 2 on mobile, 3 on tablet, 4 on desktop) */
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-fadeIn">
              {invitation.photoGallery.map((url, idx) => (
                <WeddingGalleryFrame
                  key={idx}
                  src={url}
                  alt={`Wedding Photo ${idx + 1}`}
                  caption={t.viewLarge}
                  onClick={() => setLightboxUrl(url)}
                  photoOffset={invitation.galleryPhotoOffsets?.[idx]}
                  onAdjustClick={() =>
                    setAdjustModal({
                      isOpen: true,
                      imageSrc: url,
                      title:
                        currentLang === 'vi'
                          ? `Rê / Chỉnh vị trí ảnh album ${idx + 1}`
                          : currentLang === 'en'
                          ? `Adjust Photo Position ${idx + 1}`
                          : `តម្រឹមរូបថត ${idx + 1}`,
                      initialOffset: invitation.galleryPhotoOffsets?.[idx],
                      frameType: 'square',
                      target: 'gallery',
                      galleryIndex: idx,
                    })
                  }
                  onPhotoUpload={(newUrl) => {
                    const newGallery = [...invitation.photoGallery];
                    newGallery[idx] = newUrl;
                    invitation.photoGallery = newGallery;
                    setRsvpForm((prev) => ({ ...prev }));
                    saveCustomizationToServer({ photoGallery: newGallery });
                  }}
                  lang={currentLang}
                />
              ))}
            </div>
          )}
          </ScrollReveal>
        </section>
      )}

      {/* RSVP INTERACTIVE FORM SECTION */}
      <section id="rsvp-section" className="max-w-3xl mx-auto px-4 py-16">
        <input
          type="file"
          ref={rsvpFrameRef}
          onChange={handleRsvpFrameUpload}
          accept="image/*"
          className="hidden"
        />

        <ScrollReveal variant="flip-up" duration={950} shimmer className="rounded-3xl">
        <div
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-[#D4AF37] relative overflow-hidden group"
          style={
            (rsvpCustomFrameUrl || invitation.rsvpFrameUrl || customFrameUrl || invitation.customFrameUrl)
              ? {
                  backgroundImage: `url(${rsvpCustomFrameUrl || invitation.rsvpFrameUrl || customFrameUrl || invitation.customFrameUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        >
          {/* Direct Upload Frame Button for RSVP Card */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
            <button
              type="button"
              onClick={() => rsvpFrameRef.current?.click()}
              className="px-3 py-1.5 rounded-full gold-gradient-bg text-stone-900 border border-[#D4AF37] text-xs font-bold shadow-md flex items-center gap-1.5 hover:brightness-105 transition cursor-pointer"
              title="Upload khung riêng cho thiệp RSVP"
            >
              <Sparkles size={13} className="text-[#8A0F1A]" />
              <ImageIcon size={13} className="text-[#8A0F1A]" />
              <span>{currentLang === 'vi' ? 'Upload khung RSVP' : currentLang === 'en' ? 'Upload RSVP Frame' : 'ប្តូរស៊ុម'}</span>
            </button>
            {(rsvpCustomFrameUrl || invitation.rsvpFrameUrl) && (
              <button
                type="button"
                onClick={() => {
                  invitation.rsvpFrameUrl = undefined;
                  setRsvpCustomFrameUrl(undefined);
                  setRsvpForm((prev) => ({ ...prev }));
                }}
                className="p-1.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white text-xs shadow-md transition cursor-pointer"
                title="Xóa khung RSVP"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-2 red-royal-gradient rounded-full flex items-center justify-center text-[#FDE792] shadow">
              <CheckCircle size={24} />
            </div>
            <h2 className={`text-2xl sm:text-3xl text-[#8A0F1A] ${currentLang === 'vi' ? 'font-times font-bold' : 'font-muol font-normal'}`}>
              {t.rsvpTitle}
            </h2>
            {currentLang !== 'km' && (
              <p className="font-muol text-sm text-[#B88329] mt-1">
                (ការឆ្លើយតបចូលរួម)
              </p>
            )}
            <p className="text-xs text-gray-600 mt-1.5 max-w-lg mx-auto">
              {t.rsvpSubtitle}
            </p>
          </div>

          {/* HOST EMAIL NOTIFICATION SETTING PANEL (Nhập Email Chủ Hôn nhận thông báo khi khách bấm ការឆ្លើយតបចូលរួម) */}
          <div className="mb-6 rounded-2xl border-2 border-[#D4AF37]/70 bg-gradient-to-r from-[#FFFDF8] via-amber-50/70 to-[#FFFDF8] p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl red-royal-gradient text-[#FDE792] flex items-center justify-center shadow-xs shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#8A0F1A] flex items-center gap-1.5 flex-wrap">
                    <span>
                      {currentLang === 'vi'
                        ? 'Email Chủ Hôn nhận thông báo (ការឆ្លើយតបចូលរួម):'
                        : currentLang === 'en'
                        ? 'Wedding Host Email for RSVP (ការឆ្លើយតបចូលរួម):'
                        : 'អ៊ីមែលម្ចាស់ដើមការទទួលដំណឹង (ការឆ្លើយតបចូលរួម)៖'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#D4AF37] text-[#8A0F1A] font-mono text-xs">
                      {hostEmail || (currentLang === 'vi' ? 'Chưa nhập Email' : 'មិនទាន់បញ្ចូលអ៊ីមែល')}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    {currentLang === 'vi'
                      ? 'Khi khách bấm vào (ការឆ្លើយតបចូលរួម), hệ thống sẽ tự động gửi thông báo chi tiết qua Email cho chủ hôn.'
                      : currentLang === 'en'
                      ? 'When a guest clicks (ការឆ្លើយតបចូលរួម), an email notification is automatically sent to the host.'
                      : 'នៅពេលភ្ញៀវចុចលើ (ការឆ្លើយតបចូលរួម) ប្រព័ន្ធនឹងផ្ញើសារជូនដំណឹងទៅកាន់អ៊ីមែលម្ចាស់ដើមការដោយស្វ័យប្រវត្តិ។'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHostEmailPanel(!showHostEmailPanel)}
                  className="px-3 py-1.5 rounded-xl bg-[#8A0F1A] hover:bg-[#60050E] text-[#FDE792] text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Settings size={13} />
                  <span>
                    {showHostEmailPanel
                      ? currentLang === 'vi'
                        ? 'Thu gọn'
                        : 'បិទ'
                      : currentLang === 'vi'
                      ? 'Nhập / Đổi Email Chủ Hôn'
                      : currentLang === 'en'
                      ? 'Set Host Email'
                      : 'បញ្ចូល / ប្តូរអ៊ីមែលម្ចាស់ដើមការ'}
                  </span>
                </button>
              </div>
            </div>

            {showHostEmailPanel && (
              <div className="mt-4 pt-4 border-t border-amber-200/80 space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-bold text-[#8A0F1A] mb-1">
                      {currentLang === 'vi'
                        ? '📧 Nhập địa chỉ Email của Chủ Hôn (Nhận thông báo khi khách bấm ការឆ្លើយតបចូលរួម)'
                        : currentLang === 'en'
                        ? '📧 Enter Wedding Host Email Address'
                        : '📧 បញ្ចូលអ៊ីមែលម្ចាស់ដើមការ (ទទួលដំណឹងពេលភ្ញៀវចុច ការឆ្លើយតបចូលរួម)'}
                    </label>
                    <input
                      type="email"
                      value={hostEmail}
                      onChange={(e) => setHostEmail(e.target.value)}
                      placeholder="VD: kungseyhaofficial@gmail.com"
                      className="w-full px-3.5 py-2 bg-white border border-[#D4AF37] rounded-xl text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#8A0F1A] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={hostEmailSaving}
                      onClick={handleSaveHostEmail}
                      className="flex-1 py-2 px-3 rounded-xl red-royal-gradient text-[#FDE792] text-xs font-bold shadow hover:brightness-110 transition cursor-pointer"
                    >
                      {hostEmailSaving
                        ? '...'
                        : currentLang === 'vi'
                        ? '💾 Lưu Email Chủ Hôn'
                        : currentLang === 'en'
                        ? '💾 Save Host Email'
                        : '💾 រក្សាទុកអ៊ីមែល'}
                    </button>
                    <button
                      type="button"
                      disabled={testingEmail || !hostEmail.trim()}
                      onClick={handleTestHostEmail}
                      className="py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#8A0F1A] border border-[#D4AF37] text-xs font-bold transition cursor-pointer"
                    >
                      {testingEmail
                        ? '...'
                        : currentLang === 'vi'
                        ? '🔔 Gửi Thử'
                        : currentLang === 'en'
                        ? '🔔 Test'
                        : '🔔 សាកល្បង'}
                    </button>
                  </div>
                </div>

                {/* Optional Gmail SMTP App Password & Notification Log toggles */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setShowSmtpAdvanced(!showSmtpAdvanced)}
                    className="text-[#8A0F1A] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>⚙️ {currentLang === 'vi' ? 'Cấu hình SMTP Gmail gửi trực tiếp (Tùy chọn)' : 'ការកំណត់ Gmail SMTP (ជម្រើសបន្ថែម)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailLogs(!showEmailLogs);
                      if (!showEmailLogs) fetchEmailLogs();
                    }}
                    className="text-stone-700 hover:text-[#8A0F1A] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Bell size={12} className="text-[#8A0F1A]" />
                    <span>
                      {currentLang === 'vi'
                        ? `Hộp thư thông báo đã gửi (${emailLogs.length})`
                        : `ប្រវត្តិសារជូនដំណឹង (${emailLogs.length})`}
                    </span>
                  </button>
                </div>

                {showSmtpAdvanced && (
                  <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-2 text-xs">
                    <p className="text-[11px] text-stone-500">
                      {currentLang === 'vi'
                        ? 'Mặc định hệ thống tự động tạo Email thông báo tức thì. Nếu muốn gửi qua máy chủ Gmail cá nhân, nhập Gmail & Mật khẩu ứng dụng (16 ký tự App Password) bên dưới:'
                        : 'បញ្ចូល Gmail និង App Password (១៦ ខ្ទង់) ប្រសិនបើចង់ផ្ញើចេញពីគណនី Gmail ផ្ទាល់៖'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="email"
                        value={smtpGmailUser}
                        onChange={(e) => setSmtpGmailUser(e.target.value)}
                        placeholder="Gmail gửi đi (VD: kungseyhaofficial@gmail.com)"
                        className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                      />
                      <input
                        type="password"
                        value={smtpGmailAppPassword}
                        onChange={(e) => setSmtpGmailAppPassword(e.target.value)}
                        placeholder="Gmail App Password (16 ký tự)"
                        className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}

                {hostEmailSaveMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    {hostEmailSaveMsg}
                  </div>
                )}

                {showEmailLogs && (
                  <div className="p-3 rounded-xl bg-white border border-stone-200 max-h-56 overflow-y-auto space-y-2">
                    <div className="text-xs font-bold text-[#8A0F1A] flex items-center justify-between">
                      <span>
                        {currentLang === 'vi'
                          ? '📬 Danh sách thông báo Email khi khách bấm (ការឆ្លើយតបចូលរួម)'
                          : '📬 បញ្ជីសារជូនដំណឹងអ៊ីមែល (ការឆ្លើយតបចូលរួម)'}
                      </span>
                    </div>
                    {emailLogs.length === 0 ? (
                      <p className="text-[11px] text-stone-400 italic">
                        {currentLang === 'vi' ? 'Chưa có thông báo nào.' : 'មិនទាន់មានសារជូនដំណឹងនៅឡើយទេ។'}
                      </p>
                    ) : (
                      emailLogs.map((log) => (
                        <div key={log.id} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-stone-900">
                              {log.guestName} → <span className="text-[#8A0F1A] font-mono">{log.toEmail}</span>
                            </div>
                            <div className="text-[11px] text-stone-500">
                              {new Date(log.sentAt).toLocaleString()} • {log.accompanyCount} khách
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {log.htmlPreview && (
                              <button
                                type="button"
                                onClick={() => setEmailPreviewHtml(log.htmlPreview || null)}
                                className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-[#8A0F1A] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Eye size={11} />
                                <span>{currentLang === 'vi' ? 'Xem nội dung Email' : 'មើលអ៊ីមែល'}</span>
                              </button>
                            )}
                            {log.previewUrl && (
                              <a
                                href={log.previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] flex items-center gap-1"
                              >
                                <ExternalLink size={11} />
                                <span>Webmail</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {rsvpSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl space-y-2 text-xs sm:text-sm shadow-sm animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-emerald-600 shrink-0" />
                <span className="font-semibold">{rsvpSuccess}</span>
              </div>
              {emailNotificationInfo && emailNotificationInfo.toEmail && (
                <div className="pl-8 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-emerald-700">
                    📧 {currentLang === 'vi' ? 'Chủ hôn nhận thông báo:' : 'អ៊ីមែលម្ចាស់ដើមការ៖'}{' '}
                    <strong>{emailNotificationInfo.toEmail}</strong>
                  </span>
                  {emailNotificationInfo.htmlPreview && (
                    <button
                      type="button"
                      onClick={() => setEmailPreviewHtml(emailNotificationInfo.htmlPreview || null)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-[#8A0F1A] font-bold hover:bg-amber-50 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>{currentLang === 'vi' ? 'Xem thư thông báo đã gửi' : 'មើលសារជូនដំណឹងអ៊ីមែល'}</span>
                    </button>
                  )}
                  {emailNotificationInfo.mailtoUrl && (
                    <a
                      href={emailNotificationInfo.mailtoUrl}
                      className="px-2.5 py-1 rounded-lg bg-[#8A0F1A] text-[#FDE792] font-bold hover:brightness-110 transition flex items-center gap-1"
                    >
                      <Mail size={12} />
                      <span>{currentLang === 'vi' ? 'Mở ứng dụng Email' : 'បើកកម្មវិធី Email'}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {rsvpError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 text-xs shadow-sm animate-fadeIn">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <span>{rsvpError}</span>
            </div>
          )}

          <form onSubmit={handleRsvpSubmit} className="space-y-5">
            {/* Guest Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {t.guestNameLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={rsvpForm.guestName}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, guestName: e.target.value })}
                  placeholder={t.guestNamePlaceholder}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-[#8A0F1A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {t.guestPhoneLabel}
                </label>
                <input
                  type="tel"
                  value={rsvpForm.phone}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                  placeholder={t.guestPhonePlaceholder}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-[#8A0F1A] focus:outline-none"
                />
              </div>
            </div>

            {/* Attending Status Radio Buttons */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                {t.attendingStatus} *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'attending', label: t.statusAttending, color: 'border-emerald-500' },
                  { id: 'not_attending', label: t.statusNotAttending, color: 'border-red-400' },
                  { id: 'undecided', label: t.statusUndecided, color: 'border-amber-400' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition text-xs font-medium ${
                      rsvpForm.status === item.id
                        ? 'border-[#8A0F1A] bg-red-50/60 text-[#8A0F1A] font-bold'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rsvpStatus"
                      value={item.id}
                      checked={rsvpForm.status === item.id}
                      onChange={() => setRsvpForm({ ...rsvpForm, status: item.id as any })}
                      className="text-[#8A0F1A]"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Accompany count and Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {t.accompanyGuests}
                </label>
                <select
                  value={rsvpForm.accompanyCount}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, accompanyCount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-battambang"
                >
                  <option value={1}>{t.accompany1}</option>
                  <option value={2}>{t.accompany2}</option>
                  <option value={3}>{t.accompany3}</option>
                  <option value={4}>{t.accompany4}</option>
                  <option value={5}>{t.accompany5}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {t.guestSide}
                </label>
                <select
                  value={rsvpForm.side}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, side: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm"
                >
                  <option value="groom">{t.sideGroom}</option>
                  <option value="bride">{t.sideBride}</option>
                  <option value="mutual">{t.sideMutual}</option>
                </select>
              </div>
            </div>

            {/* Wishes message */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {t.wishMessageLabel}
              </label>
              <textarea
                rows={3}
                value={rsvpForm.message}
                onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                placeholder={t.wishPlaceholder}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-[#8A0F1A] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={rsvpSubmitting}
              className="w-full py-3.5 px-6 rounded-xl red-royal-gradient text-[#FDE792] font-bold text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {rsvpSubmitting ? (
                <div className="w-5 h-5 border-2 border-[#FDE792] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>
                    {currentLang === 'km'
                      ? 'ការឆ្លើយតបចូលរួម (ផ្ញើការបញ្ជាក់)'
                      : `${t.sendRsvp} (ការឆ្លើយតបចូលរួម)`}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Recent Wishes Wall */}
          {recentWishes.length > 0 && (
            <div className="mt-10 pt-8 border-t border-stone-200">
              <h3 className="font-serif-luxury text-base font-bold text-[#8A0F1A] mb-4 text-center">
                {t.wishesWall}
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {recentWishes.map((w, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <div className="flex justify-between font-bold text-[#8A0F1A]">
                      <span>{w.guestName}</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {new Date(w.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1 italic">"{w.message}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </ScrollReveal>
      </section>

      {/* SINGLE AUTHENTIC BANK / KHQR STANDEE CARD SECTION */}
      <section className="max-w-xl mx-auto px-4 py-12">
        {/* Hidden File Input for Single Bank QR Upload */}
        <input
          ref={groomQrInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleBankQrUpload('groom', e)}
        />
        {/* Hidden File Input for Bank Card Custom Frame Upload */}
        <input
          ref={bankFrameRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBankFrameUpload}
        />

        <ScrollReveal variant="zoom-in" className="text-center mb-8">
          <span className="text-2xl text-[#8A0F1A]">🎁</span>
          <h2 className={`text-2xl sm:text-3xl text-[#8A0F1A] ${currentLang === 'vi' ? 'font-times font-bold' : 'font-muol font-normal'}`}>
            {t.giftBoxTitle}
          </h2>
          <p className="text-[20px] leading-relaxed text-gray-700 font-medium mt-2">
            {t.giftBoxSubtitle}
          </p>
        </ScrollReveal>

        <ScrollReveal variant="flip-up" delay={100} shimmer className="max-w-[390px] sm:max-w-[420px] mx-auto rounded-[32px]">
          {/* Outer Luxury Bank Standee Frame (supports Custom Frame Upload) */}
          <div
            className="relative rounded-[32px] p-2.5 sm:p-3 bg-gradient-to-b from-[#8A0F1A] via-[#5E0710] to-[#3A0409] border-[3px] border-[#D4AF37] shadow-[0_24px_60px_rgba(138,15,26,0.32)] overflow-hidden"
            style={
              bankCustomFrameUrl || invitation.bankFrameUrl
                ? {
                    backgroundImage: `url(${bankCustomFrameUrl || invitation.bankFrameUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          >
            {/* Subtle dark overlay when custom frame is uploaded so header text stays readable */}
            {(bankCustomFrameUrl || invitation.bankFrameUrl) && (
              <div className="absolute inset-0 bg-black/25 pointer-events-none" />
            )}

            {/* Inner Gold Filigree Trim */}
            <div className="absolute inset-1.5 rounded-[26px] border border-[#F5D77F]/40 pointer-events-none" />

            {/* Top Official Bank / KHQR Header Banner */}
            <div className="relative z-10 px-3.5 pt-3 pb-4 flex items-center justify-between gap-2 text-white flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl gold-gradient-bg text-[#8A0F1A] border border-white/60 flex items-center justify-center font-black text-xs shadow-md tracking-tighter shrink-0">
                  QR
                </div>
                <div className="text-left">
                  <div className="text-sm sm:text-base font-black tracking-wider text-[#FDE792] uppercase leading-none flex items-center gap-1.5">
                    <span>{invitation.bankInfo.groom.bankName || 'ABA Bank'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-white font-bold">
                      KHQR
                    </span>
                  </div>
                  <span className="text-[10px] text-[#F5D77F]/90 block mt-0.5">
                    {currentLang === 'vi'
                      ? 'Quét mã QR chuyển khoản mừng cưới'
                      : currentLang === 'en'
                      ? 'Scan QR Code with any Banking App'
                      : 'ស្កេន QR ដើម្បីផ្ទេរប្រាក់ចំណងដៃ'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Upload Custom Frame Button for Bank Card */}
                <button
                  type="button"
                  onClick={() => bankFrameRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-full gold-gradient-bg text-stone-900 border border-[#D4AF37] text-[11px] font-bold shadow-md flex items-center gap-1 hover:brightness-105 transition cursor-pointer"
                  title={currentLang === 'vi' ? 'Tải khung riêng cho thẻ Ngân hàng' : 'ប្តូរស៊ុមធនាគារ'}
                >
                  <ImageIcon size={12} className="text-[#8A0F1A]" />
                  <span>
                    {currentLang === 'vi'
                      ? 'Upload khung'
                      : currentLang === 'en'
                      ? 'Upload Frame'
                      : 'ប្តូរស៊ុម'}
                  </span>
                </button>

                {(bankCustomFrameUrl || invitation.bankFrameUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      invitation.bankFrameUrl = undefined;
                      setBankCustomFrameUrl(undefined);
                      setRsvpForm((prev) => ({ ...prev }));
                      saveCustomizationToServer({ bankFrameUrl: '' });
                    }}
                    className="p-1.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white text-xs shadow-md transition cursor-pointer"
                    title={currentLang === 'vi' ? 'Xóa khung đã tải lên' : 'លុបស៊ុម'}
                  >
                    <Trash2 size={12} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setEditingBankSide(editingBankSide === 'groom' ? null : 'groom')}
                  className="px-2.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-[#FDE792] border border-[#F5D77F]/50 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer backdrop-blur-xs"
                  title={currentLang === 'vi' ? 'Sửa thông tin ngân hàng' : 'កែប្រែព័ត៌មានធនាគារ'}
                >
                  <Settings size={12} />
                  <span>
                    {editingBankSide === 'groom'
                      ? currentLang === 'vi'
                        ? 'Đóng'
                        : 'បិទ'
                      : currentLang === 'vi'
                      ? 'Sửa TK'
                      : 'កែប្រែ'}
                  </span>
                </button>
              </div>
            </div>

            {/* Inline Edit Bank Details Drawer */}
            {editingBankSide === 'groom' && (
              <div className="relative z-20 mx-1 mb-3 p-3.5 rounded-2xl bg-[#FFFDF8] border-2 border-[#D4AF37] text-left space-y-2.5 animate-fadeIn shadow-lg">
                <div>
                  <label className="block text-[11px] font-bold text-[#8A0F1A] mb-0.5">
                    {currentLang === 'vi' ? 'Tên Ngân Hàng (VD: ABA Bank, Wing Bank, Vietcombank)' : 'ឈ្មោះធនាគារ (ឧ. ABA Bank, Wing Bank)'}
                  </label>
                  <input
                    type="text"
                    value={invitation.bankInfo.groom.bankName}
                    onChange={(e) => {
                      invitation.bankInfo.groom.bankName = e.target.value;
                      setRsvpForm((prev) => ({ ...prev }));
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#8A0F1A] mb-0.5">
                    {currentLang === 'vi' ? 'Tên Chủ Tài Khoản' : 'ឈ្មោះម្ចាស់គណនី'}
                  </label>
                  <input
                    type="text"
                    value={invitation.bankInfo.groom.accountName}
                    onChange={(e) => {
                      invitation.bankInfo.groom.accountName = e.target.value;
                      setRsvpForm((prev) => ({ ...prev }));
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold uppercase text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#8A0F1A] mb-0.5">
                    {currentLang === 'vi' ? 'Số Tài Khoản Ngân Hàng' : 'លេខគណនីធនាគារ'}
                  </label>
                  <input
                    type="text"
                    value={invitation.bankInfo.groom.accountNumber}
                    onChange={(e) => {
                      invitation.bankInfo.groom.accountNumber = e.target.value;
                      setRsvpForm((prev) => ({ ...prev }));
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    saveCustomizationToServer({ bankInfo: invitation.bankInfo });
                    setEditingBankSide(null);
                  }}
                  className="w-full py-2 rounded-xl red-royal-gradient text-[#FDE792] text-xs font-bold shadow cursor-pointer"
                >
                  {currentLang === 'vi' ? '💾 Lưu thông tin ngân hàng' : '💾 រក្សាទុកព័ត៌មានធនាគារ'}
                </button>
              </div>
            )}

            {/* Inner White Bank Card Body (Authentic KHQR / Bank Standee Ticket Style) */}
            <div className="relative z-10 bg-white/95 backdrop-blur-xs rounded-[24px] overflow-hidden shadow-inner">
              {/* Signature KHQR Top-Right Red Diagonal Fold Accent */}
              <div
                className="absolute top-0 right-0 w-14 h-14 bg-gradient-to-bl from-[#C8102E] to-[#8A0F1A] pointer-events-none z-10"
                style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
              />

              {/* 1. Precision Bank QR Scanner Viewport AT THE TOP */}
              <div className="px-5 pt-6 pb-4 flex flex-col items-center">
                <div className="relative p-3.5 sm:p-4 rounded-3xl bg-white border border-stone-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                  {/* 4 Corner Scanner Brackets (Bank QR Style) */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-[3.5px] border-l-[3.5px] border-[#8A0F1A] rounded-tl-xl pointer-events-none z-20" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-[3.5px] border-r-[3.5px] border-[#8A0F1A] rounded-tr-xl pointer-events-none z-20" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-[3.5px] border-l-[3.5px] border-[#8A0F1A] rounded-bl-xl pointer-events-none z-20" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-[3.5px] border-r-[3.5px] border-[#8A0F1A] rounded-br-xl pointer-events-none z-20" />

                  {invitation.bankInfo.groom.qrImage ? (
                    <div className="relative group w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden bg-white flex items-center justify-center">
                      <img
                        src={invitation.bankInfo.groom.qrImage}
                        alt="Bank QR Code"
                        onClick={() => setLightboxUrl(invitation.bankInfo.groom.qrImage || null)}
                        style={
                          invitation.bankInfo.groom.qrOffset
                            ? {
                                transform: `translate(${invitation.bankInfo.groom.qrOffset.x}px, ${invitation.bankInfo.groom.qrOffset.y}px) scale(${invitation.bankInfo.groom.qrOffset.zoom})`,
                              }
                            : undefined
                        }
                        className="w-full h-full object-contain cursor-pointer transition-transform duration-200"
                        title={currentLang === 'vi' ? 'Nhấn để phóng to mã QR quét chuyển khoản' : 'ចុចដើម្បីពង្រីក QR ស្កេន'}
                      />

                      {/* Floating Controls on QR Image */}
                      <button
                        type="button"
                        onClick={() => setLightboxUrl(invitation.bankInfo.groom.qrImage || null)}
                        className="absolute bottom-2 left-2 z-30 px-2.5 py-1 rounded-lg bg-black/75 text-[#FDE792] text-[10px] font-bold flex items-center gap-1 hover:bg-black transition cursor-pointer shadow"
                        title={currentLang === 'vi' ? 'Phóng to mã QR' : 'ពង្រីក QR'}
                      >
                        <QrCode size={11} />
                        <span>{currentLang === 'vi' ? 'Phóng to' : 'ពង្រីក'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setAdjustModal({
                            isOpen: true,
                            imageSrc: invitation.bankInfo.groom.qrImage || '',
                            title:
                              currentLang === 'vi'
                                ? 'Rê / Chỉnh vị trí mã QR Ngân Hàng'
                                : 'តម្រឹមទីតាំង QR ធនាគារ',
                            initialOffset: invitation.bankInfo.groom.qrOffset,
                            frameType: 'square',
                            target: 'qrGroom',
                          })
                        }
                        className="absolute top-2 left-2 z-30 p-1.5 rounded-full bg-black/75 text-[#FDE792] hover:bg-black transition cursor-pointer shadow"
                        title={currentLang === 'vi' ? 'Rê / Chỉnh vị trí QR' : 'តម្រឹម QR'}
                      >
                        <Settings size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteBankQr('groom')}
                        className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition cursor-pointer shadow"
                        title={currentLang === 'vi' ? 'Xóa ảnh QR' : 'លុបរូប QR'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => groomQrInputRef.current?.click()}
                      className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border-2 border-dashed border-[#D4AF37] bg-gradient-to-b from-amber-50/30 to-amber-50/70 hover:from-amber-50/60 hover:to-amber-100/70 flex flex-col items-center justify-center p-5 cursor-pointer transition group"
                    >
                      <div className="w-14 h-14 rounded-2xl red-royal-gradient text-[#FDE792] border-2 border-[#F5D77F] flex items-center justify-center mb-3 shadow-lg group-hover:scale-105 transition">
                        <QrCode size={28} />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[#8A0F1A]">
                        {currentLang === 'vi'
                          ? 'បញ្ចូលរូប QR ធនាគារ / Tải QR Ngân Hàng'
                          : currentLang === 'en'
                          ? 'Upload Bank QR Code'
                          : 'បញ្ចូលរូប QR ធនាគារ'}
                      </span>
                      <span className="text-[11px] text-stone-500 mt-1">
                        {currentLang === 'vi'
                          ? 'Nhấn vào đây để tải mã QR chuyển khoản'
                          : currentLang === 'en'
                          ? 'Tap here to upload your Bank QR image'
                          : 'សម្រាប់ភ្ញៀវស្កេនផ្ទេរប្រាក់ចំណងដៃ'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons: Upload / Change QR & Download QR */}
                <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => groomQrInputRef.current?.click()}
                    className="px-4 py-2 rounded-full red-royal-gradient text-[#FDE792] border border-[#F5D77F] text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 transition cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>
                      {invitation.bankInfo.groom.qrImage
                        ? currentLang === 'vi'
                          ? 'Đổi ảnh QR Ngân hàng'
                          : currentLang === 'en'
                          ? 'Change Bank QR'
                          : 'ប្តូររូប QR ធនាគារ'
                        : currentLang === 'vi'
                        ? 'Upload QR Ngân hàng'
                        : currentLang === 'en'
                        ? 'Upload Bank QR'
                        : 'បញ្ចូល QR ធនាគារ'}
                    </span>
                  </button>

                  {invitation.bankInfo.groom.qrImage && (
                    <a
                      href={invitation.bankInfo.groom.qrImage}
                      download={`QR-${invitation.bankInfo.groom.bankName || 'Wedding'}.png`}
                      className="px-3.5 py-2 rounded-full bg-amber-50 hover:bg-amber-100 text-[#8A0F1A] border border-[#D4AF37] text-xs font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <span>⬇ {currentLang === 'vi' ? 'Tải ảnh QR' : 'ទាញយក QR'}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Authentic Bank Ticket Perforated Divider with Side Cutout Notches */}
              <div className="relative flex items-center justify-between my-1">
                <div className="w-5 h-5 rounded-full bg-[#5E0710] -ml-2.5 shrink-0 border-r border-[#D4AF37]/60" />
                <div className="w-full border-b-2 border-dashed border-stone-200 mx-1" />
                <div className="w-5 h-5 rounded-full bg-[#5E0710] -mr-2.5 shrink-0 border-l border-[#D4AF37]/60" />
              </div>

              {/* 2. Account Holder Info & Account Number BELOW THE QR CODE */}
              <div className="px-5 pt-3 pb-5 text-center">
                {/* Account Holder Frame Box below QR Code */}
                <div className="py-3 px-4 rounded-2xl bg-gradient-to-b from-[#FFFDF8] to-amber-50/40 border border-[#D4AF37]/40 mb-3.5 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400 block">
                    {t.accountHolder}
                  </span>
                  <div className="text-base sm:text-lg font-black text-[#1E293B] uppercase tracking-wide mt-0.5">
                    {translateCoupleName(invitation.bankInfo.groom.accountName || invitation.groom.fullName, currentLang)}
                  </div>
                  <div className="mt-1.5 flex items-center justify-center">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-red-50 text-[#8A0F1A] border border-[#8A0F1A]/20 text-[11px] font-bold">
                      囍 {translateCoupleName(invitation.groom.fullName, currentLang)} & {translateCoupleName(invitation.bride.fullName, currentLang)}
                    </span>
                  </div>
                </div>

                {/* Account Number Pill Box with Copy Button */}
                <div className="w-full">
                  <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5 px-1">
                    <span>
                      {t.bank}: <strong className="text-stone-900">{invitation.bankInfo.groom.bankName}</strong>
                    </span>
                    <span className="text-[11px] font-semibold text-[#8A0F1A]">USD / KHR</span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl font-mono text-base sm:text-lg font-bold tracking-wider text-[#8A0F1A] flex items-center justify-between border border-[#D4AF37]/50 shadow-2xs">
                    <span className="truncate pr-2">{invitation.bankInfo.groom.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(invitation.bankInfo.groom.accountNumber);
                        setCopiedBankGroom(true);
                        setTimeout(() => setCopiedBankGroom(false), 2000);
                      }}
                      className="text-xs font-sans font-bold text-[#8A0F1A] hover:bg-amber-50 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#D4AF37] shadow-xs transition cursor-pointer shrink-0"
                    >
                      <Copy size={12} />
                      <span>{copiedBankGroom ? t.copied : t.copyAccount}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Supported Banking Apps Strip */}
            <div className="relative z-10 pt-2.5 pb-1 px-3 flex items-center justify-center gap-2 flex-wrap text-[10px] font-bold text-[#FDE792]/90 tracking-wider uppercase">
              <span>ABA PAY</span>
              <span>•</span>
              <span>KHQR</span>
              <span>•</span>
              <span>WING</span>
              <span>•</span>
              <span>ACLEDA</span>
              <span>•</span>
              <span>VIETQR</span>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* SHARE INVITATION FOOTER */}
      <section className="max-w-xl mx-auto px-4 py-8 text-center">
        <ScrollReveal variant="zoom-in" shimmer className="rounded-3xl">
          <div className="p-6 bg-white rounded-3xl border border-[#D4AF37]/40 shadow-sm space-y-4">
            <span className="text-2xl text-[#8A0F1A] mb-2 block">囍</span>
            <h3 className={`text-lg text-[#8A0F1A] ${currentLang === 'vi' ? 'font-times font-bold' : currentLang === 'en' ? 'font-cinzel font-bold' : 'font-muol font-normal'}`}>
              {t.share}
            </h3>
            <p className="text-xs text-gray-500">
              {currentLang === 'vi'
                ? 'Chia sẻ đường dẫn thiệp cưới với bạn bè và người thân qua tin nhắn, Zalo hoặc mạng xã hội'
                : currentLang === 'en'
                ? 'Share this wedding invitation link with friends and family via message or social media'
                : 'ចែករំលែកសំបុត្រការនេះទៅកាន់មិត្តភក្តិតាមបណ្តាញសង្គម'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D4AF37] text-[#8A0F1A] text-xs font-semibold hover:bg-red-50 transition"
              >
                <Copy size={15} />
                <span>{copiedLink ? t.copied : t.copyLink}</span>
              </button>
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl red-royal-gradient text-[#FDE792] text-xs font-bold shadow hover:brightness-110 transition"
              >
                <QrCode size={15} />
                <span>{t.qrCode}</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        <p className="text-[11px] text-gray-400 mt-8 font-serif-luxury">
          © {new Date().getFullYear()} {translateInvitationTitle(invitation.title, currentLang)} • Made with Love
        </p>
      </section>

      {/* LIGHTBOX MODAL WITH SLIDER NAVIGATION */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-50 cursor-pointer"
          >
            <X size={28} />
          </button>

          {invitation.photoGallery && invitation.photoGallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const currIdx = invitation.photoGallery.indexOf(lightboxUrl);
                  const prevIdx =
                    currIdx >= 0
                      ? (currIdx - 1 + invitation.photoGallery.length) % invitation.photoGallery.length
                      : 0;
                  setLightboxUrl(invitation.photoGallery[prevIdx]);
                  setActiveSlideIndex(prevIdx);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full red-royal-gradient text-[#FDE792] border-2 border-[#F5D77F] flex items-center justify-center shadow-xl hover:scale-110 transition z-50 cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const currIdx = invitation.photoGallery.indexOf(lightboxUrl);
                  const nextIdx =
                    currIdx >= 0
                      ? (currIdx + 1) % invitation.photoGallery.length
                      : 0;
                  setLightboxUrl(invitation.photoGallery[nextIdx]);
                  setActiveSlideIndex(nextIdx);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full red-royal-gradient text-[#FDE792] border-2 border-[#F5D77F] flex items-center justify-center shadow-xl hover:scale-110 transition z-50 cursor-pointer"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <img
            src={lightboxUrl}
            alt="Enlarged photo"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-2xl border-2 border-[#D4AF37]/60"
          />
        </div>
      )}

      {/* PHOTO POSITION ADJUSTMENT MODAL (RÊ HÌNH TỰ CHỈNH) */}
      <PhotoAdjustModal
        isOpen={adjustModal.isOpen}
        imageSrc={adjustModal.imageSrc}
        title={adjustModal.title}
        initialOffset={adjustModal.initialOffset}
        frameType={adjustModal.frameType}
        lang={currentLang}
        onClose={() => setAdjustModal((prev) => ({ ...prev, isOpen: false }))}
        onSave={(newOffset) => {
          if (adjustModal.target === 'groom') {
            invitation.groom.avatarOffset = newOffset;
            saveCustomizationToServer({ groom: invitation.groom });
          } else if (adjustModal.target === 'bride') {
            invitation.bride.avatarOffset = newOffset;
            saveCustomizationToServer({ bride: invitation.bride });
          } else if (adjustModal.target === 'logo') {
            invitation.logoOffset = newOffset;
            saveCustomizationToServer({ logoOffset: newOffset });
          } else if (adjustModal.target === 'cover') {
            invitation.coverPhotoOffset = newOffset;
            saveCustomizationToServer({ coverPhotoOffset: newOffset });
          } else if (adjustModal.target === 'customFrame') {
            invitation.customFrameOffset = newOffset;
            saveCustomizationToServer({ customFrameOffset: newOffset });
          } else if (adjustModal.target === 'gallery' && adjustModal.galleryIndex !== undefined) {
            if (!invitation.galleryPhotoOffsets) invitation.galleryPhotoOffsets = {};
            invitation.galleryPhotoOffsets[adjustModal.galleryIndex] = newOffset;
            saveCustomizationToServer({ galleryPhotoOffsets: invitation.galleryPhotoOffsets });
          } else if (adjustModal.target === 'qrGroom') {
            invitation.bankInfo.groom.qrOffset = newOffset;
            saveCustomizationToServer({ bankInfo: invitation.bankInfo });
          } else if (adjustModal.target === 'qrBride') {
            invitation.bankInfo.bride.qrOffset = newOffset;
            saveCustomizationToServer({ bankInfo: invitation.bankInfo });
          }
          setAdjustModal((prev) => ({ ...prev, isOpen: false }));
        }}
      />

      {/* EMAIL HTML PREVIEW MODAL */}
      {emailPreviewHtml && (
        <div
          onClick={() => setEmailPreviewHtml(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border-2 border-[#D4AF37] p-6 relative"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
              <div className="flex items-center gap-2 text-[#8A0F1A] font-bold text-sm">
                <Mail size={18} />
                <span>
                  {currentLang === 'vi'
                    ? `Nội dung Email thông báo gửi tới Chủ Hôn (${hostEmail})`
                    : `ខ្លឹមសារអ៊ីមែលជូនដំណឹងទៅម្ចាស់ដើមការ (${hostEmail})`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEmailPreviewHtml(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div
              className="prose max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: emailPreviewHtml }}
            />
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={publicUrl}
        title={invitation.title}
        lang={currentLang}
      />
    </div>
  );
};
