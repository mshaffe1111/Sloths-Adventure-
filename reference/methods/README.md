# Methods: the proven way to do each kind of job

Matt, 2026-11-01: "When you identify something that works, everybody uses that method... so helpers aren't doing things always from
scratch. They understand what works, and they always build towards that standard using that method... after every release we're always
going to find things that are better... if using Hugging Face, this is the best way of getting results, so that it's not always a trial
and error."

This folder is our standard work: one file per kind of job, holding the method that has worked best so far. It is the starting point for
every helper, and it gets better every release. (Lean calls the spreading of a proven practice "yokoten": copy the method and its
reasoning, adapt it, improve it, and write the improvement back.)

## The rules

1. **Every brief names its method file(s)** under "Method:". The helper reads it first and follows it. Doing it differently is allowed
   only with a reason, and the report must say what was different and how it turned out.
2. **Every report has a "Method update" section:**
   - what worked better than the method (with the before/after that proves it);
   - what was tried and failed, and why (failures are kept too, so nobody pays for them twice);
   - the exact edit proposed to the method file.
   A report without it is sent back.
3. **The lead merges method updates** when merging the helper's work: proven changes go into the method file, marked with the date and
   the evidence. An idea that is not proven yet goes under "To try", not into the steps.
4. **Retro after every release** (CONTINUOUS-IMPROVEMENT.md): which method saved a redo, which one failed, and what changes in each.
5. **A job with no method file** gets one: the first helper to do that kind of job writes it as part of its report.
6. **Keep methods short and exact**: the steps, the commands and settings, the sizes, the checks, the pitfalls, and one example of output
   at the bar. Link to the tools; don't copy them.

## Template (copy for a new method)

```
# Method: <kind of job>
Last proven: <date>, <branch/commit>, <what it produced>. Owner of the last update: <session>.
## When to use it
## Steps (exact: tools, commands, settings, sizes)
## The bar (what "done" looks like; 1-3 examples or screenshots)
## Checks before reporting (which shots, which saves/orientations, which gates)
## Pitfalls we already paid for (date, what happened, what to do instead)
## Tried and didn't work (so nobody tries it again blind)
## To try (ideas not yet proven)
```

## Index

| Method | File | Status | Writes/updates it next |
|---|---|---|---|
| Hugging Face art, all kinds (models, starts, img2img settings, seeds, keying, edges, sizes, budget log, getting files back without the token) | `hf-art.md` | written 11-01 (hf-backdrops2) | next HF helper |
| Painted backdrop strips (far/sky/middle/near, both orientations, FAR_BY_STAGE, floor.py depth floor) | `hf-backdrops.md` | written 11-01 (hf-backdrops2) | next backdrop helper |
| Building a stage or a world (generator sections, variety, teaching, curation) | `stage-build.md` | the rules are in STAGE-RULES.md; the method (order of work, tools) to write | next stage helper |
| Fixing an unfair spot (check the ruler first, first-timer bots, real-engine repro, fail-before/pass-after test, stage hashes) | `stage-fix.md` | written 11-01 (w8-rope2 + bot-fix + fix-petals) | next stage-fix helper |
| A menu screen or pop-up (nav kit, Back, safe areas, save states to shoot, clipcheck) | `menu-screen.md` | written 11-01 (whatsnew) | next menu helper |
| Player-facing words (Pokey/Dot voice, per-item lines not templates, no repeats, approval) | `player-text.md` | written 11-01 (journal-voice) | next writing job |
| Measuring performance (frame times, first frames, throttling, what this container can't measure) | `perf-measure.md` | written 11-01 (warmup-5m) | next perf job |
| In-play words on screen (Dot's box, thought bubbles: keep-outs, draw order) | `in-play-text.md` | written 11-01 (dot-box) | next in-play UI job |
| Painted icons (satchel recipe, one object per meaning, sizes, icon register) | `icons.md` | written 11-01 (icons-painted) | icons-painted (B-E) |
| Gates (artcheck, drawcheck, clipcheck, playerText, art-use, knowncheck) | `gates.md` | written 11-01 (kaizen-gates) | whoever adds a gate |
| WebGL / GPU renderer stages (PixiJS layer, look proof, context loss, pitfalls) | `webgl.md` | written 11-04 (warmup-5m) | the next GPU stage |
| The World 1 measuring stick (move strings, look grid, flags, fixtures) | `validator.md` | written 11-04 (fix-petals; merges with fun-validator) | whoever extends the validator |
| Quality review (in-order play, the six-question bar, verdicts) | `quality-review.md` | written 11-04 (quality supervisor; on quality-supervisor) | the quality supervisor |
| Test link and release (build.py, Artifact publish limits, release branch, PR, deploy and APK check) | `test-link-and-release.md` | to write; source: HANDOFF §6-7 | the lead (11-01) |
| Cutscene art and clips | `hf-cutscenes.md` | to write; source: tools/art/hfstory, the hf-cutscenes branch notes | next cutscene helper |
| Props and sprite sheets (cutting, atlases, art-use) | `hf-props.md` | to write; source: tools/art/hfbatch, prop-sheets | next props helper |
| Keeping the roadmap (numbering, sizing, closing with proof, the release sweep, roadmapcheck) | `roadmap.md` | written 11-01 (roadmap-keeper) | roadmap-keeper |

**Best measured result (Matt, 2026-11-04):** every method file keeps a "Best measured result" line (time and tokens for one job of its kind, with the commit and helper). A helper that beats it updates the method with proof; the lead merges it the same day, and everyone works that way from then on.
- `research-ledger.md`: breaking research into a line-by-line ledger before it shapes a plan (D29)

## Learned from successes, 2026-11-04 (spread to every helper; Matt: "That's how we learn from our successes")
- **Prove a new tool against the real engine before trusting it** (beatTrace: checked against RealPlay first, then fixtures built to
  fail). It made the tool right first time, and three builders reused it.
- **Measure on what ships:** judge flags on the assembled candidate, not on your own branch (w1-rhythm-b, w8-rope2), which saved two
  needless redesigns.
- **Find the source before fixing:** the orchids were painted into the sky picture; the checker treated hop/jump/double as one move
  and ignored direction. Hooking the real draw and reading the measure found them, where guessing would have lost hours.
- **Guarantee rules by construction and test every roll:** 70/15/15 and "goal <= shared + smaller road - 5%" on all layouts and both
  settings, with no single-seed proof.
- **Ruler changes come with a fixture each way and a full before/after** (pickup credit, grams direction): it keeps a ruler honest
  and the known list shrink-only.
- **Bring options early, with the deadline still in reach** (1-2's petal geometry at 7:39, 1-5's ruler at 7:35), not a miss at the
  deadline.
