/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, Phone, ShieldCheck, MessageCircle,
  RefreshCw, ArrowRight, CheckCircle,
} from 'lucide-react';

function WhatsAppIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}
         xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.413A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 0 1-4.054-1.107l-.29-.172-2.952.838.87-2.875-.19-.298A7.96 7.96 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.406-5.884c-.241-.12-1.425-.703-1.646-.783-.22-.08-.381-.12-.541.12-.16.24-.622.783-.763.944-.14.16-.281.18-.522.06-.241-.12-1.017-.375-1.937-1.195-.716-.638-1.2-1.426-1.341-1.666-.14-.241-.015-.371.106-.49.109-.108.241-.281.362-.422.12-.14.16-.241.24-.401.08-.16.04-.301-.02-.422-.06-.12-.541-1.305-.741-1.786-.195-.469-.394-.405-.541-.413l-.461-.008c-.16 0-.421.06-.642.301-.22.24-.841.822-.841 2.005s.861 2.326.981 2.487c.12.16 1.695 2.588 4.109 3.628.574.248 1.022.396 1.371.507.576.183 1.1.157 1.514.095.462-.069 1.425-.583 1.626-1.146.2-.562.2-1.044.14-1.146-.06-.1-.22-.16-.461-.281z"/>
    </svg>
  );
}

interface ParentAuthPageProps {
  onSuccess: (session: any) => void;
  onBack: () => void;
}

/* ─── Illustration géométrique éducation ─── */
function EducationIllustration() {
  return (
    <svg viewBox="0 0 280 230" fill="none" xmlns="http://www.w3.org/2000/svg"
         className="w-full max-w-[240px] mx-auto">
      <circle cx="140" cy="118" r="88" fill="rgba(255,255,255,0.05)"/>
      <circle cx="140" cy="118" r="62" fill="rgba(255,255,255,0.04)"/>
      {/* Livre – page gauche */}
      <path d="M60 150 L60 82 C60 79.2 62.2 77 65 77 L133 77 L133 150 Q96 144 60 150Z"
            fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5"/>
      {/* Livre – page droite */}
      <path d="M220 150 L220 82 C220 79.2 217.8 77 215 77 L147 77 L147 150 Q184 144 220 150Z"
            fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5"/>
      {/* Reliure */}
      <path d="M133 77 Q140 73 147 77 L147 150 Q140 154 133 150 Z" fill="rgba(255,255,255,0.08)"/>
      {/* Lignes page gauche */}
      <line x1="73" y1="97"  x2="128" y2="97"  stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="73" y1="108" x2="126" y2="108" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="73" y1="119" x2="129" y2="119" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="73" y1="130" x2="124" y2="130" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Lignes page droite */}
      <line x1="152" y1="97"  x2="207" y2="97"  stroke="rgba(255,255,255,0.20)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="152" y1="108" x2="205" y2="108" stroke="rgba(255,255,255,0.20)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="152" y1="119" x2="208" y2="119" stroke="rgba(255,255,255,0.20)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="152" y1="130" x2="202" y2="130" stroke="rgba(255,255,255,0.20)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Chapeau diplômé */}
      <polygon points="140,36 185,58 140,70 95,58" fill="rgba(255,255,255,0.90)"/>
      <ellipse cx="140" cy="58" rx="45" ry="11" fill="rgba(255,255,255,0.70)"/>
      <ellipse cx="140" cy="70" rx="30" ry="8"  fill="rgba(255,255,255,0.15)"/>
      {/* Cordon + pompon */}
      <path d="M183 58 Q193 63 191 77" stroke="rgba(255,255,255,0.60)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="191" cy="80" r="7" fill="#F5A623"/>
      <circle cx="191" cy="80" r="4" fill="#FFD966"/>
      <line x1="188" y1="87" x2="185" y2="97" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="191" y1="87" x2="191" y2="98" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="194" y1="87" x2="197" y2="97" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Points décoratifs */}
      <circle cx="42"  cy="95"  r="4.5" fill="#F5A623" opacity="0.70"/>
      <circle cx="238" cy="90"  r="3.5" fill="#F5A623" opacity="0.60"/>
      <circle cx="38"  cy="170" r="3.5" fill="rgba(255,255,255,0.35)"/>
      <circle cx="242" cy="178" r="4"   fill="rgba(255,255,255,0.25)"/>
      <circle cx="108" cy="197" r="3"   fill="#F5A623" opacity="0.50"/>
      <circle cx="172" cy="202" r="3"   fill="rgba(255,255,255,0.30)"/>
      <path d="M42 95 L44 90 L46 95 L44 100 Z" fill="#F5A623" opacity="0.65"/>
      <path d="M238 90 L240 86 L242 90 L240 94 Z" fill="#F5A623" opacity="0.55"/>
    </svg>
  );
}

/* ─── Panneau gauche visuel ─── */
function LeftPanel({ step, parentName }: { step: 'phone' | 'otp'; parentName: string }) {
  const firstName = parentName ? parentName.split(' ')[0] : '';
  return (
    <motion.div
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.80, ease: [0.22, 1, 0.36, 1] }}
      className="w-full lg:w-1/2 relative flex flex-col items-center justify-center
                 overflow-hidden py-10 px-6 lg:p-12 lg:min-h-screen"
      style={{ background: '#0D2E5C' }}
    >
      {/* Motif de points blancs */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
             backgroundSize: '30px 30px',
           }} />
      {/* Bulle haut-droite */}
      <motion.div
        className="absolute -top-32 -right-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 68%)' }}
        animate={{ scale: [1, 1.10, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Bulle bas-gauche */}
      <motion.div
        className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 68%)' }}
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.60, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-[2.5] pointer-events-none" />
          <img
            src="/img/logo.jpg"
            alt="EPV Horizons Savants"
            className="relative w-20 h-20 lg:w-28 lg:h-28 rounded-[20px] object-contain bg-white
                       p-2 lg:p-2.5 mx-auto
                       shadow-[0_10px_40px_rgba(0,0,0,0.30),0_2px_10px_rgba(0,0,0,0.20)]"
          />
        </motion.div>

        {/* Nom institution */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.48, duration: 0.52 }}
          className="mb-6"
        >
          <span className="text-[9px] font-sans font-semibold uppercase tracking-[0.35em] text-white/40">
            École d'excellence
          </span>
          <h2 className="font-sans font-extrabold text-xl text-white leading-tight mt-0.5">
            EPV Horizons Savants
          </h2>
          <p className="text-[11px] font-sans text-white/50 mt-1">
            École Maternelle & Primaire · Abidjan, CI
          </p>
        </motion.div>

        {/* Message dynamique selon étape */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
            className="w-full mb-6"
          >
            {step === 'phone' ? (
              <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-left">
                <p className="text-sm font-sans text-white/75 leading-relaxed">
                  Accédez à l'espace dédié aux parents pour suivre le dossier et les actualités de votre enfant.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-5 h-5 rounded-lg bg-[#25D366]/20 flex items-center justify-center shrink-0">
                    <WhatsAppIcon size={11} className="text-[#25D366]" />
                  </div>
                  <span className="text-[9px] font-sans font-semibold uppercase tracking-[0.18em] text-white/35">
                    Authentification sécurisée via WhatsApp
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
                <h3 className="font-sans font-bold text-2xl text-white mb-1.5">
                  Bonjour{firstName ? ` ${firstName}` : ''}&nbsp;👋
                </h3>
                <p className="text-xs font-sans text-white/55 leading-relaxed">
                  Votre code WhatsApp est en route. Entrez-le pour accéder à votre espace parent.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Illustration — masquée sur mobile pour gagner de la hauteur */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.70 }}
          className="hidden lg:block w-full"
        >
          <EducationIllustration />
        </motion.div>

        {/* Badge sécurité */}
        <div className="hidden lg:flex items-center gap-1.5 mt-4">
          <ShieldCheck size={10} className="text-white/30" />
          <span className="text-[8px] font-sans uppercase tracking-[0.25em] text-white/25">
            Connexion sécurisée · OTP WhatsApp
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Champ téléphone ─── */
function PhoneInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="relative flex items-center px-4 py-3.5 transition-all duration-200"
      style={{
        background: focused ? '#F0F6FF' : '#FFFFFF',
        border: `2px solid ${focused ? '#1A4F8B' : '#D1D9EA'}`,
        boxShadow: focused ? '0 0 0 3px rgba(26,79,139,0.10)' : 'none',
      }}
    >
      <span className={`mr-3 shrink-0 transition-colors duration-200 ${focused ? 'text-[#1A4F8B]' : 'text-slate-400'}`}>
        <Phone size={16} />
      </span>
      <input
        type="tel" required autoFocus
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="+225 07 78 98 14 56"
        className="flex-1 bg-transparent border-0 text-sm text-[#0D2E5C] font-sans
                   placeholder:text-slate-300 focus:outline-none"
      />
    </div>
  );
}

/* ─── 6 cases OTP premium ─── */
function OtpBoxes({
  value, onChange, onComplete,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  onComplete: () => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
    if (digit && i === 5 && next.join('').length === 6) setTimeout(onComplete, 80);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted.length) return;
    const next = Array(6).fill('');
    pasted.split('').forEach((d, i) => { next[i] = d; });
    onChange(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) setTimeout(onComplete, 80);
  };

  const boxStyle = (i: number, d: string): React.CSSProperties => {
    if (focusedIdx === i) return {
      borderColor: '#1A4F8B',
      background: '#F0F6FF',
      color: '#0D2E5C',
      boxShadow: '0 0 0 3px rgba(26,79,139,0.12)',
    };
    if (d) return {
      borderColor: '#0D2E5C',
      background: '#EDF3FF',
      color: '#0D2E5C',
    };
    return { borderColor: '#D1D9EA', background: '#FFFFFF', color: '#0D2E5C' };
  };

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {value.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onFocus={() => setFocusedIdx(i)}
          onBlur={() => setFocusedIdx(null)}
          className="w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-bold font-sans
                     border-2 transition-all duration-150 focus:outline-none"
          style={boxStyle(i, d)}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

/* ─── Alerte ─── */
function Alert({ type, msg }: { type: 'error' | 'info' | 'success'; msg: string }) {
  const cfg = {
    error:   { bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.20)',  text: 'text-red-600/80',   bar: 'bg-red-400' },
    info:    { bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.20)', text: 'text-blue-700/80',  bar: 'bg-blue-400' },
    success: { bg: 'rgba(34,197,94,0.06)',  border: 'rgba(34,197,94,0.20)',  text: 'text-emerald-700', bar: 'bg-emerald-400' },
  }[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex items-start gap-3 px-4 py-3 rounded-xl"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div className={`w-1 self-stretch rounded-full shrink-0 ${cfg.bar}`} />
      <p className={`text-xs font-sans flex-1 leading-relaxed ${cfg.text}`}>{msg}</p>
    </motion.div>
  );
}

/* ─── Compteur de renvoi ─── */
function ResendTimer({ onResend, loading }: { onResend: () => void; loading: boolean }) {
  const [seconds, setSeconds] = useState(60);
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const reset = () => { setSeconds(60); onResend(); };

  return (
    <div className="text-center">
      {seconds > 0 ? (
        <p className="text-xs text-[#0D2E5C]/40 font-sans">
          Renvoyer le code dans{' '}
          <span className="font-bold text-[#1A4F8B]">{seconds}s</span>
        </p>
      ) : (
        <button
          type="button" onClick={reset} disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700
                     font-semibold font-sans transition-colors cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Renvoyer un nouveau code
        </button>
      )}
    </div>
  );
}

/* ─── Page principale ─── */
export const ParentAuthPage: React.FC<ParentAuthPageProps> = ({ onSuccess, onBack }) => {
  const [step,       setStep]       = useState<'phone' | 'otp'>('phone');
  const [telephone,  setTelephone]  = useState('');
  const [parentName, setParentName] = useState('');
  const [otp,        setOtp]        = useState(Array(6).fill(''));
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [info,       setInfo]       = useState<string | null>(null);

  /* ── Étape 1 : envoi OTP ── */
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!telephone.trim()) return;
    setError(null); setInfo(null); setLoading(true);
    try {
      const r = await fetch('/api/parent/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telephone: telephone.trim() }),
      });
      let data: any = {};
      try { data = await r.json(); } catch { /* non-JSON */ }
      if (!r.ok) throw new Error(data.error || `Erreur serveur (${r.status}). Veuillez réessayer.`);
      setParentName(data.name || '');
      setStep('otp');
      setOtp(Array(6).fill(''));
    } catch (err: any) {
      setError(err instanceof TypeError
        ? 'Impossible de contacter le serveur. Vérifiez votre connexion.'
        : (err.message || 'Erreur lors de l\'envoi du code.'));
    } finally {
      setLoading(false);
    }
  };

  /* ── Étape 2 : vérification OTP ── */
  const handleVerifyOtp = useCallback(async (digits?: string[]) => {
    const code = (digits ?? otp).join('');
    if (code.length < 6) return;
    setError(null); setLoading(true);
    try {
      const r = await fetch('/api/parent/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telephone: telephone.trim(), otp: code }),
      });
      let data: any = {};
      try { data = await r.json(); } catch { /* non-JSON */ }
      if (!r.ok) throw new Error(data.error || `Erreur serveur (${r.status}). Veuillez réessayer.`);
      if (data.token) sessionStorage.setItem('neon_auth_token', data.token);
      const kids = data.children || [data.prospect];
      localStorage.setItem('parent_session',  JSON.stringify(data.prospect));
      localStorage.setItem('parent_children', JSON.stringify(kids));
      onSuccess(data.prospect);
    } catch (err: any) {
      setError(err instanceof TypeError
        ? 'Impossible de contacter le serveur. Vérifiez votre connexion.'
        : (err.message || 'Code invalide.'));
      setOtp(Array(6).fill(''));
    } finally {
      setLoading(false);
    }
  }, [otp, telephone, onSuccess]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-x-hidden">

      {/* ── Panneau gauche ── */}
      <LeftPanel step={step} parentName={parentName} />

      {/* ── Panneau droit (formulaire) ── */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.80, ease: [0.22, 1, 0.36, 1] }}
        className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center
                   flex-1 lg:min-h-screen relative p-6 sm:p-10 lg:p-12"
      >
        {/* Bouton retour */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.30 }}
          onClick={step === 'otp'
            ? () => { setStep('phone'); setError(null); setOtp(Array(6).fill('')); }
            : onBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-[#0D2E5C]/40
                     hover:text-[#0D2E5C]/75 text-[10px] font-sans font-semibold uppercase
                     tracking-[0.22em] transition-colors group cursor-pointer"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          {step === 'otp' ? 'Changer de numéro' : 'Retour'}
        </motion.button>

        {/* Contenu formulaire */}
        <div className="w-full max-w-sm">

          {/* Indicateur d'étapes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.40 }}
            className="flex items-center gap-2 mb-8"
          >
            {(['phone', 'otp'] as const).map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px]
                               font-bold font-sans transition-all duration-300"
                    style={{
                      background: (step === s || (i === 0 && step === 'otp')) ? '#0D2E5C' : '#EFF2FB',
                      color:      (step === s || (i === 0 && step === 'otp')) ? 'white'   : '#94A3B8',
                    }}
                  >
                    {i === 0 && step === 'otp' ? <CheckCircle size={12} /> : i + 1}
                  </div>
                  <span className="text-[9px] font-sans font-semibold text-[#0D2E5C]/40 uppercase tracking-wide">
                    {i === 0 ? 'Téléphone' : 'Code OTP'}
                  </span>
                </div>
                {i === 0 && (
                  <div className="flex-1 max-w-[36px] h-px transition-all duration-500"
                       style={{ background: step === 'otp' ? '#0D2E5C' : '#E2EAFA' }} />
                )}
              </React.Fragment>
            ))}
          </motion.div>

          {/* Titre dynamique */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mb-7"
            >
              {step === 'phone' ? (
                <>
                  <h1 className="font-sans font-extrabold text-[26px] text-[#0D2E5C] leading-tight mb-1.5">
                    Espace Parent
                  </h1>
                  <p className="text-sm text-[#0D2E5C]/50 font-sans leading-relaxed">
                    Entrez votre numéro WhatsApp pour recevoir votre code de connexion.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="font-sans font-extrabold text-[26px] text-[#0D2E5C] leading-tight mb-1.5">
                    Vérification
                  </h1>
                  <p className="text-sm text-[#0D2E5C]/50 font-sans leading-relaxed">
                    Entrez le code à 6 chiffres envoyé sur WhatsApp.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Alertes */}
          <AnimatePresence>
            {error && <div className="mb-5"><Alert type="error" msg={error} /></div>}
            {info  && <div className="mb-5"><Alert type="info"  msg={info}  /></div>}
          </AnimatePresence>

          {/* Formulaires */}
          <AnimatePresence mode="wait">

            {/* Étape 1 : numéro */}
            {step === 'phone' && (
              <motion.form
                key="phone-step"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28 }}
                onSubmit={handleSendOtp}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="block text-xs font-sans font-semibold text-[#0D2E5C]/60">
                    Numéro WhatsApp inscrit à l'école
                  </label>
                  <PhoneInput value={telephone} onChange={setTelephone} />
                  <p className="text-[9px] text-[#0D2E5C]/35 font-sans leading-relaxed">
                    Numéro fourni lors de votre pré-inscription (ex : +225 07 78 98 14 56)
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !telephone.trim()}
                  whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                  className="w-full py-4 rounded-full text-white font-sans font-semibold text-sm
                             flex items-center justify-center gap-2 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #15803D 0%, #22C55E 100%)',
                    boxShadow: (loading || !telephone.trim())
                      ? 'none'
                      : '0 8px 24px rgba(34,197,94,0.35)',
                  }}
                >
                  {loading
                    ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Envoi en cours…</>
                    : <><WhatsAppIcon size={16} /> Recevoir mon code WhatsApp</>
                  }
                </motion.button>
              </motion.form>
            )}

            {/* Étape 2 : OTP */}
            {step === 'otp' && (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28 }}
                className="space-y-6"
              >
                {/* Badge WhatsApp / numéro */}
                <div
                  className="flex items-center gap-3 py-2.5 px-4 mx-auto w-fit"
                  style={{
                    background: 'rgba(34,197,94,0.07)',
                    border: '1.5px solid rgba(34,197,94,0.18)',
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0
                                  shadow-[0_2px_8px_rgba(37,211,102,0.40)]">
                    <WhatsAppIcon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-sans font-bold text-green-800 leading-tight">WhatsApp envoyé ✓</p>
                    <p className="text-[9px] text-green-700/65 font-sans">{telephone}</p>
                  </div>
                </div>

                {/* Cases OTP */}
                <OtpBoxes
                  value={otp}
                  onChange={setOtp}
                  onComplete={() => handleVerifyOtp()}
                />

                {/* Bouton connexion */}
                <motion.button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otp.join('').length < 6}
                  whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                  className="w-full py-4 rounded-full text-white font-sans font-semibold text-sm
                             flex items-center justify-center gap-2 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #1A4F8B 0%, #4A90D9 100%)',
                    boxShadow: (loading || otp.join('').length < 6)
                      ? 'none'
                      : '0 8px 28px rgba(26,79,139,0.30)',
                  }}
                >
                  {loading
                    ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Vérification…</>
                    : <>Me connecter <ArrowRight size={15} /></>
                  }
                </motion.button>

                <ResendTimer onResend={handleSendOtp} loading={loading} />

                <p className="text-center text-[9px] text-[#0D2E5C]/30 font-sans">
                  Le code expire dans <span className="font-semibold">10 minutes</span>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="absolute bottom-5 text-[8px] text-[#0D2E5C]/22 font-sans uppercase tracking-widest
                      hidden lg:block">
          EPV Horizons Savants · Abidjan © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
};
