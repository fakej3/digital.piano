/* ============================================================
   KeyWave Piano App — app.js
   Audio: Web Audio API (synthesized piano tones)
   Features: Keyboard input, polyphony, sustain, recorder,
             metronome, dark/light mode, volume, labels
   ============================================================ */

'use strict';

// ── Audio Context (lazy-init on first user gesture) ──────────
let audioCtx = null;
let masterGain = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.75;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// ── Note frequency table (A4 = 440 Hz) ──────────────────────
function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ── Piano key layout definition ─────────────────────────────
// Each entry: { note, octave, isBlack, kbdKey }
// We build 2+ octaves starting at C3
const KEY_LAYOUT = [];

// Computer keyboard mapping for TWO octaves
// First octave (C3–B3): A S D F G H J  /  W E  T Y U
// Second octave (C4–B4): Z X C V B N M  /  Q R  O
const KB_MAP_OCT1 = {
  'a':'C', 'w':'C#', 's':'D', 'e':'D#', 'd':'E',
  'f':'F', 't':'F#', 'g':'G', 'y':'G#', 'h':'A',
  'u':'A#', 'j':'B'
};
const KB_MAP_OCT2 = {
  'z':'C', 'q':'C#', 'x':'D', 'r':'D#', 'c':'E',
  'v':'F', 'o':'F#', 'b':'G', 'p':'G#', 'n':'A',
  'l':'A#', 'm':'B'
};

// Note order within an octave
const NOTES_IN_OCT = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const BLACK_NOTES  = new Set(['C#','D#','F#','G#','A#']);

// Build layout: 3 octaves (C3 to B5) for a wider range
const START_OCTAVE = 3;
const NUM_OCTAVES  = 3;

// Build a reverse map: "note+octave" -> kbdKey
const noteToKey = {};
for (const [k, n] of Object.entries(KB_MAP_OCT1)) noteToKey[`${n}${START_OCTAVE}`] = k;
for (const [k, n] of Object.entries(KB_MAP_OCT2)) noteToKey[`${n}${START_OCTAVE + 1}`] = k;

for (let oct = START_OCTAVE; oct < START_OCTAVE + NUM_OCTAVES; oct++) {
  for (const note of NOTES_IN_OCT) {
    const id = `${note}${oct}`;
    KEY_LAYOUT.push({
      id,
      note,
      octave: oct,
      isBlack: BLACK_NOTES.has(note),
      midi: 12 * (oct + 1) + NOTES_IN_OCT.indexOf(note),
      kbdKey: noteToKey[id] || null
    });
  }
}

// ── State ───────────────────────────────────────────────────
let sustainOn    = false;
let labelsOn     = true;
let activeNodes  = {};   // id -> { osc, gain, env }
let sustainedIds = new Set();
const pressedKeys = new Set();   // currently held keyboard keys

// ── Recording state ─────────────────────────────────────────
let isRecording   = false;
let recordStart   = 0;
let recordEvents  = [];   // { type, id, time }
let playbackTimer = null;

// ── Metronome state ─────────────────────────────────────────
let metroRunning  = false;
let metroBPM      = 120;
let metroBeat     = 0;
let metroTotal    = 4;
let metroInterval = null;

// ── DOM refs ────────────────────────────────────────────────
const pianoContainer = document.getElementById('pianoContainer');
const noteDisplay    = document.getElementById('noteDisplay');
const volumeSlider   = document.getElementById('volumeSlider');
const volumeVal      = document.getElementById('volumeVal');
const sustainBtn     = document.getElementById('sustainBtn');
const labelsBtn      = document.getElementById('labelsBtn');
const themeToggle    = document.getElementById('themeToggle');
const recordBtn      = document.getElementById('recordBtn');
const playBtn        = document.getElementById('playBtn');
const clearBtn       = document.getElementById('clearBtn');
const recordStatus   = document.getElementById('recordingStatus');
const recordLength   = document.getElementById('recordingLength');
const bpmSlider      = document.getElementById('bpmSlider');
const bpmDisplay     = document.getElementById('metroBPMDisplay');
const metroToggle    = document.getElementById('metroToggle');
const metroLight     = document.getElementById('metronomeLight');
const beatSelect     = document.getElementById('beatSelect');

// ── Build Piano Keys ────────────────────────────────────────
function buildKeyboard() {
  pianoContainer.innerHTML = '';

  // ── Strategy:
  //  1. Create an inner flex container for white keys only.
  //  2. Absolutely position black keys on top, offset from the left
  //     edge of the inner container using pre-calculated white-key widths.

  const WHITE_W = 52; // must match CSS .piano-key.white width
  const BLACK_W = 32; // must match CSS .piano-key.black width
  const GAP     = 1;  // 1px gap between white keys (border)

  // Build arrays of white and black key definitions in order
  const whiteKeys = KEY_LAYOUT.filter(k => !k.isBlack);
  const blackKeys = KEY_LAYOUT.filter(k => k.isBlack);

  // Map note-id -> white key sequential index
  const whiteIdxMap = {};
  whiteKeys.forEach((k, i) => { whiteIdxMap[k.id] = i; });

  // For each black key, find the white key immediately to its LEFT
  // in the chromatic sequence, then offset accordingly.
  // The black key sits ~(WHITE_W - BLACK_W/2 - 1)px from that white key's left edge.
  const BLACK_OFFSET_FROM_LEFT = WHITE_W - BLACK_W / 2; // centers black key on the gap

  // Compute absolute left position of each white key
  function whiteLeft(wIdx) {
    return wIdx * (WHITE_W + GAP);
  }

  // For each black key, find the index of the preceding white key
  function blackLeft(blackKeyDef) {
    // Find the position of this note in KEY_LAYOUT
    const pos = KEY_LAYOUT.findIndex(k => k.id === blackKeyDef.id);
    // Walk backwards to find the previous white key
    for (let i = pos - 1; i >= 0; i--) {
      if (!KEY_LAYOUT[i].isBlack) {
        const wIdx = whiteIdxMap[KEY_LAYOUT[i].id];
        return whiteLeft(wIdx) + BLACK_OFFSET_FROM_LEFT;
      }
    }
    return 0;
  }

  // Total width of the inner container
  const totalWidth = whiteKeys.length * (WHITE_W + GAP);

  // Wrap all keys in a relative container
  const inner = document.createElement('div');
  inner.style.cssText = `position:relative; width:${totalWidth}px; height:190px; flex-shrink:0;`;
  pianoContainer.appendChild(inner);

  function attachEvents(keyEl, id) {
    keyEl.addEventListener('mousedown',  (e) => { e.preventDefault(); startNote(id); });
    keyEl.addEventListener('mouseenter', (e) => { if (e.buttons === 1) startNote(id); });
    keyEl.addEventListener('mouseup',    () => stopNote(id));
    keyEl.addEventListener('mouseleave', () => stopNote(id));
    keyEl.addEventListener('touchstart', (e) => { e.preventDefault(); startNote(id); }, { passive: false });
    keyEl.addEventListener('touchend',   (e) => { e.preventDefault(); stopNote(id); },  { passive: false });
    keyEl.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startNote(id); } });
    keyEl.addEventListener('keyup',   (e) => { if (e.key === ' ' || e.key === 'Enter') stopNote(id); });
  }

  function makeLabel(keyDef) {
    const label = document.createElement('div');
    label.className = 'key-label';
    if (keyDef.kbdKey) {
      label.innerHTML = `<span class="kbd-key">${keyDef.kbdKey.toUpperCase()}</span><span class="note-name">${keyDef.note}</span>`;
    } else {
      label.innerHTML = `<span class="note-name">${keyDef.note}</span>`;
    }
    return label;
  }

  // 1. Render white keys first (z-index: 1)
  whiteKeys.forEach((keyDef, wIdx) => {
    const keyEl = document.createElement('div');
    keyEl.className  = 'piano-key white';
    keyEl.dataset.id = keyDef.id;
    keyEl.tabIndex   = 0;
    keyEl.setAttribute('role', 'button');
    keyEl.setAttribute('aria-label', `${keyDef.note}${keyDef.octave}`);
    keyEl.style.cssText = `position:absolute; left:${whiteLeft(wIdx)}px; top:0;`;
    keyEl.appendChild(makeLabel(keyDef));
    attachEvents(keyEl, keyDef.id);
    inner.appendChild(keyEl);
  });

  // 2. Render black keys on top (z-index: 2)
  blackKeys.forEach((keyDef) => {
    const keyEl = document.createElement('div');
    keyEl.className  = 'piano-key black';
    keyEl.dataset.id = keyDef.id;
    keyEl.tabIndex   = 0;
    keyEl.setAttribute('role', 'button');
    keyEl.setAttribute('aria-label', `${keyDef.note}${keyDef.octave}`);
    keyEl.style.cssText = `left:${blackLeft(keyDef)}px;`;
    keyEl.appendChild(makeLabel(keyDef));
    attachEvents(keyEl, keyDef.id);
    inner.appendChild(keyEl);
  });
}

// ── Synthesize piano tone ───────────────────────────────────
// Uses a combination of oscillators + detuning + a fast-decay
// to approximate a plucked/struck piano timbre.
function synthPiano(freq) {
  const ctx  = getAudioCtx();
  const now  = ctx.currentTime;

  const gainNode = ctx.createGain();
  gainNode.connect(masterGain);

  // Fundamental
  const osc1 = ctx.createOscillator();
  osc1.type = 'triangle';
  osc1.frequency.value = freq;

  // 2nd harmonic (slightly detuned)
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = freq * 2.001;

  // 3rd harmonic
  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.value = freq * 3.002;

  // Mix harmonics
  const mix1 = ctx.createGain(); mix1.gain.value = 0.6;
  const mix2 = ctx.createGain(); mix2.gain.value = 0.25;
  const mix3 = ctx.createGain(); mix3.gain.value = 0.1;

  osc1.connect(mix1); mix1.connect(gainNode);
  osc2.connect(mix2); mix2.connect(gainNode);
  osc3.connect(mix3); mix3.connect(gainNode);

  // Attack–Decay–Sustain–Release envelope
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.9, now + 0.008);   // fast attack
  gainNode.gain.exponentialRampToValueAtTime(0.35, now + 0.1); // initial decay
  gainNode.gain.exponentialRampToValueAtTime(0.22, now + 0.4); // sustain level

  [osc1, osc2, osc3].forEach(o => o.start(now));

  return { oscs: [osc1, osc2, osc3], gainNode };
}

// ── Note start / stop ────────────────────────────────────────
function startNote(id) {
  if (activeNodes[id]) return;   // already playing
  getAudioCtx();

  const keyDef = KEY_LAYOUT.find(k => k.id === id);
  if (!keyDef) return;

  const freq  = midiToFreq(keyDef.midi);
  const nodes = synthPiano(freq);
  activeNodes[id] = nodes;

  // Visual
  setKeyActive(id, true);
  showNote(keyDef.note + keyDef.octave);

  // Record
  if (isRecording) {
    recordEvents.push({ type: 'start', id, time: Date.now() - recordStart });
  }
}

function stopNote(id, force = false) {
  if (sustainOn && !force) {
    sustainedIds.add(id);
    return;
  }
  const nodes = activeNodes[id];
  if (!nodes) return;

  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  nodes.gainNode.gain.cancelScheduledValues(now);
  nodes.gainNode.gain.setValueAtTime(nodes.gainNode.gain.value, now);
  nodes.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  nodes.oscs.forEach(o => o.stop(now + 0.41));

  delete activeNodes[id];
  sustainedIds.delete(id);
  setKeyActive(id, false);

  // Update display
  const stillPlaying = Object.keys(activeNodes);
  if (stillPlaying.length === 0) {
    noteDisplay.textContent = '—';
  } else {
    const last = KEY_LAYOUT.find(k => k.id === stillPlaying[stillPlaying.length - 1]);
    if (last) showNote(last.note + last.octave);
  }

  // Record
  if (isRecording) {
    recordEvents.push({ type: 'stop', id, time: Date.now() - recordStart });
  }
}

function stopAllNotes(force = false) {
  const ids = Object.keys(activeNodes);
  ids.forEach(id => stopNote(id, force));
  sustainedIds.clear();
}

// ── Key visual state ─────────────────────────────────────────
function setKeyActive(id, active) {
  const el = pianoContainer.querySelector(`[data-id="${id}"]`);
  if (el) el.classList.toggle('active', active);
}

function showNote(noteStr) {
  noteDisplay.textContent = noteStr;
  noteDisplay.style.animation = 'none';
  requestAnimationFrame(() => noteDisplay.style.animation = '');
}

// ── Computer keyboard input ───────────────────────────────────
// Build a reverse map: kbdKey -> note id
const keyToId = {};
for (const keyDef of KEY_LAYOUT) {
  if (keyDef.kbdKey) keyToId[keyDef.kbdKey] = keyDef.id;
}

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  const k = e.key.toLowerCase();

  // Sustain toggle with spacebar
  if (k === ' ') {
    e.preventDefault();
    setSustain(!sustainOn);
    return;
  }

  if (e.repeat) return;
  if (pressedKeys.has(k)) return;
  pressedKeys.add(k);

  const id = keyToId[k];
  if (id) { e.preventDefault(); startNote(id); }
});

document.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  pressedKeys.delete(k);

  const id = keyToId[k];
  if (id) stopNote(id);
});

// ── Volume control ───────────────────────────────────────────
volumeSlider.addEventListener('input', () => {
  const v = parseFloat(volumeSlider.value);
  volumeVal.textContent = Math.round(v * 100) + '%';
  if (masterGain) masterGain.gain.value = v;
});

// ── Sustain ──────────────────────────────────────────────────
function setSustain(val) {
  sustainOn = val;
  sustainBtn.textContent = val ? 'ON' : 'OFF';
  sustainBtn.classList.toggle('active', val);
  sustainBtn.setAttribute('aria-pressed', val);
  if (!val) {
    // Release all sustained notes
    sustainedIds.forEach(id => stopNote(id, true));
    sustainedIds.clear();
  }
}

sustainBtn.addEventListener('click', () => setSustain(!sustainOn));

// ── Key labels toggle ─────────────────────────────────────────
labelsBtn.addEventListener('click', () => {
  labelsOn = !labelsOn;
  labelsBtn.textContent = labelsOn ? 'ON' : 'OFF';
  labelsBtn.classList.toggle('active', labelsOn);
  labelsBtn.setAttribute('aria-pressed', labelsOn);
  pianoContainer.classList.toggle('labels-hidden', !labelsOn);
});

// ── Dark/Light mode ───────────────────────────────────────────
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeToggle.querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';
});

// ── Recorder ────────────────────────────────────────────────
recordBtn.addEventListener('click', () => {
  if (isRecording) {
    // Stop recording
    isRecording = false;
    recordBtn.textContent = '⏺ Record';
    recordBtn.classList.remove('recording');
    recordStatus.textContent = `Recorded ${recordEvents.filter(e => e.type === 'start').length} notes`;
    const dur = ((Date.now() - recordStart) / 1000).toFixed(1);
    recordLength.textContent = `Duration: ${dur}s`;
    if (recordEvents.length > 0) {
      playBtn.disabled = false;
      clearBtn.disabled = false;
    }
  } else {
    // Start recording
    isRecording = true;
    recordStart = Date.now();
    recordEvents = [];
    recordBtn.textContent = '⏹ Stop';
    recordBtn.classList.add('recording');
    recordStatus.textContent = 'Recording…';
    recordLength.textContent = '';
    playBtn.disabled = true;
    clearBtn.disabled = true;
    stopAllNotes(true);
  }
});

playBtn.addEventListener('click', () => {
  if (recordEvents.length === 0) return;
  stopAllNotes(true);
  playBtn.disabled = true;
  recordBtn.disabled = true;
  recordStatus.textContent = '▶ Playing back…';

  // Schedule events relative to now
  const startTime = Date.now();
  const timers = [];

  for (const ev of recordEvents) {
    const delay = ev.time;
    const t = setTimeout(() => {
      if (ev.type === 'start') startNote(ev.id);
      else stopNote(ev.id, true);
    }, delay);
    timers.push(t);
  }

  // Find total duration
  const maxTime = Math.max(...recordEvents.map(e => e.time)) + 600;
  playbackTimer = setTimeout(() => {
    stopAllNotes(true);
    recordStatus.textContent = 'Playback complete';
    playBtn.disabled = false;
    recordBtn.disabled = false;
  }, maxTime);
});

clearBtn.addEventListener('click', () => {
  if (playbackTimer) clearTimeout(playbackTimer);
  stopAllNotes(true);
  recordEvents = [];
  isRecording  = false;
  recordBtn.textContent = '⏺ Record';
  recordBtn.classList.remove('recording');
  recordBtn.disabled = false;
  playBtn.disabled  = true;
  clearBtn.disabled = true;
  recordStatus.textContent = 'Idle';
  recordLength.textContent = '';
});

// ── Metronome ─────────────────────────────────────────────────
bpmSlider.addEventListener('input', () => {
  metroBPM = parseInt(bpmSlider.value);
  bpmDisplay.textContent = metroBPM;
  if (metroRunning) {
    clearInterval(metroInterval);
    startMetronome();
  }
});

beatSelect.addEventListener('change', () => {
  metroTotal = parseInt(beatSelect.value);
  metroBeat  = 0;
});

metroToggle.addEventListener('click', () => {
  if (metroRunning) {
    stopMetronome();
  } else {
    startMetronome();
  }
});

function startMetronome() {
  metroBeat    = 0;
  metroRunning = true;
  metroToggle.textContent = '⏹ Stop';
  metroToggle.classList.add('running');

  const intervalMs = (60 / metroBPM) * 1000;

  function tick() {
    const isDown = metroBeat === 0;
    metroLight.classList.remove('beat', 'downbeat');
    void metroLight.offsetWidth; // force reflow for re-animation
    metroLight.classList.add(isDown ? 'downbeat' : 'beat');

    // Play click sound
    playClick(isDown);

    metroBeat = (metroBeat + 1) % metroTotal;

    // Flash off after short duration
    setTimeout(() => {
      metroLight.classList.remove('beat', 'downbeat');
    }, Math.min(80, intervalMs * 0.4));
  }

  tick();
  metroInterval = setInterval(tick, intervalMs);
}

function stopMetronome() {
  clearInterval(metroInterval);
  metroRunning = false;
  metroBeat    = 0;
  metroToggle.textContent = '▶ Start';
  metroToggle.classList.remove('running');
  metroLight.classList.remove('beat', 'downbeat');
}

function playClick(isDownbeat) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const data = buf.getChannelData(0);

    // Simple noise burst
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = isDownbeat ? 800 : 1400;

    const g = ctx.createGain();
    g.gain.value = isDownbeat ? 0.55 : 0.35;

    src.connect(f); f.connect(g); g.connect(masterGain);
    src.start(now);
  } catch (e) {
    // silently ignore if audio context not ready
  }
}

// ── Init ─────────────────────────────────────────────────────
buildKeyboard();

// Set initial BPM display
bpmDisplay.textContent = metroBPM;
