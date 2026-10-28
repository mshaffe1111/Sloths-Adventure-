import React from 'react';

/**
 * A soft close for any pop-up, without changing how it is opened or shut (2026-10-28: "satisfying open/close"). When the element in
 * `ref` leaves the page, a copy of it is left in its place for a moment and fades away (the copy has the class `fx-ghost`; its
 * first child, the card, also sinks a little). The copy is only a picture: it takes no taps and is hidden from screen readers.
 * Nothing happens with reduced motion asked for.
 */
export function useExitGhost(ref: React.RefObject<HTMLElement | null>, ms = 200) {
  React.useLayoutEffect(() => {
    const node = ref.current;
    return () => {
      if (!node || !node.isConnected) return;
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
      const host = document.getElementById('root') ?? document.body;
      try {
        const ghost = node.cloneNode(true) as HTMLElement;
        // (a canvas copies blank: paint each one's picture across)
        const from = node.querySelectorAll('canvas');
        const to = ghost.querySelectorAll('canvas');
        from.forEach((c, i) => {
          const d = to[i] as HTMLCanvasElement | undefined;
          if (!d || !c.width || !c.height) return;
          d.width = c.width;
          d.height = c.height;
          d.getContext('2d')?.drawImage(c, 0, 0);
        });
        // a card scrolled down keeps its place
        const scrolled = [node, ...Array.from(node.querySelectorAll<HTMLElement>('*'))].filter((e) => e.scrollTop > 0);
        ghost.classList.add('fx-ghost');
        ghost.setAttribute('aria-hidden', 'true');
        ghost.removeAttribute('role');
        ghost.style.pointerEvents = 'none';
        ghost.style.animationDuration = `${ms}ms`;
        host.appendChild(ghost);
        for (const e of scrolled) {
          const path: number[] = [];
          let cur: Element | null = e;
          while (cur && cur !== node) {
            path.unshift(Array.prototype.indexOf.call(cur.parentElement?.children ?? [], cur));
            cur = cur.parentElement;
          }
          let g: Element | null = ghost;
          for (const k of path) g = g?.children[k] ?? null;
          if (g) (g as HTMLElement).scrollTop = e.scrollTop;
        }
        window.setTimeout(() => ghost.remove(), ms + 40);
      } catch {
        /* a pop-up that cannot be copied just goes */
      }
    };
  }, [ref, ms]);
}
