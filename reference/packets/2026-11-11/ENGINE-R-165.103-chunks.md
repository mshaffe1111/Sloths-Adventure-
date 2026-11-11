# TASK R-165.103 (main JS chunk headroom)   to: Engine   model: claude-opus-5-5   effort: high   due: <dispatch + about 3 h>
## First, before any tool call
`git fetch origin main ccr-ca657d3c-n09zty t-engine-help t-engine-e0a`. Read with `git show origin/ccr-ca657d3c-n09zty:<path>`:
reference/roles/README.md, reference/roles/ENGINE.md, reference/LAWS.md, reference/LESSONS.md (D37-D39), reference/PERFORMANCE-RULES.md
(§1 and §8), reference/PLAY-STORE-RULES.md (offline play).
## Objective
Make room in the game's main JavaScript file. Every file must stay under 4 MiB (vite.config.ts: Workbox's maximumFileSizeToCacheInBytes,
and CLAUDE.md's gate). Measured 11-11: main's index-*.js is 4,164,594 B; fix A2 adds about 6.5 KB and E0a about 14.8 KB, so the 1-1
re-lay (C1) and E0b would push it over and fail the build. Target: the main chunk on origin/main at 3,994,304 B or less (200 KB spare).
## Why it matters
A build over the limit fails outright; the 1-1 fix can't ship. Smaller first load also helps a cold start on a low phone.
## Frozen inputs (do not change)
- No behaviour change: lock 102/102 unchanged (lockall vs main), the full suite green, seedlist 1-1 --check PASS.
- The game still plays fully OFFLINE after first load (the PWA precaches every chunk: check the generated sw has each new chunk), and the
  Play Store build (`VITE_STORE_BUILD=1`, no service worker) loads every chunk from the APK.
- Nothing the first frame of the title screen or of a stage draws may wait on a network chunk mid-play: a chunk a stage needs loads
  before that stage starts (behind the existing stage build / buildAhead.ts), never on the first frame of play.
- Find the weight first (D37: measure, don't guess): a bundle breakdown by module (rollup-plugin-visualizer or the sourcemap, your
  choice, not committed if it adds a dependency to the shipped game). Pick the split from that list and state each module's bytes.
## Files
- WRITE: vite.config.ts (build.rollupOptions.output.manualChunks or similar), the src/ files whose static imports become dynamic
  (name each in REPORT.md), NEW src/game/chunkBudget.test.ts or a tools/perf gate line: fail when any JS chunk passes 3,994,304 B
  (and add the row to reference/methods/gates.md). Nothing else.
## Definition of done (the Critic checks each)
1. Main chunk 3,994,304 B or less on origin/main + your change (vite build output pasted); no file over 4 MiB; the new gate red when the
   budget is set 1 byte under today's size.
2. Offline: the built sw.js precaches every new chunk (grep), and a Playwright run with the network cut after first load starts 1-1 and
   reaches the first checkpoint. Store build: `VITE_STORE_BUILD=1 npx vite build` then serve dist; 1-1 plays.
3. Cold start: title screen and 1-1's first frame times before/after on CPU x4 (no worse than +50 ms), drawcheck PASS.
4. tsc, full suite in 3 shards, lock 102/102, seedlist 1-1, knowncheck, buildcheck (alone).
5. Merge note: the same change applied onto t-engine-help and t-engine-e0a builds under budget (say the bytes; don't push to them).
## Return
Branch t-engine-chunks from origin/main, pushed (git ls-remote). REPORT.md (the 7 sections plus "Method used" and "Lessons applied"), 40
lines or fewer. Then ONE send_message to the lead (session_01FhBbYMoqqEdVR3qFjTCugy), 6 lines or fewer. Then stop.
## Attempt
1
