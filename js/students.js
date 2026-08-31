/**
 * عمليات وبيانات الطلاب (Student Operations)
 */
function addStudent() {
    const id = Date.now();
    students.unshift({
        id,
        name: '',
        gender: 'male',
        تسميع: '',
        تقييم_تسميع: 'ممتاز',
        ماضي_قريب: '',
        تقييم_ماضي_قريب: 'ممتاز',
        مراجعة_قديمة: '',
        تقييم_مراجعة: 'ممتاز',
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
    genderBadge.className = `badge badge-gender badge-${s.gender}`;
    genderBadge.textContent = s.gender === 'male' ? 'ذكر' : 'أنثى';
    card.querySelector('.badge-grade').textContent = s.تقييم_تسميع;
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
    if (current) current.students = [];

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
    showToast(`تم مسح بيانات ${current.name} بنجاح`);
}

function rolloverStudent(id) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    if (!confirm(`تدوير واجبات ${s.name || 'الطالب'}؟\n- الحفظ الجديد → التسميع\n- الماضي القريب المطلوب → الماضي القريب\n- الماضي البعيد المطلوب → الماضي البعيد`)) return;

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
