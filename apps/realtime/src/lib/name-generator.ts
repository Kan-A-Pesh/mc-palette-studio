const ADJECTIVES = [
  "Happy",
  "Clever",
  "Swift",
  "Bright",
  "Calm",
  "Bold",
  "Wise",
  "Kind",
  "Brave",
  "Gentle",
  "Lucky",
  "Jolly",
  "Witty",
  "Merry",
  "Nimble",
  "Keen",
  "Eager",
  "Lively",
  "Serene",
  "Daring",
  "Cosmic",
  "Mystic",
  "Golden",
  "Silver",
  "Crystal",
  "Velvet",
  "Neon",
  "Stellar",
  "Radiant",
  "Vivid",
];

const NOUNS = [
  "Cat",
  "Fox",
  "Owl",
  "Bear",
  "Wolf",
  "Hawk",
  "Panda",
  "Koala",
  "Otter",
  "Raven",
  "Phoenix",
  "Dragon",
  "Tiger",
  "Lion",
  "Eagle",
  "Falcon",
  "Dolphin",
  "Penguin",
  "Rabbit",
  "Deer",
  "Octopus",
  "Turtle",
  "Parrot",
  "Jaguar",
  "Badger",
  "Crane",
  "Cobra",
  "Shark",
  "Whale",
  "Lynx",
];

const anonymousNames = new Map<string, string>();

function hashToIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % max;
}

export function generateAnonymousName(odentifier: string): string {
  const existing = anonymousNames.get(odentifier);
  if (existing) {
    return existing;
  }

  const adjectiveIndex = hashToIndex(odentifier, ADJECTIVES.length);
  const nounIndex = hashToIndex(odentifier + "noun", NOUNS.length);

  const name = `${ADJECTIVES[adjectiveIndex]} ${NOUNS[nounIndex]}`;
  anonymousNames.set(odentifier, name);

  return name;
}

export function clearAnonymousName(identifier: string): void {
  anonymousNames.delete(identifier);
}
