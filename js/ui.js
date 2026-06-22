/* ===================================================
   InstrumentVerse — ui.js
   UI utilities: toast, ripple, XP display, modals
   =================================================== */

const UI = (() => {
  let toastTimer = null;

  /* ===== TOAST ===== */
  function toast(msg, type = 'info', duration = 2800) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = `toast toast-${type} show`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('show');
    }, duration);
  }

  /* ===== XP FLOAT ===== */
  function floatXP(amount, sourceEl) {
    const el = document.createElement('div');
    el.textContent = '+' + amount + ' XP';
    el.style.cssText = `
      position:fixed; pointer-events:none; font-weight:800; font-size:1.1rem;
      color:var(--accent); text-shadow:0 0 12px var(--accent-glow);
      z-index:99998; transition:all 1s ease; opacity:1;
    `;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (sourceEl) {
      const r = sourceEl.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top;
    }

    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = 'translateY(-60px) translateX(-50%)';
        el.style.opacity = '0';
      });
    });

    setTimeout(() => el.remove(), 1200);
  }

  /* ===== LEVEL UP ===== */
  function showLevelUp(level) {
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="font-size:3rem">🎉</div>
      <div style="font-size:1.5rem;font-weight:800;color:var(--primary-lt)">Level Up!</div>
      <div style="font-size:1.1rem;color:var(--text-muted)">You reached Level ${level}</div>
    `;
    el.style.cssText = `
      position:fixed; inset:0; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:12px;
      background:rgba(11,11,22,0.85); backdrop-filter:blur(8px);
      z-index:99999; animation:bounceIn 0.5s ease both;
      cursor:pointer;
    `;
    el.addEventListener('click', () => el.remove());
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  /* ===== RIPPLE ===== */
  function addRipple(el) {
    el.addEventListener('pointerdown', e => {
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
      `;
      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  }

  /* ===== UPDATE XP DISPLAY ===== */
  function updateXPDisplay() {
    const info = Storage.xpProgress();
    const levelEl = document.getElementById('navLevel');
    const fillEl  = document.getElementById('navXpFill');
    if (levelEl) levelEl.textContent = 'Lv.' + info.level;
    if (fillEl)  fillEl.style.width  = info.pct + '%';
  }

  /* ===== ACHIEVEMENT TOAST ===== */
  function showAchievement(name, icon) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
      background:var(--surface3); border:1px solid var(--warning);
      border-radius:var(--radius-lg); padding:16px 24px;
      display:flex; align-items:center; gap:12px;
      animation:bounceIn 0.5s ease both;
      z-index:9998; box-shadow:0 8px 32px rgba(0,0,0,0.5);
    `;
    el.innerHTML = `
      <span style="font-size:2rem">${icon}</span>
      <div>
        <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--warning)">Achievement Unlocked!</div>
        <div style="font-size:1rem;font-weight:700">${name}</div>
      </div>
    `;
    document.body.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, 3500);
  }

  /* ===== HELPERS ===== */
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2,'0')}`;
  }

  function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v);
    });
    children.forEach(c => { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  function throttle(fn, ms) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= ms) { last = now; fn(...args); }
    };
  }

  /* ===== NAV TOGGLE ===== */
  function initNavToggle() {
    const btn   = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!btn || !links) return;
    btn.addEventListener('click', () => links.classList.toggle('open'));
  }

  return {
    toast, floatXP, showLevelUp, addRipple,
    updateXPDisplay, showAchievement,
    formatTime, createElement, clamp, debounce, throttle,
    initNavToggle
  };
})();
