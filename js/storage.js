/* ===================================================
   InstrumentVerse — storage.js
   LocalStorage wrapper for progress, settings, state
   =================================================== */

const Storage = (() => {
  const PREFIX = 'iv_';

  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch(_) { return fallback; }
  }

  function set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
    catch(_) { return false; }
  }

  function remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch(_) {}
  }

  function clear() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch(_) {}
  }

  /* ===== PROGRESS ===== */
  function getProgress() {
    return get('progress', {
      xp: 0,
      level: 1,
      streak: 0,
      lastPlayDate: null,
      notesPlayed: 0,
      lessonsCompleted: [],
      achievements: [],
      dailyChallengeDate: null,
      dailyChallengeProgress: 0,
      instrumentTime: {}
    });
  }

  function saveProgress(p) { set('progress', p); }

  function addXP(amount) {
    const p = getProgress();
    p.xp += amount;

    const oldLevel = p.level;
    p.level = xpToLevel(p.xp);

    const today = new Date().toDateString();
    if (p.lastPlayDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      p.streak = p.lastPlayDate === yesterday ? p.streak + 1 : 1;
      p.lastPlayDate = today;
    }

    saveProgress(p);
    return { xp: p.xp, level: p.level, leveledUp: p.level > oldLevel, streak: p.streak };
  }

  function xpToLevel(xp) {
    // Level thresholds: level n requires n*(n-1)*50 XP
    let level = 1;
    while (xpForLevel(level + 1) <= xp) level++;
    return level;
  }

  function xpForLevel(level) {
    return level <= 1 ? 0 : (level - 1) * level * 50;
  }

  function xpForNextLevel(currentLevel) {
    return xpForLevel(currentLevel + 1);
  }

  function xpProgress() {
    const p = getProgress();
    const currentLevelXP = xpForLevel(p.level);
    const nextLevelXP    = xpForLevel(p.level + 1);
    const range = nextLevelXP - currentLevelXP;
    const progress = p.xp - currentLevelXP;
    return {
      level: p.level,
      xp: p.xp,
      currentLevelXP,
      nextLevelXP,
      pct: range > 0 ? Math.min(100, Math.round((progress / range) * 100)) : 100
    };
  }

  function incrementNotes(n = 1) {
    const p = getProgress();
    p.notesPlayed = (p.notesPlayed || 0) + n;
    saveProgress(p);
    return p.notesPlayed;
  }

  function completeLesson(lessonId, xp) {
    const p = getProgress();
    if (!p.lessonsCompleted.includes(lessonId)) {
      p.lessonsCompleted.push(lessonId);
      saveProgress(p);
      return addXP(xp);
    }
    return null;
  }

  function isLessonCompleted(lessonId) {
    return getProgress().lessonsCompleted.includes(lessonId);
  }

  function unlockAchievement(id) {
    const p = getProgress();
    if (!p.achievements.includes(id)) {
      p.achievements.push(id);
      saveProgress(p);
      return true;
    }
    return false;
  }

  function hasAchievement(id) {
    return getProgress().achievements.includes(id);
  }

  function addInstrumentTime(instrument, seconds) {
    const p = getProgress();
    if (!p.instrumentTime) p.instrumentTime = {};
    p.instrumentTime[instrument] = (p.instrumentTime[instrument] || 0) + seconds;
    saveProgress(p);
  }

  function getDailyChallenge() {
    return get('dailyChallenge', null);
  }

  function setDailyChallenge(data) { set('dailyChallenge', data); }

  /* ===== SETTINGS ===== */
  function getSettings() {
    return get('settings', {
      volume: 0.8,
      reverb: 0.12,
      showKeyLabels: true,
      animationsEnabled: true,
      theme: 'dark',
      noteDisplay: 'both'
    });
  }

  function saveSetting(key, value) {
    const s = getSettings();
    s[key] = value;
    set('settings', s);
  }

  /* ===== BEAT MAKER PATTERNS ===== */
  function getBeatPattern(id) { return get(`beat_${id}`, null); }
  function saveBeatPattern(id, pattern) { set(`beat_${id}`, pattern); }

  return {
    get, set, remove, clear,
    getProgress, saveProgress,
    addXP, xpToLevel, xpForLevel, xpForNextLevel, xpProgress,
    incrementNotes, completeLesson, isLessonCompleted,
    unlockAchievement, hasAchievement, addInstrumentTime,
    getDailyChallenge, setDailyChallenge,
    getSettings, saveSetting,
    getBeatPattern, saveBeatPattern
  };
})();
