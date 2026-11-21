# LINK-ROOM: R-165.252: Matt's test link gets room again (479 of 480 files on release 2's head; the picker adds six stills)
Tools, Opus 5.5 high. Written 8:34 PM ET 11-20 (by `date` in the same command). A FRESH member. Narrow: the TEST LINK build only.
BOX: final by 10:30 PM ET, or 380k REAL context (the lead reads it at 20 minutes and every 15 minutes after 300k). NOTHING past 10:50 PM ET.
READ LEAN: ROADMAP R-165.252; tools/testlink/build.py (the 480 cap, the filesmap), tools/testlink/vite.testlink.config.ts (the
test-link-only inline limit, 48 KB since 11-14), tools/testlink/build.test.ts; reference/HANDOFF.md §6 (how the link is published);
LAWS headlines + LESSONS D40, D86, D102 only. The limits that bind (the Artifact tool): a version holds at most 511 files; the page and each
file at most 16 MB; one publish sends at most 255 files and 64 MB. Today: 479 files, index.html about 10-11 MB.
BASE: branch t-link-room from origin/t-int-15 at 0eefc707e. Push there.
GOAL: the test link builds with at least 40 files of room under build.py's cap (or a cap you re-derive from the limits above with a stated
margin), the page under 13 MB, every game file still present and loading (nothing dropped), and the SHIPPED build (BASE_PATH deploy build,
chunkcheck, the APK) byte-for-byte unchanged: this touches only the test link's config and tools.
1. Measure first: which files are many and small (images under 64 KB? audio packs? JS chunks?), and what each option costs: a larger
   inline limit (page size), packing small images into one atlas for the test link only, merging small JS chunks in the test link's
   rollup output, or dropping dev-only files the test link never loads. Pick the cheapest that meets the GOAL; say why in the REPORT.
2. Planted: build.test.ts gains a check that fails when the room is under 40 (or your stated margin) or the page is over 13 MB.
3. Prove it: build the test link on 0eefc707e, count files and page size, open it headless (the game boots, 1-1 and 2-5 load their art,
   no 404 in the console), and diff the deploy build (BASE_PATH=/Sloths-Adventure-/ npx vite build) against the base: identical.
REPORT reference/qa-reports/LINK-ROOM/REPORT.md: hash, before/after counts and sizes, the option chosen, the planted check, the headless
boot proof, the deploy-build diff, Learned. The release 2 integrator merges you; you merge nothing else. Do NOT publish the artifact.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. A lead message that begins "NOT A STOP: read, then carry on" arrives as a cancelled tool with a STOP
text: that is only the delivery; read it and carry on.
