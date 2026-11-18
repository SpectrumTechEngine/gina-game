// The Morning After: Gina's late for set. A fake-3D road racer (same trick as Culchie Rally),
// city -> country -> unit base, racing the clock and running over actors on purpose.
import { ART, bake, ginaRear, carSide, lg, rg, ell, rr, txt, glow } from './morning-art.js';

const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const DEV = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

/* ---------- words (uncensored, as Gina asked) ---------- */
const HITS = ['Beep fucking beep!', 'Should\'ve looked both ways, luvvie!', 'Road kill, darling.', 'Jaywalk THAT, ya prick!', 'Mind the paintwork, ya gobshite!',
  'Stay off my road, Darren.', 'Get out of the fucking road!', 'That\'s gonna dent the bonnet, ya cunt.', 'Your agent can scrape you up.', 'Speed bump, ya bollocks.',
  'Method act being a pancake.', 'Indicate THIS, ya wanker.', 'Brake? I hardly know her.', 'Hit your mark, dickhead.', 'Back to drama school, ya gobshite.',
  'Off-book and off the road.', 'Break a leg. Done it for ya.', 'Should\'ve stayed in your trailer.', 'Background artist? Background now.', 'Oat milk THIS, ya pretentious bollocks.'];
const OUCH = ['Ah fuck!', 'Shite!', 'Who put that there?!', 'Ah for fuck\'s sake!', 'Bollocks!', 'My fucking head…', 'Not today, Satan.', 'Jesus fucking Christ!'];
const BUMP = ['Jesus, the roads in this country.', 'Fucking pothole!', 'My head. My HEAD.', 'Fill your potholes, ya bastards!'];
const WINE = ['Breakfast of champions.', 'Hair of the dog, babe.', 'It\'s five o\'clock in Dubai.', 'Don\'t tell the Gardaí.', 'Just the one.'];
const COFFEE = ['Oh thank fuck. Coffee.', 'Caffeine. My one true love.', 'Rocket fuel!'];
const PILLS = ['Paracetamol. My saviour.', 'Head: fixed. Dignity: still missing.'];
const TIPSY = ['Wine o\'clock, bitches!', 'I\'m not drunk, I\'m just a girl!', 'Who moved the fucking road?', 'I\'m fine. I\'m FINE.'];
const GIRL = ['You go for it, girl!', 'You get it, girl!', 'I\'m just a girl!', 'Get in, girl!'];
const AD = ['Gina, where are you?', 'Gina, the actors want oat milk.', 'Gina, the director\'s asking for you. Again.', 'Gina, catering\'s out of rashers. Is that your fault too?',
  'Gina, the lead won\'t leave his trailer.', 'GINA.', 'Gina, are you alive?', 'Gina, the honeywagon\'s flooded.', 'Gina, the producer\'s here. Act normal.',
  'Gina, did you take the call sheets home again?', 'Gina, we\'re losing the light. It\'s 6am. How.', 'Gina, the extras are unionising.', 'Gina, is that you beeping in the background?',
  'Gina, the leading man wants his tea at 64 degrees exactly.'];
const REPLY = ['I\'m five minutes away!', 'I\'m literally parking.', 'Traffic, babe.', 'Tell them to fuck off.', 'I\'m just a girl!', 'On my way, ya legend.', 'Who is this?',
  'Can\'t hear you, you\'re breaking up… kshhhh.', 'Two minutes. Swear to God.'];
const DEATH = ['Written off. The car too.', 'Towed. Like her dignity.', 'She died as she drove: half-cut.', 'Straight to fucking DVD.', 'The tractor won.',
  'Call time cancelled. So\'s Gina.', 'Ah for fuck\'s sake, Gina.', 'Killed off before the opening credits.'];

/* ---------- saves (the Big Night's look and mute are shared) ---------- */
const NKEY = 'ginaBigNight.3d.v1', KEY = 'ginaBigNight.morning.v1';
const readJ = k => { try { return JSON.parse(localStorage.getItem(k) || 'null') || {}; } catch (e) { return {}; } };
let night = Object.assign({ look: 'own', muted: false }, readJ(NKEY));
let save = Object.assign({ best: null, bestHits: 0, plays: 0 }, readJ(KEY));
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { } };
function setMuted(m) {
  const n = readJ(NKEY); n.muted = m; night.muted = m; try { localStorage.setItem(NKEY, JSON.stringify(n)); } catch (e) { }
  $('muteBtn').textContent = m ? '🔇' : '🔊'; if (master) master.gain.value = m ? 0 : 1;
}
const LOOK = night.look || 'own';
const faceSrc = id => id === 'own' ? 'assets/gina/upper_own.png' : `assets/gina/head_${id}.png`;
function setFace(el, box, id) { el.src = faceSrc(id); box.classList.toggle('own', id === 'own'); }

/* ---------- images ---------- */
const IM = {};
function loadImg(k, src) { return new Promise(r => { const i = new Image(); i.onload = () => { IM[k] = i; r(); }; i.onerror = () => r(); i.src = src; }); }
const loading = Promise.all([
  loadImg('sky', 'assets/hdri/morning_sky.jpg'),
  ...['upper_own', 'upper_headless', 'leg_l', 'leg_r', 'head_grimace', 'head_classic'].map(k => loadImg(k, `assets/gina/${k}.png`)),
  LOOK !== 'own' ? loadImg('head_' + LOOK, `assets/gina/head_${LOOK}.png`) : null,
]);

/* ---------- sound: everything made in code ---------- */
let AC = null, master, musG, sfxG;
function ac() {
  if (!AC) {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      master = AC.createGain(); master.gain.value = night.muted ? 0 : 1; master.connect(AC.destination);
      musG = AC.createGain(); musG.gain.value = 0; musG.connect(master); sfxG = AC.createGain(); sfxG.gain.value = .9; sfxG.connect(master);
    } catch (e) { return null; }
  }
  if (AC.state === 'suspended') AC.resume(); return AC;
}
let NOISE = null;
function noiseBuf() { if (!NOISE) { const len = AC.sampleRate * 2; NOISE = AC.createBuffer(1, len, AC.sampleRate); const d = NOISE.getChannelData(0); for (let i = 0; i < len; i++)d[i] = Math.random() * 2 - 1; } return NOISE; }
function tone(f1, f2, d, type = 'square', v = .08, delay = 0, out) {
  if (!ac()) return; const t = AC.currentTime + delay, o = AC.createOscillator(), gn = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t + d);
  gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(gn).connect(out || sfxG); o.start(t); o.stop(t + d + .02);
}
function noise(d, f, v = .2, delay = 0, type = 'bandpass', f2, q = 1, out) {
  if (!ac()) return; const t = AC.currentTime + delay, s = AC.createBufferSource(); s.buffer = noiseBuf();
  const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); fl.Q.value = q;
  const gn = AC.createGain(); gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d);
  s.connect(fl).connect(gn).connect(out || sfxG); s.start(t, Math.random()); s.stop(t + d + .02);
}
const SFX = {
  horn: () => { tone(370, 368, .32, 'square', .07); tone(466, 464, .32, 'square', .06); },
  thud: () => { tone(140, 40, .25, 'sine', .55); noise(.18, 900, .35, 0, 'lowpass'); },
  crash: () => { noise(.55, 1400, .5, 0, 'lowpass', 300); tone(90, 30, .4, 'sawtooth', .2); noise(.3, 4000, .12, .05, 'highpass'); },
  ding: () => { tone(988, 990, .1, 'triangle', .1); tone(1318, 1320, .16, 'triangle', .09, .07); },
  clink: () => { tone(2600, 2500, .14, 'triangle', .07); tone(3300, 3200, .2, 'triangle', .05, .06); },
  slurp: () => { noise(.35, 600, .2, 0, 'bandpass', 1800, 4); },
  squelch: () => { noise(.12, 1800, .16, 0, 'bandpass', 1200, 2); tone(1400, 1400, .05, 'square', .02, .1); },
  beep: (d = 0) => tone(2050, 2050, .12, 'square', .07, d),
  screech: () => noise(.9, 2600, .22, 0, 'bandpass', 1100, 6),
  scratch: () => { noise(.35, 300, .3, 0, 'bandpass', 2400, 3); },
  stab: () => { [220, 277, 330].forEach(f => tone(f, f * .98, .7, 'sawtooth', .07)); tone(55, 40, .6, 'sine', .4); },
  siren: () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 640 : 820, i % 2 ? 640 : 820, .22, 'square', .035, i * .24); },
  scrape: () => noise(.25, 3000, .1, 0, 'highpass'),
  bump: () => { tone(90, 50, .18, 'sine', .4); },
  wrap: () => { [60, 64, 67, 72].forEach((m, i) => tone(mf(m), mf(m), .18, 'sawtooth', .06, i * .1)); },
  sad: () => { [[55, .45], [54, .45], [53, .45], [52, 1.4]].forEach(([m, d], i) => tone(mf(m), mf(m) * .97, d, 'sawtooth', .08, i * .5)); },
};
const mf = m => 440 * Math.pow(2, (m - 69) / 12);

// driving music: 128 bpm, A minor, F, C, G
let mStep = 0, mNext = 0, musTimer = 0;
const CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
function inst(type, f, t, d, v, cut) { const o = AC.createOscillator(), fl = AC.createBiquadFilter(), gn = AC.createGain(); o.type = type; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = cut; gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(fl).connect(gn).connect(musG); o.start(t); o.stop(t + d + .05); }
function drum(kind, t) {
  if (kind === 'k') { const o = AC.createOscillator(), gn = AC.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + .2); gn.gain.setValueAtTime(.6, t); gn.gain.exponentialRampToValueAtTime(.0001, t + .25); o.connect(gn).connect(musG); o.start(t); o.stop(t + .3); return; }
  const s = AC.createBufferSource(); s.buffer = noiseBuf(); const fl = AC.createBiquadFilter(), gn = AC.createGain(); fl.type = 'highpass'; fl.frequency.value = kind === 'h' ? 7000 : 1200;
  const d = kind === 'h' ? .04 : .16, v = kind === 'h' ? .07 : .28; gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl).connect(gn).connect(musG); s.start(t, Math.random()); s.stop(t + d + .02);
}
function musTick() {
  if (!AC) return; const STEP = 60 / 128 / 4;
  if (mNext < AC.currentTime) mNext = AC.currentTime + .05;
  while (mNext < AC.currentTime + .15) {
    const s = mStep % 16, ch = CH[Math.floor(mStep / 16) % 4], t = mNext;
    if (s % 4 === 0) drum('k', t); if (s === 4 || s === 12) drum('s', t); if (s % 2 === 1) drum('h', t);
    if (s % 2 === 0) inst('sawtooth', mf(ch[0] - 24 + (s % 8 === 6 ? 12 : 0)), t, STEP * 1.8, .13, 700);
    if (mStep >= 32) inst('square', mf(ch[s % 3] + (s % 6 < 3 ? 12 : 0)), t, STEP * .9, .035, 2600);
    if (s === 0) ch.forEach(m => inst('sawtooth', mf(m), t, STEP * 14, .025, 1400));
    mNext += STEP; mStep++;
  }
}
function music(on) { if (!ac()) return; musG.gain.setTargetAtTime(on ? .5 : 0, AC.currentTime, .15); if (on && !musTimer) { mStep = 0; mNext = 0; musTimer = setInterval(musTick, 30); } }
let eng = null;
function engineOn() { if (eng || !ac()) return; const o = AC.createOscillator(), o2 = AC.createOscillator(), fl = AC.createBiquadFilter(), gn = AC.createGain(); o.type = 'sawtooth'; o2.type = 'square'; fl.type = 'lowpass'; fl.frequency.value = 500; gn.gain.value = 0; o.connect(fl); o2.connect(fl); fl.connect(gn).connect(sfxG); o.start(); o2.start(); eng = { o, o2, fl, gn }; }
function engineOff() { if (!eng) return; eng.gn.gain.setTargetAtTime(0, AC.currentTime, .05); const e = eng; setTimeout(() => { try { e.o.stop(); e.o2.stop(); } catch (x) { } }, 300); eng = null; }
function engineSet(p, on) { if (!eng) return; const t = AC.currentTime, f = 42 + p * 120 + (p > .55 ? -30 : 0); eng.o.frequency.setTargetAtTime(f, t, .08); eng.o2.frequency.setTargetAtTime(f / 2, t, .08); eng.fl.frequency.setTargetAtTime(300 + p * 1100, t, .1); eng.gn.gain.setTargetAtTime(on ? .05 + p * .03 : 0, t, .1); }

/* ---------- canvas ---------- */
const cv = $('cv'), g = cv.getContext('2d');
let W = 390, H = 600, DPR = 1, HORY = 240, lowQ = false;
let cityL = null, hillL = null, grain = null;
function resize() {
  const r = $('stage').getBoundingClientRect(); W = Math.max(200, r.width); H = Math.max(200, r.height);
  DPR = lowQ ? 1 : Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); HORY = Math.round(H * .4);
  buildLayers();
}
function buildLayers() {
  // far city skyline and far green hills, drawn once, scrolled for parallax
  const LW = 1400, LH = 150;
  cityL = document.createElement('canvas'); cityL.width = LW * DPR; cityL.height = LH * DPR; let c = cityL.getContext('2d'); c.scale(DPR, DPR);
  let s = 3; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let layer = 0; layer < 2; layer++) {
    let x = 0; const col = layer ? '#56627a' : '#8d97ab';
    while (x < LW) {
      const w = 30 + r() * 60, h = (layer ? 40 : 60) + r() * (layer ? 70 : 80); c.fillStyle = col; c.fillRect(x, LH - h, w, h);
      for (let wy = LH - h + 8; wy < LH - 8; wy += 12) for (let wx = x + 6; wx < x + w - 8; wx += 11) if (r() < .25) { c.fillStyle = 'rgba(255,220,150,.7)'; c.fillRect(wx, wy, 4, 5); }
      if (!layer && r() < .08) { c.fillStyle = col; c.fillRect(x + w / 2 - 2, LH - h - 40, 4, 40); c.beginPath(); c.moveTo(x + w / 2 - 8, LH - h); c.lineTo(x + w / 2, LH - h - 50); c.lineTo(x + w / 2 + 8, LH - h); c.fill(); }
      if (!layer && r() < .06) { c.strokeStyle = '#e8b33a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 10, LH); c.lineTo(x + 10, LH - h - 60); c.lineTo(x + 80, LH - h - 60); c.stroke(); }
      x += w + (layer ? 0 : 6);
    }
  }
  hillL = document.createElement('canvas'); hillL.width = LW * DPR; hillL.height = LH * DPR; c = hillL.getContext('2d'); c.scale(DPR, DPR);
  const ridge = (base, amp, f, ph, c1, c2, fields) => {
    c.beginPath(); c.moveTo(0, LH); for (let x = 0; x <= LW; x += 4) { const y = LH - base - amp * Math.sin(x / f * 2 * Math.PI / LW * 10 + ph) - amp * .5 * Math.sin(x / f * 2 * Math.PI / LW * 27 + ph * 2); c.lineTo(x, y); }
    c.lineTo(LW, LH); c.closePath(); c.fillStyle = lg(c, 0, LH - base - amp * 1.5, 0, LH, c1, c2); c.fill();
    if (fields) { c.save(); c.clip(); for (let i = 0; i < 70; i++) { c.fillStyle = ['rgba(120,170,70,.35)', 'rgba(200,190,90,.3)', 'rgba(60,110,50,.3)'][i % 3]; c.fillRect(i * 20 + r() * 10, LH - base - r() * amp * 1.4, 22 + r() * 30, 14); } c.restore(); }
  };
  ridge(70, 22, 1, 1, '#8fa9b5', '#b9c9cf'); ridge(42, 16, 1.3, 3, '#6f9a62', '#a6bfa0', true); ridge(16, 8, 1.9, 5, '#4f8a44', '#8fb486');
  grain = document.createElement('canvas'); grain.width = grain.height = 128; c = grain.getContext('2d');
  for (let i = 0; i < 2600; i++) { c.fillStyle = Math.random() < .5 ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.12)'; c.fillRect(Math.random() * 128, Math.random() * 128, 1, 1); }
  grain.pat = g.createPattern(grain, 'repeat');
}

/* ---------- the road ---------- */
const SEG = 200, ROADW = 2000, CAMH = 1600, CAMD = 1 / Math.tan(50 * Math.PI / 180), PLAYERZ = CAMH * CAMD, DRAW = 220;
const MAXV = 11000, ACC = MAXV / 4.2, BRK = -MAXV * 1.25, DEC = -MAXV / 7, OFFDEC = -MAXV / 1.5, OFFMAX = MAXV / 3.4, CENTRI = .3, CARW = .36;
const RATE = 10, START = 6 * 3600 + 7 * 60, CALL = 6 * 3600 + 30 * 60;
let segs = [], FIN = 0, Z = {}, things = [];
const PAL = {
  city: { g1: [146, 142, 136], g2: [136, 132, 126], r1: [196, 194, 188], r2: [150, 148, 144], d1: [80, 82, 88], d2: [76, 78, 84], ln: [238, 238, 232], ed: [236, 196, 58] },
  country: { g1: [98, 160, 64], g2: [86, 146, 56], r1: [205, 45, 48], r2: [238, 238, 236], d1: [104, 106, 112], d2: [98, 100, 106], ln: [245, 240, 220], ed: [235, 235, 228] },
  set: { g1: [112, 166, 72], g2: [100, 152, 62], r1: [255, 204, 40], r2: [36, 36, 36], d1: [96, 98, 104], d2: [92, 94, 100], ln: [255, 255, 255], ed: [255, 204, 40] },
};
const HAZE = [222, 226, 232];
const mixA = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
const css = a => `rgb(${a[0] | 0},${a[1] | 0},${a[2] | 0})`;
function segCols(s, L) {
  let c = s.cache[L]; if (c) return c;
  const k = s.alt ? 1 : 2, f = L / 15 * .8, pal = {};
  for (const p of ['g', 'r', 'd']) { let v = mixA(PAL.city[p + k], PAL.country[p + k], s.cf); v = mixA(v, PAL.set[p + k], s.sf); pal[p] = css(mixA(v, HAZE, f)); }
  for (const p of ['ln', 'ed']) { let v = mixA(PAL.city[p], PAL.country[p], s.cf); v = mixA(v, PAL.set[p], s.sf); pal[p] = css(mixA(v, HAZE, f)); }
  return s.cache[L] = pal;
}
let RS = 1; const rnd = () => { RS = (RS * 16807) % 2147483647; return RS / 2147483647; }, rr2 = (a, b) => a + rnd() * (b - a), rpick = a => a[Math.floor(rnd() * a.length)];
function addSeg(curve, y, zone) { const n = segs.length, py = n ? segs[n - 1].p2.world.y : 0; segs.push({ i: n, p1: { world: { y: py, z: n * SEG }, camera: {}, screen: {} }, p2: { world: { y, z: (n + 1) * SEG }, camera: {}, screen: {} }, curve, zone, spr: [], th: [], cache: [], alt: Math.floor(n / 3) % 2, clip: 0 }); }
const easeIn = (a, b, p) => a + (b - a) * p * p, easeInOut = (a, b, p) => a + (b - a) * (-Math.cos(p * Math.PI) / 2 + .5);
function addRoad(e, h, l, curve, hill, zone) {
  const sy = segs.length ? segs[segs.length - 1].p2.world.y : 0, ey = sy + hill * SEG, t = e + h + l;
  for (let i = 0; i < e; i++) addSeg(easeIn(0, curve, i / e), easeInOut(sy, ey, i / t), zone);
  for (let i = 0; i < h; i++) addSeg(curve, easeInOut(sy, ey, (e + i) / t), zone);
  for (let i = 0; i < l; i++) addSeg(easeInOut(curve, 0, i / l), easeInOut(sy, ey, (e + h + i) / t), zone);
}
function buildTrack() {
  segs = []; RS = 4242;
  const zone = (name, len, gen) => { const end = segs.length + len; Z[name] = segs.length; while (segs.length < end) gen(); };
  addRoad(0, 40, 0, 0, 0, 'city');
  zone('city', 1650, () => rnd() < .35 ? addRoad(20, rr2(30, 70), 20, 0, rr2(-2, 2), 'city') : addRoad(14, rr2(14, 30), 14, (rnd() < .5 ? -1 : 1) * rr2(2.5, 4.2), 0, 'city'));
  zone('sub', 380, () => addRoad(25, rr2(30, 60), 25, (rnd() < .5 ? -1 : 1) * rr2(1, 3), rr2(-4, 4), 'sub'));
  zone('country', 2900, () => rnd() < .2 ? addRoad(30, rr2(40, 90), 30, 0, rr2(-14, 14), 'country') : addRoad(rr2(20, 40), rr2(30, 80), rr2(20, 40), (rnd() < .5 ? -1 : 1) * rr2(1.5, 5.5), rr2(-12, 12), 'country'));
  zone('set', 600, () => addRoad(30, rr2(40, 80), 30, (rnd() < .5 ? -1 : 1) * rr2(0, 1.5), rr2(-3, 3), 'set'));
  FIN = segs.length - 40;
  // flatten towards the finish, then a run-off
  const fy = segs[segs.length - 1].p2.world.y; addRoad(40, 300, 0, 0, -fy / SEG, 'set');
  Z.end = segs.length;
  for (const s of segs) { s.cf = clamp((s.i - Z.sub) / (Z.country - Z.sub), 0, 1); s.sf = clamp((s.i - Z.set) / 150, 0, 1); s.lanes = s.cf < .5 ? 3 : 2; }
  decorate();
}
const put = (i, k, x, o = {}) => { if (segs[i]) segs[i].spr.push(Object.assign({ k, x }, o)); };
function decorate() {
  RS = 99;
  const { city, sub, country, set } = Z;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i], z = s.zone;
    if (z === 'city') {
      if (i % 5 === 0) { put(i, 'facade' + Math.floor(rnd() * 12), -1.85 - rnd() * .1); put(i + 2, 'facade' + Math.floor(rnd() * 12), 1.85 + rnd() * .1); }
      if (i % 18 === 0) { put(i, 'lamp', -1.22, { flip: true }); put(i + 9, 'lamp', 1.22); }
      if (i % 160 === 80) { put(i, 'lights', -1.2); put(i, 'lights', 1.2); }
      if (i % 37 === 11) put(i, 'tree', rnd() < .5 ? -1.4 : 1.4);
    } else if (z === 'sub') {
      if (i % 7 === 0) { put(i, 'house' + Math.floor(rnd() * 4), -1.9); put(i + 3, 'house' + Math.floor(rnd() * 4), 1.9); }
      if (i % 20 === 0) put(i, 'lamp', 1.22);
      if (i % 11 === 5) put(i, 'tree', rnd() < .5 ? -1.45 : 1.5);
    } else if (z === 'country' || (z === 'set' && i < set + 120)) {
      if (i % 2 === 0) { put(i, 'hedge', -1.38 - rnd() * .06); put(i + 1, 'hedge', 1.38 + rnd() * .06); }
      if (i % 9 === 0) put(i, 'tree', (rnd() < .5 ? -1 : 1) * rr2(1.8, 2.8));
      if (i % 26 === 0) put(i, 'pole', 1.6);
      if (i % 140 === 30) put(i, rnd() < .5 ? 'farmhouse' : 'barn', (rnd() < .5 ? -1 : 1) * rr2(2.6, 3.2));
      if (i % 90 === 60) put(i, 'bales', (rnd() < .5 ? -1 : 1) * rr2(2.1, 2.6));
      if (i % 70 === 20) put(i, 'cow', (rnd() < .5 ? -1 : 1) * rr2(2.0, 3.0), { flip: rnd() < .5 });
      if (i % 110 === 45) put(i, 'gate', (rnd() < .5 ? -1.6 : 1.6));
      if (i % 64 === 10) put(i, 'wall', (rnd() < .5 ? -1.6 : 1.6));
      if (s.curve && Math.abs(s.curve) > 3.5 && i % 12 === 0) put(i, 's_bend', s.curve > 0 ? 1.3 : -1.3, { flip: s.curve < 0 });
    }
    if (z === 'set') {
      if (i % 9 === 0 && i > set + 60) put(i, 'trailer' + Math.floor(rnd() * 6), (rnd() < .5 ? -1 : 1) * rr2(1.9, 2.4));
      if (i % 45 === 20) put(i, 'trailerC', -2.2);
      if (i % 50 === 0 && i > set + 100) put(i, 'light', 1.8);
      if (i % 60 === 35) put(i, 'tent', 2.4);
      if (i % 40 === 0) put(i, i > FIN - 120 ? 's_late' : 's_unit', 1.32);
      if (i % 5 === 0 && i > FIN - 30) { put(i, 'hedge', -1.4); put(i, 'hedge', 1.4); }
    }
  }
  put(city + 30, 's_slow', 1.32); put(sub - 6, 's_bye', 1.34); put(country + 10, 's_farm', 1.34); put(country + 40, 's_cow', -1.34);
  // Garda checkpoint
  Z.g0 = country + 360; Z.g1 = Z.g0 + 70;
  put(Z.g0 - 120, 's_garda', 1.34); put(Z.g0 - 60, 's_slow', 1.34); put(Z.g0 - 58, 's_slow', -1.34, { flip: true });
  for (let i = Z.g0; i < Z.g1; i += 16) { put(i, 'cones', 1.0, { c: .14, t: 'haz' }); }
  put(Z.g0 + 20, 'gardaCar', 1.75); put(Z.g0 + 26, 'garda', 1.25); put(Z.g0 + 50, 'gardaCar', -1.75, { flip: true });
  put(FIN, 'arch', 0);
}
function spawnObjects() {
  // hazards, pickups, actors and animals: a fresh mix every run
  for (const s of segs) { s.spr = s.spr.filter(o => !o.run); for (const o of s.spr) o.gone = false; }
  things = [];
  const busy = new Set(), free = i => { for (let k = i - 3; k <= i + 3; k++) if (busy.has(k)) return false; return true; }, mark = i => busy.add(i);
  for (let i = Z.g0 - 10; i < Z.g1 + 10; i++) mark(i);
  const lanesX = s => s.lanes === 3 ? [-.66, 0, .66] : [-.5, .5];
  for (let i = 70; i < FIN - 20; i++) {
    const s = segs[i];
    if (s.zone === 'city' && i % 75 === 0 && free(i)) {
      const k = pick(['bin', 'bin', 'cones', 'barrier', 'skip', 'pcar']), x = k === 'pcar' || k === 'skip' ? pick([-.78, .78]) : pick(lanesX(s));
      s.spr.push({ k: k === 'pcar' ? 'pcar' + Math.floor(Math.random() * 5) : k, x, t: 'haz', c: { bin: .1, cones: .2, barrier: .32, skip: .36, pcar: .4 }[k], run: 1 }); mark(i);
    }
    if ((s.zone === 'country' || s.zone === 'sub') && i % 100 === 0 && free(i) && (i < Z.g0 - 20 || i > Z.g1 + 20)) {
      const r = Math.random();
      if (r < .35) s.spr.push({ k: 'pothole', x: pick(lanesX(s)), t: 'bump', c: .2, run: 1 });
      else if (r < .6) s.spr.push({ k: 'bale', x: pick(lanesX(s)), t: 'haz', c: .16, run: 1 });
      else if (r < .75) s.spr.push({ k: 'cones', x: pick(lanesX(s)), t: 'haz', c: .2, run: 1 });
      mark(i);
    }
    if (s.zone === 'set' && i % 90 === 0 && free(i) && i < FIN - 40) { s.spr.push({ k: 'cones', x: pick(lanesX(s)), t: 'haz', c: .2, run: 1 }); mark(i); }
  }
  // pickups: rows of bags, the odd wine, coffee, paracetamol
  for (let i = 90; i < FIN - 20; i += Math.floor(rand(22, 38))) {
    const x = pick(lanesX(segs[i])); let n = Math.floor(rand(3, 6));
    for (let k = 0; k < n; k++) { const j = i + k * 3; if (!free(j) || !segs[j]) break; segs[j].spr.push({ k: 'bag', x, t: 'pick', c: .3, run: 1, bob: Math.random() * 6 }); }
    if (Math.random() < .3) { const j = i + 18; if (free(j)) segs[j].spr.push({ k: 'wine', x: pick(lanesX(segs[j])), t: 'pick', c: .3, run: 1, bob: Math.random() * 6 }); }
  }
  for (let i = 300; i < FIN; i += Math.floor(rand(380, 520))) { const j = i; if (free(j)) segs[j].spr.push({ k: 'coffee', x: pick(lanesX(segs[j])), t: 'pick', c: .3, run: 1, bob: 0 }); }
  for (let i = 900; i < FIN; i += Math.floor(rand(1300, 1700))) { if (free(i)) segs[i].spr.push({ k: 'pills', x: pick(lanesX(segs[i])), t: 'pick', c: .3, run: 1, bob: 0 }); }
  // actors: a steady supply, swarming near the unit base
  for (let i = 110; i < FIN - 6;) {
    const s = segs[i]; if (i < Z.g0 - 20 || i > Z.g1 + 10) things.push({ k: 'actor', z: i * SEG + 100, x: (Math.random() < .5 ? -1 : 1) * rand(.6, 1.5), o: Math.floor(Math.random() * 3), ph: Math.random() * 6, c: .24 });
    i += s.zone === 'set' ? Math.floor(rand(12, 20)) : Math.floor(rand(48, 70));
  }
  // tractors and sheep in the country, the odd cow on the road
  for (let i = Z.country + 120; i < Z.set - 100; i += Math.floor(rand(550, 700))) if (i < Z.g0 - 40 || i > Z.g1 + 40) things.push({ k: 'tractor' + (Math.random() < .5 ? 0 : 1), z: i * SEG, x: -.5, v: MAXV * .28, c: .34, solid: 1 });
  for (let i = Z.country + 250; i < Z.set - 60; i += Math.floor(rand(500, 650))) {
    if (i > Z.g0 - 40 && i < Z.g1 + 40) continue;
    const dir = Math.random() < .5 ? -1 : 1; for (let k = 0; k < 3; k++) things.push({ k: 'sheep', z: (i + k * 1.4) * SEG, x: -dir * (1.5 + Math.random() * .6), vx: dir * rand(.22, .36), c: .14, flip: dir < 0, solid: 1 });
  }
  for (let i = Z.country + 600; i < Z.set; i += Math.floor(rand(1300, 1600))) things.push({ k: 'cow', z: i * SEG, x: pick([-.6, .6]), c: .3, flip: Math.random() < .5, solid: 1 });
}

/* ---------- state ---------- */
let state = 'title', paused = false, T = 0, last = 0;
const keys = { L: 0, R: 0, G: 0, B: 0 };
let P = null;
function newPlayer() {
  return {
    z: 0, x: .5, v: 0, st: 0, clock: START, hearts: 3, bags: 0, wine: 0, hits: 0, picks: 0, streak: 0, hang: 1, boost: 0, tipsy: 0, inv: 0, shake: 0, cheer: 0,
    skyX: 0, hillX: 0, fined: false, grim: 0, slow: 0, pops: [], fly: [], dust: [], said: {}, arrive: 0, fin: 0, scrapeT: 0, count: 0, crashes: 0
  };
}
const segAt = z => segs[clamp(Math.floor(z / SEG), 0, segs.length - 1)];
function project(p, cx, cy, cz) {
  p.camera.x = -cx; p.camera.y = (p.world.y || 0) - cy; p.camera.z = p.world.z - cz;
  const sc = p.screen.scale = CAMD / p.camera.z;
  p.screen.x = W / 2 + sc * p.camera.x * W / 2; p.screen.y = HORY - sc * p.camera.y * H * .56; p.screen.w = sc * ROADW * W / 2;
}

/* ---------- drawing ---------- */
function poly(x1, y1, x2, y2, x3, y3, x4, y4, col) { g.fillStyle = col; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x3, y3); g.lineTo(x4, y4); g.closePath(); g.fill(); }
function drawBg(ps) {
  const sky = IM.sky, sh = HORY + 2;
  if (sky) { const sw = sky.width * (sh / sky.height); let ox = -((P.skyX * sw) % sw); if (ox > 0) ox -= sw; for (let x = ox; x < W; x += sw) g.drawImage(sky, x, 0, sw + 1, sh); }
  else { g.fillStyle = lg(g, 0, 0, 0, HORY, '#5d8fd6', '#ffd8b0'); g.fillRect(0, 0, W, HORY); }
  g.fillStyle = lg(g, 0, HORY * .45, 0, HORY, 'rgba(255,214,170,0)', 'rgba(255,214,170,.45)'); g.fillRect(0, 0, W, HORY);
  const sunX = W * .74 - ((P.skyX * 900) % (W * 3));
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rg(g, sunX, HORY - 30, 150, 'rgba(255,230,170,.85)', 'rgba(255,180,120,0)'); g.fillRect(sunX - 160, HORY - 190, 320, 260); g.restore();
  const cf = ps.cf, LW = 1400, LH = 150, k = Math.min(1, W / 390) * .9, lw = LW * k, lh = LH * k;
  const layer = (img, a, par) => { if (a <= 0.01 || !img) return; g.globalAlpha = a; let ox = -((P.hillX * par) % lw); if (ox > 0) ox -= lw; for (let x = ox; x < W; x += lw) g.drawImage(img, x, HORY - lh + 2, lw + 1, lh); g.globalAlpha = 1; };
  layer(hillL, Math.max(cf, ps.sf), 1); layer(cityL, 1 - cf, 1.3);
}
function drawSpr(key, sx, sy, sc, clipY, flip, alpha) {
  const a = ART[key]; if (!a || !a.img) return; const w = a.w * sc, h = a.h * sc;
  if (w < .6 || sy - h >= clipY || sx + w / 2 < 0 || sx - w / 2 > W) return;
  const clipped = clipY < sy; if (clipped) { g.save(); g.beginPath(); g.rect(0, 0, W, clipY); g.clip(); }
  if (alpha < 1) g.globalAlpha = alpha;
  if (flip) { g.save(); g.translate(sx, 0); g.scale(-1, 1); g.drawImage(a.img, -w / 2, sy - h, w, h); g.restore(); }
  else g.drawImage(a.img, sx - w / 2, sy - h, w, h);
  if (alpha < 1) g.globalAlpha = 1; if (clipped) g.restore();
}
function render() {
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  const sh = P.shake > 0 ? P.shake * 7 : 0; if (sh) g.translate(rand(-sh, sh), rand(-sh, sh));
  const base = segAt(P.z), bp = (P.z % SEG) / SEG, pz = P.z + PLAYERZ, ps = segAt(pz), pp = (pz % SEG) / SEG, py = lerp(ps.p1.world.y, ps.p2.world.y, pp);
  drawBg(ps);
  let maxy = H, x = 0, dx = -(base.curve * bp); const road = new Path2D();
  const n0 = base.i, cnt = Math.min(DRAW, segs.length - n0);
  for (let n = 0; n < cnt; n++) {
    const s = segs[n0 + n]; s.clip = maxy; s.ok = false;
    project(s.p1, P.x * ROADW - x, py + CAMH, P.z); project(s.p2, P.x * ROADW - x - dx, py + CAMH, P.z);
    x += dx; dx += s.curve;
    if (s.p1.camera.z <= CAMD) continue; s.ok = true;
    if (s.p2.screen.y >= s.p1.screen.y || s.p2.screen.y >= maxy) continue;
    const f = 1 - Math.exp(-Math.pow(n / DRAW * 2, 2)), L = Math.round(f * 15), c = segCols(s, L);
    const a = s.p1.screen, b = s.p2.screen, r1 = a.w * .09, r2 = b.w * .09;
    g.fillStyle = c.g; g.fillRect(0, b.y, W, a.y - b.y + 1);
    poly(a.x - a.w - r1, a.y, a.x - a.w, a.y, b.x - b.w, b.y, b.x - b.w - r2, b.y, c.r);
    poly(a.x + a.w + r1, a.y, a.x + a.w, a.y, b.x + b.w, b.y, b.x + b.w + r2, b.y, c.r);
    poly(a.x - a.w, a.y, a.x + a.w, a.y, b.x + b.w, b.y, b.x - b.w, b.y, c.d);
    road.moveTo(a.x - a.w, a.y); road.lineTo(a.x + a.w, a.y); road.lineTo(b.x + b.w, b.y); road.lineTo(b.x - b.w, b.y); road.closePath();
    const e1 = a.w * .025, e2 = b.w * .025;
    poly(a.x - a.w * .96, a.y, a.x - a.w * .96 + e1, a.y, b.x - b.w * .96 + e2, b.y, b.x - b.w * .96, b.y, c.ed);
    poly(a.x + a.w * .96, a.y, a.x + a.w * .96 - e1, a.y, b.x + b.w * .96 - e2, b.y, b.x + b.w * .96, b.y, c.ed);
    if (s.alt) {
      const lanes = s.lanes, l1 = a.w * .02, l2 = b.w * .02;
      for (let k = 1; k < lanes; k++) { const fx = -1 + 2 * k / lanes, ax = a.x + a.w * fx, bx = b.x + b.w * fx; poly(ax - l1, a.y, ax + l1, a.y, bx + l2, b.y, bx - l2, b.y, c.ln); }
    }
    maxy = b.y;
  }
  if (grain && grain.pat) { g.save(); g.globalAlpha = .45; g.fillStyle = grain.pat; g.fill(road); g.restore(); }
  // horizon haze
  g.fillStyle = lg(g, 0, HORY - 40, 0, HORY + 50, 'rgba(232,228,226,0)', 'rgba(236,230,226,.5)', 'rgba(232,228,226,0)'); g.fillRect(0, HORY - 40, W, 90);
  // things into buckets
  for (let n = 0; n < cnt; n++) segs[n0 + n].th.length = 0;
  for (const t of things) { if (t.gone) continue; const i = Math.floor(t.z / SEG) - n0; if (i >= 0 && i < cnt) segs[n0 + i].th.push(t); }
  // sprites, far to near
  for (let n = cnt - 1; n > 0; n--) {
    const s = segs[n0 + n]; if (!s.ok) continue; const a = s.p1.screen, b = s.p2.screen, fade = clamp((DRAW - n) / 25, 0, 1);
    for (const o of s.spr) {
      if (o.gone) continue; let sy = a.y;
      if (o.t === 'pick') sy -= (Math.sin(T * 4 + o.bob) * 6 + 10) * a.w / 240;
      drawSpr(o.k, a.x + o.x * a.w, sy, a.w / 240, s.clip, o.flip, fade);
    }
    for (const t of s.th) {
      const f = (t.z - s.p1.world.z) / SEG, X = lerp(a.x, b.x, f), Y = lerp(a.y, b.y, f), Wd = lerp(a.w, b.w, f), sc = Wd / 240, sx = X + t.x * Wd;
      let key = t.k; if (t.k === 'actor') key = `actor${t.o}_${Math.floor(T * 5 + t.ph) % 2}`;
      drawSpr(key, sx, Y, sc, s.clip, t.flip || (t.k === 'actor' && t.x > P.x), fade);
      if (t.k === 'actor' && n < 70 && Y < s.clip) {
        const ty = Y - 170 * sc, k2 = clamp(sc * 1.2, .55, 1.1);
        g.save(); g.translate(sx, ty); g.scale(k2, k2); rr(g, -38, -16, 76, 20, 10, '#ff2d7e'); g.beginPath(); g.moveTo(-6, 4); g.lineTo(6, 4); g.lineTo(0, 11); g.fill(); txt(g, 'HIT HIM', 0, -1, '12px Bungee', '#fff'); g.restore();
      }
    }
  }
  // flying things (actors, bins, sheep)
  for (const f of P.fly) { g.save(); g.translate(f.x, f.y); g.rotate(f.r); const a = ART[f.k]; if (a && a.img) g.drawImage(a.img, -a.w * f.s / 2, -a.h * f.s / 2, a.w * f.s, a.h * f.s); g.restore(); }
  for (const d of P.dust) { g.fillStyle = `rgba(${d.c},${d.a})`; g.beginPath(); g.arc(d.x, d.y, d.r, 0, 7); g.fill(); }
  drawCar();
  // speed lines when boosting
  if (P.boost > 0 || P.v > MAXV * .97) { g.strokeStyle = `rgba(255,255,255,${P.boost > 0 ? .35 : .15})`; g.lineWidth = 2; for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + T * 3, r1 = W * .45 + ((T * 900 + i * 97) % (W * .3)); g.beginPath(); g.moveTo(W / 2 + Math.cos(a) * r1, HORY + Math.sin(a) * r1 * .8); g.lineTo(W / 2 + Math.cos(a) * (r1 + 40), HORY + Math.sin(a) * (r1 + 40) * .8); g.stroke(); } }
  for (const p of P.pops) { g.globalAlpha = clamp(p.t, 0, 1); txt(g, p.s, p.x, p.y, '22px Bungee', p.c); g.globalAlpha = 1; }
  // vignette + red flash
  const v = g.createRadialGradient(W / 2, H * .55, H * .3, W / 2, H * .55, H * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,0,20,.42)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (P.inv > 1.6) { g.fillStyle = `rgba(255,40,60,${(P.inv - 1.6) * .8})`; g.fillRect(0, 0, W, H); }
  if (P.slow > 0) { g.fillStyle = '#000'; const bh = H * .08 * Math.min(1, P.slow * 3); g.fillRect(0, 0, W, bh); g.fillRect(0, H - bh, W, bh); }
}
function drawCar() {
  const s = W * .625 / 240, a = ART.car, off = Math.abs(P.x) > 1.05 && P.v > 400;
  const by = (off ? Math.sin(T * 40) * 2 : Math.sin(T * 20) * .6 * (P.v / MAXV));
  const cx = W / 2 + P.st * 8 * s, cy = H * .985 + by;
  if (P.inv > 0 && Math.floor(T * 14) % 2 && P.inv < 1.6) g.globalAlpha = .55;
  g.save(); g.translate(cx, cy); g.rotate(P.st * .025);
  g.drawImage(a.img, -a.w * s / 2, -a.h * s, a.w * s, a.h * s);
  if (keys.B && P.v > 100) { g.save(); g.globalCompositeOperation = 'lighter'; [-90, 90].forEach(x => { g.fillStyle = rg(g, x * s, -54 * s, 34 * s, 'rgba(255,60,60,.9)', 'rgba(255,0,0,0)'); g.fillRect((x - 40) * s, -94 * s, 80 * s, 80 * s); }); g.restore(); }
  ginaRear(g, 0, 0, s, T, { speed: P.v / MAXV, tipsy: P.tipsy > 0, cheer: P.cheer, glass: true, lean: -P.st * .06 });
  g.restore(); g.globalAlpha = 1;
}

/* ---------- HUD ---------- */
const fmtClock = c => { const m = Math.floor(c / 60); return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; };
let hudLast = {};
function hud() {
  const set = (id, v) => { if (hudLast[id] !== v) { hudLast[id] = v; $(id).textContent = v; } };
  set('hClock', fmtClock(P.clock)); const d = CALL - P.clock;
  set('hCall', d > 0 ? `AM · ${Math.ceil(d / 60)} MIN TO CALL` : `AM · ${Math.floor(-d / 60) || 'JUST'} ${Math.floor(-d / 60) ? 'MIN ' : ''}LATE`);
  $('clock').classList.toggle('late', d <= 0);
  const kmh = Math.round(P.v / MAXV * 140); set('hSpeed', String(kmh));
  const arc = clamp(P.v / (MAXV * 1.25), 0, 1) * 100; if (Math.abs((hudLast.arc || 0) - arc) > .5) { hudLast.arc = arc; $('hArc').setAttribute('stroke-dasharray', `${arc} 100`); }
  set('hBags', String(P.bags)); set('hWine', String(P.wine)); set('hHits', String(P.hits));
  set('hearts', '❤'.repeat(P.hearts) + '♡'.repeat(Math.max(0, 3 - P.hearts)));
  const face = P.grim > 0 ? 'grimace' : LOOK; if (hudLast.face !== face) { hudLast.face = face; setFace($('faceImg'), $('face'), face); }
  const blur = P.hang * 1.1 +(P.tipsy > 0 ? .6 : 0); if (Math.abs((hudLast.blur || 0) - blur) > .08) { hudLast.blur = blur; cv.style.filter = blur > .1 ? `blur(${blur.toFixed(2)}px) saturate(${1 - P.hang * .25})` : ''; }
  const sway = P.tipsy > 0 ? Math.sin(T * 2.2) * 2.5 : P.hang > .3 ? Math.sin(T * 1.1) * P.hang * .8 : 0;
  cv.style.transform = sway ? `rotate(${sway.toFixed(2)}deg) scale(1.04)` : '';
}
let sayT = 0, wT = 0, wNext = 3, wQ = [];
function say(s, force) { if (!force && sayT > .6) return; const el = $('say'); el.textContent = s; el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); sayT = 1.9; }
function walkie(text, reply, who = '1st AD') { wQ.push({ text, reply, who }); }
function showWalkie(m) {
  const el = $('walkie'); el.textContent = ''; const b = document.createElement('b'); b.textContent = `📻 ${m.who}: `; el.append(b, document.createTextNode(m.text));
  if (m.reply) { const i = document.createElement('i'); i.textContent = 'Gina: ' + m.reply; el.append(i); }
  el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); wT = m.reply ? 4.6 : 3.6; SFX.squelch();
}
let adBag = [];
function tickTalk(dt) {
  if (sayT > 0) { sayT -= dt; if (sayT <= 0) $('say').hidden = true; }
  if (wT > 0) { wT -= dt; if (wT <= 0) { $('walkie').hidden = true; SFX.squelch(); } return; }
  if (wQ.length) { showWalkie(wQ.shift()); return; }
  wNext -= dt; if (wNext <= 0) { if (!adBag.length) adBag = AD.slice().sort(() => Math.random() - .5); walkie(adBag.pop(), Math.random() < .5 ? pick(REPLY) : null); wNext = rand(9, 15); }
}
function banner(s, sub, t = 1.2) { const el = $('banner'); el.innerHTML = ''; el.append(document.createTextNode(s)); if (sub) { const m = document.createElement('small'); m.textContent = sub; el.append(m); } el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); clearTimeout(banner.t); banner.t = setTimeout(() => el.hidden = true, t * 1000); }
function pop(s, c = '#fff') { P.pops.push({ s, c, x: W / 2 + rand(-30, 30), y: H * .62, t: 1.3 }); }
function toast(s) { const el = $('toast'); el.textContent = s; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 1800); }

/* ---------- the game loop ---------- */
function flyAway(k, sc, x0) { const s = W * .625 / 240; P.fly.push({ k, x: W / 2 + (x0 - P.x) * W * .625, y: H * .8, s: Math.max(sc, s * .9), vx: rand(-260, 260), vy: rand(-900, -650), r: 0, vr: rand(-9, 9), t: 1.6 }); }
function hitActor(t) {
  t.gone = true; P.hits++; P.bags += 5; P.picks += 5; lifeCheck(); P.clock -= 10; P.cheer = 1;
  flyAway(`actor${t.o}_0`, 1, t.x); SFX.thud(); setTimeout(SFX.horn, 60); P.shake = .25; pop('+10s', '#8ff0d2'); say(pick(HITS), true);
  $('face').classList.remove('bump'); void $('face').offsetWidth; $('face').classList.add('bump');
  if (P.hits % 5 === 0) { P.slow = .9; banner(`${P.hits} ACTORS DOWN`, pick(GIRL), 1.4); SFX.wrap(); }
  if (P.hits === 3) walkie('Gina, the actors are calling in sick. Something about a convertible?', 'Weird. Anyway.');
  if (P.hits === 12) walkie('Gina, we\'re running out of cast.', 'Hire more. They\'re cheap.');
}
function lifeCheck() { while (P.picks >= 10) { P.picks -= 10; if (P.hearts < 5) { P.hearts++; pop('+1 ❤', '#ff4fa3'); } } }
function crash(o, solidThing) {
  if (P.inv > 0 || P.tipsy > 0) { if (!solidThing) { o.gone = true; flyAway(o.k, 1, o.x); SFX.thud(); P.shake = .2; } return; }
  P.hearts--; P.crashes++; P.v = (P.v + Math.min(P.v, MAXV * .12)) / 2; P.inv = 2.2; P.shake = .6; P.grim = 1.4; SFX.crash();
  if (!solidThing) { o.gone = true; flyAway(o.k, 1, o.x); }
  say(pick(OUCH), true);
  for (let i = 0; i < 14; i++) P.dust.push({ x: W / 2 + rand(-60, 60), y: H * .82, vx: rand(-120, 120), vy: rand(-160, -40), r: rand(6, 16), a: .6, c: '90,90,90' });
  if (P.hearts <= 0) { gameOver(); return; }
  if (P.crashes === 1 || Math.random() < .3) walkie('Gina, was that a crash? Is the car OK?', 'Ask about ME, ya prick.');
}
function update(dt) {
  const pz = P.z + PLAYERZ, ps = segAt(pz), pct = P.v / MAXV;
  if (__auto) autoDrive();
  // steering, with a hangover wobble and a tipsy wobble
  const steer = (keys.R ? 1 : 0) - (keys.L ? 1 : 0); P.st += (steer - P.st) * Math.min(1, dt * 9);
  const wob = P.hang * Math.sin(T * 1.7) * .25 + (P.tipsy > 0 ? Math.sin(T * 3.3) * .8 : 0);
  const dx = dt * 2.6 * Math.max(pct, .15);
  if (state === 'play') { P.x += dx * (P.st + wob * .5); P.x -= dx * pct * ps.curve * CENTRI; }
  const vmax = MAXV * (P.boost > 0 ? 1.28 : 1);
  if (state === 'play' && keys.G) P.v += ACC * dt * (1 - pct * .35);
  else if (state === 'play' && keys.B) P.v += BRK * dt;
  else P.v += (state === 'finish' ? BRK * .6 : DEC) * dt;
  if (Math.abs(P.x) > 1.05) {
    if (P.v > OFFMAX) P.v += OFFDEC * dt;
    if (P.v > 600 && Math.random() < .5) P.dust.push({ x: W / 2 + rand(-80, 80), y: H * .95, vx: rand(-60, 60), vy: rand(-90, -30), r: rand(4, 10), a: .5, c: ps.cf > .5 ? '140,110,70' : '170,170,170' });
    if (P.v > 3000 && Math.random() < dt * 1.2 && !P.said.off) { P.said.off = 1; walkie('Gina, the tracker says you\'re in a field.', 'Shortcut.'); }
  }
  if (Math.abs(P.x) > 2.1) { P.x = Math.sign(P.x) * 2.1; P.v = (P.v + Math.min(P.v, MAXV * .3)) / 2; if (P.scrapeT <= 0) { SFX.scrape(); P.scrapeT = .5; P.shake = .15; } }
  P.v = clamp(P.v, 0, vmax);
  P.z += P.v * dt;
  if (state === 'play') P.clock += dt * RATE;
  // timers
  P.inv = Math.max(0, P.inv - dt); P.shake = Math.max(0, P.shake - dt); P.boost = Math.max(0, P.boost - dt); P.grim = Math.max(0, P.grim - dt); P.scrapeT -= dt;
  P.cheer = Math.max(0, P.cheer - dt * 1.4); P.hang = Math.max(0, P.hang - dt * .006);
  if (P.tipsy > 0) { P.tipsy -= dt; if (P.tipsy <= 0) P.streak = 0; }
  P.skyX += dt * ps.curve * pct * .0016; P.hillX += dt * ps.curve * pct * 2.6;
  for (const f of P.fly) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 1500 * dt; f.r += f.vr * dt; f.t -= dt; } P.fly = P.fly.filter(f => f.t > 0 && f.y < H + 200);
  for (const d of P.dust) { d.x += d.vx * dt; d.y += d.vy * dt; d.a -= dt * .9; d.r += dt * 10; } P.dust = P.dust.filter(d => d.a > 0);
  for (const p of P.pops) { p.y -= dt * 60; p.t -= dt; } P.pops = P.pops.filter(p => p.t > 0);
  // moving things
  for (const t of things) {
    if (t.gone) continue; const dz = t.z - pz;
    if (t.v) t.z += t.v * dt;
    if (t.vx) { t.x += t.vx * dt; if (Math.abs(t.x) > 2.4) t.vx = 0; }
    if (t.k === 'actor' && dz < 9000 && dz > 300 && state === 'play') { const want = P.x - t.x; t.x += clamp(want, -1, 1) * dt * .5; }
  }
  if (state !== 'play') return;
  // collisions
  const i0 = Math.floor((pz - 120) / SEG), i1 = Math.floor((pz + 180) / SEG);
  for (let i = i0; i <= i1; i++) {
    const s = segs[i]; if (!s) continue;
    for (const o of s.spr) {
      if (!o.t || o.gone || Math.abs(o.x - P.x) > o.c + CARW) continue;
      if (o.t === 'pick') take(o);
      else if (o.t === 'bump') { o.gone = true; P.v *= .8; P.shake = .3; SFX.bump(); if (Math.random() < .5) say(pick(BUMP)); }
      else crash(o, false);
    }
  }
  for (const t of things) {
    if (t.gone || Math.abs(t.z - pz) > 200 || Math.abs(t.x - P.x) > t.c + CARW) continue;
    if (t.k === 'actor') hitActor(t);
    else if (t.k === 'sheep' || t.k === 'cow') { if (P.inv > 0 || P.tipsy > 0) { t.gone = true; flyAway(t.k, 1, t.x); SFX.thud(); } else { t.gone = true; flyAway(t.k, 1, t.x); crash(t, true); } }
    else crash(t, true);
  }
  // the Garda checkpoint
  const si = ps.i;
  if (si >= Z.g0 && si < Z.g1 && !P.fined && P.v / MAXV * 140 > 60) {
    P.fined = true; P.clock += 60; SFX.siren(); pop('+1 MIN', '#ff5277'); banner('GARDA CHECKPOINT', 'Fined. One minute lost.', 1.6);
    walkie('Slow down there, love. That\'s a fine.', 'Do you know who I am?!', 'Garda');
  }
  if (si === Z.g0 - 130 && !P.said.g) { P.said.g = 1; walkie('Gina, there\'s a Garda checkpoint on the back road. Slow down for once.', 'I never speed.'); }
  if (si >= Z.sub && !P.said.sub) { P.said.sub = 1; walkie('Gina, the tracker says you\'re leaving the city. Why are you leaving the city?', 'The set\'s in a FIELD, ya muppet.'); }
  if (si >= Z.country + 900 && !P.said.sheep) { P.said.sheep = 1; walkie('Gina, why is there a sheep on the tracker?', 'Babe. Don\'t.'); }
  if (si >= Z.set && !P.said.set) { P.said.set = 1; walkie('Gina, I can see you from base. Is that a glass of wine?', 'It\'s a smoothie.'); }
  if (si >= FIN) finish();
}
function take(o) {
  o.gone = true;
  if (o.k === 'bag') { P.bags++; P.picks++; P.streak = 0; SFX.ding(); lifeCheck(); }
  else if (o.k === 'wine') {
    P.wine++; P.picks++; P.streak++; SFX.clink(); lifeCheck();
    if (P.streak >= 3 && P.tipsy <= 0) { P.tipsy = 6; P.streak = 0; banner('TIPSY!', 'Nothing can stop her', 1.2); say(pick(TIPSY), true); }
    else say(pick(WINE));
  }
  else if (o.k === 'coffee') { P.boost = 3.5; P.hang = Math.max(0, P.hang - .45); SFX.slurp(); say(pick(COFFEE), true); pop('BOOST', '#8ff0d2'); }
  else if (o.k === 'pills') { P.hang = 0; SFX.ding(); say(pick(PILLS), true); pop('HEAD FIXED', '#9cc8ff'); }
}
function finish() {
  state = 'finish'; P.arrive = P.clock; P.fin = 0; SFX.screech(); music(false); keys.G = 0;
  const late = (P.arrive - CALL) / 60;
  banner(late <= 0 ? 'MADE IT!' : 'LATE!', `Arrived ${fmtClock(P.arrive)}`, 2);
}
function gameOver() {
  state = 'over'; music(false); engineOff(); SFX.sad();
  setTimeout(() => showResult(true), 1100);
}
function showResult(dead) {
  $('hud').hidden = true; $('pad').hidden = true; engineOff();
  const late = (P.arrive - CALL) / 60;
  let title, sub, stamp, wrap = false;
  if (dead) { title = pick(DEATH); sub = 'Gina never made it to set. The 1st AD is drafting her eulogy.'; stamp = 'CUT!'; }
  else if (late <= -3) { title = 'EARLY?! Who even are you?'; sub = 'The 1st AD fainted. Catering made you a fry.'; stamp = 'THAT\'S A WRAP'; wrap = true; }
  else if (late <= 0) { title = 'Made it. Barely.'; sub = 'Nobody needs to know about the field.'; stamp = 'THAT\'S A WRAP'; wrap = true; }
  else if (late < 2) { title = 'Just about late.'; sub = 'Walk in like you own the place.'; stamp = 'LATE'; }
  else if (late < 5) { title = 'The 1st AD is doing the slow clap.'; sub = `${Math.round(late)} minutes late. Bold.`; stamp = 'LATE'; }
  else if (late < 10) { title = 'The whole crew waited. Cheers, Gina.'; sub = `${Math.round(late)} minutes late.`; stamp = 'LATE'; }
  else { title = 'Docked a day\'s pay.'; sub = `${Math.round(late)} minutes late. Worth it.`; stamp = 'LATE'; }
  $('rTitle').textContent = title; $('rSub').textContent = sub;
  const st = $('rStamp'); st.textContent = stamp; st.classList.toggle('wrap', wrap); st.style.animation = 'none'; void st.offsetWidth; st.style.animation = '';
  $('rTime').textContent = dead ? '—' : fmtClock(P.arrive); $('rHits').textContent = P.hits; $('rBags').textContent = P.bags; $('rWine').textContent = P.wine;
  setFace($('rFace'), $('rFaceBox'), dead || late > 2 ? 'grimace' : LOOK);
  let note = '';
  if (!dead && !__cheated) {
    const d = P.arrive - CALL;
    if (save.best === null || d < save.best) { if (save.best !== null) note = 'New best arrival! '; save.best = d; }
  }
  if (!__cheated && P.hits > save.bestHits) { save.bestHits = P.hits; note += 'Most actors ever!'; }
  save.plays++; persist();
  $('rBest').textContent = note || (save.best !== null ? `Best arrival: ${fmtClock(CALL + save.best)} · Most actors: ${save.bestHits}` : '');
  $('result').hidden = false;
}

let __auto = false, __cheated = false;
function autoDrive() {
  keys.G = 1; keys.B = 0; const pz = P.z + PLAYERZ; let target = 0;
  const act = things.filter(t => t.k === 'actor' && !t.gone && t.z > pz && t.z - pz < 6000).sort((a, b) => a.z - b.z)[0];
  if (act) target = act.x;
  for (let i = Math.floor(pz / SEG); i < Math.floor(pz / SEG) + 14; i++) { const s = segs[i]; if (!s) break; for (const o of s.spr) if (o.t === 'haz' && !o.gone && Math.abs(o.x - target) < o.c + CARW + .1) target = o.x > 0 ? o.x - o.c - CARW - .2 : o.x + o.c + CARW + .2; }
  for (const t of things) if (t.solid && !t.gone && t.z > pz && t.z - pz < 3000 && Math.abs(t.x - target) < t.c + CARW + .1) target = t.x > 0 ? t.x - .9 : t.x + .9;
  target = clamp(target, -.9, .9); keys.L = P.x > target + .06 ? 1 : 0; keys.R = P.x < target - .06 ? 1 : 0;
}

let frameTimes = [];
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
  tick(dt);
}
function tick(dt) {
  if (!P || state === 'title' || state === 'intro') return;
  if (paused) return;
  frameTimes.push(dt); if (frameTimes.length > 90) { const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length; frameTimes = []; if (avg > 1 / 38 && !lowQ && DPR > 1) { lowQ = true; resize(); } }
  if (P.slow > 0) { P.slow -= dt; dt *= .3; }
  T += dt;
  if (state === 'count') { P.count -= dt; const n = Math.ceil(P.count); if (n !== P.cshow) { P.cshow = n; if (n > 0) { banner(String(n), null, .8); SFX.beep(); } else { banner('GO!', 'Call time 6:30', .9); tone(1400, 1400, .3, 'square', .08); state = 'play'; music(true); walkie('Gina, you\'re on the way, yeah? Call time\'s 6:30.', 'I\'m literally parking.'); } } }
  update(dt);
  if (state === 'play' || state === 'count') tickTalk(dt);
  if (state === 'finish') { P.fin += dt; if (P.fin > 2.4 && !P.shown) { P.shown = 1; showResult(false); } }
  engineSet(P.v / MAXV, state === 'play' || state === 'count' || state === 'finish');
  render(); hud();
}

/* ---------- start, pause, controls ---------- */
function startRun() {
  $('result').hidden = true; $('title').hidden = true; $('paused').hidden = true;
  P = newPlayer(); spawnObjects(); hudLast = {}; wQ = []; wT = 0; wNext = 9; sayT = 0; $('walkie').hidden = true; $('say').hidden = true;
  $('hud').hidden = false; $('pad').hidden = false; resize();
  state = 'count'; P.count = 3; P.cshow = 4; paused = false; engineOn();
}
function setPause(on) {
  if (!P || !(state === 'play' || state === 'count' || state === 'finish')) return;
  paused = on; $('paused').hidden = !on; music(!on && state === 'play'); if (eng) engineSet(0, !on);
  for (const k in keys) keys[k] = 0; document.querySelectorAll('.pb.down').forEach(b => b.classList.remove('down'));
}
function bindBtn(id, k) {
  const el = $(id);
  const on = e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) { } keys[k] = 1; el.classList.add('down'); ac(); };
  const off = () => { keys[k] = 0; el.classList.remove('down'); };
  el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off);
  el.addEventListener('contextmenu', e => e.preventDefault());
}
bindBtn('left', 'L'); bindBtn('right', 'R'); bindBtn('gas', 'G'); bindBtn('brk', 'B');
$('pauseBtn').onclick = () => setPause(true); $('resumeBtn').onclick = () => setPause(false);
$('restartBtn').onclick = () => { setPause(false); startRun(); };
$('hornBtn').onclick = () => { SFX.horn(); if (P && state === 'play') for (const t of things) if (t.k === 'actor' && !t.gone && t.z - (P.z + PLAYERZ) < 5000 && t.z > P.z) t.x += (t.x > P.x ? -.3 : .3); };
$('muteBtn').onclick = () => setMuted(!night.muted);
$('againBtn').onclick = () => { ac(); startRun(); };
$('bragBtn').onclick = () => {
  const late = Math.round((P.arrive - CALL) / 60), when = P.arrive ? fmtClock(P.arrive) : 'never';
  const s = `Gina's Morning After: arrived ${when}${P.arrive ? (late > 0 ? ` (${late} min late)` : ' (on time!)') : ''} and ran over ${P.hits} actors. Beat that: ${location.origin}${location.pathname}`;
  (navigator.clipboard ? navigator.clipboard.writeText(s) : Promise.reject()).then(() => toast('Copied. Paste it in the group chat.'), () => toast('Couldn\'t copy, sorry.'));
};
const KEYMAP = { ArrowLeft: 'L', KeyA: 'L', ArrowRight: 'R', KeyD: 'R', ArrowUp: 'G', KeyW: 'G', Space: 'G', ArrowDown: 'B', KeyS: 'B' };
addEventListener('keydown', e => {
  if (state === 'intro' && (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape')) { endIntro(); e.preventDefault(); return; }
  if (e.code === 'KeyP' || e.code === 'Escape') { setPause(!paused); return; }
  if (e.code === 'KeyH') { $('hornBtn').onclick(); return; }
  const k = KEYMAP[e.code]; if (k) { keys[k] = 1; e.preventDefault(); ac(); }
});
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys[k] = 0; });
document.addEventListener('visibilitychange', () => { if (document.hidden) setPause(true); });
addEventListener('resize', () => { resize(); sizeIntro(); });
setMuted(!!night.muted);

/* ---------- the opening: Gina wakes up late ---------- */
const icv = $('introCv'), ig = icv.getContext('2d');
let iT = 0, iLast = 0, iRaf = 0, iW = 390, iH = 700, iBeeps = 0, iCues = {};
const gb = document.createElement('canvas'); gb.width = 300; gb.height = 820; const gbx = gb.getContext('2d');
const BX = 12, BY = 40, HIPY = 462;
function ginaFront(ph, o = {}) {
  gbx.clearRect(0, 0, 300, 820);
  const bob = o.still ? 0 : -Math.abs(Math.sin(ph)) * 10, lift = s => 1 - .24 * Math.max(0, s);
  const leg = (img, sy, dx) => { if (!img) return; gbx.save(); gbx.translate(dx, BY + HIPY + bob * .4); gbx.scale(1, sy); gbx.drawImage(img, BX, 0); gbx.restore(); };
  if (!o.noLegs) { leg(IM.leg_l, lift(Math.sin(ph)), Math.sin(ph) * 3); leg(IM.leg_r, lift(Math.sin(ph + Math.PI)), -Math.sin(ph) * 3); }
  const head = o.head || (LOOK === 'own' ? null : LOOK), hImg = head && IM['head_' + head];
  gbx.save(); const px = BX + 112, py = BY + HIPY; gbx.translate(px, py + bob); gbx.rotate(Math.sin(ph) * .05); gbx.translate(-px, -py);
  const body = hImg ? IM.upper_headless : IM.upper_own; if (body) gbx.drawImage(body, BX, BY);
  gbx.translate(BX + 109.8, BY + 132);
  if (hImg) { const s = .74; gbx.save(); gbx.rotate(Math.sin(ph * 2) * .04); gbx.drawImage(hImg, -192 * s, -156 * s, 384 * s, 288 * s); gbx.restore(); }
  if (o.toast) { gbx.save(); gbx.translate(10, 34); gbx.rotate(.3); rr(gbx, -20, -15, 40, 30, 9, '#c98a3e'); rr(gbx, -16, -11, 32, 22, 6, '#f3d38a'); gbx.restore(); }
  gbx.restore(); return gb;
}
function sizeIntro() { if ($('intro').hidden) return; const d = Math.min(2, devicePixelRatio || 1); icv.width = innerWidth * d; icv.height = innerHeight * d; iW = innerWidth; iH = innerHeight; ig.setTransform(d, 0, 0, d, 0, 0); }
function startIntro() {
  state = 'intro'; ac(); $('intro').hidden = false; sizeIntro(); iT = 0; iLast = 0; iBeeps = 0; iCues = {};
  cancelAnimationFrame(iRaf); iRaf = requestAnimationFrame(introFrame);
}
function endIntro() { if (state !== 'intro') return; cancelAnimationFrame(iRaf); $('intro').hidden = true; save.introSeen = true; persist(); startRun(); }
$('skipIntro').onclick = e => { e.stopPropagation(); endIntro(); };
$('intro').addEventListener('pointerdown', e => { if (iT > .8 && e.target.id !== 'skipIntro') endIntro(); });
const cue = (k, t, fn) => { if (iT >= t && !iCues[k]) { iCues[k] = 1; fn(); } };
function caption(s, t0) {
  const n = Math.floor((iT - t0) * 34), shown = s.slice(0, Math.max(0, n)); if (!shown) return;
  ig.font = '600 18px Outfit'; const w = Math.min(iW - 32, 520), x = (iW - w) / 2, y = iH - 110;
  ig.fillStyle = 'rgba(10,6,12,.78)'; ig.fillRect(x, y, w, 56); ig.fillStyle = '#ff4fa3'; ig.fillRect(x, y, 4, 56);
  ig.fillStyle = '#fff6ee'; ig.textAlign = 'left'; wrapText(shown, x + 16, y + 24, w - 28, 22);
}
function wrapText(s, x, y, maxW, lh) { const words = s.split(' '); let line = '', yy = y; for (const w of words) { const t = line ? line + ' ' + w : w; if (ig.measureText(t).width > maxW && line) { ig.fillText(line, x, yy); line = w; yy += lh; } else line = t; } ig.fillText(line, x, yy); }
function introFrame(now) {
  iRaf = requestAnimationFrame(introFrame);
  const dt = Math.min(.05, (now - (iLast || now)) / 1000); iLast = now; iT += dt;
  drawIntro();
}
function drawIntro() {
  const c = ig, w = iW, h = iH, k = Math.min(w / 390, h / 700), cx = w / 2;
  c.save(); c.clearRect(0, 0, w, h);
  if (iT < 3.6) {
    // scene 1: dark bedroom, alarm going off
    if (iT < 3.4 && iT > iBeeps * .5) { iBeeps++; SFX.beep(); SFX.beep(.13); }
    c.fillStyle = lg(c, 0, 0, 0, h, '#14112a', '#231c3b'); c.fillRect(0, 0, w, h);
    c.save(); c.translate(cx, h / 2); c.scale(k, k); c.translate(-195, -350);
    c.fillStyle = lg(c, 0, 80, 0, 230, '#2a3a70', '#ff9a6b'); c.fillRect(230, 80, 130, 150); c.fillStyle = '#1a1530'; c.fillRect(292, 80, 6, 150); c.fillRect(230, 152, 130, 6);
    c.fillStyle = '#e0337a'; c.fillRect(214, 70, 26, 175); c.fillRect(350, 70, 26, 175);
    c.fillStyle = '#3a2440'; c.fillRect(90, 440, 310, 150); c.fillStyle = '#4a2a55'; c.fillRect(90, 420, 310, 30);
    rr(c, 100, 395, 120, 50, 22, '#f2eee8');
    const head = (LOOK === 'own' ? 'classic' : LOOK), hi = IM['head_' + head] || IM.head_classic;
    if (hi) { c.save(); c.translate(160, 410 + (iT > 2.6 ? Math.sin(iT * 40) * 2 : 0)); c.rotate(-1.25); c.drawImage(hi, -75, -56, 150, 112); c.restore(); }
    c.fillStyle = rg(c, 290, 470, 160, '#ff7ab5', '#b02a6b'); c.beginPath(); c.ellipse(290, 470, 150, 58, -.05, 0, 7); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 3; [[230, 450, 330, 500], [300, 440, 380, 470]].forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(a, b); c.quadraticCurveTo((a + d) / 2, b + 20, d, e); c.stroke(); });
    c.fillStyle = '#3a2a2a'; c.fillRect(0, 470, 86, 120);
    rr(c, 4, 418, 78, 50, 8, '#111'); c.strokeStyle = '#ff2244'; c.lineWidth = 2; c.strokeRect(8, 422, 70, 42);
    if (iT % .5 < .32) { c.save(); c.shadowColor = '#ff2244'; c.shadowBlur = 12; txt(c, '6:01', 43, 455, '26px Bungee', '#ff2244'); c.restore(); }
    c.save(); c.translate(60, 600); c.rotate(-1.2); rr(c, -10, -60, 20, 60, 6, '#2f6b4a'); rr(c, -4, -80, 8, 22, 2, '#2f6b4a'); c.restore();
    c.save(); c.translate(130, 620); c.rotate(1.35); rr(c, -10, -60, 20, 60, 6, '#7a1e2b'); rr(c, -4, -80, 8, 22, 2, '#7a1e2b'); c.restore();
    if (iT % .5 < .32) { txt(c, 'BEEP', 40 + Math.sin(iT * 9) * 4, 395, '18px Bungee', '#ff4fa3'); txt(c, 'BEEP', 120, 375, '14px Bungee', '#ff4fa3'); }
    if (iT < 2.4) txt(c, 'z z z', 230, 380 - (iT * 10 % 20), 'italic 22px Outfit', 'rgba(255,255,255,.6)');
    c.restore();
    caption('6:01 AM. Call time is 6:30.', .3);
  } else if (iT < 5.4) {
    // scene 2: OH FUCK
    cue('s2', 3.6, () => { SFX.scratch(); setTimeout(SFX.stab, 120); });
    const p = iT - 3.6, z = 1 + Math.min(.15, p * .3);
    c.fillStyle = rg(c, cx, h * .45, Math.max(w, h) * .8, '#ff4fa3', '#3a0820'); c.fillRect(0, 0, w, h);
    c.save(); c.globalAlpha = .25; for (let i = 0; i < 24; i++) { c.fillStyle = i % 2 ? '#fff' : 'transparent'; c.beginPath(); c.moveTo(cx, h * .42); const a1 = i / 24 * Math.PI * 2 + p * .3, a2 = a1 + Math.PI / 24; c.lineTo(cx + Math.cos(a1) * 2000, h * .42 + Math.sin(a1) * 2000); c.lineTo(cx + Math.cos(a2) * 2000, h * .42 + Math.sin(a2) * 2000); c.fill(); } c.restore();
    const hi = IM.head_grimace; if (hi) { c.save(); c.translate(cx + rand(-4, 4), h * .42 + rand(-4, 4)); c.scale(z * k * 1.5, z * k * 1.5); c.drawImage(hi, -192 * .74 * 1.1, -156 * .74 * 1.1, 384 * .74 * 1.1, 288 * .74 * 1.1); c.restore(); }
    c.save(); c.translate(cx, h * .78); c.rotate(-.06); c.scale(k, k); c.shadowColor = '#fff'; c.shadowBlur = 18; txt(c, 'OH FUCK.', 0, 0, '62px Bungee', '#fff'); c.restore();
  } else if (iT < 8.6) {
    // scene 3: out the front door, toast in her mouth
    const p = (iT - 5.4) / 3.2;
    c.fillStyle = lg(c, 0, 0, 0, h, '#9cc2ea', '#ffd8b0'); c.fillRect(0, 0, w, h);
    c.save(); c.translate(cx, h); c.scale(k, k);
    c.fillStyle = '#e8e0d0'; c.fillRect(-260, -700, 520, 560); c.fillStyle = '#6a3a2e'; c.fillRect(-280, -720, 560, 30);
    [[-200, -620], [110, -620], [-200, -420], [110, -420]].forEach(([x, y]) => { c.fillStyle = '#fff'; c.fillRect(x - 4, y - 4, 98, 98); c.fillStyle = lg(c, 0, y, 0, y + 90, '#a9c3d8', '#3f5466'); c.fillRect(x, y, 90, 90); });
    c.fillStyle = '#1a1214'; c.fillRect(-70, -420, 140, 280);
    c.save(); c.translate(-70, -420); c.transform(Math.max(.15, 1 - p * 3), -.2 * Math.min(1, p * 3), 0, 1, 0, 0); rr(c, 0, 0, 140, 280, 4, '#b3261e'); c.restore();
    c.fillStyle = '#8f8a82'; c.fillRect(-400, -140, 800, 140); c.fillStyle = '#a49f96'; c.fillRect(-120, -150, 240, 18);
    const sc = .26 + p * .5, img = ginaFront(iT * 13, { toast: true });
    c.drawImage(img, -150 * sc, -150 + 40 * p - 802 * sc, 300 * sc, 820 * sc);
    c.restore();
    for (let i = 0; i < 3; i++) txt(c, ['✨', '🔑', '💨'][i], cx + Math.sin(iT * 5 + i * 2) * 120 * k, h * .3 + i * 30, '24px serif', '#fff');
    caption('No shower. No coffee. No shame.', 5.6);
  } else if (iT < 11.8) {
    // scene 4: jumps in the car and takes off
    const p = iT - 8.6;
    c.fillStyle = lg(c, 0, 0, 0, h * .7, '#7aa6dc', '#ffd8b0'); c.fillRect(0, 0, w, h);
    const gy = h * .78;
    for (let i = -1; i < 4; i++) { const a = ART['house' + ((i + 4) % 4)]; if (a && a.img) c.drawImage(a.img, i * 230 * k - (p > 2 ? (p - 2) * 300 * k : 0), gy - 30 * k - a.h * k * .9, a.w * k * .9, a.h * k * .9); }
    c.fillStyle = '#9a968f'; c.fillRect(0, gy - 30 * k, w, 30 * k); c.fillStyle = '#5a5c62'; c.fillRect(0, gy, w, h - gy);
    c.fillStyle = 'rgba(255,255,255,.7)'; for (let x = -((p * 600) % 120); x < w; x += 120) c.fillRect(x, gy + 60 * k, 60 * k, 6 * k);
    let carX = cx; if (p > 2) carX = cx + Math.pow(p - 2, 2) * 380 * k;
    cue('s4', 10.6, () => SFX.screech());
    if (p > 2) for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(200,200,200,${.5 - i * .07})`; c.beginPath(); c.arc(carX - 170 * k - i * 30 * k, gy + 50 * k - i * 6 * k, (16 + i * 6) * k, 0, 7); c.fill(); }
    // Gina: jumps over the door, then sits
    const jump = clamp(p / 1.1, 0, 1), sx = lerp(cx - 190 * k, carX - 34 * k, jump), sy = lerp(gy - 10 * k, gy + 34 * k, jump) - Math.sin(jump * Math.PI) * 120 * k;
    const sc = .17 * k, img = ginaFront(p < 1.1 ? iT * 13 : 0, { still: p >= 1.1 });
    if (p >= .75) { c.save(); c.beginPath(); c.rect(0, 0, w, gy - 30 * k); c.clip(); }
    c.drawImage(img, sx - 150 * sc, sy - 802 * sc, 300 * sc, 820 * sc);
    if (p >= .75) c.restore();
    carSide(c, carX, gy + 40 * k, k * 1.1, iT);
    caption(p < 1.6 ? 'It\'s 6:07. The set is forty minutes away.' : 'Only one thing for it…', p < 1.6 ? 8.7 : 10.2);
  } else if (iT < 13.6) {
    cue('t', 11.8, () => SFX.stab());
    c.fillStyle = '#140b1c'; c.fillRect(0, 0, w, h);
    const fl = Math.random() < .08 && iT < 12.4 ? .3 : 1;
    c.save(); c.translate(cx, h * .42); c.scale(k, k); c.globalAlpha = fl; c.shadowColor = '#ff4fa3'; c.shadowBlur = 30;
    txt(c, 'THE MORNING', 0, 0, '46px Bungee', '#fff'); c.shadowColor = '#2fd9a6'; txt(c, 'AFTER', 0, 58, '54px Bungee', '#8ff0d2'); c.restore();
    c.globalAlpha = 1; txt(c, 'Hold GO. Run over the actors.', cx, h * .42 + 120 * k, '600 18px Outfit', '#c9b8c8');
  } else { c.restore(); endIntro(); return; }
  c.restore();
}

/* ---------- boot ---------- */
function showTitle() {
  state = 'title'; $('title').hidden = false;
  $('sBest').textContent = save.best === null ? '–' : fmtClock(CALL + save.best); $('sHits').textContent = save.bestHits;
}
$('rollBtn').onclick = () => { ac(); startIntro(); };
resize();
loading.then(() => { bake(DPR); buildTrack(); P = newPlayer(); spawnObjects(); render(); showTitle(); });
requestAnimationFrame(frame);
if (DEV) window.__ma = { get P() { return P; }, get state() { return state; }, Z: () => Z, FIN: () => FIN, jump(f) { P.z = f * FIN * SEG; }, auto(on) { __auto = on; __cheated = true; }, keys, things: () => things, endIntro,
  run(sec, step = 1 / 30) { for (let t = 0; t < sec; t += step) tick(step); },
  introAt(t) { if ($('intro').hidden) { state = 'intro'; $('intro').hidden = false; sizeIntro(); } cancelAnimationFrame(iRaf); iT = t; drawIntro(); } };
