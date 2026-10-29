import React from 'react';
import type { LevelConfig } from '../game/types.ts';
import { GhostOnExit } from './fx/exitGhost.ts';
import { ClrRibbon } from './ClrParts.tsx';
import { DotPerched } from './KitParts.tsx';
import { HeroPose } from './HeroPose.tsx';
import { Icon } from './icons/index.tsx';
import { Crest } from './icons/Crest.tsx';
import { crestName } from './icons/crests.ts';
import { countValue, easeOut } from './fx/countUp.ts';
import { sound } from '../game/audio.ts';

/** keyboard shortcut hints only make sense when there is a keyboard (not on a touch-only phone) */
const COARSE = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;

/**
 * Dot's one line before each guardian (UI-5): sentence case, under ten words, the first thing to watch for and no more (Dot is a
 * guide, not a narrator). Key: the world, 11 for Thornbark.
 */
export const BOSS_DOT_LINE: Record<number, string> = {
  1: 'When the floor flashes, get off it!',
  2: 'He rolls hard. Hit him while he is dizzy.',
  3: 'He fades away. Turn and find him!',
  4: 'Stay close to the rocks, Pokey.',
  5: 'Jump the venom, then hit what glows.',
  6: 'Low sweep, jump. High swipe, duck.',
  7: 'Jump the hammer, then hit what glows.',
  8: 'Low rings, jump. High rings, stay down.',
  9: 'Fire comes at chest height. Duck or jump!',
  10: 'The last giant. Hit whatever glows!',
  11: 'He copies you. Wait for the red glow.',
};

/**
 * Before a guardian fight, after its painted scene: the same wooden card as Stage Cleared, with the guardian's painted portrait,
 * its name carved on the plaque, one line from Dot, and Let's go.
 */
export const BossIntroCard: React.FC<{ levelConfig: LevelConfig; onGo: () => void }> = ({ levelConfig, onGo }) => {
  const key = levelConfig.secret ? 'thornbark' : levelConfig.worldIndex;
  const line = BOSS_DOT_LINE[levelConfig.secret ? 11 : levelConfig.worldIndex] ?? 'Watch for the red glow, Pokey.';
  const short = typeof window !== 'undefined' && window.innerHeight <= 520;
  return (
    <div className="clr-scrim boss select-none">
      <GhostOnExit />
      <div className="clr-card boss-card" role="dialog" aria-label={`${crestName(key)}: guardian fight`}>
        <ClrRibbon title={levelConfig.secret ? 'Secret guardian' : 'Guardian ahead'} />
        <div className="boss-card-pic">
          <Crest world={key} size={short ? 150 : 190} label={crestName(key)} className="boss-card-crest" />
        </div>
        <div className="clr-main">
          <div className="clr-stage">
            {levelConfig.secret ? 'Secret stage' : `Stage ${levelConfig.id}`}
          </div>
          <h3 className="boss-card-name">{levelConfig.name}</h3>
          <div className="boss-card-dot">
            <DotPerched size={short ? 46 : 56} className="boss-card-dotpic" facing="right" />
            <p className="boss-card-line">
              <b>Dot</b>
              {line}
            </p>
          </div>
          <button type="button" className="pm-go" data-start="true" onClick={onGo}>
            Let's go!
            <Icon name="swords" size={24} />
          </button>
          {!COARSE && <p className="clr-note">Space or Enter to start the fight</p>}
        </div>
      </div>
    </div>
  );
};

/** every stage's best score added up (the stage records in localStorage), for the expedition total on the ending card */
export function expeditionScore(): number {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith('sloth_lvl_')) continue;
      const v = JSON.parse(localStorage.getItem(k) ?? 'null');
      if (v && typeof v.highScore === 'number') total += v.highScore;
    }
  } catch {
    /* unreadable records: count what was read */
  }
  return total;
}

/** the expedition total counts up once as the card opens (held at its final value where motion is turned down) */
function useCount(final: number): number {
  const reduced = React.useMemo(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, []);
  const [v, setV] = React.useState(reduced ? final : 0);
  React.useEffect(() => {
    if (reduced || final <= 0) {
      setV(final);
      return;
    }
    const t0 = performance.now() + 600;
    let raf = 0;
    let last = -1;
    const step = () => {
      const t = (performance.now() - t0) / 1400;
      if (t >= 0 && performance.now() - last >= 33) {
        last = performance.now();
        setV(countValue(final, easeOut(t)));
      }
      if (t < 1) raf = requestAnimationFrame(step);
      else sound.playUiConfirm();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [final, reduced]);
  return v;
}

/** The end of the story: the same wooden card, Pokey and Meeca together, the expedition's total, then the map or the title. */
export const EndingCard: React.FC<{ onOpenMap: () => void; onOpenTitle: () => void }> = ({ onOpenMap, onOpenTitle }) => {
  const total = React.useMemo(() => expeditionScore(), []);
  const shown = useCount(total);
  const h = typeof window !== 'undefined' && window.innerHeight <= 520 ? 120 : 170;
  return (
    <div className="clr-scrim ending select-none">
      <GhostOnExit />
      <div className="clr-card ending-card" role="dialog" aria-label="Meeca is saved">
        <ClrRibbon title="Meeca is saved!" />
        <div className="ending-pair" aria-hidden="true">
          <HeroPose frame="cheer_b" height={h} maxWidth={h * 0.8} className="ending-pokey" />
          <Icon name="heart" size={Math.round(h * 0.22)} className="ending-heart" />
          <Crest world="meeca" size={Math.round(h * 0.72)} className="ending-meeca" />
        </div>
        <div className="clr-main">
          <div className="clr-praise in">
            <b>Home at last</b>
            <span>Ten worlds, a hundred trials, and General Iron-Claw himself. Meeca is home, the Heartbloom glows, and the canopy is at peace.</span>
          </div>
          <div className="clr-chips" style={{ ['--n' as string]: 1 }}>
            <div className="clr-chip">
              <span>Expedition score</span>
              <b style={{ color: '#fde68a' }}>{shown.toLocaleString()}</b>
            </div>
          </div>
          <button type="button" className="pm-go" data-start="true" onClick={onOpenMap}>
            World map
            <Icon name="map" size={24} />
          </button>
          <div className="clr-sec one">
            <button type="button" className="clr-btn2" onClick={onOpenTitle}>
              Title screen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
