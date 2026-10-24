/**
 * بوابة التحقق قبل نسخ التقرير أو إرساله أو تصديره (Input Validation)
 * يمنع هنا ما كان سجل الطلاب في منظومة الأتمتة يصلحه بعد وصوله.
 */
const NAME_LETTERS_ONLY = /^[\p{L}\p{M} ]+$/u;
const RATED_FIELDS = [
    { text: 'تسميع', rating: 'تقييم_تسميع', label: 'تقييم التسميع' },
    { text: 'مراجعة_قديمة', rating: 'تقييم_مراجعة', label: 'تقييم الماضي' },
    { text: 'ماضي_قريب', rating: 'تقييم_ماضي_قريب', label: 'تقييم الماضي القريب' }
];

function normalizeName(name) {
    return String(name || '').replace(/[\s​-‏؜﻿]+/g, ' ').trim();
}

function toWesternDigits(text) {
    return String(text || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

/** يعيد سبب رفض الاسم، أو نصاً فارغاً إن كان مقبولاً. */
function nameProblem(name) {
    const clean = normalizeName(name);
    if (!clean) return 'اكتب اسم الطالب.';
    if (!NAME_LETTERS_ONLY.test(clean)) return 'الاسم حروف فقط، بلا أرقام ولا رموز.';
    if (clean.split(' ').length < 2) return 'اكتب الاسم ثنائياً، مثل «محمد سامي» أو «أم محمد».';
    return '';
}

function studentLabel(s, index) {
    return normalizeName(s.name) || `الطالب رقم ${index + 1}`;
}

/** يتحقق من طالب واحد، فيعيد { field, message } لأول خطأ، أو null. */
function studentProblem(s, index) {
    const problem = nameProblem(s.name);
    if (problem) return { field: 'name', message: `${studentLabel(s, index)}: ${problem}` };
    if (s.gender !== 'male' && s.gender !== 'female') {
        return { field: 'gender', message: `${studentLabel(s, index)}: اختر الجنس.` };
    }
    for (const f of RATED_FIELDS) {
        if (fieldVisibility[f.text] !== false && s[f.text]?.trim() && !s[f.rating]) {
            return { field: f.rating, message: `${studentLabel(s, index)}: اختر ${f.label}.` };
        }
    }
    return null;
}

/** مفتاح المطابقة نفسه الذي يستعمله سجل الطلاب في الأتمتة (S-03)، فما يدمجه السجل يُمنع هنا. */
function nameMatchKey(name) {
    return normalizeName(name)
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/[ً-ْٰـ\s]/g, '');
}

function duplicateNameProblem(list) {
    const seen = new Map();
    for (let i = 0; i < list.length; i++) {
        const key = nameMatchKey(list[i].name);
        if (seen.has(key)) {
            const first = normalizeName(list[seen.get(key)].name);
            const second = normalizeName(list[i].name);
            const names = first === second ? `«${first}»` : `«${first}» و«${second}»`;
            return { index: i, message: `في التقرير اسمان متطابقان: ${names}. ميّز بينهما بالاسم الثالث.` };
        }
        seen.set(key, i);
    }
    return null;
}

function reportDateProblem() {
    return document.getElementById('reportDate')?.value ? '' : 'اختر تاريخ الحلقة.';
}

function halaNumProblem() {
    const value = toWesternDigits(document.getElementById('halaNum')?.value).trim();
    return /^[1-9]\d*$/.test(value) ? '' : 'اكتب رقم الحلقة رقماً صحيحاً، مثل 12.';
}

function clearInvalidMarks() {
    document.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
    const live = document.getElementById('validationLive');
    if (live) live.textContent = '';
}

/** يعلن الخطأ ويوسم الحقل وينقل التركيز إليه، فاتحاً ما يحويه من بطاقة أو قسم. */
function announceError(message, el) {
    if (el) {
        const container = el.closest('details');
        if (container) {
            container.open = true;
            if (container.dataset.id) openIds.add(Number(container.dataset.id));
        }
        el.setAttribute('aria-invalid', 'true');
        el.addEventListener('input', () => el.removeAttribute('aria-invalid'), { once: true });
        el.addEventListener('change', () => el.removeAttribute('aria-invalid'), { once: true });
        // التوسيط يُبعد الحقل عن شريط الإجراءات الثابت أسفل الشاشة.
        el.scrollIntoView({ block: 'center' });
        el.focus();
    }
    const live = document.getElementById('validationLive');
    if (live) {
        // التفريغ ثم الكتابة في الإطار التالي يجعل قارئ الشاشة يعيد الإعلان وإن تكررت الرسالة.
        live.textContent = '';
        requestAnimationFrame(() => { live.textContent = message; });
    }
}

function studentFieldElement(studentId, field) {
    return document.querySelector(`.student-card[data-id="${studentId}"] [data-field="${field}"]`);
}

function failStudent(s, problem) {
    announceError(problem.message, studentFieldElement(s.id, problem.field));
    return { ok: false, message: problem.message };
}

function failField(id, message) {
    announceError(message, document.getElementById(id));
    return { ok: false, message };
}

/** بوابة التقرير الكامل: التاريخ ورقم الحلقة ثم الطلاب بترتيب عرضهم ثم تكرار الأسماء. */
function validateReport() {
    clearInvalidMarks();
    const dateProblem = reportDateProblem();
    if (dateProblem) return failField('reportDate', dateProblem);
    const halaProblem = halaNumProblem();
    if (halaProblem) return failField('halaNum', halaProblem);

    for (let i = 0; i < students.length; i++) {
        const problem = studentProblem(students[i], i);
        if (problem) return failStudent(students[i], problem);
    }
    const duplicate = duplicateNameProblem(students);
    if (duplicate) {
        return failStudent(students[duplicate.index], { field: 'name', message: duplicate.message });
    }
    return { ok: true };
}

/** بوابة تقرير الطالب الواحد: التاريخ وبيانات الطالب، بلا رقم الحلقة لأنه لا يُطبع فيه. */
function validateStudent(s) {
    clearInvalidMarks();
    const dateProblem = reportDateProblem();
    if (dateProblem) return failField('reportDate', dateProblem);
    const problem = studentProblem(s, students.indexOf(s));
    return problem ? failStudent(s, problem) : { ok: true };
}
