/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║                    W H I S P R                           ║
 * ║         Anonymous Social Platform - Full Stack           ║
 * ║  Stack: React (Frontend) + Supabase (Backend/DB)         ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * هذا الملف يحتوي على النسخة التجريبية الكاملة (Demo)
 * تعمل بدون backend حقيقي لعرض الواجهة والمنطق
 * راجع قسم "طريقة التشغيل" في نهاية الملف
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════
// 🔒 نظام الفلترة والأمان
// ═══════════════════════════════════════════════

/** كلمات تستدعي التدخل الفوري (self-harm, violence) */
const CRISIS_KEYWORDS = [
  "انتحار", "أقتل نفسي", "أموت", "أنهي حياتي",
  "suicide", "kill myself", "end my life", "self harm",
  "أؤذي نفسي", "جرح نفسي"
];

/** كلمات محظورة تُحذف تلقائياً */
const BANNED_WORDS = [
  "كلمة1", "كلمة2", // أضف الكلمات المحظورة هنا
];

/** فحص النص قبل النشر */
const analyzeContent = (text) => {
  const lower = text.toLowerCase();
  const isCrisis = CRISIS_KEYWORDS.some(w => lower.includes(w.toLowerCase()));
  const hasBanned = BANNED_WORDS.some(w => lower.includes(w.toLowerCase()));
  const isEmpty = text.trim().length < 5;
  const isTooLong = text.length > 1000;
  return { isCrisis, hasBanned, isEmpty, isTooLong };
};

// ═══════════════════════════════════════════════
// 🎭 توليد هوية مجهولة
// ═══════════════════════════════════════════════

/** توليد رقم عشوائي للهوية المجهولة */
const generateAnonymousId = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  const adjectives = ["هادئ", "مفكر", "حالم", "غامض", "صامت", "بعيد"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  return `${adj} #${num}`;
};

// ═══════════════════════════════════════════════
// 📊 بيانات تجريبية (سيتم استبدالها بـ Supabase)
// ═══════════════════════════════════════════════

const DEMO_POSTS = [
  {
    id: "1",
    content: "أحياناً أشعر أن أحداً لا يفهمني حقاً، حتى أقرب الناس إليّ. أتمنى لو كان هناك من يسمع دون أن يحكم.",
    author: "غامض #4821",
    timestamp: new Date(Date.now() - 3600000),
    votes: { up: 234, down: 12 },
    comments: 18,
    category: "مشاعر",
    userVote: null,
  },
  {
    id: "2",
    content: "فشلت في امتحان التخرج للمرة الثالثة. لا أعرف ماذا أقول لعائلتي. الخجل يأكلني من الداخل.",
    author: "صامت #7103",
    timestamp: new Date(Date.now() - 7200000),
    votes: { up: 189, down: 5 },
    comments: 42,
    category: "ضغوط",
    userVote: null,
  },
  {
    id: "3",
    content: "اكتشفت اليوم أن صديقي المقرب كان يكذب عليّ طوال سنتين. لا أعرف كيف أثق في أي أحد بعد الآن.",
    author: "بعيد #2956",
    timestamp: new Date(Date.now() - 10800000),
    votes: { up: 312, down: 8 },
    comments: 67,
    category: "علاقات",
    userVote: null,
  },
  {
    id: "4",
    content: "أشعر بالوحدة الشديدة رغم أنني محاط بناس كثيرين. الوحدة ليست غياب الناس، بل غياب من يفهمك.",
    author: "حالم #5544",
    timestamp: new Date(Date.now() - 18000000),
    votes: { up: 445, down: 3 },
    comments: 89,
    category: "مشاعر",
    userVote: null,
  },
];

// ═══════════════════════════════════════════════
// 🎨 CSS كامل مضمّن
// ═══════════════════════════════════════════════

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@300;400&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg-primary: #0a0a0f;
      --bg-secondary: #111118;
      --bg-card: #16161f;
      --bg-card-hover: #1c1c28;
      --border: #2a2a3a;
      --border-bright: #3a3a55;
      --accent: #7c6af7;
      --accent-soft: #5b4fd4;
      --accent-glow: rgba(124, 106, 247, 0.15);
      --text-primary: #e8e8f0;
      --text-secondary: #9090a8;
      --text-muted: #55556a;
      --success: #4ade80;
      --danger: #f87171;
      --warning: #fbbf24;
      --crisis: #ff6b6b;
      --up-vote: #4ade80;
      --down-vote: #f87171;
      --radius: 16px;
      --radius-sm: 10px;
      --shadow: 0 4px 24px rgba(0,0,0,0.4);
      --shadow-accent: 0 0 40px rgba(124, 106, 247, 0.1);
      font-family: 'Noto Naskh Arabic', serif;
    }

    html { direction: rtl; scroll-behavior: smooth; }

    body {
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.7;
      overflow-x: hidden;
    }

    /* خلفية نجوم */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(124,106,247,0.04) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(91,79,212,0.03) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    /* ─── Layout ─── */
    .app { position: relative; z-index: 1; }

    .container {
      max-width: 680px;
      margin: 0 auto;
      padding: 0 16px;
    }

    /* ─── Header ─── */
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10, 10, 15, 0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      padding: 14px 0;
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary);
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--accent), var(--accent-soft));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 0 20px var(--accent-glow);
    }

    .logo-text {
      font-size: 22px;
      font-weight: 700;
      font-family: 'IBM Plex Mono', monospace;
      letter-spacing: -1px;
    }

    .logo-text span { color: var(--accent); }

    .header-badge {
      font-size: 11px;
      color: var(--text-muted);
      background: var(--bg-card);
      border: 1px solid var(--border);
      padding: 4px 10px;
      border-radius: 20px;
      font-family: 'IBM Plex Mono', monospace;
    }

    /* ─── Compose Box ─── */
    .compose-section {
      padding: 24px 0 8px;
    }

    .compose-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      transition: border-color 0.2s;
    }

    .compose-card:focus-within {
      border-color: var(--accent);
      box-shadow: var(--shadow-accent);
    }

    .compose-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    .anon-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2a2a3a, #1a1a28);
      border: 1px solid var(--border-bright);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .compose-label {
      font-size: 13px;
      color: var(--text-muted);
    }

    .compose-label strong {
      display: block;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .compose-textarea {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: 15px;
      font-family: 'Noto Naskh Arabic', serif;
      resize: none;
      line-height: 1.8;
      min-height: 100px;
      direction: rtl;
    }

    .compose-textarea::placeholder { color: var(--text-muted); }

    .compose-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
    }

    .char-count {
      font-size: 12px;
      font-family: 'IBM Plex Mono', monospace;
      color: var(--text-muted);
    }

    .char-count.warning { color: var(--warning); }
    .char-count.danger { color: var(--danger); }

    .category-select {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 13px;
      font-family: 'Noto Naskh Arabic', serif;
      cursor: pointer;
    }

    .submit-btn {
      background: linear-gradient(135deg, var(--accent), var(--accent-soft));
      color: white;
      border: none;
      padding: 10px 22px;
      border-radius: 10px;
      font-size: 14px;
      font-family: 'Noto Naskh Arabic', serif;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 15px var(--accent-glow);
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(124, 106, 247, 0.3);
    }

    .submit-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* ─── Crisis Banner ─── */
    .crisis-banner {
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.3);
      border-radius: var(--radius-sm);
      padding: 14px 16px;
      margin-top: 12px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      animation: fadeIn 0.3s ease;
    }

    .crisis-banner .icon { font-size: 20px; flex-shrink: 0; }

    .crisis-banner p {
      font-size: 14px;
      color: var(--crisis);
      line-height: 1.7;
    }

    .crisis-banner a {
      color: var(--crisis);
      font-weight: 600;
      text-decoration: underline;
    }

    /* ─── Filters ─── */
    .filters {
      display: flex;
      gap: 8px;
      padding: 16px 0;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .filter-btn {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-family: 'Noto Naskh Arabic', serif;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .filter-btn:hover,
    .filter-btn.active {
      background: var(--accent-glow);
      border-color: var(--accent);
      color: var(--accent);
    }

    /* ─── Post Card ─── */
    .posts-feed {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-bottom: 40px;
    }

    .post-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      transition: all 0.2s;
      cursor: pointer;
      animation: slideIn 0.3s ease;
    }

    .post-card:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-bright);
      transform: translateY(-1px);
      box-shadow: var(--shadow);
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .post-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .post-author {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .post-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2a2a45, #1e1e35);
      border: 1px solid var(--border-bright);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
    }

    .author-name {
      font-size: 13px;
      color: var(--text-secondary);
      font-family: 'IBM Plex Mono', monospace;
    }

    .post-time {
      font-size: 12px;
      color: var(--text-muted);
      font-family: 'IBM Plex Mono', monospace;
    }

    .category-tag {
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 12px;
      background: rgba(124, 106, 247, 0.1);
      color: var(--accent);
      border: 1px solid rgba(124, 106, 247, 0.2);
    }

    .post-content {
      font-size: 15px;
      line-height: 1.85;
      color: var(--text-primary);
      margin-bottom: 16px;
    }

    .post-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .vote-group {
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 4px;
    }

    .vote-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      background: transparent;
      border: none;
      padding: 5px 10px;
      border-radius: 16px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
      color: var(--text-secondary);
      font-family: 'IBM Plex Mono', monospace;
    }

    .vote-btn:hover { background: var(--bg-card); }

    .vote-btn.up.active {
      background: rgba(74, 222, 128, 0.1);
      color: var(--up-vote);
    }

    .vote-btn.down.active {
      background: rgba(248, 113, 113, 0.1);
      color: var(--down-vote);
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 13px;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
      transition: all 0.15s;
      font-family: 'Noto Naskh Arabic', serif;
    }

    .action-btn:hover { color: var(--text-secondary); background: var(--bg-secondary); }

    .report-btn:hover { color: var(--danger); }

    /* ─── Post Modal ─── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      z-index: 200;
      display: flex;
      align-items: flex-end;
      animation: fadeIn 0.2s ease;
    }

    .modal-sheet {
      background: var(--bg-secondary);
      border-top: 1px solid var(--border);
      border-radius: 24px 24px 0 0;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      padding: 20px;
      animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .modal-handle {
      width: 40px;
      height: 4px;
      background: var(--border-bright);
      border-radius: 2px;
      margin: 0 auto 20px;
    }

    .modal-close {
      float: left;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
    }

    .comments-list {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .comment-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 14px;
    }

    .comment-author {
      font-size: 12px;
      color: var(--text-muted);
      font-family: 'IBM Plex Mono', monospace;
      margin-bottom: 8px;
    }

    .comment-text {
      font-size: 14px;
      color: var(--text-primary);
      line-height: 1.7;
    }

    .comment-compose {
      margin-top: 16px;
      display: flex;
      gap: 10px;
      align-items: flex-end;
    }

    .comment-input {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: var(--text-primary);
      font-size: 14px;
      font-family: 'Noto Naskh Arabic', serif;
      resize: none;
      outline: none;
      direction: rtl;
    }

    .comment-input:focus { border-color: var(--accent); }

    .comment-submit {
      background: var(--accent);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 16px;
      flex-shrink: 0;
      transition: background 0.2s;
    }

    .comment-submit:hover { background: var(--accent-soft); }

    /* ─── Admin Panel ─── */
    .admin-overlay {
      position: fixed;
      inset: 0;
      background: #050508;
      z-index: 500;
      overflow-y: auto;
    }

    .admin-login {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .admin-login-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 32px;
      width: 100%;
      max-width: 360px;
    }

    .admin-title {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 18px;
      color: var(--accent);
      margin-bottom: 6px;
    }

    .admin-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 24px;
    }

    .admin-input {
      width: 100%;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      color: var(--text-primary);
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 15px;
      outline: none;
      margin-bottom: 12px;
      font-family: 'IBM Plex Mono', monospace;
      letter-spacing: 2px;
      direction: ltr;
    }

    .admin-input:focus { border-color: var(--accent); }

    .admin-btn {
      width: 100%;
      background: var(--accent);
      border: none;
      color: white;
      padding: 12px;
      border-radius: 10px;
      font-size: 15px;
      font-family: 'Noto Naskh Arabic', serif;
      font-weight: 600;
      cursor: pointer;
    }

    .admin-panel {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .admin-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }

    .admin-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 16px;
      text-align: center;
    }

    .stat-num {
      font-size: 28px;
      font-weight: 700;
      font-family: 'IBM Plex Mono', monospace;
      color: var(--accent);
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .admin-posts {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .admin-post-item {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 14px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .admin-post-text {
      flex: 1;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .delete-btn {
      background: rgba(248, 113, 113, 0.1);
      border: 1px solid rgba(248, 113, 113, 0.3);
      color: var(--danger);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .delete-btn:hover { background: rgba(248, 113, 113, 0.2); }

    .section-title {
      font-size: 16px;
      color: var(--text-secondary);
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }

    /* ─── Toast ─── */
    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-card);
      border: 1px solid var(--border-bright);
      color: var(--text-primary);
      padding: 12px 20px;
      border-radius: 20px;
      font-size: 14px;
      z-index: 1000;
      animation: toastIn 0.3s ease;
      white-space: nowrap;
      box-shadow: var(--shadow);
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateX(-50%) translateY(20px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    /* ─── Privacy Notice ─── */
    .privacy-bar {
      background: rgba(124, 106, 247, 0.05);
      border-top: 1px solid var(--border);
      padding: 10px 0;
      text-align: center;
    }

    .privacy-text {
      font-size: 12px;
      color: var(--text-muted);
      font-family: 'IBM Plex Mono', monospace;
    }

    .privacy-text span { color: var(--accent); }

    /* ─── Empty State ─── */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-icon { font-size: 48px; margin-bottom: 16px; }

    .empty-text {
      font-size: 16px;
      color: var(--text-muted);
    }

    /* ─── Scrollbar ─── */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 2px; }

    /* ─── Mobile ─── */
    @media (max-width: 480px) {
      .admin-stats { grid-template-columns: repeat(3, 1fr); }
      .post-content { font-size: 14px; }
    }
  `}</style>
);

// ═══════════════════════════════════════════════
// 🕐 تنسيق الوقت
// ═══════════════════════════════════════════════

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${days} يوم`;
};

// ═══════════════════════════════════════════════
// 💬 مكوّن التعليقات
// ═══════════════════════════════════════════════

const PostModal = ({ post, onClose, onVote }) => {
  const [comments, setComments] = useState([
    { id: "c1", author: generateAnonymousId(), text: "أنت لست وحدك، كثيرون يشعرون بنفس الشيء", timestamp: new Date(Date.now() - 1800000) },
    { id: "c2", author: generateAnonymousId(), text: "شكراً لشجاعتك على المشاركة 💜", timestamp: new Date(Date.now() - 900000) },
  ]);
  const [newComment, setNewComment] = useState("");

  const submitComment = () => {
    if (newComment.trim().length < 2) return;
    const { isCrisis } = analyzeContent(newComment);
    const comment = {
      id: Date.now().toString(),
      author: generateAnonymousId(),
      text: newComment.trim(),
      timestamp: new Date(),
      isCrisis,
    };
    setComments(prev => [...prev, comment]);
    setNewComment("");
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* المنشور الأصلي */}
        <div style={{ marginBottom: 20, clear: "both" }}>
          <div className="post-meta">
            <div className="post-author">
              <div className="post-avatar">👤</div>
              <div>
                <div className="author-name">{post.author}</div>
                <div className="post-time">{timeAgo(post.timestamp)}</div>
              </div>
            </div>
            <span className="category-tag">{post.category}</span>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.85, marginBottom: 16 }}>{post.content}</p>
        </div>

        {/* قسم التعليقات */}
        <div className="section-title">التعليقات ({comments.length})</div>

        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-card">
              <div className="comment-author">{c.author} · {timeAgo(c.timestamp)}</div>
              <div className="comment-text">{c.text}</div>
            </div>
          ))}
        </div>

        {/* إضافة تعليق */}
        <div className="comment-compose">
          <textarea
            className="comment-input"
            placeholder="اكتب تعليقاً مجهولاً..."
            rows={2}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button className="comment-submit" onClick={submitComment}>↑</button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// 🛡️ لوحة تحكم Admin
// ═══════════════════════════════════════════════

/** كلمة المرور — في الإنتاج: استخدم ENV variable */
const ADMIN_PASSWORD = "whispr@admin2024";

const AdminPanel = ({ posts, onDeletePost, onClose }) => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [bannedWords, setBannedWords] = useState(["كلمة1", "كلمة2"]);
  const [newWord, setNewWord] = useState("");
  const [reports] = useState([
    { id: "r1", postId: "2", reason: "محتوى مسيء", timestamp: new Date() }
  ]);

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      setError("كلمة المرور غير صحيحة");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (!authed) {
    return (
      <div className="admin-overlay">
        <div className="admin-login">
          <div className="admin-login-card">
            <div className="admin-title">// WHISPR ADMIN</div>
            <div className="admin-subtitle">وصول مقيّد · لوحة التحكم</div>
            <input
              type="password"
              className="admin-input"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
              autoFocus
            />
            {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <button className="admin-btn" onClick={login}>دخول</button>
            <button
              onClick={onClose}
              style={{ width: "100%", background: "transparent", border: "none", color: "var(--text-muted)", marginTop: 12, cursor: "pointer", fontSize: 13 }}
            >
              رجوع
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <div>
            <div className="admin-title">// WHISPR ADMIN PANEL</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>جلسة آمنة · {new Date().toLocaleDateString("ar")}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}
          >
            خروج
          </button>
        </div>

        {/* إحصائيات */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-num">{posts.length}</div>
            <div className="stat-label">منشور</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{reports.length}</div>
            <div className="stat-label">بلاغ</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{bannedWords.length}</div>
            <div className="stat-label">كلمة محظورة</div>
          </div>
        </div>

        {/* البلاغات */}
        <div className="section-title" style={{ color: "var(--warning)" }}>⚠️ البلاغات ({reports.length})</div>
        <div className="admin-posts" style={{ marginBottom: 24 }}>
          {reports.map(r => (
            <div key={r.id} className="admin-post-item">
              <div className="admin-post-text">
                سبب البلاغ: <strong>{r.reason}</strong> · {timeAgo(r.timestamp)}
              </div>
              <button className="delete-btn" onClick={() => onDeletePost(r.postId)}>حذف المنشور</button>
            </div>
          ))}
        </div>

        {/* جميع المنشورات */}
        <div className="section-title">جميع المنشورات</div>
        <div className="admin-posts" style={{ marginBottom: 24 }}>
          {posts.map(p => (
            <div key={p.id} className="admin-post-item">
              <div className="admin-post-text">
                <span style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "monospace" }}>{p.author} · </span>
                {p.content.substring(0, 100)}{p.content.length > 100 ? "..." : ""}
              </div>
              <button className="delete-btn" onClick={() => onDeletePost(p.id)}>حذف</button>
            </div>
          ))}
        </div>

        {/* الكلمات المحظورة */}
        <div className="section-title">الكلمات المحظورة</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            className="admin-input"
            style={{ flex: 1, marginBottom: 0 }}
            placeholder="أضف كلمة محظورة..."
            value={newWord}
            onChange={e => setNewWord(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && newWord.trim()) {
                setBannedWords(prev => [...prev, newWord.trim()]);
                setNewWord("");
              }
            }}
          />
          <button
            className="admin-btn"
            style={{ width: "auto", padding: "0 16px" }}
            onClick={() => {
              if (newWord.trim()) {
                setBannedWords(prev => [...prev, newWord.trim()]);
                setNewWord("");
              }
            }}
          >إضافة</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {bannedWords.map((w, i) => (
            <span
              key={i}
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.3)",
                color: "var(--danger)",
                padding: "4px 12px",
                borderRadius: 12,
                fontSize: 13,
                cursor: "pointer",
              }}
              onClick={() => setBannedWords(prev => prev.filter((_, j) => j !== i))}
              title="اضغط للحذف"
            >
              {w} ✕
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// 🏠 التطبيق الرئيسي
// ═══════════════════════════════════════════════

export default function Whispr() {
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [newPost, setNewPost] = useState("");
  const [category, setCategory] = useState("مشاعر");
  const [filter, setFilter] = useState("الأحدث");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [toast, setToast] = useState(null);
  const [anonId] = useState(generateAnonymousId());
  const [clickCount, setClickCount] = useState(0); // للوصول للـ admin

  // فلترة وترتيب المنشورات
  const filteredPosts = [...posts]
    .filter(p => filter === "الأحدث" ? true : p.category === filter)
    .sort((a, b) => {
      if (filter === "الأكثر تفاعلاً") return (b.votes.up - b.votes.down) - (a.votes.up - a.votes.down);
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

  // عرض Toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // التحليل التلقائي للمنشور
  const analysis = analyzeContent(newPost);

  // حساب عدد الحروف
  const charCount = newPost.length;
  const charClass = charCount > 900 ? "danger" : charCount > 700 ? "warning" : "";

  // نشر منشور
  const submitPost = () => {
    if (analysis.isEmpty || analysis.isTooLong || analysis.hasBanned) return;
    const post = {
      id: Date.now().toString(),
      content: newPost.trim(),
      author: anonId,
      timestamp: new Date(),
      votes: { up: 0, down: 0 },
      comments: 0,
      category,
      userVote: null,
    };
    setPosts(prev => [post, ...prev]);
    setNewPost("");
    showToast("✓ تم النشر بشكل مجهول");
  };

  // التصويت
  const handleVote = (postId, type) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const wasVoted = p.userVote === type;
      return {
        ...p,
        userVote: wasVoted ? null : type,
        votes: {
          up: type === "up" ? (wasVoted ? p.votes.up - 1 : p.votes.up + 1) : p.votes.up,
          down: type === "down" ? (wasVoted ? p.votes.down - 1 : p.votes.down + 1) : p.votes.down,
        }
      };
    }));
  };

  // حذف منشور (admin)
  const handleDeletePost = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    showToast("🗑 تم حذف المنشور");
  };

  // نقرات سرية لفتح لوحة Admin (5 نقرات على الشعار)
  const handleLogoClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 5) {
      setShowAdmin(true);
      setClickCount(0);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="app">

        {/* ─── Header ─── */}
        <header className="header">
          <div className="container">
            <div className="header-inner">
              <div className="logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
                <div className="logo-icon">🌙</div>
                <div className="logo-text">Whi<span>spr</span></div>
              </div>
              <div className="header-badge">🔒 مجهول تماماً</div>
            </div>
          </div>
        </header>

        {/* ─── Privacy Bar ─── */}
        <div className="privacy-bar">
          <div className="container">
            <div className="privacy-text">
              لا يتم تسجيل أي <span>بيانات شخصية</span> · هويتك: <span>{anonId}</span>
            </div>
          </div>
        </div>

        {/* ─── Main Content ─── */}
        <main>
          <div className="container">

            {/* صندوق النشر */}
            <div className="compose-section">
              <div className="compose-card">
                <div className="compose-header">
                  <div className="anon-avatar">🌫️</div>
                  <div className="compose-label">
                    <strong>{anonId}</strong>
                    شارك ما تشعر به بأمان...
                  </div>
                </div>
                <textarea
                  className="compose-textarea"
                  placeholder="ما الذي يدور في ذهنك الآن؟ لا أحد يعرف من أنت..."
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  maxLength={1000}
                />
                <div className="compose-footer">
                  <div>
                    <div className={`char-count ${charClass}`}>{charCount}/1000</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select
                      className="category-select"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    >
                      {["مشاعر", "علاقات", "ضغوط", "عمل", "صحة", "أخرى"].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      className="submit-btn"
                      onClick={submitPost}
                      disabled={analysis.isEmpty || analysis.isTooLong || analysis.hasBanned}
                    >
                      نشر 🌙
                    </button>
                  </div>
                </div>
              </div>

              {/* تنبيه الأزمات */}
              {analysis.isCrisis && (
                <div className="crisis-banner">
                  <span className="icon">💙</span>
                  <p>
                    يبدو أنك تمر بوقت صعب جداً. أنت لست وحدك.
                    <br />
                    <a href="tel:920033360">تحدث مع متخصص الآن — خط دعم نفسي مجاني</a>
                  </p>
                </div>
              )}
            </div>

            {/* فلاتر */}
            <div className="filters">
              {["الأحدث", "الأكثر تفاعلاً", "مشاعر", "علاقات", "ضغوط", "عمل"].map(f => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* قائمة المنشورات */}
            <div className="posts-feed">
              {filteredPosts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🌙</div>
                  <div className="empty-text">لا توجد منشورات بعد. كن أول من يشارك.</div>
                </div>
              ) : filteredPosts.map(post => (
                <div key={post.id} className="post-card" onClick={() => setSelectedPost(post)}>
                  <div className="post-meta">
                    <div className="post-author">
                      <div className="post-avatar">👤</div>
                      <div>
                        <div className="author-name">{post.author}</div>
                        <div className="post-time">{timeAgo(post.timestamp)}</div>
                      </div>
                    </div>
                    <span className="category-tag">{post.category}</span>
                  </div>

                  <p className="post-content">{post.content}</p>

                  <div className="post-actions" onClick={e => e.stopPropagation()}>
                    {/* أزرار التصويت */}
                    <div className="vote-group">
                      <button
                        className={`vote-btn up ${post.userVote === "up" ? "active" : ""}`}
                        onClick={() => handleVote(post.id, "up")}
                      >
                        ▲ {post.votes.up}
                      </button>
                      <button
                        className={`vote-btn down ${post.userVote === "down" ? "active" : ""}`}
                        onClick={() => handleVote(post.id, "down")}
                      >
                        ▼ {post.votes.down}
                      </button>
                    </div>

                    {/* تعليقات */}
                    <button className="action-btn" onClick={() => setSelectedPost(post)}>
                      💬 {post.comments}
                    </button>

                    {/* بلاغ */}
                    <button
                      className="action-btn report-btn"
                      onClick={() => showToast("📋 تم إرسال البلاغ. شكراً.")}
                      style={{ marginRight: "auto" }}
                    >
                      ⚑ بلاغ
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </main>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
            Whispr © 2024 · مجهول · مجاني · آمن
          </p>
        </div>
      </div>

      {/* Modal المنشور */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onVote={handleVote}
        />
      )}

      {/* لوحة Admin */}
      {showAdmin && (
        <AdminPanel
          posts={posts}
          onDeletePost={handleDeletePost}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

/**
 * ══════════════════════════════════════════════════════════
 *  📖 دليل التشغيل الكامل
 * ══════════════════════════════════════════════════════════
 *
 * 1. إنشاء المشروع:
 *    npx create-next-app@latest whispr --js --tailwind=false --app
 *    cd whispr
 *
 * 2. تثبيت Supabase:
 *    npm install @supabase/supabase-js
 *
 * 3. إنشاء جداول Supabase:
 *
 *    -- جدول المنشورات (بدون بيانات شخصية)
 *    CREATE TABLE posts (
 *      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *      content TEXT NOT NULL,
 *      anonymous_name TEXT NOT NULL,
 *      category TEXT DEFAULT 'مشاعر',
 *      votes_up INT DEFAULT 0,
 *      votes_down INT DEFAULT 0,
 *      created_at TIMESTAMPTZ DEFAULT NOW()
 *    );
 *
 *    -- تفعيل RLS (Row Level Security)
 *    ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
 *    CREATE POLICY "anyone can read" ON posts FOR SELECT USING (true);
 *    CREATE POLICY "anyone can insert" ON posts FOR INSERT WITH CHECK (true);
 *
 *    -- جدول التعليقات
 *    CREATE TABLE comments (
 *      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *      post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
 *      content TEXT NOT NULL,
 *      anonymous_name TEXT NOT NULL,
 *      created_at TIMESTAMPTZ DEFAULT NOW()
 *    );
 *
 *    -- جدول البلاغات
 *    CREATE TABLE reports (
 *      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *      post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
 *      reason TEXT,
 *      created_at TIMESTAMPTZ DEFAULT NOW()
 *    );
 *
 * 4. ملف .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL=your_url
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
 *    ADMIN_PASSWORD=your_secret_password
 *
 * 5. كود الاتصال بـ Supabase (lib/supabase.js):
 *    import { createClient } from '@supabase/supabase-js'
 *    export const supabase = createClient(
 *      process.env.NEXT_PUBLIC_SUPABASE_URL,
 *      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
 *    )
 *
 * 6. Rate Limiting (middleware.js):
 *    استخدم Upstash Redis مع @upstash/ratelimit
 *    حد أقصى: 5 منشورات كل 15 دقيقة لكل IP
 *
 * 7. للوصول للـ Admin:
 *    اضغط على شعار "Whispr" 5 مرات متتالية
 *    أو يدك مباشرة للرابط: /admin-[كلمة-سرية]
 *
 * 8. النشر على Vercel:
 *    npm install -g vercel
 *    vercel --prod
 *
 * ══════════════════════════════════════════════════════════
 *  🔒 ملاحظات الأمان
 * ══════════════════════════════════════════════════════════
 *
 * - لا يتم تخزين IP في قاعدة البيانات أبداً
 * - Rate limiting يعمل على مستوى الـ Edge (Vercel)
 * - كل هوية مجهولة تُولَّد من جهة العميل فقط
 * - قاعدة البيانات لا تحتوي على أي معلومات تعريفية
 * - CAPTCHA: أضف hCaptcha (أكثر خصوصية من reCAPTCHA)
 */
