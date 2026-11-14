# FEEL-VINE plan (R-165.214), written 5:49 PM ET, branch t-feel-vine from origin/t-int-5 (e8afc05)
1. MEASURE first: tools/inspect/vineFeel.ts (new) drives the real engine (RealPlay, 30 fps) through 1-4's grab from a bough, the vault
   at a vine top (both facings) and a vine-to-vine move, Normal and Easy; prints per-frame x/y/vx/vy/state and flags stalls, snaps
   (px in one frame), velocity jumps, pose pops, ignored input. BEFORE clips from the real page (both orientations).
2. Fix at the root, every stage (no stage id/seed/x in engine code; straight up/down on a vine still climbs; no reach number loosened).
3. Planted tests (a snap that came back fails), AFTER clips beside BEFORE, full CLAUDE.md Checks, lock + seed lists PASS.
## WRITE files
- NEW: src/game/vineFeel.ts, src/game/vineFeel.test.ts, tools/inspect/vineFeel.ts, reference/qa-reports/FEEL-VINE/** (clips, REPORT.md)
- src/game/engine.ts: ONLY the trunk-climb block (section "1. TREE CLIMBING LOGIC", ~2038-2227). Token held by B14: asking the lead.
- Render-side pose blend if the measure shows a pose pop: src/game/heroClips.ts (climb pick only). Asking before touching it.
- NOT physics.ts (PERF-BUILD holds it); if a fix needs it I merge origin/t-perf-build's final head first and tell the lead.
