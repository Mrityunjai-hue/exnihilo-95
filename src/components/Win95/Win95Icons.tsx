import React from 'react';

/**
 * Win95Icons.tsx — Authentic Pixel-Art & Vector Icon Set for ExNihilo 95 Desktop
 */

// 1. Author Shield Icon (MS Shield emblem)
export const AuthorShieldIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 3L4 9V17C4 24.5 10 31.5 18 34C26 31.5 32 24.5 32 17V9L18 3Z" fill="#1b2a4a" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M18 4.5L5.5 10V17C5.5 23.5 11 29.8 18 32.2V4.5Z" fill="#2c4475" />
    <path d="M18 4.5V32.2C25 29.8 30.5 23.5 30.5 17V10L18 4.5Z" fill="#4466aa" />
    <rect x="7" y="11" width="22" height="12" rx="1" fill="#111c33" stroke="#8bbcf7" strokeWidth="1" opacity="0.8" />
    <text x="11" y="21" font-family="'Courier New', monospace" font-size="10" font-weight="900" fill="#ffffff" letter-spacing="1">MS</text>
  </svg>
);

// 2. Reboot 95 Icon (Power Ring with Refresh Arrows)
export const RebootIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="14" fill="#0f2638" stroke="#3877ab" strokeWidth="1.5" />
    <path d="M18 7A11 11 0 1 1 7 18" stroke="#50e3c2" strokeWidth="3" strokeLinecap="round" />
    <polygon points="7,11 12,18 3,18" fill="#50e3c2" />
    <circle cx="18" cy="18" r="5" fill="#ffffff" stroke="#0f2638" strokeWidth="1.5" />
    <line x1="18" y1="14" x2="18" y2="17" stroke="#0f2638" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 3. About ExNihilo Icon (Cosmic Spiral Galaxy Window)
export const AboutIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="30" height="28" fill="#c0c0c0" stroke="#ffffff" strokeWidth="1.5" />
    <line x1="3" y1="32" x2="33" y2="32" stroke="#404040" strokeWidth="2" />
    <line x1="33" y1="4" x2="33" y2="32" stroke="#404040" strokeWidth="2" />
    <rect x="5" y="6" width="26" height="5" fill="navy" />
    <rect x="5" y="13" width="22" height="17" fill="#090514" />
    {/* Cosmic Galaxy Spiral */}
    <ellipse cx="16" cy="21" rx="8" ry="4" fill="none" stroke="#a855f7" strokeWidth="1.5" transform="rotate(-25 16 21)" />
    <ellipse cx="16" cy="21" rx="5" ry="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" transform="rotate(35 16 21)" />
    <circle cx="16" cy="21" r="2" fill="#ffffff" />
    {/* Window Controls */}
    <rect x="24" y="15" width="5" height="4" fill="#c0c0c0" stroke="#000" strokeWidth="0.5" />
  </svg>
);

// 4. Join the Team Icon (Team Circle of 5 People)
export const TeamIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="15" fill="#15243b" stroke="#ffffff" strokeWidth="1" />
    {/* 5 Colored Figures */}
    <circle cx="18" cy="8" r="3" fill="#38bdf8" />
    <circle cx="27" cy="14" r="3" fill="#f43f5e" />
    <circle cx="23" cy="25" r="3" fill="#fbbf24" />
    <circle cx="13" cy="25" r="3" fill="#34d399" />
    <circle cx="9" cy="14" r="3" fill="#a78bfa" />
    {/* Connecting hands circle */}
    <circle cx="18" cy="18" r="8" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 2" />
  </svg>
);

// 5. SQL IDE Icon (3D Database Cylinder Window)
export const IdeIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="30" height="28" fill="#c0c0c0" stroke="#ffffff" strokeWidth="1.5" />
    <line x1="3" y1="32" x2="33" y2="32" stroke="#404040" strokeWidth="2" />
    <line x1="33" y1="4" x2="33" y2="32" stroke="#404040" strokeWidth="2" />
    <rect x="5" y="6" width="26" height="5" fill="navy" />
    <rect x="5" y="13" width="26" height="17" fill="#1e293b" />
    {/* 3D Database Cylinder */}
    <g transform="translate(11, 15)">
      <path d="M 0,10 L 0,14 C 0,17 14,17 14,14 L 14,10 Z" fill="#3b82f6" stroke="#0f172a" strokeWidth="0.8" />
      <ellipse cx="7" cy="10" rx="7" ry="3" fill="#60a5fa" stroke="#0f172a" strokeWidth="0.8" />

      <path d="M 0,4 L 0,8 C 0,11 14,11 14,8 L 14,4 Z" fill="#3b82f6" stroke="#0f172a" strokeWidth="0.8" />
      <ellipse cx="7" cy="4" rx="7" ry="3" fill="#93c5fd" stroke="#0f172a" strokeWidth="0.8" />
    </g>
  </svg>
);

// 6. Legal & IP Notice Icon (Judge Gavel & Patent Scroll)
export const LegalIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Patent Scroll */}
    <rect x="6" y="8" width="18" height="24" rx="2" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
    <line x1="10" y1="13" x2="20" y2="13" stroke="#d97706" strokeWidth="1.5" />
    <line x1="10" y1="17" x2="18" y2="17" stroke="#d97706" strokeWidth="1.5" />
    <text x="11" y="25" font-family="'Courier New', monospace" font-size="7" font-weight="bold" fill="#78350f">IP</text>
    {/* Gavel */}
    <g transform="rotate(-30 22 18)">
      <rect x="18" y="10" width="12" height="6" rx="1" fill="#78350f" stroke="#451a03" strokeWidth="1" />
      <rect x="23" y="16" width="2" height="14" fill="#b45309" stroke="#451a03" strokeWidth="0.8" />
    </g>
  </svg>
);

// 7. SQL Dictionary Icon (Stacked Reference Books)
export const DictionaryIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stacked Books */}
    <rect x="4" y="24" width="28" height="6" rx="1" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
    <rect x="6" y="17" width="26" height="6" rx="1" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
    <rect x="3" y="10" width="28" height="6" rx="1" fill="#10b981" stroke="#047857" strokeWidth="1" />
    {/* Open Dictionary on Top */}
    <path d="M 5,6 Q 18,2 31,6 L 31,12 Q 18,8 5,12 Z" fill="#fffbeb" stroke="#b45309" strokeWidth="1" />
    <line x1="18" y1="4" x2="18" y2="10" stroke="#b45309" strokeWidth="1" />
    <text x="7" y="9" font-family="'Courier New', monospace" font-size="4" font-weight="900" fill="#78350f">SQL</text>
  </svg>
);

// 8. Recycle Bin Icon (Trash Bin with Refresh Arrows)
export const RecycleBinIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Win95 Wireframe Trash Can */}
    <path d="M8 10 L11 31 L25 31 L28 10 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
    <ellipse cx="18" cy="10" rx="10" ry="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
    {/* Blue Refresh Arrows inside */}
    <path d="M 14,17 A 5,5 0 0,1 22,17" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
    <polygon points="22,14 25,18 20,18" fill="#0284c7" />
    <path d="M 22,23 A 5,5 0 0,1 14,23" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
    <polygon points="14,26 11,22 16,22" fill="#0284c7" />
  </svg>
);

// 9. Query Tutorial Icon (Question Mark Window with Flowchart)
export const TutorialIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="30" height="28" fill="#c0c0c0" stroke="#ffffff" strokeWidth="1.5" />
    <line x1="3" y1="32" x2="33" y2="32" stroke="#404040" strokeWidth="2" />
    <line x1="33" y1="4" x2="33" y2="32" stroke="#404040" strokeWidth="2" />
    <rect x="5" y="6" width="26" height="5" fill="navy" />
    <rect x="5" y="13" width="26" height="17" fill="#f8fafc" />
    {/* Flowchart Nodes */}
    <rect x="7" y="15" width="8" height="4" rx="1" fill="#3b82f6" />
    <rect x="21" y="15" width="8" height="4" rx="1" fill="#10b981" />
    <rect x="14" y="24" width="8" height="4" rx="1" fill="#f59e0b" />
    <line x1="11" y1="19" x2="18" y2="24" stroke="#64748b" strokeWidth="1" />
    <line x1="25" y1="19" x2="18" y2="24" stroke="#64748b" strokeWidth="1" />
    {/* Red Question Mark */}
    <text x="14" y="23" font-family="sans-serif" font-size="14" font-weight="900" fill="#dc2626">?</text>
  </svg>
);

// 10. Setup Wizard Icon (Wizard Hat & Robot Builder Engine)
export const WizardIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="30" height="28" fill="#c0c0c0" stroke="#ffffff" strokeWidth="1.5" />
    <line x1="3" y1="32" x2="33" y2="32" stroke="#404040" strokeWidth="2" />
    <line x1="33" y1="4" x2="33" y2="32" stroke="#404040" strokeWidth="2" />
    <rect x="5" y="6" width="26" height="5" fill="navy" />
    {/* Wizard Hat & Wand */}
    <g transform="translate(6, 12)">
      <polygon points="12,2 4,16 20,16" fill="#4338ca" stroke="#312e81" strokeWidth="1" />
      <ellipse cx="12" cy="16" rx="10" ry="3" fill="#312e81" />
      <polygon points="12,5 14,8 11,8" fill="#fbbf24" />
      {/* Magic Wand */}
      <line x1="2" y1="4" x2="18" y2="18" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <circle cx="2" cy="4" r="2" fill="#ffffff" />
    </g>
  </svg>
);

// 11. Options & Config Icon (Control Knobs, Switches & Dials)
export const OptionsIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="30" height="28" fill="#c0c0c0" stroke="#ffffff" strokeWidth="1.5" />
    <line x1="3" y1="32" x2="33" y2="32" stroke="#404040" strokeWidth="2" />
    <line x1="33" y1="4" x2="33" y2="32" stroke="#404040" strokeWidth="2" />
    <rect x="5" y="6" width="26" height="5" fill="navy" />
    {/* Controls & Dials */}
    <rect x="7" y="15" width="10" height="4" rx="2" fill="#10b981" />
    <circle cx="15" cy="17" r="2" fill="#ffffff" />
    
    <rect x="7" y="21" width="10" height="4" rx="2" fill="#64748b" />
    <circle cx="9" cy="23" r="2" fill="#ffffff" />

    {/* Metallic Rotary Dial */}
    <circle cx="24" cy="21" r="6" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
    <line x1="24" y1="21" x2="27" y2="18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 12. Guided Tour Icon (Glowing Lightbulb)
export const TourIcon: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Glow Rays */}
    <line x1="18" y1="2" x2="18" y2="5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    <line x1="7" y1="7" x2="9" y2="9" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    <line x1="29" y1="7" x2="27" y2="9" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    {/* Bulb Glass */}
    <path d="M 11,15 C 11,10 25,10 25,15 C 25,19 21,21 21,25 L 15,25 C 15,21 11,19 11,15 Z" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
    {/* Filament */}
    <path d="M 16,18 L 18,14 L 20,18" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
    {/* Screw Base */}
    <rect x="15" y="26" width="6" height="3" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
    <rect x="16" y="29" width="4" height="2" rx="1" fill="#475569" />
  </svg>
);
