/**
 * Where in the World? - Geography Detective Mystery Case Files
 * Progressive clue-based world geography deduction for young explorers.
 */

export interface SuspectDef {
  name: string;
  avatar: string;
  title: string;
}

export interface ClueDef {
  icon: string;
  text: string;
  say?: string;
}

export interface CityChoice {
  city: string;
  country: string;
  flag: string;
  correct: boolean;
}

export interface DetectiveCase {
  id: string;
  title: string;
  suspect: SuspectDef;
  targetCity: string;
  targetCountry: string;
  targetContinent: 'North America' | 'South America' | 'Europe' | 'Asia' | 'Africa' | 'Oceania' | 'Antarctica' | string;
  flagEmoji: string;
  landmarkEmoji: string;
  clues: ClueDef[];
  choices: CityChoice[];
  funFact: string;
  minAge: number;
  maxAge: number;
}

export const SUSPECTS: Record<string, SuspectDef> = {
  fox: { name: 'Sneaky Fox', avatar: '🦊', title: 'Master of Disguise' },
  raven: { name: 'Sly Raven', avatar: '🦅', title: 'Feathered Phantom' },
  claw: { name: 'Captain Claw', avatar: '🦀', title: 'The Seaside Trickster' },
  raccoon: { name: 'Shadow Raccoon', avatar: '🦝', title: 'Midnight Bandit' },
};

export const DETECTIVE_CASES: DetectiveCase[] = [
  {
    id: 'case_paris',
    title: 'The Case of the Missing Croissant',
    suspect: SUSPECTS.fox,
    targetCity: 'Paris',
    targetCountry: 'France',
    targetContinent: 'Europe',
    flagEmoji: '🇫🇷',
    landmarkEmoji: '🗼',
    clues: [
      {
        icon: '🥖',
        text: 'Witnesses smelled fresh warm baguettes and buttery croissants along a winding river called the Seine!',
        say: 'Witnesses smelled fresh warm baguettes and buttery croissants along a winding river called the Seine!',
      },
      {
        icon: '🎨',
        text: 'The suspect was spotted admiring a portrait of the Mona Lisa inside a giant glass pyramid museum!',
        say: 'The suspect was spotted admiring a portrait of the Mona Lisa inside a giant glass pyramid museum!',
      },
      {
        icon: '🗼',
        text: 'The culprit was last seen climbing a towering iron monument nicknamed the "Iron Lady"!',
        say: 'The culprit was last seen climbing a towering iron monument nicknamed the Iron Lady!',
      },
    ],
    choices: [
      { city: 'Paris', country: 'France', flag: '🇫🇷', correct: true },
      { city: 'Rome', country: 'Italy', flag: '🇮🇹', correct: false },
      { city: 'Berlin', country: 'Germany', flag: '🇩🇪', correct: false },
      { city: 'Madrid', country: 'Spain', flag: '🇪🇸', correct: false },
    ],
    funFact: "The Eiffel Tower in Paris was built for the 1889 World's Fair and can grow up to 6 inches taller in the hot summer sun!",
    minAge: 4,
    maxAge: 12,
  },
  {
    id: 'case_tokyo',
    title: 'The Case of the Neon Lantern',
    suspect: SUSPECTS.raccoon,
    targetCity: 'Tokyo',
    targetCountry: 'Japan',
    targetContinent: 'Asia',
    flagEmoji: '🇯🇵',
    landmarkEmoji: '🗼',
    clues: [
      {
        icon: '🚄',
        text: 'The suspect sped away on a super-fast bullet train whistling past snow-capped Mount Fuji!',
        say: 'The suspect sped away on a super-fast bullet train whistling past snow-capped Mount Fuji!',
      },
      {
        icon: '🍣',
        text: 'Fresh sushi rolls and steaming bowls of ramen noodles were found at the secret hideout!',
        say: 'Fresh sushi rolls and steaming bowls of ramen noodles were found at the secret hideout!',
      },
      {
        icon: '🌸',
        text: 'Pink cherry blossom petals drifted across the world’s busiest pedestrian crosswalk in Shibuya!',
        say: 'Pink cherry blossom petals drifted across the world’s busiest pedestrian crosswalk in Shibuya!',
      },
    ],
    choices: [
      { city: 'Tokyo', country: 'Japan', flag: '🇯🇵', correct: true },
      { city: 'Seoul', country: 'South Korea', flag: '🇰🇷', correct: false },
      { city: 'Bangkok', country: 'Thailand', flag: '🇹🇭', correct: false },
      { city: 'Singapore', country: 'Singapore', flag: '🇸🇬', correct: false },
    ],
    funFact: 'Tokyo has the busiest railway stations on Earth, and Japan is made of over 6,800 beautiful islands!',
    minAge: 4,
    maxAge: 12,
  },
  {
    id: 'case_cairo',
    title: 'The Case of the Golden Scarab',
    suspect: SUSPECTS.raven,
    targetCity: 'Cairo',
    targetCountry: 'Egypt',
    targetContinent: 'Africa',
    flagEmoji: '🇪🇬',
    landmarkEmoji: '🔺',
    clues: [
      {
        icon: '🐪',
        text: 'Tracks of desert camels were found crossing golden sand dunes near the world’s longest river, the Nile!',
        say: 'Tracks of desert camels were found crossing golden sand dunes near the world’s longest river, the Nile!',
      },
      {
        icon: '📜',
        text: 'A sheet of ancient papyrus paper with hieroglyphic bird and eye symbols was dropped in haste!',
        say: 'A sheet of ancient papyrus paper with hieroglyphic bird and eye symbols was dropped in haste!',
      },
      {
        icon: '🔺',
        text: 'The thief slipped into the shadow of giant three-sided stone pyramids guarded by a great Sphinx!',
        say: 'The thief slipped into the shadow of giant three-sided stone pyramids guarded by a great Sphinx!',
      },
    ],
    choices: [
      { city: 'Cairo', country: 'Egypt', flag: '🇪🇬', correct: true },
      { city: 'Nairobi', country: 'Kenya', flag: '🇰🇪', correct: false },
      { city: 'Casablanca', country: 'Morocco', flag: '🇲🇦', correct: false },
      { city: 'Cape Town', country: 'South Africa', flag: '🇿🇦', correct: false },
    ],
    funFact: 'The Great Pyramid of Giza near Cairo is over 4,500 years old and was the tallest man-made structure on Earth for thousands of years!',
    minAge: 4,
    maxAge: 12,
  },
  {
    id: 'case_london',
    title: 'The Case of the Chiming Clock',
    suspect: SUSPECTS.claw,
    targetCity: 'London',
    targetCountry: 'United Kingdom',
    targetContinent: 'Europe',
    flagEmoji: '🇬🇧',
    landmarkEmoji: '🕰️',
    clues: [
      {
        icon: '🚌',
        text: 'The suspect hopped onto a tall bright red double-decker bus splashing through drizzly morning mist!',
        say: 'The suspect hopped onto a tall bright red double-decker bus splashing through drizzly morning mist!',
      },
      {
        icon: '☕',
        text: 'A teacup and scones were found right outside Buckingham Palace where royal guards wear tall fuzzy hats!',
        say: 'A teacup and scones were found right outside Buckingham Palace where royal guards wear tall fuzzy hats!',
      },
      {
        icon: '🕰️',
        text: 'A giant four-faced clock tower nicknamed Big Ben chimed out loudly over the River Thames!',
        say: 'A giant four-faced clock tower nicknamed Big Ben chimed out loudly over the River Thames!',
      },
    ],
    choices: [
      { city: 'London', country: 'United Kingdom', flag: '🇬🇧', correct: true },
      { city: 'Dublin', country: 'Ireland', flag: '🇮🇪', correct: false },
      { city: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', correct: false },
      { city: 'Edinburgh', country: 'United Kingdom', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', correct: false },
    ],
    funFact: 'Big Ben is actually the nickname of the colossal 13-ton bell inside the Elizabeth Tower in London!',
    minAge: 4,
    maxAge: 12,
  },
  {
    id: 'case_new_york',
    title: 'The Case of the Liberty Torch',
    suspect: SUSPECTS.fox,
    targetCity: 'New York',
    targetCountry: 'United States',
    targetContinent: 'North America',
    flagEmoji: '🇺🇸',
    landmarkEmoji: '🗽',
    clues: [
      {
        icon: '🚕',
        text: 'A yellow taxi cab sped through Times Square surrounded by giant brightly glowing video billboards!',
        say: 'A yellow taxi cab sped through Times Square surrounded by giant brightly glowing video billboards!',
      },
      {
        icon: '🌳',
        text: 'Footprints crossed bicycle trails and a carousel inside a huge green park in the middle of skyscrapers!',
        say: 'Footprints crossed bicycle trails and a carousel inside a huge green park in the middle of skyscrapers!',
      },
      {
        icon: '🗽',
        text: 'The suspect was spotted by ferry passengers near a famous green copper statue holding a welcoming torch!',
        say: 'The suspect was spotted by ferry passengers near a famous green copper statue holding a welcoming torch!',
      },
    ],
    choices: [
      { city: 'New York', country: 'United States', flag: '🇺🇸', correct: true },
      { city: 'Chicago', country: 'United States', flag: '🇺🇸', correct: false },
      { city: 'Toronto', country: 'Canada', flag: '🇨🇦', correct: false },
      { city: 'Los Angeles', country: 'United States', flag: '🇺🇸', correct: false },
    ],
    funFact: 'The Statue of Liberty in New York Harbor was a friendly gift from France in 1886 to celebrate freedom and friendship!',
    minAge: 4,
    maxAge: 12,
  },
  {
    id: 'case_rome',
    title: 'The Case of the Gladiator’s Shield',
    suspect: SUSPECTS.raccoon,
    targetCity: 'Rome',
    targetCountry: 'Italy',
    targetContinent: 'Europe',
    flagEmoji: '🇮🇹',
    landmarkEmoji: '🏛️',
    clues: [
      {
        icon: '🍕',
        text: 'Flour footprints led past outdoor cafes serving cheesy pizza slices and scoops of creamy strawberry gelato!',
        say: 'Flour footprints led past outdoor cafes serving cheesy pizza slices and scoops of creamy strawberry gelato!',
      },
      {
        icon: '🪙',
        text: 'The suspect tossed a shiny coin over their shoulder into the famous marble Trevi Fountain!',
        say: 'The suspect tossed a shiny coin over their shoulder into the famous marble Trevi Fountain!',
      },
      {
        icon: '🏛️',
        text: 'The thief slipped between stone arches of the Colosseum, the huge ancient amphitheater of gladiators!',
        say: 'The thief slipped between stone arches of the Colosseum, the huge ancient amphitheater of gladiators!',
      },
    ],
    choices: [
      { city: 'Rome', country: 'Italy', flag: '🇮🇹', correct: true },
      { city: 'Athens', country: 'Greece', flag: '🇬🇷', correct: false },
      { city: 'Venice', country: 'Italy', flag: '🇮🇹', correct: false },
      { city: 'Barcelona', country: 'Spain', flag: '🇪🇸', correct: false },
    ],
    funFact: 'Rome is known as the "Eternal City" and contains the smallest independent country in the world inside it: Vatican City!',
    minAge: 4,
    maxAge: 12,
  },
  {
    id: 'case_rio',
    title: 'The Case of the Samba Carnival',
    suspect: SUSPECTS.claw,
    targetCity: 'Rio de Janeiro',
    targetCountry: 'Brazil',
    targetContinent: 'South America',
    flagEmoji: '🇧🇷',
    landmarkEmoji: '🗿',
    clues: [
      {
        icon: '🥁',
        text: 'Energetic samba drum beats and sparkling feather costumes cheered up a sunny coastal avenue!',
        say: 'Energetic samba drum beats and sparkling feather costumes cheered up a sunny coastal avenue!',
      },
      {
        icon: '🏖️',
        text: 'Footprints were left in the white sand along world-famous Copacabana and Ipanema beaches!',
        say: 'Footprints were left in the white sand along world-famous Copacabana and Ipanema beaches!',
      },
      {
        icon: '🗿',
        text: 'A colossal mountain statue with outstretched arms looked down over the bay from Mount Corcovado!',
        say: 'A colossal mountain statue with outstretched arms looked down over the bay from Mount Corcovado!',
      },
    ],
    choices: [
      { city: 'Rio de Janeiro', country: 'Brazil', flag: '🇧🇷', correct: true },
      { city: 'Buenos Aires', country: 'Argentina', flag: '🇦🇷', correct: false },
      { city: 'Lima', country: 'Peru', flag: '🇵🇪', correct: false },
      { city: 'Bogota', country: 'Colombia', flag: '🇨🇴', correct: false },
    ],
    funFact: 'The Christ the Redeemer statue in Rio de Janeiro stands 98 feet tall on a mountain peak over 2,300 feet above the city!',
    minAge: 4,
    maxAge: 12,
  },
  {
    id: 'case_sydney',
    title: 'The Case of the Boomerang Coast',
    suspect: SUSPECTS.raven,
    targetCity: 'Sydney',
    targetCountry: 'Australia',
    targetContinent: 'Oceania',
    flagEmoji: '🇦🇺',
    landmarkEmoji: '⛵',
    clues: [
      {
        icon: '🦘',
        text: 'The suspect hopped past a mother kangaroo with a joey in her pouch and a sleeping koala!',
        say: 'The suspect hopped past a mother kangaroo with a joey in her pouch and a sleeping koala!',
      },
      {
        icon: '🏄',
        text: 'Surfers catching big turquoise waves at Bondi Beach saw someone speeding away on a motorboat!',
        say: 'Surfers catching big turquoise waves at Bondi Beach saw someone speeding away on a motorboat!',
      },
      {
        icon: '⛵',
        text: 'The villain ducked beside a famous concert hall whose white roofs look like giant sailboat shells!',
        say: 'The villain ducked beside a famous concert hall whose white roofs look like giant sailboat shells!',
      },
    ],
    choices: [
      { city: 'Sydney', country: 'Australia', flag: '🇦🇺', correct: true },
      { city: 'Auckland', country: 'New Zealand', flag: '🇳🇿', correct: false },
      { city: 'Melbourne', country: 'Australia', flag: '🇦🇺', correct: false },
      { city: 'Suva', country: 'Fiji', flag: '🇫🇯', correct: false },
    ],
    funFact: 'The Sydney Opera House roof is tiled with over one million sparkling ceramic pieces that self-clean when it rains!',
    minAge: 4,
    maxAge: 12,
  },
  {
    id: 'case_beijing',
    title: 'The Case of the Jade Dragon',
    suspect: SUSPECTS.fox,
    targetCity: 'Beijing',
    targetCountry: 'China',
    targetContinent: 'Asia',
    flagEmoji: '🇨🇳',
    landmarkEmoji: '🏯',
    clues: [
      {
        icon: '🥟',
        text: 'Baskets of steaming dumplings and sweet red bean buns were left behind on a busy night-market food stall!',
        say: 'Baskets of steaming dumplings and sweet red bean buns were left behind on a busy night-market food stall!',
      },
      {
        icon: '🐼',
        text: 'A cuddly giant panda munching bamboo stalks pointed detectives toward the red walls of the Forbidden City!',
        say: 'A cuddly giant panda munching bamboo stalks pointed detectives toward the red walls of the Forbidden City!',
      },
      {
        icon: '🧱',
        text: 'The culprit fled along a colossal ancient stone wall winding over rolling green mountain peaks!',
        say: 'The culprit fled along a colossal ancient stone wall winding over rolling green mountain peaks!',
      },
    ],
    choices: [
      { city: 'Beijing', country: 'China', flag: '🇨🇳', correct: true },
      { city: 'Shanghai', country: 'China', flag: '🇨🇳', correct: false },
      { city: 'Taipei', country: 'Taiwan', flag: '🇹🇼', correct: false },
      { city: 'Seoul', country: 'South Korea', flag: '🇰🇷', correct: false },
    ],
    funFact: 'The Forbidden City in Beijing was the royal palace of Chinese emperors for nearly 500 years and has 9,999 rooms!',
    minAge: 4,
    maxAge: 12,
  },
  {
    id: 'case_agra',
    title: 'The Case of the Marble Crown',
    suspect: SUSPECTS.raccoon,
    targetCity: 'Agra',
    targetCountry: 'India',
    targetContinent: 'Asia',
    flagEmoji: '🇮🇳',
    landmarkEmoji: '🕌',
    clues: [
      {
        icon: '🦚',
        text: 'Brilliant blue peacock feathers were found near a plate of warm samosas and fragrant basmati rice!',
        say: 'Brilliant blue peacock feathers were found near a plate of warm samosas and fragrant basmati rice!',
      },
      {
        icon: '🛺',
        text: 'The suspect escaped through crowded colorful streets in a buzzing yellow and green three-wheeled auto rickshaw!',
        say: 'The suspect escaped through crowded colorful streets in a buzzing yellow and green three-wheeled auto rickshaw!',
      },
      {
        icon: '🕌',
        text: 'A shining white marble monument with four corner towers was reflected in the calm waters of the Yamuna River!',
        say: 'A shining white marble monument with four corner towers was reflected in the calm waters of the Yamuna River!',
      },
    ],
    choices: [
      { city: 'Agra', country: 'India', flag: '🇮🇳', correct: true },
      { city: 'New Delhi', country: 'India', flag: '🇮🇳', correct: false },
      { city: 'Mumbai', country: 'India', flag: '🇮🇳', correct: false },
      { city: 'Kathmandu', country: 'Nepal', flag: '🇳🇵', correct: false },
    ],
    funFact: 'The Taj Mahal in Agra was built out of pure white marble that naturally glows soft pink at sunrise and golden in the moonlight!',
    minAge: 4,
    maxAge: 12,
  },
  {
    id: 'case_mexico_city',
    title: 'The Case of the Feathered Serpent',
    suspect: SUSPECTS.claw,
    targetCity: 'Mexico City',
    targetCountry: 'Mexico',
    targetContinent: 'North America',
    flagEmoji: '🇲🇽',
    landmarkEmoji: '🏛️',
    clues: [
      {
        icon: '🌮',
        text: 'The aroma of fresh avocado guacamole and warm corn tacos filled the air alongside joyful guitar music!',
        say: 'The aroma of fresh avocado guacamole and warm corn tacos filled the air alongside joyful guitar music!',
      },
      {
        icon: '🛶',
        text: 'The thief rode a brightly painted wooden canal boat through floating flower gardens called Xochimilco!',
        say: 'The thief rode a brightly painted wooden canal boat through floating flower gardens called Xochimilco!',
      },
      {
        icon: '🔺',
        text: 'Witnesses saw the suspect climbing the massive stone steps of the ancient Aztec Pyramid of the Sun!',
        say: 'Witnesses saw the suspect climbing the massive stone steps of the ancient Aztec Pyramid of the Sun!',
      },
    ],
    choices: [
      { city: 'Mexico City', country: 'Mexico', flag: '🇲🇽', correct: true },
      { city: 'Cancun', country: 'Mexico', flag: '🇲🇽', correct: false },
      { city: 'Havana', country: 'Cuba', flag: '🇨🇺', correct: false },
      { city: 'Guatemala City', country: 'Guatemala', flag: '🇬🇹', correct: false },
    ],
    funFact: 'Mexico City was built on an ancient island city in a lake named Tenochtitlan, founded by the Aztecs in 1325!',
    minAge: 4,
    maxAge: 12,
  },
  {
    id: 'case_athens',
    title: 'The Case of the Olive Branch',
    suspect: SUSPECTS.raven,
    targetCity: 'Athens',
    targetCountry: 'Greece',
    targetContinent: 'Europe',
    flagEmoji: '🇬🇷',
    landmarkEmoji: '🏛️',
    clues: [
      {
        icon: '🫒',
        text: 'Silvery green olive branches and crumbly white feta cheese were left near the sparkling blue Aegean Sea!',
        say: 'Silvery green olive branches and crumbly white feta cheese were left near the sparkling blue Aegean Sea!',
      },
      {
        icon: '🏅',
        text: 'The suspect dashed through a grand white marble stadium where the ancient Olympic Games were celebrated!',
        say: 'The suspect dashed through a grand white marble stadium where the ancient Olympic Games were celebrated!',
      },
      {
        icon: '🏛️',
        text: 'The trail led straight up a high rocky hill to the Parthenon temple with tall ancient marble columns!',
        say: 'The trail led straight up a high rocky hill to the Parthenon temple with tall ancient marble columns!',
      },
    ],
    choices: [
      { city: 'Athens', country: 'Greece', flag: '🇬🇷', correct: true },
      { city: 'Rome', country: 'Italy', flag: '🇮🇹', correct: false },
      { city: 'Istanbul', country: 'Turkey', flag: '🇹🇷', correct: false },
      { city: 'Alexandria', country: 'Egypt', flag: '🇪🇬', correct: false },
    ],
    funFact: 'Athens is one of the world’s oldest cities, where people invented theater, philosophy, and democracy over 2,500 years ago!',
    minAge: 4,
    maxAge: 12,
  },
  {
    id: 'case_toronto',
    title: 'The Case of the Golden Maple Leaf',
    suspect: SUSPECTS.fox,
    targetCity: 'Toronto',
    targetCountry: 'Canada',
    targetContinent: 'North America',
    flagEmoji: '🇨🇦',
    landmarkEmoji: '🗼',
    clues: [
      {
        icon: '🍁',
        text: 'Sticky sweet maple syrup and ice hockey pucks were found near a frozen outdoor ice skating rink!',
        say: 'Sticky sweet maple syrup and ice hockey pucks were found near a frozen outdoor ice skating rink!',
      },
      {
        icon: '🌊',
        text: 'The roar of mighty Niagara Falls mist could be felt along the shores of huge Lake Ontario!',
        say: 'The roar of mighty Niagara Falls mist could be felt along the shores of huge Lake Ontario!',
      },
      {
        icon: '🗼',
        text: 'The suspect peered through the glass observation floor at the very top of the soaring CN Tower needle!',
        say: 'The suspect peered through the glass observation floor at the very top of the soaring CN Tower needle!',
      },
    ],
    choices: [
      { city: 'Toronto', country: 'Canada', flag: '🇨🇦', correct: true },
      { city: 'Montreal', country: 'Canada', flag: '🇨🇦', correct: false },
      { city: 'Vancouver', country: 'Canada', flag: '🇨🇦', correct: false },
      { city: 'Seattle', country: 'United States', flag: '🇺🇸', correct: false },
    ],
    funFact: 'Canada has more natural freshwater lakes than all other nations in the world combined!',
    minAge: 4,
    maxAge: 12,
  },
  {
    id: 'case_nairobi',
    title: 'The Case of the Safari Compass',
    suspect: SUSPECTS.raccoon,
    targetCity: 'Nairobi',
    targetCountry: 'Kenya',
    targetContinent: 'Africa',
    flagEmoji: '🇰🇪',
    landmarkEmoji: '🦒',
    clues: [
      {
        icon: '🦒',
        text: 'Tall spotty giraffes and striped zebras galloped right past the skyline of this sunny savannah metropolis!',
        say: 'Tall spotty giraffes and striped zebras galloped right past the skyline of this sunny savannah metropolis!',
      },
      {
        icon: '⛰️',
        text: 'The great snow-capped peak of Mount Kenya towered above the green hills of the Great Rift Valley!',
        say: 'The great snow-capped peak of Mount Kenya towered above the green hills of the Great Rift Valley!',
      },
      {
        icon: '🦁',
        text: 'The villain dropped a detective badge inside a national wildlife park where lions roam next to the city!',
        say: 'The villain dropped a detective badge inside a national wildlife park where lions roam next to the city!',
      },
    ],
    choices: [
      { city: 'Nairobi', country: 'Kenya', flag: '🇰🇪', correct: true },
      { city: 'Johannesburg', country: 'South Africa', flag: '🇿🇦', correct: false },
      { city: 'Addis Ababa', country: 'Ethiopia', flag: '🇪🇹', correct: false },
      { city: 'Cairo', country: 'Egypt', flag: '🇪🇬', correct: false },
    ],
    funFact: 'Nairobi National Park is the only protected safari park on Earth located directly next to a major world capital city!',
    minAge: 4,
    maxAge: 12,
  },
];
