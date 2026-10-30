const K = 0.45, PK = 0.64;
const hero = (i, x, y, w, h, o = {}) => ({ src: `hero/${i}`, x, y, w: w * K, h: h * K, z: 20, ...o });
const pk = (i, x, y, w, h, o = {}) => ({ src: `pk/${i}`, x, y, w: w * PK, h: h * PK, z: 20, ...o });
const tl = (src, x, y, w, h, o = {}) => ({ src, x, y, w, h, anchor: 'tl', ...o });
let gid = 0;
// stand-in gear (code-drawn, to be replaced by a painted sheet)
function gearSvg(n, rot = 0, rust = true, pegs = 0) {
  const id = 'g' + gid++; const R = 96, r = 80, pts = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, da = (Math.PI * 2) / n;
    for (const [a, rr] of [[a0, r], [a0 + da * 0.12, R], [a0 + da * 0.42, R], [a0 + da * 0.54, r]]) pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
  }
  const holes = Array.from({ length: 5 }, (_, i) => { const a = (i / 5) * 360; return `<path transform="rotate(${a})" d="M 26 -14 L 60 -30 A 66 66 0 0 1 60 30 L 26 14 Z" fill="#0f1116" stroke="#08090c" stroke-width="2.5" stroke-linejoin="round"/>`; }).join('');
  const rivets = Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return `<circle cx="${(Math.cos(a) * 71).toFixed(1)}" cy="${(Math.sin(a) * 71).toFixed(1)}" r="2.6" fill="#8d8f96" stroke="#1a1b20" stroke-width="1"/>`; }).join('');
  return `<svg viewBox="-100 -100 200 200" width="100%" height="100%"><defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#7c818c"/><stop offset=".55" stop-color="#4a4e58"/><stop offset="1" stop-color="#2a2c33"/></radialGradient></defs><g transform="rotate(${rot})"><polygon points="${pts.join(' ')}" fill="url(#${id})" stroke="#15161a" stroke-width="3.5" stroke-linejoin="round"/>${rust ? `<path d="M -60 40 q 20 -8 34 6 q -14 18 -34 -6" fill="#7a3f22" opacity=".35"/><path d="M 40 -66 q 16 2 20 14 q -14 4 -20 -14" fill="#7a3f22" opacity=".3"/>` : ''}${holes}${rivets}${Array.from({ length: pegs }, (_, i) => { const a = (i / pegs) * Math.PI * 2 + 0.3; const x = Math.cos(a) * 76, y = Math.sin(a) * 76; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5" fill="#8a6a3c" stroke="#1a1208" stroke-width="2.2"/><circle cx="${(x - 1.5).toFixed(1)}" cy="${(y - 1.5).toFixed(1)}" r="2" fill="#d8b47a"/>`; }).join('')}<circle r="24" fill="#3a3d45" stroke="#15161a" stroke-width="3"/><circle r="11" fill="#1a1b20"/><path d="M -70 -40 A 80 80 0 0 1 -20 -78" stroke="#a9adb6" stroke-width="3" fill="none" opacity=".45"/></g></svg>`;
}
const gear = (x, y, d, n, rot, o = {}) => ({ svg: gearSvg(n, rot, true, o.pegs ?? 0), x, y: y + d / 2, w: d, h: d, z: 3, ...o }); // x,y = centre
const weightSvg = `<svg viewBox="0 0 100 110" width="100%" height="100%"><defs><linearGradient id="wg" x1="0" x2="1"><stop offset="0" stop-color="#2c2e35"/><stop offset=".35" stop-color="#6b6f79"/><stop offset="1" stop-color="#25272d"/></linearGradient></defs><circle cx="50" cy="16" r="11" fill="none" stroke="#1b1c21" stroke-width="9"/><circle cx="50" cy="16" r="11" fill="none" stroke="#5a5d66" stroke-width="5"/><path d="M 22 30 L 78 30 L 92 104 L 8 104 Z" fill="url(#wg)" stroke="#121317" stroke-width="4" stroke-linejoin="round"/><path d="M 40 60 l 4 -10 l 3 10 l 3 -12 l 3 12 l 3 -10 l 4 10 q -10 14 -20 0" fill="#7a2a22" stroke="#2a0e0b" stroke-width="2"/><circle cx="20" cy="94" r="2.5" fill="#9a9ca3"/><circle cx="80" cy="94" r="2.5" fill="#9a9ca3"/></svg>`;
const weight = (x, y, w = 56, o = {}) => ({ svg: weightSvg, x, y, w, h: w * 1.1, z: 22, ...o });
const pendSvg = (deg) => `<svg viewBox="-160 0 320 400" width="100%" height="100%"><g transform="rotate(${deg} 0 10)"><rect x="-5" y="10" width="10" height="300" fill="#3d4049" stroke="#121317" stroke-width="3"/><circle cy="10" r="12" fill="#4a4e58" stroke="#121317" stroke-width="3"/><circle cy="320" r="44" fill="#565a64" stroke="#121317" stroke-width="4"/><circle cy="320" r="30" fill="none" stroke="#2a2c33" stroke-width="3"/><path d="M -28 300 A 36 36 0 0 1 4 286" stroke="#b0b4bc" stroke-width="3" fill="none" opacity=".5"/></g></svg>`;
const pend = (x, y, h, deg, o = {}) => ({ svg: pendSvg(deg), x, y: y + h, w: h * 0.8, h, z: 4, ...o }); // x,y = pivot
const slab = (x, y, w = 330, o = {}) => tl('w10a/1', x, y - 8 * w / 388, w, w * 86 / 388, { z: 8, ...o }); // y = its top
const floor = (x, y, w = 560, o = {}) => tl('k10/10', x, y - 6 * w / 560, w, w * 238 / 560, { z: 8, ...o });
const chain = (x, y0, y1, o = {}) => tl('k10/1', x - 13, y0, 26, y1 - y0, { z: 7, ...o }); // ends on its hook
const brazier = (x, y, lit, o = {}) => ({ src: 'w10c/2', x, y, w: 48, h: 75, z: 9, filter: lit ? 'none' : 'grayscale(1) brightness(.45)', ...o });
const glow = (x, y, r, c = '#7dffcf', op = 0.35) => ({ svg: `<svg viewBox="0 0 10 10" width="100%" height="100%"><defs><radialGradient id="gl${gid++}"><stop offset="0" stop-color="${c}" stop-opacity="1"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><circle cx="5" cy="5" r="5" fill="url(#gl${gid - 1})"/></svg>`, x, y: y + r, w: 2 * r, h: 2 * r, z: 2, op });
const warm = (x, y, r, op = 0.32) => glow(x, y, r, '#ffb35a', op);
const sideBG = [{ src: 'A:w6to10/lairs/hall-wide.webp', pos: 'center 60%', size: 'cover', filter: 'brightness(.42) saturate(.8)' }];
const upBG = [{ src: 'A:w6to10/lairs/hall-tall.webp', pos: 'center 40%', size: 'cover', filter: 'brightness(.42) saturate(.8)' }];
const bg = { upright: upBG, sideways: sideBG };
const shade = 'background:radial-gradient(ellipse at 50% 55%, #0000 35%, #05070cbb 100%)';
export const scenes = [
  {
    name: 'w10-1-gate', stage: '10-8 The Clockwork Gate', title: '1 · A gate that counts.',
    caption: 'The way in through the netting is sewn shut, so Pokey goes in through the gate\'s machinery. Three dark lamps over the gate: three weights to hang. Dot says so.',
    bg, overlay: shade, cam: { upright: { x: 690, y: 450 }, sideways: { x: 640, y: 560 } }, scale: { upright: 0.56, sideways: 0.6 },
    items: [
      gear(520, 260, 360, 16, 8, { op: 0.9, filter: 'brightness(.75)' }),
      gear(830, 200, 240, 12, 20, { op: 0.9, filter: 'brightness(.7)' }),
      gear(1090, 330, 300, 14, 3, { op: 0.9, filter: 'brightness(.75)' }),
      pend(680, 20, 380, 14, { filter: 'brightness(.8)' }),
      tl('w10a/3', 700, 420, 300, 348, { z: 6 }),
      brazier(745, 420, false), brazier(850, 420, false), brazier(955, 420, false),
      tl('k10/13', -120, 470, 300, 147, { z: 9, rot: -8 }),
      floor(-100, 770, 600), floor(-60, 970, 600, { filter: 'brightness(.6)', z: 7 }), floor(480, 770, 600), floor(520, 970, 600, { filter: 'brightness(.6)', z: 7 }), floor(1060, 770, 600), floor(1100, 970, 600, { filter: 'brightness(.6)', z: 7 }),
      hero(24, 380, 772, 124, 204),
      { src: 'dot/1', x: 560, y: 640, w: 64, h: 62, z: 25 },
      warm(380, 600, 220, 0.18),
      { src: 'w10c/0', x: 120, y: 650, w: 70, h: 147, z: 4, filter: 'brightness(.8)' },
      { src: 'w10c/0', x: 1260, y: 650, w: 70, h: 147, z: 4, filter: 'brightness(.8)' },
    ],
    tags: [{ x: 420, y: 70, text: 'gears + pendulum: NEW ART (code stand-ins)' }, { x: -110, y: 640, text: 'netting sewn shut (10-8\'s own line)' }, { x: 760, y: 360, text: '3 lamps = 3 weights' }],
    bubbles: [{ x: 560, y: 520, text: 'Three lamps. Hang a weight for each.', isNew: true }],
  },
  {
    name: 'w10-2-weight', stage: '10-8 The Clockwork Gate', title: '2 · Counterweights.',
    caption: 'Carry an iron weight up the steps (no jump needed) and hang it on the hook. The chain runs over the wheel and lifts the shutter on the far side.',
    bg, overlay: shade, cam: { upright: { x: 640, y: 500 }, sideways: { x: 600, y: 590 } }, scale: { upright: 0.62, sideways: 0.6 },
    items: [
      gear(767, 320, 200, 12, 10, { pegs: 0 }),
      chain(668, 330, 570),
      chain(866, 330, 470),
      tl('w10a/5', 830, 470, 300, 346, { z: 6 }),
      floor(-100, 820, 560), floor(-60, 1020, 560, { filter: 'brightness(.6)', z: 7 }), floor(440, 820, 560), floor(480, 1020, 560, { filter: 'brightness(.6)', z: 7 }), floor(980, 820, 560), floor(1020, 1020, 560, { filter: 'brightness(.6)', z: 7 }),
      slab(240, 760, 200), slab(370, 700, 200), slab(500, 640, 220),
      pk(44, 600, 642, 96, 134),
      weight(612, 628, 36),
      weight(110, 818, 52, { z: 9 }), weight(160, 818, 44, { z: 9 }),
      brazier(220, 818, true), warm(220, 700, 160, 0.3), glow(220, 720, 110, '#7dffcf', 0.25),
    ],
    tags: [{ x: 640, y: 250, text: 'wheel: stand-in' }, { x: 60, y: 700, text: 'weights: NEW ART (stand-ins)' }, { x: 880, y: 440, text: 'the chain lifts this shutter' }],
    bubbles: [],
  },
  {
    name: 'w10-3-tick', stage: '10-8 The Clockwork Gate', title: '3 · Wait for the tick.',
    caption: 'The doors run on the pendulum: each opens on the tick and drops on the tock. Rushing gets him shut out (pushed back, no hurt). Waiting one swing always works.',
    bg, overlay: shade, cam: { upright: { x: 500, y: 440 }, sideways: { x: 620, y: 520 } }, scale: { upright: 0.6, sideways: 0.58 },
    items: [
      gear(300, 160, 260, 14, 4, { filter: 'brightness(.8)' }),
      gear(500, 90, 160, 10, 18, { filter: 'brightness(.8)' }),
      pend(620, 40, 460, -18),
      tl('w10a/5', 380, 500, 230, 266, { z: 6 }),
      tl('w10a/3', 760, 500, 230, 266, { z: 6 }),
      floor(-120, 770, 600), floor(-80, 970, 600, { filter: 'brightness(.6)', z: 7 }), floor(460, 770, 600), floor(500, 970, 600, { filter: 'brightness(.6)', z: 7 }), floor(1040, 770, 600), floor(1080, 970, 600, { filter: 'brightness(.6)', z: 7 }),
      hero(24, 260, 772, 124, 204),
      { src: 'dot/3', x: 410, y: 640, w: 60, h: 49, z: 25 },
      brazier(130, 770, true), warm(130, 650, 170, 0.3), glow(130, 680, 100, '#7dffcf', 0.22),
    ],
    tags: [{ x: 420, y: 470, text: 'open on TICK' }, { x: 800, y: 470, text: 'shut on TOCK' }],
    bubbles: [{ x: 340, y: 560, text: 'Tick... tock... now.', isNew: true }],
  },
  {
    name: 'w10-4-hold', stage: '10-8 The Clockwork Gate', title: '4 · Hold on to the wheel.',
    caption: 'The great wheel turns slowly. Grab a spoke, keep a thumb down (the hold from 10-3 and 10-4) and it carries him up; lift the thumb at the top ledge.',
    bg, overlay: shade, cam: { upright: { x: 640, y: 420 }, sideways: { x: 620, y: 480 } }, scale: { upright: 0.5, sideways: 0.56 },
    items: [
      gear(600, 470, 620, 20, 0, { z: 5, pegs: 8 }),
      gear(1010, 180, 260, 12, 0, { z: 4, filter: 'brightness(.8)' }),
      slab(880, 190, 360),
      floor(-120, 840, 600), floor(-80, 1040, 600, { filter: 'brightness(.6)', z: 7 }), floor(460, 840, 600), floor(500, 1040, 600, { filter: 'brightness(.6)', z: 7 }), floor(1040, 840, 600), floor(1080, 1040, 600, { filter: 'brightness(.6)', z: 7 }),
      hero(0, 377, 506, 108, 248, { z: 21 }),
      { src: 'dot/2', x: 260, y: 360, w: 66, h: 54, z: 25 },
      brazier(1120, 190, true), warm(1120, 80, 170, 0.3), glow(1120, 100, 100, '#7dffcf', 0.22),
    ],
    tags: [{ x: 250, y: 530, text: 'thumb down = hold on' }, { x: 900, y: 120, text: 'let go here' }, { x: 420, y: 850, text: 'great wheel: NEW ART (stand-in)' }],
    bubbles: [{ x: 120, y: 260, text: 'Hold on. Let go at the top.', isNew: true }],
  },
  {
    name: 'w10-5-open', stage: '10-8 The Clockwork Gate', title: '5 · Beaten by patience.',
    caption: 'Three lamps lit, the gate winds itself up, and the fortress is through it. Next: 10-9 The Fortress Gate.',
    bg, overlay: 'background:radial-gradient(ellipse at 62% 55%, #0000 35%, #05070caa 100%)', cam: { upright: { x: 760, y: 450 }, sideways: { x: 640, y: 560 } }, scale: { upright: 0.62, sideways: 0.6 },
    items: [
      gear(520, 260, 360, 16, 30, { op: 0.9, filter: 'brightness(.8)' }),
      gear(1090, 330, 300, 14, 25, { op: 0.9, filter: 'brightness(.8)' }),
      glow(850, 610, 230, '#ffe7a8', 0.5),
      tl('w10a/5', 700, 420, 300, 346, { z: 6 }),
      brazier(745, 420, true), brazier(850, 420, true), brazier(955, 420, true),
      glow(850, 380, 200, '#7dffcf', 0.3),
      floor(-100, 770, 600), floor(-60, 970, 600, { filter: 'brightness(.6)', z: 7 }), floor(480, 770, 600), floor(520, 970, 600, { filter: 'brightness(.6)', z: 7 }), floor(1060, 770, 600), floor(1100, 970, 600, { filter: 'brightness(.6)', z: 7 }),
      hero(57, 760, 772, 164, 192),
      { src: 'dot/0', x: 900, y: 650, w: 56, h: 60, z: 25 },
    ],
    tags: [], bubbles: [],
  },
];
