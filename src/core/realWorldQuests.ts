import { todayKey } from './db';

export interface RealWorldQuest {
  id: string;
  title: string;
  category: string;
  icon: string;
  prompt: string;
  examples: string;
  speechText: string;
}

export const REAL_WORLD_QUESTS: RealWorldQuest[] = [
  {
    id: 'sh-detective',
    title: 'The /sh/ Sound Detective',
    category: 'Sound Detective',
    icon: '🤫',
    prompt: 'Find 2 things in your home that start with the /sh/ sound!',
    examples: 'Like a shiny spoon, a shoe, or a shirt!',
    speechText: 'Secret agent mission! Rowan, can you find two things in your home that start with the shh sound? Like a shoe, a shirt, or a shiny spoon!',
  },
  {
    id: 'b-hunt',
    title: 'The Bouncing /b/ Hunt',
    category: 'Sound Detective',
    icon: '🏀',
    prompt: 'Find 2 things in your room that start with the /b/ sound!',
    examples: 'Like a ball, a book, a bed, or a block!',
    speechText: 'Explorer quest! Go find two things in your room that start with the buh sound! Like a ball, a book, or a block!',
  },
  {
    id: 'ch-explorer',
    title: 'The /ch/ Sound Explorer',
    category: 'Sound Detective',
    icon: '🧀',
    prompt: 'Find something at home that starts with the /ch/ sound!',
    examples: 'Like a chair, a chip, cheese, or chalk!',
    speechText: 'Chomp chomp! Rowan, can you find something in the house that starts with the ch sound? Like a chair, cheese, or a chip!',
  },
  {
    id: 's-search',
    title: 'The Super /s/ Search',
    category: 'Sound Detective',
    icon: '🧦',
    prompt: 'Find 3 things that start with the /s/ sound!',
    examples: 'Like socks, a spoon, soap, or a sticker!',
    speechText: 'Super detective alert! Find three things that start with the sss sound! Like socks, a spoon, or a sticker!',
  },
  {
    id: 'rhyme-cat',
    title: 'The Rhyme Partner Hunt',
    category: 'Rhyme Time',
    icon: '🎩',
    prompt: "Find something in your room that rhymes with 'cat'!",
    examples: 'Like a hat, a mat, or a baseball bat!',
    speechText: "Rhyme time, Rowan! Can you find something in your room that rhymes with cat? Like a hat, a mat, or a bat!",
  },
  {
    id: 'st-cr-blend',
    title: 'Star & Crayon Blend Hunt',
    category: 'Sound Blends',
    icon: '🖍️',
    prompt: 'Find something that starts with the /st/ or /cr/ sound blend!',
    examples: 'Like a sticker, a spoon/star, a crayon, or a cracker!',
    speechText: 'Blend detective! Find something that starts with st or cr! Like a sticker, a crayon, or a cracker!',
  },
  {
    id: 't-ending',
    title: 'The /t/ Ending Detective',
    category: 'Ending Sounds',
    icon: '🧥',
    prompt: 'Find something that ends with the /t/ sound!',
    examples: 'Like a hat, a coat, a pot, or a light!',
    speechText: 'Listening ears ready! Find something in your home that ends with the tuh sound! Like a hat, a coat, or a pot!',
  },
  {
    id: 'spoons-count',
    title: 'Count to 5 Challenge',
    category: 'Real-World Math',
    icon: '🥄',
    prompt: 'Go find 5 spoons (or 5 crayons) and count them out loud!',
    examples: 'Touch each one as you count: 1, 2, 3, 4, 5!',
    speechText: 'Math champion quest! Go find 5 spoons or crayons, and count them out loud: 1, 2, 3, 4, 5!',
  },
  {
    id: 'circle-detective',
    title: 'Circle Shape Detective',
    category: 'Shapes in Real Life',
    icon: '⚪',
    prompt: 'Find 2 things in your home that are round like a circle!',
    examples: 'Like a clock, a plate, a coin, or a lid!',
    speechText: 'Look around! Can you find two things in your home that are round like a circle? Like a clock, a coin, or a plate!',
  },
  {
    id: 'rectangle-hunter',
    title: 'Rectangle Shape Hunter',
    category: 'Shapes in Real Life',
    icon: '📱',
    prompt: 'Find 2 things that have 4 sides like a rectangle!',
    examples: 'Like a book, a tablet, a door, or a picture frame!',
    speechText: 'Shape hunter challenge! Find two things that have four sides like a rectangle! Like a book, a tablet, or a door!',
  },
  {
    id: 'heavy-light',
    title: 'The Heavy & Light Explorer',
    category: 'Measurement & Senses',
    icon: '⚖️',
    prompt: 'Find one thing that is heavy and one thing that is super light!',
    examples: 'Like a big book versus a feather or paper!',
    speechText: 'Scientist mission! Find one thing that feels heavy to hold, and one thing that is super light!',
  },
  {
    id: 'th-sound',
    title: 'The /th/ Sound Explorer',
    category: 'Sound Detective',
    icon: '👍',
    prompt: 'Find something that starts with the /th/ sound!',
    examples: 'Like your thumb, a thread, or something thick or thin!',
    speechText: 'Sound explorer quest! Find something that starts with the th sound! Like your thumb, or a thread!',
  },
  {
    id: 'fluffy-texture',
    title: 'Soft & Cozy Texture Hunt',
    category: 'Sensory Words',
    icon: '🧸',
    prompt: 'Find the softest, coziest thing in your bedroom!',
    examples: 'Like a favorite teddy bear, a blanket, or a pillow!',
    speechText: 'Cozy quest! Go find the softest, fluffiest thing in your bedroom! Give it a big squeeze!',
  },
  {
    id: 'india-greeting',
    title: 'World Explorer Greeting',
    category: 'Family & World',
    icon: '🌏',
    prompt: "Ask Mom or Dad: 'How do we say Hello and Thank You in India?'",
    examples: "Like saying 'Namaste' with hands together! 🙏",
    speechText: "World explorer mission! Ask Mom or Dad: How do we say Hello and Thank You in India? Practice saying Namaste together!",
  },
];

const questStorageKey = (profileId: string, day: string) => `rlw.quest.done.${profileId}.${day}`;

const memStore = new Map<string, string>();

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
      return window.localStorage.getItem(key);
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      return localStorage.getItem(key);
    }
  } catch {
    /* ignore */
  }
  return memStore.get(key) ?? null;
}

function setStorageItem(key: string, value: string): void {
  memStore.set(key, value);
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, value);
    }
  } catch {
    /* ignore */
  }
}

export function clearQuestStorage(): void {
  memStore.clear();
}

export function getTodayQuest(dayIndex?: number): RealWorldQuest {
  const d = dayIndex !== undefined ? dayIndex : new Date().getDay();
  // Rotate through the 14 quests using day of the year so it stays fresh each week
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const idx = (dayOfYear + d) % REAL_WORLD_QUESTS.length;
  return REAL_WORLD_QUESTS[idx] ?? REAL_WORLD_QUESTS[0];
}

export function isQuestDoneToday(profileId: string, day: string = todayKey()): boolean {
  return getStorageItem(questStorageKey(profileId, day)) === '1';
}

export function markQuestDoneToday(profileId: string, day: string = todayKey()): void {
  setStorageItem(questStorageKey(profileId, day), '1');
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('quest:completed', { detail: { profileId, day } }));
    }
  } catch {
    // ignore
  }
}
