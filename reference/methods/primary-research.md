# Method: primary-source research (a number or a rule we must not guess)
Last proven: 2026-11-05, research-pacing, `reference/research/pacing-2026-11-05/PACING.md` (stage length across 15 shipped worlds,
fix rounds, the sources behind the pacing, variety and difficulty numbers). Owner of the last update: the pacing researcher (session
session_01FhBbYNM6H5Ssg4zpEHMD8g).

## When to use it
A brief asks "what do shipped games do" for a number in our rules (a length, a delay, a ratio, a count), or asks to source a number that
came from Gemini or an estimate.

## Steps (exact: tools, commands, settings, sizes)
1. Read CLAUDE.md, reference/LAWS.md, the brief's rows in full (their "Search:" lines are the brief). Write the start time
   (`TZ=America/New_York date`).
2. Test one TinyFish `fetch_content` call first. curl is refused by the proxy (403 on CONNECT) for outside hosts.
3. Look for the number in this order:
   a. **numbers the developers set inside the game**: Time Attack medal clocks (Super Mario Wiki level pages; DKC Returns' shiny tier on
      ludo.guide), code constants (open source: Celeste Classic's PICO-8 Lua), course timers;
   b. developer write-ups and postmortems (Game Developer, studio blogs: Yacht Club's 5-part deep dive);
   c. papers (open the paper, not the abstract quoted by someone else);
   d. speedrun.com IL records (API: `/api/v1/games?abbreviation=X`, `/games/{id}/levels`, `/games/{id}/records?scope=levels&top=1&max=200`).
      Many games have per-WORLD boards only (DKC Returns, Tropical Freeze, 3D World): check `levels` before relying on it;
   e. first plays by one creator (YouTube is blocked to the fetcher from this container; splits.io is gone).
4. Fetch wiki pages 10 at a time **without** selectors: a batch over the size limit is written to a file under tool-results, which a
   script then parses (`tools/medals.py`, `tools/unwrap.py` in the pacing folder). Save every page as text with URL and read date.
5. Only after your own source list: cross-check reference/research/ledger/*.md, GEMINI-PCG-RESEARCH.md, the R1-R4 notes.
6. Run the idea on our code (the inspector's builder `tools/inspect/stages.ts` + `src/game/stageTime.ts` for length; the first-timer bot
   `tools/inspect/inspect.ts --firsttimer` for a simulated clock), on more than one seed, and paste the output.
7. Test a proposed rule on every shipped world you measured, in both orderings where the play order is unclear, and give counts
   ("10 of 15"), not adjectives.

## The bar
Each row: the answer, its number, the saved source file:line and URL; or "searched, no source" with the places searched and the blocked
list. Every number tagged measured / dev-set / quoted / estimate. Example: PACING.md §2.3 (counts over 15 worlds), §5 (one line per row).

## Checks before reporting
Every file:line opened and re-checked after the last edit; counts re-run from the saved tables by a committed script (`count15.py`);
planned vs actual time at the top; the lead gets a 10-line summary and the branch head.

## Pitfalls we already paid for
- 2026-11-05: `include_selectors: ["table.wikitable"]` on a 10-page batch came back inline (about 60k tokens). Leave batches unscoped.
- 2026-11-05: a wiki's table-only fetch missed medal times that one page gives in a sentence; parse the prose too.
- 2026-11-05: guessed HowLongToBeat page ids returned other games. Never guess an id: search, then fetch the page the search names.
- 2026-11-05: a first count on one game's data (Tropical Freeze: boss always longest) did not survive a second game (DKC Returns: bosses
  short). Measure at least two studios before calling anything a pattern.

## Tried and didn't work
YouTube search pages (empty body), splits.io (404), pcgworkshop.com and t2thompson.com PDFs (unreachable), pressreader (empty),
amara.org transcripts (403), the Internet Archive copy of a 404 page (also 404: find the live URL by search instead).

## To try
First-play clocks from Twitch VOD chapter lists or a creator's own site; per-course 3D Mario clocks (none found on speedrun.com).
