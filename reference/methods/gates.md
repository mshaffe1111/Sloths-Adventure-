# Method: gates (the automatic checks every change passes)
Last proven: 2026-11-01, kaizen-gates (built clipcheck, playerText.test, knowncheck, CI gates.yml). Owner of the last update: kaizen-gates helper.

## When to use it
- Before every report and every merge: run every gate below, in this order. LAWS.md law 5: never skip, loosen or "expected-fail" one.
- When a defect escapes (CONTINUOUS-IMPROVEMENT.md): the countermeasure is a new check here (L3), built with "Adding a new check" below.

## The gates (what each catches, how long, where)

| # | Command | Catches | Time here / in CI |
|---|---|---|---|
| 1 | `npx tsc --noEmit -p .` | type errors | about 2 min / in publish |
| 2 | `npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts` | every unit test, including `artUse.test.ts` (art made but never drawn) and `playerText.test.ts` (repeated, look-alike or filler player text; a journal page that repeats a line) | over 25 min in this container (run it in the background) / 6 shards side by side |
| 3 | `npx vite build` | build errors, any asset over 4 MiB | about 10 s |
| 4 | `node tools/perf/artcheck.mjs` | an image over 4096 px on a side | seconds |
| 5 | `node tools/perf/knowncheck.mjs` | a known-defect list that GREW (clipknown, playerText.known, limits.json, artUse.allow) compared with main | seconds |
| 6 | `node tools/perf/clipcheck.mjs` | menu text that overflows or is cut off, tap targets under 44 px, tap targets inside the phone's insets, on every menu screen and pop-up, 412x915 and 915x412, fresh/old/finished saves | 270-290 s here / 179 s in CI (gates job about 4.5 min with setup) |
| 7 | `node tools/perf/drawcheck.mjs` | per-frame canvas work over `limits.json` (gradients, shadows, blends, readbacks, full-screen layers, shrunk sheets) | about 6 min / own CI job, about 6.5 min with setup |

In CI (`.github/workflows/deploy.yml`): the test shards and `gates.yml` (artcheck, knowncheck and clipcheck on one runner; drawcheck on its own runner) run side by side. `publish` needs all of them, so a failing gate blocks the live site.

## Reading a breach
- **clipcheck**: each line is `✗ <kind> <selector> "<text>" (<detail>)`, then where it was seen: `<screen> @ <up|side>/<fresh|old|done>`.
  - Kinds: `cut` (past an overflow-hidden box, or off the screen's side); `overflow` (bigger than a box that doesn't scroll); `small` (tap area under 44 px; the size is printed); `inset` (a tap target inside the notch, status-bar or gesture band).
  - The contact sheet `<out>/contact.jpg` shows each screen with the breaches outlined and numbered. `breaches.json` has them all.
  - `could not open: ...` (exit 2) means the walk got stuck, and a screenshot of where it stuck is named. Fix the walk step (a new pop-up in the way, a renamed class); never delete the step.
  - Narrow a re-run with `CLIPCHECK_ONLY=journal` (judge only matching screens) or `CLIPCHECK_WALKS=done:side` (one walk). The stale-entry check only runs on a full walk.
- **playerText.test**: the failing test is named `<list>: <rule>` or `journal page World N (<save>): ...`. `PLAYERTEXT_DUMP=1 npx tsx src/game/playerText.test.ts` prints every failure in full: the ids and the line.
  - "differ only in a number or name" means the line repeats with only the world, stage, number or number word changed. Write each line for its item.
- **knowncheck**: `✗ <file>: N entries ADDED` lists them. Remove them and fix the defect; a known list never grows.
- **drawcheck**: see PERFORMANCE-RULES §8.1. Each breach names the call sites (file:line).

## Known lists: shrink-only (LAWS.md law 5)
A new gate may start with the defects that already exist only if:
- the list can only shrink: `knowncheck.mjs` fails an added entry, and the gate itself fails an entry that no longer shows up ("stale known entry ... delete it");
- every entry carries its group or kind and an owner, and is in the defect log.

The lists:
- `tools/perf/clipknown.json` (`group`, `owner`). Tap and inset entries match by selector, text entries by selector and text.
- `src/game/playerText.known.json` (`key`, `kind`, `owner`).
- `tools/perf/limits.json` (`art.knownOver4096`, `blends.allowlist`).
- `src/game/artUse.allow.json`.

When you fix a known defect, delete its entry in the same commit, or the gate fails.

## Adding a new check (the steps that worked for clipcheck and playerText)
1. **Start from the defect log.** Name the defect it would have caught, and write the rule as a pass/fail sentence.
2. **Copy the shape of the nearest gate.** A browser check copies `clipcheck.mjs`:
   - it builds with `vite build` into a temp folder and serves it with `vite preview`. The dev server's thousand modules were too slow for 6 pages at once: goto timeouts.
   - it runs its own server on a free port;
   - it seeds saves from ids read through `tsx` (`clipseed.ts`), so ids never go stale;
   - exit codes: 0 pass, 1 breach, 2 couldn't run.
   A text or data rule is a unit test in `src/game/*.test.ts`, so CI already runs it.
3. **Make the walk/inputs cover every state**: fresh, old (no play records) and finished saves; upright and sideways; scrolled to the end.
4. **Run it on main**, then go through every hit by eye (screenshots) and remove false positives in the rule, not by listing them. Those we hit:
   - text scrolled out of a scroll box is not cut;
   - glyphs poke out of a `line-height: 1` plaque by about a third of the font size;
   - a pop-in `scale()` shrinks the box mid-animation (wait for animations, and size tap targets by `offsetWidth`);
   - a vertical list doesn't scroll out of the sideways notch band.
5. **Run it twice** and compare: anything that comes and goes is a timing bug in the check. Fix it before you freeze the baseline.
6. **Freeze the baseline** as a known list (owner and group per entry). Add the list to `knowncheck.mjs` `LISTS`.
7. **Wire it in:**
   - the CLAUDE.md checks line;
   - this file's table;
   - PERFORMANCE-RULES §8 if it is a perf or screen gate;
   - tools/README.md;
   - `.github/workflows/gates.yml`. Prove the job on a real runner with a temporary `push:` trigger on your branch, then remove the trigger.
8. **Report** the runtime, every breach grouped by screen and cause (ranked by how visible it is on a phone), and the known list by owner.

## The bar
- Example 1: `node tools/perf/clipcheck.mjs` on main prints `PASS (58 known)` in about 270 s, with no "could not open".
- Example 2: on a branch that adds a pop-up with a 33 px Close button, it prints `✗ small ... "Close" (71x33 px tap area)` with the screen and the save.
- Example 3: on the whatsnew + journal-voice merge, it named the one new breach at once (the Satchel tab under the sideways notch).

## Checks before reporting
Every gate in the table, in order. Run the full unit suite in the background (it takes over 25 min here), and only send the report after it ends. Paste each gate's last line into the report.

## Pitfalls we already paid for
- 2026-11-01: `pkill -f "vite --port 4301"` from a Bash call killed the shell running it, because the pattern matched its own command line. Kill by PID, or use a pattern the calling command doesn't contain.
- 2026-11-01: the first clipcheck used the dev server, and 5 of 6 walks timed out on `goto`. Use build + preview.
- 2026-11-01: Playwright's `click()` waited behind a toast over the World Map arrow. Navigation taps use `el.click()` in the page; the check judges what is on screen, not Playwright's hit-testing.
- 2026-11-01: a fresh save opens "Who's exploring?" before the World Map. The walk judges that screen and picks a mode.
- 2026-11-01: the lead's two sightings (find hints, journal numbers sideways) didn't reproduce as cut text: the journal's right page is a small scroll box inside the scrolling Satchel, so the numbers sit below an inner fold. The check treats text you can scroll to as not cut, so a nested scroll box needs a human look (or a future check).

- 2026-11-01: the first CI run showed clipcheck green while it had crashed. Two causes: GitHub's default `run:` shell is `bash -e` with no pipefail, so `| tee` hid the exit code; and vite colours its "Local:" line in CI, so the readiness match never fired. Any step that pipes a gate's output sets `shell: bash` (pipefail), and logs are matched with ANSI codes stripped. Open a new gate's CI log once and read its last line; never trust the green tick alone.

## Tried and didn't work
- Hard-coding unsafe-inset bands and ignoring CSS: headless Chrome's `env(safe-area-inset-*)` is 0, so the game placed things in the bands and every screen "failed". Chrome's CDP `Emulation.setSafeAreaInsetsOverride` (Chromium 153 here) makes `env()` real; use it.
- Counting every text line past an overflow-hidden ancestor: every scrolled list "failed". Stop the ancestor walk at a scroll box on that axis.

## To try
- A nested-scroll check: a scroll box inside a scroll box on the same axis, with text below the inner fold at rest.
- clipcheck at 360x800 as well (the smallest phones).
- Split the playerText Dot-line rule so control-test copies (`ctest.*`) of a lesson are allowed, if the lead agrees they're not player-facing.
