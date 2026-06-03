/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLoaderProps { onComplete: () => void; }

const ICONS = [
  <svg key="shield" viewBox="0 0 64 64" fill="none" className="w-10 h-10">
    <path d="M32 8 L54 18 L54 36 Q54 52 32 58 Q10 52 10 36 L10 18 Z" stroke="#4A90D9" strokeWidth="2.2" fill="rgba(74,144,217,0.07)" strokeLinejoin="round"/>
    <path d="M22 32 L29 39 L42 26" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
  <svg key="chart" viewBox="0 0 64 64" fill="none" className="w-10 h-10">
    <rect x="8" y="48" width="10" height="12" rx="1.5" stroke="#4A90D9" strokeWidth="2" fill="rgba(74,144,217,0.08)"/>
    <rect x="24" y="36" width="10" height="24" rx="1.5" stroke="#4A90D9" strokeWidth="2" fill="rgba(74,144,217,0.08)"/>
    <rect x="40" y="24" width="10" height="36" rx="1.5" stroke="#4A90D9" strokeWidth="2" fill="rgba(74,144,217,0.08)"/>
    <polyline points="13,44 29,30 45,20 56,14" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>,
  <svg key="gear" viewBox="0 0 64 64" fill="none" className="w-10 h-10">
    <circle cx="32" cy="32" r="9" stroke="#4A90D9" strokeWidth="2.2" fill="rgba(74,144,217,0.08)"/>
    <path d="M32 14 L32 8 M32 56 L32 50 M14 32 L8 32 M56 32 L50 32 M18.7 18.7 L14.3 14.3 M49.7 49.7 L45.3 45.3 M45.3 18.7 L49.7 14.3 M14.3 49.7 L18.7 45.3" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>,
];

const CAP_DASH  = 220;
const DOME_DASH = 130;

export const AdminLoader: React.FC<AdminLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [iconIdx,  setIconIdx]  = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        const next = p + 1.4;
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
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ background: '#06101F' }}
    >
      {/* Grille subtile */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.045]"
           style={{ backgroundImage: 'linear-gradient(rgba(74,144,217,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(74,144,217,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(74,144,217,0.10) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center gap-7">

        {/* Tracé SVG toque — palette bleue */}
        <svg viewBox="0 0 120 96" fill="none" className="w-28 h-28" aria-hidden="true">
          <motion.path d="M60 16 L102 38 L60 50 L18 38 Z"
            stroke="#4A90D9" strokeWidth="2.5" strokeLinejoin="round" fill="rgba(74,144,217,0.06)"
            strokeDasharray={CAP_DASH}
            initial={{ strokeDashoffset: CAP_DASH }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.1 }}
          />
          <motion.path d="M28 42 Q28 72 60 76 Q92 72 92 42"
            stroke="#FFFFFF" strokeWidth="2" fill="none" opacity={0.35}
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
          <p className="font-sans font-bold text-xl text-white uppercase tracking-[0.1em]">
            Portail Administrateur
          </p>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#4A90D9]/60">
            EPV Horizons Savants — v2.0
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
          <div className="relative w-64 h-4 flex items-end">
            <motion.div className="absolute bottom-2"
              style={{ left: `calc(${progress}% - 10px)`, transition: 'left 40ms linear' }}>
              <svg viewBox="0 0 20 16" fill="none" className="w-5 h-4">
                <path d="M10 2 L18 7 L10 10 L2 7 Z" fill="#4A90D9"/>
                <path d="M5 8 Q5 14 10 15 Q15 14 15 8" fill="none" stroke="#4A90D9" strokeWidth="1.5"/>
                <line x1="18" y1="7" x2="18" y2="12" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="18" cy="13" r="1.5" fill="#F5A623"/>
              </svg>
            </motion.div>
          </div>
          <div className="w-64 h-[2px] bg-white/6 overflow-hidden">
            <motion.div className="h-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #4A90D9, #F5A623)' }} />
          </div>
          <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.25em] mt-0.5">
            Initialisation… {Math.round(progress)}%
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
