// Flight physics for the black-hole mini game. Pure functions: the page uses them and so does tools/game_human.js.
// Units: rs = 1 (Schwarzschild radius), GM = 0.5, one sim unit = P.TU minutes of ship time. Paczynski-Wiita potential
// reproduces the real ISCO (3 rs) and the marginally bound orbit (2 rs).
// The game is one decision: dive when the line is green, then choose how long to stay at the probe.
(function (root) {
  const GM = .5;
  const P = {
    R0: 10,          // the mother ship's parking orbit
    RP: 2.7,         // the probe hovers here
    PICK: .75,       // a dive passing this close to the probe docks with it
    TU: 10,          // ship minutes per sim unit
    XP: 2.656e-10,   // at the probe one hour is seven years on Earth (Miller's planet)
    TRIES: 3,
  };
  // Earth minutes per ship minute at radius r: hovering clock rate sqrt((1+x)/x) of a static observer at
  // r = rs(1+x), with x shrinking steeply toward the probe (Gargantua spins, so the steep part is near it)
  function dil(r) {
    if (r <= 1.0001) return Infinity;
    const x = P.XP * Math.pow((r - 1) / (P.RP - 1), 16);
    return Math.sqrt((1 + x) / x);
  }
  const vc = r => Math.sqrt(GM * r) / (r - 1);
  function make(angle = -Math.PI / 2, probeAngle = Math.PI * .72) {
    const s = { ship: 0, earth: 0, over: null, px: P.RP * Math.cos(probeAngle), py: P.RP * Math.sin(probeAngle) };
    return orbit(s, angle);
  }
  function orbit(s, angle) {
    const v = vc(P.R0);
    s.x = P.R0 * Math.cos(angle); s.y = P.R0 * Math.sin(angle); s.vx = -v * Math.sin(angle); s.vy = v * Math.cos(angle);
    return s;
  }
  function acc(x, y) { const r = Math.hypot(x, y), k = -GM / ((r - 1) * (r - 1)) / r; return [k * x, k * y]; }
  // free flight for h sim units (velocity Verlet with finer steps near the hole); clocks advance with it
  function step(s, h) {
    let left = h;
    while (left > 1e-9) {
      const r = Math.hypot(s.x, s.y), dt = Math.min(left, Math.max(.0025, .02 * Math.pow(r - 1, 1.5)));
      let [ax, ay] = acc(s.x, s.y);
      s.vx += ax * dt * .5; s.vy += ay * dt * .5; s.x += s.vx * dt; s.y += s.vy * dt;
      [ax, ay] = acc(s.x, s.y);
      s.vx += ax * dt * .5; s.vy += ay * dt * .5;
      const r2 = Math.hypot(s.x, s.y);
      if (r2 < 1.02) { s.over = 'lost'; return s; }
      s.ship += dt * P.TU; s.earth += dt * P.TU * dil(r2);
      left -= dt;
    }
    return s;
  }
  // dive = slow down by a fixed amount, chosen so the lowest point of the dive is exactly the probe's height
  const slow = (s, dv) => { const v = Math.hypot(s.vx, s.vy), k = (v - dv) / v; s.vx *= k; s.vy *= k; };
  function diveMin(dv) {
    const q = make(0); slow(q, dv); let m = 99;
    for (let i = 0; i < 4000; i++) { step(q, .25); const r = Math.hypot(q.x, q.y); if (q.over) return 0; if (r < m) m = r; else if (r > m + .5) break; }
    return m;
  }
  let lo = 0, hi = vc(P.R0) * .9;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (diveMin(mid) > P.RP) lo = mid; else hi = mid; }
  const DV = (lo + hi) / 2;
  // the path a dive would take from here: points until it climbs back out, and how close it passes the probe
  function divePath(s, h = .6) {
    const q = { ...s, over: null }; slow(q, DV); const pts = []; let near = 99, low = false;
    for (let i = 0; i < 900; i++) {
      step(q, h); pts.push(q.x, q.y); if (q.over) break;
      const r = Math.hypot(q.x, q.y); near = Math.min(near, Math.hypot(q.x - s.px, q.y - s.py));
      if (r < P.RP + 1) low = true; if (low && r > P.R0 - .5) break;
    }
    pts.near = near; return pts;
  }
  // sideways launch speed from the probe that coasts back up to the parking orbit
  function apo(v) { const q = { x: P.RP, y: 0, vx: 0, vy: v, ship: 0, earth: 0 }; let m = 0;
    for (let i = 0; i < 6000; i++) { step(q, .25); if (q.over) return 0; const r = Math.hypot(q.x, q.y); if (r > m) m = r; else if (r < m - .3) break; if (r > 40) return 40; } return m; }
  lo = 0; hi = 3;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (apo(mid) < P.R0) lo = mid; else hi = mid; }
  const VOUT = (lo + hi) / 2;
  function launchHome(s) {
    const r = Math.hypot(s.px, s.py), ux = s.px / r, uy = s.py / r;
    s.x = s.px; s.y = s.py; s.vx = -uy * VOUT; s.vy = ux * VOUT;
  }
  root.HoleGame = { P, dil, make, orbit, step, slow, divePath, launchHome, DV, GM };
})(typeof window !== 'undefined' ? window : globalThis);
