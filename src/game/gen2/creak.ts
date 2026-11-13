/**
 * creak — the CREAKY LIMB as one gen2 piece, for any stage of any world that has a row for it (packet B15 item 1; 1-5.md:55, 1-4.md:30).
 *
 * A section marks a piece `creak: true` (SectionPiece.creak). The lay makes that piece's platform a fragile limb in the world's look
 * (WorldManifest.creak.style: World 1's 'branch', drawn notched and creaking before he steps on it, protoArt drawBranchArt) that holds
 * the world's `hold` seconds for this setting once he lands on it (engine.ts reads Platform.creak), then drops him to what is under it.
 * Every set-back makes every limb whole again (engine.ts crumbledWhole); one that went grows back off screen 30-35 s later (regrow.ts).
 *
 * Required once taught (Matt, 11-02: "crumbling platforms may be required anywhere once taught, pits included"): every limb laid up to the
 * END of the section that teaches it (the world's `creak.lesson`) is marked `creakFree`, and the stage must clear without those
 * (pipeline checkStage); any limb after the lesson may be the way. World 7's ruin tiles stay what they were: never needed.
 * WORLD DATA decides the look, the hold and the lesson; no stage id, seed or x lives here.
 */
import type { Platform } from '../types.ts';
import type { Difficulty, WorldManifest } from './types.ts';

/**
 * A creaky limb's own marks on its platform (kept off the shared Platform type: only gen2's check and the falling-limb trap read them):
 *  - creakFree: laid before its lesson is over, so the stage must clear without it (pipeline checkStage);
 *  - trapLoad: it is a drop trap's load (castPlay.types TrapPost kind 'limb'): once it gives way castArt draws its fall and where it
 *    lies, so the old renderer draws no snapped halves (protoArt.ts).
 */
export type LimbPlatform = Platform & { creakFree?: true; trapLoad?: true };

/** make a laid piece's platform the world's creaky limb. `free`: laid before its lesson is over (never needed) */
export function creakLimb(p: LimbPlatform, M: Pick<WorldManifest, 'world' | 'creak'>, difficulty: Difficulty, free: boolean): Platform {
  const row = M.creak;
  if (!row) throw new Error(`gen2: a creaky limb is laid in world ${M.world}, which has no creaky limb (WorldManifest.creak)`);
  p.type = 'fragile';
  p.creak = row.hold[difficulty === 'easy' ? 'easy' : 'normal'];
  p.style = row.style;
  if (free) p.creakFree = true;
  else delete p.creakFree;
  return p;
}

/** is this a creaky limb (gen2's piece, or the mixer's: a fragile platform with its own hold) */
export const isCreak = (p: Platform): boolean => p.type === 'fragile' && p.creak !== undefined;

/**
 * Must the stage clear without this platform? World 7's crumbling tiles (fragile with no creak hold: never needed, STAGE-RULES §1) and
 * a creaky limb laid before its lesson is over. A limb after its lesson may be the way.
 */
export const needless = (p: LimbPlatform): boolean => p.type === 'fragile' && (p.creak === undefined || !!p.creakFree);
