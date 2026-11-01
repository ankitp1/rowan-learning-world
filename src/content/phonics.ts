/** Phonics helpers: splitting words into letter tiles and mapping tiles to sounds. */

export const DIGRAPHS = ['sh', 'ch', 'th', 'ck', 'll'];
export const VOWELS = ['a', 'e', 'i', 'o', 'u'];

/**
 * TTS respellings for each sound. Voices vary, so tweak here (or add recorded
 * clips, see speech.ts). Consonants carry a small "uh" because TTS can't clip them.
 */
export const SOUND_TEXT: Record<string, string> = {
  a: 'aa', e: 'eh', i: 'ih', o: 'ah', u: 'uh',
  a_e: 'ay', e_e: 'ee', i_e: 'eye', o_e: 'oh', u_e: 'yoo',
  b: 'buh', c: 'kuh', d: 'duh', f: 'fff', g: 'guh', h: 'huh', j: 'juh', k: 'kuh', l: 'lll', m: 'mmm',
  n: 'nnn', p: 'puh', q: 'kwuh', r: 'rrr', s: 'sss', t: 'tuh', v: 'vvv', w: 'wuh', x: 'ks', y: 'yuh', z: 'zzz',
  sh: 'shhh', ch: 'chuh', th: 'thhh', ck: 'kuh', ll: 'lll',
};

/** "ship" -> ["sh","i","p"], "chick" -> ["ch","i","ck"]. */
export function tilesOf(word: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < word.length; i++) {
    const two = word.slice(i, i + 2);
    if (DIGRAPHS.includes(two)) { out.push(two); i++; } else out.push(word[i]);
  }
  return out;
}

/** Sound keys for a word. For silent-e words the vowel says its name and the final e is silent. */
export function soundsOf(word: string, silentE = false): string[] {
  const tiles = tilesOf(word);
  if (!silentE || tiles[tiles.length - 1] !== 'e') return tiles;
  const body = tiles.slice(0, -1);
  const vi = body.findIndex((t) => VOWELS.includes(t));
  if (vi >= 0) body[vi] = `${body[vi]}_e`;
  return body;
}

/** One-line "why" for the Explain step, by skill. */
export const EXPLAIN: Record<string, (w: string) => string> = {
  'read.cvc.a': (w) => `${w}: the a in the middle says aa, like in cat.`,
  'read.cvc.i': (w) => `${w}: the i in the middle says ih, like in pig.`,
  'read.cvc.o': (w) => `${w}: the o in the middle says ah, like in dog.`,
  'read.cvc.e': (w) => `${w}: the e in the middle says eh, like in bed.`,
  'read.cvc.u': (w) => `${w}: the u in the middle says uh, like in bus.`,
  'read.dig.sh': (w) => `${w}: s and h team up to say shhh, like a ship sailing.`,
  'read.dig.ch': (w) => `${w}: c and h team up to say chuh, like a choo choo train.`,
  'read.dig.th': (w) => `${w}: t and h team up to say thhh. Tongue between your teeth!`,
  'read.dig.ck': (w) => `${w}: c and k team up to say k at the end of a word.`,
  'read.blend.init': (w) => `${w}: say the first two sounds quickly, side by side.`,
  'read.blend.final': (w) => `${w}: the last two sounds slide together.`,
  'read.silent-e': (w) => `${w}: the magic e on the end is silent, and it makes the vowel say its name.`,
};

export const SIGHT_WORDS = [
  'the', 'said', 'was', 'you', 'are', 'have', 'they', 'with', 'come', 'some', 'what', 'where', 'do', 'to', 'of', 'was', 'put', 'her', 'she', 'we',
].filter((w, i, a) => a.indexOf(w) === i);
