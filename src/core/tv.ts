/**
 * Comprehensive Screen, Display & Device Detection Engine.
 * Accurately identifies Android TV, Google TV, Fire TV, Smart TVs, Tablets, Desktops, and Mobile.
 * Dynamically scales the 1920x1080 stage canvas and manages viewport adaptation.
 */

export type DeviceType = 'tv' | 'mobile' | 'tablet' | 'desktop';

// Comprehensive regex for Android TV, Fire TV, and Smart TVs across all manufacturers
const TV_UA_REGEX =
  /Android.*TV|GoogleTV|Large Screen|CrKey|RowanAndroidTV|AFTT|AFTM|AFTS|AFTB|AFTKA|AFTMM|AFTSS|FireTV|Silk.*TV|SmartTV|SMART-TV|Tizen|Web0S|webOS|NetCast|BRAVIA|MiTV|Hisense|HbbTV|AppleTV|Roku/i;

export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  const search = window.location.search;
  const ua = navigator.userAgent;

  // 1. Explicit query flags or injected native TV bridges
  if (
    search.includes('tv=1') ||
    search.includes('device=tv') ||
    'AndroidTTS' in window ||
    'AndroidSTT' in window ||
    TV_UA_REGEX.test(ua)
  ) {
    return 'tv';
  }

  // 2. Physical display heuristics
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ratio = w / (h || 1);
  const isLandscape = ratio >= 1.3;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 16:9 large landscape display without touch pointers is a TV or TV-connected screen
  if (isLandscape && !hasTouch && ratio >= 1.6 && ratio <= 1.9 && (w >= 1200 || h >= 700)) {
    return 'tv';
  }

  // Mobile vs Tablet vs Desktop
  if (w < 600 || (!isLandscape && w < 768)) {
    return 'mobile';
  }
  if (w <= 1024 && hasTouch) {
    return 'tablet';
  }
  return 'desktop';
}

export function isTVMode(): boolean {
  return getDeviceType() === 'tv';
}

/**
 * Updates the `--tv-scale` CSS variable so the 1920x1080 stage canvas fits
 * the active TV or display viewport without scrolling, letterboxing jitter, or aspect distortion.
 */
export function updateTVStageScale() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const w = window.innerWidth || 1920;
  const h = window.innerHeight || 1080;
  const scale = Math.min(w / 1920, h / 1080);
  document.documentElement.style.setProperty('--tv-scale', scale.toFixed(5));
  document.documentElement.style.setProperty('--screen-w', `${w}px`);
  document.documentElement.style.setProperty('--screen-h', `${h}px`);
}

export function initTVOptimization() {
  if (typeof document === 'undefined') return;

  const applyDeviceAttributes = (device: DeviceType) => {
    document.documentElement.dataset.device = device;
    if (device === 'tv') {
      document.documentElement.classList.add('tv-mode', 'device-tv');
      document.documentElement.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
      updateTVStageScale();
    } else {
      document.documentElement.classList.remove('tv-mode', 'device-tv');
      document.documentElement.classList.add(`device-${device}`);
    }
  };

  const initialDevice = getDeviceType();
  applyDeviceAttributes(initialDevice);

  // Re-evaluate on window resize or orientation changes
  const onResize = () => {
    const currentDevice = getDeviceType();
    applyDeviceAttributes(currentDevice);
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  // If remote control navigation keys are pressed (e.g. arrow keys, D-pad on TV), lock in TV mode
  const onKeyDown = (e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Select'].includes(e.key)) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w / (h || 1) >= 1.4 && !document.documentElement.classList.contains('tv-mode')) {
        applyDeviceAttributes('tv');
      }
    }
  };
  window.addEventListener('keydown', onKeyDown, { passive: true });
}

