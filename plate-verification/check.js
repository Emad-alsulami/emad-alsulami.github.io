/* Upload a vehicle photo → QR scan → XOR decrypt → registry lookup → OCR check → verdict.
   Everything runs in the browser. */
(() => {
"use strict";
const $ = s => document.querySelector(s);
const PV = window.PV;
const KEY = 'UQU_AI3101';
const AUTH_MAX_ID = 800;           // records 1–800 are authorised, 801–1000 are not
let DATA = null, byPlate = null;
const ready = fetch('data.json').then(r => r.json()).then(d => {
  DATA = d; byPlate = new Map();
  d.db.forEach(r => { const k = PV.normalizePlate(r[1]); if(!byPlate.has(k)) byPlate.set(k, []); byPlate.get(k).push(r[0]); });
  d.cars.forEach(c => { c._h = hexToBits(c.h); });
});

/* ---------- helpers ---------- */
function hexToBits(h){ return h ? [...h].map(x => parseInt(x,16).toString(2).padStart(4,'0')).join('') : ''; }
function hamming(a,b){ let n=0; for(let i=0;i<a.length;i++) if(a[i]!==b[i]) n++; return n; }
function dhash(im){
  const c1 = document.createElement('canvas'); c1.width = 64; c1.height = 64;
  const g1 = c1.getContext('2d'); g1.imageSmoothingQuality = 'high'; g1.drawImage(im, 0, 0, 64, 64);
  const c2 = document.createElement('canvas'); c2.width = 17; c2.height = 16;
  const g2 = c2.getContext('2d'); g2.imageSmoothingQuality = 'high'; g2.drawImage(c1, 0, 0, 17, 16);
  const p = g2.getImageData(0,0,17,16).data, gray = [];
  for(let i=0;i<p.length;i+=4) gray.push(0.299*p[i]+0.587*p[i+1]+0.114*p[i+2]);
  let bits = ''; for(let y=0;y<16;y++) for(let x=0;x<16;x++) bits += gray[y*17+x] < gray[y*17+x+1] ? '1' : '0';
  return bits;
}
function sim(a,b){ // normalised Levenshtein similarity
  const m=a.length,n=b.length; if(!m||!n) return 0;
  const d=Array.from({length:m+1},(_,i)=>[i,...Array(n).fill(0)]); for(let j=1;j<=n;j++) d[0][j]=j;
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return 1 - d[m][n]/Math.max(m,n);
}
const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- QR scanning ---------- */
async function scanQR(im){
  const W = im.naturalWidth, H = im.naturalHeight;
  // 1) native detector when the browser has one (Chrome on Android / macOS)
  if('BarcodeDetector' in window){
    try{
      const det = new BarcodeDetector({formats:['qr_code']});
      const r = await det.detect(im);
      if(r.length){ const b = r[0].boundingBox; return {data:r[0].rawValue, box:[b.x/W,b.y/H,b.width/W,b.height/H], how:'BarcodeDetector'}; }
    }catch(e){}
  }
  if(!window.jsQR) return null;
  // 2) jsQR on the whole photo, then 3) on zoomed tiles
  const tries = [];
  const base = Math.min(1, 1400/Math.max(W,H));
  tries.push([0,0,1,1,base],[0,0,1,1,base*1.5]);
  for(const fy of [0,.25,.5]) for(const fx of [0,.25,.5]) tries.push([fx,fy,.5,.5,Math.min(2.2, 1400/(Math.max(W,H)*.5))]);
  for(const [fx,fy,fw,fh,s] of tries){
    const sw = W*fw, sh = H*fh, c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(sw*s)); c.height = Math.max(1, Math.round(sh*s));
    const g = c.getContext('2d', {willReadFrequently:true}); g.imageSmoothingQuality = 'high';
    g.drawImage(im, W*fx, H*fy, sw, sh, 0, 0, c.width, c.height);
    const q = jsQR(g.getImageData(0,0,c.width,c.height).data, c.width, c.height, {inversionAttempts:'dontInvert'});
    if(q){
      const L = q.location, xs = [L.topLeftCorner.x,L.topRightCorner.x,L.bottomLeftCorner.x,L.bottomRightCorner.x], ys = [L.topLeftCorner.y,L.topRightCorner.y,L.bottomLeftCorner.y,L.bottomRightCorner.y];
      const toX = x => (W*fx + x/s)/W, toY = y => (H*fy + y/s)/H;
      return {data:q.data, box:[toX(Math.min(...xs)), toY(Math.min(...ys)), toX(Math.max(...xs))-toX(Math.min(...xs)), toY(Math.max(...ys))-toY(Math.min(...ys))], how: fw===1 ? 'jsQR' : 'jsQR (tile zoom)'};
    }
    await sleep(0);
  }
  return null;
}

/* ---------- OCR (tesseract.js, loaded on demand) ---------- */
let ocrWorker = null;
async function ocrTokens(im, timeoutMs = 30000){
  const job = (async () => {
    if(!window.Tesseract){ await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
    if(!ocrWorker){
      ocrWorker = await Tesseract.createWorker('eng');
      await ocrWorker.setParameters({ tessedit_char_whitelist:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ', tessedit_pageseg_mode:'11' });
    }
    const W = im.naturalWidth, H = im.naturalHeight, s = Math.min(2, 1600/Math.max(W,H));
    const c = document.createElement('canvas'); c.width = Math.round(W*s); c.height = Math.round(H*s);
    const g = c.getContext('2d'); g.filter = 'grayscale(1) contrast(1.3)'; g.drawImage(im, 0, 0, c.width, c.height);
    const { data } = await ocrWorker.recognize(c);
    const words = (data.words || []).map(w => ({t: PV.normalizePlate(w.text), b: w.bbox})).filter(w => w.t.length >= 2);
    const out = [];
    words.forEach((w, k) => {
      out.push({t:w.t, box:[w.b.x0/c.width, w.b.y0/c.height, (w.b.x1-w.b.x0)/c.width, (w.b.y1-w.b.y0)/c.height]});
      const n = words[k+1];
      if(n){ const x0 = Math.min(w.b.x0,n.b.x0), y0 = Math.min(w.b.y0,n.b.y0), x1 = Math.max(w.b.x1,n.b.x1), y1 = Math.max(w.b.y1,n.b.y1);
        out.push({t:w.t+n.t, box:[x0/c.width, y0/c.height, (x1-x0)/c.width, (y1-y0)/c.height]}); }
    });
    return out;
  })();
  return Promise.race([job, sleep(timeoutMs).then(() => { throw new Error('ocr timeout'); })]);
}
const SA = /^(\d{3,4})([A-Z]{3})$/;

/* ---------- UI ---------- */
const STEPS = () => [t('قراءة رمز QR من الصورة','Read the QR code in the photo'), t('فك التشفير XOR','XOR decryption'), t('البحث في السجل الرسمي','Registry lookup'), t('فحص اللوحة بالـ OCR','Check the plate with OCR')];
let state;
function renderSteps(){
  $('#ckSteps').innerHTML = state.map((s, i) => `<div class="m-step ${s.cls}"><span class="n">${i+1}</span><div><h5>${STEPS()[i]}</h5><p>${s.txt}</p></div></div>`).join('');
}
function setStep(i, cls, txt){ state[i] = {cls, txt}; renderSteps(); }
function boxes(qb, ob){
  const r = (b, c) => b ? `<rect x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" fill="none" stroke="${c}" stroke-width="3" vector-effect="non-scaling-stroke"/>` : '';
  $('#ckSvg').innerHTML = r(qb, '#F2B705') + r(ob, '#19C27A');
}
const ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12l5 5L20 7"/></svg>';
const ICON_BAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const ICON_Q = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/></svg>';
function verdict(kind, title, text){
  const v = $('#ckVerdict'); v.className = 'ck-verdict ' + kind;
  v.innerHTML = `<div class="big">${kind==='ok'?ICON_OK:kind==='bad'?ICON_BAD:ICON_Q}</div><div><h3>${title}</h3><p>${text}</p></div>`;
}

let lastFile = null;
async function run(file){
  lastFile = file;
  if(!file || !file.type.startsWith('image/')){ PV.toast(t('الرجاء اختيار ملف صورة','Please choose an image file')); return; }
  $('#ckDrop').classList.add('hidden'); $('#ckResult').classList.remove('hidden'); $('#ckKnown').classList.add('hidden'); $('#ckKnown').innerHTML='';
  const url = URL.createObjectURL(file);
  $('#ckImg').src = url; boxes(null, null);
  $('#ckVerdict').className = 'ck-verdict'; $('#ckVerdict').innerHTML = `<div class="spin"></div><div><h3>${t('جاري الفحص…','Checking…')}</h3><p>${t('قراءة الـ QR وفك تشفيره','Reading and decrypting the QR code')}</p></div>`;
  state = STEPS().map(() => ({cls:'skip', txt:'—'})); setStep(0, 'run', t('جاري البحث عن الـ QR…','Looking for the QR code…'));
  const im = await loadImg(url);
  await ready;

  // which dataset photo is this? (used only as a backup when a step can't be done in the browser)
  const hb = dhash(im);
  const ranked = DATA.cars.map(c => [hamming(hb, c._h), c]).sort((a,b) => a[0]-b[0]);
  // accept the closest photo if it is clearly closer than the rest; near-duplicates are listed together
  const best = ranked[0][0];
  const known = best <= 55 ? ranked.filter(r => r[0] <= best + 8).map(r => r[1]) : [];
  if(known.length && ranked[known.length] && ranked[known.length][0] - best < 15 && best > 25) known.length = 0;
  const ref = known.length === 1 ? known[0] : null;

  /* 1. QR */
  let qr = await scanQR(im), qrSrc = 'live';
  if(!qr && ref && ref.q){ qr = {data:ref.q, box:ref.qb, how:t('التحليل المسبق (OpenCV)','Offline analysis (OpenCV)')}; qrSrc = 'pre'; }
  if(qr){ setStep(0, 'ok', `<span class="mono">${qr.data}</span><br><small>${qr.how}${qrSrc==='pre'?t('، المتصفح ما قدر يقرأه',', the browser could not read it'):''}</small>`); boxes(qr.box, null); }
  else setStep(0, 'bad', t('ما انقرأ أي QR (صغير أو ضبابي). نعتمد على قراءة اللوحة بالـ OCR.','No QR code could be read (too small or blurry). Falling back to reading the plate with OCR.'));

  /* 2. decrypt */
  let plate = '';
  if(qr){
    plate = PV.decodePayload(qr.data, KEY);
    if(plate && /^[A-Z0-9]{3,10}$/.test(plate)) setStep(1, 'ok', `<span class="mono">${plate}</span> · ${PV.arabicPlate(plate)}`);
    else { setStep(1, 'bad', t('محتوى الـ QR ليس بصيغة النظام أو المفتاح غير صحيح','The QR content is not in the system format, or the key is wrong')); plate = ''; }
  }

  /* 4 (runs before 3 when there is no QR): OCR */
  let ocr = null, ocrErr = false, ocrBox = null, conflict = null, fbPlate = null;
  setStep(3, 'run', t('جاري قراءة اللوحة بالـ OCR…','Reading the plate with OCR…'));
  $('#ckVerdict').querySelector('p').textContent = t('فحص اللوحة بالـ OCR','Checking the plate with OCR');
  try{ ocr = await ocrTokens(im); }catch(e){ console.warn(e); ocrErr = true; }
  if(ocr){
    const sa = ocr.filter(o => SA.test(o.t));
    if(plate){
      const hit = ocr.find(o => sim(o.t, plate) >= .8);
      const bad = sa.find(o => sim(o.t, plate) < .5);
      if(hit){ ocrBox = hit.box; setStep(3, 'ok', t(`قرأ OCR <span class="mono">${hit.t}</span> وهي تطابق لوحة الـ QR`,`OCR read <span class="mono">${hit.t}</span>, which matches the QR plate`)); }
      else if(bad){ conflict = bad.t; ocrBox = bad.box; setStep(3, 'bad', t(`قرأ OCR لوحة مختلفة: <span class="mono">${bad.t}</span> ≠ <span class="mono">${plate}</span>`,`OCR read a different plate: <span class="mono">${bad.t}</span> ≠ <span class="mono">${plate}</span>`)); }
      else setStep(3, 'skip', t('ما قرأ OCR لوحة سعودية واضحة، فاعتمدنا على الـ QR والسجل.','OCR found no clear Saudi plate, so the QR code and registry decide.'));
    }else{
      let best = null;
      for(const o of sa) for(const p of byPlate.keys()){ const s = sim(o.t, p); if(!best || s > best.s) best = {s, p, o}; }
      if(best && best.s >= .85){ fbPlate = best.p; ocrBox = best.o.box; setStep(3, 'ok', t(`قرأ OCR اللوحة <span class="mono">${best.o.t}</span> ← في السجل <span class="mono">${best.p}</span>`,`OCR read <span class="mono">${best.o.t}</span>, matched to <span class="mono">${best.p}</span> in the registry`)); }
      else setStep(3, 'bad', t('ما قدر OCR يقرأ لوحة سعودية من الصورة.','OCR could not read a Saudi plate in the photo.'));
    }
  }
  if(!ocr){
    // browser OCR unavailable → use the offline OCR result for this photo, if we recognised it
    if(ref && ref.oc && ref.oc !== 'none'){
      if(ref.oc === 'fallback' && !plate){ fbPlate = PV.normalizePlate(DATA.db[ref.f]?.[1] || ''); ocrBox = ref.ob; setStep(3, 'ok', t(`قراءة OCR من التحليل المسبق: <span class="mono">${ref.o}</span>`,`OCR reading from the offline analysis: <span class="mono">${ref.o}</span>`)); }
      else if(ref.oc === 'conflict' && plate){ conflict = ref.o; ocrBox = ref.ob; setStep(3, 'bad', t(`قراءة OCR من التحليل المسبق: <span class="mono">${ref.o}</span> ≠ <span class="mono">${plate}</span>`,`OCR reading from the offline analysis: <span class="mono">${ref.o}</span> ≠ <span class="mono">${plate}</span>`)); }
      else if(ref.oc === 'confirm' && plate){ ocrBox = ref.ob; setStep(3, 'ok', t(`قراءة OCR من التحليل المسبق تطابق: <span class="mono">${ref.o}</span>`,`OCR reading from the offline analysis matches: <span class="mono">${ref.o}</span>`)); }
      else setStep(3, 'skip', ocrErr ? t('محرك OCR ما اشتغل في المتصفح','The OCR engine did not run in the browser') : '—');
    }else setStep(3, 'skip', ocrErr ? t('محرك OCR ما اشتغل في المتصفح (يحتاج اتصال بالإنترنت لتحميله)','The OCR engine did not run in the browser (it needs an internet connection to load)') : '—');
  }
  boxes(qr && qr.box, ocrBox);

  /* 3. registry */
  const lookup = plate || fbPlate;
  const ids = lookup ? byPlate.get(lookup) : null;
  let auth = null;
  if(lookup){
    if(ids){
      const id = Math.min(...ids), rec = DATA.db[id-1]; auth = id <= AUTH_MAX_ID;
      setStep(2, auth ? 'ok' : 'bad', `${t('سجل','Record')} #${id}: ${rec[2]} ${rec[3]}, ${rec[4]}. ${auth ? `<b style="color:var(--green)">${t('مصرّح','Authorized')}</b>` : `<b style="color:var(--red)">${t('غير مصرّح','Unauthorized')}</b>`}`);
    } else setStep(2, 'bad', t(`اللوحة <span class="mono">${lookup}</span> غير موجودة في السجل`,`Plate <span class="mono">${lookup}</span> is not in the registry`));
  }

  /* verdict */
  if(!lookup) verdict('unk', t('تعذّر التحقق: تنبيه','Could not verify: alert'), t('ما قدر النظام يقرأ الـ QR ولا اللوحة. يحتاج فحص يدوي من رجل المرور.','The system could read neither the QR code nor the plate. A traffic officer should check it by hand.'));
  else if(!ids) verdict('bad', t('غير سليمة','Not valid'), t('اللوحة غير مسجّلة في النظام. تم إرسال تنبيه للمرور.','The plate is not registered in the system. Traffic police have been alerted.'));
  else if(conflict) verdict('bad', t('غير سليمة','Not valid'), t('اللوحة الظاهرة في الصورة تختلف عن هوية السيارة في الـ QR. يُحتمل أنها لوحة مبدّلة، وتم إرسال تنبيه للمرور.','The plate in the photo differs from the vehicle identity in the QR code. It may be a swapped plate; traffic police have been alerted.'));
  else if(auth) verdict('ok', t('سليمة','Valid'), t(`اللوحة ${lookup} (${PV.arabicPlate(lookup)}) مسجّلة كمركبة مصرّح بها. لا يلزم أي إجراء.`,`Plate ${lookup} is registered as an authorized vehicle. No action needed.`));
  else verdict('bad', t('غير سليمة','Not valid'), t(`اللوحة ${lookup} مسجّلة كمركبة غير مصرّح بها. تم إرسال تنبيه للمرور.`,`Plate ${lookup} is registered as an unauthorized vehicle. Traffic police have been alerted.`));

  // dataset reference (ground truth) for comparison
  if(known.length){
    const k = $('#ckKnown'); k.classList.remove('hidden');
    k.innerHTML = known.length === 1
      ? t(`هذه الصورة من بيانات الاختبار: <b>السيارة #${ref.i}</b>. تصنيفها في البيانات: ${ref.g ? '<b style="color:var(--green)">سليمة</b>' : '<b style="color:var(--red)">غير مصرّح بها</b>'}.`,
          `This photo is from the test dataset: <b>vehicle #${ref.i}</b>. Its class in the data: ${ref.g ? '<b style="color:var(--green)">valid</b>' : '<b style="color:var(--red)">unauthorized</b>'}.`)
      : t(`الصورة تشبه أكثر من صورة في البيانات: ${known.map(c => `#${c.i} (${c.g?'سليمة':'غير مصرّح'})`).join('، ')}. الـ QR هو اللي يحدد أي سيارة هي.`,
          `This photo resembles several in the dataset: ${known.map(c => `#${c.i} (${c.g?'valid':'unauthorized'})`).join(', ')}. The QR code decides which vehicle it is.`);
  }
}

/* ---------- wiring ---------- */
document.addEventListener('langchange', () => { if(lastFile && !$('#ckResult').classList.contains('hidden')) run(lastFile); });
$('#ckFile').addEventListener('change', e => { run(e.target.files[0]); e.target.value = ''; });
const drop = $('#ckDrop');
['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => run(e.dataTransfer.files[0]));
$('#ckAgain').addEventListener('click', () => { $('#ckResult').classList.add('hidden'); $('#ckDrop').classList.remove('hidden'); $('#ckFile').click(); });
})();
