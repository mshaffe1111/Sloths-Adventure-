import { TextGlyph } from './icons/TextGlyph.tsx';
import React from 'react';
import { GhostOnExit } from './fx/exitGhost.ts';
import { sound } from '../game/audio.ts';
import type { SkillDef } from '../game/skills.ts';
import { HeroPose } from './HeroPose.tsx';
import { SkillIcon } from './SkillIcon.tsx';
import { arrowText } from './icons/arrowText.tsx';
import { GestureGlyph, type GlyphKind } from './GestureGlyph.tsx';
import { lessonInputMode, type InputMode } from '../game/lessons.ts';
import type { SkillId } from '../game/skills.ts';
import { dotText } from '../game/dotLines.ts';

/**
 * The controls the card shows, for the way this player is controlling the game. The skill's own list (skills.ts) names buttons and arrow
 * keys, which is right for a pad or a keyboard but showed key caps on a touch phone (inventory, 2026-10-26): a touch screen gets the thumb
 * gestures instead, each with its gesture picture.
 */
const TOUCH: Record<SkillId, { blurb: string; controls: Array<[GlyphKind, string, string]> }> = {
  shimmy: {
    blurb: 'Grab a rope and creep across, hand over hand. Ropes stretch over gaps you could never cross before.',
    controls: [
      ['up', 'Flick up', 'into a rope to grab it'],
      ['run', 'Slide \u2190 \u2192', 'to shimmy along it'],
      ['down', 'Slide down', 'to let go'],
    ],
  },
  glide: {
    blurb: 'Open a big leaf as you fall and drift down slowly, a long way out over the drop. Some drops ahead are too wide to cross without it.',
    controls: [
      ['up', 'Flick up', 'then keep your thumb on the glass as you fall'],
      ['run', 'Slide \u2190 \u2192', 'to steer while you drift'],
      ['tap', 'Lift your thumb', 'to drop normally'],
    ],
  },
};
const KEYS: Record<string, string> = { Jump: 'Space', Down: '\u2193' };
/** the note under the controls: from which stage the skill can be needed */
const WHERE: Record<SkillId, string> = { shimmy: 'Ropes can show up from stage 1-4.', glide: 'Some drops need it from stage 4-7.' };
const modeNow = (): InputMode => {
  try {
    return lessonInputMode();
  } catch {
    return 'screen';
  }
};

/** The "NEW SKILL!" card, shown right after the stage that teaches a skill is cleared (before the stage-cleared card). */
export const SkillLearned: React.FC<{ skill: SkillDef; onContinue: () => void }> = ({ skill, onContinue }) => {
  React.useEffect(() => {
    const id = window.setTimeout(() => sound.playStar(3), 250);
    return () => window.clearTimeout(id);
  }, []);
  const mode = modeNow();
  const touch = mode === 'screen' ? TOUCH[skill.id] : null;
  // on touch, Matt's approved lines for the card (words carry the gesture; there is no thumb picture)
  const fresh = mode === 'screen' ? { blurb: dotText(`skill.${skill.id}.blurb`), controls: dotText(`skill.${skill.id}.controls`), note: dotText(`skill.${skill.id}.note`) } : null;
  const heroH = Math.round(Math.max(120, Math.min(250, (typeof window !== 'undefined' ? window.innerHeight : 700) * 0.36)));

  return (
    <div className="clr-scrim sk-scrim select-none">
      <GhostOnExit />
      <div className="clr-card sk-card" role="dialog" aria-label={`New skill: ${skill.name}`}>
        <div className="clr-ribbon">
          <svg viewBox="0 0 420 68" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 14h40v46H0l16-23z" fill="#b45309" />
            <path d="M420 14h-40v46h40l-16-23z" fill="#b45309" />
            <path d="M30 4h360v56H30z" fill="#fbbf24" stroke="#92400e" strokeWidth="3" strokeLinejoin="round" />
            <path d="M30 14h360" stroke="#fde68a" strokeWidth="3" opacity=".8" />
          </svg>
          <h2>NEW SKILL!</h2>
        </div>

        <div className="clr-hero sk-hero">
          <svg className="sk-rope" viewBox="0 0 230 40" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-6 16 Q115 30 236 16" fill="none" stroke="#fde68a" strokeWidth="9" strokeLinecap="round" />
            <path d="M-6 16 Q115 30 236 16" fill="none" stroke="#b45309" strokeWidth="3" strokeDasharray="5 8" strokeLinecap="round" />
          </svg>
          <HeroPose frame="jump_up" height={heroH} label="Pokey hangs from a rope" className="sk-hang" />
        </div>

        <div className="clr-main">
          <div className="sk-title">
            <SkillIcon skill={skill.id} size={86} />
            <div>
              <span className="sk-kicker">YOU LEARNED</span>
              <h3 className="sk-name kit-plaque">
                <span>{skill.name}</span>
              </h3>
            </div>
          </div>
          <p className="sk-blurb">{fresh?.blurb || touch?.blurb || skill.blurb}</p>
          <div className="sk-controls">
            {fresh?.controls && (
              <div className="sk-chip sk-touch">
                <span>{fresh.controls}</span>
              </div>
            )}
            {!fresh?.controls && touch?.controls.map(([glyph, how, what]) => (
              <div key={what} className="sk-chip sk-touch">
                <GestureGlyph kind={glyph} size={44} />
                <span className="sk-key">{arrowText(how, '1em')}</span>
                <span>{what}</span>
              </div>
            ))}
            {!fresh?.controls && !touch && skill.controls.map(([keys0, what]) => {
              // a keyboard names its keys (Space, the arrows); a pad keeps the button names
              const keys = mode === 'keys' ? keys0.map((k) => KEYS[k] ?? k) : keys0;
              return (
              <div key={what} className="sk-chip">
                {keys.map((k, i) => (
                  <React.Fragment key={k}>
                    {i > 0 && <span className="sk-or">{keys[0] === '\u2190' ? '' : 'or'}</span>}
                    <span className="sk-key">{arrowText(k, '1em')}</span>
                  </React.Fragment>
                ))}
                <span>{what}</span>
              </div>
              );
            })}
          </div>
          <div className="clr-clue sk-note">
            <div>
              <p>
                {fresh?.note ? (
                  <b>{fresh.note}</b>
                ) : (
                  <>
                    <b>It is yours for the rest of the game.</b> {WHERE[skill.id] ?? ''}
                  </>
                )}
              </p>
            </div>
          </div>
          <button type="button" className="pm-go" data-start="true" onClick={onContinue}>
            Continue
            <TextGlyph name="arrow" size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
