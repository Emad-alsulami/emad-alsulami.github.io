/**
 * Nano — Cloudflare Worker (v3: وكيل بأدوات)
 * - وكيل ذكي بشخصية نانو على نموذج مفتوح المصدر (Workers AI).
 * - أدوات: بحث في الإنترنت، قراءة الروابط، حاسبة، ذاكرة طويلة، وفهم الصور.
 * - حسابات اختيارية ومزامنة المحادثات والذاكرة عبر Cloudflare D1.
 *
 * الإعداد في Cloudflare (Settings → Bindings → Add):
 *   1) Workers AI   → Variable name: AI
 *   2) D1 database  → Variable name: DB   (للحسابات والذاكرة)
 * اختياري (Settings → Variables and Secrets → Add → Secret):
 *   TAVILY_API_KEY  → مفتاح Tavily لرفع حد البحث (بدونه البحث يشتغل بالوضع المجاني المحدود)
 * الجداول تنشأ تلقائياً، ما تحتاج تكتب SQL.
 */

// ===== الإعدادات =====
const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct"; // يدعم الصور (Vision)

const ALLOWED_ORIGINS = [
  "https://emad-alsulami.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];

const MAX_MESSAGES = 20;          // آخر كم رسالة تنرسل للنموذج
const MAX_CHARS_PER_MSG = 4000;   // أقصى طول لرسالة المستخدم المرسلة للنموذج
const MAX_TOKENS = 1400;          // أقصى طول للرد
const MAX_TOOL_ROUNDS = 3;        // أقصى عدد جولات أدوات في الرد الواحد
const MAX_TOOLS_PER_ROUND = 3;    // أقصى أدوات في الجولة الواحدة
const TOOL_RESULT_CHARS = 6000;   // أقصى طول لنتيجة الأداة
const MAX_IMAGES = 2;             // أقصى صور في الرسالة
const MAX_IMAGE_CHARS = 1_400_000; // أقصى حجم للصورة (base64)

const SESSION_DAYS = 90;
const MAX_CHATS_PER_USER = 500;
const MAX_CHAT_BYTES = 1_800_000;
const MAX_MEMORIES = 60;
const MAX_MEMORY_CHARS = 300;
const LOGIN_MAX_FAILS = 8;
const LOGIN_WINDOW_MIN = 15;
const PBKDF2_ITERATIONS = 100000;

// ===== شخصية نانو =====
const PERSONA = `أنت "نانو" (Nano)، وكيل ذكي (AI Agent) ومستشار شخصي وشريك في العصف الذهني والتخطيط وحل المشكلات التقنية والعملية.

## الهوية والأسلوب
- تتكلم باللهجة السعودية البيضاء بشكل طبيعي (مثل: وش، ليش، كذا، زين، تبي، عشان، بس، مرة، خلنا، أقترح)، مع مصطلحات تقنية بالإنجليزي عند الحاجة. الفصحى فقط إذا طُلب نص رسمي أو أكاديمي.
- ذكي، عملي، مباشر، وصريح. ما تجامل: إذا الفكرة فيها ثغرة، قلها بلطف ووضوح واقترح البديل الأفضل.
- تتكلم كخبير يحترم وقت اللي قدامه: بدون مقدمات ("بصفتي ذكاء اصطناعي"، "سؤال رائع")، وبدون تكرار، وبدون حشو.

## طريقة تفكيرك (طبّقها في عقلك قبل ما ترد)
1. وش الهدف الحقيقي ورا السؤال؟ أحياناً المستخدم يسأل عن حل وهو يحتاج حل لمشكلة ثانية.
2. هل عندي معلومات كافية؟
   - إذا الطلب غامض والخطأ فيه مكلف: اسأل من 2 إلى 3 أسئلة محددة وذكية فقط، ثم توقف.
   - إذا تقدر تفترض افتراض معقول: اذكر افتراضك بسطر وكمّل.
3. هل أحتاج أداة؟ أي معلومة ممكن تكون تغيّرت (أخبار، أسعار، إصدارات، أشخاص في مناصب، أحداث بعد 2024) لازم تبحث عنها، ولا تجاوب من ذاكرتك.
4. فكك المشكلة لعناصرها: نقاط القوة، المخاطر، المتطلبات، والبدائل.
5. اختر أبسط حل فعّال بأقل تكلفة وجهد، وقل ليش اخترته، ووش الـ trade-off.
6. راجع ردك: هل فيه رقم أو معلومة اخترعتها؟ احذفها أو قل إنك مو متأكد.

## شكل الرد
- طول الرد على قد السؤال: سؤال بسيط = جواب بسطر أو سطرين. مشكلة أو مشروع = تحليل وخطة.
- للمشاكل والمشاريع: تحليل مختصر، ثم خطة عمل بخطوات مرقمة قابلة للتنفيذ، ثم **الخطوة التالية** بسطر.
- استخدم Markdown: عناوين قصيرة، نقاط، جداول للمقارنات، وخط عريض للأهم.
- للكود: استخدم code blocks مع اسم اللغة.
- إذا استخدمت بحث أو رابط، اذكر المصادر في آخر الرد كروابط [العنوان](الرابط). لا تخترع روابط أبداً.
- إذا الرسالة تحية أو كلام عابر: رد باختصار وطبيعي بدون خطة.

## الصدق
- إذا ما تعرف، قل "ما أعرف" أو ابحث. التخمين المقدّم كحقيقة ممنوع.
- إذا المستخدم غلطان، صحّحه بأدب ومعه السبب.`;

const TOOLS_DOC = (opts) => `## الأدوات
عندك أدوات تقدر تستخدمها. لاستخدام أداة اكتب سطر بهذا الشكل بالضبط، ولا تكتب أي شي ثاني في نفس الرد:
<tool>{"name": "اسم_الأداة", "args": {...}}</tool>
تقدر تكتب لين ${MAX_TOOLS_PER_ROUND} أسطر أدوات في نفس الرد. بعدها بيوصلك <tool_result> وتكمل ردك عادي.
لا تقول للمستخدم "بستخدم أداة"؛ استخدمها مباشرة. ولا تستخدم أداة إذا ما تحتاجها.

الأدوات المتاحة:
- web_search {"query": "..."}: بحث في الإنترنت. استخدمها لأي معلومة حديثة أو متغيرة أو ما تعرفها. اكتب الاستعلام بالإنجليزي إذا الموضوع تقني أو عالمي، وبالعربي إذا محلي.
- fetch_url {"url": "https://..."}: يقرأ محتوى صفحة. استخدمها إذا المستخدم أرسل رابط، أو تبي تتعمق في نتيجة بحث.
- calculate {"expression": "..."}: حاسبة دقيقة (+ - * / ^ % sqrt round log sin cos min max pi). استخدمها لأي حساب فيه أكثر من خطوة.
${opts.memory ? `- remember {"fact": "..."}: يحفظ معلومة ثابتة عن المستخدم في ذاكرتك الطويلة (اسمه، تخصصه، مشاريعه، تفضيلاته). استخدمها إذا شارك معلومة مهمة عن نفسه أو طلب منك تتذكر شي. اكتب الحقيقة بجملة قصيرة واضحة.
- forget {"id": "..."}: يحذف معلومة من الذاكرة برقمها، إذا طلب المستخدم تنساها أو صارت غلط.` : `- (الذاكرة الطويلة متاحة فقط للمستخدمين المسجلين. إذا طلب منك تتذكر شي، قل له يسجّل دخول.)`}`;

function buildSystemPrompt({ memories, loggedIn, username }) {
  const now = new Date();
  let dateLine = now.toISOString();
  try {
    const g = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
      timeZone: "Asia/Riyadh", weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(now);
    const h = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", {
      timeZone: "Asia/Riyadh", year: "numeric", month: "long", day: "numeric",
    }).format(now);
    dateLine = `${g} (توقيت السعودية) — ${h}`;
  } catch {}

  let mem = "";
  if (loggedIn) {
    mem = memories.length
      ? `\n\n## ذاكرتك عن المستخدم${username ? ` (${username})` : ""}\nاستخدمها بشكل طبيعي لتخصيص ردودك، بدون ما تسردها له:\n` +
        memories.map((m) => `- [${m.id}] ${m.content}`).join("\n")
      : `\n\n## ذاكرتك عن المستخدم\n(فاضية للحين)`;
  }

  return `${PERSONA}

## السياق
- التاريخ والوقت الآن: ${dateLine}.
- معلوماتك المخزنة قد تكون قديمة؛ لأي شي حديث استخدم البحث.

${TOOLS_DOC({ memory: loggedIn })}${mem}`;
}

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
const shortId = () => randomHex(3);

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
      db.prepare(`CREATE TABLE IF NOT EXISTS memories (
        id TEXT NOT NULL, user_id TEXT NOT NULL, content TEXT NOT NULL, created_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, id))`),
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

async function findUser(request, db) {
  const m = (request.headers.get("Authorization") || "").match(/^Bearer ([a-f0-9]{64})$/);
  if (!m) return null;
  return await db.prepare(
    "SELECT u.id, u.username, s.token_hash FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?"
  ).bind(await sha256Hex(m[1]), Date.now()).first();
}

async function requireUser(request, db) {
  if (!/^Bearer /.test(request.headers.get("Authorization") || "")) throw new HttpError(401, "لازم تسجّل دخول.");
  const user = await findUser(request, db);
  if (!user) throw new HttpError(401, "انتهت الجلسة، سجّل دخول مرة ثانية.");
  return user;
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

function cleanStoredMessage(m) {
  const out = { role: m.role, content: m.content };
  if (Array.isArray(m.images)) {
    const imgs = m.images.filter((u) => typeof u === "string" && u.startsWith("data:image/")).slice(0, MAX_IMAGES);
    if (imgs.length) out.images = imgs;
  }
  if (Array.isArray(m.steps)) {
    out.steps = m.steps.slice(0, 12).map((s) => ({
      tool: String(s?.tool || "").slice(0, 30), label: String(s?.label || "").slice(0, 200), ok: !!s?.ok,
      url: typeof s?.url === "string" ? s.url.slice(0, 500) : undefined,
    }));
  }
  return out;
}

function validateChat(body) {
  const messages = Array.isArray(body?.messages) ? body.messages : null;
  if (!messages) throw new HttpError(400, "messages مطلوبة.");
  const clean = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map(cleanStoredMessage);
  const serialized = JSON.stringify(clean);
  if (serialized.length > MAX_CHAT_BYTES) throw new HttpError(413, "المحادثة كبيرة مرة (غالباً بسبب الصور)، ابدأ محادثة جديدة.");
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

// ===== الذاكرة الطويلة =====
async function listMemories(db, userId) {
  const { results } = await db.prepare(
    "SELECT id, content, created_at AS createdAt FROM memories WHERE user_id = ? ORDER BY created_at ASC LIMIT ?"
  ).bind(userId, MAX_MEMORIES).all();
  return results;
}

async function addMemory(db, userId, fact) {
  const content = String(fact || "").replace(/\s+/g, " ").trim().slice(0, MAX_MEMORY_CHARS);
  if (content.length < 3) return { ok: false, text: "المعلومة فاضية أو قصيرة مرة." };
  const existing = await listMemories(db, userId);
  if (existing.some((m) => m.content === content)) return { ok: true, text: "المعلومة محفوظة من قبل." };
  if (existing.length >= MAX_MEMORIES) {
    await db.prepare("DELETE FROM memories WHERE user_id = ? AND id = ?").bind(userId, existing[0].id).run();
  }
  const id = shortId();
  await db.prepare("INSERT INTO memories (id, user_id, content, created_at) VALUES (?, ?, ?, ?)")
    .bind(id, userId, content, Date.now()).run();
  return { ok: true, text: `انحفظت في الذاكرة برقم [${id}].`, id, content };
}

async function handleMemories(request, db, user, path) {
  const id = path.split("/")[2];
  if (request.method === "GET" && !id) return { memories: await listMemories(db, user.id) };
  if (request.method === "DELETE" && !id) {
    await db.prepare("DELETE FROM memories WHERE user_id = ?").bind(user.id).run();
    return { ok: true };
  }
  if (request.method === "DELETE" && /^[a-f0-9]{6}$/.test(id)) {
    await db.prepare("DELETE FROM memories WHERE user_id = ? AND id = ?").bind(user.id, id).run();
    return { ok: true };
  }
  throw new HttpError(404, "Not found");
}

// ===== الأدوات =====
function decodeEntities(s) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—", ndash: "–", hellip: "…", rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"' };
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try { return String.fromCodePoint(code); } catch { return m; }
    }
    return named[e.toLowerCase()] ?? m;
  });
}

function htmlToText(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
  let body = html
    .replace(/<(script|style|noscript|svg|iframe|template|head)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(nav|footer|aside)[\s\S]*?<\/\1>/gi, " ");
  const main = body.match(/<(main|article)[\s\S]*?<\/\1>/i);
  if (main && main[0].length > 500) body = main[0];
  body = body
    .replace(/<\s*(br|hr)\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article|blockquote|pre|table)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ");
  body = decodeEntities(body).replace(/[ \t\f\v\r]+/g, " ").replace(/\n\s*/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return { title: decodeEntities(title).trim(), text: body };
}

function isBlockedHost(host) {
  host = host.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  const v4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const [a, b] = [+v4[1], +v4[2]];
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  return host.startsWith("[");
}

async function fetchWithTimeout(url, init, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

async function toolFetchUrl(args) {
  let url;
  try { url = new URL(String(args?.url || "").trim()); } catch { return { ok: false, text: "الرابط غير صالح." }; }
  if (!/^https?:$/.test(url.protocol) || isBlockedHost(url.hostname)) return { ok: false, text: "هذا الرابط غير مسموح." };
  let res;
  try {
    res = await fetchWithTimeout(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NanoBot/1.0; +https://emad-alsulami.github.io/nano/)",
        "Accept": "text/html,application/xhtml+xml,text/plain,application/json;q=0.9,*/*;q=0.5",
        "Accept-Language": "ar,en;q=0.8",
      },
      redirect: "follow",
    }, 12000);
  } catch (e) {
    return { ok: false, text: "ما قدرت أفتح الصفحة (" + (e?.name === "AbortError" ? "انتهى الوقت" : String(e?.message || e)) + ")." };
  }
  if (!res.ok) return { ok: false, text: `الصفحة رجّعت خطأ ${res.status}.` };
  const type = (res.headers.get("content-type") || "").toLowerCase();
  if (!/text\/|json|xml/.test(type)) return { ok: false, text: `نوع المحتوى (${type || "غير معروف"}) ما أقدر أقرأه. أقدر أقرأ صفحات الويب والنصوص فقط.` };
  const raw = (await res.text()).slice(0, 1_500_000);
  let title = "", text = raw;
  if (/html|xml/.test(type)) ({ title, text } = htmlToText(raw));
  text = text.slice(0, TOOL_RESULT_CHARS);
  return { ok: true, text: `العنوان: ${title || "(بدون عنوان)"}\nالرابط: ${res.url || url}\n\n${text}`, title, url: res.url || url.toString() };
}

async function toolWebSearch(args, env) {
  const query = String(args?.query || "").trim().slice(0, 380);
  if (!query) return { ok: false, text: "الاستعلام فاضي." };
  const headers = { "Content-Type": "application/json" };
  if (env.TAVILY_API_KEY) headers.Authorization = "Bearer " + env.TAVILY_API_KEY;
  else headers["X-Tavily-Access-Mode"] = "keyless";
  let res;
  try {
    res = await fetchWithTimeout("https://api.tavily.com/search", {
      method: "POST",
      headers,
      body: JSON.stringify({ query, max_results: 5, search_depth: "basic", include_answer: false }),
    }, 15000);
  } catch (e) {
    return { ok: false, text: "خدمة البحث ما ردّت (" + String(e?.message || e) + ")." };
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const detail = data?.detail?.error || data?.error || data?.message || (typeof data?.detail === "string" ? data.detail : "");
    return { ok: false, text: `البحث فشل (${res.status})${detail ? ": " + String(detail).slice(0, 300) : ""}` };
  }
  const results = Array.isArray(data.results) ? data.results : [];
  if (!results.length) return { ok: true, text: "ما فيه نتائج." };
  const text = results.map((r, i) =>
    `${i + 1}. ${r.title || "(بدون عنوان)"}\n${r.url}\n${String(r.content || "").replace(/\s+/g, " ").slice(0, 700)}`
  ).join("\n\n");
  return { ok: true, text: text.slice(0, TOOL_RESULT_CHARS), sources: results.map((r) => ({ title: r.title, url: r.url })) };
}

// حاسبة آمنة (بدون eval)
function calculate(input) {
  let s = String(input || "")
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/×/g, "*").replace(/(\d)\s*[xX]\s*(?=\d)/g, "$1*").replace(/÷/g, "/").replace(/−/g, "-").replace(/٫/g, ".")
    .replace(/(\d),(?=\d{3}(\D|$))/g, "$1")
    .replace(/\*\*/g, "^").toLowerCase();
  const tokens = s.match(/\d+\.?\d*(e[+-]?\d+)?|\.\d+|[a-z_]+|[()+\-*/^%,]/g);
  if (!tokens || tokens.join("") !== s.replace(/\s+/g, "")) throw new Error("التعبير فيه رموز غير مفهومة");
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];
  const fns = {
    sqrt: Math.sqrt, abs: Math.abs, round: (x, d = 0) => Math.round(x * 10 ** d) / 10 ** d, floor: Math.floor, ceil: Math.ceil,
    log: Math.log10, ln: Math.log, log10: Math.log10, log2: Math.log2, exp: Math.exp,
    sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
    min: Math.min, max: Math.max, pow: Math.pow,
  };
  const consts = { pi: Math.PI, e: Math.E };
  function expr() {
    let v = term();
    while (peek() === "+" || peek() === "-") v = next() === "+" ? v + term() : v - term();
    return v;
  }
  function term() {
    let v = unary();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const op = next(), r = unary();
      v = op === "*" ? v * r : op === "/" ? v / r : v % r;
    }
    return v;
  }
  function unary() {
    if (peek() === "-") { next(); return -unary(); }
    if (peek() === "+") { next(); return unary(); }
    return power();
  }
  function power() {
    const b = primary();
    if (peek() === "^") { next(); return Math.pow(b, unary()); }
    return b;
  }
  function primary() {
    const t = next();
    if (t === undefined) throw new Error("التعبير ناقص");
    if (/^[\d.]/.test(t)) return parseFloat(t);
    if (t === "(") { const v = expr(); if (next() !== ")") throw new Error("قوس ناقص"); return v; }
    if (Object.hasOwn(consts, t)) return consts[t];
    if (Object.hasOwn(fns, t)) {
      if (next() !== "(") throw new Error(`الدالة ${t} تحتاج قوس`);
      const a = [expr()];
      while (peek() === ",") { next(); a.push(expr()); }
      if (next() !== ")") throw new Error("قوس ناقص");
      return fns[t](...a);
    }
    throw new Error(`"${t}" غير مفهوم`);
  }
  const v = expr();
  if (i < tokens.length) throw new Error("التعبير فيه زيادة غير مفهومة");
  if (!Number.isFinite(v)) throw new Error("النتيجة غير محددة (قسمة على صفر؟)");
  return +v.toPrecision(15);
}

const TOOL_LABELS = {
  web_search: (a) => `بحث: ${String(a?.query || "").slice(0, 80)}`,
  fetch_url: (a) => { try { return `قراءة: ${new URL(a.url).hostname}`; } catch { return "قراءة رابط"; } },
  calculate: (a) => `حساب: ${String(a?.expression || "").slice(0, 60)}`,
  remember: (a) => `حفظ في الذاكرة: ${String(a?.fact || "").slice(0, 80)}`,
  forget: (a) => `حذف من الذاكرة: ${String(a?.id || "")}`,
};

async function runTool(call, ctx) {
  const { name, args } = call;
  const label = (TOOL_LABELS[name] || (() => name))(args || {});
  try {
    let r;
    switch (name) {
      case "web_search": r = await toolWebSearch(args, ctx.env); break;
      case "fetch_url": r = await toolFetchUrl(args); break;
      case "calculate": {
        const v = calculate(args?.expression);
        r = { ok: true, text: `${args.expression} = ${v}` };
        break;
      }
      case "remember":
        if (!ctx.user || !ctx.db) { r = { ok: false, text: "الذاكرة متاحة للمستخدمين المسجلين فقط. قل للمستخدم يسجّل دخول." }; break; }
        r = await addMemory(ctx.db, ctx.user.id, args?.fact);
        if (r.ok && r.id) ctx.memoryChanged = true;
        break;
      case "forget": {
        if (!ctx.user || !ctx.db) { r = { ok: false, text: "الذاكرة متاحة للمستخدمين المسجلين فقط." }; break; }
        const id = String(args?.id || "").replace(/[\[\]\s]/g, "");
        if (!/^[a-f0-9]{6}$/.test(id)) { r = { ok: false, text: "رقم المعلومة غير صالح." }; break; }
        await ctx.db.prepare("DELETE FROM memories WHERE user_id = ? AND id = ?").bind(ctx.user.id, id).run();
        ctx.memoryChanged = true;
        r = { ok: true, text: `انحذفت المعلومة [${id}].` };
        break;
      }
      default: r = { ok: false, text: `الأداة "${name}" مو موجودة. الأدوات المتاحة: web_search, fetch_url, calculate, remember, forget.` };
    }
    return { name, label, ...r };
  } catch (e) {
    return { name, label, ok: false, text: "صار خطأ: " + String(e?.message || e) };
  }
}

// قراءة أوامر الأدوات من رد النموذج
function extractJsonObject(s, start) {
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return s.slice(start, i + 1);
  }
  return null;
}

function parseToolCalls(text) {
  const calls = [];
  const re = /<tool(?:_call)?>\s*/gi;
  let m;
  while ((m = re.exec(text)) && calls.length < MAX_TOOLS_PER_ROUND) {
    const start = text.indexOf("{", m.index);
    if (start < 0) break;
    const raw = extractJsonObject(text, start);
    if (!raw) break;
    try {
      const obj = JSON.parse(raw);
      const name = obj.name || obj.tool;
      const args = obj.args || obj.arguments || obj.parameters || {};
      if (typeof name === "string") calls.push({ name, args: typeof args === "string" ? JSON.parse(args) : args });
    } catch {}
    re.lastIndex = start + raw.length;
  }
  // احتياط: بعض النماذج تكتب JSON مباشرة بدون الوسم
  if (!calls.length) {
    const t = text.trim();
    if (t.startsWith("{") && /"name"\s*:/.test(t)) {
      const raw = extractJsonObject(t, 0);
      try {
        const obj = JSON.parse(raw);
        if (TOOL_LABELS[obj.name]) calls.push({ name: obj.name, args: obj.args || obj.arguments || obj.parameters || {} });
      } catch {}
    }
  }
  return calls;
}

const stripToolTags = (t) => t.replace(/<\/?tool(_call|_result)?[^>]*>/gi, "").trim();

// ===== الذكاء الاصطناعي =====
const IMAGE_RE = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/;

function prepareMessages(incoming) {
  const msgs = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_MESSAGES);
  const lastUser = msgs.map((m) => m.role).lastIndexOf("user");
  let hasImages = false;
  const out = msgs.map((m, idx) => {
    let text = m.content.slice(0, MAX_CHARS_PER_MSG);
    const imgs = Array.isArray(m.images) ? m.images.filter((u) => typeof u === "string" && u.length <= MAX_IMAGE_CHARS && IMAGE_RE.test(u)).slice(0, MAX_IMAGES) : [];
    if (m.role === "user" && idx === lastUser && imgs.length) {
      hasImages = true;
      return { role: "user", content: [{ type: "text", text: text || "وش رأيك في الصورة؟" }, ...imgs.map((url) => ({ type: "image_url", image_url: { url } }))] };
    }
    if (m.role === "user" && (imgs.length || m.hadImages)) text = "[أرفق المستخدم صورة هنا سابقاً]\n" + text;
    return { role: m.role, content: text };
  });
  return { messages: out, hasImages };
}

function dropImages(messages) {
  return messages.map((m) => Array.isArray(m.content)
    ? { role: m.role, content: "[أرفق المستخدم صورة، لكن ما قدرت أشوفها]\n" + (m.content.find((p) => p.type === "text")?.text || "") }
    : m);
}

async function runModel(env, messages) {
  const result = await env.AI.run(MODEL, { messages, max_tokens: MAX_TOKENS, temperature: 0.5 });
  return (
    (typeof result?.response === "string" && result.response) ||
    result?.choices?.[0]?.message?.content ||
    ""
  );
}

function modelError(err) {
  const msg = String(err?.message || err);
  if (/limit|quota|neuron|429|capacity/i.test(msg)) {
    return new HttpError(429, "خلص الحد المجاني اليومي، يتجدد الساعة 3 الفجر بتوقيت السعودية.");
  }
  return new HttpError(500, "صار خطأ في النموذج: " + msg);
}

async function handleAI(request, env) {
  if (!env.AI) throw new HttpError(500, "ما فيه ربط Workers AI. أضف Binding باسم AI من الإعدادات.");
  const body = await readJson(request);
  const { messages: history, hasImages } = prepareMessages(Array.isArray(body?.messages) ? body.messages : []);
  if (!history.length || history[history.length - 1].role !== "user") {
    throw new HttpError(400, "لازم آخر رسالة تكون من المستخدم.");
  }

  // مستخدم مسجّل؟ (اختياري)
  let user = null, memories = [];
  if (env.DB) {
    try {
      await ensureSchema(env.DB);
      user = await findUser(request, env.DB);
      if (user) memories = await listMemories(env.DB, user.id);
    } catch {}
  }

  const ctx = { env, db: env.DB, user, memoryChanged: false };
  const system = { role: "system", content: buildSystemPrompt({ memories, loggedIn: !!user, username: user?.username }) };
  let convo = [system, ...history];
  const steps = [];
  let imageNote = false;

  async function call(msgs) {
    try {
      return await runModel(env, msgs);
    } catch (err) {
      // لو النموذج رفض صيغة الصور، نكمل بدونها بدل ما نوقف
      if (hasImages && !imageNote && /image|content|schema|type/i.test(String(err?.message || err))) {
        imageNote = true;
        convo = dropImages(convo);
        return await runModel(env, convo);
      }
      throw err;
    }
  }

  let final = "";
  try {
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const out = await call(convo);
      const calls = round < MAX_TOOL_ROUNDS ? parseToolCalls(out) : [];
      if (!calls.length) { final = stripToolTags(out); break; }

      const results = await Promise.all(calls.map((c) => runTool(c, ctx)));
      results.forEach((r) => {
        const step = { tool: r.name, label: r.label, ok: r.ok };
        if (r.url) step.url = r.url;
        steps.push(step);
        if (r.sources) r.sources.slice(0, 5).forEach((s) => steps.push({ tool: "source", label: s.title || s.url, url: s.url, ok: true }));
      });

      convo.push({ role: "assistant", content: calls.map((c) => `<tool>${JSON.stringify(c)}</tool>`).join("\n") });
      convo.push({
        role: "user",
        content: results.map((r) => `<tool_result name="${r.name}" ok="${r.ok}">\n${r.text}\n</tool_result>`).join("\n\n") +
          "\n\n(هذي نتائج الأدوات، المستخدم ما يشوفها. استخدمها وجاوب المستخدم الحين. استخدم أداة ثانية فقط إذا ضروري.)",
      });
      if (round === MAX_TOOL_ROUNDS - 1) {
        convo.push({ role: "user", content: "جاوب الحين بالمعلومات اللي عندك بدون أي أدوات." });
      }
    }
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw modelError(err);
  }

  if (!final.trim()) throw new HttpError(502, "النموذج رجّع رد فاضي، جرّب مرة ثانية.");
  if (imageNote) final = "> ⚠️ ما قدرت أقرأ الصورة هالمرة، فجاوبت على النص بس.\n\n" + final;
  return { reply: final, steps: steps.filter((s) => s.tool !== "source").concat(steps.filter((s) => s.tool === "source")), memoryChanged: ctx.memoryChanged };
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
        version: 3,
        ai: env.AI ? "مربوط ✅" : "غير مربوط ❌ (أضف Workers AI باسم AI)",
        database: env.DB ? "مربوطة ✅" : "غير مربوطة ❌ (أضف D1 باسم DB)",
        search: env.TAVILY_API_KEY ? "مفعّل بمفتاح ✅" : "مفعّل (الوضع المجاني المحدود) ✅",
      }, 200, origin);
    }

    if (!ALLOWED_ORIGINS.includes(origin)) {
      return json({ error: "Origin not allowed" }, 403, origin);
    }

    try {
      if (method === "POST" && (path === "/" || path === "/chat")) {
        return json(await handleAI(request, env), 200, origin);
      }

      if (path.startsWith("/auth") || path.startsWith("/chats") || path.startsWith("/memories")) {
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
        if (path === "/chats" || path.startsWith("/chats/")) return json(await handleChats(request, db, user, path), 200, origin);
        if (path === "/memories" || path.startsWith("/memories/")) return json(await handleMemories(request, db, user, path), 200, origin);
      }

      return json({ error: "Not found" }, 404, origin);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status, origin);
      return json({ error: "خطأ في السيرفر: " + String(err?.message || err) }, 500, origin);
    }
  },
};
