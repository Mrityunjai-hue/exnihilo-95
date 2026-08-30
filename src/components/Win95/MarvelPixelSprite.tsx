/**
 * MarvelPixelSprite.tsx — Authentic 8-bit / 16-bit Retro Pixel-Art Chibi Marvel Characters
 * Renders crisp, non-blurry pixel-art sprites using SVG shape-rendering="crispEdges".
 */

import React from 'react';

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
  // SVG Pixel Art Definitions (16x16 Grid)
  const renderPixelArt = (charId: string) => {
    switch (charId) {
      case 'spiderman':
        return (
          <g>
            {/* Body */}
            <rect x="5" y="8" width="6" height="5" fill="#d90429" />
            <rect x="4" y="9" width="2" height="4" fill="#0077b6" />
            <rect x="10" y="9" width="2" height="4" fill="#0077b6" />
            <rect x="5" y="13" width="2" height="3" fill="#d90429" />
            <rect x="9" y="13" width="2" height="3" fill="#d90429" />
            {/* Head */}
            <rect x="4" y="2" width="8" height="7" fill="#d90429" />
            {/* Web Lines */}
            <rect x="8" y="2" width="1" height="7" fill="#800020" />
            <rect x="4" y="5" width="8" height="1" fill="#800020" />
            {/* Spider Eyes */}
            <rect x="5" y="4" width="3" height="2" fill="#000000" />
            <rect x="8" y="4" width="3" height="2" fill="#000000" />
            <rect x="5" y="4" width="2" height="1" fill="#ffffff" />
            <rect x="9" y="4" width="2" height="1" fill="#ffffff" />
          </g>
        );

      case 'ironman':
        return (
          <g>
            {/* Body */}
            <rect x="5" y="8" width="6" height="5" fill="#b7094c" />
            <rect x="4" y="9" width="2" height="4" fill="#ffb703" />
            <rect x="10" y="9" width="2" height="4" fill="#ffb703" />
            <rect x="5" y="13" width="2" height="3" fill="#b7094c" />
            <rect x="9" y="13" width="2" height="3" fill="#b7094c" />
            {/* Arc Reactor */}
            <rect x="7" y="9" width="2" height="2" fill="#80e5ff" />
            {/* Head */}
            <rect x="4" y="2" width="8" height="7" fill="#b7094c" />
            <rect x="6" y="3" width="4" height="5" fill="#ffb703" />
            {/* Glowing Eyes */}
            <rect x="5" y="5" width="2" height="1" fill="#80e5ff" />
            <rect x="9" y="5" width="2" height="1" fill="#80e5ff" />
          </g>
        );

      case 'thor':
        return (
          <g>
            {/* Red Cape */}
            <rect x="3" y="7" width="10" height="9" fill="#d90429" />
            {/* Body Armor */}
            <rect x="5" y="8" width="6" height="5" fill="#4a5759" />
            <rect x="6" y="9" width="1" height="1" fill="#80e5ff" />
            <rect x="9" y="9" width="1" height="1" fill="#80e5ff" />
            <rect x="6" y="11" width="1" height="1" fill="#80e5ff" />
            <rect x="9" y="11" width="1" height="1" fill="#80e5ff" />
            {/* Legs */}
            <rect x="5" y="13" width="2" height="3" fill="#212529" />
            <rect x="9" y="13" width="2" height="3" fill="#212529" />
            {/* Head & Blonde Hair */}
            <rect x="3" y="2" width="10" height="6" fill="#ffb703" />
            <rect x="5" y="3" width="6" height="5" fill="#ffdbac" />
            {/* Helmet Wing Accents */}
            <rect x="3" y="1" width="2" height="3" fill="#e9ecef" />
            <rect x="11" y="1" width="2" height="3" fill="#e9ecef" />
            {/* Eyes */}
            <rect x="6" y="4" width="1" height="1" fill="#000000" />
            <rect x="9" y="4" width="1" height="1" fill="#000000" />
            {/* Mjolnir Hammer in Hand */}
            <rect x="12" y="9" width="3" height="2" fill="#adb5bd" />
            <rect x="13" y="11" width="1" height="3" fill="#6c584c" />
          </g>
        );

      case 'capamerica':
        return (
          <g>
            {/* Body */}
            <rect x="5" y="8" width="6" height="5" fill="#0077b6" />
            {/* Red & White Stripes */}
            <rect x="6" y="11" width="1" height="2" fill="#d90429" />
            <rect x="7" y="11" width="1" height="2" fill="#ffffff" />
            <rect x="8" y="11" width="1" height="2" fill="#d90429" />
            <rect x="9" y="11" width="1" height="2" fill="#ffffff" />
            {/* Legs */}
            <rect x="5" y="13" width="2" height="3" fill="#0077b6" />
            <rect x="9" y="13" width="2" height="3" fill="#0077b6" />
            {/* Head / Mask */}
            <rect x="4" y="2" width="8" height="7" fill="#0077b6" />
            <rect x="5" y="5" width="6" height="3" fill="#ffdbac" />
            <rect x="7" y="3" width="2" height="2" fill="#ffffff" /> {/* 'A' emblem */}
            <rect x="6" y="5" width="1" height="1" fill="#000000" />
            <rect x="9" y="5" width="1" height="1" fill="#000000" />
            {/* Shield on Arm */}
            <circle cx="3" cy="11" r="3" fill="#d90429" />
            <circle cx="3" cy="11" r="2" fill="#ffffff" />
            <circle cx="3" cy="11" r="1" fill="#0077b6" />
          </g>
        );

      case 'hulk':
        return (
          <g>
            {/* Big Bulky Green Body */}
            <rect x="3" y="6" width="10" height="7" fill="#38b000" />
            {/* Purple Pants */}
            <rect x="4" y="12" width="8" height="4" fill="#7209b7" />
            {/* Large Head */}
            <rect x="3" y="1" width="10" height="6" fill="#38b000" />
            {/* Black Messy Hair */}
            <rect x="3" y="1" width="10" height="2" fill="#10002b" />
            {/* Angry Eyes & Brow */}
            <rect x="4" y="3" width="8" height="1" fill="#10002b" />
            <rect x="5" y="4" width="2" height="1" fill="#ffffff" />
            <rect x="9" y="4" width="2" height="1" fill="#ffffff" />
            <rect x="6" y="4" width="1" height="1" fill="#000000" />
            <rect x="9" y="4" width="1" height="1" fill="#000000" />
          </g>
        );

      case 'deadpool':
        return (
          <g>
            {/* Body */}
            <rect x="5" y="8" width="6" height="5" fill="#d90429" />
            <rect x="4" y="9" width="2" height="4" fill="#212529" />
            <rect x="10" y="9" width="2" height="4" fill="#212529" />
            <rect x="5" y="13" width="2" height="3" fill="#d90429" />
            <rect x="9" y="13" width="2" height="3" fill="#d90429" />
            {/* Harness & Swords on Back */}
            <rect x="3" y="6" width="1" height="6" fill="#adb5bd" />
            <rect x="12" y="6" width="1" height="6" fill="#adb5bd" />
            {/* Head */}
            <rect x="4" y="2" width="8" height="7" fill="#d90429" />
            {/* Black Eye Patches & White Eyes */}
            <rect x="4" y="4" width="3" height="3" fill="#212529" />
            <rect x="9" y="4" width="3" height="3" fill="#212529" />
            <rect x="5" y="5" width="2" height="1" fill="#ffffff" />
            <rect x="9" y="5" width="2" height="1" fill="#ffffff" />
          </g>
        );

      case 'wolverine':
        return (
          <g>
            {/* Body */}
            <rect x="5" y="8" width="6" height="5" fill="#ffb703" />
            <rect x="4" y="9" width="2" height="4" fill="#0077b6" />
            <rect x="10" y="9" width="2" height="4" fill="#0077b6" />
            <rect x="5" y="13" width="2" height="3" fill="#0077b6" />
            <rect x="9" y="13" width="2" height="3" fill="#0077b6" />
            {/* Head & Mask Cowl Wings */}
            <rect x="2" y="1" width="3" height="5" fill="#000000" />
            <rect x="11" y="1" width="3" height="5" fill="#000000" />
            <rect x="4" y="2" width="8" height="6" fill="#ffb703" />
            <rect x="5" y="4" width="6" height="4" fill="#ffdbac" />
            {/* Eyes */}
            <rect x="5" y="4" width="2" height="1" fill="#ffffff" />
            <rect x="9" y="4" width="2" height="1" fill="#ffffff" />
            {/* Claws */}
            <rect x="2" y="11" width="2" height="1" fill="#adb5bd" />
            <rect x="12" y="11" width="2" height="1" fill="#adb5bd" />
          </g>
        );

      case 'loki':
        return (
          <g>
            {/* Green Robes & Gold Trim */}
            <rect x="4" y="8" width="8" height="8" fill="#2d6a4f" />
            <rect x="7" y="8" width="2" height="8" fill="#ffb703" />
            {/* Head */}
            <rect x="5" y="4" width="6" height="4" fill="#ffdbac" />
            {/* Golden Horned Helmet */}
            <rect x="4" y="2" width="8" height="2" fill="#ffb703" />
            <rect x="2" y="0" width="2" height="3" fill="#ffb703" />
            <rect x="12" y="0" width="2" height="3" fill="#ffb703" />
            {/* Eyes & Smirk */}
            <rect x="6" y="5" width="1" height="1" fill="#000000" />
            <rect x="9" y="5" width="1" height="1" fill="#000000" />
            <rect x="8" y="7" width="2" height="1" fill="#000000" />
          </g>
        );

      case 'thanos':
        return (
          <g>
            {/* Bulky Gold & Purple Body */}
            <rect x="3" y="7" width="10" height="6" fill="#5a189a" />
            <rect x="4" y="7" width="8" height="2" fill="#ffb703" />
            <rect x="4" y="13" width="8" height="3" fill="#ffb703" />
            {/* Infinity Gauntlet on Left Hand */}
            <rect x="1" y="8" width="3" height="4" fill="#ffb703" />
            <rect x="2" y="9" width="1" height="1" fill="#d90429" />
            <rect x="2" y="10" width="1" height="1" fill="#0077b6" />
            {/* Purple Head & Helmet */}
            <rect x="4" y="2" width="8" height="6" fill="#7b2cbf" />
            <rect x="4" y="1" width="8" height="2" fill="#ffb703" />
            {/* Glowing Eyes */}
            <rect x="5" y="4" width="2" height="1" fill="#80e5ff" />
            <rect x="9" y="4" width="2" height="1" fill="#80e5ff" />
          </g>
        );

      case 'drstrange':
        return (
          <g>
            {/* Red Cloak of Levitation */}
            <rect x="2" y="6" width="12" height="10" fill="#d90429" />
            {/* Blue Tunic & Eye of Agamotto */}
            <rect x="5" y="8" width="6" height="5" fill="#0077b6" />
            <rect x="7" y="9" width="2" height="2" fill="#ffb703" />
            {/* Head & Hair with White Temples */}
            <rect x="4" y="2" width="8" height="6" fill="#ffdbac" />
            <rect x="4" y="1" width="8" height="3" fill="#212529" />
            <rect x="4" y="3" width="1" height="2" fill="#ffffff" />
            <rect x="11" y="3" width="1" height="2" fill="#ffffff" />
            {/* Goatee & Eyes */}
            <rect x="6" y="4" width="1" height="1" fill="#000000" />
            <rect x="9" y="4" width="1" height="1" fill="#000000" />
            <rect x="7" y="7" width="2" height="1" fill="#212529" />
          </g>
        );

      case 'blackpanther':
        return (
          <g>
            {/* Sleek Black Suit */}
            <rect x="5" y="8" width="6" height="8" fill="#10002b" />
            <rect x="6" y="8" width="4" height="1" fill="#adb5bd" /> {/* Silver necklace */}
            {/* Mask */}
            <rect x="4" y="2" width="8" height="6" fill="#10002b" />
            <rect x="4" y="1" width="1" height="2" fill="#10002b" /> {/* Ears */}
            <rect x="11" y="1" width="1" height="2" fill="#10002b" />
            {/* White Eyes & Silver Markings */}
            <rect x="5" y="4" width="2" height="1" fill="#ffffff" />
            <rect x="9" y="4" width="2" height="1" fill="#ffffff" />
          </g>
        );

      case 'groot':
        return (
          <g>
            {/* Wooden Texture Body */}
            <rect x="5" y="8" width="6" height="8" fill="#6b705c" />
            <rect x="6" y="9" width="1" height="4" fill="#a7c957" /> {/* Vine accent */}
            {/* Head with Wood Crown */}
            <rect x="4" y="2" width="8" height="6" fill="#6b705c" />
            <rect x="3" y="1" width="2" height="2" fill="#6b705c" />
            <rect x="7" y="0" width="2" height="3" fill="#a7c957" />
            <rect x="11" y="1" width="2" height="2" fill="#6b705c" />
            {/* Cute Big Eyes */}
            <rect x="5" y="4" width="2" height="2" fill="#000000" />
            <rect x="9" y="4" width="2" height="2" fill="#000000" />
          </g>
        );

      case 'rocket':
        return (
          <g>
            {/* Brown Fur & Orange Suit */}
            <rect x="5" y="9" width="6" height="7" fill="#f77f00" />
            <rect x="4" y="10" width="1" height="4" fill="#6c584c" /> {/* Tail */}
            {/* Head & Ears */}
            <rect x="4" y="3" width="8" height="6" fill="#6c584c" />
            <rect x="3" y="2" width="2" height="2" fill="#6c584c" />
            <rect x="11" y="2" width="2" height="2" fill="#6c584c" />
            {/* White Muzzle & Eyes */}
            <rect x="6" y="6" width="4" height="3" fill="#ffffff" />
            <rect x="5" y="5" width="2" height="1" fill="#000000" />
            <rect x="9" y="5" width="2" height="1" fill="#000000" />
          </g>
        );

      case 'spidergwen':
        return (
          <g>
            {/* White & Black Suit */}
            <rect x="5" y="8" width="6" height="5" fill="#212529" />
            <rect x="5" y="13" width="2" height="3" fill="#ff4d6d" />
            <rect x="9" y="13" width="2" height="3" fill="#ff4d6d" />
            {/* White Hood */}
            <rect x="3" y="1" width="10" height="7" fill="#ffffff" />
            <rect x="4" y="2" width="8" height="5" fill="#ff4d6d" />
            {/* Eyes */}
            <rect x="5" y="4" width="2" height="2" fill="#ffffff" />
            <rect x="9" y="4" width="2" height="2" fill="#ffffff" />
          </g>
        );

      case 'venom':
        return (
          <g>
            {/* Giant Black Symbiote Body */}
            <rect x="3" y="6" width="10" height="10" fill="#10002b" />
            <rect x="7" y="7" width="2" height="3" fill="#ffffff" /> {/* White Spider Emblem */}
            {/* Head & Jagged Eyes */}
            <rect x="3" y="1" width="10" height="6" fill="#10002b" />
            <rect x="4" y="3" width="3" height="2" fill="#ffffff" />
            <rect x="9" y="3" width="3" height="2" fill="#ffffff" />
            {/* Red Tongue & Sharp Teeth */}
            <rect x="6" y="5" width="4" height="2" fill="#d90429" />
          </g>
        );

      // Default Fallback Hero Model (Generic Super Hero)
      default:
        return (
          <g>
            <rect x="5" y="8" width="6" height="5" fill="#023e8a" />
            <rect x="5" y="13" width="2" height="3" fill="#d90429" />
            <rect x="9" y="13" width="2" height="3" fill="#d90429" />
            <rect x="4" y="2" width="8" height="6" fill="#ffdbac" />
            <rect x="4" y="1" width="8" height="3" fill="#ffb703" />
            <rect x="6" y="4" width="1" height="1" fill="#000000" />
            <rect x="9" y="4" width="1" height="1" fill="#000000" />
          </g>
        );
    }
  };

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
      {renderPixelArt(id)}
    </svg>
  );
};
