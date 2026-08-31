/**
 * نقطة انطلاق وربط أحداث تطبيق أكاديمية سنا (App Bootstrap & Event Binding)
 */
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("sana_theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme);
    loadSettings();
    initDrafts();
    render();

    // ربط أحداث الإدخال للحفظ التلقائي
    ['reportDate', 'teacherName', 'studentCategory', 'halaType', 'durationHours', 'durationMinutes', 'halaNum'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', saveState);
        document.getElementById(id)?.addEventListener('change', saveState);
    });

    // تسجيل عامل الخدمة لتشغيل وتثبيت التطبيق دون اتصال (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration failed:', err));
    }

    // إغلاق النوافذ المنبثقة بمفتاح Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeQuranPicker();
            closeSettingsModal();
        }
    });
});
