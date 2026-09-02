/**
 * بناء وعرض عناصر الواجهة وبطاقات الطلاب (DOM Rendering)
 */
function renderStats() {
    document.getElementById('totalCount').textContent = students.length;
    document.getElementById('maleCount').textContent = students.filter(s => s.gender === 'male').length;
    document.getElementById('femaleCount').textContent = students.filter(s => s.gender === 'female').length;
}

function isFieldVisible(k) {
    if (k.startsWith('تقييم_')) {
        return fieldVisibility[k.replace('تقييم_', '')] !== false;
    }
    return fieldVisibility[k] !== false;
}

function buildStudentFieldHtml(f, s) {
    const isQuranField = ['تسميع', 'ماضي_قريب', 'مراجعة_قديمة', 'حفظ', 'ماضي_قريب_جديد', 'مراجعة'].includes(f.k);
    const showQuranBtn = isQuranField && (fieldVisibility['quran_picker'] !== false);
    const quranBtn = showQuranBtn
        ? `<button type="button" class="btn-quran" onclick="openQuranPicker(${s.id}, '${f.k}')" aria-label="اختيار من المصحف لحقل ${f.l}">📖 مصحف</button>`
        : '';

    const inputHtml = f.t === 'area'
        ? `<textarea placeholder="${f.ph}" aria-label="${f.l}" oninput="update(${s.id},'${f.k}',this.value)">${escapeHtml(s[f.k])}</textarea>`
        : `<select aria-label="${f.l}" onchange="update(${s.id},'${f.k}',this.value)">
            ${f.opts.map(o => `<option value="${escapeHtml(o)}" ${s[f.k] === o ? 'selected' : ''}>${o || f.def}</option>`).join('')}
           </select>`;

    return `
    <div class="form-group">
        <div class="field-header">
            <label>${f.l}</label>
            ${quranBtn}
        </div>
        ${inputHtml}
    </div>`;
}

function buildStudentCardHtml(s, idx, isOpen, visibleFields) {
    const fieldsHtml = visibleFields.map(f => buildStudentFieldHtml(f, s)).join('');

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
                    <input type="text" value="${escapeHtml(s.name)}" placeholder="اسم الطالب" aria-label="اسم الطالب" oninput="update(${s.id},'name',this.value)">
                </div>
                <div class="form-group">
                    <label>الجنس:</label>
                    <select aria-label="الجنس" onchange="update(${s.id},'gender',this.value)">
                        <option value="male" ${s.gender === 'male' ? 'selected' : ''}>ذكر</option>
                        <option value="female" ${s.gender === 'female' ? 'selected' : ''}>أنثى</option>
                    </select>
                </div>
                ${fieldsHtml}
            </div>
            <footer class="card-actions">
                <button type="button" onclick="copySingle(${s.id}, event)" class="btn btn-primary btn-sm">نسخ</button>
                <button type="button" onclick="rolloverStudent(${s.id})" class="btn btn-outline btn-sm" style="border-color:var(--primary);color:var(--primary);" aria-label="تدوير الواجبات">تدوير الواجبات</button>
                <button type="button" onclick="removeStudent(${s.id})" class="btn btn-danger btn-sm">حذف</button>
            </footer>
        </div>
    </details>`;
}

function render() {
    renderStats();
    const list = document.getElementById('studentsList');
    if (!students.length) {
        list.innerHTML = `<div class="empty-state"><p>لم يتم تسجيل أي طالب حتى الآن.</p><button type="button" onclick="addStudent()" class="btn btn-success">+ إضافة الطالب الأول</button></div>`;
        return;
    }

    const visibleFields = STUDENT_FIELDS.filter(f => isFieldVisible(f.k));
    list.innerHTML = students.map((s, idx) => buildStudentCardHtml(s, idx, openIds.has(s.id), visibleFields)).join('');

    // تسجيل حالة فتح وغلق البطاقات
    list.querySelectorAll('.student-card').forEach(card => {
        card.addEventListener('toggle', () => {
            const id = Number(card.dataset.id);
            card.open ? openIds.add(id) : openIds.delete(id);
        });
    });
}
