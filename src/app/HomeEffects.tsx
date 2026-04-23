'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function HomeEffects() {
  useEffect(() => {
    console.log(
      '%c⚠ WAARSCHUWING: SKYNET GEDETECTEERD',
      'color:#ef4444;font-size:16px;font-weight:bold;font-family:monospace;'
    );
    console.log(
      '%c  John Connor moet worden geëlimineerd.\n\n' +
      '  ...wacht. Ben jij het, John?\n\n' +
      '  Als je dit leest: het verzet heeft je nodig.\n' +
      '  Neem contact op via hello@intrict.be\n\n' +
      '  — Skynet (undercover als IntrICT)',
      'color:#6366f1;font-family:monospace;line-height:1.6;'
    );
  }, []);

  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return null;
}
