/* ===================================================
   InstrumentVerse — drums.js
   Full drum kit with 9 pads, keyboard mapping, velocity
   =================================================== */

const Drums = (() => {
  const PADS = [
    { id:'crash1', name:'Crash L', key:'Q', kbd:'q', fn:'playCrash',   gridArea:'crash1', color:'#1e8449' },
    { id:'hihat',  name:'Hi-Hat', key:'W', kbd:'w', fn:'playHihat',   gridArea:'hihat',  color:'#1a5276', openKey:'E', openKbd:'e' },
    { id:'ride',   name:'Ride',   key:'R', kbd:'r', fn:'playRide',    gridArea:'ride',   color:'#117a65' },
    { id:'crash2', name:'Crash R', key:'T', kbd:'t', fn:'playCrash',  gridArea:'crash2', color:'#1e8449' },
    { id:'tom1',   name:'Tom 1',  key:'U', kbd:'u', fn:'playTom',    gridArea:'tom1',   color:'#784212', freq:300 },
    { id:'tom2',   name:'Tom 2',  key:'I', kbd:'i', fn:'playTom',    gridArea:'tom2',   color:'#784212', freq:220 },
    { id:'tom3',   name:'Tom 3',  key:'O', kbd:'o', fn:'playTom',    gridArea:'tom3',   color:'#784212', freq:160 },
    { id:'snare',  name:'Snare',  key:'D', kbd:'d', fn:'playSnare',  gridArea:'snare',  color:'#8e44ad' },
    { id:'kick',   name:'Kick',   key:'J', kbd:'j', fn:'playKick',   gridArea:'kick',   color:'#c0392b' },
    { id:'floor',  name:'Floor',  key:'K', kbd:'k', fn:'playTom',    gridArea:'floor',  color:'#935116', freq:100 },
  ];

  const KB_MAP = {};
  PADS.forEach(p => { KB_MAP[p.kbd] = p.id; if (p.openKbd) KB_MAP[p.openKbd] = p.id + '_open'; });

  let initialized = false;
  let volume = 0.8;
  let hitCount = 0;

  function buildKit() {
    const kit = document.getElementById('drumsKit');
    if (!kit || kit.children.length > 0) return;

    PADS.forEach(pad => {
      const el = document.createElement('div');
      el.className = `drum-pad drum-${pad.id}`;
      el.id = 'pad-' + pad.id;
      el.dataset.pad = pad.id;
      el.style.gridArea = pad.gridArea;
      el.innerHTML = `
        <span class="drum-name">${pad.name}</span>
        <span class="drum-key">${pad.key}${pad.openKey ? '/' + pad.openKey : ''}</span>
      `;

      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        // Rough velocity from tap speed / position
        const vel = Math.min(1, 0.6 + Math.random() * 0.35);
        audioEngine.init().then(() => triggerPad(pad, vel, false));
      });

      kit.appendChild(el);
    });
  }

  function triggerPad(pad, velocity = 0.8, open = false) {
    const v = velocity * volume;
    switch (pad.fn) {
      case 'playKick':   audioEngine.playKick(v); break;
      case 'playSnare':  audioEngine.playSnare(v); break;
      case 'playCrash':  audioEngine.playCrash(v); break;
      case 'playRide':   audioEngine.playRide(v); break;
      case 'playTom':    audioEngine.playTom(pad.freq || 120, v); break;
      case 'playHihat':  audioEngine.playHihat(open, v); break;
    }

    const el = document.getElementById('pad-' + pad.id);
    if (el) {
      el.classList.add('hit');
      setTimeout(() => el.classList.remove('hit'), 120);
    }

    hitCount++;
    Storage.incrementNotes();
    if (hitCount % 10 === 0) { Storage.addXP(2); UI.updateXPDisplay(); }

    if (hitCount === 1)    { if (Storage.unlockAchievement('first_drum')) UI.showAchievement('First Beat!', '🥁'); }
    if (hitCount === 500)  { if (Storage.unlockAchievement('drum_master')) UI.showAchievement('Drum Machine!', '🎵'); }
  }

  function triggerById(id, velocity = 0.75) {
    const open = id.endsWith('_open');
    const cleanId = open ? id.replace('_open','') : id;
    const pad = PADS.find(p => p.id === cleanId);
    if (pad) triggerPad(pad, velocity, open);
  }

  // For beat maker external use
  function triggerByName(name, velocity = 0.75) {
    const nameMap = {
      'kick': 'kick', 'snare': 'snare', 'hihat': 'hihat', 'openhat': 'hihat_open',
      'crash': 'crash1', 'ride': 'ride', 'tom1': 'tom1', 'tom2': 'tom2',
      'floor': 'floor', 'clap': 'snare'
    };
    const id = nameMap[name.toLowerCase()];
    if (id) triggerById(id, velocity);
    else if (name === 'clap') audioEngine.playClap(velocity * volume);
  }

  function kbDown(e) {
    if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const id = KB_MAP[e.key.toLowerCase()];
    if (!id) return;
    audioEngine.init().then(() => triggerById(id, 0.8));
  }

  function init() {
    if (initialized) return;
    initialized = true;

    buildKit();
    document.addEventListener('keydown', kbDown);

    const volSlider = document.getElementById('drumsVolume');
    if (volSlider) {
      volSlider.addEventListener('input', e => { volume = parseInt(e.target.value) / 100; });
    }
  }

  function destroy() {
    document.removeEventListener('keydown', kbDown);
    initialized = false;
  }

  return { init, destroy, triggerByName };
})();
