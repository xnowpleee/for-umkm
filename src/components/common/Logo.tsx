import React from 'react';

interface LogoProps { className?: string; size?: number; }

export function Logo({ className = '', size = 26 }: LogoProps) {
  return <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={'shrink-0 ' + className} aria-label="BisnisKu Logo">
    <rect x="5" y="5" width="54" height="54" rx="15" fill="#F1F4F8" stroke="#DDE4EC"/>
    <path d="M17 44V30L25 35V44H17Z" fill="#9AAABD"/>
    <path d="M27 44V23L35 28V44H27Z" fill="#5E7591"/>
    <path d="M37 44V16L45 21V44H37Z" fill="#203A5C"/>
    <path d="M16 28L27 19L35 25L48 13" stroke="#203A5C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M40 13H48V21" stroke="#203A5C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
