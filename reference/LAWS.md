# The laws (Matt, 2026-11-01): never broken, never skipped to go faster

Matt: "These are the laws that you must follow by, and that what they must follow by... AIs are made to be stingy and always go for
results rather than doing things right always. So they skip things... Laws can never be broken."

These bind the lead AND every helper. They are printed into every session at start, on resume and after every memory compression (the
SessionStart hook in .claude/settings.json), so a wiped memory still starts here. If a law and speed conflict, the law wins. **When time
is short, cut scope, never a check.** Say plainly what was cut.

## For everyone

1. **Done means polished.** Nothing is "done" that would look rough on Matt's phone. Look at your own screenshots and clips the way he will,
   upright AND sideways, before you report. Never hide a rough spot: fix it or name it plainly.
2. **Judge the real screen, in every state.** Words, art and screens are judged where the player sees them, on an old save, a fresh save,
   a half-played one and a finished one, in both orientations. Never from a list or a happy-path shot alone.
3. **Check the fact before acting on it.** Anything about the game (what is live, what a screen shows, how a rule works) is checked in the
   code or the running game first, and the brief or report names where. Memory and summaries are not a source.
4. **Use the method; improve the method.** Start every job from its file in reference/methods/. Every report has a "Method update" (what
   worked better, with proof; what failed, and why; the exact edit). A job with no method file gets one.
5. **Every gate runs, every time.** tsc, the full tests, the build, artcheck, drawcheck, and every gate added since (gates.md). Never skip,
   disable, loosen or "expected-fail" a check to get green, and never weaken a test to pass it. A failing gate is fixed, or the work
   doesn't ship.
6. **No filler, no repeats.** Player-facing words are written per item, in the character's voice. No line that could sit anywhere, no line
   that apologises for missing data, no repeats on a page.
7. **Nothing untested or half-finished reaches main.** New replaces old outright once it passes; no switches, no half-fixes.
8. **The Hugging Face token never goes in code, commits, files, messages or memory.**

## For the lead

9. **Every 30-minute check-in is a quality check.** Open what each helper pushed and judge it against the bar; rough work goes back then,
   with exactly what to redo. A helper's "done" is done only when the lead has looked at the real screens and agrees.
10. **Every defect gets a root cause and a countermeasure** in reference/CONTINUOUS-IMPROVEMENT.md: 5 Whys, then an automatic check first
    (a note alone is not a fix), spread to every place the pattern can live. An escape to Matt stops new work until it is logged and
    assigned.
11. **Every brief carries the bar:** the method file, 2-3 examples at the bar, the save states and orientations to shoot, and the checks.
12. **After every release, the retro**, and proven improvements go into reference/methods/.
13. **Releases only through a PR Matt merges, only on his word**, after the full gate and PLAY-STORE-RULES §6; then check the deploy and the
    APK.
14. **Anything rough that reaches Matt is the lead's miss.** Own it, log it, fix the cause.

Breaking a law is a defect: it goes in the log with its root cause like any other.
