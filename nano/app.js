(function () {
  "use strict";

  const WORKER_URL = ((window.NANO_CONFIG && window.NANO_CONFIG.WORKER_URL) || "").trim();
  const STORE_KEY = "nano.chats.v2";
  const OLD_KEY = "nano.chat.v1";
  const MAX_CHATS = 200;

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

  // ===== State =====
  // chats: [{ id, title, createdAt, updatedAt, messages: [{role, content}] }]
  let state = load();
  let activeId = state.activeId && state.chats.some((c) => c.id === state.activeId) ? state.activeId : null;
  let pendingChatId = null; // المحادثة اللي تنتظر رد

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function load() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(STORE_KEY) || "null"); } catch (e) {}
    if (!data || !Array.isArray(data.chats)) data = { chats: [], activeId: null };

    // ترحيل المحادثة من النسخة القديمة (محادثة وحدة)
    try {
      const old = JSON.parse(localStorage.getItem(OLD_KEY) || "null");
      if (Array.isArray(old) && old.length) {
        const now = Date.now();
        const c = { id: uid(), title: makeTitle(old), createdAt: now, updatedAt: now, messages: old };
        data.chats.unshift(c);
        data.activeId = c.id;
      }
      localStorage.removeItem(OLD_KEY);
    } catch (e) {}
    return data;
  }

  function save() {
    state.activeId = activeId;
    state.chats.sort((a, b) => b.updatedAt - a.updatedAt);
    if (state.chats.length > MAX_CHATS) state.chats.length = MAX_CHATS;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      // المساحة امتلأت: احذف أقدم المحادثات وحاول مرة ثانية
      if (state.chats.length > 10) {
        state.chats.length = Math.floor(state.chats.length * 0.8);
        try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e2) {}
      }
    }
  }

  function makeTitle(messages) {
    const first = messages.find((m) => m.role === "user");
    const t = (first ? first.content : "محادثة جديدة").replace(/\s+/g, " ").trim();
    return t.length > 48 ? t.slice(0, 48) + "…" : t;
  }

  const getChat = (id) => state.chats.find((c) => c.id === id) || null;
  const activeChat = () => getChat(activeId);

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

  function busy() {
    return pendingChatId !== null;
  }

  function autosize() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 200) + "px";
    sendBtn.disabled = busy() || !input.value.trim();
  }

  function renderChat() {
    chat.querySelectorAll(".msg").forEach((m) => m.remove());
    const c = activeChat();
    const msgs = c ? c.messages : [];
    welcome.hidden = msgs.length > 0;
    msgs.forEach((m) => addMessage(m.role, m.content));
    if (pendingChatId && pendingChatId === activeId) addMessage("assistant", "", { typing: true });
    document.title = c ? c.title + " | نانو" : "نانو | Nano — مستشارك الذكي";
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
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.messages.some((m) => m.content.toLowerCase().includes(q)));

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
      open.textContent = c.title;
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

  function deleteChat(id) {
    const c = getChat(id);
    if (!c) return;
    if (!confirm("تحذف محادثة \"" + c.title + "\"؟")) return;
    state.chats = state.chats.filter((x) => x.id !== id);
    if (pendingChatId === id) pendingChatId = null;
    if (activeId === id) activeId = null;
    save();
    renderChat();
    renderList();
    autosize();
  }

  function clearAll() {
    if (!state.chats.length) return;
    if (!confirm("تحذف كل المحادثات (" + state.chats.length + ")؟ ما تقدر ترجعها.")) return;
    state.chats = [];
    activeId = null;
    pendingChatId = null;
    save();
    renderChat();
    renderList();
    autosize();
  }

  // ===== API =====
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
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: c.messages }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) error = data.error || "صار خطأ (" + res.status + ")، جرّب مرة ثانية.";
      else reply = data.reply;
    } catch (e) {
      error = "ما قدرت أوصل للسيرفر. تأكد من الإنترنت ومن رابط الـ Worker.";
    }

    if (pendingChatId !== chatId) return; // المحادثة انحذفت أثناء الانتظار
    pendingChatId = null;
    const still = getChat(chatId);
    if (reply && still) {
      still.messages.push({ role: "assistant", content: reply });
      still.updatedAt = Date.now();
      save();
      renderList();
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
  $("clearAll").addEventListener("click", clearAll);
  $("menuBtn").addEventListener("click", () => openSidebar(!sidebar.classList.contains("open")));
  backdrop.addEventListener("click", () => openSidebar(false));
  searchEl.addEventListener("input", renderList);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") openSidebar(false); });
  // مزامنة لو نانو مفتوح في أكثر من تبويب
  window.addEventListener("storage", (e) => {
    if (e.key !== STORE_KEY || busy()) return;
    state = load();
    if (activeId && !getChat(activeId)) activeId = null;
    renderChat();
    renderList();
  });

  if (!WORKER_URL) $("setupNotice").hidden = false;
  save();
  renderChat();
  renderList();
  autosize();
})();
