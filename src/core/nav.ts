import { useEffect } from 'react';

/**
 * D-pad / arrow-key spatial navigation & back-stack management for TV remotes and keyboard.
 *
 * Guarantees:
 * 1. Modals & Overlays trap focus: spatial navigation stays strictly inside the active modal.
 * 2. Back Button Stack: hardware Back key / Escape closes the topmost modal/sheet first,
 *    navigates from mini-game to island, island to hub, and hub to profile picker.
 * 3. 250ms debounce prevents remote IR/Bluetooth bounce double-clicks.
 * 4. Exposes `window.__rlwBack()` returning boolean `true` when handled, preventing Android
 *    WebView from accidentally exiting the application.
 */
const SELECTOR = 'button:not([disabled]), [tabindex="0"], input:not([disabled]), select:not([disabled]), a[href]';

export type BackHandler = () => boolean | void;
const modalBackStack: BackHandler[] = [];
let rootBackHandler: (() => boolean | void) | undefined;
let lastBackTime = 0;

/** Register a modal or subscreen back handler (LIFO stack) */
export function registerBackHandler(handler: BackHandler): () => void {
  modalBackStack.push(handler);
  return () => {
    const idx = modalBackStack.lastIndexOf(handler);
    if (idx !== -1) modalBackStack.splice(idx, 1);
  };
}

/** Hook to register a back handler during a component or modal's lifecycle */
export function useBackHandler(handler: BackHandler, active: boolean = true) {
  useEffect(() => {
    if (!active) return;
    return registerBackHandler(handler);
  }, [handler, active]);
}

/**
 * Executes the topmost back action.
 * Returns true if an action was handled; returns false if at the root screen.
 */
export function handleBack(): boolean {
  const now = Date.now();
  if (now - lastBackTime < 250) {
    return true; // Debounce rapid remote bounces
  }
  lastBackTime = now;

  // 1. First, pop any open modal / overlay handler:
  while (modalBackStack.length > 0) {
    const handler = modalBackStack.pop()!;
    const res = handler();
    if (res !== false) {
      setTimeout(() => focusFirst(), 50);
      return true;
    }
  }

  // 2. If no modal is open, invoke the root screen navigator:
  if (rootBackHandler) {
    const res = rootBackHandler();
    if (res !== false) {
      setTimeout(() => focusFirst(), 50);
      return true;
    }
  }

  return false;
}

/**
 * Returns focusable elements. If an overlay or modal is active, focus is
 * strictly scoped to the topmost overlay so remote D-pad presses cannot leak
 * to buttons behind the modal.
 */
export function focusables(): HTMLElement[] {
  const overlays = document.querySelectorAll<HTMLElement>('.overlay');
  const root = overlays.length > 0 ? overlays[overlays.length - 1] : document.body;

  return [...root.querySelectorAll<HTMLElement>(SELECTOR)].filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const st = getComputedStyle(el);
    return st.visibility !== 'hidden' && st.pointerEvents !== 'none' && st.display !== 'none';
  });
}

/** Sets focus on the first focusable element or one with [data-autofocus] */
export function focusFirst(container?: HTMLElement | null) {
  const root = container ?? (document.querySelector<HTMLElement>('.overlay:last-of-type') ?? document.body);
  const auto = root.querySelector<HTMLElement>('[data-autofocus]:not([disabled])');
  const target = auto ?? focusables()[0];
  if (target) {
    target.focus();
    try {
      target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    } catch {
      /* ignore */
    }
  }
}

function move(dir: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') {
  const list = focusables();
  if (!list.length) return;

  const cur = document.activeElement as HTMLElement | null;
  if (!cur || !list.includes(cur)) {
    list[0]?.focus();
    return;
  }

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
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }

  if (best) {
    best.focus();
    try {
      best.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    } catch {
      /* ignore */
    }
  }
}

export function useSpatialNav(defaultBack?: () => boolean | void) {
  useEffect(() => {
    rootBackHandler = defaultBack;

    // Expose global bridge for Android TV / Chromecast native hardware Back button
    (window as unknown as { __rlwBack?: () => boolean }).__rlwBack = () => {
      return handleBack();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const t = e.target as HTMLElement;
      const typing =
        t?.tagName === 'INPUT' &&
        (t as HTMLInputElement).type !== 'range' &&
        (t as HTMLInputElement).type !== 'checkbox';

      if (
        e.key === 'Escape' ||
        e.key === 'BrowserBack' ||
        e.key === 'GoBack' ||
        e.keyCode === 4 || // Android KEYCODE_BACK
        (e.key === 'Backspace' && !typing)
      ) {
        e.preventDefault();
        e.stopPropagation();
        handleBack();
        return;
      }

      if (document.body.dataset.navLock) return;
      if (typing && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return;

      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        move(e.key as 'ArrowUp');
        return;
      }

      // Android TV / Chromecast remote DPAD_CENTER / Select
      if (
        (e.key === 'Select' || e.key === 'Accept' || e.keyCode === 23) &&
        document.activeElement instanceof HTMLElement
      ) {
        e.preventDefault();
        document.activeElement.click();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (rootBackHandler === defaultBack) {
        rootBackHandler = undefined;
      }
    };
  }, [defaultBack]);
}
