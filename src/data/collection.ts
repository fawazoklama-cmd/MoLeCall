import { CollectionCosmetic, GameSettings, PrivateProfile, PublicProfile } from '../types/game';

export const COLLECTION_COSMETICS: CollectionCosmetic[] = [
  // Emotes
  {
    id: 'emote_gg_sky',
    type: 'emote',
    name: { id: 'Salam Langit GG', en: 'Sky Salute GG' },
    description: {
      id: 'Ekspresi penghormatan bercahaya biru langit saat menangkan duel.',
      en: 'Sky-blue salute emote after winning a duel.',
    },
    costShards: 0,
    accentColor: '#3478D4',
    symbol: '★',
  },
  {
    id: 'emote_sakura_wink',
    type: 'emote',
    name: { id: 'Kelopak Kemenangan', en: 'Sakura Victory' },
    description: {
      id: 'Kelopak bunga mawar berjatuhan untuk merayakan eliminasi.',
      en: 'Floating rose petals celebrating an elimination.',
    },
    costShards: 220,
    accentColor: '#FFB8D2',
    symbol: '✿',
  },
  {
    id: 'emote_crown_call',
    type: 'emote',
    name: { id: 'Panggilan Raja', en: 'Crown Call' },
    description: {
      id: 'Simbol mahkota Aetheria untuk memanggil serangan tim.',
      en: 'Aetheria crown sigil rallying teammates to push.',
    },
    costShards: 320,
    accentColor: '#8CCFFF',
    symbol: '♛',
  },

  // Borders
  {
    id: 'border_sky_classic',
    type: 'border',
    name: { id: 'Bingkai Awan Biru', en: 'Sky Cloud Frame' },
    description: {
      id: 'Bingkai standar warga kerajaan Aetheria.',
      en: 'Standard luminous sky-cloud avatar frame.',
    },
    costShards: 0,
    accentColor: '#8CCFFF',
    symbol: '◇',
  },
  {
    id: 'border_sakura_royal',
    type: 'border',
    name: { id: 'Bingkai Sakura Kerajaan', en: 'Royal Sakura Frame' },
    description: {
      id: 'Bingkai berhias kristal mawar lembut dengan kilau biru.',
      en: 'Soft rose-crystal frame with azure trim.',
    },
    costShards: 280,
    accentColor: '#FFB8D2',
    symbol: '❖',
  },
  {
    id: 'border_aetheria_crest',
    type: 'border',
    name: { id: 'Bingkai Benteng Agung', en: 'Grand Citadel Frame' },
    description: {
      id: 'Bingkai elit bagi para komandan penakluk Aetheria.',
      en: 'Elite frame awarded to dedicated Aetheria commanders.',
    },
    costShards: 480,
    accentColor: '#3478D4',
    symbol: '◈',
  },

  // Avatars
  {
    id: 'avatar_aether',
    type: 'avatar',
    name: { id: 'Ikon Aether', en: 'Aether Crest' },
    description: { id: 'Potret resmi Aether sang Penyihir Cakrawala.', en: 'Official portrait of Aether.' },
    costShards: 0,
    accentColor: '#5EB6FF',
    symbol: 'aether',
  },
  {
    id: 'avatar_valeria',
    type: 'avatar',
    name: { id: 'Ikon Valeria', en: 'Valeria Crest' },
    description: { id: 'Potret resmi Valeria sang Pemanah Bintang.', en: 'Official portrait of Valeria.' },
    costShards: 0,
    accentColor: '#F071A1',
    symbol: 'valeria',
  },
  {
    id: 'avatar_kael',
    type: 'avatar',
    name: { id: 'Ikon Kael', en: 'Kael Crest' },
    description: { id: 'Potret resmi Kael sang Bayangan Angin.', en: 'Official portrait of Kael.' },
    costShards: 180,
    accentColor: '#172B49',
    symbol: 'kael',
  },
  {
    id: 'avatar_seraphina',
    type: 'avatar',
    name: { id: 'Ikon Seraphina', en: 'Seraphina Crest' },
    description: { id: 'Potret resmi Seraphina sang Malaikat Harmoni.', en: 'Official portrait of Seraphina.' },
    costShards: 180,
    accentColor: '#FFB8D2',
    symbol: 'seraphina',
  },
];

export const DEFAULT_SETTINGS: GameSettings = {
  language: 'id',
  soundVolume: 0.65,
  musicVolume: 0.35,
  muted: false,
  graphicsQuality: 'high',
  fpsLimit: 60,
  cameraSensitivity: 1.0,
  controlScheme: 'pc_hybrid',
};

export function createStarterPublicProfile(uid: string, username: string, isGuest = false): PublicProfile {
  const numCode = Math.abs(
    uid.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 7)
  ) % 9000 + 1000;

  return {
    uid,
    username: username.slice(0, 24) || (isGuest ? 'AetherGuest' : 'SkyPlayer'),
    playerId: `MLC-${numCode}`,
    avatar: 'avatar_aether',
    borderId: 'border_sky_classic',
    rankTier: 'Silver',
    rankPoints: 420,
    level: 4,
    exp: 240,
    wins: 3,
    losses: 1,
    totalMatches: 4,
    favoriteHeroId: 'aether',
    onlineStatus: 'online',
    updatedAt: new Date().toISOString(),
  };
}

export function createStarterPrivateProfile(uid: string, email?: string): PrivateProfile {
  return {
    uid,
    email,
    aetherShards: 950,
    ownedHeroIds: ['aether', 'valeria', 'kael', 'seraphina', 'draven', 'ragnar'],
    ownedSkinIds: [
      'aether_classic',
      'valeria_classic',
      'kael_classic',
      'seraphina_classic',
      'draven_classic',
      'ragnar_classic',
    ],
    ownedEmoteIds: ['emote_gg_sky'],
    ownedBorderIds: ['border_sky_classic'],
    ownedAvatarIds: ['avatar_aether', 'avatar_valeria'],
    achievements: ['first_call'],
    settings: { ...DEFAULT_SETTINGS },
    updatedAt: new Date().toISOString(),
  };
}
