/**
 * نظام تقارير أكاديمية سنا - المنطق البرمجي المتكامل مع استمارة الأتمتة
 */
const BASMALA = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";
const HEADER = "═══ [ تقرير أكاديمية سنا لتعليم القرآن الكريم ] ═══";
const GRADES = ["ممتاز", "جيد جداً", "جيد مرتفع", "جيد", "مقبول", "إعادة"];
const AWARDS = [
    "ما شاء الله، إتقان مبهر 🌟", "حفظ متين، بارك الله فيك 👑", "أداء ممتاز ومتميز 🏆",
    "تقدم ملحوظ، مستواك في تصاعد 🚀", "بداية طيبة، استمر يا بطل 📈", "همة قوية، الحفظ يأتي بالصبر ⏳",
    "محاولة جيدة، تحتاج إلى مزيد من التركيز 🎯", "ننتظر جدية أكبر ⚠️"
];

// معرفات حقول نموذج Google Forms المعتمد في منظومة الأتمتة
const FORM_CONFIG = {
    URL: "https://docs.google.com/forms/d/e/1FAIpQLSfNKy_h48Ia7dhe_zBoGxTdw0dF5qU2rlul-4JYYUX2VCgcyQ/viewform",
    ENTRIES: {
        TEACHER: "entry.1538514296",
        STUDENT_CATEGORY: "entry.265432297",
        HOURS: "entry.758192319",
        MINUTES: "entry.592377570",
        REPORT_TEXT: "entry.253620165",
        ADMIN_NOTES: "entry.1749036968"
    }
};

let students = JSON.parse(localStorage.getItem('sana_data') || '[]');
let openIds = new Set(students.length ? [students[0].id] : []);

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

let fieldVisibility = { ...DEFAULT_FIELD_VISIBILITY, ...(JSON.parse(localStorage.getItem('sana_field_vis') || '{}')) };

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("sana_theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme);
    loadSettings();
    render();
    
    // ربط أحداث الإدخال للحفظ التلقائي
    ['reportDate', 'teacherName', 'studentCategory', 'halaType', 'durationHours', 'durationMinutes', 'halaNum', 'adminNotes'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', saveState);
        document.getElementById(id)?.addEventListener('change', saveState);
    });

    // تسجيل عامل الخدمة لتشغيل وتثبيت التطبيق دون اتصال (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    // إغلاق النوافذ المنبثقة بمفتاح Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeQuranPicker();
            closeSettingsModal();
        }
    });
});

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
    const d = id => document.getElementById(id)?.value || '';
    const badge = document.getElementById('settingsBadge');
    if (!badge) return;
    const teacher = d('teacherName') || 'محمد نبيل';
    const cat = d('studentCategory') || 'أطفال';
    const type = d('halaType') || 'صباحية';
    const dur = formatDurationText(d('durationHours'), d('durationMinutes'));
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
    document.getElementById('adminNotes').value = s.adminNotes || '';
    
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
    localStorage.setItem('sana_data', JSON.stringify(students));
    localStorage.setItem('sana_settings', JSON.stringify({
        date: document.getElementById('reportDate').value,
        teacherName: document.getElementById('teacherName').value,
        studentCategory: document.getElementById('studentCategory').value,
        halaType: document.getElementById('halaType').value,
        durationHours: document.getElementById('durationHours').value,
        durationMinutes: document.getElementById('durationMinutes').value,
        halaNum: document.getElementById('halaNum').value,
        adminNotes: document.getElementById('adminNotes').value
    }));
    updateSettingsSummary();
    renderStats();
}

function addStudent() {
    const id = Date.now();
    students.unshift({ id, name: '', gender: 'male', تسميع: '', تقييم_تسميع: 'ممتاز', ماضي_قريب: '', تقييم_ماضي_قريب: 'ممتاز', مراجعة_قديمة: '', تقييم_مراجعة: 'ممتاز', حفظ: '', مراجعة: '', ملاحظات: '', وسام: '' });
    openIds.add(id);
    saveState();
    render();
    document.querySelector(`.student-card[data-id="${id}"] input`)?.focus();
}

function removeStudent(id) {
    const s = students.find(x => x.id === id);
    if (confirm(`هل أنت متأكد من حذف بيانات ${s?.name || 'الطالب'}؟`)) {
        students = students.filter(x => x.id !== id);
        openIds.delete(id);
        saveState();
        render();
    }
}

function update(id, field, val) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    s[field] = val;
    saveState();
    if (['name', 'gender', 'تقييم_تسميع'].includes(field)) {
        const card = document.querySelector(`.student-card[data-id="${id}"]`);
        if (card) {
            card.querySelector('.student-name-display').textContent = s.name.trim() || 'طالب جديد';
            const b = card.querySelector('.badge-gender');
            b.className = `badge badge-gender badge-${s.gender}`;
            b.textContent = s.gender === 'male' ? 'ذكر' : 'أنثى';
            card.querySelector('.badge-grade').textContent = s.تقييم_تسميع;
        }
    }
}

function toggleAll() {
    const cards = document.querySelectorAll('#studentsList .student-card');
    if (!cards.length) return;
    const anyClosed = Array.from(cards).some(c => !c.open);
    cards.forEach(c => c.open = anyClosed);
    openIds = anyClosed ? new Set(students.map(s => s.id)) : new Set();
    document.getElementById('expandAllBtn').textContent = anyClosed ? 'طي الكل' : 'توسيع الكل';
}

function clearAll() {
    if (!confirm('هل أنت متأكد من مسح بيانات التقرير كاملاً؟\n\nسيتم تصفير كافة الحقول والطلاب والملاحظات، مع الحفاظ على اسم المعلم فقط.')) return;
    
    // مسح بيانات الطلاب
    students = [];
    openIds.clear();
    localStorage.removeItem('sana_data');
    
    // تصفير حقول الجلسة مع استثناء اسم المعلم
    const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('reportDate').value = today;
    document.getElementById('studentCategory').value = 'أطفال';
    document.getElementById('halaType').value = 'صباحية';
    document.getElementById('durationHours').value = '1';
    document.getElementById('durationMinutes').value = '0';
    document.getElementById('halaNum').value = '';
    document.getElementById('adminNotes').value = '';
    
    saveState();
    render();
    showToast('تم مسح التقرير مع حفظ اسم المعلم');
}

function rolloverStudent(id) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    if (!confirm(`هل ترغب في تدوير واجبات (${s.name || 'هذا الطالب'})؟\n\n- ينتقل (الحفظ الجديد) إلى (التسميع اليومي)\n- ينتقل (الماضي القريب المطلوب) إلى (الماضي القريب)\n- ينتقل (المراجعة القديمة المطلوبة) إلى (المراجعة القديمة)\n- تُفرّغ خانات الواجبات القادمة والملاحظات والوسام للبدء من جديد.`)) return;
    
    s.تسميع = s.حفظ || '';
    s.ماضي_قريب = s.ماضي_قريب_جديد || '';
    s.مراجعة_قديمة = s.مراجعة || '';
    s.حفظ = '';
    s.ماضي_قريب_جديد = '';
    s.مراجعة = '';
    s.ملاحظات = '';
    s.وسام = '';
    s.تقييم_تسميع = 'ممتاز';
    s.تقييم_ماضي_قريب = 'ممتاز';
    s.تقييم_مراجعة = 'ممتاز';
    saveState();
    render();
    showToast(`تم تدوير واجبات ${s.name || 'الطالب'} بنجاح ✓`);
}

function renderStats() {
    document.getElementById('totalCount').textContent = students.length;
    document.getElementById('maleCount').textContent = students.filter(s => s.gender === 'male').length;
    document.getElementById('femaleCount').textContent = students.filter(s => s.gender === 'female').length;
}

function render() {
    renderStats();
    const list = document.getElementById('studentsList');
    if (!students.length) {
        list.innerHTML = `<div class="empty-state"><p>لم يتم تسجيل أي طالب حتى الآن.</p><button type="button" onclick="addStudent()" class="btn btn-success">+ إضافة الطالب الأول</button></div>`;
        return;
    }

    const fields = [
        { k: 'تسميع', l: 'التسميع اليومي:', t: 'area', ph: 'السور أو الآيات التي سُمّعت اليوم' },
        { k: 'تقييم_تسميع', l: 'تقييم التسميع:', t: 'sel', opts: GRADES },
        { k: 'ماضي_قريب', l: 'الماضي القريب:', t: 'area', ph: 'تسميع الماضي القريب اليوم' },
        { k: 'تقييم_ماضي_قريب', l: 'تقييم الماضي القريب:', t: 'sel', opts: GRADES },
        { k: 'مراجعة_قديمة', l: 'المراجعة القديمة (الماضي البعيد):', t: 'area', ph: 'تسميع المحفوظات السابقة البعيدة اليوم' },
        { k: 'تقييم_مراجعة', l: 'تقييم المراجعة القديمة:', t: 'sel', opts: GRADES },
        { k: 'حفظ', l: 'الحفظ الجديد المطلوب:', t: 'area', ph: 'المقرر للحصة القادمة' },
        { k: 'ماضي_قريب_جديد', l: 'الماضي القريب المطلوب:', t: 'area', ph: 'الماضي القريب للحصة القادمة' },
        { k: 'مراجعة', l: 'المراجعة القديمة المطلوبة:', t: 'area', ph: 'المراجعة القديمة للحصة القادمة' },
        { k: 'ملاحظات', l: 'ملاحظات المعلم:', t: 'area', ph: 'توجيهات لولي الأمر أو الطالب' },
        { k: 'وسام', l: 'الوسام التشجيعي:', t: 'sel', opts: ['', ...AWARDS], def: '-- اختر وساماً --' }
    ];

    const isFieldVisible = (k) => {
        if (k.startsWith('تقييم_')) {
            const parentKey = k.replace('تقييم_', '');
            return fieldVisibility[parentKey] !== false;
        }
        return fieldVisibility[k] !== false;
    };

    const visibleFields = fields.filter(f => isFieldVisible(f.k));

    list.innerHTML = students.map((s, idx) => {
        const isOpen = openIds.has(s.id);
        const fieldsHtml = visibleFields.map(f => {
            const isQuranField = ['تسميع', 'ماضي_قريب', 'مراجعة_قديمة', 'حفظ', 'ماضي_قريب_جديد', 'مراجعة'].includes(f.k);
            const showQuranBtn = isQuranField && (fieldVisibility['quran_picker'] !== false);
            const quranBtn = showQuranBtn 
                ? `<button type="button" class="btn-quran" onclick="openQuranPicker(${s.id}, '${f.k}')" aria-label="اختيار من المصحف لحقل ${f.l}">📖 مصحف</button>` 
                : '';

            return `
            <div class="form-group">
                <div class="field-header">
                    <label>${f.l}</label>
                    ${quranBtn}
                </div>
                ${f.t === 'area' 
                    ? `<textarea placeholder="${f.ph}" oninput="update(${s.id},'${f.k}',this.value)">${escapeHtml(s[f.k])}</textarea>`
                    : `<select onchange="update(${s.id},'${f.k}',this.value)">
                        ${f.opts.map(o => `<option value="${escapeHtml(o)}" ${s[f.k] === o ? 'selected' : ''}>${o || f.def}</option>`).join('')}
                       </select>`}
            </div>`;
        }).join('');

        return `
        <details class="student-card" data-id="${s.id}" ${isOpen ? 'open' : ''}>
            <summary class="card-header">
                <div class="card-header-info">
                    <span class="student-index-badge">${idx + 1}</span>
                    <strong class="student-name-display">${escapeHtml(s.name) || 'طالب جديد'}</strong>
                    <span class="badge badge-gender badge-${s.gender}">${s.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                    <span class="badge badge-grade">${s.تقييم_تسميع}</span>
                </div>
            </summary>
            <div class="card-body">
                <div class="card-fields-grid">
                    <div class="form-group">
                        <label>اسم الطالب:</label>
                        <input type="text" value="${escapeHtml(s.name)}" placeholder="اسم الطالب" oninput="update(${s.id},'name',this.value)">
                    </div>
                    <div class="form-group">
                        <label>الجنس:</label>
                        <select onchange="update(${s.id},'gender',this.value)">
                            <option value="male" ${s.gender === 'male' ? 'selected' : ''}>ذكر</option>
                            <option value="female" ${s.gender === 'female' ? 'selected' : ''}>أنثى</option>
                        </select>
                    </div>
                    ${fieldsHtml}
                </div>
                <footer class="card-actions">
                    <button type="button" onclick="copySingle(${s.id}, event)" class="btn btn-primary btn-sm">نسخ تقرير الطالب</button>
                    <button type="button" onclick="rolloverStudent(${s.id})" class="btn btn-outline btn-sm" style="border-color:var(--primary);color:var(--primary);" aria-label="تدوير واجبات هذا الطالب">تدوير الواجبات</button>
                    <button type="button" onclick="removeStudent(${s.id})" class="btn btn-danger btn-sm">حذف الطالب</button>
                </footer>
            </div>
        </details>`;
    }).join('');

    // تسجيل حالة فتح وغلق البطاقات
    list.querySelectorAll('.student-card').forEach(d => {
        d.addEventListener('toggle', () => {
            const id = Number(d.dataset.id);
            d.open ? openIds.add(id) : openIds.delete(id);
        });
    });
}

function formatDurationText(hours, minutes) {
    const h = parseInt(hours || '0', 10);
    const m = parseInt(minutes || '0', 10);
    if (h > 0 && m > 0) return `${h} ${h === 1 ? 'ساعة' : (h === 2 ? 'ساعتان' : (h <= 10 ? 'ساعات' : 'ساعة'))} و${m} دقيقة`;
    if (h > 0) return `${h} ${h === 1 ? 'ساعة' : (h === 2 ? 'ساعتان' : (h <= 10 ? 'ساعات' : 'ساعة'))}`;
    if (m > 0) return `${m} دقيقة`;
    return '0 دقيقة';
}

function formatStudent(s) {
    const isMale = s.gender === 'male';
    const vis = k => fieldVisibility[k] !== false;
    let res = `${isMale ? 'الطالب' : 'الطالبة'}: ${s.name.trim() || 'بدون اسم'}\n\n`;
    if (vis('تسميع') && s.تسميع?.trim()) res += `التسميع اليومي:\n${s.تسميع.trim()}\nالتقييم: ${s.تقييم_تسميع || 'ممتاز'}\n━━━━━━━━━━━━━━━\n`;
    if (vis('ماضي_قريب') && s.ماضي_قريب?.trim()) res += `الماضي القريب:\n${s.ماضي_قريب.trim()}\nالتقييم: ${s.تقييم_ماضي_قريب || 'ممتاز'}\n━━━━━━━━━━━━━━━\n`;
    if (vis('مراجعة_قديمة') && s.مراجعة_قديمة?.trim()) res += `المراجعة القديمة:\n${s.مراجعة_قديمة.trim()}\nالتقييم: ${s.تقييم_مراجعة || 'ممتاز'}\n━━━━━━━━━━━━━━━\n`;
    if (vis('حفظ') && s.حفظ?.trim()) res += `الحفظ الجديد المطلوب:\n${s.حفظ.trim()}\n━━━━━━━━━━━━━━━\n`;
    if (vis('ماضي_قريب_جديد') && s.ماضي_قريب_جديد?.trim()) res += `الماضي القريب المطلوب:\n${s.ماضي_قريب_جديد.trim()}\n━━━━━━━━━━━━━━━\n`;
    if (vis('مراجعة') && s.مراجعة?.trim()) res += `المراجعة القديمة المطلوبة:\n${s.مراجعة.trim()}\n━━━━━━━━━━━━━━━\n`;
    if (vis('ملاحظات') && s.ملاحظات?.trim()) res += `ملاحظات:\n${s.ملاحظات.trim().replace(/يسمع/g, isMale ? 'يسمع' : 'تسمع').replace(/يستمر/g, isMale ? 'يستمر' : 'تستمر')}\n━━━━━━━━━━━━━━━\n`;
    if (vis('وسام') && s.وسام?.trim()) res += `الوسام:\n${s.وسام.trim()}\n`;
    return res.replace(/\n━━━━━━━━━━━━━━━\n$/, '');
}

function getFullReportText() {
    const d = id => document.getElementById(id)?.value || '';
    const durationText = formatDurationText(d('durationHours'), d('durationMinutes'));
    
    let rep = `${BASMALA}\n${HEADER}\n`;
    rep += `التاريخ: ${d('reportDate')}\n`;
    rep += `الفترة: ${d('halaType')}\n`;
    if (d('halaNum')) rep += `رقم الحلقة: ${d('halaNum')}\n`;
    rep += `المدة: ${durationText}\n`;
    if (d('teacherName')) rep += `المعلم: ${d('teacherName')}\n`;
    rep += `عدد الطلاب: ${students.length}\n━━━━━━━━━━━━━━━\n`;
    
    // ترتيب عكسي لمطابقة أسلوب النشر المعتمد للحلقات
    [...students].reverse().forEach(s => rep += formatStudent(s) + "\n\n━━━━━━━━━━━━━━━\n");
    rep += `\n*نسأل الله لهم التوفيق والسداد.*`;
    return rep;
}

function showToast(msg) {
    let toast = document.getElementById('toastMsg');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastMsg';
        toast.className = 'toast-msg';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 1600);
}

function copyAll(e) {
    if (!students.length) return showToast('لا يوجد طلاب مسجلون لنسخ التقرير');
    const rep = getFullReportText();
    copyText(rep, e?.target || document.querySelector('button[onclick*="copyAll"]'));
}

function copySingle(id, e) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    const d = id => document.getElementById(id)?.value || '';
    let rep = `${BASMALA}\n${HEADER}\nالتاريخ: ${d('reportDate')}\nالمعلم: ${d('teacherName')}\n━━━━━━━━━━━━━━━\n${formatStudent(s)}\n\n*نسأل الله ${s.gender === 'male' ? 'له' : 'لها'} التوفيق.*`;
    copyText(rep, e?.target);
}

function copyText(text, btn) {
    navigator.clipboard?.writeText(text).then(() => {
        showToast('تم النسخ في الحافظة ✓');
        if (btn && btn.tagName === 'BUTTON') {
            const orig = btn.textContent;
            btn.textContent = 'تم النسخ ✓';
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = orig;
                btn.disabled = false;
            }, 1400);
        }
    }).catch(() => {
        prompt('انسخ التقرير:', text);
    });
}

function submitToGoogleForm() {
    if (!students.length) {
        return showToast('يرجى إضافة الطلاب قبل الإرسال للاستمارة');
    }
    
    const d = id => document.getElementById(id)?.value || '';
    const reportText = getFullReportText();
    
    // نسخ النص للحافظة احتياطياً
    navigator.clipboard?.writeText(reportText).catch(() => {});
    showToast('جاري فتح الاستمارة المعبأة...');
    
    // تجهيز معلمات الرابط المعبأ مسبقاً (Pre-filled URL)
    const params = new URLSearchParams();
    params.append('usp', 'pp_url');
    params.append(FORM_CONFIG.ENTRIES.TEACHER, d('teacherName'));
    params.append(FORM_CONFIG.ENTRIES.STUDENT_CATEGORY, d('studentCategory'));
    params.append(FORM_CONFIG.ENTRIES.HOURS, d('durationHours') || '0');
    params.append(FORM_CONFIG.ENTRIES.MINUTES, d('durationMinutes') || '0');
    params.append(FORM_CONFIG.ENTRIES.REPORT_TEXT, reportText);
    
    if (d('adminNotes')) {
        params.append(FORM_CONFIG.ENTRIES.ADMIN_NOTES, d('adminNotes'));
    }
    
    const targetUrl = `${FORM_CONFIG.URL}?${params.toString()}`;
    
    // فتح الاستمارة في تبويب جديد
    window.open(targetUrl, '_blank');
}

function exportPDF() {
    if (!students.length) return showToast('لا يوجد طلاب لتصدير التقرير');
    showToast('جاري تجهيز ملف PDF...');
    const d = id => document.getElementById(id)?.value || '';
    const durationText = formatDurationText(d('durationHours'), d('durationMinutes'));
    
    const box = document.createElement('div');
    box.style.cssText = 'padding:20px;font-family:sans-serif;direction:rtl;color:#111;background:#fff;';
    box.innerHTML = `
        <div style="text-align:center;border-bottom:2px solid #006655;padding-bottom:10px;margin-bottom:15px;">
            <h3 style="margin:0 0 5px 0;color:#006655;">${BASMALA}</h3>
            <h2 style="margin:0;">تقرير أكاديمية سنا لتعليم القرآن الكريم</h2>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:15px;font-size:13px;">
            <tr>
                <td style="padding:6px;border:1px solid #ddd;"><strong>التاريخ:</strong> ${escapeHtml(d('reportDate'))}</td>
                <td style="padding:6px;border:1px solid #ddd;"><strong>الفترة:</strong> ${escapeHtml(d('halaType'))}</td>
                <td style="padding:6px;border:1px solid #ddd;"><strong>فئة الطلاب:</strong> ${escapeHtml(d('studentCategory'))}</td>
            </tr>
            <tr>
                <td style="padding:6px;border:1px solid #ddd;"><strong>المعلم:</strong> ${escapeHtml(d('teacherName') || '-')}</td>
                <td style="padding:6px;border:1px solid #ddd;"><strong>المدة:</strong> ${escapeHtml(durationText)}</td>
                <td style="padding:6px;border:1px solid #ddd;"><strong>عدد الطلاب:</strong> ${students.length}</td>
            </tr>
        </table>
        ${students.map((s, i) => `
            <div style="border:1px solid #006655;border-radius:5px;padding:10px;margin-bottom:10px;page-break-inside:avoid;font-size:13px;line-height:1.5;">
                <div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding-bottom:4px;margin-bottom:6px;font-weight:bold;color:#006655;">
                    <span>${i + 1}. ${s.gender === 'male' ? 'الطالب' : 'الطالبة'}: ${escapeHtml(s.name) || 'بدون اسم'}</span>
                    ${fieldVisibility['تسميع'] !== false ? `<span>التقييم: ${s.تقييم_تسميع || 'ممتاز'}</span>` : ''}
                </div>
                ${(fieldVisibility['تسميع'] !== false && s.تسميع) ? `<div><strong>التسميع اليومي:</strong> ${escapeHtml(s.تسميع)} (تقييم: ${s.تقييم_تسميع || 'ممتاز'})</div>` : ''}
                ${(fieldVisibility['ماضي_قريب'] !== false && s.ماضي_قريب) ? `<div><strong>الماضي القريب:</strong> ${escapeHtml(s.ماضي_قريب)} (تقييم: ${s.تقييم_ماضي_قريب || 'ممتاز'})</div>` : ''}
                ${(fieldVisibility['مراجعة_قديمة'] !== false && s.مراجعة_قديمة) ? `<div><strong>المراجعة القديمة:</strong> ${escapeHtml(s.مراجعة_قديمة)} (تقييم: ${s.تقييم_مراجعة || 'ممتاز'})</div>` : ''}
                ${(fieldVisibility['حفظ'] !== false && s.حفظ) ? `<div><strong>الحفظ الجديد المطلوب:</strong> ${escapeHtml(s.حفظ)}</div>` : ''}
                ${(fieldVisibility['ماضي_قريب_جديد'] !== false && s.ماضي_قريب_جديد) ? `<div><strong>الماضي القريب المطلوب:</strong> ${escapeHtml(s.ماضي_قريب_جديد)}</div>` : ''}
                ${(fieldVisibility['مراجعة'] !== false && s.مراجعة) ? `<div><strong>المراجعة القديمة المطلوبة:</strong> ${escapeHtml(s.مراجعة)}</div>` : ''}
                ${(fieldVisibility['ملاحظات'] !== false && s.ملاحظات) ? `<div><strong>ملاحظات:</strong> ${escapeHtml(s.ملاحظات)}</div>` : ''}
                ${(fieldVisibility['وسام'] !== false && s.وسام) ? `<div style="color:#d97706;font-weight:bold;"><strong>الوسام:</strong> ${escapeHtml(s.وسام)}</div>` : ''}
            </div>
        `).join('')}
        <div style="text-align:center;margin-top:15px;font-size:12px;color:#777;">نسأل الله للطلاب التوفيق والسداد • أكاديمية سنا</div>
    `;
    document.body.appendChild(box);
    const fname = `تقرير_سنا_${(d('reportDate') || 'يومي').replace(/[ /\\:]/g, '_')}.pdf`;
    
    if (typeof html2pdf !== 'undefined') {
        html2pdf().set({ margin: 8, filename: fname, image: { type: 'jpeg', quality: 0.98 }, jsPDF: { unit: 'mm', format: 'a4' } }).from(box).save().then(() => box.remove()).catch(() => { box.remove(); window.print(); });
    } else {
        box.remove();
        window.print();
    }
}

function escapeHtml(s) {
    return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';
}

/* ==========================================================================
   منظومة منتقي المصحف الشريف المحلي (Offline Quran Picker)
   ========================================================================== */
let activePicker = { studentId: null, fieldKey: null, activeTab: 'surah' };

function initQuranPickerOnce() {
    const surahSel = document.getElementById('pickerSurahSelect');
    if (surahSel && !surahSel.options.length && typeof QURAN_SURAHS !== 'undefined') {
        surahSel.innerHTML = QURAN_SURAHS.map(s => `<option value="${s.id}">${s.id}. سورة ${s.name} (${s.verses} آية)</option>`).join('');
    }

    const juzSel = document.getElementById('pickerJuzSelect');
    if (juzSel && !juzSel.options.length && typeof QURAN_JUZS !== 'undefined') {
        juzSel.innerHTML = QURAN_JUZS.map(j => `<option value="${j.juz}">${j.name} (ص ${j.startPage})</option>`).join('');
        onJuzChange();
    }
}

function openQuranPicker(studentId, fieldKey) {
    initQuranPickerOnce();
    activePicker.studentId = studentId;
    activePicker.fieldKey = fieldKey;
    
    const modal = document.getElementById('quranModal');
    if (modal) modal.style.display = 'flex';
    
    setQuranTab(activePicker.activeTab || 'surah');
    updateQuranPreview();
}

function closeQuranPicker() {
    const modal = document.getElementById('quranModal');
    if (modal) modal.style.display = 'none';
}

function setQuranTab(tab) {
    activePicker.activeTab = tab;
    ['surah', 'page', 'juz'].forEach(t => {
        const btn = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);
        const content = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}Content`);
        if (btn) btn.classList.toggle('active', t === tab);
        if (content) content.style.display = t === tab ? 'block' : 'none';
    });
    updateQuranPreview();
}

function onSurahChange() {
    const surahId = parseInt(document.getElementById('pickerSurahSelect')?.value || '1', 10);
    const surah = (typeof QURAN_SURAHS !== 'undefined' && QURAN_SURAHS.find(s => s.id === surahId)) || { verses: 7 };
    const fromInput = document.getElementById('pickerFromAyah');
    const toInput = document.getElementById('pickerToAyah');
    if (fromInput && toInput) {
        fromInput.max = surah.verses;
        toInput.max = surah.verses;
        if (parseInt(toInput.value, 10) > surah.verses || toInput.value === '10') {
            toInput.value = Math.min(10, surah.verses);
        }
    }
    updateQuranPreview();
}

function setSurahRange(rangeType) {
    const surahId = parseInt(document.getElementById('pickerSurahSelect')?.value || '1', 10);
    const surah = (typeof QURAN_SURAHS !== 'undefined' && QURAN_SURAHS.find(s => s.id === surahId)) || { verses: 7 };
    const fromInput = document.getElementById('pickerFromAyah');
    const toInput = document.getElementById('pickerToAyah');
    if (!fromInput || !toInput) return;

    fromInput.max = surah.verses;
    toInput.max = surah.verses;

    if (rangeType === 'full') {
        fromInput.value = 1;
        toInput.value = surah.verses;
    } else if (rangeType === 'firstHalf') {
        fromInput.value = 1;
        toInput.value = Math.floor(surah.verses / 2);
    } else if (rangeType === 'secondHalf') {
        fromInput.value = Math.floor(surah.verses / 2) + 1;
        toInput.value = surah.verses;
    } else if (rangeType === 'first10') {
        fromInput.value = 1;
        toInput.value = Math.min(10, surah.verses);
    }
    updateQuranPreview();
}

function setPageRange(count) {
    const fromP = parseInt(document.getElementById('pickerFromPage')?.value || '1', 10);
    const toInput = document.getElementById('pickerToPage');
    if (toInput) {
        toInput.value = Math.min(604, fromP + count - 1);
    }
    updateQuranPreview();
}

function onJuzChange() {
    const juzNum = parseInt(document.getElementById('pickerJuzSelect')?.value || '1', 10);
    const juz = (typeof QURAN_JUZS !== 'undefined' && QURAN_JUZS.find(j => j.juz === juzNum)) || { name: 'الجزء الأول', rubs: [] };
    const rubSel = document.getElementById('pickerRubSelect');
    if (!rubSel) return;

    let opts = `
        <option value="full">كامل ${juz.name}</option>
        <option value="hizb1">الحزب الأول من ${juz.name}</option>
        <option value="hizb2">الحزب الثاني من ${juz.name}</option>
    `;
    juz.rubs.forEach((r, idx) => {
        opts += `<option value="rub_${idx + 1}">الربع ${idx + 1}: ${r}</option>`;
    });
    rubSel.innerHTML = opts;
    updateQuranPreview();
}

function updateQuranPreview() {
    const tab = activePicker.activeTab || 'surah';
    let text = '';

    if (tab === 'surah') {
        const surahId = parseInt(document.getElementById('pickerSurahSelect')?.value || '1', 10);
        const surah = (typeof QURAN_SURAHS !== 'undefined' && QURAN_SURAHS.find(s => s.id === surahId)) || { name: 'الفاتحة', verses: 7 };
        const fromA = parseInt(document.getElementById('pickerFromAyah')?.value || '1', 10);
        const toA = parseInt(document.getElementById('pickerToAyah')?.value || `${surah.verses}`, 10);

        if (fromA === 1 && toA === surah.verses) {
            text = `سورة ${surah.name} كاملة`;
        } else {
            text = `سورة ${surah.name} من (${fromA}:${toA})`;
        }
    } else if (tab === 'page') {
        const fromP = parseInt(document.getElementById('pickerFromPage')?.value || '1', 10);
        const toP = parseInt(document.getElementById('pickerToPage')?.value || `${fromP}`, 10);
        const surahFrom = typeof getSurahByPage === 'function' ? getSurahByPage(fromP) : { name: '', id: 1 };
        const surahTo = typeof getSurahByPage === 'function' ? getSurahByPage(toP) : { name: '', id: 1 };

        const infoEl = document.getElementById('pageSurahInfo');
        if (infoEl) {
            infoEl.textContent = surahFrom.id === surahTo.id 
                ? `(تقع في سورة ${surahFrom.name})` 
                : `(من سورة ${surahFrom.name} إلى سورة ${surahTo.name})`;
        }

        if (fromP === toP) {
            text = `الصفحة ${fromP} (سورة ${surahFrom.name})`;
        } else {
            text = `من صفحة ${fromP} إلى صفحة ${toP} (${surahFrom.name === surahTo.name ? 'سورة ' + surahFrom.name : surahFrom.name + ' - ' + surahTo.name})`;
        }
    } else if (tab === 'juz') {
        const juzNum = parseInt(document.getElementById('pickerJuzSelect')?.value || '1', 10);
        const juz = (typeof QURAN_JUZS !== 'undefined' && QURAN_JUZS.find(j => j.juz === juzNum)) || { name: 'الجزء الأول', rubs: [] };
        const rubVal = document.getElementById('pickerRubSelect')?.value || 'full';

        if (rubVal === 'full') {
            text = `${juz.name} كاملاً`;
        } else if (rubVal === 'hizb1') {
            text = `${juz.name} - الحزب الأول`;
        } else if (rubVal === 'hizb2') {
            text = `${juz.name} - الحزب الثاني`;
        } else if (rubVal.startsWith('rub_')) {
            const rubIdx = parseInt(rubVal.replace('rub_', ''), 10) - 1;
            text = `${juz.name} - ربع: ${juz.rubs[rubIdx]}`;
        }
    }

    const previewEl = document.getElementById('quranPreviewText');
    if (previewEl) previewEl.textContent = text;
    return text;
}

function insertQuranSelection() {
    const text = updateQuranPreview();
    if (!text || !activePicker.studentId || !activePicker.fieldKey) {
        closeQuranPicker();
        return;
    }

    const s = students.find(x => x.id === activePicker.studentId);
    if (s) {
        const existing = (s[activePicker.fieldKey] || '').trim();
        s[activePicker.fieldKey] = existing ? `${existing}\n${text}` : text;
        saveState();
        render();
        showToast(`تم إدراج: ${text}`);
    }
    closeQuranPicker();
}

/* ==========================================================================
   منظومة إعدادات المعلم وتخصيص الحقول (Field Visibility Settings)
   ========================================================================== */
function openSettingsModal() {
    const fields = ['تسميع', 'ماضي_قريب', 'مراجعة_قديمة', 'حفظ', 'ماضي_قريب_جديد', 'مراجعة', 'ملاحظات', 'وسام', 'quran_picker'];
    fields.forEach(k => {
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
    const fields = ['تسميع', 'ماضي_قريب', 'مراجعة_قديمة', 'حفظ', 'ماضي_قريب_جديد', 'مراجعة', 'ملاحظات', 'وسام', 'quran_picker'];
    fields.forEach(k => {
        const el = document.getElementById(`vis_${k}`);
        if (el) fieldVisibility[k] = el.checked;
    });

    localStorage.setItem('sana_field_vis', JSON.stringify(fieldVisibility));
    render();
    showToast('تم حفظ تفضيلات الحقول ✓');
}

function resetFieldVisibility() {
    fieldVisibility = { ...DEFAULT_FIELD_VISIBILITY };
    const fields = ['تسميع', 'ماضي_قريب', 'مراجعة_قديمة', 'حفظ', 'ماضي_قريب_جديد', 'مراجعة', 'ملاحظات', 'وسام', 'quran_picker'];
    fields.forEach(k => {
        const el = document.getElementById(`vis_${k}`);
        if (el) el.checked = true;
    });

    localStorage.setItem('sana_field_vis', JSON.stringify(fieldVisibility));
    render();
    showToast('تم استعادة كافة الحقول ✓');
}

