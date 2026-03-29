/* =============================================
   CAREFLOW IIoT — DASHBOARD LOGIC
   ============================================= */

let currentRole = 'admin';
let session = null;

// ===================== INIT =====================
function initDashboard() {
    session = requireAuth();
    if (!session) return;

    currentRole = session.role;

    // Set avatar
    const avatar = document.getElementById('avatar');
    if (avatar) {
        const initials = session.name.split(' ').map(w => w[0]).join('').toUpperCase();
        avatar.textContent = initials;
        avatar.title = session.name + ' (' + session.id + ')';
    }

    // Activate correct role button
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    const roleBtn = document.querySelector(`.role-btn[data-role="${currentRole}"]`);
    if (roleBtn) roleBtn.classList.add('active');

    // Show correct view
    switchRole(currentRole);

    // Hide role switcher for non-admin
    const roleSwitcher = document.getElementById('role-switcher-section');
    if (session.role !== 'admin') {
        if (roleSwitcher) roleSwitcher.style.display = 'none';
    }

    // Update sidebar nav visibility based on role
    updateNavVisibility();

    // Init charts
    initCharts();

    // Init workers tasks
    renderWorkerTasks();
    renderAdminTasks();
    renderTechTasks();

    // Render generators & distributors
    renderGenerators();
    renderDistributors();

    // Start data loop
    setInterval(updateLoop, 2000);
    updateLoop();

    // Start clock
    setInterval(updateClock, 1000);
    updateClock();
}

// ===================== ROLE SWITCHING =====================
function switchRole(role) {
    currentRole = role;
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.role-btn[data-role="${role}"]`);
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById('view-' + role);
    if (view) view.classList.add('active');

    const titles = {
        admin: 'Admin <span>Dashboard</span>',
        tech: 'Technician <span>Dashboard</span>',
        worker: 'Worker <span>Dashboard</span>'
    };
    document.getElementById('topbar-title').innerHTML = titles[role] || '';

    updateNavVisibility();
}

function updateNavVisibility() {
    // Reset all nav items
    document.querySelectorAll('.nav-item').forEach(n => {
        n.style.display = '';
    });
}

// ===================== DATA UPDATE LOOP =====================
function updateLoop() {
    updateGeneratorData();
    updateAdminDOM();
    updateTechDOM();
    updateWorkerDOM();

    // Push chart data
    const gen1 = generators[0];
    pushPowerLive(gen1.ptotal, gen1.qtotal);
    pushTHDData(gen1.thd);
}

function updateAdminDOM() {
    const totalEnergy = getTotalEnergy();
    const totalPower = getTotalPower();
    const avgPF = getAvgPF();
    const avgHealth = getAvgHealth();

    set('kpi-energy', formatNumber(totalEnergy));
    set('kpi-pf', avgPF.toFixed(2));
    set('kpi-cost', '৳' + formatNumber(Math.round(totalEnergy * 7.89)));
    set('kpi-health', avgHealth);

    set('freq-val', generators[0].freq.toFixed(2));
    set('pf-stat', avgPF.toFixed(2));
    set('thd-stat', generators[0].thd.toFixed(1));
    set('q-stat', (generators[0].qtotal + generators[1].qtotal).toFixed(1));

    // Update generator panels
    renderGenerators();
}

function updateTechDOM() {
    const gen1 = generators[0];
    set('t-ptotal', gen1.ptotal.toFixed(1));
    set('t-qtotal', gen1.qtotal.toFixed(1));
    set('t-pf', gen1.pf.toFixed(2));

    // Register map values
    set('t-vl1', gen1.vl1.toFixed(1));
    set('t-vl2', gen1.vl2.toFixed(1));
    set('t-vl3', gen1.vl3.toFixed(1));
    set('t-freq', gen1.freq.toFixed(2));
    set('t-il1', gen1.il1.toFixed(1));
    set('t-il2', gen1.il2.toFixed(1));
    set('t-il3', gen1.il3.toFixed(1));
    set('t-pf2', gen1.pf.toFixed(2));
    set('t-pt2', gen1.ptotal.toFixed(1));
    set('t-qt2', gen1.qtotal.toFixed(1));
    set('t-thd', gen1.thd.toFixed(1));
    set('t-eimp', formatNumber(gen1.eimp));

    // THD box color
    const thdBox = document.getElementById('thd-l3-box');
    if (thdBox) {
        thdBox.className = 'thd-box' + (gen1.thd > 5 ? ' crit' : gen1.thd > 4 ? ' warn' : '');
        thdBox.textContent = `L3 V: ${gen1.thd.toFixed(1)}%` + (gen1.thd > 4 ? ' ⚠' : '');
    }
}

function updateWorkerDOM() {
    const gen1 = generators[0];
    set('w-power', getTotalPower().toFixed(1));

    // Individual line values
    set('w-vl1', gen1.vl1.toFixed(1));
    set('w-vl2', gen1.vl2.toFixed(1));
    set('w-vl3', gen1.vl3.toFixed(1));
    set('w-il1', gen1.il1.toFixed(1));
    set('w-il2', gen1.il2.toFixed(1));
    set('w-il3', gen1.il3.toFixed(1));
    set('w-freq', gen1.freq.toFixed(2));
    set('w-pf', gen1.pf.toFixed(2));
}

// ===================== RENDER GENERATORS =====================
function renderGenerators() {
    const container = document.getElementById('gen-panels');
    if (!container) return;

    container.innerHTML = generators.map(gen => {
        const statusClass = gen.status;
        const pfColor = gen.pf > 0.85 ? 'var(--green)' : gen.pf > 0.8 ? 'var(--amber)' : 'var(--red)';
        return `
    <div class="gen-card ${statusClass}">
      <div class="gen-header">
        <div class="gen-name">${gen.name}</div>
        <span class="gen-status-pill ${statusClass}">${gen.status.toUpperCase()}</span>
      </div>
      <div class="gen-stats">
        <div class="gen-stat">
          <div class="gen-stat-lbl">POWER</div>
          <div class="gen-stat-val" style="color:var(--cyan)">${gen.ptotal.toFixed(1)} <span style="font-size:11px;opacity:0.6">kW</span></div>
        </div>
        <div class="gen-stat">
          <div class="gen-stat-lbl">PF</div>
          <div class="gen-stat-val" style="color:${pfColor}">${gen.pf.toFixed(2)}</div>
        </div>
        <div class="gen-stat">
          <div class="gen-stat-lbl">RUN HOURS</div>
          <div class="gen-stat-val" style="color:var(--amber)">${formatNumber(gen.runHours)}<span style="font-size:11px;opacity:0.6">h</span></div>
        </div>
        <div class="gen-stat">
          <div class="gen-stat-lbl">FUEL</div>
          <div class="gen-stat-val" style="color:${gen.fuelLevel > 30 ? 'var(--green)' : 'var(--red)'}">${gen.fuelLevel}<span style="font-size:11px;opacity:0.6">%</span></div>
        </div>
        <div class="gen-stat">
          <div class="gen-stat-lbl">COOLANT</div>
          <div class="gen-stat-val" style="color:${gen.coolantTemp < 90 ? 'var(--cyan)' : 'var(--red)'}">${gen.coolantTemp.toFixed(0)}<span style="font-size:11px;opacity:0.6">°C</span></div>
        </div>
        <div class="gen-stat">
          <div class="gen-stat-lbl">OIL PSI</div>
          <div class="gen-stat-val" style="color:var(--green)">${gen.oilPressure.toFixed(0)}<span style="font-size:11px;opacity:0.6">psi</span></div>
        </div>
      </div>
    </div>`;
    }).join('');
}

// ===================== RENDER DISTRIBUTORS =====================
function renderDistributors() {
    const container = document.getElementById('dist-panels');
    if (!container) return;

    container.innerHTML = distributors.map(dist => {
        const loadColor = dist.loadPercent < 60 ? 'var(--green)' : dist.loadPercent < 80 ? 'var(--amber)' : 'var(--red)';
        return `
    <div class="dist-card">
      <div class="dist-header">
        <div class="dist-name">${dist.name}</div>
        <span style="font-family:var(--ff-mono);font-size:10px;color:var(--t3)">${dist.id}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--t2);margin-bottom:4px;">
        <span>Load: ${dist.loadPercent}%</span>
        <span>${dist.totalLoad.toFixed(1)} kW · ${dist.voltage.toFixed(1)}V</span>
      </div>
      <div class="dist-load-bar">
        <div class="dist-load-fill" style="width:${dist.loadPercent}%;background:${loadColor}"></div>
      </div>
      ${dist.breakers.map(b => `
        <div class="breaker-row">
          <span class="breaker-name">${b.name} (${b.rating})</span>
          <span class="breaker-status ${b.status}">${b.status.toUpperCase()}</span>
        </div>
      `).join('')}
    </div>`;
    }).join('');
}

// ===================== TASK MANAGEMENT =====================
function renderAdminTasks() {
    const container = document.getElementById('admin-task-list');
    if (!container) return;

    container.innerHTML = techTasks.map((t, i) => `
    <div class="task-item ${t.status === 'done' ? 'checked' : ''}">
      <div class="task-check ${t.status === 'done' ? 'done' : ''}">${t.status === 'done' ? '✓' : ''}</div>
      <div class="task-text">${t.text}</div>
      <span class="task-assign">${t.assignedTo}</span>
      <span class="task-pri ${t.priority}">${t.priority.toUpperCase()}</span>
    </div>
  `).join('');
}

function renderTechTasks() {
    const container = document.getElementById('tech-task-list');
    if (!container) return;

    const myId = session ? session.id : '';
    const myTasks = techTasks.filter(t => t.assignedTo === myId || session.role === 'admin');

    container.innerHTML = myTasks.map((t, i) => `
    <div class="task-item ${t.status === 'done' ? 'checked' : ''}" onclick="toggleTechTask(${techTasks.indexOf(t)})">
      <div class="task-check ${t.status === 'done' ? 'done' : ''}">${t.status === 'done' ? '✓' : ''}</div>
      <div class="task-text">${t.text}</div>
      <span class="task-pri ${t.priority}">${t.priority.toUpperCase()}</span>
    </div>
  `).join('');
}

function toggleTechTask(index) {
    techTasks[index].status = techTasks[index].status === 'done' ? 'pending' : 'done';
    renderTechTasks();
    renderAdminTasks();
}

function renderWorkerTasks() {
    const container = document.getElementById('worker-task-list');
    if (!container) return;

    container.innerHTML = workerTasks.map(t => `
    <div class="task-item readonly">
      <div class="task-check ${t.done ? 'done' : ''}">${t.done ? '✓' : ''}</div>
      <div class="task-text">${t.text}</div>
      <span class="task-pri ${t.priority}">${t.priority.toUpperCase()}</span>
    </div>
  `).join('');

    const doneCount = workerTasks.filter(t => t.done).length;
    set('task-count', `${doneCount}/${workerTasks.length} completed`);
    set('task-pct', Math.round(doneCount / workerTasks.length * 100) + '%');
}

// ===================== CREATE TASK MODAL =====================
function showCreateTask() {
    document.getElementById('task-modal').classList.add('show');
}

function closeCreateTask() {
    document.getElementById('task-modal').classList.remove('show');
}

function submitNewTask() {
    const text = document.getElementById('new-task-text').value.trim();
    const assignee = document.getElementById('new-task-assign').value;
    const priority = document.getElementById('new-task-priority').value;

    if (!text) return;

    const newTask = {
        id: 'T-' + String(techTasks.length + 1).padStart(3, '0'),
        text: text,
        priority: priority,
        assignedTo: assignee,
        status: 'pending',
        created: new Date().toLocaleString()
    };

    techTasks.push(newTask);
    renderAdminTasks();
    renderTechTasks();
    closeCreateTask();

    // Reset form
    document.getElementById('new-task-text').value = '';

    // Show notification
    addNotification('📋', `New task assigned to ${assignee}: ${text}`);
}

// ===================== NOTIFICATIONS =====================
function toggleNotif() {
    document.getElementById('notif-panel').classList.toggle('show');
}

function clearNotifs() {
    const p = document.getElementById('notif-panel');
    p.querySelectorAll('.notif-item').forEach(i => i.remove());
    set('notif-count', '0');
}

function addNotification(icon, msg) {
    const panel = document.getElementById('notif-panel');
    const item = document.createElement('div');
    item.className = 'notif-item';
    item.innerHTML = `
    <div class="notif-icon">${icon}</div>
    <div class="notif-body">
      <div class="notif-msg">${msg}</div>
      <div class="notif-time">JUST NOW</div>
    </div>`;
    const hd = panel.querySelector('.notif-hd');
    if (hd && hd.nextSibling) {
        panel.insertBefore(item, hd.nextSibling);
    } else {
        panel.appendChild(item);
    }

    const countEl = document.getElementById('notif-count');
    if (countEl) countEl.textContent = String(parseInt(countEl.textContent || '0') + 1);
}

// Close notif panel on outside click
document.addEventListener('click', e => {
    const p = document.getElementById('notif-panel');
    if (p && p.classList.contains('show') && !p.contains(e.target) && !e.target.classList.contains('icon-btn')) {
        p.classList.remove('show');
    }
});

// ===================== TOGGLES =====================
function toggleDevice(el) {
    el.classList.toggle('on');
    el.classList.toggle('off');
}

// ===================== REPORT =====================
function submitReport() {
    alert('✅ Issue reported successfully!\nTicket #CF-' + Math.floor(Math.random() * 9000 + 1000) + ' created.\nTechnician has been notified.');
}

// ===================== CLOCK =====================
function updateClock() {
    const now = new Date();
    const el = document.getElementById('clock');
    if (el) {
        el.textContent =
            now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }) + ' · ' +
            now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
}

// ===================== UTILS =====================
function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
}

function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ===================== INIT ON LOAD =====================
document.addEventListener('DOMContentLoaded', initDashboard);
