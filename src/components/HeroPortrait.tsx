import React, { useState } from 'react';
import { HeroDefinition } from '../types/game';

interface HeroPortraitProps {
  hero: HeroDefinition;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const HeroPortrait: React.FC<HeroPortraitProps> = ({ hero, className = '', size = 'md' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (hero.portraitUrl && !imgFailed) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-[#B9E3FF] to-[#FFE0EC] ${className}`}
      >
        <img
          src={hero.portraitUrl}
          alt={hero.name}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover object-top"
        />
      </div>
    );
  }

  const isFemale = hero.gender === 'Female';
  const uid = `hp_${hero.id}`;

  // Distinct headgear/hair & weapon shapes per hero role/id so every hero has an iconic silhouette
  const renderWeapon = () => {
    switch (hero.role) {
      case 'Mage':
        return (
          <g>
            <line x1="94" y1="24" x2="88" y2="114" stroke="#172B49" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="94" cy="24" r="9" fill={hero.palette.accent} stroke="#172B49" strokeWidth="2.2" />
            <circle cx="94" cy="24" r="4" fill="#FFFFFF" />
          </g>
        );
      case 'Marksman':
        return (
          <g>
            <path d="M88 26 Q108 58 88 94" stroke={hero.palette.accent} strokeWidth="4" fill="none" strokeLinecap="round" />
            <line x1="88" y1="26" x2="88" y2="94" stroke="#172B49" strokeWidth="1.6" />
            <line x1="76" y1="60" x2="104" y2="60" stroke="#3478D4" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'Assassin':
        return (
          <g>
            <path d="M90 28 L102 68 L84 68 Z" fill={hero.palette.secondary} stroke="#172B49" strokeWidth="2" />
            <line x1="92" y1="68" x2="92" y2="86" stroke="#172B49" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
      case 'Tank':
        return (
          <g>
            <path
              d="M78 44 L106 50 V72 C106 88 92 98 92 98 C92 98 78 88 78 72 Z"
              fill={hero.palette.primary}
              stroke="#172B49"
              strokeWidth="2.5"
            />
            <path d="M92 54 V86 M83 66 H101" stroke={hero.palette.accent} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'Support':
        return (
          <g>
            <path d="M22 66 Q8 40 28 32 Q36 46 32 68 Z" fill="#FFFFFF" fillOpacity="0.88" stroke={hero.palette.accent} strokeWidth="2" />
            <path d="M98 66 Q112 40 92 32 Q84 46 88 68 Z" fill="#FFFFFF" fillOpacity="0.88" stroke={hero.palette.accent} strokeWidth="2" />
          </g>
        );
      default: // Fighter
        return (
          <g>
            <path d="M94 20 L102 36 L98 86 L90 86 L86 36 Z" fill="#E8F4FF" stroke="#172B49" strokeWidth="2.2" />
            <line x1="84" y1="86" x2="104" y2="86" stroke={hero.palette.accent} strokeWidth="4" strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(155deg, #B9E3FF 0%, ${hero.palette.secondary} 52%, ${hero.palette.accent}88 100%)`,
      }}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full" fill="none" aria-label={hero.name}>
        <defs>
          <radialGradient id={`${uid}_glow`} cx="50%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="65%" stopColor={hero.palette.primary} stopOpacity="0.28" />
            <stop offset="100%" stopColor={hero.palette.accent} stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* Celestial sky halo & soft clouds */}
        <circle cx="60" cy="48" r="46" fill={`url(#${uid}_glow)`} />
        <circle cx="60" cy="48" r="38" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
        <ellipse cx="22" cy="96" rx="26" ry="12" fill="#FFFFFF" fillOpacity="0.7" />
        <ellipse cx="96" cy="98" rx="28" ry="13" fill="#FFFFFF" fillOpacity="0.65" />

        {/* Back hair for female or high cloak collar for male */}
        {isFemale ? (
          <path
            d="M32 48 C30 72 28 96 36 112 H84 C92 96 90 72 88 48 C84 26 36 26 32 48 Z"
            fill={hero.palette.cloak}
            stroke="#172B49"
            strokeWidth="2.2"
          />
        ) : (
          <path
            d="M28 84 L40 62 H80 L92 84 L84 114 H36 Z"
            fill={hero.palette.cloak}
            stroke="#172B49"
            strokeWidth="2.2"
          />
        )}

        {/* Weapon / Wings layer behind/beside */}
        {renderWeapon()}

        {/* Armored/Robed Shoulders & Chest */}
        <path
          d="M22 120 C24 88 38 74 60 74 C82 74 96 88 98 120 Z"
          fill={hero.palette.primary}
          stroke="#172B49"
          strokeWidth="2.4"
        />
        {/* Pauldrons & Chest Gem */}
        <path d="M24 94 Q34 74 48 80 L42 96 Z" fill={hero.palette.accent} stroke="#172B49" strokeWidth="2" />
        <path d="M96 94 Q86 74 72 80 L78 96 Z" fill={hero.palette.accent} stroke="#172B49" strokeWidth="2" />
        <polygon points="60,84 66,94 60,104 54,94" fill="#FFFFFF" stroke="#172B49" strokeWidth="1.8" />

        {/* Neck & Face */}
        <rect x="54" y="64" width="12" height="14" rx="4" fill="#FFE8DC" />
        <circle cx="60" cy="48" r="20" fill="#FFF2EA" stroke="#172B49" strokeWidth="2.2" />

        {/* Expressive Eyes */}
        <ellipse cx="52" cy="50" rx="2.7" ry="3.3" fill="#172B49" />
        <ellipse cx="68" cy="50" rx="2.7" ry="3.3" fill="#172B49" />
        <circle cx="51" cy="48.8" r="1.1" fill="#FFFFFF" />
        <circle cx="67" cy="48.8" r="1.1" fill="#FFFFFF" />
        <ellipse cx="46.5" cy="54.5" rx="3.2" ry="1.6" fill="#FFB8D2" fillOpacity="0.65" />
        <ellipse cx="73.5" cy="54.5" rx="3.2" ry="1.6" fill="#FFB8D2" fillOpacity="0.65" />
        <path d="M57 57 Q60 59.5 63 57" stroke="#172B49" strokeWidth="1.6" strokeLinecap="round" />

        {/* Front Hair / Crown / Helmet */}
        {hero.role === 'Tank' ? (
          <path
            d="M38 44 C38 26 82 26 82 44 L76 40 L60 32 L44 40 Z"
            fill={hero.palette.primary}
            stroke="#172B49"
            strokeWidth="2.2"
          />
        ) : (
          <path
            d="M38 45 C39 24 81 24 82 45 C74 35 66 36 60 41 C54 36 46 35 38 45 Z"
            fill={isFemale ? hero.palette.accent : hero.palette.cloak}
            stroke="#172B49"
            strokeWidth="2.2"
          />
        )}

        {/* Celestial Tiara / Crest */}
        <polygon points="60,18 65,28 60,32 55,28" fill={hero.palette.accent} stroke="#172B49" strokeWidth="1.6" />
      </svg>
    </div>
  );
};
