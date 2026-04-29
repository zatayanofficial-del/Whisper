/**
 * ═══════════════════════════════════════════
 * الملف 3: lib/supabase.js
 * الاتصال بقاعدة البيانات + كل عمليات API
 * ═══════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';

// ─── اتصال عام (للقراءة والنشر) ───
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── اتصال Admin (للحذف والإدارة فقط) ───
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // هذا المفتاح السري لا يُشارَك أبداً
);

// ════════════════════════════════════════════
// 📖 جلب المنشورات
// ════════════════════════════════════════════
export const getPosts = async ({ sort = 'newest', category = null, page = 0 } = {}) => {
  let query = supabase
    .from('posts')
    .select(`
      id,
      content,
      anonymous_name,
      category,
      votes_up,
      votes_down,
      comments_count,
      created_at
    `)
    .eq('is_deleted', false)
    .range(page * 20, (page + 1) * 20 - 1);

  // فلترة التصنيف
  if (category && category !== 'الكل') {
    query = query.eq('category', category);
  }

  // الترتيب
  if (sort === 'popular') {
    query = query.order('votes_up', { ascending: false });
  } else if (sort === 'rising') {
    // المنشورات الأحدث مع تفاعل جيد
    query = query
      .gte('created_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
      .order('votes_up', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new Error('فشل جلب المنشورات');
  return data;
};

// ════════════════════════════════════════════
// ✍️ نشر منشور جديد
// ════════════════════════════════════════════
export const createPost = async ({ content, category, anonymousName }) => {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content: content.trim(),
      anonymous_name: anonymousName,
      category: category || 'مشاعر',
      // لا IP، لا user_id، لا أي معلومة شخصية
    })
    .select()
    .single();

  if (error) throw new Error('فشل النشر');
  return data;
};

// ════════════════════════════════════════════
// 💬 التعليقات
// ════════════════════════════════════════════
export const getComments = async (postId) => {
  const { data, error } = await supabase
    .from('comments')
    .select('id, content, anonymous_name, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw new Error('فشل جلب التعليقات');
  return data;
};

export const addComment = async ({ postId, content, anonymousName }) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      content: content.trim(),
      anonymous_name: anonymousName,
    })
    .select()
    .single();

  if (error) throw new Error('فشل إضافة التعليق');
  return data;
};

// ════════════════════════════════════════════
// 🗳️ التصويت
// ════════════════════════════════════════════
export const votePost = async (postId, type) => {
  // type: 'up' أو 'down'
  const field = type === 'up' ? 'votes_up' : 'votes_down';

  const { error } = await supabase.rpc('increment_vote', {
    post_id: postId,
    vote_field: field,
  });

  if (error) throw new Error('فشل التصويت');
};

// ════════════════════════════════════════════
// 🚨 البلاغات
// ════════════════════════════════════════════
export const reportPost = async (postId, reason) => {
  const { error } = await supabase
    .from('reports')
    .insert({
      post_id: postId,
      reason: reason || 'محتوى مسيء',
      // لا بيانات عن من أرسل البلاغ
    });

  if (error) throw new Error('فشل إرسال البلاغ');
};

// ════════════════════════════════════════════
// 🛡️ Admin — حذف منشور
// ════════════════════════════════════════════
export const adminDeletePost = async (postId) => {
  // نستخدم soft delete (is_deleted = true) بدلاً من الحذف الفعلي
  const { error } = await supabaseAdmin
    .from('posts')
    .update({ is_deleted: true })
    .eq('id', postId);

  if (error) throw new Error('فشل الحذف');
};

// ════════════════════════════════════════════
// 🚫 Admin — الكلمات المحظورة
// ════════════════════════════════════════════
export const getBannedWords = async () => {
  const { data, error } = await supabaseAdmin
    .from('banned_words')
    .select('id, word')
    .order('added_at', { ascending: false });

  if (error) return [];
  return data;
};

export const addBannedWord = async (word) => {
  const { error } = await supabaseAdmin
    .from('banned_words')
    .insert({ word: word.trim().toLowerCase() });

  if (error) throw new Error('فشل إضافة الكلمة');
};

export const removeBannedWord = async (id) => {
  const { error } = await supabaseAdmin
    .from('banned_words')
    .delete()
    .eq('id', id);

  if (error) throw new Error('فشل حذف الكلمة');
};

// ════════════════════════════════════════════
// 📊 Admin — إحصائيات
// ════════════════════════════════════════════
export const getAdminStats = async () => {
  const [postsRes, reportsRes, commentsRes] = await Promise.all([
    supabaseAdmin.from('posts').select('id', { count: 'exact' }).eq('is_deleted', false),
    supabaseAdmin.from('reports').select('id', { count: 'exact' }).eq('reviewed', false),
    supabaseAdmin.from('comments').select('id', { count: 'exact' }),
  ]);

  return {
    totalPosts: postsRes.count || 0,
    pendingReports: reportsRes.count || 0,
    totalComments: commentsRes.count || 0,
  };
};

// ════════════════════════════════════════════
// 📋 SQL لإنشاء الجداول — انسخه في Supabase SQL Editor
// ════════════════════════════════════════════
/*
-- جدول المنشورات
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL CHECK (length(content) BETWEEN 5 AND 1000),
  anonymous_name TEXT NOT NULL,
  category TEXT DEFAULT 'مشاعر',
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول التعليقات
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) BETWEEN 2 AND 500),
  anonymous_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول البلاغات
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reason TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الكلمات المحظورة
CREATE TABLE banned_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- دالة زيادة التصويت بأمان
CREATE OR REPLACE FUNCTION increment_vote(post_id UUID, vote_field TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE posts SET %I = %I + 1 WHERE id = $1', vote_field, vote_field)
  USING post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- صلاحيات RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_posts" ON posts FOR SELECT USING (is_deleted = FALSE);
CREATE POLICY "public_insert_posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_comments" ON comments FOR SELECT USING (true);
CREATE POLICY "public_insert_comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_reports" ON reports FOR INSERT WITH CHECK (true);
*/
