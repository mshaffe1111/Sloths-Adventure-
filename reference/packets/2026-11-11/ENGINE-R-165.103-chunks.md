# TASK R-165.103 (main JS chunk headroom)   to: Engine   model: claude-opus-5-5   effort: medium   due: <dispatch + about 2 h>
## First, before any tool call
`git fetch origin main ccr-ca657d3c-n09zty t-engine-help t-engine-e0a`. Read with `git show origin/ccr-ca657d3c-n09zty:<path>`:
reference/roles/README.md, reference/roles/ENGINE.md, reference/LAWS.md, reference/LESSONS.md (D37-D39), reference/PERFORMANCE-RULES.md
(§1 and §8), reference/PLAY-STORE-RULES.md (offline play), reference/methods/gates.md.
## Objective
Make room in the game's main JavaScript file. Every file must stay under 4,194,304 B (vite.config.ts: Workbox's
maximumFileSizeToCacheInBytes; CLAUDE.md's gate). Measured 11-11 by the packet Critic: origin/main's index-*.js 4,164,610 B;
t-engine-help 4,172,660 (+8.1 KB); t-engine-e0a 4,179,880 (+15.3 KB). The 1-1 re-lay (C1) and E0b would push it over and fail the build.
Target: main chunk 3,994,304 B or less (200 KB spare).
## The method (the packet Critic proved it on main)
FIRST a static vendor split: build.rollupOptions.output.manualChunks sends react, react-dom and scheduler to a 'vendor' chunk. The
Critic's one-line try: main 3,944,490 B, vendor 218,740 B, vendor in sw.js and modulepreloaded, no dynamic imports. Only if that leaves
less than 200 KB spare, add more static manual chunks (never a dynamic import of anything a stage needs). The biggest modules by the
sourcemap: gen2/seeds.ts 219,503 (pipeline needs it synchronously), react-dom 207,532, engine 177,951, protoStage 133,245, story* +
pokeyJournal 149,927 (menu only), dotLinesData 82,799.
## Frozen inputs (do not change)
- No behaviour change: record lockall on origin/main first (the only lock file in the repo is lockall-main-0.9.4.json and main is
  0.9.5), then --check: 102/102 unchanged. Full suite green; seedlist 1-1 --check PASS.
- Plays fully offline after first load (every chunk precached by sw.js); the Play Store build (`npm run build:store`, which runs
  checkStoreBuild.mjs) loads every chunk from the APK.
## Files
- WRITE: vite.config.ts; NEW tools/perf/chunkcheck.mjs (run after vite build: fails when any JS chunk passes 3,994,304 B, printing each
  chunk's size); reference/methods/gates.md (its row); .github/workflows/gates.yml (a step after the build); CLAUDE.md (one line in
  Checks); reference/ROADMAP.md (R-165.103's State when done); REPORT.md; your turnover note (reference/handoffs/engine-core.md).
## Definition of done (the Critic checks each)
1. vite build output pasted: main chunk 3,994,304 B or less, no file over 4 MiB; chunkcheck PASS, and red when its budget is set 1 byte
   under today's main chunk.
2. Offline (a scratch script, not committed): `vite preview` of dist, wait for the service worker to activate, context.setOffline(true),
   reload, tap through the real UI into 1-1 (the DEV-only __play hooks don't exist in dist), assert zero failed requests and 60 frames
   drawn. Store: `npm run build:store` passes and its dist serves 1-1.
3. Cold start, prod dist, CPU x4, 10 runs each before and after, median of performance marks at the first title draw and the first
   stage frame: after no worse than before + 50 ms. drawcheck PASS.
4. tsc, full suite in 3 shards, lock 102/102, seedlist 1-1, knowncheck, roadmapcheck, buildcheck (alone).
5. Merge note: the same vite.config.ts change on t-engine-help and t-engine-e0a builds under budget (bytes; don't push to them).
## Return
Branch t-engine-chunks from origin/main, pushed (git ls-remote). REPORT.md (the 7 sections plus "Method used" and "Lessons applied"), 40
lines or fewer. Then ONE send_message to the lead (session_01FhBbYMoqqEdVR3qFjTCugy), 6 lines or fewer. Then stop.
## Attempt
1 (rewritten 11-11 6:35 AM ET on its packet Critic's seven findings)
