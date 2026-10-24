/**
 * عمليات وبيانات الطلاب (Student Operations)
 */
function addStudent() {
    const id = Date.now();
    students.unshift({
        id,
        name: '',
        // الجنس والتقييمات تبدأ فارغة حتى يختارها المعلم؛ فالافتراض كان يُطبع على أنه اختيار.
        gender: '',
        تسميع: '',
        تقييم_تسميع: '',
        ماضي_قريب: '',
        تقييم_ماضي_قريب: '',
        مراجعة_قديمة: '',
        تقييم_مراجعة: '',
        حفظ: '',
        ماضي_قريب_جديد: '',
        مراجعة: '',
        ملاحظات: '',
        وسام: ''
    });
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

function renderStudentHeader(id) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    const card = document.querySelector(`.student-card[data-id="${id}"]`);
    if (!card) return;
    card.querySelector('.student-name-display').textContent = s.name.trim() || 'طالب جديد';
    const genderBadge = card.querySelector('.badge-gender');
    genderBadge.className = `badge badge-gender badge-${s.gender || 'none'}`;
    genderBadge.textContent = genderLabel(s.gender);
    card.querySelector('.badge-grade').textContent = s.تقييم_تسميع || 'بلا تقييم';
}

// الأسماء المعروفة {الاسم: الجنس} تُقترح في حقل الاسم وتملأ الجنس، فلا يُعاد كتابة الاسم كل حلقة.
function loadKnownNames() {
    try {
        return JSON.parse(localStorage.getItem('sana_known_names') || '{}');
    } catch (e) {
        return {};
    }
}

function addKnownNames(list) {
    const known = loadKnownNames();
    list.forEach(s => {
        const name = normalizeName(s.name);
        if (!nameProblem(name) && (s.gender === 'male' || s.gender === 'female')) known[name] = s.gender;
    });
    localStorage.setItem('sana_known_names', JSON.stringify(known));
    renderKnownNames();
}

function seedKnownNames() {
    addKnownNames(drafts.flatMap(d => d.students || []));
}

function renderKnownNames() {
    const list = document.getElementById('knownNames');
    if (!list) return;
    list.innerHTML = Object.keys(loadKnownNames()).sort()
        .map(n => `<option value="${escapeHtml(n)}"></option>`).join('');
}

function onNameCommitted(id, el) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    const name = normalizeName(el.value);
    el.value = name;
    s.name = name;
    const knownGender = fieldVisibility['name_suggestions'] !== false ? loadKnownNames()[name] : '';
    if (knownGender && !s.gender) {
        s.gender = knownGender;
        const genderSelect = studentFieldElement(id, 'gender');
        if (genderSelect) genderSelect.value = knownGender;
    }
    saveState();
    renderStudentHeader(id);
}

function update(id, field, val) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    s[field] = val;
    saveState();
    if (['name', 'gender', 'تقييم_تسميع'].includes(field)) {
        renderStudentHeader(id);
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
    const current = getActiveDraft();
    if (!confirm(`مسح بيانات "${current.name}"؟\nسيُصفَّر طلاب هذه المسودة وحقول الجلسة.`)) return;

    students = [];
    openIds.clear();
    if (current) {
        current.students = [];
        current.halaNum = '';
        current.studentCategory = 'أطفال';
        current.halaType = 'صباحية';
    }

    // تصفير حقول الجلسة مع استثناء اسم المعلم
    document.getElementById('reportDate').value = todayKey();
    document.getElementById('studentCategory').value = 'أطفال';
    document.getElementById('halaType').value = 'صباحية';
    document.getElementById('durationHours').value = '1';
    document.getElementById('durationMinutes').value = '0';
    document.getElementById('halaNum').value = '';

    saveState();
    render();
    showToast(`تم مسح بيانات ${current.name} بنجاح`);
}

function rolloverStudent(id) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    if (!confirm(`تدوير واجبات ${s.name || 'الطالب'}؟\n- الحفظ الجديد → التسميع\n- الماضي المطلوب → الماضي\n- الماضي القريب المطلوب → الماضي القريب`)) return;

    s.تسميع = s.حفظ || '';
    s.مراجعة_قديمة = s.مراجعة || '';
    s.ماضي_قريب = s.ماضي_قريب_جديد || '';
    s.حفظ = '';
    s.ماضي_قريب_جديد = '';
    s.مراجعة = '';
    s.ملاحظات = '';
    s.وسام = '';
    s.تقييم_تسميع = '';
    s.تقييم_ماضي_قريب = '';
    s.تقييم_مراجعة = '';
    saveState();
    render();
    showToast(`تم تدوير واجبات ${s.name || 'الطالب'} بنجاح ✓`);
}
