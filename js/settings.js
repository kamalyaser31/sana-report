/**
 * إدارة إعدادات الجلسة وتخصيص الحقول والمظهر (Settings & Preferences)
 */
function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("sana_theme", t);
    const btn = document.getElementById("themeToggleBtn");
    if (btn) btn.textContent = t === "dark" ? "الوضع الفاتح" : "الوضع الليلي";
}

function toggleTheme() {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
}

const REPORT_DATE_FORMAT = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

// نص التاريخ في التقرير يبقى بصيغته («الأربعاء، ٧ أكتوبر ٢٠٢٦») لأن منظومة الأتمتة تحلّله؛
// وإنما صار الحقل منتقي تاريخ (YYYY-MM-DD) فلا يُكتب باليد.
function formatReportDate(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('ar-EG', REPORT_DATE_FORMAT);
}

function getReportDateText() {
    return formatReportDate(document.getElementById('reportDate')?.value || '');
}

function updateReportDateText() {
    const el = document.getElementById('reportDateText');
    if (el) el.textContent = getReportDateText() || 'لم يُختر تاريخ';
}

function setDatePreset(preset) {
    const d = new Date();
    if (preset === 'yesterday') {
        d.setDate(d.getDate() - 1);
    }
    const el = document.getElementById('reportDate');
    if (el) {
        el.value = todayKey(d);
        saveState();
    }
}

function updateSettingsSummary() {
    const getFieldValue = id => document.getElementById(id)?.value || '';
    const badge = document.getElementById('settingsBadge');
    if (!badge) return;
    const teacher = getFieldValue('teacherName') || (typeof TEACHERS !== 'undefined' ? TEACHERS[0] : 'محمد نبيل');
    const cat = getFieldValue('studentCategory') || 'أطفال';
    const type = getFieldValue('halaType') || 'صباحية';
    const dur = formatDurationText(getFieldValue('durationHours'), getFieldValue('durationMinutes'));
    badge.textContent = `${teacher} • ${cat} • ${type} • ${dur}`;
}

function initTeacherSelect() {
    const el = document.getElementById('teacherName');
    if (!el || typeof TEACHERS === 'undefined') return;
    el.innerHTML = TEACHERS.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
}

// مفتاح اليوم المحلي (YYYY-MM-DD) لمعرفة هل حُفظ التاريخ اليوم أم في يوم سابق
function todayKey(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadSettings() {
    initTeacherSelect();
    const s = JSON.parse(localStorage.getItem('sana_settings') || '{}');
    // لا يُستعاد التاريخ المحفوظ إلا في يوم حفظه، حتى لا يُرسَل تقرير اليوم بتاريخ الأمس سهواً.
    // والنص المحفوظ بالصيغة القديمة (s.date) يُترك، فيبدأ الحقل بتاريخ اليوم.
    const savedDateIsFromToday = s.dateIso && s.dateSavedOn === todayKey();
    document.getElementById('reportDate').value = savedDateIsFromToday ? s.dateIso : todayKey();
    updateReportDateText();
    if (s.teacherName && typeof TEACHERS !== 'undefined' && TEACHERS.includes(s.teacherName)) {
        document.getElementById('teacherName').value = s.teacherName;
    } else if (typeof TEACHERS !== 'undefined' && TEACHERS.length) {
        document.getElementById('teacherName').value = TEACHERS[0];
    }
    const activeDraft = typeof getActiveDraft === 'function' ? getActiveDraft() : null;
    document.getElementById('studentCategory').value = activeDraft?.studentCategory || s.studentCategory || 'أطفال';
    document.getElementById('halaType').value = activeDraft?.halaType || s.halaType || 'صباحية';
    document.getElementById('durationHours').value = s.durationHours !== undefined ? s.durationHours : '1';
    document.getElementById('durationMinutes').value = s.durationMinutes !== undefined ? s.durationMinutes : '0';
    document.getElementById('halaNum').value = activeDraft?.halaNum || s.halaNum || '';

    const details = document.getElementById('settingsDetails');
    if (details) {
        if (localStorage.getItem('sana_settings_open') === '0') {
            details.removeAttribute('open');
        }
        details.addEventListener('toggle', () => {
            localStorage.setItem('sana_settings_open', details.open ? '1' : '0');
        });
    }
    updateSettingsSummary();
}

function saveState() {
    const current = getActiveDraft();
    if (current) {
        current.students = students;
        current.halaNum = document.getElementById('halaNum')?.value || '';
        current.studentCategory = document.getElementById('studentCategory')?.value || 'أطفال';
        current.halaType = document.getElementById('halaType')?.value || 'صباحية';
    }
    localStorage.setItem('sana_drafts', JSON.stringify(drafts));
    localStorage.setItem('sana_data', JSON.stringify(students));
    localStorage.setItem('sana_settings', JSON.stringify({
        dateIso: document.getElementById('reportDate')?.value || '',
        dateSavedOn: todayKey(),
        teacherName: document.getElementById('teacherName')?.value || '',
        studentCategory: document.getElementById('studentCategory')?.value || '',
        halaType: document.getElementById('halaType')?.value || '',
        durationHours: document.getElementById('durationHours')?.value || '',
        durationMinutes: document.getElementById('durationMinutes')?.value || '',
        halaNum: document.getElementById('halaNum')?.value || ''
    }));
    updateSettingsSummary();
    updateReportDateText();
    renderStats();
    updateDraftSelectUI();
}

function openSettingsModal() {
    VISIBILITY_FIELD_KEYS.forEach(k => {
        const el = document.getElementById(`vis_${k}`);
        if (el) el.checked = fieldVisibility[k] !== false;
    });

    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'flex';
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';
}

function updateFieldVisibility() {
    VISIBILITY_FIELD_KEYS.forEach(k => {
        const el = document.getElementById(`vis_${k}`);
        if (el) fieldVisibility[k] = el.checked;
    });

    localStorage.setItem('sana_field_vis', JSON.stringify(fieldVisibility));
    render();
    showToast('تم حفظ تفضيلات الحقول ✓');
}

function resetFieldVisibility() {
    fieldVisibility = { ...DEFAULT_FIELD_VISIBILITY };
    VISIBILITY_FIELD_KEYS.forEach(k => {
        const el = document.getElementById(`vis_${k}`);
        if (el) el.checked = true;
    });

    localStorage.setItem('sana_field_vis', JSON.stringify(fieldVisibility));
    render();
    showToast('تم استعادة كافة الحقول ✓');
}
