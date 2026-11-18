// Score share cards (1080x1350) for both games, shared straight to WhatsApp etc. with the phone's share menu.
// Night Out: neon over the rainy street. The Morning After: neon over the morning sky.
const SITE = 'thespectrumtechengine.com/gina-game';
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
const rr = (g, x, y, w, h, r, c) => { g.fillStyle = c; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
function T(g, s, x, y, size, fam, c, maxW = 1000) { const w = fam.includes('Outfit') ? '800 ' : ''; let f = size; g.font = `${w}${f}px ${fam}`; while (g.measureText(s).width > maxW && f > 12) { f -= 2; g.font = `${w}${f}px ${fam}`; } g.fillStyle = c; g.textAlign = 'center'; g.fillText(s, x, y); }
function face(g, img, own, x, y, r, ring) {
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = '#2a1a33'; g.fill(); g.clip();
  if (img) { if (own) g.drawImage(img, 58, 22, 160, 160, x - r, y - r, r * 2, r * 2); else { const s = img.height * .8; g.drawImage(img, (img.width - s) / 2, img.height * .05, s, s, x - r, y - r, r * 2, r * 2); } }
  g.restore(); g.lineWidth = 14; g.strokeStyle = ring; g.shadowColor = ring; g.shadowBlur = 40; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.shadowBlur = 0;
}
function stamp(g, s, x, y, col, size) { g.save(); g.translate(x, y); g.rotate(-.12); g.font = `${size}px Bungee`; const w = g.measureText(s).width + 60; g.strokeStyle = col; g.lineWidth = 10; g.strokeRect(-w / 2, -size * .95, w, size * 1.3); g.fillStyle = col; g.textAlign = 'center'; g.fillText(s, 0, size * .12); g.restore(); }
function stats(g, y, items) { const w = 300, gap = 24, x0 = 540 - (items.length * w + (items.length - 1) * gap) / 2; items.forEach(([v, l], i) => { const x = x0 + i * (w + gap); rr(g, x, y, w, 150, 28, 'rgba(255,255,255,.12)'); T(g, String(v), x + w / 2, y + 82, 64, 'Bungee', '#fff', w - 30); T(g, l, x + w / 2, y + 126, 26, '"Outfit"', '#8ff0d2', w - 30); }); }
function clapStripe(g) { for (let i = 0; i < 40; i++) { g.fillStyle = i % 2 ? '#141414' : '#f4f0e8'; g.beginPath(); g.moveTo(i * 60 - 40, 40); g.lineTo(i * 60 + 20, 40); g.lineTo(i * 60 + 60, 0); g.lineTo(i * 60, 0); g.fill(); } }

// o: { mode:'night'|'morning', look, big, sub, stats:[[value,label],...], line, stamp, stampCol }
export async function makeCard(o) {
  await Promise.all(['64px Bungee', '40px "Permanent Marker"', '800 30px Outfit'].map(f => document.fonts.load(f).catch(() => { })));
  const own = o.look === 'own';
  const [head, bg] = await Promise.all([
    loadImg(own ? 'assets/gina/upper_own.png' : `assets/gina/head_${o.look}.png`),
    loadImg(o.mode === 'night' ? 'assets/hdri/street_4k.jpg' : 'assets/hdri/morning_sky.jpg'),
  ]);
  const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350; const g = cv.getContext('2d');
  g.fillStyle = '#140b1c'; g.fillRect(0, 0, 1080, 1350);
  const night = o.mode === 'night', accent = night ? '#ff4fa3' : '#8ff0d2';
  if (night) {
    if (bg) g.drawImage(bg, bg.width * .35, bg.height * .3, bg.width * .18, bg.height * .4, 0, 0, 1080, 1350);
    g.fillStyle = 'rgba(12,6,10,.62)'; g.fillRect(0, 0, 1080, 1350); clapStripe(g);
    g.shadowColor = '#ff4fa3'; g.shadowBlur = 40; T(g, 'GINA\'S', 540, 170, 96, 'Bungee', '#fff'); T(g, 'BIG NIGHT', 540, 265, 84, 'Bungee', '#8ff0d2'); g.shadowBlur = 0;
    face(g, head, own, 540, 480, 165, accent);
    if (o.stamp) stamp(g, o.stamp, 540, 735, o.stampCol || '#ffc56b', 64);
    T(g, o.big, 540, 890, 130, 'Bungee', '#fff'); T(g, o.sub, 540, 945, 34, '"Outfit"', '#ffc56b');
  } else {
    if (bg) g.drawImage(bg, bg.width * .05, 0, bg.width * .16, bg.height * .4, 0, 0, 1080, 980);
    const gr = g.createLinearGradient(0, 520, 0, 1350); gr.addColorStop(0, 'rgba(20,11,28,0)'); gr.addColorStop(.4, 'rgba(20,11,28,.9)'); gr.addColorStop(1, '#140b1c'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1350);
    g.fillStyle = 'rgba(20,11,28,.22)'; g.fillRect(0, 0, 1080, 520);
    g.shadowColor = '#ff4fa3'; g.shadowBlur = 40; T(g, 'THE MORNING', 540, 150, 92, 'Bungee', '#fff'); g.shadowColor = '#2fd9a6'; T(g, 'AFTER', 540, 250, 100, 'Bungee', '#8ff0d2'); g.shadowBlur = 0;
    face(g, head, own, 540, 460, 150, accent);
    rr(g, 390, 630, 300, 74, 10, '#fff'); g.strokeStyle = '#222'; g.lineWidth = 4; g.strokeRect(390, 630, 300, 74); T(g, 'GINA 1', 540, 688, 54, 'Bungee', '#111');
    T(g, 'ARRIVED', 540, 790, 34, '"Outfit"', '#c9b8c8');
    T(g, o.big, 540, 905, 124, 'Bungee', '#ff5277'); T(g, o.sub, 540, 960, 34, '"Outfit"', '#8ff0d2');
    if (o.stamp) stamp(g, o.stamp, 850, 600, o.stampCol || '#ffc56b', 54);
  }
  stats(g, night ? 990 : 1000, o.stats);
  if (o.line) T(g, `"${o.line}"`, 540, 1218, 46, '"Permanent Marker"', '#ff9fcb', 980);
  rr(g, 0, 1262, 1080, 88, 0, accent); T(g, `Beat that ➜ ${SITE}`, 540, 1318, 34, '"Outfit"', night ? '#2a0b22' : '#05261a');
  return new Promise(r => cv.toBlob(r, 'image/jpeg', .9));
}

// Make the card as soon as the results show (so the Share tap is instant), share it on tap.
let pending = null;
export function prepareCard(o) { pending = { o, blob: makeCard(o) }; }
export async function shareCard(toast) {
  if (!pending) return;
  const blob = await pending.blob, text = `${pending.o.text} https://${SITE}/`;
  const file = new File([blob], 'gina-score.jpg', { type: 'image/jpeg' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], text }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'gina-score.jpg'; document.body.append(a); a.click(); a.remove();
  try { await navigator.clipboard.writeText(text); toast && toast('Card saved and score copied. Send them in the group chat!'); } catch (e) { toast && toast('Card saved. Send it in the group chat!'); }
}
