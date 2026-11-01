/** Is `now` inside a bedtime window ("HH:MM" 24h; may cross midnight)? */
export function inBedtime(b: { from: string; to: string } | null | undefined, now = new Date()): boolean {
  if (!b) return false;
  const mins = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + (m || 0); };
  const t = now.getHours() * 60 + now.getMinutes();
  const from = mins(b.from);
  const to = mins(b.to);
  if (from === to) return false;
  return from < to ? t >= from && t < to : t >= from || t < to;
}

/** Salted hash for the grown-up PIN. Uses SHA-256 where available (HTTPS/localhost), else a simple fallback. */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const text = `${salt}:${pin}`;
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `f${(h2 >>> 0).toString(16)}${(h1 >>> 0).toString(16)}`;
}
