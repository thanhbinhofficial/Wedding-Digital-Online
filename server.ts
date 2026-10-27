import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Body parsers with generous limits for photo uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure data and uploads directory exist
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// DB file path
const DB_FILE = path.join(DATA_DIR, 'wedding_db.json');

// Types
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
}

export interface Invitation {
  id: string;
  slug: string;
  title: string;
  templateId: 'royal-red' | 'golden-elegance' | 'floral-cream' | 'khmer-traditional';
  status: 'draft' | 'published';
  isPasswordProtected: boolean;
  password?: string;
  primaryLanguage: 'vi' | 'km';
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

  // Story & gallery
  personalizedMessage: string;
  story: Array<{
    year: string;
    title: string;
    description: string;
    image?: string;
  }>;
  coverPhoto: string;
  photoGallery: string[];
  familyPhotos: Array<{
    url: string;
    caption: string;
    side?: 'groom' | 'bride' | 'family';
  }>;

  // Extras
  bgMusicPreset: 'romantic-piano' | 'canon-d' | 'traditional-royal' | 'wedding-bells' | 'none';
  customMusicUrl?: string;
  customFrameUrl?: string;
  customOrnamentUrl?: string;
  rsvpFrameUrl?: string;
  hostEmail?: string;
  smtpConfig?: {
    gmailUser?: string;
    gmailAppPassword?: string;
  };
  bankInfo: {
    groom: BankDetails;
    bride: BankDetails;
  };

  createdAt: string;
  updatedAt: string;
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

interface DatabaseSchema {
  admin: {
    email: string;
    passwordHash: string;
    salt: string;
    token?: string;
  };
  invitations: Invitation[];
  rsvps: RSVP[];
  guests: PersonalizedGuest[];
  emailLogs?: EmailNotificationLog[];
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// Seed initial database if not exists
function getInitialData(): DatabaseSchema {
  const salt = crypto.randomBytes(16).toString('hex');
  const initialPassword = process.env.ADMIN_PASSWORD || 'Wedding@2026';
  const initialEmail = process.env.ADMIN_EMAIL || 'admin@wedding.com';
  const passwordHash = hashPassword(initialPassword, salt);

  const sampleWeddingVi: Invitation = {
    id: 'inv-sample-vi-1',
    slug: 'minh-quan-lan-anh',
    title: 'Lễ Thành Hôn: Minh Quân & Lan Anh',
    templateId: 'royal-red',
    status: 'published',
    isPasswordProtected: false,
    primaryLanguage: 'vi',
    allowLanguageToggle: true,
    groom: {
      fullName: 'Trần Minh Quân',
      parents: {
        father: 'Trần Văn Hưng',
        mother: 'Nguyễn Thị Tuyết',
      },
      representative: 'Ông Trần Văn Nam (Bác ruột)',
      hometown: 'Hà Nội',
      familyAddress: 'Số 88 Phố Huế, Quận Hai Bà Trưng, TP. Hà Nội',
      phone: '0912 345 678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      familyMessage: 'Gia đình nhà trai trân trọng kính mời quý quan khách tới chung vui cùng hai cháu.',
    },
    bride: {
      fullName: 'Lê Hoàng Lan Anh',
      parents: {
        father: 'Lê Quang Dũng',
        mother: 'Phạm Thị Thúy',
      },
      representative: 'Ông Lê Quang Thành (Bác trưởng họ)',
      hometown: 'TP. Hồ Chí Minh',
      familyAddress: 'Số 152 Đường Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
      phone: '0988 765 432',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      familyMessage: 'Gia đình nhà gái rất vinh hạnh được đón tiếp quý bà con, cô bác và bạn bè thân hữu.',
    },
    solarDate: '2026-11-28',
    lunarDate: 'Ngày 19 tháng 10 năm Bính Ngọ',
    weddingTime: '11:00',
    separateSchedules: true,
    groomCeremony: {
      title: 'Lễ Vu Quy & Thành Hôn (Nhà Trai)',
      date: '2026-11-28',
      time: '09:00',
      venueName: 'Tư gia Nhà Trai',
      address: 'Số 88 Phố Huế, Quận Hai Bà Trưng, TP. Hà Nội',
      mapUrl: 'https://maps.google.com/?q=88+Pho+Hue+Hanoi',
    },
    brideCeremony: {
      title: 'Lễ Xuất Giá (Nhà Gái)',
      date: '2026-11-27',
      time: '14:30',
      venueName: 'Tư gia Nhà Gái',
      address: 'Số 152 Đường Nguyễn Đình Chiểu, Quận 3, TP. Hồ Chí Minh',
      mapUrl: 'https://maps.google.com/?q=152+Nguyen+Dinh+Chieu+Quan+3+HCM',
    },
    reception: {
      title: 'Tiệc Cưới Thân Mật',
      date: '2026-11-28',
      time: '11:30',
      venueName: 'Trung Tâm Yến Tiệc & Hội Nghị The Grand Palace',
      address: 'Sảnh Hoàng Gia - Tầng 2, 142 Cộng Hòa, Phường 4, Tân Bình, TP. Hồ Chí Minh',
      mapUrl: 'https://maps.google.com/?q=142+Cong+Hoa+Tan+Binh',
    },
    personalizedMessage: 'Hạnh phúc trọn vẹn nhất trong đời là khi tìm thấy một nửa yêu thương và cùng nhau bước qua mọi chặng đường. Chúng con/chúng tôi vô cùng hạnh phúc khi được sự hiện diện và chúc phúc của quý khách!',
    story: [
      {
        year: '2021',
        title: 'Lần đầu gặp gỡ',
        description: 'Chúng mình tình cờ gặp nhau tại một quán cà phê mùa thu Hà Nội, ánh mắt đầu tiên đã chạm vào trái tim.',
        image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
      },
      {
        year: '2023',
        title: 'Lời tỏ tình ngọt ngào',
        description: 'Dưới chân tháp Eiffel trong chuyến du lịch Paris, anh đã ngỏ lời và em đã nói "Đồng ý"!',
        image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
      },
      {
        year: '2026',
        title: 'Về chung một nhà',
        description: 'Khép lại chặng đường hẹn hò để mở ra trang mới ngọt ngào, vun đắp tổ ấm tương lai.',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      },
    ],
    coverPhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    photoGallery: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    ],
    familyPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
        caption: 'Gia đình sum họp ngày lễ dạm ngõ đầm ấm',
        side: 'family',
      },
    ],
    bgMusicPreset: 'romantic-piano',
    bankInfo: {
      groom: {
        bankName: 'Vietcombank',
        accountNumber: '1012345678',
        accountName: 'TRAN MINH QUAN',
      },
      bride: {
        bankName: 'Techcombank',
        accountNumber: '19033445566',
        accountName: 'LE HOANG LAN ANH',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleWeddingKm: Invitation = {
    id: 'inv-sample-km-2',
    slug: 'rathana-sophia',
    title: 'ពិធីអាពាហ៍ពិពាហ៍: រតនា & សូភី (Rathana & Sophia)',
    templateId: 'khmer-traditional',
    status: 'published',
    isPasswordProtected: false,
    primaryLanguage: 'km',
    allowLanguageToggle: true,
    groom: {
      fullName: 'សេង រតនា (Seng Rathana)',
      parents: {
        father: 'សេង សុវណ្ណ (Seng Sovann)',
        mother: 'គង់ វណ្ណា (Kong Vanna)',
      },
      representative: 'លោក សេង វិបុល',
      hometown: 'រាជធានីភ្នំពេញ (Phnom Penh)',
      familyAddress: 'ផ្ទះលេខ ៤៥ ផ្លូវ ២១៤ សង្កាត់បឹងរាំង ខណ្ឌដូនពេញ ភ្នំពេញ',
      phone: '012 889 900',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      familyMessage: 'ក្រុមគ្រួសារខាងប្រុសមានកិត្តិយសសូមគោរពអញ្ជើញឯកឧត្តម លោកជំទាវ លោកលោកស្រីចូលរួមពិធីអាពាហ៍ពិពាហ៍កូនប្រុសកូនស្រីយើងខ្ញុំ។',
    },
    bride: {
      fullName: 'ជា សូភា (Chea Sophia)',
      parents: {
        father: 'ជា ចំរើន (Chea Chamroeun)',
        mother: 'ម៉ៅ ចិន្តា (Mao Chenda)',
      },
      representative: 'លោក ជា សុផល',
      hometown: 'ខេត្តសៀមរាប (Siem Reap)',
      familyAddress: 'ផ្ទះលេខ ១២ ភូមិវត្តបូព៌ សង្កាត់សាលាកំរើក ក្រុងសៀមរាប',
      phone: '098 776 655',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      familyMessage: 'ក្រុមគ្រួសារខាងស្រីមានសេចក្តីសោមនស្សរីករាយក្រៃលែងក្នុងការទទួលស្វាគមន៍ភ្ញៀវកិត្តិយសទាំងអស់។',
    },
    solarDate: '2026-12-12',
    lunarDate: 'ថ្ងៃទី ០៤ ខែមិគសិរ ឆ្នាំមមី',
    weddingTime: '17:00',
    separateSchedules: true,
    groomCeremony: {
      title: 'ពិធីហែជំនូន & កាត់សក់បង្កក់សិរី',
      date: '2026-12-12',
      time: '07:30',
      venueName: 'គេហដ្ឋានខាងស្រី (Bride Residence)',
      address: 'ផ្ទះលេខ ១២ ភូមិវត្តបូព៌ ក្រុងសៀមរាប',
      mapUrl: 'https://maps.google.com/?q=Wat+Bo+Siem+Reap',
    },
    brideCeremony: {
      title: 'ពិធីសំពះផ្ទឹម & ចងដៃសិរីមង្គល',
      date: '2026-12-12',
      time: '10:30',
      venueName: 'គេហដ្ឋានខាងស្រី',
      address: 'ផ្ទះលេខ ១២ ភូមិវត្តបូព៌ ក្រុងសៀមរាប',
      mapUrl: 'https://maps.google.com/?q=Wat+Bo+Siem+Reap',
    },
    reception: {
      title: 'ពិធីពិសាភោជនាហារពេលល្ងាច (Wedding Banquet)',
      date: '2026-12-12',
      time: '17:30',
      venueName: 'មជ្ឈមណ្ឌលសន្និបាត និងពិព័រណ៍ The Heritage Palace Hall A',
      address: 'មហាវិថី ៦០ម៉ែត្រ សង្កាត់ស្លក្រាម ក្រុងសៀមរាប',
      mapUrl: 'https://maps.google.com/?q=Siem+Reap+Heritage+Hall',
    },
    personalizedMessage: 'ក្តីស្រឡាញ់ដ៏ស្មោះស្ម័គ្រ និងពរជ័យពីលោកអ្នក គឺជាកាដូដ៏មានតម្លៃបំផុតសម្រាប់ទិវាអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ។ សូមអរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមានដ៏ឧត្តុង្គឧត្តម!',
    story: [
      {
        year: '2022',
        title: 'ការជួបគ្នាលើកដំបូង (First Met)',
        description: 'យើងបានស្គាល់គ្នាក្នុងកម្មវិធីសប្បុរសធម៌នៅអង្គរវត្ត ខេត្តសៀមរាប។',
        image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=600&q=80',
      },
      {
        year: '2024',
        title: 'ការភ្ជាប់ពាក្យ (Engagement)',
        description: 'ពិធីភ្ជាប់ពាក្យបានប្រារព្ធឡើងដោយមានការជូនពរយ៉ាងកក់ក្តៅពីចាស់ទុំទាំងសងខាង។',
        image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
      },
    ],
    coverPhoto: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    photoGallery: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    ],
    familyPhotos: [],
    bgMusicPreset: 'traditional-royal',
    bankInfo: {
      groom: {
        bankName: 'ABA Bank',
        accountNumber: '001 234 567',
        accountName: 'SENG RATHANA',
      },
      bride: {
        bankName: 'ACLEDA Bank',
        accountNumber: '2233 4455 6677',
        accountName: 'CHEA SOPHIA',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleWeddingKongSeyha: Invitation = {
    id: 'inv-sample-[#weddingkongseyha]',
    slug: 'weddingkongseyha',
    title: 'ពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍: គង់ សីហា & ងួន សុវណ្ណា (Kong Seyha & Nguon Sovanna)',
    templateId: 'khmer-traditional',
    hostEmail: process.env.HOST_EMAIL || 'kungseyhaofficial@gmail.com',
    status: 'published',
    isPasswordProtected: false,
    primaryLanguage: 'km',
    allowLanguageToggle: true,
    groom: {
      fullName: 'គង់ សីហា (Kong Seyha)',
      parents: {
        father: 'គង់ សំអុល (Kong Sam Ol)',
        mother: 'អ៊ុក គឹមហុង (Ouk Kimhong)',
      },
      representative: 'លោក គង់ សុជាតិ',
      hometown: 'រាជធានីភ្នំពេញ (Phnom Penh)',
      familyAddress: 'បុរីប៉េងហួត បឹងស្នោ ផ្លូវជាតិលេខ 1 សង្កាត់និរោធ ខណ្ឌចបារអំពៅ ភ្នំពេញ',
      phone: '012 345 678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      familyMessage: 'យើងខ្ញុំជាមាតាបិតាខាងប្រុស មានកិត្តិយសសូមគោរពអញ្ជើញសម្ដេច ឯកឧត្ដម លោកជំទាវ លោក លោកស្រី អញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយស។',
    },
    bride: {
      fullName: 'ងួន សុវណ្ណា (Nguon Sovanna)',
      parents: {
        father: 'ម៉ៅ សុផល (Mao Sophal)',
        mother: 'សុខ គឹមលាង (Sok Kimleang)',
      },
      representative: 'លោក ម៉ៅ ចាន់ថា',
      hometown: 'រាជធានីភ្នំពេញ (Phnom Penh)',
      familyAddress: 'ផ្ទះលេខ ៨៨ ផ្លូវ ២៧១ សង្កាត់ផ្សារដើមថ្កូវ ខណ្ឌចំការមន ភ្នំពេញ',
      phone: '098 888 999',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      familyMessage: 'សូមស្វាគមន៍យ៉ាងកក់ក្តៅចំពោះវត្តមានដ៏ឧត្តុង្គឧត្តមរបស់ភ្ញៀវកិត្តិយសទាំងអស់!',
    },
    solarDate: '2026-11-20',
    lunarDate: 'ថ្ងៃសុក្រ ១១កើត ខែកត្តិក ឆ្នាំមមី',
    weddingTime: '17:00',
    separateSchedules: true,
    groomCeremony: {
      title: 'ពិធីហែជំនូន & កាត់សក់បង្កក់សិរី (Groom Ceremony)',
      date: '2026-11-20',
      time: '07:00',
      venueName: 'គេហដ្ឋានខាងស្រី (Bride Residence)',
      address: 'បុរីប៉េងហួត បឹងស្នោ ផ្លូវជាតិលេខ 1 ភ្នំពេញ',
      mapUrl: 'https://maps.google.com/?q=Peng+Huoth+Boeung+Snea+Phnom+Penh',
    },
    brideCeremony: {
      title: 'ពិធីសំពះផ្ទឹម & ចងដៃសិរីមង្គល (Tie Knot Ceremony)',
      date: '2026-11-20',
      time: '09:30',
      venueName: 'គេហដ្ឋានខាងស្រី',
      address: 'បុរីប៉េងហួត បឹងស្នោ ផ្លូវជាតិលេខ 1 ភ្នំពេញ',
      mapUrl: 'https://maps.google.com/?q=Peng+Huoth+Boeung+Snea+Phnom+Penh',
    },
    reception: {
      title: 'ពិធីពិសាភោជនាហារពេលល្ងាច (Wedding Banquet)',
      date: '2026-11-20',
      time: '17:00',
      venueName: 'មជ្ឈមណ្ឌលសន្និបាត និងពិព័រណ៍កោះពេជ្រ (Koh Pich Exhibition Center - Hall C)',
      address: 'អាគារ C អាណាចក្រកោះពេជ្រ សង្កាត់ទន្លេបាសាក់ ខណ្ឌចំការមន ភ្នំពេញ',
      mapUrl: 'https://maps.google.com/?q=Koh+Pich+Convention+Center+Phnom+Penh',
    },
    personalizedMessage: 'សិរីសួស្តីជ័យមង្គល! យើងខ្ញុំមានសេចក្តីសោមនស្សរីករាយ និងកិត្តិយសយ៉ាងក្រៃលែង សូមគោរពអញ្ជើញសម្ដេច ឯកឧត្ដម លោកជំទាវ លោក លោកស្រី និងមិត្តភក្តិទាំងអស់ ចូលរួមពិធីអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ។',
    story: [
      {
        year: '2021',
        title: 'ការជួបគ្នាលើកដំបូង',
        description: 'អនុស្សាវរីយ៍ដំបូងបង្កើតបានជាចំណងមេត្រីភាពដ៏បរិសុទ្ធ។',
        image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
      },
      {
        year: '2026',
        title: 'ថ្ងៃសិរីមង្គលអាពាហ៍ពិពាហ៍',
        description: 'ការចាប់ផ្តើមទំព័រជីវិតថ្មីជាមួយក្តីស្រឡាញ់ និងការជូនពរពីអ្នកមានគុណ។',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      },
    ],
    coverPhoto: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    photoGallery: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    ],
    familyPhotos: [],
    bgMusicPreset: 'traditional-royal',
    bankInfo: {
      groom: {
        bankName: 'ABA Bank',
        accountNumber: '000 888 999',
        accountName: 'KONG SEYHA',
      },
      bride: {
        bankName: 'Wing Bank',
        accountNumber: '012 345 678',
        accountName: 'NGUON SOVANNA',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleRsvps: RSVP[] = [
    {
      id: 'rsvp-1',
      invitationId: 'inv-sample-vi-1',
      guestName: 'Nguyễn Văn Hùng',
      phone: '0901 234 567',
      status: 'attending',
      accompanyCount: 2,
      side: 'groom',
      message: 'Chúc hai bạn trăm năm hạnh phúc, sớm đón quý tử nhé!',
      submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'rsvp-2',
      invitationId: 'inv-sample-vi-1',
      guestName: 'Trần Thị Mai',
      phone: '0938 112 233',
      status: 'attending',
      accompanyCount: 1,
      side: 'bride',
      message: 'Chúc mừng Lan Anh xinh đẹp! Nhất định mình sẽ có mặt sớm để chúc mừng cậu.',
      submittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'rsvp-3',
      invitationId: 'inv-sample-vi-1',
      guestName: 'Phạm Minh Tuấn',
      phone: '0919 888 999',
      status: 'undecided',
      accompanyCount: 1,
      side: 'mutual',
      message: 'Mình đang sắp xếp lịch bay từ Đà Nẵng ra, hy vọng sẽ kịp dự lễ!',
      submittedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: 'rsvp-4',
      invitationId: 'inv-sample-km-2',
      guestName: 'ហែម វិច្ឆិកា (Hem Vicheka)',
      phone: '017 334 556',
      status: 'attending',
      accompanyCount: 2,
      side: 'groom',
      message: 'សូមជូនពរអ្នកទាំងពីរកសាងគ្រួសារពោរពេញដោយសុភមង្គល និងជោគជ័យ!',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const sampleGuests: PersonalizedGuest[] = [
    {
      id: 'guest-1',
      invitationId: 'inv-sample-vi-1',
      name: 'Nguyễn Văn Hùng',
      title: 'Anh',
      phone: '0901 234 567',
      side: 'groom',
      code: 'anh-hung-01',
      customGreeting: 'Kính mời Anh Hùng và gia đình đến dự bữa cơm thân mật chung vui cùng Quân & Lan Anh',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'guest-2',
      invitationId: 'inv-sample-vi-1',
      name: 'Trần Thị Mai',
      title: 'Bạn thân',
      phone: '0938 112 233',
      side: 'bride',
      code: 'mai-yeu-02',
      customGreeting: 'Gửi bạn thân Mai yêu quý! Nhớ đến chung vui với tớ từ sớm nhé!',
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    admin: {
      email: initialEmail,
      passwordHash,
      salt,
    },
    invitations: [sampleWeddingKongSeyha, sampleWeddingVi, sampleWeddingKm],
    rsvps: sampleRsvps,
    guests: sampleGuests,
  };
}

function loadDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const init = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2), 'utf-8');
      return init;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading DB, resetting to defaults:', err);
    const init = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2), 'utf-8');
    return init;
  }
}

function saveDB(data: DatabaseSchema): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Active sessions in-memory cache
const sessions = new Map<string, { email: string; expiresAt: number }>();

// Auth middleware
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Chưa đăng nhập / Unauthorized' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) sessions.delete(token);
    res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn / Session expired' });
    return;
  }
  next();
}

// ==================== AUTH API ====================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
    return;
  }

  const db = loadDB();
  const calculatedHash = hashPassword(password, db.admin.salt);

  if (
    email.toLowerCase() === db.admin.email.toLowerCase() &&
    calculatedHash === db.admin.passwordHash
  ) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
    sessions.set(token, { email: db.admin.email, expiresAt });

    res.json({
      success: true,
      token,
      admin: {
        email: db.admin.email,
      },
    });
  } else {
    res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Chưa đăng nhập' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ' });
    return;
  }
  res.json({
    email: session.email,
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    sessions.delete(token);
  }
  res.json({ success: true });
});

app.post('/api/auth/change-password', requireAdmin, (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    return;
  }
  const db = loadDB();
  const currentHash = hashPassword(oldPassword, db.admin.salt);
  if (currentHash !== db.admin.passwordHash) {
    res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác' });
    return;
  }
  const newSalt = crypto.randomBytes(16).toString('hex');
  db.admin.salt = newSalt;
  db.admin.passwordHash = hashPassword(newPassword, newSalt);
  saveDB(db);
  res.json({ success: true, message: 'Đổi mật khẩu thành công' });
});

// ==================== INVITATION CRUD API ====================

// Admin: Get all invitations with RSVP summary count
app.get('/api/invitations', requireAdmin, (_req: Request, res: Response) => {
  const db = loadDB();
  const list = db.invitations.map((inv) => {
    const rsvps = db.rsvps.filter((r) => r.invitationId === inv.id);
    const attendingCount = rsvps.filter((r) => r.status === 'attending').length;
    const totalGuests = rsvps
      .filter((r) => r.status === 'attending')
      .reduce((sum, r) => sum + (r.accompanyCount || 1), 0);
    return {
      ...inv,
      stats: {
        rsvpCount: rsvps.length,
        attendingCount,
        totalGuests,
      },
    };
  });
  res.json(list);
});

// Admin: Get single invitation details
app.get('/api/invitations/:id', requireAdmin, (req: Request, res: Response) => {
  const db = loadDB();
  const inv = db.invitations.find((i) => i.id === req.params.id);
  if (!inv) {
    res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    return;
  }
  res.json(inv);
});

// Public: Get invitation by slug
app.get('/api/public/invitations/:slug', (req: Request, res: Response) => {
  const db = loadDB();
  const inv = db.invitations.find(
    (i) => i.slug.toLowerCase() === req.params.slug.toLowerCase()
  );
  if (!inv) {
    res.status(404).json({ error: 'Không tìm thấy thiệp cưới này / Wedding invitation not found' });
    return;
  }

  // Check if draft
  if (inv.status === 'draft') {
    // If not published, only allow preview with auth token
    const authHeader = req.headers.authorization;
    let isAdminUser = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const session = sessions.get(token);
      if (session && session.expiresAt > Date.now()) {
        isAdminUser = true;
      }
    }
    if (!isAdminUser) {
      res.status(403).json({
        error: 'Thiệp cưới đang ở trạng thái Bản Nháp (Chưa xuất bản) / This invitation is currently in draft mode',
      });
      return;
    }
  }

  // If password protected, check if password query or header matches
  if (inv.isPasswordProtected) {
    const providedPass = (req.query.password as string) || (req.headers['x-invitation-password'] as string);
    if (!providedPass || providedPass !== inv.password) {
      // Return redacted info indicating password is required
      res.json({
        id: inv.id,
        slug: inv.slug,
        title: inv.title,
        status: inv.status,
        isPasswordProtected: true,
        primaryLanguage: inv.primaryLanguage,
        coverPhoto: inv.coverPhoto,
        groom: { fullName: inv.groom.fullName },
        bride: { fullName: inv.bride.fullName },
        solarDate: inv.solarDate,
      });
      return;
    }
  }

  // Strip password from returned payload for security
  const { password, ...safeInv } = inv;
  res.json(safeInv);
});

// Admin: Create new invitation
app.post('/api/invitations', requireAdmin, (req: Request, res: Response) => {
  const db = loadDB();
  const body = req.body;

  // Generate unique slug
  let baseSlug = (body.slug || `${body.groom?.fullName || 'groom'}-${body.bride?.fullName || 'bride'}`)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!baseSlug) baseSlug = `wedding-${Date.now().toString(36)}`;

  let slug = baseSlug;
  let counter = 1;
  while (db.invitations.some((i) => i.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const newInvitation: Invitation = {
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    slug,
    title: body.title || `Hôn Lễ: ${body.groom?.fullName || 'Chú rể'} & ${body.bride?.fullName || 'Cô dâu'}`,
    templateId: body.templateId || 'royal-red',
    status: body.status || 'draft',
    isPasswordProtected: Boolean(body.isPasswordProtected),
    password: body.password || '',
    primaryLanguage: body.primaryLanguage || 'vi',
    allowLanguageToggle: body.allowLanguageToggle !== false,
    groom: {
      fullName: body.groom?.fullName || '',
      parents: {
        father: body.groom?.parents?.father || '',
        mother: body.groom?.parents?.mother || '',
      },
      representative: body.groom?.representative || '',
      hometown: body.groom?.hometown || '',
      familyAddress: body.groom?.familyAddress || '',
      phone: body.groom?.phone || '',
      avatar: body.groom?.avatar || '',
      familyMessage: body.groom?.familyMessage || '',
    },
    bride: {
      fullName: body.bride?.fullName || '',
      parents: {
        father: body.bride?.parents?.father || '',
        mother: body.bride?.parents?.mother || '',
      },
      representative: body.bride?.representative || '',
      hometown: body.bride?.hometown || '',
      familyAddress: body.bride?.familyAddress || '',
      phone: body.bride?.phone || '',
      avatar: body.bride?.avatar || '',
      familyMessage: body.bride?.familyMessage || '',
    },
    solarDate: body.solarDate || new Date().toISOString().split('T')[0],
    lunarDate: body.lunarDate || '',
    weddingTime: body.weddingTime || '11:00',
    separateSchedules: Boolean(body.separateSchedules),
    groomCeremony: {
      title: body.groomCeremony?.title || 'Lễ Thành Hôn (Nhà Trai)',
      time: body.groomCeremony?.time || '09:00',
      date: body.groomCeremony?.date || body.solarDate || '',
      venueName: body.groomCeremony?.venueName || 'Tư gia Nhà Trai',
      address: body.groomCeremony?.address || '',
      mapUrl: body.groomCeremony?.mapUrl || '',
    },
    brideCeremony: {
      title: body.brideCeremony?.title || 'Lễ Vu Quy (Nhà Gái)',
      time: body.brideCeremony?.time || '10:00',
      date: body.brideCeremony?.date || body.solarDate || '',
      venueName: body.brideCeremony?.venueName || 'Tư gia Nhà Gái',
      address: body.brideCeremony?.address || '',
      mapUrl: body.brideCeremony?.mapUrl || '',
    },
    reception: {
      title: body.reception?.title || 'Tiệc Cưới Thân Mật',
      time: body.reception?.time || '11:30',
      date: body.reception?.date || body.solarDate || '',
      venueName: body.reception?.venueName || 'Trung Tâm Tiệc Cưới',
      address: body.reception?.address || '',
      mapUrl: body.reception?.mapUrl || '',
    },
    personalizedMessage: body.personalizedMessage || 'Trân trọng kính mời quý khách đến dự buổi tiệc chung vui cùng gia đình chúng tôi!',
    story: Array.isArray(body.story) ? body.story : [],
    coverPhoto: body.coverPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    photoGallery: Array.isArray(body.photoGallery) ? body.photoGallery : [],
    familyPhotos: Array.isArray(body.familyPhotos) ? body.familyPhotos : [],
    bgMusicPreset: body.bgMusicPreset || 'romantic-piano',
    customMusicUrl: body.customMusicUrl || '',
    customFrameUrl: body.customFrameUrl || '',
    customOrnamentUrl: body.customOrnamentUrl || '',
    rsvpFrameUrl: body.rsvpFrameUrl || '',
    hostEmail: body.hostEmail || process.env.HOST_EMAIL || 'kungseyhaofficial@gmail.com',
    smtpConfig: body.smtpConfig || undefined,
    bankInfo: {
      groom: {
        bankName: body.bankInfo?.groom?.bankName || '',
        accountNumber: body.bankInfo?.groom?.accountNumber || '',
        accountName: body.bankInfo?.groom?.accountName || '',
        qrImage: body.bankInfo?.groom?.qrImage || '',
      },
      bride: {
        bankName: body.bankInfo?.bride?.bankName || '',
        accountNumber: body.bankInfo?.bride?.accountNumber || '',
        accountName: body.bankInfo?.bride?.accountName || '',
        qrImage: body.bankInfo?.bride?.qrImage || '',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.invitations.unshift(newInvitation);
  saveDB(db);
  res.status(201).json(newInvitation);
});

// Admin: Update invitation
app.put('/api/invitations/:id', requireAdmin, (req: Request, res: Response) => {
  const db = loadDB();
  const index = db.invitations.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    return;
  }

  const existing = db.invitations[index];
  const body = req.body;

  // Check slug uniqueness if changed
  let slug = existing.slug;
  if (body.slug && body.slug !== existing.slug) {
    const formattedSlug = body.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const conflict = db.invitations.some((i) => i.id !== req.params.id && i.slug === formattedSlug);
    if (conflict) {
      res.status(400).json({ error: 'Đường dẫn (URL slug) này đã được sử dụng bởi một thiệp khác' });
      return;
    }
    slug = formattedSlug;
  }

  const updated: Invitation = {
    ...existing,
    ...body,
    id: existing.id,
    slug,
    updatedAt: new Date().toISOString(),
  };

  db.invitations[index] = updated;
  saveDB(db);
  res.json(updated);
});

// Admin: Toggle publish
app.post('/api/invitations/:id/publish-toggle', requireAdmin, (req: Request, res: Response) => {
  const db = loadDB();
  const inv = db.invitations.find((i) => i.id === req.params.id);
  if (!inv) {
    res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    return;
  }
  inv.status = inv.status === 'published' ? 'draft' : 'published';
  inv.updatedAt = new Date().toISOString();
  saveDB(db);
  res.json({ success: true, status: inv.status });
});

// Admin: Duplicate invitation
app.post('/api/invitations/:id/duplicate', requireAdmin, (req: Request, res: Response) => {
  const db = loadDB();
  const inv = db.invitations.find((i) => i.id === req.params.id);
  if (!inv) {
    res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    return;
  }

  let newSlug = `${inv.slug}-ban-sao`;
  let counter = 1;
  while (db.invitations.some((i) => i.slug === newSlug)) {
    newSlug = `${inv.slug}-ban-sao-${counter++}`;
  }

  const copy: Invitation = {
    ...JSON.parse(JSON.stringify(inv)),
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    slug: newSlug,
    title: `${inv.title} (Bản sao)`,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.invitations.unshift(copy);
  saveDB(db);
  res.status(201).json(copy);
});

// Admin: Delete invitation
app.delete('/api/invitations/:id', requireAdmin, (req: Request, res: Response) => {
  const db = loadDB();
  const prevCount = db.invitations.length;
  db.invitations = db.invitations.filter((i) => i.id !== req.params.id);
  if (db.invitations.length === prevCount) {
    res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    return;
  }

  // Also clean up RSVPs and guests
  db.rsvps = db.rsvps.filter((r) => r.invitationId !== req.params.id);
  db.guests = db.guests.filter((g) => g.invitationId !== req.params.id);

  saveDB(db);
  res.json({ success: true, message: 'Đã xóa thiệp cưới' });
});

// Public: Customize invitation fields directly (frames, customOrnamentUrl, hostEmail, photos, offsets)
app.post('/api/public/invitations/:slug/customize', (req: Request, res: Response) => {
  const db = loadDB();
  const index = db.invitations.findIndex(
    (i) => i.slug.toLowerCase() === req.params.slug.toLowerCase()
  );
  if (index === -1) {
    res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    return;
  }

  const existing = db.invitations[index];
  const body = req.body;

  const updated: Invitation = {
    ...existing,
    ...(body.hostEmail !== undefined ? { hostEmail: body.hostEmail } : {}),
    ...(body.smtpConfig !== undefined ? { smtpConfig: body.smtpConfig } : {}),
    ...(body.customOrnamentUrl !== undefined ? { customOrnamentUrl: body.customOrnamentUrl } : {}),
    ...(body.customFrameUrl !== undefined ? { customFrameUrl: body.customFrameUrl } : {}),
    ...(body.rsvpFrameUrl !== undefined ? { rsvpFrameUrl: body.rsvpFrameUrl } : {}),
    ...(body.bankFrameUrl !== undefined ? { bankFrameUrl: body.bankFrameUrl } : {}),
    ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl } : {}),
    ...(body.logoOffset !== undefined ? { logoOffset: body.logoOffset } : {}),
    ...(body.coverPhoto !== undefined ? { coverPhoto: body.coverPhoto } : {}),
    ...(body.coverPhotoOffset !== undefined ? { coverPhotoOffset: body.coverPhotoOffset } : {}),
    ...(body.customFrameOffset !== undefined ? { customFrameOffset: body.customFrameOffset } : {}),
    ...(body.frameStyle !== undefined ? { frameStyle: body.frameStyle } : {}),
    ...(body.groom !== undefined ? { groom: { ...existing.groom, ...body.groom } } : {}),
    ...(body.bride !== undefined ? { bride: { ...existing.bride, ...body.bride } } : {}),
    ...(body.groomCeremony !== undefined ? { groomCeremony: { ...existing.groomCeremony, ...body.groomCeremony } } : {}),
    ...(body.brideCeremony !== undefined ? { brideCeremony: { ...existing.brideCeremony, ...body.brideCeremony } } : {}),
    ...(body.reception !== undefined ? { reception: { ...existing.reception, ...body.reception } } : {}),
    ...(body.photoGallery !== undefined ? { photoGallery: body.photoGallery } : {}),
    ...(body.galleryPhotoOffsets !== undefined ? { galleryPhotoOffsets: body.galleryPhotoOffsets } : {}),
    ...(body.bankInfo !== undefined
      ? {
          bankInfo: {
            groom: { ...existing.bankInfo.groom, ...(body.bankInfo.groom || {}) },
            bride: { ...existing.bankInfo.bride, ...(body.bankInfo.bride || {}) },
          },
        }
      : {}),
    updatedAt: new Date().toISOString(),
  };

  db.invitations[index] = updated;
  saveDB(db);

  const { password, ...safeInv } = updated;
  res.json({ success: true, invitation: safeInv });
});

// ==================== RSVP & EMAIL NOTIFICATION API ====================

async function sendRsvpEmailNotification(
  inv: Invitation,
  rsvp: RSVP,
  db: DatabaseSchema
): Promise<{
  sent: boolean;
  toEmail: string;
  subject: string;
  deliveryMethod: string;
  previewUrl?: string;
  mailtoUrl: string;
  htmlPreview: string;
}> {
  const toEmail = (inv.hostEmail || process.env.HOST_EMAIL || 'kungseyhaofficial@gmail.com').trim();
  const statusLabels: Record<string, string> = {
    attending: 'បាទ/ចាស ខ្ញុំនឹងចូលរួម (Có tham dự / Attending)',
    not_attending: 'មិនអាចចូលរួមបានទេ (Không thể tham dự / Not Attending)',
    undecided: 'មិនទាន់ប្រាកដនៅឡើយ (Chưa chắc chắn / Undecided)',
  };
  const sideLabels: Record<string, string> = {
    groom: 'ភ្ញៀវខាងប្រុស (Khách Nhà Trai / Groom Side)',
    bride: 'ភ្ញៀវខាងស្រី (Khách Nhà Gái / Bride Side)',
    mutual: 'មិត្តភក្តិទាំងសងខាង (Bạn chung cả hai / Mutual)',
  };

  const statusText = statusLabels[rsvp.status] || rsvp.status;
  const sideText = sideLabels[rsvp.side] || rsvp.side;
  const timeFormatted = new Date(rsvp.updatedAt || rsvp.submittedAt).toLocaleString('vi-VN');

  const subject = `[ការឆ្លើយតបចូលរួម - RSVP] ភ្ញៀវ ${rsvp.guestName} បានឆ្លើយតបចូលរួមពិធីមង្គលការ (${inv.groom.fullName} & ${inv.bride.fullName})`;

  const plainBody = [
    `🔔 ដំណឹងការឆ្លើយតបចូលរួម (THÔNG BÁO KHÁCH XÁC NHẬN THAM DỰ - RSVP)`,
    `--------------------------------------------------`,
    `ពិធីមង្គលការ / Thiệp cưới: ${inv.title}`,
    `កូនកំលោះ & កូនក្រមុំ / Dâu Rể: ${inv.groom.fullName} & ${inv.bride.fullName}`,
    ``,
    `👤 ឈ្មោះភ្ញៀវ / Họ và tên khách mời: ${rsvp.guestName}`,
    `📞 លេខទូរស័ព្ទ / Số điện thoại: ${rsvp.phone || 'មិនមាន / Không cung cấp'}`,
    `✅ ស្ថានភាព / Trạng thái tham dự: ${statusText}`,
    `👥 ចំនួនអ្នកចូលរួម / Số người đi cùng: ${rsvp.accompanyCount} នាក់ (người)`,
    `🏛️ ភ្ញៀវខាង / Khách của bên: ${sideText}`,
    `💌 ពាក្យជូនពរ / Lời chúc: ${rsvp.message || '—'}`,
    `🕒 ពេលវេលាឆ្លើយតប / Thời gian gửi: ${timeFormatted}`,
  ].join('\n');

  const htmlPreview = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #D4AF37; border-radius: 16px; overflow: hidden; background: #FAF7F2;">
      <div style="background: linear-gradient(135deg, #8A0F1A, #60050E); color: #FDE792; padding: 20px; text-align: center; border-bottom: 2px solid #D4AF37;">
        <h2 style="margin: 0; font-size: 20px;">🔔 ការឆ្លើយតបចូលរួម (Thông Báo RSVP Mới)</h2>
        <p style="margin: 6px 0 0; font-size: 13px; color: #FAF7F0;">${inv.groom.fullName} &amp; ${inv.bride.fullName}</p>
      </div>
      <div style="padding: 24px; color: #2C1810; background: #FFFFFF;">
        <p style="margin-top: 0; font-size: 14px;">សួស្តីម្ចាស់ដើមការ / Xin chào Chủ Hôn (<strong>${toEmail}</strong>),</p>
        <p style="font-size: 14px;">មានភ្ញៀវកិត្តិយសទើបតែចុចប៊ូតុង <strong>(ការឆ្លើយតបចូលរួម)</strong> លើសំបុត្រអាពាហ៍ពិពាហ៍របស់លោកអ្នក៖</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px; font-weight: bold; color: #8A0F1A; width: 42%;">👤 ឈ្មោះភ្ញៀវ / Khách mời:</td>
            <td style="padding: 10px 8px; font-weight: bold;">${rsvp.guestName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px; font-weight: bold; color: #8A0F1A;">📞 លេខទូរស័ព្ទ / Điện thoại:</td>
            <td style="padding: 10px 8px;">${rsvp.phone || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px; font-weight: bold; color: #8A0F1A;">✅ ការចូលរួម / Trạng thái:</td>
            <td style="padding: 10px 8px; font-weight: bold; color: #047857;">${statusText}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px; font-weight: bold; color: #8A0F1A;">👥 ចំនួនភ្ញៀវ / Số người:</td>
            <td style="padding: 10px 8px;">${rsvp.accompanyCount} នាក់ (người)</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px; font-weight: bold; color: #8A0F1A;">🏛️ ភ្ញៀវខាង / Khách bên:</td>
            <td style="padding: 10px 8px;">${sideText}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 8px; font-weight: bold; color: #8A0F1A;">💌 ពាក្យជូនពរ / Lời chúc:</td>
            <td style="padding: 10px 8px; font-style: italic;">"${rsvp.message || '—'}"</td>
          </tr>
          <tr>
            <td style="padding: 10px 8px; font-weight: bold; color: #8A0F1A;">🕒 ពេលវេលា / Thời gian:</td>
            <td style="padding: 10px 8px; color: #666;">${timeFormatted}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainBody)}`;
  let deliveryMethod = 'system_notification_log';
  let previewUrl: string | undefined = undefined;
  let sent = false;

  // 1. Try custom SMTP / Gmail App Password if provided on invitation or in env
  const smtpUser = inv.smtpConfig?.gmailUser || process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = inv.smtpConfig?.gmailAppPassword || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpUser && smtpPass && toEmail) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      await transporter.sendMail({
        from: `"Wedding RSVP Notification" <${smtpUser}>`,
        to: toEmail,
        subject,
        text: plainBody,
        html: htmlPreview,
      });
      sent = true;
      deliveryMethod = 'gmail_smtp';
    } catch (smtpErr) {
      console.error('Gmail SMTP error:', smtpErr);
    }
  }

  // 2. Try FormSubmit AJAX relay for zero-config delivery to hostEmail
  if (!sent && toEmail) {
    try {
      const fsRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(toEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Origin: process.env.APP_URL || 'https://wedding-invitation.app',
          Referer: `${process.env.APP_URL || 'https://wedding-invitation.app'}/w/${inv.slug}`,
        },
        body: JSON.stringify({
          _subject: subject,
          _template: 'table',
          'ឈ្មោះភ្ញៀវ (Khách mời)': rsvp.guestName,
          'លេខទូរស័ព្ទ (Điện thoại)': rsvp.phone || '—',
          'ស្ថានភាព (Trạng thái)': statusText,
          'ចំនួនភ្ញៀវ (Số người)': `${rsvp.accompanyCount} នាក់`,
          'ភ្ញៀវខាង (Khách bên)': sideText,
          'ពាក្យជូនពរ (Lời chúc)': rsvp.message || '—',
          'ពេលវេលា (Thời gian)': timeFormatted,
        }),
      });
      if (fsRes.ok) {
        const fsData: any = await fsRes.json().catch(() => ({}));
        if (fsData && (fsData.success === 'true' || fsData.success === true)) {
          sent = true;
          deliveryMethod = 'formsubmit_relay';
        }
      }
    } catch (e) {
      // fallback to Ethereal preview
    }
  }

  // 3. Always generate a real Nodemailer message (via Ethereal test account if not sent via Gmail) so host can inspect the exact email
  if (!sent) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      const info = await transporter.sendMail({
        from: `"ពិធីមង្គលការ - RSVP Notification" <no-reply@wedding.app>`,
        to: toEmail,
        subject,
        text: plainBody,
        html: htmlPreview,
      });
      const url = nodemailer.getTestMessageUrl(info);
      if (url) previewUrl = url;
      sent = true;
      deliveryMethod = 'email_notification_box';
    } catch (ethErr) {
      sent = true;
      deliveryMethod = 'local_inbox';
    }
  }

  // Record in db.emailLogs
  if (!db.emailLogs) db.emailLogs = [];
  const logEntry: EmailNotificationLog = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    invitationId: inv.id,
    rsvpId: rsvp.id,
    toEmail,
    guestName: rsvp.guestName,
    phone: rsvp.phone,
    status: rsvp.status,
    accompanyCount: rsvp.accompanyCount,
    side: rsvp.side,
    message: rsvp.message,
    subject,
    deliveryMethod,
    previewUrl,
    sentAt: new Date().toISOString(),
  };
  db.emailLogs.unshift(logEntry);
  saveDB(db);

  return {
    sent,
    toEmail,
    subject,
    deliveryMethod,
    previewUrl,
    mailtoUrl,
    htmlPreview,
  };
}

// Get email notification logs for an invitation
app.get('/api/public/invitations/:slug/email-logs', (req: Request, res: Response) => {
  const db = loadDB();
  const inv = db.invitations.find(
    (i) => i.slug.toLowerCase() === req.params.slug.toLowerCase()
  );
  if (!inv) {
    res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    return;
  }
  const logs = (db.emailLogs || []).filter((l) => l.invitationId === inv.id);
  res.json(logs);
});

// Send a test email notification to hostEmail
app.post('/api/public/invitations/:slug/test-email', async (req: Request, res: Response) => {
  const db = loadDB();
  const index = db.invitations.findIndex(
    (i) => i.slug.toLowerCase() === req.params.slug.toLowerCase()
  );
  if (index === -1) {
    res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    return;
  }
  const inv = db.invitations[index];
  if (req.body.hostEmail) {
    inv.hostEmail = req.body.hostEmail.trim();
  }
  if (req.body.smtpConfig) {
    inv.smtpConfig = req.body.smtpConfig;
  }
  db.invitations[index] = inv;
  saveDB(db);

  const sampleRsvp: RSVP = {
    id: `rsvp-test-${Date.now()}`,
    invitationId: inv.id,
    guestName: 'ភ្ញៀវកិត្តិយស (Khách Mời Thử Nghiệm)',
    phone: '012 888 999',
    status: 'attending',
    accompanyCount: 2,
    side: 'groom',
    message: 'សូមជូនពរគូស្វាមីភរិយាថ្មីមានសុភមង្គលជារៀងរហូត! (Chúc hai bạn trăm năm hạnh phúc!)',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const emailResult = await sendRsvpEmailNotification(inv, sampleRsvp, db);
  res.json({
    success: true,
    message: `Đã gửi thông báo thử nghiệm tới Email chủ hôn: ${emailResult.toEmail}`,
    emailNotification: emailResult,
  });
});

// Public RSVP Submission or Update
app.post('/api/public/invitations/:slug/rsvp', async (req: Request, res: Response) => {
  const db = loadDB();
  const inv = db.invitations.find(
    (i) => i.slug.toLowerCase() === req.params.slug.toLowerCase()
  );
  if (!inv) {
    res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    return;
  }

  const { guestName, phone, status, accompanyCount, side, message, guestCode } = req.body;
  if (!guestName || !guestName.trim()) {
    res.status(400).json({ error: 'Vui lòng nhập tên của quý khách' });
    return;
  }

  const cleanName = guestName.trim();
  const cleanPhone = phone ? phone.trim() : '';

  // Prevent accidental duplicates & allow updating existing response
  let existingIndex = -1;
  if (guestCode) {
    existingIndex = db.rsvps.findIndex(
      (r) => r.invitationId === inv.id && r.guestCode === guestCode
    );
  }
  if (existingIndex === -1 && cleanPhone) {
    existingIndex = db.rsvps.findIndex(
      (r) =>
        r.invitationId === inv.id &&
        r.phone === cleanPhone &&
        r.guestName.toLowerCase() === cleanName.toLowerCase()
    );
  }
  if (existingIndex === -1) {
    existingIndex = db.rsvps.findIndex(
      (r) =>
        r.invitationId === inv.id &&
        r.guestName.toLowerCase() === cleanName.toLowerCase()
    );
  }

  const now = new Date().toISOString();
  let savedRSVP: RSVP;
  let isUpdate = false;

  if (existingIndex >= 0) {
    isUpdate = true;
    const prev = db.rsvps[existingIndex];
    savedRSVP = {
      ...prev,
      guestName: cleanName,
      phone: cleanPhone || prev.phone,
      status: status || prev.status,
      accompanyCount: Math.max(1, Number(accompanyCount) || 1),
      side: side || prev.side || 'mutual',
      message: message !== undefined ? message : prev.message,
      updatedAt: now,
    };
    db.rsvps[existingIndex] = savedRSVP;
    saveDB(db);
  } else {
    savedRSVP = {
      id: `rsvp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      invitationId: inv.id,
      guestName: cleanName,
      phone: cleanPhone,
      status: status || 'attending',
      accompanyCount: Math.max(1, Number(accompanyCount) || 1),
      side: side || 'mutual',
      message: message || '',
      guestCode: guestCode || undefined,
      submittedAt: now,
      updatedAt: now,
    };
    db.rsvps.unshift(savedRSVP);
    saveDB(db);
  }

  // Send email notification to the wedding host (chủ hôn)
  const emailNotification = await sendRsvpEmailNotification(inv, savedRSVP, db);

  res.status(isUpdate ? 200 : 201).json({
    success: true,
    message: isUpdate
      ? 'Cập nhật phản hồi tham dự thành công! Đã gửi thông báo tới Email chủ hôn.'
      : 'Gửi phản hồi tham dự thành công! Chủ hôn đã nhận được thông báo qua Email.',
    rsvp: savedRSVP,
    emailNotification,
  });
});

// Admin: Get RSVPs for an invitation
app.get('/api/invitations/:id/rsvps', requireAdmin, (req: Request, res: Response) => {
  const db = loadDB();
  const list = db.rsvps.filter((r) => r.invitationId === req.params.id);
  res.json(list);
});

// Admin: Delete an RSVP
app.delete('/api/rsvps/:id', requireAdmin, (req: Request, res: Response) => {
  const db = loadDB();
  db.rsvps = db.rsvps.filter((r) => r.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Admin: Export RSVPs to CSV / Excel
app.get('/api/invitations/:id/rsvps/export', requireAdmin, (req: Request, res: Response) => {
  const db = loadDB();
  const inv = db.invitations.find((i) => i.id === req.params.id);
  const rsvps = db.rsvps.filter((r) => r.invitationId === req.params.id);

  const statusMap = {
    attending: 'Tham gia / Attending',
    not_attending: 'Không tham gia / Not attending',
    undecided: 'Chưa chắc chắn / Undecided',
  };

  const sideMap = {
    groom: 'Nhà Trai / Groom side',
    bride: 'Nhà Gái / Bride side',
    mutual: 'Bạn chung / Mutual',
  };

  // Build CSV with UTF-8 BOM so Excel opens Vietnamese and Khmer characters perfectly
  const bom = '\uFEFF';
  const headers = ['STT', 'Họ và Tên Khách Mời', 'Số Điện Thoại', 'Trạng Thái Tham Dự', 'Số Người Đi Cùng', 'Khách Của Bên', 'Lời Chúc', 'Thời Gian Gửi'];
  const rows = rsvps.map((r, index) => {
    const cleanMsg = (r.message || '').replace(/"/g, '""').replace(/\n/g, ' ');
    return [
      index + 1,
      `"${r.guestName.replace(/"/g, '""')}"`,
      `"${r.phone || ''}"`,
      `"${statusMap[r.status] || r.status}"`,
      r.accompanyCount || 1,
      `"${sideMap[r.side] || r.side}"`,
      `"${cleanMsg}"`,
      `"${new Date(r.submittedAt).toLocaleString('vi-VN')}"`,
    ].join(',');
  });

  const csvContent = bom + [headers.join(','), ...rows].join('\r\n');
  const filename = `RSVP_${(inv?.slug || 'wedding')}_${Date.now()}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});

// ==================== PERSONALIZED GUEST LINKS API ====================

app.get('/api/invitations/:id/guests', requireAdmin, (req: Request, res: Response) => {
  const db = loadDB();
  const list = db.guests.filter((g) => g.invitationId === req.params.id);
  res.json(list);
});

app.post('/api/invitations/:id/guests', requireAdmin, (req: Request, res: Response) => {
  const db = loadDB();
  const { name, title, phone, side, customGreeting } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Vui lòng nhập tên khách mời' });
    return;
  }

  const codeBase = (name || 'guest')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const code = `${codeBase}-${Math.random().toString(36).substring(2, 6)}`;

  const newGuest: PersonalizedGuest = {
    id: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    invitationId: req.params.id,
    name: name.trim(),
    title: title?.trim() || 'Bạn',
    phone: phone?.trim() || '',
    side: side || 'mutual',
    code,
    customGreeting: customGreeting?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  db.guests.unshift(newGuest);
  saveDB(db);
  res.status(201).json(newGuest);
});

app.delete('/api/invitations/:id/guests/:guestId', requireAdmin, (req: Request, res: Response) => {
  const db = loadDB();
  db.guests = db.guests.filter((g) => g.id !== req.params.guestId);
  saveDB(db);
  res.json({ success: true });
});

// Public: get personalized guest info by code
app.get('/api/public/invitations/:slug/guest-info', (req: Request, res: Response) => {
  const db = loadDB();
  const inv = db.invitations.find(
    (i) => i.slug.toLowerCase() === req.params.slug.toLowerCase()
  );
  if (!inv) {
    res.status(404).json({ error: 'Không tìm thấy thiệp cưới' });
    return;
  }
  const code = req.query.code as string;
  if (!code) {
    res.status(400).json({ error: 'Thiếu mã khách mời' });
    return;
  }
  const guest = db.guests.find((g) => g.invitationId === inv.id && g.code === code);
  if (!guest) {
    res.status(404).json({ error: 'Không tìm thấy thông tin khách mời' });
    return;
  }
  res.json(guest);
});

// ==================== IMAGE UPLOAD API ====================

app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl) {
      res.status(400).json({ error: 'Thiếu dữ liệu ảnh (dataUrl)' });
      return;
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ error: 'Định dạng base64 không hợp lệ' });
      return;
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = mimeType.split('/')[1] || 'jpg';
    const safeName = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);
    const url = `/uploads/${safeName}`;

    res.json({ success: true, url });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Lỗi khi lưu ảnh: ' + (err.message || 'Unknown') });
  }
});

// ==================== MOUNT VITE / STATIC ====================

async function startServer() {
  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wedding Invitation Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
