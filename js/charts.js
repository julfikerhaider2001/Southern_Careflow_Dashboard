/* =============================================
   CAREFLOW IIoT — CHART SETUP
   ============================================= */

// Chart.js global defaults
Chart.defaults.color = '#505068';
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';

const baseCfg = {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 0 },
    plugins: { legend: { display: false } },
    scales: {
        x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { font: { family: "'JetBrains Mono', monospace", size: 9 }, maxTicksLimit: 8 }
        },
        y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { font: { family: "'JetBrains Mono', monospace", size: 9 }, maxTicksLimit: 6 }
        }
    }
};

let allCharts = {};

function initCharts() {
    // =================== ADMIN CHARTS ===================

    // 1. 30-Day Power Usage (Bar chart)
    const ctx30day = document.getElementById('chart-30day');
    if (ctx30day) {
        allCharts.power30 = new Chart(ctx30day, {
            type: 'bar',
            data: {
                labels: powerHistory30.map(d => d.date),
                datasets: [{
                    label: 'Power Usage (kWh)',
                    data: powerHistory30.map(d => d.usage),
                    backgroundColor: powerHistory30.map((d, i) =>
                        i === powerHistory30.length - 1
                            ? 'rgba(0,207,255,0.5)'
                            : 'rgba(0,207,255,0.2)'
                    ),
                    borderColor: '#00CFFF',
                    borderWidth: 1.5,
                    borderRadius: 3
                }]
            },
            options: {
                ...baseCfg,
                scales: {
                    x: { ...baseCfg.scales.x, ticks: { ...baseCfg.scales.x.ticks, maxTicksLimit: 10, maxRotation: 45 } },
                    y: { ...baseCfg.scales.y, beginAtZero: true }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.parsed.y} kWh · ৳${Math.round(ctx.parsed.y * 7.89)}`
                        }
                    }
                }
            }
        });
    }

    // 2. Energy Donut
    const ctxEnergy = document.getElementById('chart-energy');
    if (ctxEnergy) {
        allCharts.energy = new Chart(ctxEnergy, {
            type: 'doughnut',
            data: {
                labels: ['Import', 'Export', 'Reactive'],
                datasets: [{
                    data: [getTotalEnergy(), 143 + 98, 387 + 220],
                    backgroundColor: ['rgba(0,207,255,0.25)', 'rgba(34,255,136,0.25)', 'rgba(255,170,0,0.25)'],
                    borderColor: ['#00CFFF', '#22FF88', '#FFAA00'],
                    borderWidth: 1.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: { legend: { display: false } },
                animation: { duration: 800 }
            }
        });
    }

    // 3. Weekly Energy Trend
    const ctxWeekly = document.getElementById('chart-weekly');
    if (ctxWeekly) {
        allCharts.weekly = new Chart(ctxWeekly, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    { label: 'Import', data: [1180, 1220, 1310, 1150, 1280, 980, 1247], backgroundColor: 'rgba(0,207,255,0.25)', borderColor: '#00CFFF', borderWidth: 1.5, borderRadius: 4 },
                    { label: 'Export', data: [120, 140, 155, 110, 160, 90, 143], backgroundColor: 'rgba(34,255,136,0.2)', borderColor: '#22FF88', borderWidth: 1.5, borderRadius: 4 }
                ]
            },
            options: { ...baseCfg, plugins: { legend: { display: false } } }
        });
    }

    // =================== TECH CHARTS ===================

    // 4. Waveform (canvas animation — no Chart.js)
    initWaveform();

    // 5. THD Trend
    const ctxTHD = document.getElementById('chart-thd');
    if (ctxTHD) {
        const thdLabels = Array.from({ length: 20 }, (_, i) => i === 19 ? 'now' : `-${(19 - i) * 10}s`);
        allCharts.thd = new Chart(ctxTHD, {
            type: 'line',
            data: {
                labels: thdLabels,
                datasets: [
                    { data: Array.from({ length: 20 }, () => 2.2 + Math.random() * 0.8), borderColor: '#FFAA00', borderWidth: 1.5, pointRadius: 0, tension: 0.4 },
                    { data: Array.from({ length: 20 }, () => 4.2 + Math.random() * 1.2), borderColor: '#FF3344', borderWidth: 1.5, pointRadius: 0, tension: 0.4 },
                    { data: Array.from({ length: 20 }, () => 3.5 + Math.random() * 1), borderColor: '#00CFFF', borderWidth: 1.5, pointRadius: 0, tension: 0.4 }
                ]
            },
            options: { ...baseCfg, scales: { x: baseCfg.scales.x, y: { ...baseCfg.scales.y, min: 0, max: 8 } } }
        });
    }

    // 6. Power trend (tech live)
    const ctxPowerLive = document.getElementById('chart-power-live');
    if (ctxPowerLive) {
        const plabels = Array.from({ length: 30 }, (_, i) => i === 29 ? 'now' : `-${(29 - i) * 2}s`);
        allCharts.powerLive = new Chart(ctxPowerLive, {
            type: 'line',
            data: {
                labels: plabels,
                datasets: [
                    { data: Array.from({ length: 30 }, () => 55 + Math.random() * 5), borderColor: '#00CFFF', backgroundColor: 'rgba(0,207,255,0.07)', borderWidth: 1.5, pointRadius: 0, fill: true, tension: 0.4 },
                    { data: Array.from({ length: 30 }, () => 26 + Math.random() * 4), borderColor: '#FFAA00', backgroundColor: 'rgba(255,170,0,0.05)', borderWidth: 1.5, pointRadius: 0, fill: true, tension: 0.4 }
                ]
            },
            options: { ...baseCfg, scales: { x: baseCfg.scales.x, y: { ...baseCfg.scales.y, min: 20, max: 70 } } }
        });
    }
}

// =================== WAVEFORM ANIMATION ===================
let wavePhase = 0;

function initWaveform() {
    const waveCanvas = document.getElementById('chart-wave');
    if (!waveCanvas) return;
    const waveCtx = waveCanvas.getContext('2d');

    function animWave() {
        const W = waveCanvas.offsetWidth || 600;
        const H = waveCanvas.height || 130;
        waveCanvas.width = W;
        waveCtx.clearRect(0, 0, W, H);
        const colors = ['#00CFFF', '#22FF88', '#FFAA00'];
        const offsets = [0, 2 * Math.PI / 3, 4 * Math.PI / 3];
        colors.forEach((c, i) => {
            waveCtx.beginPath();
            waveCtx.strokeStyle = c;
            waveCtx.lineWidth = 1.5;
            for (let x = 0; x < W; x++) {
                const angle = (x / W) * 4 * Math.PI + wavePhase + offsets[i];
                const y = H / 2 - Math.sin(angle) * (H / 2 - 12);
                x === 0 ? waveCtx.moveTo(x, y) : waveCtx.lineTo(x, y);
            }
            waveCtx.stroke();
        });
        wavePhase += 0.08;
        requestAnimationFrame(animWave);
    }
    animWave();
}

// =================== CHART UPDATE FUNCTIONS ===================
function pushTHDData(thd) {
    if (!allCharts.thd) return;
    allCharts.thd.data.datasets[1].data.push(thd);
    allCharts.thd.data.datasets[1].data.shift();
    allCharts.thd.data.datasets[0].data.push(thd - 2.5 + Math.random() * 0.5);
    allCharts.thd.data.datasets[0].data.shift();
    allCharts.thd.data.datasets[2].data.push(thd - 1.2 + Math.random() * 0.5);
    allCharts.thd.data.datasets[2].data.shift();
    allCharts.thd.update();
}

function pushPowerLive(p, q) {
    if (!allCharts.powerLive) return;
    allCharts.powerLive.data.datasets[0].data.push(p);
    allCharts.powerLive.data.datasets[0].data.shift();
    allCharts.powerLive.data.datasets[1].data.push(q);
    allCharts.powerLive.data.datasets[1].data.shift();
    allCharts.powerLive.update();
}
