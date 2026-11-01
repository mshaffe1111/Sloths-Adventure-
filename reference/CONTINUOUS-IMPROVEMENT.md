# Continuous improvement: how we stop making the same mistake twice

Matt, 2026-11-01: "I despise redundancy. I'm a big believer in continuous improvement, and every time you make a mistake, you learn from
it, and you don't make the same mistakes again... I feel like we're doing one-offs, which is causing a lot of redundancies and
continuously making the same types of mistakes."

The lead reads this file with PARTNER.md: at every start, after every memory compression, and before every test link and release.

## What it means (the research, in short)

Continuous improvement (kaizen) is a loop, not an attitude. The parts that matter for us:

1. **Plan-Do-Check-Act (PDCA).** Every fix is a small experiment: plan it, do it, check it worked, then **act: change the standard** so the
   improvement sticks. Improvements fade when "the standard never changed". The fourth step is the one we have been skipping.
2. **Root cause, not symptom (5 Whys).** Ask "why" until you reach the cause that lets the mistake happen again, and put the countermeasure
   at the deepest level you can. Fixing the one screen Matt saw is a one-off; fixing why it could happen is the improvement.
3. **Mistake-proofing (poka-yoke).** The strongest countermeasure is one that makes the mistake impossible or catches it automatically. In
   software that means a test or a check in the gate that fails, not a note someone has to remember.
4. **Stop the line (jidoka).** When something abnormal shows up, stop and fix the cause before moving on. Stopping alone is useless without
   the root cause and the standard change.
5. **Spread the fix (yokoten).** When a mistake is found in one place, look for the same pattern everywhere else and fix it there too. (We
   already wrote "rules learned in one world apply to every world"; this is the general form.)
6. **Go and see (gemba).** The manager judges the real work where it happens: the real screens on a phone-sized view, not the summary.
7. **The manager's job:** keep the loop running: review at a set rhythm, give every problem an owner, check the countermeasure worked, and
   update the standards.

Sources: [6sigma.us on kaizen](https://www.6sigma.us/six-sigma-articles/kaizen-and-philosophy-of-continuous-improvement-in-change-management/),
[SG Systems glossary: kaizen](https://sgsystemsglobal.com/glossary/kaizen-continuous-improvement/),
[University of Pitesti, problem-solving paper](https://www.automotive.upit.ro/index_files/2010/2010_A_16_.pdf),
[Six Sigma Online on jidoka](https://www.sixsigmaonline.org/jidoka-lean-six-sigma/),
[Applied Frameworks: quality in Scrum](https://agile.appliedframeworks.com/applied-frameworks-agile-blog/who-is-responsible-for-quality-in-scrum),
[Fabrico: poka-yoke vs jidoka](https://www.fabrico.io/ro/blog/poka-yoke-vs-jidoka/).

## Our loop (standard work for the lead)

**1. Every defect gets a log entry** (the table below), whoever finds it. An "escape" is one Matt or a tester found before we did; escapes
are the number we drive to zero.

**2. 5 Whys, then a countermeasure at one of three levels.** Always aim for the highest:
- **L3, automatic:** a test, a gate script or a type that fails when the mistake comes back (poka-yoke). This is the default.
- **L2, standard work:** a line in the brief template, the check-in checklist or the release checklist (LEAD-PLAYBOOK, STAGE-RULES).
- **L1, a note:** a line in a rules file. A note on its own is NOT a countermeasure. Use it only alongside L2 or L3.

**3. Yokoten:** list where else the same pattern can live and check each one in the same pass, before calling it fixed.

**4. Check:** the next release's walk confirms the countermeasure held. If the same kind of defect shows up again, the countermeasure
failed: go one level deeper.

**5. Stop the line on an escape:** when Matt finds something, the lead stops starting new work until the log entry, the root cause and the
countermeasure are written and assigned (the fix itself can run in parallel).

**6. Retro after every release (15 minutes, the lead, written here):**
- what escaped to Matt;
- what we caught late (at the gate or the test link instead of at the check-in);
- which defect categories repeated (the Pareto below);
- the ONE countermeasure for the top category before the next release.

**6b. Keep what works (yokoten):** in the same retro, promote every proven improvement from the helpers' "Method update" sections
into reference/methods/, and note which method files changed. A method that saved a redo is kept; one that failed is fixed or retired.

**7. Quality check-ins (PARTNER.md first rule):** every 30 minutes, judge what helpers have pushed, on the real screens, and send rough
work back then.

## Pareto: what keeps coming back (counted from STATUS.md, 2026-10-28 to 11-01)

| Category | Hits in STATUS | Countermeasure now | Level | Gap |
|---|---|---|---|---|
| Upright/sideways layout, text or objects clipped | 20 clipped + 30 orientation | screenshots in both orientations in briefs | L2 | no automatic clip check -> build `tools/perf/clipcheck.mjs` (every menu screen, 412x915 and 915x412, fail on overflowing or cut text) |
| Unfair spots a first-timer can't get past | 21 | first-timer bots, stageStart.test | L3 | bots don't run on every stage at every merge -> add to the gate per touched world |
| Repetition and filler (look-alike stages, repeated lines, identical hints) | 21 | era.ts variety bar; Dot pace tool | L3 for stages, none for text | -> `playerText.test.ts`: no duplicate player-facing line across a list, no generated page repeats a line, banned filler phrases |
| Art made but never drawn | 17 | artUse.test + allow-list that only shrinks | L3 | none |
| Something invisible or missing on a real phone | 12 | canvasLost.test, meecaVisible | L3 | test on old saves and a lost canvas for every new screen |
| Mechanic not taught | 8 | STAGE-RULES teaching rule, per-stage teaching check | L3 | none |

## Defect log

| # | Date | Found by | What | Root cause (5 Whys, short) | Countermeasure (level) | Yokoten | Held? |
|---|---|---|---|---|---|---|---|
| 1 | 11-01 | Matt (escape) | Journal on an old save: the same 3 filler lines down the page | Old saves have no play records -> fell to 3 generic lines. The lead approved lines as a list, never the page; the helper only shot a save with records. No standard asked for old-save screens; no test for repeats. | A unique line per stage + banned-filler and no-repeat tests (L3); briefs name the save states to screenshot, and the lead walks old/fresh/finished saves (L2) | Find hints (D2), Dot tips, creature cards, medal text, What's New | next release walk |
| 2 | 11-01 | Lead (after D1) | Every locked find hint "Crouch beside a fern." | Same as D1: a template copied, never read on the page | Unique hints + duplicate test (L3) | as D1 | next release walk |
| 3 | 11-01 | Lead | WITHDRAWN: "totals count Worlds 9-10, which aren't out". Worlds 9-10 ARE live; the totals were right. See D7. | - | - | - | - |
| 4 | 11-01 | Lead | Sideways: find hint and the journal's numbers row cut off | No automatic overflow check; screenshots only of chosen screens | clipcheck gate (L3, to build) | every menu screen | - |
| 5 | 11-01 | Lead | Eagle card "Defeated x0" | A field shown for every creature without asking if it applies | Card shows only stats that apply + test (L3) | medal and coat cards | - |
| 6 | 11-01 | Matt (escape) | 5-M: Meeca invisible, fell through things | A baked canvas copy emptied after a lost canvas; bots don't lose canvases | canvasLost.test, re-bake on restore (L3) | every baked/cached canvas (done game-wide) | Matt: "plays much better" |
| 7 | 11-01 | Helper (whatsnew), before shipping | The lead briefed two helpers and edited What's New on the belief that Worlds 9-10 weren't released; they are live and playable | The lead acted on memory (the earlier "wait until curated" talk was about the NEW W9/W10 builds) and a guess from a number, without opening the game or the code. Why no check? No standard says "verify a fact in the code before acting on it". | Before a brief or an edit rests on a fact about the game (what is live, what a screen shows, how a rule works), the lead checks it in the code or the running game and names the file in the brief (L2, LEAD-PLAYBOOK) | every brief today | helper caught it; edits reverted |
| 8 | 11-01 | Helper (w8-rope2) | 8-2 blooms near edges sit 36-55 px off a non-stop hop (reach 34): Normal first-timers end 1-9 short at the sealed door (live) | The pickup pass places beside take-off/landing spots; checks only proved a bloom is reachable, never that the natural path takes it | Placement rule: an edge pickup sits on the hop arc or within a walk's reach; classifier run per world (L3 test) | every world's petal/bloom pass | 6 PM release |
| 9 | 11-01 | Helper (whatsnew) | A find is never placed on some layouts (1-4 notch 5/40, 4-6 pocket 6/40) (live) | addFinds measured flag distance along the ground only; on narrow climbs that ruled out every spot, with no fallback | True distance + always-place fallback + "one find on every layout of every stage" test (L3) | every placed-once item (finds, snails, pockets) | 6 PM release |
| 10 | 11-01 | Helper (w8-rope2) | Sideways, Dot's tip box covers the take-off post at 8-2's first rope | Box placement ignores where the player must act | Game-wide placement away from travel and the next landing + stills (L2 now; clipcheck-style overlap check later, L3) | every Dot tip and thought bubble | 6 PM release |
| 11 | 11-01 | Helper (warmup-5m) | Old phones hitch ~130 ms at ~4 s when graphics step down (resize + re-fit) | The quality step re-fits art on the play frame | Pre-fit the next step under the card or step at a calm moment (L3 frame test) | every quality step | 6 PM release |
| 12 | 11-01 | Lead | Sideways, the Satchel header takes half the height; the journal shows 2 entries; creature names clip on the review page | Sideways layouts were shot but not judged for usable space | Compact sideways header (target >= 65% content) + clipcheck (L3) | every menu screen sideways | 6 PM release |
