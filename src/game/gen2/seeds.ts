/**
 * gen2/seeds — the curated layouts each gen2 stage ships (DESIGN.md B8, GEMINI-LEDGER C10). Written by tools/gen2/curate.ts: do not
 * edit by hand; re-run the tool. Each stage's 16 rolls passed levelCheck, the clock and STAGE-RULES §2's numbers on Normal and Easy,
 * and were picked to differ from each other the most. At play, build with `seeds[variant % seeds.length].seed` and the entry's
 * `recent` (BuildRequest.recent): with the same list the seed builds the same stage that was checked. seeds.test.ts guards it.
 */
export interface Gen2Seed {
  /** the seed to build with (BuildRequest.seed), and the one its layout came from (a re-roll's, when the first roll failed) */
  seed: number;
  layoutSeed: number;
  /** 0..1, higher better; the distance (1 - cosine of action 3-grams) to the nearest roll picked before it */
  quality: number;
  nearest: number | null;
  /** seconds: the inspector's quick player; the time model on Normal */
  quick: { normal: number; easy: number };
  model: { typical: number; fast: number };
  dead: { normal: number; easy: number };
  quiet: { normal: number; easy: number };
  /** the worst jump for the kid bot (Easy) and the adult bot (Normal) */
  worstJump: { kid: number | null; adult: number | null };
  /** bands.ts's score on the inspector's parts only (no first-timer until the hook-up) */
  band: { normal: number; easy: number };
  /** the plan, slot by slot (~ mirrored) */
  sections: string;
}

export interface Gen2StageSeeds {
  stage: string;
  /** the world kit it was built from */
  kit: string;
  curated: string;
  rolled: number;
  passed: number;
  /** STAGE-RULES §2 rules the run waived (tools/gen2/curate.ts --waive) */
  waived: string[];
  /** BuildRequest.recent: the stage before's shipped closing sections */
  recent: string[];
  diversity: { all: number; shipped: number };
  /** the share of sections the stage before's shipped set also uses */
  shared: number | null;
  seeds: Gen2Seed[];
}

export const GEN2_SEEDS: Record<string, Gen2StageSeeds> = {
};
