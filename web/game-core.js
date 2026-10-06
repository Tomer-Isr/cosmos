// Flight physics for the black-hole mini game. Pure functions: the page uses them and so does tools/game_tune.js.
// Units: rs = 1 (Schwarzschild radius), GM = 0.5, one sim unit = P.TU minutes of ship time. Paczynski-Wiita potential reproduces the real ISCO (3 rs)
// and the marginally bound orbit (2 rs): a free fall from far away cannot dip below 2 rs and come back without a burn.
(function (root) {
  const GM = .5;
  const P = {
    R0: 10,          // the mother ship's parking orbit
    RP: 2.4,         // probe hovers here
    PICK: .5,        // pick-up distance from the probe
    HOME: 9,         // back above this radius with the data = mission done
    A: .01,          // engine acceleration
    FUEL: .5,       // total delta-v
    TU: 10,          // ship minutes per sim unit
    XP: 2.656e-10,   // at the probe one hour is seven years on Earth (Miller's planet)
  };
  // how many Earth minutes pass per ship minute at radius r: hovering clock rate sqrt((1+x)/x) of a static
  // observer at r = rs(1+x), with x shrinking steeply toward the probe (Gargantua spins, so the steep part is near it)
  function dil(r) {
    if (r <= 1.0001) return Infinity;
    const x = P.XP * Math.pow((r - 1) / (P.RP - 1), 16);
    return Math.sqrt((1 + x) / x);
  }
  function make(angle = 0, probeAngle = Math.PI * .8) {
    const v = Math.sqrt(GM * P.R0) / (P.R0 - 1);
    return { x: P.R0 * Math.cos(angle), y: P.R0 * Math.sin(angle), vx: -v * Math.sin(angle), vy: v * Math.cos(angle),
      fuel: P.FUEL, ship: 0, earth: 0, got: false, over: null, px: P.RP * Math.cos(probeAngle), py: P.RP * Math.sin(probeAngle), minR: P.R0 };
  }
  function acc(x, y) { const r = Math.hypot(x, y), k = -GM / ((r - 1) * (r - 1)) / r; return [k * x, k * y]; }
  // advance h sim-minutes; (tx, ty) = thrust direction (unit) or 0,0
  function step(s, h, tx = 0, ty = 0) {
    if (s.over) return s;
    let left = h;
    while (left > 1e-9) {
      const r = Math.hypot(s.x, s.y);
      const dt = Math.min(left, Math.max(.0025, .02 * Math.pow(r - 1, 1.5)));
      let thr = 0;
      if ((tx || ty) && s.fuel > 0) { thr = Math.min(P.A, s.fuel / dt); s.fuel = Math.max(0, s.fuel - thr * dt); }
      let [ax, ay] = acc(s.x, s.y);
      s.vx += (ax + thr * tx) * dt * .5; s.vy += (ay + thr * ty) * dt * .5;
      s.x += s.vx * dt; s.y += s.vy * dt;
      [ax, ay] = acc(s.x, s.y);
      s.vx += (ax + thr * tx) * dt * .5; s.vy += (ay + thr * ty) * dt * .5;
      const r2 = Math.hypot(s.x, s.y);
      s.ship += dt * P.TU; s.minR = Math.min(s.minR, r2);
      if (r2 < 1.02) { s.over = 'lost'; s.earth = Infinity; return s; }
      s.earth += dt * P.TU * dil(r2);
      if (!s.got && Math.hypot(s.x - s.px, s.y - s.py) < P.PICK) s.got = true;
      if (s.got && r2 > P.HOME) { s.over = 'home'; return s; }
      if (r2 > 40) { s.over = 'away'; return s; }
      left -= dt;
    }
    return s;
  }
  // coast-only forecast for the dotted line
  // only the next dive counts: the line stops after it climbs back out, and "got" means this pass hits the probe
  function predict(s, n, h) {
    const q = { ...s, over: null, fuel: 0 }, pts = [];
    let near = false, passed = false, got = s.got;
    for (let i = 0; i < n; i++) {
      step(q, h); pts.push(q.x, q.y); if (q.over) break;
      const r = Math.hypot(q.x, q.y);
      if (!passed && q.got) got = true;
      if (r < P.RP + 1.2) near = true;
      if (near && !passed && r > P.RP + 1.8) passed = true;
      if (passed && !s.got && r > 6.5) break;
    }
    pts.over = q.over; pts.got = got;
    return pts;
  }
  root.HoleGame = { P, dil, make, step, predict, GM };
})(typeof window !== 'undefined' ? window : globalThis);
