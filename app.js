/**
 * نظام تقارير أكاديمية سنا - المنطق البرمجي الرشيق
 */
const BASMALA = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";
const HEADER = "═══ [ تقرير أكاديمية سنا لتعليم القرآن الكريم ] ═══";
const GRADES = ["ممتاز", "جيد جداً", "جيد مرتفع", "جيد", "مقبول", "إعادة"];
const AWARDS = [
    "ما شاء الله، إتقان مبهر 🌟", "حفظ متين، بارك الله فيك 👑", "أداء ممتاز ومتميز 🏆",
    "تقدم ملحوظ، مستواك في تصاعد 🚀", "بداية طيبة، استمر يا بطل 📈", "همة قوية، الحفظ يأتي بالصبر ⏳",
    "محاولة جيدة، تحتاج إلى مزيد من التركيز 🎯", "ننتظر جدية أكبر ⚠️"
];

let students = JSON.parse(localStorage.getItem('sana_data') || '[]');
let openIds = new Set(students.length ? [students[0].id] : []);

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("sana_theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme);
    loadSettings();
    render();
    
    // ربط أحداث الإدخال لشريط الإعدادات
    ['reportDate', 'halaType', 'halaNum', 'halaDuration', 'teacherName'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', saveState);
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

function loadSettings() {
    const s = JSON.parse(localStorage.getItem('sana_settings') || '{}');
    document.getElementById('reportDate').value = s.date || new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('halaType').value = s.halaType || 'صباحية';
    document.getElementById('halaNum').value = s.halaNum || '';
    document.getElementById('halaDuration').value = s.halaDuration || '';
    document.getElementById('teacherName').value = s.teacherName || '';
}

function saveState() {
    localStorage.setItem('sana_data', JSON.stringify(students));
    localStorage.setItem('sana_settings', JSON.stringify({
        date: document.getElementById('reportDate').value,
        halaType: document.getElementById('halaType').value,
        halaNum: document.getElementById('halaNum').value,
        halaDuration: document.getElementById('halaDuration').value,
        teacherName: document.getElementById('teacherName').value
    }));
    renderStats();
}

function addStudent() {
    const id = Date.now();
    students.unshift({ id, name: '', gender: 'male', تسميع: '', تقييم_تسميع: 'ممتاز', مراجعة_قديمة: '', تقييم_مراجعة: 'ممتاز', حفظ: '', مراجعة: '', ملاحظات: '', وسام: '' });
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

function toggleCard(id) {
    openIds.has(id) ? openIds.delete(id) : openIds.add(id);
    document.querySelector(`.student-card[data-id="${id}"]`)?.classList.toggle('open', openIds.has(id));
}

function toggleAll() {
    const allOpen = openIds.size === students.length && students.length > 0;
    openIds = allOpen ? new Set() : new Set(students.map(s => s.id));
    document.getElementById('expandAllBtn').textContent = allOpen ? 'توسيع الكل' : 'طي الكل';
    render();
}

function clearAll() {
    if (confirm('هل أنت متأكد من مسح التقرير كاملاً؟')) {
        students = [];
        openIds.clear();
        localStorage.removeItem('sana_data');
        render();
    }
}

function rolloverHomework() {
    if (!students.length) return alert('لا يوجد طلاب مسجلون لتدوير واجباتهم.');
    if (!confirm('هل ترغب في تدوير الواجبات لتقرير جديد؟\n\nسيتم نقل (الحفظ الجديد) إلى (التسميع)، و(المراجعة) إلى (المراجعة القديمة)، وتفريغ خانات الواجبات والتقييمات للبدء من جديد.')) return;
    
    students.forEach(s => {
        s.تسميع = s.حفظ || '';
        s.مراجعة_قديمة = s.مراجعة || '';
        s.حفظ = '';
        s.مراجعة = '';
        s.ملاحظات = '';
        s.وسام = '';
        s.تقييم_تسميع = 'ممتاز';
        s.تقييم_مراجعة = 'ممتاز';
    });
    
    document.getElementById('reportDate').value = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    saveState();
    render();
    alert('تم تدوير الواجبات بنجاح وتحديث تاريخ التقرير.');
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
        { k: 'تسميع', l: 'التسميع اليومي:', t: 'area', ph: 'السور أو الآيات التي سُمّعت' },
        { k: 'تقييم_تسميع', l: 'تقييم التسميع:', t: 'sel', opts: GRADES },
        { k: 'مراجعة_قديمة', l: 'المراجعة القديمة:', t: 'area', ph: 'المحفوظات السابقة' },
        { k: 'تقييم_مراجعة', l: 'تقييم المراجعة:', t: 'sel', opts: GRADES },
        { k: 'حفظ', l: 'الحفظ الجديد المطلوب:', t: 'area', ph: 'المقرر للحصة القادمة' },
        { k: 'مراجعة', l: 'المراجعة القريبة:', t: 'area', ph: 'المراجعة للحصة القادمة' },
        { k: 'ملاحظات', l: 'ملاحظات المعلم:', t: 'area', ph: 'توجيهات لولي الأمر أو الطالب' },
        { k: 'وسام', l: 'الوسام التشجيعي:', t: 'sel', opts: ['', ...AWARDS], def: '-- اختر وساماً --' }
    ];

    list.innerHTML = students.map((s, idx) => {
        const isOpen = openIds.has(s.id);
        const fieldsHtml = fields.map(f => `
            <div class="form-group">
                <label>${f.l}</label>
                ${f.t === 'area' 
                    ? `<textarea placeholder="${f.ph}" oninput="update(${s.id},'${f.k}',this.value)">${escapeHtml(s[f.k])}</textarea>`
                    : `<select onchange="update(${s.id},'${f.k}',this.value)">
                        ${f.opts.map(o => `<option value="${escapeHtml(o)}" ${s[f.k] === o ? 'selected' : ''}>${o || f.def}</option>`).join('')}
                       </select>`}
            </div>
        `).join('');

        return `
        <article class="student-card ${isOpen ? 'open' : ''}" data-id="${s.id}">
            <header class="card-header" onclick="toggleCard(${s.id})" aria-expanded="${isOpen}">
                <div class="card-header-info">
                    <span class="student-index-badge">${idx + 1}</span>
                    <strong class="student-name-display">${escapeHtml(s.name) || 'طالب جديد'}</strong>
                    <span class="badge badge-gender badge-${s.gender}">${s.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                    <span class="badge badge-grade">${s.تقييم_تسميع}</span>
                </div>
                <span class="toggle-icon">▼</span>
            </header>
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
                    <button type="button" onclick="copySingle(${s.id})" class="btn btn-primary btn-sm">نسخ تقرير الطالب</button>
                    <button type="button" onclick="removeStudent(${s.id})" class="btn btn-danger btn-sm">حذف الطالب</button>
                </footer>
            </div>
        </article>`;
    }).join('');
}

function formatStudent(s) {
    const isMale = s.gender === 'male';
    let res = `${isMale ? 'الطالب' : 'الطالبة'}: ${s.name.trim() || 'بدون اسم'}\n\n`;
    if (s.تسميع?.trim()) res += `التسميع:\n${s.تسميع.trim()}\nالتقييم: ${s.تقييم_تسميع}\n━━━━━━━━━━━━━━━\n`;
    if (s.مراجعة_قديمة?.trim()) res += `المراجعة القديمة:\n${s.مراجعة_قديمة.trim()}\nالتقييم: ${s.تقييم_مراجعة}\n━━━━━━━━━━━━━━━\n`;
    if (s.حفظ?.trim()) res += `الحفظ الجديد:\n${s.حفظ.trim()}\n━━━━━━━━━━━━━━━\n`;
    if (s.مراجعة?.trim()) res += `المراجعة:\n${s.مراجعة.trim()}\n━━━━━━━━━━━━━━━\n`;
    if (s.ملاحظات?.trim()) res += `ملاحظات:\n${s.ملاحظات.trim().replace(/يسمع/g, isMale ? 'يسمع' : 'تسمع').replace(/يستمر/g, isMale ? 'يستمر' : 'تستمر')}\n━━━━━━━━━━━━━━━\n`;
    if (s.وسام?.trim()) res += `الوسام:\n${s.وسام.trim()}\n`;
    return res.replace(/\n━━━━━━━━━━━━━━━\n$/, '');
}

function copyAll() {
    if (!students.length) return alert('لا يوجد طلاب مسجلون لنسخ بياناتهم.');
    const d = id => document.getElementById(id)?.value || '';
    let rep = `${BASMALA}\n${HEADER}\nالتاريخ: ${d('reportDate')}\nالفترة: ${d('halaType')}\n`;
    if (d('halaNum')) rep += `رقم الحلقة: ${d('halaNum')}\n`;
    if (d('halaDuration')) rep += `المدة: ${d('halaDuration')}\n`;
    if (d('teacherName')) rep += `المعلم: ${d('teacherName')}\n`;
    rep += `عدد الطلاب: ${students.length}\n━━━━━━━━━━━━━━━\n`;
    [...students].reverse().forEach(s => rep += formatStudent(s) + "\n\n━━━━━━━━━━━━━━━\n");
    rep += `\n*نسأل الله لهم التوفيق والسداد.*`;
    copyText(rep, 'تم نسخ التقرير الكلي بنجاح.');
}

function copySingle(id) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    const d = id => document.getElementById(id)?.value || '';
    let rep = `${BASMALA}\n${HEADER}\nالتاريخ: ${d('reportDate')}\nالمعلم: ${d('teacherName')}\n━━━━━━━━━━━━━━━\n${formatStudent(s)}\n\n*نسأل الله ${s.gender === 'male' ? 'له' : 'لها'} التوفيق.*`;
    copyText(rep, `تم نسخ تقرير ${s.name || 'الطالب'} بنجاح.`);
}

function copyText(text, msg) {
    navigator.clipboard?.writeText(text).then(() => alert(msg)).catch(() => {
        prompt('انسخ التقرير:', text);
    });
}

function exportPDF() {
    if (!students.length) return alert('لا يوجد طلاب لتصدير التقرير.');
    const d = id => document.getElementById(id)?.value || '';
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
                <td style="padding:6px;border:1px solid #ddd;"><strong>رقم الحلقة:</strong> ${escapeHtml(d('halaNum') || '-')}</td>
            </tr>
            <tr>
                <td style="padding:6px;border:1px solid #ddd;"><strong>المعلم:</strong> ${escapeHtml(d('teacherName') || '-')}</td>
                <td style="padding:6px;border:1px solid #ddd;"><strong>المدة:</strong> ${escapeHtml(d('halaDuration') || '-')}</td>
                <td style="padding:6px;border:1px solid #ddd;"><strong>عدد الطلاب:</strong> ${students.length}</td>
            </tr>
        </table>
        ${students.map((s, i) => `
            <div style="border:1px solid #006655;border-radius:5px;padding:10px;margin-bottom:10px;page-break-inside:avoid;font-size:13px;line-height:1.5;">
                <div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding-bottom:4px;margin-bottom:6px;font-weight:bold;color:#006655;">
                    <span>${i + 1}. ${s.gender === 'male' ? 'الطالب' : 'الطالبة'}: ${escapeHtml(s.name) || 'بدون اسم'}</span>
                    <span>التقييم: ${s.تقييم_تسميع}</span>
                </div>
                ${s.تسميع ? `<div><strong>التسميع:</strong> ${escapeHtml(s.تسميع)}</div>` : ''}
                ${s.مراجعة_قديمة ? `<div><strong>المراجعة القديمة:</strong> ${escapeHtml(s.مراجعة_قديمة)} (تقييم: ${s.تقييم_مراجعة})</div>` : ''}
                ${s.حفظ ? `<div><strong>الحفظ الجديد:</strong> ${escapeHtml(s.حفظ)}</div>` : ''}
                ${s.مراجعة ? `<div><strong>المراجعة:</strong> ${escapeHtml(s.مراجعة)}</div>` : ''}
                ${s.ملاحظات ? `<div><strong>ملاحظات:</strong> ${escapeHtml(s.ملاحظات)}</div>` : ''}
                ${s.وسام ? `<div style="color:#d97706;font-weight:bold;"><strong>الوسام:</strong> ${escapeHtml(s.وسام)}</div>` : ''}
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
