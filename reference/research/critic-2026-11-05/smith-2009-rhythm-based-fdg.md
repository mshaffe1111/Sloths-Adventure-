# Smith, Treanor, Whitehead, Mateas, "Rhythm-Based Level Generation for 2D Platformers", FDG 2009 (primary source, read by the engine critic)

URL: https://eis.ucsc.edu/papers/smith-fdg-09.pdf (camera ready 02-18-09). Read 2026-11-05, saved 11:00 AM ET (`date` after the save),
TinyFish fetch_content, full text. Fetched because R2-academic-pcg.md:37-38, :524 and :644 rest on it and it was not saved anywhere
(the engine-design designer-sources hold only the 2011 Launchpad TCIAIG paper; critic reader A6).

## The claims checked

| R2 claim | The paper's words | Holds? |
|---|---|---|
| R2:37-38 "The rhythm-based generator provides 14 different kinds of geometry for jumps, 5 different kinds of geometry for moves, three different types of rhythm, four different lengths of rhythm, and three different densities" (§8.2) | §8.2: "The rhythm-based generator provides 14 different kinds of geometry for jumps, 5 different kinds of geometry for moves, three different types of rhythm, four different lengths of rhythm, and three different densities for rhythm." | **Yes, verbatim.** But the paper's own Fig. 13 caption says "There are 13 different jump types in our generator", so 13 or 14 |
| R2:524 "Launchpad's grammar offers 14 jump kinds (springs, falls, enemies to kill or avoid, stompers, moving platforms)"; R2:644 "Launchpad had 14 + 5" | the number is the 2009 system's (§8.2); the grammar's kinds are in Fig. 7: flat_gap, gap/no_gap × jump_up/Down/spring/fall, enemy_kill, enemy_avoid, jump_down short/medium/long, stomper, moving_platform_vert/horiz, slopes steep/gradual up/down, flat_platform | **Holds for the 2009 generator; mis-attributed to Launchpad (2011).** The point R2 makes (many kinds of geometry per beat, not many numbers) stands |
| R2 §3.3 (R2:138-160): two tiers; verbs move/jump; beat types regular/random/swing; lengths 5-20 s; density low/medium/high; rest platforms; critics over 1,000 candidates; "playable, but they were visually unappealing and not much fun" (§8.1); "a distinct peak far from the lowest value" | §4.1, §3, §5, §8.1 ("Stringing these platforms together created playable levels, but they were visually unappealing and not much fun"), §8.3 ("The critics operate on a set of 1000 candidate levels"; "the distribution still has a distinct peak far from the lowest value") | **Yes, verbatim** |

## Lines that bear on ENGINE-SPEC.md directly

> We present a rhythm-based method for the automatic generation of levels for 2D platformers, where the rhythm is that which the player
> feels with his hands while playing.  (Abstract)

This supports Matt's ruling at ENGINE-SPEC L1120 ("the player's rhythm, not the song") against the Gemini BPM idea; the critic trace's
13 "contradictions" of the music-beat rows are Matt and Smith 2009 against Gemini, not defects.

> Rhythm groups can optionally be repeated before this rest area, which can provide additional challenge [7] and more visual consistency.  (§5)

Supports LEDGER-2026-11-02-full.md C4 (one exact repeat in part 2) against the spec's "never the same burst twice" (L392).

> Infinite Mario Bros! ... generates levels by probabilistically choosing a few idiomatic pieces of platformer levels and fitting them
> together. While this technique produces levels that, on the surface at least, look and feel a great deal like Mario, over time it
> becomes apparent that there is very little variety between levels due to the repetition of idioms.  (§2)

The failure mode of a small idea library: the critic's era.ts run (CRITIC-SPEC §3.4) is its measured form.

> These levels can be quite repetitive, potentially with too much space devoted entirely to running along long platforms or jumping to
> kill many enemies. This is a common problem in using grammars to generate content.  (§8.3)
