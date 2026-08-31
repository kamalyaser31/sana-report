/**
 * صياغة وتصدير التقارير النصية و PDF ونموذج الاستمارة (Reporting & Exporting)
 */
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
    if (vis('مراجعة_قديمة') && s.مراجعة_قديمة?.trim()) res += `الماضي البعيد:\n${s.مراجعة_قديمة.trim()}\nالتقييم: ${s.تقييم_مراجعة || 'ممتاز'}\n━━━━━━━━━━━━━━━\n`;
    if (vis('حفظ') && s.حفظ?.trim()) res += `الحفظ الجديد المطلوب:\n${s.حفظ.trim()}\n━━━━━━━━━━━━━━━\n`;
    if (vis('ماضي_قريب_جديد') && s.ماضي_قريب_جديد?.trim()) res += `الماضي القريب المطلوب:\n${s.ماضي_قريب_جديد.trim()}\n━━━━━━━━━━━━━━━\n`;
    if (vis('مراجعة') && s.مراجعة?.trim()) res += `الماضي البعيد المطلوب:\n${s.مراجعة.trim()}\n━━━━━━━━━━━━━━━\n`;
    if (vis('ملاحظات') && s.ملاحظات?.trim()) res += `ملاحظات:\n${s.ملاحظات.trim().replace(/يسمع/g, isMale ? 'يسمع' : 'تسمع').replace(/يستمر/g, isMale ? 'يستمر' : 'تستمر')}\n━━━━━━━━━━━━━━━\n`;
    if (vis('وسام') && s.وسام?.trim()) res += `الوسام:\n${s.وسام.trim()}\n`;
    return res.replace(/\n━━━━━━━━━━━━━━━\n$/, '');
}

function getFullReportText() {
    const getFieldValue = id => document.getElementById(id)?.value || '';
    const durationText = formatDurationText(getFieldValue('durationHours'), getFieldValue('durationMinutes'));

    let rep = `${BASMALA}\n${HEADER}\n`;
    rep += `التاريخ: ${getFieldValue('reportDate')}\n`;
    rep += `الفترة: ${getFieldValue('halaType')}\n`;
    if (getFieldValue('halaNum')) rep += `رقم الحلقة: ${getFieldValue('halaNum')}\n`;
    rep += `المدة: ${durationText}\n`;
    if (getFieldValue('teacherName')) rep += `المعلم: ${getFieldValue('teacherName')}\n`;
    rep += `عدد الطلاب: ${students.length}\n━━━━━━━━━━━━━━━\n`;

    // ترتيب عكسي لمطابقة أسلوب النشر المعتمد للحلقات
    [...students].reverse().forEach(s => rep += formatStudent(s) + "\n\n━━━━━━━━━━━━━━━\n");
    rep += `\n*نسأل الله لهم التوفيق والسداد.*`;
    return rep;
}

function copyAll(e) {
    if (!students.length) return showToast('لا يوجد طلاب مسجلون لنسخ التقرير');
    const rep = getFullReportText();
    copyText(rep, e?.target || document.querySelector('button[onclick*="copyAll"]'));
}

function copySingle(id, e) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    const getFieldValue = fieldId => document.getElementById(fieldId)?.value || '';
    const rep = `${BASMALA}\n${HEADER}\nالتاريخ: ${getFieldValue('reportDate')}\nالمعلم: ${getFieldValue('teacherName')}\n━━━━━━━━━━━━━━━\n${formatStudent(s)}\n\n*نسأل الله ${s.gender === 'male' ? 'له' : 'لها'} التوفيق.*`;
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
        // Clipboard denied — intentional fallback via native prompt
        prompt('انسخ التقرير:', text);
    });
}

function submitToGoogleForm() {
    if (!students.length) {
        return showToast('يرجى إضافة الطلاب قبل الإرسال للاستمارة');
    }

    const getFieldValue = id => document.getElementById(id)?.value || '';
    const reportText = getFullReportText();

    // نسخ النص للحافظة احتياطياً — الفشل هنا غير حرج ويُتجاهل عمداً
    navigator.clipboard?.writeText(reportText).catch(() => {});
    showToast('جاري فتح الاستمارة المعبأة...');

    // تجهيز معلمات الرابط المعبأ مسبقاً (Pre-filled URL)
    const params = new URLSearchParams();
    params.append('usp', 'pp_url');
    params.append(FORM_CONFIG.ENTRIES.TEACHER, getFieldValue('teacherName'));
    params.append(FORM_CONFIG.ENTRIES.STUDENT_CATEGORY, getFieldValue('studentCategory'));
    params.append(FORM_CONFIG.ENTRIES.HOURS, getFieldValue('durationHours') || '0');
    params.append(FORM_CONFIG.ENTRIES.MINUTES, getFieldValue('durationMinutes') || '0');
    params.append(FORM_CONFIG.ENTRIES.REPORT_TEXT, reportText);

    if (getFieldValue('adminNotes')) {
        params.append(FORM_CONFIG.ENTRIES.ADMIN_NOTES, getFieldValue('adminNotes'));
    }

    window.open(`${FORM_CONFIG.URL}?${params.toString()}`, '_blank');
}

function buildPdfHtml(sessionFields, studentsList) {
    const { date, halaType, studentCategory, teacherName, durationText } = sessionFields;

    const studentRows = studentsList.map((s, i) => `
        <div style="border:1px solid #006655;border-radius:5px;padding:10px;margin-bottom:10px;page-break-inside:avoid;font-size:13px;line-height:1.5;">
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding-bottom:4px;margin-bottom:6px;font-weight:bold;color:#006655;">
                <span>${i + 1}. ${s.gender === 'male' ? 'الطالب' : 'الطالبة'}: ${escapeHtml(s.name) || 'بدون اسم'}</span>
                ${fieldVisibility['تسميع'] !== false ? `<span>التقييم: ${s.تقييم_تسميع || 'ممتاز'}</span>` : ''}
            </div>
            ${(fieldVisibility['تسميع'] !== false && s.تسميع) ? `<div><strong>التسميع اليومي:</strong> ${escapeHtml(s.تسميع)} (تقييم: ${s.تقييم_تسميع || 'ممتاز'})</div>` : ''}
            ${(fieldVisibility['ماضي_قريب'] !== false && s.ماضي_قريب) ? `<div><strong>الماضي القريب:</strong> ${escapeHtml(s.ماضي_قريب)} (تقييم: ${s.تقييم_ماضي_قريب || 'ممتاز'})</div>` : ''}
            ${(fieldVisibility['مراجعة_قديمة'] !== false && s.مراجعة_قديمة) ? `<div><strong>الماضي البعيد:</strong> ${escapeHtml(s.مراجعة_قديمة)} (تقييم: ${s.تقييم_مراجعة || 'ممتاز'})</div>` : ''}
            ${(fieldVisibility['حفظ'] !== false && s.حفظ) ? `<div><strong>الحفظ الجديد المطلوب:</strong> ${escapeHtml(s.حفظ)}</div>` : ''}
            ${(fieldVisibility['ماضي_قريب_جديد'] !== false && s.ماضي_قريب_جديد) ? `<div><strong>الماضي القريب المطلوب:</strong> ${escapeHtml(s.ماضي_قريب_جديد)}</div>` : ''}
            ${(fieldVisibility['مراجعة'] !== false && s.مراجعة) ? `<div><strong>الماضي البعيد المطلوب:</strong> ${escapeHtml(s.مراجعة)}</div>` : ''}
            ${(fieldVisibility['ملاحظات'] !== false && s.ملاحظات) ? `<div><strong>ملاحظات:</strong> ${escapeHtml(s.ملاحظات)}</div>` : ''}
            ${(fieldVisibility['وسام'] !== false && s.وسام) ? `<div style="color:#d97706;font-weight:bold;"><strong>الوسام:</strong> ${escapeHtml(s.وسام)}</div>` : ''}
        </div>
    `).join('');

    return `
        <div style="text-align:center;border-bottom:2px solid #006655;padding-bottom:10px;margin-bottom:15px;">
            <h3 style="margin:0 0 5px 0;color:#006655;">${BASMALA}</h3>
            <h2 style="margin:0;">تقرير أكاديمية سنا لتعليم القرآن الكريم</h2>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:15px;font-size:13px;">
            <tr>
                <td style="padding:6px;border:1px solid #ddd;"><strong>التاريخ:</strong> ${escapeHtml(date)}</td>
                <td style="padding:6px;border:1px solid #ddd;"><strong>الفترة:</strong> ${escapeHtml(halaType)}</td>
                <td style="padding:6px;border:1px solid #ddd;"><strong>فئة الطلاب:</strong> ${escapeHtml(studentCategory)}</td>
            </tr>
            <tr>
                <td style="padding:6px;border:1px solid #ddd;"><strong>المعلم:</strong> ${escapeHtml(teacherName || '-')}</td>
                <td style="padding:6px;border:1px solid #ddd;"><strong>المدة:</strong> ${escapeHtml(durationText)}</td>
                <td style="padding:6px;border:1px solid #ddd;"><strong>عدد الطلاب:</strong> ${studentsList.length}</td>
            </tr>
        </table>
        ${studentRows}
        <div style="text-align:center;margin-top:15px;font-size:12px;color:#777;">نسأل الله للطلاب التوفيق والسداد • أكاديمية سنا</div>
    `;
}

function exportPDF() {
    if (!students.length) return showToast('لا يوجد طلاب لتصدير التقرير');
    showToast('جاري تجهيز ملف PDF...');
    const getFieldValue = id => document.getElementById(id)?.value || '';
    const durationText = formatDurationText(getFieldValue('durationHours'), getFieldValue('durationMinutes'));

    const sessionFields = {
        date: getFieldValue('reportDate'),
        halaType: getFieldValue('halaType'),
        studentCategory: getFieldValue('studentCategory'),
        teacherName: getFieldValue('teacherName'),
        durationText
    };

    const box = document.createElement('div');
    box.style.cssText = 'padding:20px;font-family:sans-serif;direction:rtl;color:#111;background:#fff;';
    box.innerHTML = buildPdfHtml(sessionFields, students);
    document.body.appendChild(box);

    const fname = `تقرير_سنا_${(getFieldValue('reportDate') || 'يومي').replace(/[ /\\:]/g, '_')}.pdf`;

    if (typeof html2pdf !== 'undefined') {
        html2pdf().set({ margin: 8, filename: fname, image: { type: 'jpeg', quality: 0.98 }, jsPDF: { unit: 'mm', format: 'a4' } }).from(box).save().then(() => box.remove()).catch(() => { box.remove(); window.print(); });
    } else {
        box.remove();
        window.print();
    }
}
