/* Arabic / English switch. Uses the same saved setting ('lang' in localStorage) as the portfolio.
   Static text is swapped by matching each element's Arabic content; scripts use t(ar, en) and
   re-render on the 'langchange' event. */
(() => {
"use strict";
let lang = 'ar', saved = 'ar';
try { if(localStorage.getItem('lang') === 'en') saved = 'en'; } catch(e) {}

window.LANG = () => lang;
window.t = (ar, en) => lang === 'en' ? en : ar;

const EN = {
  // header
  "التحقق من اللوحات": "Plate Verification",
  "افحص سيارتك": "Check a vehicle",
  "آلية العمل": "How it works",
  "جرّب النظام": "Try it",
  "نتائج الاختبار": "Test results",
  "قاعدة البيانات": "Database",
  "المقارنة": "Comparison",
  "ملف الأعمال": "Portfolio",
  // hero
  "مشروع مقرر AI3101، جامعة أم القرى": "AI3101 course project, Umm Al-Qura University",
  "نظام التحقق الذكي<br>من لوحات المركبات": "Smart License Plate<br>Verification System",
  "لكل سيارة رمز QR يحمل رقم لوحتها مشفّراً. يقرأ النظام الرمز ويفك تشفيره، ويطابقه مع السجل الرسمي ومع اللوحة الظاهرة في الصورة. وإذا وجد اختلافاً أرسل تنبيهاً للمرور.":
    "Every vehicle carries a QR code holding its plate number in encrypted form. The system reads and decrypts the code, then checks it against the official registry and the plate visible in the photo. If anything doesn’t match, it alerts traffic police.",
  "افحص صورة سيارة": "Check a vehicle photo",
  "طريقة العمل": "How it works",
  "اختبرناه على <b>1000</b> صورة مركبة من بيانات المشروع: كانت قراراته صحيحة في <b id=\"statAcc\" dir=\"ltr\">—</b> منها، وكشف <b>198</b> من أصل <b>200</b> مركبة غير مصرّح بها.":
    "Tested on <b>1000</b> vehicle photos from the project dataset: <b id=\"statAcc\" dir=\"ltr\">—</b> of its decisions were correct, and it caught <b>198</b> of the <b>200</b> unauthorized vehicles.",
  "اللوحة المقروءة": "Plate read",
  "QR بعد فك التشفير": "Decrypted QR",
  "النتيجة": "Result",
  // check
  "ارفع صورة السيارة واعرف إذا كانت سليمة": "Upload a vehicle photo to check it",
  "يقرأ النظام الـ QR من الصورة ويفك تشفيره ويبحث عن اللوحة في السجل (1–800 مصرّح، 801–1000 غير مصرّح)، ثم يفحص اللوحة بالـ OCR. كل شي يصير داخل متصفحك.":
    "The system reads the QR code in the photo, decrypts it and looks the plate up in the registry (1–800 authorized, 801–1000 unauthorized), then checks the visible plate with OCR. Everything runs in your browser.",
  "اسحب صورة السيارة هنا أو اضغط للاختيار": "Drop a vehicle photo here, or click to choose one",
  "JPG / PNG · مثل صور ملف data set": "JPG or PNG, like the photos in the data set folder",
  "<i style=\"background:#19C27A\"></i>اللوحة": "<i style=\"background:#19C27A\"></i>Plate",
  "افحص صورة ثانية": "Check another photo",
  "جاري الفحص…": "Checking…",
  "لحظات": "One moment",
  // pipeline
  "كيف يعمل النظام؟": "How the system works",
  "ست مراحل من الصورة إلى القرار. اختر مرحلة لعرض شرحها والكود المستخدم فيها.": "Six stages from photo to decision. Choose a stage to see what it does and the code behind it.",
  // demo
  "جرّب النظام بنفسك": "Try each step yourself",
  "كل شي يشتغل داخل متصفحك. الصورة اللي ترفعها ما تنرسل لأي خادم.": "Everything runs in your browser. Photos you upload are never sent to a server.",
  "صورة المركبة وقراءة اللوحة": "Vehicle photo and plate reading",
  "صورة تجريبية": "Sample photo",
  "ارفع صورة": "Upload photo",
  "إدخال يدوي": "Type it in",
  "اسحب على الصورة لتحديد منطقة اللوحة (ROI) يدوياً": "Drag across the photo to set the plate region (ROI) yourself",
  "اسحب صورة السيارة هنا": "Drop a vehicle photo here",
  "أو اضغط للاختيار. يُقص تلقائياً بنفس نسب الكود (48–82% ارتفاع، 25–75% عرض)": "or click to choose one. It is cropped with the same ratios as the code (48–82% height, 25–75% width).",
  "اكتب رقم اللوحة كما يقرأه OCR (يقبل حروف وأرقام ومسافات، حتى الأرقام العربية)": "Type the plate as OCR might read it (letters, digits and spaces, Arabic digits included)",
  "جرّب تكتب نص \"متّسخ\" مثل <span class=\"mono\">٦٢٥٩ vfo</span> أو <span class=\"mono\">VV 4 NTU SS</span> وشوف كيف ينظفه النظام ويتحقق منه بـ Regex.":
    "Try messy input such as <span class=\"mono\">٦٢٥٩ vfo</span> or <span class=\"mono\">VV 4 NTU SS</span> to see how the system cleans it and validates it with Regex.",
  "العتبة (Threshold)": "Threshold",
  "اقرأ اللوحة (OCR)": "Read plate (OCR)",
  "بعد التنظيف": "Cleaned",
  "بانتظار القراءة": "Not read yet",
  "اللوحة (EN)": "Plate (EN)",
  "اللوحة (AR)": "Plate (AR)",
  "تقدر تصحّح القراءة يدوياً إذا أخطأ OCR:": "Correct the reading here if OCR got it wrong:",
  "تشفير اللوحة الرسمية بـ XOR": "Encrypting the registered plate with XOR",
  "المفتاح السري": "Secret key",
  "اللوحة الرسمية المسجّلة في النظام (تُملأ تلقائياً من قراءة OCR، مثل الكود الأصلي)": "Registered plate in the system (filled from the OCR reading, as in the original code)",
  "نسخ": "Copy",
  "فك التشفير (تحقق عكسي)": "Decrypted back",
  "رمز QR للمركبة": "Vehicle QR code",
  "تحميل QR": "Download QR",
  "مسح QR خارجي": "Scan a QR image",
  "الـ QR ما يحتوي رقم اللوحة كنص واضح، بل النص المشفّر بصيغة Base64. لو أحد صوّر الـ QR ما يقدر يعرف رقم اللوحة بدون المفتاح السري.":
    "The QR code doesn’t contain the plate in plain text, only the encrypted Base64 value. Anyone who photographs it can’t recover the plate without the secret key.",
  "امسح الـ QR وفك التشفير": "Scan and decrypt the QR",
  "محتوى الـ QR": "QR content",
  "بعد فك XOR (EN)": "Decrypted (EN)",
  "بعد فك XOR (AR)": "Decrypted (AR)",
  "طريقة القراءة": "Read with",
  "المقارنة الثلاثية والقرار": "Three-way check and decision",
  "سيارة سليمة": "Valid vehicle",
  "اللوحة والـ QR والسجل كلها متطابقة": "Plate, QR and registry all match",
  "لوحة مبدّلة": "Swapped plate",
  "لوحة مسروقة ركّبت على سيارة ثانية (QR الحقيقي مختلف)": "A stolen plate fitted to another car (its real QR differs)",
  "تجربة حرة": "Free test",
  "عدّل القيم الثلاث بنفسك": "Edit all three values yourself",
  "لوحة من الصورة (OCR)": "Plate in photo (OCR)",
  "من الـ QR (بعد فك التشفير)": "From QR (decrypted)",
  "السجل الرسمي": "Official registry",
  "شغّل التحقق": "Run the check",
  "بانتظار التحقق": "Not checked yet",
  "اضغط \"شغّل التحقق\" للمقارنة بين المصادر الثلاثة.": "Press “Run the check” to compare the three sources.",
  // dataset
  "اختبار النظام على بيانات المشروع": "Results on the project dataset",
  "شغّلنا النظام على 1000 صورة: المركبات <b>1–800 سليمة</b> و<b>801–1000 غير مصرّح بها</b>. لكل صورة: نقرأ الـ QR ونفك تشفيره، ونبحث عن اللوحة في السجل الرسمي، ثم نفحص بالـ OCR إن كانت اللوحة الظاهرة في الصورة تخالف لوحة الـ QR.":
    "We ran the system on 1000 photos: vehicles <b>1–800 are valid</b> and <b>801–1000 are unauthorized</b>. For each photo we read and decrypt the QR code, look the plate up in the official registry, then use OCR to check whether the visible plate contradicts the QR plate.",
  "جاري تحميل النتائج…": "Loading results…",
  "مصفوفة الالتباس": "Confusion matrix",
  "أين يتوقف كل قرار؟": "What each decision rested on",
  "معرض المركبات": "Vehicle gallery",
  "اضغط على أي سيارة لعرض خطوات التحقق كاملة": "Select a vehicle to see every verification step",
  "الكل": "All",
  "سليمة (1–800)": "Valid (1–800)",
  "غير مصرّح (801–1000)": "Unauthorized (801–1000)",
  "قرار صحيح": "Correct decision",
  "قرار خاطئ": "Wrong decision",
  "QR غير مقروء": "QR unreadable",
  // database
  "السجل الرسمي المشفّر": "Encrypted official registry",
  "1000 سجل من ملف <span class=\"mono\">vehicles_database.xlsx</span>. أرقام اللوحات مخزّنة مشفّرة بـ XOR (Hex)، فلو تسرّب الملف ما تنكشف اللوحات بدون المفتاح.":
    "1000 records from <span class=\"mono\">vehicles_database.xlsx</span>. Plate numbers are stored XOR-encrypted (hex), so a leaked file reveals no plates without the key.",
  "فك التشفير بالمفتاح السري": "Decrypt with the secret key",
  "اللوحة": "Plate",
  "المركبة": "Vehicle",
  "اللون": "Color",
  "رقم الهيكل": "Chassis ID",
  "التصنيف": "Class",
  // modal
  "<i style=\"background:#19C27A\"></i>منطقة اللوحة المقروءة": "<i style=\"background:#19C27A\"></i>Plate region read",
  "تحقق مباشر في المتصفح": "Check live in the browser",
  "افتح في التجربة الحية": "Open in the step-by-step demo",
  "→ السابقة": "← Previous",
  "التالية ←": "Next →",
  // comparison
  "الفرق بين مشروعنا والأنظمة المشابهة": "How it differs from similar systems",
  "ثلاثة أنظمة تقرأ اللوحات، ولا يتحقق أيّ منها من أن اللوحة تخص السيارة نفسها.": "Three systems that read plates, none of which checks that the plate belongs to the car.",
  "نظام ساهر": "Saher (Saudi Arabia)",
  "<b>هم</b>يرصد المخالفات (السرعة وقطع الإشارة) بكاميرات الرادار ويقرأ اللوحة المعدنية فقط.": "<b>Them</b>Detects violations such as speeding and red-light running with radar cameras, and reads only the metal plate.",
  "<b>نحن</b>نركّز على التحقق الأمني بكاميرا عادية أو جوال، ونقارن اللوحة بـ QR للتأكد إنها تخص نفس السيارة.": "<b>Us</b>Focuses on security checks with an ordinary camera or phone, and compares the plate with a QR code to confirm it belongs to the same car.",
  "أنظمة ANPR": "ANPR systems",
  "<b>هم</b>تُستخدم في المواقف والبوابات لقراءة الرقم وتخزينه كنص عادي.": "<b>Them</b>Used at car parks and gates to read the number and store it as plain text.",
  "<b>نحن</b>ننظّف النص بـ Regex ونحمي بيانات اللوحة في قاعدة البيانات بتشفير XOR و Base64.": "<b>Us</b>Cleans the text with Regex and protects plate data in the database with XOR and Base64.",
  "كشف السيارات المسروقة": "Stolen-vehicle detection",
  "<b>هم</b>تتحقق فقط إذا كان الرقم في القائمة السوداء، وتفشل لو حط السارق لوحة سليمة على سيارة مسروقة.": "<b>Them</b>Only checks whether the number is blacklisted, so it fails when a thief fits a clean plate to a stolen car.",
  "<b>نحن</b>نقارن ثلاثة مصادر: OCR والـ QR والسجل المشفّر. أي اختلاف يعني تنبيه فوري للمرور.": "<b>Us</b>Compares three sources: OCR, the QR code and the encrypted registry. Any mismatch alerts traffic police immediately.",
  "الميزة": "Feature",
  "ساهر": "Saher",
  "القائمة السوداء": "Blacklist",
  "مشروعنا": "Our project",
  "قراءة اللوحة تلقائياً": "Reads the plate automatically",
  "التحقق من الصيغة بـ Regex": "Validates the format with Regex",
  "تشفير بيانات اللوحة": "Encrypts plate data",
  "هوية رقمية للسيارة (QR)": "Digital vehicle identity (QR)",
  "كشف اللوحات المبدّلة": "Detects swapped plates",
  "يعمل بكاميرا جوال عادية": "Works with an ordinary phone camera",
  // tech
  "التقنيات المستخدمة": "Technologies used",
  "معالجة الصور": "Image processing",
  "قص منطقة اللوحة، تحويل للرمادي، موازنة الهيستوجرام، وتنعيم ثم تحويل لأبيض وأسود.": "Crops the plate region, converts to grayscale, equalizes the histogram, smooths, then binarizes to black and white.",
  "OCR بالتعلم العميق": "Deep-learning OCR",
  "شبكات CNN مدرّبة مسبقاً تقرأ الحروف حتى لو الصورة مائلة أو فيها غبار، وما تحتاج تدريب من الصفر.": "Pre-trained CNNs read characters even in tilted or dusty photos, with no training from scratch.",
  "Regex والتوحيد": "Regex and normalization",
  "تنظيف الناتج وفلترة الصيغة السعودية (4 أرقام + 3 حروف) لرفض القراءات الخاطئة.": "Cleans the output and enforces the Saudi format (4 digits + 3 letters) to reject bad readings.",
  "QR + تشفير XOR": "QR + XOR encryption",
  "هوية رقمية مشفّرة لكل سيارة تُقارن مع اللوحة لكشف اللوحات المزورة أو المبدّلة.": "An encrypted digital identity for each car, compared with its plate to catch forged or swapped plates.",
  // footer
  "نظام التحقق الذكي من لوحات المركبات، ضمن <a href=\"../\">ملف أعمال عماد السلمي</a> <br><small>البيانات: <a href=\"https://huggingface.co/datasets/keremberke/license-plate-object-detection\" target=\"_blank\" rel=\"noopener\" style=\"text-decoration:underline;color:#fff\">license-plate-object-detection</a> + صور وسجلات جمعها الفريق</small>":
    "Smart License Plate Verification System, part of <a href=\"../\">Emad Al-Sulami’s portfolio</a> <br><small>Data: <a href=\"https://huggingface.co/datasets/keremberke/license-plate-object-detection\" target=\"_blank\" rel=\"noopener\" style=\"text-decoration:underline;color:#fff\">license-plate-object-detection</a> plus photos and records collected by the team</small>",
  // attributes
  "الصورة المرفوعة": "Uploaded photo",
  "رقم السيارة أو اللوحة…": "Vehicle number or plate…",
  "بحث: لوحة، شركة، موديل…": "Search plate, make or model…",
  "إغلاق": "Close",
  "Switch to English": "التبديل إلى العربية"
};
const TITLE = { ar: document.title, en: 'Smart License Plate Verification System' };

/* snapshot every translatable element once, in its original Arabic */
const AR = /[؀-ۿ]/, INLINE = new Set(['B','STRONG','SPAN','BR','SMALL','EM','I','A','CODE']);
const norm = s => s.replace(/\s+/g, ' ').trim();
const htmlItems = [], textItems = [], attrItems = [];
function walk(el){
  if(el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.namespaceURI === 'http://www.w3.org/2000/svg') return;
  const direct = [...el.childNodes].filter(n => n.nodeType === 3 && AR.test(n.nodeValue));
  if(direct.length){
    const inlineOnly = [...el.children].every(c => INLINE.has(c.tagName) && !c.querySelector('svg,input,div'));
    if(inlineOnly){ const k = norm(el.innerHTML); if(EN[k]) htmlItems.push({el, ar:k, en:EN[k]}); return; }
    direct.forEach(n => { const k = norm(n.nodeValue); if(EN[k]) textItems.push({n, ar:n.nodeValue, en:' ' + EN[k] + ' '}); });
  }
  [...el.children].forEach(walk);
}
walk(document.body);
document.querySelectorAll('[placeholder],[aria-label],[title],[alt]').forEach(el => ['placeholder','aria-label','title','alt'].forEach(a => {
  const v = el.getAttribute(a); if(v && EN[v]) attrItems.push({el, a, ar:v, en:EN[v]});
}));

function apply(next){
  const prev = lang; lang = next;
  const html = document.documentElement;
  html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = TITLE[lang];
  htmlItems.forEach(it => {
    const cur = norm(it.el.innerHTML), from = norm(it[prev]);
    // keep values filled in by scripts (e.g. the accuracy figure)
    const keep = it.el.querySelector('#statAcc') ? it.el.querySelector('#statAcc').textContent : null;
    if(cur === from || keep !== null){ it.el.innerHTML = it[lang]; if(keep !== null) it.el.querySelector('#statAcc').textContent = keep; }
  });
  textItems.forEach(it => { it.n.nodeValue = it[lang]; });
  attrItems.forEach(it => it.el.setAttribute(it.a, it[lang]));
  const sw = document.getElementById('langSwitch');
  if(sw){ sw.querySelector('span').textContent = lang === 'ar' ? 'English' : 'العربية'; sw.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'); }
}
if(saved === 'en') apply('en');

document.addEventListener('DOMContentLoaded', () => {
  const sw = document.getElementById('langSwitch');
  if(sw) sw.addEventListener('click', () => {
    const next = lang === 'ar' ? 'en' : 'ar';
    apply(next);
    try { localStorage.setItem('lang', next); } catch(e) {}
    document.dispatchEvent(new CustomEvent('langchange', {detail: next}));
  });
});
})();
