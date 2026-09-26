import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 26 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="BisnisKu Logo"
    >
      <defs>
        <linearGradient id="bkLogoGradient" x1="10" y1="54" x2="54" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0369A1"/>
          <stop offset="0.55" stopColor="#0EA5E9"/>
          <stop offset="1" stopColor="#22D3EE"/>
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#0E1722" stroke="#203244"/>
      <rect x="14" y="34" width="7" height="14" rx="2" fill="url(#bkLogoGradient)"/>
      <rect x="24" y="27" width="7" height="21" rx="2" fill="url(#bkLogoGradient)"/>
      <rect x="34" y="20" width="7" height="28" rx="2" fill="url(#bkLogoGradient)"/>
      <path d="M14 31L27 20L35 27L49 12" stroke="url(#bkLogoGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M40 12H49V21" stroke="#67E8F9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
