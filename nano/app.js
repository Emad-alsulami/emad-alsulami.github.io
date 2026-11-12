(function () {
  "use strict";

  const WORKER_URL = ((window.NANO_CONFIG && window.NANO_CONFIG.WORKER_URL) || "").trim().replace(/\/+$/, "");
  const GUEST_KEY = "nano.chats.v2";
  const OLD_KEY = "nano.chat.v1";
  const AUTH_KEY = "nano.auth";
  const cloudKey = (u) => "nano.cloud.v1:" + u.toLowerCase();
  const MAX_LOCAL_CHATS = 200;

  const $ = (id) => document.getElementById(id);
  const chat = $("chat");
  const scroller = $("scroller");
  const welcome = $("welcome");
  const form = $("form");
  const input = $("input");
  const sendBtn = $("send");
  const listEl = $("chatList");
  const searchEl = $("search");
  const sidebar = $("sidebar");
  const backdrop = $("backdrop");

  // ===== Storage helpers =====
  function readLS(key) {
    try { return JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { return null; }
  }
  function writeLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  function removeLS(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function makeTitle(messages) {
    const first = (messages || []).find((m) => m.role === "user");
    const t = (first ? first.content : "محادثة جديدة").replace(/\s+/g, " ").trim();
    return t.length > 48 ? t.slice(0, 48) + "…" : t;
  }

  // ===== State =====
  // chat: { id, title, createdAt, updatedAt, messages: [{role, content}] | null (لسا ما انحمّلت من السحابة) }
  let auth = readLS(AUTH_KEY); // { token, username } | null
  if (!auth || !auth.token || !auth.username) auth = null;

  let state = loadState();
  let activeId = state.activeId && getChat(state.activeId) ? state.activeId : null;
  let pendingChatId = null;
  let loadingChatId = null;

  function storeKey() {
    return auth ? cloudKey(auth.username) : GUEST_KEY;
  }

  function loadState() {
    let data = readLS(storeKey());
    if (!data || !Array.isArray(data.chats)) data = { chats: [], activeId: null, dirty: [] };
    if (!Array.isArray(data.dirty)) data.dirty = [];

    // ترحيل المحادثة من النسخة الأولى (محادثة وحدة)
    if (!auth) {
      const old = readLS(OLD_KEY);
      if (Array.isArray(old) && old.length) {
        const now = Date.now();
        const c = { id: uid(), title: makeTitle(old), createdAt: now, updatedAt: now, messages: old };
        data.chats.unshift(c);
        data.activeId = c.id;
        writeLS(GUEST_KEY, data);
      }
      removeLS(OLD_KEY);
    }
    return data;
  }

  function save() {
    state.activeId = activeId;
    state.chats.sort((a, b) => b.updatedAt - a.updatedAt);
    if (!auth && state.chats.length > MAX_LOCAL_CHATS) state.chats.length = MAX_LOCAL_CHATS;
    if (!writeLS(storeKey(), state) && state.chats.length > 10) {
      // المساحة امتلأت: في وضع الحساب نفرّغ رسائل المحادثات القديمة من الكاش (موجودة في السحابة)
      if (auth) state.chats.slice(10).forEach((c) => { if (!isDirty(c.id)) c.messages = null; });
      else state.chats.length = Math.floor(state.chats.length * 0.8);
      writeLS(storeKey(), state);
    }
  }

  function getChat(id) {
    return state.chats.find((c) => c.id === id) || null;
  }
  const activeChat = () => getChat(activeId);
  const isDirty = (id) => state.dirty.includes(id);
  function markDirty(id, on) {
    state.dirty = state.dirty.filter((x) => x !== id);
    if (on) state.dirty.push(id);
  }

  // ===== Toast =====
  let toastTimer = null;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3500);
  }

  // ===== API =====
  async function api(path, opts) {
    opts = opts || {};
    const headers = { "Content-Type": "application/json" };
    if (opts.auth !== false && auth) headers.Authorization = "Bearer " + auth.token;
    let res;
    try {
      res = await fetch(WORKER_URL + path, {
        method: opts.method || "GET",
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
    } catch (e) {
      const err = new Error("ما قدرت أوصل للسيرفر. تأكد من الإنترنت.");
      err.status = 0;
      throw err;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || "صار خطأ (" + res.status + ").");
      err.status = res.status;
      if (res.status === 401 && headers.Authorization) sessionExpired();
      throw err;
    }
    return data;
  }

  // ===== Cloud sync =====
  let syncError = false;

  function serializeChat(c) {
    return { title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt, messages: c.messages };
  }

  // حفظ كل محادثة بالترتيب (طابور لكل محادثة) عشان نسخة قديمة ما تكتب فوق نسخة أحدث
  const pushQueue = new Map();

  function pushChat(id) {
    if (!auth) return Promise.resolve();
    const c = getChat(id);
    if (!c || !Array.isArray(c.messages)) return Promise.resolve();
    markDirty(id, true);
    save();
    const run = (pushQueue.get(id) || Promise.resolve()).then(() => doPush(id));
    pushQueue.set(id, run);
    run.finally(() => { if (pushQueue.get(id) === run) pushQueue.delete(id); });
    return run;
  }

  async function doPush(id) {
    const c = getChat(id);
    if (!auth || !c || !Array.isArray(c.messages)) return;
    const sentAt = c.updatedAt;
    try {
      await api("/chats/" + id, { method: "PUT", body: serializeChat(c) });
      const now = getChat(id);
      if (auth && (!now || now.updatedAt === sentAt)) { markDirty(id, false); save(); }
      if (!state.dirty.length) setSyncError(false);
    } catch (e) {
      if (auth) setSyncError(true, e.message);
    }
  }

  async function flushDirty() {
    if (!auth || !state.dirty.length) return;
    for (const id of state.dirty.slice()) {
      if (!getChat(id)) { markDirty(id, false); continue; }
      await pushChat(id);
      if (!auth) return;
    }
    if (!state.dirty.length) setSyncError(false);
  }

  let lastRefresh = 0;
  async function refreshFromServer(force) {
    if (!auth || !WORKER_URL) return;
    if (!force && Date.now() - lastRefresh < 10000) return;
    lastRefresh = Date.now();
    let server;
    try {
      server = (await api("/chats")).chats || [];
    } catch (e) {
      if (auth && e.status !== 401) setSyncError(true, e.message);
      return;
    }
    if (!auth) return;

    const next = [];
    const seen = new Set();
    server.forEach((s) => {
      seen.add(s.id);
      const local = getChat(s.id);
      if (local && (isDirty(s.id) || local.updatedAt >= s.updatedAt)) next.push(local);
      else next.push({ id: s.id, title: s.title, createdAt: s.createdAt, updatedAt: s.updatedAt, messages: null });
    });
    // محادثات محلية ما وصلت السحابة للحين (dirty) نخليها؛ الباقي انحذف من جهاز ثاني
    state.chats.forEach((c) => { if (!seen.has(c.id) && isDirty(c.id)) next.push(c); });
    state.chats = next;
    state.dirty = state.dirty.filter((id) => getChat(id));
    if (activeId && !getChat(activeId)) activeId = null;
    save();
    renderList();
    const a = activeChat();
    if (a && a.messages === null) loadChat(a.id);
    else if (pendingChatId === null) renderChat();
    flushDirty();
  }

  async function loadChat(id) {
    if (!auth || loadingChatId === id) return;
    loadingChatId = id;
    if (id === activeId) renderChat();
    try {
      const { chat: c } = await api("/chats/" + id);
      const local = getChat(id);
      if (local && auth) {
        local.messages = c.messages;
        local.title = c.title;
        local.updatedAt = c.updatedAt;
        save();
      }
    } catch (e) {
      if (e.status === 404) {
        state.chats = state.chats.filter((x) => x.id !== id);
        if (activeId === id) activeId = null;
        save();
        renderList();
        toast("المحادثة انحذفت من جهاز ثاني.");
      } else if (e.status !== 401) {
        toast(e.message);
      }
    } finally {
      loadingChatId = null;
      if (id === activeId) renderChat();
    }
  }

  // ===== Auth =====
  function switchStore(newAuth) {
    auth = newAuth;
    if (auth) writeLS(AUTH_KEY, auth); else removeLS(AUTH_KEY);
    state = loadState();
    activeId = state.activeId && getChat(state.activeId) ? state.activeId : null;
    pendingChatId = null;
    syncError = false;
    renderAccount();
    renderChat();
    renderList();
    autosize();
  }

  function sessionExpired() {
    if (!auth) return;
    removeLS(cloudKey(auth.username));
    switchStore(null);
    toast("انتهت جلستك، سجّل دخول مرة ثانية.");
  }

  async function onLoggedIn(newAuth) {
    const guest = readLS(GUEST_KEY);
    const guestChats = guest && Array.isArray(guest.chats) ? guest.chats.filter((c) => Array.isArray(c.messages) && c.messages.length) : [];
    switchStore(newAuth);

    if (guestChats.length && confirm("عندك " + guestChats.length + " محادثة محفوظة في هذا المتصفح. تبي تنقلها لحسابك عشان تتزامن؟")) {
      guestChats.forEach((c) => {
        if (!getChat(c.id)) state.chats.push(c);
        markDirty(c.id, true);
      });
      save();
      removeLS(GUEST_KEY);
    }
    renderList();
    await refreshFromServer(true);
    toast("هلا " + auth.username + " 👋 محادثاتك صارت متزامنة.");
  }

  async function logout() {
    if (!auth) return;
    if (state.dirty.length && !confirm("فيه محادثات ما انحفظت في السحابة للحين وبتضيع. تبي تطلع؟")) return;
    if (!state.dirty.length && !confirm("تسجّل خروج؟")) return;
    const username = auth.username;
    api("/auth/logout", { method: "POST" }).catch(() => {});
    removeLS(cloudKey(username)); // نمسح النسخة المحلية عشان الخصوصية لو الجهاز مشترك
    switchStore(null);
    toast("طلعت من حسابك.");
  }

  // ===== Auth modal =====
  let authMode = "login";
  function openAuth(open) {
    $("authModal").hidden = !open;
    $("authErr").textContent = "";
    if (open) {
      openSidebar(false);
      setTimeout(() => $("authUser").focus(), 30);
    }
  }
  function setAuthMode(mode) {
    authMode = mode;
    document.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.mode === mode));
    $("authTitle").textContent = mode === "login" ? "تسجيل الدخول" : "حساب جديد";
    $("authSubmit").textContent = mode === "login" ? "دخول" : "إنشاء الحساب";
    $("authPass").autocomplete = mode === "login" ? "current-password" : "new-password";
    $("authErr").textContent = "";
  }

  async function submitAuth(e) {
    e.preventDefault();
    const username = $("authUser").value.trim();
    const password = $("authPass").value;
    const btn = $("authSubmit");
    $("authErr").textContent = "";
    btn.disabled = true;
    try {
      const data = await api(authMode === "login" ? "/auth/login" : "/auth/register", {
        method: "POST",
        auth: false,
        body: { username, password },
      });
      $("authPass").value = "";
      openAuth(false);
      await onLoggedIn({ token: data.token, username: data.username });
    } catch (err) {
      $("authErr").textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  }

  // ===== Markdown =====
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function renderMarkdown(text) {
    if (window.marked && window.DOMPurify) {
      const html = window.marked.parse(text, { gfm: true, breaks: true });
      const wrap = document.createElement("div");
      wrap.innerHTML = window.DOMPurify.sanitize(html);
      wrap.querySelectorAll("table").forEach((t) => {
        const box = document.createElement("div");
        box.className = "table-wrap";
        t.parentNode.insertBefore(box, t);
        box.appendChild(t);
      });
      wrap.querySelectorAll("a").forEach((a) => { a.target = "_blank"; a.rel = "noopener"; });
      wrap.querySelectorAll("p, li, td, th, h1, h2, h3, h4, blockquote").forEach((el) => el.setAttribute("dir", "auto"));
      return wrap.innerHTML;
    }
    return "<p style='white-space:pre-wrap'>" + escapeHtml(text) + "</p>";
  }

  // ===== Messages UI =====
  function avatar() {
    const a = document.createElement("div");
    a.className = "logo avatar";
    a.innerHTML = "<span></span>";
    return a;
  }

  function addMessage(role, content, opts) {
    welcome.hidden = true;
    const row = document.createElement("div");
    row.className = "msg " + (role === "user" ? "user" : "bot") + (opts && opts.error ? " error" : "") + (opts && opts.typing ? " typing-row" : "");
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    if (role === "user") {
      bubble.textContent = content;
      bubble.setAttribute("dir", "auto");
    } else if (opts && opts.typing) {
      bubble.innerHTML = '<div class="typing"><i></i><i></i><i></i></div>';
    } else if (opts && opts.error) {
      bubble.textContent = content;
      const retry = document.createElement("button");
      retry.className = "ghost retry";
      retry.type = "button";
      retry.textContent = "↻ إعادة المحاولة";
      retry.onclick = () => { row.remove(); request(activeId); };
      bubble.appendChild(document.createElement("br"));
      bubble.appendChild(retry);
    } else {
      bubble.innerHTML = renderMarkdown(content);
    }
    row.appendChild(avatar());
    row.appendChild(bubble);
    chat.appendChild(row);
    scrollDown();
    return row;
  }

  function scrollDown() {
    requestAnimationFrame(() => { scroller.scrollTop = scroller.scrollHeight; });
  }

  const busy = () => pendingChatId !== null;

  function autosize() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 200) + "px";
    const c = activeChat();
    sendBtn.disabled = busy() || !input.value.trim() || (c && c.messages === null);
  }

  function renderChat() {
    chat.querySelectorAll(".msg").forEach((m) => m.remove());
    const c = activeChat();
    if (c && c.messages === null) {
      welcome.hidden = true;
      addMessage("assistant", "", { typing: true });
      if (loadingChatId !== c.id) loadChat(c.id);
    } else {
      const msgs = c ? c.messages : [];
      welcome.hidden = msgs.length > 0;
      msgs.forEach((m) => addMessage(m.role, m.content));
      if (pendingChatId && pendingChatId === activeId) addMessage("assistant", "", { typing: true });
    }
    document.title = c ? c.title + " | نانو" : "نانو | Nano — مستشارك الذكي";
    autosize();
  }

  // ===== Sidebar UI =====
  const TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>';

  function groupLabel(ts) {
    const d = new Date(ts);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
    if (diff <= 0) return "اليوم";
    if (diff === 1) return "أمس";
    if (diff < 7) return "آخر 7 أيام";
    if (diff < 30) return "آخر 30 يوم";
    return "أقدم";
  }

  function renderList() {
    const q = searchEl.value.trim().toLowerCase();
    const chats = state.chats
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .filter((c) => !q || c.title.toLowerCase().includes(q) ||
        (Array.isArray(c.messages) && c.messages.some((m) => m.content.toLowerCase().includes(q))));

    $("chatCount").textContent = state.chats.length;
    listEl.innerHTML = "";

    if (!chats.length) {
      const li = document.createElement("li");
      li.className = "side-empty";
      li.textContent = q ? "ما لقيت محادثة فيها هالكلمة." : "ما فيه محادثات للحين. أول رسالة ترسلها بتنحفظ هنا.";
      listEl.appendChild(li);
      return;
    }

    let lastGroup = "";
    chats.forEach((c) => {
      const g = groupLabel(c.updatedAt);
      if (g !== lastGroup) {
        const gl = document.createElement("li");
        gl.className = "group-label";
        gl.textContent = g;
        listEl.appendChild(gl);
        lastGroup = g;
      }
      const li = document.createElement("li");
      li.className = "chat-item" + (c.id === activeId ? " active" : "");
      const open = document.createElement("button");
      open.type = "button";
      open.className = "open";
      open.textContent = (auth && isDirty(c.id) ? "⏳ " : "") + c.title;
      open.title = c.title;
      open.setAttribute("dir", "auto");
      open.onclick = () => openChat(c.id);
      const del = document.createElement("button");
      del.type = "button";
      del.className = "del";
      del.title = "حذف المحادثة";
      del.setAttribute("aria-label", "حذف المحادثة");
      del.innerHTML = TRASH;
      del.onclick = (e) => { e.stopPropagation(); deleteChat(c.id); };
      li.appendChild(open);
      li.appendChild(del);
      listEl.appendChild(li);
    });
  }

  function renderAccount() {
    const canSync = !!WORKER_URL;
    $("acctGuest").hidden = !!auth;
    $("acctUser").hidden = !auth;
    $("loginBtn").hidden = !canSync;
    $("hintStore").textContent = auth ? "محادثاتك متزامنة مع حسابك ☁️" : "محادثاتك محفوظة في متصفحك فقط";
    if (auth) {
      $("acctName").textContent = auth.username;
      $("acctAvatar").textContent = auth.username.charAt(0);
    }
    renderSyncNote();
  }

  function setSyncError(on, msg) {
    syncError = !!on;
    renderSyncNote(msg);
    renderList();
  }

  function renderSyncNote(msg) {
    const n = $("syncNote");
    if (!auth) return;
    if (syncError && state.dirty.length) {
      n.textContent = "⚠️ " + state.dirty.length + " محادثة ما انحفظت في السحابة" + (msg ? " (" + msg + ")" : "") + ". بحاول مرة ثانية تلقائياً.";
      n.classList.add("err");
    } else {
      n.textContent = "☁️ متزامنة مع حسابك";
      n.classList.remove("err");
    }
  }

  function openSidebar(open) {
    sidebar.classList.toggle("open", open);
    backdrop.classList.toggle("open", open);
  }

  // ===== Actions =====
  function openChat(id) {
    activeId = id;
    save();
    renderChat();
    renderList();
    openSidebar(false);
    input.focus();
  }

  function newChat() {
    activeId = null; // تنحفظ أول ما ترسل أول رسالة
    save();
    renderChat();
    renderList();
    openSidebar(false);
    input.focus();
  }

  async function deleteChat(id) {
    const c = getChat(id);
    if (!c) return;
    if (!confirm("تحذف محادثة \"" + c.title + "\"؟")) return;
    state.chats = state.chats.filter((x) => x.id !== id);
    markDirty(id, false);
    if (pendingChatId === id) pendingChatId = null;
    if (activeId === id) activeId = null;
    save();
    renderChat();
    renderList();
    if (auth) {
      try { await api("/chats/" + id, { method: "DELETE" }); }
      catch (e) { if (e.status !== 401) toast("ما قدرت أحذفها من السحابة: " + e.message); }
    }
  }

  async function clearAll() {
    if (!state.chats.length) return;
    const where = auth ? " من كل أجهزتك" : "";
    if (!confirm("تحذف كل المحادثات (" + state.chats.length + ")" + where + "؟ ما تقدر ترجعها.")) return;
    state.chats = [];
    state.dirty = [];
    activeId = null;
    pendingChatId = null;
    save();
    renderChat();
    renderList();
    if (auth) {
      try { await api("/chats", { method: "DELETE" }); }
      catch (e) { if (e.status !== 401) toast("ما قدرت أحذفها من السحابة: " + e.message); }
    }
  }

  // ===== Nano request =====
  async function request(chatId) {
    const c = getChat(chatId);
    if (!c) return;
    if (!WORKER_URL) {
      addMessage("assistant", "نانو لسا ما انربط بالـ Worker. حط رابطه في nano/config.js.", { error: true });
      return;
    }
    pendingChatId = chatId;
    autosize();
    if (chatId === activeId) addMessage("assistant", "", { typing: true });

    let reply = null, error = null;
    try {
      reply = (await api("/chat", { method: "POST", auth: false, body: { messages: c.messages } })).reply;
    } catch (e) {
      error = e.message;
    }

    if (pendingChatId !== chatId) return; // انحذفت أو تغيّر الحساب أثناء الانتظار
    pendingChatId = null;
    const still = getChat(chatId);
    if (reply && still) {
      still.messages.push({ role: "assistant", content: reply });
      still.updatedAt = Date.now();
      save();
      renderList();
      pushChat(chatId);
    }
    if (chatId === activeId) {
      chat.querySelectorAll(".typing-row").forEach((r) => r.remove());
      if (reply) addMessage("assistant", reply);
      else addMessage("assistant", error, { error: true });
    }
    autosize();
    input.focus();
  }

  function send(text) {
    text = (text || "").trim();
    if (!text || busy()) return;
    let c = activeChat();
    if (c && c.messages === null) return;
    if (!c) {
      const now = Date.now();
      c = { id: uid(), title: "", createdAt: now, updatedAt: now, messages: [] };
      state.chats.unshift(c);
      activeId = c.id;
    }
    c.messages.push({ role: "user", content: text });
    if (!c.title) c.title = makeTitle(c.messages);
    c.updatedAt = Date.now();
    save();
    renderList();
    addMessage("user", text);
    input.value = "";
    autosize();
    pushChat(c.id); // نحفظ رسالتك في السحابة حتى لو فشل الرد
    request(c.id);
  }

  // ===== Events =====
  form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); });
  input.addEventListener("input", autosize);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      send(input.value);
    }
  });
  $("chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) send(chip.dataset.prompt);
  });
  $("newChat").addEventListener("click", newChat);
  document.querySelectorAll("[data-clear]").forEach((b) => b.addEventListener("click", clearAll));
  $("menuBtn").addEventListener("click", () => openSidebar(!sidebar.classList.contains("open")));
  backdrop.addEventListener("click", () => openSidebar(false));
  searchEl.addEventListener("input", renderList);

  $("loginBtn").addEventListener("click", () => { setAuthMode("login"); openAuth(true); });
  $("logoutBtn").addEventListener("click", logout);
  $("authClose").addEventListener("click", () => openAuth(false));
  $("authModal").addEventListener("click", (e) => { if (e.target.id === "authModal") openAuth(false); });
  $("authForm").addEventListener("submit", submitAuth);
  document.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => setAuthMode(b.dataset.mode)));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { openSidebar(false); openAuth(false); }
  });

  // تحديث من السحابة لما ترجع للتبويب، وإعادة محاولة لما يرجع النت
  window.addEventListener("focus", () => refreshFromServer(false));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshFromServer(false); });
  window.addEventListener("online", () => { flushDirty(); refreshFromServer(true); });

  // مزامنة لو نانو مفتوح في أكثر من تبويب
  window.addEventListener("storage", (e) => {
    if (e.key === AUTH_KEY) {
      const a = readLS(AUTH_KEY);
      if ((a && a.username) !== (auth && auth.username)) switchStore(a && a.token ? a : null);
      return;
    }
    if (e.key !== storeKey() || busy()) return;
    state = loadState();
    if (activeId && !getChat(activeId)) activeId = null;
    renderChat();
    renderList();
  });

  if (!WORKER_URL) $("setupNotice").hidden = false;
  save();
  renderAccount();
  renderChat();
  renderList();
  autosize();
  refreshFromServer(true);
})();
