/* ===================================================
   InstrumentVerse — synth.js
   Full-featured synthesizer: waveforms, filter, ADSR, LFO
   =================================================== */

const Synth = (() => {
  const KEY_MAP = {
    'a':'C','w':'C#','s':'D','e':'D#','d':'E','f':'F',
    't':'F#','g':'G','y':'G#','h':'A','u':'A#','j':'B',
    'k':'C+','o':'C#+','l':'D+','p':'D#+'
  };

  let params = {
    wave: 'sawtooth', filterType: 'lowpass',
    filterFreq: 2000, filterQ: 1,
    attack: 0.05, decay: 0.15, sustain: 0.7, release: 0.3,
    lfoRate: 0, lfoDepth: 0, detune: 0
  };

  let activeNotes  = {};
  let baseOctave   = 4;
  let initialized  = false;
  let waveViz      = null;

  function build() {
    const wrap = document.getElementById('synthWrap');
    if (!wrap || wrap.children.length > 0) return;

    // Control panel
    const panel = document.createElement('div');
    panel.className = 'synth-panel';

    // Oscillator section
    panel.appendChild(createSection('Oscillator', `
      <div class="synth-section-title">Waveform</div>
      <div class="waveform-btns">
        ${['sine','triangle','sawtooth','square'].map(w => `
          <button class="waveform-btn${w === params.wave ? ' active' : ''}" data-wave="${w}">${w}</button>
        `).join('')}
      </div>
      <div class="knob-row" style="margin-top:12px">
        <div class="knob-group">
          <label>Detune</label>
          <input type="range" id="sDetune" min="-100" max="100" value="0" step="1">
          <span class="knob-val" id="sDetuneV">0¢</span>
        </div>
        <div class="knob-group">
          <label>Octave</label>
          <input type="range" id="sOctave" min="2" max="6" value="4" step="1">
          <span class="knob-val" id="sOctaveV">4</span>
        </div>
      </div>
    `));

    // Filter section
    panel.appendChild(createSection('Filter', `
      <div class="synth-section-title">Type</div>
      <div class="waveform-btns">
        ${['lowpass','highpass','bandpass'].map(t => `
          <button class="waveform-btn${t === params.filterType ? ' active' : ''}" data-filter="${t}">${t.replace('pass',' pass')}</button>
        `).join('')}
      </div>
      <div class="knob-row" style="margin-top:12px">
        <div class="knob-group">
          <label>Cutoff</label>
          <input type="range" id="sCutoff" min="50" max="8000" value="2000" step="10">
          <span class="knob-val" id="sCutoffV">2000Hz</span>
        </div>
        <div class="knob-group">
          <label>Resonance</label>
          <input type="range" id="sRes" min="0.1" max="20" value="1" step="0.1">
          <span class="knob-val" id="sResV">1</span>
        </div>
      </div>
    `));

    // ADSR + LFO section
    panel.appendChild(createSection('Envelope & LFO', `
      <div class="synth-section-title">ADSR</div>
      <div class="knob-row">
        <div class="knob-group">
          <label>Attack</label>
          <input type="range" id="sAtk" min="0.001" max="2" value="0.05" step="0.001">
          <span class="knob-val" id="sAtkV">0.05s</span>
        </div>
        <div class="knob-group">
          <label>Decay</label>
          <input type="range" id="sDec" min="0.01" max="2" value="0.15" step="0.01">
          <span class="knob-val" id="sDecV">0.15s</span>
        </div>
        <div class="knob-group">
          <label>Sustain</label>
          <input type="range" id="sSus" min="0" max="1" value="0.7" step="0.01">
          <span class="knob-val" id="sSusV">70%</span>
        </div>
        <div class="knob-group">
          <label>Release</label>
          <input type="range" id="sRel" min="0.01" max="4" value="0.3" step="0.01">
          <span class="knob-val" id="sRelV">0.30s</span>
        </div>
      </div>
      <div class="synth-section-title" style="margin-top:12px">LFO</div>
      <div class="knob-row">
        <div class="knob-group">
          <label>Rate</label>
          <input type="range" id="sLfoRate" min="0" max="20" value="0" step="0.1">
          <span class="knob-val" id="sLfoRateV">Off</span>
        </div>
        <div class="knob-group">
          <label>Depth</label>
          <input type="range" id="sLfoDepth" min="0" max="1" value="0" step="0.01">
          <span class="knob-val" id="sLfoDepthV">0%</span>
        </div>
      </div>
    `));

    wrap.appendChild(panel);

    // Keyboard
    buildKeyboard(wrap);

    // Event listeners for controls
    bindControls(panel);

    // Hint
    const hint = document.createElement('div');
    hint.className = 'key-hint';
    hint.innerHTML = `<span>Keyboard: A S D F G H J (white) · W E T Y U (black) · Z/X shift octave</span>`;
    wrap.appendChild(hint);
  }

  function createSection(title, content) {
    const sec = document.createElement('div');
    sec.className = 'synth-section';
    sec.innerHTML = `<div class="synth-section-title">${title}</div>${content}`;
    return sec;
  }

  function bindControls(panel) {
    // Waveform
    panel.querySelectorAll('[data-wave]').forEach(btn => {
      btn.addEventListener('click', () => {
        params.wave = btn.dataset.wave;
        panel.querySelectorAll('[data-wave]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Filter type
    panel.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        params.filterType = btn.dataset.filter;
        panel.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Object.values(activeNotes).forEach(nd => { if (nd && nd.flt) nd.flt.type = params.filterType; });
      });
    });

    const bind = (id, setter, fmt) => {
      const el = document.getElementById(id);
      const vEl = document.getElementById(id + 'V');
      if (!el) return;
      el.addEventListener('input', () => {
        const v = parseFloat(el.value);
        setter(v);
        if (vEl) vEl.textContent = fmt(v);
      });
    };

    bind('sDetune', v => { params.detune = v; Object.values(activeNotes).forEach(nd => { if (nd?.o) nd.o.detune.setTargetAtTime(v, audioEngine.now, 0.01); }); }, v => v + '¢');
    bind('sOctave', v => { baseOctave = Math.round(v); document.getElementById('sOctaveV').textContent = Math.round(v); rebuildKeyboard(); }, v => Math.round(v));
    bind('sCutoff', v => { params.filterFreq = v; Object.values(activeNotes).forEach(nd => { if (nd?.flt) nd.flt.frequency.setTargetAtTime(v, audioEngine.now, 0.02); }); }, v => Math.round(v) + 'Hz');
    bind('sRes',    v => { params.filterQ = v; Object.values(activeNotes).forEach(nd => { if (nd?.flt) nd.flt.Q.setTargetAtTime(v, audioEngine.now, 0.02); }); }, v => v.toFixed(1));
    bind('sAtk',    v => { params.attack = v; }, v => v.toFixed(3) + 's');
    bind('sDec',    v => { params.decay  = v; }, v => v.toFixed(2) + 's');
    bind('sSus',    v => { params.sustain = v; }, v => Math.round(v*100) + '%');
    bind('sRel',    v => { params.release = v; }, v => v.toFixed(2) + 's');
    bind('sLfoRate', v => { params.lfoRate = v; document.getElementById('sLfoRateV').textContent = v > 0 ? v.toFixed(1)+'Hz' : 'Off'; }, v => v);
    bind('sLfoDepth',v => { params.lfoDepth = v; }, v => Math.round(v*100) + '%');
  }

  function buildKeyboard(wrap) {
    const kbWrap = document.createElement('div');
    kbWrap.className = 'piano-wrap';

    const keyboard = document.createElement('div');
    keyboard.id = 'synthKeyboard';
    keyboard.className = 'piano-keyboard';

    const noteOrder = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const octaves   = [baseOctave, baseOctave + 1];

    octaves.forEach(oct => {
      noteOrder.forEach(note => {
        const isBlack = note.includes('#');
        const freq    = audioEngine.noteToFreq(note, oct);
        const id      = note + oct;

        const key = document.createElement('div');
        key.className = `piano-key synth-key ${isBlack ? 'black' : 'white'}`;
        key.dataset.id   = id;
        key.dataset.freq = freq;
        key.innerHTML    = `<span class="key-label">${note}</span>`;

        const start = () => {
          audioEngine.init().then(() => {
            if (activeNotes[id]) return;
            const nd = audioEngine.playSynth(freq, params);
            activeNotes[id] = nd;
            key.classList.add('pressed');
            Storage.incrementNotes();
          });
        };
        const stop = () => {
          if (activeNotes[id]) {
            audioEngine.stopSynth(activeNotes[id]);
            delete activeNotes[id];
            key.classList.remove('pressed');
          }
        };

        key.addEventListener('pointerdown', e => { e.preventDefault(); start(); });
        key.addEventListener('pointerup',   stop);
        key.addEventListener('pointerleave',stop);
        keyboard.appendChild(key);
      });
    });
    // Final C
    const finalFreq = audioEngine.noteToFreq('C', baseOctave + 2);
    const finalKey  = document.createElement('div');
    finalKey.className = 'piano-key synth-key white';
    finalKey.innerHTML = `<span class="key-label">C</span>`;
    finalKey.addEventListener('pointerdown', e => { e.preventDefault(); audioEngine.init().then(() => { const nd = audioEngine.playSynth(finalFreq, params); activeNotes['Cfinal'] = nd; finalKey.classList.add('pressed'); }); });
    finalKey.addEventListener('pointerup', () => { audioEngine.stopSynth(activeNotes['Cfinal']); delete activeNotes['Cfinal']; finalKey.classList.remove('pressed'); });
    keyboard.appendChild(finalKey);

    kbWrap.appendChild(keyboard);
    wrap.appendChild(kbWrap);
  }

  function rebuildKeyboard() {
    const kbWrap = document.querySelector('#synthWrap .piano-wrap');
    if (kbWrap) kbWrap.remove();
    buildKeyboard(document.getElementById('synthWrap'));
  }

  function kbDown(e) {
    if (Router.getCurrent() !== 'synth') return;
    if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const kv = e.key.toLowerCase();
    if (kv === 'z') { baseOctave = Math.max(1, baseOctave-1); rebuildKeyboard(); document.getElementById('sOctave') && (document.getElementById('sOctave').value = baseOctave); return; }
    if (kv === 'x') { baseOctave = Math.min(6, baseOctave+1); rebuildKeyboard(); document.getElementById('sOctave') && (document.getElementById('sOctave').value = baseOctave); return; }
    const kn = KEY_MAP[kv];
    if (!kn) return;
    const note = kn.replace('+','');
    const oct  = kn.endsWith('+') ? baseOctave + 1 : baseOctave;
    const id   = note + oct;
    const key  = document.querySelector(`#synthKeyboard [data-id="${id}"]`);
    if (key && !activeNotes[id]) {
      audioEngine.init().then(() => {
        const nd = audioEngine.playSynth(parseFloat(key.dataset.freq), params);
        activeNotes[id] = nd;
        key.classList.add('pressed');
        Storage.incrementNotes();
      });
    }
  }

  function kbUp(e) {
    if (Router.getCurrent() !== 'synth') return;
    const kn = KEY_MAP[e.key.toLowerCase()];
    if (!kn) return;
    const note = kn.replace('+','');
    const oct  = kn.endsWith('+') ? baseOctave + 1 : baseOctave;
    const id   = note + oct;
    if (activeNotes[id]) {
      audioEngine.stopSynth(activeNotes[id]);
      delete activeNotes[id];
      const key = document.querySelector(`#synthKeyboard [data-id="${id}"]`);
      if (key) key.classList.remove('pressed');
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;
    build();
    document.addEventListener('keydown', kbDown);
    document.addEventListener('keyup',   kbUp);

    const canvas = document.getElementById('synthVizCanvas');
    if (canvas) {
      waveViz = UI.createWaveformViz(canvas, '#f472b6');
      waveViz.start();
    }
  }

  function destroy() {
    Object.values(activeNotes).forEach(nd => audioEngine.stopSynth(nd));
    activeNotes = {};
    document.removeEventListener('keydown', kbDown);
    document.removeEventListener('keyup',   kbUp);
    if (waveViz) { waveViz.stop(); waveViz = null; }
    initialized = false;
  }

  return { init, destroy };
})();
