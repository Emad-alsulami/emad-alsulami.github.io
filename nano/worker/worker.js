/**
 * Nano — Cloudflare Worker
 * - يستقبل المحادثة من موقع نانو، يضيف شخصية نانو (System Prompt)،
 *   ويرسلها لنموذج مفتوح المصدر على Cloudflare Workers AI.
 * - حسابات اختيارية (اسم مستخدم + كلمة مرور) لمزامنة المحادثات بين الأجهزة عبر Cloudflare D1.
 *
 * الإعداد في Cloudflare (Settings → Bindings → Add):
 *   1) Workers AI   → Variable name: AI
 *   2) D1 database  → Variable name: DB   (اختياري — بدونه يشتغل نانو بدون حسابات)
 * الجداول تنشأ تلقائياً أول مرة، ما تحتاج تكتب SQL.
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
const MAX_CHARS_PER_MSG = 4000; // أقصى طول للرسالة الواحدة المرسلة للنموذج
const MAX_TOKENS = 1024;        // أقصى طول للرد

const SESSION_DAYS = 90;          // مدة بقاء تسجيل الدخول
const MAX_CHATS_PER_USER = 500;   // أقصى عدد محادثات محفوظة لكل مستخدم
const MAX_CHAT_BYTES = 1_000_000; // أقصى حجم للمحادثة الواحدة (تقريباً 1MB)
const LOGIN_MAX_FAILS = 8;        // محاولات دخول فاشلة مسموحة...
const LOGIN_WINDOW_MIN = 15;      // ...خلال كم دقيقة
const PBKDF2_ITERATIONS = 100000; // أقصى قيمة يدعمها Cloudflare Workers

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

// ===== أدوات عامة =====
function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) },
  });
}

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function readJson(request) {
  try { return await request.json(); } catch { throw new HttpError(400, "Invalid JSON"); }
}

const enc = new TextEncoder();
const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const randomHex = (n) => toHex(crypto.getRandomValues(new Uint8Array(n)));
const sha256Hex = async (s) => toHex(await crypto.subtle.digest("SHA-256", enc.encode(s)));

async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const salt = new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16)));
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS }, key, 256);
  return toHex(bits);
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// ===== قاعدة البيانات =====
let schemaReady = null;
function ensureSchema(db) {
  if (!schemaReady) {
    schemaReady = db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE,
        pass_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at INTEGER NOT NULL)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS chats (
        id TEXT NOT NULL, user_id TEXT NOT NULL, title TEXT NOT NULL,
        created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, messages TEXT NOT NULL,
        PRIMARY KEY (user_id, id))`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_chats_user_updated ON chats(user_id, updated_at DESC)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS login_attempts (username TEXT NOT NULL, ts INTEGER NOT NULL)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_attempts ON login_attempts(username, ts)`),
    ]).catch((e) => { schemaReady = null; throw e; });
  }
  return schemaReady;
}

async function createSession(db, userId) {
  const token = randomHex(32);
  const now = Date.now();
  await db.prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256Hex(token), userId, now, now + SESSION_DAYS * 86400000).run();
  return token;
}

async function requireUser(request, db) {
  const m = (request.headers.get("Authorization") || "").match(/^Bearer ([a-f0-9]{64})$/);
  if (!m) throw new HttpError(401, "لازم تسجّل دخول.");
  const row = await db.prepare(
    "SELECT u.id, u.username, s.token_hash FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?"
  ).bind(await sha256Hex(m[1]), Date.now()).first();
  if (!row) throw new HttpError(401, "انتهت الجلسة، سجّل دخول مرة ثانية.");
  return row;
}

// ===== الحسابات =====
const USERNAME_RE = /^[a-zA-Z0-9_.]{3,24}$/;

function validateCredentials(body) {
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!USERNAME_RE.test(username)) throw new HttpError(400, "اسم المستخدم لازم يكون من 3 إلى 24 حرف إنجليزي أو رقم (مسموح _ و .).");
  if (password.length < 8 || password.length > 128) throw new HttpError(400, "كلمة المرور لازم تكون 8 أحرف على الأقل.");
  return { username, password };
}

async function register(request, db) {
  const { username, password } = validateCredentials(await readJson(request));
  const exists = await db.prepare("SELECT 1 FROM users WHERE username = ?").bind(username).first();
  if (exists) throw new HttpError(409, "اسم المستخدم مأخوذ، جرّب اسم ثاني.");
  const id = randomHex(12);
  const salt = randomHex(16);
  try {
    await db.prepare("INSERT INTO users (id, username, pass_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(id, username, await hashPassword(password, salt), salt, Date.now()).run();
  } catch (e) {
    if (/UNIQUE/i.test(String(e))) throw new HttpError(409, "اسم المستخدم مأخوذ، جرّب اسم ثاني.");
    throw e;
  }
  return { token: await createSession(db, id), username };
}

async function login(request, db) {
  const { username, password } = validateCredentials(await readJson(request));
  const key = username.toLowerCase();
  const now = Date.now();
  const since = now - LOGIN_WINDOW_MIN * 60000;

  const fails = await db.prepare("SELECT COUNT(*) AS n FROM login_attempts WHERE username = ? AND ts > ?").bind(key, since).first();
  if ((fails?.n || 0) >= LOGIN_MAX_FAILS) {
    throw new HttpError(429, `محاولات كثيرة، جرّب بعد ${LOGIN_WINDOW_MIN} دقيقة.`);
  }

  const user = await db.prepare("SELECT id, username, pass_hash, salt FROM users WHERE username = ?").bind(username).first();
  const ok = user ? safeEqual(await hashPassword(password, user.salt), user.pass_hash) : false;
  if (!ok) {
    await db.batch([
      db.prepare("INSERT INTO login_attempts (username, ts) VALUES (?, ?)").bind(key, now),
      db.prepare("DELETE FROM login_attempts WHERE ts < ?").bind(now - 86400000),
    ]);
    throw new HttpError(401, "اسم المستخدم أو كلمة المرور غلط.");
  }

  await db.batch([
    db.prepare("DELETE FROM login_attempts WHERE username = ?").bind(key),
    db.prepare("DELETE FROM sessions WHERE user_id = ? AND expires_at < ?").bind(user.id, now),
  ]);
  return { token: await createSession(db, user.id), username: user.username };
}

// ===== المحادثات =====
const CHAT_ID_RE = /^[a-z0-9]{6,40}$/;

function validateChat(body) {
  const messages = Array.isArray(body?.messages) ? body.messages : null;
  if (!messages) throw new HttpError(400, "messages مطلوبة.");
  const clean = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content }));
  const serialized = JSON.stringify(clean);
  if (serialized.length > MAX_CHAT_BYTES) throw new HttpError(413, "المحادثة كبيرة مرة، ابدأ محادثة جديدة.");
  const now = Date.now();
  const num = (v, d) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : d);
  return {
    title: (typeof body.title === "string" && body.title.trim() ? body.title.trim() : "محادثة").slice(0, 120),
    createdAt: num(body.createdAt, now),
    updatedAt: num(body.updatedAt, now),
    messages: serialized,
  };
}

async function handleChats(request, db, user, path) {
  const id = path.split("/")[2];
  const method = request.method;

  if (!id) {
    if (method === "GET") {
      const { results } = await db.prepare(
        "SELECT id, title, created_at AS createdAt, updated_at AS updatedAt FROM chats WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?"
      ).bind(user.id, MAX_CHATS_PER_USER).all();
      return { chats: results };
    }
    if (method === "DELETE") {
      await db.prepare("DELETE FROM chats WHERE user_id = ?").bind(user.id).run();
      return { ok: true };
    }
    throw new HttpError(405, "Method not allowed");
  }

  if (!CHAT_ID_RE.test(id)) throw new HttpError(400, "معرّف المحادثة غير صالح.");

  if (method === "GET") {
    const row = await db.prepare(
      "SELECT id, title, created_at AS createdAt, updated_at AS updatedAt, messages FROM chats WHERE user_id = ? AND id = ?"
    ).bind(user.id, id).first();
    if (!row) throw new HttpError(404, "المحادثة مو موجودة.");
    return { chat: { ...row, messages: JSON.parse(row.messages) } };
  }

  if (method === "PUT") {
    const c = validateChat(await readJson(request));
    const existing = await db.prepare("SELECT 1 FROM chats WHERE user_id = ? AND id = ?").bind(user.id, id).first();
    if (!existing) {
      const count = await db.prepare("SELECT COUNT(*) AS n FROM chats WHERE user_id = ?").bind(user.id).first();
      if ((count?.n || 0) >= MAX_CHATS_PER_USER) throw new HttpError(400, `وصلت الحد (${MAX_CHATS_PER_USER} محادثة). احذف محادثات قديمة.`);
    }
    await db.prepare(
      `INSERT INTO chats (id, user_id, title, created_at, updated_at, messages) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, id) DO UPDATE SET title = excluded.title, updated_at = excluded.updated_at, messages = excluded.messages
       WHERE excluded.updated_at >= chats.updated_at`
    ).bind(id, user.id, c.title, c.createdAt, c.updatedAt, c.messages).run();
    return { ok: true };
  }

  if (method === "DELETE") {
    await db.prepare("DELETE FROM chats WHERE user_id = ? AND id = ?").bind(user.id, id).run();
    return { ok: true };
  }

  throw new HttpError(405, "Method not allowed");
}

// ===== الذكاء الاصطناعي =====
async function handleAI(request, env) {
  if (!env.AI) throw new HttpError(500, "ما فيه ربط Workers AI. أضف Binding باسم AI من الإعدادات.");
  const body = await readJson(request);
  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  const messages = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS_PER_MSG) }));

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    throw new HttpError(400, "لازم آخر رسالة تكون من المستخدم.");
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
    if (!reply.trim()) throw new HttpError(502, "النموذج رجّع رد فاضي، جرّب مرة ثانية.");
    return { reply };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    const msg = String(err?.message || err);
    if (/limit|quota|neuron|429/i.test(msg)) {
      throw new HttpError(429, "خلص الحد المجاني اليومي، يتجدد الساعة 3 الفجر بتوقيت السعودية.");
    }
    throw new HttpError(500, "صار خطأ في النموذج: " + msg);
  }
}

// ===== الموجّه =====
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (method === "GET" && path === "/") {
      return json({
        status: "نانو شغال ✅",
        ai: env.AI ? "مربوط ✅" : "غير مربوط ❌ (أضف Workers AI باسم AI)",
        database: env.DB ? "مربوطة ✅" : "غير مربوطة ❌ (أضف D1 باسم DB)",
      }, 200, origin);
    }

    if (!ALLOWED_ORIGINS.includes(origin)) {
      return json({ error: "Origin not allowed" }, 403, origin);
    }

    try {
      if (method === "POST" && (path === "/" || path === "/chat")) {
        return json(await handleAI(request, env), 200, origin);
      }

      if (path.startsWith("/auth") || path.startsWith("/chats")) {
        if (!env.DB) throw new HttpError(501, "الحسابات مو مفعّلة: قاعدة البيانات (D1) مو مربوطة بالـ Worker.");
        await ensureSchema(env.DB);
        const db = env.DB;

        if (method === "POST" && path === "/auth/register") return json(await register(request, db), 200, origin);
        if (method === "POST" && path === "/auth/login") return json(await login(request, db), 200, origin);

        const user = await requireUser(request, db);
        if (method === "GET" && path === "/auth/me") return json({ username: user.username }, 200, origin);
        if (method === "POST" && path === "/auth/logout") {
          await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(user.token_hash).run();
          return json({ ok: true }, 200, origin);
        }
        if (path === "/chats" || path.startsWith("/chats/")) {
          return json(await handleChats(request, db, user, path), 200, origin);
        }
      }

      return json({ error: "Not found" }, 404, origin);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status, origin);
      return json({ error: "خطأ في السيرفر: " + String(err?.message || err) }, 500, origin);
    }
  },
};
