import React from 'react';
import { RANK_TIERS } from '../data/ranks';
import { RankTier } from '../types/game';

interface RankEmblemProps {
  tier: RankTier;
  size?: number;
}

export const RankEmblem: React.FC<RankEmblemProps> = ({ tier, size = 36 }) => {
  const info = RANK_TIERS.find((r) => r.tier === tier) || RANK_TIERS[0];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={tier}
    >
      <path
        d="M24 4L40 13V26C40 35 32.5 41.5 24 44C15.5 41.5 8 35 8 26V13L24 4Z"
        fill={info.primaryColor}
        stroke="#172B49"
        strokeWidth="2.2"
      />
      <path
        d="M24 9L34 15V25C34 31.2 29.5 36.2 24 38.2C18.5 36.2 14 31.2 14 25V15L24 9Z"
        fill={info.secondaryColor}
      />
      <path d="M24 13L30 22L24 33L18 22L24 13Z" fill={info.accentColor} stroke="#172B49" strokeWidth="1.5" />
      {(tier === 'Grandmaster' || tier === 'Challenger' || tier === 'Master') && (
        <path d="M16 9L24 3L32 9" stroke="#FFB8D2" strokeWidth="2.5" strokeLinecap="round" />
      )}
    </svg>
  );
};
