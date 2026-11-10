/**
 * ExNihiloLogo.tsx — Universal Signature Brand Logo for ExNihilo 95
 *
 * Core Concept:
 * - "Creatio ex nihilo" (Creation out of nothing).
 * - An iconic, invariant geometric nexus emblem composed of an interlocking
 *   "X" & "N" diamond monogram emerging from a central genesis singularity point.
 * - The geometry remains identical across all themes, while the material,
 *   lighting, strokes, bevels, and typography dynamically adapt to match
 *   the active theme's authentic design language.
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export interface ExNihiloLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ExNihiloLogo: React.FC<ExNihiloLogoProps> = ({
  size = 32,
  showText = false,
  className = '',
  style,
}) => {
  const { activeTheme } = useTheme();

  // Determine theme mode
  const isMac = activeTheme === 'macos-glass';
  const isNoir = activeTheme === 'win95-noir';
  const isWin7 = activeTheme === 'win7-aero';
  const isXP = activeTheme === 'winxp-luna';
  const is2000 = activeTheme === 'win2000';
  const isClassic = !isMac && !isNoir && !isWin7 && !isXP && !is2000;

  // Text styling per theme
  const getBrandTextColor = () => {
    if (isMac) return '#ffffff';
    if (isNoir) return '#38bdf8';
    if (isWin7) return '#1e3a8a';
    if (isXP) return '#ffffff';
    if (is2000) return '#0a246a';
    return '#000080';
  };

  const getEditionBadgeStyle = (): React.CSSProperties => {
    if (isMac) {
      return {
        background: 'rgba(56, 189, 248, 0.2)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        color: '#38bdf8',
        borderRadius: '6px',
        padding: '1px 5px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.04em',
      };
    }
    if (isNoir) {
      return {
        background: 'rgba(56, 189, 248, 0.15)',
        border: '1px solid #38bdf8',
        color: '#38bdf8',
        borderRadius: '2px',
        padding: '0 4px',
        fontSize: '11px',
        fontWeight: 700,
        boxShadow: '0 0 8px rgba(56, 189, 248, 0.4)',
      };
    }
    if (isWin7) {
      return {
        background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(186,230,253,0.8) 100%)',
        border: '1px solid #0284c7',
        color: '#0369a1',
        borderRadius: '4px',
        padding: '1px 5px',
        fontSize: '11px',
        fontWeight: 700,
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      };
    }
    if (isXP) {
      return {
        background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
        border: '1px solid #ffffff',
        color: '#ffffff',
        borderRadius: '3px',
        padding: '1px 5px',
        fontSize: '11px',
        fontWeight: 700,
        boxShadow: '1px 1px 2px rgba(0,0,0,0.3)',
      };
    }
    if (is2000) {
      return {
        background: '#d4d0c8',
        border: '1px solid #808080',
        borderTopColor: '#ffffff',
        borderLeftColor: '#ffffff',
        color: '#0a246a',
        padding: '1px 4px',
        fontSize: '11px',
        fontWeight: 700,
      };
    }
    // Classic Win95 3D Bevel Badge
    return {
      background: '#c0c0c0',
      border: '2px solid #808080',
      borderTopColor: '#ffffff',
      borderLeftColor: '#ffffff',
      borderBottomColor: '#000000',
      borderRightColor: '#000000',
      color: '#000080',
      padding: '0 4px',
      fontSize: '11px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
    };
  };

  return (
    <div
      className={`exnihilo-logo-root ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size > 24 ? '10px' : '6px',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* ── Universal Geometric SVG Emblem ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ overflow: 'visible', flexShrink: 0 }}
      >
        <defs>
          {/* 1. macOS Glass Theme Shader */}
          {isMac && (
            <>
              <linearGradient id="macLogoShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="macLogoRefractRim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="macSpecularCap" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <filter id="macLogoGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(56, 189, 248, 0.45)" />
              </filter>
            </>
          )}

          {/* 2. Win95 Noir Cyber Theme Shader */}
          {isNoir && (
            <>
              <linearGradient id="noirLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <filter id="noirNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" />
              </filter>
            </>
          )}

          {/* 3. Windows 7 Aero Glass Shader */}
          {isWin7 && (
            <>
              <linearGradient id="aeroLogoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#7dd3fc" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
              </linearGradient>
              <filter id="aeroGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(2, 132, 199, 0.5)" />
              </filter>
            </>
          )}

          {/* 4. Windows XP Luna Shader */}
          {isXP && (
            <>
              <linearGradient id="xpLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
            </>
          )}

          {/* 5. Windows 2000 Corporate Steel Shader */}
          {is2000 && (
            <>
              <linearGradient id="w2kLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3a6ea5" />
                <stop offset="100%" stopColor="#0a246a" />
              </linearGradient>
            </>
          )}
        </defs>

        {/* ── Layer 1: Outer Genesis Diamond Shield ── */}
        <polygon
          points="50,6 94,50 50,94 6,50"
          fill={
            isMac
              ? 'url(#macLogoShieldGrad)'
              : isNoir
              ? 'url(#noirLogoGrad)'
              : isWin7
              ? 'url(#aeroLogoGrad)'
              : isXP
              ? 'url(#xpLogoGrad)'
              : is2000
              ? 'url(#w2kLogoGrad)'
              : '#c0c0c0'
          }
          stroke={
            isMac
              ? 'url(#macLogoRefractRim)'
              : isNoir
              ? '#38bdf8'
              : isWin7
              ? '#bae6fd'
              : isXP
              ? '#ffffff'
              : is2000
              ? '#ffffff'
              : '#ffffff'
          }
          strokeWidth={isMac ? 2 : isNoir ? 2.5 : isClassic ? 2.5 : 2}
          filter={isMac ? 'url(#macLogoGlow)' : isNoir ? 'url(#noirNeonGlow)' : isWin7 ? 'url(#aeroGlow)' : undefined}
        />

        {/* ── Layer 2: Classic 1995 3D Bevel Shadow Facets ── */}
        {isClassic && (
          <>
            {/* Top-Left Light Bevel */}
            <polyline points="6,50 50,6 94,50" fill="none" stroke="#ffffff" strokeWidth="3" />
            {/* Bottom-Right Deep Chisel Shadow */}
            <polyline points="94,50 50,94 6,50" fill="none" stroke="#000000" strokeWidth="3.5" />
            <polyline points="91,50 50,91 9,50" fill="none" stroke="#808080" strokeWidth="2" />
          </>
        )}

        {/* ── Layer 3: Interlocking "X" Diagonal Wings ── */}
        {/* Top-Left to Bottom-Right Blade */}
        <polygon
          points="26,26 40,20 74,74 60,80"
          fill={
            isMac
              ? 'rgba(255, 255, 255, 0.45)'
              : isNoir
              ? 'rgba(56, 189, 248, 0.4)'
              : isWin7
              ? 'rgba(255, 255, 255, 0.6)'
              : isXP
              ? 'rgba(255, 255, 255, 0.4)'
              : is2000
              ? '#d4d0c8'
              : '#000080'
          }
        />
        {/* Top-Right to Bottom-Left Blade */}
        <polygon
          points="74,26 60,20 26,74 40,80"
          fill={
            isMac
              ? 'rgba(255, 255, 255, 0.35)'
              : isNoir
              ? 'rgba(14, 165, 233, 0.35)'
              : isWin7
              ? 'rgba(255, 255, 255, 0.45)'
              : isXP
              ? '#22c55e'
              : is2000
              ? '#0a246a'
              : '#008080'
          }
        />

        {/* ── Layer 4: Interlocking Vertical "N" Vector ── */}
        <polyline
          points="36,68 36,32 64,68 64,32"
          fill="none"
          stroke={
            isMac
              ? '#ffffff'
              : isNoir
              ? '#38bdf8'
              : isWin7
              ? '#ffffff'
              : isXP
              ? '#ffffff'
              : is2000
              ? '#ffffff'
              : '#ffffff'
          }
          strokeWidth={isMac ? 4 : isNoir ? 4.5 : 4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ── Layer 5: Central Genesis Singularity Core ("Nihilo" focal diamond) ── */}
        <polygon
          points="50,42 58,50 50,58 42,50"
          fill={
            isMac
              ? '#ffffff'
              : isNoir
              ? '#38bdf8'
              : isWin7
              ? '#ffffff'
              : isXP
              ? '#facc15'
              : is2000
              ? '#ffffff'
              : '#ffff00'
          }
          stroke={isNoir ? '#38bdf8' : isMac ? 'rgba(56,189,248,0.8)' : '#000000'}
          strokeWidth={isNoir ? 1.5 : 0.8}
        />

        {/* ── Layer 6: macOS / Aero Gloss Specular Cap ── */}
        {(isMac || isWin7) && (
          <path
            d="M 12 46 Q 50 14 88 46 Q 50 32 12 46 Z"
            fill="url(#macSpecularCap)"
            opacity={isMac ? 0.85 : 0.65}
          />
        )}
      </svg>

      {/* ── Dynamic Typography (Adapts to Active Theme) ── */}
      {showText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: size > 32 ? '22px' : '15px',
              fontWeight: 800,
              letterSpacing: isMac ? '-0.02em' : 'normal',
              color: getBrandTextColor(),
              fontFamily: isClassic ? 'var(--w95-font-family, Tahoma, sans-serif)' : 'inherit',
              textShadow: isNoir
                ? '0 0 10px rgba(56, 189, 248, 0.6)'
                : isWin7
                ? '0 1px 2px rgba(255, 255, 255, 0.8)'
                : isClassic
                ? '1px 1px 0 #ffffff'
                : 'none',
            }}
          >
            ExNihilo
          </span>
          <span style={getEditionBadgeStyle()}>95</span>
        </div>
      )}
    </div>
  );
};

