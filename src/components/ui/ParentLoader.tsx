/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ParentLoaderProps { onComplete: () => void; }

const ICONS = [
  <svg key="heart" viewBox="0 0 64 64" fill="none" className="w-10 h-10">
    <path d="M32 52 C32 52 10 38 10 24 C10 16 16 10 24 10 C28 10 32 13 32 13 C32 13 36 10 40 10 C48 10 54 16 54 24 C54 38 32 52 32 52 Z" stroke="#1A4F8B" strokeWidth="2.2" fill="rgba(26,79,139,0.08)" strokeLinejoin="round"/>
    <path d="M32 52 C32 52 10 38 10 24" stroke="#93C5FD" strokeWidth="1.5" opacity="0.5" fill="none"/>
  </svg>,
  <svg key="book" viewBox="0 0 64 64" fill="none" className="w-10 h-10">
    <path d="M10 14 Q10 10 14 10 L32 10 L32 54 L14 54 Q10 54 10 50 Z" stroke="#1A4F8B" strokeWidth="2.2" fill="rgba(26,79,139,0.07)"/>
    <path d="M32 10 L50 10 Q54 10 54 14 L54 50 Q54 54 50 54 L32 54 Z" stroke="#1A4F8B" strokeWidth="2.2" fill="rgba(147,197,253,0.08)"/>
    <line x1="32" y1="10" x2="32" y2="54" stroke="#93C5FD" strokeWidth="1.5"/>
    <line x1="16" y1="20" x2="28" y2="20" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="26" x2="28" y2="26" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>,
  <svg key="star" viewBox="0 0 64 64" fill="none" className="w-10 h-10">
    <polygon points="32,8 38,24 56,24 42,34 47,50 32,40 17,50 22,34 8,24 26,24" stroke="#1A4F8B" strokeWidth="2.2" strokeLinejoin="round" fill="rgba(26,79,139,0.07)"/>
    <polygon points="32,14 37,26 50,26 40,33 44,46 32,38 20,46 24,33 14,26 27,26" fill="rgba(245,166,35,0.15)"/>
  </svg>,
];

const CAP_DASH  = 220;
const DOME_DASH = 130;

export const ParentLoader: React.FC<ParentLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [iconIdx,  setIconIdx]  = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        const next = p + 1.6;
        if (next >= 100 && !doneRef.current) {
          doneRef.current = true;
          clearInterval(t);
          setTimeout(onComplete, 400);
          return 100;
        }
        return Math.min(next, 100);
      });
    }, 40);
    return () => clearInterval(t);
  }, [onComplete]);

  useEffect(() => {
    const t = setInterval(() => setIconIdx(i => (i + 1) % ICONS.length), 850);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #DBEAFE 0%, #EFF6FF 50%, #FFFFFF 100%)' }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(147,197,253,0.18) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center gap-7">

        {/* Tracé SVG toque — palette bleu ciel */}
        <svg viewBox="0 0 120 96" fill="none" className="w-28 h-28" aria-hidden="true">
          <motion.path d="M60 16 L102 38 L60 50 L18 38 Z"
            stroke="#1A4F8B" strokeWidth="2.5" strokeLinejoin="round" fill="rgba(147,197,253,0.10)"
            strokeDasharray={CAP_DASH}
            initial={{ strokeDashoffset: CAP_DASH }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.1 }}
          />
          <motion.path d="M28 42 Q28 72 60 76 Q92 72 92 42"
            stroke="#1A4F8B" strokeWidth="2.2" fill="none"
            strokeDasharray={DOME_DASH}
            initial={{ strokeDashoffset: DOME_DASH }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.7 }}
          />
          <motion.line x1="102" y1="38" x2="102" y2="60"
            stroke="#F5A623" strokeWidth="2" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          />
          <motion.circle cx="102" cy="64" r="4" fill="#F5A623"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, delay: 1.3, ease: 'backOut' }}
          />
        </svg>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }} className="text-center space-y-0.5">
          <p className="font-serif font-bold text-xl text-[#0D2E5C]">
            Espace Parent Savant
          </p>
          <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#1A4F8B]/50">
            EPV Horizons Savants
          </p>
        </motion.div>

        <div className="h-12 flex items-center justify-center" style={{ minWidth: 48 }}>
          <AnimatePresence mode="wait">
            <motion.div key={iconIdx}
              initial={{ opacity: 0, y: 8, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.85 }} transition={{ duration: 0.28 }}>
              {ICONS[iconIdx]}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="flex flex-col items-center gap-1.5">
          <div className="relative w-56 h-4 flex items-end">
            <motion.div className="absolute bottom-2"
              style={{ left: `calc(${progress}% - 10px)`, transition: 'left 40ms linear' }}>
              <svg viewBox="0 0 20 16" fill="none" className="w-5 h-4">
                <path d="M10 2 L18 7 L10 10 L2 7 Z" fill="#1A4F8B"/>
                <path d="M5 8 Q5 14 10 15 Q15 14 15 8" fill="none" stroke="#1A4F8B" strokeWidth="1.5"/>
                <line x1="18" y1="7" x2="18" y2="12" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="18" cy="13" r="1.5" fill="#F5A623"/>
              </svg>
            </motion.div>
          </div>
          <div className="w-56 h-[2px] bg-[#1A4F8B]/10 overflow-hidden">
            <motion.div className="h-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #93C5FD, #1A4F8B)' }} />
          </div>
          <p className="text-[9px] font-sans text-[#1A4F8B]/40 uppercase tracking-[0.3em] mt-0.5">
            Bienvenue…
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
