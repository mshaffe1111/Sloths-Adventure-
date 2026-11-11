const mods: Record<string,string[]> = {
 dressAtlasData:['DRESS_FRAMES'], dressNewData:['DRESS_NEW_FRAMES'], kitAtlasData:['KIT_FRAMES'], groundAtlasData:['GROUND_FRAMES'],
 w5PropsData:['W5_FRAMES'], w6PropsData:['W6_PUZZLE_FRAMES','W6_WATER_FRAMES'], w8DecorData:['W8B','W8C_A','W8C_B','W8VAR','W8ROOST_B','W8GLOW'],
 w8FungusData:['W8_FUNGUS_FRAMES'], w810FaceData:['FACE810_FRAMES','FACE810_STONES'], w8LanternAtlas:['LANTERN_FRAMES','POKEY_JAR_FRAMES'],
 w7SlideAtlas:['FLUME_SHEETS'], boss910Data:['BOSS910'], boss1010Data:['BOSS1010'], bossFxData:['BOSS_FX'], stageArtData:['GATE_FRAMES','PIT_WATER','STAGE_ART_FRAMES'],
 w6StiltArt:['STILT_FRAMES','STILT_PIECES','STILT_PROP_FRAMES','SET_FRAMES','SET_FEET','LEDGE_LOOKS'],
};
const out: any = {};
for (const [m, names] of Object.entries(mods)) {
  try { const mod = await import(`/home/user/Sloths-Adventure-/src/game/${m}.ts`); for (const n of names) out[`${m}.${n}`] = mod[n]; }
  catch (e) { out[m] = 'ERR ' + (e as Error).message.slice(0,200); }
}
console.log(JSON.stringify(out));
