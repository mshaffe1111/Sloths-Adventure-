# KEEPER-PICK: the story keeper approves the testers' World 1 page words for release 2 (R-165.343), and the What's New lines
Story keeper (content), Opus 5.5 high. Written 9:33 AM ET 11-21 (by `date` in the same command). A FRESH member. BOX: final by 11:00 AM ET; nothing
runs past it without telling the lead. Release 2 waits on you.
READ LEAN (D102): reference/story/STORY-KEEPER.md (§2, §3, §7), LAWS headlines, LESSONS D30, D102, D103; the PICK-W1 REPORT's keeper list
(`git show origin/t-pick-w1:reference/qa-reports/PICK-W1/REPORT.md`, the DRAFT section: chips per stage with counts, move cards, alts);
src/components/ctestStretches.ts and the move-card data by grep; playerText.test.ts BANNED; whatsNew.test.ts caps.
BASE: branch t-keeper-pick from origin/t-pick-w1 at ef5622725. Push there. You may edit the testers' page DATA (chips, move cards, alts) on
this branch; no other code.
1. CHIPS: each World 1 stage keeps its 6 clearest "What felt hardest?" chips (plus "Nothing"): plain player words a child reads, each naming a
   real stretch of THAT stage (check against its w1Arc file / design by grep), no two meaning the same, no workshop word. Today: 1-2: 7, 1-4: 12,
   1-5: 7, 1-6: 9, 1-7: 8, 1-8: 8, 1-9: 9. 1-1 and 1-3 keep theirs unless one is wrong. A test pins at most 6 + Nothing per stage.
2. MOVE CARDS + ALTS (1-1, 1-2, 1-6..1-9 DRAFT): approve or rewrite in Dot's voice; each card TRUE to the stage's moves.
3. WHAT'S NEW for release 2 (0.10.1): approve or rewrite these (caps: 3-8 lines, each at most 90 characters, no workshop word, TRUE):
   title "Count to four"; (a) "River Snappers is rebuilt: every snap stone bites on four, so I hop off before four." (b) "The snappers keep
   the same count. Right after one snaps, a kick sends it paddling home." (c) "No snapper is ever hurt: a kicked one just paddles off downstream,
   huffy." (d) "The river's rocks come in three painted shapes now, and no two in a row look alike." (e) "The ground under the forest's stones and
   stumps is tidy now, with no stray grass." (f, new) one line for Pokey standing still without flickering; (g, new, optional) one for World 2's
   riverbanks without the bright code-drawn stems. Write the approved set into reference/story/whats-new-0.10.1.md.
4. Checks: tsc; the ctest tests (ctestSurvey, ctestPicker, controlTest, ctestCoach, ctestCourseGone), playerText.test, fonts/textSize tests;
   clipcheck (the picker screens walk) and kbdcheck. Verdict word PASS/FAIL each.
REPORT reference/qa-reports/KEEPER-PICK/REPORT.md: final hash, the chips per stage (before -> after), cards, the What's New set, gates, lessons.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Rulings arrive with priority 'next' (D103).
