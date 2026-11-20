// Mini-game: endless runner. Load AFTER script.js (uses its earn/addXP/burst).
(() => {
  document.querySelector('#projects').insertAdjacentHTML('beforebegin',
    `<section id="game"><h2>Mini-Game</h2>
     <p class="hint-line">Jump the spikes, grab the coins. Tap, click or press Space ✦ Score 500 for an achievement.</p>
     <canvas id="gameCv" width="640" height="240" aria-label="Endless runner mini-game"></canvas>
     <p class="hint-line" id="gameStat">Best: 0</p></section>`);

  const cv = document.getElementById('gameCv'), g = cv.getContext('2d');
  const W = 640, H = 240, GY = 196, PS = 36, PX = 70;
  const img = new Image();
  img.src = 'assets/images/Avatar1.png';

  let st = 'idle', y, vy, obs, coins, speed, dist, got, nextObs, overAt = 0;
  let best = 0, visible = false, coinXP = 0, score = 0;
  try { best = +localStorage.getItem('dashBest') || 0; } catch (e) {}
  const bg = Array.from({ length: 30 }, () => ({ x: Math.random() * W, y: Math.random() * (GY - 20), s: 1 + Math.random() * 2 }));
  const stat = document.getElementById('gameStat');
  stat.textContent = `Best: ${best}`;

  function reset() {
    y = GY - PS; vy = 0; obs = []; coins = []; speed = 5; dist = 0; got = 0; nextObs = 40; score = 0;
  }
  reset();

  function jump() {
    if (st !== 'run') {
      if (st === 'over' && performance.now() - overAt < 400) return;
      reset();
      st = 'run';
      earn('game-play', 5, 'Player 1 ready');
    }
    if (y >= GY - PS - 0.5) vy = -11.5;
  }

  function pageXY(x, yy) {
    const r = cv.getBoundingClientRect();
    return [r.left + x * r.width / W, r.top + yy * r.height / H];
  }

  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function update() {
    speed = Math.min(11, 5 + dist / 1500);
    vy += 0.62; y += vy;
    if (y > GY - PS) { y = GY - PS; vy = 0; }

    if (--nextObs <= 0) {
      const w = 24, h = 30 + Math.random() * 20, n = Math.random() < 0.3 ? 2 : 1;
      for (let i = 0; i < n; i++) obs.push({ x: W + 20 + i * w, w, h });
      if (Math.random() < 0.5) coins.push({ x: W + 20 + (n * w) / 2 - 6, y: GY - 70 - Math.random() * 30 });
      nextObs = 50 + Math.random() * 50;
    }
    obs.forEach(o => (o.x -= speed));
    coins.forEach(c => (c.x -= speed));
    obs = obs.filter(o => o.x > -60);
    dist += speed;

    const p = { x: PX + 6, y: y + 6, w: PS - 12, h: PS - 8 };
    coins = coins.filter(c => {
      if (c.x < -20) return false;
      if (hit(p, { x: c.x, y: c.y, w: 12, h: 12 })) {
        got++;
        if (coinXP < 20) { coinXP++; addXP(1); }
        burst(...pageXY(c.x, c.y), 6);
        return false;
      }
      return true;
    });
    score = Math.floor(dist / 10) + got * 10;

    if (obs.some(o => hit(p, { x: o.x + o.w * 0.2, y: GY - o.h * 0.8, w: o.w * 0.6, h: o.h * 0.8 }))) die();
  }

  function die() {
    st = 'over';
    overAt = performance.now();
    burst(...pageXY(PX + PS / 2, y + PS / 2), 25);
    if (score > best) {
      best = score;
      try { localStorage.setItem('dashBest', best); } catch (e) {}
    }
    stat.textContent = `Score ${score} · Best ${best} · Coins ${got}`;
    if (score >= 500) earn('runner', 25, 'Speed runner', true);
  }

  function draw() {
    const a = getComputedStyle(document.body).getPropertyValue('--a').trim() || '#00ffd5';
    g.fillStyle = '#10142a';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#4a5280';
    bg.forEach(s => {
      if (st === 'run') { s.x -= s.s * 0.3 * (speed / 5); if (s.x < 0) s.x = W; }
      g.fillRect(s.x, s.y, s.s, s.s);
    });
    g.fillStyle = a;
    g.fillRect(0, GY, W, 3);
    g.fillStyle = '#2a3150';
    const off = dist % 40;
    for (let i = 0; i < 18; i++) g.fillRect(i * 40 - off, GY + 14, 20, 3);

    g.fillStyle = '#ff5d8f';
    obs.forEach(o => {
      g.beginPath();
      g.moveTo(o.x, GY); g.lineTo(o.x + o.w / 2, GY - o.h); g.lineTo(o.x + o.w, GY);
      g.fill();
    });
    coins.forEach(c => {
      g.fillStyle = '#ffd23f'; g.fillRect(c.x, c.y, 12, 12);
      g.fillStyle = '#fff6c2'; g.fillRect(c.x + 3, c.y + 3, 4, 4);
    });

    g.save();
    g.beginPath();
    g.arc(PX + PS / 2, y + PS / 2, PS / 2, 0, 6.28);
    g.clip();
    if (img.complete && img.naturalWidth) g.drawImage(img, PX, y, PS, PS);
    else { g.fillStyle = a; g.fillRect(PX, y, PS, PS); }
    g.restore();
    g.strokeStyle = a; g.lineWidth = 3;
    g.beginPath(); g.arc(PX + PS / 2, y + PS / 2, PS / 2, 0, 6.28); g.stroke();

    g.font = '12px "Press Start 2P", monospace';
    g.fillStyle = '#eaeaea';
    g.textAlign = 'right';
    g.fillText(score, W - 12, 24);
    g.textAlign = 'left';
    g.fillStyle = '#ffd23f';
    g.fillText('x' + got, 12, 24);
    if (st !== 'run') {
      g.textAlign = 'center';
      g.fillStyle = a;
      g.fillText(st === 'idle' ? 'Tap or press Space to start' : 'Game over - tap to retry', W / 2, 110);
    }
  }

  // fixed timestep so speed is identical on 60Hz and 120Hz screens
  let acc = 0, prev = performance.now();
  function loop(now) {
    if (!visible) prev = now;
    acc += Math.min(now - prev, 100);
    prev = now;
    while (acc >= 16.67) { if (st === 'run' && visible) update(); acc -= 16.67; }
    if (visible) draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { threshold: 0.5 }).observe(cv);

  cv.addEventListener('pointerdown', e => { e.preventDefault(); jump(); });
  addEventListener('keydown', e => {
    if (!visible || document.getElementById('introScreen')) return;
    if (['BUTTON', 'A', 'INPUT'].includes(document.activeElement.tagName)) return;
    if (e.key === ' ' || e.key === 'w' || e.key === 'W' || (e.key === 'ArrowUp' && st === 'run')) {
      e.preventDefault();
      jump();
    }
  });
})();
