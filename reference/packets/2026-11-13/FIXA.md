# FIX-A: 0.9.8's words and Dot fixes (Opus 5.5 high, engine). Written 12:00 PM ET by the lead. Branch t-fixa from origin/ccr-ea739a2f-dfcee4.
Why: Matt 12:00 PM: tonight's release carries the fixes he and his wife's blind test asked for. Lines are FINAL from the story keeper
(t-story@400b4c13 STORY-KEEPER.md table; copy exactly). Built on: main 0.9.7; replaced this sprint by: none. Each item: fix at the root, a
planted test, on the real page with each setting's DEFAULT options (Normal Tips, Easy Help, D50), stills upright + sideways, fresh + old save.
1. R-165.175 Dot's cards: TAP to clear + a slow fade (unread fades after ~3x reading time; one at a time with a +N badge; a tap never jumps;
   1-1 teaches it with "Tap here when you've read it. I'll wait!"). Measure today's readMs on the real build first (dotGuide.ts).
2. R-165.171 the first-jump coach line fires at a raised step: touch "Flick up to hop up or over." / pad "Press Jump to hop up or over."
3. R-165.165 1-2's bell find text: "Down in the hollow, on the low ledge."
4. R-165.166 the snake renamed Golden Eyelash Viper in every player-facing spot (the keeper listed 3; grep -rn the whole src/).
5. R-165.147 1-3's trap teach is seen: a TEACH line kind that waits, stays and outranks stock lessons at a stage's teach beat (general, tested).
6. R-165.155 the goal sign stops at the goal (10/10), no over-count.
7. R-165.158 About: "Inspired by" + the music line from STORY-LINES 11-12 (keeper's words; About claims only what ships); clipcheck both ways.
WRITE: dotGuide*.ts, dotLinesData.ts, the coach/lesson files, the About screen component, goal sign HUD; no stage data, no gen2/, no engine.ts
(B14 holds it: if you need it, ask the lead). Full Checks on your head. REPORT 30 lines. Stop line 7:30 PM ET.
