/**
 * sheetWarm — the picture sheets a stage will draw, asked for as it starts, and each handed to the graphics the frame it arrives.
 *
 * QA's control-test logs (2026-10-26, 27): a `blank` "wait <sheet>" at almost every new stretch, on every phone (goldsnake, turtle, boa,
 * eagle, hero-vine, props2), and 45 freezes over 100 ms on a 320-wide phone, the worst at River logs. Two causes:
 *   - the stage start only asked for its animals' clip sheets by their own names, and a snake's sheet is the golden snake's
 *     ('goldsnake-anim'), so it never started; the snakes a ring drops in and the eagle over a watched stretch are not in the stage's
 *     animals at all. Each of those started loading the moment the thing came on screen, and drew its still frames until it arrived;
 *   - a sheet that arrives during play was handed to the graphics (the real decode and upload of 3 to 20 MB) on its first draw, which
 *     is the moment Pokey meets the thing: the freeze landed in the middle of the meeting.
 * So every sheet the stage can draw starts loading as it starts (`stageAnims`, `stageExtras`), and the first frame after one arrives
 * draws it once into a corner (`ArrivalWarm`, as the stage preload does behind the menu: atlasLoader.ts warmSheets), one a frame.
 */
import { sheetWarm, warmSheets } from './atlasLoader.ts';
import { creatureAnimUrl, warmCreatureAnims } from './creatureAnim.ts';
import { HERO_VINE_URL, warmHeroVine } from './heroVine.ts';
import { PROTO2_URL, warmProto2 } from './protoArt.ts';
import { warmSprites } from './spriteSheets.ts';

/** a creature's clip sheet name: a snake draws the golden snake's clips, a royal turtle the guard's */
export function animOf(type: string, royal?: boolean): string {
  if (type === 'snake') return 'goldsnake';
  if (type === 'turtle' && royal) return 'guard';
  return type;
}

/** the parts of a stage that say what it draws */
export interface StageDraws {
  enemies: ReadonlyArray<{ type: string; royal?: boolean }>;
  vines?: ReadonlyArray<{ vineType?: string; rope?: boolean }>;
  proto?: {
    /** the animals a ring drops in (a snake ring, 3-9's prowlers) */
    ring?: { waves: ReadonlyArray<ReadonlyArray<{ kind: string }>> };
    /** the stretches the eagle watches */
    watch?: readonly unknown[];
    bushes?: readonly unknown[];
    /** hollows in climb trunks (1-4) */
    hollows?: readonly unknown[];
  } | null;
}

/** every creature clip sheet name the stage can draw (with a sheet or not: the caller keeps the ones that have one) */
export function stageAnims(st: StageDraws): string[] {
  const out = new Set<string>();
  for (const e of st.enemies) out.add(animOf(e.type, e.royal));
  for (const w of st.proto?.ring?.waves ?? []) for (const d of w) out.add(animOf(d.kind));
  if (st.proto?.watch?.length) out.add('eagle');
  return [...out];
}

/** the other sheets drawn only in some stages: Pokey hanging from a liana (any swing vine), the second World 1 sheet (bushes, hollows) */
export function stageExtras(st: StageDraws): { vine: boolean; props2: boolean } {
  const vine = (st.vines ?? []).some((v) => !v.rope && v.vineType !== 'tree_climb');
  const props2 = !!st.proto?.bushes?.length || !!st.proto?.hollows?.length;
  return { vine, props2 };
}

/** start every sheet the stage can draw loading (its creatures' clips and painted poses, and the extras it needs); their addresses */
export function warmStageSheets(st: StageDraws): string[] {
  const all = stageAnims(st);
  const names = all.filter((n) => !!creatureAnimUrl(n));
  warmCreatureAnims(names);
  const urls = names.map((n) => creatureAnimUrl(n)!);
  // (and each creature's painted poses: the golden snake's heads, the eagle's sheet, which a sprite needs before it draws at all; they
  // were asked for only when each first came on screen, QA 2026-10-29: 'blank wait' at 80 s, 179 s and 201 s)
  urls.push(...warmSprites(all));
  const x = stageExtras(st);
  if (x.vine) {
    warmHeroVine();
    urls.push(HERO_VINE_URL);
  }
  if (x.props2) {
    warmProto2();
    urls.push(PROTO2_URL);
  }
  return urls;
}

/**
 * The sheets asked for as a stage starts, each drawn once the first frame after it has arrived (one a frame, so two arriving together do
 * not land in the same frame). Nothing to do once all are drawn.
 */
export class ArrivalWarm {
  private left: string[];
  constructor(urls: readonly string[]) {
    this.left = [...new Set(urls)];
  }
  /** at the start of a frame, before anything is drawn */
  frame(ctx: CanvasRenderingContext2D | null): void {
    if (!this.left.length || !ctx) return;
    if (warmSheets(this.left, ctx, 1)) this.left = this.left.filter((u) => !sheetWarm(u));
  }
  /** sheets not yet drawn once (for the tests) */
  get waiting(): number {
    return this.left.length;
  }
}
