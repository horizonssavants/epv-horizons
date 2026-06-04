/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Phone, ShieldCheck, MessageCircle, RefreshCw, ArrowRight, CheckCircle } from 'lucide-react';

interface ParentAuthPageProps {
  onSuccess: (session: any) => void;
  onBack: () => void;
}

/* ─── Champ téléphone ─── */
function PhoneInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="relative flex items-center rounded-2xl px-4 py-3.5 transition-all duration-200"
      style={{
        background: focused ? '#EFF6FF' : '#F8FAFF',
        border: `2px solid ${focused ? '#3B82F6' : '#E2EAFA'}`,
        boxShadow: focused ? '0 0 0 4px rgba(59,130,246,0.12)' : 'none',
      }}
    >
      <span className="text-blue-400 mr-3 shrink-0">
        <Phone size={16} />
      </span>
      <input
        type="tel"
        required
        autoFocus
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="+225 07 78 98 14 56"
        className="flex-1 bg-transparent border-0 text-sm text-[#0D2E5C] font-sans placeholder:text-blue-300/50 focus:outline-none"
      />
    </div>
  );
}

/* ─── 6 cases OTP ─── */
function OtpBoxes({
  value, onChange, onComplete,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  onComplete: () => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) {
      refs.current[i + 1]?.focus();
    }
    if (digit && i === 5) {
      const full = next.join('');
      if (full.length === 6) setTimeout(onComplete, 80);
    }
  };

  // Prise en charge du collage d'un code à 6 chiffres
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const next = Array(6).fill('');
      pasted.split('').forEach((d, i) => { next[i] = d; });
      onChange(next);
      const focusIdx = Math.min(pasted.length, 5);
      refs.current[focusIdx]?.focus();
      if (pasted.length === 6) setTimeout(onComplete, 80);
    }
  };

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {value.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className="w-11 h-14 text-center text-xl font-bold font-sans rounded-xl border-2 transition-all duration-150 focus:outline-none"
          style={{
            borderColor: d ? '#0D2E5C' : '#E2EAFA',
            background: d ? '#EFF6FF' : '#F8FAFF',
            color: '#0D2E5C',
            boxShadow: d ? '0 0 0 3px rgba(13,46,92,0.10)' : 'none',
          }}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

/* ─── Alerte ─── */
function Alert({ type, msg }: { type: 'error' | 'info' | 'success'; msg: string }) {
  const cfg = {
    error:   { bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.20)',   text: 'text-red-600/80',     bar: 'bg-red-400' },
    info:    { bg: 'rgba(59,130,246,0.06)',   border: 'rgba(59,130,246,0.20)',  text: 'text-blue-700/80',    bar: 'bg-blue-400' },
    success: { bg: 'rgba(34,197,94,0.06)',    border: 'rgba(34,197,94,0.20)',   text: 'text-emerald-700/80', bar: 'bg-emerald-400' },
  }[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
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
        <p className="text-[11px] text-[#0D2E5C]/40 font-sans">
          Renvoyer le code dans <span className="font-bold text-[#0D2E5C]/60">{seconds}s</span>
        </p>
      ) : (
        <button
          type="button"
          onClick={reset}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-[11px] text-blue-500 hover:text-blue-700 font-semibold font-sans transition-colors cursor-pointer"
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          Renvoyer un nouveau code
        </button>
      )}
    </div>
  );
}

export const ParentAuthPage: React.FC<ParentAuthPageProps> = ({ onSuccess, onBack }) => {
  const [step,      setStep]      = useState<'phone' | 'otp'>('phone');
  const [telephone, setTelephone] = useState('');
  const [parentName, setParentName] = useState('');
  const [otp,       setOtp]       = useState(Array(6).fill(''));
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [info,      setInfo]      = useState<string | null>(null);

  /* ── Étape 1 : envoi OTP ── */
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!telephone.trim()) return;
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const r = await fetch('/api/parent/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telephone: telephone.trim() }),
      });
      let data: any = {};
      try { data = await r.json(); } catch { /* réponse non-JSON */ }
      if (!r.ok) throw new Error(data.error || `Erreur serveur (${r.status}). Veuillez réessayer.`);
      setParentName(data.name || '');
      setStep('otp');
      setOtp(Array(6).fill(''));
    } catch (err: any) {
      if (err instanceof TypeError) {
        setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
      } else {
        setError(err.message || 'Erreur lors de l\'envoi du code.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Étape 2 : vérification OTP ── */
  const handleVerifyOtp = useCallback(async (digits?: string[]) => {
    const code = (digits ?? otp).join('');
    if (code.length < 6) return;
    setError(null);
    setLoading(true);
    try {
      const r = await fetch('/api/parent/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telephone: telephone.trim(), otp: code }),
      });
      let data: any = {};
      try { data = await r.json(); } catch { /* réponse non-JSON */ }
      if (!r.ok) throw new Error(data.error || `Erreur serveur (${r.status}). Veuillez réessayer.`);
      if (data.token) sessionStorage.setItem('neon_auth_token', data.token);
      const kids = data.children || [data.prospect];
      localStorage.setItem('parent_session',  JSON.stringify(data.prospect));
      localStorage.setItem('parent_children', JSON.stringify(kids));
      onSuccess(data.prospect);
    } catch (err: any) {
      if (err instanceof TypeError) {
        setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
      } else {
        setError(err.message || 'Code invalide.');
      }
      setOtp(Array(6).fill(''));
    } finally {
      setLoading(false);
    }
  }, [otp, telephone, onSuccess]);

  return (
    <div
      className="min-h-screen relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(160deg, #DBEAFE 0%, #EFF6FF 40%, #FFFFFF 100%)' }}
    >
      {/* Bulles décoratives */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { w:120, h:120, top:'8%',  left:'5%',  op:.12 },
          { w:80,  h:80,  top:'15%', left:'88%', op:.10 },
          { w:60,  h:60,  top:'75%', left:'90%', op:.08 },
          { w:100, h:100, top:'80%', left:'3%',  op:.09 },
        ].map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-300"
            style={{ width:s.w, height:s.h, top:s.top, left:s.left, opacity:s.op, filter:'blur(20px)' }}
            animate={{ scale:[1,1.15,1], y:[0,-10,0] }}
            transition={{ duration:5+i, repeat:Infinity, ease:'easeInOut', delay:i*0.7 }}
          />
        ))}
      </div>

      {/* Bouton retour */}
      <motion.button
        initial={{ opacity:0, x:-10 }}
        animate={{ opacity:1, x:0 }}
        transition={{ delay:0.2 }}
        onClick={step === 'otp' ? () => { setStep('phone'); setError(null); setOtp(Array(6).fill('')); } : onBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-[#0D2E5C]/40
                   hover:text-[#0D2E5C]/80 text-[10px] font-sans uppercase tracking-[0.22em]
                   transition-colors group cursor-pointer"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        {step === 'otp' ? 'Changer de numéro' : 'Retour'}
      </motion.button>

      {/* Carte */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity:0, y:28 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}
          className="w-full max-w-sm"
        >
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(13,46,92,0.10),0_4px_16px_rgba(13,46,92,0.06)] p-8">

            {/* Logo */}
            <div className="text-center mb-7">
              <motion.div
                initial={{ scale:0.85, opacity:0 }}
                animate={{ scale:1, opacity:1 }}
                transition={{ delay:0.15, duration:0.5 }}
                className="relative inline-block mb-4"
              >
                <div className="absolute inset-0 bg-blue-100 blur-2xl rounded-full scale-[2] pointer-events-none" />
                <img src="/img/logo.jpg" alt="EPV"
                  className="relative w-16 h-16 rounded-full object-contain bg-blue-50 p-1.5 mx-auto
                             shadow-[0_4px_20px_rgba(59,130,246,0.15)]" />
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, y:-8 }}
                  transition={{ duration:0.25 }}
                >
                  <h1 className="font-serif font-bold text-2xl text-[#0D2E5C] mb-1">
                    {step === 'phone' ? 'Espace Parent' : `Bonjour${parentName ? ` ${parentName}` : ''} 👋`}
                  </h1>
                  <p className="text-xs text-[#0D2E5C]/45 font-sans leading-relaxed">
                    {step === 'phone'
                      ? 'Entrez votre numéro WhatsApp pour recevoir votre code de connexion.'
                      : `Un code à 6 chiffres vient d'être envoyé sur votre WhatsApp.`}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-center gap-1.5 mt-2.5">
                {step === 'phone'
                  ? <><MessageCircle size={10} className="text-green-400" />
                     <span className="text-[8px] font-sans uppercase tracking-[0.2em] text-[#0D2E5C]/25">Connexion via WhatsApp</span></>
                  : <><ShieldCheck size={10} className="text-blue-300" />
                     <span className="text-[8px] font-sans uppercase tracking-[0.2em] text-[#0D2E5C]/25">Code OTP sécurisé · 6 chiffres</span></>
                }
              </div>
            </div>

            {/* Indicateur étapes */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {['phone','otp'].map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-sans transition-all duration-300"
                      style={{
                        background: step === s || (i === 0 && step === 'otp') ? '#0D2E5C' : '#E2EAFA',
                        color: step === s || (i === 0 && step === 'otp') ? 'white' : '#94A3B8',
                      }}
                    >
                      {i === 0 && step === 'otp' ? <CheckCircle size={11} /> : i + 1}
                    </div>
                    <span className="text-[9px] font-sans text-[#0D2E5C]/40 uppercase tracking-wide">
                      {i === 0 ? 'Téléphone' : 'Code OTP'}
                    </span>
                  </div>
                  {i === 0 && <div className="w-8 h-px bg-[#E2EAFA]" />}
                </React.Fragment>
              ))}
            </div>

            {/* Alertes */}
            <AnimatePresence>
              {error && <div className="mb-4"><Alert type="error" msg={error} /></div>}
              {info  && <div className="mb-4"><Alert type="info"  msg={info}  /></div>}
            </AnimatePresence>

            {/* Formulaires */}
            <AnimatePresence mode="wait">

              {/* ── Étape 1 : numéro de téléphone ── */}
              {step === 'phone' && (
                <motion.form
                  key="phone-step"
                  initial={{ opacity:0, x:20 }}
                  animate={{ opacity:1, x:0 }}
                  exit={{ opacity:0, x:-20 }}
                  transition={{ duration:0.25 }}
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
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 rounded-2xl text-white font-sans font-semibold text-sm
                               flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #15803D 0%, #22C55E 100%)',
                             boxShadow: '0 6px 20px rgba(34,197,94,0.30)' }}
                  >
                    {loading
                      ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Envoi en cours…</>
                      : <><MessageCircle size={15} /> Recevoir mon code WhatsApp</>
                    }
                  </motion.button>
                </motion.form>
              )}

              {/* ── Étape 2 : saisie OTP ── */}
              {step === 'otp' && (
                <motion.div
                  key="otp-step"
                  initial={{ opacity:0, x:20 }}
                  animate={{ opacity:1, x:0 }}
                  exit={{ opacity:0, x:-20 }}
                  transition={{ duration:0.25 }}
                  className="space-y-6"
                >
                  {/* Illustration WhatsApp reçu */}
                  <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-2xl mx-auto w-fit"
                       style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.20)' }}>
                    <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <MessageCircle size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-sans font-bold text-green-800">WhatsApp envoyé ✓</p>
                      <p className="text-[9px] text-green-700/70 font-sans">{telephone}</p>
                    </div>
                  </div>

                  {/* Cases OTP */}
                  <OtpBoxes
                    value={otp}
                    onChange={setOtp}
                    onComplete={() => handleVerifyOtp()}
                  />

                  {/* Bouton valider */}
                  <motion.button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={loading || otp.join('').length < 6}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 rounded-2xl text-white font-sans font-semibold text-sm
                               flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #1A4F8B 0%, #4A90D9 100%)',
                             boxShadow: '0 6px 20px rgba(26,79,139,0.25)' }}
                  >
                    {loading
                      ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Vérification…</>
                      : <>Me connecter <ArrowRight size={14} /></>
                    }
                  </motion.button>

                  <ResendTimer onResend={handleSendOtp} loading={loading} />

                  <p className="text-center text-[9px] text-[#0D2E5C]/30 font-sans leading-relaxed">
                    Le code expire dans 10 minutes.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-[9px] text-[#0D2E5C]/25 font-sans uppercase tracking-widest mt-5">
            EPV Horizons Savants · Abidjan © {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
