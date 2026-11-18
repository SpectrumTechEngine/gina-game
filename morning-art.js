// The Morning After: every picture is drawn here in code.
// Each ART entry is drawn once into its own small canvas (cached), anchored at the bottom centre,
// in "units" where the road is 480 units wide close to the car.

const rg = (c, x, y, r, c1, c2) => { const q = c.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r); q.addColorStop(0, c1); q.addColorStop(1, c2); return q; };
const lg = (c, x1, y1, x2, y2, ...st) => { const q = c.createLinearGradient(x1, y1, x2, y2); st.forEach((s, i) => q.addColorStop(i / (st.length - 1), s)); return q; };
const ell = (c, x, y, rx, ry, col, a = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, a, 0, 7); c.fill(); };
const rr = (c, x, y, w, h, r, col) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };
const shadow = (c, w, a = .28) => ell(c, 0, -2, w, w * .14, `rgba(0,0,0,${a})`);
const glow = (c, x, y, r, col) => { c.save(); c.globalCompositeOperation = 'lighter'; const q = c.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, col); q.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = q; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); };
const txt = (c, s, x, y, font, col, align = 'center') => { c.font = font; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'alphabetic'; c.fillText(s, x, y); };
const fitTxt = (c, s, x, y, maxW, size, fam, col) => { let f = size; c.font = `${f}px ${fam}`; while (c.measureText(s).width > maxW && f > 6) { f -= 1; c.font = `${f}px ${fam}`; } txt(c, s, x, y, `${f}px ${fam}`, col); };
let seed = 7; const R = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

const SHOPS = [
  ['CHIPPER', '#2f6b4a', '#f4e3b5'], ['BOOKIES', '#1d3f73', '#ffd23f'], ['OFF LICENCE', '#7a1e2b', '#f6e7c8'], ['LAUNDERETTE', '#3c7f8f', '#ffffff'],
  ['THE DRUNKEN DUCK', '#1f4d2b', '#e8c66a'], ['BARBER', '#222', '#e33'], ['CAFE', '#c25a2b', '#fff3e0'], ['PHARMACY', '#127a4e', '#ffffff'],
  ['KEBAB HOUSE', '#b3261e', '#ffe08a'], ['PAWN SHOP', '#5a3f73', '#ffcf4a'], ['TANNING', '#e0337a', '#fff'], ['NAIL BAR', '#ff7ab5', '#2a0b22'],
];
const WALLS = ['#c9b79c', '#b45a3c', '#e9dcc3', '#7d95a8', '#d9a441', '#9c4a5a', '#e3c9a8', '#6f8a5c', '#c3c7cc', '#8a5a44'];

function facade(c, k) {
  const wall = WALLS[k % WALLS.length], [name, sc, tc] = SHOPS[k % SHOPS.length], w = 270, h = 330;
  shadow(c, 140, .2);
  c.fillStyle = lg(c, -w / 2, 0, w / 2, 0, wall, shade(wall, -.18)); c.fillRect(-w / 2, -h, w, h);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-w / 2, -h, w, 8); // parapet
  for (let f = 0; f < 2; f++) for (let i = 0; i < 3; i++) {
    const x = -w / 2 + 30 + i * 80, y = -h + 30 + f * 85, lit = R() < .35;
    c.fillStyle = '#efe9df'; c.fillRect(x - 4, y - 4, 58, 66);
    c.fillStyle = lit ? lg(c, 0, y, 0, y + 58, '#ffe6a8', '#f2b25c') : lg(c, 0, y, 0, y + 58, '#9fb8cf', '#3c4f63'); c.fillRect(x, y, 50, 58);
    c.fillStyle = '#efe9df'; c.fillRect(x, y + 27, 50, 4); c.fillRect(x + 23, y, 4, 58);
    c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 18, y); c.lineTo(x, y + 22); c.fill();
  }
  // shop front
  c.fillStyle = sc; c.fillRect(-w / 2 + 6, -112, w - 12, 112);
  c.fillStyle = shade(sc, -.3); c.fillRect(-w / 2 + 6, -112, w - 12, 6);
  fitTxt(c, name, 0, -82, w - 40, 22, 'Bungee', tc);
  c.fillStyle = lg(c, 0, -70, 0, 0, '#9cc0d8', '#2d3d4c'); c.fillRect(-w / 2 + 18, -66, 150, 60);
  c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(-w / 2 + 18, -66); c.lineTo(-w / 2 + 70, -66); c.lineTo(-w / 2 + 30, -6); c.lineTo(-w / 2 + 18, -6); c.fill();
  c.fillStyle = shade(sc, -.45); c.fillRect(w / 2 - 82, -70, 56, 70);
  ell(c, w / 2 - 34, -34, 3, 3, '#e8c66a');
}
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const t = f < 0 ? 0 : 255, p = Math.abs(f); r = Math.round(r + (t - r) * p); g = Math.round(g + (t - g) * p); b = Math.round(b + (t - b) * p); return `rgb(${r},${g},${b})`; }

function house(c, k) {
  const w = 250, h = 150, wall = ['#e8e0d0', '#d8cfc0', '#efe6d6', '#cfc4b4'][k % 4];
  shadow(c, 130, .2);
  c.fillStyle = lg(c, 0, -h, 0, 0, wall, shade(wall, -.12)); c.fillRect(-w / 2, -h, w, h);
  c.fillStyle = lg(c, 0, -h - 70, 0, -h, '#6a3a2e', '#4a261e'); c.beginPath(); c.moveTo(-w / 2 - 12, -h); c.lineTo(-w / 2 + 40, -h - 70); c.lineTo(w / 2 - 40, -h - 70); c.lineTo(w / 2 + 12, -h); c.fill();
  rr(c, w / 2 - 70, -h - 92, 18, 30, 2, '#7a6a5e');
  [[-80, -128], [30, -128], [-80, -62]].forEach(([x, y]) => { c.fillStyle = '#fff'; c.fillRect(x - 3, y - 3, 56, 46); c.fillStyle = lg(c, 0, y, 0, y + 40, '#a9c3d8', '#3f5466'); c.fillRect(x, y, 50, 40); c.fillStyle = '#fff'; c.fillRect(x + 24, y, 3, 40); });
  rr(c, 40, -78, 44, 78, 3, ['#b3261e', '#1d3f73', '#2f6b4a', '#e0a23a'][k % 4]);
  c.fillStyle = '#8f8a82'; c.fillRect(-w / 2 - 10, -26, w + 20, 26); c.fillStyle = '#a49f96'; c.fillRect(-w / 2 - 10, -28, w + 20, 6);
}
function hedge(c) { shadow(c, 60, .22); for (let i = -1; i <= 1; i++) { const bx = i * 28, by = -26 - (i == 0 ? 8 : 0), r = 28; c.fillStyle = rg(c, bx, by, r, '#7cc05e', '#2c6a2e'); c.beginPath(); c.arc(bx, by, r, 0, 7); c.fill(); } }
function tree(c) {
  shadow(c, 42, .22); c.fillStyle = lg(c, -6, 0, 6, 0, '#7a5232', '#4a301c'); c.beginPath(); c.moveTo(-7, 0); c.lineTo(-3, -80); c.lineTo(3, -80); c.lineTo(7, 0); c.fill();
  [[0, -105, 38], [-30, -86, 30], [30, -88, 30], [-14, -132, 28], [16, -126, 28]].forEach(([x, y, r]) => { c.fillStyle = rg(c, x, y, r, '#86c66a', '#2a6430'); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); });
}
function pole(c) { c.fillStyle = lg(c, -5, 0, 5, 0, '#6b4a30', '#3e2a1a'); c.fillRect(-4, -230, 8, 230); c.fillStyle = '#4a3220'; c.fillRect(-26, -214, 52, 6); ['#ddd', '#ddd', '#ddd'].forEach((col, i) => ell(c, -20 + i * 20, -218, 3, 4, col)); }
function lamp(c) {
  c.fillStyle = lg(c, -4, 0, 4, 0, '#5d636b', '#2f343a'); c.fillRect(-4, -240, 8, 240); c.fillRect(-6, -14, 12, 14);
  c.strokeStyle = '#3f444b'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, -236); c.quadraticCurveTo(0, -252, -40, -250); c.stroke();
  rr(c, -62, -254, 30, 10, 4, '#2f343a'); ell(c, -47, -243, 13, 4, '#fff3c8'); glow(c, -47, -240, 30, 'rgba(255,230,160,.45)');
}
function lights(c) {
  c.fillStyle = '#2f343a'; c.fillRect(-4, -200, 8, 200); rr(c, -16, -262, 32, 76, 8, '#1b1d20');
  ['#3a0c0c', '#3a2c08', '#2ee86a'].forEach((col, i) => { ell(c, 0, -248 + i * 24, 9, 9, col); });
  glow(c, 0, -200, 26, 'rgba(60,255,120,.55)');
}
function bin(c) { shadow(c, 24, .3); c.fillStyle = lg(c, -20, 0, 20, 0, '#3c8c46', '#1d5a26'); c.beginPath(); c.moveTo(-20, -60); c.lineTo(20, -60); c.lineTo(17, -4); c.lineTo(-17, -4); c.fill(); rr(c, -23, -66, 46, 8, 3, '#2a7034'); ell(c, -12, -3, 6, 6, '#111'); ell(c, 12, -3, 6, 6, '#111'); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(-14, -54, 5, 44); }
function cone(c, x, s = 1) { c.fillStyle = lg(c, x - 12 * s, 0, x + 12 * s, 0, '#ff8a2a', '#d4520e'); c.beginPath(); c.moveTo(x - 4 * s, -46 * s); c.lineTo(x + 4 * s, -46 * s); c.lineTo(x + 13 * s, -6 * s); c.lineTo(x - 13 * s, -6 * s); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x - 7 * s, -30 * s); c.lineTo(x + 7 * s, -30 * s); c.lineTo(x + 9 * s, -22 * s); c.lineTo(x - 9 * s, -22 * s); c.fill(); rr(c, x - 17 * s, -7 * s, 34 * s, 7 * s, 2, '#222'); }
function cones(c) { shadow(c, 50, .25); cone(c, -30, .9); cone(c, 30, .9); cone(c, 0, 1.1); }
function barrier(c) {
  shadow(c, 80, .28); c.fillStyle = '#ddd'; c.fillRect(-64, -46, 6, 46); c.fillRect(58, -46, 6, 46);
  c.save(); c.beginPath(); c.rect(-76, -62, 152, 26); c.clip(); for (let i = -8; i < 10; i++) { c.fillStyle = i % 2 ? '#e8282c' : '#fff'; c.beginPath(); c.moveTo(-76 + i * 18, -36); c.lineTo(-76 + i * 18 + 18, -36); c.lineTo(-76 + i * 18 + 34, -62); c.lineTo(-76 + i * 18 + 16, -62); c.fill(); } c.restore();
  c.strokeStyle = '#333'; c.lineWidth = 1.5; c.strokeRect(-76, -62, 152, 26); ell(c, 0, -70, 7, 7, '#ffb21a'); glow(c, 0, -70, 22, 'rgba(255,180,40,.7)');
}
function skip(c) { shadow(c, 86, .3); c.fillStyle = lg(c, 0, -70, 0, 0, '#ffd21a', '#c99a00'); c.beginPath(); c.moveTo(-84, -64); c.lineTo(84, -64); c.lineTo(66, -4); c.lineTo(-66, -4); c.fill(); [[-50, -70, 20], [-10, -76, 26], [34, -72, 22], [60, -66, 14]].forEach(([x, y, r]) => ell(c, x, y, r, r * .6, ['#8a7d70', '#6f655a', '#a39282', '#5d544b'][Math.abs(x) % 4])); rr(c, -40, -82, 50, 8, 2, '#c49a6c'); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-60, -40, 120, 4); }
function pcar(c, col) {
  shadow(c, 96, .38); rr(c, -92, -30, 26, 30, 6, '#111'); rr(c, 66, -30, 26, 30, 6, '#111');
  c.fillStyle = lg(c, 0, -112, 0, 0, shade(col, .25), col, shade(col, -.35)); c.beginPath(); c.moveTo(-90, -14); c.lineTo(-86, -64); c.lineTo(-60, -106); c.lineTo(60, -106); c.lineTo(86, -64); c.lineTo(90, -14); c.closePath(); c.fill();
  c.fillStyle = lg(c, 0, -100, 0, -68, '#9cb6cc', '#2b3a48'); c.beginPath(); c.moveTo(-74, -68); c.lineTo(-54, -100); c.lineTo(54, -100); c.lineTo(74, -68); c.fill();
  rr(c, -82, -56, 34, 12, 4, '#d8202c'); rr(c, 48, -56, 34, 12, 4, '#d8202c'); rr(c, -26, -40, 52, 15, 3, '#f2f2f2');
}
function bale(c) { shadow(c, 38, .3); ell(c, 0, -32, 34, 32, rg(c, 0, -32, 34, '#f3d77a', '#b58a2c')); c.strokeStyle = 'rgba(120,80,20,.5)'; c.lineWidth = 2; for (let r = 6; r < 32; r += 7) { c.beginPath(); c.arc(0, -32, r, 0, 6); c.stroke(); } }
function pothole(c) { ell(c, 0, -8, 44, 9, '#2f3236'); ell(c, -4, -9, 34, 6, lg(c, -30, 0, 30, 0, '#8fb3d6', '#cfe2f2')); }
function tractor(c, col) {
  shadow(c, 60, .4); const dk = shade(col, -.45);
  c.fillStyle = lg(c, 0, -80, 0, 0, shade(col, .2), dk); c.beginPath(); c.roundRect(-34, -66, 68, 44, 7); c.fill();
  rr(c, -28, -116, 56, 52, 5, '#222');
  c.fillStyle = lg(c, 0, -112, 0, -70, '#bfe3ff', '#6aa0c8'); c.fillRect(-23, -111, 46, 42);
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-23, -111); c.lineTo(-6, -111); c.lineTo(-23, -86); c.fill();
  ell(c, 0, -94, 9, 10, '#d9a684'); rr(c, -9, -108, 18, 6, 2, '#2b3f2a'); // farmer
  [-1, 1].forEach(k => { c.fillStyle = lg(c, 0, -54, 0, 0, '#3a3a3a', '#111'); c.beginPath(); c.roundRect(k * 44 - 13, -54, 26, 54, 7); c.fill(); ell(c, k * 44, -27, 6, 6, '#f2c200'); });
  rr(c, -8, -76, 16, 6, 2, '#ddd'); glow(c, 0, -124, 22, 'rgba(255,170,40,.9)'); ell(c, 0, -122, 5, 5, '#ff9a1a');
}
function sheep(c) { shadow(c, 26, .25); c.fillStyle = '#2a2a2a';[-12, -4, 6, 14].forEach(dx => c.fillRect(dx, -12, 3.5, 12)); [[-12, -22], [0, -26], [12, -22], [-6, -14], [7, -14], [0, -18]].forEach(([dx, dy]) => { c.fillStyle = rg(c, dx, dy, 12, '#ffffff', '#cfcac0'); c.beginPath(); c.arc(dx, dy, 12, 0, 7); c.fill(); }); ell(c, 22, -24, 7, 9, '#2b2626', .3); ell(c, 18, -30, 3, 5, '#2b2626', -.6); }
function cow(c) {
  shadow(c, 54, .25); c.fillStyle = '#2a2420';[-38, -24, 22, 36].forEach(x => c.fillRect(x, -26, 7, 26));
  ell(c, 0, -46, 50, 26, '#f3efe8'); [[-20, -54, 16, 12], [16, -40, 14, 10], [26, -58, 10, 8], [-30, -36, 9, 7]].forEach(([x, y, a, b]) => ell(c, x, y, a, b, '#1d1b1a'));
  ell(c, 52, -58, 14, 18, '#1d1b1a', .2); ell(c, 58, -46, 9, 7, '#e7b3a8'); ell(c, 44, -74, 6, 3, '#1d1b1a', -.5); c.fillStyle = '#ffd21a'; c.fillRect(42, -72, 5, 7);
}
function farmhouse(c) {
  const w = 260; shadow(c, 140, .2); c.fillStyle = lg(c, 0, -110, 0, 0, '#f6f3ea', '#d7d1c4'); c.fillRect(-w / 2, -110, w, 110);
  c.fillStyle = lg(c, 0, -170, 0, -110, '#4f5862', '#2f363d'); c.beginPath(); c.moveTo(-w / 2 - 10, -110); c.lineTo(-w / 2 + 30, -170); c.lineTo(w / 2 - 30, -170); c.lineTo(w / 2 + 10, -110); c.fill();
  rr(c, -70, -196, 20, 30, 2, '#cfc8bc'); rr(c, 60, -196, 20, 30, 2, '#cfc8bc');
  [-90, -30, 50].forEach(x => { c.fillStyle = '#1d3f73'; c.fillRect(x - 3, -88, 46, 44); c.fillStyle = lg(c, 0, -85, 0, -47, '#b6cfe2', '#4c6274'); c.fillRect(x, -85, 40, 38); });
  rr(c, 104, -70, 22, 70, 2, '#b3261e');
  c.fillStyle = 'rgba(230,230,230,.6)';[0, 1, 2].forEach(i => ell(c, -60 + i * 8, -206 - i * 16, 10 + i * 4, 7 + i * 3, 'rgba(235,235,235,.55)'));
}
function barn(c) {
  shadow(c, 120, .2); c.fillStyle = lg(c, 0, -150, 0, 0, '#c2362b', '#7c1f17'); c.beginPath(); c.moveTo(-110, 0); c.lineTo(-110, -100); c.quadraticCurveTo(0, -170, 110, -100); c.lineTo(110, 0); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 2; for (let x = -100; x < 110; x += 14) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, -130); c.stroke(); }
  c.fillStyle = '#3a2418'; c.fillRect(-40, -80, 80, 80); c.strokeStyle = '#f6efe2'; c.lineWidth = 4; c.strokeRect(-40, -80, 80, 80); c.beginPath(); c.moveTo(-40, -80); c.lineTo(40, 0); c.moveTo(40, -80); c.lineTo(-40, 0); c.stroke();
}
function bales(c) { shadow(c, 90, .2);[[-50, 0], [0, 0], [50, 0], [-25, -1], [25, -1]].forEach(([x, row], i) => { const y = row ? -86 : -32; ell(c, x, y, 30, 30, rg(c, x, y, 30, '#f3d77a', '#b58a2c')); }); }
function gate(c) { c.fillStyle = '#9aa3ab'; c.fillRect(-60, -56, 6, 56); c.fillRect(54, -56, 6, 56); c.strokeStyle = '#c9d0d6'; c.lineWidth = 4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-56, -50 + i * 13); c.lineTo(56, -50 + i * 13); c.stroke(); } c.beginPath(); c.moveTo(-56, -10); c.lineTo(56, -50); c.stroke(); }
function wall(c) { c.fillStyle = '#8f8a80'; c.fillRect(-70, -34, 140, 34); for (let i = 0; i < 14; i++) ell(c, -64 + (i % 7) * 21 + (i > 6 ? 10 : 0), -8 - (i > 6 ? 16 : 0), 11, 8, ['#a39d92', '#7f796f', '#b4ada1'][i % 3]); }
function gardaCar(c) {
  shadow(c, 96, .38); rr(c, -92, -30, 26, 30, 6, '#111'); rr(c, 66, -30, 26, 30, 6, '#111');
  c.fillStyle = lg(c, 0, -112, 0, 0, '#ffffff', '#dfe3e8', '#9aa3ab'); c.beginPath(); c.moveTo(-90, -14); c.lineTo(-86, -64); c.lineTo(-60, -106); c.lineTo(60, -106); c.lineTo(86, -64); c.lineTo(90, -14); c.closePath(); c.fill();
  for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? '#ffd21a' : '#1c3fa8'; c.fillRect(-88 + i * 19.5, -50, 19.5, 14); }
  c.fillStyle = lg(c, 0, -100, 0, -68, '#9cb6cc', '#2b3a48'); c.beginPath(); c.moveTo(-74, -68); c.lineTo(-54, -100); c.lineTo(54, -100); c.lineTo(74, -68); c.fill();
  rr(c, -40, -118, 80, 12, 4, '#222'); ell(c, -22, -112, 14, 5, '#2b6bff'); ell(c, 22, -112, 14, 5, '#2b6bff'); glow(c, -22, -112, 30, 'rgba(60,120,255,.9)'); glow(c, 22, -112, 30, 'rgba(60,120,255,.7)');
  txt(c, 'GARDA', 0, -22, '15px Bungee', '#1c3fa8');
}
function garda(c) {
  shadow(c, 22, .3); c.fillStyle = '#1b2235'; c.fillRect(-11, -70, 9, 70); c.fillRect(2, -70, 9, 70);
  c.fillStyle = lg(c, -20, 0, 20, 0, '#e8ff3a', '#b9cc12'); c.beginPath(); c.roundRect(-20, -128, 40, 64, 9); c.fill(); c.fillStyle = '#c9c9c9'; c.fillRect(-20, -96, 40, 5); c.fillRect(-20, -80, 40, 5);
  c.strokeStyle = '#d9ef22'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(16, -120); c.lineTo(34, -150); c.stroke(); ell(c, 35, -154, 6, 6, '#f0c8a8');
  ell(c, 0, -142, 13, 14, rg(c, 0, -142, 14, '#f8d8bc', '#d8a684')); rr(c, -16, -162, 32, 10, 3, '#1b2235'); rr(c, -19, -154, 38, 4, 2, '#111');
}
function sign(c, kind) {
  c.fillStyle = '#8a8f94'; c.fillRect(-3, -120, 6, 120);
  if (kind === 'slow') { ell(c, 0, -150, 36, 36, '#fff'); c.strokeStyle = '#d8202c'; c.lineWidth = 9; c.beginPath(); c.arc(0, -150, 31, 0, 7); c.stroke(); txt(c, '50', 0, -139, '28px Bungee', '#111'); return; }
  if (kind === 'cow') { c.save(); c.translate(0, -150); c.rotate(Math.PI / 4); rr(c, -30, -30, 60, 60, 6, '#111'); rr(c, -26, -26, 52, 52, 5, '#ffd21a'); c.restore(); c.font = '30px serif'; c.textAlign = 'center'; c.fillText('🐄', 0, -140); return; }
  if (kind === 'bend') { rr(c, -50, -170, 100, 44, 4, '#fff'); c.fillStyle = '#111'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-34 + i * 26, -164); c.lineTo(-18 + i * 26, -148); c.lineTo(-34 + i * 26, -132); c.lineTo(-26 + i * 26, -132); c.lineTo(-10 + i * 26, -148); c.lineTo(-26 + i * 26, -164); c.fill(); } return; }
  const boards = {
    garda: ['#1c3fa8', '#fff', ['GARDA', 'CHECKPOINT', 'AHEAD']],
    bye: ['#127a4e', '#fff', ['YOU ARE NOW', 'LEAVING THE CITY', 'GOOD LUCK']],
    farm: ['#127a4e', '#fff', ['COUNTRY ROADS', 'MIND THE COWS', 'AND THE FARMERS']],
    unit: ['#ffd21a', '#111', ['GBN  ➜', 'UNIT BASE']],
    late: ['#ffd21a', '#111', ['GBN  ➜', 'NEARLY THERE']],
  }[kind];
  const [bg, fg, lines] = boards, h = 30 + lines.length * 26;
  c.fillStyle = '#8a8f94'; c.fillRect(-46, -120, 6, 120); c.fillRect(40, -120, 6, 120);
  rr(c, -78, -120 - h, 156, h, 8, '#fff'); rr(c, -74, -116 - h, 148, h - 8, 6, bg);
  lines.forEach((l, i) => fitTxt(c, l, 0, -120 - h + 34 + i * 26, 136, 20, 'Bungee', fg));
}
function trailer(c, k) {
  const label = ['LEAD 1', 'MAKE-UP', 'HONEYWAGON', 'COSTUME', 'LEAD 2', 'PRODUCTION'][k % 6], w = 270;
  shadow(c, 140, .25); rr(c, -w / 2, -150, w, 136, 18, lg(c, 0, -150, 0, 0, '#ffffff', '#d9dde2'));
  c.fillStyle = '#e0337a'; c.fillRect(-w / 2, -60, w, 8); c.fillStyle = '#5a3f73'; c.fillRect(-w / 2, -50, w, 4);
  [-100, -40].forEach(x => { c.fillStyle = lg(c, 0, -126, 0, -84, '#9cb6cc', '#2b3a48'); c.fillRect(x, -126, 46, 40); });
  rr(c, 40, -124, 48, 110, 4, '#c9cfd6'); rr(c, 46, -118, 36, 26, 3, '#fff'); fitTxt(c, label, 64, -100, 34, 9, 'Bungee', '#111');
  ell(c, -90, -12, 18, 18, '#111'); ell(c, -50, -12, 18, 18, '#111');
  rr(c, -36, -28, 30, 8, 2, '#999');
}
function catering(c) {
  const w = 250; shadow(c, 130, .25); rr(c, -w / 2, -160, w, 146, 10, lg(c, 0, -160, 0, 0, '#f6f3ea', '#cfc8bc'));
  c.save(); c.beginPath(); c.rect(-w / 2 - 10, -126, w + 20, 26); c.clip(); for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#e0337a' : '#fff'; c.fillRect(-w / 2 - 10 + i * 18, -126, 18, 26); } c.restore();
  c.fillStyle = '#3a2a20'; c.fillRect(-90, -98, 180, 54); c.fillStyle = '#ffd88a'; c.fillRect(-84, -92, 168, 42);
  txt(c, 'CATERING', 0, -134, '20px Bungee', '#5a3f73'); txt(c, 'FRY UP 6AM', 0, -64, '14px Bungee', '#3a2a20');
  ell(c, -80, -12, 18, 18, '#111'); ell(c, 80, -12, 18, 18, '#111');
}
function lightTower(c) { c.fillStyle = '#4a4f55'; c.fillRect(-4, -270, 8, 250); rr(c, -30, -24, 60, 24, 4, '#ffd21a'); rr(c, -36, -292, 72, 30, 4, '#222');[-22, 0, 22].forEach(x => { ell(c, x, -277, 9, 9, '#fff9e0'); }); glow(c, 0, -277, 60, 'rgba(255,250,220,.6)'); }
function tent(c) { shadow(c, 110, .2); c.fillStyle = lg(c, 0, -130, 0, 0, '#ffffff', '#d6dbe0'); c.beginPath(); c.moveTo(-100, 0); c.lineTo(-100, -70); c.lineTo(-50, -126); c.lineTo(50, -126); c.lineTo(100, -70); c.lineTo(100, 0); c.fill(); c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(-40, -70, 80, 70); txt(c, 'EXTRAS HOLDING', 0, -84, '12px Bungee', '#5a3f73'); }
function arch(c) {
  [-262, 250].forEach(x => { c.fillStyle = lg(c, x, 0, x + 12, 0, '#eee', '#999'); c.fillRect(x, -300, 12, 300); });
  rr(c, -276, -320, 552, 92, 10, '#141414');
  c.save(); c.beginPath(); c.rect(-276, -320, 552, 22); c.clip(); for (let i = 0; i < 32; i++) { c.fillStyle = i % 2 ? '#141414' : '#f4f0e8'; c.beginPath(); c.moveTo(-276 + i * 24, -298); c.lineTo(-276 + i * 24 + 24, -298); c.lineTo(-276 + i * 24 + 40, -320); c.lineTo(-276 + i * 24 + 16, -320); c.fill(); } c.restore();
  txt(c, 'UNIT BASE', 0, -258, '40px Bungee', '#ffc56b'); txt(c, 'CALL TIME 6:30 · NO EXCUSES', 0, -236, '14px Outfit', '#f4f0e8');
  c.font = '800 14px Outfit';
}

// actors: luvvies in jumpers, scarves, berets, round glasses
const OUTFITS = [['#f0b62e', '#b8800e', '#2aa39c', '#9a1d3c', 'beret'], ['#2aa39c', '#16716b', '#c9a227', '#5a3620', 'bun'], ['#8e2a3e', '#5c1626', '#e8d8b0', '#2b2b2b', 'beret']];
function actor(c, k, frame) {
  const [j1, j2, sc, hat, style] = OUTFITS[k], st = frame ? 6 : -6;
  shadow(c, 26, .4);
  c.fillStyle = '#2b2d3a'; c.save(); c.translate(-6, -52); c.rotate(st * .02); c.beginPath(); c.roundRect(-5, 0, 10, 50, 3); c.fill(); c.restore();
  c.save(); c.translate(6, -52); c.rotate(-st * .02); c.beginPath(); c.roundRect(-5, 0, 10, 50, 3); c.fill(); c.restore();
  ell(c, -7 - st * .5, -3, 8, 4, '#5a3a24'); ell(c, 7 + st * .5, -3, 8, 4, '#5a3a24');
  c.fillStyle = lg(c, -20, 0, 20, 0, j1, j2); c.beginPath(); c.roundRect(-20, -106, 40, 58, 11); c.fill();
  c.strokeStyle = j2; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(-16, -98); c.quadraticCurveTo(-27, -76, -22, -56 + st); c.stroke();
  c.beginPath(); c.moveTo(16, -98); c.quadraticCurveTo(32, -112, 36, -130); c.stroke(); ell(c, 36, -133, 5.5, 5.5, '#f0c8a8');
  rr(c, 31, -150, 10, 17, 2, '#16161c'); ell(c, 36, -141, 3, 5, 'rgba(120,200,255,.5)');
  c.fillStyle = lg(c, 0, -112, 0, -50, sc, shade(sc, -.35)); rr(c, -18, -112, 36, 11, 5, c.fillStyle); rr(c, 4, -106, 11, 56, 4, c.fillStyle);
  ell(c, 0, -126, 15, 15, rg(c, 0, -126, 16, '#f8d8bc', '#d8a684'));
  c.fillStyle = '#5a3620'; c.beginPath(); c.moveTo(-14, -124); c.quadraticCurveTo(0, -100, 14, -124); c.quadraticCurveTo(0, -116, -14, -124); c.fill();
  c.strokeStyle = '#18181c'; c.lineWidth = 1.8; c.beginPath(); c.arc(-6, -129, 4.6, 0, 7); c.moveTo(10.6, -129); c.arc(6, -129, 4.6, 0, 7); c.moveTo(-1.4, -129); c.lineTo(1.4, -129); c.stroke();
  if (style === 'beret') { ell(c, -2, -141, 18, 7.5, lg(c, 0, -149, 0, -134, hat, shade(hat, -.4)), -.18); c.fillStyle = shade(hat, -.4); c.fillRect(-1, -151, 2, 5); }
  else { ell(c, 0, -138, 15, 8, hat); ell(c, 0, -150, 8, 8, hat); }
}

// pickups
function bag(c) { glow(c, 0, -30, 34, 'rgba(255,255,255,.55)'); c.fillStyle = 'rgba(235,240,248,.85)'; c.beginPath(); c.roundRect(-17, -54, 34, 46, 5); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-14, -26); c.quadraticCurveTo(0, -34, 14, -26); c.lineTo(14, -12); c.lineTo(-14, -12); c.fill(); rr(c, -17, -54, 34, 6, 2, '#e8282c'); c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(-12, -46, 3, 14); }
function wine(c) {
  glow(c, 0, -40, 40, 'rgba(255,80,150,.6)');
  c.fillStyle = 'rgba(220,235,255,.35)'; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-15, -70); c.bezierCurveTo(-17, -42, 17, -42, 15, -70); c.fill(); c.stroke();
  c.fillStyle = lg(c, 0, -57, 0, -42, '#c3123f', '#6a0620'); c.beginPath(); c.moveTo(-15.5, -57); c.bezierCurveTo(-16, -42, 16, -42, 15.5, -57); c.fill();
  c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(-1.2, -45, 2.4, 32); ell(c, 0, -13, 12, 3, 'rgba(255,255,255,.9)'); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(-10, -66, 2.4, 11);
}
function coffee(c) {
  glow(c, 0, -36, 38, 'rgba(80,255,200,.5)');
  c.fillStyle = lg(c, -14, 0, 14, 0, '#ffffff', '#d6d0c8'); c.beginPath(); c.moveTo(-14, -56); c.lineTo(14, -56); c.lineTo(10, -4); c.lineTo(-10, -4); c.fill();
  c.fillStyle = lg(c, -14, 0, 14, 0, '#b07a46', '#7a4c26'); c.fillRect(-12.6, -38, 25.2, 15); rr(c, -16, -63, 32, 8, 3, '#3a2a20');
  c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-3, -68); c.bezierCurveTo(-10, -76, 4, -80, -3, -90); c.stroke();
}
function pills(c) { glow(c, 0, -22, 34, 'rgba(120,180,255,.6)'); rr(c, -26, -40, 52, 34, 4, lg(c, 0, -40, 0, -6, '#ffffff', '#dfe6ee')); c.fillStyle = '#1c5fd0'; c.fillRect(-26, -30, 52, 10); txt(c, 'PARA', 0, -21.5, '9px Bungee', '#fff'); }

// Gina's convertible from behind (body only; Gina is drawn live on top)
function carRear(c) {
  const w = 118, y = 0;
  shadow(c, w + 16, .5);
  c.fillStyle = lg(c, 0, -30, 0, 8, '#2c2c2c', '#0a0a0a'); c.beginPath(); c.roundRect(-w - 2, -30, 34, 34, 8); c.roundRect(w - 32, -30, 34, 34, 8); c.fill();
  c.fillStyle = lg(c, 0, -92, 0, 0, '#e7ebef', '#aab1b8', '#7d858d', '#4f565d');
  c.beginPath(); c.moveTo(-w, -12); c.quadraticCurveTo(-w - 4, -60, -w + 10, -84); c.lineTo(w - 10, -84); c.quadraticCurveTo(w + 4, -60, w, -12); c.quadraticCurveTo(0, 0, -w, -12); c.fill();
  c.fillStyle = lg(c, 0, -96, 0, -76, '#f4f6f8', '#b7bec5'); c.beginPath(); c.moveTo(-w + 10, -84); c.quadraticCurveTo(0, -96, w - 10, -84); c.lineTo(w - 14, -76); c.quadraticCurveTo(0, -86, -w + 14, -76); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-w + 16, -66); c.quadraticCurveTo(0, -72, w - 16, -66); c.stroke();
  [-1, 1].forEach(k => { c.save(); c.shadowColor = '#ff2a2a'; c.shadowBlur = 14; c.fillStyle = lg(c, 0, -62, 0, -46, '#ff6a5a', '#b80f18'); c.beginPath(); c.roundRect(k < 0 ? -w + 6 : w - 50, -62, 44, 15, 6); c.fill(); c.restore(); });
  c.fillStyle = lg(c, 0, -44, 0, -24, '#ffffff', '#e2e2e2'); c.beginPath(); c.roundRect(-36, -46, 72, 22, 4); c.fill(); c.strokeStyle = '#333'; c.lineWidth = 1; c.stroke();
  txt(c, 'GINA 1', 0, -29, '15px Bungee', '#111');
  [-80, -66].forEach(x => { ell(c, x, -14, 6, 6, rg(c, x, -14, 7, '#f4f4f4', '#5c5c5c')); ell(c, x, -14, 3.5, 3.5, '#111'); });
  c.fillStyle = lg(c, 0, -122, 0, -90, '#3a2422', '#1a0f0e'); c.beginPath(); c.roundRect(-w + 18, -104, 2 * w - 36, 18, 8); c.fill();
  c.fillStyle = rg(c, -48, -116, 18, '#4a302c', '#1e1210'); c.beginPath(); c.roundRect(-66, -130, 36, 30, 10); c.fill();
}

// side view of the car for the opening
export function carSide(c, x, y, s, t = 0) {
  c.save(); c.translate(x, y); c.scale(-s, s); // nose to the right
  ell(c, 0, 0, 150, 12, 'rgba(0,0,0,.35)');
  c.fillStyle = lg(c, 0, -80, 0, -10, '#eef1f4', '#9aa1a8', '#5b6168');
  c.beginPath(); c.moveTo(-150, -22); c.quadraticCurveTo(-156, -58, -130, -62); c.lineTo(-40, -66); c.lineTo(10, -92); c.lineTo(22, -92); c.lineTo(0, -66); c.lineTo(126, -60); c.quadraticCurveTo(156, -54, 152, -22); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-130, -50); c.lineTo(130, -48); c.stroke();
  rr(c, 136, -54, 14, 10, 3, '#ff3a3a'); rr(c, -152, -52, 12, 10, 3, '#fff6c8');
  rr(c, -60, -76, 60, 12, 5, '#2a1a18');
  [-96, 96].forEach(wx => { const r = 26; ell(c, wx, -20, r, r, '#111'); ell(c, wx, -20, r * .55, r * .55, rg(c, wx, -20, r * .6, '#e8e8e8', '#7a7a7a')); c.strokeStyle = '#333'; c.lineWidth = 3; c.beginPath(); c.moveTo(wx + Math.cos(t * 20) * 12, -20 + Math.sin(t * 20) * 12); c.lineTo(wx - Math.cos(t * 20) * 12, -20 - Math.sin(t * 20) * 12); c.stroke(); });
  c.restore();
}

export const ART = {
  hedge: { w: 120, h: 70, draw: hedge }, tree: { w: 130, h: 175, draw: tree }, pole: { w: 60, h: 235, draw: pole }, lamp: { w: 140, h: 262, draw: lamp },
  lights: { w: 60, h: 270, draw: lights }, bin: { w: 52, h: 70, draw: bin }, cones: { w: 100, h: 54, draw: cones }, barrier: { w: 160, h: 100, draw: barrier },
  skip: { w: 180, h: 92, draw: skip }, bale: { w: 72, h: 68, draw: bale }, pothole: { w: 96, h: 20, draw: pothole }, sheep: { w: 70, h: 44, draw: sheep },
  cow: { w: 140, h: 86, draw: cow }, farmhouse: { w: 290, h: 220, draw: farmhouse, res: 1.6 }, barn: { w: 240, h: 150, draw: barn, res: 1.6 }, bales: { w: 170, h: 120, draw: bales },
  gate: { w: 130, h: 60, draw: gate }, wall: { w: 150, h: 40, draw: wall }, gardaCar: { w: 200, h: 140, draw: gardaCar }, garda: { w: 80, h: 170, draw: garda },
  trailerC: { w: 290, h: 160, draw: c => catering(c) }, light: { w: 140, h: 300, draw: lightTower }, tent: { w: 220, h: 135, draw: tent }, arch: { w: 570, h: 330, draw: arch, res: 1.6 },
  bag: { w: 60, h: 64, draw: bag }, wine: { w: 80, h: 84, draw: wine }, coffee: { w: 76, h: 96, draw: coffee }, pills: { w: 70, h: 60, draw: pills },
  car: { w: 290, h: 140, draw: carRear, res: 2.4 },
};
['slow', 'cow', 'bend', 'garda', 'bye', 'farm', 'unit', 'late'].forEach(k => ART['s_' + k] = { w: 170, h: 200, draw: c => sign(c, k) });
for (let k = 0; k < 12; k++) ART['facade' + k] = { w: 280, h: 340, draw: c => facade(c, k), res: 1.5 };
for (let k = 0; k < 4; k++) ART['house' + k] = { w: 290, h: 250, draw: c => house(c, k), res: 1.5 };
for (let k = 0; k < 6; k++) ART['trailer' + k] = { w: 290, h: 160, draw: c => trailer(c, k), res: 1.5 };
['#c62020', '#2b7a3a'].forEach((col, i) => ART['tractor' + i] = { w: 140, h: 140, draw: c => tractor(c, col) });
['#b3261e', '#1d4f9a', '#e9e9e9', '#2b2b2b', '#6a8a3a'].forEach((col, i) => ART['pcar' + i] = { w: 200, h: 120, draw: c => pcar(c, col) });
for (let k = 0; k < 3; k++) for (let f = 0; f < 2; f++) ART[`actor${k}_${f}`] = { w: 100, h: 160, draw: c => actor(c, k, f) };

// draw every picture once into its own canvas
export function bake(dpr) {
  for (const k in ART) {
    const a = ART[k], res = (a.res || 2.2) * Math.min(dpr, 1.5) / 1.5 * 1.25;
    const cv = document.createElement('canvas'); cv.width = Math.ceil(a.w * res); cv.height = Math.ceil(a.h * res);
    const c = cv.getContext('2d'); c.translate(cv.width / 2, cv.height); c.scale(res, res); seed = 7 + k.length * 31 + k.charCodeAt(k.length - 1);
    a.draw(c); a.img = cv;
  }
}

// Gina from behind in the driver's seat (right-hand drive), drawn live so her hair blows
export function ginaRear(c, x, y, s, t, o) {
  const gx = x + 46 * s, gy = y - 104 * s;
  c.save(); c.translate(gx, gy); c.scale(s, s); c.rotate(o.lean || 0);
  rr(c, -26, -14, 52, 20, 10, '#c8102e');
  c.fillStyle = lg(c, -24, 0, 24, 0, '#f0c8a8', '#d9a888'); c.beginPath(); c.ellipse(0, -14, 24, 9, 0, Math.PI, 0); c.fill();
  // arm with the wine glass, waving more when tipsy or celebrating
  const wave = Math.sin(t * (o.tipsy ? 9 : 3)) * (o.tipsy ? .35 : .08) + (o.cheer > 0 ? -.4 * Math.sin(o.cheer * Math.PI) : 0);
  c.save(); c.translate(-20, -16); c.rotate(wave);
  c.strokeStyle = '#e9bf9f'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-20, -24, -16, -56); c.stroke();
  ell(c, -16, -58, 6, 6, '#e9bf9f');
  if (o.glass) {
    c.fillStyle = 'rgba(220,235,255,.5)'; c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-26, -88); c.bezierCurveTo(-27, -70, -5, -70, -6, -88); c.fill(); c.stroke();
    c.fillStyle = '#a3102f'; c.beginPath(); c.moveTo(-26.5, -79); c.bezierCurveTo(-26, -70, -6, -70, -5.5, -79); c.fill();
    c.strokeStyle = '#fff'; c.beginPath(); c.moveTo(-16, -72); c.lineTo(-16, -61); c.stroke();
  }
  c.restore();
  // hair: long blonde waves blowing back in the wind
  const hair = (dx, dy, rx, ry, a, c1, c2) => { c.fillStyle = rg(c, dx, dy, Math.max(rx, ry), c1, c2); c.beginPath(); c.ellipse(dx, dy, rx, ry, a, 0, 7); c.fill(); };
  hair(0, -38, 21, 25, 0, '#fbe7a6', '#c99a3e');
  hair(0, -16, 23, 15, 0, '#f2d585', '#b98a34');
  const sp = o.speed || 0;
  for (let i = 0; i < 9; i++) {
    const yy = -44 + i * 4.2, fl = Math.sin(t * 14 + i * 1.7) * 3 * (.3 + sp), len = (22 + (i * 7 % 13)) * (.55 + .6 * sp);
    c.strokeStyle = ['#f7de92', '#d8ad52', '#fbe9b0', '#c99a3e'][i % 4]; c.lineWidth = 4.5 - (i % 3);
    c.beginPath(); c.moveTo(-12 + i * 2.6, yy); c.bezierCurveTo(-6 + i * 2, yy + 10, -2 + i, yy + 14 + fl, -4 + i * 1.5, yy + 18 + len * .4 + fl);
    c.quadraticCurveTo(-2 + i, yy + 22 + len * .6, 2 + i * 1.2, yy + 20 + len * .7 + fl); c.stroke();
  }
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(6, -50, 6, 11, -.4, 0, 7); c.fill();
  c.restore();
}
export { lg, rg, ell, rr, txt, glow, shade };
