/**
 * useMessageAudio.ts — Web Audio Procedural Sound Synthesizer for iMessage-Style Feedback
 *
 * Synthesizes acoustic feedback for chat messaging completely on-device via Web Audio API:
 * 1. Send Sound: iMessage upward swoosh / pop-whoosh (rising frequency + bandpass air burst)
 * 2. Receive Sound: iMessage signature two-tone chime / marimba bell (C6 -> G6)
 *
 * Edge cases handled:
 * - Zero network latency / zero broken asset URLs (100% procedural)
 * - Intelligent collision avoidance: if query executes in <200ms, receive chime is queued
 *   until send swoosh completes so both sounds never clash or play simultaneously.
 * - Single AudioContext instance with automatic resumption on user interaction.
 * - Persistent mute preference toggle stored in localStorage.
 */

'use client';

import { useRef, useCallback, useState, useEffect } from 'react';

export function useMessageAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastSendTimeRef = useRef<number>(0);
  const scheduledReceiveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('exnihilo_pocket_sql_muted') === 'true';
    }
    return false;
  });

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('exnihilo_pocket_sql_muted', String(next));
      }
      return next;
    });
  }, []);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  /**
   * Procedural iMessage Send Swoosh (Upward air sweep)
   */
  const playSendSound = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      lastSendTimeRef.current = performance.now();

      // Clear any pending receive chime to avoid overlaps
      if (scheduledReceiveTimerRef.current) {
        clearTimeout(scheduledReceiveTimerRef.current);
        scheduledReceiveTimerRef.current = null;
      }

      // 1. Core tonal sweep: smooth upward frequency glissando (240Hz -> 680Hz)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.linearRampToValueAtTime(0.16, now + 0.03);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);

      // 2. Breathy air-swoosh layer (bandpass filtered noise burst)
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.12);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.09, now + 0.03);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.14);
    } catch {
      // Audio failure is non-fatal
    }
  }, [getAudioContext, isMuted]);

  /**
   * Procedural iMessage Receive Chime (Crisp marimba two-tone: C6 -> G6)
   */
  const playReceiveChimeInternal = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Tone 1: C6 (1046.5 Hz) - bright woody strike
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // Tone 2: G6 (1567.98 Hz) - delayed by 85ms for the signature iMessage double-tone
      const note2Start = now + 0.085;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1567.98, note2Start);

      gain2.gain.setValueAtTime(0.001, note2Start);
      gain2.gain.linearRampToValueAtTime(0.22, note2Start + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, note2Start + 0.32);

      // Subtle harmonic overtone for marimba acoustic richness
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(3135.96, note2Start);

      overtoneGain.gain.setValueAtTime(0.001, note2Start);
      overtoneGain.gain.linearRampToValueAtTime(0.04, note2Start + 0.01);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, note2Start + 0.2);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      overtone.connect(overtoneGain);
      overtoneGain.connect(ctx.destination);

      osc2.start(note2Start);
      osc2.stop(note2Start + 0.35);
      overtone.start(note2Start);
      overtone.stop(note2Start + 0.22);
    } catch {
      // Audio failure is non-fatal
    }
  }, [getAudioContext, isMuted]);

  /**
   * Collision-aware receive sound dispatcher.
   * Guarantees at least 220ms separation between send swoosh and receive chime,
   * preventing simultaneous overlapping audio on ultra-fast (<10ms) local queries.
   */
  const playReceiveSound = useCallback(() => {
    if (isMuted) return;

    const elapsedSinceSend = performance.now() - lastSendTimeRef.current;
    const MIN_SEPARATION_MS = 220;

    if (elapsedSinceSend < MIN_SEPARATION_MS) {
      const waitMs = MIN_SEPARATION_MS - elapsedSinceSend;
      if (scheduledReceiveTimerRef.current) {
        clearTimeout(scheduledReceiveTimerRef.current);
      }
      scheduledReceiveTimerRef.current = setTimeout(() => {
        playReceiveChimeInternal();
        scheduledReceiveTimerRef.current = null;
      }, waitMs);
    } else {
      playReceiveChimeInternal();
    }
  }, [isMuted, playReceiveChimeInternal]);

  // Clean up any pending timer on unmount
  useEffect(() => {
    return () => {
      if (scheduledReceiveTimerRef.current) {
        clearTimeout(scheduledReceiveTimerRef.current);
      }
    };
  }, []);

  return {
    playSendSound,
    playReceiveSound,
    isMuted,
    toggleMute,
  };
}
