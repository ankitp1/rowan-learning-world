/**
 * Content for Group Names: collective nouns ("a pride of lions") and plurals
 * ("one mouse, two mice"). lvl 0 = everyday, 1 = common, 2 = tricky or silly.
 */

export interface GroupItem {
  /** What the things are, plural ("lions"). */
  noun: string;
  emoji: string;
  /** Every group word that is correct for this noun. The first one is the answer shown. */
  ok: string[];
  lvl: 0 | 1 | 2;
}

export const GROUPS: GroupItem[] = [
  { noun: 'fish', emoji: '🐟', ok: ['school', 'shoal'], lvl: 0 },
  { noun: 'bees', emoji: '🐝', ok: ['swarm'], lvl: 0 },
  { noun: 'cows', emoji: '🐄', ok: ['herd'], lvl: 0 },
  { noun: 'birds', emoji: '🐦', ok: ['flock'], lvl: 0 },
  { noun: 'sheep', emoji: '🐑', ok: ['flock', 'herd'], lvl: 0 },
  { noun: 'shoes', emoji: '👟', ok: ['pair'], lvl: 0 },
  { noun: 'grapes', emoji: '🍇', ok: ['bunch'], lvl: 0 },
  { noun: 'bananas', emoji: '🍌', ok: ['bunch'], lvl: 0 },
  { noun: 'books', emoji: '📚', ok: ['stack', 'pile'], lvl: 0 },
  { noun: 'lions', emoji: '🦁', ok: ['pride'], lvl: 1 },
  { noun: 'wolves', emoji: '🐺', ok: ['pack'], lvl: 1 },
  { noun: 'elephants', emoji: '🐘', ok: ['herd'], lvl: 1 },
  { noun: 'ants', emoji: '🐜', ok: ['colony'], lvl: 1 },
  { noun: 'puppies', emoji: '🐶', ok: ['litter'], lvl: 1 },
  { noun: 'kittens', emoji: '🐱', ok: ['litter'], lvl: 1 },
  { noun: 'whales', emoji: '🐋', ok: ['pod'], lvl: 1 },
  { noun: 'dolphins', emoji: '🐬', ok: ['pod'], lvl: 1 },
  { noun: 'cards', emoji: '🃏', ok: ['deck'], lvl: 1 },
  { noun: 'geese', emoji: '🪿', ok: ['gaggle', 'flock'], lvl: 2 },
  { noun: 'owls', emoji: '🦉', ok: ['parliament'], lvl: 2 },
  { noun: 'monkeys', emoji: '🐒', ok: ['troop'], lvl: 2 },
  { noun: 'crabs', emoji: '🦀', ok: ['cast'], lvl: 2 },
];

/** Every group word, used for wrong answers. */
export const GROUP_WORDS = [...new Set(GROUPS.flatMap((g) => g.ok))];

export interface PluralItem {
  one: string;
  many: string;
  emoji: string;
  /** 'regular' = add s or es, 'odd' = changes shape or stays the same. */
  type: 'regular' | 'odd';
  lvl: 0 | 1 | 2;
}

export const PLURALS: PluralItem[] = [
  { one: 'cat', many: 'cats', emoji: '🐱', type: 'regular', lvl: 0 },
  { one: 'dog', many: 'dogs', emoji: '🐶', type: 'regular', lvl: 0 },
  { one: 'hat', many: 'hats', emoji: '🎩', type: 'regular', lvl: 0 },
  { one: 'box', many: 'boxes', emoji: '📦', type: 'regular', lvl: 1 },
  { one: 'bus', many: 'buses', emoji: '🚌', type: 'regular', lvl: 1 },
  { one: 'dish', many: 'dishes', emoji: '🍽️', type: 'regular', lvl: 1 },
  { one: 'mouse', many: 'mice', emoji: '🐭', type: 'odd', lvl: 0 },
  { one: 'foot', many: 'feet', emoji: '🦶', type: 'odd', lvl: 0 },
  { one: 'tooth', many: 'teeth', emoji: '🦷', type: 'odd', lvl: 1 },
  { one: 'child', many: 'children', emoji: '🧒', type: 'odd', lvl: 1 },
  { one: 'man', many: 'men', emoji: '👨', type: 'odd', lvl: 1 },
  { one: 'woman', many: 'women', emoji: '👩', type: 'odd', lvl: 2 },
  { one: 'goose', many: 'geese', emoji: '🪿', type: 'odd', lvl: 2 },
  { one: 'fish', many: 'fish', emoji: '🐟', type: 'odd', lvl: 1 },
  { one: 'sheep', many: 'sheep', emoji: '🐑', type: 'odd', lvl: 2 },
  { one: 'deer', many: 'deer', emoji: '🦌', type: 'odd', lvl: 2 },
  { one: 'leaf', many: 'leaves', emoji: '🍃', type: 'odd', lvl: 2 },
  { one: 'wolf', many: 'wolves', emoji: '🐺', type: 'odd', lvl: 2 },
];
