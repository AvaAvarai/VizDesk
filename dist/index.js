"use strict";
document.addEventListener("DOMContentLoaded", () => {
    // Existing elements
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const about = document.getElementById('about');
    const seeCode = document.getElementById('see-code');
    const loadCsv = document.getElementById('load-csv');
    const openTableView = document.getElementById('open-table-view');
    const fileInput = document.getElementById('file-input');
    const statsPanel = document.getElementById('stats-panel');
    const tableView = document.getElementById('table-view');
    const tableWindow = document.getElementById('table-window');
    const closeBtn = document.getElementById('close-btn');
    // Parallel coordinates elements
    const openParallelView = document.getElementById('open-parallel-view');
    const parallelWindow = document.getElementById('parallel-window');
    const parallelView = document.getElementById('parallel-view');
    const parallelCloseBtn = document.getElementById('parallel-close-btn');
    // Toggle start menu
    startButton.addEventListener('click', () => {
        startMenu.classList.toggle('hidden');
    });
    about.addEventListener('click', () => {
        alert('What if there was a locally 🏠 sessioned computer desktop 🖥️ metaphor for data science 📈 and visualization tools 🛠️?');
        startMenu.classList.add('hidden');
    });
    seeCode.addEventListener('click', () => {
        window.open('https://github.com/AvaAvarai/VizDesk', '_blank');
        startMenu.classList.add('hidden');
    });
    loadCsv.addEventListener('click', () => {
        fileInput.click();
        startMenu.classList.add('hidden');
    });
    openTableView.addEventListener('click', () => {
        tableWindow.classList.remove('hidden');
        startMenu.classList.add('hidden');
    });
    closeBtn.addEventListener('click', () => {
        tableWindow.classList.add('hidden');
    });
    openParallelView.addEventListener('click', () => {
        parallelWindow.classList.remove('hidden');
        startMenu.classList.add('hidden');
        renderParallelCoordinates(parsedData); // Assuming parsedData is available globally
    });
    parallelCloseBtn.addEventListener('click', () => {
        parallelWindow.classList.add('hidden');
    });
    // Dragging windows
    function makeDraggable(header, windowElement) {
        let isDragging = false;
        let offsetX = 0, offsetY = 0;
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - windowElement.offsetLeft;
            offsetY = e.clientY - windowElement.offsetTop;
        });
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                windowElement.style.left = `${e.clientX - offsetX}px`;
                windowElement.style.top = `${e.clientY - offsetY}px`;
            }
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
    makeDraggable(tableWindow.querySelector('.window-header'), tableWindow);
    makeDraggable(parallelWindow.querySelector('.window-header'), parallelWindow);
    // File input change handler
    let parsedData;
    fileInput.addEventListener('change', (event) => {
        var _a;
        const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvData = e.target.result;
                parsedData = parseCSV(csvData); // Save the parsed data globally
                const stats = calculateStats(parsedData, file.name, file.size);
                showStatsPanel(stats);
                renderTable(parsedData);
                tableWindow.classList.remove('hidden'); // Show window when data is loaded
            };
            reader.readAsText(file);
        }
    });
    function parseCSV(data) {
        return data.trim().split('\n').map(row => row.split(','));
    }
    function calculateStats(data, fileName, fileSize) {
        const headers = data[0];
        const caseCount = data.length - 1;
        const attributeCount = headers.length - 1;
        const classColumn = headers.find(header => header.toLowerCase() === 'class');
        const classIndex = classColumn ? headers.indexOf(classColumn) : -1;
        const classCount = classIndex > -1 ? new Set(data.slice(1).map(row => row[classIndex])).size : 0;
        const datasetSize = (fileSize / 1024).toFixed(2); // Convert to KB
        return { fileName, caseCount, attributeCount, classCount, datasetSize };
    }
    function showStatsPanel(stats) {
        statsPanel.innerHTML = `
            Currently loaded dataset: ${stats.fileName} |
            ${stats.caseCount} cases |
            ${stats.attributeCount} attributes |
            ${stats.classCount} unique classes |
            ${stats.datasetSize} KB
        `;
        statsPanel.classList.remove('hidden');
    }
    function renderTable(data) {
        const table = document.createElement('table');
        const headerRow = document.createElement('tr');
        data[0].forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        data.slice(1).forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
        tableView.innerHTML = ''; // Clear any existing table
        tableView.appendChild(table);
        tableView.classList.remove('hidden');
    }
    function renderParallelCoordinates(data) {
        const headers = data[0];
        const rows = data.slice(1);
        // Identify class column and unique classes
        const classIndex = headers.findIndex(header => header.toLowerCase() === 'class');
        if (classIndex === -1) {
            console.error("Class column not found!");
            return;
        }
        const uniqueClasses = Array.from(new Set(rows.map(row => row[classIndex])));
        console.log("Unique Classes:", uniqueClasses);
        // Generate distinct colors for each class
        const classColors = generateClassColors(uniqueClasses.length);
        // Map each class to its color
        const classColorMap = new Map(uniqueClasses.map((cls, i) => [cls, classColors[i]]));
        // Assign a numerical value to each class for coloring
        const colorValues = rows.map(row => uniqueClasses.indexOf(row[classIndex]));
        const dimensions = headers.map((header, index) => ({
            label: header,
            values: rows.map(row => index === classIndex ? uniqueClasses.indexOf(row[index]) : parseFloat(row[index]) || 0), // Map class to numeric index
        }));
        const plotData = [
            {
                type: 'parcoords',
                line: {
                    color: colorValues, // Use the numerical class index for colors
                    colorscale: uniqueClasses.map((cls, i) => [i / (uniqueClasses.length - 1), classColorMap.get(cls)]), // Map colorscale to class colors
                },
                dimensions: dimensions,
            },
        ];
        const layout = {
            title: {
                text: 'Parallel Coordinates Plot',
                font: {
                    size: 18,
                },
                xref: 'paper',
                x: 0.05,
            },
            margin: { l: 50, r: 50, t: 100, b: 50 }, // Increase top margin to avoid overlap
        };
        Plotly.newPlot(parallelView, plotData, layout);
    }
    function generateClassColors(numClasses) {
        return Array.from({ length: numClasses }, (_, i) => {
            const hue = i / numClasses;
            const rgb = HSVtoRGB(hue, 1, 1);
            return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        });
    }
    function HSVtoRGB(h, s, v) {
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        let r = 0, g = 0, b = 0; // Initialize with default values
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
});
