/**
 * حالة التطبيق ومصدر الحقيقة المشترك (State Management)
 */
let drafts = [];
let activeDraftId = '';
let students = [];
let openIds = new Set();

const DEFAULT_FIELD_VISIBILITY = {
    'تسميع': true,
    'ماضي_قريب': true,
    'مراجعة_قديمة': true,
    'حفظ': true,
    'ماضي_قريب_جديد': true,
    'مراجعة': true,
    'ملاحظات': true,
    'وسام': true,
    'quran_picker': true
};

// تهيئة fieldVisibility مع تصفية مفاتيح localStorage لمنع تلوث الإصدارات السابقة
const _storedVisibility = JSON.parse(localStorage.getItem('sana_field_vis') || '{}');
let fieldVisibility = Object.fromEntries(
    Object.keys(DEFAULT_FIELD_VISIBILITY).map(k => [k, k in _storedVisibility ? _storedVisibility[k] : DEFAULT_FIELD_VISIBILITY[k]])
);
