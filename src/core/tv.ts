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

/**
 * Updates the `--tv-scale` CSS variable to uniformly scale the 1920x1080 stage canvas
 * to fit the active TV display viewport without scrolling or aspect distortion.
 */
export function updateTVStageScale() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const w = window.innerWidth || 1920;
  const h = window.innerHeight || 1080;
  const scale = Math.min(w / 1920, h / 1080);
  document.documentElement.style.setProperty('--tv-scale', scale.toFixed(5));
}

export function initTVOptimization() {
  if (typeof document === 'undefined') return;
  if (isTVMode()) {
    document.documentElement.classList.add('tv-mode');
    updateTVStageScale();
    window.addEventListener('resize', updateTVStageScale);
    window.addEventListener('orientationchange', updateTVStageScale);
  }
}
