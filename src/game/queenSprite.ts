/**
 * Painted Tarantula Queen (world 5 boss) from the Gemini pose sheets. A switch like the other painted creatures: `?queen=sprite` /
 * `?queen=classic`, `localStorage.sloth_queen = 'sprite'`, DEFAULT_SPRITE_QUEEN otherwise. She is drawn at the boss definition's scale
 * (a giant), so the whole painted pose set is the same plumbing as the other bosses (paintedBoss.ts).
 *
 * Poses follow the boss brain: walking (the faster charge scuttle from the second phase on), a warning pose for each wind-up and one
 * for each attack (web cocoon, brood call, web slam, pounce and bite, leg stomp and crush, venom jet), the open recovery that goes with
 * each move, stun and death.
 *
 * Her animated clips (queen-anim.webp, queenAnimData.ts: Wan 2.2 clips of her own painted poses) play wherever one exists: the idle,
 * the skitter, the silk shot, the leg slam and the web net (tell, strike, and the slam's recovery), the flinch, the stun and the defeat.
 * The moves that have no clip (the venom jet, the brood call, the pounce, the cocoon drop, the roars) keep their painted poses. Her
 * entrance is her tea: she is revealed pouring a cup (the pour clip), rises from her seat (the sit clip played backwards) and then roars.
 */
import { TEA_POUR, TEA_RISE } from './bossEntrance.ts';
import { createPaintedBoss, type PaintedBoss, type PickContext } from './paintedBoss.ts';
import { QUEEN_FRAMES } from './queenAtlasData.ts';
import { QUEEN_ANIM, QUEEN_ANIM_UP, QUEEN_ANIM_URL, QUEEN_SEQ, queenFps } from './queenAnimData.ts';

export const DEFAULT_SPRITE_QUEEN = true;
const STRIDE = 60;
const WALK = ['walk_0', 'walk_1', 'walk_2', 'walk_3'];

const queenStills = createPaintedBoss({
  param: 'queen',
  defaultOn: DEFAULT_SPRITE_QUEEN,
  url: new URL('../assets/enemies/queen-atlas.webp', import.meta.url).href,
  frames: QUEEN_FRAMES,
  k: 0.9,
  pick: ({ b, br, moving, dist }) => {
    let name: string;
    const mv = br.move;
    if (br.state === 'dying') name = br.t < 0.5 ? 'hurt' : 'dead';
    else if (br.state === 'stun') name = 'dizzy';
    else if (br.state === 'roar') name = b.phase >= 3 && br.roarReason !== 'enter' ? 'enrage' : 'screech';
    else if (br.state === 'tell') {
      if (mv === 'pounceBite') name = 'block';
      else if (mv === 'legStomp') name = 'stomp';
      else if (mv === 'venomBlast') name = 'venom';
      else if (mv === 'webCurtain' || mv === 'cocoonDrop') name = 'screech';
      else if (mv === 'callBrood') name = 'summon';
      else name = 'idle2';
    } else if (br.state === 'act') {
      if (mv === 'webShot') name = 'cocoon';
      else if (mv === 'callBrood') name = 'summon';
      else if (mv === 'webCurtain') name = 'webslam';
      else if (mv === 'cocoonDrop') name = 'enrage';
      else if (mv === 'legStomp') name = 'crush';
      else if (mv === 'venomBlast') name = 'venom';
      else if (mv === 'pounceBite') name = br.air > 8 ? 'leap' : 'bite';
      else name = 'bite';
    } else if (br.state === 'rec') {
      if (mv === 'callBrood') name = 'summon';
      else if (mv === 'pounceBite') name = 'bite';
      else if (mv === 'legStomp') name = 'crush';
      else if (mv === 'venomBlast') name = 'venom';
      else if (mv === 'webCurtain') name = 'webslam';
      else if (mv === 'cocoonDrop') name = 'screech';
      else name = 'drip';
    } else if (moving) {
      if (b.phase >= 2) name = Math.floor((dist / 44) * 2) % 2 === 0 ? 'charge_0' : 'charge_1';
      else name = WALK[Math.floor((dist / STRIDE) * WALK.length) % WALK.length];
    } else name = 'idle';
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});

/** the death sequence's length (engine stepBossDeath) */
const DYING_S = 2.0;
/** world units of skitter a full cycle covers */
const SKITTER_CYCLE = 260;
const at = (seq: string, p: number) => {
  const f = QUEEN_SEQ[seq];
  return f[Math.max(0, Math.min(f.length - 1, Math.floor(p * f.length)))];
};
const loop = (seq: string, time: number) => {
  const f = QUEEN_SEQ[seq];
  return f[Math.floor(time * queenFps(seq)) % f.length];
};
/** which clip goes with each attack: wind-up, strike, recovery (the webShot is her silk shot, the stomp her slam, the curtain her net) */
const CLIPS: Record<string, { tell: string; act: string; rec?: string }> = {
  webShot: { tell: 'silkTell', act: 'silkAct' },
  legStomp: { tell: 'slamTell', act: 'slamAct', rec: 'slamRec' },
  webCurtain: { tell: 'netTell', act: 'netAct' },
};

const queenClips = createPaintedBoss({
  param: 'queen',
  defaultOn: DEFAULT_SPRITE_QUEEN,
  url: QUEEN_ANIM_URL,
  frames: QUEEN_ANIM,
  k: 0.9 / QUEEN_ANIM_UP,
  // the clips move her already: only a touch of the made-up squash and lean
  motion: 0.3,
  pick: ({ b, br, m, moving, dist, time }: PickContext) => {
    const p = (len: number | undefined) => (len && len > 0 ? br.t / len : 1);
    const c = br.move ? CLIPS[br.move] : undefined;
    if (br.state === 'dying') return at('defeat', br.t / DYING_S);
    if (br.state === 'stun') return loop('stunned', time);
    if (br.state === 'roar' && br.intro !== undefined) {
      // her entrance is her tea (bossEntrance.ts, engine.stepEntrance): at the table pouring, rising from her seat, the roar (her
      // painted screech), then skittering back to where the fight starts
      const u = br.intro;
      const [p0, p1] = TEA_POUR;
      if (u < p1) return at('pour', Math.max(0, (u - p0) / (p1 - p0)));
      if (u < TEA_RISE) return at('sit', 1 - (u - p1) / (TEA_RISE - p1));
      if (moving) {
        const f = QUEEN_SEQ.skitter;
        return f[Math.floor((dist / SKITTER_CYCLE) * f.length) % f.length];
      }
      return '';
    }
    if (br.state === 'roar') return '';
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) return at('hurt', 0.4);
    if (br.state === 'tell') return c ? at(c.tell, p(m?.tell)) : '';
    if (br.state === 'act') return c ? at(c.act, p(m?.act)) : '';
    if (br.state === 'rec') return c?.rec ? at(c.rec, p(m?.rec)) : c ? at(c.act, 1) : '';
    if (moving) {
      const f = QUEEN_SEQ.skitter;
      return f[Math.floor((dist / SKITTER_CYCLE) * f.length) % f.length];
    }
    return loop('idle', time);
  },
});

/** the clip frame where she has one, her painted pose where she has none (and while the clip sheet loads) */
export const queenSprite: PaintedBoss = {
  active: () => queenClips.active() || queenStills.active(),
  draw: (ctx, b, def, time, feetY) => queenClips.draw(ctx, b, def, time, feetY) || queenStills.draw(ctx, b, def, time, feetY),
  still: (ctx, name) => queenStills.still(ctx, name),
};
