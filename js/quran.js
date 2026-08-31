/**
 * منتقي المصحف الشريف المحلي دون اتصال (Offline Quran Picker)
 */
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
        if (btn) {
            btn.classList.toggle('active', t === tab);
            btn.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        }
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
