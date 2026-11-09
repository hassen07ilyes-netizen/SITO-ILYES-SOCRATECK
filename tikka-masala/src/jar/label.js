// Canvas-generated textures for the jar: wrap-around label, lid side, lid top.
// Everything is drawn in code so the jar works fully offline.

export const C = {
  orange: '#E8500A',
  mustard: '#FFC21A',
  magenta: '#D4156B',
  dark: '#1A0E08',
  cream: '#FFF1DC',
  gold: '#E7B547',
  red: '#C8102E',
};

const DISPLAY = '"Anton", Impact, "Arial Narrow", sans-serif';
const SANS = '"Inter Variable", "Inter", system-ui, sans-serif';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

/** The 8-point "Ghar & Garam" seal: a star rosette with the G&G monogram. */
export function drawSeal(ctx, x, y, R, { fill = C.gold, ink = C.dark, ring = true } = {}) {
  ctx.save();
  ctx.translate(x, y);
  // star rosette
  ctx.beginPath();
  const pts = 16;
  for (let i = 0; i <= pts * 2; i++) {
    const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? R * 0.88 : R;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (ring) {
    ctx.lineWidth = R * 0.03;
    ctx.strokeStyle = ink;
    ctx.beginPath(); ctx.arc(0, 0, R * 0.74, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${R * 0.62}px ${DISPLAY}`;
  ctx.fillText('G&G', 0, R * 0.04);
  ctx.font = `600 ${R * 0.12}px ${SANS}`;
  ctx.fillText('EST. 1987', 0, R * 0.5);
  // tiny chili accents
  ctx.font = `${R * 0.14}px ${DISPLAY}`;
  ctx.fillText('★', 0, -R * 0.5);
  ctx.restore();
}

function leafMotif(ctx, x, y, s, a, color) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -40); ctx.quadraticCurveTo(22, -8, 0, 40); ctx.quadraticCurveTo(-22, -8, 0, -40);
  ctx.moveTo(0, -34); ctx.lineTo(0, 52);
  ctx.stroke();
  ctx.restore();
}

/** Wrap-around label. u = 0.5 faces the camera at rotation 0. */
export function makeLabel() {
  const W = 2048, H = 900;
  const [c, ctx] = canvas(W, H);

  // base
  ctx.fillStyle = C.magenta;
  ctx.fillRect(0, 0, W, H);

  // tone-on-tone leaf pattern
  for (let y = 40; y < H; y += 110) {
    for (let x = (y / 110) % 2 ? 30 : 90; x < W; x += 120) {
      leafMotif(ctx, x, y, 0.7, (x + y) % 3 - 1, 'rgba(0,0,0,.10)');
    }
  }

  // cream top + bottom bands with a scalloped edge
  const band = (y0, h, down) => {
    ctx.fillStyle = C.cream;
    ctx.fillRect(0, y0, W, h);
    ctx.beginPath();
    const yy = down ? y0 + h : y0;
    for (let x = 0; x <= W; x += 32) ctx.arc(x + 16, yy, 16, 0, Math.PI, !down);
    ctx.fill();
  };
  band(0, 120, true);
  band(H - 110, 110, false);

  // gold hairlines
  ctx.strokeStyle = C.gold; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, 162); ctx.lineTo(W, 162); ctx.moveTo(0, H - 152); ctx.lineTo(W, H - 152); ctx.stroke();

  // band text, repeated around — squeezed so it tiles seamlessly at the u=0/1 seam
  ctx.fillStyle = C.dark;
  ctx.textBaseline = 'middle';
  const ribbon = (text, y, size) => {
    ctx.font = `600 ${size}px ${SANS}`;
    const w = ctx.measureText(text).width;
    const n = Math.max(1, Math.round(W / w));
    ctx.save();
    ctx.scale(W / (n * w), 1);
    for (let i = 0; i < n; i++) ctx.fillText(text, i * w, y);
    ctx.restore();
  };
  ribbon('   SMALL BATCH  ✦  SLOW COOKED  ✦  BENGALURU  ✦  NO PRESERVATIVES  ✦', 58, 34);
  ribbon('   NET WT 350 g  ·  12.3 oz  ·  SERVES 4  ·  ', H - 50, 30);

  // FRONT PANEL (centre = W/2)
  const cx = W / 2;
  drawSeal(ctx, cx, 270, 92);

  ctx.textAlign = 'center';
  ctx.fillStyle = C.cream;
  ctx.font = `600 34px ${SANS}`;
  ctx.fillText('G H A R  &  G A R A M', cx, 395);

  ctx.fillStyle = C.mustard;
  ctx.font = `236px ${DISPLAY}`;
  ctx.textBaseline = 'alphabetic';
  // slight shadow for depth
  ctx.save();
  ctx.fillStyle = 'rgba(26,14,8,.35)';
  ctx.fillText('TIKKA', cx + 8, 625 + 8);
  ctx.restore();
  ctx.fillText('TIKKA', cx, 625);

  // MASALA on an orange ribbon
  ctx.fillStyle = C.orange;
  ctx.beginPath();
  ctx.moveTo(cx - 330, 650); ctx.lineTo(cx + 330, 650); ctx.lineTo(cx + 300, 700); ctx.lineTo(cx + 330, 750);
  ctx.lineTo(cx - 330, 750); ctx.lineTo(cx - 300, 700); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.cream;
  ctx.font = `92px ${DISPLAY}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('MASALA', cx, 703);

  // heat meter on the right of the front
  ctx.font = `600 26px ${SANS}`;
  ctx.fillStyle = C.cream;
  ctx.fillText('HEAT', cx + 470, 520);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(cx + 430 + i * 40, 565, 13, 0, Math.PI * 2);
    ctx.fillStyle = i < 2 ? C.mustard : 'rgba(255,241,220,.25)';
    ctx.fill();
  }
  ctx.fillStyle = C.cream;
  ctx.fillText('SIMMER', cx - 470, 520);
  ctx.fillText('SAUCE', cx - 470, 560);

  // BACK: ingredients block (wraps around the seam at u=0 / u=1)
  const back = (bx) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = C.mustard;
    ctx.font = `64px ${DISPLAY}`;
    ctx.fillText('WHAT’S INSIDE', bx, 260);
    ctx.fillStyle = C.cream;
    ctx.font = `500 26px ${SANS}`;
    const lines = [
      'Vine tomatoes, onion, double cream,',
      'ginger, garlic, Kashmiri chilli,',
      'garam masala, fenugreek leaves,',
      'cumin, coriander, turmeric, salt.',
      '',
      'Simmer 400 g chicken or paneer',
      'for 15 minutes. That’s dinner.',
    ];
    lines.forEach((l, i) => ctx.fillText(l, bx, 320 + i * 40));
  };
  back(W - 470);
  back(-470 + 30); // right side of the back, past the seam

  return c;
}

/** Lid side: black with fine knurling, a red rim band and a gold hairline. */
export function makeLidSide() {
  const W = 1024, H = 128;
  const [c, ctx] = canvas(W, H);
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 8) {
    ctx.fillStyle = 'rgba(255,255,255,.07)';
    ctx.fillRect(x, 0, 3, H);
  }
  ctx.fillStyle = C.red;
  ctx.fillRect(0, H - 34, W, 34);
  ctx.fillStyle = C.gold;
  ctx.fillRect(0, H - 40, W, 6);
  ctx.fillRect(0, 0, W, 5);
  return c;
}

/** Lid top: black disc, red outer ring, gold seal + wordmark. */
export function makeLidTop() {
  const S = 1024;
  const [c, ctx] = canvas(S, S);
  const m = S / 2;
  ctx.fillStyle = C.red;
  ctx.fillRect(0, 0, S, S);
  ctx.beginPath(); ctx.arc(m, m, S * 0.455, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
  ctx.beginPath(); ctx.arc(m, m, S * 0.445, 0, Math.PI * 2); ctx.fillStyle = '#0d0d0d'; ctx.fill();

  // subtle radial sheen
  const g = ctx.createRadialGradient(m * 0.7, m * 0.6, 10, m, m, S * 0.5);
  g.addColorStop(0, 'rgba(255,255,255,.10)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(m, m, S * 0.445, 0, Math.PI * 2); ctx.fill();

  // circular text
  ctx.fillStyle = C.gold;
  ctx.font = `600 34px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const txt = 'GHAR & GARAM ✦ TIKKA MASALA ✦ HANDMADE IN SMALL BATCHES ✦ ';
  const R = S * 0.38;
  const step = (Math.PI * 2) / txt.length;
  for (let i = 0; i < txt.length; i++) {
    const a = i * step - Math.PI / 2;
    ctx.save();
    ctx.translate(m + Math.cos(a) * R, m + Math.sin(a) * R);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(txt[i], 0, 0);
    ctx.restore();
  }
  ctx.strokeStyle = C.gold; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(m, m, S * 0.33, 0, Math.PI * 2); ctx.stroke();

  drawSeal(ctx, m, m, S * 0.24, { fill: C.gold, ink: '#0d0d0d' });
  return c;
}
