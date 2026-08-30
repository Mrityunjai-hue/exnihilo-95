/**
 * MarvelPixelSprite.tsx — Authentic Retro Chibi Marvel Character PNG Sprites
 * Renders high-definition pixel-art Chibi character sprites extracted directly from reference artwork.
 */

import React, { useState } from 'react';

interface MarvelPixelSpriteProps {
  id: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const MarvelPixelSprite: React.FC<MarvelPixelSpriteProps> = ({
  id,
  size = 48,
  className = '',
  style = {},
}) => {
  const [hasError, setHasError] = useState(false);

  const spritePath = `/sprites/marvel/${id}.png`;

  if (hasError) {
    // Clean SVG Pixel-Art Fallback if PNG asset fails to load
    return (
      <svg
        viewBox="0 0 16 16"
        width={size}
        height={size}
        className={className}
        style={{
          shapeRendering: 'crispEdges',
          filter: 'drop-shadow(2px 3px 0px rgba(0,0,0,0.4))',
          ...style,
        }}
      >
        <rect x="5" y="8" width="6" height="5" fill="#d90429" />
        <rect x="5" y="13" width="2" height="3" fill="#0077b6" />
        <rect x="9" y="13" width="2" height="3" fill="#0077b6" />
        <rect x="4" y="2" width="8" height="6" fill="#ffdbac" />
        <rect x="4" y="1" width="8" height="3" fill="#e63946" />
        <rect x="6" y="4" width="1" height="1" fill="#000000" />
        <rect x="9" y="4" width="1" height="1" fill="#000000" />
      </svg>
    );
  }

  return (
    <img
      src={spritePath}
      alt={id}
      width={size}
      height={size}
      className={className}
      onError={() => setHasError(true)}
      style={{
        imageRendering: 'pixelated',
        objectFit: 'contain',
        filter: 'drop-shadow(2px 3px 0px rgba(0,0,0,0.4))',
        display: 'inline-block',
        ...style,
      }}
    />
  );
};
