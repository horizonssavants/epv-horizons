/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';
import { Stepper } from '../ui/Stepper.tsx';
import {
  GraduationCap, Phone, User, Landmark, Mail, Heart,
  ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Users,
} from 'lucide-react';

interface ChildData {
  prenomEnfant: string;
  nomEnfant: string;
  dateNaissance: string;
  sectionVisee: string;
}

interface PreInscriptionFormProps {
  onSuccess: (code: string, newProspect: any) => void;
  id?: string;
}

const emptyChild = (): ChildData => ({
  prenomEnfant: '', nomEnfant: '', dateNaissance: '', sectionVisee: 'PS',
});

const LEVELS = [
  { value: 'PS',  label: 'Petite Section (2-3 ans)' },
  { value: 'MS',  label: 'Moyenne Section (3-4 ans)' },
  { value: 'GS',  label: 'Grande Section (5-6 ans)' },
  { value: 'CP',  label: 'CPI / CP (6-7 ans)' },
  { value: 'CE1', label: 'CE1 (7-8 ans)' },
  { value: 'CE2', label: 'CE2 (8-9 ans)' },
  { value: 'CM1', label: 'CM1 (9-10 ans)' },
  { value: 'CM2', label: 'CM2 (10-11 ans)' },
];

const COMMUNES = [
  'Cocody','Marcory','Plateau','Yopougon','Abobo',
  'Adjamé','Treichville','Port-Bouët','Koumassi','Bingerville','Songon','Anyama',
];

const SOURCES = [
  'Réseaux sociaux (Facebook/Insta)',
  'Bouche-à-oreille (Famille/Ami)',
  'Flyer terrain (Distribution)',
  'Affichage public / Affiche',
  'Paroisse / Église / Mosquée',
  'Commerces / Boulangerie',
  'Autre',
];

const inputCls = 'w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:ring-1 focus:ring-brand-blue-light/50 focus:outline-none text-xs text-brand-dark transition-all';
const labelCls = 'block text-xs font-semibold text-brand-blue-medium mb-1.5';

export const PreInscriptionForm: React.FC<PreInscriptionFormProps> = ({ onSuccess, id }) => {
  /* ── Nombre d'enfants ── */
  const [nbEnfants, setNbEnfants] = useState(1);
  const [children,  setChildren]  = useState<ChildData[]>([emptyChild()]);

  /* ── Infos parent ── */
  const [prenomParent, setPrenomParent]       = useState('');
  const [nomParent,    setNomParent]          = useState('');
  const [lienParente,  setLienParente]        = useState<'Père'|'Mère'|'Tuteur'>('Mère');
  const [telephone,    setTelephone]          = useState('');
  const [email,        setEmail]              = useState('');

  /* ── Finalisation ── */
  const [commune,               setCommune]               = useState('Cocody');
  const [source,                setSource]                = useState(SOURCES[0]);
  const [codeParrainageUtilise, setCodeParrainageUtilise] = useState('');
  const [messageLibre,          setMessageLibre]          = useState('');
  const [rgpdAccepted,          setRgpdAccepted]          = useState(false);

  /* ── Navigation ── */
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  /* step 0           = sélection nb enfants
     step 1..N        = infos de l'enfant i
     step N+1         = infos parent
     step N+2 = final = finalisation        */
  const PARENT_STEP = nbEnfants + 1;
  const FINAL_STEP  = nbEnfants + 2;

  const steps = [
    { label: 'Nb. enfants', description: 'Combien ?' },
    ...children.map((_, i) => ({ label: `Enfant ${i + 1}`, description: 'État civil & classe' })),
    { label: 'Parent',       description: 'Responsable légal' },
    { label: 'Finalisation', description: 'Résidence & code' },
  ];

  /* UTM auto-fill */
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    let utm = sp.get('utm_source');
    if (!utm && window.location.hash.includes('?')) {
      utm = new URLSearchParams(window.location.hash.split('?')[1]).get('utm_source');
    }
    if (utm) {
      const clean = decodeURIComponent(utm).trim();
      const matched = SOURCES.find(o => o.toLowerCase().includes(clean.toLowerCase()));
      setSource(matched ?? `Campagne : ${clean.charAt(0).toUpperCase() + clean.slice(1)}`);
    }
  }, []);

  /* ── Mise à jour tableau enfants quand nb change ── */
  const handleNbChange = (n: number) => {
    setNbEnfants(n);
    setChildren(prev => {
      if (n > prev.length) return [...prev, ...Array(n - prev.length).fill(null).map(emptyChild)];
      return prev.slice(0, n);
    });
  };

  /* ── Mise à jour d'un champ enfant ── */
  const setChild = (idx: number, field: keyof ChildData, val: string) =>
    setChildren(prev => prev.map((c, i) => i === idx ? { ...c, [field]: val } : c));

  /* ── Validation par étape ── */
  const validate = (): boolean => {
    setError(null);
    if (step === 0) {
      if (nbEnfants < 1) { setError('Précisez le nombre d\'enfants.'); return false; }
      return true;
    }
    if (step >= 1 && step <= nbEnfants) {
      const c = children[step - 1];
      if (!c.prenomEnfant.trim() || !c.nomEnfant.trim() || !c.dateNaissance) {
        setError(`Veuillez renseigner tous les détails de l'enfant ${step}.`);
        return false;
      }
      return true;
    }
    if (step === PARENT_STEP) {
      if (!prenomParent.trim() || !nomParent.trim() || !telephone.trim() || !email.trim()) {
        setError('Veuillez renseigner les détails du responsable légal.'); return false;
      }
      if (telephone.replace(/\s+/g, '').length < 8) {
        setError('Numéro de téléphone invalide.'); return false;
      }
      if (!email.includes('@') || !email.includes('.')) {
        setError('Adresse email invalide.'); return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setStep(s => s + 1);
  };

  const handleBack = () => { setError(null); setStep(s => Math.max(0, s - 1)); };

  /* ── Soumission ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!rgpdAccepted) { setError("Vous devez accepter la charte d'utilisation des données."); return; }
    setLoading(true);
    try {
      const results = await Promise.all(
        children.map(child =>
          fetch('/api/prospects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prenomEnfant: child.prenomEnfant.trim(),
              nomEnfant:    child.nomEnfant.trim(),
              dateNaissance: child.dateNaissance,
              sectionVisee:  child.sectionVisee,
              prenomParent, nomParent, lienParente, telephone, email, commune, source,
              codeParrainageUtilise: codeParrainageUtilise || undefined,
              messageLibre: messageLibre || undefined,
            }),
          }).then(r => r.json())
        )
      );
      const failed = results.find(r => !r.success);
      if (failed) throw new Error(failed.error || 'Erreur lors de la création du dossier.');
      onSuccess(results[0].personalReferralCode, results.map(r => r.data));
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion avec le serveur.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Rendu ── */
  return (
    <Card id={id} className="p-6 md:p-8 relative">
      <div className="absolute top-0 right-0 p-3 text-brand-gold opacity-10">
        <Heart size={80} strokeWidth={1} />
      </div>

      <div className="mb-6 border-b border-brand-border/40 pb-4">
        <h3 className="font-sans font-bold text-xl text-brand-blue-deep text-center">
          Formulaire de Pré-inscription en Ligne
        </h3>
        <p className="text-center text-xs text-brand-muted mt-1">
          Rentrée scolaire 2026/2027 · Places contingentées par section.
        </p>
      </div>

      <div className="mb-8 overflow-hidden">
        <Stepper steps={steps} currentStep={step} />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={step === FINAL_STEP ? handleSubmit : handleNext} className="space-y-5">

        <AnimatePresence mode="wait">

          {/* ══ ÉTAPE 0 — Sélection du nombre d'enfants ══ */}
          {step === 0 && (
            <motion.div key="step-0"
              initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              transition={{ duration:0.22 }} className="space-y-6">
              <h4 className="font-sans font-semibold text-brand-blue-deep text-sm flex items-center gap-1.5 border-b border-brand-border/40 pb-2">
                <Users size={16} className="text-brand-gold" /> Combien d'enfants souhaitez-vous inscrire ?
              </h4>

              <div className="space-y-4">
                {/* Liste déroulante */}
                <div className="relative">
                  <select
                    value={nbEnfants}
                    onChange={e => handleNbChange(parseInt(e.target.value))}
                    className="w-full appearance-none px-5 py-4 text-base font-sans font-semibold rounded-xl border-2 focus:outline-none transition-all cursor-pointer"
                    style={{
                      borderColor: '#0D2E5C',
                      background:  '#EFF6FF',
                      color:       '#0D2E5C',
                      boxShadow:   '0 0 0 3px rgba(13,46,92,0.08)',
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'enfant' : 'enfants'}
                      </option>
                    ))}
                  </select>
                  {/* Chevron */}
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M4 6.5 L9 11.5 L14 6.5" stroke="#0D2E5C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Aperçu visuel du nombre choisi */}
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl"
                     style={{ background: 'white', border: '1.5px solid #E5E7EB' }}>
                  {Array(Math.min(nbEnfants, 8)).fill(0).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.06, duration: 0.25, ease: 'backOut' }}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: '#0D2E5C' }}
                    >
                      <User size={14} color="white" />
                    </motion.div>
                  ))}
                </div>

                <p className="text-center text-sm font-semibold text-brand-blue-deep">
                  {nbEnfants} {nbEnfants === 1 ? 'enfant sélectionné' : 'enfants sélectionnés'}
                </p>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-[11px] text-brand-blue-deep leading-relaxed font-sans">
                  <strong>Important :</strong> Un dossier distinct sera créé pour chaque enfant, avec les mêmes informations parentales.
                  Chaque enfant bénéficiera de son propre code de parrainage.
                </p>
              </div>
            </motion.div>
          )}

          {/* ══ ÉTAPES 1..N — Infos de chaque enfant ══ */}
          {step >= 1 && step <= nbEnfants && (
            <motion.div key={`step-child-${step}`}
              initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              transition={{ duration:0.22 }} className="space-y-4">

              {/* En-tête avec indicateur enfant */}
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                <h4 className="font-sans font-semibold text-brand-blue-deep text-sm flex items-center gap-1.5">
                  <GraduationCap size={16} className="text-brand-gold" />
                  Enfant {step} {nbEnfants > 1 && <span className="text-brand-muted text-xs">/ {nbEnfants}</span>}
                </h4>
                {/* Pills indicateurs */}
                {nbEnfants > 1 && (
                  <div className="flex gap-1">
                    {children.map((_, i) => (
                      <div key={i}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{
                          background: i + 1 === step ? '#0D2E5C' : i + 1 < step ? '#22C55E' : '#E5E7EB',
                          color:      i + 1 <= step ? 'white' : '#9CA3AF',
                        }}>
                        {i + 1 < step ? '✓' : i + 1}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(() => {
                const c = children[step - 1];
                const set = (f: keyof ChildData) => (v: string) => setChild(step - 1, f, v);
                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Nom de famille *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 text-brand-muted" size={14} />
                          <input type="text" required value={c.nomEnfant} onChange={e => set('nomEnfant')(e.target.value)}
                            placeholder="Nom officiel" className={`${inputCls} pl-9`} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Prénom(s) *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 text-brand-muted" size={14} />
                          <input type="text" required value={c.prenomEnfant} onChange={e => set('prenomEnfant')(e.target.value)}
                            placeholder="Tous les prénoms" className={`${inputCls} pl-9`} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Date de naissance *</label>
                        <input type="date" required value={c.dateNaissance} onChange={e => set('dateNaissance')(e.target.value)}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Section / Classe visée *</label>
                        <select value={c.sectionVisee} onChange={e => set('sectionVisee')(e.target.value)}
                          className={`${inputCls} bg-white`}>
                          {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                      </div>
                    </div>
                    {c.sectionVisee === 'CM2' && (
                      <div className="p-3.5 bg-brand-gold/15 border-l-4 border-brand-gold text-[11px] font-sans text-brand-dark flex gap-2.5 items-start">
                        <AlertTriangle size={14} className="text-brand-gold shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-brand-blue-deep">Droit d'examen · 3 000 FCFA :</strong>
                          {' '}Fin de cycle primaire (entrée en 6ème). Règlement au secrétariat.
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          )}

          {/* ══ ÉTAPE PARENT ══ */}
          {step === PARENT_STEP && (
            <motion.div key="step-parent"
              initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              transition={{ duration:0.22 }} className="space-y-4">
              <h4 className="font-sans font-semibold text-brand-blue-deep text-sm flex items-center gap-1.5 border-b border-brand-border/40 pb-2">
                <User size={16} className="text-brand-gold" /> Identité du responsable légal
              </h4>
              {nbEnfants > 1 && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] text-emerald-800 font-sans">
                  Ces informations seront associées aux {nbEnfants} dossiers.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nom de famille *</label>
                  <input type="text" required value={nomParent} onChange={e => setNomParent(e.target.value)}
                    placeholder="Nom officiel" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Prénom(s) *</label>
                  <input type="text" required value={prenomParent} onChange={e => setPrenomParent(e.target.value)}
                    placeholder="Prénom(s)" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Lien de parenté *</label>
                  <div className="flex gap-2 p-1 bg-brand-pale border border-brand-border/60">
                    {(['Mère','Père','Tuteur'] as const).map(opt => (
                      <button key={opt} type="button" onClick={() => setLienParente(opt)}
                        className={`flex-1 py-1.5 font-sans text-xs font-semibold cursor-pointer transition-all border ${
                          lienParente === opt ? 'bg-brand-blue-deep text-white border-brand-blue-deep' : 'text-brand-muted border-transparent hover:text-brand-dark'
                        }`}>{opt}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Téléphone WhatsApp (CIV) *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-brand-muted" size={14} />
                    <input type="tel" required value={telephone} onChange={e => setTelephone(e.target.value)}
                      placeholder="+225 07 78 98 14 56" className={`${inputCls} pl-9`} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Email du parent *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-brand-muted" size={14} />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="votre.email@domain.com" className={`${inputCls} pl-9`} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ ÉTAPE FINALISATION ══ */}
          {step === FINAL_STEP && (
            <motion.div key="step-final"
              initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              transition={{ duration:0.22 }} className="space-y-4">
              <h4 className="font-sans font-semibold text-brand-blue-deep text-sm flex items-center gap-1.5 border-b border-brand-border/40 pb-2">
                <Landmark size={16} className="text-brand-gold" /> Informations géographiques & Parrainage
              </h4>

              {/* Récap enfants */}
              {nbEnfants > 1 && (
                <div className="border border-brand-border/40 rounded-lg overflow-hidden">
                  <div className="bg-brand-blue-deep/5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-blue-deep">
                    Récapitulatif · {nbEnfants} enfants à inscrire
                  </div>
                  {children.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 border-t border-brand-border/30 text-xs">
                      <div className="w-5 h-5 rounded-full bg-brand-blue-deep flex items-center justify-center text-[9px] text-white font-bold shrink-0">{i+1}</div>
                      <span className="font-semibold text-brand-blue-deep">{c.prenomEnfant} {c.nomEnfant}</span>
                      <span className="text-brand-muted">— {LEVELS.find(l=>l.value===c.sectionVisee)?.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Commune de résidence *</label>
                  <select value={commune} onChange={e => setCommune(e.target.value)} className={`${inputCls} bg-white`}>
                    {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Comment avez-vous entendu parler de nous ?</label>
                  <select value={source} onChange={e => setSource(e.target.value)} className={`${inputCls} bg-white`}>
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Code Parrainage (Optionnel — format EPV-XXXXX)</label>
                <input type="text" value={codeParrainageUtilise} onChange={e => setCodeParrainageUtilise(e.target.value)}
                  placeholder="ex: EPV-KONE01 — 10% de réduction" className={`${inputCls} uppercase`} />
              </div>

              <div>
                <label className={labelCls}>Message ou précisions complémentaires (Optionnel)</label>
                <textarea value={messageLibre} onChange={e => setMessageLibre(e.target.value)}
                  placeholder="Allergies, particularités, questions..." rows={2}
                  className={inputCls} />
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-brand-pale border border-brand-border/60">
                <input type="checkbox" id="rgpd" required checked={rgpdAccepted}
                  onChange={e => setRgpdAccepted(e.target.checked)}
                  className="mt-1 h-3.5 w-3.5 rounded border-brand-border cursor-pointer" />
                <label htmlFor="rgpd" className="text-[10px] text-brand-muted cursor-pointer leading-relaxed">
                  J'autorise <strong>EPV Horizons Savants</strong> à conserver mes données pour le traitement
                  {nbEnfants > 1 ? ` des ${nbEnfants} dossiers d'inscription.` : " du dossier d'inscription."}
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boutons navigation */}
        <div className="flex justify-between items-center border-t border-brand-border/40 pt-4">
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={handleBack} disabled={loading}>
              <ChevronLeft size={14} /> Retour
            </Button>
          ) : <div />}

          {step < FINAL_STEP ? (
            <Button type="submit" variant="primary">
              Continuer <ChevronRight size={14} />
            </Button>
          ) : (
            <Button type="submit" variant="cta" disabled={loading}>
              <CheckCircle size={14} />
              {loading
                ? `Création de ${nbEnfants > 1 ? `${nbEnfants} dossiers` : 'votre dossier'}…`
                : `Valider ${nbEnfants > 1 ? `mes ${nbEnfants} inscriptions` : 'mon inscription'}`}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};
