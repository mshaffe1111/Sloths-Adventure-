/**
 * Painted Shadow Prowler (world 3 boss, the black jaguar of the sinkhole cave) from the Gemini pose sheets. A switch like the other
 * painted creatures: `?prowler=sprite` / `?prowler=classic`, `localStorage.sloth_prowler = 'sprite'`, DEFAULT_SPRITE_PROWLER otherwise.
 *
 * Poses follow the boss brain: stalking idle, a walk (a run from phase 2), a crouch for each wind-up, the pounce in the air and its
 * landing, the slash, the claw combo as alternating swipe and bite, the dash as a run, the open recovery, hurt and the collapse.
 * The shadow step fades the painted cat out through the boss alpha, so it needs no smoke frame of its own.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { PROWLER_FRAMES } from './prowlerAtlasData.ts';

export const DEFAULT_SPRITE_PROWLER = true;
const WALK = ['w_0', 'w_1', 'w_2', 'w_3'];
/** world units travelled per full walk cycle */
const STRIDE = 70;

export const prowlerSprite = createPaintedBoss({
  param: 'prowler',
  defaultOn: DEFAULT_SPRITE_PROWLER,
  url: new URL('../assets/enemies/prowler-atlas.webp', import.meta.url).href,
  frames: PROWLER_FRAMES,
  k: 0.78,
  glow: 'rgba(150, 255, 225, 0.7)',
  pick: ({ b, br, m, moving, dist, time }) => {
    let name: string;
    if (br.state === 'dying') name = br.t < 0.6 ? 'hurt' : 'dead';
    else if (br.state === 'stun') name = 'hurt';
    else if (br.state === 'roar') name = 'alert';
    else if (br.state === 'tell') name = m?.pose === 'bite' ? 'alert' : 'viper';
    else if (br.state === 'act') {
      if (m?.pose === 'leap') name = br.air > 8 ? 'leap' : 'land';
      else if (m?.pose === 'fade') name = 'swipe';
      else if (m?.pose === 'bite') name = Math.floor(br.t / 0.22) % 2 === 0 ? 'swipe' : 'bite';
      else name = Math.floor(time * 12) % 2 === 0 ? 'run_0' : 'run_1';
    } else if (br.state === 'rec') name = m?.pose === 'leap' ? 'land' : 'idle';
    else if (moving) {
      if (b.phase >= 2) name = Math.floor((dist / 46) * 2) % 2 === 0 ? 'run_0' : 'run_1';
      else name = WALK[Math.floor((dist / STRIDE) * WALK.length) % WALK.length];
    } else name = 'idle';
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});
