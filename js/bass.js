/* ===================================================
   InstrumentVerse — bass.js
   Bass guitar fretboard (E1 A1 D2 G2 standard tuning)
   Features:
     - Tap a fret cell to pluck a note (1.5-2s sustain via playBass)
     - Swipe horizontally across a string row = slide technique (pitch bend)
     - Keyboard: 1-4 = open strings (E A D G)
                 Q W E R = frets 1-4 on the currently-focused string
                 [ / ] = move focused string down / up
   =================================================== */

const Bass = (() => {
  const OPEN_FREQS = [41.20, 55.00, 73.42, 98.00]; // E1 A1 D2 G2
  const STRING_NAMES = ['E', 'A', 'D', 'G'];
  const FRET_COUNT = 12;
  let initialized = false;
  let focusString = 0; // which string the QWER fret keys target

  const NOTE_NAMES = ['E','F','F#','G','G#','A','A#','B','C','C#','D','D#'];

  // Keyboard: open strings 1-4, frets Q W E R on focused string
  const OPEN_KEYS = { '1':0, '2':1, '3':2, '4':3 };
  const FRET_KEYS = { 'q':1, 'w':2, 'e':3, 'r':4 };

  function fretFreq(si, fret) {
    return OPEN_FREQS[si] * Math.pow(2, fret / 12);
  }

  function getNoteName(si, fret) {
    const baseNotes = ['E','A','D','G'];
    const baseIdx   = NOTE_NAMES.indexOf(baseNotes[si]);
    return NOTE_NAMES[(baseIdx + fret) % 12];
  }

  function pluck(si, fret, slideTo = null) {
    audioEngine.init().then(() => {
      audioEngine.playBass(fretFreq(si, fret), 0.85, slideTo);
      flashCell(si, fret);
      Storage.incrementNotes();
      Storage.addXP(1);
      UI.updateXPDisplay();
    });
  }

  function flashCell(si, fret) {
    const cell = document.querySelector(`#bassFretboard [data-string="${si}"][data-fret="${fret}"]`);
    if (!cell) return;
    const dot = cell.querySelector('.fret-dot');
    if (dot) {
      dot.classList.add('active');
      setTimeout(() => dot.classList.remove('active'), 600);
    }
  }

  function setFocusString(si) {
    focusString = Math.max(0, Math.min(STRING_NAMES.length - 1, si));
    document.querySelectorAll('#bassFretboard .string-row').forEach((row, i) => {
      // string rows are offset by the numRow at index 0
      const name = row.querySelector('.string-name');
      if (name) name.style.color = (parseInt(row.dataset.string) === focusString) ? 'var(--primary-lt)' : '';
    });
  }

  function build() {
    const fb = document.getElementById('bassFretboard');
    if (!fb || fb.children.length > 0) return;

    const numRow = document.createElement('div');
    numRow.style.cssText = 'display:flex;margin-left:36px;';
    for (let f = 0; f <= FRET_COUNT; f++) {
      const n = document.createElement('div');
      n.style.cssText = 'flex:1;text-align:center;font-size:0.65rem;color:var(--text-dim);padding:4px 0;';
      n.textContent = f === 0 ? 'Open' : f;
      numRow.appendChild(n);
    }
    fb.appendChild(numRow);

    const MARKERS = { 3:1, 5:1, 7:1, 9:1, 12:2 };

    STRING_NAMES.forEach((name, si) => {
      const row = document.createElement('div');
      row.className = 'string-row';
      row.dataset.string = si;

      // Thicker strings for bass visual
      const thickness = [4, 3.5, 3, 2.5][si];
      row.innerHTML = `<span class="string-name" style="font-weight:800;font-size:0.9rem">${name}</span>`;
      const line = document.createElement('div');
      line.className = 'string-line';
      line.style.height = thickness + 'px';
      line.style.background = `linear-gradient(90deg, #888, #ccc, #888)`;
      row.appendChild(line);

      for (let f = 0; f <= FRET_COUNT; f++) {
        const cell = document.createElement('div');
        cell.className = 'fret-cell';
        cell.style.height = '56px';
        cell.dataset.string = si;
        cell.dataset.fret   = f;
        const noteName = getNoteName(si, f);

        const dot = document.createElement('div');
        dot.className = 'fret-dot';
        dot.textContent = noteName;
        dot.style.cssText = 'font-size:0.6rem;width:36px;height:36px;border:1px solid var(--border-lg);color:var(--text-muted);';
        // Highlight root notes
        if (['E','A','D','G'].includes(noteName)) {
          dot.style.borderColor = 'var(--primary)';
          dot.style.color = 'var(--primary-lt)';
        }
        cell.appendChild(dot);
        row.appendChild(cell);
      }
      attachStringGestures(row, si);
      fb.appendChild(row);
    });

    // Fret markers
    const markerRow = document.createElement('div');
    markerRow.style.cssText = 'display:flex;margin-left:36px;';
    for (let f = 0; f <= FRET_COUNT; f++) {
      const m = document.createElement('div');
      m.style.cssText = 'flex:1;display:flex;justify-content:center;padding:6px 0;gap:4px;';
      if (MARKERS[f]) {
        const count = MARKERS[f];
        for (let d = 0; d < count; d++) {
          const dot = document.createElement('span');
          dot.style.cssText = 'width:7px;height:7px;border-radius:50%;background:var(--border-lg);display:inline-block;';
          m.appendChild(dot);
        }
      }
      markerRow.appendChild(m);
    }
    fb.appendChild(markerRow);

    setFocusString(0);

    // Hint
    const hint = document.createElement('div');
    hint.style.cssText = 'margin-top:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);font-size:0.82rem;color:var(--text-muted);';
    hint.innerHTML = `
      <strong style="color:var(--text)">Play</strong> &nbsp;Tap a fret to pluck · swipe across a string to <em>slide</em> between notes.<br>
      <strong style="color:var(--text)">Keyboard</strong> &nbsp;<kbd>1</kbd>–<kbd>4</kbd> open strings (E A D G) · <kbd>Q</kbd><kbd>W</kbd><kbd>E</kbd><kbd>R</kbd> frets 1–4 · <kbd>[</kbd> <kbd>]</kbd> change active string.
    `;
    fb.appendChild(hint);
  }

  /* ===== SLIDE GESTURE (swipe horizontally across a string) ===== */
  function attachStringGestures(row, si) {
    let start = null;   // { x, fret }
    let didSlide = false;

    row.addEventListener('pointerdown', e => {
      const cell = e.target.closest('.fret-cell');
      if (!cell) return;
      e.preventDefault();
      const fret = parseInt(cell.dataset.fret);
      start = { x: e.clientX, fret };
      didSlide = false;
      focusString = si;
      setFocusString(si);
      try { row.setPointerCapture(e.pointerId); } catch (_) {}
    }, { passive: false });

    row.addEventListener('pointermove', e => {
      if (!start || didSlide) return;
      const dx = e.clientX - start.x;
      // Slide if dragged across roughly one fret-cell width or more
      const cellW = (row.querySelector('.fret-cell')?.offsetWidth || 40);
      if (Math.abs(dx) >= cellW * 0.9) {
        const targetCell = document.elementFromPoint(e.clientX, e.clientY)?.closest('.fret-cell');
        let targetFret = start.fret + Math.round(dx / cellW);
        if (targetCell && targetCell.dataset.string == si) targetFret = parseInt(targetCell.dataset.fret);
        targetFret = Math.max(0, Math.min(FRET_COUNT, targetFret));
        if (targetFret !== start.fret) {
          didSlide = true;
          pluck(si, start.fret, fretFreq(si, targetFret)); // slide from start to target
          flashCell(si, targetFret);
        }
      }
    }, { passive: false });

    const finish = e => {
      if (start && !didSlide) {
        // No slide — a plain pluck of the pressed fret
        pluck(si, start.fret);
      }
      start = null;
      didSlide = false;
    };
    row.addEventListener('pointerup', finish);
    row.addEventListener('pointercancel', () => {
      row.querySelectorAll('.fret-dot.active').forEach(d => d.classList.remove('active'));
      start = null; didSlide = false;
    });
  }

  /* ===== KEYBOARD ===== */
  function kbDown(e) {
    if (Router.getCurrent() !== 'bass') return;
    if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const k = e.key.toLowerCase();
    if (k === '[') { setFocusString(focusString - 1); return; }
    if (k === ']') { setFocusString(focusString + 1); return; }
    if (k in OPEN_KEYS) { pluck(OPEN_KEYS[k], 0); return; }
    if (k in FRET_KEYS) { pluck(focusString, FRET_KEYS[k]); return; }
  }

  function init() {
    if (initialized) return;
    initialized = true;
    build();
    document.addEventListener('keydown', kbDown);
  }

  function destroy() {
    document.removeEventListener('keydown', kbDown);
    initialized = false;
  }

  return { init, destroy };
})();
