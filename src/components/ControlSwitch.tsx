import React from 'react';
import { InputEngine } from '../game/inputEngine.ts';
import { controlStyle, padSide, subscribeControls } from '../game/controlPrefs.ts';
import { TouchController } from './TouchController.tsx';
import { PadController } from './PadController.tsx';

/** the touch controller the player chose in the menu: screen gestures, or the drawn pad and buttons */
export const ControlSwitch: React.FC<{ inputEngine: InputEngine; world: number }> = ({ inputEngine, world }) => {
  const [, bump] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => subscribeControls(bump), []);
  return controlStyle() === 'pad' ? <PadController inputEngine={inputEngine} side={padSide()} /> : <TouchController inputEngine={inputEngine} world={world} />;
};
