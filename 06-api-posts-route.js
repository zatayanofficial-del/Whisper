/**
 * ═══════════════════════════════════════════
 * الملف 6: app/api/posts/route.js
 * API المنشورات — GET (جلب) + POST (نشر)
 * ═══════════════════════════════════════════
 */

import { createPost, getPosts } from '@/lib/supabase';
import { analyzeContent, generateAnonymousName } from '@/lib/filter';

// ════════════════════════════════════════════
// GET /api/posts — جلب المنشورات
// ════════════════════════════════════════════
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const posts = await getPosts({
      sort:     searchParams.get('sort')     || 'newest',
      category: searchParams.get('category') || null,
      page:     parseInt(searchParams.get('page') || '0'),
    });

    return Response.json(
      { posts, count: posts.length },
      {
        status: 200,
        headers: {
          // كاش 30 ثانية لتخفيف الضغط على DB
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/posts]', error.message);
    return Response.json(
      { error: 'فشل جلب المنشورات. حاول مجدداً.' },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════
// POST /api/posts — نشر منشور جديد
// ════════════════════════════════════════════
export async function POST(request) {
  try {
    const body = await request.json();
    const { content, category } = body;

    // ── فلترة المحتوى ──
    const check = analyzeContent(content || '');

    if (check.isEmpty) {
      return Response.json({ error: 'المحتوى فارغ أو قصير جداً' }, { status: 400 });
    }
    if (check.isTooLong) {
      return Response.json({ error: 'المحتوى يتجاوز 1000 حرف' }, { status: 400 });
    }
    if (check.isSpam) {
      return Response.json({ error: 'يبدو هذا المحتوى سبام' }, { status: 400 });
    }
    if (check.hasBanned) {
      return Response.json({ error: 'المحتوى يحتوي على كلمات غير مسموح بها' }, { status: 400 });
    }

    // ── توليد هوية مجهولة ──
    // يتم هنا وليس في Client لضمان التوحيد
    const anonymousName = generateAnonymousName();

    // ── حفظ في قاعدة البيانات ──
    // لاحظ: لا IP، لا معرف مستخدم، لا أي بيانات شخصية
    const post = await createPost({
      content,
      category: category || 'مشاعر',
      anonymousName,
    });

    return Response.json(
      {
        post,
        isCrisis: check.isCrisis, // نُرجع هذا للـ Frontend ليعرض بانر المساعدة
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[POST /api/posts]', error.message);
    return Response.json(
      { error: 'فشل النشر. حاول مجدداً.' },
      { status: 500 }
    );
  }
}
