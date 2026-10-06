// Plays the black-hole game the way the page runs it: circle the parking orbit, dive the moment the line is green,
// hover at the probe for H seconds, go home. Proves a green dive really docks and the way home really returns.
// Usage: node tools/game_human.js
require('../web/game-core.js');
const { P, make, step, slow, divePath, launchHome, dil, DV } = globalThis.HoleGame;
const FPS = 30, MY = 525949, ORBIT_SPEED = 20, DIVE_SPEED = 8, HOVER_MIN_PER_S = 6;
console.log('dive dv', DV.toFixed(4), ' dilation at probe', Math.round(dil(P.RP)));
function play(hoverS) {
  const s = make(); let mode = 'orbit', t = 0, data = 0, waited = 0;
  while (t < 300) {
    const dt = 1 / FPS; t += dt;
    if (mode === 'orbit') {
      const path = divePath(s, 1.2);
      if (path.near < P.PICK * .8) { slow(s, DV); mode = 'dive'; }
      else { step(s, dt * ORBIT_SPEED); waited += dt; }
    } else if (mode === 'dive') {
      step(s, dt * DIVE_SPEED);
      if (Math.hypot(s.x - s.px, s.y - s.py) < P.PICK) mode = 'hover';
      if (s.over) return { s, mode: 'lost', t };
      if (Math.hypot(s.x, s.y) > P.R0 - .5 && t > 5) return { s, mode: 'missed', t };
    } else if (mode === 'hover') {
      const m = dt * HOVER_MIN_PER_S; s.ship += m; s.earth += m * dil(P.RP); data += dt;
      if (data >= hoverS) { launchHome(s); mode = 'home'; }
    } else {
      const r0 = Math.hypot(s.x, s.y); step(s, dt * DIVE_SPEED); const r1 = Math.hypot(s.x, s.y);
      if (s.over) return { s, mode: 'lost on way home', t };
      if (r1 > P.R0 - .6 && r1 <= r0) return { s, mode: 'home', t, waited };
    }
  }
  return { s, mode: 'timeout', t };
}
for (const h of [1, 3, 5, 8]) {
  const { s, mode, t, waited } = play(h);
  console.log(`hover ${h}s: ${mode} after ${t.toFixed(1)}s (waited for green ${(waited || 0).toFixed(1)}s), ship ${(s.ship / 60).toFixed(1)} h, earth ${(s.earth / MY).toFixed(2)} y`);
}
