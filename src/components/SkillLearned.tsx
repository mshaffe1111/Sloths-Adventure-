import React from 'react';
import { sound } from '../game/audio.ts';
import type { SkillDef } from '../game/skills.ts';
import { HeroPose } from './HeroPose.tsx';
import { SkillIcon } from './SkillIcon.tsx';

/** The "NEW SKILL!" card, shown right after the stage that teaches a skill is cleared (before the stage-cleared card). */
export const SkillLearned: React.FC<{ skill: SkillDef; onContinue: () => void }> = ({ skill, onContinue }) => {
  React.useEffect(() => {
    const id = window.setTimeout(() => sound.playStar(3), 250);
    return () => window.clearTimeout(id);
  }, []);
  const heroH = Math.round(Math.max(120, Math.min(250, (typeof window !== 'undefined' ? window.innerHeight : 700) * 0.36)));

  return (
    <div className="clr-scrim sk-scrim select-none">
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
              <h3 className="sk-name">{skill.name}</h3>
            </div>
          </div>
          <p className="sk-blurb">{skill.blurb}</p>
          <div className="sk-controls">
            {skill.controls.map(([keys, what]) => (
              <div key={what} className="sk-chip">
                {keys.map((k, i) => (
                  <React.Fragment key={k}>
                    {i > 0 && <span className="sk-or">{keys[0] === '\u2190' ? '' : 'or'}</span>}
                    <span className="sk-key">{k}</span>
                  </React.Fragment>
                ))}
                <span>{what}</span>
              </div>
            ))}
          </div>
          <div className="clr-clue sk-note">
            <div>
              <p>
                <b>It is yours for the rest of the game.</b> Ropes can show up from stage 1-4.
              </p>
            </div>
          </div>
          <button type="button" className="pm-go" data-start="true" onClick={onContinue}>
            Continue
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#022c22" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
