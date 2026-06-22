/* ===================================================
   InstrumentVerse — bass.js
   Bass guitar fretboard (E1 A1 D2 G2 standard tuning)
   =================================================== */

const Bass = (() => {
  const OPEN_FREQS = [41.20, 55.00, 73.42, 98.00]; // E1 A1 D2 G2
  const STRING_NAMES = ['E', 'A', 'D', 'G'];
  const FRET_COUNT = 12;
  let initialized = false;

  const NOTE_NAMES = ['E','F','F#','G','G#','A','A#','B','C','C#','D','D#'];
  const BASS_RIFFS = {
    'C walk': [[0,3],[0,1],[1,3],[0,3]],  // simple C walk
    'Blues':  [[0,0],[0,3],[1,0],[1,3]],
  };

  function fretFreq(si, fret) {
    return OPEN_FREQS[si] * Math.pow(2, fret / 12);
  }

  function getNoteName(si, fret) {
    const baseNotes = ['E','A','D','G'];
    const baseIdx   = NOTE_NAMES.indexOf(baseNotes[si]);
    return NOTE_NAMES[(baseIdx + fret) % 12];
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
        const freq = fretFreq(si, f);
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

        cell.addEventListener('pointerdown', e => {
          e.preventDefault();
          audioEngine.init().then(() => {
            audioEngine.playBass(freq, 0.85);
            dot.classList.add('active');
            setTimeout(() => dot.classList.remove('active'), 600);
            Storage.incrementNotes();
            Storage.addXP(1);
            UI.updateXPDisplay();
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
  }

  function init() {
    if (initialized) return;
    initialized = true;
    build();
  }

  function destroy() { initialized = false; }

  return { init, destroy };
})();
