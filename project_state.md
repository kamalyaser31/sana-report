# حالة المشروع (Project State)

- **اسم المشروع:** نظام تقارير أكاديمية سنا (`sana-report`)
- **الرابط المباشر:** `https://kamalyaser31.github.io/sana-report/`
- **المستودع:** `https://github.com/kamalyaser31/sana-report`

## الهيكلية المعتمدة (Modular Flat Structure):
- `index.html`: المدخل الأساسي متوافق مع GitHub Pages و PWA وشريط إدارة المسودات الرشيق (`#draftsBar`).
- `manifest.json` & `sw.js`: دعم PWA والتخزين المؤقت للإصدار السادس (`sana-report-v6`).
- `css/styles.css`: التصميم الزمردي المتقن، والوضع الليلي، وإشعارات التوست، وشريط المسودات الرشيق.
- `js/app.js`: منطق الإدارة، ومسودات الحلقات المتعددة (`sana_drafts`)، والحفظ التلقائي، والتحقق، وإعدادات المعلم.
- `js/quran-data.js`: محرك منتقي المصحف وحسابات الصفحات (1-604) والسور والأجزاء.
- `js/html2pdf.bundle.min.js`: حزمة التصدير لـ PDF محلياً.
- `data/quran_surahs.json` & `data/quran_juzs.json`: بيانات سور وأجزاء القرآن المحملة من GitHub.
- `assets/icon.svg`: أيقونة التطبيق الرسمية.
- `README.md` & `CHANGELOG.md`: التوثيق وسجل التحديثات التراكمي وبيانات المطور.
