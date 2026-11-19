import React from 'react';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 38, showText = true }) => {
  return (
    <span className="inline-flex items-center gap-2.5 select-none shrink-0">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="mlcSkyGrad" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8CCFFF" />
            <stop offset="100%" stopColor="#3478D4" />
          </linearGradient>
          <linearGradient id="mlcPinkGrad" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE0EC" />
            <stop offset="100%" stopColor="#FFB8D2" />
          </linearGradient>
        </defs>
        {/* Outer sky shield */}
        <path
          d="M24 3L41 11V24C41 34.2 33.4 41.8 24 45C14.6 41.8 7 34.2 7 24V11L24 3Z"
          fill="url(#mlcSkyGrad)"
          stroke="#172B49"
          strokeWidth="2.2"
        />
        {/* Winged inner crest */}
        <path
          d="M12 19L19 15L24 23L29 15L36 19L31 28L24 37L17 28L12 19Z"
          fill="url(#mlcPinkGrad)"
          stroke="#172B49"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Central sky crystal */}
        <path d="M24 9L29 19L24 29L19 19L24 9Z" fill="#FFFFFF" stroke="#172B49" strokeWidth="1.5" />
      </svg>
      {showText && (
        <span className="font-display text-xl font-extrabold tracking-tight text-[#172B49] whitespace-nowrap">
          MoLe<span className="text-[#3478D4]">Call</span>
        </span>
      )}
    </span>
  );
};
