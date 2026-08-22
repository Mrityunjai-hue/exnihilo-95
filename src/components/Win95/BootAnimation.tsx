/**
 * BootAnimation.tsx — Authentic Retro Windows 95 Boot & Startup Opening Animation
 *
 * Sequence:
 *  1. Phase 1: DOS POST Memory Check & BIOS Screen (0.6s)
 *  2. Phase 2: Windows 95 Cloud Splash Screen with Animated Blue Progress Marquee & WebAssembly Status (1.8s)
 *  3. Synthesizes retro ambient startup chime via Web Audio API
 *  4. Smooth transition into the Windows 95 Desktop
 */

import React, { useState, useEffect, useRef } from 'react';

interface BootAnimationProps {
  onComplete: () => void;
}

export const BootAnimation: React.FC<BootAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'bios' | 'splash' | 'done'>('bios');
  const [progress, setProgress] = useState(0);
  const [statusLog, setStatusLog] = useState('Starting ExNihilo 95...');
  const audioPlayedRef = useRef(false);

  // Synthesize classic Windows 95 startup chord via Web Audio API
  const playRetroStartupSound = () => {
    if (audioPlayedRef.current) return;
    audioPlayedRef.current = true;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Frequencies for warm ambient startup chord (Eb major / Ab maj7 ambient chord)
      const freqs = [155.56, 207.65, 233.08, 311.13, 415.30, 466.16, 622.25];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.04 / (i + 1), now + 0.3 + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + 3.5);
      });
    } catch {
      // Audio context might be restricted by browser autoplay policy until user interaction
    }
  };

  useEffect(() => {
    // Phase 1: BIOS screen for 700ms
    const biosTimer = setTimeout(() => {
      setPhase('splash');
      playRetroStartupSound();
    }, 700);

    return () => clearTimeout(biosTimer);
  }, []);

  useEffect(() => {
    if (phase !== 'splash') return;

    const logs = [
      'Loading AST Parser (MySQL, PostgreSQL, SQLite, SSMS)...',
      'Mounting WebAssembly SQLite Kernel 3.49.1...',
      'Initializing Referential Integrity DAG Synthesizer...',
      'Starting Session Schema Catalog...',
      'Launching Windows 95 Desktop Environment...',
    ];

    let currentLogIdx = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        if (next % 20 === 0 && currentLogIdx < logs.length - 1) {
          currentLogIdx++;
          setStatusLog(logs[currentLogIdx]);
        }
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setPhase('done');
            onComplete();
          }, 350);
          return 100;
        }
        return next;
      });
    }, 85);

    return () => clearInterval(interval);
  }, [phase, onComplete]);

  // Allow clicking anywhere or pressing any key to skip
  const handleSkip = () => {
    setPhase('done');
    onComplete();
  };

  useEffect(() => {
    const handleKeyDown = () => handleSkip();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999999,
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── PHASE 1: DOS BIOS POST SCREEN ── */}
      {phase === 'bios' && (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#000000',
            color: '#c0c0c0',
            fontFamily: 'var(--w95-mono)',
            fontSize: '14px',
            padding: '24px',
            boxSizing: 'border-box',
            lineHeight: 1.5,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #444', paddingBottom: '8px' }}>
            <div style={{ color: '#ffff55', fontWeight: 'bold' }}>
              Award Modular BIOS v4.51PG, An Energy Star Ally
            </div>
            <div style={{ color: '#55ffff' }}>EXNIHILO-95 WASM/x86</div>
          </div>

          <div>EXNIHILO (R) Pentium(R) Pro Processor 200MHz</div>
          <div>Memory Test: 65536K OK</div>
          <br />
          <div>Award Plug and Play BIOS Extension v1.0A</div>
          <div>Initialize WebAssembly Relational Storage Controller ... Done</div>
          <div>Detecting Primary Master ... EXNIHILO SQL.JS 3.49.1 (WASM)</div>
          <br />
          <div style={{ color: '#ffffff', fontWeight: 'bold' }}>
            Starting Windows 95...
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              right: '24px',
              color: '#888',
              fontSize: '11px',
            }}
          >
            Press any key to skip...
          </div>
        </div>
      )}

      {/* ── PHASE 2: WINDOWS 95 CLOUD SPLASH SCREEN ── */}
      {phase === 'splash' && (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, #1b5695 0%, #4a88cc 40%, #7dbbf7 70%, #d8ebff 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '40px 20px',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          {/* Cloud overlay atmosphere */}
          <div
            style={{
              position: 'absolute',
              top: '15%',
              width: '100%',
              textAlign: 'center',
              pointerEvents: 'none',
              opacity: 0.25,
              fontSize: '120px',
            }}
          >
            ☁️ ☁️ ☁️
          </div>

          {/* Top Logo Banner */}
          <div style={{ textAlign: 'center', marginTop: '40px', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              {/* Retro 3D Flag */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 36px',
                  gridGap: '6px',
                  transform: 'perspective(400px) rotateY(-18deg) rotateX(8deg)',
                  filter: 'drop-shadow(6px 6px 12px rgba(0,0,0,0.6))',
                }}
              >
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #ff4b4b 0%, #b30000 100%)', boxShadow: 'inset 2px 2px 4px #fff, inset -2px -2px 4px #000' }} />
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #44d62c 0%, #1e820e 100%)', boxShadow: 'inset 2px 2px 4px #fff, inset -2px -2px 4px #000' }} />
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #3898ec 0%, #0d4b96 100%)', boxShadow: 'inset 2px 2px 4px #fff, inset -2px -2px 4px #000' }} />
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #ffde59 0%, #c49b04 100%)', boxShadow: 'inset 2px 2px 4px #fff, inset -2px -2px 4px #000' }} />
              </div>

              <div>
                <div style={{ fontSize: '18px', color: '#ffffff', letterSpacing: '4px', textTransform: 'uppercase', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  Microsoft
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '62px',
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: '2px',
                    lineHeight: 1,
                    textShadow: '3px 3px 0 #000080, 6px 6px 12px rgba(0,0,0,0.8)',
                    fontFamily: 'var(--w95-font)',
                  }}
                >
                  Windows<span style={{ color: '#ffea79', fontStyle: 'italic' }}>95</span>
                </h1>
                <div style={{ fontSize: '13px', color: '#002040', fontWeight: 'bold', letterSpacing: '1.5px', marginTop: '4px' }}>
                  ExNihilo SQL Edition • Zero-Config Database IDE
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Progress Bar & Loading Status */}
          <div
            style={{
              width: '420px',
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              zIndex: 2,
            }}
          >
            {/* Retro Beveled Progress Bar */}
            <div
              className="win95-inset"
              style={{
                width: '100%',
                height: '24px',
                background: '#c0c0c0',
                padding: '2px',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'repeating-linear-gradient(90deg, #000080, #000080 12px, #c0c0c0 12px, #c0c0c0 15px)',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>

            {/* Status Text Log */}
            <div
              style={{
                fontFamily: 'var(--w95-font)',
                fontSize: '11px',
                color: '#001a33',
                fontWeight: 'bold',
                textShadow: '0 0 2px rgba(255,255,255,0.8)',
                textAlign: 'center',
              }}
            >
              {statusLog}
            </div>

            <div style={{ color: '#002b4d', fontSize: '10px', marginTop: '8px' }}>
              Click anywhere to start immediately
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
