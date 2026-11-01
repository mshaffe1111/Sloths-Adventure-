import React from 'react';
import { CelHead } from './CelHead.tsx';
import { DotFace } from './DotFace.tsx';
import { HeroFaceIcon } from './HeroFaceIcon.tsx';
import { PaintedIcon, paint } from './icons/PaintedIcon.tsx';
import { Crest } from './icons/Crest.tsx';
import { speakerMark } from './icons/speakers.ts';

/** the little picture beside a speaker's name: painted face or crest, or an icon for those who have no painted portrait */
export const SpeakerMark: React.FC<{ name: string; size?: number; talking?: boolean }> = ({ name, size = 22, talking }) => {
  const m = speakerMark(name);
  if (m.kind === 'head') return <CelHead name={name} size={size} />;
  if (m.kind === 'dot') return <DotFace size={Math.round(size * 1.25)} talking={talking} />;
  if (m.kind === 'crest') return <Crest world={m.key} size={size} />;
  if (m.kind === 'pokey') {
    return (
      <span className="sp-ava" style={{ width: size, height: size }} aria-hidden="true">
        <HeroFaceIcon size={size} face="face_happy" />
      </span>
    );
  }
  return <PaintedIcon name={paint(m.icon)} size={Math.round(size * 0.82)} />;
};
