/* ===================================================
   InstrumentVerse — beatmaker.js
   16-step sequencer with 8 drum tracks, BPM control
   =================================================== */

const BeatMaker = (() => {
  const TRACKS = [
    { id:'kick',   name:'Kick',   color:'#c0392b' },
    { id:'snare',  name:'Snare',  color:'#8e44ad' },
    { id:'hihat',  name:'Hi-Hat', color:'#1a5276' },
    { id:'openhat',name:'Open HH',color:'#2980b9' },
    { id:'clap',   name:'Clap',   color:'#27ae60' },
    { id:'tom1',   name:'Tom 1',  color:'#e67e22' },
    { id:'crash',  name:'Crash',  color:'#16a085' },
    { id:'ride',   name:'Ride',   color:'#2c3e50' }
  ];

  const STEPS = 16;
  const DEFAULT_BPM = 120;

  let pattern  = Array.from({length: TRACKS.length}, () => new Array(STEPS).fill(false));
  let bpm      = DEFAULT_BPM;
  let playing  = false;
  let currentStep = 0;
  let intervalId  = null;
  let initialized = false;

  const PRESETS = {
    'Basic Rock': {
      kick:    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      snare:   [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat:   [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    },
    'Boom Bap': {
      kick:    [1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0],
      snare:   [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat:   [1,0,1,1,0,0,1,0,1,0,0,1,0,0,1,0],
    },
    'House': {
      kick:    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      hihat:   [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
      openhat: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
      clap:    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    },
    'Reggaeton': {
      kick:    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
      snare:   [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat:   [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
    },
  };

  function build() {
    const wrap = document.getElementById('beatmakerWrap');
    if (!wrap || wrap.children.length > 0) return;

    // Controls
    const controls = document.createElement('div');
    controls.className = 'beatmaker-controls';

    const playBtn = document.createElement('button');
    playBtn.className = 'bm-play-btn';
    playBtn.id = 'bmPlayBtn';
    playBtn.textContent = '▶';
    playBtn.addEventListener('click', togglePlay);
    controls.appendChild(playBtn);

    const bpmGroup = document.createElement('div');
    bpmGroup.className = 'bm-bpm-group';
    bpmGroup.innerHTML = `
      <div class="bm-bpm-label">BPM</div>
      <div class="bm-bpm-wrap">
        <span class="bm-bpm-val" id="bmBpmVal">${bpm}</span>
        <input type="range" id="bmBpmSlider" min="60" max="200" value="${bpm}" style="width:140px;accent-color:var(--primary);">
      </div>
    `;
    const bpmSlider = bpmGroup.querySelector('#bmBpmSlider');
    const bpmVal    = bpmGroup.querySelector('#bmBpmVal');
    if (bpmSlider) {
      bpmSlider.addEventListener('input', e => {
        bpm = parseInt(e.target.value);
        if (bpmVal) bpmVal.textContent = bpm;
        if (playing) { stopSequencer(); startSequencer(); }
      });
    }
    controls.appendChild(bpmGroup);

    // Preset buttons
    const presetWrap = document.createElement('div');
    presetWrap.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-left:auto;';
    Object.keys(PRESETS).forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'bm-btn';
      btn.textContent = name;
      btn.addEventListener('click', () => loadPreset(name));
      presetWrap.appendChild(btn);
    });
    controls.appendChild(presetWrap);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'bm-btn danger';
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', clearPattern);
    controls.appendChild(clearBtn);

    wrap.appendChild(controls);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'beatmaker-grid';
    grid.id = 'bmGrid';

    TRACKS.forEach((track, ti) => {
      const row = document.createElement('div');
      row.className = 'bm-track';

      const label = document.createElement('div');
      label.className = 'bm-track-name';
      label.style.color = track.color;
      label.textContent = track.name;
      row.appendChild(label);

      const steps = document.createElement('div');
      steps.className = 'bm-steps';

      for (let si = 0; si < STEPS; si++) {
        const step = document.createElement('div');
        step.className = 'bm-step';
        step.id = `bm-${ti}-${si}`;
        step.dataset.track = ti;
        step.dataset.step  = si;
        if (pattern[ti][si]) { step.classList.add('on'); step.style.background = track.color; }

        step.addEventListener('click', () => {
          pattern[ti][si] = !pattern[ti][si];
          if (pattern[ti][si]) { step.classList.add('on'); step.style.background = track.color; }
          else { step.classList.remove('on'); step.style.background = ''; }
        });

        steps.appendChild(step);
      }

      row.appendChild(steps);
      grid.appendChild(row);
    });

    wrap.appendChild(grid);

  }

  function tick() {
    audioEngine.init();
    const t = audioEngine.now;

    TRACKS.forEach((track, ti) => {
      if (pattern[ti][currentStep]) {
        Drums.triggerByName(track.id, 0.85);
      }
    });

    // Visual
    const prev = (currentStep - 1 + STEPS) % STEPS;
    for (let ti = 0; ti < TRACKS.length; ti++) {
      const prevEl = document.getElementById(`bm-${ti}-${prev}`);
      const currEl = document.getElementById(`bm-${ti}-${currentStep}`);
      if (prevEl) prevEl.classList.remove('current');
      if (currEl) currEl.classList.add('current');
    }

    currentStep = (currentStep + 1) % STEPS;
  }

  function startSequencer() {
    const ms = (60 / bpm / 4) * 1000; // 16th notes
    tick(); // immediate first tick
    intervalId = setInterval(tick, ms);
  }

  function stopSequencer() {
    clearInterval(intervalId);
    intervalId = null;
    // Clear visuals
    document.querySelectorAll('.bm-step.current').forEach(el => el.classList.remove('current'));
    currentStep = 0;
  }

  function togglePlay() {
    playing = !playing;
    const btn = document.getElementById('bmPlayBtn');

    if (playing) {
      audioEngine.init().then(() => startSequencer());
      if (btn) { btn.textContent = '⏹'; btn.classList.add('playing'); }
    } else {
      stopSequencer();
      if (btn) { btn.textContent = '▶'; btn.classList.remove('playing'); }
    }
  }

  function clearPattern() {
    pattern = Array.from({length: TRACKS.length}, () => new Array(STEPS).fill(false));
    document.querySelectorAll('.bm-step').forEach(el => {
      el.classList.remove('on');
      el.style.background = '';
    });
  }

  function loadPreset(name) {
    const preset = PRESETS[name];
    if (!preset) return;
    clearPattern();

    TRACKS.forEach((track, ti) => {
      const trackPattern = preset[track.id];
      if (!trackPattern) return;
      trackPattern.forEach((on, si) => {
        pattern[ti][si] = !!on;
        const el = document.getElementById(`bm-${ti}-${si}`);
        if (el) {
          if (on) { el.classList.add('on'); el.style.background = track.color; }
          else    { el.classList.remove('on'); el.style.background = ''; }
        }
      });
    });

    UI.toast('Loaded: ' + name);
    Storage.addXP(5);
    UI.updateXPDisplay();
  }

  function init() {
    if (initialized) return;
    initialized = true;
    build();
  }

  function destroy() {
    if (playing) stopSequencer();
    playing = false;
    initialized = false;
  }

  return { init, destroy };
})();
