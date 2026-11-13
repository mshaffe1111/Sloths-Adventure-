# ECONOMY: one design for what the player earns and loses (R-165.194). Designer, Opus 5.5 high. DESIGN ONLY (no src/ edits).
Written 11:51 AM ET by the lead. Branch t-economy from origin/ccr-ea739a2f-dfcee4. WRITE: reference/design/ECONOMY.md (60 lines max) + reference/qa-reports/ECONOMY/*.
Why (Matt, 11-13 11:50 AM ET): "Score doesn't matter at all... we need to figure out how stars get used. And if we're adding new lives, we already
have a ton of them. I think we have too many hearts... it is really hard to lose a game... we need to really take into account what we're adding and
how it would already affect what we created. Most people won't need an extra life." Facts to start from (check each in code): fruit/flowers +100 score
(src/game/engine.ts:3127) and the score is shown nowhere; stars (src/game/rules.ts:157 calculateLevelStars) feed medals (src/game/badges.ts);
hearts 5 (engine.ts:1052 area), lives x3 on the HUD; finds fill the journal; the story keeper's wrapper: fruit is gathered for Meeca's welcome-home
table, the HUD shows a woven basket (t-story@3818d2f7). The lead's starting position (test it, don't obey it): score goes; stars become the currency
(open each world's hidden stage, medals); fruit feeds a star (a full basket); hearts/lives tightened on Normal, generous on Easy; finds keep the
journal + hidden-stage keys. Built on: main 0.9.7; replaced this sprint by: none. It is the foundation for R-165.193 (rewards piece) and S3 (meter targets).
## Done
1. Research first (CLAUDE/LEAD-PERSONA "Inspired by a classic"): how Super Mario Run's colored coins, Super Mario Odyssey/3D Land's stars, Donkey
   Kong Country's KONG letters and bananas, Rayman Legends' lums/teensies and Celeste's strawberries made collecting matter; what each got right and
   wrong for phones and children; what we take, what we never copy. 8 lines, sources named.
2. Today's numbers, measured: hearts per stage, heart pickups, checkpoints, lives, how often a player loses a life or reaches Game Over (bots: child,
   middle, expert on 1-1..1-3 and two later worlds; tester data only as aggregates if the analyst tools give it). Name the source of each.
3. The design: what each thing does (score, stars, fruit/basket, finds, hearts, lives, checkpoints), Easy vs Normal, how it is shown with no words,
   and what it changes in what we already built (every shipped stage, the medals, the HUD). Every rule a number with its reason.
4. A ranked change list as ready packets (size, WRITE files, order), including what gets DELETED (new replaces old).
5. Fast gates only. REPORT.md 30 lines. One message to the lead, 5 lines. Stop by 2:30 PM ET.
