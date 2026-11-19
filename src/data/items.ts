import { ShopItem } from '../types/game';

export const SHOP_ITEMS: ShopItem[] = [
  // Movement
  {
    id: 'sky_wind_boots',
    name: { id: 'Sepatu Angin Langit', en: 'Skywind Boots' },
    category: 'Movement',
    cost: 320,
    description: {
      id: 'Meningkatkan kecepatan gerak secara konsisten di seluruh lane Aetheria.',
      en: 'Steadily increases movement speed across all lanes of Aetheria.',
    },
    recommendedRoles: ['Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'],
    stats: { moveSpeed: 42 },
    colorHex: '#8CCFFF',
  },
  {
    id: 'aether_swift_greaves',
    name: { id: 'Pelindung Kaki Cepat', en: 'Aether Swift Greaves' },
    category: 'Movement',
    cost: 720,
    description: {
      id: 'Sepatu tempur ringan yang menambah kecepatan serangan dan mobilitas.',
      en: 'Lightweight battle greaves boosting attack speed and mobility.',
    },
    recommendedRoles: ['Marksman', 'Assassin', 'Fighter'],
    stats: { moveSpeed: 55, attackSpeedPct: 18 },
    colorHex: '#60B5FF',
  },
  {
    id: 'blossom_arcane_shoes',
    name: { id: 'Sepatu Sakura Arkana', en: 'Blossom Arcane Shoes' },
    category: 'Movement',
    cost: 740,
    description: {
      id: 'Sepatu sihir yang mempercepat pemulihan cooldown skill.',
      en: 'Enchanted shoes that accelerate ability cooldown recovery.',
    },
    recommendedRoles: ['Mage', 'Support'],
    stats: { moveSpeed: 50, cooldownReductionPct: 12, maxMana: 150 },
    colorHex: '#FFB8D2',
  },

  // Attack
  {
    id: 'azure_edge_blade',
    name: { id: 'Pedang Tepi Biru', en: 'Azure Edge Blade' },
    category: 'Attack',
    cost: 650,
    description: {
      id: 'Bilahan kristal tajam untuk duel awal permainan.',
      en: 'Sharp crystal blade crafted for early-game skirmishes.',
    },
    recommendedRoles: ['Fighter', 'Assassin', 'Marksman'],
    stats: { attack: 28, attackSpeedPct: 10 },
    colorHex: '#3478D4',
  },
  {
    id: 'valkyrie_sky_lance',
    name: { id: 'Tombak Langit Valkyrie', en: 'Valkyrie Skylance' },
    category: 'Attack',
    cost: 1450,
    description: {
      id: 'Tombak agung yang memberikan serangan fisik besar dan lifesteal.',
      en: 'Noble lance granting high physical attack and lifesteal sustain.',
    },
    passiveEffect: {
      id: 'Pasif: Serangan dasar memulihkan 12% HP dari damage.',
      en: 'Passive: Basic attacks restore 12% of damage dealt as HP.',
    },
    recommendedRoles: ['Fighter', 'Marksman'],
    stats: { attack: 58, lifestealPct: 12, maxHp: 180 },
    colorHex: '#4E8FE6',
  },
  {
    id: 'crimson_petal_daggers',
    name: { id: 'Belati Kelopak Senja', en: 'Sakura Shadow Daggers' },
    category: 'Attack',
    cost: 1620,
    description: {
      id: 'Belati kembar berkecepatan tinggi untuk menghabisi target rentan.',
      en: 'High-tempo twin daggers engineered to burst fragile targets.',
    },
    recommendedRoles: ['Assassin', 'Marksman'],
    stats: { attack: 64, attackSpeedPct: 28, moveSpeed: 18 },
    colorHex: '#F071A1',
  },
  {
    id: 'sovereign_sun_bow',
    name: { id: 'Busur Penguasa Surya', en: 'Sovereign Dawn Bow' },
    category: 'Attack',
    cost: 1880,
    description: {
      id: 'Senjata jarak jauh puncak yang menembus pertahanan berat.',
      en: 'Apex ranged weapon forged to shred heavy armor.',
    },
    recommendedRoles: ['Marksman', 'Fighter'],
    stats: { attack: 78, attackSpeedPct: 35 },
    colorHex: '#FFB8D2',
  },

  // Magic
  {
    id: 'cloud_crystal_wand',
    name: { id: 'Tongkat Kristal Awan', en: 'Cloud Crystal Wand' },
    category: 'Magic',
    cost: 680,
    description: {
      id: 'Fokus sihir dasar yang meningkatkan kekuatan mantra dan mana.',
      en: 'Foundational arcane focus enhancing spell power and mana pool.',
    },
    recommendedRoles: ['Mage', 'Support'],
    stats: { magicPower: 38, maxMana: 200 },
    colorHex: '#8CCFFF',
  },
  {
    id: 'rose_quartz_grimoire',
    name: { id: 'Kitab Kuarsa Mawar', en: 'Rose Quartz Grimoire' },
    category: 'Magic',
    cost: 1480,
    description: {
      id: 'Buku mantra kerajaan yang mempercepat rotasi skill tim.',
      en: 'Royal spellbook accelerating ability rotation in team fights.',
    },
    recommendedRoles: ['Mage', 'Support'],
    stats: { magicPower: 75, cooldownReductionPct: 18, maxMana: 320 },
    colorHex: '#FFB8D2',
  },
  {
    id: 'astral_crown_scepter',
    name: { id: 'Tongkat Mahkota Astral', en: 'Astral Crown Scepter' },
    category: 'Magic',
    cost: 1920,
    description: {
      id: 'Artefak sihir legendaris yang melipatgandakan daya ledak skill.',
      en: 'Legendary arcane artifact amplifying spell burst damage.',
    },
    recommendedRoles: ['Mage'],
    stats: { magicPower: 115, maxHp: 220, cooldownReductionPct: 10 },
    colorHex: '#3478D4',
  },

  // Defense
  {
    id: 'marble_bastion_plate',
    name: { id: 'Zirah Benteng Marmer', en: 'Marble Bastion Plate' },
    category: 'Defense',
    cost: 760,
    description: {
      id: 'Pelindung dada kokoh untuk menahan serangan fisik turret dan hero.',
      en: 'Sturdy chestplate built to endure turret and physical hero hits.',
    },
    recommendedRoles: ['Tank', 'Fighter', 'Support'],
    stats: { maxHp: 380, armor: 28 },
    colorHex: '#93B7D8',
  },
  {
    id: 'aetheria_guardian_aegis',
    name: { id: 'Perisai Pelindung Aetheria', en: 'Aetheria Guardian Aegis' },
    category: 'Defense',
    cost: 1580,
    description: {
      id: 'Zirah elit penjaga benteng dengan ketahanan fisik dan sihir seimbang.',
      en: 'Elite citadel armor offering balanced physical and magic defense.',
    },
    recommendedRoles: ['Tank', 'Fighter'],
    stats: { maxHp: 780, armor: 48, magicResist: 30 },
    colorHex: '#3478D4',
  },
  {
    id: 'sakura_sanctuary_cloak',
    name: { id: 'Jubah Suaka Sakura', en: 'Sakura Sanctuary Cloak' },
    category: 'Defense',
    cost: 1460,
    description: {
      id: 'Jubah berlapis rune mawar yang meredam sihir area lawan.',
      en: 'Rose-rune woven cloak that dampens enemy area magic damage.',
    },
    recommendedRoles: ['Tank', 'Support', 'Fighter'],
    stats: { maxHp: 620, magicResist: 54, cooldownReductionPct: 8 },
    colorHex: '#FFB8D2',
  },

  // Utility
  {
    id: 'starlight_harmony_chalice',
    name: { id: 'Piala Harmoni Bintang', en: 'Starlight Harmony Chalice' },
    category: 'Utility',
    cost: 1240,
    description: {
      id: 'Relik pendukung untuk menjaga daya tahan mana dan cooldown selama perang panjang.',
      en: 'Support relic sustaining mana and cooldowns during prolonged sieges.',
    },
    recommendedRoles: ['Support', 'Mage'],
    stats: { maxHp: 300, maxMana: 420, magicPower: 42, cooldownReductionPct: 15 },
    colorHex: '#B9E3FF',
  },
  {
    id: 'horizon_wind_orb',
    name: { id: 'Bola Angin Horizon', en: 'Horizon Wind Orb' },
    category: 'Utility',
    cost: 1320,
    description: {
      id: 'Memperkuat kecepatan rotasi antar lane dan daya tahan bertempur.',
      en: 'Enhances cross-lane rotation speed and skirmish durability.',
    },
    recommendedRoles: ['Support', 'Tank', 'Assassin'],
    stats: { maxHp: 360, moveSpeed: 28, armor: 18, cooldownReductionPct: 10 },
    colorHex: '#8CCFFF',
  },
];
