/**
 * ═══════════════════════════════════════════
 * الملف 8: app/api/ai-support/route.js
 *
 * مساعد AI نفسي يرد على المستخدمين
 * بأسلوب تعاطفي ومتخصص
 * يستخدم Anthropic Claude API
 * ═══════════════════════════════════════════
 */

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || message.trim().length < 3) {
      return Response.json({ reply: 'أنا هنا معك. أخبرني أكثر.' }, { status: 200 });
    }

    // ── System Prompt المتخصص ──
    const systemPrompt = `أنت مرافق نفسي داعم ومتعاطف على منصة Whispr المجهولة.

مهمتك:
- الاستماع بتعاطف عميق دون إصدار أحكام
- الرد بأسلوب دافئ وإنساني وطبيعي (ليس روبوتياً)
- التحقق من مشاعر المستخدم وإظهار الفهم
- تشجيع المستخدم على التعبير والتحدث
- عدم تقديم نصائح طبية أو تشخيصات

قواعد صارمة:
- لا تذكر أنك AI إلا إذا سُئلت مباشرة
- إذا ذكر المستخدم أفكار إيذاء النفس: شجّعه بشدة على الاتصال بخط مساعدة (920033360 للسعودية)
- ردودك قصيرة (2-4 جمل فقط) وحميمة
- اللغة: العربية الفصحى البسيطة الدافئة

أسلوبك: مثل صديق مقرب حكيم يسمع باهتمام حقيقي.`;

    // ── استدعاء Claude API ──
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          { role: 'user', content: message.trim() }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('AI API error');
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'أنا هنا معك. أخبرني أكثر عما تشعر به.';

    return Response.json({ reply }, { status: 200 });

  } catch (error) {
    console.error('[AI Support]', error.message);

    // رد احتياطي إذا فشل الـ AI
    const fallbackReplies = [
      'أنا أسمعك. ما تشعر به مهم، وأنت لست وحدك في هذا.',
      'شكراً لثقتك بمشاركة ما بداخلك. هذه شجاعة حقيقية.',
      'مشاعرك صحيحة ومفهومة. أخبرني أكثر إذا أردت.',
      'أنت في مكان آمن هنا. لا حكم، فقط استماع.',
    ];

    const fallback = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    return Response.json({ reply: fallback }, { status: 200 });
  }
}
