/**
 * spriteSheets — each creature's painted-pose sheets (its sprite module's atlas), by the name sheetWarm.ts animOf gives it, so the
 * stage preload (stagePreload.ts, 'foe:<name>') and the stage start (sheetWarm.ts warmStageSheets) can ask for them before play needs
 * them. Every creature sprite loads its sheet the first time it draws, and draws a stand-in (or, for the golden snake, the classic
 * snake's sheet, then a vector snake) until it arrives: QA 2026-10-29 had 'blank wait goldsnake-head/sleep/wake, snake-atlas' at 80 s
 * and 179 s and 'blank wait eagle-atlas' at 201 s on Android Chrome, the clip sheets having been asked for at the start but not these.
 */
import { BOA_SHEETS, warmBoaSprite } from './boaSprite.ts';
import { CAIMAN_SHEETS, warmCaimanSprite } from './caimanSprite.ts';
import { EAGLE_SHEETS, warmEagleSprite } from './eagleSprite.ts';
import { FROG_SHEETS, warmFrogSprite } from './frogSprite.ts';
import { GOLDSNAKE_SHEETS, goldSnakeEnabled, warmGoldsnakeSprite } from './goldSnake.ts';
import { GUARD_SHEETS, warmGuardSprite } from './guardArt.ts';
import { HARPY_SHEETS, warmHarpySprite } from './harpySprite.ts';
import { JAGUAR_SHEETS, warmJaguarSprite } from './jaguarSprite.ts';
import { OCELOT_SHEETS, warmOcelotSprite } from './ocelotSprite.ts';
import { SNAKE_SHEETS, warmSnakeSprite } from './snakeSprite.ts';
import { SPIDER_SHEETS, warmSpiderSprite } from './spiderSprite.ts';
import { TAYRA_SHEETS, warmTayraSprite } from './tayraSprite.ts';
import { TURTLE_SHEETS, warmTurtleSprite } from './turtleArt.ts';

interface SpriteSheets {
  urls(): readonly string[];
  warm(): void;
}
const plain = (urls: readonly string[], warm: () => void): SpriteSheets => ({ urls: () => urls, warm });

export const SPRITES: Readonly<Record<string, SpriteSheets>> = {
  // (a snake draws the golden snake's heads; with ?snake=classic the classic snake's sheets instead)
  goldsnake: {
    urls: () => (goldSnakeEnabled() ? GOLDSNAKE_SHEETS : SNAKE_SHEETS),
    warm: () => (goldSnakeEnabled() ? warmGoldsnakeSprite() : warmSnakeSprite()),
  },
  eagle: plain(EAGLE_SHEETS, warmEagleSprite),
  ocelot: plain(OCELOT_SHEETS, warmOcelotSprite),
  jaguar: plain(JAGUAR_SHEETS, warmJaguarSprite),
  boa: plain(BOA_SHEETS, warmBoaSprite),
  caiman: plain(CAIMAN_SHEETS, warmCaimanSprite),
  tayra: plain(TAYRA_SHEETS, warmTayraSprite),
  harpy: plain(HARPY_SHEETS, warmHarpySprite),
  frog: plain(FROG_SHEETS, warmFrogSprite),
  spider: plain(SPIDER_SHEETS, warmSpiderSprite),
  turtle: plain(TURTLE_SHEETS, warmTurtleSprite),
  guard: plain(GUARD_SHEETS, warmGuardSprite),
};

/** start loading these creatures' painted-pose sheets; their addresses (a name with no sprite sheets adds nothing) */
export function warmSprites(names: Iterable<string>): string[] {
  const urls: string[] = [];
  for (const n of names) {
    const s = SPRITES[n];
    if (!s) continue;
    s.warm();
    urls.push(...s.urls());
  }
  return urls;
}
