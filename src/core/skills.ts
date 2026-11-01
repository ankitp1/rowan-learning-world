import type { Skill, Subject } from './types';

const R = (id: string, name: string, strand: string, tip: string, ladder = true): Skill =>
  ({ id, subject: 'reading', name, strand, tip, ladder });
const M = (id: string, name: string, strand: string, tip: string): Skill =>
  ({ id, subject: 'math', name, strand, tip, ladder: true });

/**
 * The skill map. Array order = ladder order within a subject (placement and
 * level logic use the index). Add new skills here; every game and report
 * picks them up automatically.
 */
export const SKILLS: Skill[] = [
  R('read.cvc.a', 'Short a words (cat)', 'Short vowels', 'Swap the first letter on a word: cat, hat, bat, mat. Ask him to read each one.'),
  R('read.cvc.i', 'Short i words (pig)', 'Short vowels', 'Write pin, pit, pig on a whiteboard and change one letter at a time.'),
  R('read.cvc.o', 'Short o words (dog)', 'Short vowels', 'Hunt for short o objects around the house: box, pot, mop, dog toy.'),
  R('read.cvc.e', 'Short e words (bed)', 'Short vowels', 'Play "which word": bed or bad? Let him sound out both.'),
  R('read.cvc.u', 'Short u words (bus)', 'Short vowels', 'Read a sentence together: The bug is on the rug.'),
  R('read.dig.sh', 'sh words (ship)', 'Digraphs', 'Point out sh words on signs and packaging: shop, fish, wash.'),
  R('read.dig.ch', 'ch words (chip)', 'Digraphs', 'Say "choo choo" together, then read chip, chop, chin, chat.'),
  R('read.dig.th', 'th words (bath)', 'Digraphs', 'Tongue between teeth for th. Read bath, path, math, moth.'),
  R('read.dig.ck', 'ck words (duck)', 'Digraphs', 'ck says k at the end: duck, sock, rock, lock. Make a rhyming list.'),
  R('read.blend.init', 'Starting blends (frog)', 'Blends', 'Slide two sounds together at the start: fr-og, fl-ag, st-op, cl-ap.'),
  R('read.blend.final', 'Ending blends (tent)', 'Blends', 'Tap out the last two sounds: ten-t, han-d, lam-p. Use magnets or cards.'),
  R('read.silent-e', 'Silent e (cake)', 'Long vowels', 'Compare cap/cape, kit/kite with a paper "magic e" card.'),
  R('read.sight', 'Sight words (the, said)', 'Sight words', 'Hide sight words around the room on sticky notes and have him find and read them.'),
  R('read.comp.recall', 'Story recall', 'Comprehension', 'After a story ask "Who...?" and "What...?" questions.', false),
  R('read.comp.sequence', 'Story order', 'Comprehension', 'Ask "What happened first? What happened last?" after bedtime stories.', false),
  R('read.comp.infer', 'Solving clues', 'Comprehension', 'Ask "How do you know?" when he gives an answer about a story.', false),
  R('read.comp.follow', 'Following written directions', 'Comprehension', 'Leave a short written note with a job ("Put the red cup on the big shelf") and let him do it.', false),
  R('read.rhyme', 'Rhyming', 'Sounds', 'Play rhyme chains in the car: cat, hat, bat... who can keep going longest?', false),
  R('read.groups', 'Group names and plurals', 'Words', 'Spot groups on walks: a flock of birds, a herd of cows. Then try one mouse, two mice.', false),

  M('math.count.10', 'Counting to 10', 'Counting', 'Count stairs, snacks and toys. Touch each one as you count.'),
  M('math.count.20', 'Counting to 20', 'Counting', 'Count out 11 to 20 pieces of cereal. Group them in fives.'),
  M('math.compare', 'More, less, same', 'Compare', 'Make two piles of snacks. Which has more? Which has less?'),
  M('math.add.5', 'Adding within 5', 'Addition', 'Use fingers or snacks: 2 here, 3 more, how many now?'),
  M('math.add.10', 'Adding within 10', 'Addition', 'Roll a die twice and add them with counters.'),
  M('math.sub.5', 'Taking away within 5', 'Subtraction', 'Eat-and-count: 5 grapes, eat 2, how many are left?'),
  M('math.sub.10', 'Taking away within 10', 'Subtraction', 'Line up 10 blocks and take some away. Say the number sentence.'),
  M('math.make10', 'Making 10', 'Number bonds', 'Show 7 fingers. How many more to make 10?'),
  M('math.add.20', 'Adding within 20', 'Addition', 'Start from the bigger number and count on. 8 + 3: 9, 10, 11.'),
  M('math.sub.20', 'Taking away within 20', 'Subtraction', 'Use a number line on the floor and hop backwards.'),
];

const byId = new Map(SKILLS.map((s) => [s.id, s]));
export const skillById = (id: string) => byId.get(id);
export const skillName = (id: string) => byId.get(id)?.name ?? id;

export const ladder = (subject: Subject): Skill[] =>
  SKILLS.filter((s) => s.subject === subject && s.ladder !== false);

export const ladderIndex = (skillId: string): number => {
  const s = byId.get(skillId);
  if (!s) return -1;
  return ladder(s.subject).findIndex((x) => x.id === skillId);
};

export const skillsOf = (subject: Subject) => SKILLS.filter((s) => s.subject === subject);

/** Subjects that have a skill ladder (and so use placement). */
export const LADDER_SUBJECTS: Subject[] = ['reading', 'math'];
