# Player lines from the story keeper, 2026-11-12 (final words; builders copy them exactly)

## Save and Load dialog (SaveLoadDialog.tsx; for AF's audit fix #3; 11:35 AM ET)
| Where | Now | Final words |
|---|---|---|
| :157 | Saves every stage result, the stories you have seen and your sound settings into one small file. You can load it later, or on another device. | Saves your stages, the stories you have seen and the things you have found in one small file. Load it later, or on another device. |
| :122 | Could not write the save into this browser. | Could not save it on this device. |
| the load note | Loading **replaces** the progress on this device with what is in the file. | Loading **replaces** the progress on this device with this save. |

The :157 line assumes the notes, books and keepsakes (`sloth_finds`, saveFile.ts:38) still travel in the file. If they don't, use:
"Saves your stages, the stories you have seen and the secret in one small file. Load it later, or on another device."
It makes no promise about sound, volume or mute.
