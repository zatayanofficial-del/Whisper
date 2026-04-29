/**
 * ═══════════════════════════════════════════
 * الملف 7: components/SupportWidget.jsx
 * 
 * المكوّن النفسي الأقوى في المنصة:
 * - بانر الأزمات مع خطوط المساعدة
 * - رسائل دعم عشوائية للمستخدمين
 * - مؤشر "أنت لست وحدك" في أسفل الصفحة
 * - نظام AI للدعم النفسي الفوري
 * ═══════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { CRISIS_RESOURCES, getRandomSupportMessage } from '@/lib/filter';

// ════════════════════════════════════════════
// 🚨 بانر الأزمات — يظهر عند اكتشاف كلمات خطر
// ════════════════════════════════════════════
export const CrisisBanner = ({ onDismiss }) => {
  const [resource, setResource] = useState(CRISIS_RESOURCES[0]);
  const support = getRandomSupportMessage();

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,107,107,0.08), rgba(255,107,107,0.03))',
      border: '1px solid rgba(255,107,107,0.25)',
      borderRadius: 16,
      padding: '20px',
      marginTop: 16,
      animation: 'fadeSlideIn 0.4s ease',
      position: 'relative',
    }}>
      {/* زر الإغلاق */}
      <button
        onClick={onDismiss}
        style={{
          position: 'absolute', top: 12, left: 12,
          background: 'transparent', border: 'none',
          color: 'rgba(255,107,107,0.5)', cursor: 'pointer',
          fontSize: 16, lineHeight: 1,
        }}
      >✕</button>

      {/* الرسالة الرئيسية */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>{support.icon}</span>
        <div>
          <p style={{
            fontSize: 16, fontWeight: 600,
            color: '#ff8a8a', marginBottom: 6, lineHeight: 1.5,
          }}>
            {support.text}
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,138,138,0.7)', lineHeight: 1.7 }}>
            ما تشعر به الآن مؤقت، والمساعدة موجودة. لا تواجه هذا وحدك.
          </p>
        </div>
      </div>

      {/* خطوط المساعدة */}
      <div style={{
        background: 'rgba(255,107,107,0.06)',
        borderRadius: 10,
        padding: '14px 16px',
        marginBottom: 12,
      }}>
        <p style={{ fontSize: 12, color: 'rgba(255,138,138,0.6)', marginBottom: 10 }}>
          خطوط مساعدة نفسية مجانية — متاحة الآن:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CRISIS_RESOURCES.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#ff8a8a' }}>
                {r.country} — {r.name}
              </span>
              {r.isLink ? (
                <a
                  href={`https://${r.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13, color: '#ff6b6b',
                    fontFamily: 'monospace', textDecoration: 'underline',
                  }}
                >
                  {r.number}
                </a>
              ) : (
                <a
                  href={`tel:${r.number}`}
                  style={{
                    fontSize: 14, color: '#ff6b6b',
                    fontWeight: 700, fontFamily: 'monospace',
                    textDecoration: 'none', letterSpacing: 1,
                  }}
                >
                  📞 {r.number}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* رسالة تشجيعية */}
      <p style={{ fontSize: 13, color: 'rgba(255,138,138,0.5)', textAlign: 'center' }}>
        💜 يمكنك نشر ما تشعر به هنا أيضاً — الجميع يستمع بدون حكم
      </p>
    </div>
  );
};

// ════════════════════════════════════════════
// 🤖 مساعد AI النفسي
// يرد على المستخدم بشكل تعاطفي فوري
// ════════════════════════════════════════════
export const AISupport = ({ userMessage, onClose }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userMessage) return;
    fetchAIResponse(userMessage);
  }, [userMessage]);

  const fetchAIResponse = async (message) => {
    try {
      const res = await fetch('/api/ai-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setResponse(data.reply || 'أنا هنا معك. أخبرني أكثر عما تشعر به.');
    } catch {
      setResponse('أنا أسمعك. ما تشعر به مهم، وأنت لست وحدك في هذا.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(124,106,247,0.05)',
      border: '1px solid rgba(124,106,247,0.15)',
      borderRadius: 16, padding: 20, marginTop: 12,
      animation: 'fadeSlideIn 0.4s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c6af7, #5b4fd4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>🤍</div>
        <div>
          <div style={{ fontSize: 14, color: '#9d8fff', fontWeight: 600 }}>مرافق Whispr</div>
          <div style={{ fontSize: 11, color: 'rgba(157,143,255,0.5)' }}>يستمع دائماً · مجهول تماماً</div>
        </div>
        <button
          onClick={onClose}
          style={{ marginRight: 'auto', background: 'transparent', border: 'none', color: 'rgba(157,143,255,0.4)', cursor: 'pointer', fontSize: 16 }}
        >✕</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: 6, padding: '8px 0' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#7c6af7',
              animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      ) : (
        <p style={{
          fontSize: 15, color: '#c4beff', lineHeight: 1.8,
          fontStyle: 'italic',
        }}>
          "{response}"
        </p>
      )}
    </div>
  );
};

// ════════════════════════════════════════════
// 💜 شريط "أنت لست وحدك"
// يظهر في أسفل الصفحة دائماً
// ════════════════════════════════════════════
export const SolidarityBar = ({ onlineCount = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // يظهر بعد 3 ثواني من فتح الصفحة
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: 'linear-gradient(180deg, transparent, rgba(10,10,15,0.95))',
      padding: '20px 16px 16px',
      textAlign: 'center',
      zIndex: 50,
      animation: 'fadeSlideUp 0.5s ease',
      pointerEvents: 'none',
    }}>
      <p style={{
        fontSize: 13,
        color: 'rgba(144,144,168,0.6)',
        fontFamily: 'monospace',
      }}>
        💜 {onlineCount > 0 ? `${onlineCount.toLocaleString('ar')} شخص` : 'أشخاص كثيرون'} يشاركونك هذه اللحظة
      </p>
    </div>
  );
};

// ════════════════════════════════════════════
// 🌙 بطاقة الترحيب — تظهر للزائر الجديد
// ════════════════════════════════════════════
export const WelcomeCard = ({ onDismiss }) => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(124,106,247,0.08), rgba(91,79,212,0.03))',
    border: '1px solid rgba(124,106,247,0.15)',
    borderRadius: 20, padding: 24, marginBottom: 16,
    animation: 'fadeSlideIn 0.5s ease',
    textAlign: 'center',
  }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>🌙</div>
    <h2 style={{ fontSize: 20, color: '#c4beff', marginBottom: 8, fontWeight: 700 }}>
      مرحباً في Whispr
    </h2>
    <p style={{ fontSize: 14, color: 'rgba(144,144,168,0.7)', lineHeight: 1.8, marginBottom: 20 }}>
      هذا مكان آمن للتعبير عن مشاعرك بدون حكم.
      <br />لا اسم، لا صورة، لا بيانات — فقط أنت وكلماتك.
    </p>
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 8, marginBottom: 20,
    }}>
      {[
        { icon: '🔒', text: 'مجهول تماماً' },
        { icon: '💙', text: 'بدون حكم' },
        { icon: '🤝', text: 'مجتمع داعم' },
      ].map((f, i) => (
        <div key={i} style={{
          background: 'rgba(124,106,247,0.06)',
          borderRadius: 10, padding: '10px 8px',
          fontSize: 12, color: 'rgba(196,190,255,0.7)',
        }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>{f.icon}</div>
          {f.text}
        </div>
      ))}
    </div>
    <button
      onClick={onDismiss}
      style={{
        background: 'linear-gradient(135deg, #7c6af7, #5b4fd4)',
        border: 'none', color: 'white',
        padding: '12px 32px', borderRadius: 12,
        fontSize: 15, cursor: 'pointer', fontWeight: 600,
      }}
    >
      ابدأ الهمس 🌙
    </button>
  </div>
);

// ════════════════════════════════════════════
// CSS Animations (أضفها لملف globals.css)
// ════════════════════════════════════════════
/*
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%           { transform: scale(1);   opacity: 1; }
}
*/
