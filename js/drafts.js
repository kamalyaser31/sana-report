/**
 * منظومة إدارة مسودات الحلقات المتعددة (Multi-Session Drafts)
 */
function initDrafts() {
    const saved = localStorage.getItem('sana_drafts');
    if (saved) {
        try {
            drafts = JSON.parse(saved);
        } catch (e) {
            console.warn('sana_drafts corrupted, resetting:', e);
            drafts = [];
        }
    }

    // ترحيل البيانات السابقة إن وجدت أو إنشاء المسودة 1 افتراضياً
    if (!drafts || !Array.isArray(drafts) || drafts.length === 0) {
        const legacyData = JSON.parse(localStorage.getItem('sana_data') || '[]');
        const legacySettings = JSON.parse(localStorage.getItem('sana_settings') || '{}');
        drafts = [
            {
                id: 'draft_' + Date.now(),
                name: 'المسودة 1',
                halaNum: legacySettings.halaNum || '',
                students: legacyData
            }
        ];
        localStorage.setItem('sana_drafts', JSON.stringify(drafts));
    }

    const savedActiveId = localStorage.getItem('sana_active_draft_id');
    const existing = drafts.find(d => d.id === savedActiveId);
    const activeDraft = existing || drafts[0];

    activeDraftId = activeDraft.id;
    students = activeDraft.students || [];

    const halaNumEl = document.getElementById('halaNum');
    if (halaNumEl) {
        halaNumEl.value = activeDraft.halaNum || '';
    }

    openIds = new Set(students.length ? [students[0].id] : []);
    updateDraftSelectUI();
}

function getActiveDraft() {
    return drafts.find(d => d.id === activeDraftId) || drafts[0];
}

function formatArabicStudentCount(count) {
    if (count === 1) return '1 طالب';
    if (count === 2) return '2 طالبان';
    if (count >= 3 && count <= 10) return `${count} طلاب`;
    return `${count} طالباً`;
}

function updateDraftSelectUI() {
    const select = document.getElementById('draftSelect');
    if (!select) return;
    select.innerHTML = '';
    drafts.forEach((d) => {
        const opt = document.createElement('option');
        opt.value = d.id;
        const count = (d.students || []).length;
        const halaLabel = d.halaNum ? ` [حلقة ${d.halaNum}]` : '';
        opt.textContent = `${d.name}${halaLabel} (${formatArabicStudentCount(count)})`;
        if (d.id === activeDraftId) opt.selected = true;
        select.appendChild(opt);
    });
}

function onDraftChange(newId) {
    if (newId === activeDraftId) return;
    const current = getActiveDraft();
    if (current) {
        current.students = students;
        current.halaNum = document.getElementById('halaNum')?.value || '';
    }

    activeDraftId = newId;
    localStorage.setItem('sana_active_draft_id', activeDraftId);

    const nextDraft = getActiveDraft();
    students = nextDraft.students || [];
    openIds = new Set(students.length ? [students[0].id] : []);

    const halaNumEl = document.getElementById('halaNum');
    if (halaNumEl) {
        halaNumEl.value = nextDraft.halaNum || '';
    }

    localStorage.setItem('sana_drafts', JSON.stringify(drafts));
    localStorage.setItem('sana_data', JSON.stringify(students));

    updateDraftSelectUI();
    render();
    updateSettingsSummary();
    showToast(`تم التبديل إلى: ${nextDraft.name}`);
}

function createNewDraftPrompt() {
    const nextNum = drafts.length + 1;
    const name = prompt('أدخل اسم المسودة الجديدة:', `المسودة ${nextNum}`);
    if (!name || !name.trim()) return;

    const current = getActiveDraft();
    if (current) {
        current.students = students;
        current.halaNum = document.getElementById('halaNum')?.value || '';
    }

    const newDraft = {
        id: 'draft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: name.trim(),
        halaNum: '',
        students: []
    };

    drafts.push(newDraft);
    activeDraftId = newDraft.id;
    students = newDraft.students;
    openIds = new Set();

    const halaNumEl = document.getElementById('halaNum');
    if (halaNumEl) {
        halaNumEl.value = '';
    }

    localStorage.setItem('sana_drafts', JSON.stringify(drafts));
    localStorage.setItem('sana_active_draft_id', activeDraftId);
    localStorage.setItem('sana_data', JSON.stringify(students));

    updateDraftSelectUI();
    render();
    updateSettingsSummary();
    showToast(`تم إنشاء: ${newDraft.name}`);
}

function renameCurrentDraftPrompt() {
    const current = getActiveDraft();
    if (!current) return;
    const newName = prompt('أدخل الاسم الجديد للمسودة:', current.name);
    if (!newName || !newName.trim() || newName.trim() === current.name) return;

    current.name = newName.trim();
    localStorage.setItem('sana_drafts', JSON.stringify(drafts));
    updateDraftSelectUI();
    showToast(`تم تغيير الاسم إلى: ${current.name}`);
}

function deleteCurrentDraftConfirm() {
    if (drafts.length <= 1) {
        alert('لا يمكن حذف المسودة الأخيرة.');
        return;
    }
    const current = getActiveDraft();
    const count = (current.students || []).length;
    const msg = count > 0
        ? `هل أنت متأكد من حذف "${current.name}" التي تحتوي على ${count} طالب؟`
        : `هل أنت متأكد من حذف "${current.name}"؟`;

    if (!confirm(msg)) return;

    const deletedName = current.name;
    drafts = drafts.filter(d => d.id !== current.id);
    activeDraftId = drafts[0].id;
    students = drafts[0].students || [];
    openIds = new Set(students.length ? [students[0].id] : []);

    const halaNumEl = document.getElementById('halaNum');
    if (halaNumEl) {
        halaNumEl.value = drafts[0].halaNum || '';
    }

    localStorage.setItem('sana_drafts', JSON.stringify(drafts));
    localStorage.setItem('sana_active_draft_id', activeDraftId);
    localStorage.setItem('sana_data', JSON.stringify(students));

    updateDraftSelectUI();
    render();
    updateSettingsSummary();
    showToast(`تم حذف: ${deletedName}`);
}
