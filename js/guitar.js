/* ===================================================
   InstrumentVerse — guitar.js
   Guitar with chord mode and fretboard pick mode
   =================================================== */

const Guitar = (() => {
  // Standard tuning: string frequencies (open) E2 A2 D3 G3 B3 E4
  const OPEN_FREQS = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
  const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];

  // Chord definitions: fret per string (-1=muted, 0=open)
  const CHORDS = {
    'C':  [-1,3,2,0,1,0],  'D':  [-1,-1,0,2,3,2], 'E':  [0,2,2,1,0,0],
    'F':  [1,1,2,3,3,1],   'G':  [3,2,0,0,0,3],   'A':  [-1,0,2,2,2,0],
    'B':  [-1,2,4,4,4,2],  'Am': [-1,0,2,2,1,0],  'Em': [0,2,2,0,0,0],
    'Dm': [-1,-1,0,2,3,1], 'Bm': [-1,2,4,4,3,2],  'C7': [-1,3,2,3,1,0],
    'G7': [3,2,0,0,0,1],   'D7': [-1,-1,0,2,1,2], 'E7': [0,2,0,1,0,0],
    'A7': [-1,0,2,0,2,0],  'F7': [1,1,2,1,1,1],   'Cmaj7':[-1,3,2,0,0,0],
    'Gmaj7':[3,2,0,0,0,2], 'Amaj7':[-1,0,2,1,2,0],'Cadd9':[-1,3,2,0,3,3]
  };

  const FRET_COUNT = 12;
  const FRET_MARKERS = { 3:1, 5:1, 7:1, 9:1, 12:2 };

  let mode = 'chord';
  let currentChord = null;
  let initialized = false;

  function fretFreq(stringIdx, fret) {
    if (fret < 0) return null;
    return OPEN_FREQS[stringIdx] * Math.pow(2, fret / 12);
  }

  /* ===== CHORD MODE ===== */
  function buildChordUI() {
    buildChordGrid();
    buildNeck(null);
  }

  function buildChordGrid() {
    const grid = document.getElementById('guitarChordGrid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.keys(CHORDS).forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'chord-btn';
      btn.textContent = name;
      btn.addEventListener('click', () => {
        currentChord = name;
        grid.querySelectorAll('.chord-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        buildNeck(CHORDS[name]);
        strumChord(CHORDS[name]);
        Storage.addXP(1);
        UI.updateXPDisplay();
      });
      grid.appendChild(btn);
    });
  }

  function buildNeck(chordFrets) {
    const neck = document.getElementById('guitarNeck');
    if (!neck) return;
    neck.innerHTML = '';

    // Fret number row
    const numRow = document.createElement('div');
    numRow.style.cssText = 'display:flex;margin-left:30px;';
    [0,1,2,3,4,5,6,7,8,9,10,11,12].forEach(f => {
      const cell = document.createElement('div');
      cell.style.cssText = 'flex:1;text-align:center;font-size:0.65rem;color:var(--text-dim);padding:4px 0;';
      cell.textContent = f === 0 ? 'O' : f;
      numRow.appendChild(cell);
      if (FRET_MARKERS[f]) {
        // add marker below later
      }
    });
    neck.appendChild(numRow);

    STRING_NAMES.forEach((name, si) => {
      const row = document.createElement('div');
      row.className = 'string-row';
      row.innerHTML = `<span class="string-name">${name}</span>`;

      // String line
      const line = document.createElement('div');
      line.className = 'string-line';
      row.appendChild(line);

      // Cells: open (0) + frets 1-12
      for (let f = 0; f <= FRET_COUNT; f++) {
        const cell = document.createElement('div');
        cell.className = 'fret-cell';
        cell.dataset.string = si;
        cell.dataset.fret = f;

        const dot = document.createElement('div');
        dot.className = 'fret-dot';
        if (chordFrets) {
          const cf = chordFrets[si];
          if (f === 0 && cf === 0) { dot.classList.add('open'); dot.textContent = 'O'; }
          else if (cf < 0 && f === 0) { dot.classList.add('muted'); dot.textContent = '✕'; }
          else if (f === cf && cf > 0) { dot.classList.add('pressed'); }
        }
        cell.appendChild(dot);
        cell.addEventListener('click', () => {
          const freq = fretFreq(si, f);
          if (freq) {
            audioEngine.init().then(() => {
              audioEngine.playGuitar(freq, 0.8);
              dot.classList.add('active');
              setTimeout(() => dot.classList.remove('active'), 400);
            });
          }
        });
        row.appendChild(cell);
      }
      neck.appendChild(row);
    });
  }

  function strumChord(frets, direction = 'down') {
    const delay = 22;
    const order = direction === 'down' ? [0,1,2,3,4,5] : [5,4,3,2,1,0];
    order.forEach((si, i) => {
      const fret = frets[si];
      if (fret < 0) return;
      const freq = fretFreq(si, fret);
      if (!freq) return;
      setTimeout(() => {
        audioEngine.init().then(() => {
          audioEngine.playGuitar(freq, 0.75);
          highlightNeckString(si, fret);
        });
      }, i * delay);
    });
    Storage.incrementNotes(6);
  }

  function highlightNeckString(si, fret) {
    const neck = document.getElementById('guitarNeck');
    if (!neck) return;
    const cell = neck.querySelector(`[data-string="${si}"][data-fret="${fret}"]`);
    if (cell) {
      const dot = cell.querySelector('.fret-dot');
      if (dot) { dot.classList.add('active'); setTimeout(() => dot.classList.remove('active'), 400); }
    }
  }

  /* ===== FRETBOARD MODE ===== */
  function buildFretboard() {
    const fb = document.getElementById('guitarFretboard');
    if (!fb || fb.children.length > 0) return;

    // Fret numbers
    const numRow = document.createElement('div');
    numRow.style.cssText = 'display:flex;margin-left:36px;';
    for (let f = 0; f <= FRET_COUNT; f++) {
      const n = document.createElement('div');
      n.style.cssText = 'flex:1;text-align:center;font-size:0.65rem;color:var(--text-dim);padding:4px 0;';
      n.textContent = f === 0 ? 'Open' : f;
      numRow.appendChild(n);
    }
    fb.appendChild(numRow);

    STRING_NAMES.forEach((name, si) => {
      const row = document.createElement('div');
      row.className = 'string-row';
      row.innerHTML = `<span class="string-name">${name}</span>`;
      const line = document.createElement('div'); line.className = 'string-line'; row.appendChild(line);

      for (let f = 0; f <= FRET_COUNT; f++) {
        const cell = document.createElement('div');
        cell.className = 'fret-cell';
        const freq = fretFreq(si, f);
        if (!freq) { row.appendChild(cell); continue; }

        // Note name
        const noteNames = ['E','F','F#','G','G#','A','A#','B','C','C#','D','D#'];
        const baseNote = ['E','A','D','G','B','E'][si];
        const baseIdx  = noteNames.indexOf(baseNote);
        const noteName = noteNames[(baseIdx + f) % 12];

        const dot = document.createElement('div');
        dot.className = 'fret-dot';
        dot.textContent = noteName;
        dot.style.cssText = 'font-size:0.6rem;width:32px;height:32px;border:1px solid var(--border-lg);color:var(--text-dim);';
        cell.appendChild(dot);

        cell.addEventListener('pointerdown', e => {
          e.preventDefault();
          audioEngine.init().then(() => {
            audioEngine.playGuitar(freq, 0.8);
            dot.classList.add('active');
            setTimeout(() => dot.classList.remove('active'), 400);
            Storage.incrementNotes();
          });
        });
        row.appendChild(cell);
      }
      fb.appendChild(row);
    });

    // Fret markers
    const markerRow = document.createElement('div');
    markerRow.style.cssText = 'display:flex;margin-left:36px;';
    for (let f = 0; f <= FRET_COUNT; f++) {
      const m = document.createElement('div');
      m.style.cssText = 'flex:1;display:flex;justify-content:center;padding:6px 0;';
      if (FRET_MARKERS[f]) {
        if (FRET_MARKERS[f] === 2) {
          m.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:var(--border-lg);display:inline-block;margin:0 2px"></span><span style="width:7px;height:7px;border-radius:50%;background:var(--border-lg);display:inline-block;margin:0 2px"></span>';
        } else {
          m.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:var(--border-lg);display:inline-block"></span>';
        }
      }
      markerRow.appendChild(m);
    }
    fb.appendChild(markerRow);
  }

  /* ===== SWIPE TO STRUM ===== */
  let strumStart = null;
  function initStrumGesture() {
    const neck = document.getElementById('guitarNeck');
    if (!neck) return;
    neck.addEventListener('pointerdown', e => { strumStart = e.clientY; });
    neck.addEventListener('pointerup', e => {
      if (strumStart === null || !currentChord) return;
      const dy = e.clientY - strumStart;
      if (Math.abs(dy) > 30) {
        const dir = dy > 0 ? 'down' : 'up';
        strumChord(CHORDS[currentChord], dir);
        audioEngine.init();
      }
      strumStart = null;
    });
  }

  function init() {
    if (initialized) return;
    initialized = true;

    buildChordUI();
    buildFretboard();
    initStrumGesture();

    // Mode toggle
    const chordBtn = document.getElementById('guitarModeChord');
    const pickBtn  = document.getElementById('guitarModePick');
    if (chordBtn && pickBtn) {
      chordBtn.addEventListener('click', () => {
        mode = 'chord';
        chordBtn.classList.add('active'); pickBtn.classList.remove('active');
        document.getElementById('guitarChordPanel').style.display = '';
        document.getElementById('guitarPickPanel').style.display  = 'none';
      });
      pickBtn.addEventListener('click', () => {
        mode = 'pick';
        pickBtn.classList.add('active'); chordBtn.classList.remove('active');
        document.getElementById('guitarChordPanel').style.display = 'none';
        document.getElementById('guitarPickPanel').style.display  = '';
      });
    }
  }

  function destroy() { initialized = false; }

  return { init, destroy };
})();
