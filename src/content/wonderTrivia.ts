export interface WonderTriviaItem {
  id: string;
  category: 'animals' | 'science' | 'space' | 'dinosaurs' | 'geography' | 'riddles';
  icon: string;
  minAge: number;
  maxAge: number;
  question: string;
  say?: string;
  choices: { text: string; emoji?: string; correct: boolean }[];
  funFact: string;
  encouragement: string;
}

export const WONDER_TRIVIA_LIBRARY: WonderTriviaItem[] = [
  // --- Animals (Ages 3-5) ---
  {
    id: 'ani_tall',
    category: 'animals',
    icon: '🦒',
    minAge: 3,
    maxAge: 5,
    question: 'What is the tallest animal in the whole world?',
    choices: [
      { text: 'Giraffe', emoji: '🦒', correct: true },
      { text: 'Elephant', emoji: '🐘', correct: false },
      { text: 'Penguin', emoji: '🐧', correct: false },
    ],
    funFact: 'Giraffes are so tall they can eat leaves from the tops of acacia trees!',
    encouragement: 'Giraffes take long, graceful steps, just like you taking your time to learn!',
  },
  {
    id: 'ani_swim',
    category: 'animals',
    icon: '🐬',
    minAge: 3,
    maxAge: 5,
    question: 'Which of these animals loves swimming in the ocean?',
    choices: [
      { text: 'Dolphin', emoji: '🐬', correct: true },
      { text: 'Squirrel', emoji: '🐿️', correct: false },
      { text: 'Rooster', emoji: '🐓', correct: false },
    ],
    funFact: 'Dolphins jump and click to say hello to their friends in the water!',
    encouragement: 'Splashing into new questions is always an exciting adventure!',
  },
  {
    id: 'ani_sleep',
    category: 'animals',
    icon: '🐨',
    minAge: 3,
    maxAge: 5,
    question: 'Which sleepy animal loves resting in eucalyptus trees?',
    choices: [
      { text: 'Koala', emoji: '🐨', correct: true },
      { text: 'Cheetah', emoji: '🐆', correct: false },
      { text: 'Duck', emoji: '🦆', correct: false },
    ],
    funFact: 'Koalas sleep up to 18 hours a day to save energy!',
    encouragement: 'Resting your brain is just as important as playing and learning!',
  },

  // --- Animals (Ages 6-8+) ---
  {
    id: 'ani_octopus',
    category: 'animals',
    icon: '🐙',
    minAge: 6,
    maxAge: 10,
    question: 'How many hearts does an octopus have?',
    choices: [
      { text: '3 Hearts', emoji: '💙', correct: true },
      { text: '1 Heart', emoji: '❤️', correct: false },
      { text: '5 Hearts', emoji: '💖', correct: false },
    ],
    funFact: 'An octopus has 3 hearts and blue blood to help pump oxygen in cold ocean depths!',
    encouragement: 'Science has so many wondrous surprises when you stay curious!',
  },
  {
    id: 'ani_lion',
    category: 'animals',
    icon: '🦁',
    minAge: 6,
    maxAge: 10,
    question: 'What is a family group of lions called?',
    choices: [
      { text: 'A Pride', emoji: '🦁', correct: true },
      { text: 'A Herd', emoji: '🦓', correct: false },
      { text: 'A School', emoji: '🐟', correct: false },
    ],
    funFact: 'Lion prides work together as a team to protect their cubs and territory.',
    encouragement: 'Working together makes everyone stronger and braver!',
  },

  // --- Space (Ages 3-5) ---
  {
    id: 'spc_sun',
    category: 'space',
    icon: '☀️',
    minAge: 3,
    maxAge: 5,
    question: 'What warm and glowing star lights up our daytime sky?',
    choices: [
      { text: 'The Sun', emoji: '☀️', correct: true },
      { text: 'The Moon', emoji: '🌙', correct: false },
      { text: 'A Cloud', emoji: '☁️', correct: false },
    ],
    funFact: 'The Sun is actually a giant glowing ball of gas that warms our entire planet!',
    encouragement: 'Your bright mind shines just like the morning sun!',
  },
  {
    id: 'spc_home',
    category: 'space',
    icon: '🌍',
    minAge: 3,
    maxAge: 5,
    question: 'What is the name of the beautiful blue planet we live on?',
    choices: [
      { text: 'Earth', emoji: '🌍', correct: true },
      { text: 'Mars', emoji: '🔴', correct: false },
      { text: 'Saturn', emoji: '🪐', correct: false },
    ],
    funFact: 'Earth is the only planet we know of that has oceans, trees, and friendly kids like you!',
    encouragement: 'We all share this planet, and caring for it begins with learning!',
  },

  // --- Space (Ages 6-8+) ---
  {
    id: 'spc_jupiter',
    category: 'space',
    icon: '🪐',
    minAge: 6,
    maxAge: 10,
    question: 'Which is the largest planet in our solar system?',
    choices: [
      { text: 'Jupiter', emoji: '🪐', correct: true },
      { text: 'Venus', emoji: '✨', correct: false },
      { text: 'Mars', emoji: '🔴', correct: false },
    ],
    funFact: 'Jupiter is so huge that over 1,300 Earths could fit inside it!',
    encouragement: 'There is so much room in the universe for big questions and big dreams!',
  },
  {
    id: 'spc_rings',
    category: 'space',
    icon: '🪐',
    minAge: 6,
    maxAge: 10,
    question: 'Which planet is famous for having giant, shiny rings made of ice and rock?',
    choices: [
      { text: 'Saturn', emoji: '🪐', correct: true },
      { text: 'Mercury', emoji: '🪨', correct: false },
      { text: 'Neptune', emoji: '🔵', correct: false },
    ],
    funFact: 'Saturn’s rings look solid from far away, but they are made of billions of icy pieces!',
    encouragement: 'Looking closely reveals wonders you might never see at first glance!',
  },

  // --- Dinosaurs (Ages 3-5) ---
  {
    id: 'dino_egg',
    category: 'dinosaurs',
    icon: '🥚',
    minAge: 3,
    maxAge: 5,
    question: 'Did baby dinosaurs hatch from eggs or were they born like puppies?',
    choices: [
      { text: 'Hatched from eggs', emoji: '🥚', correct: true },
      { text: 'Born like puppies', emoji: '🐶', correct: false },
      { text: 'Grew on trees', emoji: '🌳', correct: false },
    ],
    funFact: 'Some dinosaur nests had dozens of carefully arranged eggs warmed with soft leaves!',
    encouragement: 'Every big thing starts small, just like a baby dinosaur hatching!',
  },
  {
    id: 'dino_trex',
    category: 'dinosaurs',
    icon: '🦖',
    minAge: 3,
    maxAge: 5,
    question: 'Which dinosaur is famous for giant stomping feet and tiny little arms?',
    choices: [
      { text: 'T-Rex', emoji: '🦖', correct: true },
      { text: 'Pterodactyl', emoji: '🦅', correct: false },
      { text: 'Triceratops', emoji: '🦏', correct: false },
    ],
    funFact: 'Even with tiny arms, a T-Rex had one of the strongest jaws ever known!',
    encouragement: 'You don’t have to be giant to be mighty and smart!',
  },

  // --- Dinosaurs (Ages 6-8+) ---
  {
    id: 'dino_birds',
    category: 'dinosaurs',
    icon: '🦅',
    minAge: 6,
    maxAge: 10,
    question: 'Scientists discovered that which animal alive today evolved from small dinosaurs?',
    choices: [
      { text: 'Birds', emoji: '🦅', correct: true },
      { text: 'Frogs', emoji: '🐸', correct: false },
      { text: 'Horses', emoji: '🐴', correct: false },
    ],
    funFact: 'Many dinosaurs actually had colourful feathers to stay warm and show off!',
    encouragement: 'Look out the window at a robin or sparrow—you are seeing living dinosaur cousins!',
  },

  // --- Science & Nature (Ages 3-5) ---
  {
    id: 'sci_rainbow',
    category: 'science',
    icon: '🌈',
    minAge: 3,
    maxAge: 5,
    question: 'What two things make a rainbow appear in the sky?',
    choices: [
      { text: 'Sunlight and rain drops', emoji: '🌦️', correct: true },
      { text: 'Wind and snow', emoji: '❄️', correct: false },
      { text: 'Moonlight and night', emoji: '🌙', correct: false },
    ],
    funFact: 'Raindrops act like tiny glass prisms that split white sunlight into all 7 colours!',
    encouragement: 'When the sun and rain work together, they make something beautiful!',
  },
  {
    id: 'sci_plants',
    category: 'science',
    icon: '🌱',
    minAge: 3,
    maxAge: 5,
    question: 'What do green plants drink through their roots deep in the soil?',
    choices: [
      { text: 'Water', emoji: '💧', correct: true },
      { text: 'Orange Juice', emoji: '🧃', correct: false },
      { text: 'Milk', emoji: '🥛', correct: false },
    ],
    funFact: 'Plant roots act like tiny drinking straws pulling water and minerals up to the leaves!',
    encouragement: 'Every question you answer gives your brain seeds fresh water to grow!',
  },

  // --- Science & Nature (Ages 6-8+) ---
  {
    id: 'sci_states',
    category: 'science',
    icon: '🧊',
    minAge: 6,
    maxAge: 10,
    question: 'What happens to liquid water when it gets colder than zero degrees Celsius (32°F)?',
    choices: [
      { text: 'Turns into ice', emoji: '🧊', correct: true },
      { text: 'Turns into steam', emoji: '💨', correct: false },
      { text: 'Disappears forever', emoji: '✨', correct: false },
    ],
    funFact: 'Water is one of the rare substances that expands when it freezes, which is why ice floats!',
    encouragement: 'Observing how things change around you is the very heart of science!',
  },
  {
    id: 'sci_spider',
    category: 'science',
    icon: '🕷️',
    minAge: 6,
    maxAge: 10,
    question: 'True or False: Are spiders considered insects?',
    choices: [
      { text: 'False (They are Arachnids with 8 legs)', emoji: '🕷️', correct: true },
      { text: 'True (All bugs are insects)', emoji: '🪲', correct: false },
    ],
    funFact: 'Insects have 6 legs and 3 body sections; spiders have 8 legs and 2 sections!',
    encouragement: 'Paying attention to details helps you discover how things are truly organized!',
  },

  // --- Riddles & Logic (Ages 3-5) ---
  {
    id: 'rid_egg',
    category: 'riddles',
    icon: '🥚',
    minAge: 3,
    maxAge: 5,
    question: 'Riddle: What has to be gently cracked before you can cook or use it?',
    choices: [
      { text: 'An egg', emoji: '🍳', correct: true },
      { text: 'A spoon', emoji: '🥄', correct: false },
      { text: 'A banana', emoji: '🍌', correct: false },
    ],
    funFact: 'Eggshells have thousands of tiny microscopic pores that let air inside!',
    encouragement: 'Riddles are like brain puzzles—you did wonderful thinking through that clue!',
  },

  // --- Riddles & Logic (Ages 6-8+) ---
  {
    id: 'rid_up',
    category: 'riddles',
    icon: '🎂',
    minAge: 6,
    maxAge: 10,
    question: 'Riddle: What goes up every year on your birthday, but never comes down?',
    choices: [
      { text: 'Your age', emoji: '🎂', correct: true },
      { text: 'A kite', emoji: '🪁', correct: false },
      { text: 'A rocket', emoji: '🚀', correct: false },
    ],
    funFact: 'Every year you get older, your brain forms millions of new neural connections from learning!',
    encouragement: 'Growing older also means growing wiser, kinder, and more capable!',
  },
];
