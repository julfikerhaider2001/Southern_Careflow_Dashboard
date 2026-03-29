/* =============================================
   CAREFLOW IIoT — AUTHENTICATION
   ============================================= */

const USERS = {
  admin:   { password: 'admin123', role: 'admin',  name: 'Julfiker H.',  id: 'ADM-001' },
  tech01:  { password: 'tech123',  role: 'tech',   name: 'Rafiq Ahmed',  id: 'TECH-01' },
  tech02:  { password: 'tech123',  role: 'tech',   name: 'Kamal Hossain',id: 'TECH-02' },
  tech03:  { password: 'tech123',  role: 'tech',   name: 'Sohel Mia',   id: 'TECH-03' },
  worker:  { password: 'worker123',role: 'worker', name: 'Worker',       id: 'WKR-001' }
};

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-user').value.trim().toLowerCase();
  const password = document.getElementById('login-pass').value;
  const errorEl = document.getElementById('login-error');
  const btn = document.querySelector('.login-btn');

  // Reset error
  errorEl.classList.remove('show');

  if (!username || !password) {
    errorEl.textContent = '⚠ Please enter both username and password';
    errorEl.classList.add('show');
    return;
  }

  // Loading state
  btn.classList.add('loading');
  btn.textContent = 'AUTHENTICATING...';

  setTimeout(() => {
    const user = USERS[username];

    if (!user || user.password !== password) {
      errorEl.textContent = '⛔ Invalid credentials — Access denied';
      errorEl.classList.add('show');
      btn.classList.remove('loading');
      btn.textContent = 'AUTHENTICATE →';
      return;
    }

    // Store session
    const session = {
      username: username,
      role: user.role,
      name: user.name,
      id: user.id,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('careflow_session', JSON.stringify(session));

    // Redirect
    window.location.href = 'dashboard.html';
  }, 800);
}

function getSession() {
  const raw = localStorage.getItem('careflow_session');
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { return null; }
}

function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

function logout() {
  localStorage.removeItem('careflow_session');
  window.location.href = 'index.html';
}

function fillCredentials(username, password) {
  document.getElementById('login-user').value = username;
  document.getElementById('login-pass').value = password;
}

// Check if already logged in on login page
function checkExistingSession() {
  const session = getSession();
  if (session) {
    window.location.href = 'dashboard.html';
  }
}
