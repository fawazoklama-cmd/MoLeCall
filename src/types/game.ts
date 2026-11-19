export type Language = 'id' | 'en';

export type HeroRole = 'Tank' | 'Fighter' | 'Assassin' | 'Mage' | 'Marksman' | 'Support';

export type RankTier =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Master'
  | 'Grandmaster'
  | 'Challenger';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface BilingualText {
  id: string;
  en: string;
}

export interface HeroAbility {
  key: 'Passive' | 'Q' | 'E' | 'R';
  name: BilingualText;
  description: BilingualText;
  cooldownSec: number;
  manaCost: number;
  baseDamage: number;
  scalingRatio: number; // Scales with attack or magicPower
  scalingStat: 'attack' | 'magic' | 'maxHp';
  range: number;
  radius: number;
  kind: 'passive' | 'projectile' | 'aoe' | 'dash' | 'heal_shield' | 'buff';
  colorHex: string;
}

export interface HeroBaseStats {
  maxHp: number;
  maxMana: number;
  attack: number;
  magicPower: number;
  armor: number;
  magicResist: number;
  moveSpeed: number;
  attackRange: number;
  attackSpeed: number; // attacks per second
}

export interface HeroSkin {
  id: string;
  heroId: string;
  name: BilingualText;
  rarity: 'Classic' | 'Celestial' | 'Blossom';
  costShards: number;
  primaryColor: string;
  accentColor: string;
}

export interface HeroDefinition {
  id: string;
  name: string;
  title: BilingualText;
  gender: 'Male' | 'Female';
  role: HeroRole;
  portraitUrl?: string; // Generated key artwork for featured heroes
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    cloak: string;
  };
  lore: BilingualText;
  difficultyRating: 1 | 2 | 3;
  costShards: number;
  stats: HeroBaseStats;
  abilities: {
    passive: HeroAbility;
    q: HeroAbility;
    e: HeroAbility;
    r: HeroAbility;
  };
  skins: HeroSkin[];
}

export type ItemCategory = 'Attack' | 'Magic' | 'Defense' | 'Movement' | 'Utility';

export interface ShopItem {
  id: string;
  name: BilingualText;
  category: ItemCategory;
  cost: number;
  description: BilingualText;
  passiveEffect?: BilingualText;
  recommendedRoles: HeroRole[];
  stats: {
    attack?: number;
    magicPower?: number;
    maxHp?: number;
    maxMana?: number;
    armor?: number;
    magicResist?: number;
    moveSpeed?: number;
    attackSpeedPct?: number;
    cooldownReductionPct?: number;
    lifestealPct?: number;
  };
  colorHex: string;
}

export interface GameSettings {
  language: Language;
  soundVolume: number; // 0..1
  musicVolume: number; // 0..1
  muted: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  fpsLimit: 30 | 60;
  cameraSensitivity: number; // 0.5..2.0
  controlScheme: 'pc_hybrid' | 'mobile_touch';
}

export interface PublicProfile {
  uid: string;
  username: string;
  playerId: string;
  avatar: string;
  borderId: string;
  rankTier: RankTier;
  rankPoints: number;
  level: number;
  exp: number;
  wins: number;
  losses: number;
  totalMatches: number;
  favoriteHeroId: string;
  onlineStatus: 'online' | 'offline' | 'in_match';
  updatedAt: string;
}

export interface PrivateProfile {
  uid: string;
  email?: string;
  aetherShards: number;
  ownedHeroIds: string[];
  ownedSkinIds: string[];
  ownedEmoteIds: string[];
  ownedBorderIds: string[];
  ownedAvatarIds: string[];
  achievements: string[];
  settings: GameSettings;
  updatedAt: string;
}

export interface MatchRecord {
  id: string;
  ownerUid: string;
  mode: 'offline_ai' | 'online_demo' | 'online_5v5';
  difficulty?: Difficulty | 'ranked';
  heroId: string;
  result: 'victory' | 'defeat';
  kills: number;
  deaths: number;
  assists: number;
  goldEarned: number;
  durationSec: number;
  createdAt: string;
}

export interface Friendship {
  id: string;
  requesterUid: string;
  recipientUid: string;
  requesterName: string;
  recipientName: string;
  status: 'pending' | 'accepted';
  createdAt: string;
  updatedAt: string;
}

export interface NewsArticle {
  id: string;
  category: 'update' | 'hero' | 'balance' | 'event' | 'patch';
  version: string;
  publishedAt: string;
  title: BilingualText;
  summary: BilingualText;
  details: {
    id: string[];
    en: string[];
  };
}

export interface CollectionCosmetic {
  id: string;
  type: 'emote' | 'border' | 'avatar';
  name: BilingualText;
  description: BilingualText;
  costShards: number;
  accentColor: string;
  symbol: string;
}

export interface LobbyPlayerSlot {
  slotIndex: number;
  team: 'blue' | 'red';
  uid: string;
  username: string;
  isBot: boolean;
  heroId: string;
  ready: boolean;
}

export interface OnlineRoom {
  id: string;
  name: string;
  hostUid: string;
  hostName: string;
  mode: '5v5_custom' | '5v5_quick';
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  countdownSec: number;
  slots: LobbyPlayerSlot[];
  chat: Array<{ id: string; sender: string; text: string; ts: number }>;
  createdAt: number;
}

export interface LiveMatchStats {
  heroId: string;
  mode: 'offline_ai' | 'online_demo' | 'online_5v5';
  difficulty: Difficulty;
  result: 'victory' | 'defeat';
  kills: number;
  deaths: number;
  assists: number;
  goldEarned: number;
  durationSec: number;
  blueKills: number;
  redKills: number;
  turretsDestroyed: number;
}
