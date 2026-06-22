/* ===================================================
   InstrumentVerse — ukulele.js
   Ukulele with chord diagrams (GCEA tuning).
   Supports:
     - Chord select + click-to-strum
     - Swipe DOWN on neck = downstroke strum
     - Swipe UP   on neck = upstroke strum
     - Individual fret cell tap = single note
     - Per-string vibration visual
   =================================================== */

const Ukulele = (() => {
  // Standard ukulele tuning: G4 C4 E4 A4
  const OPEN_FREQS = [392.00, 261.63, 329.63, 440.00];
  const STRING_NAMES = ['G', 'C', 'E', 'A'];
  const FRET_COUNT = 10;

  const CHORDS = {
    'C':   [0,0,0,3],  'D':  [2,2,2,0],  'E':  [4,4,4,2],
    'F':   [2,0,1,0],  'G':  [0,2,3,2],  'A':  [2,1,0,0],
    'B':   [4,3,2,2],  'Am': [2,0,0,0],  'Em': [0,4,3,2],
    'Dm':  [2,2,1,0],  'Bm': [4,2,2,2],  'Fm': [2,0,1,3],
    'C7':  [0,0,0,1],  'G7': [0,2,1,2],  'D7': [2,0,2,0],
    'A7':  [0,1,0,0],  'F7': [2,3,1,0],  'E7': [1,2,0,2],
    'Cmaj7':[0,0,0,2], 'Fmaj7':[2,0,1,2],'Gmaj7':[0,2,2,2]
  };

  let currentChord = null;
  let initialized = false;

  function fretFreq(stringIdx, fret) {
    return fret >= 0 ? OPEN_FREQS[stringIdx] * Math.pow(2, fret / 12) : null;
  }

  function buildChordGrid() {
    const grid = document.getElementById('ukuleleChordGrid');
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
        audioEngine.init().then(() => strumChord(CHORDS[name], 'down'));
      });
      grid.appendChild(btn);
    });
  }

  function buildNeck(chordFrets) {
    const neck = document.getElementById('ukuleleNeck');
    if (!neck) return;
    neck.innerHTML = '';

    const numRow = document.createElement('div');
    numRow.style.cssText = 'display:flex;margin-left:30px;';
    for (let f = 0; f <= FRET_COUNT; f++) {
      const n = document.createElement('div');
      n.style.cssText = 'flex:1;text-align:center;font-size:0.65rem;color:var(--text-dim);padding:4px 0;';
      n.textContent = f === 0 ? 'O' : f;
      numRow.appendChild(n);
    }
    neck.appendChild(numRow);

    STRING_NAMES.forEach((name, si) => {
      const row = document.createElement('div');
      row.className = 'string-row';
      row.innerHTML = `<span class="string-name">${name}</span>`;
      const line = document.createElement('div');
      line.className = 'string-line';
      row.appendChild(line);

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
          else if (f === cf && cf > 0) { dot.classList.add('pressed'); }
        }
        cell.appendChild(dot);

        cell.addEventListener('pointerdown', e => {
          e.preventDefault();
          e.stopPropagation(); // don't fire swipe-start
          const freq = fretFreq(si, f);
          if (freq) {
            audioEngine.init().then(() => {
              audioEngine.playGuitar(freq, 0.7, false);
              dot.classList.add('active');
              setTimeout(() => dot.classList.remove('active'), 400);
              vibrateString(si);
              Storage.incrementNotes();
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
    const order = direction === 'down' ? [0,1,2,3] : [3,2,1,0];
    order.forEach((si, i) => {
      const fret = frets[si];
      const freq = fretFreq(si, fret);
      if (!freq) return;
      setTimeout(() => {
        audioEngine.playGuitar(freq, 0.65, false);
        vibrateString(si);
      }, i * delay);
    });
    Storage.incrementNotes(4);
    Storage.addXP(1);
    UI.updateXPDisplay();
  }

  function vibrateString(si) {
    const neck = document.getElementById('ukuleleNeck');
    if (!neck) return;
    const rows = neck.querySelectorAll('.string-row');
    const row = rows[si + 1]; // +1 for fret number row
    if (!row) return;
    const line = row.querySelector('.string-line');
    if (!line) return;
    line.classList.remove('vibrating');
    void line.offsetWidth; // force reflow to restart animation
    line.classList.add('vibrating');
    setTimeout(() => line.classList.remove('vibrating'), 700);
  }

  /* ===== SWIPE TO STRUM ===== */
  let swipeStart = null;
  let swipeMoved = false;
  const SWIPE_THRESHOLD = 25;

  function initSwipe() {
    const neck = document.getElementById('ukuleleNeck');
    if (!neck) return;

    neck.addEventListener('pointerdown', e => {
      if (e.target.closest('.fret-cell')) return;
      swipeStart = { y: e.clientY };
      swipeMoved = false;
      neck.setPointerCapture(e.pointerId);
    }, { passive: false });

    neck.addEventListener('pointermove', e => {
      if (!swipeStart) return;
      const dy = e.clientY - swipeStart.y;
      if (Math.abs(dy) > SWIPE_THRESHOLD && !swipeMoved) {
        swipeMoved = true;
        if (!currentChord) return;
        const dir = dy > 0 ? 'down' : 'up';
        audioEngine.init().then(() => strumChord(CHORDS[currentChord], dir));
      }
    }, { passive: false });

    neck.addEventListener('pointerup', e => {
      if (swipeStart && !swipeMoved) {
        // Tap without swipe — strum down if chord selected
        if (currentChord && !e.target.closest('.fret-cell')) {
          audioEngine.init().then(() => strumChord(CHORDS[currentChord], 'down'));
        }
      }
      swipeStart = null;
      swipeMoved = false;
    });

    neck.addEventListener('pointercancel', () => {
      swipeStart = null;
      swipeMoved = false;
    });
  }

  /* ===== DEDICATED STRUM BAR ===== */
  let barStart = null;
  let barStrummed = false;

  function showStrumDirection(dir) {
    const bar = document.getElementById('ukuleleStrumBar');
    if (!bar) return;
    const ind = document.createElement('span');
    ind.className = 'strum-indicator';
    ind.textContent = dir === 'down' ? '↓' : '↑';
    bar.appendChild(ind);
    setTimeout(() => ind.remove(), 500);
  }

  function barStrum(dir) {
    if (!currentChord) { UI.toast('Pick a chord first'); return; }
    audioEngine.init().then(() => strumChord(CHORDS[currentChord], dir));
    showStrumDirection(dir);
  }

  function initStrumBar() {
    const bar = document.getElementById('ukuleleStrumBar');
    if (!bar) return;
    bar.addEventListener('pointerdown', e => {
      e.preventDefault();
      barStart = { y: e.clientY };
      barStrummed = false;
      try { bar.setPointerCapture(e.pointerId); } catch (_) {}
    }, { passive: false });
    bar.addEventListener('pointermove', e => {
      if (!barStart || barStrummed) return;
      const dy = e.clientY - barStart.y;
      if (Math.abs(dy) > 16) { barStrummed = true; barStrum(dy > 0 ? 'down' : 'up'); }
    }, { passive: false });
    bar.addEventListener('pointerup', () => {
      if (barStart && !barStrummed) barStrum('down');
      barStart = null; barStrummed = false;
    });
    bar.addEventListener('pointercancel', () => { barStart = null; barStrummed = false; });
  }

  function init() {
    if (initialized) return;
    initialized = true;
    buildChordGrid();
    buildNeck(null);
    initSwipe();
    initStrumBar();
  }

  function destroy() {
    currentChord = null;
    swipeStart   = null;
    swipeMoved   = false;
    barStart     = null;
    barStrummed  = false;
    initialized  = false;
  }

  return { init, destroy };
})();
