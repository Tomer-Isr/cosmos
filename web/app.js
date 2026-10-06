(() => {
const $ = id => document.getElementById(id);
const root = document.documentElement;
root.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let mob = innerWidth < 760;
const DAY = 864e5, YEAR = 365.2425 * DAY;
const SITE = 'https://cosmos.tomerisr.org.il';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function lerpTable(t, x) { if (x <= t[0][0]) return t[0][1]; for (let i = 1; i < t.length; i++) if (x <= t[i][0]) { const [x0, y0] = t[i - 1], [x1, y1] = t[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return t[t.length - 1][1]; }
const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

/* ================= language ================= */
const LANGS = ['ru', 'en', 'he'];
const params = new URLSearchParams(location.search);
function pickLang() {
  const q = params.get('lang'); if (LANGS.includes(q)) return q;
  const p = (location.pathname.match(/\/(en|he)\/(index\.html)?$/) || [])[1]; if (p) return p;
  const saved = ls.get('cosmos-lang'); if (LANGS.includes(saved)) return saved;
  const nav = (navigator.language || '').slice(0, 2).toLowerCase();
  if (nav === 'he' || nav === 'iw') return 'he';
  if (['ru', 'uk', 'be', 'kk'].includes(nav)) return 'ru';
  return root.lang === 'ru' && nav ? 'en' : (LANGS.includes(root.lang) ? root.lang : 'ru');
}
let lang = pickLang(), D = I18N[lang];
const t = (k, v) => { let s = D[k] != null ? D[k] : (I18N.ru[k] != null ? I18N.ru[k] : k); if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; };
function pl(n, forms) {
  if (lang === 'ru') { if (n % 1 !== 0) return forms[1]; n = Math.abs(n) % 100; const m = n % 10; if (n > 10 && n < 20) return forms[2]; if (m > 1 && m < 5) return forms[1]; if (m === 1) return forms[0]; return forms[2]; }
  return Math.abs(n) === 1 ? forms[0] : forms[1];
}
const fmt = (n, d = 0) => n.toLocaleString(D._locale, { maximumFractionDigits: d, minimumFractionDigits: d });
function big(n) { if (n >= 1e12) return fmt(n / 1e12, 2) + ' ' + t('bigT'); if (n >= 1e9) return fmt(n / 1e9, 2) + ' ' + t('bigB'); if (n >= 1e6) return fmt(n / 1e6, 1) + ' ' + t('bigM'); return fmt(n); }
const yrs = n => pl(n, D.years), dys = n => pl(n, D.days);
const ageFmt = a => a < 10 ? fmt(a, 2) : fmt(a, 1);
const pathFor = l => l === 'ru' ? '/' : '/' + l + '/';

/* ================= data ================= */
const POP = [[1900,1.65e9],[1950,2.50e9],[1960,3.02e9],[1970,3.70e9],[1980,4.44e9],[1990,5.33e9],[2000,6.15e9],[2010,6.99e9],[2020,7.84e9],[2026.76,8.21e9],[2030,8.5e9]];
const BIRTHS = [[1900,55e6],[1950,92e6],[1960,105e6],[1970,121e6],[1980,126e6],[1990,138e6],[2000,133e6],[2010,140e6],[2020,134e6],[2026,131e6],[2030,130e6]];
const YOUNGER = [[0,0],[5,8.3],[10,16.6],[15,24.7],[20,32.6],[25,40.2],[30,47.7],[35,55],[40,61.7],[45,67.8],[50,73.6],[55,79],[60,84],[65,88.3],[70,92],[75,95],[80,97.3],[85,98.8],[90,99.5],[100,99.98],[120,100]];
// id, distance (ly), spectral type, colour, RA (h), Dec (deg)
const STARS = [
  ['sun',0.0000158,'G2V',[255,214,140],0,0],
  ['alphaCen',4.37,'G2V',[255,226,170],14.66,-60.83],
  ['barnard',5.96,'M4V',[255,150,110],17.96,4.69],
  ['sirius',8.6,'A1V',[200,220,255],6.75,-16.72],
  ['epsEri',10.5,'K2V',[255,200,140],3.55,-9.46],
  ['procyon',11.46,'F5IV',[245,240,230],7.65,5.22],
  ['tauCet',11.9,'G8V',[255,220,160],1.73,-15.94],
  ['altair',16.7,'A7V',[220,230,255],19.85,8.87],
  ['etaCas',19.4,'G0V',[255,230,180],0.82,57.82],
  ['vega',25.0,'A0V',[190,210,255],18.62,38.78],
  ['fomalhaut',25.1,'A3V',[205,220,255],22.96,-29.62],
  ['pollux',33.8,'K0III',[255,190,120],7.76,28.03],
  ['arcturus',36.7,'K1.5III',[255,175,100],14.26,19.18],
  ['capella',42.9,'G3III',[255,225,160],5.28,46.0],
  ['alderamin',49,'A8V',[225,232,255],21.31,62.59],
  ['castor',51,'A1V',[205,220,255],7.58,31.89],
  ['menkent',58.8,'K0III',[255,195,130],14.11,-36.37],
  ['aldebaran',65.3,'K5III',[255,160,90],4.6,16.51],
  ['hamal',66,'K2III',[255,185,120],2.12,23.46],
  ['alphecca',75,'A1IV',[210,225,255],15.58,26.71],
  ['regulus',79.3,'B8IV',[185,205,255],10.14,11.97],
  ['merak',79.7,'A1V',[210,225,255],11.03,56.38],
  ['alcor',81.7,'A5V',[220,230,255],13.42,54.99],
  ['denebKaitos',96.3,'K0III',[255,195,130],0.73,-17.99],
];
const starName = s => s[0] === 'sun' ? t('sunName') : D.stars[s[0]][0];
const starDesc = s => s[0] === 'sun' ? '' : D.stars[s[0]][1];
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const nearestStar = years => STARS.reduce((b, s) => Math.abs(s[1] - years) < Math.abs(b[1] - years) ? s : b, STARS[0]);
// id, period (days), colour, ring, orbit radius (scene), size, mean longitude J2000, eccentricity, longitude of perihelion, real distance (mln km)
const PLANETS = [
  ['mercury',87.969,[180,170,160],0,4.2,.16,252.25,.2056,77.46,57.9],
  ['venus',224.701,[235,205,150],0,6.2,.3,181.98,.0068,131.53,108.2],
  ['earth',365.2425,[110,170,255],1,8.6,.34,100.46,.0167,102.94,149.6],
  ['mars',686.98,[220,110,70],0,11.2,.22,355.45,.0934,336.04,227.9],
  ['jupiter',4332.59,[220,180,140],0,16,.9,34.40,.0484,14.75,778.5],
  ['saturn',10759.22,[230,205,150],2,21,.76,49.94,.0539,92.43,1433],
  ['uranus',30688.5,[150,220,230],0,26,.5,313.23,.0473,170.96,2871],
  ['neptune',60182,[90,130,240],0,30,.48,304.88,.0086,44.97,4495],
];
const plName = id => D.planets[id];
const yearLenVal = period => period < 1000 ? `${fmt(Math.round(period))} ${dys(Math.round(period))}` : `${fmt(period / 365.2425, 1)} ${yrs(period / 365.2425)}`;
const yearLenNote = period => period < 1000 ? t('yearDays', { n: fmt(Math.round(period)) }) : t('yearYears', { n: fmt(period / 365.2425, 1) });
const HALLEY_PREV = new Date('1986-02-09'), HALLEY_NEXT = new Date('2061-07-28');

/* ================= dates ================= */
const validDate = v => { if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) return null; const d = new Date(v + 'T00:00:00'); return isNaN(d) || d > new Date() || d.getFullYear() < 1900 ? null : d; };
const input = $('birth'), fdate = $('fdate'), fname = $('fname');
const SAMPLE = '1990-06-15';
const qDate = params.get('d') || (location.hash.match(/^#(\d{4}-\d{2}-\d{2})$/) || [])[1];
const stored = ls.get('cosmos-birth');
const startDate = validDate(qDate) ? qDate : validDate(stored) ? stored : SAMPLE;
input.value = startDate;
input.max = fdate.max = new Date().toISOString().slice(0, 10);
$('sample').hidden = startDate !== SAMPLE;
let birth = new Date(startDate + 'T00:00:00');
if (validDate(params.get('f'))) fdate.value = params.get('f');
if (params.get('n')) fname.value = params.get('n').slice(0, 24);
let friend = validDate(fdate.value), friendStar = null;
const pageOpen = Date.now();
const planetAges = {}, friendAges = {};
input.addEventListener('change', () => {
  const d = validDate(input.value); if (!d) return;
  birth = d; ls.set('cosmos-birth', input.value); $('sample').hidden = true;
  renderStatic(); renderCompare(); weeksAnim = 0; drawWeeks(1);
});
const onFriend = () => { friend = validDate(fdate.value); renderCompare(); };
fdate.addEventListener('change', onFriend); fname.addEventListener('input', onFriend);
$('form').addEventListener('submit', e => e.preventDefault());
$('cmpForm').addEventListener('submit', e => e.preventDefault());

function shareUrl(withFriend) {
  let u = SITE + pathFor(lang) + '?d=' + input.value;
  if (withFriend && friend) { u += '&f=' + fdate.value; if (fname.value.trim()) u += '&n=' + encodeURIComponent(fname.value.trim()); }
  return u;
}
function copy(text, note) {
  const done = ok => { note.textContent = ok ? t('shared') : text; };
  try { navigator.clipboard.writeText(text).then(() => done(true), () => done(false)); } catch (e) { done(false); }
}
$('share').onclick = () => copy(shareUrl(false), $('shareNote'));
$('cmpShare').onclick = () => copy(shareUrl(true), $('cmpNote'));

/* ================= odometer ================= */
const odo = $('odo');
function setOdo(n) {
  const s = Math.floor(n).toString();
  if (odo.dataset.len !== String(s.length)) {
    odo.dataset.len = s.length; odo.innerHTML = '';
    for (let i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 === 0) { const sp = document.createElement('span'); sp.className = 'sep'; odo.appendChild(sp); }
      const d = document.createElement('span'); d.className = 'd';
      d.innerHTML = '<span class="s">' + '0123456789'.split('').map(x => `<span>${x}</span>`).join('') + '</span>';
      odo.appendChild(d);
    }
    const sm = document.createElement('small'); sm.textContent = t('km'); odo.appendChild(sm);
  }
  odo.setAttribute('aria-label', fmt(n) + ' ' + t('km'));
  const strips = odo.querySelectorAll('.s');
  for (let i = 0; i < s.length; i++) strips[i].style.transform = `translateY(-${+s[i] * 10}%)`;
}

/* ================= static values ================= */
function yearFrac(d) { return d.getFullYear() + (d - new Date(d.getFullYear(), 0, 1)) / YEAR; }
let curStar = STARS[0];
function renderStatic() {
  const now = new Date();
  const ms = now - birth, days = ms / DAY, years = ms / YEAR;
  const by = yearFrac(birth), ny = yearFrac(now);
  $('spins').textContent = fmt(Math.floor(days * 1.0027379));
  $('spinKm') && ($('spinKm').textContent = big(days * 40075) + ' ' + t('km'));

  const st = nearestStar(years); curStar = st;
  if (st[0] === 'sun') {
    $('starName').textContent = t('sunName'); $('starText').textContent = t('sunText'); $('starMeta').textContent = t('sunMeta');
  } else {
    const diff = st[1] - years;
    $('starName').textContent = cap(starName(st));
    $('starText').textContent = t('starText', { when: diff > .5 ? t('whenBefore') : diff < -.5 ? t('whenAfter') : t('whenSame'), desc: cap(starDesc(st)) });
    $('starMeta').textContent = t('starMeta', { ly: fmt(st[1], 1), km: big(st[1] * 9.4607e12), spec: st[2] });
  }

  $('moons').textContent = fmt(Math.floor(days / 29.530589));
  $('weekday').textContent = cap(birth.toLocaleDateString(D._locale, { weekday: 'long' }));
  $('daysLived').innerHTML = t('daysLived', { n: fmt(Math.floor(days)), days: dys(Math.floor(days)) });
  const ageH = Math.floor((HALLEY_NEXT - birth) / YEAR);
  $('halley').textContent = ageH + ' ' + yrs(ageH);
  $('halleyNote').textContent = birth < HALLEY_PREV ? t('halley1') : t('halley2');

  const list = $('plList'); list.innerHTML = '';
  PLANETS.forEach(([id, period, col, ring]) => {
    const age = days / period; planetAges[id] = age;
    const next = new Date(birth.getTime() + Math.ceil(age + 1e-9) * period * DAY);
    const row = document.createElement('div');
    row.className = 'pl' + (id === 'earth' ? ' home' : '');
    row.tabIndex = 0; row.setAttribute('role', 'button'); row.setAttribute('aria-label', plName(id));
    row.onclick = () => fly('planet', id);
    row.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fly('planet', id); } };
    const c = document.createElement('canvas'); c.width = 72; c.height = 72; drawPlanetIcon(c, col, ring);
    const nextTxt = (next - now) / DAY < 1 ? t('today') : next.toLocaleDateString(D._locale, { day: 'numeric', month: 'short', year: 'numeric' });
    row.innerHTML = `<div></div><div><div class="pn">${plName(id)} <span class="go">${t('go')}</span></div><div class="ps">${yearLenNote(period)}</div></div><div class="pa">${ageFmt(age)}<small>${age >= 1 ? t('nextBd') : t('firstBd')}${nextTxt}</small></div>`;
    row.firstChild.replaceWith(c);
    list.appendChild(row);
  });
  renderChips();

  $('sleep').textContent = fmt(years / 3, 1) + ' ' + yrs(years / 3);
  const hairM = years * 0.15;
  $('hair').textContent = hairM >= 1 ? fmt(hairM, 1) + ' ' + t('m') : fmt(hairM * 100) + ' ' + t('cm');

  const pb = lerpTable(POP, by), pn = lerpTable(POP, ny);
  $('popBirth').textContent = fmt(pb / 1e9, 2) + ' ' + t('bigB');
  $('popNow').textContent = fmt(pn / 1e9, 2) + ' ' + t('bigB');
  let born = 0; for (let y = by; y < ny; y += 0.05) born += lerpTable(BIRTHS, y) * Math.min(0.05, ny - y);
  $('bornAfter').textContent = big(born);
  const younger = lerpTable(YOUNGER, years);
  $('bornShare').textContent = '≈' + fmt(younger) + '%';
  $('olderThan').textContent = '≈' + fmt(younger) + '%';
  updatePlanetLabels();
}
function renderChips() {
  const ny = yearFrac(new Date()), chips = $('starChips'); chips.innerHTML = '';
  STARS.slice(1).forEach(s => {
    const b = document.createElement('button'); b.type = 'button';
    b.className = 'chip' + (s === curStar ? ' mine' : '') + (s === friendStar ? ' friend' : '');
    const c = s[3].join(',');
    b.innerHTML = `<i style="background:rgb(${c});box-shadow:0 0 8px rgb(${c})"></i>${cap(starName(s))} <small>${Math.round(ny - s[1])}</small>`;
    b.onclick = () => fly('star', s[0]);
    chips.appendChild(b);
  });
}
function drawPlanetIcon(c, [r, g, b], ring) {
  const x = c.getContext('2d'), w = c.width, R = w * 0.3;
  const gr = x.createRadialGradient(w * .38, w * .38, R * .1, w / 2, w / 2, R);
  gr.addColorStop(0, `rgb(${Math.min(255, r + 60)},${Math.min(255, g + 60)},${Math.min(255, b + 60)})`);
  gr.addColorStop(1, `rgb(${r * .3 | 0},${g * .3 | 0},${b * .3 | 0})`);
  if (ring === 2) { x.strokeStyle = `rgba(${r},${g},${b},.7)`; x.lineWidth = 3; x.beginPath(); x.ellipse(w / 2, w / 2, R * 1.6, R * .45, -.35, Math.PI, 2 * Math.PI); x.stroke(); }
  x.fillStyle = gr; x.beginPath(); x.arc(w / 2, w / 2, R, 0, 7); x.fill();
  if (ring === 2) { x.beginPath(); x.ellipse(w / 2, w / 2, R * 1.6, R * .45, -.35, 0, Math.PI); x.stroke(); }
}

/* ================= compare ================= */
function renderCompare() {
  const name = fname.value.trim() || t('cmpFriend');
  $('cStarK').textContent = t('kFStar', { name });
  const has = !!friend;
  $('cmpGrid').style.opacity = has ? 1 : .45;
  $('flyFriend').hidden = $('cmpShare').hidden = !has;
  PLANETS.forEach(([id, period]) => { friendAges[id] = has ? (Date.now() - friend) / DAY / period : null; });
  if (!has) {
    ['cDiff', 'cDiffN', 'cPeers', 'cSum', 'cSumN', 'cMid', 'cStar', 'cStarN', 'cTog'].forEach(k => $(k).textContent = '—');
    $('cSumK').textContent = t('kSum', { n: 100 }); friendStar = null; renderChips(); updatePlanetLabels(); return;
  }
  const now = new Date();
  const older = birth < friend ? 1 : birth > friend ? 2 : 0;
  const [e, l] = birth < friend ? [birth, friend] : [friend, birth];
  let y = l.getFullYear() - e.getFullYear(), m = l.getMonth() - e.getMonth(), d = l.getDate() - e.getDate();
  if (d < 0) m--; if (m < 0) { y--; m += 12; }
  const total = Math.round((l - e) / DAY);
  $('cDiff').textContent = older === 0 ? '0' : y > 0 ? `${y} ${yrs(y)}` : `${fmt(total)} ${dys(total)}`;
  $('cDiffN').textContent = older === 0 ? t('sameDay') : `${fmt(total)} ${dys(total)} · ${older === 1 ? t('older1') : t('older2', { name })}`;
  const peers = PLANETS.filter(([id]) => Math.floor(planetAges[id]) === Math.floor(friendAges[id])).map(([id]) => plName(id));
  $('cPeers').textContent = peers.length ? peers.join(', ') : t('peersNone');
  const sum = (now - birth) / YEAR + (now - friend) / YEAR;
  const target = sum < 100 ? 100 : Math.ceil((sum + 1e-3) / 50) * 50;
  const when = new Date(now.getTime() + (target - sum) / 2 * YEAR);
  const left = Math.ceil((when - now) / DAY);
  $('cSumK').textContent = t('kSum', { n: target });
  $('cSum').textContent = when.toLocaleDateString(D._locale, { day: 'numeric', month: 'long', year: 'numeric' });
  $('cSumN').textContent = `${fmt(left)} ${dys(left)}`;
  $('cMid').textContent = new Date((birth.getTime() + friend.getTime()) / 2).toLocaleDateString(D._locale, { day: 'numeric', month: 'long' });
  $('cTog').textContent = big(((now - birth) + (now - friend)) / 1000 * 29.78) + ' ' + t('km');
  friendStar = nearestStar((now - friend) / YEAR);
  $('cStar').textContent = cap(starName(friendStar));
  $('cStarN').textContent = friendStar[0] === 'sun' ? t('sunMeta') : `${fmt(friendStar[1], 1)} ${t('lyShort')}`;
  renderChips(); updatePlanetLabels();
}
$('flyFriend').onclick = () => friendStar && (friendStar[0] === 'sun' ? fly('planet', 'earth') : fly('star', friendStar[0]));

/* ================= live numbers ================= */
let lastBeatPhase = 0;
function tick() {
  const now = Date.now(), s = (now - birth) / 1000, years = s * 1000 / YEAR, orbit = s * 29.78;
  setOdo(orbit);
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set('orbitMoon', fmt(Math.floor(orbit / 384400)));
  set('orbitSun', fmt(Math.floor(orbit / 149.6e6)));
  set('laps', fmt(years, 5));
  set('galKm', big(s * 230) + ' ' + t('km'));
  set('galPct', fmt(years / 230e6 * 100, 7) + '%');
  set('cmbKm', big(s * 370) + ' ' + t('km'));
  set('beats', fmt(Math.floor(s * 75 / 60)));
  set('breaths', fmt(Math.floor(s * 15 / 60)));
  set('blinks', fmt(Math.floor(s * (2 / 3) * 15 / 60)));
  set('rbc', big(s * 2.4e6));
  const b = new Date(birth), n = new Date(now);
  let nb = new Date(n.getFullYear(), b.getMonth(), b.getDate());
  if (nb <= n) nb = new Date(n.getFullYear() + 1, b.getMonth(), b.getDate());
  const left = nb - now, d = Math.floor(left / DAY), h = Math.floor(left % DAY / 36e5), m = Math.floor(left % 36e5 / 6e4), sec = Math.floor(left % 6e4 / 1e3);
  set('nextBd', `${d} ${t('dShort')} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
  const turning = nb.getFullYear() - b.getFullYear();
  set('nextBdNote', t('nextBdNote', { n: turning, years: yrs(turning) }));
  const ps = (now - pageOpen) / 1000;
  set('sessBorn', fmt(Math.floor(ps * 4.2)));
  set('sessDied', fmt(Math.floor(ps * 2.0)));
}

/* ================= reveal + visibility ================= */
const visible = new Set();
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); visible.add(e.target.id || e.target); if (e.target.id === 'weeks' && !reduce && weeksAnim === 1) weeksAnim = 0; }
  else visible.delete(e.target.id || e.target);
}), { threshold: 0.12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));
['lightC', 'ecg', 'births', 'weeks'].forEach(id => io.observe($(id)));

/* ================= 2D: light journey ================= */
const lc = $('lightC'), lx = lc.getContext('2d');
let lightBg = [];
function sizeCanvas(c, h) {
  const dpr = Math.min(2, devicePixelRatio || 1), w = c.clientWidth || 300, hh = h || c.clientHeight || 200;
  c.width = Math.round(w * dpr); c.height = Math.round(hh * dpr);
  c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
  return [w, hh];
}
let LW = 0, LH = 0;
function sizeLight() { [LW, LH] = sizeCanvas(lc); lightBg = Array.from({ length: 140 }, () => [Math.random() * LW, Math.random() * LH, Math.random() * 1.3, Math.random() * 6]); }
const bodyFont = () => lang === 'he' ? '"Rubik",sans-serif' : '"Golos Text",sans-serif';
function drawLight(tm) {
  const x = lx, W = LW, H = LH; if (!W) return;
  x.clearRect(0, 0, W, H);
  for (const [a, b, r, p] of lightBg) { x.globalAlpha = .25 + .25 * Math.sin(tm / 700 + p); x.fillStyle = '#d9d6f2'; x.fillRect(a, b, r, r); }
  x.globalAlpha = 1;
  const [r, g, bb] = curStar[3];
  const sx = W * .14, ex = W * .86, y = H * .48;
  const by = birth.getFullYear(), ny = new Date().getFullYear();
  const isSun = curStar[0] === 'sun';
  for (let k = 0; k < 4; k++) {
    const p = ((tm / 6000) + k / 4) % 1;
    x.strokeStyle = `rgba(${r},${g},${bb},${.22 * (1 - p)})`; x.lineWidth = 1.2;
    x.beginPath(); x.arc(sx, y, p * (ex - sx), -0.55, 0.55); x.stroke();
  }
  x.strokeStyle = 'rgba(154,151,194,.35)'; x.setLineDash([2, 5]); x.beginPath(); x.moveTo(sx, y); x.lineTo(ex, y); x.stroke(); x.setLineDash([]);
  x.direction = 'ltr'; x.font = `500 ${W < 420 ? 9 : 10.5}px "JetBrains Mono",monospace`; x.textAlign = 'center';
  if (!isSun && ny - by > 0) {
    const span = ny - by, step = span > 50 ? 20 : span > 20 ? 10 : span > 8 ? 5 : 1;
    for (let Y = Math.ceil(by / step) * step; Y <= ny; Y += step) {
      const px = sx + (ex - sx) * (Y - by) / span;
      x.fillStyle = 'rgba(154,151,194,.6)'; x.fillRect(px - .5, y + 8, 1, 6);
      if (px - sx > 30 && ex - px > 30) x.fillText(Y, px, y + 28);
    }
  }
  const p = (tm / 4200) % 1, hx = sx + (ex - sx) * p, tail = Math.min(hx - sx, (ex - sx) * .22);
  const gr = x.createLinearGradient(hx - tail, 0, hx, 0);
  gr.addColorStop(0, `rgba(${r},${g},${bb},0)`); gr.addColorStop(1, `rgba(255,255,255,.95)`);
  x.strokeStyle = gr; x.lineWidth = 2.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(hx - tail, y); x.lineTo(hx, y); x.stroke();
  const hg = x.createRadialGradient(hx, y, 0, hx, y, 14); hg.addColorStop(0, 'rgba(255,255,255,.9)'); hg.addColorStop(1, `rgba(${r},${g},${bb},0)`);
  x.fillStyle = hg; x.beginPath(); x.arc(hx, y, 14, 0, 7); x.fill();
  const pulse = 1 + .06 * Math.sin(tm / 400);
  const sg = x.createRadialGradient(sx, y, 0, sx, y, 54 * pulse);
  sg.addColorStop(0, '#fff'); sg.addColorStop(.12, `rgba(${r},${g},${bb},1)`); sg.addColorStop(.4, `rgba(${r},${g},${bb},.25)`); sg.addColorStop(1, `rgba(${r},${g},${bb},0)`);
  x.fillStyle = sg; x.beginPath(); x.arc(sx, y, 54 * pulse, 0, 7); x.fill();
  x.strokeStyle = `rgba(${r},${g},${bb},.5)`; x.lineWidth = 1; x.beginPath(); x.moveTo(sx - 40, y); x.lineTo(sx + 40, y); x.moveTo(sx, y - 40); x.lineTo(sx, y + 40); x.stroke();
  const eg = x.createRadialGradient(ex - 2, y - 2, 0, ex, y, 8); eg.addColorStop(0, '#cfeaff'); eg.addColorStop(1, '#1d5fb8');
  x.fillStyle = eg; x.beginPath(); x.arc(ex, y, 7, 0, 7); x.fill();
  x.strokeStyle = 'rgba(143,208,255,.35)'; x.beginPath(); x.arc(ex, y, 12 + 3 * Math.sin(tm / 300), 0, 7); x.stroke();
  x.direction = D._dir; x.font = `500 ${W < 420 ? 10 : 12}px ${bodyFont()}`;
  x.textAlign = 'left'; x.fillStyle = '#e2dff7'; x.fillText(cap(starName(curStar)), Math.max(6, sx - 40), y - 62);
  x.fillStyle = '#9a97c2'; x.fillText(isSun ? t('sunAgo') : t('lightLeft', { y: by }), Math.max(6, sx - 40), y - 46);
  x.textAlign = 'right'; x.fillStyle = '#e2dff7'; x.fillText(t('earth'), Math.min(W - 6, ex + 28), y - 46);
  x.fillStyle = '#9a97c2'; x.fillText(t('arrives', { y: ny }), Math.min(W - 6, ex + 28), y - 30);
}

/* ================= 2D: ECG ================= */
const ec = $('ecg'), ex2 = ec.getContext('2d'); let EW = 0, EH = 130;
function ecgVal(ph) {
  const gss = (c, a, w) => a * Math.exp(-((ph - c) ** 2) / (2 * w * w));
  return gss(.12, .12, .025) + gss(.26, -.12, .008) + gss(.3, 1, .012) + gss(.335, -.28, .01) + gss(.56, .3, .04);
}
function drawEcg(tm) {
  const x = ex2, W = EW, H = EH; if (!W) return;
  x.clearRect(0, 0, W, H);
  x.strokeStyle = 'rgba(120,126,200,.12)'; x.lineWidth = 1;
  for (let gx = (-(tm / 1000 * 140) % 28 + 28) % 28; gx < W; gx += 28) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, H); x.stroke(); }
  for (let gy = 14; gy < H; gy += 28) { x.beginPath(); x.moveTo(0, gy); x.lineTo(W, gy); x.stroke(); }
  const speed = 140, period = .8, base = H * .66, amp = H * .5;
  x.beginPath();
  for (let px = 0; px <= W; px += 1.5) {
    const tau = tm / 1000 - (W - px) / speed, ph = ((tau % period) + period) % period / period;
    const yy = base - ecgVal(ph) * amp; px ? x.lineTo(px, yy) : x.moveTo(px, yy);
  }
  const grd = x.createLinearGradient(0, 0, W, 0); grd.addColorStop(0, 'rgba(255,180,84,0)'); grd.addColorStop(.7, 'rgba(255,180,84,.8)'); grd.addColorStop(1, '#ffe2a8');
  x.strokeStyle = grd; x.lineWidth = 2; x.shadowColor = 'rgba(255,180,84,.8)'; x.shadowBlur = 10; x.stroke(); x.shadowBlur = 0;
  const ph = ((tm / 1000) % period) / period, hy = base - ecgVal(ph) * amp;
  x.fillStyle = '#fff'; x.beginPath(); x.arc(W - 1, hy, 3, 0, 7); x.fill();
  if (ph < lastBeatPhase) { const c = $('beatCell'); c.classList.remove('beat'); void c.offsetWidth; c.classList.add('beat'); }
  lastBeatPhase = ph;
}

/* ================= 2D: births ================= */
const bc = $('births'), bx = bc.getContext('2d'); let BW = 0, BH = 200;
const dots = [], rings = []; let bAcc = 0, dAcc = 0;
function drawBirths(tm, dt) {
  const x = bx, W = BW, H = BH; if (!W) return;
  bAcc += dt * 4.2; dAcc += dt * 2.0;
  while (bAcc >= 1) { bAcc--; dots.push({ x: 8 + Math.random() * (W - 16), y: 30 + Math.random() * (H - 40), t0: tm }); if (dots.length > 900) dots.shift(); }
  while (dAcc >= 1) { dAcc--; rings.push({ x: 8 + Math.random() * (W - 16), y: 30 + Math.random() * (H - 40), t0: tm }); }
  x.clearRect(0, 0, W, H);
  for (const d of dots) {
    const a = (tm - d.t0) / 1000;
    if (a < 1.2) { const k = a / 1.2, r = 2 + 10 * (1 - k); const g = x.createRadialGradient(d.x, d.y, 0, d.x, d.y, r); g.addColorStop(0, 'rgba(255,240,210,1)'); g.addColorStop(1, 'rgba(255,180,84,0)'); x.fillStyle = g; x.beginPath(); x.arc(d.x, d.y, r, 0, 7); x.fill(); }
    x.fillStyle = `rgba(255,180,84,${Math.max(.18, 1 - a / 8)})`; x.beginPath(); x.arc(d.x, d.y, 1.6, 0, 7); x.fill();
  }
  for (let i = rings.length - 1; i >= 0; i--) {
    const r = rings[i], a = (tm - r.t0) / 1000; if (a > 2.4) { rings.splice(i, 1); continue; }
    x.strokeStyle = `rgba(143,208,255,${.6 * (1 - a / 2.4)})`; x.lineWidth = 1; x.beginPath(); x.arc(r.x, r.y, 2 + a * 9, 0, 7); x.stroke();
  }
}

/* ================= 2D: weeks ================= */
const wc = $('weeks'), wx = wc.getContext('2d');
let weeksAnim = 1, WG = null;
function drawWeeks(prog) {
  const W = wc.clientWidth || 600, cols = 52, rows = 90;
  const gap = W < 500 ? 1 : 2, dg = W < 500 ? 4 : 8, cell = (W - gap * (cols - 1)) / cols;
  const H = rows * cell + (rows - 1) * gap + 8 * dg;
  const dpr = Math.min(2, devicePixelRatio || 1);
  if (wc.width !== Math.round(W * dpr) || wc.height !== Math.round(H * dpr)) { wc.width = Math.round(W * dpr); wc.height = Math.round(H * dpr); wc.style.height = H + 'px'; }
  wx.setTransform(dpr, 0, 0, dpr, 0, 0); wx.clearRect(0, 0, W, H);
  const lived = Math.floor((Date.now() - birth) / (7 * DAY));
  const fl = friend ? Math.floor((Date.now() - friend) / (7 * DAY)) : -1;
  const shown = Math.floor(lived * prog);
  WG = { cols, rows, gap, dg, cell, lived };
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const i = r * cols + k, y = r * (cell + gap) + Math.floor(r / 10) * dg;
    if (i < shown) { const age = (shown - i) / 120; wx.fillStyle = age < 1 && prog < 1 ? '#ffe2a8' : '#ffb454'; }
    else if (i === lived && prog >= 1) wx.fillStyle = '#8fd0ff';
    else wx.fillStyle = '#20244a';
    wx.beginPath(); wx.roundRect ? wx.roundRect(k * (cell + gap), y, cell, cell, Math.min(2, cell / 3)) : wx.rect(k * (cell + gap), y, cell, cell); wx.fill();
  }
  if (prog >= 1) {
    const r = Math.floor(lived / cols), k = lived % cols, y = r * (cell + gap) + Math.floor(r / 10) * dg;
    const pulse = .5 + .5 * Math.sin(performance.now() / 300);
    wx.strokeStyle = `rgba(143,208,255,${pulse})`; wx.lineWidth = 1.5; wx.strokeRect(k * (cell + gap) - 2, y - 2, cell + 4, cell + 4);
    if (fl >= 0 && fl < rows * cols) {
      const fr = Math.floor(fl / cols), fk = fl % cols, fy = fr * (cell + gap) + Math.floor(fr / 10) * dg;
      wx.strokeStyle = `rgba(255,226,168,${1 - pulse * .6})`; wx.strokeRect(fk * (cell + gap) - 2, fy - 2, cell + 4, cell + 4);
    }
  }
  const total = rows * cols;
  $('wLived').textContent = `${fmt(lived)} ${pl(lived, D.wLived)}`;
  $('wLeft').textContent = `${fmt(Math.max(0, total - lived))} ${pl(total - lived, D.weeks)}`;
}
const tip = $('tip');
function weekAt(ev) {
  if (!WG) return null;
  const rc = wc.getBoundingClientRect(), mx = ev.clientX - rc.left, my = ev.clientY - rc.top;
  const k = Math.floor(mx / (WG.cell + WG.gap));
  let r = -1;
  for (let rr = 0; rr < WG.rows; rr++) { const y = rr * (WG.cell + WG.gap) + Math.floor(rr / 10) * WG.dg; if (my >= y && my < y + WG.cell + WG.gap) { r = rr; break; } }
  if (k < 0 || k >= WG.cols || r < 0) return null;
  return { r, k, i: r * WG.cols + k };
}
function showTip(ev) {
  const w = weekAt(ev); if (!w) { tip.hidden = true; return; }
  const d = new Date(birth.getTime() + w.i * 7 * DAY);
  const state = w.i < WG.lived ? t('tipPast') : w.i === WG.lived ? t('tipNow') : t('tipFuture');
  tip.textContent = t('tip', { y: w.r, years: yrs(w.r), w: w.k + 1, date: d.toLocaleDateString(D._locale, { month: 'short', year: 'numeric' }), state });
  tip.hidden = false;
  tip.style.left = clamp(ev.clientX + 14, 8, innerWidth - tip.offsetWidth - 8) + 'px';
  tip.style.top = (ev.clientY + 16) + 'px';
}
wc.addEventListener('pointermove', showTip);
wc.addEventListener('pointerdown', showTip);
wc.addEventListener('pointerleave', () => tip.hidden = true);

/* ================= HUD ================= */
const anchors = [...document.querySelectorAll('[data-scene]')].sort((a, b) => a.dataset.scene - b.dataset.scene);
const hud = $('hud');
let hudIdx = -1;
function buildHud() {
  hud.innerHTML = '';
  D.scenes.forEach(([n], i) => {
    const b = document.createElement('button'); b.type = 'button'; b.innerHTML = `<span>${n}</span><i></i>`;
    b.setAttribute('aria-label', n);
    b.onclick = () => anchors[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    hud.appendChild(b);
  });
  hudIdx = -1;
}
function setHud(u) {
  const i = clamp(Math.round(u) || 0, 0, D.scenes.length - 1); if (i === hudIdx) return; hudIdx = i;
  [...hud.children].forEach((b, k) => b.classList.toggle('on', k === i));
  $('scale').innerHTML = `<b>${D.scenes[i][0]}</b> · ${D.scenes[i][1]}`;
}
function scrollU() {
  const mid = innerHeight * .5;
  const c = anchors.map(a => { const r = a.getBoundingClientRect(); return r.top + Math.min(r.height, innerHeight) * .5; });
  if (mid <= c[0]) return 0;
  for (let i = 0; i < c.length - 1; i++) if (mid < c[i + 1]) { const f = (mid - c[i]) / Math.max(1, c[i + 1] - c[i]); return i + sstep(0, 1, f); }
  return c.length - 1;
}

/* ================= focus card ================= */
let focusScroll = 0, lastFly = null;
function fly(kind, key) {
  if (!G) return;
  lastFly = [kind, key];
  G.fly(kind, key);
  fillFocus(kind, key);
  root.classList.add('focusing'); $('fcard').setAttribute('aria-hidden', 'false');
  focusScroll = scrollY;
  setTimeout(() => $('fBack').focus({ preventScroll: true }), 50);
}
function fillFocus(kind, key) {
  const now = new Date(), days = (now - birth) / DAY, ny = yearFrac(now), age = (now - birth) / YEAR;
  let eye, name, facts, text;
  if (kind === 'planet') {
    const P = PLANETS.find(x => x[0] === key), a = days / P[1];
    const next = new Date(birth.getTime() + Math.ceil(a + 1e-9) * P[1] * DAY);
    eye = t('fPlanet'); name = plName(key);
    facts = [[t('fYouHere'), `${ageFmt(a)} ${yrs(a)}`, 1], [t('fYearLen'), yearLenVal(P[1])], [t('fToSun'), `${fmt(P[9])} ${t('mlnKm')}`], [a >= 1 ? t('fNextBd') : t('fFirstBd'), next.toLocaleDateString(D._locale, { day: 'numeric', month: 'long', year: 'numeric' })]];
    const lm = P[9] * 1e6 / 299792.458 / 60;
    text = t('fSunLight', { t: lm < 60 ? `${fmt(lm, 1)} ${t('min')}` : `${fmt(lm / 60, 1)} ${t('hrs')}` }) + (key === 'earth' ? ' ' + t('youHere') : '');
  } else {
    const S = STARS.find(x => x[0] === key), yr = Math.round(ny - S[1]);
    eye = t('fStar') + ' · ' + starDesc(S); name = cap(starName(S));
    facts = [[t('fLightLeft'), yr + (D.yearAbbr ? ' ' + D.yearAbbr : ''), 1], [t('fDist'), `${fmt(S[1], 1)} ${t('lyShort')}`], [t('fKm'), big(S[1] * 9.4607e12)], [t('fSpec'), S[2]]];
    const d = age - S[1];
    text = Math.abs(d) < 1 ? t('starMine') : d > 0 ? t('starAfter', { n: Math.floor(d), years: yrs(Math.floor(d)) }) : t('starBefore', { n: Math.ceil(-d), years: yrs(Math.ceil(-d)) });
    text += ' ' + t('beamNote');
  }
  $('fEye').textContent = eye; $('fName').textContent = name;
  $('fFacts').innerHTML = facts.map(([k, v, hot]) => `<div>${k}<b class="${hot ? 'hot' : ''}">${v}</b></div>`).join('');
  $('fText').textContent = text;
}
function unfocus() {
  if (!root.classList.contains('focusing')) return;
  root.classList.remove('focusing'); $('fcard').setAttribute('aria-hidden', 'true'); lastFly = null;
  G && G.fly(null);
}
$('fBack').onclick = unfocus;
addEventListener('keydown', e => { if (e.key === 'Escape') { unfocus(); closeCard(); } });
addEventListener('scroll', () => { if (Math.abs(scrollY - focusScroll) > 80) unfocus(); }, { passive: true });
addEventListener('wheel', e => { if (root.classList.contains('focusing') && Math.abs(e.deltaY) > 4) unfocus(); }, { passive: true });
$('flyStar').onclick = () => curStar[0] === 'sun' ? fly('planet', 'earth') : fly('star', curStar[0]);

/* ================= share card ================= */
const dispFont = () => lang === 'he' ? 'Rubik' : 'Unbounded';
const textFont = () => lang === 'he' ? 'Rubik' : 'Golos Text';
function fitFont(x, text, weight, size, family, maxW) { let s = size; do { x.font = `${weight} ${s}px "${family}",sans-serif`; s -= 2; } while (x.measureText(text).width > maxW && s > 12); }
function paintSky(x, W, H, seed) {
  const g = x.createRadialGradient(W * .72, H * .22, 0, W * .72, H * .22, Math.max(W, H));
  g.addColorStop(0, '#221b4d'); g.addColorStop(.45, '#0b0c22'); g.addColorStop(1, '#05060f');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < W * H / 900; i++) { x.globalAlpha = .2 + rnd() * .7; x.fillStyle = rnd() < .2 ? '#ffd9a8' : rnd() < .4 ? '#bcd8ff' : '#fff'; const r = rnd() * 1.6 + .3; x.fillRect(rnd() * W, rnd() * H, r, r); }
  x.globalAlpha = 1;
}
function paintPlanet(x, cx, cy, R, c1, c2, c3) {
  const halo = x.createRadialGradient(cx, cy, R * .9, cx, cy, R * 1.8); halo.addColorStop(0, c3); halo.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = halo; x.beginPath(); x.arc(cx, cy, R * 1.8, 0, 7); x.fill();
  const g = x.createRadialGradient(cx - R * .35, cy - R * .35, R * .1, cx, cy, R);
  g.addColorStop(0, c1); g.addColorStop(.7, c2); g.addColorStop(1, '#120806');
  x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
  x.save(); x.beginPath(); x.arc(cx, cy, R, 0, 7); x.clip();
  let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    const px = cx + (rnd() - .5) * R * 1.7, py = cy + (rnd() - .35) * R * 1.1, pr = R * (.08 + rnd() * .22);
    const dg = x.createRadialGradient(px, py, 0, px, py, pr); dg.addColorStop(0, 'rgba(70,22,10,.32)'); dg.addColorStop(1, 'rgba(70,22,10,0)');
    x.fillStyle = dg; x.beginPath(); x.arc(px, py, pr, 0, 7); x.fill();
  }
  const cap2 = x.createRadialGradient(cx - R * .1, cy - R * .92, 0, cx - R * .1, cy - R * .92, R * .38); cap2.addColorStop(0, 'rgba(255,245,235,.85)'); cap2.addColorStop(1, 'rgba(255,245,235,0)');
  x.fillStyle = cap2; x.beginPath(); x.arc(cx - R * .1, cy - R * .92, R * .38, 0, 7); x.fill();
  const sh = x.createLinearGradient(cx - R, cy - R, cx + R, cy + R); sh.addColorStop(.45, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.75)');
  x.fillStyle = sh; x.fillRect(cx - R, cy - R, R * 2, R * 2); x.restore();
}
async function makeCard(kind) {
  try { await Promise.all([document.fonts.load(`700 60px "${dispFont()}"`), document.fonts.load(`500 30px "${textFont()}"`), document.fonts.load('500 20px "JetBrains Mono"')]); } catch (e) {}
  const og = kind === 'og', W = og ? 1200 : 1080, H = og ? 630 : 1350;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  paintSky(x, W, H, og ? 11 : 7);
  const rtl = D._dir === 'rtl'; x.direction = rtl ? 'rtl' : 'ltr';
  const pad = og ? 72 : 80, X = rtl ? W - pad : pad, AL = rtl ? 'right' : 'left', maxW = W - pad * 2;
  x.textAlign = AL; x.textBaseline = 'alphabetic';
  const host = 'cosmos.tomerisr.org.il';
  if (og) {
    paintPlanet(x, rtl ? 250 : W - 250, 300, 175, '#ffb07a', '#c4532e', 'rgba(255,140,80,.25)');
    x.strokeStyle = 'rgba(143,208,255,.35)'; x.lineWidth = 2; x.setLineDash([4, 10]); x.beginPath(); x.ellipse(rtl ? 250 : W - 250, 300, 300, 90, -.2, 0, 7); x.stroke(); x.setLineDash([]);
    x.fillStyle = '#9a97c2'; x.font = '500 22px "JetBrains Mono",monospace'; x.fillText(t('cardHead').toUpperCase(), X, 120);
    x.fillStyle = '#e2dff7'; fitFont(x, t('ogTitle'), 700, 62, dispFont(), W * .6); x.fillText(t('ogTitle'), X, 250);
    x.fillStyle = '#ffb454'; fitFont(x, t('ogSub'), 400, 30, textFont(), W * .55); wrapText(x, t('ogSub'), X, 320, W * .55, 42);
    x.fillStyle = '#ffb454'; x.font = '500 26px "JetBrains Mono",monospace'; x.fillText(host, X, H - 70);
    return c;
  }
  const now = Date.now(), days = (now - birth) / DAY;
  const mars = days / 686.98, merc = days / 87.969, jup = days / 4332.59, km = (now - birth) / 1000 * 29.78;
  const st = nearestStar((now - birth) / YEAR);
  paintPlanet(x, rtl ? 270 : W - 270, 330, 190, '#ffb07a', '#c4532e', 'rgba(255,140,80,.28)');
  x.fillStyle = '#9a97c2'; x.font = '500 24px "JetBrains Mono",monospace'; x.fillText(t('cardHead').toUpperCase(), X, 120);
  x.fillStyle = '#e2dff7'; const l1 = t('cardMars', { n: fmt(mars, 1), years: yrs(mars) }); fitFont(x, l1, 700, 92, dispFont(), maxW); x.fillText(l1, X, 680);
  x.fillStyle = '#ffb454'; fitFont(x, t('cardOn'), 700, 104, dispFont(), maxW); x.fillText(t('cardOn'), X, 800);
  x.fillStyle = 'rgba(120,126,200,.35)'; x.fillRect(pad, 860, W - pad * 2, 2);
  const rows = [[fmt(Math.floor(km)), t('cardKm')], [cap(starName(st)), t('cardStar')], [`${fmt(merc, 1)} · ${fmt(jup, 2)}`, `${t('cardMerc')} · ${t('cardJup')}`]];
  rows.forEach(([v, k], i) => {
    const y = 935 + i * 104;
    x.fillStyle = '#e2dff7'; x.direction = 'ltr'; const vAl = x.textAlign; if (rtl) { x.direction = 'rtl'; }
    fitFont(x, v, 500, 50, dispFont(), maxW); x.fillText(v, X, y);
    x.fillStyle = '#9a97c2'; fitFont(x, k, 400, 26, textFont(), maxW); x.fillText(k, X, y + 38);
    x.textAlign = vAl;
  });
  x.fillStyle = 'rgba(120,126,200,.35)'; x.fillRect(pad, H - 140, W - pad * 2, 2);
  x.fillStyle = '#e2dff7'; fitFont(x, t('cardCta'), 500, 34, textFont(), maxW * .5); x.fillText(t('cardCta'), X, H - 70);
  x.textAlign = rtl ? 'left' : 'right'; x.direction = 'ltr'; x.fillStyle = '#ffb454'; x.font = '500 26px "JetBrains Mono",monospace'; x.fillText(host, rtl ? pad : W - pad, H - 72);
  return c;
}
function wrapText(x, text, X, y, maxW, lh) {
  const words = text.split(' '); let line = '';
  for (const w of words) { const test = line ? line + ' ' + w : w; if (x.measureText(test).width > maxW && line) { x.fillText(line, X, y); line = w; y += lh; } else line = test; }
  if (line) x.fillText(line, X, y);
}
let cardUrl = null, cardFile = null;
async function openCard() {
  const c = await makeCard('me');
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  if (cardUrl) URL.revokeObjectURL(cardUrl);
  cardUrl = URL.createObjectURL(blob);
  cardFile = new File([blob], `cosmos-${input.value}.png`, { type: 'image/png' });
  $('cardImg').src = cardUrl; $('cardImg').alt = t('cardMars', { n: '', years: '' });
  $('cardSave').href = cardUrl; $('cardSave').download = cardFile.name;
  let canShare = false; try { canShare = !!(navigator.canShare && navigator.canShare({ files: [cardFile] })); } catch (e) {}
  $('cardShare').hidden = !canShare;
  $('cardModal').hidden = false;
}
function closeCard() { $('cardModal').hidden = true; }
$('cardBtn').onclick = openCard;
$('cardClose').onclick = closeCard;
$('cardModal').addEventListener('click', e => { if (e.target.id === 'cardModal') closeCard(); });
$('cardShare').onclick = async () => { try { await navigator.share({ files: [cardFile], text: t('cardShareText') + ' ' + shareUrl(false) }); } catch (e) {} };

/* ================= THREE scene ================= */
let G = null;
const labelsEl = $('labels');
function mkLabel(html, cls) { const d = document.createElement('div'); d.className = 'lbl' + (cls ? ' ' + cls : ''); d.innerHTML = html; labelsEl.appendChild(d); return d; }
const planetLabels = {};
function updatePlanetLabels() {
  PLANETS.forEach(([id]) => {
    const el = planetLabels[id]; if (!el || planetAges[id] == null) return;
    el.innerHTML = `${plName(id)} · <b>${ageFmt(planetAges[id])}</b>` + (friendAges[id] != null ? ` / <b style="color:var(--ice)">${ageFmt(friendAges[id])}</b>` : '');
  });
}

const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
float fbm(vec3 p){float f=0.,a=.5;for(int i=0;i<5;i++){f+=a*snoise(p);p*=2.03;a*=.5;}return f;}`;

function texLoad(src) { const tx = new THREE.TextureLoader().load(src); tx.anisotropy = 4; return tx; }
function glowTex(stops) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); stops.forEach(([o, col]) => g.addColorStop(o, col));
  x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c);
}
function bandTex(cols) {
  const c = document.createElement('canvas'); c.width = 8; c.height = 256; const x = c.getContext('2d');
  for (let y = 0; y < 256; y++) { const tt = y / 256, k = Math.floor((Math.sin(tt * 38) * .5 + .5 + Math.sin(tt * 91) * .15) * (cols.length - .01)); x.fillStyle = cols[clamp(k, 0, cols.length - 1)]; x.fillRect(0, y, 8, 1); }
  return new THREE.CanvasTexture(c);
}

function initScene() {
  if (!window.THREE) throw new Error('no three');
  const canvas = $('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mob, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  const PR = Math.min(devicePixelRatio || 1, mob ? 1.5 : 2);
  renderer.setPixelRatio(PR);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x05060f, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.03, 90000);
  const V = (x, y, z) => new THREE.Vector3(x, y, z), ORIGIN = V(0, 0, 0), UP = V(0, 1, 0);
  const comb = (...ps) => ps.reduce((acc, [v, k]) => acc.add(v.clone().multiplyScalar(k)), V(0, 0, 0));

  const pointMat = (atten, scale, maxPx, alpha) => new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: 1 }, uTime: { value: 0 }, uPx: { value: PR }, uScale: { value: scale }, uMax: { value: maxPx }, uAlpha: { value: alpha } },
    vertexShader: `attribute float size;attribute float phase;varying vec3 vColor;varying float vTw;uniform float uPx,uScale,uMax,uTime;
      void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
      float s=${atten ? 'size*uScale/-mv.z' : 'size'};vTw=.75+.25*sin(uTime*(1.+phase*2.)+phase*30.);gl_PointSize=clamp(s,0.,uMax)*uPx;}`,
    fragmentShader: `varying vec3 vColor;varying float vTw;uniform float uOpacity,uAlpha;
      void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,d);a=a*a;gl_FragColor=vec4(vColor,a*uOpacity*uAlpha*vTw);}`,
    vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  function randn() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function cloud(n, fill, mat) {
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n), ph = new Float32Array(n);
    for (let i = 0; i < n; i++) { const [p, c, s] = fill(i); pos.set(p, i * 3); col.set(c, i * 3); sz[i] = s; ph[i] = Math.random(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sz, 1)); g.setAttribute('phase', new THREE.BufferAttribute(ph, 1));
    const pts = new THREE.Points(g, mat); scene.add(pts); return pts;
  }
  const localStars = cloud(mob ? 3000 : 6000, () => {
    const r = 700 + Math.random() * 2200, th = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1, s = Math.sqrt(1 - u * u);
    const tint = Math.random(); return [[r * s * Math.cos(th), r * u, r * s * Math.sin(th)], tint < .15 ? [1, .8, .6] : tint < .35 ? [.7, .8, 1] : [1, 1, 1], .6 + Math.pow(Math.random(), 3) * 2.6];
  }, pointMat(false, 1, 4, .95));

  const GR = 4000, Gc = V(-GR * .52, -30, 400);
  const warm = [1, .8, .55], cool = [.6, .74, 1];
  const galaxy = cloud(mob ? 26000 : 70000, i => {
    let x, y, z, c, s = .8 + Math.random() * 1.6;
    if (Math.random() < .2) {
      const r = Math.abs(randn()) * GR * .12, th = Math.random() * 6.283, u = randn() * .5;
      x = r * Math.cos(th); z = r * Math.sin(th); y = u * GR * .05 * Math.exp(-r / (GR * .2));
      c = [1, .78 + Math.random() * .1, .5 + Math.random() * .15]; s *= 1.2;
    } else {
      const arm = i % 4, rr = GR * (.07 + .93 * Math.pow(Math.random(), .8));
      const th = arm * Math.PI / 2 + 2.3 * Math.log(rr / (GR * .07)) + randn() * .1;
      const sp = Math.random() < .3 ? .045 : .012; x = rr * Math.cos(th) + randn() * GR * sp; z = rr * Math.sin(th) + randn() * GR * sp; y = randn() * GR * .012;
      const tt = sstep(.08, .7, rr / GR); c = warm.map((w, k) => w + (cool[k] - w) * tt);
      if (Math.random() < .035) { c = [1, .42, .62]; s = 2.6 + Math.random() * 2; }
      else if (Math.random() < .05) { c = [.75, .88, 1]; s = 2.4; }
    }
    return [[x + Gc.x, y + Gc.y, z + Gc.z], c, s];
  }, pointMat(true, 6500, 6, mob ? 1 : .8));
  const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex([[0, 'rgba(255,220,170,.9)'], [.25, 'rgba(255,170,90,.35)'], [1, 'rgba(255,140,60,0)']]), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  coreGlow.position.copy(Gc); coreGlow.scale.set(GR * 1.1, GR * 1.1, 1); scene.add(coreGlow);

  const sun = new THREE.Mesh(new THREE.SphereGeometry(2.1, 64, 64), new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){vP=position;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader: NOISE + `uniform float uTime;varying vec3 vP;varying vec3 vN;varying vec3 vV;
      void main(){vec3 p=normalize(vP);float n=fbm(p*2.2+vec3(0.,uTime*.04,uTime*.02));float g=snoise(p*14.+uTime*.15);
      float v=n*.8+g*.2;vec3 col=mix(vec3(1.,.38,.05),vec3(1.,.82,.42),smoothstep(-.35,.45,v));col+=vec3(1.,.95,.8)*pow(max(v,0.),2.)*.9;
      float mu=max(dot(vN,vV),0.);col*=.55+.45*pow(mu,.45);col+=vec3(1.,.6,.2)*pow(1.-mu,3.)*.6;gl_FragColor=vec4(col*1.25,1.);}`,
  }));
  scene.add(sun);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex([[0, 'rgba(255,230,180,1)'], [.18, 'rgba(255,170,80,.55)'], [.45, 'rgba(255,120,40,.12)'], [1, 'rgba(255,100,30,0)']]), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  sunGlow.scale.set(16, 16, 1); scene.add(sunGlow);
  const sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex([[0, 'rgba(255,200,140,.35)'], [1, 'rgba(255,160,80,0)']]), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  sunHalo.scale.set(70, 70, 1); scene.add(sunHalo);
  scene.add(new THREE.PointLight(0xfff2dd, 2.1, 0, 0));
  scene.add(new THREE.AmbientLight(0x30365a, .35));

  function kep(M, e) { let E = M; for (let k = 0; k < 7; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return E; }
  function orbitPt(E, e, a, w) { const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2)), r = a * (1 - e * Math.cos(E)), lon = nu + w; return [Math.cos(lon) * r, -Math.sin(lon) * r, lon]; }
  const planets = PLANETS.map(([id, period, col, ring, orbitR, size, L0, ecc, varpi]) => {
    const grp = new THREE.Group(); scene.add(grp);
    let mesh;
    if (id === 'earth') {
      const tilt = new THREE.Group(); tilt.rotation.z = .41; grp.add(tilt);
      mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 96, 96), new THREE.ShaderMaterial({
        uniforms: { uSun: { value: V(0, 0, 0) }, uTime: { value: 0 }, uDay: { value: texLoad('/tex/day.jpg') }, uNight: { value: texLoad('/tex/night.jpg') } },
        vertexShader: `varying vec3 vO;varying vec3 vWN;varying vec3 vWP;varying vec2 vUv;void main(){vUv=uv;vO=normalize(position);vWN=normalize(mat3(modelMatrix)*normal);vec4 wp=modelMatrix*vec4(position,1.);vWP=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`,
        fragmentShader: NOISE + `uniform vec3 uSun;uniform float uTime;uniform sampler2D uDay,uNight;varying vec3 vO;varying vec3 vWN;varying vec3 vWP;varying vec2 vUv;
          void main(){vec3 p=vO;vec3 base=pow(texture2D(uDay,vUv).rgb,vec3(1.15))*1.1;
          float ocean=smoothstep(.02,.12,base.b-base.r);float city=texture2D(uNight,vUv).r;
          float cl=smoothstep(.2,.75,fbm(p*2.6+vec3(uTime*.012,0.,uTime*.006)))*.7;
          vec3 L=normalize(uSun-vWP);vec3 Vd=normalize(cameraPosition-vWP);float d=dot(vWN,L);float day=smoothstep(-.1,.3,d);
          vec3 H=normalize(L+Vd);float sp=pow(max(dot(vWN,H),0.),50.)*ocean*day;
          float night=1.-smoothstep(-.3,.05,d);
          vec3 col=base*(.025+day*1.15)+sp*vec3(1.,.9,.7)*.7;
          col=mix(col,vec3(1.)*(.02+day*1.05),cl);
          col+=vec3(1.,.66,.32)*pow(city,1.4)*night*(1.-cl*.8)*1.8;
          float f=pow(1.-max(dot(vWN,Vd),0.),2.5);col+=vec3(.3,.6,1.)*f*(.06+day*.8);
          gl_FragColor=vec4(col,1.);}`,
      }));
      tilt.add(mesh);
      const atm = new THREE.Mesh(new THREE.SphereGeometry(size * 1.13, 64, 64), new THREE.ShaderMaterial({
        uniforms: { uSun: { value: V(0, 0, 0) } }, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        vertexShader: `varying vec3 vWN;varying vec3 vWP;void main(){vWN=normalize(mat3(modelMatrix)*normal);vec4 wp=modelMatrix*vec4(position,1.);vWP=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`,
        fragmentShader: `uniform vec3 uSun;varying vec3 vWN;varying vec3 vWP;void main(){vec3 Vd=normalize(cameraPosition-vWP);float i=pow(clamp(.72+dot(vWN,Vd),0.,1.),4.);
          float day=clamp(dot(-vWN,normalize(uSun-vWP))*.8+.45,0.,1.);gl_FragColor=vec4(vec3(.32,.62,1.)*i*day*1.6,i*day);}`,
      }));
      grp.add(atm); mesh.userData.atm = atm;
      const moon = new THREE.Mesh(new THREE.SphereGeometry(.09, 32, 32), new THREE.MeshStandardMaterial({ color: 0xbdbab4, roughness: 1 }));
      grp.add(moon); mesh.userData.moon = moon;
    } else {
      let mat;
      if (id === 'jupiter') mat = new THREE.MeshStandardMaterial({ map: bandTex(['#c9a27c', '#e6d2b5', '#a8754f', '#efe2cc', '#b98b63']), roughness: 1 });
      else if (id === 'saturn') mat = new THREE.MeshStandardMaterial({ map: bandTex(['#d8c193', '#efe0b8', '#c4a676', '#e6d3a5']), roughness: 1 });
      else mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(col[0] / 255, col[1] / 255, col[2] / 255), roughness: .95 });
      mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 48, 48), mat);
      grp.add(mesh);
      if (ring === 2) {
        const rm = new THREE.ShaderMaterial({ side: THREE.DoubleSide, transparent: true, depthWrite: false,
          vertexShader: `varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
          fragmentShader: `uniform float uIn,uOut;varying vec3 vP;void main(){float r=(length(vP.xy)-uIn)/(uOut-uIn);float b=.55+.45*sin(r*60.)*sin(r*17.+1.);float gap=smoothstep(.55,.57,r)*(1.-smoothstep(.6,.62,r));
            gl_FragColor=vec4(vec3(.9,.82,.64)*b,(.75*b)*(1.-gap)*smoothstep(0.,.05,r)*(1.-smoothstep(.95,1.,r)));}`,
          uniforms: { uIn: { value: size * 1.3 }, uOut: { value: size * 2.3 } } });
        const rmesh = new THREE.Mesh(new THREE.RingGeometry(size * 1.3, size * 2.3, 128), rm); rmesh.rotation.x = -Math.PI / 2 + .47; grp.add(rmesh);
      }
    }
    const pts = []; for (let i = 0; i <= 256; i++) { const [ox, oz] = orbitPt(i / 256 * Math.PI * 2, ecc, orbitR, varpi * Math.PI / 180); pts.push(V(ox, 0, oz)); }
    const ol = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: id === 'earth' ? 0x8fd0ff : 0x5a60a8, transparent: true, opacity: .4, depthWrite: false }));
    scene.add(ol);
    planetLabels[id] = mkLabel(plName(id), 'click');
    planetLabels[id].onclick = () => fly('planet', id);
    return { id, period, orbitR, L0, ecc, varpi, grp, mesh, ol, size };
  });
  updatePlanetLabels();
  const earth = planets[2];

  const TN = 260, trailPos = new Float32Array(TN * 3), trailCol = new Float32Array(TN * 3);
  const trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3)); trailGeo.setAttribute('color', new THREE.BufferAttribute(trailCol, 3));
  scene.add(new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));

  // named stars in their real sky directions (ecliptic frame; distances compressed)
  const EPS = 23.44 * Math.PI / 180;
  const starPos = s => { const ra = s[4] * 15 * Math.PI / 180, de = s[5] * Math.PI / 180, X = Math.cos(de) * Math.cos(ra), Y = Math.cos(de) * Math.sin(ra), Z = Math.sin(de);
    const Ye = Y * Math.cos(EPS) + Z * Math.sin(EPS), Ze = -Y * Math.sin(EPS) + Z * Math.cos(EPS); return V(X, Ze, -Ye).multiplyScalar(70 + s[1] * 11); };
  const starTex = glowTex([[0, 'rgba(255,255,255,1)'], [.08, 'rgba(255,255,255,.9)'], [.25, 'rgba(255,255,255,.25)'], [1, 'rgba(255,255,255,0)']]);
  const namedStars = STARS.slice(1).map(s => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color: new THREE.Color(s[3][0] / 255, s[3][1] / 255, s[3][2] / 255), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    sp.position.copy(starPos(s)); sp.scale.setScalar(7); scene.add(sp);
    const lb = mkLabel(cap(starName(s)), 'click'); lb.onclick = () => fly('star', s[0]);
    return { s, sp, lb };
  });
  const BN = 200, beamGeo = new THREE.BufferGeometry();
  beamGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(BN * 3), 3));
  beamGeo.setAttribute('t', new THREE.BufferAttribute(new Float32Array(BN).map((_, i) => i / (BN - 1)), 1));
  const beamMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uOp: { value: 0 }, uCol: { value: new THREE.Color(1, 1, 1) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float t;varying float vT;void main(){vT=t;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uTime,uOp;uniform vec3 uCol;varying float vT;void main(){float p=fract(vT*5.-uTime*.35);float pulse=pow(p,14.);gl_FragColor=vec4(mix(uCol,vec3(.56,.82,1.),vT)*(.25+pulse*2.5),uOp*(.35+pulse));}` });
  const beam = new THREE.Line(beamGeo, beamMat); beam.frustumCulled = false; scene.add(beam);

  let focus = null, fw = 0;
  function flyTo(kind, key) {
    if (!kind) { focus = null; return; }
    if (kind === 'planet') focus = { kind, p: planets.find(x => x.id === key) };
    else { const ns = namedStars.find(x => x.s[0] === key); focus = { kind, ns }; beamMat.uniforms.uCol.value.copy(ns.sp.material.color); }
  }
  function focusFrame() {
    const fy = mob ? -.26 : -.2;
    if (focus.kind === 'planet') {
      const pos = focus.p.grp.position.clone(), r = pos.clone().normalize(), tg = V(r.z, 0, -r.x), k = focus.p.size * (focus.p.id === 'saturn' ? 9 : 7) * (mob ? 1.5 : 1);
      return { T: pos, O: comb([r, -1 * k], [tg, .8 * k], [UP, .45 * k]), sx: 0, sy: fy, dim: 0, orb: .5 };
    }
    const sp = focus.ns.sp.position.clone(), len = sp.length(), dir = sp.clone().normalize();
    let perp = dir.clone().cross(UP); if (perp.lengthSq() < 1e-4) perp.set(1, 0, 0); perp.normalize();
    return { T: sp.clone().lerp(ORIGIN, .3), O: comb([perp, len * (mob ? .9 : .62)], [UP, len * .18], [dir, len * .05]), sx: 0, sy: fy, dim: 0, orb: .2 };
  }
  function mixFrames(a, b, f) {
    const T = a.T.clone().lerp(b.T, f), la = a.O.length(), lb = b.O.length();
    const dir = a.O.clone().normalize().lerp(b.O.clone().normalize(), f); if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0); dir.normalize();
    const len = Math.exp(Math.log(la) + (Math.log(lb) - Math.log(la)) * f), L = k => a[k] + (b[k] - a[k]) * f;
    return { T, O: dir.multiplyScalar(len), sx: L('sx'), sy: L('sy'), dim: L('dim'), orb: L('orb') };
  }

  const earthLabel = mkLabel('', 'big'), sunLabel = mkLabel('', 'big left'), coreLabel = mkLabel('');
  function relabel() {
    earthLabel.innerHTML = t('lblEarth'); sunLabel.innerHTML = t('lblSun'); coreLabel.innerHTML = t('lblCore');
    namedStars.forEach(n => n.lb.textContent = cap(starName(n.s)));
    updatePlanetLabels();
  }
  relabel();

  const J2000 = Date.UTC(2000, 0, 1, 12);
  let simDays = (Date.now() - J2000) / DAY;
  function place() {
    for (const p of planets) {
      const M = ((p.L0 - p.varpi) + 360 / p.period * simDays) * Math.PI / 180;
      const [x, z, lon] = orbitPt(kep(M, p.ecc), p.ecc, p.orbitR, p.varpi * Math.PI / 180);
      p.grp.position.set(x, 0, z); p.ang = lon;
    }
  }
  place();
  for (let i = 0; i < TN; i++) { const a = earth.ang - (i / TN) * .9; trailPos.set([Math.cos(a) * earth.orbitR, 0, -Math.sin(a) * earth.orbitR], (TN - 1 - i) * 3); }

  function frames() {
    const e = earth.grp.position.clone(), r = e.clone().normalize(), tg = V(r.z, 0, -r.x);
    return [
      { T: e.clone().lerp(ORIGIN, .2), O: comb([r, .9], [tg, 2.6], [UP, .75]).multiplyScalar(mob ? 1.35 : 1), sx: mob ? 0 : .27, sy: mob ? -.22 : 0, dim: mob ? .32 : 0, orb: .35 },
      { T: ORIGIN, O: comb([V(.25, 0, 1), mob ? 95 : 46], [UP, mob ? 60 : 27]), sx: mob ? 0 : .18, sy: 0, dim: .1, orb: 1 },
      { T: Gc.clone().lerp(ORIGIN, .4), O: V(600, 5600, 5200), sx: mob ? 0 : .2, sy: mob ? -.1 : 0, dim: .15, orb: 0 },
      { T: ORIGIN, O: V(950, 120, 330), sx: 0, sy: 0, dim: .35, orb: 0 },
      { T: ORIGIN, O: comb([UP, mob ? 150 : 72], [V(0, 0, 1), mob ? 20 : 14]), sx: mob ? 0 : .22, sy: mob ? -.06 : 0, dim: mob ? .45 : .12, orb: 1 },
      { T: e, O: comb([r, -1.0], [tg, .55], [UP, .32]), sx: mob ? 0 : .24, sy: mob ? -.2 : 0, dim: mob ? .4 : .08, orb: .15 },
      { T: e, O: comb([r, .95], [tg, .45], [UP, .4]), sx: mob ? 0 : .24, sy: mob ? -.2 : 0, dim: mob ? .4 : .05, orb: .1 },
      { T: ORIGIN, O: V(40, 380, 900), sx: 0, sy: 0, dim: .55, orb: .6 },
      { T: ORIGIN, O: comb([V(-.7, 0, .7), mob ? 120 : 52], [UP, mob ? 70 : 30]), sx: mob ? 0 : .22, sy: mob ? -.06 : 0, dim: mob ? .45 : .12, orb: 1 },
    ];
  }
  function blend(u) {
    const F = frames(), i = clamp(Math.floor(u), 0, F.length - 1), j = Math.min(i + 1, F.length - 1), f = u - i;
    let m = mixFrames(F[i], F[j], f);
    if (fw > .001 && focus) m = mixFrames(m, focusFrame(), fw);
    m.P = m.T.clone().add(m.O);
    m.w = k => (k === i ? 1 - f : k === j ? f : 0) * (1 - fw);
    return m;
  }

  const proj = new THREE.Vector3();
  function putLabel(el, pos, op, dx = 16, dy = -6, left = false) {
    proj.copy(pos).project(camera);
    el.style.pointerEvents = op > .4 && proj.z <= 1 ? 'auto' : 'none';
    if (proj.z > 1 || op < .02) { el.style.opacity = 0; return; }
    const x = (proj.x * .5 + .5) * innerWidth + dx, y = (-proj.y * .5 + .5) * innerHeight + dy;
    el.style.opacity = op; el.style.transform = `translate(${x}px,${y}px)` + (left ? ' translateX(-100%)' : '');
  }
  function resize() {
    mob = innerWidth < 760;
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  }

  let us = reduce ? scrollU() : 2.2; const t0 = performance.now();
  function frame(dt, tm) {
    if (!reduce) simDays += dt * 12.2;
    place();
    const target = scrollU(), it = (performance.now() - t0) / 3800;
    if (!reduce && it < 1) { const e = it < .5 ? 4 * it * it * it : 1 - Math.pow(-2 * it + 2, 3) / 2; us = 2.2 + (target - 2.2) * e; }
    else us = reduce ? target : us + (target - us) * (1 - Math.exp(-dt * 3.2));
    if (!isFinite(us)) us = isFinite(target) ? target : 0;
    setHud(us);
    const fT = focus ? 1 : 0; fw += (fT - fw) * (1 - Math.exp(-dt * (reduce ? 60 : 1.6))); if (Math.abs(fT - fw) < .002) fw = fT;
    const st = blend(us);
    camera.position.copy(st.P); camera.lookAt(st.T);
    camera.setViewOffset(innerWidth, innerHeight, -st.sx * innerWidth, -st.sy * innerHeight, innerWidth, innerHeight);
    camera.updateProjectionMatrix();
    $('dim').style.opacity = st.dim;

    const cd = camera.position.length();
    galaxy.material.uniforms.uOpacity.value = sstep(140, 900, cd);
    coreGlow.material.opacity = sstep(400, 2500, cd) * .55;
    localStars.material.uniforms.uOpacity.value = 1 - sstep(1500, 4200, cd);
    galaxy.material.uniforms.uTime.value = localStars.material.uniforms.uTime.value = tm;
    sun.material.uniforms.uTime.value = tm;
    sunHalo.material.opacity = .9 * (1 - sstep(400, 1600, cd)) + .1;

    for (const p of planets) {
      p.ol.material.opacity = (p.id === 'earth' ? .6 : .32) * st.orb;
      p.mesh.rotation.y += dt * (p.id === 'earth' ? .25 : .4);
    }
    const em = earth.mesh;
    em.material.uniforms.uTime.value = tm;
    const ma = simDays / 27.32 * Math.PI * 2;
    em.userData.moon.position.set(Math.cos(ma) * .95, Math.sin(ma) * .08, -Math.sin(ma) * .95);

    trailPos.copyWithin(0, 3); const ep = earth.grp.position; trailPos[(TN - 1) * 3] = ep.x; trailPos[(TN - 1) * 3 + 1] = ep.y; trailPos[(TN - 1) * 3 + 2] = ep.z;
    for (let i = 0; i < TN; i++) { const q = Math.pow(i / TN, 2.2); trailCol[i * 3] = .56 * q; trailCol[i * 3 + 1] = .82 * q; trailCol[i * 3 + 2] = q; }
    trailGeo.attributes.position.needsUpdate = trailGeo.attributes.color.needsUpdate = true;
    trailGeo.computeBoundingSphere();

    putLabel(earthLabel, ep, st.w(0) * (mob ? 0 : 1), 18, -18);
    putLabel(sunLabel, ORIGIN, Math.max(st.w(2), st.w(3)), -16, -8, true);
    putLabel(coreLabel, Gc, st.w(2) * .85, 18, 0);
    const focP = focus && focus.kind === 'planet' ? focus.p : null, focS = focus && focus.kind === 'star' ? focus.ns : null;
    for (const p of planets) putLabel(planetLabels[p.id], p.grp.position, Math.max(st.w(4) + st.w(8) + st.w(1) * .55, p === focP ? fw : 0), 14 + p.size * 10, -4);
    for (const n of namedStars) {
      n.sp.scale.setScalar(n === focS ? 7 + n.sp.position.length() * .03 * fw : 7);
      putLabel(n.lb, n.sp.position, Math.max(n === focS ? fw : 0, n.s === curStar ? st.w(3) : st.w(3) * .45), 12, -4);
    }
    if (focS) {
      const a = focS.sp.position, b = earth.grp.position, arr = beamGeo.attributes.position.array;
      for (let i = 0; i < BN; i++) { const q = i / (BN - 1); arr[i * 3] = a.x + (b.x - a.x) * q; arr[i * 3 + 1] = a.y + (b.y - a.y) * q; arr[i * 3 + 2] = a.z + (b.z - a.z) * q; }
      beamGeo.attributes.position.needsUpdate = true;
    }
    beamMat.uniforms.uOp.value = focS ? fw : beamMat.uniforms.uOp.value * .9; beamMat.uniforms.uTime.value = tm;
    renderer.render(scene, camera);
  }
  return { frame, resize, fly: flyTo, relabel };
}

/* ================= language switch ================= */
const h1 = $('h1');
function applyLang(l, user) {
  lang = l; D = I18N[l];
  root.lang = l; root.dir = D._dir;
  document.title = t('title');
  const md = document.querySelector('meta[name=description]'); if (md) md.content = t('metaDesc');
  document.querySelectorAll('[data-i18n]').forEach(el => el.innerHTML = t(el.dataset.i18n));
  const words = t('h1a').split(' ');
  h1.innerHTML = words.map((w, i) => `<span class="w" style="animation-delay:${(i * .08).toFixed(2)}s">${w}</span>`).join(' ') + ` <b class="w" style="animation-delay:${(words.length * .08 + .02).toFixed(2)}s">${t('h1b').replace(/ /g, '&nbsp;')}</b>`;
  fname.placeholder = t('cmpNamePh');
  [...$('langs').children].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === l)));
  buildHud();
  odo.dataset.len = '';
  if (user) {
    ls.set('cosmos-lang', l);
    try { if (location.protocol.startsWith('http')) history.replaceState(null, '', pathFor(l) + location.search); } catch (e) {}
  }
  renderStatic(); renderCompare(); tick();
  G && G.relabel();
  if (lastFly) fillFocus(...lastFly);
  sizeAll();
}
LANGS.forEach(l => {
  const b = document.createElement('button'); b.type = 'button'; b.dataset.l = l; b.textContent = I18N[l]._name;
  b.setAttribute('lang', l); b.onclick = () => applyLang(l, true);
  $('langs').appendChild(b);
});

/* ================= loop ================= */
function sizeAll() { sizeLight(); [EW, EH] = sizeCanvas(ec, 130); [BW, BH] = sizeCanvas(bc, 200); drawWeeks(1); }
try { G = initScene(); } catch (e) { console.warn(e); root.classList.add('no-gl'); $('gl').hidden = true; }
applyLang(lang, false);
let last = performance.now(), lastTick = 0, lastWeeks = 0;
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (now - lastTick > 90) { tick(); lastTick = now; }
  if (G) G.frame(dt, now / 1000);
  if (visible.has('lightC')) drawLight(now);
  if (visible.has('ecg')) drawEcg(now);
  if (visible.has('births')) drawBirths(now, dt);
  if (visible.has('weeks')) {
    if (weeksAnim < 1) { weeksAnim = Math.min(1, weeksAnim + dt / 1.8); drawWeeks(1 - Math.pow(1 - weeksAnim, 3)); }
    else if (now - lastWeeks > 60) { drawWeeks(1); lastWeeks = now; }
  }
  requestAnimationFrame(loop);
}
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { G && G.resize(); sizeAll(); }, 120); });
drawLight(0); drawEcg(0);
document.fonts && document.fonts.ready.then(() => { sizeAll(); odo.dataset.len = ''; tick(); });
setInterval(renderStatic, 60000);
requestAnimationFrame(loop);

// for the build script: render the static link-preview image in a given language
window.__ogCard = async l => { applyLang(l, false); const c = await makeCard('og'); return c.toDataURL('image/png'); };
window.__meCard = async () => (await makeCard('me')).toDataURL('image/png');
})();
