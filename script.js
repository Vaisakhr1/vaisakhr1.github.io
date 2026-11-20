const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- HUD + XP / ACHIEVEMENTS ---------- */
const TOTAL = 9;
let xp = 0, ach = 0, level = 1;
const done = new Set();

document.body.insertAdjacentHTML('afterbegin',
  `<div id="hud"><span>LV <b id="lv">1</b></span>
   <div class="bar"><i id="xpFill"></i></div>
   <span id="xpTxt">0 XP</span><span id="ach">🏆 0/${TOTAL}</span></div>
   <div id="toasts"></div>`);

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 2600);
}

function addXP(pts, msg) {
  xp += pts;
  if (msg) toast(`+${pts} XP · ${msg}`);
  const newLevel = 1 + Math.floor(xp / 100);
  $('#xpFill').style.width = (xp % 100) + '%';
  $('#xpTxt').textContent = xp + ' XP';
  if (newLevel > level) {
    level = newLevel;
    $('#lv').textContent = level;
    toast(`LEVEL UP! LV ${level}`);
    burst(innerWidth / 2, 50, 40);
  }
}

function earn(id, pts, msg, isAch) {
  if (done.has(id)) return;
  done.add(id);
  if (isAch) {
    ach++;
    $('#ach').textContent = `🏆 ${ach}/${TOTAL}`;
  }
  addXP(pts, msg);
  if (ach === TOTAL) {
    toast('100% COMPLETE!');
    burst(innerWidth / 2, innerHeight / 2, 80);
  }
}

/* ---------- PARTICLES ---------- */
const fx = document.createElement('canvas');
fx.id = 'fx';
document.body.append(fx);
const fc = fx.getContext('2d');
let P = [], running = false;
const sizeFx = () => { fx.width = innerWidth; fx.height = innerHeight; };
sizeFx();
addEventListener('resize', sizeFx);

function burst(x, y, n = 14) {
  if (reduce) return;
  const cols = ['#00ffd5', '#ffd23f', '#ff5d8f'];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, s = 1 + Math.random() * 5;
    P.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, l: 40 + Math.random() * 25, c: cols[i % 3] });
  }
  if (!running) { running = true; requestAnimationFrame(tick); }
}
function tick() {
  fc.clearRect(0, 0, fx.width, fx.height);
  P = P.filter(p => p.l-- > 0);
  P.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.15;
    fc.fillStyle = p.c;
    fc.fillRect(p.x, p.y, 5, 5);
  });
  P.length ? requestAnimationFrame(tick) : (running = false, fc.clearRect(0, 0, fx.width, fx.height));
}

/* ---------- INTRO ---------- */
const intro = $('#introScreen');
const enterBtn = $('#enterSite');
enterBtn.textContent = 'Press Start ▶';
function start() {
  if (!intro.isConnected) return;
  intro.style.opacity = '0';
  setTimeout(() => intro.remove(), 600);
  earn('start', 10, 'Game started', true);
}
enterBtn.addEventListener('click', start);
addEventListener('keydown', e => {
  if (intro.isConnected && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); start(); }
});

/* ---------- HEADER STAR CATCHER ---------- */
const hdr = $('header');
const sky = document.createElement('canvas');
sky.id = 'sky';
hdr.prepend(sky);
hdr.insertAdjacentHTML('beforeend', '<p class="hint">Catch the falling stars ✦ (gold ones are rare)</p>');
const sc = sky.getContext('2d');
let S = [], visible = true, caught = 0;
const sizeSky = () => { sky.width = hdr.clientWidth; sky.height = hdr.clientHeight; };
sizeSky();
addEventListener('resize', sizeSky);
new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(hdr);

setInterval(() => {
  if (visible && !reduce && S.length < 9)
    S.push({ x: 20 + Math.random() * (sky.width - 40), y: -10, vy: 0.7 + Math.random() * 0.9, gold: Math.random() < 0.2 });
}, 600);

(function drawSky() {
  sc.clearRect(0, 0, sky.width, sky.height);
  if (visible) {
    S.forEach(s => {
      s.y += s.vy;
      sc.fillStyle = s.gold ? '#ffd23f' : '#00ffd5';
      sc.fillRect(s.x - 9, s.y - 3, 18, 6);
      sc.fillRect(s.x - 3, s.y - 9, 6, 18);
    });
    S = S.filter(s => s.y < sky.height + 12);
  }
  requestAnimationFrame(drawSky);
})();

sky.addEventListener('pointerdown', e => {
  const r = sky.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  const i = S.findIndex(s => Math.hypot(s.x - x, s.y - y) < 30);
  if (i < 0) return;
  const s = S.splice(i, 1)[0];
  caught++;
  burst(e.clientX, e.clientY, s.gold ? 30 : 12);
  addXP(s.gold ? 10 : 3, s.gold ? 'Rare star!' : null);
  if (caught === 5) earn('stars', 20, 'Star collector', true);
});

/* ---------- ABOUT ---------- */
const toggleBtn = $('#toggleAbout'), moreAbout = $('#moreAbout');
toggleBtn.addEventListener('click', () => {
  moreAbout.classList.toggle('hidden');
  const open = !moreAbout.classList.contains('hidden');
  toggleBtn.textContent = open ? 'Read less' : 'Read more';
  if (open) earn('about', 10, 'Read the lore', true);
});
$('#profilePhoto').addEventListener('click', e => {
  e.target.classList.toggle('active');
  earn('photo', 5, 'Selfie mode', true);
});

/* ---------- SKILLS: tap to unlock ---------- */
$('#skills h2').insertAdjacentHTML('afterend', '<p class="hint-line">Tap a skill to unlock it ✦</p>');
let unlocked = 0;
$$('.skills-grid span').forEach(chip => {
  chip.tabIndex = 0;
  chip.setAttribute('role', 'button');
  const unlock = () => {
    if (chip.classList.contains('on')) return;
    chip.classList.add('on');
    unlocked++;
    const r = chip.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 10);
    addXP(2);
    if (unlocked === 3) earn('skills', 15, 'Skill unlocked ×3', true);
  };
  chip.addEventListener('click', unlock);
  chip.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); unlock(); } });
});

/* ---------- PROJECTS ---------- */
const btns = $$('.toggleProject');
btns.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    const media = btn.nextElementSibling;
    const wasHidden = media.classList.contains('hidden');
    $$('.project-media').forEach(pm => {
      pm.classList.add('hidden');
      $$('video', pm).forEach(v => { v.pause(); v.currentTime = 0; });
    });
    btns.forEach(b => (b.textContent = 'View Media'));
    if (wasHidden) {
      media.classList.remove('hidden');
      $$('video', media).forEach(v => v.play().catch(() => {}));
      btn.textContent = 'Hide Media';
      earn('project', 10, 'Level loaded', true);
      earn('proj' + i, 5, 'New level explored');
    }
  });
});

// 3D tilt on project cards (mouse only)
if (matchMedia('(hover:hover)').matches && !reduce) {
  $$('.project').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => (card.style.transform = ''));
  });
}

/* ---------- RESUME ---------- */
$('#resume a').addEventListener('click', () => earn('resume', 20, 'Loot acquired', true));

/* ---------- DISCOVER SECTIONS ---------- */
const seen = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting && !intro.isConnected)
      earn('sec-' + en.target.id, 8, 'Discovered: ' + $('h2', en.target).textContent);
  });
}, { threshold: 0.4 });
$$('section[id]').forEach(s => seen.observe(s));

/* ---------- SECRET: KONAMI CODE ---------- */
const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let pos = 0;
addEventListener('keydown', e => {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  pos = k === code[pos] ? pos + 1 : k === code[0] ? 1 : 0;
  if (pos === code.length) {
    pos = 0;
    document.body.classList.toggle('retro');
    burst(innerWidth / 2, innerHeight / 2, 60);
    earn('konami', 50, 'Cheat code! Retro mode', true);
  }
});
