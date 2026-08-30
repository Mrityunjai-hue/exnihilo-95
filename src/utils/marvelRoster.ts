/**
 * marvelRoster.ts — 55+ Mini Marvel Characters Roster & Shuffle Queue Engine
 */

export interface MarvelCharacter {
  id: string;
  name: string;
  emoji: string;
  badgeColor: string;
  victoryQuote: string;
  teaserQuote: string;
  animationType: 'walk' | 'fly' | 'bounce' | 'dash' | 'hover';
}

export const MARVEL_ROSTER: MarvelCharacter[] = [
  // Avengers & Core Heroes (1-20)
  {
    id: 'spiderman',
    name: 'Spider-Man',
    emoji: '🕷️',
    badgeColor: '#e63946',
    victoryQuote: 'Web-Slinging SQL Master!',
    teaserQuote: 'My Spidey-Sense detects a syntax error!',
    animationType: 'dash',
  },
  {
    id: 'ironman',
    name: 'Iron Man',
    emoji: '🤖',
    badgeColor: '#d62828',
    victoryQuote: 'Jarvis: Query Execution 100% Efficient!',
    teaserQuote: 'Jarvis: Syntax error at line 1!',
    animationType: 'fly',
  },
  {
    id: 'thor',
    name: 'Thor',
    emoji: '⚡',
    badgeColor: '#0077b6',
    victoryQuote: "By Odin's Beard! Magnificent Join!",
    teaserQuote: 'Mjolnir demands a WHERE clause!',
    animationType: 'fly',
  },
  {
    id: 'capamerica',
    name: 'Captain America',
    emoji: '🛡️',
    badgeColor: '#1d3557',
    victoryQuote: 'I Can Write SQL All Day!',
    teaserQuote: 'Assemble your syntax correctly, soldier!',
    animationType: 'walk',
  },
  {
    id: 'hulk',
    name: 'Hulk',
    emoji: '💚',
    badgeColor: '#2a9d8f',
    victoryQuote: 'HULK SMASH DATABASE ERRORS!',
    teaserQuote: 'Hulk angry at broken query!',
    animationType: 'bounce',
  },
  {
    id: 'deadpool',
    name: 'Deadpool',
    emoji: '⚔️',
    badgeColor: '#b7094c',
    victoryQuote: '100% Correct! Give yourself a taco!',
    teaserQuote: 'Nice try query wizard! Check your JOINs!',
    animationType: 'bounce',
  },
  {
    id: 'blackpanther',
    name: 'Black Panther',
    emoji: '🐾',
    badgeColor: '#3a0ca3',
    victoryQuote: 'Wakanda Forever! Flawless Schema!',
    teaserQuote: 'Vibranium shield blocked that error!',
    animationType: 'dash',
  },
  {
    id: 'drstrange',
    name: 'Doctor Strange',
    emoji: '🧙‍♂️',
    badgeColor: '#7209b7',
    victoryQuote: 'I Saw 14 Million Queries, This Was The Best!',
    teaserQuote: 'Bargained with SQLite and failed!',
    animationType: 'hover',
  },
  {
    id: 'scarletwitch',
    name: 'Scarlet Witch',
    emoji: '🔮',
    badgeColor: '#9d0208',
    victoryQuote: 'You Rewrote Reality... And The Query Passed!',
    teaserQuote: 'Reality distorted your columns!',
    animationType: 'hover',
  },
  {
    id: 'blackwidow',
    name: 'Black Widow',
    emoji: '🕷️',
    badgeColor: '#212529',
    victoryQuote: 'Stealthy, Precise, Perfect Query!',
    teaserQuote: 'Classified failure! Try again!',
    animationType: 'dash',
  },
  {
    id: 'hawkeye',
    name: 'Hawkeye',
    emoji: '🏹',
    badgeColor: '#5c677d',
    victoryQuote: 'Bullseye! 100% Query Precision!',
    teaserQuote: 'Missed the target by one parenthesis!',
    animationType: 'walk',
  },
  {
    id: 'antman',
    name: 'Ant-Man',
    emoji: '🐜',
    badgeColor: '#d90429',
    victoryQuote: 'Sub-Atomic Precision SQL!',
    teaserQuote: 'Shrank your results to zero rows!',
    animationType: 'bounce',
  },
  {
    id: 'wasp',
    name: 'Wasp',
    emoji: '🐝',
    badgeColor: '#ffb703',
    victoryQuote: 'Stinging Performance!',
    teaserQuote: 'Stung by a missing alias!',
    animationType: 'fly',
  },
  {
    id: 'falcon',
    name: 'Falcon',
    emoji: '🦅',
    badgeColor: '#800020',
    victoryQuote: 'Taking SQL To New Heights!',
    teaserQuote: 'Turbulence in your execution plan!',
    animationType: 'fly',
  },
  {
    id: 'wintersoldier',
    name: 'Winter Soldier',
    emoji: '🦾',
    badgeColor: '#4a5759',
    victoryQuote: 'Armored Query Precision!',
    teaserQuote: 'Memory wiped! Retry the query!',
    animationType: 'walk',
  },
  {
    id: 'captmarvel',
    name: 'Captain Marvel',
    emoji: '⭐',
    badgeColor: '#023e8a',
    victoryQuote: 'Higher, Further, Faster SQL!',
    teaserQuote: 'Photon blast destroyed syntax!',
    animationType: 'fly',
  },
  {
    id: 'vision',
    name: 'Vision',
    emoji: '🤖',
    badgeColor: '#005f73',
    victoryQuote: 'A Synthezoid-Level SQL Execution!',
    teaserQuote: 'Mind Stone detects illegal GROUP BY!',
    animationType: 'hover',
  },
  {
    id: 'warmachine',
    name: 'War Machine',
    emoji: '🛡️',
    badgeColor: '#343a40',
    victoryQuote: 'Heavy Artillery Query Solved!',
    teaserQuote: 'Boom! You looking for an error?',
    animationType: 'fly',
  },
  {
    id: 'shehulk',
    name: 'She-Hulk',
    emoji: '🟩',
    badgeColor: '#38b000',
    victoryQuote: 'Legal Brief & SQL Case Closed!',
    teaserQuote: 'Objection! Sustained syntax error!',
    animationType: 'walk',
  },
  {
    id: 'moonknight',
    name: 'Moon Knight',
    emoji: '🌙',
    badgeColor: '#e9ecef',
    victoryQuote: "By Khonshu's Light, Solved!",
    teaserQuote: 'Khonshu is displeased with NULL values!',
    animationType: 'hover',
  },

  // X-Men & Mutants (21-35)
  {
    id: 'wolverine',
    name: 'Wolverine',
    emoji: '🐺',
    badgeColor: '#ffb703',
    victoryQuote: 'Slashed Through That Challenge, Bub!',
    teaserQuote: "Claws can't fix bad syntax, bub!",
    animationType: 'dash',
  },
  {
    id: 'cyclops',
    name: 'Cyclops',
    emoji: '👁️',
    badgeColor: '#c1121f',
    victoryQuote: 'Optic Precision Query!',
    teaserQuote: 'Optic blast hit an invalid column!',
    animationType: 'walk',
  },
  {
    id: 'jeangrey',
    name: 'Jean Grey',
    emoji: '🔥',
    badgeColor: '#e07a5f',
    victoryQuote: 'Unstoppable Telepathic Code!',
    teaserQuote: 'Phoenix force consumed your query!',
    animationType: 'hover',
  },
  {
    id: 'storm',
    name: 'Storm',
    emoji: '🌩️',
    badgeColor: '#48cae4',
    victoryQuote: 'A Tempest Of SQL Excellence!',
    teaserQuote: 'Lightning struck your semicolon!',
    animationType: 'fly',
  },
  {
    id: 'gambit',
    name: 'Gambit',
    emoji: '🃏',
    badgeColor: '#9b5de5',
    victoryQuote: 'Charged Card & Solved Challenge, Mon Cher!',
    teaserQuote: 'Bluffed with bad syntax, mon cher!',
    animationType: 'dash',
  },
  {
    id: 'rogue',
    name: 'Rogue',
    emoji: '💖',
    badgeColor: '#f15bb5',
    victoryQuote: 'Absorbed All The SQL Knowledge!',
    teaserQuote: 'Absorbed an error from SQLite!',
    animationType: 'walk',
  },
  {
    id: 'professorx',
    name: 'Professor X',
    emoji: '🧠',
    badgeColor: '#0077b6',
    victoryQuote: 'Mind Over Relational Algebra!',
    teaserQuote: 'Telepathic probe found missing comma!',
    animationType: 'hover',
  },
  {
    id: 'beast',
    name: 'Beast',
    emoji: '🔵',
    badgeColor: '#03045e',
    victoryQuote: 'Fascinating Algorithmic Solution!',
    teaserQuote: 'Indubitably an invalid expression!',
    animationType: 'bounce',
  },
  {
    id: 'nightcrawler',
    name: 'Nightcrawler',
    emoji: '💨',
    badgeColor: '#5a189a',
    victoryQuote: 'BAMF! Instant SQL Execution!',
    teaserQuote: 'BAMF! Teleported away from the answer!',
    animationType: 'dash',
  },
  {
    id: 'colossus',
    name: 'Colossus',
    emoji: '🧱',
    badgeColor: '#6c757d',
    victoryQuote: 'Steel-Solid Database Logic!',
    teaserQuote: 'Steel armor bounced your query back!',
    animationType: 'walk',
  },
  {
    id: 'iceman',
    name: 'Iceman',
    emoji: '❄️',
    badgeColor: '#90e0ef',
    victoryQuote: 'Cool, Crisp SQL Output!',
    teaserQuote: 'Froze on line 1!',
    animationType: 'hover',
  },
  {
    id: 'magneto',
    name: 'Magneto',
    emoji: '🧲',
    badgeColor: '#7209b7',
    victoryQuote: 'Master Of Magnetic Data Extraction!',
    teaserQuote: 'Magnetic field disrupted your syntax!',
    animationType: 'hover',
  },
  {
    id: 'mystique',
    name: 'Mystique',
    emoji: '💙',
    badgeColor: '#0096c7',
    victoryQuote: 'Seamlessly Transformed The Data!',
    teaserQuote: 'Disguised an invalid keyword!',
    animationType: 'walk',
  },
  {
    id: 'sunspot',
    name: 'Sunspot',
    emoji: '☀️',
    badgeColor: '#f77f00',
    victoryQuote: 'Solar-Powered Execution!',
    teaserQuote: 'Overheated on query execution!',
    animationType: 'fly',
  },
  {
    id: 'psylocke',
    name: 'Psylocke',
    emoji: '🗡️',
    badgeColor: '#560bad',
    victoryQuote: 'Psionic Blade Code Strike!',
    teaserQuote: 'Psionic blade slashed your string literal!',
    animationType: 'dash',
  },

  // Guardians of the Galaxy & Cosmic Heroes (36-45)
  {
    id: 'starlord',
    name: 'Star-Lord',
    emoji: '🎧',
    badgeColor: '#d62828',
    victoryQuote: 'Awesome Mix Vol. 95 Query!',
    teaserQuote: "Dance-off won't fix syntax errors!",
    animationType: 'walk',
  },
  {
    id: 'gamora',
    name: 'Gamora',
    emoji: '🗡️',
    badgeColor: '#2b9348',
    victoryQuote: 'Deadliest SQL Blade In The Galaxy!',
    teaserQuote: 'Missed the target by a mile!',
    animationType: 'dash',
  },
  {
    id: 'drax',
    name: 'Drax',
    emoji: '🤼',
    badgeColor: '#555b6e',
    victoryQuote: 'I Have Mastered The Invisible Table!',
    teaserQuote: 'Your query stood so still it disappeared!',
    animationType: 'bounce',
  },
  {
    id: 'rocket',
    name: 'Rocket Raccoon',
    emoji: '🦝',
    badgeColor: '#e07a5f',
    victoryQuote: 'Built A Better Query With Scrap!',
    teaserQuote: 'What kind of cybernetic query is this?',
    animationType: 'dash',
  },
  {
    id: 'groot',
    name: 'Groot',
    emoji: '🪵',
    badgeColor: '#6b705c',
    victoryQuote: 'I AM GROOT! (Translation: Solved!)',
    teaserQuote: 'I am Groot... (Translation: Syntax Error)',
    animationType: 'walk',
  },
  {
    id: 'mantis',
    name: 'Mantis',
    emoji: '🌸',
    badgeColor: '#a7c957',
    victoryQuote: 'I Feel Your Joy Of Passing Tests!',
    teaserQuote: 'I feel your despair of failing tests!',
    animationType: 'hover',
  },
  {
    id: 'nebula',
    name: 'Nebula',
    emoji: '🦾',
    badgeColor: '#4895ef',
    victoryQuote: 'Upgraded And Solved!',
    teaserQuote: 'Defective cybernetics! Retry!',
    animationType: 'walk',
  },
  {
    id: 'silversurfer',
    name: 'Silver Surfer',
    emoji: '🏄',
    badgeColor: '#e9ecef',
    victoryQuote: 'Riding Cosmic Waves Of Data!',
    teaserQuote: 'Lost in the cosmic void of NULLs!',
    animationType: 'hover',
  },
  {
    id: 'ghostrider',
    name: 'Ghost Rider',
    emoji: '🔥',
    badgeColor: '#f72585',
    victoryQuote: 'Penance Stare For Bad Syntax... Solved!',
    teaserQuote: 'Stared down by a Penance Error!',
    animationType: 'dash',
  },
  {
    id: 'punisher',
    name: 'Punisher',
    emoji: '💀',
    badgeColor: '#212529',
    victoryQuote: 'Executed With Zero Merciless Bugs!',
    teaserQuote: "One error and you're done! Retry!",
    animationType: 'walk',
  },

  // Spider-Verse & Street Heroes (46-55)
  {
    id: 'milesmorales',
    name: 'Miles Morales',
    emoji: '🕷️',
    badgeColor: '#b7094c',
    victoryQuote: "What's Up Danger? Solved!",
    teaserQuote: "Venom blast couldn't save that syntax!",
    animationType: 'dash',
  },
  {
    id: 'spidergwen',
    name: 'Spider-Gwen',
    emoji: '🕸️',
    badgeColor: '#ff4d6d',
    victoryQuote: 'Rhythm & SQL Beats!',
    teaserQuote: 'Missed the beat on ORDER BY!',
    animationType: 'bounce',
  },
  {
    id: 'venom',
    name: 'Venom',
    emoji: '🖤',
    badgeColor: '#10002b',
    victoryQuote: 'WE ARE... SQL MASTERS!',
    teaserQuote: 'WE ARE... CONFUSED BY THIS QUERY!',
    animationType: 'bounce',
  },
  {
    id: 'daredevil',
    name: 'Daredevil',
    emoji: '😈',
    badgeColor: '#9e2a2b',
    victoryQuote: 'Blind Justice & Flawless Code!',
    teaserQuote: "Even I couldn't hear a valid query!",
    animationType: 'walk',
  },
  {
    id: 'lukecage',
    name: 'Luke Cage',
    emoji: '👊',
    badgeColor: '#e07a5f',
    victoryQuote: 'Sweet Christmas! Clean Output!',
    teaserQuote: "Sweet Christmas! That's a syntax error!",
    animationType: 'walk',
  },
  {
    id: 'ironfist',
    name: 'Iron Fist',
    emoji: '🤛',
    badgeColor: '#52b788',
    victoryQuote: 'The Immortal Iron Query!',
    teaserQuote: 'Chi force depleted by bad syntax!',
    animationType: 'dash',
  },
  {
    id: 'jessicajones',
    name: 'Jessica Jones',
    emoji: '📷',
    badgeColor: '#3d5a80',
    victoryQuote: 'Case Investigated & Closed!',
    teaserQuote: 'I need a drink... check your query!',
    animationType: 'walk',
  },
  {
    id: 'loki',
    name: 'Loki',
    emoji: '🐍',
    badgeColor: '#2d6a4f',
    victoryQuote: 'Glorious Purpose Achieved!',
    teaserQuote: 'Is that your final SQL query?',
    animationType: 'hover',
  },
  {
    id: 'thanos',
    name: 'Thanos',
    emoji: '🫰',
    badgeColor: '#5a189a',
    victoryQuote: 'Perfectly Balanced SQL... As All Things Should Be!',
    teaserQuote: 'Snapped half your rows away!',
    animationType: 'walk',
  },
  {
    id: 'greengoblin',
    name: 'Green Goblin',
    emoji: '👺',
    badgeColor: '#38b000',
    victoryQuote: 'Godspeed, Bad Syntax!',
    teaserQuote: 'Out, am I? Check your WHERE clause!',
    animationType: 'hover',
  },
];

// Non-repeating Fisher-Yates shuffle queue
let victoryQueue: MarvelCharacter[] = [];
let teaserQueue: MarvelCharacter[] = [];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Returns the next Marvel hero for celebration or teaser without repeating
 * until the entire roster of 55 has been shown.
 */
export function getNextMarvelHero(type: 'victory' | 'teaser' = 'victory'): MarvelCharacter {
  if (type === 'victory') {
    if (victoryQueue.length === 0) {
      victoryQueue = shuffle(MARVEL_ROSTER);
    }
    return victoryQueue.pop()!;
  } else {
    if (teaserQueue.length === 0) {
      teaserQueue = shuffle(MARVEL_ROSTER);
    }
    return teaserQueue.pop()!;
  }
}
