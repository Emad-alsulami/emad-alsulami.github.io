# نانو (Nano)

وكيل ذكي ومستشار شخصي للعصف الذهني والتخطيط وحل المشكلات، يتكلم باللهجة السعودية.

- **الواجهة:** GitHub Pages ← `https://emad-alsulami.github.io/nano/`
- **العقل:** Cloudflare Worker + Workers AI (نموذج مفتوح المصدر `Llama 4 Scout`)
- **التكلفة:** مجاني ضمن 10,000 neuron يومياً (يتجدد 3 الفجر بتوقيت السعودية)

```
المتصفح  ──►  Cloudflare Worker (فيه شخصية نانو)  ──►  Workers AI (Llama)
```

## الملفات

| الملف | وظيفته |
|---|---|
| `index.html` | واجهة المحادثة |
| `app.js` | منطق المحادثة والحفظ في المتصفح |
| `config.js` | رابط الـ Worker (**الشي الوحيد اللي تعدله**) |
| `worker/worker.js` | كود الـ Worker + شخصية نانو (System Prompt) |

## التشغيل (مرة وحدة، تقريباً 5 دقايق)

1. **سجّل في Cloudflare** مجاناً: <https://dash.cloudflare.com/sign-up>
2. **أنشئ Worker:** من القائمة **Compute (Workers)** ← **Workers & Pages** ← **Create** ← **Start with Hello World** ← سمّه `nano` ← **Deploy**.
3. **الصق الكود:** اضغط **Edit code**، امسح الموجود، والصق محتوى `worker/worker.js` كامل ← **Deploy**.
4. **اربط الذكاء الاصطناعي:** ارجع لصفحة الـ Worker ← **Settings** ← **Bindings** ← **Add** ← **Workers AI** ← اسم المتغير: `AI` ← **Deploy**.
5. **انسخ رابط الـ Worker** (شكله `https://nano.xxxx.workers.dev`) وافتحه في المتصفح؛ لازم يطلع لك `نانو شغال ✅`.
6. **حط الرابط في `config.js`:**
   ```js
   window.NANO_CONFIG = { WORKER_URL: "https://nano.xxxx.workers.dev" };
   ```
   واعمل commit. بعد دقيقة تقريباً يشتغل الموقع.

## التخصيص

- **تغيير الشخصية:** عدّل `SYSTEM_PROMPT` في الـ Worker من لوحة Cloudflare ثم Deploy (الموقع ما يحتاج تعديل).
- **تغيير النموذج:** عدّل `MODEL` في الـ Worker. بدائل تستاهل التجربة:
  - `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (أقوى، لكن يستهلك الحد المجاني أسرع)
  - `@cf/qwen/qwen3-30b-a3b-fp8`
  - القائمة الكاملة: <https://developers.cloudflare.com/workers-ai/models/>
- **التجربة محلياً:** شغّل `python3 -m http.server 8000` داخل مجلد الـ repo وافتح `http://localhost:8000/nano/`.

## ملاحظات

- المحادثة تنحفظ في متصفحك فقط (localStorage)، وما فيه قاعدة بيانات.
- الـ Worker يقبل الطلبات من `emad-alsulami.github.io` والـ localhost فقط (`ALLOWED_ORIGINS`)، وهذا يقلل الاستخدام العشوائي لكنه مو حماية كاملة.
- يرسل آخر 20 رسالة فقط للنموذج عشان يوفّر الحد المجاني.
