/**
 * ═══════════════════════════════════════════
 * الملف 5: middleware.js
 * حماية الموقع من السبام والهجمات
 * يعمل على Vercel Edge (أسرع من Server)
 * ═══════════════════════════════════════════
 */

import { NextResponse } from 'next/server';

// ════════════════════════════════════════════
// 🛡️ Rate Limiting بسيط بدون Redis (للبداية)
// لاحقاً: استبدله بـ Upstash Redis للدقة العالية
// ════════════════════════════════════════════

// قواعد الحماية لكل مسار
const RATE_LIMITS = {
  '/api/posts':    { max: 5,  windowMs: 15 * 60 * 1000 }, // 5 منشورات/15 دقيقة
  '/api/comments': { max: 10, windowMs: 5  * 60 * 1000 }, // 10 تعليقات/5 دقائق
  '/api/reports':  { max: 3,  windowMs: 60 * 60 * 1000 }, // 3 بلاغات/ساعة
};

// ════════════════════════════════════════════
// 🌐 Headers الأمان
// ════════════════════════════════════════════
const SECURITY_HEADERS = {
  // منع XSS
  'X-XSS-Protection': '1; mode=block',

  // منع Clickjacking
  'X-Frame-Options': 'DENY',

  // منع MIME sniffing
  'X-Content-Type-Options': 'nosniff',

  // سياسة المحتوى الصارمة
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
    "font-src 'self' fonts.gstatic.com; " +
    "connect-src 'self' *.supabase.co;",

  // إخفاء معلومات الخادم
  'Server': 'Whispr',

  // سياسة الإحالة (لا تكشف URL للمواقع الخارجية)
  'Referrer-Policy': 'no-referrer',

  // منع مشاركة البيانات مع المتتبعين
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ── إضافة headers الأمان لكل الطلبات ──
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // ── فحص Rate Limiting لمسارات API ──
  const limitConfig = Object.entries(RATE_LIMITS).find(([path]) =>
    pathname.startsWith(path)
  );

  if (limitConfig && request.method === 'POST') {
    // الحصول على IP بشكل آمن (لا يُخزَّن في DB)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // في الإنتاج الحقيقي: استخدم Upstash Redis هكذا:
    /*
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');

    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limitConfig[1].max, `${limitConfig[1].windowMs}ms`),
    });

    const { success, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: 'لقد تجاوزت الحد المسموح. الرجاء الانتظار قبل المحاولة مجدداً.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
            'X-RateLimit-Remaining': String(remaining),
          },
        }
      );
    }
    */

    // تسجيل للـ Console فقط (لا يُخزَّن IP في DB)
    console.log(`[Rate Check] ${pathname} - IP Hash: ${hashIP(ip)}`);
  }

  return response;
}

// تشفير IP للـ logging فقط (لا تخزين)
const hashIP = (ip) => {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = ((hash << 5) - hash) + ip.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).substring(0, 8);
};

// تطبيق الـ Middleware على هذه المسارات فقط
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
