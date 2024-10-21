export const adjectives: string[] = [
  "Jiggly",
  "Cyber",
  "Fiery",
  "Electric",
  "Mighty",
  "Ancient",
  "Shadow",
  "Doom",
  "Lunar",
  "Stellar",
  "Infernal",
  "Quantum",
  "Nova",
  "Hydrous",
  "Eternal",
  "Spectral",
  "Radiant",
  "Crimson",
  "Nebulous",
  "Galactic",
  "Celestial",
  "Arcane",
  "Mythic",
  "Blazing",
  "Phantom",
  "Silent",
  "Ironclad",
  "Ethereal",
  "Temporal",
  "Vortex",
  "Echoing",
  "Twilight",
  "Venomous",
  "Spectral",
  "Astral",
  "Gloomy",
  "Ember",
  "Titanic",
  "Frosty",
  "Thunderous",
  "Solar",
  "Obsidian",
  "Harbinger",
  "Majestic",
  "Feral",
  "Savage",
  "Void",
  "Arcadian",
  "Primal",
  "Serene",
  "Mystic",
  "Chromatic",
  "Zealous",
  "Vigilant",
  "Whispering",
  "Enigmatic",
  "Luminescent",
  "Transient",
  "Paradoxical",
  "Infinite",
  "Sovereign",
  "Abyssal",
  "Runic",
  "Eclipse",
  "Radiant",
  "Celestial",
  "Harmonic",
  "Verdant",
  "Azure",
  "Scarlet",
  "Monolithic",
  "Reverent",
  "Temporal",
  "Echoing",
  "Nebular",
  "Mercurial",
  "Astral",
  "Empyreal",
  "Arcadian",
  "Resilient",
  "Immutable",
  "Synergistic",
  "Adaptive",
  "Enlightened",
  "Transcendent",
  "Epochal",
  "Primordial",
  "Kinetic",
  "Chimeric",
  "Spectral",
  "Voltaic",
  "Zenith",
  "Nexus",
  "Arcane",
  "Cryptic",
  "Phantasmal",
  "Luminous",
  "Sublime",
  "Obscure",
  "Harmonic",
  "Catalytic",
  "Celestial",
];

export const nouns: string[] = [
  "Blockfrost",
  "Demon",
  "Hydra",
  "Imp",
  "Cacodemon",
  "Ouroboros",
  "Chain",
  "Stake",
  "Epoch",
  "Node",
  "Wallet",
  "BFG",
  "Portal",
  "Serpent",
  "Doomguy",
  "Cardano",
  "Plutus",
  "Byron",
  "Shelley",
  "Gorgon",
  "Leviathan",
  "Spectre",
  "Wraith",
  "Phoenix",
  "Dragon",
  "Revenant",
  "Marauder",
  "Sentinel",
  "Harbinger",
  "Oracle",
  "Enigma",
  "Chimera",
  "Titan",
  "Nebula",
  "Quantum",
  "Matrix",
  "Cipher",
  "Vortex",
  "Equinox",
  "Zenith",
  "Eclipse",
  "Obsidian",
  "Crusader",
  "Guardian",
  "Vanguard",
  "Catalyst",
  "Monolith",
  "Synergy",
  "Continuum",
  "Genesis",
  "Labyrinth",
  "Nimbus",
  "Odyssey",
  "Paragon",
  "Quasar",
  "Redux",
  "Specter",
  "Tempest",
  "Umbra",
  "Vertex",
  "Whisper",
  "Xenith",
  "Zephyr",
  "Aegis",
  "Beacon",
  "Cipher",
  "Drifter",
  "Eon",
  "Fury",
  "Gauntlet",
  "Horizon",
  "Infinity",
  "Juggernaut",
  "Kraken",
  "Legacy",
  "Maelstrom",
  "Nexus",
  "Oblivion",
  "Phantom",
  "Quicksilver",
  "Rift",
  "Sage",
  "Terminus",
  "Umbra",
  "Valkyrie",
  "Warp",
  "Xenon",
  "Yonder",
  "Zealot",
  "Ascendant",
  "Brigade",
  "Conduit",
  "Dynasty",
  "Epoch",
  "Fusion",
  "Glyph",
  "Helix",
  "Ion",
  "Javelin",
  "Kismet",
  "Luminary",
  "Myriad",
  "Nimbus",
  "Oracle",
  "Pinnacle",
  "Quintessence",
  "Rapture",
  "Solstice",
  "Tribune",
  "Utopia",
  "Vortex",
  "Warden",
  "Zenith",
];

export const generateRandomName = (): string => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
};
