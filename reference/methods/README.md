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
| Hugging Face art, all kinds (models, starts, img2img settings, seeds, keying, edges, sizes, budget log, getting files back without the token) | `hf-art.md` | to write from today's work | hf-backdrops2 (11-01) |
| Painted backdrop strips (far/sky/middle/near, both orientations, FAR_BY_STAGE) | `hf-backdrops.md` | to write; source: reference/prop-sheets/qa-notes/hf-backdrops/NEXT.md, tools/art/hfbackdrops/ | hf-backdrops2 (11-01) |
| Building a stage or a world (generator sections, variety, teaching, curation) | `stage-build.md` | the rules are in STAGE-RULES.md; the method (order of work, tools) to write | next stage helper |
| Fixing an unfair spot (first-timer bots, real-engine repro, fail-before/pass-after test) | `stage-fix.md` | to write | w8-rope2 (11-01) |
| A menu screen or pop-up (nav kit, Back, safe areas, save states to shoot, clipcheck) | `menu-screen.md` | to write | whatsnew (11-01) |
| Player-facing words (Pokey/Dot voice, per-item lines not templates, no repeats, approval) | `player-text.md` | to write; source: VOICE.md, today's journal | journal-voice (11-01) |
| Measuring performance (frame times, first frames, throttling, what this container can't measure) | `perf-measure.md` | to write | warmup-5m (11-01) |
| Gates (artcheck, drawcheck, clipcheck, playerText, art-use) | `gates.md` | to write | kaizen-gates (11-01) |
| Test link and release (build.py, Artifact publish limits, release branch, PR, deploy and APK check) | `test-link-and-release.md` | to write; source: HANDOFF §6-7 | the lead (11-01) |
| Cutscene art and clips | `hf-cutscenes.md` | to write; source: tools/art/hfstory, the hf-cutscenes branch notes | next cutscene helper |
| Props and sprite sheets (cutting, atlases, art-use) | `hf-props.md` | to write; source: tools/art/hfbatch, prop-sheets | next props helper |
