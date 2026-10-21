import React from 'react';
import { HeroFaceIcon } from './HeroFaceIcon.tsx';
import { Icon } from './icons/index.tsx';
import { Crest } from './icons/Crest.tsx';
import { speakerMark } from './icons/speakers.ts';

/** the little picture beside a speaker's name: painted face or crest, or an icon for those who have no painted portrait */
export const SpeakerMark: React.FC<{ name: string; size?: number }> = ({ name, size = 22 }) => {
  const m = speakerMark(name);
  if (m.kind === 'crest') return <Crest world={m.key} size={size} />;
  if (m.kind === 'pokey') {
    return (
      <span className="sp-ava" style={{ width: size, height: size }} aria-hidden="true">
        <HeroFaceIcon size={size} face="face_happy" />
      </span>
    );
  }
  return <Icon name={m.icon} size={Math.round(size * 0.82)} />;
};
