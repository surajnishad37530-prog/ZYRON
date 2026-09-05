/**
 * ==========================================================================
 * ZYRON Operating System - Core Architecture & Application Engine
 * Pure Tailwind CSS Architecture with Dual Light & Dark Theme Support
 * ==========================================================================
 */

// Global App State
const ZYRON = {
  currentUser: null,
  habits: [],
  activeCategory: 'All',
  activeStatus: 'All',
  soundEnabled: localStorage.getItem('zyron_sound_muted') !== 'true',
  theme: localStorage.getItem('zyron_theme') || 'dark',
  audioCtx: null,
};

// ==========================================
// 1. THEME ENGINE (Dark / Light Mode)
// ==========================================
function initTheme() {
  const saved = localStorage.getItem('zyron_theme');
  if (saved === 'light') {
    document.documentElement.classList.remove('dark');
    ZYRON.theme = 'light';
  } else {
    document.documentElement.classList.add('dark');
    ZYRON.theme = 'dark';
  }
  updateThemeButton();
}

window.toggleTheme = function () {
  playSynthSound('click');
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('zyron_theme', 'light');
    ZYRON.theme = 'light';
    showToast('Switched to Light Mode', 'info', '☀️');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('zyron_theme', 'dark');
    ZYRON.theme = 'dark';
    showToast('Switched to Dark Mode', 'info', '🌙');
  }
  updateThemeButton();
};

function updateThemeButton() {
  const isDark = document.documentElement.classList.contains('dark');
  const btns = document.querySelectorAll('#theme-toggle-btn, [data-theme-toggle-btn]');
  btns.forEach((btn) => {
    btn.innerHTML = isDark
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400 hover:rotate-45 transition-transform"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600 hover:-rotate-12 transition-transform"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  });
}

// ==========================================
// 2. SOUND SYNTHESIZER (Zero External Deps)
// ==========================================
function getAudioContext() {
  if (!ZYRON.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    ZYRON.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ZYRON.audioCtx && ZYRON.audioCtx.state === 'suspended') {
    ZYRON.audioCtx.resume();
  }
  return ZYRON.audioCtx;
}

function playSynthSound(type) {
  if (!ZYRON.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'complete') {
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.12, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.3);
      });
    } else if (type === 'levelup') {
      [440, 554.37, 659.25, 880].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.4);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'delete') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.15);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    console.debug('Audio error:', e);
  }
}

window.toggleSound = function () {
  ZYRON.soundEnabled = !ZYRON.soundEnabled;
  localStorage.setItem('zyron_sound_muted', (!ZYRON.soundEnabled).toString());
  updateSoundButton();
  showToast(
    ZYRON.soundEnabled ? 'Audio feedback enabled' : 'Audio feedback muted',
    'info',
    ZYRON.soundEnabled ? '🔊' : '🔇'
  );
};

function updateSoundButton() {
  const btn = document.getElementById('sound-toggle-btn');
  if (!btn) return;
  btn.innerHTML = ZYRON.soundEnabled
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
  btn.title = ZYRON.soundEnabled ? 'Mute Audio' : 'Enable Audio';
}

// ==========================================
// 3. TOAST NOTIFICATION ENGINE (Tailwind)
// ==========================================
function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none';
    document.body.appendChild(container);
  }
  return container;
}

window.showToast = function (message, type = 'info', icon = '⚡') {
  const container = ensureToastContainer();
  const toast = document.createElement('div');

  let borderClass = 'border-l-4 border-l-zblue';
  if (type === 'success') borderClass = 'border-l-4 border-l-zgreen';
  if (type === 'warning') borderClass = 'border-l-4 border-l-zorange';
  if (type === 'error') borderClass = 'border-l-4 border-l-rose-500';

  toast.className = `pointer-events-auto min-w-[280px] max-w-sm px-4 py-3 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white shadow-2xl flex items-center gap-3 text-sm font-medium transform translate-x-full transition-all duration-300 opacity-0 ${borderClass}`;
  toast.innerHTML = `
    <span class="text-base flex-shrink-0">${icon}</span>
    <span class="flex-1 text-xs sm:text-sm font-semibold">${message}</span>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
    toast.classList.add('translate-x-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.remove('translate-x-0', 'opacity-100');
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
};

// ==========================================
// 4. AUTHENTICATION & USER MANAGEMENT
// ==========================================
const DEFAULT_DEMO_ACCOUNT = {
  name: 'Alex Mercer',
  email: 'demo@zyron.os',
  password: 'zyron123',
  level: 4,
  xp: 450,
  streak: 12,
};

function getStoredAccounts() {
  const data = localStorage.getItem('zyron_accounts');
  if (!data) {
    const initial = [DEFAULT_DEMO_ACCOUNT];
    localStorage.setItem('zyron_accounts', JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [DEFAULT_DEMO_ACCOUNT];
  }
}

function saveStoredAccounts(accounts) {
  localStorage.setItem('zyron_accounts', JSON.stringify(accounts));
}

function initSession() {
  const sessionData = localStorage.getItem('zyron_session');
  if (sessionData) {
    try {
      ZYRON.currentUser = JSON.parse(sessionData);
      return;
    } catch (e) {
      ZYRON.currentUser = null;
    }
  }

  const legacyName = localStorage.getItem('zyron_user');
  if (legacyName) {
    const accounts = getStoredAccounts();
    const found = accounts.find((a) => a.name.toLowerCase() === legacyName.toLowerCase());
    if (found) {
      ZYRON.currentUser = found;
    } else {
      ZYRON.currentUser = {
        name: legacyName,
        email: `${legacyName.toLowerCase().replace(/\s+/g, '')}@zyron.local`,
        level: 1,
        xp: 60,
        streak: 3,
      };
    }
    localStorage.setItem('zyron_session', JSON.stringify(ZYRON.currentUser));
  }
}

function saveUserSession(user) {
  ZYRON.currentUser = user;
  localStorage.setItem('zyron_session', JSON.stringify(user));
  localStorage.setItem('zyron_user', user.name);

  const accounts = getStoredAccounts();
  const index = accounts.findIndex((a) => a.email.toLowerCase() === user.email.toLowerCase());
  if (index !== -1) {
    accounts[index] = { ...accounts[index], ...user };
    saveStoredAccounts(accounts);
  }
}

window.logout = function () {
  playSynthSound('click');
  localStorage.removeItem('zyron_session');
  localStorage.removeItem('zyron_user');
  ZYRON.currentUser = null;
  showToast('Logged out of Zyron Operating System', 'info', '🔒');
  setTimeout(() => {
    window.location.href = 'Register-Login.html';
  }, 500);
};

window.quickDemoLogin = function () {
  playSynthSound('complete');
  saveUserSession(DEFAULT_DEMO_ACCOUNT);
  showToast('Welcome back, Commander Mercer!', 'success', '🚀');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
};

// ==========================================
// 5. UNIFIED NAVBAR CONTROLLER
// ==========================================
function updateNavbar() {
  const authDesktop = document.getElementById('nav-auth-section');
  const user = ZYRON.currentUser;

  if (authDesktop) {
    if (user) {
      const initials = user.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'Z';
      const firstName = user.name ? user.name.split(' ')[0] : 'User';
      const xpNeeded = (user.level || 1) * 200;
      const curLevelXp = (user.xp || 0) % xpNeeded;
      const xpPct = Math.min(100, Math.round((curLevelXp / xpNeeded) * 100));

      authDesktop.innerHTML = `
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Streak Pill -->
          <div class="hidden sm:flex bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 items-center gap-2 hover:border-zorange/50 transition-colors cursor-default" title="Current Daily Streak">
            <span class="text-zorange text-base">🔥</span>
            <span class="font-bold text-xs tracking-wider text-slate-800 dark:text-gray-200">${user.streak || 1} Days</span>
          </div>

          <!-- Level Badge -->
          <div class="hidden sm:flex bg-zpurple/10 border border-zpurple/30 px-3 py-1.5 rounded-full items-center gap-1.5 cursor-default">
            <span class="text-xs text-zpurple font-black">LVL ${user.level || 1}</span>
          </div>

          <!-- Audio Sound Toggle -->
          <button id="sound-toggle-btn" onclick="toggleSound()" class="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-zblue/50 transition-all focus:outline-none" title="Toggle Audio Feedback">
          </button>

          <!-- User Profile Dropdown Button -->
          <div class="relative" id="user-profile-menu-wrapper">
            <button id="user-menu-btn" onclick="toggleProfileDropdown(event)" class="flex items-center gap-2.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 transition-all focus:outline-none">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-zblue to-zpurple flex items-center justify-center font-extrabold text-xs text-black shadow-md">
                ${initials}
              </div>
              <div class="hidden md:flex flex-col text-left pr-1">
                <span class="text-xs font-bold text-slate-900 dark:text-white tracking-wide leading-tight">${firstName}</span>
                <span class="text-[10px] text-slate-500 dark:text-gray-400 leading-tight">Commander</span>
              </div>
              <svg class="w-3.5 h-3.5 text-slate-400 dark:text-gray-400 ml-0.5 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            <!-- 100% OPAQUE, SOLID, HIGH-CONTRAST DROPDOWN MENU -->
            <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2.5 w-64 bg-white dark:bg-[#141416] border-2 border-slate-200 dark:border-white/20 rounded-2xl p-4 shadow-2xl z-50 transform origin-top-right transition-all">
              <div class="border-b border-slate-200 dark:border-white/10 pb-3 mb-3">
                <p class="text-sm font-black text-slate-900 dark:text-white">${user.name}</p>
                <p class="text-xs text-slate-500 dark:text-gray-400 truncate font-mono">${user.email || 'user@zyron.os'}</p>
              </div>

              <!-- XP Progress Bar inside Dropdown -->
              <div class="mb-3 bg-slate-100 dark:bg-black/50 p-2.5 rounded-xl border border-slate-200 dark:border-white/10">
                <div class="flex justify-between text-[11px] font-semibold mb-1">
                  <span class="text-slate-600 dark:text-gray-400 font-bold">Level ${user.level || 1} XP</span>
                  <span class="text-zblue font-mono font-bold">${curLevelXp} / ${xpNeeded}</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-gradient-to-r from-zblue to-zpurple h-full" style="width: ${xpPct}%;"></div>
                </div>
              </div>

              <div class="space-y-1">
                <a href="index.html" class="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                  <span>⚡</span> Dashboard Telemetry
                </a>
                <a href="About.html" class="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                  <span>📘</span> System Architecture
                </a>
                <button onclick="logout()" class="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-extrabold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/15 rounded-xl transition-colors mt-2 border-t border-slate-200 dark:border-white/10 pt-2">
                  <span>🚪</span> Sign Out System
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      updateSoundButton();
    } else {
      authDesktop.innerHTML = `
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Audio Sound Toggle -->
          <button id="sound-toggle-btn" onclick="toggleSound()" class="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-zblue/50 transition-all focus:outline-none" title="Toggle Audio Feedback">
          </button>

          <a href="Register-Login.html" class="hidden sm:inline-block text-xs font-bold text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 transition-colors">
            Sign In
          </a>
          <a href="Register-Login.html" class="bg-gradient-to-r from-zblue to-zpurple text-black px-4 py-2 rounded-xl text-xs font-extrabold shadow-md hover:opacity-95 hover:scale-105 transition-all">
            Get Started
          </a>
        </div>
      `;
      updateSoundButton();
    }
  }

  // Update Active Link Highlight
  const path = window.location.pathname.toLowerCase();
  const isAbout = path.includes('about');
  const isAuth = path.includes('register') || path.includes('login');
  const isDashboard = !isAbout && !isAuth;

  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const page = link.getAttribute('data-nav-link');
    if (
      (page === 'dashboard' && isDashboard) ||
      (page === 'about' && isAbout) ||
      (page === 'auth' && isAuth)
    ) {
      link.classList.add('text-zblue', 'font-bold');
      link.classList.remove('text-slate-500', 'dark:text-gray-400');
    } else {
      link.classList.remove('text-zblue');
      link.classList.add('text-slate-500', 'dark:text-gray-400');
    }
  });

  renderMobileDrawer();
}

window.toggleProfileDropdown = function (e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('user-dropdown-menu');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
};

document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('user-profile-menu-wrapper');
  const dropdown = document.getElementById('user-dropdown-menu');
  if (wrapper && dropdown && !wrapper.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
});

window.toggleMobileNav = function () {
  const drawer = document.getElementById('mobile-nav-drawer');
  const iconBurger = document.getElementById('hamburger-icon-bars');
  const iconClose = document.getElementById('hamburger-icon-close');

  if (!drawer) return;
  playSynthSound('click');

  const isHidden = drawer.classList.contains('hidden');
  if (isHidden) {
    drawer.classList.remove('hidden');
    if (iconBurger) iconBurger.classList.add('hidden');
    if (iconClose) iconClose.classList.remove('hidden');
  } else {
    drawer.classList.add('hidden');
    if (iconBurger) iconBurger.classList.remove('hidden');
    if (iconClose) iconClose.classList.add('hidden');
  }
};

function renderMobileDrawer() {
  const drawer = document.getElementById('mobile-nav-drawer');
  if (!drawer) return;

  const user = ZYRON.currentUser;
  drawer.innerHTML = `
    <div class="px-5 py-4 space-y-3 bg-white dark:bg-[#121214] border-t border-slate-200 dark:border-white/10 shadow-xl">
      <div class="flex flex-col space-y-2 font-semibold text-sm">
        <a href="index.html" data-nav-link="dashboard" class="py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center justify-between text-slate-800 dark:text-gray-200">
          <span>Dashboard</span>
          <span class="text-xs text-slate-400 dark:text-gray-500 font-mono">01</span>
        </a>
        <a href="About.html" data-nav-link="about" class="py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center justify-between text-slate-800 dark:text-gray-200">
          <span>Architecture & Philosophy</span>
          <span class="text-xs text-slate-400 dark:text-gray-500 font-mono">02</span>
        </a>
        <a href="Register-Login.html" data-nav-link="auth" class="py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center justify-between text-slate-800 dark:text-gray-200">
          <span>Access Portal</span>
          <span class="text-xs text-slate-400 dark:text-gray-500 font-mono">03</span>
        </a>
      </div>

      <div class="pt-3 border-t border-slate-200 dark:border-white/10">
        ${
          user
            ? `
          <div class="flex items-center justify-between bg-slate-100 dark:bg-white/5 p-3 rounded-2xl mb-3">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-zblue to-zpurple flex items-center justify-center font-bold text-black text-xs">
                ${user.name ? user.name[0].toUpperCase() : 'Z'}
              </div>
              <div>
                <p class="text-xs font-bold text-slate-900 dark:text-white">${user.name}</p>
                <p class="text-[10px] text-zblue font-medium">Level ${user.level || 1} • 🔥 ${user.streak || 1}d Streak</p>
              </div>
            </div>
            <button onclick="logout()" class="text-xs text-rose-500 hover:text-rose-600 font-bold bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-xl">
              Sign Out
            </button>
          </div>
        `
            : `
          <div class="grid grid-cols-2 gap-2">
            <a href="Register-Login.html" class="text-center py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white">Sign In</a>
            <a href="Register-Login.html" class="text-center py-2.5 rounded-xl bg-gradient-to-r from-zblue to-zpurple text-xs font-extrabold text-black">Get Started</a>
          </div>
        `
        }
      </div>
    </div>
  `;
}

// ==========================================
// 6. HABIT SYSTEM & PERSISTENCE ENGINE
// ==========================================
const DEFAULT_HABITS = [
  { id: 1, title: 'Morning 5K Endurance Run', category: 'Fitness', difficulty: 'Hard', xp: 30, completed: false },
  { id: 2, title: 'Deep Work Block (90 Mins)', category: 'Work', difficulty: 'Hard', xp: 30, completed: false },
  { id: 3, title: 'Read 20 Pages of Non-Fiction', category: 'Learning', difficulty: 'Medium', xp: 20, completed: false },
  { id: 4, title: 'Breathwork & Ice Bath Protocol', category: 'Mindset', difficulty: 'Easy', xp: 10, completed: false },
  { id: 5, title: 'Portfolio & Capital Allocation Review', category: 'Money', difficulty: 'Easy', xp: 10, completed: false },
];

function getHabitsStorageKey() {
  const user = ZYRON.currentUser;
  return user ? `zyron_habits_${user.email.toLowerCase()}` : 'zyron_habits_guest';
}

function loadHabits() {
  const key = getHabitsStorageKey();
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      ZYRON.habits = JSON.parse(saved);
      return;
    } catch (e) {
      console.error('Error parsing habits:', e);
    }
  }
  ZYRON.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
  saveHabits();
}

function saveHabits() {
  const key = getHabitsStorageKey();
  localStorage.setItem(key, JSON.stringify(ZYRON.habits));
}

function getDifficultyBadge(diff) {
  if (diff === 'Easy') return 'text-zgreen border-zgreen/30 bg-zgreen/10';
  if (diff === 'Medium') return 'text-zorange border-zorange/30 bg-zorange/10';
  return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
}

function getCategoryIcon(cat) {
  switch (cat) {
    case 'Fitness': return '💪';
    case 'Work': return '💻';
    case 'Learning': return '📚';
    case 'Mindset': return '🧠';
    case 'Money': return '📈';
    default: return '⚡';
  }
}

function renderHabits() {
  const container = document.getElementById('habits-container');
  if (!container) return;

  let filtered = ZYRON.habits;

  if (ZYRON.activeCategory !== 'All') {
    filtered = filtered.filter((h) => h.category === ZYRON.activeCategory);
  }

  if (ZYRON.activeStatus === 'Active') {
    filtered = filtered.filter((h) => !h.completed);
  } else if (ZYRON.activeStatus === 'Done') {
    filtered = filtered.filter((h) => h.completed);
  }

  const totalCountEl = document.getElementById('mission-counter');
  if (totalCountEl) {
    const completedCount = ZYRON.habits.filter((h) => h.completed).length;
    totalCountEl.innerText = `${completedCount}/${ZYRON.habits.length} Complete`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="bg-slate-50 dark:bg-white/[0.02] rounded-3xl p-8 text-center border border-slate-200 dark:border-white/10 my-3">
        <div class="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center mx-auto mb-3 text-2xl">
          🎯
        </div>
        <h4 class="text-base font-bold text-slate-800 dark:text-white mb-1">No Missions Found</h4>
        <p class="text-xs text-slate-500 dark:text-gray-400 max-w-xs mx-auto mb-4">No protocols match your selected filters. Adjust your criteria or initialize a new mission.</p>
        <button onclick="openModal()" class="bg-gradient-to-r from-zblue to-zpurple text-black text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-md">
          + Add Mission
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  filtered.forEach((habit) => {
    const diffBadge = getDifficultyBadge(habit.difficulty);
    const icon = getCategoryIcon(habit.category);
    const isChecked = habit.completed ? 'checked' : '';
    const textStyle = habit.completed
      ? 'line-through text-slate-400 dark:text-gray-500'
      : 'text-slate-900 dark:text-white';
    const cardBg = habit.completed
      ? 'opacity-65 bg-slate-100 dark:bg-black/30 border-slate-200 dark:border-white/5'
      : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-zblue/50 dark:hover:border-zblue/40 shadow-sm dark:shadow-none';

    const item = document.createElement('div');
    item.className = `rounded-2xl p-4 flex items-center justify-between group transition-all duration-300 border relative overflow-hidden ${cardBg}`;
    item.id = `habit-card-${habit.id}`;

    item.innerHTML = `
      <div class="flex items-center gap-4 flex-1 min-w-0 pr-2">
        <input type="checkbox" ${isChecked} onchange="toggleHabit(${habit.id}, event)" class="w-5 h-5 rounded border border-slate-300 dark:border-white/30 text-zblue accent-[#00F0FF] cursor-pointer flex-shrink-0">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-base md:text-lg truncate ${textStyle} transition-colors">${habit.title}</h4>
          </div>
          <div class="flex flex-wrap items-center gap-2 mt-1 text-xs font-semibold">
            <span class="text-slate-500 dark:text-gray-400 flex items-center gap-1">${icon} ${habit.category}</span>
            <span class="px-2 py-0.5 rounded border text-[10px] uppercase font-bold tracking-wider ${diffBadge}">${habit.difficulty}</span>
            <span class="text-zpurple font-bold text-[11px]">+${habit.xp} XP</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button onclick="deleteHabit(${habit.id})" class="text-slate-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" title="Delete Mission">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    container.appendChild(item);
  });
}

window.toggleHabit = function (id, event) {
  const habit = ZYRON.habits.find((h) => h.id === id);
  if (!habit) return;

  habit.completed = !habit.completed;
  saveHabits();

  if (ZYRON.currentUser) {
    const prevLevel = ZYRON.currentUser.level || 1;
    if (habit.completed) {
      playSynthSound('complete');
      ZYRON.currentUser.xp = (ZYRON.currentUser.xp || 0) + habit.xp;
      showToast(`Mission Executed: ${habit.title} (+${habit.xp} XP)`, 'success', '⚡');
    } else {
      playSynthSound('click');
      ZYRON.currentUser.xp = Math.max(0, (ZYRON.currentUser.xp || 0) - habit.xp);
    }

    const newLevel = Math.floor((ZYRON.currentUser.xp || 0) / 200) + 1;
    if (newLevel > prevLevel) {
      ZYRON.currentUser.level = newLevel;
      playSynthSound('levelup');
      showToast(`LEVEL UP! You have achieved Level ${newLevel}!`, 'info', '🏆');
    } else if (newLevel < prevLevel) {
      ZYRON.currentUser.level = Math.max(1, newLevel);
    }

    saveUserSession(ZYRON.currentUser);
    updateNavbar();
  } else {
    if (habit.completed) {
      playSynthSound('complete');
      showToast(`Mission Executed: ${habit.title}`, 'success', '⚡');
    } else {
      playSynthSound('click');
    }
  }

  renderHabits();
  calculateEngine();
};

window.deleteHabit = function (id) {
  playSynthSound('delete');
  const target = ZYRON.habits.find((h) => h.id === id);
  ZYRON.habits = ZYRON.habits.filter((h) => h.id !== id);
  saveHabits();
  renderHabits();
  calculateEngine();
  showToast(target ? `Mission removed: "${target.title}"` : 'Mission removed', 'warning', '🗑️');
};

window.resetDailyMissions = function () {
  playSynthSound('click');
  if (confirm('Reset today’s missions to uncompleted? (Your XP & Level will be preserved)')) {
    ZYRON.habits.forEach((h) => (h.completed = false));
    saveHabits();
    renderHabits();
    calculateEngine();
    showToast('All missions reset for a new day of execution.', 'info', '🔄');
  }
};

window.setCategoryFilter = function (category, btn) {
  playSynthSound('click');
  ZYRON.activeCategory = category;

  document.querySelectorAll('[data-category-pill]').forEach((p) => {
    p.classList.remove('bg-zblue', 'text-black', 'border-zblue', 'shadow-md');
    p.classList.add('bg-slate-100', 'dark:bg-white/[0.04]', 'text-slate-600', 'dark:text-gray-400', 'border-slate-200', 'dark:border-white/10');
  });

  if (btn) {
    btn.classList.add('bg-zblue', 'text-black', 'border-zblue', 'shadow-md');
    btn.classList.remove('bg-slate-100', 'dark:bg-white/[0.04]', 'text-slate-600', 'dark:text-gray-400', 'border-slate-200', 'dark:border-white/10');
  }

  renderHabits();
};

window.setStatusFilter = function (status, btn) {
  playSynthSound('click');
  ZYRON.activeStatus = status;

  document.querySelectorAll('[data-status-pill]').forEach((p) => {
    p.classList.remove('bg-white', 'dark:bg-white/20', 'text-slate-900', 'dark:text-white', 'shadow-sm');
    p.classList.add('text-slate-500', 'dark:text-gray-400');
  });

  if (btn) {
    btn.classList.add('bg-white', 'dark:bg-white/20', 'text-slate-900', 'dark:text-white', 'shadow-sm');
    btn.classList.remove('text-slate-500', 'dark:text-gray-400');
  }

  renderHabits();
};

// ==========================================
// 7. DASHBOARD TELEMETRY & SCORE ENGINE
// ==========================================
function calculateEngine() {
  const container = document.getElementById('habits-container');
  if (!container) return;

  const total = ZYRON.habits.length;
  let score = 0;

  if (total > 0) {
    const completed = ZYRON.habits.filter((h) => h.completed).length;
    score = Math.round((completed / total) * 100);
  }

  const scoreText = document.getElementById('daily-score-text');
  if (scoreText) scoreText.innerText = score;

  const ring = document.getElementById('score-ring');
  if (ring) {
    const circumference = 283;
    const offset = circumference - circumference * (score / 100);
    ring.style.strokeDashoffset = offset;
  }

  updateSubCategory('Fitness', 'fitness-bar', 'fitness-pct');
  updateSubCategory('Work', 'focus-bar', 'focus-pct');
  updateSubCategory('Learning', 'learning-bar', 'learning-pct');
  updateSubCategory('Mindset', 'mindset-bar', 'mindset-pct');

  updateLevelTelemetry();
  updateAIMessage(score, total);
}

function updateLevelTelemetry() {
  const user = ZYRON.currentUser;
  const levelEl = document.getElementById('telemetry-level');
  const xpEl = document.getElementById('telemetry-xp-needed');
  const barEl = document.getElementById('telemetry-level-bar');

  if (!user) {
    if (levelEl) levelEl.innerText = '1';
    if (xpEl) xpEl.innerHTML = `200 <span class="text-xs text-slate-400 dark:text-gray-500">XP</span>`;
    if (barEl) barEl.style.width = '0%';
    return;
  }

  const level = user.level || 1;
  const xpNeeded = level * 200;
  const currentXpInLevel = (user.xp || 0) % xpNeeded;
  const xpRemaining = Math.max(0, xpNeeded - currentXpInLevel);
  const pct = Math.min(100, Math.round((currentXpInLevel / xpNeeded) * 100));

  if (levelEl) levelEl.innerText = level;
  if (xpEl) xpEl.innerHTML = `${xpRemaining} <span class="text-xs text-slate-400 dark:text-gray-500">XP</span>`;
  if (barEl) barEl.style.width = `${pct}%`;
}

function updateSubCategory(category, barId, textId) {
  const catHabits = ZYRON.habits.filter((h) => h.category === category);
  const textEl = document.getElementById(textId);
  const barEl = document.getElementById(barId);

  if (catHabits.length === 0) {
    if (textEl) textEl.innerText = '0%';
    if (barEl) barEl.style.width = '0%';
    return;
  }

  const catCompleted = catHabits.filter((h) => h.completed).length;
  const pct = Math.round((catCompleted / catHabits.length) * 100);

  if (textEl) textEl.innerText = `${pct}%`;
  if (barEl) barEl.style.width = `${pct}%`;
}

function updateAIMessage(score, totalHabits) {
  const msgEl = document.getElementById('ai-message');
  if (!msgEl) return;

  msgEl.classList.remove('text-zblue', 'text-zgreen');
  msgEl.classList.add('text-slate-700', 'dark:text-gray-200');

  if (totalHabits === 0) {
    msgEl.innerText = '"Your execution protocol is empty. Initialize your daily missions to begin."';
  } else if (score === 0) {
    msgEl.innerText = '"Zero execution recorded today. Action precedes motivation. Choose your first mission."';
  } else if (score < 40) {
    msgEl.innerText = '"Initial friction broken. Maintain forward velocity and eliminate all secondary distractions."';
  } else if (score < 80) {
    msgEl.innerText = '"Strong operational momentum. Push through the resistance to achieve a 100% execution score."';
  } else if (score < 100) {
    msgEl.innerText = '"Almost at target threshold. Elite performers finish what they start. Close out the remaining tasks."';
  } else {
    msgEl.innerText = '"Flawless execution cycle verified. 100% daily discipline achieved. Recover and prepare for tomorrow."';
    msgEl.classList.replace('text-slate-700', 'text-zblue');
    msgEl.classList.replace('dark:text-gray-200', 'text-zblue');
  }
}

// ==========================================
// 8. MODAL ENGINE
// ==========================================
window.openModal = function () {
  playSynthSound('click');
  const modal = document.getElementById('add-habit-modal');
  const content = document.getElementById('add-habit-content');
  if (!modal) return;

  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    if (content) content.classList.remove('scale-95');
  }, 10);
};

window.closeModal = function () {
  playSynthSound('click');
  const modal = document.getElementById('add-habit-modal');
  const content = document.getElementById('add-habit-content');
  const form = document.getElementById('add-habit-form');

  if (!modal) return;

  modal.classList.add('opacity-0');
  if (content) content.classList.add('scale-95');

  setTimeout(() => {
    modal.classList.add('hidden');
    if (form) form.reset();
  }, 300);
};

function setupHabitForm() {
  const addHabitForm = document.getElementById('add-habit-form');
  if (!addHabitForm) return;

  addHabitForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('habit-title').value.trim();
    const category = document.getElementById('habit-category').value;
    const difficulty = document.getElementById('habit-difficulty').value;

    if (!title) {
      showToast('Please enter a valid mission title', 'warning', '⚠️');
      return;
    }

    let xp = 10;
    if (difficulty === 'Medium') xp = 20;
    if (difficulty === 'Hard') xp = 30;

    const newHabit = {
      id: Date.now(),
      title,
      category,
      difficulty,
      xp,
      completed: false,
    };

    ZYRON.habits.unshift(newHabit);
    saveHabits();
    renderHabits();
    calculateEngine();
    closeModal();
    playSynthSound('complete');
    showToast(`Mission initialized: ${title}`, 'success', '🚀');
  });
}

// ==========================================
// 9. AUTH PAGE LOGIC (Register-Login.html)
// ==========================================
function setupAuthPage() {
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const sessionPreview = document.getElementById('active-session-box');

  if (sessionPreview && ZYRON.currentUser) {
    sessionPreview.classList.remove('hidden');
    const nameEl = document.getElementById('active-user-name');
    const emailEl = document.getElementById('active-user-email');
    if (nameEl) nameEl.innerText = ZYRON.currentUser.name;
    if (emailEl) emailEl.innerText = ZYRON.currentUser.email || 'user@zyron.os';
  }

  if (formLogin) {
    formLogin.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim().toLowerCase();
      const password = document.getElementById('login-password').value;

      const accounts = getStoredAccounts();
      const found = accounts.find((a) => a.email.toLowerCase() === email);

      if (!found) {
        showToast('Account not found with this email. Please register.', 'error', '❌');
        return;
      }

      if (found.password !== password) {
        showToast('Incorrect password entered. Try again.', 'error', '🔒');
        return;
      }

      playSynthSound('complete');
      saveUserSession(found);
      showToast(`Welcome back, ${found.name}!`, 'success', '🚀');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 600);
    });
  }

  if (formRegister) {
    formRegister.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim().toLowerCase();
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm-password')
        ? document.getElementById('reg-confirm-password').value
        : password;

      if (!name || !email || !password) {
        showToast('Please fill out all required fields.', 'warning', '⚠️');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters.', 'warning', '🔒');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error', '❌');
        return;
      }

      const accounts = getStoredAccounts();
      const exists = accounts.find((a) => a.email.toLowerCase() === email);
      if (exists) {
        showToast('An account with this email already exists.', 'warning', '⚠️');
        return;
      }

      const newUser = {
        name,
        email,
        password,
        level: 1,
        xp: 0,
        streak: 1,
      };

      accounts.push(newUser);
      saveStoredAccounts(accounts);
      saveUserSession(newUser);
      localStorage.setItem(`zyron_habits_${email}`, JSON.stringify(DEFAULT_HABITS));

      playSynthSound('levelup');
      showToast(`Account created! Welcome to Zyron, ${name}.`, 'success', '🎉');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 700);
    });
  }
}

window.toggleAuth = function (type) {
  playSynthSound('click');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');

  if (!formLogin || !formRegister) return;

  if (type === 'login') {
    formRegister.classList.add('hidden', 'opacity-0');
    formRegister.classList.remove('block', 'opacity-100');
    formLogin.classList.remove('hidden');
    setTimeout(() => {
      formLogin.classList.remove('opacity-0');
      formLogin.classList.add('block', 'opacity-100');
    }, 10);

    if (btnLogin) {
      btnLogin.className = 'text-slate-900 dark:text-white font-extrabold text-base sm:text-lg border-b-2 border-zblue pb-1 transition-all tracking-wide';
    }
    if (btnRegister) {
      btnRegister.className = 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 font-extrabold text-base sm:text-lg border-b-2 border-transparent pb-1 transition-all tracking-wide';
    }
  } else {
    formLogin.classList.add('hidden', 'opacity-0');
    formLogin.classList.remove('block', 'opacity-100');
    formRegister.classList.remove('hidden');
    setTimeout(() => {
      formRegister.classList.remove('opacity-0');
      formRegister.classList.add('block', 'opacity-100');
    }, 10);

    if (btnRegister) {
      btnRegister.className = 'text-slate-900 dark:text-white font-extrabold text-base sm:text-lg border-b-2 border-zpurple pb-1 transition-all tracking-wide';
    }
    if (btnLogin) {
      btnLogin.className = 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 font-extrabold text-base sm:text-lg border-b-2 border-transparent pb-1 transition-all tracking-wide';
    }
  }
};

window.togglePasswordVisibility = function (inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  playSynthSound('click');

  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
  } else {
    input.type = 'password';
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  }
};

// ==========================================
// 10. MASTER INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSession();
  updateNavbar();

  if (document.getElementById('habits-container')) {
    loadHabits();
    renderHabits();
    calculateEngine();
    setupHabitForm();
  }

  if (document.getElementById('form-login') || document.getElementById('form-register')) {
    setupAuthPage();
  }
});