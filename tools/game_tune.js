// Autopilot for the black-hole game: proves the mission can be done with the fuel given and shows the range of
// results. Usage: node tools/game_tune.js
require('../web/game-core.js');
const { P, make, step, GM } = globalThis.HoleGame;
const H = .1;
// retro burn b1, coast; after the pick-up, burn prograde until specific energy > eT
function fly(b1, eT, probeA) {
  const s = make(0, isNaN(probeA) ? 0 : probeA);
  if (isNaN(probeA)) { s.px = 1e6; s.py = 0; }
  let phase = 0, t = 0, pa = 0, best = 99;
  while (!s.over && t < 6000) {
    const v = Math.hypot(s.vx, s.vy), r = Math.hypot(s.x, s.y);
    if (r < best) { best = r; pa = Math.atan2(s.y, s.x); }
    let tx = 0, ty = 0;
    if (phase === 0) { if (P.FUEL - s.fuel >= b1 - 1e-9) phase = 1; else { tx = -s.vx / v; ty = -s.vy / v; } }
    if (phase === 1 && s.got) phase = 2;
    if (phase === 2) { const E = v * v / 2 - GM / (r - 1); if (E > eT) phase = 3; else { tx = s.vx / v; ty = s.vy / v; } }
    const h = phase === 0 ? Math.min(H, (b1 - (P.FUEL - s.fuel)) / P.A + 1e-6) : H;
    step(s, h, tx, ty); t += h;
    if (isNaN(probeA) && best < 4 && r > best + 1.5) break;
  }
  return { s, best, pa };
}
let wins = 0;
for (let b1 = .02; b1 < .07; b1 += .0025) {
  const dry = fly(b1, 0, NaN);
  if (dry.s.over === 'lost') { console.log(`retro ${b1.toFixed(4)}: plunges`); continue; }
  for (const eT of [-.01, .01]) {
    const { s } = fly(b1, eT, dry.pa);
    if (s.over === 'home') wins++;
    console.log(`retro ${b1.toFixed(4)} peri ${dry.best.toFixed(2)} eT ${eT}: ${s.over || 'timeout'} got=${s.got} minR=${s.minR.toFixed(2)} fuel=${s.fuel.toFixed(2)} ship=${(s.ship / 60).toFixed(1)}h earth=${(s.earth / 525960).toFixed(2)}y`);
  }
}
console.log('wins', wins);
