# PROOF-1 item 5: played as a player (fork), 2026-11-12 09:30-10:36 ET
Shipping build (BASE /Sloths-Adventure-/, production, no dev hooks) served statically: head d0276817 :8801, main 0.9.6 :8802. Touch only
(CDP touch / touchscreen taps), real time, 390x844 and 844x390, deviceScaleFactor 1. Scripts: menus.mjs, play11.mjs, bossintro.mjs; shots/,
sheets/ (contact sheets), logs/*.json (every page and console error, every miss).
- Fresh save, both ways up, head + main(up): title, Play, who's exploring, map, 1-1 (prologue skipped), live 1-1, touch play, pause, Satchel 5 tabs, Journal p2.
- Finished save, both ways up (head) and sideways (main): title (Continue), map, by map taps 1-3, 1-10 (boss: intro, guardian card, fight start),
  2-4, 3-5, 4-1, 5-6, 5-M (Meeca), 6-2, 7-1, 8-3, 9-4, 10-5: each played ~10 s by touch, paused, quit to map; Satchel, Journal.
- 1-1 to its end, fresh save, touch bot: head sideways x4 (one with phone insets), head upright x2, main sideways x2: every run reached the exit,
  World 1 story, Stage Cleared card. 4-6 rescues a run (flag teleports: the bot is crude), 0-2 help offers taken, 0 deaths.
- Page errors 0, console errors 0, in all 16 logs.
## Found
1. HEAD-ONLY polish: Stage Cleared card at 844x390 with a phone's insets (bottom 21): card 384 px tall from y 34 (main 368), cut 28 px at rest
   (main 12); bottom row Previous/Play again/World map at y 340-384, 15 px inside the home-bar band (main 336-368, clear). Cause: index.css
   @media (max-height:400px) .clr-btn2 32->44 px (the tap-size fix). The scrim scrolls (439 vs 390), so reachable. clipcheck misses it: it opens
   this card at 915x412 only, where the max-height:400 layout never applies. logs/head-play1-1-side-insets.json, sheets/cmp-cleared-side-insets.jpg.
2. Not a defect (intended): boss entrance timer runs 1.000x real time in 1/30 s steps on head, ~1.15x on main (variable dt), so head's boss
   HUD shows ~1 s later than main's (bossintro.mjs, load ~6). Sound sliders default 90/80 (main 100/100), R-165.125.
3. Same on main (not new): sideways Journal page text runs to the page foot; upright pause card's last row below the fold (both scroll boxes).
## Not played
Old 0.9.5 save in the browser and Android Back (item 4, the auditor's); a boss fought to its end; any stage but 1-1 past its first ~10 s;
main upright finished save; Easy setting in the browser.
