/**
 * Geography & World Map Quest Content
 * Continents, oceans, landmarks, wildlife, and map coordinates designed for young learners.
 */

export interface ContinentDef {
  id: string;
  name: string;
  color: string;
  glowColor: string;
  center: { x: number; y: number };
  pin: { x: number; y: number };
  path: string;
  icon: string;
  animals: string[];
  landmarks: string[];
  funFact: string;
}

export interface OceanDef {
  id: string;
  name: string;
  center: { x: number; y: number };
  funFact: string;
}

export interface GeoQuestion {
  id: string;
  category: 'continents' | 'landmarks' | 'animals' | 'oceans';
  icon: string;
  clueEmoji: string;
  clueTitle: string;
  question: string;
  say?: string;
  targetContinentId?: string;
  targetOceanId?: string;
  choices: { id: string; text: string; emoji: string; correct: boolean }[];
  funFact: string;
}

export const CONTINENTS: Record<string, ContinentDef> = {
  na: {
    id: 'na',
    name: 'North America',
    color: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.75)',
    center: { x: 210, y: 140 },
    pin: { x: 200, y: 150 },
    // Stylized continent contour for 1000x520 world projection
    path: 'M 70,70 L 140,55 L 210,50 L 310,65 L 340,110 L 300,150 L 310,180 L 260,250 L 230,270 L 210,230 L 160,200 L 120,170 L 60,110 Z',
    icon: '🗽',
    animals: ['Bald Eagle 🦅', 'Grizzly Bear 🐻', 'American Bison 🦬'],
    landmarks: ['Statue of Liberty 🗽', 'Grand Canyon 🏜️', 'Niagara Falls 🌊'],
    funFact: 'North America has every kind of climate on Earth, from frozen snowy tundra to warm sunny beaches!',
  },
  sa: {
    id: 'sa',
    name: 'South America',
    color: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.75)',
    center: { x: 300, y: 350 },
    pin: { x: 295, y: 340 },
    path: 'M 240,270 L 310,275 L 360,310 L 370,360 L 330,420 L 290,460 L 270,440 L 265,360 L 245,310 Z',
    icon: '🦜',
    animals: ['Rainbow Toucan 🦜', 'Jaguar 🐆', 'Fluffy Llama 🦙'],
    landmarks: ['Amazon Rainforest 🌿', 'Machu Picchu 🏔️', 'Amazon River 🐊'],
    funFact: 'South America is home to the Amazon Rainforest, which produces 20% of all the fresh air on planet Earth!',
  },
  eu: {
    id: 'eu',
    name: 'Europe',
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.75)',
    center: { x: 510, y: 130 },
    pin: { x: 510, y: 135 },
    path: 'M 460,140 L 480,95 L 530,90 L 560,120 L 560,170 L 520,185 L 480,180 L 460,155 Z',
    icon: '🗼',
    animals: ['Reindeer 🦌', 'Barn Owl 🦉', 'Red Fox 🦊'],
    landmarks: ['Eiffel Tower 🗼', 'Ancient Colosseum 🏛️', 'Big Ben Clock 🕰️'],
    funFact: 'Europe is home to thousands of historic fairy tale castles—Germany alone has over 20,000 of them!',
  },
  af: {
    id: 'af',
    name: 'Africa',
    color: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.75)',
    center: { x: 525, y: 290 },
    pin: { x: 530, y: 280 },
    path: 'M 465,195 L 555,190 L 595,245 L 575,320 L 545,410 L 495,380 L 470,300 L 440,245 Z',
    icon: '🦁',
    animals: ['Mighty Lion 🦁', 'Tall Giraffe 🦒', 'African Elephant 🐘'],
    landmarks: ['Pyramids of Giza 🔺', 'Sahara Desert 🏜️', 'Mount Kilimanjaro 🏔️'],
    funFact: 'Africa is the second-largest continent and home to the longest river in the whole world, the Nile River!',
  },
  as: {
    id: 'as',
    name: 'Asia',
    color: '#f87171',
    glowColor: 'rgba(248, 113, 113, 0.75)',
    center: { x: 730, y: 160 },
    pin: { x: 740, y: 160 },
    path: 'M 565,95 L 750,60 L 890,85 L 890,170 L 820,230 L 760,280 L 680,260 L 640,210 L 570,180 Z',
    icon: '🐼',
    animals: ['Giant Panda 🐼', 'Bengal Tiger 🐅', 'Snow Leopard 🐆'],
    landmarks: ['Great Wall of China 🧱', 'Mount Everest 🏔️', 'Taj Mahal 🛕'],
    funFact: 'Asia is the biggest continent on planet Earth and is home to Mount Everest, the tallest mountain in the world!',
  },
  au: {
    id: 'au',
    name: 'Australia',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.75)',
    center: { x: 840, y: 370 },
    pin: { x: 835, y: 365 },
    path: 'M 780,335 L 870,325 L 895,370 L 860,425 L 795,410 L 770,365 Z',
    icon: '🦘',
    animals: ['Hopping Kangaroo 🦘', 'Sleepy Koala 🐨', 'Duck-billed Platypus 🦆'],
    landmarks: ['Sydney Opera House 🎭', 'Great Barrier Reef 🪸', 'Uluru Red Rock 🪨'],
    funFact: 'Australia is the only continent on Earth that is completely surrounded by ocean and is also an entire country!',
  },
  an: {
    id: 'an',
    name: 'Antarctica',
    color: '#e0f2fe',
    glowColor: 'rgba(224, 242, 254, 0.85)',
    center: { x: 500, y: 490 },
    pin: { x: 500, y: 485 },
    path: 'M 140,480 L 320,470 L 500,465 L 680,470 L 860,480 L 880,510 L 120,510 Z',
    icon: '🐧',
    animals: ['Emperor Penguin 🐧', 'Weddell Seal 🦭', 'Giant Blue Whale 🐋'],
    landmarks: ['The South Pole 📍', 'Giant Ice Shelves 🧊', 'Active Ice Volcanoes 🌋'],
    funFact: 'Antarctica is at the very bottom of the world—it is the coldest, windiest place on Earth, covered in miles of ice!',
  },
};

export const OCEANS: Record<string, OceanDef> = {
  pacific: {
    id: 'pacific',
    name: 'Pacific Ocean',
    center: { x: 100, y: 280 },
    funFact: 'The Pacific Ocean is the biggest ocean on Earth—it is so huge that all the continents could fit inside it!',
  },
  atlantic: {
    id: 'atlantic',
    name: 'Atlantic Ocean',
    center: { x: 410, y: 270 },
    funFact: 'The Atlantic Ocean separates North and South America from Europe and Africa!',
  },
  indian: {
    id: 'indian',
    name: 'Indian Ocean',
    center: { x: 680, y: 360 },
    funFact: 'The Indian Ocean is the warmest ocean on Earth, filled with tropical islands and sea turtles!',
  },
  arctic: {
    id: 'arctic',
    name: 'Arctic Ocean',
    center: { x: 500, y: 35 },
    funFact: 'The Arctic Ocean is at the very top of the world around the North Pole, where polar bears hunt on sea ice!',
  },
  southern: {
    id: 'southern',
    name: 'Southern Ocean',
    center: { x: 500, y: 450 },
    funFact: 'The Southern Ocean circles all the way around icy Antarctica and is home to playful whales and penguins!',
  },
};

export const GEO_QUESTIONS: GeoQuestion[] = [
  // --- Continents & Map Exploration ---
  {
    id: 'geo_c_africa',
    category: 'continents',
    icon: '🌍',
    clueEmoji: '🦁',
    clueTitle: 'Continent Quest',
    question: 'Which continent is home to lions, giraffes, and the giant Sahara Desert?',
    targetContinentId: 'af',
    choices: [
      { id: 'af', text: 'Africa', emoji: '🦁', correct: true },
      { id: 'eu', text: 'Europe', emoji: '🏰', correct: false },
      { id: 'an', text: 'Antarctica', emoji: '❄️', correct: false },
    ],
    funFact: 'Africa has 54 countries and is home to the mighty Nile River and majestic Serengeti wildlife!',
  },
  {
    id: 'geo_c_antarctica',
    category: 'continents',
    icon: '❄️',
    clueEmoji: '🐧',
    clueTitle: 'Ice & Snow',
    question: 'Which frozen continent sits at the very bottom of the world and is covered in thick ice?',
    targetContinentId: 'an',
    choices: [
      { id: 'an', text: 'Antarctica', emoji: '🐧', correct: true },
      { id: 'au', text: 'Australia', emoji: '🦘', correct: false },
      { id: 'sa', text: 'South America', emoji: '🦜', correct: false },
    ],
    funFact: 'Antarctica has 90% of the world’s ice! Even though it is super cold, millions of penguins thrive there!',
  },
  {
    id: 'geo_c_australia',
    category: 'continents',
    icon: '🦘',
    clueEmoji: '🦘',
    clueTitle: 'Down Under',
    question: 'Which continent is famous for hopping kangaroos, koalas, and coral reefs?',
    targetContinentId: 'au',
    choices: [
      { id: 'au', text: 'Australia', emoji: '🦘', correct: true },
      { id: 'as', text: 'Asia', emoji: '🐼', correct: false },
      { id: 'na', text: 'North America', emoji: '🦅', correct: false },
    ],
    funFact: 'Australia is surrounded entirely by oceans and has the world-famous Great Barrier Reef!',
  },
  {
    id: 'geo_c_na',
    category: 'continents',
    icon: '🗽',
    clueEmoji: '🦅',
    clueTitle: 'Big Lands',
    question: 'Which continent is home to the United States, Canada, Mexico, and the Grand Canyon?',
    targetContinentId: 'na',
    choices: [
      { id: 'na', text: 'North America', emoji: '🗽', correct: true },
      { id: 'sa', text: 'South America', emoji: '🦜', correct: false },
      { id: 'eu', text: 'Europe', emoji: '🏰', correct: false },
    ],
    funFact: 'North America stretches from the icy Arctic tundra all the way down to warm tropical coral seas!',
  },
  {
    id: 'geo_c_sa',
    category: 'continents',
    icon: '🦜',
    clueEmoji: '🌿',
    clueTitle: 'Lush Rainforests',
    question: 'Which continent is home to the giant Amazon Rainforest and colorful toucans?',
    targetContinentId: 'sa',
    choices: [
      { id: 'sa', text: 'South America', emoji: '🦜', correct: true },
      { id: 'af', text: 'Africa', emoji: '🦁', correct: false },
      { id: 'as', text: 'Asia', emoji: '🐼', correct: false },
    ],
    funFact: 'The Amazon River in South America carries more fresh water than the next seven largest rivers combined!',
  },
  {
    id: 'geo_c_asia',
    category: 'continents',
    icon: '🐼',
    clueEmoji: '🏔️',
    clueTitle: 'Giant Continent',
    question: 'Which continent is the biggest in the world and home to Mount Everest and giant pandas?',
    targetContinentId: 'as',
    choices: [
      { id: 'as', text: 'Asia', emoji: '🐼', correct: true },
      { id: 'eu', text: 'Europe', emoji: '🏰', correct: false },
      { id: 'au', text: 'Australia', emoji: '🦘', correct: false },
    ],
    funFact: 'Asia is home to more than half of all the people on Earth and the world’s tallest mountain range, the Himalayas!',
  },
  {
    id: 'geo_c_europe',
    category: 'continents',
    icon: '🏰',
    clueEmoji: '🗼',
    clueTitle: 'Castles & Towers',
    question: 'Which continent is home to the Eiffel Tower, Big Ben, and historic fairytale castles?',
    targetContinentId: 'eu',
    choices: [
      { id: 'eu', text: 'Europe', emoji: '🏰', correct: true },
      { id: 'af', text: 'Africa', emoji: '🦁', correct: false },
      { id: 'na', text: 'North America', emoji: '🗽', correct: false },
    ],
    funFact: 'Europe has over 40 countries, each with their own unique languages, foods, and ancient castles!',
  },

  // --- Landmarks & Monuments ---
  {
    id: 'geo_lm_pyramids',
    category: 'landmarks',
    icon: '🔺',
    clueEmoji: '🔺',
    clueTitle: 'Ancient Wonder',
    question: 'Where in the world will you find the ancient Great Pyramids of Giza?',
    targetContinentId: 'af',
    choices: [
      { id: 'af', text: 'Africa (Egypt)', emoji: '🔺', correct: true },
      { id: 'as', text: 'Asia', emoji: '🛕', correct: false },
      { id: 'sa', text: 'South America', emoji: '🦜', correct: false },
    ],
    funFact: 'The Great Pyramid of Giza was built thousands of years ago with over two million massive stone blocks!',
  },
  {
    id: 'geo_lm_eiffel',
    category: 'landmarks',
    icon: '🗼',
    clueEmoji: '🗼',
    clueTitle: 'Iron Tower',
    question: 'On which continent stands the famous iron Eiffel Tower in the city of Paris?',
    targetContinentId: 'eu',
    choices: [
      { id: 'eu', text: 'Europe (France)', emoji: '🗼', correct: true },
      { id: 'na', text: 'North America', emoji: '🗽', correct: false },
      { id: 'au', text: 'Australia', emoji: '🦘', correct: false },
    ],
    funFact: 'The Eiffel Tower sparkles with 20,000 golden lights every single evening!',
  },
  {
    id: 'geo_lm_great_wall',
    category: 'landmarks',
    icon: '🧱',
    clueEmoji: '🧱',
    clueTitle: 'Ancient Wall',
    question: 'Which continent is home to the winding Great Wall that stretches across mountains?',
    targetContinentId: 'as',
    choices: [
      { id: 'as', text: 'Asia (China)', emoji: '🧱', correct: true },
      { id: 'eu', text: 'Europe', emoji: '🏰', correct: false },
      { id: 'af', text: 'Africa', emoji: '🦁', correct: false },
    ],
    funFact: 'The Great Wall of China is over 13,000 miles long—longer than the distance from the North Pole to the South Pole!',
  },
  {
    id: 'geo_lm_liberty',
    category: 'landmarks',
    icon: '🗽',
    clueEmoji: '🗽',
    clueTitle: 'Green Statue',
    question: 'Where will you find the Statue of Liberty greeting ships in New York Harbor?',
    targetContinentId: 'na',
    choices: [
      { id: 'na', text: 'North America (USA)', emoji: '🗽', correct: true },
      { id: 'sa', text: 'South America', emoji: '🦜', correct: false },
      { id: 'au', text: 'Australia', emoji: '🦘', correct: false },
    ],
    funFact: 'The Statue of Liberty is made of copper, like a shiny penny! Rain and air turned her statue green over time!',
  },
  {
    id: 'geo_lm_opera',
    category: 'landmarks',
    icon: '🎭',
    clueEmoji: '⛵',
    clueTitle: 'Harbor Sails',
    question: 'Which continent has the famous Sydney Opera House shaped like giant white ship sails?',
    targetContinentId: 'au',
    choices: [
      { id: 'au', text: 'Australia', emoji: '🎭', correct: true },
      { id: 'an', text: 'Antarctica', emoji: '❄️', correct: false },
      { id: 'eu', text: 'Europe', emoji: '🏰', correct: false },
    ],
    funFact: 'The roof of the Sydney Opera House is covered in over one million white Swedish ceramic tiles!',
  },
  {
    id: 'geo_lm_machu_picchu',
    category: 'landmarks',
    icon: '🏔️',
    clueEmoji: '🦙',
    clueTitle: 'City in the Clouds',
    question: 'High in the Andes Mountains of South America, which ancient stone city sits among the clouds?',
    targetContinentId: 'sa',
    choices: [
      { id: 'sa', text: 'South America (Peru)', emoji: '🏔️', correct: true },
      { id: 'na', text: 'North America', emoji: '🏜️', correct: false },
      { id: 'af', text: 'Africa', emoji: '🔺', correct: false },
    ],
    funFact: 'Machu Picchu was built by the Inca people high in the mountains without wheels or iron tools!',
  },

  // --- Wildlife & Animal Habitats ---
  {
    id: 'geo_wl_panda',
    category: 'animals',
    icon: '🐼',
    clueEmoji: '🐼',
    clueTitle: 'Bamboo Muncher',
    question: 'Which continent’s misty mountain forests are the native home of the Giant Panda?',
    targetContinentId: 'as',
    choices: [
      { id: 'as', text: 'Asia', emoji: '🐼', correct: true },
      { id: 'na', text: 'North America', emoji: '🐻', correct: false },
      { id: 'af', text: 'Africa', emoji: '🦁', correct: false },
    ],
    funFact: 'Giant Pandas can spend up to 12 hours a day happily eating crunchy green bamboo leaves!',
  },
  {
    id: 'geo_wl_penguin',
    category: 'animals',
    icon: '🐧',
    clueEmoji: '🐧',
    clueTitle: 'Tuxedo Bird',
    question: 'Emperor Penguins slide on their bellies across the sea ice of which frosty continent?',
    targetContinentId: 'an',
    choices: [
      { id: 'an', text: 'Antarctica', emoji: '🐧', correct: true },
      { id: 'au', text: 'Australia', emoji: '🦘', correct: false },
      { id: 'eu', text: 'Europe', emoji: '🏰', correct: false },
    ],
    funFact: 'Emperor Penguin fathers keep eggs warm on their feet under a cozy fold of feathered skin in freezing blizzards!',
  },
  {
    id: 'geo_wl_kangaroo',
    category: 'animals',
    icon: '🦘',
    clueEmoji: '🦘',
    clueTitle: 'Super Hopper',
    question: 'Where in the world do wild kangaroos and cuddly koalas live naturally?',
    targetContinentId: 'au',
    choices: [
      { id: 'au', text: 'Australia', emoji: '🦘', correct: true },
      { id: 'sa', text: 'South America', emoji: '🦜', correct: false },
      { id: 'af', text: 'Africa', emoji: '🦁', correct: false },
    ],
    funFact: 'A red kangaroo can leap over 25 feet in a single bound using its giant springy hind legs!',
  },
  {
    id: 'geo_wl_lion',
    category: 'animals',
    icon: '🦁',
    clueEmoji: '🦁',
    clueTitle: 'King of the Pride',
    question: 'Prides of majestic wild lions roam the grasslands of which continent?',
    targetContinentId: 'af',
    choices: [
      { id: 'af', text: 'Africa', emoji: '🦁', correct: true },
      { id: 'eu', text: 'Europe', emoji: '🏰', correct: false },
      { id: 'an', text: 'Antarctica', emoji: '❄️', correct: false },
    ],
    funFact: 'A lion’s mighty roar can be heard by other animals over five miles away across the savanna!',
  },
  {
    id: 'geo_wl_bison',
    category: 'animals',
    icon: '🦬',
    clueEmoji: '🦬',
    clueTitle: 'Plains Giant',
    question: 'Great herds of furry American Bison and Bald Eagles are native to which continent?',
    targetContinentId: 'na',
    choices: [
      { id: 'na', text: 'North America', emoji: '🦬', correct: true },
      { id: 'au', text: 'Australia', emoji: '🦘', correct: false },
      { id: 'as', text: 'Asia', emoji: '🐼', correct: false },
    ],
    funFact: 'Bison are the largest land animals in North America, weighing up to 2,000 pounds!',
  },

  // --- Oceans & Earth ---
  {
    id: 'geo_oc_pacific',
    category: 'oceans',
    icon: '🌊',
    clueEmoji: '🌊',
    clueTitle: 'Super Ocean',
    question: 'Which is the largest and deepest ocean on our entire planet?',
    targetOceanId: 'pacific',
    choices: [
      { id: 'pacific', text: 'Pacific Ocean', emoji: '🌊', correct: true },
      { id: 'arctic', text: 'Arctic Ocean', emoji: '🧊', correct: false },
      { id: 'atlantic', text: 'Atlantic Ocean', emoji: '⛵', correct: false },
    ],
    funFact: 'The Pacific Ocean contains more than half of all the ocean water on Earth and thousands of tropical islands!',
  },
  {
    id: 'geo_oc_arctic',
    category: 'oceans',
    icon: '🧊',
    clueEmoji: '🐻‍❄️',
    clueTitle: 'Top of the World',
    question: 'Which icy cold ocean sits at the very top of the world around the North Pole?',
    targetOceanId: 'arctic',
    choices: [
      { id: 'arctic', text: 'Arctic Ocean', emoji: '🧊', correct: true },
      { id: 'indian', text: 'Indian Ocean', emoji: '🌴', correct: false },
      { id: 'pacific', text: 'Pacific Ocean', emoji: '🌊', correct: false },
    ],
    funFact: 'The Arctic Ocean is covered in a sheet of floating sea ice where polar bears, seals, and walruses live!',
  },
  {
    id: 'geo_oc_atlantic',
    category: 'oceans',
    icon: '⛵',
    clueEmoji: '🚢',
    clueTitle: 'Ocean Highway',
    question: 'Which ocean lies between the Americas and Europe/Africa?',
    targetOceanId: 'atlantic',
    choices: [
      { id: 'atlantic', text: 'Atlantic Ocean', emoji: '⛵', correct: true },
      { id: 'indian', text: 'Indian Ocean', emoji: '🌴', correct: false },
      { id: 'southern', text: 'Southern Ocean', emoji: '🐧', correct: false },
    ],
    funFact: 'The Atlantic Ocean was the first ocean to be crossed by an airplane and a passenger ship!',
  },
];
