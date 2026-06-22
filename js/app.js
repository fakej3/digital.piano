/* ===================================================
   InstrumentVerse — app.js
   Main application bootstrap and routing
   =================================================== */

const App = (() => {

  const INSTRUMENTS = [
    { id:'piano',      name:'Piano',       emoji:'🎹', desc:'88 keys, 3 octaves playable',      category:'keys',       page:'piano'      },
    { id:'guitar',     name:'Guitar',      emoji:'🎸', desc:'6 strings, chords & fretboard',    category:'strings',    page:'guitar'     },
    { id:'ukulele',    name:'Ukulele',     emoji:'🪕', desc:'4 strings, GCEA tuning',           category:'strings',    page:'ukulele'    },
    { id:'bass',       name:'Bass Guitar', emoji:'🎸', desc:'4-string electric bass',           category:'strings',    page:'bass'       },
    { id:'violin',     name:'Violin',      emoji:'🎻', desc:'Bowed strings with vibrato',       category:'strings',    page:'violin'     },
    { id:'drums',      name:'Drum Kit',    emoji:'🥁', desc:'Full kit with cymbals & toms',     category:'percussion', page:'drums'      },
    { id:'xylophone',  name:'Xylophone',   emoji:'🎵', desc:'15 bars, bright tone C4–C6',       category:'percussion', page:'xylophone'  },
    { id:'marimba',    name:'Marimba',     emoji:'🎶', desc:'Warm resonant bars, C3–C5',        category:'percussion', page:'marimba'    },
    { id:'flute',      name:'Flute',       emoji:'🪈', desc:'Breathy tone, C4–C6',              category:'wind',       page:'flute'      },
    { id:'organ',      name:'Organ',       emoji:'⛪', desc:'9 drawbars, Hammond style',        category:'keys',       page:'organ'      },
    { id:'synth',      name:'Synthesizer', emoji:'🎛️', desc:'Oscillator, filter, ADSR, LFO',   category:'electronic', page:'synth'      },
    { id:'beatmaker',  name:'Beat Maker',  emoji:'🎚️', desc:'16-step sequencer, 8 tracks',     category:'electronic', page:'beatmaker'  },
  ];

  const DAILY_CHALLENGES = [
    { title:'Play a C Major Scale',   desc:'Hit C-D-E-F-G-A-B-C on the piano in order.', xp:50, page:'piano'     },
    { title:'Drum a 4/4 Beat',        desc:'Keep a kick on 1 & 3, snare on 2 & 4.',      xp:40, page:'drums'     },
    { title:'Strum 3 Chords',         desc:'Play G, C, and D on guitar.',                 xp:45, page:'guitar'    },
    { title:'Play a Pentatonic Lick', desc:'Use the 5 notes of the minor pentatonic.',    xp:55, page:'guitar'    },
    { title:'Program a Beat',         desc:'Create a 16-step pattern in Beat Maker.',     xp:60, page:'beatmaker' },
    { title:'Use the Tuner',          desc:'Match A4 = 440 Hz in the chromatic tuner.',   xp:30, page:'studio'    },
    { title:'Record 30 Seconds',      desc:'Record a short melody using the recorder.',   xp:35, page:'studio'    },
    { title:'Try the Synthesizer',    desc:'Adjust the filter cutoff and play a melody.', xp:40, page:'synth'     },
  ];

  function getDailyChallenge() {
    const today = new Date().toDateString();
    const stored = Storage.get('daily_challenge');
    if (stored && stored.date === today) return stored.challenge;
    const idx = new Date().getDate() % DAILY_CHALLENGES.length;
    const challenge = DAILY_CHALLENGES[idx];
    Storage.set('daily_challenge', { date: today, challenge });
    return challenge;
  }

  // ── Home page ──────────────────────────────────────────────────────────────

  function buildHomePage() {
    buildQuickLaunch();
    buildDailyChallenge();
    buildFeaturedLessons();
    buildHeroKeys();
  }

  function buildQuickLaunch() {
    const wrap = document.getElementById('quickGrid');
    if (!wrap || wrap.children.length > 0) return;

    const recent = Storage.get('recent_instruments') || ['piano', 'guitar', 'drums', 'synth'];
    recent.slice(0, 4).forEach(id => {
      const instr = INSTRUMENTS.find(i => i.id === id);
      if (!instr) return;
      const card = document.createElement('button');
      card.className = 'quick-card';
      card.innerHTML = `<span class="qc-emoji">${instr.emoji}</span><span class="qc-name">${instr.name}</span>`;
      card.addEventListener('click', () => Router.navigate(instr.page));
      wrap.appendChild(card);
    });
  }

  function buildDailyChallenge() {
    const challenge = getDailyChallenge();
    const done = (Storage.get('daily_done') || '') === new Date().toDateString();

    const nameEl = document.getElementById('challengeName');
    const descEl = document.getElementById('challengeDesc');
    const xpEl   = document.getElementById('challengeXp');
    const barEl  = document.getElementById('challengeBar');
    const pctEl  = document.getElementById('challengePct');
    const btn    = document.getElementById('challengeBtn');

    if (nameEl) nameEl.textContent = challenge.title;
    if (descEl) descEl.textContent = challenge.desc;
    if (xpEl)  xpEl.textContent   = '+' + challenge.xp + ' XP';

    if (done) {
      if (barEl) barEl.style.width = '100%';
      if (pctEl) pctEl.textContent = '100%';
      if (btn) {
        btn.textContent = 'Done ✓';
        btn.disabled    = true;
        btn.className   = 'btn btn-ghost btn-sm';
      }
    } else {
      if (barEl) barEl.style.width = '0%';
      if (pctEl) pctEl.textContent = '0%';
      if (btn) {
        btn.textContent = 'Start';
        btn.disabled    = false;
        btn.className   = 'btn btn-primary btn-sm';
        btn.onclick     = () => {
          Storage.set('daily_done', new Date().toDateString());
          const r = Storage.addXP(challenge.xp);
          UI.toast(`Daily challenge complete! +${challenge.xp} XP`);
          UI.updateXPDisplay();
          if (r.leveledUp) UI.showLevelUp(r.level);
          buildDailyChallenge();
          Router.navigate(challenge.page);
        };
      }
    }
  }

  function buildFeaturedLessons() {
    if (typeof Learning !== 'undefined') Learning.buildFeaturedLessons();
  }

  function buildHeroKeys() {
    const wrap = document.getElementById('heroKeys');
    if (!wrap || wrap.children.length > 0) return;
    const isBlack = [false, true, false, true, false, false, true, false, true, false, true, false];
    for (let i = 0; i < 12; i++) {
      const key = document.createElement('div');
      key.className = 'hero-key' + (isBlack[i] ? ' black' : '');
      key.style.setProperty('--i', i);
      wrap.appendChild(key);
    }
  }

  // ── Instruments page ───────────────────────────────────────────────────────

  function buildInstrumentsPage() {
    const grid = document.getElementById('instrumentsGrid');
    if (!grid || grid.children.length > 0) return;

    INSTRUMENTS.forEach(instr => {
      const card = document.createElement('div');
      card.className    = 'inst-card';
      card.dataset.category = instr.category;
      card.innerHTML = `
        <span class="inst-card-emoji">${instr.emoji}</span>
        <div class="inst-card-name">${instr.name}</div>
        <div class="inst-card-desc">${instr.desc}</div>
        <div class="inst-card-tags">
          <span class="inst-tag">${instr.category}</span>
        </div>
      `;
      card.addEventListener('click', () => Router.navigate(instr.page));
      grid.appendChild(card);
    });

    setupInstrumentFilters();
  }

  function setupInstrumentFilters() {
    const filterRow = document.getElementById('filterRow');
    if (!filterRow) return;

    filterRow.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterRow.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.inst-card').forEach(card => {
          card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
        });
      });
    });
  }

  // ── Practice page ──────────────────────────────────────────────────────────

  function buildPracticePage() {
    const wrap = document.getElementById('practiceWrap');
    if (!wrap) return;

    const p = Storage.getProgress();
    const { level, xp, pct } = Storage.xpProgress();

    const ACHIEVEMENTS = [
      { id:'first_note',      icon:'🎵', name:'First Note',      desc:'Play your first note'         },
      { id:'five_instruments',icon:'🎶', name:'Melody Maker',    desc:'Try 5 different instruments'  },
      { id:'level5',          icon:'⭐', name:'Rising Star',     desc:'Reach level 5'               },
      { id:'level10',         icon:'🌟', name:'Virtuoso',        desc:'Reach level 10'              },
      { id:'ten_lessons',     icon:'📖', name:'Student',         desc:'Complete 10 lessons'         },
      { id:'all_instruments', icon:'🎼', name:'Instrumentalist', desc:'Try all 12 instruments'      },
      { id:'streak7',         icon:'🔥', name:'Week Streak',     desc:'Play 7 days in a row'       },
      { id:'beat_master',     icon:'🎚️', name:'Beat Master',    desc:'Load all Beat Maker presets' },
      { id:'recorder_used',   icon:'⏺', name:'Studio Time',     desc:'Record your first take'      },
    ];

    const earned    = p.achievements || [];
    const completed = p.lessonsCompleted || [];
    const streak    = p.streak || 0;
    const lastPlay  = p.lastPlayDate;
    const visited   = Storage.get('visited_instruments') || [];

    wrap.innerHTML = `
      <div class="xp-overview">
        <div class="xp-card">
          <div class="xp-number">${xp}</div>
          <div class="xp-label">Total XP</div>
        </div>
        <div class="level-card">
          <div class="level-header">
            <span class="level-number">Level ${level}</span>
            <span class="level-xp-needed">${Math.round(pct)}% to Level ${level + 1}</span>
          </div>
          <div class="level-progress"><div class="level-progress-fill" style="width:${pct}%"></div></div>
          <div class="level-desc">${completed.length} lessons · ${visited.length}/12 instruments · ${streak} day streak</div>
        </div>
      </div>

      <div class="streak-card">
        <div class="streak-fire">🔥</div>
        <div>
          <div class="streak-number">${streak}</div>
          <div class="streak-label">Day Streak${lastPlay ? ' · Last: ' + new Date(lastPlay).toLocaleDateString() : ''}</div>
        </div>
      </div>

      <h3 style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin:var(--space-6) 0 var(--space-4);">Achievements</h3>
      <div class="achievements-grid">
        ${ACHIEVEMENTS.map(a => `
          <div class="achievement${earned.includes(a.id) ? ' earned' : ''}">
            <div class="achievement-icon">${a.icon}</div>
            <div>
              <div class="achievement-name">${a.name}</div>
              <div class="achievement-desc">${a.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>

      ${completed.length > 0 ? `
        <h3 style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin:var(--space-6) 0 var(--space-4);">
          Completed Lessons (${completed.length})
        </h3>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${completed.slice(-20).reverse().map(id => `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);">
              <span style="color:var(--accent);font-weight:700;">✓</span>
              <span style="font-size:0.9rem;">${id.replace(/_/g, ' ')}</span>
            </div>
          `).join('')}
        </div>
      ` : `
        <p style="color:var(--text-muted);text-align:center;padding:var(--space-8) 0;">
          No lessons completed yet —
          <a data-nav="learn" style="color:var(--primary);cursor:pointer;text-decoration:underline;">start learning</a>!
        </p>
      `}
    `;
  }

  // ── Settings page ──────────────────────────────────────────────────────────

  function buildSettingsPage() {
    const wrap = document.getElementById('settingsWrap');
    if (!wrap || wrap.children.length > 0) return;

    const s = Storage.getSettings();

    wrap.innerHTML = `
      <div class="settings-section">
        <div class="settings-section-title">Audio</div>
        <div class="setting-row">
          <div>
            <div class="setting-label">Master Volume</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <input type="range" id="setVolume" min="0" max="100" value="${Math.round((s.volume ?? 0.8) * 100)}" style="width:140px;accent-color:var(--primary);">
            <span id="setVolumeVal" style="min-width:40px;text-align:right;font-size:0.9rem;">${Math.round((s.volume ?? 0.8) * 100)}%</span>
          </div>
        </div>
        <div class="setting-row">
          <div>
            <div class="setting-label">Reverb Mix</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <input type="range" id="setReverb" min="0" max="100" value="${Math.round((s.reverb ?? 0.12) * 100)}" style="width:140px;accent-color:var(--primary);">
            <span id="setReverbVal" style="min-width:40px;text-align:right;font-size:0.9rem;">${Math.round((s.reverb ?? 0.12) * 100)}%</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Display</div>
        <div class="setting-row">
          <div class="setting-label">Show Key Labels</div>
          <label class="toggle">
            <input type="checkbox" id="setKeyLabels" ${s.showKeyLabels !== false ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <div class="setting-label">Animations</div>
          <label class="toggle">
            <input type="checkbox" id="setAnimations" ${s.animationsEnabled !== false ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">About</div>
        <div class="setting-row" style="flex-direction:column;align-items:flex-start;border:none;gap:6px;">
          <div style="color:var(--text-muted);font-size:0.88rem;line-height:1.7;">
            <strong style="color:var(--text);">InstrumentVerse</strong> v1.0.0<br>
            A browser-based multi-instrument platform.<br>
            Built with HTML, CSS &amp; Vanilla JS · Web Audio API.
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Data</div>
        <div class="setting-row">
          <div>
            <div class="setting-label">Reset All Progress</div>
            <div class="setting-desc">Clears XP, levels, lessons, achievements. Cannot be undone.</div>
          </div>
          <button class="btn btn-danger" id="setResetBtn">Reset</button>
        </div>
      </div>
    `;

    const volSlider = document.getElementById('setVolume');
    const volVal    = document.getElementById('setVolumeVal');
    volSlider?.addEventListener('input', e => {
      const v = parseInt(e.target.value) / 100;
      volVal.textContent = e.target.value + '%';
      if (audioEngine.masterGain && audioEngine.ctx) {
        audioEngine.masterGain.gain.setTargetAtTime(v, audioEngine.ctx.currentTime, 0.05);
      }
      Storage.saveSetting('volume', v);
    });

    const revSlider = document.getElementById('setReverb');
    const revVal    = document.getElementById('setReverbVal');
    revSlider?.addEventListener('input', e => {
      const v = parseInt(e.target.value) / 100;
      revVal.textContent = e.target.value + '%';
      if (audioEngine.ctx) {
        if (audioEngine.wetGain) audioEngine.wetGain.gain.setTargetAtTime(v * 0.4, audioEngine.ctx.currentTime, 0.05);
        if (audioEngine.dryGain) audioEngine.dryGain.gain.setTargetAtTime(1 - v * 0.3, audioEngine.ctx.currentTime, 0.05);
      }
      Storage.saveSetting('reverb', v);
    });

    document.getElementById('setKeyLabels')?.addEventListener('change', e => {
      Storage.saveSetting('showKeyLabels', e.target.checked);
      document.body.classList.toggle('hide-key-labels', !e.target.checked);
    });

    document.getElementById('setAnimations')?.addEventListener('change', e => {
      Storage.saveSetting('animationsEnabled', e.target.checked);
      document.body.classList.toggle('reduce-motion', !e.target.checked);
    });

    document.getElementById('setResetBtn')?.addEventListener('click', () => {
      if (!confirm('Reset ALL progress? This cannot be undone.')) return;
      Storage.clear();
      UI.toast('Progress reset');
      UI.updateXPDisplay();
      const pw = document.getElementById('practiceWrap');
      if (pw) pw.innerHTML = '';
    });
  }

  // ── Instrument visit tracker ────────────────────────────────────────────────

  function trackInstrumentVisit(id) {
    let recent = Storage.get('recent_instruments') || [];
    recent = [id, ...recent.filter(x => x !== id)].slice(0, 4);
    Storage.set('recent_instruments', recent);

    let visited = Storage.get('visited_instruments') || [];
    if (!visited.includes(id)) {
      visited.push(id);
      Storage.set('visited_instruments', visited);
      if (visited.length >= 12) Storage.unlockAchievement('all_instruments');
    }

    const r = Storage.addXP(2);
    UI.updateXPDisplay();
    if (r.leveledUp) UI.showLevelUp(r.level);
  }

  // ── Routing ────────────────────────────────────────────────────────────────

  function setupRoutes() {
    Router.on('home', buildHomePage);
    Router.on('instruments', buildInstrumentsPage);
    Router.on('learn', () => {
      if (typeof Learning !== 'undefined') Learning.buildLearnPage();
    });
    Router.on('lesson', () => { /* Learning.openLesson manages this page */ });
    Router.on('practice', buildPracticePage);
    Router.on('studio', () => {
      if (typeof Metronome !== 'undefined') Metronome.init();
      if (typeof Tuner     !== 'undefined') Tuner.init();
      if (typeof Recorder  !== 'undefined') Recorder.init();
    });
    Router.on('settings', buildSettingsPage);

    const instrInits = {
      piano:     () => { if (typeof Piano     !== 'undefined') Piano.init();     },
      guitar:    () => { if (typeof Guitar    !== 'undefined') Guitar.init();    },
      ukulele:   () => { if (typeof Ukulele   !== 'undefined') Ukulele.init();   },
      bass:      () => { if (typeof Bass      !== 'undefined') Bass.init();      },
      violin:    () => { if (typeof Violin    !== 'undefined') Violin.init();    },
      drums:     () => { if (typeof Drums     !== 'undefined') Drums.init();     },
      xylophone: () => { if (typeof Xylophone !== 'undefined') Xylophone.init(); },
      marimba:   () => { if (typeof Marimba   !== 'undefined') Marimba.init();   },
      flute:     () => { if (typeof Flute     !== 'undefined') Flute.init();     },
      organ:     () => { if (typeof Organ     !== 'undefined') Organ.init();     },
      synth:     () => { if (typeof Synth     !== 'undefined') Synth.init();     },
      beatmaker: () => { if (typeof BeatMaker !== 'undefined') BeatMaker.init(); },
    };

    Object.entries(instrInits).forEach(([page, fn]) => {
      Router.on(page, () => { fn(); trackInstrumentVisit(page); });
    });
  }

  // ── Loading screen ─────────────────────────────────────────────────────────

  function runLoadingScreen() {
    const screen = document.getElementById('loadingScreen');
    const fill   = document.getElementById('loadingFill');
    if (!screen || !fill) return Promise.resolve();

    return new Promise(resolve => {
      const steps = [20, 45, 70, 90, 100];
      let si = 0;

      const advance = () => {
        if (si >= steps.length) {
          setTimeout(() => {
            screen.style.opacity    = '0';
            screen.style.transition = 'opacity 0.4s ease';
            setTimeout(() => { screen.style.display = 'none'; resolve(); }, 400);
          }, 150);
          return;
        }
        fill.style.width = steps[si++] + '%';
        setTimeout(advance, 120 + Math.random() * 80);
      };

      advance();
    });
  }

  // ── Mobile nav ─────────────────────────────────────────────────────────────

  function setupMobileNav() {
    const toggle  = document.getElementById('navToggle');
    const navMenu = document.getElementById('navLinks');
    if (!toggle || !navMenu) return;

    toggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
    });

    // Close menu when clicking a nav link
    navMenu.addEventListener('click', e => {
      if (e.target.closest('[data-nav]')) {
        navMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!navMenu.contains(e.target) && !toggle.contains(e.target)) {
        navMenu.classList.remove('open');
      }
    });
  }

  // ── Apply saved settings ───────────────────────────────────────────────────

  function applySettings() {
    const s = Storage.getSettings();
    if (s.showKeyLabels === false)    document.body.classList.add('hide-key-labels');
    if (s.animationsEnabled === false) document.body.classList.add('reduce-motion');
  }

  // ── Global keyboard shortcuts ──────────────────────────────────────────────

  function setupGlobalKeys() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelector('.lesson-overlay')?.remove();
      }
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  async function init() {
    await runLoadingScreen();

    applySettings();
    setupMobileNav();
    setupGlobalKeys();
    setupRoutes();

    UI.updateXPDisplay();

    // Router.init() sets up hashchange listener, [data-nav] delegation, and shows initial page
    Router.init();
  }

  return { init };
})();

// ── Bootstrap ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
