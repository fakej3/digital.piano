/* ===================================================
   InstrumentVerse — audio-engine.js
   Centralized Web Audio API engine for all instruments
   =================================================== */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.convolver = null;
    this.dryGain = null;
    this.wetGain = null;
    this._volume = 0.8;
    this._reverb = 0.12;
    this.initialized = false;
    this.activeNotes = new Map();
  }

  async init() {
    if (this.initialized) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return;
    }
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 44100
      });

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -20;
      this.compressor.knee.value = 25;
      this.compressor.ratio.value = 6;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.2;

      this.dryGain  = this.ctx.createGain();
      this.wetGain  = this.ctx.createGain();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._volume;

      this.dryGain.gain.value = 1 - this._reverb;
      this.wetGain.gain.value = this._reverb;

      this.convolver = this.ctx.createConvolver();
      this.convolver.buffer = this._makeReverb(1.5, 2.5);

      this.compressor.connect(this.dryGain);
      this.compressor.connect(this.convolver);
      this.convolver.connect(this.wetGain);
      this.dryGain.connect(this.masterGain);
      this.wetGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.initialized = true;
      if (this.ctx.state === 'suspended') await this.ctx.resume();
    } catch(e) {
      console.warn('AudioEngine init failed:', e);
    }
  }

  get out() { return this.compressor; }
  get now() { return this.ctx ? this.ctx.currentTime : 0; }

  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this._volume, this.now, 0.02);
    }
  }

  setReverb(v) {
    this._reverb = Math.max(0, Math.min(1, v));
    if (this.dryGain) {
      this.dryGain.gain.setTargetAtTime(1 - this._reverb, this.now, 0.05);
      this.wetGain.gain.setTargetAtTime(this._reverb, this.now, 0.05);
    }
  }

  _makeReverb(duration, decay) {
    const sr = this.ctx.sampleRate;
    const len = Math.floor(sr * duration);
    const buf = this.ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  _noise(dur) {
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /* ===== PIANO ===== */
  playPiano(freq, velocity = 0.8, sustain = false) {
    const { ctx } = this;
    const t = this.now;
    const dur = sustain ? 8 : Math.max(0.5, 3.5 - Math.log2(freq / 27.5) * 0.25);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(velocity * 0.9, t + 0.004);
    g.gain.exponentialRampToValueAtTime(velocity * 0.5, t + 0.06);
    g.gain.exponentialRampToValueAtTime(velocity * 0.28, t + 0.4);
    if (!sustain) g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    const harmonics = [1, 2, 3, 4, 6, 8];
    const amps     = [0.55, 0.22, 0.10, 0.06, 0.04, 0.03];
    const oscs = [];

    harmonics.forEach((h, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? 'triangle' : 'sine';
      o.frequency.value = freq * h;
      if (i === 0) o.detune.value = -3;
      const mg = ctx.createGain();
      mg.gain.value = amps[i];
      o.connect(mg); mg.connect(g);
      o.start(t);
      o.stop(t + dur + 0.5);
      oscs.push(o);
    });

    g.connect(this.out);
    return { g, oscs, t, dur };
  }

  stopPiano(nd, release = 0.25) {
    if (!nd) return;
    const t = this.now;
    nd.g.gain.cancelScheduledValues(t);
    nd.g.gain.setValueAtTime(nd.g.gain.value, t);
    nd.g.gain.exponentialRampToValueAtTime(0.0001, t + release);
    nd.oscs.forEach(o => { try { o.stop(t + release + 0.02); } catch(_) {} });
  }

  /* ===== GUITAR / PLUCKED STRING ===== */
  playGuitar(freq, velocity = 0.8, bright = true) {
    const { ctx } = this;
    const t = this.now;
    const dur = Math.max(1.2, 4.5 - freq / 250);

    // Karplus-Strong approximation: burst noise + LP filter + decay
    const N = Math.round(ctx.sampleRate / freq);
    const excit = ctx.createBuffer(1, N, ctx.sampleRate);
    const ed = excit.getChannelData(0);
    for (let i = 0; i < N; i++) ed[i] = (Math.random() * 2 - 1) * velocity;

    const src = ctx.createBufferSource();
    src.buffer = excit;
    src.loop = true;

    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = bright ? Math.min(freq * 8, 6000) : Math.min(freq * 4, 2000);
    flt.Q.value = 0.3;

    const g = ctx.createGain();
    g.gain.setValueAtTime(velocity * 0.6, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    src.connect(flt); flt.connect(g); g.connect(this.out);
    src.start(t); src.stop(t + dur);
  }

  /* ===== BASS ===== */
  playBass(freq, velocity = 0.8) {
    const { ctx } = this;
    const t = this.now;
    const dur = 2.8;

    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = 'sawtooth';
    o2.type = 'square';
    o1.frequency.value = freq;
    o2.frequency.value = freq;

    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(freq * 6, t);
    flt.frequency.exponentialRampToValueAtTime(freq * 2, t + 0.3);
    flt.Q.value = 2;

    const m1 = ctx.createGain(); m1.gain.value = 0.65;
    const m2 = ctx.createGain(); m2.gain.value = 0.35;
    const g  = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(velocity * 0.75, t + 0.01);
    g.gain.exponentialRampToValueAtTime(velocity * 0.4, t + 0.18);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    o1.connect(m1); m1.connect(flt);
    o2.connect(m2); m2.connect(flt);
    flt.connect(g); g.connect(this.out);

    o1.start(t); o1.stop(t + dur);
    o2.start(t); o2.stop(t + dur);
  }

  /* ===== VIOLIN / BOWED ===== */
  playViolin(freq, velocity = 0.8) {
    const { ctx } = this;
    const t = this.now;

    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = freq;

    const lfo = ctx.createOscillator();
    const lfog = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 5.5;
    lfog.gain.value = freq * 0.012;
    lfo.connect(lfog); lfog.connect(o.frequency);

    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = freq * 5;
    flt.Q.value = 1;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(velocity * 0.6, t + 0.12);

    o.connect(flt); flt.connect(g); g.connect(this.out);
    o.start(t); lfo.start(t);

    return { o, lfo, g };
  }

  stopViolin(nd, release = 0.12) {
    if (!nd) return;
    const t = this.now;
    nd.g.gain.cancelScheduledValues(t);
    nd.g.gain.setValueAtTime(nd.g.gain.value, t);
    nd.g.gain.linearRampToValueAtTime(0, t + release);
    try { nd.o.stop(t + release + 0.02); nd.lfo.stop(t + release + 0.02); } catch(_) {}
  }

  /* ===== FLUTE ===== */
  playFlute(freq, velocity = 0.8) {
    const { ctx } = this;
    const t = this.now;

    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;

    const lfo = ctx.createOscillator();
    const lfog = ctx.createGain();
    lfo.type = 'sine'; lfo.frequency.value = 5.2;
    lfog.gain.value = freq * 0.008;
    lfo.connect(lfog); lfog.connect(o.frequency);

    // Breath noise
    const ns = ctx.createBufferSource();
    ns.buffer = this._noise(8);
    ns.loop = true;
    const nbf = ctx.createBiquadFilter();
    nbf.type = 'bandpass';
    nbf.frequency.value = freq * 1.5;
    nbf.Q.value = 8;
    const ng = ctx.createGain();
    ng.gain.value = 0.018;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(velocity * 0.65, t + 0.06);

    o.connect(g); ns.connect(nbf); nbf.connect(ng); ng.connect(g);
    g.connect(this.out);

    o.start(t); lfo.start(t); ns.start(t);
    return { o, lfo, ns, g };
  }

  stopFlute(nd, release = 0.1) {
    if (!nd) return;
    const t = this.now;
    nd.g.gain.cancelScheduledValues(t);
    nd.g.gain.setValueAtTime(nd.g.gain.value, t);
    nd.g.gain.linearRampToValueAtTime(0, t + release);
    const stop = t + release + 0.02;
    try { nd.o.stop(stop); nd.lfo.stop(stop); nd.ns.stop(stop); } catch(_) {}
  }

  /* ===== ORGAN ===== */
  playOrgan(freq, drawbars = [8,8,8,0,0,0,0,0,0]) {
    const { ctx } = this;
    const t = this.now;
    const harmonics = [0.5, 1, 2, 3, 4, 5, 6, 8, 16];
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1.0, t + 0.015);

    const oscs = drawbars.map((d, i) => {
      if (!d) return null;
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * harmonics[i];
      const mg = ctx.createGain();
      mg.gain.value = (d / 8) * 0.12;
      o.connect(mg); mg.connect(g);
      o.start(t);
      return { o, mg };
    }).filter(Boolean);

    g.connect(this.out);
    return { oscs, g };
  }

  stopOrgan(nd, release = 0.015) {
    if (!nd) return;
    const t = this.now;
    nd.g.gain.cancelScheduledValues(t);
    nd.g.gain.setValueAtTime(nd.g.gain.value, t);
    nd.g.gain.linearRampToValueAtTime(0, t + release);
    nd.oscs.forEach(x => { try { x.o.stop(t + release + 0.01); } catch(_) {} });
  }

  updateOrganDrawbar(nd, harmonicIdx, value) {
    if (!nd || !nd.oscs[harmonicIdx]) return;
    nd.oscs[harmonicIdx].mg.gain.setTargetAtTime((value / 8) * 0.12, this.now, 0.02);
  }

  /* ===== SYNTH ===== */
  playSynth(freq, opts = {}) {
    const { ctx } = this;
    const t = this.now;
    const {
      wave = 'sawtooth', filterType = 'lowpass',
      filterFreq = 2000, filterQ = 1,
      attack = 0.05, decay = 0.1, sustain = 0.7, release = 0.3,
      lfoRate = 0, lfoDepth = 0,
      velocity = 0.8, detune = 0
    } = opts;

    const o = ctx.createOscillator();
    o.type = wave;
    o.frequency.value = freq;
    o.detune.value = detune;

    let lfo = null, lfog = null;
    if (lfoRate > 0) {
      lfo = ctx.createOscillator();
      lfog = ctx.createGain();
      lfo.type = 'sine'; lfo.frequency.value = lfoRate;
      lfog.gain.value = freq * lfoDepth * 0.15;
      lfo.connect(lfog); lfog.connect(o.frequency);
      lfo.start(t);
    }

    const flt = ctx.createBiquadFilter();
    flt.type = filterType;
    flt.frequency.value = filterFreq;
    flt.Q.value = filterQ;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(velocity, t + attack);
    g.gain.linearRampToValueAtTime(velocity * sustain, t + attack + decay);

    o.connect(flt); flt.connect(g); g.connect(this.out);
    o.start(t);

    return { o, lfo, flt, g, opts };
  }

  stopSynth(nd) {
    if (!nd) return;
    const t = this.now;
    const rel = nd.opts.release || 0.3;
    nd.g.gain.cancelScheduledValues(t);
    nd.g.gain.setValueAtTime(nd.g.gain.value, t);
    nd.g.gain.linearRampToValueAtTime(0, t + rel);
    try { nd.o.stop(t + rel + 0.02); } catch(_) {}
    if (nd.lfo) try { nd.lfo.stop(t + rel + 0.02); } catch(_) {}
  }

  /* ===== MALLET (XYLOPHONE / MARIMBA) ===== */
  playMallet(freq, velocity = 0.8, warm = false) {
    const { ctx } = this;
    const t = this.now;
    const dur = warm ? 1.8 : 0.9;

    const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 3.1;

    const g1 = ctx.createGain(); g1.gain.value = 0.72;
    const g2 = ctx.createGain(); g2.gain.value = warm ? 0.12 : 0.28;
    const g  = ctx.createGain();

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(velocity, t + 0.002);
    g.gain.exponentialRampToValueAtTime(velocity * 0.5, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    o1.connect(g1); g1.connect(g);
    o2.connect(g2); g2.connect(g);
    g.connect(this.out);

    o1.start(t); o1.stop(t + dur + 0.1);
    o2.start(t); o2.stop(t + dur * 0.6);
  }

  /* ===== DRUMS ===== */
  playKick(velocity = 0.8) {
    const { ctx } = this;
    const t = this.now;

    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.1);

    const g = ctx.createGain();
    g.gain.setValueAtTime(velocity, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

    // Click transient
    const cn = ctx.createBufferSource();
    cn.buffer = this._noise(0.006);
    const cf = ctx.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 1200; cf.Q.value = 1;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(velocity * 0.5, t);
    cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.006);

    o.connect(g); g.connect(this.out);
    cn.connect(cf); cf.connect(cg); cg.connect(this.out);
    o.start(t); o.stop(t + 0.6);
    cn.start(t); cn.stop(t + 0.006);
  }

  playSnare(velocity = 0.8) {
    const { ctx } = this;
    const t = this.now;

    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.1);
    const og = ctx.createGain();
    og.gain.setValueAtTime(velocity * 0.5, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    const ns = ctx.createBufferSource();
    ns.buffer = this._noise(0.3);
    const nbf = ctx.createBiquadFilter(); nbf.type = 'bandpass'; nbf.frequency.value = 3500; nbf.Q.value = 0.4;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(velocity * 0.85, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

    o.connect(og); og.connect(this.out);
    ns.connect(nbf); nbf.connect(ng); ng.connect(this.out);
    o.start(t); o.stop(t + 0.2);
    ns.start(t); ns.stop(t + 0.3);
  }

  playHihat(open = false, velocity = 0.8) {
    const { ctx } = this;
    const t = this.now;
    const dur = open ? 0.9 : 0.07;

    const ns = ctx.createBufferSource();
    ns.buffer = this._noise(dur + 0.01);
    const hpf = ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 7000; hpf.Q.value = 0.8;
    const bpf = ctx.createBiquadFilter(); bpf.type = 'bandpass'; bpf.frequency.value = 12000; bpf.Q.value = 0.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(velocity * 0.55, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    ns.connect(hpf); hpf.connect(bpf); bpf.connect(g); g.connect(this.out);
    ns.start(t); ns.stop(t + dur + 0.01);
  }

  playCrash(velocity = 0.8) {
    const { ctx } = this;
    const t = this.now;
    const dur = 2.8;

    const ns = ctx.createBufferSource();
    ns.buffer = this._noise(dur);
    const bpf = ctx.createBiquadFilter(); bpf.type = 'bandpass'; bpf.frequency.value = 5500; bpf.Q.value = 0.15;
    const g = ctx.createGain();
    g.gain.setValueAtTime(velocity * 0.65, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 418;
    const og = ctx.createGain();
    og.gain.setValueAtTime(velocity * 0.15, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

    ns.connect(bpf); bpf.connect(g); g.connect(this.out);
    o.connect(og); og.connect(this.out);
    ns.start(t); ns.stop(t + dur);
    o.start(t); o.stop(t + 0.5);
  }

  playRide(velocity = 0.8) {
    const { ctx } = this;
    const t = this.now;
    const dur = 1.8;

    const ns = ctx.createBufferSource();
    ns.buffer = this._noise(dur);
    const hpf = ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 5000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(velocity * 0.45, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 750;
    const og = ctx.createGain();
    og.gain.setValueAtTime(velocity * 0.35, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);

    ns.connect(hpf); hpf.connect(g); g.connect(this.out);
    o.connect(og); og.connect(this.out);
    ns.start(t); ns.stop(t + dur);
    o.start(t); o.stop(t + dur);
  }

  playTom(freq = 100, velocity = 0.8) {
    const { ctx } = this;
    const t = this.now;

    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq * 1.6, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.07);

    const g = ctx.createGain();
    g.gain.setValueAtTime(velocity * 0.75, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

    const ns = ctx.createBufferSource();
    ns.buffer = this._noise(0.06);
    const ng = ctx.createGain(); ng.gain.setValueAtTime(velocity * 0.18, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    o.connect(g); g.connect(this.out);
    ns.connect(ng); ng.connect(this.out);
    o.start(t); o.stop(t + 0.5);
    ns.start(t); ns.stop(t + 0.06);
  }

  playClap(velocity = 0.8) {
    const { ctx } = this;
    const t = this.now;
    [0, 0.012, 0.024].forEach(offset => {
      const ns = ctx.createBufferSource();
      ns.buffer = this._noise(0.06);
      const bpf = ctx.createBiquadFilter(); bpf.type = 'bandpass'; bpf.frequency.value = 1800; bpf.Q.value = 0.4;
      const g = ctx.createGain();
      g.gain.setValueAtTime(velocity * 0.7, t + offset);
      g.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.06);
      ns.connect(bpf); bpf.connect(g); g.connect(this.out);
      ns.start(t + offset); ns.stop(t + offset + 0.06);
    });
  }

  /* ===== UTILITY ===== */
  midiToFreq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
  noteToFreq(note, octave) {
    const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const idx = notes.indexOf(note);
    return this.midiToFreq(idx + (octave + 1) * 12);
  }
}

const audioEngine = new AudioEngine();
