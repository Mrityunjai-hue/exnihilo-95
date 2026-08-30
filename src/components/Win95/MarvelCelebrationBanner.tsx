/**
 * MarvelCelebrationBanner.tsx — 55+ Mini Marvel Characters Celebration & Teaser Banner Component
 * Renders an animated mini character parade across the bottom of the query results panel.
 */

import React, { useState, useEffect } from 'react';
import { getNextMarvelHero, MarvelCharacter } from '../../utils/marvelRoster';

export interface MarvelCelebrationTrigger {
  type: 'SUCCESS' | 'FAILURE' | 'NONE';
  timestamp: number;
}

export interface MarvelCelebrationBannerProps {
  trigger: MarvelCelebrationTrigger;
  enabled?: boolean;
  onDismiss?: () => void;
}

export const MarvelCelebrationBanner: React.FC<MarvelCelebrationBannerProps> = ({
  trigger,
  enabled = true,
  onDismiss,
}) => {
  const [hero, setHero] = useState<MarvelCharacter | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled || trigger.type === 'NONE' || trigger.timestamp === 0) {
      setIsVisible(false);
      return;
    }

    const nextHero = getNextMarvelHero(trigger.type === 'SUCCESS' ? 'victory' : 'teaser');
    setHero(nextHero);
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) onDismiss();
    }, 3200);

    return () => clearTimeout(timer);
  }, [trigger.timestamp, trigger.type, enabled, onDismiss]);

  if (!enabled || !isVisible || !hero) {
    return null;
  }

  const isVictory = trigger.type === 'SUCCESS';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '8px',
        left: 0,
        right: 0,
        height: '75px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {isVictory ? (
        /* Victory Parade Walk-Across Banner */
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'marvelParadeAcross 3.2s linear forwards',
            pointerEvents: 'auto',
          }}
        >
          {/* Mini Character Bobbing Avatar */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: hero.badgeColor,
              border: '2px solid #ffd700',
              boxShadow: '0 0 12px rgba(255, 215, 0, 0.8), 0 4px 10px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              animation: 'marvelBobbing 0.4s ease-in-out infinite',
              flexShrink: 0,
            }}
            title={hero.name}
          >
            {hero.emoji}
          </div>

          {/* Comic Speech Bubble */}
          <div
            style={{
              position: 'relative',
              background: '#ffffea',
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontFamily: "'Segoe UI', Tahoma, sans-serif",
              boxShadow: '3px 3px 12px rgba(0,0,0,0.4)',
              whiteSpace: 'nowrap',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {/* Speech pointer arrow pointing to hero */}
            <div
              style={{
                position: 'absolute',
                left: '-8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: '8px solid #000000',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '-6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderRight: '7px solid #ffffea',
              }}
            />

            <strong style={{ fontSize: '11px', color: '#000080', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{hero.emoji}</span>
              <span>{hero.name} — SQL Hero!</span>
            </strong>
            <span style={{ fontWeight: 600, color: '#1b4332' }}>"{hero.victoryQuote}"</span>
          </div>
        </div>
      ) : (
        /* Teaser Pop-Up Banner */
        <div
          style={{
            position: 'absolute',
            left: '24px',
            bottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'marvelPopUp 3.2s ease-in-out forwards',
            pointerEvents: 'auto',
          }}
        >
          {/* Teaser Character Avatar */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: hero.badgeColor,
              border: '2px solid #e63946',
              boxShadow: '0 0 12px rgba(230, 57, 70, 0.8), 0 4px 10px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              flexShrink: 0,
            }}
            title={hero.name}
          >
            {hero.emoji}
          </div>

          {/* Comic Speech Teaser Bubble */}
          <div
            style={{
              position: 'relative',
              background: '#ffe5ec',
              color: '#900c3f',
              border: '2px solid #900c3f',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontFamily: "'Segoe UI', Tahoma, sans-serif",
              boxShadow: '3px 3px 12px rgba(0,0,0,0.4)',
              whiteSpace: 'nowrap',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '-8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: '8px solid #900c3f',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '-6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderRight: '7px solid #ffe5ec',
              }}
            />

            <strong style={{ fontSize: '11px', color: '#7209b7', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{hero.emoji}</span>
              <span>{hero.name} Says:</span>
            </strong>
            <span style={{ fontWeight: 600 }}>"{hero.teaserQuote}"</span>
          </div>
        </div>
      )}
    </div>
  );
};
