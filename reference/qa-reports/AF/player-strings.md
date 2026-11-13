# AF: player strings changed (old → new), Save / Load dialog (src/components/SaveLoadDialog.tsx)

Words: the story keeper's, verbatim (reference/packets/2026-11-12/STORY-LINES.md on origin/ccr-0d59a91c-oy3imz @fdce7348, 11:35 AM ET), sent by the lead 11:37 AM ET. Nothing else in the dialog changed ("Loaded. Your adventure is back." kept).

| Where | Old | New |
|---|---|---|
| :157 (the file line) | Saves every stage result, the stories you have seen and your sound settings into one small file. You can load it later, or on another device. | Saves your stages, the stories you have seen and the things you have found in one small file. Load it later, or on another device. |
| :122 (a save that could not be written) | Could not write the save into this browser. | Could not save it on this device. |
| :174 (the load note; shows for a file and a pasted code) | Loading **replaces** the progress on this device with what is in the file. | Loading **replaces** the progress on this device with this save. |

The finds version of :157 was used because the finds travel: `src/components/saveLoadWords.test.ts` saves a played phone with
buildSave, reads it back with parseSave and loads it with applySave on an empty one: the stage result, the story seen and `sloth_finds`
arrive; music, effects volume and mute do not (and are not save keys). The same test fails if the dialog promises sound, volume or mute.
