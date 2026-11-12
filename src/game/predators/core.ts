/**
 * predators/core — the one state machine every predator runs (types.ts has the picture; reference/design/PREDATORS.md the design).
 *
 * The fairness rules live here, as `checkClock` holds the clock's:
 *   - 'act' is the only phase with a hurt box (`hurt`), and it is entered in ONE place: out of a tell that ran `tellOf` seconds.
 *   - a kind is refused (`checkPredator`) unless its tell is at least TELL_MIN, it has two ways or more to beat it and never only the
 *     stomp, every way ends stunned / fleeing / dozing / chased off, and its Easy is not harder than its Normal in any number.
 *   - a still sloth is lost by everything that looks for movement (stillness.ts `watcherSees`), and never wakes anything.
 *
 * Pure: no canvas, no engine, no rolls. One fixed step at a time, no garbage but the small event record.
 */
import { checkClock } from '../clock.ts';
import { hears as reaches, sound, stunned as isStunned, type Sound } from '../heroNoise.ts';
import { watcherSees } from '../stillness.ts';
import type { ClockDef } from '../stageKit.types.ts';
import type { Box, Outcome, Phase, Post, PredatorDef, PredatorEvents, PredatorState, Prey, Scene, Way } from './types.ts';

/** the shortest tell any kind may have (s): R-159.1's "0.5 s warning" */
export const TELL_MIN = 0.5;
/** a chased-off animal is out of the stage this long after it turns to run (s) */
export const GONE_AFTER = 1.2;
/** a woken sleeper cannot tell for this long (s): the drowsy moment the snake has today (predatorAI.ts wakeT) */
export const DROWSY = 1.1;
/** close enough to a spot to be at it (px) */
const AT = 6;

const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const toward = (from: number, to: number, step: number): number => (Math.abs(to - from) <= step ? to : from + Math.sign(to - from) * step);
const enter = (s: PredatorState, phase: Phase): void => {
  s.phase = phase;
  s.t = 0;
};

// ───────────────────────────── Easy: never harder ─────────────────────────────

/** the tell on a setting (s). Easy is never shorter, whatever the data says */
export const tellOf = (def: PredatorDef, easy: boolean): number => def.tell * (easy ? Math.max(1, def.easy.tell) : 1);
/** the beat between attacks on a setting (s) */
export const coolOf = (def: PredatorDef, easy: boolean): number => def.cool * (easy ? Math.max(1, def.easy.cool) : 1);
/** every speed's multiple on a setting: 1 on Normal, never over 1 on Easy */
export const speedOf = (def: PredatorDef, easy: boolean): number => (easy ? Math.min(1, def.easy.speed) : 1);
/** Easy has fewer: the posts a setting uses */
export const postsFor = (posts: readonly Post[], easy: boolean): Post[] => posts.filter((p) => !(easy && p.normalOnly));

// ───────────────────────────── the fairness check ─────────────────────────────

/** what is wrong with a kind, in words (none = it may be used) */
export function checkPredator(def: PredatorDef): string[] {
  const bad: string[] = [];
  const say = (m: string) => bad.push(`${def.kind}: ${m}`);
  const real = (n: number) => Number.isFinite(n) && n > 0;
  if (!(def.tell >= TELL_MIN) || !Number.isFinite(def.tell)) say(`its tell is ${def.tell} s; no tell is under ${TELL_MIN} s`);
  const ways = Object.keys(def.beatenBy) as Way[];
  // the noise lure (`hears`) is a way too, but it never stands in for a way that ends the fight
  if (ways.length + (def.hears ? 1 : 0) < 2) say('it needs two ways or more to beat it');
  if (ways.every((w) => w === 'stomp')) say('it is beaten by only the stomp');
  if (!def.beatenBy[def.first]) say(`the first way its world teaches (${def.first}) is not on its list`);
  for (const w of ways) {
    const o = def.beatenBy[w] as Outcome;
    if ((o.ends === 'stunned' || o.ends === 'flees') && !real(o.seconds)) say(`${w} ends ${o.ends} and needs seconds above 0`);
  }
  if (!(def.easy.tell >= 1) || !(def.easy.cool >= 1) || !(def.easy.speed <= 1) || !real(def.easy.speed)) {
    say('Easy is never harder: easy.tell and easy.cool at least 1, easy.speed above 0 and at most 1');
  }
  if (!real(def.act.seconds) || !real(def.act.reach) || !real(def.act.tall) || !(def.act.speed >= 0)) say('its act needs seconds, reach and tall above 0');
  if (!real(def.sight.ahead) || !(def.sight.behind >= 0) || !real(def.sight.tall)) say('its sight needs ahead and tall above 0');
  if (!real(def.giveUp) || !(def.recover >= 0) || !(def.cool >= 0) || !real(def.engage)) say('giveUp and engage above 0; recover and cool not below 0');
  if (def.habit === 'guard' && (def.beatenBy.stomp || def.beatenBy.punch)) say('a guard cannot be stomped or punched: give it a tool of its world');
  if (def.habit === 'sweep' && (!real(def.warn ?? 0) || !real(def.speed.rest))) say('a sweeper needs a warn before its eye starts across, and an eye speed');
  if (def.habit === 'drop' && def.act.aim !== 'below') say("a dropper's act aims 'below'");
  if ((def.habit === 'stalk' || def.habit === 'seek') && !real(def.speed.hunt)) say(`a ${def.habit} kind needs a hunt speed`);
  if (def.habit === 'seek' && !real(def.hears ?? 0)) say('a seek kind needs hears: the seconds it looks at a noise');
  if (def.gait && !(real(def.gait.go) && real(def.gait.pause))) say('its gait needs go and pause above 0');
  if (def.rides && def.habit !== 'sweep') say('only a sweeper rides its eye');
  if (def.fears?.length && !def.beatenBy.lure) say('it fears something, so it needs a lure outcome');
  return bad;
}

/** what is wrong with keeping a kind on a clock (none = it may): the clock is fair, and its warn is at least the kind's tell */
export function checkOnClock(def: PredatorDef, clock: ClockDef): string[] {
  const bad = checkClock(clock);
  if (!def.onBeat) bad.push(`${def.kind}: not an onBeat kind`);
  const warns = clock.phases.filter((p) => p.name === 'warn');
  if (!warns.length || !clock.phases.some((p) => p.name === 'on')) bad.push(`${def.kind}: clock ${clock.id} needs a warn and an on`);
  if (def.habit !== 'sweep' && warns.some((p) => p.seconds < def.tell)) bad.push(`${def.kind}: clock ${clock.id}'s warn is shorter than its ${def.tell} s tell`);
  return bad;
}

// ───────────────────────────── a predator in a stage ─────────────────────────────

export function newPredator(def: PredatorDef, post: Post): PredatorState {
  const facing = post.facing ?? 1;
  return {
    x: post.x, y: post.y, asleep: !!post.asleep, stunUntil: 0,
    phase: 'rest', t: 0, facing, homeX: post.x, homeY: post.y, minX: post.minX, maxX: post.maxX,
    eyeX: def.habit === 'sweep' ? (facing > 0 ? post.minX : post.maxX) : post.x,
    aimX: post.x, aimY: post.y, goalX: post.x, drawn: false, look: 0, knows: false, leaving: false,
    lost: 0, cool: 0, awayUntil: 0, saw: false, beatenBy: null,
  };
}

/** where it looks from: a sweeper's eye is its shadow, its gaze, its ripple */
export const eyeOf = (def: PredatorDef, s: PredatorState): number => (def.habit === 'sweep' ? s.eyeX : s.x);

const inSight = (def: PredatorDef, s: PredatorState, hero: Prey): boolean => {
  const dx = hero.x - eyeOf(def, s);
  return Math.abs(dx) <= (dx * s.facing >= 0 ? def.sight.ahead : def.sight.behind) && Math.abs(hero.y - s.y) <= def.sight.tall;
};

/** does it see him this frame? Its own box, then stillness.ts's rule */
export const sees = (def: PredatorDef, s: PredatorState, hero: Prey): boolean =>
  watcherSees({ seesStill: def.sight.seesStill || (def.sight.remembers && s.knows) }, inSight(def, s, hero), hero.still, hero.covered);

/** the box that hurts this frame: only while it acts */
export function hurt(def: PredatorDef, s: PredatorState): Box | null {
  if (s.phase !== 'act') return null;
  const a = def.act;
  if (a.aim === 'ahead') return { x: s.facing > 0 ? s.x : s.x - a.reach, y: s.y - a.tall, w: a.reach, h: a.tall };
  return { x: s.x - a.reach / 2, y: s.y - a.tall, w: a.reach, h: a.tall };
}

/** a hurt box against his body (feet at hero.y) */
export const touches = (b: Box | null, hero: { x: number; y: number }, halfW = 14, tall = 44): boolean =>
  !!b && hero.x + halfW > b.x && hero.x - halfW < b.x + b.w && hero.y > b.y && hero.y - tall < b.y + b.h;

/** does it stand in his way right now? (a guard, while it is up) */
export const blocks = (def: PredatorDef, s: PredatorState): boolean =>
  !!def.blocks && !s.asleep && s.phase !== 'stunned' && s.phase !== 'flee' && s.phase !== 'gone';

// ───────────────────────────── being beaten ─────────────────────────────

/** in the pause between two bursts of its gait */
const paused = (def: PredatorDef, s: PredatorState): boolean =>
  !!def.gait && s.phase === 'hunt' && s.t % (def.gait.go + def.gait.pause) >= def.gait.go;

const open = (def: PredatorDef, s: PredatorState): boolean => s.asleep || s.phase === 'recover' || s.phase === 'stunned' || paused(def, s);

/**
 * Try a way on it at game time t. True when it worked: the kind lists the way, and an 'open' way found it open. It then ends as the
 * data says. `fromX`: where the thing that beat it is, so a chased-off animal runs the other way. A way that does not work changes
 * nothing (what the hero gets for trying is the stage's business).
 */
export function beat(def: PredatorDef, s: PredatorState, way: Way, t: number, fromX?: number): boolean {
  const o = def.beatenBy[way];
  if (!o || s.phase === 'gone' || s.leaving) return false;
  if (o.when === 'open' && !open(def, s)) return false;
  if (o.when === 'behind' && !(fromX !== undefined && (fromX - s.x) * s.facing < 0)) return false;
  s.beatenBy = way;
  s.asleep = false;
  s.drawn = false;
  s.lost = 0;
  s.look = 0;
  if (o.ends === 'stunned') {
    s.stunUntil = Math.max(s.stunUntil, t + o.seconds);
    enter(s, 'stunned');
  } else if (o.ends === 'flees') {
    s.awayUntil = t + o.seconds;
    enter(s, 'flee');
  } else if (o.ends === 'dozes') {
    s.asleep = true;
    enter(s, 'rest');
  } else {
    s.leaving = true;
    s.facing = fromX === undefined || fromX === s.x ? (s.facing > 0 ? -1 : 1) : fromX < s.x ? 1 : -1;
    enter(s, 'flee');
  }
  return true;
}

/**
 * Let it hear a noise. heroNoise's rule first (a sleeper in reach wakes; the drum stuns the awake). Then, for a kind that `hears`:
 *   - a THROWN noise or a rung BELL is the lure (a noise made somewhere he is not): it goes there and looks, noticing nobody (a
 *     sweeper's eye does, during its pass);
 *   - his own noise (a landing, a punch, a break) is where HE is, so it is no lure: a hunter at rest comes looking for him with its
 *     eyes open ('alert'), and nothing is ever blinded by it.
 */
export function hear(def: PredatorDef, s: PredatorState, n: Sound): 'woke' | 'stunned' | 'drawn' | 'alert' | null {
  if (s.phase === 'gone' || s.phase === 'flee') return null;
  const r = sound([s], n);
  if (r.woke) {
    s.cool = DROWSY;
    return 'woke';
  }
  if (r.stunned) return 'stunned';
  // a sweeper listens where its eye is (its shadow is what a noise pulls away)
  if (def.hears === undefined || !reaches(n, def.habit === 'sweep' ? { x: s.eyeX, y: n.y } : s)) return null;
  if (n.from !== 'thrown' && n.from !== 'bell') {
    if (def.habit === 'sweep' || posted(def) || !(def.speed.hunt > 0) || s.phase !== 'rest') return null;
    enter(s, 'hunt');
    s.goalX = n.x;
    s.lost = 0;
    return 'alert';
  }
  if (def.habit === 'sweep' ? s.phase !== 'hunt' : s.phase !== 'rest' && s.phase !== 'hunt') return null;
  s.drawn = true;
  s.goalX = n.x;
  s.look = 0;
  return 'drawn';
}

/**
 * The food chain: every kind with something it `fears` awake and near (within that hunter's own sight ahead; a sweeper counts only
 * while its eye is out) is chased off by its 'lure' outcome, away from the hunter. The hunter does nothing to it. Returns how many ran.
 */
export function foodChain(all: ReadonlyArray<{ def: PredatorDef; s: PredatorState }>, t: number): number {
  let ran = 0;
  for (const a of all) {
    if (!a.def.fears?.length) continue;
    for (const b of all) {
      if (b === a || !a.def.fears.includes(b.def.kind)) continue;
      const p = b.s.phase;
      if (b.s.asleep || p === 'stunned' || p === 'flee' || p === 'gone' || (b.def.habit === 'sweep' && p === 'rest')) continue;
      const bx = eyeOf(b.def, b.s);
      if (Math.abs(bx - a.s.x) > b.def.sight.ahead) continue;
      if (beat(a.def, a.s, 'lure', t, bx)) ran++;
      break;
    }
  }
  return ran;
}

// ───────────────────────────── the step ─────────────────────────────

/** it has a post it returns to and never hunts from: by habit, or because nothing it does moves it (the frog) */
const posted = (def: PredatorDef): boolean =>
  def.habit === 'ambush' || def.habit === 'guard' || def.habit === 'drop' || def.habit === 'sweep' ||
  (def.speed.rest === 0 && def.speed.hunt === 0 && def.act.speed === 0 && def.shy === undefined);

function startTell(def: PredatorDef, s: PredatorState, hero: Prey, ev: PredatorEvents): void {
  if (def.habit !== 'sweep') s.facing = hero.x >= s.x ? 1 : -1;
  s.aimX = def.act.aim === 'below' ? s.x : hero.x;
  s.aimY = hero.y;
  enter(s, 'tell');
  ev.tell = true;
}

/** a beaten animal on its way: home for a while, or out of the stage */
function stepFlee(def: PredatorDef, s: PredatorState, sc: Scene): void {
  const v = Math.max(def.speed.hunt, def.speed.rest, 60) * 1.5 * sc.dt;
  if (s.leaving) {
    s.x += s.facing * v;
    s.eyeX += s.facing * v;
    if (s.t >= GONE_AFTER) enter(s, 'gone');
    return;
  }
  s.x = toward(s.x, s.homeX, v);
  s.y = toward(s.y, s.homeY, v);
  if (sc.t >= s.awayUntil) {
    enter(s, 'rest');
    s.cool = Math.max(s.cool, coolOf(def, sc.easy));
  }
}

/** a sweeper's pass is over: it turns round for the next one; a run of passes that found a still sloth is stillness winning */
function endPass(def: PredatorDef, s: PredatorState, sc: Scene, ev: PredatorEvents): void {
  const there = sc.hero.x >= s.minX && sc.hero.x <= s.maxX;
  s.facing = s.facing > 0 ? -1 : 1;
  s.drawn = false;
  if (s.saw) s.lost = 0;
  else if (there) s.lost += 1;
  if (!s.saw && there && sc.hero.still && s.lost >= def.giveUp && beat(def, s, 'still', sc.t)) {
    ev.beaten = 'still';
    return;
  }
  enter(s, 'rest');
  s.cool = coolOf(def, sc.easy);
}

/**
 * One fixed step. The stage hands it Pokey as stillness reads him and, for an `onBeat` kind, its clock. Returns what just happened.
 */
export function stepPredator(def: PredatorDef, s: PredatorState, sc: Scene): PredatorEvents {
  const ev: PredatorEvents = {};
  if (s.phase === 'gone') return ev;
  const { dt, hero, easy } = sc;
  s.t += dt;
  s.cool = Math.max(0, s.cool - dt);
  if (s.phase === 'flee') {
    stepFlee(def, s, sc);
    return ev;
  }
  if (isStunned(s, sc.t)) {
    if (s.phase !== 'stunned') enter(s, 'stunned');
    return ev;
  }
  if (s.phase === 'stunned') {
    enter(s, 'rest');
    s.cool = Math.max(s.cool, coolOf(def, easy));
  }
  if (s.asleep) {
    if (s.phase !== 'rest') enter(s, 'rest');
    s.cool = DROWSY;
    if (def.wakeAt !== undefined && !hero.still && Math.abs(hero.x - s.x) <= def.wakeAt && Math.abs(hero.y - s.y) <= def.sight.tall) s.asleep = false;
    return ev;
  }

  const k = speedOf(def, easy);
  const sweep = def.habit === 'sweep';
  const saw = !s.drawn && sees(def, s, hero);
  if (saw) s.knows = true;
  const on = (phase: 'warn' | 'on'): boolean => !def.onBeat || sc.beat?.phase === phase;
  const dist = Math.abs(hero.x - s.x);
  // where its body belongs between acts: its post, or (a sweeper that rides its eye) wherever its eye is
  const restX = def.rides ? s.eyeX : s.homeX;
  const home = Math.abs(s.x - restX) <= AT && Math.abs(s.y - s.homeY) <= AT;
  const ready = s.cool <= 0 && (def.act.aim === 'ahead' || home);
  const back = (def.speed.rest || def.act.speed * 0.5) * k * dt;

  switch (s.phase) {
    case 'rest': {
      if (posted(def)) {
        s.x = toward(s.x, restX, back);
        s.y = toward(s.y, s.homeY, back);
      } else if (def.speed.rest > 0 && s.maxX > s.minX) {
        s.x += s.facing * def.speed.rest * k * dt;
        if (s.x <= s.minX) s.facing = 1;
        else if (s.x >= s.maxX) s.facing = -1;
        s.x = clamp(s.x, s.minX, s.maxX);
      }
      if (sweep) {
        // the eye waits at the end its next pass starts from; the pass is called when he is in its stretch
        const end = s.facing > 0 ? s.minX : s.maxX;
        s.eyeX = toward(s.eyeX, end, def.speed.rest * 2 * dt);
        if (def.rides && home) s.x = s.eyeX;
        if (s.eyeX === end && home && s.cool <= 0 && hero.x >= s.minX && hero.x <= s.maxX && on('warn')) {
          enter(s, 'hunt');
          s.saw = false;
          ev.notice = true;
        }
        break;
      }
      if (s.drawn) {
        enter(s, 'hunt');
        break;
      }
      if (!saw) break;
      if (dist <= def.engage && ready && on('warn')) startTell(def, s, hero, ev);
      else if (!posted(def) && (def.speed.hunt > 0 || def.shy !== undefined)) {
        enter(s, 'hunt');
        s.lost = 0;
        s.goalX = hero.x;
        ev.notice = true;
      }
      break;
    }

    case 'hunt': {
      if (sweep) {
        const from = s.facing > 0 ? s.minX : s.maxX;
        const far = s.facing > 0 ? s.maxX : s.minX;
        // the eye shows at the end for the warn (longer on Easy) before it starts across; on a clock, it starts on the 'on'
        if (s.eyeX === from && !(s.t >= (def.warn ?? 0) * Math.max(1, easy ? def.easy.tell : 1) && on('on'))) break;
        if (s.drawn) {
          // a noise pulls the eye to it; it circles there and sees nobody
          const g = clamp(s.goalX, s.minX, s.maxX);
          s.eyeX = toward(s.eyeX, g, def.speed.rest * k * dt);
          if (def.rides) s.x = s.eyeX;
          if (s.eyeX === g && (s.look += dt) >= (def.hears ?? 0)) s.drawn = false;
          break;
        }
        s.eyeX = toward(s.eyeX, far, def.speed.rest * k * dt);
        if (def.rides) s.x = s.eyeX;
        if (sees(def, s, hero)) {
          s.saw = true;
          s.knows = true;
          if (ready) {
            startTell(def, s, hero, ev);
            break;
          }
        }
        if (s.eyeX === far) endPass(def, s, sc, ev);
        break;
      }
      if (s.drawn) {
        // the noise lure: go to it along its own ground, look for `hears` seconds, notice nobody
        // (one that cannot walk turns to the noise and looks from where it stands)
        const g = clamp(s.goalX, s.minX, s.maxX);
        const walk = (def.speed.hunt || def.speed.rest) * k * dt;
        if (Math.abs(s.goalX - s.x) > AT) s.facing = s.goalX >= s.x ? 1 : -1;
        if (Math.abs(g - s.x) > AT && walk > 0) s.x = toward(s.x, g, walk);
        else if ((s.look += dt) >= (def.hears ?? 0)) {
          s.drawn = false;
          enter(s, 'rest');
        }
        break;
      }
      if (saw) {
        s.goalX = hero.x;
        s.lost = 0;
      } else s.lost += dt;
      const dir: 1 | -1 = s.goalX >= s.x ? 1 : -1;
      // a shy kind strikes when he crowds it, or when it has backed to the end of its ground and he is still coming
      const cornered = def.shy !== undefined && (dir > 0 ? s.x <= s.minX + 1 : s.x >= s.maxX - 1) && dist <= def.engage * 1.5;
      if (saw && ready && on('warn') && (dist <= def.engage || cornered)) {
        startTell(def, s, hero, ev);
        break;
      }
      if (!saw && s.lost >= def.giveUp) {
        // it lost him. If he is right there, holding still, that is stillness beating it; if he ran, it just stands down
        if (hero.still && inSight(def, s, hero) && beat(def, s, 'still', sc.t)) ev.beaten = 'still';
        else {
          ev.lostHim = true;
          enter(s, 'rest');
        }
        break;
      }
      let v = 0;
      if (def.shy !== undefined) {
        if (saw) v = -dir * def.shy * k;
      } else if (Math.abs(s.goalX - s.x) > def.engage * 0.8) {
        v = dir * def.speed.hunt * k * (saw && def.watched !== undefined && hero.facing === -dir ? def.watched : 1);
      }
      if (paused(def, s)) v = 0;
      s.facing = dir;
      s.x = clamp(s.x + v * dt, s.minX, s.maxX);
      break;
    }

    case 'tell': {
      if (s.t < tellOf(def, easy) || !on('on')) break;
      // a sweeper that has found him is called off only by hiding (its dive follows him: running does not lose it)
      const hidden = !watcherSees({ seesStill: def.sight.seesStill || (def.sight.remembers && s.knows) }, true, hero.still, hero.covered);
      if (def.callsOff && (sweep ? hidden : !saw)) {
        // he went unseen before the tell ended: it calls the act off
        s.lost = 0;
        // an animal at its post that reared at a sloth who then went still: that is stillness beating it, there and then
        if (!sweep && posted(def) && hero.still && beat(def, s, 'still', sc.t)) {
          ev.beaten = 'still';
          break;
        }
        ev.lostHim = true;
        enter(s, sweep || (!posted(def) && (def.speed.hunt > 0 || def.shy !== undefined)) ? 'hunt' : 'rest');
        break;
      }
      // THE ONE DOOR into the phase that hurts
      enter(s, 'act');
      ev.act = true;
      break;
    }

    case 'act': {
      const a = def.act;
      let done = s.t >= a.seconds;
      if (a.aim === 'ahead') {
        if (a.speed > 0) {
          const nx = clamp(s.x + s.facing * a.speed * k * dt, s.minX, s.maxX);
          if (nx === s.x) done = true; // the end of its ground: a charge stops here
          s.x = nx;
        }
      } else {
        // 'below' comes down where he WAS when the tell began; 'him' follows him (only hiding before the tell ends stops it)
        if (a.aim === 'him') {
          s.aimX = hero.x;
          s.aimY = hero.y;
        }
        const step = a.speed * k * dt;
        const gap = Math.hypot(s.aimX - s.x, s.aimY - s.y);
        if (gap < 0.5) done = true; // it arrived on the step before: that frame hurt, this one ends it
        else if (gap <= step) {
          s.x = s.aimX;
          s.y = s.aimY;
        } else {
          s.x += ((s.aimX - s.x) / gap) * step;
          s.y += ((s.aimY - s.y) / gap) * step;
        }
      }
      if (done) enter(s, 'recover');
      break;
    }

    case 'recover': {
      if (s.t < def.recover) break;
      if (sweep) endPass(def, s, sc, ev);
      else {
        enter(s, 'rest');
        s.cool = coolOf(def, easy);
      }
      break;
    }
  }
  return ev;
}
