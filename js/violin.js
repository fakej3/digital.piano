/* ===================================================
   InstrumentVerse — violin.js
   Violin with 4 strings, continuous bowed notes
   =================================================== */

const Violin = (() => {
  // G3 D4 A4 E5
  const STRINGS = [
    { name:'G', baseFreq: 196.00, midi: 55 },
    { name:'D', baseFreq: 293.66, midi: 62 },
    { name:'A', baseFreq: 440.00, midi: 69 },
    { name:'E', baseFreq: 659.26, midi: 76 }
  ];

  const NOTES_PER_STRING = 8; // fingering positions (0=open, 1-7 = half steps)

  // Keyboard layout for violin
  const KB_MAP = {
    // String G: keys 1-8
    '1':'G0','2':'G1','3':'G2','4':'G3','5':'G4','6':'G5','7':'G6','8':'G7',
    // String D: Q-I
    'q':'D0','w':'D1','e':'D2','r':'D3','t':'D4','y':'D5','u':'D6','i':'D7',
    // String A: A-'
    'a':'A0','s':'A1','d':'A2','f':'A3','g':'A4','h':'A5','j':'A6','k':'A7',
    // String E: Z-,
    'z':'E0','x':'E1','c':'E2','v':'E3','b':'E4','n':'E5','m':'E6',',':'E7'
  };

  let activeNotes = {};
  let initialized = false;

  const NOTE_NAMES = ['G','G#','A','A#','B','C','C#','D','D#','E','F','F#'];

  function fretToFreq(stringIdx, fret) {
    return STRINGS[stringIdx].baseFreq * Math.pow(2, fret / 12);
  }

  function fretToNoteName(stringIdx, fret) {
    const baseNote = ['G','D','A','E'][stringIdx];
    const baseIdx  = NOTE_NAMES.indexOf(baseNote);
    return NOTE_NAMES[(baseIdx + fret) % 12];
  }

  function build() {
    const wrap = document.getElementById('violinWrap');
    if (!wrap || wrap.children.length > 0) return;

    wrap.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'violin-strings';

    STRINGS.forEach((str, si) => {
      const row = document.createElement('div');
      row.className = 'violin-string-row';

      const label = document.createElement('div');
      label.className = 'violin-string-name';
      label.textContent = str.name;
      row.appendChild(label);

      const keys = document.createElement('div');
      keys.className = 'violin-string-keys';

      for (let fret = 0; fret <= NOTES_PER_STRING; fret++) {
        const freq = fretToFreq(si, fret);
        const noteName = fretToNoteName(si, fret);
        const octave = Math.floor(str.midi / 12) - 1 + Math.floor(fret / 12);
        const id = str.name + fret;

        // Find keyboard mapping
        const kbKey = Object.keys(KB_MAP).find(k => KB_MAP[k] === str.name + fret) || '';

        const btn = document.createElement('div');
        btn.className = 'violin-key';
        btn.dataset.id = id;
        btn.dataset.freq = freq;
        btn.innerHTML = `
          <span class="violin-key-note">${noteName}</span>
          ${fret === 0 ? '<span style="font-size:0.6rem;color:var(--text-dim)">open</span>' : ''}
          ${kbKey ? `<span class="violin-key-kbd">${kbKey.toUpperCase()}</span>` : ''}
        `;

        btn.addEventListener('pointerdown', e => {
          e.preventDefault();
          audioEngine.init().then(() => {
            if (!activeNotes[id]) {
              const nd = audioEngine.playViolin(freq, 0.75);
              activeNotes[id] = nd;
              btn.classList.add('pressed');
              Storage.incrementNotes();
            }
          });
        });

        const stop = () => {
          if (activeNotes[id]) {
            audioEngine.stopViolin(activeNotes[id]);
            delete activeNotes[id];
            btn.classList.remove('pressed');
          }
        };
        btn.addEventListener('pointerup', stop);
        btn.addEventListener('pointerleave', stop);

        keys.appendChild(btn);
      }

      row.appendChild(keys);
      container.appendChild(row);
    });

    const hint = document.createElement('div');
    hint.style.cssText = 'margin-top:16px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);font-size:0.82rem;color:var(--text-muted);';
    hint.innerHTML = `
      <strong style="color:var(--text)">Keyboard Shortcuts</strong><br>
      <span style="color:var(--text-dim)">String G: 1-8 &nbsp;|&nbsp; String D: Q-I &nbsp;|&nbsp; String A: A-K &nbsp;|&nbsp; String E: Z-,</span><br>
      <span style="color:var(--text-dim)">Hold keys for bowed sustain effect</span>
    `;
    wrap.appendChild(container);
    wrap.appendChild(hint);
  }

  function kbDown(e) {
    if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const key = e.key.toLowerCase();
    const mapped = KB_MAP[key];
    if (!mapped) return;
    const btn = document.querySelector(`#violinWrap [data-id="${mapped}"]`);
    if (btn) btn.dispatchEvent(new PointerEvent('pointerdown'));
  }

  function kbUp(e) {
    const key = e.key.toLowerCase();
    const mapped = KB_MAP[key];
    if (!mapped) return;
    if (activeNotes[mapped]) {
      audioEngine.stopViolin(activeNotes[mapped]);
      delete activeNotes[mapped];
    }
    const btn = document.querySelector(`#violinWrap [data-id="${mapped}"]`);
    if (btn) btn.classList.remove('pressed');
  }

  function init() {
    if (initialized) return;
    initialized = true;
    build();
    document.addEventListener('keydown', kbDown);
    document.addEventListener('keyup', kbUp);
  }

  function destroy() {
    Object.values(activeNotes).forEach(nd => audioEngine.stopViolin(nd, 0.05));
    activeNotes = {};
    document.removeEventListener('keydown', kbDown);
    document.removeEventListener('keyup', kbUp);
    initialized = false;
  }

  return { init, destroy };
})();
