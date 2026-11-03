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
    helper: {
      name: 'Barnaby',
      emoji: '🦜',
      role: 'First Mate & Lookout',
      personality: 'Loyal, cheerful, always looking on the bright side and cheering Rowan through high seas and storms.',
      voiceStyle: { pitch: 1.15, rate: 0.95, kokoroVoice: 'bm_george' },
    },
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
    praise: [
      'Arr, brilliant job, Captain!',
      'You solved that like a true explorer!',
      'Shiver me timbers, your brain is sharp today!',
      'Look at that treasure! I knew you could do it!',
      'Yo ho ho! We make the best crew ever!',
    ],
    encouragements: [
      'Take a deep breath, matey! Even great captains test the waters twice.',
      "That was a clever try! Let's listen closely together.",
      "No stormy seas can stop us! We're learning something brand new.",
      "I'm right on your shoulder, Rowan! Let's try another one.",
      "Mistakes just show your brain is exploring new islands!",
    ],
    growthNudges: [
      'Whenever we hit a puzzle, we grow a little stronger!',
      'Take all the time you need, Captain. No rush on my ship!',
    ],
    decor: ['🌊', '⛵', '☁️', '🐚'],
  },
  {
    id: 'super',
    name: 'Super Family',
    emoji: '🦸',
    helper: {
      name: 'Bolt & Nova',
      emoji: '🤖',
      role: 'HQ Navigator & Hero Coach',
      personality: 'Warm, patient tech companion who believes every kid has a superhero spark inside waiting to power up.',
      voiceStyle: { pitch: 1.05, rate: 0.92, kokoroVoice: 'am_adam' },
    },
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
    praise: [
      'Super brain power activated!',
      'Hero move! You figured that out brilliantly!',
      'Your powers are growing with every single answer!',
      'Incredible focus, Hero! HQ is proud of you!',
      'Power spark collected! You did that all by yourself!',
    ],
    encouragements: [
      'Every hero practices before saving the world! You are doing great.',
      'That was super close! Give your superhero brain a second to recharge.',
      'No worries at all! Training is where heroes get their strength.',
      'I believe in you! Take a gentle look at the clues.',
      'Superheroes never give up, and neither do we!',
    ],
    growthNudges: [
      'Trying tough challenges is how your brain builds real superpowers!',
      'Remember: being brave means trying even when it feels tricky.',
    ],
    decor: ['☁️', '⭐', '🌙', '💫'],
  },
  {
    id: 'pups',
    name: 'Rescue Pups',
    emoji: '🐾',
    helper: {
      name: 'Pip & Scout',
      emoji: '🐶',
      role: 'Rescue Pup Leader',
      personality: 'Enthusiastic, cuddly, fiercely supportive companion who wags their tail at every brave attempt.',
      voiceStyle: { pitch: 1.25, rate: 0.96, kokoroVoice: 'af_bella' },
    },
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
    praise: [
      'Pawsome job! My tail is wagging so fast!',
      'You did it, Pup Leader! That was amazing!',
      'Ruff ruff! You solved that rescue puzzle!',
      'High five paw! You worked so hard on that one!',
      'No puzzle is too big, and no learner is too small!',
    ],
    encouragements: [
      "That's okay, buddy! Even rescue pups sniff around a few times first.",
      'You are doing wonderful! Let me give you a happy nudge.',
      "Big warm pup hug! Let's give it one more friendly try.",
      "I love how hard you are trying! That's what true heroes do.",
      'Every single try helps us get closer to the rescue!',
    ],
    growthNudges: [
      'Good learners make mistakes and keep their tail wagging!',
      'I am right by your side every step of the way!',
    ],
    decor: ['🐾', '☁️', '🌈', '🦴'],
  },
  {
    id: 'rescue',
    name: 'Creature Rescue',
    emoji: '🦄',
    helper: {
      name: 'Luna & Blaze',
      emoji: '🐉',
      role: 'Sanctuary Ranger & Dragon Caretaker',
      personality: 'Gentle, wise naturalist who encourages curiosity, kindness, and observing the little details in nature.',
      voiceStyle: { pitch: 1.0, rate: 0.9, kokoroVoice: 'af_heart' },
    },
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
    praise: [
      'Magical discovery, Ranger! You figured it out!',
      'The sanctuary creatures are smiling because of you!',
      'Such thoughtful work! You have a true explorer eye!',
      'Wonderful patience! You unlocked the secret clue!',
      'Brilliant observation! You are a master creature ranger!',
    ],
    encouragements: [
      'Take a calm, quiet moment. Nature teaches us to be patient with ourselves.',
      'Every gentle try is a clue that leads us closer.',
      'You are doing beautiful work, Ranger. Keep that curious heart.',
      'Even baby dragons take a few small hops before they fly!',
      'I am so proud of how carefully you are thinking about this.',
    ],
    growthNudges: [
      'Curiosity is like a seed; it grows every time you wonder and try!',
      'Take a calm breath, look at the forest path, and try again when you are ready.',
    ],
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
  if (t.helper?.voiceStyle) {
    import('./speech').then(({ setThemeVoice }) => setThemeVoice(t.helper.voiceStyle));
  }
}
