/**
 * The new HUD's "bloom on change" rules (Matt's pick, 2026-10-26: option B's hanging vine with option D's behaviour), as a pure module
 * so the test can say what is on screen when.
 *
 * - Hearts and the goal counter are always on screen, small. When they change (a heart lost or won back, a petal collected) they
 *   bloom big for a moment and settle again.
 * - Lives, score, the stage name and the power-up are hidden. They bloom in when they change, hold for about 2 s, then go away
 *   (a power-up stays, small, while it lasts, with its draining ring).
 * - The goal counter glows once at half the quota, at "1 more", and when the goal is met; met, it stays gold and still.
 *
 * Times are in ms and come from the caller (performance.now() in the game, plain numbers in the test). Nothing here allocates per
 * call except `bloomView`'s one small result object, and it is only called when React renders the HUD.
 */

export type BloomPiece = 'hearts' | 'goal' | 'lives' | 'score' | 'stage' | 'power';

/** how long each piece stays big after it changes */
export const BLOOM_MS: Record<BloomPiece, number> = {
  hearts: 1200,
  goal: 1100,
  lives: 2000,
  score: 1500,
  stage: 2200,
  power: 2000,
};
/** how long a milestone glow on the goal counter lasts */
export const GLOW_MS = 1400;

export interface HudValues {
  hp: number;
  maxHp: number;
  /** the goal count so far, and the quota (0 for a stage with no count: distance stages and bosses) */
  goal: number;
  target: number;
  lives: number;
  score: number;
  /** the stage id (a new one blooms the stage name) */
  stage: string;
  power: string | null;
}

export interface BloomTrack {
  prev: HudValues | null;
  /** when each piece's bloom ends (0 = not blooming) */
  until: Record<BloomPiece, number>;
  /** what changed, for the little "+1" / "-1" tags: summed while a bloom is still up */
  heartDelta: number;
  livesDelta: number;
  scoreDelta: number;
  goalDelta: number;
  glowUntil: number;
  /** milestones already glowed this stage */
  saidHalf: boolean;
  saidOneMore: boolean;
  saidMet: boolean;
}

export type PieceState = 'hidden' | 'small' | 'bloom';

export interface BloomView {
  hearts: PieceState;
  goal: PieceState;
  lives: PieceState;
  score: PieceState;
  stage: PieceState;
  power: PieceState;
  heartDelta: number;
  livesDelta: number;
  scoreDelta: number;
  goalDelta: number;
  /** a milestone glow is up on the goal counter */
  goalGlow: boolean;
  /** the goal is met: the counter is gold, with a tick, and still */
  goalMet: boolean;
}

export function newBloom(): BloomTrack {
  return {
    prev: null,
    until: { hearts: 0, goal: 0, lives: 0, score: 0, stage: 0, power: 0 },
    heartDelta: 0,
    livesDelta: 0,
    scoreDelta: 0,
    goalDelta: 0,
    glowUntil: 0,
    saidHalf: false,
    saidOneMore: false,
    saidMet: false,
  };
}

function bloom(t: BloomTrack, piece: BloomPiece, now: number) {
  t.until[piece] = now + BLOOM_MS[piece];
}
const up = (t: BloomTrack, piece: BloomPiece, now: number) => t.until[piece] > now;

/**
 * Take in this render's values and note what changed. Call it with the same values as often as you like: nothing changes then.
 * The first call (a new stage) blooms the stage name only.
 */
export function bloomUpdate(t: BloomTrack, v: HudValues, now: number): void {
  const p = t.prev;
  if (!p || p.stage !== v.stage) {
    // a new stage: start clean, and show its name for a moment
    const fresh = newBloom();
    Object.assign(t, fresh);
    t.until = fresh.until;
    bloom(t, 'stage', now);
    if (v.power) bloom(t, 'power', now);
    // a stage that starts with the goal already part way (a continue from the flag) has had its milestones
    if (v.target > 0) {
      t.saidHalf = v.goal * 2 >= v.target;
      t.saidOneMore = v.target - v.goal <= 1;
      t.saidMet = v.goal >= v.target;
    }
    t.prev = { ...v };
    return;
  }

  if (v.hp !== p.hp || v.maxHp !== p.maxHp) {
    const d = v.hp - p.hp;
    t.heartDelta = up(t, 'hearts', now) ? t.heartDelta + d : d;
    bloom(t, 'hearts', now);
  }
  if (v.target !== p.target && v.goal === p.goal) {
    // only the quota changed (the engine's own count arriving at the start): quietly, and the milestones are worked out afresh
    if (v.target > 0) {
      t.saidHalf = v.goal * 2 >= v.target;
      t.saidOneMore = v.target - v.goal <= 1;
      t.saidMet = v.goal >= v.target;
    }
  } else if (v.goal !== p.goal) {
    if (v.goal < p.goal) {
      // the count went back (a restart in place): no fuss, and the milestones may be said again
      t.goalDelta = 0;
      t.until.goal = 0;
      t.saidHalf = t.saidOneMore = t.saidMet = false;
    } else {
      const d = v.goal - p.goal;
      t.goalDelta = up(t, 'goal', now) ? t.goalDelta + d : d;
      bloom(t, 'goal', now);
      if (v.target > 0) {
        let glow = false;
        if (!t.saidMet && v.goal >= v.target) {
          t.saidMet = t.saidOneMore = t.saidHalf = true;
          glow = true;
        } else if (!t.saidOneMore && v.target - v.goal === 1 && v.target > 1) {
          t.saidOneMore = t.saidHalf = true;
          glow = true;
        } else if (!t.saidHalf && v.goal * 2 >= v.target && v.target >= 4) {
          t.saidHalf = true;
          glow = true;
        }
        if (glow) t.glowUntil = now + GLOW_MS;
      }
    }
  }
  if (v.lives !== p.lives) {
    const d = v.lives - p.lives;
    t.livesDelta = up(t, 'lives', now) ? t.livesDelta + d : d;
    bloom(t, 'lives', now);
  }
  if (v.score !== p.score) {
    if (v.score > p.score) {
      const d = v.score - p.score;
      t.scoreDelta = up(t, 'score', now) ? t.scoreDelta + d : d;
      bloom(t, 'score', now);
    } else {
      // the score went down (a restart): hide it, no tag
      t.scoreDelta = 0;
      t.until.score = 0;
    }
  }
  if (v.power !== p.power && v.power) bloom(t, 'power', now);
  if (!v.power) t.until.power = 0;

  // (only the fields compared above, so no new object per call)
  p.hp = v.hp;
  p.maxHp = v.maxHp;
  p.goal = v.goal;
  p.target = v.target;
  p.lives = v.lives;
  p.score = v.score;
  p.power = v.power;
}

/** what is on screen at `now` */
export function bloomView(t: BloomTrack, now: number): BloomView {
  const v = t.prev;
  const met = !!v && v.target > 0 && v.goal >= v.target;
  return {
    hearts: up(t, 'hearts', now) ? 'bloom' : 'small',
    goal: up(t, 'goal', now) ? 'bloom' : 'small',
    lives: up(t, 'lives', now) ? 'bloom' : 'hidden',
    score: up(t, 'score', now) ? 'bloom' : 'hidden',
    stage: up(t, 'stage', now) ? 'bloom' : 'hidden',
    power: up(t, 'power', now) ? 'bloom' : v?.power ? 'small' : 'hidden',
    heartDelta: up(t, 'hearts', now) ? t.heartDelta : 0,
    livesDelta: up(t, 'lives', now) ? t.livesDelta : 0,
    scoreDelta: up(t, 'score', now) ? t.scoreDelta : 0,
    goalDelta: up(t, 'goal', now) ? t.goalDelta : 0,
    goalGlow: t.glowUntil > now,
    goalMet: met,
  };
}

/** ms from `now` until the view next changes by itself (a bloom ending), or -1 when nothing is pending: the HUD sets one timer for it */
export function nextBloomEdge(t: BloomTrack, now: number): number {
  let next = Infinity;
  for (const k in t.until) {
    const u = t.until[k as BloomPiece];
    if (u > now && u < next) next = u;
  }
  if (t.glowUntil > now && t.glowUntil < next) next = t.glowUntil;
  return next === Infinity ? -1 : next - now;
}

/** small quotas show as slots to fill, bigger ones as a number */
export const SLOT_MAX = 8;
export const showsSlots = (target: number) => target > 0 && target <= SLOT_MAX;
