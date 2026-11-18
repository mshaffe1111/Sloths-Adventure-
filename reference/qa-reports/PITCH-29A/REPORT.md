# PITCH-29A REPORT (Pitcher A, fixed lens; packet reference/packets/2026-11-18/PITCH-29A.md; branch t-pitch-29a from origin/main 6e7b85f8)
EXACT NEXT STEP: the lead compares reference/design/pitches/PITCH-29A.md with PITCH-29B per level (pitch.md step 2b/5).
## Done-items
1. One page per level (2-9, 3-1, 3-2): one idea + why fun on a phone, 3 tributes each (what was LOVED, cited; how taught; ours; not copied), 10-12 beats with
   teach and "he feels", where it kept/changed GAME-MAP (:190, :213, :214), Normal + Easy targets pasted (DIFFICULTY.md:61-63: 20/12, 19.5/11.7, 23/13.8),
   engine list (wired / foundation / NEW with size and file, 2 NEW max each) verified on main with file:line, how it differs from 2-1..2-8. PASS.
2. Node strings pass checkCode: `npx tsx reference/specs/sims/nodes29a.ts` -> reference/specs/sims/out/nodes29a.txt, all three "no errors". PASS.
3. Shelf: lead tributes from Blocks 1-2 (Kung-Fu Master, SMB3; Metroid, DKC; Strider, Castlevania III) + one from anywhere each (Crossy Road, Pitfall II,
   Abe's Oddysee); a pre-1990 classic and a lesser-known title per level; at most one famous (SMB3 / DKC / none). PASS.
4. Sources: every tribute has a non-Wikipedia page opened (gamedeveloper/gamesradar) EXCEPT Castlevania III (3-2, Grant's ceiling climb: no page opened; [S]). FAIL for that one, named.
5. Gates (packet: roadmapcheck + knowncheck): knowncheck PASS; roadmapcheck: see Unresolved.
## Polish check
A doc, no screens. Re-read for: every quote from a page opened today (URL beside it), every unopened claim [S], every engine claim file:line on main, cites re-grepped last (D52).
## Pushback
Yes (pitch "Pushback" 1-4): 3-2's hang can be 1-3's shimmy rope on roof roots (2 NEW) rather than R-160.1's 10-16 h move; prowlers see 170 px up today (enemyBrain.ts:229),
so "hang above the prowlers" needs NEW 1 whatever is picked; 3-1/3-2 wait on ENG-W3a (no World 3 gen2 kit) and World 3 standing art; 2-9's goal (14 guards vs reach the shrine).
## Suggestions
- Engine packet (S-M): "prowlers never look up" in enemyBrain.ts roam senses: a hanging hero above unseen unless lit; planted test: an ocelot under a rope at 146 px does not notice
  him (RED on main), does when a glow is in radius. Useful to any stealth stage whatever 3-2's pick.
- Flight (designer, before DESIGN-29): the vault over a royal guard's 78 px spear from a `back` raft at 70-90 px/s, both settings, on realPlay.
## Unresolved
- No timing flown (pitch stage): the vault (2-9), the puff-lit drop window (3-1), the creep speed vs a prowler's pace (3-2). Owed by rule 24.
- Whether GLOW_REACH (zones.ts:81, x only) wakes lights below in a shaft; whether the royal guard hears the bell (predatorAI.ts:362 is the turtle's listen).
## Method update
pitch.md step 2: replace "Research sites" host list with what answered 11-18: Wikipedia, gamedeveloper.com, gamesradar.com, pcgamer.com (HG101 down); find pages with
WebSearch allowed_domains, open with curl. Step 3: add "read the cast's senses (enemyBrain/watcher) before pitching a hide beat".
## Lessons applied
D30/D42 (times from date), D34/D52 (file:line, cites re-grepped last), D53 (fast gates before a docs push), D58 (loved, cited), D66 (grepped what exists before sizing NEW), D85 (did not read 29B).
## Turnover note
reference/handoffs/designer.md §4 (PITCH-29A open item) and §5 (stealth-senses trap, research hosts) updated in place, this commit.
