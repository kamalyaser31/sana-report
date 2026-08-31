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

function setDatePreset(preset) {
    const d = new Date();
    if (preset === 'yesterday') {
        d.setDate(d.getDate() - 1);
    }
    const formatted = d.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const el = document.getElementById('reportDate');
    if (el) {
        el.value = formatted;
        saveState();
    }
}

function updateSettingsSummary() {
    const getFieldValue = id => document.getElementById(id)?.value || '';
    const badge = document.getElementById('settingsBadge');
    if (!badge) return;
    const teacher = getFieldValue('teacherName') || 'محمد نبيل';
    const cat = getFieldValue('studentCategory') || 'أطفال';
    const type = getFieldValue('halaType') || 'صباحية';
    const dur = formatDurationText(getFieldValue('durationHours'), getFieldValue('durationMinutes'));
    badge.textContent = `${teacher} • ${cat} • ${type} • ${dur}`;
}

function loadSettings() {
    const s = JSON.parse(localStorage.getItem('sana_settings') || '{}');
    document.getElementById('reportDate').value = s.date || new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('teacherName').value = s.teacherName || 'محمد نبيل';
    document.getElementById('studentCategory').value = s.studentCategory || 'أطفال';
    document.getElementById('halaType').value = s.halaType || 'صباحية';
    document.getElementById('durationHours').value = s.durationHours !== undefined ? s.durationHours : '1';
    document.getElementById('durationMinutes').value = s.durationMinutes !== undefined ? s.durationMinutes : '0';
    document.getElementById('halaNum').value = s.halaNum || '';

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
    }
    localStorage.setItem('sana_drafts', JSON.stringify(drafts));
    localStorage.setItem('sana_data', JSON.stringify(students));
    localStorage.setItem('sana_settings', JSON.stringify({
        date: document.getElementById('reportDate').value,
        teacherName: document.getElementById('teacherName').value,
        studentCategory: document.getElementById('studentCategory').value,
        halaType: document.getElementById('halaType').value,
        durationHours: document.getElementById('durationHours').value,
        durationMinutes: document.getElementById('durationMinutes').value,
        halaNum: document.getElementById('halaNum').value
    }));
    updateSettingsSummary();
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
