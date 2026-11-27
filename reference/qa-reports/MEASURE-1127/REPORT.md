# MEASURE-1127: where a level's hours went (2-6, 2-7, 2-8, 2-9, 3-1 so far)
Written 11-27 5:34 PM ET by MEASURE-1127 (session_01FhBbYMZFk9QipGpP422arc), from get_session records only (no member estimates, D64).

**EXACT NEXT STEP:** (1) split the 39 class-c and 23 class-d boxes by their STATE lines (grep each title code in reference/STATE.md;
a box whose STATE line says "merge" then "red" gets minutes split at that line's time); (2) measure class (e) as minutes: for each of
the 16 boxes that ended need_input, the gap to the lead's ruling line in STATE; (3) add the World 3 lanes whose titles do not name
3-1 (ENG-CATCH*, KIT-W3a*, ENG-ROOT*: excluded here, see "Not measured").

## The rule (written before the numbers, applied to every session the same way)
- Source: list_sessions (mine, 4 pages of 100 = 400 sessions, 11-19 7:21 PM ET to now); minutes = updated_at - created_at
  (checked by hand: BUILD-28-m ended 12:37 PM ET = STATE:2920 STOP; ENG-DEAL ended 2:29 PM ET = STATE:2939 LANDED;
  LAND-26-e started 4:37 PM ET 11-26 = STATE:2704 "18 min" at 4:55). Cost = usage.cost_usd; context = context_usage.used_tokens.
- Level: the code in the title's prefix (BUILD-28, ENG-27g, LAND-26 ...; ENG-DARK/ENG-SPORE = 3-1), else the first level the
  title names. One level per session (no split). 219 sessions matched; leads and this session excluded.
- Class, from the title after the colon (the packet's stated job), the earliest keyword within 60 characters wins:
  (c) merge / re-base / land / "on the merged head"; INT- and LAND- prefixes are (c) unless a red word comes first;
  (d) red / trace / untraced / bisect / false / inherited / stale / cause / blocker; (f) gate run / gates / re-run / recheck;
  then by prefix: BUILD-/KEEPER-/DESIGN- = (a) building the level; engine, kit, art, fix lanes = (b) a piece.
  (b) is split: **b0** = piece work that started BEFORE the level's first BUILD-/LAND- box (planned engine-first; a 7th bucket the
  six classes did not cover), **b** = piece work after the build started (found or finished mid-build).
- (e) waiting on the lead is not inside any session's minutes; it is counted as boxes that ENDED need_input (16), not hours.
- A box in two classes is NOT split in this pass (title's first job only): see NEXT STEP (1).

## Per level (helper-hours = sum of session minutes; errors = class-d boxes, each a box spent tracing a red)
| Level | Boxes | Helper-h | Cost | a build | b0 ahead | b mid-build | c merge | d red | f gates | ended waiting |
|---|---|---|---|---|---|---|---|---|---|---|
| 2-6 | 57 | 37.1 | $399.02 (52/57 read) | 8.7 h | 3.2 h | 8.4 h | 9.2 h | 6.1 h (9) | 1.6 h | 4 |
| 2-7 | 55 | 31.4 | $393.21 (46/55) | 0.6 h | 9.2 h | 8.1 h | 6.0 h | 4.0 h (5) | 3.4 h | 4 |
| 2-8 | 42 | 22.4 | $236.55 (41/42) | 2.9 h | 8.2 h | 4.4 h | 4.0 h | 1.0 h (2) | 1.9 h | 2 |
| 2-9 | 25 | 13.0 | $137.51 (21/25) | 1.2 h | 3.6 h | 6.5 h | 1.4 h | 0.3 h (1) | 0 | 3 |
| 3-1 | 40 | 25.8 | $259.27 (38/40) | 0 (no build yet) | 18.3 h | 0 | 3.3 h | 4.2 h (6) | 0 | 3 |
| All | 219 | 129.7 | $1,425.56 (198/219) | 13.4 h 10% | 42.5 h 33% | 27.3 h 21% | 23.9 h 18% | 15.7 h 12% | 6.8 h 5% | 16 |

## Top three sinks (share of 129.7 helper-hours)
1. **Engine/kit piece work, 69.8 h = 54% ($774)**: b0 42.5 h + b 27.3 h. One lane dominates: ENG-DARK (3-1's single lane) 20 boxes
   10.2 h, the title of its 26th box "ENG-DARK-z: 3-1 box 26"; ENG-29 9 boxes 6.4 h; W2-LANE 9 boxes 5.1 h; 2-7's ENG-PLANT a-u
   (21 boxes). The level's own build (a) is only 10%: the pieces are the level's time, not the laying.
2. **Merging and landing after a base moved, 23.9 h = 18% ($254)**: INT-R5-c 170 min ($12.83), LAND-26 a-g, BUILD-28-m
   "merge release 5's frozen head" (stopped before gates, STATE:2920). STATE has 204 merge-line mentions of these five levels (a line naming two levels counts twice).
3. **Tracing reds, 15.7 h = 12% ($132)**, 23 boxes: LAND-26-e 110 min on 14 untraced kid rows then a stale seed list (STATE:2716);
   INT-R5-b 149 min "2-7's stale list rebuilt"; ENG-DARK-z 120 min. 2-6 alone lost 9 boxes to reds.
Gates re-run as their own box are small (5%); most gate time sits inside a, b and c boxes and is not separable from titles.

## Start-up cost (three 11-27 boxes, list_events assistant usage)
| Box (11-27) | first turn | min 5 | min 10 | min 25 | biggest reads in the window (chars) |
|---|---|---|---|---|---|
| build BUILD-28-m ...wmPwUipb | 88.9k | 118k | 157k | 215k (24.0 m; = its get_session used_tokens) | LAWS 9.2k, CONTENT.md 7.0k, LESSONS tail 6.9k, level.md 6.4k; 64 reads 142k |
| engine ENG-CATCH-e ...KcF9yQCB | 88.9k | 156k | 190k | 272k (22.0 m) | pipeline.ts in 4+ slices ~24k, tower.ts 6.9k, probes 6.8k; 97 reads 141k |
| kit KIT-W3a-f ...qMuXbqVy | 88.8k | 155k | 212k | 264k (22.3 m) | level.md whole 13.6k, w3.ts 11.4k, roles/README 11.2k, LAWS 9.2k; 81 reads 189k |
Verdict on LEADER-STANDARD-WORK.md:51 ("270-350k within 25 minutes"): engine 272k and kit 264k sit at the claim's floor; the build
box is at 215k, BELOW it. Every box starts at ~89k before reading anything. Tool results explain only 1/3-1/2 of the growth; the rest
is the box's own turns (scripts, tool inputs, thinking).
End-of-box context across 198 readable sessions: median 237k, range 114k-494k (context_usage.used_tokens).

## Not measured / could not read
- 21 sessions had no usage block (cost unread; listed "unread" in sessions.csv), e.g. LAND-26-e, ENG-26c, BUILD-26r, ENG-27d.
- Sessions before 11-19 7:21 PM ET (2-6/2-7 design and early engine) are past page 4; the World 3 shared lanes that do not name
  3-1 (ENG-CATCH*, KIT-W3a*, ENG-ROOT*) are not counted, so 3-1 is UNDER-counted.
- Minutes are created->updated: an idle tail before archive would inflate them (two long boxes checked; both matched STATE).
Gates (5:36 PM ET): roadmapcheck FAIL (41) both on HEAD and on base fb6714f65 (unshallowed; 12 are PR #77/#78, 29 are commits on branches
not fetched): inherited, no ROADMAP change here. timecheck: tools/timecheck.mjs is in no fetched branch: NOT RUN. knowncheck PASS.
