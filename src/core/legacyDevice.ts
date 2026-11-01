/**
 * Old-device detection & isolated compatibility layer (e.g. iPad on iOS 9.3.5 / Safari 9).
 *
 * Modern devices (phones, laptops, Chromecast/TV) do NOT load legacy.css or run
 * legacy shims, so they have zero visual or performance compromise.
 */

export function isLegacyDevice(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.location.search.indexOf('legacy=1') !== -1) return true;
    const ua = navigator.userAgent || '';
    // iOS 9, 10, 11, 12 or old Android WebView
    if (/OS [5-9]_|OS 1[0-2]_/.test(ua)) return true;
    if (typeof window.PointerEvent === 'undefined') return true;
    if (typeof window.CSS === 'undefined' || typeof window.CSS.supports !== 'function') return true;
    if (!window.CSS.supports('display', 'grid') || !window.CSS.supports('inset', '0px')) return true;
  } catch {
    return true;
  }
  return false;
}

export function initLegacySupportIfNeeded() {
  if (typeof window === 'undefined') return;

  // Safe polyfill for structuredClone (missing on iOS < 15.4)
  if (typeof window.structuredClone !== 'function') {
    (window as unknown as { structuredClone: <T>(v: T) => T }).structuredClone = <T>(val: T): T =>
      val === undefined ? val : JSON.parse(JSON.stringify(val));
  }

  // Safe polyfill for webkitAudioContext (iOS 9.3.5)
  const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  if (!w.AudioContext && w.webkitAudioContext) {
    w.AudioContext = w.webkitAudioContext;
  }

  if (!isLegacyDevice()) return;

  document.documentElement.classList.add('legacy-device');

  // Dynamically load legacy.css ONLY on older devices
  if (!document.getElementById('rlw-legacy-css')) {
    const link = document.createElement('link');
    link.id = 'rlw-legacy-css';
    link.rel = 'stylesheet';
    link.href = './legacy.css';
    document.head.appendChild(link);
  }
}
