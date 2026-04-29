/**
 * ═══════════════════════════════════════════
 * الملف 4: lib/filter.js
 * فلترة المحتوى + توليد الهويات المجهولة
 * ═══════════════════════════════════════════
 */

// ════════════════════════════════════════════
// 🚨 كلمات الأزمات النفسية
// تُشغّل بانر المساعدة الفورية
// ════════════════════════════════════════════
export const CRISIS_KEYWORDS = [
  // عربي
  'انتحار', 'أقتل نفسي', 'أنهي حياتي', 'أموت اليوم',
  'أريد أن أموت', 'لا أريد العيش', 'أجرح نفسي',
  'أؤذي نفسي', 'أتألم كثيراً', 'لا فائدة من الحياة',
  'سأختفي', 'لن يفتقدني أحد', 'عبء على الجميع',
  // إنجليزي
  'suicide', 'kill myself', 'end my life', 'want to die',
  'hurt myself', 'self harm', 'no reason to live',
  'cant go on', "can't go on", 'worthless',
];

// ════════════════════════════════════════════
// 🎭 توليد هوية مجهولة جميلة
// ════════════════════════════════════════════

const ADJECTIVES = [
  'هادئ', 'مفكّر', 'حالم', 'غامض', 'صامت',
  'بعيد', 'طيّب', 'حكيم', 'صادق', 'لطيف',
  'شجاع', 'وحيد', 'أمين', 'حزين', 'متأمّل',
  'باحث', 'ضائع', 'راحل', 'عائد', 'منتظر',
];

export const generateAnonymousName = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj} #${num}`;
  // مثال: "حالم #4821" أو "شجاع #7203"
};

// ════════════════════════════════════════════
// 🔍 تحليل المحتوى الكامل
// ════════════════════════════════════════════
export const analyzeContent = (text, bannedWords = []) => {
  if (!text) return { isEmpty: true };

  const lower = text.toLowerCase().trim();

  return {
    // هل الرسالة فارغة؟
    isEmpty: text.trim().length < 5,

    // هل طويلة جداً؟
    isTooLong: text.length > 1000,

    // هل تحتوي على كلمات أزمة نفسية؟
    isCrisis: CRISIS_KEYWORDS.some(w =>
      lower.includes(w.toLowerCase())
    ),

    // هل تحتوي على كلمات محظورة؟
    hasBanned: bannedWords.some(w =>
      lower.includes(w.toLowerCase())
    ),

    // هل هي سبام (تكرار حروف أو أرقام)؟
    isSpam:
      /(.)\1{8,}/.test(text) || // تكرار نفس الحرف 8+ مرات
      /^[^a-zA-Zأ-ي]+$/.test(text.trim()), // أرقام ورموز فقط

    // عدد الحروف
    charCount: text.length,

    // مستوى التحذير للون العداد
    charLevel:
      text.length > 900 ? 'danger' :
      text.length > 700 ? 'warning' : 'ok',
  };
};

// ════════════════════════════════════════════
// 🧠 رسائل دعم نفسي مخصصة
// تظهر تحت البانر عند اكتشاف أزمة
// ════════════════════════════════════════════
export const SUPPORT_MESSAGES = [
  {
    text: 'أنت لست وحدك. كثيرون يشعرون بما تشعر به الآن.',
    icon: '💙',
  },
  {
    text: 'الألم الذي تشعر به حقيقي، لكن الأمل موجود دائماً.',
    icon: '🌱',
  },
  {
    text: 'شجاعتك على الكتابة هي الخطوة الأولى نحو التعافي.',
    icon: '✨',
  },
  {
    text: 'مهما بدا الظلام عميقاً، هناك دائماً فجر قادم.',
    icon: '🌅',
  },
];

export const getRandomSupportMessage = () =>
  SUPPORT_MESSAGES[Math.floor(Math.random() * SUPPORT_MESSAGES.length)];

// ════════════════════════════════════════════
// 📞 خطوط المساعدة النفسية
// ════════════════════════════════════════════
export const CRISIS_RESOURCES = [
  {
    country: '🇸🇦 السعودية',
    name: 'مركز الدعم النفسي',
    number: '920033360',
    available: '24/7',
  },
  {
    country: '🇦🇪 الإمارات',
    name: 'خط دعم الصحة النفسية',
    number: '800HOPE (4673)',
    available: '24/7',
  },
  {
    country: '🇰🇼 الكويت',
    name: 'خط مساندة',
    number: '94006283',
    available: '24/7',
  },
  {
    country: '🌍 عالمي',
    name: 'Befrienders Worldwide',
    number: 'befrienders.org',
    available: '24/7',
    isLink: true,
  },
];

// ════════════════════════════════════════════
// 🗓️ تنسيق الوقت بالعربي
// ════════════════════════════════════════════
export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return 'الآن';
  if (mins === 1) return 'منذ دقيقة';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  if (hours === 1) return 'منذ ساعة';
  if (hours < 24) return `منذ ${hours} ساعات`;
  if (days === 1) return 'أمس';
  if (days < 7) return `منذ ${days} أيام`;
  return new Date(date).toLocaleDateString('ar-SA');
};

// ════════════════════════════════════════════
// 🔐 التحقق من كلمة مرور Admin
// ════════════════════════════════════════════
export const verifyAdminPassword = (input) => {
  const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'whispr@admin2024';
  return input === adminPass;
  // في الإنتاج: استخدم bcrypt للتشفير الحقيقي
};
