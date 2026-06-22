/* ===================================================
   InstrumentVerse — piano.js
   3-octave piano with keyboard mapping and sustain
   =================================================== */

const Piano = (() => {
  const KEY_MAP = {
    'a':'C','w':'C#','s':'D','e':'D#','d':'E','f':'F',
    't':'F#','g':'G','y':'G#','h':'A','u':'A#','j':'B',
    'k':'C+','o':'C#+','l':'D+','p':'D#+',';':'E+'
  };
  const WHITE_NOTES = ['C','D','E','F','G','A','B'];
  const BLACK_NOTES = ['C#','D#',null,'F#','G#','A#',null];

  let baseOctave = 3;
  let sustain = false;
  let activeNotes = {};
  let sustainedNotes = {};
  let initialized = false;
  let noteCount = 0;
  let sessionStart = null;

  function noteToFreq(note, octave) {
    const n = note.replace('+','');
    const o = note.endsWith('+') ? octave + 1 : octave;
    return audioEngine.noteToFreq(n, o);
  }

  function buildKeyboard() {
    const container = document.getElementById('pianoKeyboard');
    if (!container || container.children.length > 0) return;

    const noteOrder = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const octaves = [baseOctave, baseOctave + 1, baseOctave + 2];

    let html = '';
    octaves.forEach(oct => {
      noteOrder.forEach(note => {
        const isBlack = note.includes('#');
        const dataNote = note;
        const freq = audioEngine.noteToFreq(note, oct);
        const kbd = Object.keys(KEY_MAP).find(k => {
          const kn = KEY_MAP[k];
          const ko = kn.endsWith('+') ? baseOctave + 1 : baseOctave;
          const kNote = kn.replace('+','');
          if (ko === oct && kNote === note) return true;
          // higher octave
          if (oct === baseOctave + 1 && kn.endsWith('+') && kNote === note) return true;
          return false;
        }) || '';

        html += `<div class="piano-key ${isBlack ? 'black' : 'white'}"
          data-note="${note}" data-octave="${oct}" data-freq="${freq.toFixed(2)}">
          <span class="key-label">${kbd ? kbd.toUpperCase() : ''}<br><span style="font-size:0.5rem">${note}${oct}</span></span>
        </div>`;
      });
    });
    // Final C
    const finalOct = baseOctave + 3;
    html += `<div class="piano-key white" data-note="C" data-octave="${finalOct}" data-freq="${audioEngine.noteToFreq('C', finalOct).toFixed(2)}">
      <span class="key-label"><span style="font-size:0.5rem">C${finalOct}</span></span>
    </div>`;

    container.innerHTML = html;
    bindKeyEvents(container);
  }

  function rebuildKeyboard() {
    const container = document.getElementById('pianoKeyboard');
    if (container) container.innerHTML = '';
    buildKeyboard();
  }

  function bindKeyEvents(container) {
    // Pointer events (mouse + touch)
    container.addEventListener('pointerdown', e => {
      const key = e.target.closest('.piano-key');
      if (!key) return;
      e.preventDefault();
      audioEngine.init().then(() => playKey(key, 0.8));
      key.setPointerCapture(e.pointerId);
    });

    container.addEventListener('pointerup', e => {
      const key = e.target.closest('.piano-key');
      if (!key) return;
      stopKey(key);
    });

    container.addEventListener('pointerleave', e => {
      const key = e.target.closest('.piano-key');
      if (key) stopKey(key);
    }, true);

    container.addEventListener('pointermove', e => {
      // slide play
    });
  }

  function playKey(key, velocity = 0.8) {
    const note = key.dataset.note;
    const oct  = parseInt(key.dataset.octave);
    const id   = note + oct;
    if (activeNotes[id]) return;
    const freq = parseFloat(key.dataset.freq);
    const nd = audioEngine.playPiano(freq, velocity, sustain);
    activeNotes[id] = nd;
    key.classList.add('pressed');
    noteCount++;
    Storage.incrementNotes();
    checkAchievements();

    if (sustain) {
      sustainedNotes[id] = { nd, key };
    }
  }

  function stopKey(key) {
    const note = key.dataset.note;
    const oct  = parseInt(key.dataset.octave);
    const id   = note + oct;
    if (!activeNotes[id]) return;
    if (!sustain) {
      audioEngine.stopPiano(activeNotes[id]);
    }
    delete activeNotes[id];
    key.classList.remove('pressed');
  }

  function stopSustained() {
    Object.entries(sustainedNotes).forEach(([id, {nd, key}]) => {
      audioEngine.stopPiano(nd);
      key.classList.remove('pressed');
    });
    sustainedNotes = {};
  }

  function keyboardHandler(e) {
    if (Router.getCurrent() !== 'piano') return;
    if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const key = e.key.toLowerCase();

    if (key === 'z') { baseOctave = Math.max(0, baseOctave - 1); rebuildKeyboard(); UI.toast('Octave ' + baseOctave); return; }
    if (key === 'x') { baseOctave = Math.min(6, baseOctave + 1); rebuildKeyboard(); UI.toast('Octave ' + baseOctave); return; }

    const noteKey = KEY_MAP[key];
    if (!noteKey) return;

    const note = noteKey.replace('+','');
    const oct  = noteKey.endsWith('+') ? baseOctave + 1 : baseOctave;
    const el   = document.querySelector(`#pianoKeyboard .piano-key[data-note="${note}"][data-octave="${oct}"]`);
    if (el) {
      audioEngine.init().then(() => playKey(el, 0.75));
    }
  }

  function keyupHandler(e) {
    if (Router.getCurrent() !== 'piano') return;
    const key = e.key.toLowerCase();
    const noteKey = KEY_MAP[key];
    if (!noteKey) return;
    const note = noteKey.replace('+','');
    const oct  = noteKey.endsWith('+') ? baseOctave + 1 : baseOctave;
    const el   = document.querySelector(`#pianoKeyboard .piano-key[data-note="${note}"][data-octave="${oct}"]`);
    if (el) stopKey(el);
  }

  function checkAchievements() {
    if (noteCount === 1)    { if (Storage.unlockAchievement('first_note')) UI.showAchievement('First Note!', '🎹'); }
    if (noteCount === 100)  { if (Storage.unlockAchievement('hundred_notes')) UI.showAchievement('100 Notes Played!', '🎵'); }
    if (noteCount === 1000) { if (Storage.unlockAchievement('thousand_notes')) UI.showAchievement('1000 Notes!', '🏆'); }
  }

  function init() {
    if (initialized) return;
    initialized = true;

    buildKeyboard();
    sessionStart = Date.now();

    // Octave select
    const octSel = document.getElementById('pianoOctaveSelect');
    if (octSel) {
      octSel.value = baseOctave;
      octSel.addEventListener('change', e => {
        baseOctave = parseInt(e.target.value);
        rebuildKeyboard();
      });
    }

    // Sustain checkbox
    const sustainChk = document.getElementById('pianoSustain');
    if (sustainChk) {
      sustainChk.addEventListener('change', e => {
        sustain = e.target.checked;
        if (!sustain) stopSustained();
      });
    }

    // Reverb checkbox
    const reverbChk = document.getElementById('pianoReverb');
    if (reverbChk) {
      reverbChk.addEventListener('change', e => {
        audioEngine.setReverb(e.target.checked ? 0.35 : 0.12);
      });
    }

    document.addEventListener('keydown', keyboardHandler);
    document.addEventListener('keyup', keyupHandler);
  }

  function destroy() {
    document.removeEventListener('keydown', keyboardHandler);
    document.removeEventListener('keyup', keyupHandler);
    if (sessionStart) {
      Storage.addInstrumentTime('piano', (Date.now() - sessionStart) / 1000);
    }
    initialized = false;
  }

  return { init, destroy };
})();
