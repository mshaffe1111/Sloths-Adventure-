# FIX-A plan (Engine, t-fixa, written 12:04 PM ET)
WRITE: src/game/dotGuide.ts, dotGuideView.ts, dotGuideHelp.ts, dotGuideWatch.ts (+ their tests), dotLinesData.ts, dotLines.ts, lessons.ts, touchCoach.ts,
src/components/CoachOverlay.tsx + the Dot card component in src/components/dot/ (tap-to-clear, +N badge), finds.ts (w1_note hint text only),
journal.ts + creatureLore.ts (snake name only), src/components/TitleSettings.tsx + a new src/components/AboutPages.tsx (About), src/components/hud/ (goal sign),
new tests; reference/qa-reports/FIX-A/ (stills), REPORT.md, reference/handoffs/engine-core.md.
Not touched: engine.ts, types.ts, gen2/, stage data, gates.yml, limits.json, seed lists.
Order: 1 measure readMs on the real build; 2 tap-to-clear + fade (planted tests first); 3 words (171, 165, 166); 4 teach kind (147); 5 goal sign (155: goalShown is on main already, I check every other sign); 6 About; 7 stills + full Checks.
Item 7 note: the music line is line 3 of "What's ours", and the approved About screen (What's ours + Our story + Inspired by) is not in code: I build the approved FINAL layout unless the lead says Inspired-by only.
