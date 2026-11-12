(function () {
  "use strict";

  const WORKER_URL = ((window.NANO_CONFIG && window.NANO_CONFIG.WORKER_URL) || "").trim();
  const STORAGE_KEY = "nano.chat.v1";

  const $ = (id) => document.getElementById(id);
  const chat = $("chat");
  const scroller = $("scroller");
  const welcome = $("welcome");
  const form = $("form");
  const input = $("input");
  const sendBtn = $("send");

  let messages = load();
  let busy = false;

  // ===== Storage (يتحمل لو المتصفح مانع التخزين) =====
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch (e) {}
  }

  // ===== Markdown =====
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function renderMarkdown(text) {
    if (window.marked && window.DOMPurify) {
      const html = window.marked.parse(text, { gfm: true, breaks: true });
      const clean = window.DOMPurify.sanitize(html);
      const wrap = document.createElement("div");
      wrap.innerHTML = clean;
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

  // ===== UI =====
  function avatar() {
    const a = document.createElement("div");
    a.className = "logo avatar";
    a.innerHTML = "<span></span>";
    return a;
  }

  function addMessage(role, content, opts) {
    welcome.hidden = true;
    const row = document.createElement("div");
    row.className = "msg " + (role === "user" ? "user" : "bot") + (opts && opts.error ? " error" : "");
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
      retry.onclick = () => { row.remove(); request(); };
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

  function autosize() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 200) + "px";
    sendBtn.disabled = busy || !input.value.trim();
  }

  function renderAll() {
    chat.querySelectorAll(".msg").forEach((m) => m.remove());
    welcome.hidden = messages.length > 0;
    messages.forEach((m) => addMessage(m.role, m.content));
  }

  // ===== API =====
  async function request() {
    if (!WORKER_URL) {
      addMessage("assistant", "نانو لسا ما انربط بالـ Worker. حط رابطه في nano/config.js.", { error: true });
      return;
    }
    busy = true;
    autosize();
    const typing = addMessage("assistant", "", { typing: true });
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json().catch(() => ({}));
      typing.remove();
      if (!res.ok || !data.reply) {
        addMessage("assistant", data.error || "صار خطأ (" + res.status + ")، جرّب مرة ثانية.", { error: true });
      } else {
        messages.push({ role: "assistant", content: data.reply });
        save();
        addMessage("assistant", data.reply);
      }
    } catch (e) {
      typing.remove();
      addMessage("assistant", "ما قدرت أوصل للسيرفر. تأكد من الإنترنت ومن رابط الـ Worker.", { error: true });
    } finally {
      busy = false;
      autosize();
      input.focus();
    }
  }

  function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    messages.push({ role: "user", content: text });
    save();
    addMessage("user", text);
    input.value = "";
    autosize();
    request();
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
  $("newChat").addEventListener("click", () => {
    if (busy) return;
    if (messages.length && !confirm("تبدأ محادثة جديدة؟ المحادثة الحالية بتنحذف.")) return;
    messages = [];
    save();
    renderAll();
    input.focus();
  });

  if (!WORKER_URL) $("setupNotice").hidden = false;
  renderAll();
  autosize();
})();
