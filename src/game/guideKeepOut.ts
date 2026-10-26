/**
 * guideKeepOut — parts of the stage Dot's bubble must leave clear (World 5: Meeca's carvings, the words Dot is talking about), marked on
 * the page the way the new HUD marks its own pieces: an empty, hidden box carrying `data-hud-keepout`, which Dot's guide already reads
 * (DotGuide.tsx safeNow, every 0.4 s) and keeps her bubble and her perch off. So the guide needs to know nothing about the stage.
 *
 * The engine calls setGuideKeepOuts each frame with the boxes in page pixels (an empty list when there are none); the boxes are reused,
 * and a style is only written when it changes, so it costs nothing while the stage stands still.
 */
export interface KeepOutBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const els: HTMLElement[] = [];
const last: string[] = [];

/** mark the first `n` boxes (page css px) as off limits for Dot's bubble; every box from before past those is let go */
export function setGuideKeepOuts(boxes: readonly KeepOutBox[], n = boxes.length): void {
  if (typeof document === 'undefined' || !document.body) return;
  for (let i = 0; i < n; i++) {
    let el = els[i];
    if (!el) {
      el = document.createElement('div');
      el.setAttribute('data-hud-keepout', 'stage');
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;visibility:hidden;';
      document.body.appendChild(el);
      els.push(el);
      last.push('');
    }
    const b = boxes[i];
    const key = `${Math.round(b.x0)},${Math.round(b.y0)},${Math.round(b.x1 - b.x0)},${Math.round(b.y1 - b.y0)}`;
    if (key === last[i]) continue;
    last[i] = key;
    el.style.display = 'block';
    el.style.transform = `translate(${Math.round(b.x0)}px, ${Math.round(b.y0)}px)`;
    el.style.width = `${Math.max(1, Math.round(b.x1 - b.x0))}px`;
    el.style.height = `${Math.max(1, Math.round(b.y1 - b.y0))}px`;
  }
  for (let i = n; i < els.length; i++) {
    if (last[i] === 'off') continue;
    last[i] = 'off';
    els[i].style.display = 'none';
  }
}

/** let every box go (the stage has ended) */
export function clearGuideKeepOuts(): void {
  setGuideKeepOuts([]);
}
