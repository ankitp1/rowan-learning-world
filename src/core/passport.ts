/**
 * World Explorer Passport & Country Stamp Collection System
 * Lets kids collect verified ink stamps for each country they explore across
 * Flag Trivia, Complete the Flag, Geography Detective, and World Explorer!
 */

export interface PassportStamp {
  id: string;
  country: string;
  flagEmoji: string;
  continent: 'North America' | 'South America' | 'Europe' | 'Asia' | 'Africa' | 'Oceania' | 'Antarctica';
  landmarkEmoji: string;
  landmarkName: string;
  earnedAt: number;
  sourceGame?: string;
  funFact: string;
}

export interface MasterCountryInfo {
  country: string;
  flagEmoji: string;
  continent: 'North America' | 'South America' | 'Europe' | 'Asia' | 'Africa' | 'Oceania' | 'Antarctica';
  landmarkEmoji: string;
  landmarkName: string;
  funFact: string;
}

export const MASTER_COUNTRIES: Record<string, MasterCountryInfo> = {
  Japan: {
    country: 'Japan',
    flagEmoji: '🇯🇵',
    continent: 'Asia',
    landmarkEmoji: '🗼',
    landmarkName: 'Mount Fuji & Tokyo',
    funFact: 'Japan is made up of over 6,800 islands and has the world’s fastest bullet trains!',
  },
  Canada: {
    country: 'Canada',
    flagEmoji: '🇨🇦',
    continent: 'North America',
    landmarkEmoji: '🍁',
    landmarkName: 'Niagara Falls & Maple Forests',
    funFact: 'Canada has more lakes than all other countries in the world combined!',
  },
  France: {
    country: 'France',
    flagEmoji: '🇫🇷',
    continent: 'Europe',
    landmarkEmoji: '🗼',
    landmarkName: 'Eiffel Tower in Paris',
    funFact: 'The Eiffel Tower in Paris can be 6 inches taller during hot summer days!',
  },
  'United States': {
    country: 'United States',
    flagEmoji: '🇺🇸',
    continent: 'North America',
    landmarkEmoji: '🗽',
    landmarkName: 'Statue of Liberty',
    funFact: 'The Statue of Liberty in New York was a friendly gift from France in 1886!',
  },
  Italy: {
    country: 'Italy',
    flagEmoji: '🇮🇹',
    continent: 'Europe',
    landmarkEmoji: '🏛️',
    landmarkName: 'Ancient Colosseum & Rome',
    funFact: 'Italy is home to ancient Roman ruins and more UNESCO World Heritage sites than any other nation!',
  },
  India: {
    country: 'India',
    flagEmoji: '🇮🇳',
    continent: 'Asia',
    landmarkEmoji: '🕌',
    landmarkName: 'Taj Mahal in Agra',
    funFact: 'The Taj Mahal changes color throughout the day, glowing pink in the morning and white in the sun!',
  },
  Brazil: {
    country: 'Brazil',
    flagEmoji: '🇧🇷',
    continent: 'South America',
    landmarkEmoji: '🗿',
    landmarkName: 'Christ the Redeemer & Amazon',
    funFact: 'The Amazon Rainforest produces 20% of the entire planet’s fresh oxygen!',
  },
  Egypt: {
    country: 'Egypt',
    flagEmoji: '🇪🇬',
    continent: 'Africa',
    landmarkEmoji: '🔺',
    landmarkName: 'Pyramids of Giza & Sphinx',
    funFact: 'The Great Pyramid was the tallest man-made structure in the world for over 3,800 years!',
  },
  'United Kingdom': {
    country: 'United Kingdom',
    flagEmoji: '🇬🇧',
    continent: 'Europe',
    landmarkEmoji: '🕰️',
    landmarkName: 'Big Ben & Tower Bridge',
    funFact: 'Big Ben is the name of the giant bell inside the Elizabeth Tower in London!',
  },
  Australia: {
    country: 'Australia',
    flagEmoji: '🇦🇺',
    continent: 'Oceania',
    landmarkEmoji: '🎭',
    landmarkName: 'Sydney Opera House & Coral Reef',
    funFact: 'The Great Barrier Reef in Australia is so large it can be seen from outer space!',
  },
  China: {
    country: 'China',
    flagEmoji: '🇨🇳',
    continent: 'Asia',
    landmarkEmoji: '🧱',
    landmarkName: 'The Great Wall of China',
    funFact: 'The Great Wall is over 13,000 miles long and winds across mountains and deserts!',
  },
  Mexico: {
    country: 'Mexico',
    flagEmoji: '🇲🇽',
    continent: 'North America',
    landmarkEmoji: '🏛️',
    landmarkName: 'Chichén Itzá Pyramid',
    funFact: 'The ancient Maya pyramid casts a shadow that looks like a giant feathered serpent!',
  },
  Germany: {
    country: 'Germany',
    flagEmoji: '🇩🇪',
    continent: 'Europe',
    landmarkEmoji: '🏰',
    landmarkName: 'Neuschwanstein Castle',
    funFact: 'Germany has over 20,000 historic fairy tale castles tucked into its forests and hills!',
  },
  Greece: {
    country: 'Greece',
    flagEmoji: '🇬🇷',
    continent: 'Europe',
    landmarkEmoji: '🏛️',
    landmarkName: 'The Parthenon in Athens',
    funFact: 'Athens is one of the oldest cities on Earth and the birthplace of the Olympic Games!',
  },
  'South Korea': {
    country: 'South Korea',
    flagEmoji: '🇰🇷',
    continent: 'Asia',
    landmarkEmoji: '🏯',
    landmarkName: 'Gyeongbokgung Palace in Seoul',
    funFact: 'Seoul blends ancient royal palaces with the fastest internet and coolest bullet trains!',
  },
  'South Africa': {
    country: 'South Africa',
    flagEmoji: '🇿🇦',
    continent: 'Africa',
    landmarkEmoji: '🦁',
    landmarkName: 'Table Mountain & Kruger Safaris',
    funFact: 'South Africa has penguins on sunny beaches and wild lions roaming vast savannas!',
  },
  Argentina: {
    country: 'Argentina',
    flagEmoji: '🇦🇷',
    continent: 'South America',
    landmarkEmoji: '☀️',
    landmarkName: 'Iguazu Falls & Buenos Aires',
    funFact: 'Iguazu Falls consists of 275 thunderous waterfalls cascading through the subtropical jungle!',
  },
  Peru: {
    country: 'Peru',
    flagEmoji: '🇵🇪',
    continent: 'South America',
    landmarkEmoji: '🏔️',
    landmarkName: 'Machu Picchu in the Andes',
    funFact: 'The Inca stonework at Machu Picchu fits so tightly you cannot even slide a piece of paper through!',
  },
  Switzerland: {
    country: 'Switzerland',
    flagEmoji: '🇨🇭',
    continent: 'Europe',
    landmarkEmoji: '🏔️',
    landmarkName: 'The Matterhorn in the Alps',
    funFact: 'Switzerland is famous for delicious alpine chocolate, snowy mountains, and a square flag!',
  },
  Kenya: {
    country: 'Kenya',
    flagEmoji: '🇰🇪',
    continent: 'Africa',
    landmarkEmoji: '🦒',
    landmarkName: 'Maasai Mara National Reserve',
    funFact: 'Millions of zebras and wildebeests leap across the Mara river during the Great Migration!',
  },
  Sweden: {
    country: 'Sweden',
    flagEmoji: '🇸🇪',
    continent: 'Europe',
    landmarkEmoji: '❄️',
    landmarkName: 'Stockholm Archipelago & Icehotel',
    funFact: 'In northern Sweden, the Northern Lights dance in green and purple ribbons across the winter sky!',
  },
  Jamaica: {
    country: 'Jamaica',
    flagEmoji: '🇯🇲',
    continent: 'North America',
    landmarkEmoji: '🌴',
    landmarkName: 'Blue Mountains & Dunn’s River',
    funFact: 'Jamaica’s flag is the only national flag that does not contain red, white, or blue!',
  },
  Ireland: {
    country: 'Ireland',
    flagEmoji: '🇮🇪',
    continent: 'Europe',
    landmarkEmoji: '🍀',
    landmarkName: 'Cliffs of Moher & Dublin',
    funFact: 'Ireland is called the Emerald Isle because of its lush green rolling hills and meadows!',
  },
  Norway: {
    country: 'Norway',
    flagEmoji: '🇳🇴',
    continent: 'Europe',
    landmarkEmoji: '⛵',
    landmarkName: 'Spectacular Ocean Fjords',
    funFact: 'Norway is known as the Land of the Midnight Sun because the sun never sets during summer peak!',
  },
};

const STORAGE_KEY_PREFIX = 'rlw_passport_stamps_';

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

export function clearPassportStorage(): void {
  memStore.clear();
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.clear === 'function') {
      window.localStorage.clear();
    }
  } catch {
    /* ignore */
  }
}

export function getPassportStamps(profileId: string): PassportStamp[] {
  try {
    const raw = getStorageItem(`${STORAGE_KEY_PREFIX}${profileId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

export function hasPassportStamp(profileId: string, country: string): boolean {
  const stamps = getPassportStamps(profileId);
  return stamps.some((s) => s.country.toLowerCase() === country.toLowerCase());
}

/**
 * Awards a new country stamp to the player's passport.
 * Returns true if newly awarded, false if already collected.
 */
export function awardPassportStamp(
  profileId: string,
  country: string,
  flagEmoji?: string,
  continent?: MasterCountryInfo['continent'],
  landmarkEmoji?: string,
  landmarkName?: string,
  sourceGame?: string,
  funFact?: string
): boolean {
  try {
    const stamps = getPassportStamps(profileId);
    const existing = stamps.find((s) => s.country.toLowerCase() === country.toLowerCase());
    if (existing) return false;

    // Look up default data from master catalog if not specified
    const master = MASTER_COUNTRIES[country];
    const newStamp: PassportStamp = {
      id: country.toLowerCase().replace(/\s+/g, '_'),
      country,
      flagEmoji: flagEmoji || master?.flagEmoji || '🚩',
      continent: continent || master?.continent || 'Europe',
      landmarkEmoji: landmarkEmoji || master?.landmarkEmoji || '🏛️',
      landmarkName: landmarkName || master?.landmarkName || `${country} Capital & Landmarks`,
      earnedAt: Date.now(),
      sourceGame: sourceGame || 'World Quest',
      funFact: funFact || master?.funFact || `Great explorer! You discovered ${country}!`,
    };

    stamps.unshift(newStamp);
    setStorageItem(`${STORAGE_KEY_PREFIX}${profileId}`, JSON.stringify(stamps));

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('rlw:passport_stamp_awarded', { detail: newStamp }));
      } catch {
        /* ignore event dispatch failure in test env */
      }
    }
    return true;
  } catch {
    return false;
  }
}
