/* Demo data. Bilingual fields are {ar, en}; text typed by the user is a plain string. */
const PEOPLE = {
  lucia:  { name: { ar: 'لوسيا م.', en: 'Lucia M.' }, color: '#B9774B' },
  khalid: { name: { ar: 'خالد ع.', en: 'Khalid A.' }, color: '#4F6B80' },
  nora:   { name: { ar: 'نورة س.', en: 'Nora S.' }, color: '#9C6A3E' },
  priya:  { name: { ar: 'بريا د.', en: 'Priya D.' }, color: '#6E8247' },
  mateo:  { name: { ar: 'ماتيو ر.', en: 'Mateo R.' }, color: '#86584D' },
  sara:   { name: { ar: 'سارة ق.', en: 'Sara Q.' }, color: '#65588A' },
  omar:   { name: { ar: 'عمر ف.', en: 'Omar F.' }, color: '#3B6B66' },
  faisal: { name: { ar: 'فيصل ح.', en: 'Faisal H.' }, color: '#82663A' },
  reem:   { name: { ar: 'ريم ت.', en: 'Reem T.' }, color: '#94566A' }
};

const CATS = {
  language: { icon: 'globe',  hue: '#DCC5A6', label: { ar: 'لغات', en: 'Languages' } },
  repair:   { icon: 'wrench', hue: '#BCC7CC', label: { ar: 'تصليح', en: 'Repairs' } },
  cooking:  { icon: 'bread',  hue: '#E3C59C', label: { ar: 'طبخ وخبز', en: 'Cooking' } },
  fitness:  { icon: 'yoga',   hue: '#C6D0A6', label: { ar: 'رياضة', en: 'Fitness' } },
  arts:     { icon: 'pen',    hue: '#D2C3D6', label: { ar: 'فنون', en: 'Arts' } },
  music:    { icon: 'music',  hue: '#BED3CD', label: { ar: 'موسيقى', en: 'Music' } },
  tech:     { icon: 'code',   hue: '#C8CCDB', label: { ar: 'تقنية', en: 'Tech' } },
  garden:   { icon: 'plant',  hue: '#C0D5A6', label: { ar: 'زراعة', en: 'Gardening' } },
  coffee:   { icon: 'coffee', hue: '#D6BFA6', label: { ar: 'قهوة', en: 'Coffee' } }
};

const CANNED = [
  { ar: 'تمام، يناسبني 👍', en: 'Sounds good to me 👍' },
  { ar: 'ممتاز! أشوفك قريب', en: 'Great! See you soon' },
  { ar: 'شكرًا، بأرد عليك بعد شوي بالتفاصيل', en: "Thanks — I'll get back to you with details shortly" },
  { ar: 'حلو! وش رايك نتقابل في المقهى اللي جنب الحديقة؟', en: 'Nice! How about the café next to the park?' }
];

const SEED = {
  v: 1,
  lang: 'ar',
  profile: {
    name: { ar: 'ليان ك.', en: 'Layan K.' },
    hood: { ar: 'حي الملقا', en: 'Al Malqa' },
    since: 2023, rating: 4.9, reviews: 24, helped: 18
  },
  tasks: [
    { id: 't1', icon: 'chat', convo: 'c-mateo', done: false,
      title: { ar: 'الرد على طلب ماتيو للغة', en: "Reply to Mateo's language request" },
      sub: { ar: 'محادثة إسبانية · 0.5 كم · قبل ساعتين', en: 'Spanish conversation · 0.5 km · 2h ago' } },
    { id: 't2', icon: 'wrench', convo: 'c-khalid', done: true,
      title: { ar: 'تأكيد موعد تصليح الدراجة مع خالد', en: 'Confirm bike repair with Khalid' },
      sub: { ar: 'الفرامل · 1.2 كم · اليوم 11:00 ص', en: 'Fix brakes · 1.2 km · Today, 11:00' } },
    { id: 't3', icon: 'bread', convo: 'c-nora', done: false,
      title: { ar: 'توصيل خميرة العجين لنورة', en: 'Bring sourdough starter to Nora' },
      sub: { ar: 'خبز · 1.6 كم · اليوم 4:00 م', en: 'Baking · 1.6 km · Today, 4:00 PM' } }
  ],
  offers: [
    { id: 'o5', owner: 'sara', type: 'offer', cat: 'arts', dist: 0.5, rating: 5.0, reviews: 41, sessions: 9,
      title: { ar: 'الخط العربي للمبتدئين', en: 'Arabic calligraphy for beginners' },
      desc: { ar: 'خط الرقعة والنسخ خطوة بخطوة. الأقلام والحبر والورق عليّ.', en: "Ruq'ah and Naskh scripts step by step. Pens, ink and paper provided." },
      wants: { ar: 'صيانة دراجة', en: 'Bike maintenance' } },
    { id: 'o1', owner: 'lucia', type: 'offer', cat: 'language', dist: 0.8, rating: 4.9, reviews: 24, sessions: 3,
      title: { ar: 'محادثة باللغة الإسبانية', en: 'Spanish conversation practice' },
      desc: { ar: 'متحدثة أصلية بالإسبانية، أساعدك في المحادثة والنطق والواجبات.', en: "I'm a native Spanish speaker, happy to help with conversation, pronunciation or homework." },
      wants: { ar: 'دروس خط عربي', en: 'Arabic calligraphy lessons' } },
    { id: 'o2', owner: 'khalid', type: 'offer', cat: 'repair', dist: 1.2, rating: 5.0, reviews: 18, sessions: 12,
      title: { ar: 'تصليح الدراجات وصيانتها', en: 'Bike repair & tune-ups' },
      desc: { ar: 'إصلاحات أساسية، ضبط الفرامل، تنظيف الجنزير وأكثر. الأدوات عليّ.', en: 'Basic repairs, brake adjustments, chain cleaning and more. All tools provided.' },
      wants: { ar: 'أساسيات التصوير', en: 'Photography basics' } },
    { id: 'o3', owner: 'nora', type: 'offer', cat: 'cooking', dist: 1.6, rating: 4.8, reviews: 32, sessions: 6,
      title: { ar: 'خبز العجين المخمّر 101', en: 'Sourdough baking 101' },
      desc: { ar: 'تعلّم أساسيات الخبز من الخميرة إلى الرغيف. الوصفة والخميرة تاخذها معك.', en: 'Learn the basics of sourdough from starter to loaf. Includes recipe and starter to take home.' },
      wants: { ar: 'رفيقة يوغا', en: 'A yoga partner' } },
    { id: 'o4', owner: 'priya', type: 'request', cat: 'fitness', dist: 2.3, rating: 4.7, reviews: 16, sessions: 5,
      title: { ar: 'رفيقة يوغا', en: 'Yoga buddy' },
      desc: { ar: 'أبحث عن رفيقة يوغا منتظمة (يفضّل الثلاثاء أو الخميس مساءً). كل المستويات مرحّب بها.', en: 'Looking for a regular yoga partner (ideally Tue/Thu evenings). All levels welcome!' },
      wants: { ar: 'أعلّمك الطبخ الهندي', en: 'I can teach Indian cooking' } },
    { id: 'o8', owner: 'reem', type: 'offer', cat: 'garden', dist: 0.9, rating: 4.9, reviews: 20, sessions: 7,
      title: { ar: 'زراعة البلكونة', en: 'Balcony gardening' },
      desc: { ar: 'كيف تزرع أعشاب وخضار في مساحة صغيرة حتى مع حرارة الصيف.', en: 'Grow herbs and veggies in a small space — even in the summer heat.' },
      wants: { ar: 'دروس جيتار', en: 'Guitar lessons' } },
    { id: 'o6', owner: 'omar', type: 'offer', cat: 'music', dist: 2.0, rating: 4.6, reviews: 11, sessions: 4,
      title: { ar: 'أساسيات الجيتار', en: 'Guitar basics' },
      desc: { ar: 'أول ثلاث كوردات وأول أغنية لك خلال أسبوعين.', en: 'Your first three chords and your first song in two weeks.' },
      wants: { ar: 'أكل بيتي', en: 'Home cooking' } },
    { id: 'o7', owner: 'faisal', type: 'request', cat: 'tech', dist: 1.1, rating: 4.8, reviews: 9, sessions: 3,
      title: { ar: 'مساعدة في إكسل والجداول', en: 'Help with Excel & spreadsheets' },
      desc: { ar: 'عندي مشروع صغير وأحتاج أحد يعلّمني المعادلات والجداول المحورية.', en: 'I run a small business and need someone to teach me formulas and pivot tables.' },
      wants: { ar: 'أعلّمك تصميم الشعارات', en: 'I can teach logo design' } },
    { id: 'm1', owner: 'me', type: 'offer', cat: 'language', dist: 0, rating: 4.9, reviews: 24, sessions: 3,
      title: { ar: 'محادثة باللغة الإنجليزية', en: 'English conversation practice' },
      desc: { ar: 'جلسات محادثة خفيفة لتقوية الطلاقة والثقة.', en: 'Relaxed conversation sessions to build fluency and confidence.' },
      wants: { ar: 'تعلّم الإسبانية', en: 'Learning Spanish' } },
    { id: 'm2', owner: 'me', type: 'offer', cat: 'coffee', dist: 0, rating: 4.8, reviews: 32, sessions: 6,
      title: { ar: 'القهوة المختصة في البيت', en: 'Specialty coffee at home' },
      desc: { ar: 'V60، تحميص، وطحن — كل اللي تحتاجه لكوب مثالي.', en: 'V60, roasts and grind size — everything for the perfect cup.' },
      wants: { ar: 'أساسيات الخبز', en: 'Baking basics' } }
  ],
  pending: [
    { id: 'p1', with: 'khalid', offer: 'm1', dist: 1.2,
      what: { ar: 'يبي يتدرّب على المحادثة بالإنجليزي', en: 'Wants English conversation practice' },
      when: { ar: 'بكرة · 11:00 ص', en: 'Tomorrow, 11:00' } },
    { id: 'p2', with: 'priya', offer: 'm2', dist: 2.3,
      what: { ar: 'تبي تتعلّم تحضير القهوة المختصة', en: 'Wants specialty coffee tips' },
      when: { ar: 'الخميس 19 نوفمبر · 5:30 م', en: 'Thu, 19 Nov · 17:30' } }
  ],
  upcoming: [],
  completed: [
    { with: 'nora', stars: 5, skill: { ar: 'رفيقة يوغا', en: 'Yoga buddy' },
      date: { ar: '3 نوفمبر 2026', en: '3 Nov 2026' },
      quote: { ar: 'جلسة رائعة! ودودة ومتعاونة جدًا.', en: 'Great session! Super friendly and supportive.' } },
    { with: 'mateo', stars: 5, skill: { ar: 'محادثة إسبانية', en: 'Spanish practice' },
      date: { ar: '28 أكتوبر 2026', en: '28 Oct 2026' },
      quote: { ar: 'صبورة وتخلّي التعلّم ممتع!', en: 'Patient and makes it fun!' } }
  ],
  convos: [
    { id: 'c-lucia', with: 'lucia', kind: 'offers', dist: 0.8, unread: 2, time: '10:24',
      skill: { ar: 'محادثة إسبانية', en: 'Spanish conversation' },
      meetup: { date: { ar: 'الثلاثاء 17 نوفمبر · 6:00 م', en: 'Tue, 17 Nov · 6:00 PM' },
                place: { ar: 'مقهى الريفرسايد', en: 'Riverside Café' },
                walk: { ar: '0.8 كم · 10 دقائق مشي', en: '0.8 km · 10 min walk' } },
      msgs: [
        { from: 'them', time: '10:18', text: { ar: 'هلا! متى يناسبك نبدأ أول جلسة؟', en: 'Hi! When would suit you for our first session?' } },
        { from: 'me', time: '10:20', text: { ar: 'أي يوم بعد العصر يناسبني', en: 'Any afternoon works for me' } },
        { from: 'them', time: '10:23', text: { ar: 'ممتاز! وش رايك الثلاثاء الساعة 6 في مقهى الريفرسايد؟', en: 'Sounds great! How about Tuesday at 6pm at the Riverside Café?' } },
        { from: 'them', time: '10:24', text: { ar: 'وجيبي معك دفتر صغير 😊', en: 'And bring a small notebook 😊' } }
      ] },
    { id: 'c-khalid', with: 'khalid', kind: 'offers', dist: 1.2, unread: 0, time: { ar: 'أمس', en: 'Yesterday' },
      skill: { ar: 'تصليح الدراجات', en: 'Bike repair & tune-ups' },
      meetup: { date: { ar: 'السبت 14 نوفمبر · 10:00 ص', en: 'Sat, 14 Nov · 10:00 AM' },
                place: { ar: 'ورشة خالد', en: "Khalid's workshop" },
                walk: { ar: '1.2 كم · 15 دقيقة مشي', en: '1.2 km · 15 min walk' } },
      msgs: [
        { from: 'me', time: '18:02', text: { ar: 'فرامل دراجتي تصدر صوت، تقدر تشوفها؟', en: 'My bike brakes are squeaking — could you take a look?' } },
        { from: 'them', time: '18:40', text: { ar: 'جهّزت الأدوات. موعدنا السبت الساعة 10 الصبح؟', en: "I've got the tools ready. Are you still good for Saturday at 10am?" } }
      ] },
    { id: 'c-nora', with: 'nora', kind: 'offers', dist: 1.6, unread: 0, time: { ar: '9 نوفمبر', en: 'Nov 9' },
      skill: { ar: 'خبز العجين المخمّر', en: 'Sourdough baking 101' },
      msgs: [
        { from: 'me', time: '15:10', text: { ar: 'متحمسة للجلسة! عندك وصفة أبدأ فيها؟', en: "Excited for our session! Do you have a recipe I can start with?" } },
        { from: 'them', time: '15:32', file: { name: 'Sourdough-Starter-Guide.pdf', size: '2.4 MB' },
          text: { ar: 'هذي الوصفة اللي قلت لك عنها. إذا عندك أي سؤال قولي لي.', en: "Here's the recipe I mentioned! Let me know if you have any questions." } }
      ] },
    { id: 'c-priya', with: 'priya', kind: 'requests', dist: 2.3, unread: 0, time: { ar: '8 نوفمبر', en: 'Nov 8' },
      skill: { ar: 'رفيقة يوغا', en: 'Yoga buddy' },
      msgs: [
        { from: 'them', time: '19:05', text: { ar: 'تبين ننضم لحصة جماعية يوم الخميس؟ لقيت استوديو حلو قريب!', en: 'Would you like to join a group class this Thursday? I found a great studio nearby!' } }
      ] },
    { id: 'c-mateo', with: 'mateo', kind: 'requests', dist: 0.5, unread: 1, time: { ar: '6 نوفمبر', en: 'Nov 6' },
      skill: { ar: 'تبادل لغات (إسباني ↔ إنجليزي)', en: 'Language exchange (Spanish ↔ English)' },
      msgs: [
        { from: 'them', time: '20:11', text: { ar: 'شكرًا على المحادثة الرائعة اليوم! نعيدها الأسبوع الجاي؟', en: "Thanks for the great conversation today! Let's do it again next week?" } }
      ] }
  ]
};
