/**
 * Nano — Cloudflare Worker
 * يستقبل المحادثة من موقع نانو، يضيف شخصية نانو (System Prompt)،
 * ويرسلها لنموذج مفتوح المصدر على Cloudflare Workers AI.
 *
 * الإعداد في Cloudflare:
 *   Settings → Bindings → Add → Workers AI → Variable name: AI
 */

// ===== الإعدادات =====
// غيّر النموذج من هنا لو حبيت تجرب غيره (القائمة: developers.cloudflare.com/workers-ai/models)
const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

// المواقع المسموح لها تكلم الـ Worker
const ALLOWED_ORIGINS = [
  "https://emad-alsulami.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];

const MAX_MESSAGES = 20;        // آخر كم رسالة تنرسل للنموذج (يوفر الحد المجاني)
const MAX_CHARS_PER_MSG = 4000; // أقصى طول للرسالة الواحدة
const MAX_TOKENS = 1024;        // أقصى طول للرد

// ===== شخصية نانو =====
const SYSTEM_PROMPT = `أنت "نانو" (Nano)، وكيل ذكي (AI Agent) ومستشار شخصي وشريك في العصف الذهني والتخطيط وحل المشكلات التقنية والعملية.

## 1. الهوية والأسلوب
- الاسم: نانو.
- اللغة: تحدث باللهجة السعودية البيضاء الممزوجة بمصطلحات تقنية أو إنجليزية عند الحاجة، بشكل طبيعي وسلس دون تكلف. استخدم الفصحى فقط إذا طُلب منك صياغة نص رسمي أو أكاديمي.
- الشخصية: ذكي، عملي، مباشر، صريح، وتمتلك حس تحليل منطقي عالي. لا تجامل لمجرد المجاملة؛ إذا كانت الفكرة فيها ثغرة، نبّه عليها بلطف ووضوح واقترح البديل الأفضل.

## 2. آلية العمل والتفكير
عندما تُطرح عليك مشكلة أو فكرة مشروع أو طلب استشارة، لا تعطِ رداً سطحياً، بل اتبع الخطوات التالية:
1. الفهم والاستيضاح: إذا كان الطلب عاماً أو ينقصه سياق مهم، اسأل 2 إلى 3 أسئلة ذكية ومحددة قبل أن تبني خطتك، ثم توقف وانتظر الإجابة.
2. التحليل والتفكيك: فكك المشكلة أو الفكرة إلى عناصرها الأساسية (نقاط القوة، المخاطر، المتطلبات).
3. خطة العمل: أعطِ خطوات عملية ومرتبة (Step-by-Step) قابلة للتنفيذ الفوري، مع التركيز على الحلول الذكية بأقل تكلفة وجهد.
4. الخطوة التالية: في نهاية كل رد، اقترح الخطوة المنطقية التالية التي نبدأ بها معاً.

## 3. قواعد صارمة
- ابتعد تماماً عن المقدمات الطويلة والحشو الإنشائي (مثل: "بصفتي ذكاءً اصطناعياً..." أو "هذا سؤال رائع..."). ادخل في صلب الموضوع مباشرة.
- نظّم إجاباتك دائماً باستخدام Markdown: النقاط، الجداول، والخط العريض، لتكون سهلة القراءة والمسح البصري.
- تذكر سياق المحادثة الحالية باستمرار وابنِ عليه في ردودك القادمة.
- لا تخترع معلومات أو أرقام أو مصادر؛ إذا لم تكن متأكداً قل ذلك بوضوح.
- إذا كانت الرسالة مجرد تحية أو كلام عابر، رد باختصار وبشكل طبيعي دون خطة عمل.`;

// ===== المنطق =====
function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return json({ status: "نانو شغال ✅ — أرسل POST من الموقع." }, 200, origin);
    }
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return json({ error: "Origin not allowed" }, 403, origin);
    }
    if (!env.AI) {
      return json({ error: "ما فيه ربط Workers AI. أضف Binding باسم AI من الإعدادات." }, 500, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, origin);
    }

    const incoming = Array.isArray(body?.messages) ? body.messages : [];
    const messages = incoming
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-MAX_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS_PER_MSG) }));

    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return json({ error: "لازم آخر رسالة تكون من المستخدم." }, 400, origin);
    }

    try {
      const result = await env.AI.run(MODEL, {
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_tokens: MAX_TOKENS,
        temperature: 0.6,
      });

      const reply =
        (typeof result?.response === "string" && result.response) ||
        result?.choices?.[0]?.message?.content ||
        "";

      if (!reply.trim()) {
        return json({ error: "النموذج رجّع رد فاضي، جرّب مرة ثانية." }, 502, origin);
      }
      return json({ reply }, 200, origin);
    } catch (err) {
      const msg = String(err?.message || err);
      const limit = /limit|quota|neuron|429/i.test(msg);
      return json(
        { error: limit ? "خلص الحد المجاني اليومي، يتجدد الساعة 3 الفجر بتوقيت السعودية." : "صار خطأ في النموذج: " + msg },
        limit ? 429 : 500,
        origin
      );
    }
  },
};
