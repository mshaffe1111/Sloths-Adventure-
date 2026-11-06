/**
 * Inside the camera's reach (the lead, 11-05, on gen2 1-1 Roll B: its end log and exit totem stood at y -237 and the camera, clamped at
 * the stage's top, showed only backdrop with Pokey grounded out of view). engine.ts clamps a normal stage's view to y 0 .. levelHeight - vh
 * (an arena, a puzzle room or a reveal may show over the top: not judged here), and a grounded Pokey keeps his head under the HUD band
 * (cameraFollow.ts underHud). So, upright (the taller band) and sideways:
 *   - a platform he can stand on: its top at least HERO_HEAD + the band down from y 0, so he stands on it in view under the HUD;
 *   - a pickup, the exit totem's foot, a dressing piece's foot: at least the band down from y 0;
 *   - nothing below the level's foot (levelHeight), where the camera never goes.
 */
import { HERO_HEAD, HUD_BAND } from './cameraFollow.ts';

export interface ReachBreach { what: string; x: number; y: number; view: 'upright' | 'sideways'; why: string }

/** what of a stage the camera cannot show (empty: all of it can be shown) */
export function cameraReachBreaches(st: any): ReachBreach[] {
  const out: ReachBreach[] = [];
  const foot: number = st.config?.levelHeight ?? Infinity;
  const items: Array<{ what: string; x: number; y: number; stand: boolean }> = [
    ...(st.platforms ?? []).filter((p: any) => !p.broken).map((p: any) => ({ what: `platform ${p.id} (${p.style ?? p.type})`, x: p.x, y: p.y, stand: true })),
    ...(st.collectibles ?? []).map((c: any) => ({ what: `pickup ${c.type}`, x: c.x, y: c.y, stand: false })),
    ...(st.exitTotemX !== undefined ? [{ what: 'exit totem', x: st.exitTotemX, y: st.exitTotemY, stand: false }] : []),
    ...[...(st.proto?.dress ?? []), ...(st.proto?.mixDress ?? [])].map((d: any) => ({ what: `dressing ${d.n}`, x: d.x, y: d.b, stand: false })),
  ];
  for (const [view, band] of [['upright', HUD_BAND.port], ['sideways', HUD_BAND.land]] as const) {
    for (const it of items) {
      const top = it.stand ? HERO_HEAD + band : band;
      if (it.y < top) out.push({ what: it.what, x: Math.round(it.x), y: Math.round(it.y), view, why: `y ${Math.round(it.y)} over the camera's reach (${top}: the view's top at y 0, under the ${band} px HUD${it.stand ? `, his ${HERO_HEAD} px head over his feet` : ''})` });
      else if (it.y > foot) out.push({ what: it.what, x: Math.round(it.x), y: Math.round(it.y), view, why: `y ${Math.round(it.y)} under the level's foot (${foot})` });
    }
  }
  return out;
}
