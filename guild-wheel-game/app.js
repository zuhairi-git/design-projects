/* app.js - Printable Game Wheel Customizer Engine */

// ==========================================
// 1. TRANSLATIONS
// ==========================================
const TRANSLATIONS = {
    en: {
        subtitle: "Design and print game boards",
        section_presets: "Color Themes",
        section_center: "Center Box (Start Point)",
        center_line1: "Line 1",
        center_line2: "Line 2",
        center_bg: "Background Color",
        center_text_color: "Text Color",
        section_segments: "Segment Editor",
        segments_hint: "Edit segment names and colors. You can remove and add segments:",
        add_segment: "Add Segment",
        new_segment_label: "NEW SEGMENT",
        segment_placeholder: "Segment",
        delete_segment_title: "Delete segment",
        min_segments_alert: "The wheel must have at least 3 segments!",
        menu_export_settings: "Export & Settings",
        export_title: "Export",
        export_png: "Download PNG",
        export_pdf: "Print / Save PDF",
        display_title: "Display",
        ink_saver: "White background (Ink Saver)",
        language_title: "Language",
    },
    fi: {
        subtitle: "Suunnittele ja tulosta pelilaudat",
        section_presets: "Väriteemat",
        section_center: "Keskilaatikko (Aloituspiste)",
        center_line1: "Rivi 1",
        center_line2: "Rivi 2",
        center_bg: "Taustaväri",
        center_text_color: "Tekstin väri",
        section_segments: "Lohkojen muokkaus",
        segments_hint: "Muokkaa lohkojen nimiä ja värejä. Voit poistaa lohkoja ja lisätä uusia:",
        add_segment: "Lisää lohko",
        new_segment_label: "UUSI LOHKO",
        segment_placeholder: "Lohko",
        delete_segment_title: "Poista lohko",
        min_segments_alert: "Pyörässä täytyy olla vähintään 3 lohkoa!",
        menu_export_settings: "Vienti & Asetukset",
        export_title: "Vienti",
        export_png: "Lataa PNG kuva",
        export_pdf: "Tulosta / Tallenna PDF",
        display_title: "Näyttö",
        ink_saver: "Valkoinen tausta (Säästä väriainetta)",
        language_title: "Kieli",
    }
};

let currentLang = 'en';

// ==========================================
// 2. STATE MANAGEMENT
// ==========================================
const DEFAULT_PRESETS = {
    metropolia: {
        inkSaver: false,
        center: { text1: "ALOITA", text2: "TÄSTÄ", bg: "#2bc4c3", text: "#000000" },
        segments: [
            { label: "Spacer", bg: "#1d4ed8" },
            { label: "MYRO RY", bg: "#2bc4c3" },
            { label: "Spacer", bg: "#1d4ed8" },
            { label: "TXO RY", bg: "#2bc4c3" },
            { label: "Spacer", bg: "#1d4ed8" },
            { label: "Spacer", bg: "#2bc4c3" },
            { label: "Spacer", bg: "#1d4ed8" },
            { label: "Spacer", bg: "#2bc4c3" },
            { label: "Spacer", bg: "#1d4ed8" },
            { label: "MysteRy", bg: "#2bc4c3" },
            { label: "Spacer", bg: "#1d4ed8" },
            { label: "TROMBI RY", bg: "#2bc4c3" }
        ]
    },
    neon: {
        inkSaver: false,
        center: { text1: "START", text2: "HERE", bg: "#f43f5e", text: "#ffffff" },
        segments: [
            { label: "ZONE 1", bg: "#1e1b4b" },
            { label: "CYBER RY", bg: "#a855f7" },
            { label: "ZONE 2", bg: "#312e81" },
            { label: "HACKER RY", bg: "#a855f7" },
            { label: "ZONE 3", bg: "#1e1b4b" },
            { label: "BONUS", bg: "#f43f5e" },
            { label: "ZONE 4", bg: "#312e81" },
            { label: "DECRYPT RY", bg: "#a855f7" },
            { label: "ZONE 5", bg: "#1e1b4b" },
            { label: "MATRIX RY", bg: "#a855f7" },
            { label: "ZONE 6", bg: "#312e81" },
            { label: "VOXEL RY", bg: "#a855f7" }
        ]
    }
};

const STATE = {
    inkSaver: false,
    center: { text1: "ALOITA", text2: "TÄSTÄ", bg: "#2bc4c3", text: "#000000" },
    segments: []
};

resetToPreset('metropolia');

function resetToPreset(presetKey) {
    const data = DEFAULT_PRESETS[presetKey];
    STATE.inkSaver = data.inkSaver;
    STATE.center = JSON.parse(JSON.stringify(data.center));
    STATE.segments = JSON.parse(JSON.stringify(data.segments));

    document.getElementById('center-text-1').value = STATE.center.text1;
    document.getElementById('center-text-2').value = STATE.center.text2;
    document.getElementById('center-bg-color').value = STATE.center.bg;
    document.getElementById('center-text-color').value = STATE.center.text;
    document.getElementById('toggle-ink-saver').checked = STATE.inkSaver;

    updateUIColors();
}

function updateUIColors() {
    document.querySelector('label[for="center-bg-color"] + .color-picker-wrapper .color-val').textContent = STATE.center.bg;
    document.querySelector('label[for="center-text-color"] + .color-picker-wrapper .color-val').textContent = STATE.center.text;

    const previewSheet = document.getElementById('print-sheet-element');
    if (STATE.inkSaver) {
        previewSheet.classList.add('ink-saver');
    } else {
        previewSheet.classList.remove('ink-saver');
    }
}

// ==========================================
// 3. TRANSLATIONS APPLY
// ==========================================
function applyTranslations() {
    const t = TRANSLATIONS[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.textContent = t[key];
    });
    document.documentElement.lang = currentLang;
    document.querySelectorAll('.btn-lang').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
    renderSegmentEditor();
}

// ==========================================
// 4. DYNAMIC INPUT CONTROLS RENDERER
// ==========================================
function renderSegmentEditor() {
    const t = TRANSLATIONS[currentLang];
    const container = document.getElementById('segments-editor-container');
    container.innerHTML = '';

    STATE.segments.forEach((seg, idx) => {
        const row = document.createElement('div');
        row.className = 'segment-row';
        row.dataset.index = idx;

        const num = document.createElement('span');
        num.className = 'seg-num';
        num.textContent = idx + 1;
        row.appendChild(num);

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'seg-input';
        input.value = seg.label;
        input.placeholder = `${t.segment_placeholder} ${idx + 1}`;
        input.oninput = (e) => {
            STATE.segments[idx].label = e.target.value;
            drawWheel();
        };
        row.appendChild(input);

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'seg-color';
        colorInput.value = seg.bg;
        colorInput.oninput = (e) => {
            STATE.segments[idx].bg = e.target.value;
            drawWheel();
        };
        row.appendChild(colorInput);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete-seg';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.title = t.delete_segment_title;
        deleteBtn.onclick = () => {
            if (STATE.segments.length <= 3) {
                alert(t.min_segments_alert);
                return;
            }
            STATE.segments.splice(idx, 1);
            renderSegmentEditor();
            drawWheel();
        };
        row.appendChild(deleteBtn);

        container.appendChild(row);
    });
}

// ==========================================
// 5. SVG VECTOR WHEEL DRAWING ENGINE
// ==========================================
function drawWheel() {
    const svg = document.getElementById('canvas-wheel-svg');
    svg.innerHTML = '';

    const cx = 300, cy = 300, r = 280, rInner = 215;
    const numSectors = STATE.segments.length;
    const sectorAngle = 360 / numSectors;
    const largeArc = sectorAngle > 180 ? 1 : 0;
    const strokeColor = STATE.inkSaver ? '#000000' : '#090d16';

    const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bgCircle.setAttribute("cx", cx);
    bgCircle.setAttribute("cy", cy);
    bgCircle.setAttribute("r", r);
    bgCircle.setAttribute("fill", STATE.inkSaver ? '#ffffff' : '#f8fafc');
    bgCircle.setAttribute("stroke", strokeColor);
    bgCircle.setAttribute("stroke-width", "5");
    svg.appendChild(bgCircle);

    STATE.segments.forEach((seg, idx) => {
        const startDeg = idx * sectorAngle - 90;
        const endDeg = startDeg + sectorAngle;
        const rad1 = (startDeg * Math.PI) / 180;
        const rad2 = (endDeg * Math.PI) / 180;
        const x1 = cx + r * Math.cos(rad1), y1 = cy + r * Math.sin(rad1);
        const x2 = cx + r * Math.cos(rad2), y2 = cy + r * Math.sin(rad2);
        const x1i = cx + rInner * Math.cos(rad1), y1i = cy + rInner * Math.sin(rad1);
        const x2i = cx + rInner * Math.cos(rad2), y2i = cy + rInner * Math.sin(rad2);

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x2i} ${y2i} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x1i} ${y1i} Z`);
        path.setAttribute("fill", STATE.inkSaver ? '#ffffff' : seg.bg);
        path.setAttribute("stroke", strokeColor);
        path.setAttribute("stroke-width", "3");
        svg.appendChild(path);

        const labelText = seg.label.trim();
        if (labelText && !(STATE.inkSaver && labelText.toLowerCase() === 'spacer')) {
            const textAngle = startDeg + sectorAngle / 2;
            const textRad = (textAngle * Math.PI) / 180;
            const textR = (r + rInner) / 2;
            const tx = cx + textR * Math.cos(textRad);
            const ty = cy + textR * Math.sin(textRad);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", tx);
            text.setAttribute("y", ty);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("fill", "#000000");
            text.setAttribute("font-family", "'Outfit', sans-serif");
            text.setAttribute("font-weight", "800");
            text.setAttribute("font-size", "13");

            let rotation = textAngle + 90;
            if (rotation > 90 && rotation < 270) rotation += 180;
            text.setAttribute("transform", `rotate(${rotation}, ${tx}, ${ty})`);
            text.textContent = labelText.toUpperCase();
            svg.appendChild(text);
        }
    });

    const innerGuide = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    innerGuide.setAttribute("cx", cx);
    innerGuide.setAttribute("cy", cy);
    innerGuide.setAttribute("r", rInner);
    innerGuide.setAttribute("fill", "none");
    innerGuide.setAttribute("stroke", strokeColor);
    innerGuide.setAttribute("stroke-width", "4");
    svg.appendChild(innerGuide);

    const centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    centerCircle.setAttribute("cx", cx);
    centerCircle.setAttribute("cy", cy);
    centerCircle.setAttribute("r", rInner - 4);
    centerCircle.setAttribute("fill", STATE.inkSaver ? '#ffffff' : '#1a5fb4');
    centerCircle.setAttribute("stroke", "none");
    svg.appendChild(centerCircle);

    const cardW = 230, cardH = 120;
    const startCard = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    startCard.setAttribute("x", cx - cardW / 2);
    startCard.setAttribute("y", cy - cardH / 2);
    startCard.setAttribute("width", cardW);
    startCard.setAttribute("height", cardH);
    startCard.setAttribute("rx", "22");
    startCard.setAttribute("ry", "22");
    startCard.setAttribute("fill", STATE.inkSaver ? '#ffffff' : STATE.center.bg);
    startCard.setAttribute("stroke", strokeColor);
    startCard.setAttribute("stroke-width", "5");
    svg.appendChild(startCard);

    const text1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text1.setAttribute("x", cx);
    text1.setAttribute("y", cy - 14);
    text1.setAttribute("text-anchor", "middle");
    text1.setAttribute("dominant-baseline", "middle");
    text1.setAttribute("fill", STATE.inkSaver ? '#000000' : STATE.center.text);
    text1.setAttribute("font-family", "'Outfit', sans-serif");
    text1.setAttribute("font-weight", "800");
    text1.setAttribute("font-size", "34");
    text1.setAttribute("letter-spacing", "2");
    text1.textContent = STATE.center.text1.toUpperCase();
    svg.appendChild(text1);

    const text2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text2.setAttribute("x", cx);
    text2.setAttribute("y", cy + 26);
    text2.setAttribute("text-anchor", "middle");
    text2.setAttribute("dominant-baseline", "middle");
    text2.setAttribute("fill", STATE.inkSaver ? '#000000' : STATE.center.text);
    text2.setAttribute("font-family", "'Outfit', sans-serif");
    text2.setAttribute("font-weight", "800");
    text2.setAttribute("font-size", "36");
    text2.setAttribute("letter-spacing", "1");
    text2.textContent = STATE.center.text2.toUpperCase();
    svg.appendChild(text2);
}

// ==========================================
// 6. IMAGE HIGH-RES EXPORT MODULE (PNG)
// ==========================================
function exportToPNG() {
    const svgElement = document.getElementById('canvas-wheel-svg');
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);

    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = 2400;
        canvas.height = 2400;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 2400, 2400);

        const pngURL = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngURL;
        downloadLink.download = `wheel_${STATE.center.text1.toLowerCase()}_${STATE.center.text2.toLowerCase()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobURL);
    };

    img.src = blobURL;
}

// ==========================================
// 7. BIND UI INTERACTIONS
// ==========================================
function bindControls() {
    // Preset buttons
    document.getElementById('preset-metropolia').onclick = (e) => {
        setActivePresetButton(e.currentTarget);
        resetToPreset('metropolia');
        renderSegmentEditor();
        drawWheel();
    };

    document.getElementById('preset-neon').onclick = (e) => {
        setActivePresetButton(e.currentTarget);
        resetToPreset('neon');
        renderSegmentEditor();
        drawWheel();
    };

    function setActivePresetButton(btn) {
        document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    // Center card inputs
    document.getElementById('center-text-1').oninput = (e) => {
        STATE.center.text1 = e.target.value;
        drawWheel();
    };
    document.getElementById('center-text-2').oninput = (e) => {
        STATE.center.text2 = e.target.value;
        drawWheel();
    };
    document.getElementById('center-bg-color').oninput = (e) => {
        STATE.center.bg = e.target.value;
        updateUIColors();
        drawWheel();
    };
    document.getElementById('center-text-color').oninput = (e) => {
        STATE.center.text = e.target.value;
        updateUIColors();
        drawWheel();
    };

    // Ink saver toggle
    document.getElementById('toggle-ink-saver').onchange = (e) => {
        STATE.inkSaver = e.target.checked;
        updateUIColors();
        drawWheel();
    };

    // Add segment
    document.getElementById('btn-add-segment').onclick = () => {
        let newColor = "#1d4ed8";
        if (STATE.segments.length > 0) {
            const lastColor = STATE.segments[STATE.segments.length - 1].bg;
            newColor = (lastColor === "#2bc4c3") ? "#1d4ed8" : "#2bc4c3";
        }
        STATE.segments.push({ label: TRANSLATIONS[currentLang].new_segment_label, bg: newColor });
        renderSegmentEditor();
        drawWheel();
    };

    // Export buttons
    document.getElementById('btn-export-png').onclick = () => exportToPNG();
    document.getElementById('btn-print-pdf').onclick = () => window.print();

    // Dropdown toggle
    const dropdownTrigger = document.getElementById('btn-settings-dropdown');
    const dropdownPanel = document.getElementById('settings-dropdown-panel');
    const dropdownChevron = document.getElementById('dropdown-chevron');

    dropdownTrigger.onclick = () => {
        const isOpen = dropdownPanel.classList.toggle('open');
        dropdownChevron.classList.toggle('rotated', isOpen);
    };

    // Prevent clicks inside the wrapper from closing the dropdown
    document.getElementById('export-settings-wrapper').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        dropdownPanel.classList.remove('open');
        dropdownChevron.classList.remove('rotated');
    });

    // Language buttons
    document.querySelectorAll('.btn-lang').forEach(btn => {
        btn.onclick = () => {
            currentLang = btn.dataset.lang;
            applyTranslations();
        };
    });
}

// ==========================================
// 8. INITIALIZATION
// ==========================================
window.onload = () => {
    bindControls();
    renderSegmentEditor();
    drawWheel();
    applyTranslations();
};
