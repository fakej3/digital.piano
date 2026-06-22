/* ===================================================
   InstrumentVerse — organ.js
   Hammond-style organ with 9 drawbars, piano keyboard UI
   =================================================== */

const Organ = (() => {
  const DRAWBARS = [
    { label:"16'",  name:'Sub',     harmonic:0.5 },
    { label:"8'",   name:'Fund',    harmonic:1   },
    { label:"5⅓'",  name:'Quint',   harmonic:3/2 },
    { label:"4'",   name:'Oct',     harmonic:2   },
    { label:"2⅔'",  name:'Nazard',  harmonic:3   },
    { label:"2'",   name:'Block',   harmonic:4   },
    { label:"1⅗'",  name:'Tierce',  harmonic:5   },
    { label:"1'",   name:'Larig',   harmonic:8   },
    { label:"½'",   name:'Scharf',  harmonic:16  }
  ];

  const KEY_MAP = {
    'a':'C','w':'C#','s':'D','e':'D#','d':'E','f':'F',
    't':'F#','g':'G','y':'G#','h':'A','u':'A#','j':'B',
    'k':'C+','o':'C#+','l':'D+','p':'D#+'
  };

  let drawbarValues = [8, 8, 8, 0, 0, 0, 0, 0, 0];
  let activeNotes   = {};
  let baseOctave    = 4;
  let initialized   = false;

  function build() {
    const wrap = document.getElementById('organWrap');
    if (!wrap || wrap.children.length > 0) return;

    // Drawbar panel
    const dbPanel = document.createElement('div');
    dbPanel.className = 'organ-drawbars';

    DRAWBARS.forEach((db, i) => {
      const group = document.createElement('div');
      group.className = 'drawbar-group';

      const label = document.createElement('div');
      label.className = 'drawbar-label';
      label.innerHTML = `${db.label}<br><small>${db.name}</small>`;

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'drawbar';
      slider.min = 0; slider.max = 8; slider.step = 1;
      slider.value = drawbarValues[i];
      // Color: brown/amber for 16-5⅓, white for 4-1, black for sub-harmonics
      const colors = ['#8B4513','#F5F5DC','#F5F5DC','#F5F5DC','#000','#000','#000','#000','#000'];
      slider.style.setProperty('--range-color', colors[i]);

      const valDisplay = document.createElement('div');
      valDisplay.className = 'drawbar-value';
      valDisplay.textContent = drawbarValues[i];

      slider.addEventListener('input', e => {
        const v = parseInt(e.target.value);
        drawbarValues[i] = v;
        valDisplay.textContent = v;
        // Update active notes
        Object.values(activeNotes).forEach(nd => {
          audioEngine.updateOrganDrawbar(nd, i, v);
        });
      });

      group.appendChild(label);
      group.appendChild(slider);
      group.appendChild(valDisplay);
      dbPanel.appendChild(group);
    });

    wrap.appendChild(dbPanel);

    // Keyboard
    buildKeyboard(wrap);

    // Presets
    const presetRow = document.createElement('div');
    presetRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;';
    const presets = {
      'Full':    [8,8,8,8,8,8,8,8,8],
      'Jazz':    [8,8,0,8,0,0,0,0,0],
      'Gospel':  [8,8,8,4,0,0,0,4,0],
      'Flute':   [0,8,8,0,0,0,0,0,0],
      'Theatre': [8,8,4,4,2,0,0,0,0],
      'Clear':   [0,0,0,0,0,0,0,0,0]
    };

    Object.entries(presets).forEach(([name, vals]) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-surface btn-sm';
      btn.textContent = name;
      btn.addEventListener('click', () => {
        drawbarValues = [...vals];
        dbPanel.querySelectorAll('input[type=range]').forEach((sl, i) => {
          sl.value = vals[i];
          sl.nextElementSibling.textContent = vals[i];
        });
        Object.values(activeNotes).forEach(nd => {
          vals.forEach((v, i) => audioEngine.updateOrganDrawbar(nd, i, v));
        });
      });
      presetRow.appendChild(btn);
    });

    const hint = document.createElement('div');
    hint.style.cssText = 'margin-top:8px;font-size:0.78rem;color:var(--text-muted);';
    hint.textContent = 'Presets:';
    wrap.appendChild(hint);
    wrap.appendChild(presetRow);
  }

  function buildKeyboard(wrap) {
    const kbWrap = document.createElement('div');
    kbWrap.className = 'organ-keyboard piano-wrap';

    const keyboard = document.createElement('div');
    keyboard.id = 'organKeyboard';
    keyboard.className = 'piano-keyboard';

    const noteOrder = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const octaves   = [baseOctave, baseOctave + 1];

    octaves.forEach(oct => {
      noteOrder.forEach(note => {
        const isBlack = note.includes('#');
        const freq    = audioEngine.noteToFreq(note, oct);
        const id      = note + oct;

        const key = document.createElement('div');
        key.className = `piano-key ${isBlack ? 'black' : 'white'}`;
        key.dataset.id   = id;
        key.dataset.freq = freq;
        key.innerHTML = `<span class="key-label">${note}<br><span style="font-size:0.5rem">${oct}</span></span>`;

        const start = () => {
          audioEngine.init().then(() => {
            if (activeNotes[id]) return;
            const nd = audioEngine.playOrgan(freq, drawbarValues);
            activeNotes[id] = nd;
            key.classList.add('pressed');
            Storage.incrementNotes();
          });
        };

        const stop = () => {
          if (activeNotes[id]) {
            audioEngine.stopOrgan(activeNotes[id]);
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
    finalKey.className = 'piano-key white';
    finalKey.innerHTML = `<span class="key-label"><span style="font-size:0.5rem">C${baseOctave+2}</span></span>`;
    finalKey.addEventListener('pointerdown', e => { e.preventDefault(); audioEngine.init().then(() => { const nd = audioEngine.playOrgan(finalFreq, drawbarValues); activeNotes['C'+(baseOctave+2)] = nd; finalKey.classList.add('pressed'); }); });
    finalKey.addEventListener('pointerup', () => { audioEngine.stopOrgan(activeNotes['C'+(baseOctave+2)]); delete activeNotes['C'+(baseOctave+2)]; finalKey.classList.remove('pressed'); });
    keyboard.appendChild(finalKey);

    kbWrap.appendChild(keyboard);
    wrap.appendChild(kbWrap);
  }

  function kbDown(e) {
    if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const kn = KEY_MAP[e.key.toLowerCase()];
    if (!kn) return;
    const note = kn.replace('+','');
    const oct  = kn.endsWith('+') ? baseOctave + 1 : baseOctave;
    const id   = note + oct;
    const key  = document.querySelector(`#organKeyboard .piano-key[data-id="${id}"]`);
    if (key && !activeNotes[id]) {
      audioEngine.init().then(() => {
        const nd = audioEngine.playOrgan(audioEngine.noteToFreq(note, oct), drawbarValues);
        activeNotes[id] = nd;
        key.classList.add('pressed');
      });
    }
  }

  function kbUp(e) {
    const kn = KEY_MAP[e.key.toLowerCase()];
    if (!kn) return;
    const note = kn.replace('+','');
    const oct  = kn.endsWith('+') ? baseOctave + 1 : baseOctave;
    const id   = note + oct;
    if (activeNotes[id]) {
      audioEngine.stopOrgan(activeNotes[id]);
      delete activeNotes[id];
      const key = document.querySelector(`#organKeyboard .piano-key[data-id="${id}"]`);
      if (key) key.classList.remove('pressed');
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;
    build();
    document.addEventListener('keydown', kbDown);
    document.addEventListener('keyup',   kbUp);
  }

  function destroy() {
    Object.values(activeNotes).forEach(nd => audioEngine.stopOrgan(nd, 0.01));
    activeNotes = {};
    document.removeEventListener('keydown', kbDown);
    document.removeEventListener('keyup',   kbUp);
    initialized = false;
  }

  return { init, destroy };
})();
