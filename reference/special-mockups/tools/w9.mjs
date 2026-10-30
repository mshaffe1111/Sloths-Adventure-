const K = 0.45, RK = 0.469; // sheet px -> world units (hero-standard, hero-rope)
const hero = (i, x, y, w, h, o = {}) => ({ src: `hero/${i}`, x, y, w: w * K, h: h * K, z: 20, ...o });
// a hanging Pokey: (x, y) is where his paws grip
const rope = (f, x, y, w, h, o = {}) => ({ src: `rope2/${f}`, x, y: y - 10 * RK + h * RK, w: w * RK, h: h * RK, z: 6, ...o });
const tl = (src, x, y, w, h, o = {}) => ({ src, x, y, w, h, anchor: 'tl', ...o });
const sideBG = [
  { src: 'A:backdrops/w9dawn-far.webp', pos: 'center 62%', size: 'cover' },
  { src: 'A:backdrops/w1-mid.webp', pos: 'center 108%', size: 'auto 78%', filter: 'sepia(.5) saturate(.9) brightness(.72) contrast(.9)', op: 0.75, mask: 'linear-gradient(transparent 0%, transparent 25%, #000 60%)' },
];
const upBG = [
  { src: 'A:backdrops/w9dawn-far.webp', pos: '64% 50%', size: 'cover' },
  { src: 'A:backdrops/w1-mid.webp', pos: '35% 104%', size: 'auto 48%', filter: 'sepia(.5) saturate(.9) brightness(.72) contrast(.9)', op: 0.75, mask: 'linear-gradient(transparent 0%, transparent 25%, #000 60%)' },
];
const bg = { upright: upBG, sideways: sideBG };
const trunk = (x, y0, y1, w = 250, o = {}) => tl('trunk-tall', x, y0, w, y1 - y0, { z: 5, ...o });
const thick = (x, y, w = 420, o = {}) => tl('proto3/6', x, y - 8 * w / 370, w, w * 100 / 370, { z: 8, ...o }); // y = its top
const cracked = (x, y, w = 420, o = {}) => tl('proto3/5', x, y - 10 * w / 370, w, w * 120 / 370, { z: 8, ...o });
// a thin branch, levelled: y = the line his paws hold
const thin = (x, y, w = 560, o = {}) => tl('w2p/38', x, y - 0.5 * w * 190 / 560, w, w * 190 / 560, { z: 9, rot: 9, ...o });
const leaves = (x, y, w = 460, o = {}) => tl('w2p/39', x, y - w * 158 / 520 * 0.97, w, w * 158 / 520, { z: 10, ...o });
const canopy = (x, y, w = 520, o = {}) => tl('canopy', x, y, w, w * 334 / 527, { z: 31, ...o });
const ants = (x, y, n, dir = 1) => Array.from({ length: n }, (_, i) => ({ svg: `<svg viewBox="0 0 20 10" width="100%" height="100%"><g fill="#2a120a" stroke="#120604" stroke-width=".6"><ellipse cx="5" cy="6" rx="3" ry="2.2"/><ellipse cx="10" cy="5.6" rx="2" ry="1.6"/><ellipse cx="14.5" cy="5.4" rx="2.7" ry="2.2" fill="#5a1d0e"/></g><g stroke="#120604" stroke-width=".7"><path d="M8 7 L6 10 M10 7 L10 10 M12 7 L14 10 M14 4 L17 1"/></g></svg>`, x: x + i * 26 * dir + (i % 3) * 4, y: y + (i % 2), w: 30, h: 15, z: 22, flip: dir < 0 }));
export const scenes = [
  {
    name: 'w9-1-too-thin', stage: '9-2 The Last Trees', title: '1 · Too thin to walk.',
    caption: 'The teaching spot: a wide safe limb, a catch limb under the thin branch, nothing that hurts. Dot shows the way.',
    bg, cam: { upright: { x: 750, y: 640 }, sideways: { x: 640, y: 600 } }, scale: { upright: 0.7, sideways: 0.64 },
    items: [
      trunk(40, -300, 1500),
      thick(250, 612, 470),
      leaves(690, 610, 520, { z: 7 }),
      thin(660, 612, 600),
      thick(720, 930, 400, { filter: 'brightness(.85)' }),
      canopy(-80, 140, 560), canopy(420, 40, 420, { flip: true, only: 'sideways' }), canopy(700, 0, 420, { flip: true, only: 'upright' }),
      hero(24, 560, 614, 124, 204),
      { src: 'dot/3', x: 930, y: 520, w: 70, h: 57, z: 25 },
      rope('f7', 900, 616, 93, 213, { op: 0.55, z: 11, filter: 'grayscale(.4)' }),
    ],
    tags: [{ x: 930, y: 735, text: 'faded: the hang-under move' }, { x: 760, y: 1000, text: 'catch limb (a miss never falls far)' }],
    bubbles: [{ x: 980, y: 420, text: 'Too thin to stand on. Hang under it!', isNew: true, only: 'sideways' }, { x: 520, y: 420, text: 'Too thin to stand on. Hang under it!', isNew: true, only: 'upright' }],
  },
  {
    name: 'w9-2-shadow', stage: '9-2 The Last Trees', title: '2 · The eagle\'s shadow.',
    caption: 'A screech, then the harpy\'s shadow sweeps the branch tops. Under the leaves, Pokey is hidden. Caught on top, it dives.',
    bg, cam: { upright: { x: 640, y: 520 }, sideways: { x: 640, y: 560 } }, scale: { upright: 0.7, sideways: 0.64 },
    items: [
      trunk(-200, -300, 1500),
      thin(-20, 612, 560),
      leaves(-10, 606, 480, { z: 7 }),
      thin(500, 612, 600),
      leaves(520, 606, 540, { z: 7 }),
      thin(1060, 612, 520, { flip: true, rot: -9 }),
      leaves(1080, 606, 460, { z: 7 }),
      thick(980, 900, 420, { filter: 'brightness(.85)' }),
      rope('f3', 760, 618, 129, 191),
      { src: 'eagle/14', x: 770, y: 600, w: 400, h: 215, z: 12, filter: 'brightness(0) blur(3px)', op: 0.5 },
      { src: 'eagle/13', x: 1130, y: 420, w: 190, h: 134, z: 35, flip: true, only: 'sideways' },
      { src: 'eagle/13', x: 800, y: 330, w: 190, h: 134, z: 35, flip: true, only: 'upright' },
      canopy(240, -120, 520), canopy(-200, -60, 520, { flip: true }),
    ],
    tags: [{ x: 700, y: 760, text: 'hidden under the leaves' }, { x: 640, y: 380, text: 'the shadow sweeps the tops' }],
    bubbles: [],
  },
  {
    name: 'w9-3-trunk', stage: '9-2 The Last Trees', title: '3 · The trunk layer.',
    caption: 'Up the trunk: a snake on the limb above (punch it, or wait for it to slide off), a woodpecker\'s hole (it drums first, then pecks: climb past between pecks).',
    bg, cam: { upright: { x: 500, y: 560 }, sideways: { x: 560, y: 520 } }, scale: { upright: 0.72, sideways: 0.64 },
    items: [
      trunk(330, -400, 1600, 270),
      tl('hole', 430, 380, 78, 104, { z: 6 }),
      thick(560, 330, 380),
      thick(-60, 880, 420, { flip: true }),
      thin(580, 800, 460),
      leaves(600, 794, 400, { z: 7 }),
      hero(9, 470, 700, 120, 216),
      { src: 'snake/0', x: 760, y: 336, w: 190, h: 96, z: 12, flip: true },
      
      canopy(80, -120, 560),
    ],
    tags: [{ x: 380, y: 350, text: 'woodpecker: NEW ART (its hole shown)' }, { x: 690, y: 250, text: 'snake on the limb' }],
    bubbles: [],
  },
  {
    name: 'w9-4-tops', stage: '9-2 The Last Trees', title: '4 · The branch tops.',
    caption: 'On top: a capuchin lobs fruit, army ants march along the next limb, a cracked limb creaks for a second, then snaps. Drop under it, or run.',
    bg, cam: { upright: { x: 650, y: 560 }, sideways: { x: 620, y: 540 } }, scale: { upright: 0.68, sideways: 0.62 },
    items: [
      trunk(-260, -300, 1500),
      thick(-40, 620, 470, { z: 9 }),
      cracked(380, 596, 420, { z: 8 }),
      thick(760, 632, 480, { z: 9, flip: true }),
      thin(700, 400, 520, { flip: true, rot: -9 }),
      leaves(720, 394, 460, { z: 7 }),
      { src: 'capu/3', x: 960, y: 406, w: 200, h: 126, z: 10, flip: true, only: 'sideways' }, { src: 'capu/3', x: 830, y: 406, w: 200, h: 126, z: 10, flip: true, only: 'upright' },
      { src: 'proto/9', x: 720, y: 480, w: 36, h: 58, rot: -30, z: 15 },
      hero(57, 300, 642, 164, 192, { only: 'sideways' }), hero(57, 420, 642, 164, 192, { only: 'upright' }),
      ...ants(860, 640, 11),
      thick(460, 960, 380, { filter: 'brightness(.85)' }),
    ],
    tags: [{ x: 860, y: 650, text: 'army ants: NEW ART (stand-ins)' }, { x: 470, y: 560, text: 'cracked: creaks 1 s, then snaps' }],
    bubbles: [],
  },
  {
    name: 'w9-5-last-tree', stage: '9-2 The Last Trees', title: '5 · The last tree.',
    caption: 'The trees end. Ash and the volcano ahead. The shrine sits on the last limb. Dot, for once, says almost nothing.',
    bg: { upright: [{ src: 'A:backdrops/w9dawn-far.webp', pos: '78% 50%', size: 'cover' }], sideways: [{ src: 'A:backdrops/w9dawn-far.webp', pos: 'center 55%', size: 'cover' }] },
    cam: { upright: { x: 420, y: 560 }, sideways: { x: 520, y: 520 } }, scale: { upright: 0.66, sideways: 0.6 },
    items: [
      trunk(-200, -300, 1500),
      thick(-20, 640, 520),
      thin(470, 640, 340),
      hero(24, 400, 642, 124, 204),
      { src: 'dot/0', x: 490, y: 540, w: 60, h: 64, z: 25 },
      canopy(-260, 120, 560),
    ],
    tags: [], bubbles: [{ x: 250, y: 380, text: 'Those were the last trees.', isNew: true }],
  },
];
