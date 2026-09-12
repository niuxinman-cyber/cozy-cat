const COZY_CAT_ASSETS = Object.freeze({
  idle: './assets/cat-idle.webp',
  happy: './assets/cat-happy.webp',
  hungry: './assets/cat-hungry.webp',
  sleep: './assets/cat-sleep.webp',
  eat: './assets/cat-eat.webp',
  celebrate: './assets/cat-celebrate.webp'
});

const COZY_CAT_STATE_CLASSES = Object.keys(COZY_CAT_ASSETS).map(name => `state-${name}`);
let cozyCatActionTimer = 0;
let cozyCatActionLocked = false;
let cozyCatCurrentState = '';

function cozyCatReadNumber(key, fallback) {
  const n = Number(localStorage.getItem(key));
  return Number.isFinite(n) ? n : fallback;
}

function cozyCatInventory() {
  try {
    const data = JSON.parse(localStorage.getItem('cozy9Inventory') || '{}');
    return {milk:0, chicken:0, cake:0, beef:0, ...data};
  } catch (_) {
    return {milk:0, chicken:0, cake:0, beef:0};
  }
}

function cozyCatBaseState() {
  const mood = cozyCatReadNumber('cozy9Mood', 80);
  const full = cozyCatReadNumber('cozy9Fullness', 60);
  const fish = cozyCatReadNumber('cozy9Fish', 30);
  if (full <= 28) return 'hungry';
  if (fish >= 82) return 'sleep';
  if (mood >= 85) return 'happy';
  return 'idle';
}

function cozyCatSetState(name) {
  const img = document.getElementById('cat');
  const wrap = document.getElementById('catWrap');
  if (!img || !wrap || !COZY_CAT_ASSETS[name]) return;
  cozyCatCurrentState = name;
  for (const cls of COZY_CAT_STATE_CLASSES) wrap.classList.remove(cls);
  wrap.classList.add(`state-${name}`);
  const wanted = COZY_CAT_ASSETS[name];
  if (img.getAttribute('src') !== wanted) img.setAttribute('src', wanted);
  img.dataset.catState = name;
}

function cozyCatSyncBase() {
  if (!cozyCatActionLocked) cozyCatSetState(cozyCatBaseState());
}

function cozyCatPlay(name, duration = 1500) {
  clearTimeout(cozyCatActionTimer);
  cozyCatActionLocked = true;
  cozyCatSetState(name);
  cozyCatActionTimer = window.setTimeout(() => {
    cozyCatActionLocked = false;
    cozyCatSyncBase();
  }, duration);
}

function cozyCatTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function cozyCatEnsureStyles() {
  if (document.querySelector('link[data-cozy-cat-anim]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './cat-anim.css';
  link.dataset.cozyCatAnim = '1';
  document.head.appendChild(link);
}

function cozyCatPreload() {
  for (const src of Object.values(COZY_CAT_ASSETS)) {
    const img = new Image();
    img.src = src;
  }
}

function cozyCatInit() {
  const img = document.getElementById('cat');
  const wrap = document.getElementById('catWrap');
  if (!img || !wrap) return;

  cozyCatEnsureStyles();
  cozyCatPreload();
  cozyCatSyncBase();

  const srcGuard = new MutationObserver(() => {
    const wanted = COZY_CAT_ASSETS[cozyCatCurrentState || cozyCatBaseState()];
    if (wanted && img.getAttribute('src') !== wanted) img.setAttribute('src', wanted);
  });
  srcGuard.observe(img, {attributes:true, attributeFilter:['src']});

  const statusTargets = ['moodNum','foodNum','fishNum']
    .map(id => document.getElementById(id)).filter(Boolean);
  if (statusTargets.length) {
    const statusObserver = new MutationObserver(() => window.setTimeout(cozyCatSyncBase, 0));
    statusTargets.forEach(el => statusObserver.observe(el, {childList:true, subtree:true, characterData:true}));
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const feedButton = target.closest('[data-feed]');
    const quickFeed = target.closest('#quickFeedBtn');
    if (feedButton) {
      const inv = cozyCatInventory();
      event.__cozyCanFeed = (inv[feedButton.dataset.feed] || 0) > 0;
    } else if (quickFeed) {
      event.__cozyCanFeed = Object.values(cozyCatInventory()).some(v => Number(v) > 0);
    }
    if (target.closest('#checkinBtn')) {
      event.__cozyCanCheckin = localStorage.getItem('cozy10LastCheckin') !== cozyCatTodayKey();
    }
  }, true);

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    if (target.closest('#petBtn') || target.closest('#cat')) {
      cozyCatPlay('happy', 1450);
      return;
    }
    if ((target.closest('[data-feed]') || target.closest('#quickFeedBtn')) && event.__cozyCanFeed) {
      window.setTimeout(() => cozyCatPlay('eat', 1750), 610);
      return;
    }
    if (target.closest('#checkinBtn') && event.__cozyCanCheckin) {
      window.setTimeout(() => cozyCatPlay('celebrate', 1650), 80);
    }
  });

  const learned = document.getElementById('learnedCount');
  if (learned) {
    let lastLearned = Number(learned.textContent) || 0;
    const learnedObserver = new MutationObserver(() => {
      const now = Number(learned.textContent) || 0;
      if (lastLearned < 20 && now === 20) cozyCatPlay('celebrate', 1700);
      lastLearned = now;
    });
    learnedObserver.observe(learned, {childList:true, subtree:true, characterData:true});
  }

  const quizLabel = document.getElementById('quizScoreLabel');
  if (quizLabel) {
    let quizWasFinished = false;
    const quizObserver = new MutationObserver(() => {
      const text = quizLabel.textContent.trim();
      const finished = text.startsWith('完成') || text.startsWith('复习完成');
      if (finished && !quizWasFinished) cozyCatPlay('celebrate', 1700);
      quizWasFinished = finished;
    });
    quizObserver.observe(quizLabel, {childList:true, subtree:true, characterData:true});
  }

  window.addEventListener('storage', cozyCatSyncBase);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.setTimeout(cozyCatInit, 0), {once:true});
} else {
  window.setTimeout(cozyCatInit, 0);
}
