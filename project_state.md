# حالة المشروع (Project State)

- **اسم المشروع:** نظام تقارير أكاديمية سنا (`sana-report`)
- **الرابط المباشر:** `https://kamalyaser31.github.io/sana-report/`
- **المستودع:** `https://github.com/kamalyaser31/sana-report`

## الهيكلية المعتمدة (Modular Flat Structure):
- `index.html`: المدخل الأساسي متوافق مع GitHub Pages و PWA.
- `manifest.json` & `sw.js`: دعم PWA والتخزين المؤقت للإصدار الخامس (`sana-report-v5`).
- `css/styles.css`: التصميم الزمردي المتقن والوضع الليلي وإشعارات التوست.
- `js/app.js`: منطق الإدارة والحفظ التلقائي في `localStorage` والتحقق وإعدادات المعلم.
- `js/quran-data.js`: محرك منتقي المصحف وحسابات الصفحات (1-604) والسور والأجزاء.
- `js/html2pdf.bundle.min.js`: حزمة التصدير لـ PDF محلياً.
- `data/quran_surahs.json` & `data/quran_juzs.json`: بيانات سور وأجزاء القرآن المحملة من GitHub.
- `assets/icon.svg`: أيقونة التطبيق الرسمية.
- `README.md` & `CHANGELOG.md`: التوثيق وبيانات المطور.
