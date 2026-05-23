/* app.js - Printable Game Wheel Customizer Engine */

// ==========================================
// 1. STATE MANAGEMENT
// ==========================================
const DEFAULT_PRESETS = {
    metropolia: {
        inkSaver: false,
        center: {
            text1: "ALOITA",
            text2: "TÄSTÄ",
            bg: "#2bc4c3",
            text: "#000000"
        },
        segments: [
            { label: "Spacer", bg: "#1d4ed8" }, // 12 o'clock top spacer
            { label: "MYRO RY", bg: "#2bc4c3" }, // 1-2 o'clock
            { label: "Spacer", bg: "#1d4ed8" },
            { label: "TXO RY", bg: "#2bc4c3" },
            { label: "Spacer", bg: "#1d4ed8" },
            { label: "Spacer", bg: "#2bc4c3" }, // bottom-right spacer
            { label: "Spacer", bg: "#1d4ed8" },
            { label: "Spacer", bg: "#2bc4c3" }, // bottom-left spacer
            { label: "Spacer", bg: "#1d4ed8" },
            { label: "MysteRy", bg: "#2bc4c3" },
            { label: "Spacer", bg: "#1d4ed8" },
            { label: "TROMBI RY", bg: "#2bc4c3" }
        ]
    },
    neon: {
        inkSaver: false,
        center: {
            text1: "START",
            text2: "HERE",
            bg: "#f43f5e",
            text: "#ffffff"
        },
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
    },
    outline: {
        inkSaver: true,
        center: {
            text1: "ALOITA",
            text2: "TÄSTÄ",
            bg: "#ffffff",
            text: "#000000"
        },
        segments: [
            { label: "Spacer", bg: "#ffffff" },
            { label: "MYRO RY", bg: "#ffffff" },
            { label: "Spacer", bg: "#ffffff" },
            { label: "TXO RY", bg: "#ffffff" },
            { label: "Spacer", bg: "#ffffff" },
            { label: "Spacer", bg: "#ffffff" },
            { label: "Spacer", bg: "#ffffff" },
            { label: "Spacer", bg: "#ffffff" },
            { label: "Spacer", bg: "#ffffff" },
            { label: "MysteRy", bg: "#ffffff" },
            { label: "Spacer", bg: "#ffffff" },
            { label: "TROMBI RY", bg: "#ffffff" }
        ]
    }
};

const STATE = {
    inkSaver: false,
    center: {
        text1: "ALOITA",
        text2: "TÄSTÄ",
        bg: "#2bc4c3",
        text: "#000000"
    },
    segments: []
};

// Initialize with Metropolia Classic
resetToPreset('metropolia');

function resetToPreset(presetKey) {
    const data = DEFAULT_PRESETS[presetKey];
    STATE.inkSaver = data.inkSaver;
    STATE.center = JSON.parse(JSON.stringify(data.center));
    STATE.segments = JSON.parse(JSON.stringify(data.segments));
    
    // Sync to UI controls
    document.getElementById('center-text-1').value = STATE.center.text1;
    document.getElementById('center-text-2').value = STATE.center.text2;
    document.getElementById('center-bg-color').value = STATE.center.bg;
    document.getElementById('center-text-color').value = STATE.center.text;
    document.getElementById('toggle-ink-saver').checked = STATE.inkSaver;

    updateUIColors();
}


function updateUIColors() {
    // Update color span readouts
    document.querySelector('label[for="center-bg-color"] + .color-picker-wrapper .color-val').textContent = STATE.center.bg;
    document.querySelector('label[for="center-text-color"] + .color-picker-wrapper .color-val').textContent = STATE.center.text;

    // Toggle stylesheet class for background page preview
    const previewSheet = document.getElementById('print-sheet-element');
    if (STATE.inkSaver) {
        previewSheet.classList.add('ink-saver');
    } else {
        previewSheet.classList.remove('ink-saver');
    }
}

// ==========================================
// 2. DYNAMIC INPUT CONTROLS RENDERER
// ==========================================
function renderSegmentEditor() {
    const container = document.getElementById('segments-editor-container');
    container.innerHTML = ''; // Clear

    STATE.segments.forEach((seg, idx) => {
        const row = document.createElement('div');
        row.className = 'segment-row';
        row.dataset.index = idx;

        // Number marker
        const num = document.createElement('span');
        num.className = 'seg-num';
        num.textContent = idx + 1;
        row.appendChild(num);

        // Label input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'seg-input';
        input.value = seg.label;
        input.placeholder = `Lohko ${idx + 1}`;
        input.oninput = (e) => {
            STATE.segments[idx].label = e.target.value;
            drawWheel();
        };
        row.appendChild(input);

        // Color input
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'seg-color';
        colorInput.value = seg.bg;
        colorInput.oninput = (e) => {
            STATE.segments[idx].bg = e.target.value;
            drawWheel();
        };
        row.appendChild(colorInput);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete-seg';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.title = "Poista lohko / Delete segment";
        deleteBtn.onclick = () => {
            if (STATE.segments.length <= 3) {
                alert("Pyörässä täytyy olla vähintään 3 lohkoa! / The wheel must have at least 3 segments!");
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
// 3. SVG VECTOR WHEEL DRAWING ENGINE
// ==========================================
function drawWheel() {
    const svg = document.getElementById('canvas-wheel-svg');
    svg.innerHTML = ''; // Clear SVG elements

    const cx = 300;
    const cy = 300;
    const r = 280;

    const numSectors = STATE.segments.length;
    const sectorAngle = 360 / numSectors;

    // General strokes colors
    const strokeColor = STATE.inkSaver ? '#000000' : '#090d16';

    // 1. Wheel back plate shadow or solid base
    const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bgCircle.setAttribute("cx", cx);
    bgCircle.setAttribute("cy", cy);
    bgCircle.setAttribute("r", r);
    bgCircle.setAttribute("fill", STATE.inkSaver ? '#ffffff' : '#f8fafc');
    bgCircle.setAttribute("stroke", strokeColor);
    bgCircle.setAttribute("stroke-width", "5");
    svg.appendChild(bgCircle);

    // 2. Draw Wheel slices
    STATE.segments.forEach((seg, idx) => {
        const startDeg = idx * sectorAngle - 90; // Top offset start
        const endDeg = startDeg + sectorAngle;

        const rad1 = (startDeg * Math.PI) / 180;
        const rad2 = (endDeg * Math.PI) / 180;

        const x1 = cx + r * Math.cos(rad1);
        const y1 = cy + r * Math.sin(rad1);
        const x2 = cx + r * Math.cos(rad2);
        const y2 = cy + r * Math.sin(rad2);

        // Path slice arc
        const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        
        // Fill rules matching presets/ink-saver toggles
        const fill = STATE.inkSaver ? '#ffffff' : seg.bg;
        path.setAttribute("fill", fill);
        path.setAttribute("stroke", strokeColor);
        path.setAttribute("stroke-width", "3");
        svg.appendChild(path);

        // 3. Labels inside slices (radial rotation placement)
        const labelText = seg.label.trim();
        // Skip labels that are generic "Spacer" in outline/ink-saver mode if they want it cleaner
        if (labelText && !(STATE.inkSaver && labelText.toLowerCase() === 'spacer')) {
            const textAngle = startDeg + sectorAngle / 2;
            const textRad = (textAngle * Math.PI) / 180;
            const textR = r - 65; // Distance from outer rim to center of label

            const tx = cx + textR * Math.cos(textRad);
            const ty = cy + textR * Math.sin(textRad);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", tx);
            text.setAttribute("y", ty);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("fill", "#000000"); // Standard high contrast print label
            text.setAttribute("font-family", "'Outfit', sans-serif");
            text.setAttribute("font-weight", "800");
            text.setAttribute("font-size", "15");
            
            // Auto calculate orientation rotation to keep text readable
            let rotation = textAngle + 90;
            if (rotation > 90 && rotation < 270) {
                rotation += 180;
            }
            text.setAttribute("transform", `rotate(${rotation}, ${tx}, ${ty})`);
            text.textContent = labelText.toUpperCase();

            svg.appendChild(text);
        }
    });

    // 4. Concentric circular outlines matching image
    const innerGuide = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    innerGuide.setAttribute("cx", cx);
    innerGuide.setAttribute("cy", cy);
    innerGuide.setAttribute("r", "195");
    innerGuide.setAttribute("fill", "none");
    innerGuide.setAttribute("stroke", strokeColor);
    innerGuide.setAttribute("stroke-width", "4");
    svg.appendChild(innerGuide);

    // Inner center circle (solid backing for the starting block)
    const centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    centerCircle.setAttribute("cx", cx);
    centerCircle.setAttribute("cy", cy);
    centerCircle.setAttribute("r", "190");
    centerCircle.setAttribute("fill", STATE.inkSaver ? '#ffffff' : '#1a5fb4'); // Dark royal blue background matches original sketch
    centerCircle.setAttribute("stroke", strokeColor);
    centerCircle.setAttribute("stroke-width", "4");
    svg.appendChild(centerCircle);

    // 5. STATIC "ALOITA TÄSTÄ" STARTING BLOCK CARD
    // Positioned exactly overlaying the center of the wheel as a distinct rounded card
    const cardW = 230;
    const cardH = 120;
    const cardX = cx - cardW / 2;
    const cardY = cy - cardH / 2;

    const startCard = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    startCard.setAttribute("x", cardX);
    startCard.setAttribute("y", cardY);
    startCard.setAttribute("width", cardW);
    startCard.setAttribute("height", cardH);
    startCard.setAttribute("rx", "22");
    startCard.setAttribute("ry", "22");
    startCard.setAttribute("fill", STATE.inkSaver ? '#ffffff' : STATE.center.bg);
    startCard.setAttribute("stroke", strokeColor);
    startCard.setAttribute("stroke-width", "5");
    svg.appendChild(startCard);

    // Center Card Line 1
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

    // Center Card Line 2
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
// 4. IMAGE HIGH-RES EXPORT MODULE (PNG)
// ==========================================
function exportToPNG() {
    const svgElement = document.getElementById('canvas-wheel-svg');
    
    // 1. Serialize SVG elements to XML
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);
    
    // Add namespace if missing
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    // 2. Create Image object and encode SVG as data URI
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    img.onload = function() {
        // 3. Create high-resolution output canvas (2400x2400 for 300 DPI layout prints)
        const canvas = document.createElement('canvas');
        canvas.width = 2400;
        canvas.height = 2400;
        const ctx = canvas.getContext('2d');
        
        // Fill canvas background if NOT in inkSaver mode or if we want transparent PNG
        // We will default to a clean transparent board background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image
        ctx.drawImage(img, 0, 0, 2400, 2400);
        
        // 4. Create trigger link download
        const pngURL = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngURL;
        downloadLink.download = `peli_onnenpyora_${STATE.center.text1.toLowerCase()}_${STATE.center.text2.toLowerCase()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up memory
        URL.revokeObjectURL(blobURL);
    };
    
    img.src = blobURL;
}

// ==========================================
// 5. BIND UI INTERACTIONS
// ==========================================
function bindControls() {
    // Presets
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

    document.getElementById('preset-outline').onclick = (e) => {
        setActivePresetButton(e.currentTarget);
        resetToPreset('outline');
        renderSegmentEditor();
        drawWheel();
    };

    function setActivePresetButton(btn) {
        document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    // Center edit inputs
    const centerT1 = document.getElementById('center-text-1');
    centerT1.oninput = (e) => {
        STATE.center.text1 = e.target.value;
        drawWheel();
    };

    const centerT2 = document.getElementById('center-text-2');
    centerT2.oninput = (e) => {
        STATE.center.text2 = e.target.value;
        drawWheel();
    };

    const centerBg = document.getElementById('center-bg-color');
    centerBg.oninput = (e) => {
        STATE.center.bg = e.target.value;
        updateUIColors();
        drawWheel();
    };

    const centerTxtColor = document.getElementById('center-text-color');
    centerTxtColor.oninput = (e) => {
        STATE.center.text = e.target.value;
        updateUIColors();
        drawWheel();
    };

    // Ink saver toggle
    const toggleInk = document.getElementById('toggle-ink-saver');
    toggleInk.onchange = (e) => {
        STATE.inkSaver = e.target.checked;
        updateUIColors();
        drawWheel();
    };

    // Action buttons
    document.getElementById('btn-add-segment').onclick = () => {
        // Toggle new color based on alternating sequence
        let newColor = "#1d4ed8";
        if (STATE.segments.length > 0) {
            const lastColor = STATE.segments[STATE.segments.length - 1].bg;
            newColor = (lastColor === "#2bc4c3") ? "#1d4ed8" : "#2bc4c3";
        }
        STATE.segments.push({
            label: "UUSI LOHKO",
            bg: newColor
        });
        renderSegmentEditor();
        drawWheel();
    };

    document.getElementById('btn-export-png').onclick = () => exportToPNG();
    document.getElementById('btn-print-pdf').onclick = () => window.print();
}


// ==========================================
// 6. INITIALIZATION
// ==========================================
window.onload = () => {
    bindControls();
    renderSegmentEditor();
    drawWheel();
};
