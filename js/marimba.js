/* ===================================================
   InstrumentVerse — marimba.js
   Marimba: C3–F5 range, warm mallet tone, earth-tone bars
   =================================================== */

const Marimba = (() => {
  const NOTES = [
    {note:'C', oct:3}, {note:'D', oct:3}, {note:'E', oct:3}, {note:'F', oct:3},
    {note:'G', oct:3}, {note:'A', oct:3}, {note:'B', oct:3},
    {note:'C', oct:4}, {note:'D', oct:4}, {note:'E', oct:4}, {note:'F', oct:4},
    {note:'G', oct:4}, {note:'A', oct:4}, {note:'B', oct:4},
    {note:'C', oct:5}
  ];

  const KB_KEYS = ['1','2','3','4','5','6','7','8','9','0','q','w','e','r','t'];

  // Larger bars for lower notes
  const BASE_HEIGHTS = [220,212,204,196,188,180,172, 164,156,148,140,132,124,116,108];

  let initialized = false;

  function build() {
    const wrap = document.getElementById('marimbaWrap');
    if (!wrap || wrap.children.length > 0) return;

    const inst = document.createElement('div');
    inst.className = 'mallet-instrument';
    wrap.appendChild(inst);

    NOTES.forEach((n, i) => {
      const freq  = audioEngine.noteToFreq(n.note, n.oct);
      const kbd   = KB_KEYS[i] || '';
      const height = BASE_HEIGHTS[i] || 150;

      const bar = document.createElement('div');
      bar.className = `mallet-bar mar-bar-${i % 14}`;
      bar.dataset.freq = freq;
      bar.dataset.idx  = i;
      bar.innerHTML = `
        <div class="bar-body" style="height:${height}px;width:52px;">
          ${n.note}${n.oct}
        </div>
        <span class="bar-kbd">${kbd.toUpperCase()}</span>
      `;

      const play = () => {
        audioEngine.init().then(() => {
          audioEngine.playMallet(freq, 0.8, true); // warm=true for marimba
          bar.classList.add('hit');
          setTimeout(() => bar.classList.remove('hit'), 200);
          Storage.incrementNotes();
          Storage.addXP(1);
          UI.updateXPDisplay();
        });
      };

      bar.addEventListener('pointerdown', e => { e.preventDefault(); play(); });
      bar.addEventListener('pointercancel', () => bar.classList.remove('hit'));
      inst.appendChild(bar);
    });
  }

  function kbDown(e) {
    if (Router.getCurrent() !== 'marimba') return;
    if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const idx = KB_KEYS.indexOf(e.key.toLowerCase());
    if (idx < 0) return;
    const bar = document.querySelector(`#marimbaWrap [data-idx="${idx}"]`);
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
