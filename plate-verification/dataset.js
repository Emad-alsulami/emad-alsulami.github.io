/* Dataset test: results, gallery, database, car detail modal.
   Data comes from data.json (generated offline by the evaluation script). */
(() => {
"use strict";
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const PV = window.PV;
const KEY = 'UQU_AI3101';
const REASON = {
  ok:      {t:'مصرّح: لوحة الـ QR مسجّلة ضمن المركبات المصرّح بها',tE:'Authorized: the QR plate is registered as authorized', c:'var(--green)'},
  ok_ocr:  {t:'مصرّح عبر OCR: الـ QR غير مقروء، واللوحة المقروءة مسجّلة كمصرّح بها',tE:'Authorized via OCR: QR unreadable, the plate read is registered as authorized', c:'#5BB98F'},
  unauth:  {t:'غير مصرّح: لوحة الـ QR مسجّلة كمركبة غير مصرّح بها',tE:'Unauthorized: the QR plate is registered as unauthorized',  c:'var(--red)'},
  conflict:{t:'OCR قرأ لوحة سعودية مختلفة عن لوحة الـ QR',tE:'OCR read a different Saudi plate from the QR plate',          c:'#E0782F'},
  nodb:    {t:'لوحة الـ QR غير موجودة في السجل',tE:'QR plate not found in the registry',                     c:'#8A9095'},
  noqr:    {t:'تعذّرت قراءة الـ QR من الصورة',tE:'The QR code could not be read from the photo',                        c:'var(--amber)'}
};
const rt = k => t(REASON[k].t, REASON[k].tE);
let D = null, dbByPlate = new Map();

fetch('data.json').then(r => r.json()).then(init).catch(err => {
  console.error(err);
  $('#dsMetrics').innerHTML = `<div class="ds-loading">${t('تعذّر تحميل ملف النتائج.','The results file could not be loaded.')}</div>`;
});

document.addEventListener('langchange', () => { if(!D) return; renderMetrics(); renderGallery(); renderDb(); if(cur && modal.classList.contains('open')) openCar(cur.i); });
function init(data){
  D = data;
  D.db.forEach((r, idx) => { const k = PV.normalizePlate(r[1]); if(!dbByPlate.has(k)) dbByPlate.set(k, idx); });
  renderMetrics(); renderGallery(); renderDb();
}

/* ---------------- metrics ---------------- */
function renderMetrics(){
  const C = D.cars, n = C.length;
  const tp = C.filter(c => c.g===1 && c.pr===1).length;   // legit → cleared
  const fn = C.filter(c => c.g===1 && c.pr===0).length;   // legit → false alarm
  const fp = C.filter(c => c.g===0 && c.pr===1).length;   // unauthorised → cleared (missed)
  const tn = C.filter(c => c.g===0 && c.pr===0).length;   // unauthorised → alert
  const acc = (tp+tn)/n, qrRate = C.filter(c => c.q).length/n;
  const catchRate = tn/Math.max(1,tn+fp), clearRate = tp/Math.max(1,tp+fn);
  const pct = x => (x*100).toFixed(1)+'%';
  const st = $('#statAcc'); if(st) st.textContent = pct(acc);
  $('#dsMetrics').innerHTML = [
    [t('دقة القرار الإجمالية','Overall accuracy'), pct(acc), acc, t(`${tp+tn} من ${n} قرار صحيح`,`${tp+tn} of ${n} decisions correct`)],
    [t('كشف غير المصرّح بها','Unauthorized caught'), pct(catchRate), catchRate, t(`${tn} من ${tn+fp} (801–1000)`,`${tn} of ${tn+fp} (801–1000)`)],
    [t('تمرير السليمة بدون إنذار','Valid cleared without alarm'), pct(clearRate), clearRate, t(`${tp} من ${tp+fn} (1–800)`,`${tp} of ${tp+fn} (1–800)`)],
    [t('نسبة قراءة الـ QR','QR read rate'), pct(qrRate), qrRate, t(`${C.filter(c=>c.q).length} صورة`,`${C.filter(c=>c.q).length} photos`)]
  ].map(([t,v,w,e]) => `<div class="metric"><small>${t}</small><b>${v}</b><div class="bar"><i data-w="${(w*100).toFixed(1)}"></i></div><em>${e}</em></div>`).join('');
  requestAnimationFrame(() => setTimeout(() => $$('#dsMetrics .bar i').forEach(i => i.style.width = i.dataset.w+'%'), 80));

  $('#dsCm').innerHTML = `
    <div></div><div class="h">${t('قرار النظام: سليمة','System: valid')}</div><div class="h">${t('قرار النظام: تنبيه','System: alert')}</div>
    <div class="rh">${t('فعلياً سليمة','Actually valid')}<br>(1–800)</div>
    <div class="cell good"><b>${tp}</b><span>${t('تمرير صحيح','Correctly cleared')}</span></div>
    <div class="cell badc"><b>${fn}</b><span>${t('إنذار كاذب','False alarm')}</span></div>
    <div class="rh">${t('فعلياً غير مصرّح','Actually unauthorized')}<br>(801–1000)</div>
    <div class="cell badc"><b>${fp}</b><span>${t('لم تُكتشف','Missed')}</span></div>
    <div class="cell good"><b>${tn}</b><span>${t('كشف صحيح','Correctly caught')}</span></div>`;

  const groups = [[t('سليمة (1–800)','Valid (1–800)'), C.filter(c=>c.g===1)], [t('غير مصرّح (801–1000)','Unauthorized (801–1000)'), C.filter(c=>c.g===0)]];
  const order = ['ok','ok_ocr','unauth','conflict','nodb','noqr'];
  $('#dsReasons').innerHTML = groups.map(([label, arr]) => {
    const cnt = order.map(k => arr.filter(c => c.r===k).length);
    return `<div class="reason"><div class="top"><b>${label}</b><span class="mono">${arr.length}</span></div>
      <div class="track2">${order.map((k,i) => `<i title="${rt(k)}: ${cnt[i]}" style="width:${cnt[i]/arr.length*100}%;background:${REASON[k].c}"></i>`).join('')}</div>
      <div class="reason-legend">${order.map((k,i)=> cnt[i] ? `<span><i style="background:${REASON[k].c}"></i>${rt(k)} · <b class="mono">${cnt[i]}</b></span>` : '').join('')}</div></div>`;
  }).join('') + `<p style="color:var(--dim);font-size:.82rem;margin:6px 0 0">${t(`القرار "سليمة" يتطلب: لوحة الـ QR بعد فك التشفير مسجّلة كمصرّح بها، وما يقرأ OCR لوحة سعودية مختلفة. إذا كان الـ QR غير مقروء نعتمد على اللوحة المقروءة بالـ OCR. أي شرط ناقص يعطي تنبيه للمرور.`,`A “valid” decision requires the decrypted QR plate to be registered as authorized, and OCR must not read a different Saudi plate. If the QR is unreadable, the plate read by OCR is used instead. Anything missing raises an alert.`)}</p>`;
}

/* ---------------- gallery ---------------- */
const PER = 24;
let gFilter = 'all', gQuery = '', gPage = 0, gList = [];
function filtered(){
  const q = PV.normalizePlate(gQuery);
  return D.cars.filter(c => {
    if(gFilter==='legit' && c.g!==1) return false;
    if(gFilter==='unauth' && c.g!==0) return false;
    if(gFilter==='ok' && c.pr!==c.g) return false;
    if(gFilter==='wrong' && c.pr===c.g) return false;
    if(gFilter==='noqr' && c.r!=='noqr') return false;
    if(q){ const plate = PV.normalizePlate(D.db[c.i-1][1]); if(!(String(c.i)===q || plate.includes(q) || (c.d||'').includes(q))) return false; }
    return true;
  });
}
function renderGallery(){
  gList = filtered();
  const pages = Math.max(1, Math.ceil(gList.length/PER)); gPage = Math.min(gPage, pages-1);
  const slice = gList.slice(gPage*PER, gPage*PER+PER);
  $('#dsGrid').innerHTML = slice.length ? slice.map(c => {
    const wrong = c.pr!==c.g;
    return `<button class="car${wrong?' wrong':''}" data-i="${c.i}" aria-label="${t('سيارة','Vehicle')} ${c.i}">
      <img src="thumb/${c.i}.jpg" loading="lazy" alt="">
      <span class="id">#${c.i}</span>${wrong?`<span class="wr">${t('قرار خاطئ','Wrong')}</span>`:''}
      <span class="pred">${c.pr ? `<span class="ok">${t('سليمة','Valid')}</span>` : `<span class="al">${t('تنبيه','Alert')}</span>`}<span style="opacity:.7;font-family:var(--plate)">${c.g?'1–800':'801–1000'}</span></span></button>`;
  }).join('') : `<p style="grid-column:1/-1;text-align:center;color:var(--muted)">${t('لا توجد نتائج','No results')}</p>`;
  pager($('#dsPager'), gPage, pages, gList.length, p => { gPage = p; renderGallery(); });
}
function pager(el, page, pages, total, go){
  const btns = [];
  const add = (label, p, on=false, dis=false) => btns.push(`<button data-p="${p}" class="${on?'on':''}" ${dis?'disabled':''}>${label}</button>`);
  add(t('›','‹'), page-1, false, page===0);
  const set = new Set([0, pages-1, page-1, page, page+1].filter(p => p>=0 && p<pages));
  let last = -1;
  [...set].sort((a,b)=>a-b).forEach(p => { if(p-last>1) btns.push('<span>…</span>'); add(p+1, p, p===page); last = p; });
  add(t('‹','›'), page+1, false, page>=pages-1);
  el.innerHTML = btns.join('') + `<span style="margin-inline-start:8px">${total} ${t('نتيجة','results')}</span>`;
  el.onclick = e => { const b = e.target.closest('button[data-p]'); if(b && !b.disabled) go(+b.dataset.p); };
}
$('#dsFilters').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b || !D) return;
  $$('#dsFilters button').forEach(x => x.classList.toggle('on', x===b));
  gFilter = b.dataset.f; gPage = 0; renderGallery();
});
let sT; $('#dsSearch').addEventListener('input', e => { clearTimeout(sT); sT = setTimeout(() => { gQuery = e.target.value; gPage = 0; if(D) renderGallery(); }, 200); });
$('#dsGrid').addEventListener('click', e => { const b = e.target.closest('.car'); if(b) openCar(+b.dataset.i); });

/* ---------------- database ---------------- */
let dPage = 0, dQuery = '';
function renderDb(){
  const dec = $('#decToggle').checked, q = dQuery.trim().toLowerCase(), qn = PV.normalizePlate(dQuery);
  const rows = D.db.filter(r => !q || r.slice(1,6).join(' ').toLowerCase().includes(q) || (qn && PV.normalizePlate(r[1]).includes(qn)) || String(r[0])===q);
  const pages = Math.max(1, Math.ceil(rows.length/15)); dPage = Math.min(dPage, pages-1);
  $('#dbBody').innerHTML = rows.slice(dPage*15, dPage*15+15).map(r => {
    const [id, plate, make, model, color, chassis, hex] = r;
    const cls = id<=800 ? `<span class="badge ok">${t('سليمة','Valid')}</span>` : `<span class="badge bad">${t('غير مصرّح','Unauthorized')}</span>`;
    return `<tr data-i="${id}"><td class="mono">${id}</td><td><span class="tok${dec?' plain':''}">${dec ? plate+'  ·  '+PV.arabicPlate(plate) : hex}</span></td><td>${make} ${model}</td><td>${color}</td><td class="mono" style="font-size:.8rem;color:var(--muted)">${chassis}</td><td>${cls}</td></tr>`;
  }).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--muted)">${t('لا توجد نتائج','No results')}</td></tr>`;
  pager($('#dbPager'), dPage, pages, rows.length, p => { dPage = p; renderDb(); });
}
$('#decToggle').addEventListener('change', () => D && renderDb());
let dT; $('#dbSearch').addEventListener('input', e => { clearTimeout(dT); dT = setTimeout(() => { dQuery = e.target.value; dPage = 0; if(D) renderDb(); }, 200); });
$('#dbBody').addEventListener('click', e => { const tr = e.target.closest('tr[data-i]'); if(tr) openCar(+tr.dataset.i); });

/* ---------------- car modal ---------------- */
let cur = null;
const modal = $('#carModal');
function rect(b, color){
  if(!b) return '';
  return `<rect x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" fill="none" stroke="${color}" stroke-width="3" vector-effect="non-scaling-stroke" rx="0.004"/>`;
}
function step(n, cls, title, body){ return `<div class="m-step ${cls}"><span class="n">${n}</span><div><h5>${title}</h5><p>${body}</p></div></div>`; }
function openCar(i){
  const c = D.cars[i-1]; cur = c;
  const rec = D.db[i-1];
  $('#mTitle').textContent = t(`السيارة #${i}`,`Vehicle #${i}`);
  $('#mTruth').innerHTML = c.g ? `<span class="badge ok">${t('التصنيف الفعلي: سليمة','Actual class: valid')}</span>` : `<span class="badge bad">${t('التصنيف الفعلي: غير مصرّح','Actual class: unauthorized')}</span>`;
  $('#mImg').src = `img/${i}.jpg`;
  $('#mSvg').innerHTML = rect(c.qb, '#F2B705') + rect(c.ob, '#19C27A');
  $('#mLiveStatus').textContent = '';
  const found = c.f>=0 ? D.db[c.f] : null;
  const s = [];
  s.push(step(1, c.q?'ok':'bad', t('قراءة رمز QR','Read the QR code'), c.q ? `<span class="mono">${c.q}</span>` : t('لم يُعثر على QR مقروء في الصورة','No readable QR code found in the photo')));
  s.push(step(2, c.d?'ok':(c.q?'bad':'skip'), t('فك التشفير XOR (المفتاح UQU_AI3101)','XOR decryption (key UQU_AI3101)'), c.d ? `<span class="mono">${c.d}</span> · ${PV.arabicPlate(c.d)}` : '—'));
  const auth = found && found[0] <= 800;
  s.push(step(3, found ? (auth?'ok':'bad') : (c.d?'bad':'skip'), c.oc==='fallback' ? t('البحث في السجل الرسمي (باللوحة المقروءة بالـ OCR)','Registry lookup (using the OCR plate)') : t('البحث في السجل الرسمي','Registry lookup'),
    found ? `${t('سجل','Record')} #${found[0]}: ${found[2]} ${found[3]}, ${found[4]}. ${auth ? `<b style="color:var(--green)">${t('مصرّح','Authorized')}</b>` : `<b style="color:var(--red)">${t('غير مصرّح','Unauthorized')}</b>`}` : (c.d ? t('اللوحة غير موجودة في السجل','Plate not found in the registry') : '—')));
  const ocrTxt = c.oc==='fallback' ? t(`الـ QR غير مقروء، فقرأنا اللوحة بالـ OCR: <span class="mono">${c.o}</span> وطابقناها مع السجل`,`QR unreadable, so the plate was read with OCR: <span class="mono">${c.o}</span>, then matched in the registry`)
    : c.oc==='confirm' ? t(`قرأ OCR <span class="mono">${c.o}</span> وهي تطابق لوحة الـ QR`,`OCR read <span class="mono">${c.o}</span>, which matches the QR plate`)
    : c.oc==='conflict' ? t(`قرأ OCR لوحة مختلفة: <span class="mono">${c.o}</span> ≠ <span class="mono">${c.d}</span>`,`OCR read a different plate: <span class="mono">${c.o}</span> ≠ <span class="mono">${c.d}</span>`)
    : t(`لم يقرأ OCR لوحة سعودية واضحة${c.o ? ` (أقرب قراءة: <span class="mono">${c.o}</span>)` : ''}. لوحات أجنبية أو صورة جانبية أو بعيدة، فيُعتمد على الـ QR والسجل.`, `OCR found no clear Saudi plate${c.o ? ` (closest reading: <span class="mono">${c.o}</span>)` : ''}. Foreign plates, side views or distant shots rely on the QR and registry.`);
  s.push(step(4, (c.oc==='confirm'||c.oc==='fallback')?'ok':(c.oc==='conflict'?'bad':'skip'), t('فحص إضافي: قراءة اللوحة من الصورة (OCR)','Extra check: reading the plate in the photo (OCR)'), ocrTxt));
  $('#mSteps').innerHTML = s.join('');
  const v = $('#mVerdict'), right = c.pr===c.g;
  v.className = 'verdict ' + (c.pr ? 'ok' : 'bad');
  v.style.animation = 'none';
  v.innerHTML = `<div class="vi">${c.pr ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>'}</div>
    <div><h4>${c.pr ? t('قرار النظام: سليمة','System decision: valid') : t('قرار النظام: تنبيه للمرور','System decision: alert traffic police')}</h4><p>${rt(c.r)} · ${right ? `<b style="color:var(--green)">${t('قرار صحيح','Correct decision')}</b>` : `<b style="color:#7A5B00">${t('قرار خاطئ','Wrong decision')}</b>`}</p></div>`;
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
}
function closeModal(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
$('#mClose').onclick = closeModal;
modal.addEventListener('click', e => { if(e.target===modal) closeModal(); });
document.addEventListener('keydown', e => {
  if(!modal.classList.contains('open')) return;
  if(e.key==='Escape') closeModal();
  const rtl = document.documentElement.dir==='rtl';
  if(e.key==='ArrowLeft') nav(rtl?1:-1);
  if(e.key==='ArrowRight') nav(rtl?-1:1);
});
function nav(d){ if(!cur) return; const list = gList.length ? gList : D.cars; let k = list.findIndex(c => c.i===cur.i); if(k<0) k = cur.i-1; const nx = list[(k+d+list.length)%list.length]; openCar(nx.i); }
$('#mNext').onclick = () => nav(1);
$('#mPrev').onclick = () => nav(-1);

// live check in the browser: real jsQR scan of the photo
$('#mLive').onclick = async () => {
  if(!cur) return;
  const st = $('#mLiveStatus');
  if(!window.jsQR){ st.textContent = 'jsQR library not loaded'; return; }
  st.textContent = 'scanning image with jsQR…';
  const im = await loadImg(`img/${cur.i}.jpg`);
  let data = null;
  // try the whole photo, then 2x zoom around the QR area found offline (if any)
  const tries = [[0,0,1,1,1]];
  if(cur.qb){ const [x,y,w,h] = cur.qb, p = 0.6; tries.push([Math.max(0,x-w*p), Math.max(0,y-h*p), Math.min(1,w*(1+2*p)), Math.min(1,h*(1+2*p)), 3]); }
  for(const [x,y,w,h,s] of tries){
    const c = document.createElement('canvas'), sw = im.naturalWidth*w, sh = im.naturalHeight*h;
    c.width = Math.round(sw*s); c.height = Math.round(sh*s);
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
    g.drawImage(im, im.naturalWidth*x, im.naturalHeight*y, sw, sh, 0, 0, c.width, c.height);
    const r = jsQR(g.getImageData(0,0,c.width,c.height).data, c.width, c.height);
    if(r){ data = r.data; break; }
  }
  if(!data){ st.textContent = 'jsQR: no QR decoded in the browser'; return; }
  const plate = PV.decodePayload(data, KEY);
  const inDb = dbByPlate.has(plate);
  st.innerHTML = `jsQR ✓ <b>${data}</b> → <b>${plate||'?'}</b> ${inDb ? '(found in DB ✓)' : '(not in DB ✗)'}`;
  PV.toast(t(`تمت قراءة الـ QR مباشرة: ${plate}`,`QR read live: ${plate}`), true);
};
$('#mDemo').onclick = async () => {
  if(!cur) return;
  const im = await loadImg(`img/${cur.i}.jpg`);
  closeModal();
  PV.loadIntoDemo(im, cur.ob, '');
  PV.toast(t('تم تحميل الصورة في التجربة الحية. اضغط "اقرأ اللوحة"','Photo loaded into the demo. Press “Read plate”.'), true);
};
function loadImg(src){ return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; }); }
})();
