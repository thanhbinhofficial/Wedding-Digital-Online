export type TemplateId = 'royal-red' | 'golden-elegance' | 'floral-cream' | 'khmer-traditional';
export type Language = 'vi' | 'km' | 'en';
export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export type FontFamily = 'muol' | 'battambang' | 'times' | 'playfair' | 'khmer' | 'cinzel' | 'script';

export interface TypographySettings {
  alignment: TextAlignment;
  fontFamily: FontFamily;
  fontSize: 'normal' | 'large' | 'xlarge' | 'huge';
  textColor: string;
}

export interface FamilyDetails {
  fullName: string;
  parents: {
    father: string;
    mother: string;
  };
  representative: string;
  hometown: string;
  familyAddress: string;
  phone: string;
  avatar: string;
  avatarOffset?: { x: number; y: number; zoom: number };
  familyMessage: string;
}

export interface EventSchedule {
  title: string;
  time: string;
  date: string;
  venueName: string;
  address: string;
  mapUrl: string;
  customFrameUrl?: string;
  customFrameOffset?: { x: number; y: number; zoom: number };
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrImage?: string;
  qrOffset?: { x: number; y: number; zoom: number };
}

export interface LayoutSettings {
  sectionSpacing?: 'compact' | 'normal' | 'relaxed' | 'loose';
  frameCornerRadius?: 'none' | 'md' | 'xl' | 'full';
  photoShape?: 'circle' | 'heart' | 'square' | 'oval';
  photoSize?: 'sm' | 'md' | 'lg' | 'xl';
  lineHeight?: 'tight' | 'normal' | 'loose';
  letterSpacing?: 'normal' | 'wide' | 'widest';
  cardWidth?: 'compact' | 'normal' | 'full';
  bgTexture?: 'none' | 'gold-stars' | 'khmer-lattice' | 'royal-silk' | 'floral-lace';
}

export interface Invitation {
  id: string;
  slug: string;
  title: string;
  templateId: TemplateId;
  status: 'draft' | 'published';
  isPasswordProtected: boolean;
  password?: string;
  primaryLanguage: Language;
  allowLanguageToggle: boolean;
  
  // Couple
  groom: FamilyDetails;
  bride: FamilyDetails;

  // Dates
  solarDate: string;
  lunarDate: string;
  weddingTime: string;

  // Schedules
  separateSchedules: boolean;
  groomCeremony: EventSchedule;
  brideCeremony: EventSchedule;
  reception: EventSchedule;

  // Content & media
  personalizedMessage: string;
  story: Array<{
    year: string;
    title: string;
    description: string;
    image?: string;
  }>;
  coverPhoto: string;
  coverPhotoOffset?: { x: number; y: number; zoom: number };
  logoUrl?: string;
  logoOffset?: { x: number; y: number; zoom: number };
  photoGallery: string[];
  familyPhotos: Array<{
    url: string;
    caption: string;
    side?: 'groom' | 'bride' | 'family';
  }>;

  // Extras
  bgMusicPreset: 'romantic-piano' | 'canon-d' | 'traditional-royal' | 'wedding-bells' | 'none';
  customMusicUrl?: string;
  frameStyle?: 'royal-red-filigree' | 'emerald-gold-arch' | 'golden-elegance' | 'khmer-traditional' | 'custom';
  customFrameUrl?: string;
  customOrnamentUrl?: string;
  rsvpFrameUrl?: string;
  bankFrameUrl?: string;
  hostEmail?: string;
  smtpConfig?: {
    gmailUser?: string;
    gmailAppPassword?: string;
  };
  customFrameOffset?: { x: number; y: number; zoom: number };
  galleryPhotoOffsets?: Record<number, { x: number; y: number; zoom: number }>;
  storyPhotoOffsets?: Record<number, { x: number; y: number; zoom: number }>;
  familyPhotoOffsets?: Record<number, { x: number; y: number; zoom: number }>;
  typography?: TypographySettings;
  layoutSettings?: LayoutSettings;
  bankInfo: {
    groom: BankDetails;
    bride: BankDetails;
  };

  createdAt: string;
  updatedAt: string;
  stats?: {
    rsvpCount: number;
    attendingCount: number;
    totalGuests: number;
  };
}

export interface RSVP {
  id: string;
  invitationId: string;
  guestName: string;
  phone?: string;
  status: 'attending' | 'not_attending' | 'undecided';
  accompanyCount: number;
  side: 'groom' | 'bride' | 'mutual';
  message?: string;
  guestCode?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface EmailNotificationLog {
  id: string;
  invitationId: string;
  rsvpId: string;
  toEmail: string;
  guestName: string;
  phone?: string;
  status: 'attending' | 'not_attending' | 'undecided';
  accompanyCount: number;
  side: 'groom' | 'bride' | 'mutual';
  message?: string;
  subject: string;
  deliveryMethod: string;
  previewUrl?: string;
  sentAt: string;
}

export interface PersonalizedGuest {
  id: string;
  invitationId: string;
  name: string;
  title: string;
  phone?: string;
  side: 'groom' | 'bride' | 'mutual';
  code: string;
  customGreeting?: string;
  createdAt: string;
}
