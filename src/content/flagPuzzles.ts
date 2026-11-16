/**
 * Complete the Flag Interactive Puzzle Content Library
 * High-quality world country flags with missing pieces (shapes, stripes, emblems).
 * Designed for young explorers and older kids (ages 4 to 12).
 */

export interface FlagPuzzleChoice {
  id: string;
  text: string;
  emoji: string;
  color?: string;
  correct: boolean;
}

export interface FlagStyleConfig {
  type:
    | 'circle_center'
    | 'stripe_vertical'
    | 'stripe_horizontal'
    | 'canton'
    | 'emblem_center'
    | 'cross_center';
  baseColor?: string;
  stripeColors?: string[];
  missingStripeIndex?: number;
  cantonColor?: string;
  emblemEmoji?: string;
  [key: string]: unknown;
}

export interface FlagPuzzleItem {
  id: string;
  country: string;
  flagEmoji: string;
  continent: string;
  minAge: number;
  maxAge: number;
  question: string;
  say: string;
  flagStyle: FlagStyleConfig;
  colors: string[];
  missingPieceType: 'shape' | 'stripe' | 'emblem';
  missingDescription: string;
  choices: FlagPuzzleChoice[];
  funFact: string;
}

export const FLAG_PUZZLE_LIBRARY: FlagPuzzleItem[] = [
  // 1. Japan (Asia)
  {
    id: 'puzzle_japan',
    country: 'Japan',
    flagEmoji: '🇯🇵',
    continent: 'Asia',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Japan? 🇯🇵',
    say: 'Which piece completes the flag of Japan?',
    flagStyle: {
      type: 'circle_center',
      baseColor: '#ffffff',
      emblemEmoji: '🔴',
    },
    colors: ['#ffffff', '#bc002d'],
    missingPieceType: 'shape',
    missingDescription: 'Red Sun Circle',
    choices: [
      { id: 'c1', text: 'Red Circle', emoji: '🔴', color: '#bc002d', correct: true },
      { id: 'c2', text: 'Blue Star', emoji: '⭐', color: '#002868', correct: false },
      { id: 'c3', text: 'Green Square', emoji: '🟩', color: '#009b3a', correct: false },
      { id: 'c4', text: 'Yellow Sun', emoji: '☀️', color: '#ffd100', correct: false },
    ],
    funFact: 'The red circle on Japan’s flag represents the rising sun, which is why Japan is known as the Land of the Rising Sun!',
  },

  // 2. Canada (North America)
  {
    id: 'puzzle_canada',
    country: 'Canada',
    flagEmoji: '🇨🇦',
    continent: 'North America',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Canada? 🇨🇦',
    say: 'Which piece completes the flag of Canada?',
    flagStyle: {
      type: 'emblem_center',
      stripeColors: ['#d80621', '#ffffff', '#d80621'],
      emblemEmoji: '🍁',
    },
    colors: ['#d80621', '#ffffff'],
    missingPieceType: 'emblem',
    missingDescription: 'Red Maple Leaf',
    choices: [
      { id: 'c1', text: 'Pine Tree', emoji: '🌲', color: '#107c41', correct: false },
      { id: 'c2', text: 'Red Maple Leaf', emoji: '🍁', color: '#d80621', correct: true },
      { id: 'c3', text: 'Snowflake', emoji: '❄️', color: '#00a3e0', correct: false },
      { id: 'c4', text: 'Golden Eagle', emoji: '🦅', color: '#d4af37', correct: false },
    ],
    funFact: 'The red maple leaf in Canada’s flag has 11 sharp points and was officially inaugurated in 1965!',
  },

  // 3. France (Europe)
  {
    id: 'puzzle_france',
    country: 'France',
    flagEmoji: '🇫🇷',
    continent: 'Europe',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of France? 🇫🇷',
    say: 'Which piece completes the flag of France?',
    flagStyle: {
      type: 'stripe_vertical',
      stripeColors: ['#002654', '#ffffff', '#ed2939'],
      missingStripeIndex: 1,
    },
    colors: ['#002654', '#ffffff', '#ed2939'],
    missingPieceType: 'stripe',
    missingDescription: 'White Vertical Center Stripe',
    choices: [
      { id: 'c1', text: 'White Stripe', emoji: '⬜', color: '#ffffff', correct: true },
      { id: 'c2', text: 'Yellow Stripe', emoji: '🟨', color: '#ffd100', correct: false },
      { id: 'c3', text: 'Green Stripe', emoji: '🟩', color: '#009b3a', correct: false },
      { id: 'c4', text: 'Black Stripe', emoji: '⬛', color: '#000000', correct: false },
    ],
    funFact: 'The French Tricolour flag inspired dozens of national flags worldwide with its classic vertical stripes!',
  },

  // 4. United States (North America)
  {
    id: 'puzzle_usa',
    country: 'United States',
    flagEmoji: '🇺🇸',
    continent: 'North America',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of the United States? 🇺🇸',
    say: 'Which piece completes the flag of the United States?',
    flagStyle: {
      type: 'canton',
      cantonColor: '#002868',
      baseColor: '#b22234',
      emblemEmoji: '✨',
    },
    colors: ['#b22234', '#ffffff', '#002868'],
    missingPieceType: 'emblem',
    missingDescription: 'Blue Canton with 50 White Stars',
    choices: [
      { id: 'c1', text: 'Blue Canton with Stars', emoji: '✨', color: '#002868', correct: true },
      { id: 'c2', text: 'Red Crescent', emoji: '🌙', color: '#b22234', correct: false },
      { id: 'c3', text: 'Green Diamond', emoji: '🔷', color: '#009b3a', correct: false },
      { id: 'c4', text: 'Golden Crown', emoji: '👑', color: '#ffd100', correct: false },
    ],
    funFact: 'The 50 stars stand for all 50 US states, and the 13 red and white stripes honor the original colonies!',
  },

  // 5. India (Asia)
  {
    id: 'puzzle_india',
    country: 'India',
    flagEmoji: '🇮🇳',
    continent: 'Asia',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of India? 🇮🇳',
    say: 'Which piece completes the flag of India?',
    flagStyle: {
      type: 'emblem_center',
      stripeColors: ['#ff9933', '#ffffff', '#128807'],
      emblemEmoji: '☸️',
    },
    colors: ['#ff9933', '#ffffff', '#128807', '#000080'],
    missingPieceType: 'emblem',
    missingDescription: 'Navy Blue Ashoka Chakra Wheel',
    choices: [
      { id: 'c1', text: 'Lotus Flower', emoji: '🪷', color: '#ff69b4', correct: false },
      { id: 'c2', text: 'Ashoka Chakra Wheel', emoji: '☸️', color: '#000080', correct: true },
      { id: 'c3', text: 'Golden Lion', emoji: '🦁', color: '#d4af37', correct: false },
      { id: 'c4', text: 'Silver Crescent', emoji: '🌙', color: '#c0c0c0', correct: false },
    ],
    funFact: 'The Ashoka Chakra in India’s flag has 24 spokes representing virtue, dharma, and the 24 hours of the day!',
  },

  // 6. Italy (Europe)
  {
    id: 'puzzle_italy',
    country: 'Italy',
    flagEmoji: '🇮🇹',
    continent: 'Europe',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Italy? 🇮🇹',
    say: 'Which piece completes the flag of Italy?',
    flagStyle: {
      type: 'stripe_vertical',
      stripeColors: ['#009246', '#ffffff', '#ce2b37'],
      missingStripeIndex: 0,
    },
    colors: ['#009246', '#ffffff', '#ce2b37'],
    missingPieceType: 'stripe',
    missingDescription: 'Green Left Vertical Stripe',
    choices: [
      { id: 'c1', text: 'Blue Stripe', emoji: '🟦', color: '#002654', correct: false },
      { id: 'c2', text: 'Green Stripe', emoji: '🟩', color: '#009246', correct: true },
      { id: 'c3', text: 'Yellow Stripe', emoji: '🟨', color: '#ffd100', correct: false },
      { id: 'c4', text: 'Purple Stripe', emoji: '🟪', color: '#800080', correct: false },
    ],
    funFact: 'The Italian tricolour flag is celebrated on Festa del Tricolore every January 7th!',
  },

  // 7. Brazil (South America)
  {
    id: 'puzzle_brazil',
    country: 'Brazil',
    flagEmoji: '🇧🇷',
    continent: 'South America',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Brazil? 🇧🇷',
    say: 'Which piece completes the flag of Brazil?',
    flagStyle: {
      type: 'emblem_center',
      baseColor: '#009b3a',
      stripeColors: ['#009b3a', '#fedf00', '#002776'],
      emblemEmoji: '🌐',
    },
    colors: ['#009b3a', '#fedf00', '#002776', '#ffffff'],
    missingPieceType: 'emblem',
    missingDescription: 'Blue Starry Globe with Banner',
    choices: [
      { id: 'c1', text: 'Blue Globe with Stars', emoji: '🌐', color: '#002776', correct: true },
      { id: 'c2', text: 'Red Heart', emoji: '❤️', color: '#ff0000', correct: false },
      { id: 'c3', text: 'Green Toucan', emoji: '🦜', color: '#009b3a', correct: false },
      { id: 'c4', text: 'Yellow Sunburst', emoji: '☀️', color: '#ffd100', correct: false },
    ],
    funFact: 'The stars on Brazil’s blue globe match the exact constellations over Rio de Janeiro on November 15, 1889!',
  },

  // 8. Argentina (South America)
  {
    id: 'puzzle_argentina',
    country: 'Argentina',
    flagEmoji: '🇦🇷',
    continent: 'South America',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Argentina? 🇦🇷',
    say: 'Which piece completes the flag of Argentina?',
    flagStyle: {
      type: 'emblem_center',
      stripeColors: ['#74acdf', '#ffffff', '#74acdf'],
      emblemEmoji: '🌞',
    },
    colors: ['#74acdf', '#ffffff', '#f6b40e'],
    missingPieceType: 'emblem',
    missingDescription: 'Golden Sun of May',
    choices: [
      { id: 'c1', text: 'Silver Moon', emoji: '🌙', color: '#c0c0c0', correct: false },
      { id: 'c2', text: 'Golden Sun with Face', emoji: '🌞', color: '#f6b40e', correct: true },
      { id: 'c3', text: 'Blue Anchor', emoji: '⚓', color: '#002868', correct: false },
      { id: 'c4', text: 'Red Cross', emoji: '❌', color: '#ff0000', correct: false },
    ],
    funFact: 'The Sun of May in Argentina’s flag has 32 rays of sunlight: 16 straight beams alternating with 16 wavy ones!',
  },

  // 9. Germany (Europe)
  {
    id: 'puzzle_germany',
    country: 'Germany',
    flagEmoji: '🇩🇪',
    continent: 'Europe',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Germany? 🇩🇪',
    say: 'Which piece completes the flag of Germany?',
    flagStyle: {
      type: 'stripe_horizontal',
      stripeColors: ['#000000', '#dd0000', '#ffce00'],
      missingStripeIndex: 2,
    },
    colors: ['#000000', '#dd0000', '#ffce00'],
    missingPieceType: 'stripe',
    missingDescription: 'Golden Yellow Bottom Stripe',
    choices: [
      { id: 'c1', text: 'White Stripe', emoji: '⬜', color: '#ffffff', correct: false },
      { id: 'c2', text: 'Golden Yellow Stripe', emoji: '🟨', color: '#ffce00', correct: true },
      { id: 'c3', text: 'Blue Stripe', emoji: '🟦', color: '#002654', correct: false },
      { id: 'c4', text: 'Green Stripe', emoji: '🟩', color: '#009246', correct: false },
    ],
    funFact: 'The colors of Germany’s flag date back to volunteer soldiers known as the Lützow Free Corps in the 1800s!',
  },

  // 10. Greece (Europe)
  {
    id: 'puzzle_greece',
    country: 'Greece',
    flagEmoji: '🇬🇷',
    continent: 'Europe',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Greece? 🇬🇷',
    say: 'Which piece completes the flag of Greece?',
    flagStyle: {
      type: 'canton',
      baseColor: '#0d5eaf',
      cantonColor: '#0d5eaf',
      emblemEmoji: '➕',
    },
    colors: ['#0d5eaf', '#ffffff'],
    missingPieceType: 'shape',
    missingDescription: 'White Cross in Top-Left Canton',
    choices: [
      { id: 'c1', text: 'White Cross', emoji: '➕', color: '#ffffff', correct: true },
      { id: 'c2', text: 'Golden Star', emoji: '⭐', color: '#ffd100', correct: false },
      { id: 'c3', text: 'Olive Branch', emoji: '🫒', color: '#556b2f', correct: false },
      { id: 'c4', text: 'Anchor', emoji: '⚓', color: '#002868', correct: false },
    ],
    funFact: 'The 9 blue-and-white horizontal stripes correspond to the 9 syllables of the Greek motto for freedom!',
  },

  // 11. Mexico (North America)
  {
    id: 'puzzle_mexico',
    country: 'Mexico',
    flagEmoji: '🇲🇽',
    continent: 'North America',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Mexico? 🇲🇽',
    say: 'Which piece completes the flag of Mexico?',
    flagStyle: {
      type: 'emblem_center',
      stripeColors: ['#006847', '#ffffff', '#ce1126'],
      emblemEmoji: '🦅',
    },
    colors: ['#006847', '#ffffff', '#ce1126'],
    missingPieceType: 'emblem',
    missingDescription: 'Golden Eagle on a Prickly Pear Cactus',
    choices: [
      { id: 'c1', text: 'Spotted Jaguar', emoji: '🐆', color: '#d4af37', correct: false },
      { id: 'c2', text: 'Eagle on Cactus', emoji: '🦅', color: '#8b4513', correct: true },
      { id: 'c3', text: 'Sun Emblem', emoji: '☀️', color: '#ffd100', correct: false },
      { id: 'c4', text: 'Ancient Pyramid', emoji: '🏛️', color: '#cd853f', correct: false },
    ],
    funFact: 'The coat of arms depicts the Aztec legend where gods told them to build their city where an eagle perches on a cactus!',
  },

  // 12. South Korea (Asia)
  {
    id: 'puzzle_south_korea',
    country: 'South Korea',
    flagEmoji: '🇰🇷',
    continent: 'Asia',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of South Korea? 🇰🇷',
    say: 'Which piece completes the flag of South Korea?',
    flagStyle: {
      type: 'circle_center',
      baseColor: '#ffffff',
      emblemEmoji: '☯️',
    },
    colors: ['#ffffff', '#cd2e3a', '#0047a0', '#000000'],
    missingPieceType: 'shape',
    missingDescription: 'Red and Blue Taegeuk Circle',
    choices: [
      { id: 'c1', text: 'Red & Blue Taegeuk', emoji: '☯️', color: '#cd2e3a', correct: true },
      { id: 'c2', text: 'Golden Dragon', emoji: '🐉', color: '#ffd100', correct: false },
      { id: 'c3', text: 'Cherry Blossom', emoji: '🌸', color: '#ffb7c5', correct: false },
      { id: 'c4', text: 'Black Star', emoji: '⭐', color: '#000000', correct: false },
    ],
    funFact: 'The red and blue Taegeuk circle symbolizes the harmony of cosmic forces, with 4 black trigrams in the corners!',
  },

  // 13. Egypt (Africa)
  {
    id: 'puzzle_egypt',
    country: 'Egypt',
    flagEmoji: '🇪🇬',
    continent: 'Africa',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Egypt? 🇪🇬',
    say: 'Which piece completes the flag of Egypt?',
    flagStyle: {
      type: 'emblem_center',
      stripeColors: ['#ce1126', '#ffffff', '#000000'],
      emblemEmoji: '🦅',
    },
    colors: ['#ce1126', '#ffffff', '#000000', '#c09300'],
    missingPieceType: 'emblem',
    missingDescription: 'Golden Eagle of Saladin',
    choices: [
      { id: 'c1', text: 'Golden Eagle of Saladin', emoji: '🦅', color: '#c09300', correct: true },
      { id: 'c2', text: 'Great Sphinx', emoji: '🗿', color: '#d2b48c', correct: false },
      { id: 'c3', text: 'Golden Pyramid', emoji: '🔺', color: '#e6c280', correct: false },
      { id: 'c4', text: 'Scarab Beetle', emoji: '🪲', color: '#2e8b57', correct: false },
    ],
    funFact: 'The Eagle of Saladin in Egypt’s center carries a golden shield and holds a scroll written in Arabic!',
  },

  // 14. Switzerland (Europe)
  {
    id: 'puzzle_switzerland',
    country: 'Switzerland',
    flagEmoji: '🇨🇭',
    continent: 'Europe',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Switzerland? 🇨🇭',
    say: 'Which piece completes the flag of Switzerland?',
    flagStyle: {
      type: 'cross_center',
      baseColor: '#d52b1e',
      emblemEmoji: '➕',
    },
    colors: ['#d52b1e', '#ffffff'],
    missingPieceType: 'shape',
    missingDescription: 'Bold White Greek Cross',
    choices: [
      { id: 'c1', text: 'White Greek Cross', emoji: '➕', color: '#ffffff', correct: true },
      { id: 'c2', text: 'Yellow Star', emoji: '⭐', color: '#ffd100', correct: false },
      { id: 'c3', text: 'Snowy Peak', emoji: '🏔️', color: '#ffffff', correct: false },
      { id: 'c4', text: 'Swiss Bell', emoji: '🔔', color: '#d4af37', correct: false },
    ],
    funFact: 'Switzerland is one of only two countries with a square flag! The other is Vatican City.',
  },

  // 15. Australia (Oceania)
  {
    id: 'puzzle_australia',
    country: 'Australia',
    flagEmoji: '🇦🇺',
    continent: 'Oceania',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Australia? 🇦🇺',
    say: 'Which piece completes the flag of Australia?',
    flagStyle: {
      type: 'canton',
      baseColor: '#00008b',
      cantonColor: '#00008b',
      emblemEmoji: '🇬🇧',
    },
    colors: ['#00008b', '#ffffff', '#ff0000'],
    missingPieceType: 'emblem',
    missingDescription: 'Union Jack in Top-Left Canton',
    choices: [
      { id: 'c1', text: 'Union Jack Canton', emoji: '🇬🇧', color: '#00247d', correct: true },
      { id: 'c2', text: 'Kangaroo Emblem', emoji: '🦘', color: '#cd853f', correct: false },
      { id: 'c3', text: 'Boomerang', emoji: '🪃', color: '#8b4513', correct: false },
      { id: 'c4', text: 'Koala Face', emoji: '🐨', color: '#808080', correct: false },
    ],
    funFact: 'The flag features the Southern Cross constellation, five brilliant stars only visible in the southern sky!',
  },

  // 16. United Kingdom (Europe)
  {
    id: 'puzzle_uk',
    country: 'United Kingdom',
    flagEmoji: '🇬🇧',
    continent: 'Europe',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of the United Kingdom? 🇬🇧',
    say: 'Which piece completes the flag of the United Kingdom?',
    flagStyle: {
      type: 'cross_center',
      baseColor: '#00247d',
      emblemEmoji: '➕',
    },
    colors: ['#00247d', '#cf142b', '#ffffff'],
    missingPieceType: 'shape',
    missingDescription: 'Red Cross of St. George',
    choices: [
      { id: 'c1', text: 'Red Cross of St. George', emoji: '➕', color: '#cf142b', correct: true },
      { id: 'c2', text: 'Golden Lion', emoji: '🦁', color: '#d4af37', correct: false },
      { id: 'c3', text: 'Royal Crown', emoji: '👑', color: '#ffd100', correct: false },
      { id: 'c4', text: 'Green Shamrock', emoji: '☘️', color: '#009246', correct: false },
    ],
    funFact: 'The Union Flag unites three crosses: St. George of England, St. Andrew of Scotland, and St. Patrick of Ireland!',
  },

  // 17. China (Asia)
  {
    id: 'puzzle_china',
    country: 'China',
    flagEmoji: '🇨🇳',
    continent: 'Asia',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of China? 🇨🇳',
    say: 'Which piece completes the flag of China?',
    flagStyle: {
      type: 'canton',
      baseColor: '#de2910',
      cantonColor: '#de2910',
      emblemEmoji: '⭐',
    },
    colors: ['#de2910', '#ffde00'],
    missingPieceType: 'shape',
    missingDescription: 'Five Golden Yellow Stars',
    choices: [
      { id: 'c1', text: 'Five Golden Stars', emoji: '⭐', color: '#ffde00', correct: true },
      { id: 'c2', text: 'Golden Dragon', emoji: '🐉', color: '#ffd100', correct: false },
      { id: 'c3', text: 'Panda Face', emoji: '🐼', color: '#000000', correct: false },
      { id: 'c4', text: 'Red Lantern', emoji: '🏮', color: '#de2910', correct: false },
    ],
    funFact: 'The big central star represents unity, while the four smaller stars arc gracefully around it!',
  },

  // 18. Sweden (Europe)
  {
    id: 'puzzle_sweden',
    country: 'Sweden',
    flagEmoji: '🇸🇪',
    continent: 'Europe',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Sweden? 🇸🇪',
    say: 'Which piece completes the flag of Sweden?',
    flagStyle: {
      type: 'cross_center',
      baseColor: '#006aa7',
      emblemEmoji: '✝️',
    },
    colors: ['#006aa7', '#fecc00'],
    missingPieceType: 'shape',
    missingDescription: 'Yellow Nordic Cross',
    choices: [
      { id: 'c1', text: 'Yellow Nordic Cross', emoji: '✝️', color: '#fecc00', correct: true },
      { id: 'c2', text: 'White Snowflake', emoji: '❄️', color: '#ffffff', correct: false },
      { id: 'c3', text: 'Viking Shield', emoji: '🛡️', color: '#8b4513', correct: false },
      { id: 'c4', text: 'Blue Ocean Wave', emoji: '🌊', color: '#00247d', correct: false },
    ],
    funFact: 'Sweden’s Nordic cross flag dates all the way back to King Gustav Vasa in the 16th century!',
  },

  // 19. Jamaica (North America)
  {
    id: 'puzzle_jamaica',
    country: 'Jamaica',
    flagEmoji: '🇯🇲',
    continent: 'North America',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Jamaica? 🇯🇲',
    say: 'Which piece completes the flag of Jamaica?',
    flagStyle: {
      type: 'cross_center',
      baseColor: '#000000',
      emblemEmoji: '✖️',
    },
    colors: ['#fed100', '#009b3a', '#000000'],
    missingPieceType: 'shape',
    missingDescription: 'Golden Yellow Diagonal Saltire Cross',
    choices: [
      { id: 'c1', text: 'Golden Saltire Cross', emoji: '✖️', color: '#fed100', correct: true },
      { id: 'c2', text: 'Tropical Palm', emoji: '🌴', color: '#009b3a', correct: false },
      { id: 'c3', text: 'Doctor Bird', emoji: '🐦', color: '#1e90ff', correct: false },
      { id: 'c4', text: 'Red Sun Circle', emoji: '🔴', color: '#ff0000', correct: false },
    ],
    funFact: 'Jamaica’s flag is the only current national flag that has no red, white, or blue in its design!',
  },

  // 20. Kenya (Africa)
  {
    id: 'puzzle_kenya',
    country: 'Kenya',
    flagEmoji: '🇰🇪',
    continent: 'Africa',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Kenya? 🇰🇪',
    say: 'Which piece completes the flag of Kenya?',
    flagStyle: {
      type: 'emblem_center',
      stripeColors: ['#000000', '#bb0000', '#006600'],
      emblemEmoji: '🛡️',
    },
    colors: ['#000000', '#bb0000', '#006600', '#ffffff'],
    missingPieceType: 'emblem',
    missingDescription: 'Traditional Maasai Shield and Crossed Spears',
    choices: [
      { id: 'c1', text: 'Savanna Lion', emoji: '🦁', color: '#d4af37', correct: false },
      { id: 'c2', text: 'Maasai Shield & Spears', emoji: '🛡️', color: '#bb0000', correct: true },
      { id: 'c3', text: 'African Elephant', emoji: '🐘', color: '#808080', correct: false },
      { id: 'c4', text: 'Acacia Tree', emoji: '🌳', color: '#006600', correct: false },
    ],
    funFact: 'The Maasai shield and two spears in the center symbolize the willingness to protect national freedom!',
  },

  // 21. South Africa (Africa)
  {
    id: 'puzzle_south_africa',
    country: 'South Africa',
    flagEmoji: '🇿🇦',
    continent: 'Africa',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of South Africa? 🇿🇦',
    say: 'Which piece completes the flag of South Africa?',
    flagStyle: {
      type: 'emblem_center',
      baseColor: '#007a4d',
      stripeColors: ['#de3831', '#007a4d', '#002395'],
      emblemEmoji: '✳️',
    },
    colors: ['#007a4d', '#000000', '#ffb612', '#de3831', '#002395', '#ffffff'],
    missingPieceType: 'shape',
    missingDescription: 'Green Y-Shaped Horizontal Pall',
    choices: [
      { id: 'c1', text: 'Green Y-Shape Band', emoji: '✳️', color: '#007a4d', correct: true },
      { id: 'c2', text: 'Rhino Horn', emoji: '🦏', color: '#808080', correct: false },
      { id: 'c3', text: 'Yellow Diamond', emoji: '🔷', color: '#ffb612', correct: false },
      { id: 'c4', text: 'Protea Blossom', emoji: '🌺', color: '#de3831', correct: false },
    ],
    funFact: 'The flowing Y-shape on South Africa’s flag symbolizes the union of diverse peoples into one shared forward path!',
  },

  // 22. Ireland (Europe)
  {
    id: 'puzzle_ireland',
    country: 'Ireland',
    flagEmoji: '🇮🇪',
    continent: 'Europe',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Ireland? 🇮🇪',
    say: 'Which piece completes the flag of Ireland?',
    flagStyle: {
      type: 'stripe_vertical',
      stripeColors: ['#169b62', '#ffffff', '#ff883e'],
      missingStripeIndex: 2,
    },
    colors: ['#169b62', '#ffffff', '#ff883e'],
    missingPieceType: 'stripe',
    missingDescription: 'Orange Right Vertical Stripe',
    choices: [
      { id: 'c1', text: 'Orange Stripe', emoji: '🟧', color: '#ff883e', correct: true },
      { id: 'c2', text: 'Red Stripe', emoji: '🟥', color: '#ce2b37', correct: false },
      { id: 'c3', text: 'Yellow Stripe', emoji: '🟨', color: '#ffd100', correct: false },
      { id: 'c4', text: 'Blue Stripe', emoji: '🟦', color: '#002654', correct: false },
    ],
    funFact: 'Green represents Irish traditions, orange represents Williamite heritage, and white in the center represents everlasting peace!',
  },

  // 23. Norway (Europe)
  {
    id: 'puzzle_norway',
    country: 'Norway',
    flagEmoji: '🇳🇴',
    continent: 'Europe',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Norway? 🇳🇴',
    say: 'Which piece completes the flag of Norway?',
    flagStyle: {
      type: 'cross_center',
      baseColor: '#ba0c2f',
      emblemEmoji: '✝️',
    },
    colors: ['#ba0c2f', '#ffffff', '#00205b'],
    missingPieceType: 'shape',
    missingDescription: 'Dark Blue Nordic Cross with White Trim',
    choices: [
      { id: 'c1', text: 'Blue Cross with White Trim', emoji: '✝️', color: '#00205b', correct: true },
      { id: 'c2', text: 'Golden Sun', emoji: '☀️', color: '#ffd100', correct: false },
      { id: 'c3', text: 'Viking Longship', emoji: '⛵', color: '#8b4513', correct: false },
      { id: 'c4', text: 'Polar Bear', emoji: '🐻‍❄️', color: '#ffffff', correct: false },
    ],
    funFact: 'Norway’s flag is nicknamed the "Mother of Flags" because you can find the flags of France, the Netherlands, and Indonesia inside it!',
  },

  // 24. Peru (South America)
  {
    id: 'puzzle_peru',
    country: 'Peru',
    flagEmoji: '🇵🇪',
    continent: 'South America',
    minAge: 4,
    maxAge: 12,
    question: 'Which piece completes the flag of Peru? 🇵🇪',
    say: 'Which piece completes the flag of Peru?',
    flagStyle: {
      type: 'stripe_vertical',
      stripeColors: ['#d91023', '#ffffff', '#d91023'],
      missingStripeIndex: 1,
    },
    colors: ['#d91023', '#ffffff'],
    missingPieceType: 'stripe',
    missingDescription: 'White Vertical Center Stripe',
    choices: [
      { id: 'c1', text: 'White Center Stripe', emoji: '⬜', color: '#ffffff', correct: true },
      { id: 'c2', text: 'Llama Figure', emoji: '🦙', color: '#8b4513', correct: false },
      { id: 'c3', text: 'Golden Incan Sun', emoji: '☀️', color: '#f6b40e', correct: false },
      { id: 'c4', text: 'Green Mountain Peak', emoji: '⛰️', color: '#009b3a', correct: false },
    ],
    funFact: 'The red and white colors were reportedly inspired by a flock of parihuanas (vibrant red-winged flamingos) soaring into the blue sky!',
  },
];
