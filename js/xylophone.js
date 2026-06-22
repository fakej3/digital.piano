/* ===================================================
   InstrumentVerse — xylophone.js
   Xylophone: C4–F6 range, rainbow bars
   =================================================== */

const Xylophone = (() => {
  const NOTES = [
    {note:'C', oct:4}, {note:'D', oct:4}, {note:'E', oct:4}, {note:'F', oct:4},
    {note:'G', oct:4}, {note:'A', oct:4}, {note:'B', oct:4},
    {note:'C', oct:5}, {note:'D', oct:5}, {note:'E', oct:5}, {note:'F', oct:5},
    {note:'G', oct:5}, {note:'A', oct:5}, {note:'B', oct:5},
    {note:'C', oct:6}
  ];

  const KB_KEYS = ['1','2','3','4','5','6','7','8','9','0','q','w','e','r','t'];

  let initialized = false;

  const NOTE_HEIGHTS = {
    'C':180,'D':172,'E':164,'F':160,'G':152,'A':144,'B':136
  };

  function build() {
    const wrap = document.getElementById('xylophoneWrap');
    if (!wrap || wrap.children.length > 0) return;

    const inst = document.createElement('div');
    inst.className = 'mallet-instrument';
    wrap.appendChild(inst);

    NOTES.forEach((n, i) => {
      const freq = audioEngine.noteToFreq(n.note, n.oct);
      const height = (NOTE_HEIGHTS[n.note] || 160) + (5 - n.oct) * 20;
      const kbd = KB_KEYS[i] || '';

      const bar = document.createElement('div');
      bar.className = `mallet-bar xyl-bar-${i % 14}`;
      bar.dataset.freq = freq;
      bar.dataset.idx = i;
      bar.innerHTML = `
        <div class="bar-body" style="height:${Math.max(100, height)}px;">
          ${n.note}${n.oct}
        </div>
        <span class="bar-kbd">${kbd.toUpperCase()}</span>
      `;

      const touch = () => {
        audioEngine.init().then(() => {
          audioEngine.playMallet(freq, 0.85, false);
          bar.classList.add('hit');
          setTimeout(() => bar.classList.remove('hit'), 150);
          Storage.incrementNotes();
          Storage.addXP(1);
          UI.updateXPDisplay();
        });
      };

      bar.addEventListener('pointerdown', e => { e.preventDefault(); touch(); });
      bar.addEventListener('pointercancel', () => bar.classList.remove('hit'));
      inst.appendChild(bar);
    });
  }

  function kbDown(e) {
    if (Router.getCurrent() !== 'xylophone') return;
    if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const idx = KB_KEYS.indexOf(e.key.toLowerCase());
    if (idx < 0) return;
    const bar = document.querySelector(`#xylophoneWrap [data-idx="${idx}"]`);
    if (bar) bar.dispatchEvent(new PointerEvent('pointerdown'));
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
