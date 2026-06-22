/* ===================================================
   InstrumentVerse — metronome.js
   Visual + audio metronome with tap tempo
   =================================================== */

const Metronome = (() => {
  let bpm         = 120;
  let beatsPerBar = 4;
  let playing     = false;
  let currentBeat = 0;
  let intervalId  = null;
  let tapTimes    = [];
  let initialized = false;
  let animFrame   = null;
  let pendulumPos = -30;
  let pendulumDir = 1;
  let lastTickTime = 0;

  function clickSound(accent = false) {
    const ctx = audioEngine.ctx;
    if (!ctx) return;
    const t = audioEngine.now;

    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = accent ? 1800 : 1200;
    g.gain.setValueAtTime(accent ? 0.4 : 0.25, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    o.connect(g); g.connect(audioEngine.masterGain);
    o.start(t); o.stop(t + 0.04);
  }

  function tick() {
    currentBeat = (currentBeat % beatsPerBar) + 1;
    const accent = currentBeat === 1;

    audioEngine.init().then(() => clickSound(accent));

    // Update beat lights
    document.querySelectorAll('.metro-light').forEach((el, i) => {
      el.classList.remove('active', 'beat-1');
      if (i === currentBeat - 1) {
        el.classList.add('active');
        if (accent) el.classList.add('beat-1');
      }
    });

    lastTickTime = Date.now();
    pendulumDir = (currentBeat % 2 === 1) ? 1 : -1;
    animatePendulum();
  }

  function animatePendulum() {
    cancelAnimationFrame(animFrame);
    const target = pendulumDir * 30;
    const duration = (60 / bpm) * 1000;

    const startPos  = pendulumPos;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
      pendulumPos = startPos + (target - startPos) * eased;

      const pend = document.querySelector('.metro-pendulum');
      if (pend) pend.style.transform = `rotate(${pendulumPos}deg)`;

      if (t < 1) animFrame = requestAnimationFrame(step);
    }
    animFrame = requestAnimationFrame(step);
  }

  function start() {
    if (playing) return;
    playing = true;
    currentBeat = 0;
    tick();
    intervalId = setInterval(tick, (60 / bpm) * 1000);
    const btn = document.getElementById('metroStartBtn');
    if (btn) btn.textContent = '⏹ Stop';
  }

  function stop() {
    if (!playing) return;
    playing = false;
    clearInterval(intervalId);
    cancelAnimationFrame(animFrame);
    currentBeat = 0;
    document.querySelectorAll('.metro-light').forEach(el => el.classList.remove('active','beat-1'));
    const pend = document.querySelector('.metro-pendulum');
    if (pend) pend.style.transform = 'rotate(0deg)';
    const btn = document.getElementById('metroStartBtn');
    if (btn) btn.textContent = '▶ Start';
  }

  function setBPM(v) {
    bpm = Math.max(20, Math.min(300, v));
    const disp = document.getElementById('metroBpmDisplay');
    const slid = document.getElementById('metroBpmSlider');
    if (disp) disp.textContent = bpm;
    if (slid) slid.value = bpm;
    if (playing) { clearInterval(intervalId); intervalId = setInterval(tick, (60/bpm)*1000); }
  }

  function tap() {
    const now = Date.now();
    tapTimes.push(now);
    if (tapTimes.length > 6) tapTimes.shift();
    if (tapTimes.length < 2) return;

    const diffs = [];
    for (let i = 1; i < tapTimes.length; i++) diffs.push(tapTimes[i] - tapTimes[i-1]);
    const avg = diffs.reduce((a,b) => a+b, 0) / diffs.length;
    setBPM(Math.round(60000 / avg));
  }

  function build() {
    const wrap = document.getElementById('metronomeWrap');
    if (!wrap || wrap.children.length > 0) return;

    wrap.innerHTML = `
      <div class="metronome-inner">
        <div class="metro-display">
          <div class="metro-pendulum" style="transform:rotate(0deg)"></div>
          <div class="metro-beat-lights" id="metroBeatLights"></div>
          <div class="metro-bpm-display" id="metroBpmDisplay">${bpm}</div>
          <div class="metro-bpm-unit">BPM</div>
        </div>
        <div class="metro-controls">
          <input type="range" id="metroBpmSlider" class="metro-slider" min="20" max="300" value="${bpm}">
          <div class="metro-row">
            <span style="font-size:0.8rem;color:var(--text-muted)">Time Sig:</span>
            ${[2,3,4,6,8].map(b => `<button class="metro-time-btn${b===4?' active':''}" data-beats="${b}">${b}/4</button>`).join('')}
          </div>
          <div class="metro-row">
            <button class="btn btn-primary" id="metroStartBtn">▶ Start</button>
            <button class="metro-tap-btn" id="metroTapBtn">Tap Tempo</button>
          </div>
        </div>
      </div>
    `;

    // Build beat lights
    const lights = document.getElementById('metroBeatLights');
    for (let i = 0; i < beatsPerBar; i++) {
      const dot = document.createElement('div');
      dot.className = 'metro-light';
      lights.appendChild(dot);
    }

    // Events
    document.getElementById('metroBpmSlider').addEventListener('input', e => setBPM(parseInt(e.target.value)));
    document.getElementById('metroStartBtn').addEventListener('click', () => playing ? stop() : start());
    document.getElementById('metroTapBtn').addEventListener('click', tap);

    wrap.querySelectorAll('.metro-time-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        beatsPerBar = parseInt(btn.dataset.beats);
        wrap.querySelectorAll('.metro-time-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const lights = document.getElementById('metroBeatLights');
        if (lights) {
          lights.innerHTML = '';
          for (let i = 0; i < beatsPerBar; i++) {
            const dot = document.createElement('div');
            dot.className = 'metro-light';
            lights.appendChild(dot);
          }
        }
        if (playing) { stop(); start(); }
      });
    });
  }

  function init() {
    if (initialized) return;
    initialized = true;
    build();
  }

  function destroy() {
    stop();
    initialized = false;
  }

  return { init, destroy };
})();
