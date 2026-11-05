# How-to, part 2: writing a stage's brief (rewritten by the level designer, 11-05 3:44 PM ET; Matt 3:52 PM: the engine makes the stage)

Part 1 (engine-core) covers running tools/engine/stage.ts, the gates, and reading a breach. This part covers the only thing you
write. **You never write nodes, decks, heights or numbers: the engine generates the stage's structure on every roll** from your brief
and the world's rulebook (reference/engine/WORLD-RULEBOOK.md).

## 0. What you write, and what you never touch
- **You write one brief** for your stage, in the 7 fields below, from the lead's story brief (reference/engine/story-briefs/<id>.md).
  Your branch starts with no brief for your stage, on purpose: this tests whether the engine and these pages are enough.
- **You never edit** the engine, the world rulebook, or another stage's brief. If the brief can't say something the stage needs, stop
  and report it as an engine or rulebook finding. The engine gets fixed; the stage is never patched around it (Matt).
- Never invent a story fact, a line of dialogue or a piece. If the story brief doesn't say, ask: it's logged as a gap.

## 1. The 7 fields (WORLD-RULEBOOK §1)

| Field | Write | Take it from |
|---|---|---|
| `beat` | one line of story | the story brief's "Where Pokey is" |
| `teaches` | the moves this stage introduces, from the world's ladder (0-2, or more for a world's first stage) | the story brief and the ladder (rulebook §2) |
| `trend` | `up`, `down` or `level` | the story brief's feel and look |
| `ends` | `quiet` or `finale` | the story brief's "End:" line |
| `look` | the light and the backdrop, in a phrase | the story brief's look and setting lines |
| `must` | the clue, any find, the approved Dot lines (by row id), the dressing | the story brief's "What belongs"; Dot rows from dotLinesData.ts, only rows the brief names as approved |
| `not` | what other stages own, plus any move not yet taught | the story brief's "Owned by other stages" |

**Knobs (optional):** `branching` (none / some / lots), `water` (yes / no), `d` (0-1).

**The format** is the table above. There is no worked example for your stage on your branch, on purpose: your values come from your own story brief alone.

## 2. The order you work in
1. Read your story brief, then WORLD-RULEBOOK.md, then this part, then part 1.
2. Write the brief.
3. Run stage.ts (part 1). It generates the stage on 16 layouts, Normal and Easy, and runs every gate.
4. **Judge each breach** as one of:
   - **a brief fix**, changing a field. That counts as one of your 2 rounds;
   - **an engine or rulebook finding**: report it and stop that line;
   - **a known miss** on the world's list, which isn't yours;
   - **held art**, listed under "known held art".
5. Shoot the stills part 1 asks for, upright and sideways, judge them against your story brief's feel, and report.

## 3. Where the pass lines come from
- The hard rules and the world's targets and floors are in WORLD-RULEBOOK §2.
- You never set a number. If a line seems wrong for your stage, that's a finding for the designer, not a brief change.
