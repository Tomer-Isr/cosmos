// "Human" policy for the black-hole game, with the page's own time rules: wait d seconds, hold Brake until the
// forecast line turns green (passes the probe), release; after the pick-up, hold Thrust while the line ends in the hole.
// Shows that a win exists for some waiting time and what it costs. Usage: node tools/game_human.js
require('../web/game-core.js');
const { P, make, step, predict } = globalThis.HoleGame;
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const FPS = 30, MY = 525949;
function play(wait) {
  const s = make(-Math.PI / 2, Math.PI * .72);
  let t = 0, mode = 'wait';
  while (!s.over && t < 240) {
    const r = Math.hypot(s.x, s.y), v = Math.hypot(s.vx, s.vy);
    let thr = 0;
    if (t >= wait && mode === 'wait') mode = 'brake';
    if (mode === 'brake' || mode === 'fix') {
      const pr = predict(s, 420, .7);
      if (!s.got && pr.got) mode = 'coast';
      else if (pr.over === 'lost') { mode = 'fix'; thr = 1; }
      else if (mode === 'brake') thr = -1;
      else mode = 'coast';
    }
    if (mode === 'coast' && (s.got || Math.floor(t * FPS) % 6 === 0)) { const pr = predict(s, 420, .7); if (pr.over === 'lost') thr = 1; }
    let sp = 1.5 + 8.5 * sstep(2.6, 7, r); if (thr) sp = Math.min(sp, 1.5);
    step(s, sp / FPS, thr * s.vx / v, thr * s.vy / v);
    t += 1 / FPS;
  }
  return { s, t };
}
let wins = 0;
for (let w = 0; w <= 24; w += 1) {
  const { s, t } = play(w);
  if (s.over === 'home') wins++;
  console.log(`wait ${w}s: ${s.over || 'running'} in ${t.toFixed(0)}s, got=${s.got}, fuel ${s.fuel.toFixed(2)}, ship ${(s.ship / 60).toFixed(1)} h, earth ${(s.earth / MY).toFixed(2)} y`);
}
console.log('wins', wins);
