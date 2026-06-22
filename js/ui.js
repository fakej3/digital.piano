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
      position:fixed; pointer-events:none; font-weight:800; font-size:1.05rem;
      color:var(--accent); text-shadow:0 0 14px var(--accent-glow);
      z-index:99998; opacity:1; will-change:transform,opacity;
      transition:transform 0.9s cubic-bezier(0.22,1,0.36,1), opacity 0.9s ease;
      padding:4px 10px; background:rgba(11,11,22,0.75);
      border:1px solid rgba(74,222,128,0.35); border-radius:20px;
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
    el.style.transform = 'translateX(-50%)';
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = 'translateX(-50%) translateY(-64px)';
        el.style.opacity = '0';
      });
    });

    setTimeout(() => el.remove(), 1100);
  }

  /* ===== LEVEL UP ===== */
  function showLevelUp(level) {
    const overlay = document.createElement('div');
    overlay.className = 'level-up-overlay';
    overlay.style.cssText = `
      position:fixed; inset:0; display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      background:rgba(11,11,22,0.88); z-index:99999; cursor:pointer;
    `;

    const content = document.createElement('div');
    content.className = 'level-up-content';
    content.style.cssText = `
      display:flex; flex-direction:column; align-items:center; gap:14px;
      padding:40px 52px; background:var(--surface2);
      border:1px solid var(--primary); border-radius:var(--radius-xl);
      box-shadow:0 0 60px var(--primary-glow), 0 20px 60px rgba(0,0,0,0.6);
    `;
    content.innerHTML = `
      <div style="font-size:3.5rem;line-height:1;animation:starBurst 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both">🌟</div>
      <div style="font-size:1.6rem;font-weight:800;background:linear-gradient(135deg,var(--primary-lt),var(--secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.02em;">Level Up!</div>
      <div style="font-size:1.1rem;color:var(--text-muted)">You reached <strong style="color:var(--primary-lt)">Level ${level}</strong></div>
      <div style="font-size:0.78rem;color:var(--text-dim);margin-top:2px">Tap to continue</div>
    `;

    const dismiss = () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.25s ease';
      setTimeout(() => overlay.remove(), 260);
    };
    overlay.addEventListener('click', dismiss);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    const pill = document.getElementById('xpPill');
    if (pill) {
      pill.classList.add('leveled-up');
      setTimeout(() => pill.classList.remove('leveled-up'), 800);
    }

    setTimeout(dismiss, 3800);
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
      position:fixed; bottom:88px; left:50%; transform:translateX(-50%);
      background:rgba(20,20,36,0.96); border:1px solid rgba(251,191,36,0.5);
      border-left:3px solid var(--warning);
      border-radius:var(--radius-lg); padding:14px 22px;
      display:flex; align-items:center; gap:14px;
      animation:achieveSlideIn 0.45s cubic-bezier(0.22,1,0.36,1) both;
      z-index:9998; box-shadow:0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(251,191,36,0.1);
      backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
      max-width:340px;
    `;
    el.innerHTML = `
      <span style="font-size:2.2rem;animation:achieveIcon 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both">${icon}</span>
      <div>
        <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--warning);margin-bottom:2px">Achievement Unlocked!</div>
        <div style="font-size:1rem;font-weight:700;color:var(--text)">${name}</div>
      </div>
    `;
    document.body.appendChild(el);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes achieveSlideIn { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
      @keyframes achieveIcon { from { transform:scale(0.4) rotate(-20deg); } to { transform:scale(1) rotate(0); } }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(8px)';
      setTimeout(() => { el.remove(); style.remove(); }, 420);
    }, 3400);
  }

  /* ===== WAVEFORM VISUALIZER ===== */
  function createWaveformViz(canvas, color = '#7c5fe6', bgColor = 'rgba(11,11,22,0.5)') {
    if (!canvas) return null;
    let rafId = null;
    let active = false;

    function draw() {
      if (!active) return;
      if (!audioEngine.analyser || !audioEngine.ctx) { rafId = requestAnimationFrame(draw); return; }

      const dpr  = window.devicePixelRatio || 1;
      const w    = canvas.offsetWidth;
      const h    = canvas.offsetHeight;
      if (w === 0 || h === 0) { rafId = requestAnimationFrame(draw); return; }

      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width  = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }

      const ctx  = canvas.getContext('2d');
      const buf  = new Float32Array(audioEngine.analyser.fftSize);
      audioEngine.analyser.getFloatTimeDomainData(buf);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Centre line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Waveform
      const step  = Math.ceil(buf.length / canvas.width);
      const hHalf = canvas.height / 2;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5 * dpr;
      ctx.lineJoin = 'round';

      for (let i = 0; i < canvas.width; i++) {
        const idx = i * step;
        const v   = buf[idx] || 0;
        const y   = hHalf + v * hHalf * 1.1;
        i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Glow layer (lighter duplicate)
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 4 * dpr;
      ctx.stroke();
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(draw);
    }

    return {
      start() { active = true; draw(); },
      stop()  { active = false; cancelAnimationFrame(rafId); rafId = null;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height); }
    };
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
    createWaveformViz,
    formatTime, createElement, clamp, debounce, throttle,
    initNavToggle
  };
})();
