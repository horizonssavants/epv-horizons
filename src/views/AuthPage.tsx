/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LoginForm } from '../components/forms/LoginForm.tsx';
import { ShieldCheck, ChevronLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { signInNeon } from '../lib/auth.ts';

interface AuthPageProps {
  mode: 'parent' | 'admin';
  onSuccess: (session: any) => void;
  onBack: () => void;
}

/* ─── Formulaire admin (identifiants locaux) ─────────── */
function AdminLoginForm({ onSuccess }: { onSuccess: (s: any) => void }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInNeon(email, password);
      localStorage.setItem('is_admin', 'true');
      onSuccess({ role: 'admin', email });
    } catch (err: any) {
      setError(err.message || 'Identifiants administrateur incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/12 border border-red-400/25 text-red-300 text-xs font-sans">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-white/45">
          Email administrateur
        </label>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="admin@epv.ci"
          className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-white text-sm font-sans
                     placeholder:text-white/25 focus:outline-none focus:border-brand-gold/60 focus:bg-white/10 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-white/45">
          Mot de passe
        </label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-11 rounded-xl bg-white/6 border border-white/12 text-white text-sm font-sans
                       placeholder:text-white/25 focus:outline-none focus:border-brand-gold/60 focus:bg-white/10 transition-all"
          />
          <button
            type="button" onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3.5 top-3.5 text-white/30 hover:text-white/60 transition-colors"
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
      className="w-full py-3 rounded-xl bg-brand-gold hover:bg-brand-gold-light text-brand-blue-deep
                   font-sans font-extrabold text-sm uppercase tracking-wide transition-colors mt-2
                   shadow-[0_6px_20px_rgba(245,166,35,0.30)] disabled:opacity-60 cursor-pointer"
      >
        {loading ? 'Connexion...' : 'Accéder au portail admin'}
      </button>
    </form>
  );
}

/* ─── Page Auth principale ───────────────────────────── */
export const AuthPage: React.FC<AuthPageProps> = ({ mode, onSuccess, onBack }) => {
  const isAdmin = mode === 'admin';

  const handleParentSuccess = (session: any) => {
    localStorage.setItem('parent_session', JSON.stringify(session));
    onSuccess(session);
  };

  return (
    <div className="min-h-screen bg-[#060d1a] flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Fond */}
      <div className="absolute inset-0 pattern-topo opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-gold/7 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/8 blur-[80px] rounded-full pointer-events-none" />

      {/* Bouton retour */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/40 hover:text-white/80
                   text-[11px] font-sans uppercase tracking-[0.2em] transition-colors group cursor-pointer"
      >
        <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Retour au site
      </motion.button>

      {/* Carte auth */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 bg-brand-gold/20 blur-2xl rounded-2xl scale-150 pointer-events-none" />
            <img
              src="/img/logo.jpg"
              alt="EPV"
              className="relative w-20 h-20 rounded-2xl object-contain bg-white p-2 mx-auto
                         shadow-[0_0_40px_rgba(245,166,35,0.25)]"
            />
          </div>

          <h1 className="font-sans font-extrabold text-2xl text-white uppercase tracking-[0.06em] mb-1">
            {isAdmin ? 'Portail Administrateur' : 'Espace Parent'}
          </h1>
          <p className="text-white/40 text-xs font-serif leading-relaxed max-w-xs mx-auto">
            {isAdmin
              ? 'Accès réservé à l\'administration d\'EPV Horizons Savants.'
              : 'Suivez votre dossier, rendez-vous et documents sécurisés.'}
          </p>

          {/* Badge sécurité */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <ShieldCheck size={11} className="text-brand-gold" />
            <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-white/25">
              Connexion sécurisée
            </span>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
          {isAdmin ? (
            <AdminLoginForm onSuccess={onSuccess} />
          ) : (
            /* LoginForm parent existant — enveloppé sans card (naked) */
            <div className="[&_input]:bg-white/6 [&_input]:border-white/12 [&_input]:text-white
                            [&_input:focus]:border-brand-gold/60 [&_input]:placeholder:text-white/25
                            [&_label]:text-white/50 [&_button[type=submit]]:mt-2">
              <LoginForm onSuccess={handleParentSuccess} />
            </div>
          )}
        </div>

        {/* Footer discret */}
        <p className="text-center text-[9px] text-white/20 font-sans uppercase tracking-widest mt-6">
          EPV Horizons Savants — Abidjan © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
};
