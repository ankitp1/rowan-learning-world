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
  {
    id: 'space-ranger',
    name: 'Space Ranger',
    emoji: '🚀',
    helper: {
      name: 'Ranger Buzz',
      emoji: '🚀',
      role: 'Star Command Flight Captain',
      personality: 'Bold, heroic, devoted space explorer who treats learning like an interplanetary mission and believes Rowan can reach infinity and beyond!',
      voiceStyle: { pitch: 0.92, rate: 0.94, kokoroVoice: 'am_adam', voiceNamePattern: 'daniel|tom|alex|guy|aaron|david|am_adam|natural male|en-us-neural' },
    },
    colors: { bg1: '#0b132b', bg2: '#1c2541', primary: '#38ef7d', accent: '#a855f7', card: '#f8f9fa', text: '#0b132b' },
    collectible: { emoji: '⭐', one: 'power crystal', many: 'power crystals' },
    container: { emoji: '🛸', name: 'star cruiser cargo' },
    thief: { emoji: '👾', name: 'cosmic bot' },
    pieces: ['🚀', '👨‍🚀'],
    mapTitle: "Cadet {name}'s Star Command Base",
    islands: {
      reading: 'Star Command Archives', math: 'Cosmic Coordinates', science: 'Alien Biology Bay',
      geography: 'Galaxy Planetary Map', art: 'Starship Design Bay', games: 'Galactic Flight Simulator',
    },
    islandEmoji: { reading: '🛸', math: '🪐', science: '👽', geography: '🌌', art: '🎨', games: '🚀' },
    mystery: { name: 'Sector Z Mystery', emoji: '🛰️' },
    brain: { name: 'Zero-G Brain Lab', emoji: '☄️' },
    missionNames: [
      'Operation Cosmic Jump', 'The Lost Hyper-Battery', 'Mystery of Sector 4',
      'Rescue on Planet Alpha', 'Code of the Star Rangers', 'Star Command Secret Signal',
    ],
    stickers: ['🚀', '👨‍🚀', '🪐', '🛸', '🛰️', '⭐', '🌌', '⚡', '🔋', '🛡️', '🌠', '☄️', '👾', '🎖️', '🔭', '🤖'],
    praise: [
      'To learning... and beyond! Extraordinary work, Cadet!',
      'Star Command acknowledges your brilliant achievement!',
      'Mission accomplished! That was grade-A piloting, Rowan!',
      'Your cognitive thrusters are operating at maximum power!',
      'Laser-sharp precision! You nailed that challenge!',
      'Affirmative! Outstanding navigation, Ranger Rowan!',
    ],
    encouragements: [
      'Hold your thrusters, Cadet! Even the finest space rangers run pre-flight diagnostics twice.',
      'Negative on worry! Recalibrate coordinates and let us give it another launch.',
      'Star Command never gives up, and neither do we, Cadet Rowan!',
      'A stellar attempt! Take a deep breath of cabin oxygen and examine the clues.',
      'Space exploration is built on learning from every trajectory. You have this!',
    ],
    growthNudges: [
      'Every challenge makes our navigational computers stronger!',
      'Infinite possibilities await when you stay curious and keep exploring!',
    ],
    decor: ['🚀', '⭐', '🪐', '☄️'],
  },
  {
    id: 'western',
    name: 'Wild West Roundup',
    emoji: '🤠',
    helper: {
      name: 'Sheriff Woody',
      emoji: '🤠',
      role: 'Town Sheriff & Loyal Trail Partner',
      personality: 'Warm, loyal, honest-to-goodness cowboy partner who will always have Rowan\'s back and reminds Rowan that true friends stick together through every adventure!',
      voiceStyle: { pitch: 1.12, rate: 0.92, kokoroVoice: 'am_george', voiceNamePattern: 'george|oliver|albert|reed|junior|am_george|en-gb|natural' },
    },
    colors: { bg1: '#6f1d1b', bg2: '#99582a', primary: '#ffe400', accent: '#d62828', card: '#fffdf0', text: '#3c1518' },
    collectible: { emoji: '⭐', one: 'sheriff star', many: 'sheriff stars' },
    container: { emoji: '🤠', name: 'leather saddlebag' },
    thief: { emoji: '🦝', name: 'bandit raccoon' },
    pieces: ['🤠', '🐎'],
    mapTitle: "Deputy {name}'s Frontier Town",
    islands: {
      reading: 'Frontier Story Saloon', math: 'Gold Nugget Mine', science: 'Prairie Wildlife Ranch',
      geography: 'Wagon Trail Map Room', art: 'Campfire Craft Tent', games: 'Roundup Rodeo Games',
    },
    islandEmoji: { reading: '📖', math: '🪙', science: '🐎', geography: '🗺️', art: '🎨', games: '🎯' },
    mystery: { name: 'Ghost Canyon Mystery', emoji: '🌵' },
    brain: { name: 'Prospector Puzzle Mine', emoji: '⛏️' },
    missionNames: [
      'The Case of the Missing Gold Star', 'Roundup at Sunset Ridge', 'The Whispering Cactus Code',
      'Secret of Horseshoe Creek', 'Trouble at Coyote Pass', 'The Great Frontier Stampede',
    ],
    stickers: ['🤠', '⭐', '🐎', '🌵', '🏕️', '🪵', '🎸', '🐴', '🪕', '👢', '🪙', '🦝', '🦅', '🌄', '🌻', '🥧'],
    praise: [
      'Reach for the stars, partner! You solved that cleaner than a whistle!',
      'Yee-haw! You are my absolute favorite deputy, Rowan!',
      'Now that is what I call fine frontier thinking!',
      'Hot dog! You figured that out slicker than grease lightning!',
      'You’ve got a true friend in me, and a mighty sharp brain!',
      "Rootin' tootin' brilliant work, Deputy!",
    ],
    encouragements: [
      'Hold your horses, partner! Dust off your boots, take a breath, and let’s look again.',
      'Don’t you fret for a second! Even the best trail guides lose the scent once in a while.',
      'I’ve got your back no matter what, Deputy Rowan. Let’s try it together!',
      'Mighty close, partner! Take another friendly gander at those clues.',
      'Every bump on the trail just makes us wiser riders!',
    ],
    growthNudges: [
      'Patience and practice make the best cowpoke on the range!',
      'No hurry under these wide open skies, Rowan. Take all the trail time you need!',
    ],
    decor: ['🌵', '⭐', '🐎', '🌾'],
  },
  {
    id: 'dino',
    name: 'Prehistoric Pals',
    emoji: '🦖',
    helper: {
      name: 'Rex & Steggy',
      emoji: '🦖',
      role: 'Prehistoric Guide & Fossil Friend',
      personality: 'Lovable, enthusiastic, adorably nervous green T-Rex who is in absolute awe of Rowan\'s bravery and clever thinking!',
      voiceStyle: { pitch: 1.20, rate: 0.96, kokoroVoice: 'am_michael', voiceNamePattern: 'junior|sam|fred|natural' },
    },
    colors: { bg1: '#1b4332', bg2: '#2d6a4f', primary: '#f4a261', accent: '#e76f51', card: '#fefae0', text: '#132a20' },
    collectible: { emoji: '🥚', one: 'dino egg', many: 'dino eggs' },
    container: { emoji: '🌋', name: 'dino nest' },
    thief: { emoji: '🦅', name: 'sneaky pterodactyl' },
    pieces: ['🦖', '🦕'],
    mapTitle: "Explorer {name}'s Dino Valley",
    islands: {
      reading: 'Dino Dig Phonics', math: 'Fossil Quarry Math', science: 'Volcano Creature Lab',
      geography: 'Pangaea Trail Map', art: 'Cave Painting Den', games: 'Jurassic Playground',
    },
    islandEmoji: { reading: '🦴', math: '💎', science: '🌋', geography: '🗺️', art: '🎨', games: '🦕' },
    mystery: { name: 'Amber Cave Mystery', emoji: '🔍' },
    brain: { name: 'Fossil Brain Lab', emoji: '🧩' },
    missionNames: [
      'The Lost Triceratops Horn', 'Secret of the Glowing Amber', 'Riddle of the Roaring Volcano',
      'The Baby Brontosaurus Track', 'Mystery of the Ancient Ferns',
    ],
    stickers: ['🦖', '🦕', '🌋', '🥚', '🦴', '🌿', '🌴', '🪨', '🐾', '🦅', '💎', '🌞', '🪵', '🏕️', '🦎', '⭐'],
    praise: [
      'Roar! I mean... sensational job! You are so brave, Rowan!',
      'Dino-mite! My little T-Rex arms are clapping so hard!',
      'You solved that fossil puzzle like a true master paleontologist!',
      'Incredible thinking! I was worried, but you saved the day!',
      'High four dino claws! You are the smartest explorer in the valley!',
    ],
    encouragements: [
      'Don\'t worry at all! Even a big T-Rex takes small stomps before finding the way.',
      'I\'m right behind you! Let\'s look at those clues together with big dino curiosity.',
      'That was super close! Take a gentle breath, Rowan, you\'ve got this!',
      'Mistakes are just footprints on the path to discovering something amazing!',
      'You inspire me to be brave every single day!',
    ],
    growthNudges: [
      'Every time we try a tough puzzle, our explorer courage doubles!',
      'Take all the time you need! The valley isn\'t going anywhere!',
    ],
    decor: ['🌿', '🌋', '🦴', '🐾'],
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
  'space-ranger': {
    '--tile-bg': 'linear-gradient(180deg,#8e44ad,#27ae60)', '--tile-fg': '#ffffff', '--tile-edge': '#1a5276',
    '--tile-grain': 'linear-gradient(135deg,rgba(255,255,255,.35),rgba(255,255,255,0) 50%)',
    '--panel': 'rgba(11,19,43,.55)', '--wall': '#1c2541', '--floor': '#edf2f4', '--frame': '#38ef7d',
  },
  western: {
    '--tile-bg': 'linear-gradient(180deg,#ffdd53,#f39c12)', '--tile-fg': '#3c1518', '--tile-edge': '#99582a',
    '--tile-grain': 'repeating-linear-gradient(45deg,rgba(153,88,42,.08) 0 6px,rgba(153,88,42,.18) 6px 12px)',
    '--panel': 'rgba(60,21,24,.48)', '--wall': '#6f1d1b', '--floor': '#fff3b0', '--frame': '#ffe400',
  },
  dino: {
    '--tile-bg': 'linear-gradient(180deg,#52b788,#2d6a4f)', '--tile-fg': '#ffffff', '--tile-edge': '#1b4332',
    '--tile-grain': 'linear-gradient(135deg,rgba(255,255,255,.3),rgba(255,255,255,0) 50%)',
    '--panel': 'rgba(19,42,32,.50)', '--wall': '#2d6a4f', '--floor': '#fefae0', '--frame': '#f4a261',
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
