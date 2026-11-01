import type { Theme } from './types';

/**
 * Themes are skins: art + words only, no game logic. To add one, add an object
 * here (original characters only; do not use trademarked ones in a shared app).
 */
export const THEMES: Theme[] = [
  {
    id: 'pirate',
    name: 'Pirate Adventure',
    emoji: '🏴‍☠️',
    helper: { name: 'Pip', emoji: '🦜' },
    colors: { bg1: '#0e4d64', bg2: '#1b8aa6', primary: '#ffb703', accent: '#e63946', card: '#fff8e7', text: '#10323f' },
    collectible: { emoji: '🪙', one: 'gold coin', many: 'gold coins' },
    container: { emoji: '🧰', name: 'treasure chest' },
    thief: { emoji: '🐦', name: 'seagull' },
    pieces: ['⚓', '🦜'],
    mapTitle: "Captain {name}'s Crew",
    islands: {
      reading: 'Phonics Cove', math: 'Number Reef', science: 'Creature Rescue Isle',
      geography: 'Map Room', art: 'Art Cabin', games: 'Game Deck',
    },
    islandEmoji: { reading: '🏝️', math: '🪸', science: '🐾', geography: '🗺️', art: '🎨', games: '🎮' },
    mystery: { name: 'Mystery Manor', emoji: '🕵️' },
    brain: { name: 'Puzzle Cove', emoji: '🧩' },
    missionNames: [
      'The Case of the Missing Map', "The Parrot's Secret Code", 'Treasure of Whisper Bay',
      'The Ghost Ship Riddle', 'Mystery of the Moonlit Cove', 'The Great Gold Coin Hunt',
    ],
    stickers: ['🏴‍☠️', '⚓', '🦜', '🐙', '🦀', '🐚', '🧭', '💎', '🚢', '🦈', '🌴', '🥥', '🔭', '🏆', '🐳', '⛵'],
    praise: ['Arr, brilliant!', 'Shiver me timbers, you got it!', 'Ahoy, nailed it!', 'Treasure find!', 'Yo ho, great job!'],
    decor: ['🌊', '⛵', '☁️', '🐚'],
  },
  {
    id: 'super',
    name: 'Super Family',
    emoji: '🦸',
    helper: { name: 'Bolt', emoji: '🤖' },
    colors: { bg1: '#1b2a6b', bg2: '#6a3df0', primary: '#ffd23f', accent: '#ff4d6d', card: '#f4f1ff', text: '#1a1446' },
    collectible: { emoji: '⚡', one: 'power spark', many: 'power sparks' },
    container: { emoji: '🔋', name: 'power pod' },
    thief: { emoji: '👾', name: 'gremlin' },
    pieces: ['🦸', '🤖'],
    mapTitle: "{name}'s Super Family HQ",
    islands: {
      reading: 'Word Tower', math: 'Power Plant', science: 'Creature Lab',
      geography: 'Globe Command', art: 'Hero Studio', games: 'Training Arena',
    },
    islandEmoji: { reading: '🗼', math: '🏭', science: '🧪', geography: '🌍', art: '🎨', games: '🎯' },
    mystery: { name: 'Secret Lair', emoji: '🕵️' },
    brain: { name: 'Brain Gym', emoji: '🧠' },
    missionNames: [
      'The Case of the Missing Power Pod', 'Gremlin Alert at HQ', 'The Secret Signal',
      'Rescue at Skyline Tower', 'Mystery of the Dimmed Lights',
    ],
    stickers: ['🦸', '⚡', '🛡️', '🚀', '🦾', '🔥', '🌟', '💥', '🧬', '🏙️', '🪐', '🎖️', '🛸', '💫', '🏅', '🌈'],
    praise: ['Super job!', 'Power up, you did it!', 'Hero move!', 'Zoom, nailed it!', 'Mighty work!'],
    decor: ['☁️', '⭐', '🌙', '💫'],
  },
  {
    id: 'pups',
    name: 'Rescue Pups',
    emoji: '🐾',
    helper: { name: 'Scout', emoji: '🐶' },
    colors: { bg1: '#0a5c99', bg2: '#2ec4b6', primary: '#ffbe0b', accent: '#ef233c', card: '#fffdf5', text: '#0d2b45' },
    collectible: { emoji: '🦴', one: 'pup treat', many: 'pup treats' },
    container: { emoji: '🎒', name: 'rescue pack' },
    thief: { emoji: '🐱', name: 'cheeky kitty' },
    pieces: ['🐾', '🚒'],
    mapTitle: "Pup Leader {name}'s Bay",
    islands: {
      reading: 'Bark Bay Books', math: 'Lookout Numbers', science: 'Critter Clinic',
      geography: 'Rescue Map HQ', art: 'Pup Paint Park', games: 'Pup Playground',
    },
    islandEmoji: { reading: '📚', math: '🚨', science: '🐕', geography: '🗺️', art: '🎨', games: '🥏' },
    mystery: { name: 'Detective Bay', emoji: '🔍' },
    brain: { name: 'Pup Training', emoji: '🏅' },
    missionNames: [
      'The Case of the Missing Pup Treats', 'Rescue at Adventure Bridge', 'The Lighthouse Bell Mystery',
      'Operation Golden Bone', 'Lost Kitty on Lookout Hill',
    ],
    stickers: ['🐾', '🐶', '🚒', '🚓', '🚁', '🦴', '🏅', '🚨', '🛟', '🐕‍🦺', '🌈', '⭐', '🏆', '🎺', '⛺', '🚤'],
    praise: ['Pawsome job!', 'No puzzle is too big, no pup is too small!', 'Ruff-ruff rescue!', 'Tail-wagging work!', 'You saved the day!'],
    decor: ['🐾', '☁️', '🌈', '🦴'],
  },
  {
    id: 'rescue',
    name: 'Creature Rescue',
    emoji: '🦄',
    helper: { name: 'Blaze', emoji: '🐉' },
    colors: { bg1: '#134e4a', bg2: '#0f766e', primary: '#fbbf24', accent: '#f43f5e', card: '#fefce8', text: '#132a28' },
    collectible: { emoji: '💎', one: 'magic gem', many: 'magic gems' },
    container: { emoji: '🧳', name: 'field trunk' },
    thief: { emoji: '👺', name: 'rascal imp' },
    pieces: ['🦄', '🐉'],
    mapTitle: "Ranger {name}'s Sanctuary",
    islands: {
      reading: 'Whispering Woods', math: 'Crystal Canyon', science: 'Creature Hollow',
      geography: 'Explorer Camp', art: 'Sketch Tent', games: 'Campfire Games',
    },
    islandEmoji: { reading: '🌲', math: '💎', science: '🦄', geography: '🧭', art: '🎨', games: '🏕️' },
    mystery: { name: 'Cryptid Cave', emoji: '🔦' },
    brain: { name: 'Ancient Ruins', emoji: '🏛️' },
    missionNames: [
      'Secret of the Baby Unicorn', 'The Dragon Egg Rescue', 'Footprints in the Misty Woods',
      'The Lost Griffin Feather', 'Mystery of Rainbow Falls',
    ],
    stickers: ['🦄', '🐉', '🦕', '🦖', '💎', '🌲', '🍄', '🦋', '🦉', '🦊', '🏔️', '🌈', '🔮', '🧭', '🏕️', '🌟'],
    praise: ['Magical discovery!', 'Legendary work, Ranger!', 'You rescued the creature!', 'Roar-some job!', 'Brilliant fieldwork!'],
    decor: ['✨', '🍄', '🦋', '🌲'],
  },
];

export const themeById = (id: string): Theme => THEMES.find((t) => t.id === id) ?? THEMES[0];

/** Per-theme surface styling (letter tiles, scenery tint). Pure CSS variables, no code per theme. */
const SKINS: Record<string, Record<string, string>> = {
  pirate: {
    '--tile-bg': 'linear-gradient(180deg,#f0be86,#c8823b)', '--tile-fg': '#432308', '--tile-edge': '#7c451b',
    '--tile-grain': 'repeating-linear-gradient(90deg,rgba(90,52,22,.0) 0 10px,rgba(90,52,22,.10) 10px 12px)',
    '--panel': 'rgba(9,52,82,.42)', '--wall': '#5a3416', '--floor': '#fff2cf', '--frame': '#c98a4b',
  },
  super: {
    '--tile-bg': 'linear-gradient(180deg,#a695ff,#5b3ed8)', '--tile-fg': '#fff', '--tile-edge': '#311d8a',
    '--tile-grain': 'linear-gradient(135deg,rgba(255,255,255,.28),rgba(255,255,255,0) 45%)',
    '--panel': 'rgba(14,10,60,.42)', '--wall': '#2a1a8a', '--floor': '#ece8ff', '--frame': '#6a3df0',
  },
  pups: {
    '--tile-bg': 'linear-gradient(180deg,#ff6b6b,#d90429)', '--tile-fg': '#fff', '--tile-edge': '#8d0801',
    '--tile-grain': 'linear-gradient(135deg,rgba(255,255,255,.32),rgba(255,255,255,0) 50%)',
    '--panel': 'rgba(7,45,82,.38)', '--wall': '#0d3b66', '--floor': '#fff8dc', '--frame': '#ef233c',
  },
  rescue: {
    '--tile-bg': 'linear-gradient(180deg,#6ee7b7,#059669)', '--tile-fg': '#062c21', '--tile-edge': '#065f46',
    '--tile-grain': 'linear-gradient(135deg,rgba(255,255,255,.35),rgba(255,255,255,0) 50%)',
    '--panel': 'rgba(6,44,38,.44)', '--wall': '#115e59', '--floor': '#fef9c3', '--frame': '#d97706',
  },
};

export function applyTheme(t: Theme) {
  const r = document.documentElement.style;
  for (const [k, v] of Object.entries(SKINS[t.id] ?? SKINS.pirate)) r.setProperty(k, v);
  r.setProperty('--bg1', t.colors.bg1);
  r.setProperty('--bg2', t.colors.bg2);
  r.setProperty('--primary', t.colors.primary);
  r.setProperty('--accent', t.colors.accent);
  r.setProperty('--card', t.colors.card);
  r.setProperty('--text', t.colors.text);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.colors.bg1);
}
