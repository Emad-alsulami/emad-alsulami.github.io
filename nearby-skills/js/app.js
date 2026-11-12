/* Nearby Skills — app logic (vanilla JS, no build step) */
(function () {
  'use strict';

  /* ---------- state ---------- */
  var KEY = 'nearby-skills:v1';
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && s.v === SEED.v) return s;
    } catch (e) { /* storage unavailable */ }
    return clone(SEED);
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

  var S = load();
  var ui = { view: 'nearby', convo: null, offerFilter: 'all', cat: 'all', q: '', msgFilter: 'all', msgQ: '', typing: null };
  var lastFocus = null;

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var tr = function (x) { return x == null ? '' : typeof x === 'string' ? x : (x[S.lang] != null ? x[S.lang] : x.en); };
  function t(k, v) {
    var s = (STR[S.lang] && STR[S.lang][k]) != null ? STR[S.lang][k] : (STR.en[k] != null ? STR.en[k] : k);
    if (typeof s === 'function') return s(v || {});
    if (v) Object.keys(v).forEach(function (n) { s = s.split('{' + n + '}').join(v[n]); });
    return s;
  }
  var person = function (id) { return id === 'me' ? { name: S.profile.name, color: '#4A5A2F' } : PEOPLE[id]; };
  var pname = function (id) { return tr(person(id).name); };
  var km = function (n) { return t('km', { n: n }); };
  var now = function () { var d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  var getOffer = function (id) { return S.offers.filter(function (o) { return o.id === id; })[0]; };
  var getConvo = function (id) { return S.convos.filter(function (c) { return c.id === id; })[0]; };
  var uid = function (p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); };

  function avatar(id, size) {
    var p = person(id), n = tr(p.name).trim();
    return '<span class="avatar ' + (size || 'md') + '" style="--c:' + p.color + '" aria-hidden="true">' + esc(n.charAt(0)) + '</span>';
  }
  function stars(r, c) {
    return '<span class="rating">' + ic('star', 'fill star') + '<b>' + Number(r).toFixed(1) + '</b><span class="muted">(' + c + ')</span></span>';
  }

  /* ---------- shared pieces ---------- */
  function navHTML(bottom) {
    var items = [['nearby', 'sprout'], ['messages', 'chat'], ['skills', 'star']];
    var unread = S.convos.reduce(function (a, c) { return a + (c.unread || 0); }, 0);
    return items.map(function (it) {
      var on = ui.view === it[0];
      var badge = it[0] === 'messages' && unread ? '<span class="nav-badge">' + unread + '</span>' : '';
      return '<a href="#' + it[0] + '" class="' + (on ? 'on' : '') + '"' + (on ? ' aria-current="page"' : '') + '>' +
        '<span class="nav-ic">' + ic(it[1], on && bottom ? 'fill-soft' : '') + badge + '</span><span>' + t('nav.' + it[0]) + '</span></a>';
    }).join('');
  }

  function pageHead(eyebrow, title, lede, art) {
    return '<section class="page-head">' +
      '<div><p class="eyebrow">' + eyebrow + '</p><h1 class="display">' + title + '</h1><p class="lede">' + lede + '</p></div>' +
      '<div class="head-art">' + ILLU(art) + '</div></section>';
  }

  /* ---------- NEARBY ---------- */
  function filteredOffers() {
    var q = ui.q.trim().toLowerCase();
    return S.offers.filter(function (o) {
      if (o.owner === 'me') return false;
      if (ui.offerFilter !== 'all' && o.type + 's' !== ui.offerFilter) return false;
      if (ui.cat !== 'all' && o.cat !== ui.cat) return false;
      if (!q) return true;
      var hay = [o.title.ar || o.title, o.title.en || '', tr(o.desc), pname(o.owner), tr(o.wants), tr(CATS[o.cat].label)].join(' ').toLowerCase();
      return hay.indexOf(q) > -1;
    });
  }

  function offerCard(o) {
    var c = CATS[o.cat];
    var meta = o.reviews ? stars(o.rating, o.reviews) : '<span class="pill-new">' + t('new.badge') + '</span>';
    return '<article class="offer" data-action="open-offer" data-id="' + o.id + '" tabindex="0" role="button" aria-label="' + esc(tr(o.title)) + '">' +
      '<div class="media" style="--h:' + c.hue + '">' +
        '<span class="badge ' + o.type + '">' + t('badge.' + o.type) + '</span>' +
        (o.owner !== 'me' ? '<span class="dist">' + ic('pin') + km(o.dist) + '</span>' : '') +
        '<span class="media-bg">' + ic(c.icon) + '</span>' +
        '<span class="media-ic">' + ic(c.icon) + '</span>' +
      '</div>' +
      '<div class="offer-body">' +
        '<h3>' + esc(tr(o.title)) + '</h3>' +
        '<p class="by">' + avatar(o.owner, 'xs') + t('with', { name: esc(pname(o.owner)) }) + '</p>' +
        '<p class="meta">' + meta + '<span class="sep"></span>' + t('sessions', { n: o.sessions }) + '</p>' +
        '<p class="desc">' + esc(tr(o.desc)) + '</p>' +
        (tr(o.wants) ? '<p class="wants">' + ic('swap') + '<span><b>' + t('exchange') + '</b> ' + esc(tr(o.wants)) + '</span></p>' : '') +
      '</div></article>';
  }

  function offerGridHTML() {
    var list = filteredOffers();
    if (!list.length) return '<div class="empty">' + ic('search') + '<p>' + t('empty.offers') + '</p><button class="btn primary sm" data-action="new-offer">' + ic('plus') + t('cta.share') + '</button></div>';
    return list.map(offerCard).join('');
  }

  function nearbyView() {
    var others = S.offers.filter(function (o) { return o.owner !== 'me'; });
    var done = S.tasks.filter(function (x) { return x.done; }).length, total = S.tasks.length;
    var C = 2 * Math.PI * 22;
    var cats = ['all'].concat(Object.keys(CATS).filter(function (k) { return others.some(function (o) { return o.cat === k; }); }));

    return '' +
      '<section class="hero">' +
        '<div class="hero-copy">' +
          '<p class="eyebrow">' + t('eyebrow') + '</p>' +
          '<h1 class="display">' + t('hero.title', { n: others.length }) + '</h1>' +
          '<p class="lede">' + t('hero.lede') + '</p>' +
          '<ul class="hero-pills">' +
            '<li>' + ic('users') + t('hero.neighbours') + '</li>' +
            '<li>' + ic('swap') + t('hero.swaps') + '</li>' +
            '<li>' + ic('shield') + t('hero.safe') + '</li>' +
          '</ul>' +
        '</div>' +
        '<div class="hero-art">' + ILLU('crate') + '</div>' +
      '</section>' +

      '<div class="duo">' +
        '<section class="panel dark tasks" aria-labelledby="tasksTitle">' +
          '<div class="tasks-head">' +
            '<div><p class="eyebrow light">' + t('today') + '</p>' +
            '<h2 id="tasksTitle" class="display sm">' + t('tasks.title', { n: total }) + '</h2>' +
            '<p class="sub">' + t('tasks.lede') + '</p></div>' +
            '<div class="ring" role="img" aria-label="' + done + '/' + total + ' ' + t('tasks.done') + '">' +
              '<div class="ring-svg"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" class="track"/>' +
              '<circle cx="26" cy="26" r="22" class="bar" stroke-dasharray="' + C.toFixed(2) + '" stroke-dashoffset="' + (C * (1 - done / total)).toFixed(2) + '"/></svg>' +
              '<span>' + done + '/' + total + '</span></div><small>' + t('tasks.done') + '</small></div>' +
          '</div>' +
          '<ul class="task-list">' + S.tasks.map(function (tk) {
            return '<li class="task' + (tk.done ? ' done' : '') + '">' +
              '<button class="task-check" type="button" data-action="toggle-task" data-id="' + tk.id + '" aria-pressed="' + tk.done + '" title="' + t('tasks.mark') + '" aria-label="' + t('tasks.mark') + '">' + ic(tk.done ? 'check' : tk.icon) + '</button>' +
              '<a class="task-main" href="#messages/' + tk.convo + '"><span class="task-title">' + tr(tk.title) + '</span><span class="task-sub">' + tr(tk.sub) + '</span></a>' +
              ic('chev', 'chev') + '</li>';
          }).join('') + '</ul>' +
        '</section>' +

        '<section class="panel how" aria-labelledby="howTitle">' +
          '<h2 id="howTitle" class="display sm">' + t('how.title') + '</h2>' +
          '<ol class="steps">' + [['sprout', 1], ['swap', 2], ['users', 3]].map(function (s) {
            return '<li><span class="step-ic">' + ic(s[0]) + '</span><div><b>' + t('how.' + s[1] + 't') + '</b><p>' + t('how.' + s[1] + 'd') + '</p></div></li>';
          }).join('') + '</ol>' +
          '<button class="btn primary block" data-action="new-offer" type="button">' + ic('plus') + t('cta.share') + '</button>' +
        '</section>' +
      '</div>' +

      '<section class="section" aria-labelledby="offersTitle">' +
        '<div class="sec-head"><h2 id="offersTitle" class="display sm">' + t('offers.title') + '</h2>' +
          '<div class="seg" role="group">' + ['all', 'offers', 'requests'].map(function (f) {
            return '<button type="button" class="' + (ui.offerFilter === f ? 'on' : '') + '" data-action="filter-offers" data-val="' + f + '">' + t('f.' + f) + '</button>';
          }).join('') + '</div></div>' +
        '<div class="toolbar">' +
          '<label class="search">' + ic('search') + '<input id="offerSearch" type="search" placeholder="' + t('search.offers') + '" aria-label="' + t('search.offers') + '" value="' + esc(ui.q) + '"></label>' +
          '<div class="chips scroll">' + cats.map(function (k) {
            return '<button type="button" class="chip' + (ui.cat === k ? ' on' : '') + '" data-action="cat" data-val="' + k + '">' +
              (k === 'all' ? t('f.all') : ic(CATS[k].icon) + tr(CATS[k].label)) + '</button>';
          }).join('') + '</div>' +
        '</div>' +
        '<div id="offerGrid" class="grid offers">' + offerGridHTML() + '</div>' +
      '</section>';
  }

  /* ---------- MESSAGES ---------- */
  function filteredConvos() {
    var q = ui.msgQ.trim().toLowerCase();
    return S.convos.filter(function (c) {
      var f = ui.msgFilter;
      if (f === 'unread' && !c.unread) return false;
      if (f === 'meetups' && !c.meetup) return false;
      if ((f === 'requests' || f === 'offers') && c.kind !== f) return false;
      if (!q) return true;
      var hay = [pname(c.with), tr(c.skill)].concat(c.msgs.map(function (m) { return tr(m.text); })).join(' ').toLowerCase();
      return hay.indexOf(q) > -1;
    });
  }

  function convoListHTML() {
    var list = filteredConvos();
    if (!list.length) return '<p class="empty small">' + t('msgs.none') + '</p>';
    return list.map(function (c) {
      var last = c.msgs[c.msgs.length - 1] || { text: '', from: 'them' };
      return '<a class="convo' + (ui.convo === c.id ? ' active' : '') + (c.unread ? ' unread' : '') + '" href="#messages/' + c.id + '">' +
        '<span class="av-wrap">' + avatar(c.with) + '<i class="online"></i></span>' +
        '<span class="convo-main">' +
          '<span class="convo-top"><b>' + esc(pname(c.with)) + '</b><time>' + esc(tr(c.time)) + '</time></span>' +
          '<span class="convo-skill">' + esc(tr(c.skill)) + ' · ' + ic('pin') + km(c.dist) + '</span>' +
          '<span class="convo-last">' + (last.from === 'me' ? '<em>' + t('me') + ':</em> ' : '') + esc(tr(last.text)) + '</span>' +
        '</span>' +
        (c.unread ? '<span class="count">' + c.unread + '</span>' : '') +
      '</a>';
    }).join('');
  }

  function bubble(m) {
    var file = m.file ? '<span class="file-chip">' + ic('file') + '<span><b>' + esc(m.file.name) + '</b><small>' + esc(m.file.size) + '</small></span></span>' : '';
    return '<div class="bubble ' + (m.from === 'me' ? 'me' : 'them') + '">' + file + '<p>' + esc(tr(m.text)) + '</p>' +
      '<time>' + esc(m.time) + (m.from === 'me' ? ic('checks') : '') + '</time></div>';
  }

  function msgsHTML(c) {
    return c.msgs.map(bubble).join('') +
      (ui.typing === c.id ? '<div class="bubble them typing" aria-label="…"><span></span><span></span><span></span></div>' : '');
  }

  function threadHTML(c) {
    return '<header class="thread-head">' +
        '<a class="icon-btn back" href="#messages" aria-label="' + t('msgs.back') + '">' + ic('back', 'flip') + '</a>' +
        avatar(c.with) +
        '<div class="thread-who"><b>' + esc(pname(c.with)) + '</b><span>' + esc(tr(c.skill)) + ' · ' + km(c.dist) + '</span></div>' +
      '</header>' +
      (c.meetup ? '<div class="meetup">' + '<span class="meetup-ic">' + ic('cal') + '</span>' +
        '<div><small>' + t('meetup') + '</small><b>' + esc(tr(c.meetup.date)) + '</b><span>' + esc(tr(c.meetup.place)) + ' · ' + esc(tr(c.meetup.walk)) + '</span></div></div>' : '') +
      '<div class="msgs" id="msgs" aria-live="polite">' + msgsHTML(c) + '</div>' +
      '<form class="composer" data-form="send" data-id="' + c.id + '">' +
        '<input name="text" autocomplete="off" placeholder="' + t('msgs.placeholder') + '" aria-label="' + t('msgs.placeholder') + '" required maxlength="500">' +
        '<button class="btn primary icon" aria-label="' + t('msgs.send') + '">' + ic('send', 'flip') + '</button>' +
      '</form>';
  }

  function messagesView() {
    var c = ui.convo && getConvo(ui.convo);
    return pageHead(t('eyebrow'), t('msgs.title'), t('msgs.lede'), 'chat') +
      '<div class="msg-layout' + (c ? ' has-active' : '') + '">' +
        '<aside class="convo-pane panel">' +
          '<label class="search">' + ic('search') + '<input id="msgSearch" type="search" placeholder="' + t('search.msgs') + '" aria-label="' + t('search.msgs') + '" value="' + esc(ui.msgQ) + '"></label>' +
          '<div class="chips scroll">' + ['all', 'unread', 'requests', 'meetups', 'offers'].map(function (f) {
            return '<button type="button" class="chip' + (ui.msgFilter === f ? ' on' : '') + '" data-action="msg-filter" data-val="' + f + '">' + t('f.' + f) + '</button>';
          }).join('') + '</div>' +
          '<div id="convoList" class="convo-list">' + convoListHTML() + '</div>' +
        '</aside>' +
        '<section class="thread-pane panel" id="threadPane">' + (c ? threadHTML(c) :
          '<div class="thread-empty">' + ic('chat') + '<b>' + t('msgs.empty') + '</b><p>' + t('msgs.emptySub') + '</p></div>') +
        '</section>' +
      '</div>';
  }

  /* ---------- MY SKILLS ---------- */
  function skillsView() {
    var mine = S.offers.filter(function (o) { return o.owner === 'me'; });
    return pageHead(t('skills.eyebrow'), t('skills.title'), t('skills.lede'), 'water') +
      '<section class="panel dark profile">' +
        '<div class="profile-top">' + avatar('me', 'lg') +
          '<div class="profile-who"><h2 class="display sm">' + esc(pname('me')) + '</h2>' +
          '<p>' + t('since', { y: S.profile.since }) + '</p><p>' + ic('pin') + esc(tr(S.profile.hood)) + '</p></div>' +
          '<button class="btn on-dark sm" type="button" data-action="edit-profile">' + ic('edit') + t('edit') + '</button>' +
        '</div>' +
        '<div class="stats">' +
          '<div><b>' + ic('star', 'fill star') + S.profile.rating + ' <small>(' + S.profile.reviews + ')</small></b><span>' + t('stat.rating') + '</span></div>' +
          '<div><b>' + ic('users') + S.profile.helped + '</b><span>' + t('stat.helped') + '</span></div>' +
          '<div><b>' + ic('sprout') + mine.length + '</b><span>' + t('stat.shared') + '</span></div>' +
        '</div>' +
      '</section>' +

      '<section class="section"><div class="sec-head"><h2 class="display sm">' + t('active') + '</h2></div>' +
        '<div class="grid offers">' + mine.map(offerCard).join('') +
        '<button class="add-tile" type="button" data-action="new-offer"><span>' + ic('plus') + '</span><b>' + t('addOffer') + '</b></button></div>' +
      '</section>' +

      '<div class="duo even">' +
        '<section class="section"><div class="sec-head"><h2 class="display sm">' + t('pending') + '</h2></div>' +
          (S.pending.length ? '<ul class="rows panel">' + S.pending.map(function (p) {
            return '<li class="row">' + avatar(p.with) +
              '<div class="row-main"><b>' + esc(pname(p.with)) + '</b><span>' + esc(tr(p.what)) + '</span>' +
              '<span class="row-meta">' + ic('cal') + esc(tr(p.when)) + '<i></i>' + ic('pin') + km(p.dist) + '</span></div>' +
              '<div class="row-actions"><button type="button" class="btn soft sm" data-action="decline" data-id="' + p.id + '">' + t('decline') + '</button>' +
              '<button type="button" class="btn primary sm" data-action="accept" data-id="' + p.id + '">' + t('accept') + '</button></div></li>';
          }).join('') + '</ul>' : '<p class="panel empty small">' + t('pending.none') + '</p>') +
          (S.upcoming.length ? '<div class="sec-head"><h2 class="display sm">' + t('upcoming') + '</h2></div><ul class="rows panel">' + S.upcoming.map(function (u) {
            return '<li class="row">' + avatar(u.with) + '<div class="row-main"><b>' + esc(pname(u.with)) + '</b><span>' + esc(tr(u.what)) + '</span>' +
              '<span class="row-meta">' + ic('cal') + esc(tr(u.when)) + '</span></div>' +
              '<a class="icon-btn" href="#messages/c-' + u.with + '" aria-label="' + t('nav.messages') + '">' + ic('chat') + '</a></li>';
          }).join('') + '</ul>' : '') +
        '</section>' +

        '<section class="section"><div class="sec-head"><h2 class="display sm">' + t('completed') + '</h2></div>' +
          '<ul class="rows panel">' + S.completed.map(function (c) {
            return '<li class="row">' + avatar(c.with) +
              '<div class="row-main"><b>' + esc(pname(c.with)) + '</b><span>' + esc(tr(c.skill)) + '</span>' +
              '<span class="row-meta">' + ic('cal') + esc(tr(c.date)) + '</span></div>' +
              '<div class="review"><span class="score">' + ic('star', 'fill star') + c.stars.toFixed(1) + '</span><q>' + esc(tr(c.quote)) + '</q></div></li>';
          }).join('') + '</ul>' +
        '</section>' +
      '</div>';
  }

  var VIEWS = { nearby: nearbyView, messages: messagesView, skills: skillsView };

  /* ---------- render ---------- */
  function renderChrome() {
    var html = document.documentElement;
    html.lang = S.lang;
    html.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
    document.title = t('brand') + ' · ' + t('nav.' + ui.view);
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    $('#langBtn').textContent = t('lang.switch');
    $('#topNav').innerHTML = navHTML(false);
    $('#bottomNav').innerHTML = navHTML(true);
  }

  function render(scrollTop) {
    renderChrome();
    document.body.dataset.view = ui.view;
    document.body.classList.toggle('thread-open', ui.view === 'messages' && !!ui.convo);
    $('#main').innerHTML = VIEWS[ui.view]();
    if (ui.view === 'messages') scrollMsgs();
    if (scrollTop) window.scrollTo(0, 0);
  }

  function scrollMsgs() { var m = $('#msgs'); if (m) m.scrollTop = m.scrollHeight; }

  function refreshMessages() {
    renderChrome();
    if (ui.view !== 'messages') return;
    var list = $('#convoList'); if (list) list.innerHTML = convoListHTML();
    var c = ui.convo && getConvo(ui.convo), m = $('#msgs');
    if (c && m) { m.innerHTML = msgsHTML(c); scrollMsgs(); }
  }

  function route() {
    var parts = location.hash.replace(/^#/, '').split('/');
    var v = VIEWS[parts[0]] ? parts[0] : 'nearby';
    var changed = v !== ui.view;
    ui.view = v;
    ui.convo = v === 'messages' && parts[1] && getConvo(parts[1]) ? parts[1] : null;
    if (ui.convo) { var c = getConvo(ui.convo); if (c.unread) { c.unread = 0; save(); } }
    render(changed);
    if (ui.convo && window.matchMedia('(min-width: 900px)').matches) { var inp = $('.composer input'); if (inp) inp.focus({ preventScroll: true }); }
  }

  /* ---------- toast & modal ---------- */
  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2800);
  }

  function openModal(html, label) {
    var root = $('#modal-root');
    lastFocus = document.activeElement;
    root.innerHTML = '<div class="overlay" data-action="close-modal"></div>' +
      '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(label) + '">' +
      '<button class="icon-btn modal-close" type="button" data-action="close-modal" aria-label="' + t('close') + '">' + ic('x') + '</button>' + html + '</div>';
    root.classList.add('open');
    document.body.classList.add('locked');
    setTimeout(function () {
      var f = root.querySelector('input:not([type=radio]),textarea,.modal-actions .btn.primary') || root.querySelector('button');
      if (f) f.focus();
    }, 40);
  }
  function closeModal() {
    var root = $('#modal-root');
    if (!root.classList.contains('open')) return;
    root.classList.remove('open');
    root.innerHTML = '';
    document.body.classList.remove('locked');
    if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus();
  }

  function offerModal(id) {
    var o = getOffer(id); if (!o) return;
    var c = CATS[o.cat], mine = o.owner === 'me';
    openModal(
      '<div class="media modal-media" style="--h:' + c.hue + '"><span class="badge ' + o.type + '">' + t('badge.' + o.type) + '</span>' +
        '<span class="media-bg">' + ic(c.icon) + '</span><span class="media-ic">' + ic(c.icon) + '</span></div>' +
      '<div class="modal-body">' +
        '<p class="eyebrow">' + tr(c.label) + '</p><h2 class="display sm">' + esc(tr(o.title)) + '</h2>' +
        '<div class="by-row">' + avatar(o.owner) + '<div><b>' + esc(pname(o.owner)) + '</b><span>' +
          (mine ? '' : ic('pin') + km(o.dist) + ' · ') + (o.reviews ? stars(o.rating, o.reviews) : t('new.badge')) + ' · ' + t('sessions', { n: o.sessions }) + '</span></div></div>' +
        '<p class="modal-desc">' + esc(tr(o.desc)) + '</p>' +
        (tr(o.wants) ? '<p class="wants big">' + ic('swap') + '<span><b>' + t('exchange') + '</b> ' + esc(tr(o.wants)) + '</span></p>' : '') +
        '<h3 class="mini-h">' + t('modal.expect') + '</h3>' +
        '<ul class="checklist"><li>' + ic('clock') + t('modal.expect1') + '</li><li>' + ic('heart') + t('modal.expect2') + '</li><li>' + ic('star') + t('modal.expect3') + '</li></ul>' +
        '<div class="modal-actions">' + (mine
          ? '<button type="button" class="btn soft" data-action="remove-offer" data-id="' + o.id + '">' + t('modal.remove') + '</button>'
          : '<button type="button" class="btn soft" data-action="message" data-id="' + o.id + '">' + ic('chat') + t('modal.message') + '</button>' +
            '<button type="button" class="btn primary" data-action="request-swap" data-id="' + o.id + '">' + ic('swap') + t('modal.request') + '</button>') +
        '</div>' +
      '</div>', tr(o.title));
  }

  function newOfferModal() {
    var opts = Object.keys(CATS).map(function (k) { return '<option value="' + k + '">' + tr(CATS[k].label) + '</option>'; }).join('');
    openModal(
      '<form class="modal-body form" data-form="new-offer">' +
        '<h2 class="display sm">' + t('form.newTitle') + '</h2><p class="muted">' + t('form.newLede') + '</p>' +
        '<fieldset class="field"><legend>' + t('form.type') + '</legend><div class="seg wide">' +
          '<label><input type="radio" name="type" value="offer" checked><span>' + t('form.typeOffer') + '</span></label>' +
          '<label><input type="radio" name="type" value="request"><span>' + t('form.typeRequest') + '</span></label></div></fieldset>' +
        '<label class="field"><span>' + t('form.title') + '</span><input name="title" required maxlength="60" placeholder="' + t('form.titlePh') + '"></label>' +
        '<label class="field"><span>' + t('form.cat') + '</span><select name="cat">' + opts + '</select></label>' +
        '<label class="field"><span>' + t('form.desc') + '</span><textarea name="desc" rows="3" required maxlength="220" placeholder="' + t('form.descPh') + '"></textarea></label>' +
        '<label class="field"><span>' + t('form.wants') + '</span><input name="wants" maxlength="50" placeholder="' + t('form.wantsPh') + '"></label>' +
        '<div class="modal-actions"><button type="button" class="btn soft" data-action="close-modal">' + t('form.cancel') + '</button>' +
        '<button class="btn primary" type="submit">' + ic('sprout') + t('form.publish') + '</button></div>' +
      '</form>', t('form.newTitle'));
  }

  function profileModal() {
    openModal(
      '<form class="modal-body form" data-form="profile">' +
        '<h2 class="display sm">' + t('form.editTitle') + '</h2>' +
        '<label class="field"><span>' + t('form.name') + '</span><input name="name" required maxlength="30" value="' + esc(pname('me')) + '"></label>' +
        '<label class="field"><span>' + t('form.hood') + '</span><input name="hood" required maxlength="40" value="' + esc(tr(S.profile.hood)) + '"></label>' +
        '<div class="modal-actions"><button type="button" class="btn soft" data-action="close-modal">' + t('form.cancel') + '</button>' +
        '<button class="btn primary" type="submit">' + t('form.save') + '</button></div>' +
      '</form>', t('form.editTitle'));
  }

  /* ---------- conversation logic ---------- */
  function ensureConvo(owner, offer) {
    var c = S.convos.filter(function (x) { return x.with === owner; })[0];
    if (!c) {
      c = { id: 'c-' + owner, with: owner, kind: offer && offer.type === 'request' ? 'requests' : 'offers',
            dist: offer ? offer.dist : 1, unread: 0, time: now(), skill: offer ? offer.title : '', msgs: [] };
      S.convos.unshift(c);
    }
    return c;
  }
  function bump(c) { S.convos = [c].concat(S.convos.filter(function (x) { return x !== c; })); }

  function sendMessage(c, text) {
    c.msgs.push({ from: 'me', time: now(), text: text });
    c.time = now();
    bump(c); save();
    fakeReply(c.id);
  }

  function fakeReply(id) {
    setTimeout(function () { ui.typing = id; refreshMessages(); }, 700);
    setTimeout(function () {
      var c = getConvo(id); if (!c) return;
      ui.typing = null;
      c.msgs.push({ from: 'them', time: now(), text: CANNED[Math.floor(Math.random() * CANNED.length)] });
      c.time = now();
      if (!(ui.view === 'messages' && ui.convo === id)) c.unread = (c.unread || 0) + 1;
      save(); refreshMessages();
    }, 2300);
  }

  /* ---------- events ---------- */
  function setOn(action, val) {
    $$('[data-action="' + action + '"]').forEach(function (b) { b.classList.toggle('on', b.dataset.val === val); });
  }

  var actions = {
    'lang': function () { S.lang = S.lang === 'ar' ? 'en' : 'ar'; save(); render(); },
    'toggle-task': function (el) {
      var tk = S.tasks.filter(function (x) { return x.id === el.dataset.id; })[0];
      tk.done = !tk.done; save(); render();
    },
    'filter-offers': function (el) { ui.offerFilter = el.dataset.val; setOn('filter-offers', ui.offerFilter); $('#offerGrid').innerHTML = offerGridHTML(); },
    'cat': function (el) { ui.cat = el.dataset.val; setOn('cat', ui.cat); $('#offerGrid').innerHTML = offerGridHTML(); },
    'msg-filter': function (el) { ui.msgFilter = el.dataset.val; setOn('msg-filter', ui.msgFilter); $('#convoList').innerHTML = convoListHTML(); },
    'open-offer': function (el) { offerModal(el.dataset.id); },
    'close-modal': closeModal,
    'new-offer': newOfferModal,
    'edit-profile': profileModal,
    'message': function (el) {
      var o = getOffer(el.dataset.id), c = ensureConvo(o.owner, o);
      save(); closeModal(); location.hash = '#messages/' + c.id;
    },
    'request-swap': function (el) {
      var o = getOffer(el.dataset.id), c = ensureConvo(o.owner, o);
      sendMessage(c, t('introMsg', { name: pname(o.owner), title: tr(o.title) }));
      closeModal(); toast(t('toast.requested', { name: pname(o.owner) }));
      location.hash = '#messages/' + c.id;
    },
    'remove-offer': function (el) {
      S.offers = S.offers.filter(function (o) { return o.id !== el.dataset.id; });
      save(); closeModal(); render(); toast(t('toast.removed'));
    },
    'accept': function (el) {
      var p = S.pending.filter(function (x) { return x.id === el.dataset.id; })[0]; if (!p) return;
      S.pending = S.pending.filter(function (x) { return x !== p; });
      S.upcoming.push({ with: p.with, what: p.what, when: p.when });
      S.profile.helped += 1;
      var o = getOffer(p.offer), c = ensureConvo(p.with, o);
      c.meetup = { date: p.when, place: { ar: 'يُحدَّد لاحقًا', en: 'To be decided' }, walk: { ar: km(p.dist), en: p.dist + ' km' } };
      c.msgs.push({ from: 'me', time: now(), text: { ar: 'قبلت طلبك! أشوفك في الموعد 🙌', en: 'Accepted your request! See you then 🙌' } });
      c.time = now(); bump(c);
      save(); render(); toast(t('toast.accepted', { name: pname(p.with) }));
    },
    'decline': function (el) {
      S.pending = S.pending.filter(function (x) { return x.id !== el.dataset.id; });
      save(); render(); toast(t('toast.declined'));
    },
    'reset': function () {
      var lang = S.lang; S = clone(SEED); S.lang = lang; save();
      ui.q = ''; ui.msgQ = ''; ui.cat = 'all'; ui.offerFilter = 'all'; ui.msgFilter = 'all';
      render(true); toast(t('toast.reset'));
    }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el || !actions[el.dataset.action]) return;
    e.preventDefault();
    actions[el.dataset.action](el);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button][data-action]')) { e.preventDefault(); e.target.click(); }
    if (e.key === 'Tab' && $('#modal-root').classList.contains('open')) {
      var f = $$('#modal-root .modal button, #modal-root .modal input, #modal-root .modal select, #modal-root .modal textarea');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'offerSearch') { ui.q = e.target.value; $('#offerGrid').innerHTML = offerGridHTML(); }
    else if (e.target.id === 'msgSearch') { ui.msgQ = e.target.value; $('#convoList').innerHTML = convoListHTML(); }
  });

  document.addEventListener('submit', function (e) {
    var f = e.target, kind = f.dataset.form;
    if (!kind) return;
    e.preventDefault();
    var d = new FormData(f);
    var val = function (k) { return String(d.get(k) || '').trim(); };

    if (kind === 'send') {
      var text = val('text'); if (!text) return;
      var c = getConvo(f.dataset.id);
      sendMessage(c, text);
      f.reset(); refreshMessages(); f.querySelector('input').focus({ preventScroll: true });
    } else if (kind === 'new-offer') {
      if (!val('title') || !val('desc')) return;
      S.offers.unshift({ id: uid('u'), owner: 'me', type: val('type') || 'offer', cat: val('cat'), dist: 0,
        rating: 0, reviews: 0, sessions: 0, title: val('title'), desc: val('desc'), wants: val('wants') });
      save(); closeModal(); toast(t('toast.added'));
      if (ui.view === 'skills') render(); else location.hash = '#skills';
    } else if (kind === 'profile') {
      S.profile.name = val('name') || S.profile.name;
      S.profile.hood = val('hood') || S.profile.hood;
      save(); closeModal(); render(); toast(t('toast.profile'));
    }
  });

  window.addEventListener('hashchange', route);
  route();
})();
