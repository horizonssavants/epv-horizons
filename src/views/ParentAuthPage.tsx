import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ShieldCheck, RefreshCw, ArrowRight, CheckCircle } from 'lucide-react';

/* ─── Design tokens ─────────────────────────────────────────────────────────── */
const N  = '#0A1D3B';   // midnight navy
const NM = '#163968';   // navy medium
const G  = '#C8992A';   // gold
const GL = '#E8B84B';   // gold light
const GS = 'rgba(200,153,42,0.12)'; // gold subtle

/* ─── WhatsApp icon ─────────────────────────────────────────────────────────── */
function WhatsAppIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.413A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 0 1-4.054-1.107l-.29-.172-2.952.838.87-2.875-.19-.298A7.96 7.96 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.406-5.884c-.241-.12-1.425-.703-1.646-.783-.22-.08-.381-.12-.541.12-.16.24-.622.783-.763.944-.14.16-.281.18-.522.06-.241-.12-1.017-.375-1.937-1.195-.716-.638-1.2-1.426-1.341-1.666-.14-.241-.015-.371.106-.49.109-.108.241-.281.362-.422.12-.14.16-.241.24-.401.08-.16.04-.301-.02-.422-.06-.12-.541-1.305-.741-1.786-.195-.469-.394-.405-.541-.413l-.461-.008c-.16 0-.421.06-.642.301-.22.24-.841.822-.841 2.005s.861 2.326.981 2.487c.12.16 1.695 2.588 4.109 3.628.574.248 1.022.396 1.371.507.576.183 1.1.157 1.514.095.462-.069 1.425-.583 1.626-1.146.2-.562.2-1.044.14-1.146-.06-.1-.22-.16-.461-.281z"/>
    </svg>
  );
}

/* ─── Emblem illustration ───────────────────────────────────────────────────── */
function SchoolEmblem() {
  return (
    <svg viewBox="0 0 240 190" fill="none" xmlns="http://www.w3.org/2000/svg"
         className="w-full max-w-[188px] mx-auto">
      {/* Outer ring */}
      <circle cx="120" cy="106" r="76" stroke="rgba(255,255,255,0.045)" strokeWidth="1"/>
      <circle cx="120" cy="106" r="56" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>

      {/* Left page */}
      <path d="M52 133 L52 78 Q52 75 55 75 L114 75 L114 133 Q83 127 52 133Z"
            fill="rgba(255,255,255,0.055)" stroke="rgba(255,255,255,0.13)" strokeWidth="1"/>
      {/* Right page */}
      <path d="M188 133 L188 78 Q188 75 185 75 L126 75 L126 133 Q157 127 188 133Z"
            fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.13)" strokeWidth="1"/>
      {/* Spine */}
      <path d="M114 75 Q120 71 126 75 L126 133 Q120 137 114 133Z"
            fill="rgba(255,255,255,0.035)"/>

      {/* Lines — left */}
      {[88, 98, 108, 118].map(y => (
        <line key={y} x1="62" y1={y} x2="108" y2={y}
              stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeLinecap="round"/>
      ))}
      {/* Lines — right */}
      {[88, 98, 108].map(y => (
        <line key={y} x1="132" y1={y} x2="178" y2={y}
              stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeLinecap="round"/>
      ))}

      {/* Graduation cap */}
      <polygon points="120,30 162,50 120,61 78,50" fill="rgba(255,255,255,0.88)"/>
      <ellipse cx="120" cy="50" rx="42" ry="10" fill="rgba(255,255,255,0.62)"/>

      {/* Tassel cord */}
      <path d="M160 50 Q170 55 168 67" stroke={G} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="168" cy="70" r="5.5" fill={G}/>
      <circle cx="168" cy="70" r="3"   fill={GL}/>
      {[-2,0,2].map((dx, i) => (
        <line key={i} x1={168+dx} y1="75.5" x2={168+dx*1.8} y2="86"
              stroke={G} strokeWidth="1.3" strokeLinecap="round"/>
      ))}

      {/* Gold accents */}
      <circle cx="32"  cy="85"  r="3"   fill={G} opacity="0.45"/>
      <circle cx="208" cy="79"  r="2.4" fill={G} opacity="0.35"/>
      <circle cx="28"  cy="158" r="2.2" fill="rgba(255,255,255,0.18)"/>
      <circle cx="212" cy="165" r="3"   fill="rgba(255,255,255,0.12)"/>
    </svg>
  );
}

/* ─── Feature row ───────────────────────────────────────────────────────────── */
const FEATURES = [
  'Suivi scolaire en temps réel',
  'Communication directe avec l\'école',
  'Accès sécurisé via WhatsApp OTP',
];

/* ─── Left panel ────────────────────────────────────────────────────────────── */
function LeftPanel({ step, parentName }: { step: 'phone' | 'otp'; parentName: string }) {
  const firstName = parentName ? parentName.split(' ')[0] : '';
  return (
    <div className="hidden lg:flex lg:w-[56%] flex-shrink-0 flex-col items-start
                    justify-center relative overflow-hidden py-16 pl-16 pr-20"
         style={{ background: `linear-gradient(148deg, ${N} 0%, #0E2545 50%, ${N} 100%)` }}>

      {/* Fine diagonal line pattern */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             backgroundImage: `repeating-linear-gradient(
               135deg,
               rgba(255,255,255,0.018) 0px,
               rgba(255,255,255,0.018) 1px,
               transparent 1px,
               transparent 32px
             )`,
           }} />

      {/* Corner glow — top right */}
      <motion.div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(100,160,255,0.10) 0%, transparent 68%)` }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Corner glow — bottom left (gold) */}
      <motion.div className="absolute -bottom-52 -left-52 w-[580px] h-[580px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(200,153,42,0.10) 0%, transparent 65%)` }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      <div className="relative z-10 max-w-[370px]">

        {/* School identity block */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4 mb-14"
        >
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-2xl"
                 style={{ background: `radial-gradient(circle, ${GS} 0%, transparent 70%)`,
                          transform: 'scale(2.4)', filter: 'blur(14px)' }} />
            <div className="relative p-0.5 rounded-[14px]"
                 style={{ background: `linear-gradient(135deg, ${G}, rgba(232,184,75,0.3))` }}>
              <img src="/img/logo.jpg" alt="EPV Horizons Savants"
                   className="w-[50px] h-[50px] rounded-[12px] object-contain bg-white p-1.5
                              shadow-[0_6px_24px_rgba(0,0,0,0.30)]" />
            </div>
          </div>
          <div>
            <p className="text-[7.5px] font-[Inter,Poppins,sans-serif] font-semibold uppercase
                          tracking-[0.42em] mb-0.5"
               style={{ color: G }}>
              École privée d'excellence
            </p>
            <h2 className="font-[Inter,Poppins,sans-serif] font-bold text-[15.5px] text-white leading-tight">
              EPV Horizons Savants
            </h2>
            <p className="text-[9px] font-[Inter,Poppins,sans-serif] font-medium tracking-[0.08em] mt-0.5"
               style={{ color: 'rgba(255,255,255,0.30)' }}>
              Maternelle & Primaire · Abidjan, CI
            </p>
          </div>
        </motion.div>

        {/* Hero headline */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.30 }}
            className="mb-9"
          >
            {step === 'phone' ? (
              <>
                <h1 className="font-[Inter,Poppins,sans-serif] font-extrabold leading-[1.08]
                               text-white mb-3"
                    style={{ fontSize: '58px', letterSpacing: '-0.030em' }}>
                  Votre enfant,<br />
                  <span style={{ color: GL }}>notre priorité.</span>
                </h1>
                {/* Gold rule */}
                <div className="mb-5 mt-5" style={{ width: '56px', height: '2px',
                                                     background: `linear-gradient(90deg, ${G}, ${GL})`,
                                                     borderRadius: '2px' }} />
                <p className="font-[Inter,Poppins,sans-serif] font-light text-[13.5px] leading-[1.80]"
                   style={{ color: 'rgba(255,255,255,0.46)' }}>
                  Accédez à l'espace dédié aux familles pour suivre<br />
                  le parcours scolaire de votre enfant au quotidien.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-[Inter,Poppins,sans-serif] font-extrabold leading-[1.08]
                               text-white mb-3"
                    style={{ fontSize: '52px', letterSpacing: '-0.028em' }}>
                  {firstName
                    ? <>Bonjour,<br /><span style={{ color: GL }}>{firstName}.</span></>
                    : <>Bienvenue<br /><span style={{ color: GL }}>de retour.</span></>}
                </h1>
                <div className="mb-5 mt-5" style={{ width: '56px', height: '2px',
                                                     background: `linear-gradient(90deg, ${G}, ${GL})`,
                                                     borderRadius: '2px' }} />
                <p className="font-[Inter,Poppins,sans-serif] font-light text-[13.5px] leading-[1.80]"
                   style={{ color: 'rgba(255,255,255,0.46)' }}>
                  Votre code de connexion WhatsApp est en route.<br />
                  Entrez-le pour accéder à votre espace parent.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.60 }}
          className="flex flex-col gap-3.5 mb-12"
        >
          {FEATURES.map((text, i) => (
            <motion.div key={text}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.42 + i * 0.08, duration: 0.40 }}
              className="flex items-center gap-3"
            >
              <div style={{
                     width: '6px', height: '6px', borderRadius: '50%',
                     background: G, flexShrink: 0, boxShadow: `0 0 8px ${G}80`,
                   }} />
              <span className="font-[Inter,Poppins,sans-serif] text-[12px] font-medium leading-tight"
                    style={{ color: 'rgba(255,255,255,0.52)' }}>
                {text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.70, duration: 0.72 }}
        >
          <SchoolEmblem />
        </motion.div>

        {/* Security badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.50 }}
          className="flex items-center gap-2 mt-6"
        >
          <ShieldCheck size={9} style={{ color: 'rgba(255,255,255,0.16)' }} />
          <span className="font-[Inter,Poppins,sans-serif] text-[7.5px] uppercase tracking-[0.30em]"
                style={{ color: 'rgba(255,255,255,0.15)' }}>
            Connexion sécurisée · OTP WhatsApp · TLS 1.3
          </span>
        </motion.div>

      </div>
    </div>
  );
}

/* ─── Mobile header ─────────────────────────────────────────────────────────── */
function MobileHeader() {
  return (
    <div className="lg:hidden flex items-center gap-4 px-7 pt-10 pb-14"
         style={{ background: `linear-gradient(180deg, ${N} 0%, ${N} 100%)` }}>
      <div className="relative shrink-0 p-0.5 rounded-xl"
           style={{ background: `linear-gradient(135deg, ${G}, rgba(232,184,75,0.35))` }}>
        <img src="/img/logo.jpg" alt="EPV"
             className="w-10 h-10 rounded-[10px] object-contain bg-white p-1.5
                        shadow-[0_4px_16px_rgba(0,0,0,0.26)]" />
      </div>
      <div>
        <p className="text-[7px] font-[Inter,Poppins,sans-serif] font-semibold uppercase
                      tracking-[0.38em] mb-0.5"
           style={{ color: G }}>
          École d'excellence
        </p>
        <h2 className="font-[Inter,Poppins,sans-serif] font-bold text-[14.5px] text-white leading-tight">
          EPV Horizons Savants
        </h2>
        <p className="text-[8.5px] font-[Inter,Poppins,sans-serif]"
           style={{ color: 'rgba(255,255,255,0.32)' }}>
          Maternelle & Primaire · Abidjan
        </p>
      </div>
    </div>
  );
}

/* ─── Phone input ───────────────────────────────────────────────────────────── */
function PhoneInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative transition-all duration-200"
         style={{
           borderRadius: '14px',
           border: `1.5px solid ${focused ? N : '#DDE4F0'}`,
           background: focused ? '#FAFBFF' : '#F7F8FC',
           boxShadow: focused ? `0 0 0 4px rgba(10,29,59,0.07), 0 2px 8px rgba(10,29,59,0.06)` : 'none',
         }}>
      <input
        type="tel" required autoFocus
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="+225 07 78 98 14 56"
        className="w-full bg-transparent border-0 focus:outline-none"
        style={{
          fontFamily: 'Inter, Poppins, sans-serif',
          fontSize: '14.5px',
          fontWeight: 500,
          color: N,
          padding: '15px 18px',
          letterSpacing: '0.01em',
        }}
      />
    </div>
  );
}

/* ─── OTP boxes ─────────────────────────────────────────────────────────────── */
function OtpBoxes({ value, onChange, onComplete }: {
  value: string[]; onChange: (v: string[]) => void; onComplete: () => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    const next  = [...value];
    next[i]     = digit;
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
      borderColor: N, background: '#EEF4FF', color: N,
      boxShadow: `0 0 0 3px rgba(10,29,59,0.09)`,
      transform: 'translateY(-1px)',
    };
    if (d) return {
      borderColor: NM, background: N, color: 'white',
      boxShadow: `0 4px 14px rgba(10,29,59,0.20)`,
    };
    return { borderColor: '#DDE4F0', background: '#F7F8FC', color: N };
  };

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {value.map((d, i) => (
        <input key={i}
          ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onFocus={() => setFocusedIdx(i)}
          onBlur={() => setFocusedIdx(null)}
          className="border-[1.5px] rounded-[13px] focus:outline-none transition-all duration-150
                     text-center text-[22px] font-bold"
          style={{
            width: '52px', height: '62px',
            fontFamily: 'Inter, Poppins, sans-serif',
            letterSpacing: '0.04em',
            ...boxStyle(i, d),
          }}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

/* ─── Alert ─────────────────────────────────────────────────────────────────── */
function Alert({ type, msg }: { type: 'error' | 'info' | 'success'; msg: string }) {
  const cfg = {
    error:   { bg: 'rgba(239,68,68,0.05)',  border: 'rgba(239,68,68,0.15)',  text: 'text-red-600/80',  bar: 'bg-red-400' },
    info:    { bg: 'rgba(59,130,246,0.05)', border: 'rgba(59,130,246,0.15)', text: 'text-blue-700/80', bar: 'bg-blue-400' },
    success: { bg: 'rgba(34,197,94,0.05)',  border: 'rgba(34,197,94,0.15)',  text: 'text-emerald-700', bar: 'bg-emerald-400' },
  }[type];
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex items-start gap-3 px-4 py-3 rounded-2xl"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div className={`w-0.5 self-stretch rounded-full shrink-0 ${cfg.bar}`} />
      <p className={`text-[12px] flex-1 leading-relaxed ${cfg.text}`}
         style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>{msg}</p>
    </motion.div>
  );
}

/* ─── Resend timer ──────────────────────────────────────────────────────────── */
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
        <p className="text-[11.5px]"
           style={{ fontFamily: 'Inter, Poppins, sans-serif', color: `${N}40` }}>
          Renvoyer dans{' '}
          <span style={{ fontWeight: 700, color: `${N}65` }}>{seconds}s</span>
        </p>
      ) : (
        <button type="button" onClick={reset} disabled={loading}
          className="inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          style={{ fontFamily: 'Inter, Poppins, sans-serif', fontSize: '11.5px',
                   fontWeight: 600, color: `${N}60` }}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          Renvoyer un nouveau code
        </button>
      )}
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────────── */
interface ParentAuthPageProps {
  onSuccess: (session: any) => void;
  onBack: () => void;
}

export const ParentAuthPage: React.FC<ParentAuthPageProps> = ({ onSuccess, onBack }) => {
  const [step,       setStep]       = useState<'phone' | 'otp'>('phone');
  const [telephone,  setTelephone]  = useState('');
  const [parentName, setParentName] = useState('');
  const [otp,        setOtp]        = useState(Array(6).fill(''));
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [info,       setInfo]       = useState<string | null>(null);

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
    <>
      <style>{`
        @media (min-width: 1024px) {
          .epv-auth-right {
            clip-path: polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%);
            margin-left: -4.5%;
          }
        }
        .epv-auth-right { font-family: 'Inter', 'Poppins', system-ui, sans-serif; }
      `}</style>

      <div className="min-h-screen flex flex-col lg:flex-row overflow-x-hidden"
           style={{ background: N }}>

        {/* Mobile header */}
        <MobileHeader />

        {/* Left panel */}
        <LeftPanel step={step} parentName={parentName} />

        {/* Right panel — white */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
          className="epv-auth-right flex-1 bg-white relative
                     rounded-t-[42px] -mt-6 lg:mt-0 lg:rounded-none
                     flex flex-col items-center justify-center
                     min-h-[72vh] lg:min-h-screen
                     px-7 py-12 lg:px-16 lg:py-0"
          style={{ boxShadow: '-8px 0 64px rgba(0,0,0,0.18)' }}
        >
          {/* Gold top-edge accent */}
          <div className="absolute top-0 right-0 hidden lg:block"
               style={{
                 width: '88px', height: '3px',
                 background: `linear-gradient(90deg, transparent, ${G}, ${GL})`,
               }} />
          {/* Subtle warm tint in corners */}
          <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
               style={{ background: `radial-gradient(circle at 100% 0%, rgba(200,153,42,0.04) 0%, transparent 70%)` }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none"
               style={{ background: `radial-gradient(circle at 0% 100%, rgba(10,29,59,0.03) 0%, transparent 70%)` }} />

          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            onClick={step === 'otp'
              ? () => { setStep('phone'); setError(null); setOtp(Array(6).fill('')); }
              : onBack}
            className="absolute top-6 left-6 lg:left-10 flex items-center gap-1.5
                       transition-colors group cursor-pointer"
            style={{ color: `${N}35` }}
            onMouseEnter={e => (e.currentTarget.style.color = `${N}70`)}
            onMouseLeave={e => (e.currentTarget.style.color = `${N}35`)}
          >
            <ChevronLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[8.5px] font-semibold uppercase tracking-[0.26em]">
              {step === 'otp' ? 'Changer de numéro' : 'Retour'}
            </span>
          </motion.button>

          {/* Form container */}
          <div className="w-full max-w-[368px]">

            {/* Step indicators */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="flex items-center gap-2.5 mb-10"
            >
              {(['phone', 'otp'] as const).map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center
                                    transition-all duration-300"
                         style={{
                           background: (step === s || (i === 0 && step === 'otp')) ? N : '#EDF1FA',
                           color: (step === s || (i === 0 && step === 'otp')) ? 'white' : '#B8C2D8',
                           fontSize: '8px', fontWeight: 700,
                         }}>
                      {i === 0 && step === 'otp'
                        ? <CheckCircle size={12} />
                        : <span>{i + 1}</span>}
                    </div>
                    <span className="text-[7.5px] font-semibold uppercase tracking-[0.28em]"
                          style={{ color: `${N}38` }}>
                      {i === 0 ? 'Téléphone' : 'Code'}
                    </span>
                  </div>
                  {i === 0 && (
                    <div className="flex-1 max-w-[32px] h-[1px] transition-all duration-500"
                         style={{ background: step === 'otp' ? `${N}60` : '#DDE5F4' }} />
                  )}
                </React.Fragment>
              ))}
            </motion.div>

            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="mb-8"
              >
                {step === 'phone' ? (
                  <>
                    <h1 style={{
                          fontFamily: 'Inter, Poppins, sans-serif',
                          fontSize: '32px', fontWeight: 800,
                          color: N, lineHeight: 1.18, letterSpacing: '-0.020em',
                          marginBottom: '10px',
                        }}>
                      Espace Parent
                    </h1>
                    <p style={{
                         fontFamily: 'Inter, Poppins, sans-serif',
                         fontSize: '13.5px', fontWeight: 400,
                         color: `${N}55`, lineHeight: 1.75,
                       }}>
                      Entrez votre numéro WhatsApp pour recevoir<br />
                      votre code de connexion sécurisé.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 style={{
                          fontFamily: 'Inter, Poppins, sans-serif',
                          fontSize: '32px', fontWeight: 800,
                          color: N, lineHeight: 1.18, letterSpacing: '-0.020em',
                          marginBottom: '10px',
                        }}>
                      Vérification
                    </h1>
                    <p style={{
                         fontFamily: 'Inter, Poppins, sans-serif',
                         fontSize: '13.5px', fontWeight: 400,
                         color: `${N}55`, lineHeight: 1.75,
                       }}>
                      Entrez le code à 6 chiffres envoyé via<br />
                      WhatsApp sur votre téléphone.
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Alerts */}
            <AnimatePresence>
              {error && <div className="mb-5"><Alert type="error" msg={error} /></div>}
              {info  && <div className="mb-5"><Alert type="info"  msg={info}  /></div>}
            </AnimatePresence>

            {/* Forms */}
            <AnimatePresence mode="wait">

              {/* Step 1 — Phone */}
              {step === 'phone' && (
                <motion.form key="phone-step"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.24 }}
                  onSubmit={handleSendOtp}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label style={{
                             display: 'block',
                             fontFamily: 'Inter, Poppins, sans-serif',
                             fontSize: '9px', fontWeight: 700,
                             textTransform: 'uppercase', letterSpacing: '0.34em',
                             color: `${N}45`,
                           }}>
                      Numéro WhatsApp
                    </label>
                    <PhoneInput value={telephone} onChange={setTelephone} />
                    <p style={{
                         fontFamily: 'Inter, Poppins, sans-serif',
                         fontSize: '8.5px', color: `${N}30`, lineHeight: 1.7,
                       }}>
                      Numéro enregistré lors de votre inscription (ex : +225 07 78 98 14 56)
                    </p>
                  </div>

                  {/* CTA — WhatsApp */}
                  <motion.button type="submit"
                    disabled={loading || !telephone.trim()}
                    whileHover={{ scale: 1.014 }}
                    whileTap={{ scale: 0.986 }}
                    className="w-full flex items-center justify-center gap-2.5
                               transition-all duration-200 disabled:opacity-45
                               disabled:cursor-not-allowed cursor-pointer"
                    style={{
                      background: (loading || !telephone.trim())
                        ? '#22c55e'
                        : 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
                      boxShadow: (loading || !telephone.trim())
                        ? 'none'
                        : '0 8px 24px rgba(34,197,94,0.28), 0 2px 6px rgba(34,197,94,0.16)',
                      borderRadius: '100px',
                      padding: '15px 24px',
                      color: 'white',
                      fontFamily: 'Inter, Poppins, sans-serif',
                      fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.005em',
                    }}
                  >
                    {loading
                      ? <><div className="w-[15px] h-[15px] rounded-full border-2 border-white/35 border-t-white animate-spin" />
                          Envoi en cours…</>
                      : <><WhatsAppIcon size={15} /> Recevoir mon code WhatsApp</>}
                  </motion.button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 pt-0.5">
                    <div className="h-px flex-1" style={{ background: '#EEF1F9' }} />
                    <span style={{
                            fontFamily: 'Inter, Poppins, sans-serif',
                            fontSize: '7.5px', textTransform: 'uppercase',
                            letterSpacing: '0.32em', color: `${N}22`, whiteSpace: 'nowrap',
                          }}>
                      Authentification sécurisée
                    </span>
                    <div className="h-px flex-1" style={{ background: '#EEF1F9' }} />
                  </div>
                </motion.form>
              )}

              {/* Step 2 — OTP */}
              {step === 'otp' && (
                <motion.div key="otp-step"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.24 }}
                  className="space-y-6"
                >
                  {/* WhatsApp sent badge */}
                  <div className="flex items-center gap-3 py-3 px-4 rounded-2xl"
                       style={{
                         background: 'rgba(37,211,102,0.05)',
                         border: '1px solid rgba(37,211,102,0.16)',
                       }}>
                    <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center
                                    shrink-0 shadow-[0_3px_10px_rgba(37,211,102,0.38)]">
                      <WhatsAppIcon size={15} className="text-white" />
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Inter, Poppins, sans-serif', fontSize: '10.5px',
                                   fontWeight: 700, color: '#166534', lineHeight: 1.3 }}>
                        Code envoyé ✓
                      </p>
                      <p style={{ fontFamily: 'Inter, Poppins, sans-serif', fontSize: '9px',
                                   color: 'rgba(22,101,52,0.55)' }}>
                        {telephone}
                      </p>
                    </div>
                  </div>

                  {/* OTP inputs */}
                  <OtpBoxes value={otp} onChange={setOtp} onComplete={() => handleVerifyOtp()} />

                  {/* CTA — Verify */}
                  <motion.button type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={loading || otp.join('').length < 6}
                    whileHover={{ scale: 1.014 }}
                    whileTap={{ scale: 0.986 }}
                    className="w-full flex items-center justify-center gap-2.5
                               transition-all duration-200 disabled:opacity-45
                               disabled:cursor-not-allowed cursor-pointer"
                    style={{
                      background: (loading || otp.join('').length < 6)
                        ? N
                        : `linear-gradient(135deg, ${N} 0%, ${NM} 100%)`,
                      boxShadow: (loading || otp.join('').length < 6)
                        ? 'none'
                        : `0 8px 28px rgba(10,29,59,0.24), 0 2px 8px rgba(10,29,59,0.14)`,
                      borderRadius: '100px',
                      padding: '15px 24px',
                      color: 'white',
                      fontFamily: 'Inter, Poppins, sans-serif',
                      fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.005em',
                    }}
                  >
                    {loading
                      ? <><div className="w-[15px] h-[15px] rounded-full border-2 border-white/35 border-t-white animate-spin" />
                          Vérification…</>
                      : <>Accéder à mon espace <ArrowRight size={14} /></>}
                  </motion.button>

                  <ResendTimer onResend={handleSendOtp} loading={loading} />

                  <p className="text-center"
                     style={{ fontFamily: 'Inter, Poppins, sans-serif',
                              fontSize: '8px', color: `${N}28` }}>
                    Le code expire dans{' '}
                    <span style={{ fontWeight: 600, color: `${N}45` }}>10 minutes</span>
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer */}
          <p className="absolute bottom-6 hidden lg:block"
             style={{ fontFamily: 'Inter, Poppins, sans-serif', fontSize: '7px',
                      color: `${N}18`, textTransform: 'uppercase', letterSpacing: '0.30em' }}>
            EPV Horizons Savants · Abidjan © {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </>
  );
};
