/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminWelcomeLoaderProps {
  onComplete: () => void;
  name?: string;
}

const ICONS = [
  <svg key="shield" viewBox="0 0 64 64" fill="none" className="w-10 h-10">
    <path d="M32 8 L54 18 L54 36 Q54 52 32 58 Q10 52 10 36 L10 18 Z"
      stroke="#4A90D9" strokeWidth="2.2" fill="rgba(74,144,217,0.10)" strokeLinejoin="round"/>
    <path d="M22 32 L29 39 L42 26" stroke="#F5A623" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
  <svg key="chart" viewBox="0 0 64 64" fill="none" className="w-10 h-10">
    <rect x="8"  y="44" width="10" height="16" rx="2" stroke="#4A90D9" strokeWidth="2" fill="rgba(74,144,217,0.08)"/>
    <rect x="24" y="32" width="10" height="28" rx="2" stroke="#4A90D9" strokeWidth="2" fill="rgba(74,144,217,0.08)"/>
    <rect x="40" y="20" width="10" height="40" rx="2" stroke="#4A90D9" strokeWidth="2" fill="rgba(74,144,217,0.08)"/>
    <polyline points="13,40 29,26 45,16 56,10" stroke="#F5A623" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>,
  <svg key="key" viewBox="0 0 64 64" fill="none" className="w-10 h-10">
    <circle cx="24" cy="30" r="14" stroke="#4A90D9" strokeWidth="2.2" fill="rgba(74,144,217,0.08)"/>
    <circle cx="24" cy="30" r="6" stroke="#4A90D9" strokeWidth="2" fill="rgba(74,144,217,0.15)"/>
    <line x1="34" y1="36" x2="56" y2="56" stroke="#4A90D9" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="46" y1="48" x2="46" y2="54" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="52" y1="52" x2="52" y2="56" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>,
];

const CAP_DASH  = 220;
const DOME_DASH = 130;

export const AdminWelcomeLoader: React.FC<AdminWelcomeLoaderProps> = ({ onComplete, name }) => {
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

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ background: '#06101F' }}
    >
      {/* Grille de fond */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(74,144,217,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(74,144,217,0.9) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Halo bleu central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(74,144,217,0.12) 0%, transparent 70%)' }} />

      {/* Points lumineux décoratifs */}
      {[
        { top:'10%', left:'8%',  size:3, color:'#4A90D9', delay:0.2 },
        { top:'15%', left:'90%', size:4, color:'#F5A623', delay:0.5 },
        { top:'80%', left:'6%',  size:3, color:'#F5A623', delay:0.8 },
        { top:'85%', left:'88%', size:4, color:'#4A90D9', delay:0.3 },
        { top:'50%', left:'2%',  size:2, color:'#93C5FD', delay:0.6 },
        { top:'45%', left:'96%', size:2, color:'#93C5FD', delay:0.1 },
      ].map((d, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ delay: d.delay, duration: 0.4, ease: 'backOut' }}
          style={{
            position: 'absolute', top: d.top, left: d.left,
            width: d.size * 3, height: d.size * 3, borderRadius: '50%',
            background: d.color,
            boxShadow: `0 0 ${d.size * 4}px ${d.color}`,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center gap-6">

        {/* Toque SVG — palette admin bleue */}
        <svg viewBox="0 0 120 96" fill="none" className="w-28 h-28" aria-hidden="true">
          <motion.path d="M60 16 L102 38 L60 50 L18 38 Z"
            stroke="#4A90D9" strokeWidth="2.5" strokeLinejoin="round" fill="rgba(74,144,217,0.06)"
            strokeDasharray={CAP_DASH}
            initial={{ strokeDashoffset: CAP_DASH }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.1 }}
          />
          <motion.path d="M28 42 Q28 72 60 76 Q92 72 92 42"
            stroke="#4A90D9" strokeWidth="2.2" fill="none"
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
          <p className="font-serif font-bold text-3xl text-white leading-tight">
            Bienvenu,{' '}
            <span style={{ color: '#F5A623' }}>
              {name || 'Administrateur'}&nbsp;!
            </span>
          </p>
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.28em]"
             style={{ color: 'rgba(74,144,217,0.6)' }}>
            Console d'Administration · EPV
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
                <path d="M10 2 L18 7 L10 10 L2 7 Z" fill="#4A90D9"/>
                <path d="M5 8 Q5 14 10 15 Q15 14 15 8" fill="none" stroke="#4A90D9" strokeWidth="1.5"/>
                <line x1="18" y1="7" x2="18" y2="12" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="18" cy="13" r="1.5" fill="#F5A623"/>
              </svg>
            </motion.div>
          </div>

          {/* Piste */}
          <div className="w-64 h-[3px] rounded-full overflow-hidden"
               style={{ background: 'rgba(74,144,217,0.15)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #4A90D9 0%, #93C5FD 50%, #F5A623 100%)',
                transition: 'width 40ms linear',
              }}
            />
          </div>

          <p className="text-[9px] font-sans uppercase tracking-[0.3em] mt-0.5"
             style={{ color: 'rgba(74,144,217,0.45)' }}>
            Chargement de la console…
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
