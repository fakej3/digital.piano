# Audit Changelog
**Date:** 2026-06-22

All changes made during the production-readiness audit. No UI redesign or feature additions — fixes only.

---

## js/audio-engine.js

**Fix C-1: Organ gain was 0.001 (inaudible) → 1.0**
- `playOrgan()`: Changed `g.gain.linearRampToValueAtTime(0.001, t + 0.003)` to `linearRampToValueAtTime(1.0, t + 0.015)`
- Ramp duration extended from 3ms to 15ms for a natural attack onset

---

## js/piano.js

**Fix C-2: Scoped keyboard handler to piano page only**
- `keyboardHandler()`: Added `if (Router.getCurrent() !== 'piano') return;` as first line
- `keyupHandler()`: Added `if (Router.getCurrent() !== 'piano') return;` as first line

---

## js/synth.js

**Fix C-2: Scoped keyboard handlers to synth page only**
- `kbDown()`: Added `if (Router.getCurrent() !== 'synth') return;` as first line
- `kbUp()`: Added `if (Router.getCurrent() !== 'synth') return;` as first line

---

## js/organ.js

**Fix C-2: Scoped keyboard handlers to organ page only**
- `kbDown()`: Added `if (Router.getCurrent() !== 'organ') return;` as first line
- `kbUp()`: Added `if (Router.getCurrent() !== 'organ') return;` as first line

---

## js/violin.js

**Fix C-2: Scoped keyboard handlers to violin page only**
- `kbDown()`: Added `if (Router.getCurrent() !== 'violin') return;` as first line
- `kbUp()`: Added `if (Router.getCurrent() !== 'violin') return;` as first line

---

## js/flute.js

**Fix C-2: Scoped keyboard handlers to flute page only**
- `kbDown()`: Added `if (Router.getCurrent() !== 'flute') return;` as first line
- `kbUp()`: Added `if (Router.getCurrent() !== 'flute') return;` as first line

---

## js/drums.js

**Fix C-2: Scoped keyboard handler to drums page only**
- `kbDown()`: Added `if (Router.getCurrent() !== 'drums') return;` as first line

---

## js/recorder.js

**Fix H-1: Removed duplicate AudioContext leak**
- `startRecording()`: Replaced `const tmpCtx = new AudioContext()` with `await audioEngine.init()` followed by `audioEngine.ctx`
- The shared AudioEngine context is now used for waveform visualization instead of creating a second context

---

## js/beatmaker.js

**Fix H-3: Eliminated innerHTML += pattern that destroyed play button listener**
- `build()`: Replaced `controls.innerHTML += '<div class="bm-bpm-group">...</div>'` with explicit `document.createElement('div')` + `appendChild()`
- BPM slider event listener is now bound directly before DOM insertion (no setTimeout needed)
- Removed two `setTimeout(..., 50)` workarounds: one for re-attaching the play button listener, one for finding the slider after innerHTML rewrite
- Play button retains its `togglePlay` listener throughout the component lifecycle

---

## js/app.js

**Fix H-2 + C-2: Added instrument cleanup on page navigation**
- `setupRoutes()`: Added `cleanupMap` object mapping instrument page names to their `destroy()` calls
- `Router.onChange` callback tracks the previous page and calls its `destroy()` when navigating away
- Instruments affected: piano, synth, organ, violin, flute, drums
- Effect: active sustained notes are stopped; keyboard handlers are removed on navigation; instrument modules reset `initialized` flag for clean re-entry on next visit
