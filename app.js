/**
 * نظام تقارير أكاديمية سنا لتعليم القرآن الكريم
 * المنطق البرمجي وإدارة الحالة والواجهة
 */

// الثوابت والخيارات الأساسية
const BASMALA = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";
const REPORT_HEADER = "═══ [ تقرير أكاديمية سنا لتعليم القرآن الكريم ] ═══";
const GRADES = ["ممتاز", "جيد جداً", "جيد مرتفع", "جيد", "مقبول", "إعادة"];
const AWARDS = [
    "ما شاء الله، إتقان مبهر 🌟",
    "حفظ متين، بارك الله فيك 👑",
    "أداء ممتاز ومتميز 🏆",
    "تقدم ملحوظ، مستواك في تصاعد 🚀",
    "بداية طيبة، استمر يا بطل 📈",
    "همة قوية، الحفظ يأتي بالصبر ⏳",
    "محاولة جيدة، تحتاج إلى مزيد من التركيز 🎯",
    "ننتظر جدية أكبر ⚠️"
];

// حالة التطبيق
let students = [];
let expandedStudentIds = new Set();

// بدء التشغيل
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    loadState();
    renderStats();
    renderStudents();
    setupEventListeners();
});

// تهيئة وإدارة المظهر والوضع الليلي
function initTheme() {
    const savedTheme = localStorage.getItem("sana_theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(theme);
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sana_theme", theme);
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (themeToggleBtn) {
        themeToggleBtn.textContent = theme === "dark" ? "الوضع الفاتح ☀️" : "الوضع الليلي 🌙";
        themeToggleBtn.setAttribute("aria-label", theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الليلي");
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
}

// تحميل وحفظ الحالة
function loadState() {
    try {
        const storedData = localStorage.getItem("sana_data");
        students = storedData ? JSON.parse(storedData) : [];
        if (students.length > 0) {
            // فتح بطاقة الطالب الأول تلقائياً افتراضياً
            expandedStudentIds.add(students[0].id);
        }
    } catch (e) {
        console.error("خطأ في قراءة بيانات الطلاب من التخزين المحلي:", e);
        students = [];
    }

    try {
        const storedSettings = localStorage.getItem("sana_settings");
        if (storedSettings) {
            const s = JSON.parse(storedSettings);
            if (document.getElementById("reportDate")) document.getElementById("reportDate").value = s.date || "";
            if (document.getElementById("halaType")) document.getElementById("halaType").value = s.halaType || "صباحية";
            if (document.getElementById("halaNum")) document.getElementById("halaNum").value = s.halaNum || "";
            if (document.getElementById("halaDuration")) document.getElementById("halaDuration").value = s.halaDuration || "";
            if (document.getElementById("teacherName")) document.getElementById("teacherName").value = s.teacherName || "";
        } else {
            const today = new Date().toLocaleDateString("ar-EG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
            if (document.getElementById("reportDate")) document.getElementById("reportDate").value = today;
        }
    } catch (e) {
        console.error("خطأ في قراءة إعدادات التقرير:", e);
    }
}

function saveState() {
    try {
        localStorage.setItem("sana_data", JSON.stringify(students));
        const settings = {
            date: document.getElementById("reportDate")?.value || "",
            halaType: document.getElementById("halaType")?.value || "صباحية",
            halaNum: document.getElementById("halaNum")?.value || "",
            halaDuration: document.getElementById("halaDuration")?.value || "",
            teacherName: document.getElementById("teacherName")?.value || ""
        };
        localStorage.setItem("sana_settings", JSON.stringify(settings));
    } catch (e) {
        console.error("خطأ في حفظ البيانات:", e);
    }
    renderStats();
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    const fields = ["reportDate", "halaType", "halaNum", "halaDuration", "teacherName"];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", saveState);
            el.addEventListener("change", saveState);
        }
    });

    const addStudentBtn = document.getElementById("addStudentBtn");
    if (addStudentBtn) addStudentBtn.addEventListener("click", addStudent);

    const clearAllBtn = document.getElementById("clearAllBtn");
    if (clearAllBtn) clearAllBtn.addEventListener("click", clearAll);

    const copyAllBtn = document.getElementById("copyAllBtn");
    if (copyAllBtn) copyAllBtn.addEventListener("click", copyAll);

    const exportPDFBtn = document.getElementById("exportPDFBtn");
    if (exportPDFBtn) exportPDFBtn.addEventListener("click", exportPDF);

    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (themeToggleBtn) themeToggleBtn.addEventListener("click", toggleTheme);

    const expandAllBtn = document.getElementById("expandAllBtn");
    if (expandAllBtn) expandAllBtn.addEventListener("click", toggleExpandAll);
}

// إضافة وإدارة الطلاب
function addStudent() {
    const newId = Date.now();
    const newStudent = {
        id: newId,
        name: "",
        gender: "male",
        تسميع: "",
        تقييم_تسميع: "ممتاز",
        مراجعة_قديمة: "",
        تقييم_مراجعة: "ممتاز",
        حفظ: "",
        مراجعة: "",
        ملاحظات: "",
        وسام: ""
    };
    students.unshift(newStudent);
    expandedStudentIds.add(newId);
    saveState();
    renderStudents();
    
    // توجيه المؤشر إلى حقل اسم الطالب الجديد
    setTimeout(() => {
        const firstInput = document.querySelector(`.student-card[data-id="${newId}"] input[data-field="name"]`);
        if (firstInput) firstInput.focus();
    }, 100);
}

function removeStudent(id) {
    const student = students.find(s => s.id === id);
    const studentName = student?.name || "هذا الطالب";
    if (confirm(`هل أنت متأكد من حذف بيانات ${studentName}؟`)) {
        students = students.filter(s => s.id !== id);
        expandedStudentIds.delete(id);
        saveState();
        renderStudents();
    }
}

function updateStudentField(id, field, value) {
    const student = students.find(s => s.id === id);
    if (student) {
        student[field] = value;
        saveState();
        
        // تحديث ملخص رأس البطاقة دون إعادة بناء الواجهة كاملة
        if (field === "name" || field === "gender" || field === "تقييم_تسميع") {
            updateCardHeader(id, student);
        }
    }
}

function updateCardHeader(id, student) {
    const card = document.querySelector(`.student-card[data-id="${id}"]`);
    if (!card) return;
    const nameEl = card.querySelector(".student-name-display");
    if (nameEl) nameEl.textContent = student.name.trim() || "طالب جديد";
    const genderBadge = card.querySelector(".badge-gender");
    if (genderBadge) {
        genderBadge.className = `badge badge-gender ${student.gender === "male" ? "badge-male" : "badge-female"}`;
        genderBadge.textContent = student.gender === "male" ? "ذكر" : "أنثى";
    }
}

function toggleAccordion(id) {
    if (expandedStudentIds.has(id)) {
        expandedStudentIds.delete(id);
    } else {
        expandedStudentIds.add(id);
    }
    const card = document.querySelector(`.student-card[data-id="${id}"]`);
    if (card) {
        const isOpen = expandedStudentIds.has(id);
        card.classList.toggle("open", isOpen);
        const header = card.querySelector(".card-header");
        if (header) header.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
}

function toggleExpandAll() {
    const expandBtn = document.getElementById("expandAllBtn");
    if (expandedStudentIds.size === students.length && students.length > 0) {
        expandedStudentIds.clear();
        if (expandBtn) expandBtn.textContent = "توسيع الكل";
    } else {
        students.forEach(s => expandedStudentIds.add(s.id));
        if (expandBtn) expandBtn.textContent = "طي الكل";
    }
    renderStudents();
}

function clearAll() {
    if (confirm("هل أنت متأكد من مسح جميع بيانات الطلاب والتقرير كاملاً؟ لا يمكن التراجع عن هذا الإجراء.")) {
        students = [];
        expandedStudentIds.clear();
        localStorage.removeItem("sana_data");
        renderStudents();
        renderStats();
    }
}

// عرض وإحصائيات الطلاب
function renderStats() {
    const totalCountEl = document.getElementById("totalStudentsCount");
    const maleCountEl = document.getElementById("maleStudentsCount");
    const femaleCountEl = document.getElementById("femaleStudentsCount");
    
    if (totalCountEl) totalCountEl.textContent = students.length;
    if (maleCountEl) maleCountEl.textContent = students.filter(s => s.gender === "male").length;
    if (femaleCountEl) femaleCountEl.textContent = students.filter(s => s.gender === "female").length;
}

function renderStudents() {
    const container = document.getElementById("studentsList");
    if (!container) return;

    if (students.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p style="font-size: 1.1rem; margin-bottom: 12px;">لم تتم إضافة أي طالب حتى الآن في التقرير.</p>
                <button type="button" onclick="addStudent()" class="btn btn-success" aria-label="إضافة الطالب الأول">+ إضافة الطالب الأول</button>
            </div>
        `;
        return;
    }

    container.innerHTML = "";
    students.forEach((student, index) => {
        const isOpen = expandedStudentIds.has(student.id);
        const card = document.createElement("article");
        card.className = `student-card ${isOpen ? "open" : ""}`;
        card.setAttribute("data-id", student.id);
        card.setAttribute("aria-label", `بطاقة ${student.name || `طالب ${index + 1}`}`);

        card.innerHTML = `
            <header class="card-header" onclick="toggleAccordion(${student.id})" aria-expanded="${isOpen ? "true" : "false"}" aria-controls="body-${student.id}">
                <div class="card-header-info">
                    <span class="student-index-badge">${index + 1}</span>
                    <span class="student-name-display">${escapeHtml(student.name) || "طالب جديد"}</span>
                    <span class="badge badge-gender ${student.gender === "male" ? "badge-male" : "badge-female"}">${student.gender === "male" ? "ذكر" : "أنثى"}</span>
                    <span class="badge badge-grade">${student.تقييم_تسميع || "ممتاز"}</span>
                </div>
                <span class="toggle-icon" aria-hidden="true">▼</span>
            </header>

            <div class="card-body" id="body-${student.id}">
                <div class="card-fields-grid">
                    <div class="form-group">
                        <label for="name-${student.id}">اسم الطالب:</label>
                        <input type="text" id="name-${student.id}" data-field="name" value="${escapeHtml(student.name)}" placeholder="اسم الطالب الثلاثي" oninput="updateStudentField(${student.id}, 'name', this.value)">
                    </div>

                    <div class="form-group">
                        <label for="gender-${student.id}">الجنس:</label>
                        <select id="gender-${student.id}" onchange="updateStudentField(${student.id}, 'gender', this.value)">
                            <option value="male" ${student.gender === "male" ? "selected" : ""}>ذكر</option>
                            <option value="female" ${student.gender === "female" ? "selected" : ""}>أنثى</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="tasmee-${student.id}">التسميع اليومي:</label>
                        <textarea id="tasmee-${student.id}" placeholder="السور أو الآيات التي تم تسميعها" oninput="updateStudentField(${student.id}, 'تسميع', this.value)">${escapeHtml(student.تسميع)}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="eval-tasmee-${student.id}">تقييم التسميع:</label>
                        <select id="eval-tasmee-${student.id}" onchange="updateStudentField(${student.id}, 'تقييم_تسميع', this.value)">
                            ${GRADES.map(g => `<option value="${g}" ${student.تقييم_تسميع === g ? "selected" : ""}>${g}</option>`).join("")}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="rev-old-${student.id}">المراجعة القديمة / البعيدة:</label>
                        <textarea id="rev-old-${student.id}" placeholder="محفوظات المراجعة القديمة" oninput="updateStudentField(${student.id}, 'مراجعة_قديمة', this.value)">${escapeHtml(student.مراجعة_قديمة)}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="eval-rev-${student.id}">تقييم المراجعة:</label>
                        <select id="eval-rev-${student.id}" onchange="updateStudentField(${student.id}, 'تقييم_مراجعة', this.value)">
                            ${GRADES.map(g => `<option value="${g}" ${student.تقييم_مراجعة === g ? "selected" : ""}>${g}</option>`).join("")}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="new-hifz-${student.id}">الحفظ الجديد المطلوب:</label>
                        <textarea id="new-hifz-${student.id}" placeholder="المقرر للحصة القادمة" oninput="updateStudentField(${student.id}, 'حفظ', this.value)">${escapeHtml(student.حفظ)}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="rev-${student.id}">المراجعة القريبة المطلوبة:</label>
                        <textarea id="rev-${student.id}" placeholder="المراجعة للحصة القادمة" oninput="updateStudentField(${student.id}, 'مراجعة', this.value)">${escapeHtml(student.مراجعة)}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="notes-${student.id}">ملاحظات المعلم والتوجيهات:</label>
                        <textarea id="notes-${student.id}" placeholder="توجيهات خاصة لولي الأمر أو الطالب" oninput="updateStudentField(${student.id}, 'ملاحظات', this.value)">${escapeHtml(student.ملاحظات)}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="award-${student.id}">الوسام والتحفيز:</label>
                        <select id="award-${student.id}" onchange="updateStudentField(${student.id}, 'وسام', this.value)">
                            <option value="">-- اختر وساماً تشجيعياً --</option>
                            ${AWARDS.map(a => `<option value="${escapeHtml(a)}" ${student.وسام === a ? "selected" : ""}>${a}</option>`).join("")}
                        </select>
                    </div>
                </div>

                <footer class="card-actions">
                    <button type="button" onclick="copySingle(${student.id})" class="btn btn-primary btn-sm" aria-label="نسخ تقرير الطالب ${escapeHtml(student.name)}">نسخ تقرير الطالب</button>
                    <button type="button" onclick="removeStudent(${student.id})" class="btn btn-danger btn-sm" aria-label="حذف بيانات الطالب ${escapeHtml(student.name)}">حذف الطالب</button>
                </footer>
            </div>
        `;
        container.appendChild(card);
    });
}

// تنسيق وصياغة التقارير النصية
function formatStudentText(s) {
    const isMale = s.gender === "male";
    let res = `${isMale ? "الطالب" : "الطالبة"}: ${s.name.trim() || "بدون اسم"}\n\n`;
    
    if (s.تسميع && s.تسميع.trim()) {
        res += `التسميع:\n${s.تسميع.trim()}\nالتقييم: ${s.تقييم_تسميع}\n━━━━━━━━━━━━━━━\n`;
    }
    if (s.مراجعة_قديمة && s.مراجعة_قديمة.trim()) {
        res += `المراجعة القديمة:\n${s.مراجعة_قديمة.trim()}\nالتقييم: ${s.تقييم_مراجعة}\n━━━━━━━━━━━━━━━\n`;
    }
    if (s.حفظ && s.حفظ.trim()) {
        res += `الحفظ الجديد:\n${s.حفظ.trim()}\n━━━━━━━━━━━━━━━\n`;
    }
    if (s.مراجعة && s.مراجعة.trim()) {
        res += `المراجعة:\n${s.مراجعة.trim()}\n━━━━━━━━━━━━━━━\n`;
    }
    if (s.ملاحظات && s.ملاحظات.trim()) {
        const adjustedNotes = s.ملاحظات.trim()
            .replace(/يسمع/g, isMale ? "يسمع" : "تسمع")
            .replace(/يستمر/g, isMale ? "يستمر" : "تستمر");
        res += `ملاحظات:\n${adjustedNotes}\n━━━━━━━━━━━━━━━\n`;
    }
    if (s.وسام && s.وسام.trim()) {
        res += `الوسام:\n${s.وسام.trim()}\n`;
    }
    return res.replace(/\n━━━━━━━━━━━━━━━\n$/, "");
}

function copyAll() {
    if (students.length === 0) {
        alert("لا يوجد طلاب مسجلون في التقرير لنسخ بياناتهم.");
        return;
    }

    const dateVal = document.getElementById("reportDate")?.value || "";
    const halaTypeVal = document.getElementById("halaType")?.value || "";
    const halaNumVal = document.getElementById("halaNum")?.value || "";
    const halaDurationVal = document.getElementById("halaDuration")?.value || "";
    const teacherNameVal = document.getElementById("teacherName")?.value || "";

    let report = `${BASMALA}\n${REPORT_HEADER}\n`;
    report += `التاريخ: ${dateVal}\n`;
    report += `الفترة: ${halaTypeVal}\n`;
    if (halaNumVal) report += `رقم الحلقة: ${halaNumVal}\n`;
    if (halaDurationVal) report += `المدة: ${halaDurationVal}\n`;
    if (teacherNameVal) report += `المعلم: ${teacherNameVal}\n`;
    report += `عدد الطلاب: ${students.length}\n━━━━━━━━━━━━━━━\n`;

    // ترتيب عكسي لمطابقة أسلوب النشر في الحلقات
    [...students].reverse().forEach(s => {
        report += formatStudentText(s) + "\n\n━━━━━━━━━━━━━━━\n";
    });

    report += `\n*نسأل الله لهم التوفيق والسداد.*`;

    writeToClipboard(report, "تم نسخ التقرير الكلي بنجاح إلى الحافظة.");
}

function copySingle(id) {
    const s = students.find(x => x.id === id);
    if (!s) return;

    const dateVal = document.getElementById("reportDate")?.value || "";
    const teacherNameVal = document.getElementById("teacherName")?.value || "";

    let report = `${BASMALA}\n${REPORT_HEADER}\n`;
    if (dateVal) report += `التاريخ: ${dateVal}\n`;
    if (teacherNameVal) report += `المعلم: ${teacherNameVal}\n`;
    report += `━━━━━━━━━━━━━━━\n` + formatStudentText(s) + `\n\n*نسأل الله ${s.gender === "male" ? "له" : "لها"} التوفيق والسداد.*`;

    writeToClipboard(report, `تم نسخ تقرير ${s.name || "الطالب"} بنجاح.`);
}

function writeToClipboard(text, successMessage) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            alert(successMessage);
        }).catch(err => {
            console.warn("فشل النسخ التلقائي:", err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand("copy");
        alert("تم النسخ بنجاح.");
    } catch (e) {
        prompt("انسخ النص من الصندوق الآتي:", text);
    } finally {
        document.body.removeChild(textarea);
    }
}

// تصدير PDF كتقرير رسمي منسق ونظيف
function exportPDF() {
    if (students.length === 0) {
        alert("لا يوجد طلاب مسجلون في التقرير لتصدير ملف PDF.");
        return;
    }

    const dateVal = document.getElementById("reportDate")?.value || "";
    const halaTypeVal = document.getElementById("halaType")?.value || "";
    const halaNumVal = document.getElementById("halaNum")?.value || "";
    const halaDurationVal = document.getElementById("halaDuration")?.value || "";
    const teacherNameVal = document.getElementById("teacherName")?.value || "";

    // إنشاء حاوية التقرير الطباعي النظيف
    const printContainer = document.createElement("div");
    printContainer.id = "cleanPrintArea";
    printContainer.style.padding = "20px";
    printContainer.style.fontFamily = "system-ui, -apple-system, sans-serif";
    printContainer.style.direction = "rtl";
    printContainer.style.color = "#111827";
    printContainer.style.backgroundColor = "#ffffff";

    let html = `
        <div style="text-align: center; border-bottom: 2px solid #006655; padding-bottom: 12px; margin-bottom: 16px;">
            <h3 style="margin: 0 0 6px 0; color: #006655;">${BASMALA}</h3>
            <h2 style="margin: 0; color: #1f2937;">تقرير أكاديمية سنا لتعليم القرآن الكريم</h2>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f9fafb; font-size: 14px;">
            <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>التاريخ:</strong> ${escapeHtml(dateVal)}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>الفترة:</strong> ${escapeHtml(halaTypeVal)}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>رقم الحلقة:</strong> ${escapeHtml(halaNumVal || "-")}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>المعلم:</strong> ${escapeHtml(teacherNameVal || "-")}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>المدة:</strong> ${escapeHtml(halaDurationVal || "-")}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>عدد الطلاب:</strong> ${students.length}</td>
            </tr>
        </table>
    `;

    students.forEach((s, idx) => {
        const isMale = s.gender === "male";
        html += `
            <div style="border: 1px solid #006655; border-radius: 6px; padding: 12px; margin-bottom: 12px; page-break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 8px;">
                    <span style="font-size: 15px; font-weight: bold; color: #006655;">${idx + 1}. ${isMale ? "الطالب" : "الطالبة"}: ${escapeHtml(s.name) || "بدون اسم"}</span>
                    <span style="background: #e6f2ef; padding: 2px 8px; border-radius: 4px; font-size: 13px; font-weight: bold;">التقييم: ${s.تقييم_تسميع}</span>
                </div>
                <div style="font-size: 13px; line-height: 1.6;">
                    ${s.تسميع ? `<div><strong>التسميع:</strong> ${escapeHtml(s.تسميع)}</div>` : ""}
                    ${s.مراجعة_قديمة ? `<div><strong>المراجعة القديمة:</strong> ${escapeHtml(s.مراجعة_قديمة)} (تقييم: ${s.تقييم_مراجعة})</div>` : ""}
                    ${s.حفظ ? `<div><strong>الحفظ الجديد:</strong> ${escapeHtml(s.حفظ)}</div>` : ""}
                    ${s.مراجعة ? `<div><strong>المراجعة:</strong> ${escapeHtml(s.مراجعة)}</div>` : ""}
                    ${s.ملاحظات ? `<div><strong>ملاحظات:</strong> ${escapeHtml(s.ملاحظات)}</div>` : ""}
                    ${s.وسام ? `<div style="color: #d97706; font-weight: bold; margin-top: 4px;"><strong>الوسام:</strong> ${escapeHtml(s.وسام)}</div>` : ""}
                </div>
            </div>
        `;
    });

    html += `
        <div style="text-align: center; margin-top: 20px; font-size: 13px; color: #6b7280;">
            نسأل الله للطلاب التوفيق والسداد • أكاديمية سنا لتعليم القرآن الكريم
        </div>
    `;

    printContainer.innerHTML = html;
    document.body.appendChild(printContainer);

    const filename = `تقرير_سنا_${dateVal.replace(/[/\\?%*:|"<> ]/g, "_") || "يومي"}.pdf`;

    if (typeof html2pdf !== "undefined") {
        const opt = {
            margin: [10, 10, 10, 10],
            filename: filename,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        };

        html2pdf().set(opt).from(printContainer).save().then(() => {
            document.body.removeChild(printContainer);
        }).catch(err => {
            console.error("خطأ أثناء تصدير PDF:", err);
            document.body.removeChild(printContainer);
            window.print();
        });
    } else {
        document.body.removeChild(printContainer);
        window.print();
    }
}

// دالة مساعدة لتطهير مدخلات HTML ومنع الثغرات
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
