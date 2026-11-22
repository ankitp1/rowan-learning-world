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
  // --- Phonics: Beginning Sounds ---
  {
    id: 'b-hunt',
    title: 'The Bouncing /b/ Hunt',
    category: 'Beginning Sounds',
    icon: '🏀',
    prompt: 'Find 2 things in your room that start with the /b/ sound!',
    examples: 'Like a ball, a book, a bed, or a block!',
    speechText: 'Explorer quest! Go find two things in your room that start with the buh sound! Like a ball, a book, or a block!',
  },
  {
    id: 's-search',
    title: 'The Super /s/ Search',
    category: 'Beginning Sounds',
    icon: '🧦',
    prompt: 'Find 3 things that start with the /s/ sound!',
    examples: 'Like socks, a spoon, soap, or a sticker!',
    speechText: 'Super detective alert! Find three things that start with the sss sound! Like socks, a spoon, or a sticker!',
  },
  {
    id: 'm-mission',
    title: 'The Mighty /m/ Mission',
    category: 'Beginning Sounds',
    icon: '🥛',
    prompt: 'Find 2 things in the kitchen that start with /m/!',
    examples: 'Like milk, a mug, a magnet, or a muffin!',
    speechText: 'Mighty mission! Head to the kitchen and find two things that start with the mmm sound! Like milk, a mug, or a magnet!',
  },
  {
    id: 't-trek',
    title: 'The Terrific /t/ Trek',
    category: 'Beginning Sounds',
    icon: '🧸',
    prompt: 'Find 2 things at home that start with the /t/ sound!',
    examples: 'Like a toy, a towel, a table, or a toothbrush!',
    speechText: 'Terrific trek! Can you find two things that start with the tuh sound? Like a toy, a table, or a towel!',
  },
  {
    id: 'c-k-quest',
    title: 'The Crisp /c/ & /k/ Hunt',
    category: 'Beginning Sounds',
    icon: '🚗',
    prompt: 'Find 2 things that start with the /c/ or /k/ sound!',
    examples: 'Like a car, a cup, a key, or a coat!',
    speechText: 'Click clack! Find two things in the house that start with the kuh sound! Like a toy car, a cup, or a coat!',
  },
  {
    id: 'p-patrol',
    title: 'The Playful /p/ Patrol',
    category: 'Beginning Sounds',
    icon: '🍳',
    prompt: 'Find 2 things at home that start with the /p/ sound!',
    examples: 'Like a pillow, paper, a pan, or a pencil!',
    speechText: 'Pup patrol on duty! Find two things that start with the puh sound! Like a pillow, paper, or a pen!',
  },
  {
    id: 'f-forage',
    title: 'The Fast /f/ Forage',
    category: 'Beginning Sounds',
    icon: '🍴',
    prompt: 'Find 2 things at home that start with the /f/ sound!',
    examples: 'Like a fork, a fan, a foot, or fruit!',
    speechText: 'Fast fingers ready! Find two things that start with the fff sound! Like a fork, a fan, or fruit!',
  },
  {
    id: 'd-detective',
    title: 'The Daring /d/ Detective',
    category: 'Beginning Sounds',
    icon: '🚪',
    prompt: 'Find 2 things that start with the /d/ sound!',
    examples: 'Like a door, a desk, a dinosaur, or a dish!',
    speechText: 'Daring detective! Find two things that start with the duh sound! Like a door, a desk, or a dinosaur!',
  },
  {
    id: 'h-hop',
    title: 'The Happy /h/ Hunt',
    category: 'Beginning Sounds',
    icon: '🧢',
    prompt: 'Find 2 things at home that start with the /h/ sound!',
    examples: 'Like a hat, your hand, a hanger, or hair!',
    speechText: 'Happy hunting! Can you find two things that start with the huh sound? Like a hat, your hands, or a hanger!',
  },
  {
    id: 'l-lookout',
    title: 'The Lively /l/ Lookout',
    category: 'Beginning Sounds',
    icon: '💡',
    prompt: 'Find 2 things that start with the /l/ sound!',
    examples: 'Like a lamp, a light, a lid, or a leaf!',
    speechText: 'Lookout alert! Find two things that start with the lll sound! Like a lamp, a light, or a lid!',
  },
  {
    id: 'r-ranger',
    title: 'The Roaring /r/ Ranger',
    category: 'Beginning Sounds',
    icon: '🪨',
    prompt: 'Find 2 things at home that start with the /r/ sound!',
    examples: 'Like a rug, a remote, a rock, or a ribbon!',
    speechText: 'Space Ranger mission! Find two things that start with the rrr sound! Like a rug, a remote, or a rock!',
  },
  {
    id: 'w-wonder',
    title: 'The Wonder /w/ Walk',
    category: 'Beginning Sounds',
    icon: '💧',
    prompt: 'Find 2 things that start with the /w/ sound!',
    examples: 'Like water, a wall, a window, or a watch!',
    speechText: 'Wonder walk! Can you spot two things that start with the wuh sound? Like water, a wall, or a window!',
  },
  {
    id: 'g-glider',
    title: 'The Great /g/ Glider',
    category: 'Beginning Sounds',
    icon: '🧤',
    prompt: 'Find 2 things at home that start with the hard /g/ sound!',
    examples: 'Like a glove, a game, glasses, or a gate!',
    speechText: 'Great explorer mission! Find two things that start with the guh sound! Like a glove, a game, or glasses!',
  },

  // --- Phonics: Digraphs ---
  {
    id: 'sh-detective',
    title: 'The /sh/ Sound Detective',
    category: 'Digraph Sounds',
    icon: '🤫',
    prompt: 'Find 2 things in your home that start with the /sh/ sound!',
    examples: 'Like a shiny spoon, a shoe, or a shirt!',
    speechText: 'Secret agent mission! Rowan, can you find two things in your home that start with the shh sound? Like a shoe, a shirt, or a shiny spoon!',
  },
  {
    id: 'ch-explorer',
    title: 'The /ch/ Sound Explorer',
    category: 'Digraph Sounds',
    icon: '🧀',
    prompt: 'Find something at home that starts with the /ch/ sound!',
    examples: 'Like a chair, a chip, cheese, or chalk!',
    speechText: 'Chomp chomp! Rowan, can you find something in the house that starts with the ch sound? Like a chair, cheese, or a chip!',
  },
  {
    id: 'th-sound',
    title: 'The /th/ Sound Explorer',
    category: 'Digraph Sounds',
    icon: '👍',
    prompt: 'Find something that starts with the /th/ sound!',
    examples: 'Like your thumb, a thread, or something thick or thin!',
    speechText: 'Sound explorer quest! Find something that starts with the th sound! Like your thumb, or a thread!',
  },
  {
    id: 'wh-whistle',
    title: 'The Whistle /wh/ Quest',
    category: 'Digraph Sounds',
    icon: '🛞',
    prompt: 'Find something with wheels that starts with the /wh/ sound!',
    examples: 'Like a wheel, a whistle, or something white!',
    speechText: 'Whoosh! Can you find something with wheels or something white that starts with the wh sound?',
  },

  // --- Phonics: Consonant Blends ---
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
    id: 'bl-br-blend',
    title: 'The Blue & Brown Blend Quest',
    category: 'Sound Blends',
    icon: '🫐',
    prompt: 'Find something blue or brown that starts with /bl/ or /br/!',
    examples: 'Like a blanket, a block, a brush, or bread!',
    speechText: 'Blend explorer! Find something that starts with bl or br! Like a blanket, a block, or a brush!',
  },
  {
    id: 'sp-spotter',
    title: 'The Speedy /sp/ Spotter',
    category: 'Sound Blends',
    icon: '🥄',
    prompt: 'Find 2 things that start with the /sp/ sound blend!',
    examples: 'Like a spoon, a sponge, a spot, or a spinner!',
    speechText: 'Speedy spotter! Can you find two things that start with sp? Like a spoon, a sponge, or a spinner!',
  },
  {
    id: 'tr-track',
    title: 'The Train & Truck /tr/ Quest',
    category: 'Sound Blends',
    icon: '🚚',
    prompt: 'Find something that starts with the /tr/ sound blend!',
    examples: 'Like a truck, a train, a tray, or a tree outside!',
    speechText: 'Choo choo! Find something that starts with the tr blend! Like a truck, a toy train, or a tray!',
  },
  {
    id: 'cl-fl-blend',
    title: 'The Clock & Flag Blend Hunt',
    category: 'Sound Blends',
    icon: '⏰',
    prompt: 'Find something that starts with /cl/ or /fl/!',
    examples: 'Like a clock, clothes, a flashlight, or a floor rug!',
    speechText: 'Blend alert! Look for something that starts with cl or fl! Like a clock, clothes, or a flashlight!',
  },
  {
    id: 'dr-drop',
    title: 'The Drawing /dr/ Quest',
    category: 'Sound Blends',
    icon: '✏️',
    prompt: 'Find something that starts with the /dr/ sound blend!',
    examples: 'Like a drawer, a dress, a drum, or a drawing!',
    speechText: 'Drum roll! Find something that starts with the dr blend! Like a drawer, a drum, or a drawing!',
  },
  {
    id: 'gr-green',
    title: 'The Great Green /gr/ Hunt',
    category: 'Sound Blends',
    icon: '🍏',
    prompt: 'Find something green or groovy that starts with /gr/!',
    examples: 'Like grapes, grass outside, a grill, or green crayon!',
    speechText: 'Great green mission! Find something that starts with gr! Like grapes, grass, or a green toy!',
  },

  // --- Rhyme Time ---
  {
    id: 'rhyme-cat',
    title: 'The Rhyme Partner Hunt: Cat',
    category: 'Rhyme Time',
    icon: '🎩',
    prompt: "Find something in your room that rhymes with 'cat'!",
    examples: 'Like a hat, a mat, or a baseball bat!',
    speechText: "Rhyme time, Rowan! Can you find something in your room that rhymes with cat? Like a hat, a mat, or a bat!",
  },
  {
    id: 'rhyme-pan',
    title: 'The Rhyme Partner Hunt: Pan',
    category: 'Rhyme Time',
    icon: '🥫',
    prompt: "Find something at home that rhymes with 'pan'!",
    examples: 'Like a can, a fan, or a toy van!',
    speechText: "Rhyme champion! Find something in the house that rhymes with pan! Like a can, a fan, or a toy van!",
  },
  {
    id: 'rhyme-bed',
    title: 'The Rhyme Partner Hunt: Bed',
    category: 'Rhyme Time',
    icon: '🔴',
    prompt: "Find something in the house that rhymes with 'bed'!",
    examples: 'Like something red, a thread, or bread!',
    speechText: "Rhyme detective! Look for something that rhymes with bed! Like something red, bread, or thread!",
  },
  {
    id: 'rhyme-hop',
    title: 'The Rhyme Partner Hunt: Hop',
    category: 'Rhyme Time',
    icon: '🪀',
    prompt: "Find something that rhymes with 'hop'!",
    examples: 'Like a spinning top, a mop, or a bottle cap/top!',
    speechText: 'Hop hop! Can you find something that rhymes with hop? Like a toy top, a mop, or a cap!',
  },
  {
    id: 'rhyme-pin',
    title: 'The Rhyme Partner Hunt: Pin',
    category: 'Rhyme Time',
    icon: '🗑️',
    prompt: "Find something that rhymes with 'pin'!",
    examples: 'Like a trash bin, your chin, or a dolphin toy!',
    speechText: 'Rhyme time! Find something that rhymes with pin! Touch your chin, or find a bin!',
  },
  {
    id: 'rhyme-boat',
    title: 'The Rhyme Partner Hunt: Boat',
    category: 'Rhyme Time',
    icon: '🧥',
    prompt: "Find something that rhymes with 'boat'!",
    examples: 'Like a coat, a note, or a paper boat!',
    speechText: 'Sailing search! Find something that rhymes with boat! Like a coat, or a written note!',
  },

  // --- Phonics: Ending Sounds ---
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
    id: 'p-ending',
    title: 'The /p/ Ending Detective',
    category: 'Ending Sounds',
    icon: '☕',
    prompt: 'Find something that ends with the /p/ sound!',
    examples: 'Like a cup, a cap, a map, or soap!',
    speechText: 'Pop pop! Find something that ends with the puh sound! Like a cup, a cap, or soap!',
  },
  {
    id: 'k-ending',
    title: 'The /k/ Ending Detective',
    category: 'Ending Sounds',
    icon: '📚',
    prompt: 'Find something that ends with the /k/ sound!',
    examples: 'Like a book, a sock, a clock, or a fork!',
    speechText: 'Click! Find something that ends with the kuh sound! Like a book, a sock, or a clock!',
  },
  {
    id: 'n-ending',
    title: 'The /n/ Ending Detective',
    category: 'Ending Sounds',
    icon: '🥄',
    prompt: 'Find something that ends with the /n/ sound!',
    examples: 'Like a spoon, a coin, a pen, or a pan!',
    speechText: 'Listen closely! Find something that ends with the nnn sound! Like a spoon, a coin, or a pen!',
  },
  {
    id: 'd-ending',
    title: 'The /d/ Ending Detective',
    category: 'Ending Sounds',
    icon: '🛏️',
    prompt: 'Find something that ends with the /d/ sound!',
    examples: 'Like a bed, a card, bread, or a lid!',
    speechText: 'Detective alert! Find something that ends with the duh sound! Like a bed, a card, or a lid!',
  },

  // --- Real-World Math & Counting ---
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
    id: 'pillows-count',
    title: 'Count the Pillows Challenge',
    category: 'Real-World Math',
    icon: '🛋️',
    prompt: 'Count how many pillows are on the couch or bed!',
    examples: 'Count them one by one out loud!',
    speechText: 'Pillow counter! Go to the couch or bed and count how many pillows you see!',
  },
  {
    id: 'doors-count',
    title: 'Count the Doors Quest',
    category: 'Real-World Math',
    icon: '🚪',
    prompt: 'Walk down the hallway and count 4 doors!',
    examples: 'Point to each door: 1, 2, 3, 4!',
    speechText: 'Explorer walk! Walk down the hall and count 4 doors out loud!',
  },
  {
    id: 'shoes-pairs',
    title: 'Count Shoes by Twos!',
    category: 'Real-World Math',
    icon: '👟',
    prompt: 'Find 3 pairs of shoes and count them by twos: 2, 4, 6!',
    examples: 'Pair 1 (2), Pair 2 (4), Pair 3 (6)!',
    speechText: 'Skip counting mission! Find 3 pairs of shoes and count them by twos: 2, 4, 6 shoes!',
  },
  {
    id: 'blocks-tower-count',
    title: 'Build a Tower of 7 Blocks',
    category: 'Real-World Math',
    icon: '🧱',
    prompt: 'Stack 7 blocks or books into a tall tower!',
    examples: 'Count each block as you stack: 1 to 7!',
    speechText: 'Master builder challenge! Stack 7 blocks or books into a tall tower! Do not let it tumble!',
  },

  // --- Shapes in the Real World ---
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
    id: 'square-spotter',
    title: 'Square Shape Spotter',
    category: 'Shapes in Real Life',
    icon: '⏹️',
    prompt: 'Find something where all 4 sides are exactly equal like a square!',
    examples: 'Like a square box, a coaster, or a tile!',
    speechText: 'Square spotter! Look for something where all four sides are equal, like a square box or tile!',
  },
  {
    id: 'cylinder-spotter',
    title: 'Can & Tube Shape Explorer',
    category: 'Shapes in Real Life',
    icon: '🥫',
    prompt: 'Find something shaped like a cylinder (round on top and tall)!',
    examples: 'Like a soup can, a paper towel roll, or a cup!',
    speechText: '3D shape mission! Find a cylinder: round on the top and tall like a soup can or paper towel roll!',
  },

  // --- Measurement & Senses ---
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
    id: 'tall-short',
    title: 'The Tall & Short Comparison',
    category: 'Measurement & Senses',
    icon: '📏',
    prompt: 'Find one toy that is tall and one toy that is short!',
    examples: 'Stand them side by side to compare!',
    speechText: 'Measurement quest! Find one toy that is super tall and one that is short, and stand them side by side!',
  },
  {
    id: 'rough-smooth',
    title: 'Rough & Smooth Texture Hunt',
    category: 'Measurement & Senses',
    icon: '🪵',
    prompt: 'Touch one thing that feels rough and one that feels smooth!',
    examples: 'Like wood/carpet versus a smooth window or table!',
    speechText: 'Texture detective! Touch one thing that feels bumpy or rough, and one thing that feels glassy smooth!',
  },
  {
    id: 'fluffy-texture',
    title: 'Soft & Cozy Texture Hunt',
    category: 'Measurement & Senses',
    icon: '🧸',
    prompt: 'Find the softest, coziest thing in your bedroom!',
    examples: 'Like a favorite teddy bear, a blanket, or a pillow!',
    speechText: 'Cozy quest! Go find the softest, fluffiest thing in your bedroom! Give it a big squeeze!',
  },

  // --- Syllables & Language Fun ---
  {
    id: 'syllables-names',
    title: 'Clap the Family Names!',
    category: 'Syllable Fun',
    icon: '👏',
    prompt: 'Clap the syllables in your name and Dad & Mom’s names!',
    examples: 'Ro-wan (2 claps)! Dad-dy (2 claps)!',
    speechText: 'Clap challenge! Rowan, clap the syllables in your name! Ro-wan! How many claps was that? Now clap for Mom and Dad!',
  },
  {
    id: 'syllables-animals',
    title: 'Clap the Animal Names!',
    category: 'Syllable Fun',
    icon: '🦁',
    prompt: 'Pick 3 animals and clap their beats!',
    examples: 'Dog (1 clap), Ti-ger (2 claps), El-e-phant (3 claps)!',
    speechText: 'Animal rhythm! Say an animal and clap its beats! Like el-e-phant, three claps! Try your favorite animal!',
  },
  {
    id: 'syllables-food',
    title: 'Clap the Yummy Food!',
    category: 'Syllable Fun',
    icon: '🍕',
    prompt: 'Clap the beats for 3 of your favorite foods!',
    examples: 'Piz-za (2 claps), Ba-na-na (3 claps), Wa-ter-mel-on (4 claps)!',
    speechText: 'Yummy rhythm quest! Clap the beats of three foods! Like piz-za, ba-na-na, or pan-cake! How many claps for each?',
  },

  // --- Real-World Math & Counting (Expanded) ---
  {
    id: 'sock-pairs',
    title: 'Pair Up the Socks!',
    category: 'Real-World Math',
    icon: '🧦',
    prompt: 'Find 3 pairs of socks and count by twos: 2, 4, 6!',
    examples: 'Each pair has 2 matching socks!',
    speechText: 'Math detective! Find three pairs of socks and practice counting by twos: two, four, six socks in total!',
  },
  {
    id: 'door-counter',
    title: 'The Great Door Count',
    category: 'Real-World Math',
    icon: '🚪',
    prompt: 'Walk down the hallway and count how many doors you see!',
    examples: 'Bedroom doors, bathroom door, closet doors!',
    speechText: 'House explorer! Take a walk and count every door you see. How many doors are in your home?',
  },
  {
    id: 'clock-digits',
    title: 'Spot the Clock Numbers',
    category: 'Real-World Math',
    icon: '⏰',
    prompt: 'Look at a clock, phone, or microwave and read 2 numbers out loud!',
    examples: 'Look at the hour and minute digits!',
    speechText: 'Number scout! Look at a clock or microwave and read two numbers out loud to an adult!',
  },
  {
    id: 'crayon-ten-frame',
    title: 'Make 10 with Crayons or Blocks',
    category: 'Real-World Math',
    icon: '🖍️',
    prompt: 'Line up 10 crayons or blocks, then split them into 5 and 5!',
    examples: 'Five on the left plus five on the right equals ten!',
    speechText: 'Math builder! Line up ten crayons or blocks, then divide them into two equal groups of five! Five plus five is ten!',
  },
  {
    id: 'window-panes',
    title: 'Count the Window Panes',
    category: 'Real-World Math',
    icon: '🪟',
    prompt: 'Look at a window and count how many square panes or glass sections it has!',
    examples: 'One, two, three, four panes!',
    speechText: 'Window scout! Walk up to a window and count the glass sections. How many can you count?',
  },

  // --- Shapes & Colors in Real Life ---
  {
    id: 'triangle-spotter',
    title: 'Triangle Hunt',
    category: 'Shapes in Real Life',
    icon: '📐',
    prompt: 'Find something shaped like a triangle with 3 sides and 3 points!',
    examples: 'Like a clothes hanger, a slice of cheese, or a folded napkin!',
    speechText: 'Shape scout! Triangles have three sides. Can you find one triangle in the house? Like a clothes hanger or folded napkin!',
  },
  {
    id: 'oval-detective',
    title: 'The Oval Egg & Spoon Hunt',
    category: 'Shapes in Real Life',
    icon: '🥚',
    prompt: 'Find something shaped like an oval (a stretched circle)!',
    examples: 'Like an egg, the bowl of a spoon, or a rug!',
    speechText: 'Shape hunt! An oval is like a stretched-out circle. Can you find an oval in the kitchen, like a spoon bowl or an egg?',
  },
  {
    id: 'color-red-rush',
    title: 'The Red Color Rush',
    category: 'Colors & Exploration',
    icon: '🔴',
    prompt: 'Find 3 bright red objects in under 30 seconds!',
    examples: 'Like an apple, a red toy car, or a red marker!',
    speechText: 'Red alert! Rowan, quick: find three bright red things in your house! One, two, three, go!',
  },
  {
    id: 'color-blue-voyage',
    title: 'The Ocean Blue Quest',
    category: 'Colors & Exploration',
    icon: '🔵',
    prompt: 'Find 3 things that are blue like the ocean!',
    examples: 'Like a blue book, blue shirt, or blue crayon!',
    speechText: 'Ocean explorer! Can you spot three things that are cool ocean blue? What did you find?',
  },
  {
    id: 'color-yellow-sun',
    title: 'The Sunny Yellow Search',
    category: 'Colors & Exploration',
    icon: '🟡',
    prompt: 'Find 2 bright yellow things that shine like the sun!',
    examples: 'Like a banana, a yellow block, or a sticky note!',
    speechText: 'Sunny quest! Find two bright yellow things in the house that glow like sunshine!',
  },

  // --- Measurement, Senses & Movement ---
  {
    id: 'temperature-warm-cold',
    title: 'Warm & Cold Science Touch',
    category: 'Measurement & Senses',
    icon: '🧊',
    prompt: 'Touch something cold (like ice or the fridge) and something warm (like a cozy blanket)!',
    examples: 'Feel the difference between cold and warm with your hands!',
    speechText: 'Scientist check! Touch something cold from the fridge, then touch a warm cozy blanket! How does each one feel?',
  },
  {
    id: 'listening-quiet-detective',
    title: 'Quiet Listening Detective',
    category: 'Measurement & Senses',
    icon: '👂',
    prompt: 'Close your eyes for 10 seconds and listen for 3 quiet sounds!',
    examples: 'Like birds outside, the refrigerator hum, or footsteps!',
    speechText: 'Super ears ready! Close your eyes for ten seconds. Shhh... What are three different sounds you can hear right now?',
  },
  {
    id: 'flamingo-balance',
    title: 'The Flamingo Balance Challenge',
    category: 'Movement & Balance',
    icon: '🦩',
    prompt: 'Stand on one foot like a flamingo and count to 10 out loud!',
    examples: 'One, two, three, four, five, six, seven, eight, nine, ten!',
    speechText: 'Flamingo challenge! Lift one foot and balance like a flamingo! Count all the way to ten without wobbling over!',
  },
  {
    id: 'tall-giraffe-stretch',
    title: 'Giraffe Stretch & Mouse Curl',
    category: 'Movement & Balance',
    icon: '🦒',
    prompt: 'Reach way up high like a tall giraffe, then curl tiny like a little mouse!',
    examples: 'Reach for the ceiling, then tuck into a ball!',
    speechText: 'Animal stretch! Reach your hands all the way to the sky like a giant giraffe! Now curl tiny into a little sleeping mouse!',
  },

  // --- Family, World & India Connection ---
  {
    id: 'india-greeting',
    title: 'World Explorer Greeting',
    category: 'Family & World',
    icon: '🌏',
    prompt: "Ask Mom or Dad: 'How do we say Hello and Thank You in India?'",
    examples: "Like saying 'Namaste' with hands together! 🙏",
    speechText: "World explorer mission! Ask Mom or Dad: How do we say Hello and Thank You in India? Practice saying Namaste together!",
  },
  {
    id: 'kitchen-spice-safari',
    title: 'Kitchen Spice Aroma Safari',
    category: 'Family & World',
    icon: '🌿',
    prompt: 'With an adult, gently sniff a kitchen spice like cinnamon or cardamom!',
    examples: 'Cardamom (Elaichi) or Cinnamon smell sweet and spicy!',
    speechText: 'Spice safari! Ask Mom or Dad to let you sniff a spice from the kitchen, like sweet cinnamon or elaichi cardamom! It smells like India!',
  },
  {
    id: 'explorer-backpack',
    title: 'Pack the Explorer Backpack',
    category: 'Family & World',
    icon: '🎒',
    prompt: 'Pick 3 imaginary things you would pack for a big airplane trip to India!',
    examples: 'A water bottle, your favorite book, and cozy socks!',
    speechText: 'Pack your bags! If we took an airplane to India right now, what are three things you would put in your backpack?',
  },
  {
    id: 'family-favorite-story',
    title: 'Ask Mom or Dad a Question',
    category: 'Family & World',
    icon: '🗣️',
    prompt: "Ask Mom or Dad: 'What was your favorite game when you were 5 years old?'",
    examples: 'Listen carefully to what game they loved!',
    speechText: 'Family interview! Go ask Mom or Dad: What was your favorite game when you were five years old? Find out what they loved to play!',
  },
  {
    id: 'kindness-quest',
    title: 'The Super Kindness High-Five',
    category: 'Family & World',
    icon: '✋',
    prompt: 'Give someone at home a giant high-five and say one kind thing!',
    examples: "'You are the best!' or 'Thank you for helping me!'",
    speechText: 'Super kindness quest! Go give Mom, Dad, or a family member a giant high five and tell them: You are awesome!',
  },
  {
    id: 'living-plant-quest',
    title: 'The Living Green Nature Hunt',
    category: 'Nature & World',
    icon: '🌱',
    prompt: 'Find a living green plant inside or look at a tree out the window!',
    examples: 'Notice its green leaves and stem!',
    speechText: 'Nature explorer! Find a living green houseplant or look outside at a tree! Can you count three leaves?',
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
  // Rotate through the 52+ quests using day of the year so every single day brings a fresh adventure
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const idx = Math.abs((dayOfYear * 7 + d) % REAL_WORLD_QUESTS.length);
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
