/**
 * useMessageAudio.ts — Web Audio Procedural Sound Synthesizer for iMessage-Style Feedback
 *
 * Synthesizes acoustic feedback for chat messaging completely on-device via Web Audio API:
 * 1. Send Sound: iMessage upward swoosh / pop-whoosh (rising frequency + bandpass air burst)
 * 2. Receive Sound: iMessage signature two-tone chime / marimba bell (C6 -> G6)
 *
 * Robust Collision Avoidance:
 * - Uses Web Audio hardware timeline (ctx.currentTime) rather than unreliable setTimeout.
 * - Enforces strict non-overlap: receive chime is hardware-scheduled to play only AFTER
 *   the send swoosh has fully completed + a natural 100ms conversational acoustic pause.
 * - Software debounce prevents double-triggers from React StrictMode or rapid state updates.
 * - Single AudioContext instance with automatic resumption on user interaction.
 * - Persistent mute preference toggle stored in localStorage.
 */

'use client';

import { useRef, useCallback, useState, useEffect } from 'react';

export function useMessageAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  // Hardware audio timeline marker (seconds in ctx.currentTime)
  const audioFinishTimeRef = useRef<number>(0);
  const lastReceiveCallTimeRef = useRef<number>(0);

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
      const startTime = Math.max(now, audioFinishTimeRef.current);
      // Mark send sound duration (160ms total)
      audioFinishTimeRef.current = startTime + 0.18;

      // 1. Core tonal sweep: smooth upward frequency glissando (240Hz -> 680Hz)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, startTime);
      osc.frequency.exponentialRampToValueAtTime(680, startTime + 0.12);

      oscGain.gain.setValueAtTime(0.001, startTime);
      oscGain.gain.linearRampToValueAtTime(0.16, startTime + 0.03);
      oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.15);

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
      filter.frequency.setValueAtTime(900, startTime);
      filter.frequency.exponentialRampToValueAtTime(1800, startTime + 0.12);
      filter.Q.setValueAtTime(1.8, startTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, startTime);
      noiseGain.gain.linearRampToValueAtTime(0.09, startTime + 0.03);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.13);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(startTime);
      noise.stop(startTime + 0.14);
    } catch {
      // Audio failure is non-fatal
    }
  }, [getAudioContext, isMuted]);

  /**
   * Procedural iMessage Receive Chime (Crisp marimba two-tone: C6 -> G6)
   * Guaranteed never to clash with send sound via hardware timeline scheduling.
   */
  const playReceiveSound = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Software debounce: prevent multiple chime calls within 300ms
    const nowMs = performance.now();
    if (nowMs - lastReceiveCallTimeRef.current < 300) {
      return;
    }
    lastReceiveCallTimeRef.current = nowMs;

    try {
      const now = ctx.currentTime;
      // Hardware non-overlap guarantee:
      // If send sound is still playing, schedule chime to start 100ms AFTER send finishes.
      const startTime = Math.max(now + 0.02, audioFinishTimeRef.current + 0.10);
      // Mark audio timeline busy until chime finishes (420ms duration)
      audioFinishTimeRef.current = startTime + 0.42;

      // Tone 1: C6 (1046.5 Hz) - bright woody strike
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, startTime);

      gain1.gain.setValueAtTime(0.001, startTime);
      gain1.gain.linearRampToValueAtTime(0.18, startTime + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(startTime);
      osc1.stop(startTime + 0.18);

      // Tone 2: G6 (1567.98 Hz) - delayed by 85ms for signature iMessage double-tone
      const note2Start = startTime + 0.085;
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

  return {
    playSendSound,
    playReceiveSound,
    isMuted,
    toggleMute,
  };
}
