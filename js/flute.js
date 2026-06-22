/* ===================================================
   InstrumentVerse — flute.js
   Flute with sustained notes, vibrato, 2-octave range
   =================================================== */

const Flute = (() => {
  const NOTES_ROW1 = [
    {note:'C',oct:4},{note:'D',oct:4},{note:'E',oct:4},{note:'F',oct:4},
    {note:'G',oct:4},{note:'A',oct:4},{note:'B',oct:4},
    {note:'C',oct:5},{note:'D',oct:5},{note:'E',oct:5},{note:'F',oct:5},
    {note:'G',oct:5},{note:'A',oct:5},{note:'B',oct:5},{note:'C',oct:6}
  ];

  const KB_KEYS = ['a','s','d','f','g','h','j','k','l',';',"'",'z','x','c','v'];

  let activeNotes = {};
  let initialized = false;

  function build() {
    const wrap = document.getElementById('fluteWrap');
    if (!wrap || wrap.children.length > 0) return;

    const keyboard = document.createElement('div');
    keyboard.className = 'flute-keyboard';

    const row = document.createElement('div');
    row.className = 'flute-row';

    NOTES_ROW1.forEach((n, i) => {
      const freq = audioEngine.noteToFreq(n.note, n.oct);
      const kbd  = KB_KEYS[i] || '';
      const id   = n.note + n.oct;

      const key = document.createElement('div');
      key.className = 'flute-key';
      key.dataset.id   = id;
      key.dataset.freq = freq;
      key.innerHTML = `
        <span class="flute-key-note">${n.note}</span>
        <span class="flute-key-oct">${n.oct}</span>
        ${kbd ? `<span class="flute-key-kbd">${kbd.toUpperCase()}</span>` : ''}
      `;

      const start = () => {
        audioEngine.init().then(() => {
          if (activeNotes[id]) return;
          const nd = audioEngine.playFlute(freq, 0.75);
          activeNotes[id] = nd;
          key.classList.add('pressed');
          Storage.incrementNotes();
          Storage.addXP(1);
          UI.updateXPDisplay();
        });
      };

      const stop = () => {
        if (activeNotes[id]) {
          audioEngine.stopFlute(activeNotes[id]);
          delete activeNotes[id];
          key.classList.remove('pressed');
        }
      };

      key.addEventListener('pointerdown', e => { e.preventDefault(); start(); });
      key.addEventListener('pointerup',   stop);
      key.addEventListener('pointerleave',stop);
      row.appendChild(key);
    });

    keyboard.appendChild(row);
    wrap.appendChild(keyboard);

    // Info panel
    const info = document.createElement('div');
    info.style.cssText = 'margin-top:20px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);font-size:0.82rem;';
    info.innerHTML = `
      <div style="font-weight:700;margin-bottom:6px;">Keyboard: <span style="color:var(--text-muted)">A S D F G H J K L ; ' Z X C V</span></div>
      <div style="color:var(--text-muted)">Hold keys for sustained notes. Vibrato applies automatically.</div>
    `;
    wrap.appendChild(info);
  }

  function kbDown(e) {
    if (Router.getCurrent() !== 'flute') return;
    if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const idx = KB_KEYS.indexOf(e.key.toLowerCase());
    if (idx < 0) return;
    const n   = NOTES_ROW1[idx];
    if (!n) return;
    const id  = n.note + n.oct;
    const key = document.querySelector(`#fluteWrap [data-id="${id}"]`);
    if (key) key.dispatchEvent(new PointerEvent('pointerdown'));
  }

  function kbUp(e) {
    if (Router.getCurrent() !== 'flute') return;
    const idx = KB_KEYS.indexOf(e.key.toLowerCase());
    if (idx < 0) return;
    const n = NOTES_ROW1[idx];
    if (!n) return;
    const id = n.note + n.oct;
    if (activeNotes[id]) {
      audioEngine.stopFlute(activeNotes[id]);
      delete activeNotes[id];
    }
    const key = document.querySelector(`#fluteWrap [data-id="${id}"]`);
    if (key) key.classList.remove('pressed');
  }

  function init() {
    if (initialized) return;
    initialized = true;
    build();
    document.addEventListener('keydown', kbDown);
    document.addEventListener('keyup',   kbUp);
  }

  function destroy() {
    Object.values(activeNotes).forEach(nd => audioEngine.stopFlute(nd, 0.05));
    activeNotes = {};
    document.removeEventListener('keydown', kbDown);
    document.removeEventListener('keyup',   kbUp);
    initialized = false;
  }

  return { init, destroy };
})();
