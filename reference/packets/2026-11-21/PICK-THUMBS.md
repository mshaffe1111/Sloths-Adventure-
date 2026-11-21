# PICK-THUMBS: the testers' World 1 page, Matt's layout: what the game is about, how to start, nine level pictures to pick from, the moves
UI (+ draft words), Opus 5.5 high. Written 10:29 AM ET 11-21 (by `date` in the same command). A FRESH member. Release 2 waits on you.
MATT 11-21 10:28 AM ET: "my suggestion with the page is to have maybe a picture, smaller pictures of the ... 9 different levels, letting
somebody pick which level they want to play. And then also have some of the controls like we have. And then a brief explanation of how to
start it." + "maybe a brief explanation of what the game is about and how to start it." (R-165.368)
BOX: MOCK-UP stills (the real page) within 30 minutes of your start (show first: the lead sends them to Matt and you keep building); final
by 12:30 PM ET, or 330k REAL context. Run ReadNotifications at EVERY step boundary and every push (D57/D87, D103, D105).
READ LEAN (D102): src/components/ControlTestGate.tsx by grep and line ranges (the page :295-330, the picker :215-290, ctestStill :195-205,
the move cards :99-190), its css, ctestPicker.test.ts, ctestSurvey.test.ts; reference/story/STORY-KEEPER.md §2 (the game's story, for the
'about' line); PLAY-STORE-RULES.md (any screen); LAWS headlines; LESSONS D79, D86, D102, D105.
BASE: branch t-pick-thumbs from origin/t-keeper-pick @ 599c4d5b3. Push there.
THE PAGE, top to bottom (upright AND sideways; tap targets >= 44 px, clear of the insets; nothing cut off):
1. ABOUT (1-2 short sentences, a child reads them): what the game is (Pokey the sloth, the rainforest, his journey) in the story keeper's
   voice, built from approved words (STORY-KEEPER §2; the game's own lines); DRAFT, marked for the keeper.
2. HOW TO START (3 short numbered steps): tap Refresh; pick a level; type your name, choose Easy or Normal, tap Start (match the real
   order on the page; the Refresh box stays where testers already find it). DRAFT for the keeper.
3. PICK A LEVEL: the nine stages as small PICTURE tiles: each tile is that stage's own still (src/assets/ui/ctest-<id>.webp, already one per
   stage: NO new image files; size them with CSS) with its number and name under or over it, the played tick kept, the picked tile clearly
   highlighted; upright 3x3, sideways the layout that reads best (3x3 or one row of 5 + 4), each picture readable at phone size.
   The big single still at the top may go (the tiles replace it) if the page reads better without it: your call, shown in the mock-up.
4. THE MOVES for the picked level: the move cards as today.
5. GET STARTED: name, setting, Start: as today.
Keep: the recorder's stage field, the survey naming the stage, the played tick, the Refresh behavior, every ctest test green.
GATES on your final head: tsc; the ctest tests + playerText + fonts + textSize; the suite in shards (line in full); vite build + chunkcheck;
artcheck; knowncheck; clipcheck (the picker walk, both ways) and kbdcheck; the test-link build count (no new files expected). Verdict each.
POLISH (law 1): FULL-PAGE stills upright + sideways on a fresh and an old save, plus 2x crops of the tile grid; look at them the way Matt's
testers will on a phone.
REPORT reference/qa-reports/PICK-THUMBS/REPORT.md: hash, mock-up paths, the DRAFT words for the keeper, gates, stills, lessons applied.
REL-0101 merges you into release-0.10.1.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Rulings arrive with priority 'next'.
