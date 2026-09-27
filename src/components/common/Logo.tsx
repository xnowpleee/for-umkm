import React from 'react';

interface LogoProps { className?: string; size?: number; }

export function Logo({ className = '', size = 26 }: LogoProps) {
  const id = 'bk-logo-gradient';
  return <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={'shrink-0 ' + className} aria-label="BisnisKu Logo">
    <defs>
      <linearGradient id={id} x1="10" y1="54" x2="52" y2="10" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0EA5E9" />
        <stop offset="1" stopColor="#22D3EE" />
      </linearGradient>
      <linearGradient id="bk-logo-glow" x1="18" y1="48" x2="48" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0369A1" />
        <stop offset="1" stopColor="#0EA5E9" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="17" fill="#081521" stroke="#0EA5E9" strokeOpacity=".72" />
    <path d="M13 43V28.5C13 27.1 13.7 25.8 14.9 25L20 21.6V43H13Z" fill="url(#bk-logo-gradient)" />
    <path d="M24 43V20.5C24 19.1 24.7 17.8 25.9 17L31 13.6V43H24Z" fill="url(#bk-logo-gradient)" />
    <path d="M35 43V14C35 12.6 35.7 11.3 36.9 10.5L42 7.2V43H35Z" fill="url(#bk-logo-gradient)" />
    <path d="M12 47.5C22 47.5 30 44.4 36.6 37.9L47.5 27V33.2L53 27.5V16.5H42L47.2 21.7L34.1 34.8C27.8 41.1 20.8 44.2 12 44.2V47.5Z" fill="url(#bk-logo-glow)" />
  </svg>;
}