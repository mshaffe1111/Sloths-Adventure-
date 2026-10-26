/**
 * The new HUD (beta, behind `newLook`): Matt's pick B, the hanging vine, with D's bloom-on-change (2026-10-26).
 *
 *   top-left:   a vine with the hearts hanging on threads. Lives, the power-up and the stage name hang lower down, and only show
 *               when they change.
 *   top centre: the goal counter, the biggest piece (Matt, 2026-10-26: "make the counter bigger and in the middle"): a plate on
 *               the canopy vine with the icon and the count (slots for small quotas, a little trail for distance stages). The
 *               stage-start goal card shrinks into it. In a boss fight the boss bar takes the top centre instead.
 *   top-right:  the Menu, a hanging leaf (a 44 pt+ touch box), with the score under it when it changes.
 *   Dot's room is under all of it (hudSafeRect).
 *
 * What is visible when lives in bloom.ts (tested); where things sit and the room left for Dot in hudLayout.ts.
 */
import React from 'react';
import { DOT_STAGE_ID } from '../../game/extraStages.ts';
import type { LevelConfig } from '../../game/types.ts';
import { HeroFaceIcon } from '../HeroFaceIcon.tsx';
import { DotFace } from '../DotFace.tsx';
import { BossHud } from '../BossHud.tsx';
import { bloomUpdate, bloomView, newBloom, nextBloomEdge, showsSlots, type HudValues } from './bloom.ts';
import { bossRect, centreGeo, centrePlace, counterW, heartsShown, hudGeo, hudMode, hudSafeRect, type Insets } from './hudLayout.ts';
import { goalInfo } from './goalInfo.ts';
import { Bolt, GoalPic, Heart, HudDefs, Leaf, MenuLines, Star, Tick, Vine, vineY } from './hudArt.tsx';
import { GoalCard } from './GoalCard.tsx';
import './hud.css';

export interface VineHudProps {
  levelConfig: LevelConfig;
  hp: number;
  maxHp: number;
  currentObjectiveCount: number;
  targetObjectiveCount: number;
  distanceRatio?: number;
  score: number;
  onMenu: () => void;
  bossHp?: number;
  bossMaxHp?: number;
  bossName?: string;
  bossPhase?: number;
  bossHits?: number;
  bossAccent?: string;
  bossEntering?: boolean;
  activePowerUp?: 'speed' | 'invincible' | 'magnet' | null;
  powerUpTimer?: number;
  lives?: number;
  /** where Pokey is on the screen (CSS px): a pickup flies from here into the counter */
  heroPoint?: () => { x: number; y: number } | null;
  /** a new number each time the stage (re)starts */
  runKey?: number;
}

const POWER = {
  speed: { label: 'Cheetah speed', color: '#6ee7b7', secs: 8 },
  invincible: { label: 'Solar shield', color: '#fde047', secs: 8 },
  magnet: { label: 'Nectar magnet', color: '#7dd3fc', secs: 10 },
} as const;

const THREADS = [7, 11, 8, 12, 9, 10, 8];
const THREADS_SHORT = [4, 7, 5, 8, 6, 7, 5];
const TILT = [-6, 4, -3, 6, -4, 3, -5];

function useViewport() {
  const read = () => ({ w: typeof window !== 'undefined' ? window.innerWidth : 844, h: typeof window !== 'undefined' ? window.innerHeight : 390 });
  const [vp, setVp] = React.useState(read);
  React.useEffect(() => {
    const on = () => setVp(read());
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
    };
  }, []);
  return vp;
}

/** the safe-area insets, read from a probe that uses env() (0 where there are none) */
function readInsets(probe: HTMLElement | null): Insets {
  if (!probe) return { top: 0, right: 0, bottom: 0, left: 0 };
  const cs = getComputedStyle(probe);
  const n = (v: string) => parseFloat(v) || 0;
  return { top: n(cs.paddingTop), right: n(cs.paddingRight), bottom: n(cs.paddingBottom), left: n(cs.paddingLeft) };
}

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const VineHud: React.FC<VineHudProps> = (props) => {
  const { levelConfig, hp, maxHp, currentObjectiveCount, targetObjectiveCount, distanceRatio = 0, score, onMenu, activePowerUp, powerUpTimer, lives = 3, heroPoint } = props;
  const isBoss = props.bossHp !== undefined && props.bossMaxHp !== undefined;
  const dotStage = levelConfig.id === DOT_STAGE_ID;
  // (the count the engine sends wins over the stage's planned one: an easier layout can ask for a different number)
  const info = React.useMemo(
    () => goalInfo({ ...levelConfig, targetCount: targetObjectiveCount || levelConfig.targetCount }, dotStage),
    [levelConfig, dotStage, targetObjectiveCount],
  );
  const target = info.kind === 'count' ? targetObjectiveCount : 0;
  const slots = showsSlots(target);

  const vp = useViewport();
  const mode = hudMode(vp.w, vp.h);
  const g = hudGeo(mode, vp.h);
  const short = mode === 'short';
  /** the smallest sizes (about 640x320) */
  const tiny = short && g.heart <= 18;
  const probe = React.useRef<HTMLDivElement>(null);
  const [ins, setIns] = React.useState<Insets>({ top: 0, right: 0, bottom: 0, left: 0 });
  React.useLayoutEffect(() => {
    const next = readInsets(probe.current);
    setIns((o) => (o.top === next.top && o.left === next.left && o.right === next.right && o.bottom === next.bottom ? o : next));
  }, [vp.w, vp.h]);

  // --- the goal count shown: a pickup flies to the counter first, and the number ticks when it lands ---
  const [shownGoal, setShownGoal] = React.useState(currentObjectiveCount);
  const counterRef = React.useRef<HTMLDivElement>(null);
  const iconRef = React.useRef<HTMLSpanElement>(null);
  const flyLayer = React.useRef<HTMLDivElement>(null);
  const lastGoal = React.useRef(currentObjectiveCount);
  const heroAt = React.useRef(heroPoint);
  heroAt.current = heroPoint;
  React.useEffect(() => {
    const before = lastGoal.current;
    if (currentObjectiveCount === before) return;
    lastGoal.current = currentObjectiveCount;
    if (currentObjectiveCount < before || info.kind !== 'count' || reducedMotion()) {
      setShownGoal(currentObjectiveCount);
      return;
    }
    const from = heroAt.current?.() ?? null;
    const to = iconRef.current?.getBoundingClientRect();
    const layer = flyLayer.current;
    if (!from || !to || !layer || layer.childElementCount > 4) {
      setShownGoal(currentObjectiveCount);
      return;
    }
    // one small picture per pickup, moved by the compositor (no React state per frame)
    const src = iconRef.current?.querySelector('img');
    const el = document.createElement('div');
    el.className = 'vh-fly';
    if (src) {
      const im = document.createElement('img');
      im.src = src.src;
      im.alt = '';
      el.appendChild(im);
    } else {
      el.classList.add('spark');
    }
    layer.appendChild(el);
    const tx = to.left + to.width / 2, ty = to.top + to.height / 2;
    const mx = (from.x + tx) / 2, my = Math.min(from.y, ty) - 60;
    const anim = el.animate(
      [
        { transform: `translate(${from.x}px, ${from.y}px) scale(1.1)`, opacity: 0.95 },
        { transform: `translate(${mx}px, ${my}px) scale(1)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${tx}px, ${ty}px) scale(.7)`, opacity: 0.9 },
      ],
      { duration: 440, easing: 'cubic-bezier(.4,.1,.6,1)', fill: 'forwards' },
    );
    const n = currentObjectiveCount;
    const done = () => {
      el.remove();
      setShownGoal((s) => Math.max(s, n));
    };
    anim.onfinish = done;
    anim.oncancel = done;
    // (a safety net: the flight's own end normally comes first; it is not cleared by the next pickup)
    window.setTimeout(done, 700);
  }, [currentObjectiveCount, info.kind]);
  // (a restart sets the count back at once)
  const goalNow = currentObjectiveCount < shownGoal ? currentObjectiveCount : shownGoal;

  // --- bloom: what is visible now ---
  const track = React.useRef(newBloom());
  const values = React.useRef<HudValues>({ hp, maxHp, goal: 0, target: 0, lives, score, stage: '', power: null });
  const vals = values.current;
  vals.hp = hp;
  vals.maxHp = maxHp;
  vals.goal = goalNow;
  vals.target = target;
  vals.lives = lives;
  vals.score = score;
  vals.stage = `${levelConfig.id}#${props.runKey ?? 0}`;
  vals.power = activePowerUp ?? null;
  const now = performance.now();
  bloomUpdate(track.current, vals, now);
  const view = bloomView(track.current, now);
  const [, tick] = React.useReducer((n: number) => n + 1, 0);
  const edge = nextBloomEdge(track.current, now);
  React.useEffect(() => {
    if (edge < 0) return;
    const t = window.setTimeout(tick, edge + 16);
    return () => window.clearTimeout(t);
  });

  // --- Dot's room, for the Dot helper (CSS variables on <html>) ---
  const nHearts = heartsShown(mode, maxHp);
  // the goal counter hangs at the top centre and is the biggest thing up there (Matt, 2026-10-26). In a boss fight the bar takes
  // the top centre: the counter goes away, or (a fight that also counts something) hangs smaller under the bar.
  const boss = isBoss ? bossRect(vp.w, vp.h, ins) : null;
  const underBoss = isBoss && info.kind === 'count';
  const cg = underBoss ? centreGeo('short', 320) : centreGeo(mode, vp.h);
  const ckind = isBoss && !underBoss ? 'none' : info.kind === 'count' ? (slots ? 'slots' : 'count') : info.kind === 'distance' ? 'distance' : 'none';
  const cw = counterW(cg, ckind, target);
  const place = cw > 0 ? centrePlace(vp.w, vp.h, cw, { hearts: nHearts, insets: ins, underBoss: underBoss && boss ? boss : undefined }) : null;
  const safe = hudSafeRect(vp.w, vp.h, { boss: isBoss, hearts: nHearts, counter: cw, insets: ins });
  React.useLayoutEffect(() => {
    const r = document.documentElement;
    r.dataset.hud = 'vine';
    r.dataset.hudMode = mode;
    if (isBoss) r.dataset.hudBoss = '1';
    else delete r.dataset.hudBoss;
    const s = r.style;
    s.setProperty('--hud-lane-x', `${safe.x}px`);
    s.setProperty('--hud-lane-y', `${safe.y}px`);
    s.setProperty('--hud-lane-w', `${safe.w}px`);
    s.setProperty('--hud-lane-h', `${safe.h}px`);
    s.setProperty('--hud-band-bottom', `${safe.bandBottom}px`);
  }, [mode, isBoss, safe.x, safe.y, safe.w, safe.h, safe.bandBottom]);
  React.useEffect(
    () => () => {
      const r = document.documentElement;
      delete r.dataset.hud;
      delete r.dataset.hudMode;
      delete r.dataset.hudBoss;
      for (const k of ['--hud-lane-x', '--hud-lane-y', '--hud-lane-w', '--hud-lane-h', '--hud-band-bottom']) r.style.removeProperty(k);
    },
    [],
  );

  // --- the hearts' geometry (top-left) ---
  const hs = g.heart;
  const base = g.vineY;
  const hx0 = g.gutter + hs / 2 + 2;
  const threads = short ? THREADS_SHORT : THREADS;
  const folded = nHearts < maxHp;
  const lastHeartX = hx0 + (nHearts - 1) * g.step + (folded ? 30 : 0);
  const vineEnd = lastHeartX + hs / 2 + 12;

  const hearts: React.ReactNode[] = [];
  for (let i = 0; i < nHearts; i++) {
    const x = hx0 + i * g.step;
    const y = vineY(x, base) + 3;
    const len = threads[i % threads.length];
    const lost = view.heartDelta < 0 && i >= hp && i < hp - view.heartDelta;
    const thorn = maxHp > 5 && i === maxHp - 1;
    const st = folded ? (hp > 0 ? 'full' : 'empty') : lost ? 'lost' : i < hp ? (thorn ? 'thorn' : 'full') : 'empty';
    const won = view.heartDelta > 0 && i < hp && i >= hp - view.heartDelta;
    hearts.push(
      <React.Fragment key={i}>
        <span className="vh-thread" style={{ left: x - 1, top: y, height: len }} />
        <span className={`vh-hang vh-heart${won ? ' won' : ''}`} style={{ left: x - hs / 2, top: y + len - 3, ['--tilt' as string]: `${TILT[i % TILT.length]}deg` }}>
          <Heart size={hs} state={st} />
        </span>
      </React.Fragment>,
    );
  }

  // --- the centre counter: its own bit of vine, two threads, and a plate holding the icon and the count (or slots, or the trail) ---
  let goal: React.ReactNode = null;
  if (place) {
    const pv = cg.vineY;
    const plateTop = pv + 7;
    const plateH = cg.height - plateTop;
    let inner: React.ReactNode;
    let label = '';
    if (ckind === 'slots') {
      const items: React.ReactNode[] = [];
      for (let i = 0; i < target; i++) {
        items.push(
          <span key={i} className={`vh-slot${i < goalNow ? ' on' : ''}`} style={{ width: cg.slot, height: cg.slot }}>
            <GoalPic icon={info.slotIcon(i)} size={cg.slot} />
          </span>,
        );
      }
      inner = (
        <>
          <span ref={iconRef} className="vh-slots">{items}</span>
          {view.goalMet && <Tick size={Math.round(cg.slot * 0.7)} />}
        </>
      );
      label = `${goalNow} of ${target} ${info.noun}`;
    } else if (ckind === 'count') {
      inner = (
        <>
          <span ref={iconRef} className="vh-goal-icon">
            <GoalPic icon={info.icon} size={cg.icon} />
          </span>
          <span className="vh-cnum" style={{ fontSize: cg.num }}>
            {goalNow}
            <small style={{ fontSize: Math.round(cg.num * 0.66) }}>/{target}</small>
          </span>
          {view.goalMet && <Tick size={Math.round(cg.num * 0.7)} />}
        </>
      );
      label = `${goalNow} of ${target} ${info.noun}`;
    } else {
      const r = Math.max(0, Math.min(1, distanceRatio));
      const fs = Math.round(cg.icon * 0.7);
      const tw = cw - 24 - Math.round(cg.icon * 0.6);
      inner = (
        <span className="vh-trail-box" style={{ width: tw + Math.round(cg.icon * 0.6), height: fs + 4 }}>
          <span className="vh-trail" style={{ left: 0, top: fs / 2 - 2, width: tw }}>
            <span className="vh-trail-fill" style={{ width: `${r * 100}%` }} />
          </span>
          <span ref={iconRef} className="vh-trail-door" style={{ left: tw - 4, top: -2 }}>
            <GoalPic icon={info.icon} size={Math.round(cg.icon * 0.62)} />
          </span>
          <span className="vh-trail-face" style={{ left: r * (tw - fs) , top: 0 }}>
            {dotStage ? <DotFace size={fs + 4} face="closed" /> : <HeroFaceIcon size={fs} face="face_happy" />}
          </span>
        </span>
      );
    }
    goal = (
      <div
        ref={counterRef}
        className={`vh-centre vh-goal ${ckind} ${ckind === 'distance' ? 'small' : view.goal}${view.goalGlow ? ' glow' : ''}${view.goalMet ? ' met' : ''}`}
        style={{ left: place.x, top: place.y, width: cw, height: cg.height }}
        {...(ckind === 'distance'
          ? { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(Math.max(0, Math.min(1, distanceRatio)) * 100), 'aria-label': 'How far along the stage' }
          : { role: 'img', 'aria-label': label })}
      >
        {place.row === 1 && !underBoss ? (
          // in the top row its vine is the canopy strung from the hearts' vine across to the Menu's
          <Vine x0={Math.round(ins.left + vineEnd - 14 - place.x)} x1={Math.round(vp.w - ins.right - g.gutter - g.menu - 16 - place.x)} base={pv} amp={2.4} ph={1.3} />
        ) : (
          <Vine x0={-26} x1={cw + 18} base={pv} amp={2.4} ph={1.3} curl />
        )}
        {place.row === 1 && <Leaf frame="green_A02_3" w={Math.round(cg.icon * 0.5)} style={{ left: -12, top: pv - 13, transform: 'rotate(-30deg)' }} />}
        {<Leaf frame="green_A01_3" w={Math.round(cg.icon * 0.5)} style={{ left: cw - 6, top: pv - 15, transform: 'rotate(20deg)' }} />}
        <span className="vh-thread" style={{ left: Math.round(cw * 0.2), top: pv + 2, height: plateTop - pv }} />
        <span className="vh-thread" style={{ left: Math.round(cw * 0.8), top: pv + 2, height: plateTop - pv }} />
        <span className="vh-cplate" style={{ top: plateTop, height: plateH, gap: Math.round(cg.icon * 0.18) }}>
          {inner}
        </span>
        {view.goalDelta > 0 && ckind !== 'distance' && (
          <span className="vh-tag gold" style={{ left: cw / 2 - 10, top: cg.height + 2, fontSize: Math.round(cg.num * 0.6) }}>
            +{view.goalDelta}
          </span>
        )}
      </div>
    );
  }

  // lives (on change only), hung between the second and third hearts (lower down while a power-up pod hangs too)
  // (when the counter takes a row of its own under the hearts, upright on a narrow phone, the medallion keeps to the left edge, clear of it)
  const lowRow = !!place && place.row === 2 && !underBoss;
  const livesX = lowRow ? hx0 + 2 : hx0 + 1.5 * g.step;
  const livesY = vineY(livesX, base) + 3;
  const ls = tiny ? 32 : lowRow ? 34 : 40;
  // the power-up pod (while it lasts), under the first heart
  const power = activePowerUp ? POWER[activePowerUp] : null;
  const podX = hx0 + 0.5 * g.step;
  const podY = vineY(podX, base) + 3;
  const podLen = tiny ? 20 : 30;
  const left = power ? Math.max(0, Math.min(1, (powerUpTimer ?? 0) / power.secs)) : 0;
  const pod = tiny ? 26 : 30;
  // the lives medallion hangs below the pod while both are up
  const livesLen = (tiny ? 26 : 34) + (power ? pod + 8 : 0);

  // the stage name tag (on change only; the goal card carries it at the start)
  const stageLabel = `${levelConfig.secret ? 'Secret' : levelConfig.id} · ${levelConfig.name}`;
  const showCard = !isBoss && (info.kind === 'count' || info.kind === 'distance');

  // the right cluster: the Menu leaf, with the score hanging under it when it changes
  const mw = g.menu;

  return (
    <div className={`vh vh-${mode}${props.bossEntering ? ' entering' : ''}`} data-testid="vine-hud">
      <div ref={probe} className="vh-probe" aria-hidden="true" />
      <HudDefs />
      <div className="vh-left">
        <div className="vh-shade" style={{ width: vineEnd + 70, height: tiny ? 58 : 78 }} />
        <Vine x0={-10 - Math.round(ins.left)} x1={vineEnd} base={base} curl={!(place && place.row === 1 && !underBoss)} />
        <Leaf frame="big_B06_0" w={tiny ? 34 : 42} style={{ left: -14, top: base - 20, transform: 'rotate(-20deg)' }} />
        <Leaf frame="green_A01_3" w={tiny ? 16 : 20} style={{ left: hx0 + 1.5 * g.step, top: base - 17, transform: 'rotate(-40deg)' }} />
        <Leaf frame="green_A02_3" w={tiny ? 15 : 18} style={{ left: hx0 + 3.5 * g.step, top: base - 15, transform: 'rotate(25deg)' }} />
        <Leaf frame="green_A01_3" w={tiny ? 16 : 20} style={{ left: vineEnd - 20, top: base - 18, transform: 'rotate(-15deg)' }} />
        <div className={`vh-hearts ${view.hearts}${hp <= 1 && hp > 0 ? ' low' : ''}`} role="img" aria-label={`Health: ${hp} of ${maxHp} hearts`}>
          {hearts}
          {folded && (
            <span className="vh-num" style={{ left: hx0 + hs / 2 + 3, top: vineY(hx0, base) + threads[0] + 1, fontSize: g.num - 2 }}>
              &times;{hp}
            </span>
          )}
        </div>
        {power && (
          <div className={`vh-power ${view.power}${view.lives === 'bloom' || lowRow ? ' quiet' : ''}`} role="img" aria-label={`${power.label}: ${Math.ceil(powerUpTimer ?? 0)} seconds left`}>
            <span className="vh-thread" style={{ left: podX - 1, top: podY, height: podLen }} />
            <span className="vh-hang vh-pod" style={{ left: podX - pod / 2, top: podY + podLen - 2, width: pod, height: pod, background: `conic-gradient(${power.color} 0 ${left * 100}%, rgba(30,20,8,.6) ${left * 100}% 100%)` }}>
              <span className="vh-pod-in">
                <Bolt size={tiny ? 12 : 14} color={power.color} />
              </span>
            </span>
            <span className="vh-num vh-pod-label" style={{ left: podX + pod / 2 + 4, top: podY + podLen + pod / 2 - 9 }}>
              {power.label}
            </span>
          </div>
        )}
        <div className={`vh-lives ${view.lives}`} role="img" aria-label={`Lives: ${lives}`} aria-hidden={view.lives === 'hidden'}>
          <span className="vh-thread" style={{ left: livesX - 1, top: livesY, height: livesLen }} />
          <span className="vh-hang vh-medal-wrap" style={{ left: livesX - ls / 2, top: livesY + livesLen - 4, ['--tilt' as string]: '5deg' }}>
            <span className="vh-medal" style={{ width: ls, height: ls }}>
              {dotStage ? <DotFace size={ls} face="closed" /> : <HeroFaceIcon size={ls - 4} face="face_happy" />}
            </span>
            <span className="vh-num" style={{ fontSize: tiny ? 18 : 21 }}>&times;{lives}</span>
            {view.livesDelta !== 0 && <span className={`vh-num vh-delta ${view.livesDelta < 0 ? 'bad' : 'gold'}`}>{view.livesDelta > 0 ? `+${view.livesDelta}` : `−${-view.livesDelta}`}</span>}
          </span>
        </div>
        {!showCard && !isBoss && (
          <div className={`vh-stage ${view.stage}`} aria-hidden="true" style={{ left: g.gutter, top: base + (tiny ? 30 : 40) }}>
            {stageLabel}
          </div>
        )}
      </div>

      <div className="vh-right">
        <Vine x0={0} x1={mw + g.gutter + 30 + Math.round(ins.right)} base={base} ph={2} style={{ left: 'auto', right: -34 - Math.round(ins.right) }} className="vh-menu-vine" />
        <button
          type="button"
          className="vh-menu"
          onClick={onMenu}
          aria-label="Menu (pauses the game)"
          title="Menu [Esc]"
          style={{ right: g.gutter - (g.menuHit - mw) / 2, top: base - 4, width: g.menuHit, height: g.menuHit + 6 }}
        >
          <Leaf frame="big_C10_0" w={mw} className="vh-menu-leaf" style={{ left: (g.menuHit - mw) / 2, top: -2 }} />
          <span className="vh-menu-lines">
            <MenuLines size={tiny ? 20 : 22} />
          </span>
        </button>
        <div className={`vh-score ${view.score}`} aria-label={`Score ${score.toLocaleString()}`} style={{ right: g.gutter - 4, top: base + g.menuHit + (tiny ? 0 : 6) }}>
          <span className="vh-plate">
            <Star size={tiny ? 16 : 19} />
            <span className="vh-num" style={{ position: 'static', fontSize: tiny ? 16 : 19 }}>{score.toLocaleString()}</span>
          </span>
          {view.scoreDelta > 0 && <span className="vh-num vh-delta gold">+{view.scoreDelta.toLocaleString()}</span>}
        </div>
      </div>

      {goal}

      {boss && (
        <div className="vh-boss" style={{ left: boss.x, top: boss.y, width: boss.w }}>
          <Leaf frame="big_B03_0" w={tiny ? 28 : 34} className="vh-boss-leaf" style={{ left: -24, bottom: -10, transform: 'rotate(-160deg)', zIndex: 1 }} />
          <Leaf frame="big_C05_0" w={tiny ? 28 : 34} className="vh-boss-leaf" style={{ right: -24, bottom: -8, transform: 'rotate(20deg)', zIndex: 1 }} />
          <BossHud
            name={props.bossName || 'Stage boss'}
            hp={props.bossHp!}
            maxHp={props.bossMaxHp!}
            phase={props.bossPhase ?? 1}
            hits={props.bossHits}
            heroHp={hp}
            heroMaxHp={maxHp}
            accent={props.bossAccent}
            vine
            compact={boss.w < 340}
          />
        </div>
      )}

      {showCard && (
        <GoalCard key={`${levelConfig.id}#${props.runKey ?? 0}`} stageId={levelConfig.id} label={stageLabel} info={info} target={target} lane={safe} mode={mode} counter={counterRef} />
      )}

      <div ref={flyLayer} className="vh-fly-layer" aria-hidden="true" />
    </div>
  );
};
