import { BilingualText, RankTier } from '../types/game';

export interface RankTierInfo {
  tier: RankTier;
  minPoints: number;
  maxPoints: number;
  label: BilingualText;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export const RANK_TIERS: RankTierInfo[] = [
  {
    tier: 'Bronze',
    minPoints: 0,
    maxPoints: 299,
    label: { id: 'Perunggu', en: 'Bronze' },
    primaryColor: '#C58B65',
    secondaryColor: '#8E5A3B',
    accentColor: '#FFE0EC',
  },
  {
    tier: 'Silver',
    minPoints: 300,
    maxPoints: 599,
    label: { id: 'Perak', en: 'Silver' },
    primaryColor: '#A6C0D8',
    secondaryColor: '#69839D',
    accentColor: '#E8F4FF',
  },
  {
    tier: 'Gold',
    minPoints: 600,
    maxPoints: 999,
    label: { id: 'Emas', en: 'Gold' },
    primaryColor: '#F3C75F',
    secondaryColor: '#C89228',
    accentColor: '#FFF7D6',
  },
  {
    tier: 'Platinum',
    minPoints: 1000,
    maxPoints: 1499,
    label: { id: 'Platinum', en: 'Platinum' },
    primaryColor: '#68D1E6',
    secondaryColor: '#2B8FA6',
    accentColor: '#E0FAFF',
  },
  {
    tier: 'Diamond',
    minPoints: 1500,
    maxPoints: 2099,
    label: { id: 'Berlian', en: 'Diamond' },
    primaryColor: '#60AEFF',
    secondaryColor: '#2E62B8',
    accentColor: '#DDF0FF',
  },
  {
    tier: 'Master',
    minPoints: 2100,
    maxPoints: 2799,
    label: { id: 'Master', en: 'Master' },
    primaryColor: '#EE8BB5',
    secondaryColor: '#B8477B',
    accentColor: '#FFE4F0',
  },
  {
    tier: 'Grandmaster',
    minPoints: 2800,
    maxPoints: 3599,
    label: { id: 'Grandmaster', en: 'Grandmaster' },
    primaryColor: '#5B98F6',
    secondaryColor: '#1E4690',
    accentColor: '#FFB8D2',
  },
  {
    tier: 'Challenger',
    minPoints: 3600,
    maxPoints: 999999,
    label: { id: 'Challenger', en: 'Challenger' },
    primaryColor: '#3478D4',
    secondaryColor: '#172B49',
    accentColor: '#FFB8D2',
  },
];

export function getRankForPoints(points: number): RankTierInfo {
  const clamped = Math.max(0, Math.floor(points));
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (clamped >= RANK_TIERS[i].minPoints) {
      return RANK_TIERS[i];
    }
  }
  return RANK_TIERS[0];
}
