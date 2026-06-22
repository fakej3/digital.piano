/* ===================================================
   InstrumentVerse — tuner.js
   Chromatic tuner using Web Audio API pitch detection (FFT)
   =================================================== */

const Tuner = (() => {
  const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const A4 = 440;

  let audioCtx   = null;
  let analyser   = null;
  let micStream  = null;
  let rafId      = null;
  let listening  = false;
  let refFreq    = 440;
  let initialized = false;

  function freqToNote(freq) {
    const semitones = 12 * Math.log2(freq / A4);
    const midi      = Math.round(semitones) + 69;
    const cents     = Math.round((semitones - (midi - 69)) * 100);
    const octave    = Math.floor(midi / 12) - 1;
    const name      = NOTE_NAMES[((midi % 12) + 12) % 12];
    return { name, octave, cents, freq, midi };
  }

  function detectPitch(buf, sampleRate) {
    // Autocorrelation pitch detection
    const n = buf.length;
    const corr = new Float32Array(n);
    let maxCorr = 0;
    let maxLag  = -1;

    for (let lag = 0; lag < n / 2; lag++) {
      let c = 0;
      for (let i = 0; i < n / 2; i++) {
        c += buf[i] * buf[i + lag];
      }
      corr[lag] = c;
    }

    // Find first peak after initial dip
    let i = 1;
    while (i < n / 2 && corr[i] > corr[i-1]) i++;
    while (i < n / 2 && corr[i] < corr[i-1]) i++;

    for (let j = i; j < n / 2; j++) {
      if (corr[j] > maxCorr) { maxCorr = corr[j]; maxLag = j; }
    }

    if (maxLag < 2 || maxCorr < 0.01) return null;

    // Parabolic interpolation for sub-sample accuracy
    const a = corr[maxLag-1], b = corr[maxLag], c2 = corr[maxLag+1];
    const offset = (a - c2) / (2 * (a - 2*b + c2 + 1e-10));
    const period = maxLag + offset;
    return sampleRate / period;
  }

  async function startListening() {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
      analyser  = audioCtx.createAnalyser();
      analyser.fftSize   = 4096;
      analyser.smoothingTimeConstant = 0.6;

      const src = audioCtx.createMediaStreamSource(micStream);
      src.connect(analyser);
      listening = true;

      updateBtn(true);
      loop();
    } catch(e) {
      UI.toast('Microphone access denied', 'error');
      updateBtn(false);
    }
  }

  function stopListening() {
    listening = false;
    cancelAnimationFrame(rafId);
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
    if (audioCtx)  { audioCtx.close(); audioCtx = null; }
    analyser = null;
    updateBtn(false);
    setDisplay(null);
  }

  function loop() {
    if (!listening || !analyser) return;

    const buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);

    // RMS for silence detection
    let rms = 0;
    for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / buf.length);

    if (rms > 0.003) {
      const freq = detectPitch(buf, audioCtx.sampleRate);
      if (freq && freq > 50 && freq < 4000) {
        const noteInfo = freqToNote(freq);
        setDisplay(noteInfo);
      }
    }

    rafId = requestAnimationFrame(loop);
  }

  function setDisplay(info) {
    const noteEl  = document.getElementById('tunerNote');
    const freqEl  = document.getElementById('tunerFreq');
    const centsEl = document.getElementById('tunerCents');
    const needle  = document.getElementById('tunerNeedle');

    if (!info) {
      if (noteEl)  noteEl.textContent  = '—';
      if (freqEl)  freqEl.textContent  = '—';
      if (centsEl) { centsEl.textContent = ''; centsEl.className = 'tuner-cents'; }
      if (needle)  needle.style.left   = '50%';
      return;
    }

    const { name, octave, cents, freq } = info;

    if (noteEl)  noteEl.textContent  = name + octave;
    if (freqEl)  freqEl.textContent  = freq.toFixed(1) + ' Hz';

    const absCents = Math.abs(cents);
    if (centsEl) {
      if (absCents <= 5) {
        centsEl.textContent  = '♦ In Tune';
        centsEl.className    = 'tuner-cents in-tune';
      } else if (cents > 0) {
        centsEl.textContent  = '+' + cents + '¢ Sharp';
        centsEl.className    = 'tuner-cents sharp';
      } else {
        centsEl.textContent  = cents + '¢ Flat';
        centsEl.className    = 'tuner-cents flat';
      }
    }

    // Needle: 50% = in tune, <50% = flat, >50% = sharp
    if (needle) {
      const pos = 50 + UI.clamp(cents, -50, 50);
      needle.style.left = pos + '%';
    }
  }

  function updateBtn(active) {
    const btn = document.getElementById('tunerToggleBtn');
    if (!btn) return;
    btn.textContent = active ? '⏹ Stop Tuner' : '🎤 Start Tuner';
    btn.className = active ? 'btn btn-danger' : 'btn btn-primary';
  }

  function build() {
    const wrap = document.getElementById('tunerWrap');
    if (!wrap || wrap.children.length > 0) return;

    wrap.innerHTML = `
      <div class="tuner-inner">
        <div class="tuner-display">
          <div class="tuner-note" id="tunerNote">—</div>
          <div class="tuner-freq" id="tunerFreq">—</div>
        </div>
        <div class="tuner-meter">
          <div class="tuner-needle" id="tunerNeedle"></div>
        </div>
        <div class="tuner-cents" id="tunerCents"></div>
        <div class="tuner-ref">
          <span>A4 =</span>
          <input type="number" id="tunerRefFreq" value="440" min="400" max="480" step="1"
            style="width:60px;background:var(--surface2);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:3px 6px;font-size:0.85rem;">
          <span>Hz</span>
        </div>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">
          <button class="btn btn-primary" id="tunerToggleBtn">🎤 Start Tuner</button>
        </div>
        <div style="margin-top:12px;font-size:0.78rem;color:var(--text-muted);text-align:center;">
          Requires microphone permission. Plug in your instrument for best results.
        </div>
      </div>
    `;

    document.getElementById('tunerToggleBtn').addEventListener('click', () => {
      listening ? stopListening() : startListening();
    });

    document.getElementById('tunerRefFreq').addEventListener('change', e => {
      refFreq = parseFloat(e.target.value) || 440;
    });
  }

  function init() {
    if (initialized) return;
    initialized = true;
    build();
  }

  function destroy() {
    if (listening) stopListening();
    initialized = false;
  }

  return { init, destroy };
})();
