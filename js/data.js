/* =============================================
   CAREFLOW IIoT — DATA SIMULATION ENGINE
   ============================================= */

// --------------- GENERATOR DATA ---------------
const generators = [
    {
        id: 'GEN-01', name: 'Generator Alpha',
        vl1: 229.8, vl2: 231.2, vl3: 230.4,
        il1: 84.2, il2: 86.7, il3: 83.8,
        ptotal: 57.4, qtotal: 28.3, pf: 0.87, freq: 50.02,
        thd: 4.8, eimp: 1247, eexp: 143,
        runHours: 4218, fuelLevel: 78, coolantTemp: 82,
        status: 'online', oilPressure: 42,
        health: { windings: 91, bearings: 43, injectors: 78, cooling: 65, control: 89 }
    },
    {
        id: 'GEN-02', name: 'Generator Beta',
        vl1: 230.5, vl2: 229.8, vl3: 231.1,
        il1: 72.4, il2: 74.1, il3: 73.2,
        ptotal: 48.6, qtotal: 22.1, pf: 0.91, freq: 50.01,
        thd: 2.3, eimp: 982, eexp: 98,
        runHours: 3540, fuelLevel: 65, coolantTemp: 79,
        status: 'online', oilPressure: 45,
        health: { windings: 95, bearings: 82, injectors: 88, cooling: 72, control: 93 }
    },
    {
        id: 'GEN-03', name: 'Generator Gamma',
        vl1: 228.9, vl2: 230.3, vl3: 229.7,
        il1: 0, il2: 0, il3: 0,
        ptotal: 0, qtotal: 0, pf: 0, freq: 0,
        thd: 0, eimp: 0, eexp: 0,
        runHours: 2890, fuelLevel: 92, coolantTemp: 25,
        status: 'standby', oilPressure: 0,
        health: { windings: 97, bearings: 90, injectors: 94, cooling: 88, control: 96 }
    }
];

// --------------- DISTRIBUTOR DATA ---------------
const distributors = [
    {
        id: 'DIST-01', name: 'Main Distribution Board',
        voltage: 230.2, loadPercent: 72, totalLoad: 48.2,
        breakers: [
            { name: 'Main Breaker', status: 'closed', rating: '200A' },
            { name: 'Line 1 Feed', status: 'closed', rating: '100A' },
            { name: 'Line 2 Feed', status: 'closed', rating: '100A' },
            { name: 'Emergency', status: 'open', rating: '63A' }
        ],
        status: 'active'
    },
    {
        id: 'DIST-02', name: 'Workshop Panel',
        voltage: 229.8, loadPercent: 58, totalLoad: 32.5,
        breakers: [
            { name: 'Panel Main', status: 'closed', rating: '160A' },
            { name: 'Machine Bay', status: 'closed', rating: '80A' },
            { name: 'Welding Bay', status: 'closed', rating: '63A' },
            { name: 'Spare', status: 'open', rating: '32A' }
        ],
        status: 'active'
    },
    {
        id: 'DIST-03', name: 'Office & Utility Panel',
        voltage: 231.0, loadPercent: 34, totalLoad: 12.8,
        breakers: [
            { name: 'Panel Main', status: 'closed', rating: '100A' },
            { name: 'Office Floor', status: 'closed', rating: '40A' },
            { name: 'HVAC', status: 'closed', rating: '50A' },
            { name: 'Lighting', status: 'closed', rating: '25A' }
        ],
        status: 'active'
    }
];

// --------------- 30 DAY POWER DATA ---------------
function generate30DayPower() {
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const base = 900 + Math.random() * 600;
        const weekend = (d.getDay() === 0 || d.getDay() === 6) ? 0.6 : 1;
        days.push({
            date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            usage: Math.round(base * weekend),
            cost: Math.round(base * weekend * 7.89)
        });
    }
    return days;
}

const powerHistory30 = generate30DayPower();

// --------------- TASK DATA ---------------
let techTasks = [
    { id: 'T-001', text: 'Check main bearing vibration on GEN-01', priority: 'high', assignedTo: 'TECH-01', status: 'pending', created: '2026-03-29 07:00' },
    { id: 'T-002', text: 'Replace oil filter on GEN-02', priority: 'med', assignedTo: 'TECH-02', status: 'pending', created: '2026-03-29 07:15' },
    { id: 'T-003', text: 'Inspect harmonic filter on L3', priority: 'high', assignedTo: 'TECH-01', status: 'done', created: '2026-03-28 14:00' },
    { id: 'T-004', text: 'Calibrate voltage sensor DIST-01', priority: 'low', assignedTo: 'TECH-03', status: 'pending', created: '2026-03-29 08:00' }
];

let workerTasks = [
    { text: 'Morning walkround inspection', priority: 'high', done: true },
    { text: 'Log generator fuel level', priority: 'med', done: true },
    { text: 'Check oil pressure gauge', priority: 'high', done: false },
    { text: 'Verify coolant temperature', priority: 'med', done: false },
    { text: 'Monitor L3 voltage fluctuation', priority: 'high', done: false },
    { text: 'Submit shift handover report', priority: 'low', done: false }
];

// --------------- TECHNICIAN LIST ---------------
const technicians = [
    { id: 'TECH-01', name: 'Rafiq Ahmed' },
    { id: 'TECH-02', name: 'Kamal Hossain' },
    { id: 'TECH-03', name: 'Sohel Mia' }
];

// --------------- DATA UPDATE FUNCTIONS ---------------
function rnd(v, range) { return +(v + (Math.random() - 0.5) * range * 2).toFixed(2); }
function rnd1(v, range) { return +(v + (Math.random() - 0.5) * range * 2).toFixed(1); }

function updateGeneratorData() {
    generators.forEach(gen => {
        if (gen.status === 'standby') return;
        gen.vl1 = rnd(230, 1.5);
        gen.vl2 = rnd(231, 1.5);
        gen.vl3 = rnd(230, 2);
        gen.il1 = rnd1(84, 3);
        gen.il2 = rnd1(87, 3);
        gen.il3 = rnd1(84, 3);
        gen.ptotal = rnd1(gen.ptotal, 2);
        gen.qtotal = rnd1(gen.qtotal, 2);
        gen.pf = rnd(gen.pf, 0.02);
        gen.freq = rnd(50.0, 0.05);
        gen.thd = rnd(gen.thd, 0.5);
        gen.coolantTemp = rnd1(gen.coolantTemp, 1);
        gen.oilPressure = rnd1(gen.oilPressure, 1);
    });

    distributors.forEach(dist => {
        dist.voltage = rnd(230, 1);
        dist.loadPercent = Math.max(10, Math.min(95, dist.loadPercent + Math.round((Math.random() - 0.5) * 4)));
        dist.totalLoad = rnd1(dist.totalLoad, 2);
    });
}

function getTotalPower() {
    return generators.reduce((sum, g) => sum + (g.status === 'online' ? g.ptotal : 0), 0);
}

function getTotalEnergy() {
    return generators.reduce((sum, g) => sum + g.eimp, 0);
}

function getAvgPF() {
    const online = generators.filter(g => g.status === 'online');
    if (online.length === 0) return 0;
    return +(online.reduce((sum, g) => sum + g.pf, 0) / online.length).toFixed(2);
}

function getAvgHealth() {
    let total = 0, count = 0;
    generators.forEach(g => {
        Object.values(g.health).forEach(v => { total += v; count++; });
    });
    return Math.round(total / count);
}
