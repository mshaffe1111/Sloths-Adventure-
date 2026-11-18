# ENG-24c: 2-4's last two engine pieces before it ships: the raft look (R-165.288) and the glow that agrees with the log (R-165.289).
Engine, Opus 5.5 xhigh. Written 4:17 PM ET 11-18 (by `date`). BOX: hash by 8:30 PM ET, or 50% REAL context (get_session at idle).
Role card reference/roles/ENGINE.md. Read FIRST level.md (Building rules), LESSONS.md once (D79, D81, D83, D86: the FULL CLAUDE.md check
list), the ROADMAP rows R-165.288 and R-165.289 (reference/ROADMAP.md on the lead branch), ENG-24's REPORT (origin/t-eng-24) and
BUILD-24's REPORT (origin/t-build-24: the raft beat laid as a long log; the glow finding: engine.ts:2412-2426 + physics.ts:735 inSweetSpot
light on swing phase only; over a log river they say "now" on 14-59% of swings whose let-go lands in water), the story keeper's 2-4 lines
(origin/t-keeper-24 lines-2-4.md: "Knock? Log coming! Let go when it's under you.").
Branch t-eng-24c from origin/t-meter-3 (42459a5c: main + ENG-24 + METER-3). Engine only; do NOT edit tools/inspect/firsttimer.ts (BUILD-24b
owns it today) or 2-4's stage data (BUILD-24b).
1. R-165.288 the raft: RiverRow.look 'raft' carried by layRiver to the drift platform, drawn by the existing raft painter (spanArt
   'raft'); art = collider (the raft's walkable top is its floor); planted test (a raft row draws the raft, a log row still a log).
2. R-165.289 the glow agrees with the log: per liana over a river, precompute ONCE the landing x for each swing phase from riverLay's own
   flight (pressLaunches + airStep, the turn push the liana judge uses), then each frame light the glow/glint only when a let-go NOW lands
   on a log (look up the phase; test the logs' positions at the landing time), both settings; no per-frame flight (perf). The sweet-snap
   and early-press behaviour stay untouched (no stage lock moves). Planted: over a full log cycle on ENG-24's toy, glow on <=> a let-go now
   lands on a log; 1-6's glow unchanged (no river under its lianas). If (2) can't land in the box, the fallback is NO glow over a log river
   (display only), planted the same way: say which you shipped.
3. THE CLAUDE.md CHECK LIST, EVERY ITEM, once on your final head: tsc, the suite, build + chunkcheck, artcheck, drawcheck (every stage both
   ways: the glow is drawn; perf budget must hold), clipcheck, kbdcheck, buildcheck, knowncheck, generality, roadmapcheck (unshallow),
   seedlist 1-1 --check, the CI tool line, tierBots, coveragecheck, lockall vs main (no layout may move).
4. Stills/clip on the toy: the glow lighting only with a log under the landing, both ways; the raft in play.
REPORT reference/qa-reports/ENG-24c/REPORT.md (hash, gates, toys red/green, perf numbers, what the 2-4 builder wires, Learned).
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM; every message carries REAL context. Times from `TZ=America/New_York date`.
