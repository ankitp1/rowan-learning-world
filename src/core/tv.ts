/**
 * Android TV / Chromecast runtime detection & hardware optimizations.
 */
export function isTVMode(): boolean {
  if (typeof window === 'undefined') return false;
  const search = window.location.search;
  const ua = navigator.userAgent;
  return (
    search.includes('tv=1') ||
    'AndroidTTS' in window ||
    'AndroidSTT' in window ||
    /CrKey|Android.*TV|GoogleTV|Large Screen/i.test(ua)
  );
}

export function initTVOptimization() {
  if (typeof document === 'undefined') return;
  if (isTVMode()) {
    document.documentElement.classList.add('tv-mode');
  }
}
