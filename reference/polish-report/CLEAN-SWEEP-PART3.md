# Clean sweep part 3 (polish-clean's share): where it stopped (Matt's stop for the night, about 11:00 PM ET, 2026-10-29)

Done and pushed (not yet proven by a full walk):
- C1 key spill: tools/art/defringe.py (spill only, edge pixels tinted magenta/green or shifted toward magenta from the paint inside;
  thin pieces and glows left alone) written into src/assets/ground/w2.webp, kits/w8.webp, props/dot-props.webp, props/dress.webp,
  props/w4-props.webp, proto/props-atlas.webp. Light halos (C2): left as they are (puzzle-kit is faint, hud-atlas and w3-props are glows).
- C4 6-8 floating posts: w6StiltArt.ts drawLashed draws each stilt 14 px on into the ledge it stands on (STILT_SINK).
- C5 2-3 / 2-8 pulley post: puzzlePlay.ts drawCageLift keeps the post within 1.35x its picture and lays its plain shaft again to the
  bank (puzzleArt.ts drawKitArt `band`).
- Checks run: tsc clean; w2Stages, w6Stages, puzzleKit tests pass (46). Full suite and vite build NOT yet run.
- Start-check re-runs: 9-10 and 10-3 have their backdrop from 0.2 s both ways.

Not done:
- C3 HUD overlaps (Dot's box / score pop-up / boss name over the lives counter): proposal sent to polish-c
  (session_01FhBbYJojJwqFxv2u9mo8uR), no answer yet; nothing changed.
- The after-walks (1-5, 2-3, 2-8, 4-3, 5-6, 6-8, 8-1, 4-D) were stopped part-way (10 of 16 read).

Next step: re-run `npx tsx tools/inspect/walk.mjs --stages 1-5,2-3,2-8,4-3,5-6,6-8,8-1,4-D --keep-canvas` on this branch, compare
each stage's counts with CLEAN-SWEEP-DETAIL-counts.json and the C1/C4/C5 crops before/after, run the full gate (suite + vite build),
then C3 once polish-c answers, then report to the lead.

polish-c's answer (11:52 PM ET): go ahead with the DotGuide.tsx change (hard keep-outs for the lives/score plaques, name tag
included); adding the "+N" delta as a keep-out in VineHud.tsx won't clash (polish-c 287678 touches only setGuideSafeArea there). The
upright boss name over the lives "×3" is BossHud/bossRect in hudLayout.ts: not polish-c's, ask the lead before taking it. After the
change run tools/qa/fit.mjs (npm run test:fit, on polish-c's branch) so the safe-area checks stay green.
