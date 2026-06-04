/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ParentWelcomeLoaderProps {
  onComplete: () => void;
  name?: string;
}

const ICONS = [
  <svg key="home" viewBox="0 0 64 64" fill="none" className="w-10 h-10">
    <path d="M8 28 L32 10 L56 28" stroke="#1A4F8B" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
    <path d="M14 24 L14 56 L50 56 L50 24" stroke="#1A4F8B" strokeWidth="2.2" fill="rgba(26,79,139,0.07)" strokeLinejoin="round"/>
    <rect x="24" y="38" width="16" height="18" rx="2" stroke="#F5A623" strokeWidth="2" fill="rgba(245,166,35,0.1)"/>
  </svg>,
  <svg key="star" viewBox="0 0 64 64" fill="none" className="w-10 h-10">
    <polygon points="32,8 38,24 56,24 42,34 47,50 32,40 17,50 22,34 8,24 26,24"
      stroke="#1A4F8B" strokeWidth="2.2" strokeLinejoin="round" fill="rgba(26,79,139,0.07)"/>
    <polygon points="32,14 37,26 50,26 40,33 44,46 32,38 20,46 24,33 14,26 27,26" fill="rgba(245,166,35,0.15)"/>
  </svg>,
  <svg key="child" viewBox="0 0 64 64" fill="none" className="w-10 h-10">
    <circle cx="32" cy="16" r="10" stroke="#1A4F8B" strokeWidth="2.2" fill="rgba(26,79,139,0.07)"/>
    <path d="M16 56 Q16 40 32 40 Q48 40 48 56" stroke="#1A4F8B" strokeWidth="2.2" strokeLinejoin="round" fill="rgba(26,79,139,0.07)"/>
    <line x1="32" y1="26" x2="32" y2="38" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
  </svg>,
];

const CAP_DASH  = 220;
const DOME_DASH = 130;

export const ParentWelcomeLoader: React.FC<ParentWelcomeLoaderProps> = ({ onComplete, name }) => {
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
          setTimeout(onComplete, 500);
          return 100;
        }
        return Math.min(next, 100);
      });
    }, 40);
    return () => clearInterval(t);
  }, [onComplete]);

  useEffect(() => {
    const t = setInterval(() => setIconIdx(i => (i + 1) % ICONS.length), 900);
    return () => clearInterval(t);
  }, []);

  const firstName = name?.split(' ')[0] || '';

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #DBEAFE 0%, #EFF6FF 50%, #FFFFFF 100%)' }}
    >
      {/* Halo central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(147,197,253,0.22) 0%, transparent 70%)' }} />

      {/* Confettis discrets */}
      {[
        { top:'8%',  left:'7%',  color:'#F5A623', size:8,  delay:0   },
        { top:'12%', left:'88%', color:'#93C5FD', size:10, delay:0.3 },
        { top:'78%', left:'5%',  color:'#6EE7B7', size:7,  delay:0.6 },
        { top:'82%', left:'90%', color:'#F5A623', size:9,  delay:0.9 },
        { top:'45%', left:'3%',  color:'#FDA4AF', size:6,  delay:0.2 },
        { top:'40%', left:'94%', color:'#93C5FD', size:8,  delay:0.5 },
      ].map((c, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, scale: 0, rotate: -30 }}
          animate={{ opacity: 0.7, scale: 1, rotate: 0 }}
          transition={{ delay: c.delay, duration: 0.5, ease: 'backOut' }}
          style={{
            position: 'absolute', top: c.top, left: c.left,
            width: c.size, height: c.size, borderRadius: '30%',
            background: c.color,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center gap-6">

        {/* Toque SVG animée */}
        <svg viewBox="0 0 120 96" fill="none" className="w-28 h-28" aria-hidden="true">
          <motion.path d="M60 16 L102 38 L60 50 L18 38 Z"
            stroke="#1A4F8B" strokeWidth="2.5" strokeLinejoin="round" fill="rgba(147,197,253,0.12)"
            strokeDasharray={CAP_DASH}
            initial={{ strokeDashoffset: CAP_DASH }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.1 }}
          />
          <motion.path d="M28 42 Q28 72 60 76 Q92 72 92 42"
            stroke="#1A4F8B" strokeWidth="2.2" fill="none"
            strokeDasharray={DOME_DASH}
            initial={{ strokeDashoffset: DOME_DASH }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: 0.7 }}
          />
          <motion.line x1="102" y1="38" x2="102" y2="60"
            stroke="#F5A623" strokeWidth="2.2" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          />
          <motion.circle cx="102" cy="64" r="4.5" fill="#F5A623"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, delay: 1.3, ease: 'backOut' }}
          />
        </svg>

        {/* Message de bienvenue */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
          className="text-center space-y-1.5"
        >
          <p className="font-serif font-bold text-3xl text-[#0D2E5C] leading-tight">
            Bienvenu{firstName ? ',' : ''}{firstName && (
              <span className="text-[#F5A623]"> {firstName}&nbsp;!</span>
            )}{!firstName && ' !'}
          </p>
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-[#1A4F8B]/50">
            Espace Parent · EPV Horizons Savants
          </p>
        </motion.div>

        {/* Icône rotative */}
        <div className="h-12 flex items-center justify-center" style={{ minWidth: 48 }}>
          <AnimatePresence mode="wait">
            <motion.div key={iconIdx}
              initial={{ opacity: 0, y: 8, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.85 }}
              transition={{ duration: 0.28 }}>
              {ICONS[iconIdx]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Barre de progression */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col items-center gap-2"
        >
          {/* Mortier glissant */}
          <div className="relative w-64 h-5 flex items-end">
            <motion.div
              className="absolute bottom-2"
              style={{ left: `calc(${progress}% - 10px)`, transition: 'left 40ms linear' }}
            >
              <svg viewBox="0 0 20 16" fill="none" className="w-5 h-4">
                <path d="M10 2 L18 7 L10 10 L2 7 Z" fill="#1A4F8B"/>
                <path d="M5 8 Q5 14 10 15 Q15 14 15 8" fill="none" stroke="#1A4F8B" strokeWidth="1.5"/>
                <line x1="18" y1="7" x2="18" y2="12" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="18" cy="13" r="1.5" fill="#F5A623"/>
              </svg>
            </motion.div>
          </div>

          {/* Piste */}
          <div className="w-64 h-[3px] bg-[#1A4F8B]/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #93C5FD 0%, #1A4F8B 60%, #F5A623 100%)',
                transition: 'width 40ms linear',
              }}
            />
          </div>

          <p className="text-[9px] font-sans text-[#1A4F8B]/40 uppercase tracking-[0.3em] mt-0.5">
            Préparation de votre espace…
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
