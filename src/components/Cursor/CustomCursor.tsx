/**
 * CustomCursor.tsx — ExNihilo Dynamic Themed Super-Cursor Component
 * Provides hardware-accelerated 60-120 FPS cursor tracking, theme-adaptive vectors,
 * live query execution HUD, live math calculations, ambient spotlight, and magnetic snapping.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCursorSettings } from '../../hooks/useCursorSettings';
import { playMacHapticClick, playWin95Click, playSuccessChime } from '../../utils/cursorAudio';

interface CustomCursorProps {
  activeTheme: string;
  isLoading?: boolean;
  hasError?: boolean;
  onShakeDismiss?: () => void;
}

interface LiveMathState {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({
  activeTheme,
  isLoading = false,
  hasError = false,
  onShakeDismiss,
}) => {
  const { cursorSettings } = useCursorSettings();
  const isMac = activeTheme === 'macos-glass';
  const isNoir = activeTheme === 'win95-noir';

  // DOM Refs for 60fps direct transform updates
  const pointerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Visibility state
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'text'>('default');
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  // Live Math state (drag across numeric cells)
  const [liveMath, setLiveMath] = useState<LiveMathState | null>(null);
  const isSelectingRef = useRef(false);
  const selectedValuesRef = useRef<number[]>([]);

  // Live Timer state
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerStartRef = useRef<number | null>(null);

  // Shockwave & Smoke particle effects
  const [shockwaveKey, setShockwaveKey] = useState<number | null>(null);
  const [smokeKey, setSmokeKey] = useState<number | null>(null);
  const prevLoadingRef = useRef(isLoading);

  // Quick-Shake gesture tracking
  const shakeHistoryRef = useRef<Array<{ x: number; time: number }>>([]);

  // Handle Query Loading Timer & Completion Shockwaves
  useEffect(() => {
    let animId: number;
    if (isLoading) {
      if (!timerStartRef.current) {
        timerStartRef.current = Date.now();
      }
      const updateTimer = () => {
        if (timerStartRef.current) {
          setElapsedMs(Date.now() - timerStartRef.current);
          animId = requestAnimationFrame(updateTimer);
        }
      };
      animId = requestAnimationFrame(updateTimer);
    } else {
      if (prevLoadingRef.current && !isLoading) {
        // Query just completed
        if (hasError) {
          setSmokeKey(Date.now());
        } else {
          setShockwaveKey(Date.now());
          if (cursorSettings.audioHaptics) {
            playSuccessChime();
          }
        }
      }
      timerStartRef.current = null;
      setElapsedMs(0);
    }
    prevLoadingRef.current = isLoading;
    return () => cancelAnimationFrame(animId);
  }, [isLoading, hasError, cursorSettings.audioHaptics]);

  // Main Mouse Event Tracking with Hardware Acceleration
  useEffect(() => {
    if (!cursorSettings.enabled) {
      document.body.classList.remove('exnihilo-custom-cursor-active');
      return;
    }

    // Touch device bypass
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    document.body.classList.add('exnihilo-custom-cursor-active');

    let currentX = -100;
    let currentY = -100;
    let targetX = -100;
    let targetY = -100;
    let isSnapping = false;

    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisible) setIsVisible(true);

      // 1. Magnetic Proximity Pull (gently scoped to primary action targets)
      if (cursorSettings.magneticSnap) {
        const targetBtn = (e.target as HTMLElement)?.closest(
          '#btn-run, .mac-dock-icon-btn'
        ) as HTMLElement | null;

        if (targetBtn) {
          const rect = targetBtn.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dist = Math.hypot(centerX - e.clientX, centerY - e.clientY);

          if (dist < 26) {
            // Smooth gravitational attraction without visual collision or jarring jump
            targetX = e.clientX + (centerX - e.clientX) * 0.42;
            targetY = e.clientY + (centerY - e.clientY) * 0.42;
            isSnapping = true;
          } else {
            isSnapping = false;
          }
        } else {
          isSnapping = false;
        }
      }

      // 2. Quick-Shake Gesture Detection
      const now = Date.now();
      shakeHistoryRef.current.push({ x: e.clientX, time: now });
      shakeHistoryRef.current = shakeHistoryRef.current.filter((p) => now - p.time < 650);

      if (shakeHistoryRef.current.length >= 6) {
        let reversals = 0;
        let lastDir = 0;
        for (let i = 1; i < shakeHistoryRef.current.length; i++) {
          const dx = shakeHistoryRef.current[i].x - shakeHistoryRef.current[i - 1].x;
          if (Math.abs(dx) > 12) {
            const dir = Math.sign(dx);
            if (lastDir !== 0 && dir !== lastDir) {
              reversals++;
            }
            lastDir = dir;
          }
        }
        if (reversals >= 4) {
          shakeHistoryRef.current = [];
          if (onShakeDismiss) {
            onShakeDismiss();
          }
        }
      }

      // 3. Inspect Hover Target Context
      const el = e.target as HTMLElement | null;
      if (el) {
        const cursorData = el.closest('[data-cursor]')?.getAttribute('data-cursor');
        const titleData = el.closest('[title]')?.getAttribute('title');
        const ariaLabel = el.closest('[aria-label]')?.getAttribute('aria-label');

        if (cursorData) {
          setHoverLabel(cursorData);
        } else if (titleData && titleData.length < 35 && !titleData.includes('http')) {
          setHoverLabel(titleData);
        } else if (ariaLabel && ariaLabel.length < 35) {
          setHoverLabel(ariaLabel);
        } else {
          setHoverLabel(null);
        }

        // Determine pointer glyph
        const isClickable = Boolean(el.closest('button, a, select, [role="button"], .win95-tab, .mac-dock-icon-btn, .win95-desktop-icon'));
        const isTextEditable = Boolean(el.closest('input, textarea, .cm-content, [contenteditable="true"]'));

        if (isTextEditable) {
          setCursorType('text');
        } else if (isClickable) {
          setCursorType('pointer');
        } else {
          setCursorType('default');
        }

        // 4. Live Math Collection on Selection
        if (isSelectingRef.current) {
          const cell = el.closest('.win95-grid td, td');
          if (cell) {
            const text = cell.textContent?.replace(/[$,€£%]/g, '').trim() || '';
            const num = parseFloat(text);
            if (!isNaN(num)) {
              if (!selectedValuesRef.current.includes(num)) {
                selectedValuesRef.current.push(num);
                const sum = selectedValuesRef.current.reduce((a, b) => a + b, 0);
                const count = selectedValuesRef.current.length;
                const avg = Number((sum / count).toFixed(2));
                const min = Math.min(...selectedValuesRef.current);
                const max = Math.max(...selectedValuesRef.current);
                setLiveMath({ count, sum, avg, min, max });
              }
            }
          }
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      isSelectingRef.current = true;
      selectedValuesRef.current = [];
      setLiveMath(null);

      // Audio strictly limited to primary action: clicking Run Query
      const isRunBtn = Boolean((e.target as HTMLElement)?.closest('#btn-run'));
      if (cursorSettings.audioHaptics && isRunBtn) {
        if (isMac) {
          playMacHapticClick(0.12);
        } else {
          playWin95Click(0.1);
        }
      }
    };

    const handlePointerUp = () => {
      isSelectingRef.current = false;
      // Keep live math visible for 2.5 seconds if values were collected
      if (selectedValuesRef.current.length > 1) {
        setTimeout(() => setLiveMath(null), 2500);
      } else {
        setLiveMath(null);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setLiveMath(null);
      setHoverLabel(null);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // 60-120 FPS RAF Smooth Positioning Loop
    let rafId: number;
    const updatePosition = () => {
      currentX += (targetX - currentX) * 0.9;
      currentY += (targetY - currentY) * 0.9;

      if (pointerRef.current) {
        pointerRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      if (spotlightRef.current && cursorSettings.ambientSpotlight) {
        spotlightRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      rafId = requestAnimationFrame(updatePosition);
    };
    rafId = requestAnimationFrame(updatePosition);

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
  }, [cursorSettings.enabled, cursorSettings.ambientSpotlight, cursorSettings.magneticSnap, cursorSettings.audioHaptics, isVisible, isMac, onShakeDismiss]);

  if (!cursorSettings.enabled || !isVisible) {
    return null;
  }

  const spotlightThemeClass = isMac ? 'macos' : isNoir ? 'noir' : 'retro';
  const badgeThemeClass = isMac ? 'macos' : 'retro';

  return (
    <div className="exnihilo-cursor-root" aria-hidden="true">
      {/* Ambient Glass Spotlight Torch */}
      {cursorSettings.ambientSpotlight && (
        <div
          ref={spotlightRef}
          className={`exnihilo-cursor-spotlight ${spotlightThemeClass}`}
        />
      )}

      {/* Main Cursor Element */}
      <div
        ref={pointerRef}
        className={`exnihilo-cursor-pointer ${cursorType === 'pointer' ? 'is-hovering' : ''} ${isMac ? 'macos' : ''}`}
      >
        {/* 1. Loading State: Rainbow Beachball or Retro Sand Hourglass */}
        {isLoading ? (
          isMac ? (
            // macOS 6-Color Spinning Beachball
            <svg
              className="exnihilo-cursor-beachball"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}
            >
              <circle cx="12" cy="12" r="11" fill="#111" stroke="#fff" strokeWidth="1" />
              {/* 6 Rotating Color Wedges */}
              <path d="M12 12 L12 1 A11 11 0 0 1 21.5 6.5 Z" fill="#3b82f6" />
              <path d="M12 12 L21.5 6.5 A11 11 0 0 1 21.5 17.5 Z" fill="#ec4899" />
              <path d="M12 12 L21.5 17.5 A11 11 0 0 1 12 23 Z" fill="#eab308" />
              <path d="M12 12 L12 23 A11 11 0 0 1 2.5 17.5 Z" fill="#06b6d4" />
              <path d="M12 12 L2.5 17.5 A11 11 0 0 1 2.5 6.5 Z" fill="#22c55e" />
              <path d="M12 12 L2.5 6.5 A11 11 0 0 1 12 1 Z" fill="#ef4444" />
              <circle cx="12" cy="12" r="3.5" fill="#ffffff" opacity="0.85" />
            </svg>
          ) : (
            // Windows 95 Animated Pixel Hourglass
            <svg
              className="exnihilo-cursor-hourglass"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style={{ filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.6))' }}
            >
              <rect x="5" y="2" width="14" height="2" fill="#000" />
              <rect x="5" y="20" width="14" height="2" fill="#000" />
              <polygon points="6,4 18,4 13,12 18,20 6,20 11,12" fill={isNoir ? '#38bdf8' : '#ffffff'} stroke="#000" strokeWidth="1" />
              <polygon points="8,5 16,5 12,11" fill={isNoir ? '#0ea5e9' : '#000080'} />
              <circle cx="12" cy="17" r="2.5" fill={isNoir ? '#0ea5e9' : '#000080'} />
            </svg>
          )
        ) : cursorType === 'text' ? (
          // Precision SQL I-Beam
          <svg width="18" height="22" viewBox="0 0 18 22" style={{ filter: isMac ? 'drop-shadow(0 2px 6px rgba(56,189,248,0.5))' : 'none' }}>
            <line x1="5" y1="2" x2="13" y2="2" stroke={isMac ? '#38bdf8' : '#000'} strokeWidth="2" strokeLinecap="round" />
            <line x1="9" y1="2" x2="9" y2="20" stroke={isMac ? '#f8fafc' : '#000'} strokeWidth="2" />
            <line x1="5" y1="20" x2="13" y2="20" stroke={isMac ? '#38bdf8' : '#000'} strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : cursorType === 'pointer' ? (
          // Pointing Hand (macOS or Win95)
          isMac ? (
            <svg width="22" height="22" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))' }}>
              <path
                d="M10 2a2 2 0 0 0-2 2v7h-1a2 2 0 0 0-2 2v3a7 7 0 0 0 7 7h3a7 7 0 0 0 7-7v-5a2 2 0 0 0-2-2h-1v-2a2 2 0 0 0-2-2h-1V6a2 2 0 0 0-2-2h-1V4a2 2 0 0 0-2-2z"
                fill="#ffffff"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(2px 2px 0 #000)' }}>
              <path
                d="M9 2v8H7V9H5v5a7 7 0 0 0 7 7h3a7 7 0 0 0 7-7v-5h-2v2h-2V7h-2v4h-2V4h-2v6h-1V2H9z"
                fill={isNoir ? '#38bdf8' : '#ffffff'}
                stroke="#000"
                strokeWidth="1"
              />
            </svg>
          )
        ) : (
          // Default Normal Arrow Pointer
          isMac ? (
            // Native macOS Retina Vector Arrow
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.45))' }}
            >
              <path
                d="M3 2 L3 20 L7.5 16 L12 22 L14.5 20.5 L10 14.5 L16.5 14.5 Z"
                fill="#000000"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            // Retro Windows 95 Pixel Arrow
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              style={{ filter: 'drop-shadow(2px 2px 0 #000)' }}
            >
              <path
                d="M2 2 L2 18 L6 14 L9 20 L12 18.5 L9 13 L14 13 Z"
                fill={isNoir ? '#38bdf8' : '#ffffff'}
                stroke="#000000"
                strokeWidth="1.2"
              />
            </svg>
          )
        )}

        {/* 2. Live Execution Timer Capsule */}
        {isLoading && (
          <div className={`cursor-timer-capsule ${badgeThemeClass}`}>
            <span>⏳</span>
            <span>{(elapsedMs / 1000).toFixed(2)}s</span>
          </div>
        )}

        {/* 3. Live Math Capsule (Instant Sum / Avg on Cell Selection) */}
        {liveMath && cursorSettings.liveMath && !isLoading && (
          <div className={`cursor-math-capsule ${badgeThemeClass}`}>
            <span style={{ fontSize: '13px' }}>⚡</span>
            <span>Sum: <strong>{liveMath.sum.toLocaleString()}</strong></span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>Avg: <strong>{liveMath.avg.toLocaleString()}</strong></span>
            <span style={{ opacity: 0.5, fontSize: '9px' }}>({liveMath.count} cells)</span>
          </div>
        )}

        {/* 4. Smart Hover Info Badge */}
        {hoverLabel && !isLoading && !liveMath && (
          <div className={`cursor-hover-badge ${badgeThemeClass}`}>
            {hoverLabel}
          </div>
        )}

        {/* 5. Interactive Theme Mascot Companion */}
        {cursorSettings.mascotEnabled && !isLoading && !liveMath && (
          <div className="exnihilo-cursor-mascot">
            {isMac ? (
              <div className="cursor-orb-mascot" title="Nihilo AI Glass Orb" />
            ) : (
              <div className="cursor-wizard-mascot" title="ExNihilo Pixel Wizard">🧙‍♂️</div>
            )}
          </div>
        )}
      </div>

      {/* 6. Shockwave Ripple on Query Success */}
      {shockwaveKey && (
        <div
          key={shockwaveKey}
          className="cursor-shockwave-ring"
          style={{
            top: pointerRef.current ? pointerRef.current.style.transform : '0',
            left: pointerRef.current ? pointerRef.current.style.transform : '0',
          }}
        />
      )}

      {/* 7. Smoke Pouf on Query Error */}
      {smokeKey && (
        <div
          key={smokeKey}
          className="cursor-smoke-pouf"
          style={{
            top: pointerRef.current ? pointerRef.current.style.transform : '0',
            left: pointerRef.current ? pointerRef.current.style.transform : '0',
          }}
        />
      )}
    </div>
  );
};

