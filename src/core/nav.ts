import { useEffect } from 'react';

/**
 * D-pad / arrow-key navigation: every screen is reachable with arrows + Enter
 * (TV remotes). Moves focus to the nearest focusable element in the pressed
 * direction. A screen that needs the arrows itself (the maze) sets
 * document.body.dataset.navLock = '1'.
 */
const SELECTOR = 'button:not([disabled]), [tabindex="0"], input:not([disabled]), select:not([disabled]), a[href]';

function focusables(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(SELECTOR)].filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const st = getComputedStyle(el);
    return st.visibility !== 'hidden' && st.pointerEvents !== 'none';
  });
}

export function focusFirst() {
  const auto = document.querySelector<HTMLElement>('[data-autofocus]:not([disabled])');
  (auto ?? focusables()[0])?.focus();
}

function move(dir: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') {
  const list = focusables();
  const cur = document.activeElement as HTMLElement | null;
  if (!cur || !list.includes(cur)) { list[0]?.focus(); return; }
  const c = cur.getBoundingClientRect();
  const cx = c.left + c.width / 2;
  const cy = c.top + c.height / 2;
  let best: HTMLElement | undefined;
  let bestScore = Infinity;
  for (const el of list) {
    if (el === cur) continue;
    const r = el.getBoundingClientRect();
    const dx = r.left + r.width / 2 - cx;
    const dy = r.top + r.height / 2 - cy;
    const [main, cross] = dir === 'ArrowLeft' || dir === 'ArrowRight' ? [dx, dy] : [dy, dx];
    const sign = dir === 'ArrowLeft' || dir === 'ArrowUp' ? -1 : 1;
    if (main * sign <= 4) continue;
    const score = Math.abs(main) + 2.2 * Math.abs(cross);
    if (score < bestScore) { bestScore = score; best = el; }
  }
  if (best) { best.focus(); best.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
}

export function useSpatialNav(onBack: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const t = e.target as HTMLElement;
      const typing = t?.tagName === 'INPUT' && (t as HTMLInputElement).type !== 'range' && (t as HTMLInputElement).type !== 'checkbox';
      if (e.key === 'Escape' || e.key === 'BrowserBack' || (e.key === 'Backspace' && !typing)) {
        e.preventDefault(); onBack(); return;
      }
      if (document.body.dataset.navLock) return;
      if (typing && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return;
      if (e.key.startsWith('Arrow')) { e.preventDefault(); move(e.key as 'ArrowUp'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);
}
