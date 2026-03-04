// ══════════════════════════════════════════════════
// CLAUDE CODE QUEST - App Logic
// ══════════════════════════════════════════════════

// ── DATA ──
const CH=[
  {id:0,t:'ברוכים הבאים',i:'🏠'},
  {id:1,t:'התקנת Claude Code',i:'📦'},
  {id:2,t:'השיחה הראשונה',i:'💬'},
  {id:3,t:'יוצרים פרסונה של במאי',i:'🎭'},
  {id:4,t:'Skills : פקודות קסם',i:'⚡'},
  {id:5,t:'השראה ותסריט',i:'🔍'},
  {id:6,t:'מה זה API?',i:'🍽️'},
  {id:7,t:'Python וסביבה',i:'🐍'},
  {id:8,t:'סטוריבורד',i:'🎨'},
  {id:9,t:'קריינות',i:'🎙️'},
  {id:10,t:'אנימציה',i:'🎬'},
  {id:11,t:'Remotion : עריכה',i:'✂️'},
  {id:12,t:'הבוס הסופי',i:'🏆'},
];

const ACH={
  1:{i:'🚀',t:'ההתחלה!',d:'התקנתם Claude Code'},
  2:{i:'💬',t:'דובר Claude',d:'למדתם לדבר עם Claude'},
  3:{i:'🎭',t:'במאי ראשי',d:'נתתם ל-Claude פרסונה'},
  4:{i:'⚡',t:'מאסטר Skills',d:'יצרתם פקודות קסם'},
  5:{i:'🔍',t:'תסריטאי!',d:'יצרתם תסריט וSkill /script'},
  6:{i:'🍽️',t:'מבין APIs',d:'הבנתם מה זה API'},
  7:{i:'🐍',t:'מאלף נחשים',d:'הקמתם סביבת Python'},
  8:{i:'🎨',t:'אמן סטוריבורד',d:'יצרתם סטוריבורד ראשון'},
  9:{i:'🎙️',t:'קול הזהב',d:'יצרתם קריינות AI'},
  10:{i:'🎬',t:'אנימטור',d:'עשיתם אנימציה לתמונות'},
  11:{i:'✂️',t:'עורך ראשי',d:'ערכתם עם Remotion'},
  12:{i:'🏆',t:'בוס סופי!',d:'השלמתם את כל המסע!'},
};

// ── STATE ──
// Load from localStorage, fall back to defaults
let S = JSON.parse(localStorage.getItem('ccq2') || 'null') || {ch:0, done:[], xp:0, lv:1, qd:[]};
// Ensure all fields exist (in case old save is missing new fields)
if (!S.done) S.done = [];
if (!S.qd)   S.qd   = [];
if (!S.xp)   S.xp   = 0;
if (!S.lv)   S.lv   = 1;
if (S.ch === undefined) S.ch = 0;

const save = () => localStorage.setItem('ccq2', JSON.stringify(S));

// ── NAV ──
function nav() {
  const ul = document.getElementById('navList');
  ul.innerHTML = '';
  const progress = Math.round((S.done.length / CH.length) * 100);
  ul.style.setProperty('--progress', progress + '%');

  CH.forEach(c => {
    const isDone   = S.done.includes(c.id);
    const isActive = S.ch === c.id;
    const isLocked = c.id > 0 && !S.done.includes(c.id - 1) && !isActive && !isDone;

    const li = document.createElement('li');
    li.className = 'nav-item' +
      (isActive ? ' active' : '') +
      (isDone   ? ' done'   : '') +
      (isLocked ? ' locked' : '');

    li.innerHTML = `<div class="nav-dot">${isDone ? '✓' : c.id}</div><span>${c.i} ${c.t}</span>`;
    if (!isLocked) li.onclick = () => go(c.id);
    ul.appendChild(li);
  });
}

// ── NAVIGATION ──
function go(id, skip) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('on'));
  const el = document.getElementById('v' + id);
  if (!el) return;
  el.classList.add('on');
  S.ch = id;
  save();
  nav();
  xpUI();
  restoreQuizState(el);
  if (!skip) window.scrollTo({top: 0, behavior: 'smooth'});
}

function done(id) {
  if (!S.done.includes(id)) {
    S.done.push(id);
    xpAdd(50);
    ach(id);
    save();
  }
  nav();
  setTimeout(() => go(id + 1), 600);
}

// ── XP ──
function xpAdd(n) {
  S.xp += n;
  S.lv = Math.floor(S.xp / 200) + 1;
  save();
  xpUI();
  // Floating +XP popup
  const p = document.createElement('div');
  p.className = 'xpp';
  p.textContent = '+' + n + ' XP';
  p.style.left = '50%';
  p.style.top  = '45%';
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 1400);
}

function xpUI() {
  const pct = (S.xp % 200) / 200 * 100;
  document.getElementById('xpBar').style.width = pct + '%';
  document.getElementById('xpNum').textContent  = S.xp + ' XP';
  document.getElementById('lvl').textContent    = 'LVL ' + S.lv;
}

// ── QUIZ ──
function qz(el, ok) {
  const quiz = el.closest('.quiz');
  const id   = quiz.dataset.id;

  // Already answered correctly — do nothing
  if (S.qd.includes(id)) return;

  const msg = quiz.querySelector('.quiz-msg');

  if (ok) {
    el.classList.add('yes');
    msg.textContent  = '🎉 נכון מאוד!';
    msg.style.color  = 'var(--emerald)';
    msg.style.display = 'block';
    S.qd.push(id);
    xpAdd(25);
    save();
    // Lock all options after correct answer
    quiz.querySelectorAll('.quiz-opt').forEach(o => o.style.pointerEvents = 'none');
  } else {
    el.classList.add('no');
    msg.textContent  = '❌ לא בדיוק, נסו שוב!';
    msg.style.color  = 'var(--rose)';
    msg.style.display = 'block';
    setTimeout(() => {
      el.classList.remove('no');
      msg.style.display = 'none';
    }, 1500);
  }
}

// Restore quiz visual state when navigating to a chapter
function restoreQuizState(viewEl) {
  viewEl.querySelectorAll('.quiz').forEach(quiz => {
    const id = quiz.dataset.id;
    if (!S.qd.includes(id)) return;

    // Find and highlight the correct option
    quiz.querySelectorAll('.quiz-opt').forEach(opt => {
      const oc = opt.getAttribute('onclick') || '';
      if (oc.includes(',1)')) opt.classList.add('yes');
      opt.style.pointerEvents = 'none';
    });

    // Show "already answered" message
    const msg = quiz.querySelector('.quiz-msg');
    msg.textContent  = '✓ כבר ענית נכון על שאלה זו';
    msg.style.color  = 'var(--emerald)';
    msg.style.display = 'block';
  });
}

// ── ACHIEVEMENT ──
function ach(id) {
  const a = ACH[id];
  if (!a) return;
  const el = document.getElementById('ach');
  document.getElementById('achI').textContent = a.i;
  document.getElementById('achT').textContent = a.t;
  document.getElementById('achD').textContent = a.d;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3500);
}

// ── COPY WITH TOOLTIP ──
function sc(btn) {
  const t = btn.closest('.say-content').querySelector('p').textContent.trim();
  navigator.clipboard.writeText(t).then(() => {
    btn.textContent = '✓';
    btn.classList.add('ok');
    const tip = document.createElement('span');
    tip.className   = 'copy-tip';
    tip.textContent = 'הועתק!';
    btn.appendChild(tip);
    setTimeout(() => {
      btn.textContent = '📋';
      btn.classList.remove('ok');
      if (tip.parentNode) tip.remove();
    }, 2000);
  }).catch(() => {
    // Fallback for file:// or browsers without clipboard API
    btn.textContent = '✓';
    btn.classList.add('ok');
    setTimeout(() => { btn.textContent = '📋'; btn.classList.remove('ok'); }, 1500);
  });
}

// ── FINALE ──
function finale() { done(12); confetti(); }

// ── RESET ──
function resetAll() {
  if (!confirm('לאפס את כל ההתקדמות ולהתחיל מחדש?')) return;
  S = {ch:0, done:[], xp:0, lv:1, qd:[]};
  save();
  // Reset all quiz visuals
  document.querySelectorAll('.quiz-opt').forEach(o => {
    o.classList.remove('yes','no');
    o.style.pointerEvents = '';
  });
  document.querySelectorAll('.quiz-msg').forEach(m => m.style.display = 'none');
  go(0, true);
  xpUI();
}

function confetti() {
  const c = document.getElementById('confetti');
  const x = c.getContext('2d');
  c.width  = innerWidth;
  c.height = innerHeight;
  const cl = ['#E8714A','#F59E0B','#10B981','#38BDF8','#FB7185','#A78BFA'];
  const P  = [];
  for (let i = 0; i < 160; i++) P.push({
    x:  Math.random() * c.width,
    y:  Math.random() * c.height - c.height,
    w:  Math.random() * 10 + 5,
    h:  Math.random() * 6  + 3,
    c:  cl[Math.floor(Math.random() * cl.length)],
    s:  Math.random() * 3  + 2,
    a:  Math.random() * Math.PI * 2,
    sp: (Math.random() - .5) * .1,
    dr: (Math.random() - .5) * 2,
  });
  let f = 0;
  (function run() {
    x.clearRect(0, 0, c.width, c.height);
    P.forEach(p => {
      p.y += p.s; p.x += p.dr; p.a += p.sp;
      x.save(); x.translate(p.x, p.y); x.rotate(p.a);
      x.fillStyle = p.c; x.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      x.restore();
    });
    if (++f < 220) requestAnimationFrame(run);
    else x.clearRect(0, 0, c.width, c.height);
  })();
}

// ── TOPBAR SCROLL SHADOW ──
window.addEventListener('scroll', () => {
  document.querySelector('.topbar').classList.toggle('scrolled', window.scrollY > 10);
}, {passive: true});

// ── HERO PARTICLES ──
function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;
  for (let i = 0; i < 12; i++) {
    const dot = document.createElement('div');
    dot.className = 'particle';
    const size = Math.random() * 4 + 2;
    dot.style.width           = size + 'px';
    dot.style.height          = size + 'px';
    dot.style.left            = Math.random() * 100 + '%';
    dot.style.bottom          = '-10px';
    dot.style.animationDuration = (Math.random() * 6 + 4) + 's';
    dot.style.animationDelay    = (Math.random() * 8) + 's';
    container.appendChild(dot);
  }
}

// ── INIT ──
// Restore saved chapter (or ch0 on first visit)
nav();
go(S.ch, true);
xpUI();
initParticles();
