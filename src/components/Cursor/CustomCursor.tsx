/**
 * CustomCursor.tsx — ExNihilo Signature Liquid Mercury Droplet Cursor
 *
 * An organic, physics-driven fluid glass cursor modeled as a weightless droplet
 * of liquid mercury encased in optical glass.
 * Features:
 * - Sub-pixel pointing precision at (0, 0) apex tip with 0ms hardware latency.
 * - Directional velocity elongation that streaks along the movement vector.
 * - Damped harmonic oscillation (elastic liquid rebound) upon sudden stops.
 * - Elastic surface squish on mouse click.
 * - Fluid glass I-beam thread inside SQL / text editors.
 * - Strict zero-interference: NO magnetic snaps, NO tooltips, NO audio, NO live math.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useCursorSettings } from '../../hooks/useCursorSettings';

interface CustomCursorProps {
  activeTheme?: string;
  isLoading?: boolean;
  hasError?: boolean;
  onShakeDismiss?: () => void;
}

export const CustomCursor: React.FC<CustomCursorProps> = () => {
  const { cursorSettings } = useCursorSettings();

  // DOM Refs for direct 60–120 FPS RAF updates without React re-rendering
  const pointerRef = useRef<HTMLDivElement>(null);
  const dropletGroupRef = useRef<HTMLDivElement>(null);
  const dropletPathRef = useRef<SVGPathElement>(null);
  const specularRef = useRef<SVGEllipseElement>(null);

  // High-level state
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'text'>('default');
  const [isPressed, setIsPressed] = useState(false);
  const isPressedRef = useRef(false);

  useEffect(() => {
    isPressedRef.current = isPressed;
  }, [isPressed]);

  useEffect(() => {
    if (!cursorSettings.enabled) {
      document.body.classList.remove('exnihilo-custom-cursor-active');
      return;
    }

    // Bypass touchscreens
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    document.body.classList.add('exnihilo-custom-cursor-active');

    let targetX = -100;
    let targetY = -100;
    let prevX = -1;
    let prevY = -1;

    // Physics parameters
    const REST_ANGLE = -Math.PI * 0.75; // -135deg (points up-left towards 10:30 o'clock)
    const BASE_TAIL = 9;
    const MAX_TAIL = 24;

    let currentAngle = REST_ANGLE;
    let currentTail = BASE_TAIL;
    let tailVelocity = 0;
    let smoothSpeed = 0;

    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisible) setIsVisible(true);

      // Inspect hover target context cleanly without any tooltips or snapping
      const el = e.target as HTMLElement | null;
      if (el) {
        const isTextEditable = Boolean(el.closest('input, textarea, .cm-content, [contenteditable="true"]'));
        const isClickable = Boolean(el.closest('button, a, select, [role="button"], .win95-tab, .mac-dock-icon-btn, .win95-desktop-icon, [data-clickable="true"]'));

        if (isTextEditable) {
          setCursorType('text');
        } else if (isClickable) {
          setCursorType('pointer');
        } else {
          setCursorType('default');
        }
      }
    };

    const handlePointerDown = () => {
      setIsPressed(true);
    };

    const handlePointerUp = () => {
      setIsPressed(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // 60–120 FPS Physics & Geometry Simulation Loop
    let rafId: number;
    const updatePhysics = () => {
      if (prevX === -1) {
        prevX = targetX;
        prevY = targetY;
      }

      const dx = targetX - prevX;
      const dy = targetY - prevY;
      prevX = targetX;
      prevY = targetY;

      const instantSpeed = Math.hypot(dx, dy);
      smoothSpeed += (instantSpeed - smoothSpeed) * 0.38;

      // 1. Angle computation: follow motion vector when moving, relax to resting pointer when idle
      let targetAngle = REST_ANGLE;
      if (smoothSpeed > 1.2) {
        // Point apex forward along movement direction
        targetAngle = Math.atan2(dy, dx);
      }

      // Shortest circular angular difference
      let angleDiff = targetAngle - currentAngle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      currentAngle += angleDiff * 0.26;

      // 2. Spring dynamics for tail elongation (damped harmonic oscillator)
      const targetTail = BASE_TAIL + Math.min(smoothSpeed * 1.1, MAX_TAIL - BASE_TAIL);
      const springForce = (targetTail - currentTail) * 0.24;
      tailVelocity = (tailVelocity + springForce) * 0.72; // 0.72 damping produces 2 cycles of liquid rebound
      currentTail += tailVelocity;

      // 3. Fluid volume conservation: droplet slightly narrows as it stretches
      const volWidth = Math.max(0.68, Math.min(1.22, Math.sqrt(BASE_TAIL / Math.max(currentTail, 4))));

      // 4. Direct DOM Updates (Zero input latency)
      if (pointerRef.current) {
        pointerRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }

      if (dropletGroupRef.current) {
        const deg = (currentAngle * 180) / Math.PI;
        const squish = isPressedRef.current ? 'scale(0.72, 1.34)' : 'scale(1, 1)';
        dropletGroupRef.current.style.transform = `rotate(${deg}deg) ${squish}`;
      }

      if (dropletPathRef.current) {
        const t = currentTail;
        const w = volWidth;
        // Analytical parametric Bezier teardrop with razor apex at (0, 0) and dome tail at (-t, 0)
        const d = `M 0 0 C ${-t * 0.24} ${-w * 4.2}, ${-t * 0.78} ${-w * 4.5}, ${-t} 0 C ${-t * 0.78} ${w * 4.5}, ${-t * 0.24} ${w * 4.2}, 0 0 Z`;
        dropletPathRef.current.setAttribute('d', d);
      }

      if (specularRef.current) {
        const t = currentTail;
        const w = volWidth;
        specularRef.current.setAttribute('cx', String(-t * 0.28));
        specularRef.current.setAttribute('cy', String(-w * 1.3));
        specularRef.current.setAttribute('rx', String(Math.max(1.2, t * 0.1)));
        specularRef.current.setAttribute('ry', String(Math.max(0.8, w * 1.0)));
      }

      rafId = requestAnimationFrame(updatePhysics);
    };

    rafId = requestAnimationFrame(updatePhysics);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.classList.remove('exnihilo-custom-cursor-active');
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorSettings.enabled, isVisible]);

  if (!cursorSettings.enabled || !isVisible) {
    return null;
  }

  return (
    <div className="exnihilo-cursor-root" aria-hidden="true">
      <div
        ref={pointerRef}
        className={`exnihilo-cursor-pointer ${cursorType === 'pointer' ? 'is-hovering' : ''} ${isPressed ? 'is-pressed' : ''}`}
      >
        {cursorType === 'text' ? (
          /* Fluid Glass Thread (SQL / Text Editor I-Beam) */
          <svg
            className="exnihilo-liquid-thread"
            width="20"
            height="24"
            viewBox="-10 -12 20 24"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="liquidThreadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="35%" stopColor="#ffffff" />
                <stop offset="65%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            {/* Top Serif */}
            <line x1="-3.5" y1="-9" x2="3.5" y2="-9" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
            {/* Liquid Vertical Stem */}
            <line x1="0" y1="-9" x2="0" y2="9" stroke="url(#liquidThreadGrad)" strokeWidth="2" strokeLinecap="round" />
            {/* Bottom Serif */}
            <line x1="-3.5" y1="9" x2="3.5" y2="9" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
            {/* Central Precision Optical Bead */}
            <circle cx="0" cy="0" r="1.6" fill="#ffffff" stroke="#0284c7" strokeWidth="0.7" />
          </svg>
        ) : (
          /* The Liquid Mercury Droplet (Stationary Bead & Velocity Stretch) */
          <div className="exnihilo-liquid-droplet-wrapper" ref={dropletGroupRef}>
            <svg
              className="exnihilo-liquid-surface"
              width="60"
              height="60"
              viewBox="-35 -30 60 60"
              style={{ overflow: 'visible', pointerEvents: 'none' }}
            >
              <defs>
                {/* Liquid Silver Mercury Gradient */}
                <linearGradient id="mercuryCore" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#e2e8f0" />
                  <stop offset="70%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>

                {/* Refractive Optical Rim Gradient */}
                <linearGradient id="mercuryRim" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="70%" stopColor="#cbd5e1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
                </linearGradient>

                {/* High Specular Glass Highlight */}
                <radialGradient id="mercurySpecular" cx="30%" cy="30%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Main Droplet Body (Dynamic Parametric Bezier) */}
              <path
                ref={dropletPathRef}
                fill="url(#mercuryCore)"
                stroke="url(#mercuryRim)"
                strokeWidth="0.85"
                strokeLinejoin="round"
              />

              {/* Specular Optic Reflection Bubble */}
              <ellipse
                ref={specularRef}
                fill="url(#mercurySpecular)"
                opacity="0.85"
                transform="rotate(-15)"
              />

              {/* Razor Apex Point Bead */}
              <circle cx="0" cy="0" r="1.1" fill="#ffffff" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
