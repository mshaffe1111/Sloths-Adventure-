# ECONOMY plan (R-165.194), Designer, branch t-economy. Design only: no src/ edits.
WRITE (only these): reference/design/ECONOMY.md (<=60 lines); reference/qa-reports/ECONOMY/* (PLAN, REPORT, measure.ts, raw/*.jsonl,
summary); reference/handoffs/designer.md (turnover note, README rule 10: rewritten at the end; asking the lead now, one line).
Steps: (1) research 8 lines, sources named; (2) measure: measure.ts flies the real engine (RealPlay 30 fps) with the R-165.59 tier bots
(child/middle Easy+Normal, expert Normal) on 1-1, 1-2, 1-3, 3-4, 6-3 x 12 seeds: hits, lives, Game Overs, put-backs, hearts laid, flags;
(3) design: score, stars, basket, finds, hearts, lives, flags; Easy vs Normal; no-word display; what it moves in shipped stages/medals/HUD;
(4) ranked packets incl. deletions; (5) fast gates (tsc, roadmapcheck, knowncheck, generality), REPORT.md 30 lines, 5-line message. Stop 2:30 PM ET.
Fact already corrected: the score IS shown (VineHud.tsx:551-566 when it changes; StageCleared.tsx:241; GameOverCard.tsx:52).
