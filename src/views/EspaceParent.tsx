/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/auth.ts';
import { motion, AnimatePresence } from 'motion/react';
import { AppointmentForm }  from '../components/forms/AppointmentForm.tsx';
import { Badge }            from '../components/ui/Badge.tsx';
import { Toast }            from '../components/ui/Toast.tsx';
import { Prospect, RendezVous, StatutProspect, StatutRendezVous } from '../types.js';
import {
  LayoutGrid, BookOpen, Utensils, FolderOpen, MessageSquare, Gift,
  LogOut, Menu, X, ChevronRight, Check, ArrowLeft, Bell,
  GraduationCap, User, Calendar, Bus, Heart, Download,
  TrendingUp, CreditCard, Send, Phone, Mail, MapPin,
  Activity, Shield, Settings, FileText, AlertTriangle,
  CheckCircle, Clock, Copy, Share2, Lock, Smartphone,
  Sliders, BarChart2, Minus, Paperclip, Eye, EyeOff,
  ChevronDown, Users, Wallet, BookMarked, Info, Award
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ParentTab =
  | 'dashboard'
  | 'parcours'
  | 'vie'
  | 'finances'
  | 'messagerie'
  | 'parrainage'
  | 'profil';

// ─── Data ────────────────────────────────────────────────────────────────────

const SECTION_LABEL: Record<string, string> = {
  PS:'Petite Section', MS:'Moyenne Section', GS:'Grande Section',
  CP:'CP', CE1:'CE1', CE2:'CE2', CM1:'CM1', CM2:'CM2',
};

const STATUT_STEP = (s: StatutProspect) =>
  s === StatutProspect.INSCRIT ? 4 : s === StatutProspect.PRE_INSCRIT ? 2 : 1;

const STEPS = [
  { label: 'Pré-inscription',  Icon: FileText },
  { label: 'Évaluation',       Icon: Users },
  { label: 'Documents',        Icon: CheckCircle },
  { label: 'Inscrit',          Icon: GraduationCap },
];

const TARIFS_DEFAUT: Record<string, number> = {
  PS:1350000, MS:1350000, GS:1350000,
  CP:1650000, CE1:1650000, CE2:1650000,
  CM1:1880000, CM2:1880000,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtMoney = (n: number) =>
  n.toLocaleString('fr-FR') + ' FCFA';

const fmtDate = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString('fr-FR', opts || { day: 'numeric', month: 'long', year: 'numeric' });

const todayLabel = () =>
  new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const avg = (notes: any[], key: 't1' | 't2') => {
  if (!notes.length) return '—';
  const total = notes.reduce((s: number, n: any) => s + (n[key] || 0) * n.coef, 0);
  const coef  = notes.reduce((s: number, n: any) => s + n.coef, 0);
  return coef > 0 ? (total / coef).toFixed(2) : '—';
};

// ─── UI Primitives ────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function KpiCard({ label, value, sub, Icon, accent = false }: {
  label: string; value: string | number; sub?: string;
  Icon: React.FC<any>; accent?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className={`text-2xl font-bold mt-1.5 ${accent ? 'text-[#F5A623]' : 'text-slate-900'}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-slate-400" />
        </div>
      </div>
    </Card>
  );
}

function SubTabNav<T extends string>({
  tabs, active, onChange
}: { tabs: { id: T; label: string }[]; active: T; onChange: (t: T) => void }) {
  return (
    <div className="flex gap-1 border-b border-slate-200 mb-6">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer
            ${active === t.id
              ? 'border-[#0D2E5C] text-[#0D2E5C]'
              : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string, string> = {
    payée: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    en_attente: 'bg-amber-50 text-amber-700 border-amber-200',
    confirme: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    planifie: 'bg-blue-50 text-blue-700 border-blue-200',
    annule: 'bg-red-50 text-red-600 border-red-200',
    fait: 'bg-slate-50 text-slate-500 border-slate-200',
    done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  const labels: Record<string, string> = {
    payée: 'Payée', en_attente: 'En attente',
    confirme: 'Confirmé', planifie: 'Planifié',
    annule: 'Annulé', fait: 'Effectué',
    done: 'Fait', pending: 'À faire',
  };
  return (
    <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded border ${map[statut] || map.planifie}`}>
      {labels[statut] || statut}
    </span>
  );
}

function MiniLineChart({ values, color = '#0D2E5C' }: { values: number[]; color?: string }) {
  const W = 96; const H = 32; const PAD = 4;
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: PAD + (i / (values.length - 1)) * (W - 2 * PAD),
    y: H - PAD - ((v - min) / range) * (H - 2 * PAD),
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />)}
    </svg>
  );
}

function ProgressBar({ value, max = 100, color = '#0D2E5C' }: { value: number; max?: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} />
      </div>
      <span className="text-[11px] font-mono font-semibold text-slate-600 w-8 text-right">{pct}%</span>
    </div>
  );
}

function SectionPage({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="mb-1">
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════════════

function DashboardTab({ session, appointments, devoirs, cantine, notes, absences, messages, evenements, paiements, reduction, tarifs, onTabChange }: {
  session: Prospect; appointments: RendezVous[];
  devoirs: any[]; cantine: any[]; notes: any[]; absences: any[]; messages: any[]; evenements: any[];
  paiements: any[]; reduction: number; tarifs: Record<string,number>;
  onTabChange: (t: ParentTab) => void;
}) {
  const nextRdv    = appointments
    .filter(r => r.statut !== StatutRendezVous.ANNULE && new Date(r.dateHeure) >= new Date())
    .sort((a, b) => +new Date(a.dateHeure) - +new Date(b.dateHeure))[0];

  const avgT2      = avg(notes, 't2');
  const pendingHW  = devoirs.filter(d => d.statut === 'pending').length;
  const todayIdx   = new Date().getDay();
  const todayMenu  = cantine[Math.max(0, Math.min(todayIdx - 1, 4))];
  const unreadMsg  = messages.filter(m => !m.lu).length;

  // Solde réel : annuel avec réduction parrainage - total déjà payé
  const annuel  = tarifs[session.sectionVisee] || TARIFS_DEFAUT[session.sectionVisee] || 1500000;
  const annuelReduit = Math.round(annuel * (1 - reduction / 100));
  const totalPaye = paiements
    .filter(p => ['T1','T2','T3'].includes(p.trimestre))
    .reduce((s: number, p: any) => s + Number(p.montant), 0);
  const soldeDu = Math.max(0, annuelReduit - totalPaye);

  return (
    <SectionPage
      title={`Tableau de bord — ${session.prenomParent} ${session.nomParent[0]}.`}
      sub={`${todayLabel()} · Dossier de ${session.prenomEnfant} ${session.nomEnfant}, ${SECTION_LABEL[session.sectionVisee] || session.sectionVisee}`}
    >
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Moyenne générale" value={`${avgT2}/20`} sub="2e trimestre · Coefficient total 16" Icon={BarChart2} />
        <KpiCard label="Assiduité" value="97 %" sub={`${absences.length} absence${absences.length>1?'s':''} enregistrée${absences.length>1?'s':''}`} Icon={Activity} />
        <KpiCard label="Devoirs en cours" value={pendingHW} sub={`sur ${devoirs.length} exercices assignés`} Icon={BookOpen} />
        <KpiCard label="Solde en attente" value={fmtMoney(soldeDu)}
          sub={reduction > 0 ? `Réduction parrainage ${reduction}% appliquée` : 'Scolarité année en cours'}
          Icon={CreditCard} accent />
      </div>

      {/* Row 2: Notes progression + RDV/Événements */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Progression notes */}
        <Card>
          <CardHeader title="Progression académique" sub="Comparatif T1 → T2 par matière"
            action={
              <button onClick={() => onTabChange('parcours')}
                className="text-[11px] font-semibold text-[#0D2E5C] hover:underline cursor-pointer flex items-center gap-1">
                Détail <ChevronRight size={13} />
              </button>
            }
          />
          <div className="p-5 space-y-3">
            {notes.map((n: any, i: number) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4">
                <span className="text-xs text-slate-600 truncate">{n.matiere}</span>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums w-8 text-right">{n.t1}</span>
                <MiniLineChart values={[n.t1, n.t2 || n.t1]} color={(n.t2||n.t1) >= n.t1 ? '#059669' : '#DC2626'} />
                <span className="text-[11px] font-mono font-semibold text-slate-800 tabular-nums w-8 text-right">{n.t2 ?? '—'}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Prochains RDV + Événements */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Prochain rendez-vous" />
            <div className="p-5">
              {nextRdv ? (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-slate-900 flex flex-col items-center justify-center text-white shrink-0">
                    <span className="font-bold text-base leading-none">{new Date(nextRdv.dateHeure).getDate()}</span>
                    <span className="text-[9px] text-white/60 uppercase mt-0.5">
                      {new Date(nextRdv.dateHeure).toLocaleString('fr-FR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{nextRdv.typeRdv}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(nextRdv.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · 30 min
                    </p>
                    <div className="mt-2"><StatusBadge statut={nextRdv.statut} /></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">Aucun rendez-vous planifié.</p>
                  <button onClick={() => onTabChange('finances')}
                    className="text-[11px] font-semibold text-[#0D2E5C] hover:underline cursor-pointer">
                    Prendre RDV
                  </button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Agenda — Prochains événements" />
            <div className="divide-y divide-slate-50">
              {evenements.slice(0, 3).map((e: any, i: number) => (
                <div key={i} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0">
                    <span className="font-bold text-sm text-slate-800 leading-none">{new Date(e.date).getDate()}</span>
                    <span className="text-[8px] text-slate-400 uppercase">
                      {new Date(e.date).toLocaleString('fr-FR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{e.titre}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{e.heure} · {e.lieu}</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 shrink-0">{e.type}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3: Cantine + Assiduité */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Cantine — menu du jour */}
        <Card>
          <CardHeader title="Menu de la cantine — semaine en cours"
            action={
              <button onClick={() => onTabChange('vie')}
                className="text-[11px] font-semibold text-[#0D2E5C] hover:underline cursor-pointer flex items-center gap-1">
                Semaine complète <ChevronRight size={13} />
              </button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-2.5 font-semibold text-slate-400 text-[10px] uppercase tracking-wide">Jour</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-slate-400 text-[10px] uppercase tracking-wide">Plat principal</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-slate-400 text-[10px] uppercase tracking-wide hidden sm:table-cell">Dessert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cantine.map((c: any, i: number) => {
                  const isToday = c.jour === ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][new Date().getDay()];
                  return (
                    <tr key={i} className={isToday ? 'bg-slate-50' : ''}>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${isToday ? 'text-[#0D2E5C]' : 'text-slate-600'}`}>{c.jour}</span>
                        {isToday && <span className="ml-2 text-[9px] font-bold text-[#F5A623] uppercase">Aujourd'hui</span>}
                      </td>
                      <td className="px-3 py-3 text-slate-600">{c.plat}</td>
                      <td className="px-3 py-3 text-slate-400 hidden sm:table-cell">{c.dessert}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Assiduité résumé */}
        <Card>
          <CardHeader title="Assiduité — Année scolaire 2025/2026" />
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Taux de présence', value: '97,2 %', color: 'text-emerald-700' },
                { label: 'Absences',          value: `${absences.filter((a:any)=>a.type==='Absence').length}`,  color: 'text-slate-900' },
                { label: 'Retards',           value: `${absences.filter((a:any)=>a.type==='Retard').length}`,   color: 'text-slate-900' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-md p-3 border border-slate-100">
                  <p className={`font-bold text-xl ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Dernières absences</p>
              {absences.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-xs text-slate-600">{fmtDate(a.date, { day:'numeric', month:'short' })} — {a.motif}</span>
                  <StatusBadge statut={a.type === 'Absence' ? 'annule' : 'en_attente'} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Messages non lus */}
      {unreadMsg > 0 && (
        <Card className="border-l-4 border-l-[#0D2E5C]">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare size={16} className="text-[#0D2E5C]" />
              <p className="text-sm font-semibold text-slate-800">
                {unreadMsg} message{unreadMsg > 1 ? 's' : ''} non lu{unreadMsg > 1 ? 's' : ''} dans votre messagerie
              </p>
            </div>
            <button onClick={() => onTabChange('messagerie')}
              className="text-[11px] font-semibold text-[#0D2E5C] hover:underline cursor-pointer flex items-center gap-1">
              Consulter <ChevronRight size={13} />
            </button>
          </div>
        </Card>
      )}
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PARCOURS ACADÉMIQUE
// ════════════════════════════════════════════════════════════════════════════

function ParcoursTab({ session, devoirs, setDevoirs, notes, absences, bilinguisme }: {
  session: Prospect; devoirs: any[]; setDevoirs: React.Dispatch<React.SetStateAction<any[]>>;
  notes: any[]; absences: any[]; bilinguisme: any | null;
}) {
  type Sub = 'cahier' | 'resultats' | 'bilingue' | 'assiduite';
  const [sub, setSub] = useState<Sub>('resultats');

  const toggleDevoir = async (i: number) => {
    const d = devoirs[i];
    if (!d) return;
    const next = d.statut === 'done' ? 'pending' : 'done';
    await apiFetch(`/api/devoirs/${d.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ statut: next }) });
    setDevoirs(prev => prev.map((x, j) => j === i ? { ...x, statut: next } : x));
  };

  const competences: { competence: string; niveau: number }[] = bilinguisme?.competences || [];

  return (
    <SectionPage title="Parcours académique"
      sub={`${session.prenomEnfant} ${session.nomEnfant} · ${SECTION_LABEL[session.sectionVisee] || session.sectionVisee} · Rentrée 2026`}>

      <SubTabNav
        tabs={[
          { id: 'resultats', label: 'Résultats & Bulletins' },
          { id: 'cahier',    label: 'Cahier de textes'      },
          { id: 'bilingue',  label: 'Progression bilingue'  },
          { id: 'assiduite', label: 'Assiduité'             },
        ]}
        active={sub} onChange={setSub}
      />

      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {sub === 'resultats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: '1er trimestre',  val: avg(notes, 't1'), sub: 'Moyenne pondérée' },
                  { label: '2e trimestre',   val: avg(notes, 't2'), sub: 'Moyenne pondérée' },
                  { label: '3e trimestre',   val: '—',                  sub: 'En cours' },
                ].map(s => (
                  <Card key={s.label} className="p-5 text-center">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{s.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{s.val !== '—' ? `${s.val}` : '—'}</p>
                    {s.val !== '—' && <p className="text-[10px] text-slate-400 mt-0.5">sur 20</p>}
                    <p className="text-[10px] text-slate-400 mt-1">{s.sub}</p>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader title="Détail des notes par matière" sub="Coefficient de pondération appliqué" />
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {['Matière', 'Coef.', '1er Trimestre', '2e Trimestre', 'Évolution'].map(h => (
                          <th key={h} className="text-left px-5 py-3 font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {notes.map((n: any, i: number) => {
                        const up = n.t2 > n.t1;
                        return (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3.5 font-medium text-slate-800">{n.matiere}</td>
                            <td className="px-5 py-3.5 text-slate-400 text-center">{n.coef}</td>
                            <td className="px-5 py-3.5 font-mono text-slate-600 tabular-nums">{n.t1.toFixed(1)}</td>
                            <td className="px-5 py-3.5 font-mono font-semibold text-slate-900 tabular-nums">{n.t2.toFixed(1)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-[10px] font-semibold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {up ? '+' : ''}{(n.t2 - n.t1).toFixed(1)} pt
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-400">Bulletin officiel disponible en fin de trimestre</p>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white text-[10px] font-semibold cursor-pointer hover:bg-slate-700 transition-colors">
                    <Download size={11} /> Télécharger PDF
                  </button>
                </div>
              </Card>
            </div>
          )}

          {sub === 'cahier' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-500">
                  Semaine du {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </p>
                <span className="text-xs font-semibold text-amber-700">
                  {devoirs.filter(d => d.statut === 'pending').length} devoir{devoirs.filter(d=>d.statut==='pending').length>1?'s':''} en attente
                </span>
              </div>
              <Card>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Matière', 'Travail demandé', 'À rendre', 'Statut'].map(h => (
                        <th key={h} className="text-left px-5 py-3 font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {devoirs.map((d, i) => (
                      <tr key={i} className={`hover:bg-slate-50 transition-colors ${d.statut==='done'?'opacity-60':''}`}>
                        <td className="px-5 py-3.5 font-semibold text-slate-700 whitespace-nowrap">{d.matiere}</td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-xs">{d.sujet}</td>
                        <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{d.rendu}</td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => toggleDevoir(i)}
                            className="flex items-center gap-1.5 cursor-pointer">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                              ${d.statut==='done'?'bg-emerald-500 border-emerald-500':'bg-white border-slate-300'}`}>
                              {d.statut==='done' && <Check size={10} className="text-white" strokeWidth={3} />}
                            </div>
                            <StatusBadge statut={d.statut} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {sub === 'bilingue' && (
            <div className="space-y-4">
              {competences.length === 0 ? (
                <Card className="p-8 text-center">
                  <BookMarked size={24} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-400">Aucune donnée de progression bilingue disponible pour le moment.</p>
                </Card>
              ) : (
                <>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-slate-800">Niveau de progression en anglais</h3>
                      {bilinguisme?.niveau && (
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Niveau CECRL estimé : {bilinguisme.niveau}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-6">Programme bilingue EPV — {SECTION_LABEL[session.sectionVisee] || session.sectionVisee} · 8h d'anglais par semaine</p>
                    <div className="space-y-4">
                      {competences.map((b: any, i: number) => (
                        <div key={i} className="grid grid-cols-[200px_1fr] items-center gap-6">
                          <span className="text-xs font-medium text-slate-700">{b.competence}</span>
                          <ProgressBar value={b.niveau} />
                        </div>
                      ))}
                    </div>
                  </Card>
                  {bilinguisme?.commentaire && (
                    <Card className="p-5">
                      <div className="flex items-start gap-3">
                        <Info size={15} className="text-[#0D2E5C] shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 leading-relaxed">{bilinguisme.commentaire}</p>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}

          {sub === 'assiduite' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Taux de présence',  val: '97,2 %', Icon: Activity },
                  { label: 'Absences totales',   val: `${absences.filter((a:any)=>a.type==='Absence').length} jours`, Icon: AlertTriangle },
                  { label: 'Retards enregistrés', val: `${absences.filter((a:any)=>a.type==='Retard').length}`, Icon: Clock },
                ].map(s => (
                  <KpiCard key={s.label} label={s.label} value={s.val} Icon={s.Icon} />
                ))}
              </div>
              <Card>
                <CardHeader title="Registre des absences et retards" />
                {absences.length === 0 ? (
                  <div className="px-5 py-8 text-center text-slate-400 text-sm">Aucune absence enregistrée pour cette année scolaire.</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {['Date', 'Type', 'Motif', 'Durée'].map(h => (
                          <th key={h} className="text-left px-5 py-3 font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {absences.map((a: any, i: number) => (
                        <tr key={i}>
                          <td className="px-5 py-3.5 text-slate-600">{fmtDate(a.date)}</td>
                          <td className="px-5 py-3.5">
                            <StatusBadge statut={a.type === 'Absence' ? 'annule' : 'en_attente'} />
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">{a.motif}</td>
                          <td className="px-5 py-3.5 text-slate-400">{a.duree}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// VIE SCOLAIRE
// ════════════════════════════════════════════════════════════════════════════

function VieScolaireTab({ session, cantine, evenements, transport, sante }: { session: Prospect; cantine: any[]; evenements: any[]; transport: any[]; sante: any | null }) {
  type Sub = 'cantine' | 'agenda' | 'transport' | 'sante';
  const [sub, setSub] = useState<Sub>('cantine');

  return (
    <SectionPage title="Vie scolaire" sub="Services aux familles — informations pratiques">

      <SubTabNav
        tabs={[
          { id: 'cantine',   label: 'Menu de la cantine' },
          { id: 'agenda',    label: 'Agenda & Événements' },
          { id: 'transport', label: 'Transport scolaire'  },
          { id: 'sante',     label: 'Santé & Infirmerie'  },
        ]}
        active={sub} onChange={setSub}
      />

      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {sub === 'cantine' && (
            <Card>
              <CardHeader title="Menu hebdomadaire" sub="Cuisine locale et internationale — validation diététique mensuelle" />
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Jour', 'Plat principal', 'Accompagnement', 'Dessert'].map(h => (
                        <th key={h} className="text-left px-5 py-3 font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {cantine.map((c: any, i: number) => {
                      const isToday = c.jour === ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][new Date().getDay()];
                      return (
                        <tr key={i} className={`${isToday ? 'bg-slate-50 border-l-2 border-l-[#F5A623]' : 'hover:bg-slate-50/50'} transition-colors`}>
                          <td className="px-5 py-4 font-semibold text-slate-800">
                            {c.jour}
                            {isToday && <span className="ml-2 text-[9px] font-bold text-[#F5A623] uppercase tracking-wide">Aujourd'hui</span>}
                          </td>
                          <td className="px-5 py-4 text-slate-700 font-medium">{c.plat}</td>
                          <td className="px-5 py-4 text-slate-500">{c.accomp}</td>
                          <td className="px-5 py-4 text-slate-400">{c.dessert}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {sub === 'agenda' && (
            <Card>
              <CardHeader title="Agenda institutionnel" sub="Événements, sorties et réunions à venir" />
              <div className="divide-y divide-slate-50">
                {evenements.map((e: any, i: number) => (
                  <div key={i} className="flex items-start gap-5 px-5 py-4">
                    <div className="w-12 h-12 rounded-md border border-slate-200 bg-white flex flex-col items-center justify-center shrink-0 text-[#0D2E5C]">
                      <span className="font-bold text-base leading-none">{new Date(e.date).getDate()}</span>
                      <span className="text-[9px] uppercase mt-0.5">
                        {new Date(e.date).toLocaleString('fr-FR', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-semibold text-slate-800">{e.titre}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock size={11} /> {e.heure}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {e.lieu}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 border border-slate-200 px-2 py-0.5 rounded shrink-0">{e.type}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {sub === 'transport' && (
            <div className="space-y-4">
              {transport.length === 0 ? (
                <Card className="p-8 text-center">
                  <Bus size={24} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-400">Aucun itinéraire de transport configuré pour le moment.</p>
                  <p className="text-xs text-slate-400 mt-1">Contactez l'administration pour plus d'informations.</p>
                </Card>
              ) : transport.map((t: any, idx: number) => (
                <Card key={idx} className="p-6">
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">{t.ligne || 'Transport scolaire'}</h3>
                  {t.numero && <p className="text-xs text-slate-400 mb-5">{t.numero}{t.operateur ? ` · Opérateur : ${t.operateur}` : ''}</p>}
                  {t.arrets && t.arrets.length > 0 && (
                    <div className="space-y-3">
                      {t.arrets.map((r: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-md bg-slate-50 border border-slate-100">
                          <Bus size={15} className="text-slate-400 shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-700">{r.dir}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{r.arret}</p>
                          </div>
                          <span className="font-mono font-bold text-sm text-slate-900">{r.heure}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {t.statut && (
                    <div className="mt-4 flex items-center gap-2.5 p-3 rounded-md border border-slate-200 bg-white">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                      <p className="text-xs text-slate-600">{t.statut}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {sub === 'sante' && (
            <div className="space-y-4">
              <Card>
                <CardHeader title={`Fiche de santé — ${session.prenomEnfant} ${session.nomEnfant}`} />
                <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: 'Groupe sanguin',  val: sante?.groupeSanguin || '—' },
                      { label: 'Allergies',        val: sante?.allergies || '—' },
                      { label: 'Vaccinations',     val: sante?.vaccinations || '—' },
                      { label: 'Médecin référent', val: sante?.medecin || '—' },
                    ].map(f => (
                      <div key={f.label} className="bg-slate-50 border border-slate-100 rounded-md p-3">
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">{f.label}</p>
                        <p className="text-xs font-semibold text-slate-800 mt-1">{f.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-md border border-amber-100 bg-amber-50">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-800">
                      Contact d'urgence : {session.prenomParent} {session.nomParent} — {session.telephone}
                    </p>
                  </div>
                </div>
              </Card>
              <Card>
                <CardHeader title="Registre infirmerie" sub="Interventions enregistrées cette année scolaire" />
                <div className="divide-y divide-slate-50">
                  {(sante?.infirmerie || []).length === 0 ? (
                    <div className="px-5 py-6 text-xs text-slate-400 text-center">Aucune intervention enregistrée pour l'année en cours.</div>
                  ) : (sante.infirmerie as any[]).map((v: any, i: number) => (
                    <div key={i} className="px-5 py-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <Heart size={14} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{v.date} · {v.heure}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{v.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FINANCES & DOCUMENTS
// ════════════════════════════════════════════════════════════════════════════

function FinancesTab({ session, appointments, paiements, reduction, tarifs, onRdvBooked, onToast }: {
  session: Prospect; appointments: RendezVous[];
  paiements: any[]; reduction: number; tarifs: Record<string,number>;
  onRdvBooked: (r: RendezVous) => void; onToast: (m: string) => void;
}) {
  type Sub = 'facturation' | 'dossier' | 'rendezvous' | 'documents';
  const [sub, setSub] = useState<Sub>('facturation');
  const [showForm, setShowForm] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  const [checklist, setChecklist] = useState<{doc:string;done:boolean}[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem(`checklist_${session.id}`);
    if (saved) { setChecklist(JSON.parse(saved)); return; }
    fetch('/api/configuration').then(r => r.json()).then(cfg => {
      const docs = (cfg.checklist?.[session.sectionVisee.toUpperCase()] || []) as string[];
      setChecklist(docs.map(doc => ({ doc, done: false })));
    }).catch(() => {});
  }, [session.id, session.sectionVisee]);

  useEffect(() => {
    apiFetch('/api/documents').then(r => r.ok ? r.json() : []).then(d => setDocuments(Array.isArray(d) ? d.filter((x:any) => x.actif !== false) : [])).catch(() => {});
  }, []);

  const toggleItem = (i: number) => {
    const upd = checklist.map((c, j) => j === i ? { ...c, done: !c.done } : c);
    setChecklist(upd);
    localStorage.setItem(`checklist_${session.id}`, JSON.stringify(upd));
  };

  // Factures depuis vrais paiements + calcul avec réduction parrainage
  const annuel       = tarifs[session.sectionVisee] || TARIFS_DEFAUT[session.sectionVisee] || 1500000;
  const annuelReduit = Math.round(annuel * (1 - reduction / 100));
  const trim         = Math.round(annuelReduit / 3);
  const hasPay = (t: string) => paiements.some((p: any) => p.trimestre === t);
  const factures = [
    { id:'T1', libelle:'Scolarité — 1er trimestre 2025/2026', montant:trim, statut: hasPay('T1') ? 'payée' : 'en_attente', date:'2025-09-05' },
    { id:'T2', libelle:'Scolarité — 2e trimestre 2025/2026',  montant:trim, statut: hasPay('T2') ? 'payée' : 'en_attente', date:'2026-01-08' },
    { id:'T3', libelle:'Scolarité — 3e trimestre 2025/2026',  montant:annuelReduit-trim*2, statut: hasPay('T3') ? 'payée' : 'en_attente', date:'2026-04-01' },
    { id:'FN', libelle:'Fournitures scolaires — Sep. 2025',   montant:Math.round(annuel*0.07), statut: hasPay('FOURNITURES') ? 'payée' : 'en_attente', date:'2025-09-01' },
  ];
  const totalPaid = factures.filter(f => f.statut === 'payée').reduce((s, f) => s + f.montant, 0);
  const totalDue  = factures.filter(f => f.statut === 'en_attente').reduce((s, f) => s + f.montant, 0);

  const upcoming = appointments.filter(r => new Date(r.dateHeure) >= new Date())
    .sort((a, b) => +new Date(a.dateHeure) - +new Date(b.dateHeure));
  const past     = appointments.filter(r => new Date(r.dateHeure) < new Date())
    .sort((a, b) => +new Date(b.dateHeure) - +new Date(a.dateHeure));

  return (
    <SectionPage title="Finances & Documents"
      sub="Facturation · Dossier de candidature · Rendez-vous · Bibliothèque documentaire">

      <SubTabNav
        tabs={[
          { id: 'facturation', label: 'Facturation'   },
          { id: 'dossier',     label: 'Mon dossier'   },
          { id: 'rendezvous',  label: 'Rendez-vous'   },
          { id: 'documents',   label: 'Documents'     },
        ]}
        active={sub} onChange={setSub}
      />

      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {sub === 'facturation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <KpiCard label="Total réglé" value={fmtMoney(totalPaid)} Icon={Wallet} />
                <KpiCard label="En attente de paiement" value={fmtMoney(totalDue)} Icon={CreditCard} accent />
                <KpiCard label="Factures émises" value={factures.length} sub="Année scolaire 2025/2026" Icon={FileText} />
              </div>
              <Card>
                <CardHeader title="Historique des paiements" />
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Référence', 'Description', 'Date', 'Montant', 'Statut'].map(h => (
                        <th key={h} className="text-left px-5 py-3 font-semibold text-slate-400 text-[10px] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {factures.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-400 text-[10px]">{f.id}</td>
                        <td className="px-5 py-3.5 font-medium text-slate-700">{f.libelle}</td>
                        <td className="px-5 py-3.5 text-slate-400">{fmtDate(f.date, { day:'numeric', month:'short', year:'numeric' })}</td>
                        <td className="px-5 py-3.5 font-mono font-semibold text-slate-900 tabular-nums">{fmtMoney(f.montant)}</td>
                        <td className="px-5 py-3.5"><StatusBadge statut={f.statut} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-lg">
                  <p className="text-xs text-slate-500">Pour tout litige ou demande de reçu, contactez le secrétariat : <span className="font-semibold text-slate-700">+225 07 07 07 07 07</span></p>
                </div>
              </Card>
              <Card className="border-l-4 border-l-[#0D2E5C]">
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Ré-inscription 2026/2027</p>
                    <p className="text-xs text-slate-400 mt-0.5">Votre dossier est pré-rempli. Réservez la place de {session.prenomEnfant} pour la prochaine rentrée.</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors whitespace-nowrap">
                    Initier la ré-inscription <ChevronRight size={13} />
                  </button>
                </div>
              </Card>
            </div>
          )}

          {sub === 'dossier' && (
            <div className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="p-5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Enfant</p>
                  <div className="space-y-2.5">
                    {[
                      { l: 'Nom complet',      v: `${session.prenomEnfant} ${session.nomEnfant}` },
                      { l: 'Date de naissance', v: fmtDate(session.dateNaissance) },
                      { l: 'Classe visée',     v: SECTION_LABEL[session.sectionVisee] || session.sectionVisee },
                      { l: 'Statut',           v: session.statut },
                    ].map(r => (
                      <div key={r.l} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                        <span className="text-xs text-slate-400">{r.l}</span>
                        <span className="text-xs font-semibold text-slate-800">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Responsable légal</p>
                  <div className="space-y-2.5">
                    {[
                      { l: 'Identité',  v: `${session.prenomParent} ${session.nomParent} (${session.lienParente})` },
                      { l: 'Téléphone', v: session.telephone },
                      { l: 'Email',     v: session.email },
                      { l: 'Commune',   v: `${session.commune}, Abidjan` },
                    ].map(r => (
                      <div key={r.l} className="flex items-start justify-between py-1.5 border-b border-slate-50 gap-4">
                        <span className="text-xs text-slate-400 shrink-0">{r.l}</span>
                        <span className="text-xs font-semibold text-slate-800 text-right break-all">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <Card>
                <CardHeader title="Pièces justificatives requises"
                  action={<span className="text-[11px] text-slate-400">{checklist.filter(c=>c.done).length}/{checklist.length} déposées</span>}
                />
                <div className="p-5 space-y-1">
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <motion.div className="h-full bg-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(checklist.filter(c=>c.done).length / checklist.length) * 100}%` }}
                      transition={{ duration: 0.6 }} />
                  </div>
                  {checklist.map((item, i) => (
                    <button key={i} onClick={() => toggleItem(i)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-50 transition-colors cursor-pointer text-left">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all
                        ${item.done ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`}>
                        {item.done && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-xs ${item.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                        {item.doc}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {sub === 'rendezvous' && (
            <div className="space-y-4">
              {!showForm ? (
                <>
                  <div className="flex justify-end">
                    <button onClick={() => setShowForm(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
                      <Calendar size={13} /> Nouveau rendez-vous
                    </button>
                  </div>
                  {upcoming.length > 0 && (
                    <Card>
                      <CardHeader title={`Rendez-vous à venir (${upcoming.length})`} />
                      <div className="divide-y divide-slate-50">
                        {upcoming.map(r => {
                          const d = new Date(r.dateHeure);
                          return (
                            <div key={r.id} className="flex items-start gap-4 px-5 py-4">
                              <div className="w-10 h-10 rounded-md bg-slate-900 flex flex-col items-center justify-center text-white shrink-0">
                                <span className="font-bold text-sm leading-none">{d.getDate()}</span>
                                <span className="text-[9px] text-white/60 uppercase">{d.toLocaleString('fr-FR',{month:'short'})}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-800">{r.typeRdv}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={11}/>{d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} · 30 min</p>
                                {r.notes && <p className="text-[11px] text-slate-400 italic mt-1">{r.notes}</p>}
                              </div>
                              <StatusBadge statut={r.statut} />
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}
                  {upcoming.length === 0 && (
                    <Card className="p-6">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-slate-300" />
                        <p className="text-sm text-slate-400">Aucun rendez-vous planifié. Utilisez le bouton ci-dessus pour réserver un créneau.</p>
                      </div>
                    </Card>
                  )}
                  {past.length > 0 && (
                    <Card>
                      <CardHeader title="Historique" />
                      <div className="divide-y divide-slate-50 opacity-60">
                        {past.map(r => {
                          const d = new Date(r.dateHeure);
                          return (
                            <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                              <div className="w-9 h-9 rounded-md bg-slate-100 flex flex-col items-center justify-center shrink-0">
                                <span className="font-bold text-xs text-slate-600">{d.getDate()}</span>
                                <span className="text-[8px] text-slate-400 uppercase">{d.toLocaleString('fr-FR',{month:'short'})}</span>
                              </div>
                              <p className="flex-1 text-xs text-slate-600">{r.typeRdv}</p>
                              <StatusBadge statut={r.statut} />
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardHeader title="Nouveau rendez-vous"
                    action={
                      <button onClick={() => setShowForm(false)} className="p-1.5 rounded-md hover:bg-slate-100 cursor-pointer">
                        <X size={15} className="text-slate-400" />
                      </button>
                    }
                  />
                  <div className="p-5">
                    <AppointmentForm initialProspect={session}
                      onSuccess={rdv => { onRdvBooked(rdv); setShowForm(false); onToast('Rendez-vous enregistré avec succès.'); }} />
                  </div>
                </Card>
              )}
            </div>
          )}

          {sub === 'documents' && (
            <div className="space-y-3">
              {documents.length === 0 && (
                <Card className="p-6 text-center text-sm text-slate-400">Aucun document disponible.</Card>
              )}
              {[...new Set(documents.map((d:any) => d.cat))].map(cat => (
                <Card key={cat as string}>
                  <CardHeader title={cat as string} />
                  <div className="divide-y divide-slate-50">
                    {documents.filter((d:any) => d.cat === cat).sort((a:any,b:any) => (a.ordre||0)-(b.ordre||0)).map((doc:any) => (
                      <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5">
                        <FileText size={15} className="text-slate-300 shrink-0" />
                        <p className="flex-1 text-xs font-medium text-slate-700">{doc.titre}</p>
                        <button onClick={() => onToast(`Téléchargement : ${doc.fichier}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 text-[10px] font-semibold hover:bg-slate-50 cursor-pointer transition-colors">
                          <Download size={11} /> PDF
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MESSAGERIE
// ════════════════════════════════════════════════════════════════════════════

function MessageTab({ session, messages, setMessages, onToast }: {
  session: Prospect; messages: any[]; setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  onToast: (m: string) => void;
}) {
  const [sel, setSel]   = useState<any | null>(null);
  const [reply, setReply] = useState('');

  const open = (m: any) => {
    setSel(m);
    // Marquer lu en base
    apiFetch(`/api/messages/${m.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ lu:true }) }).catch(console.error);
    setMessages(prev => prev.map(x => x.id === m.id ? { ...x, lu: true } : x));
  };

  const send = () => {
    if (!reply.trim()) return;
    onToast('Message transmis à l\'équipe pédagogique.');
    setReply('');
  };

  return (
    <SectionPage title="Messagerie sécurisée" sub="Communication directe avec l'équipe pédagogique et administrative">
      <div className="grid lg:grid-cols-[280px_1fr] gap-4 h-[600px]">

        {/* Liste messages */}
        <Card className="flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">Boîte de réception</p>
            <span className="text-[10px] font-semibold text-slate-400">{messages.length} messages</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {messages.map((m: any) => (
              <button key={m.id} onClick={() => open(m)}
                className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer
                  ${sel?.id === m.id ? 'bg-slate-50 border-r-2 border-r-[#0D2E5C]' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-xs truncate ${!m.lu ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>{m.de}</p>
                  {!m.lu && <div className="w-2 h-2 rounded-full bg-[#0D2E5C] shrink-0 mt-1" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{m.date}</p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 font-normal">{m.contenu}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Détail + réponse */}
        <Card className="flex flex-col overflow-hidden">
          {sel ? (
            <>
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{sel.de}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sel.date}</p>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <p className="text-sm text-slate-700 leading-relaxed">{sel.contenu}</p>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 space-y-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Répondre</p>
                <textarea value={reply} onChange={e => setReply(e.target.value)}
                  placeholder="Rédigez votre réponse..."
                  rows={3}
                  className="w-full text-xs font-sans border border-slate-200 rounded-md px-3 py-2.5 resize-none text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#0D2E5C] transition-colors" />
                <div className="flex justify-between items-center">
                  <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
                    <Paperclip size={13} /> Joindre un fichier
                  </button>
                  <button onClick={send}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold hover:bg-[#1A4F8B] cursor-pointer transition-colors">
                    <Send size={12} /> Envoyer
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Sélectionnez un message pour le consulter</p>
              </div>
            </div>
          )}
        </Card>

      </div>
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PARRAINAGE
// ════════════════════════════════════════════════════════════════════════════

function ParrainageTab({ session, reduction, onToast }: { session: Prospect; reduction: number; onToast: (m: string) => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(session.codeParrainagePersonnel);
    setCopied(true);
    onToast('Code copié dans le presse-papiers.');
    setTimeout(() => setCopied(false), 2500);
  };
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`J'ai inscrit mon enfant à EPV Horizons Savants à Abidjan. Utilisez mon code ${session.codeParrainagePersonnel} pour bénéficier de 10% de réduction sur la scolarité. Plus d'informations : https://horizonssavants.com/#/admissions`)}`;

  return (
    <SectionPage title="Programme de parrainage" sub="Bénéficiez d'une réduction de 10% par famille parrainée inscrite">

      <div className="grid lg:grid-cols-3 gap-4">
        <KpiCard label="Filleuls inscrits"  value={Math.round(reduction / 10)} sub={reduction === 0 ? "Aucune famille référencée" : `${Math.round(reduction/10)} famille(s) parrainée(s)`} Icon={Users} />
        <KpiCard label="Réduction cumulée"  value={`${reduction} %`} sub={reduction > 0 ? "Appliquée sur votre scolarité" : "Parrainez pour bénéficier d'une réduction"} Icon={TrendingUp} />
        <KpiCard label="Réduction maximale" value="40 %" sub="Cumulable jusqu'à 4 familles parrainées" Icon={Award} accent />
      </div>

      <Card className="p-6">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Votre code de parrainage personnel</p>
        <div className="flex items-center gap-4 mt-3">
          <span className="font-mono font-bold text-3xl text-[#0D2E5C] tracking-[0.15em]">
            {session.codeParrainagePersonnel}
          </span>
          <button onClick={copy}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs font-semibold transition-all cursor-pointer
              ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            {copied ? <><Check size={13} /> Copié</> : <><Copy size={13} /> Copier</>}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3 leading-relaxed max-w-lg">
          Communiquez ce code à vos proches lors de leur pré-inscription sur le site d'EPV Horizons Savants. Toute famille dont l'inscription est confirmée vous fait bénéficier d'une réduction de 10% sur vos frais de scolarité.
        </p>
      </Card>

      <Card>
        <CardHeader title="Fonctionnement du programme" />
        <div className="p-5">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {[
              { num: '01', title: 'Partagez votre code',   desc: 'Transmettez votre code personnel à des familles susceptibles d\'inscrire leur enfant à l\'EPV.' },
              { num: '02', title: 'Ils s\'inscrivent',      desc: 'La famille utilise votre code lors de sa pré-inscription en ligne. Le code est associé à leur dossier.' },
              { num: '03', title: 'Vous êtes crédité',      desc: 'Dès que leur inscription est confirmée physiquement, 10% est déduit de votre prochaine facture.' },
            ].map(s => (
              <div key={s.num} className="px-5 first:pl-0 last:pr-0">
                <p className="text-2xl font-bold text-slate-100 mb-2">{s.num}</p>
                <p className="text-xs font-semibold text-slate-800 mb-1.5">{s.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1cb855] cursor-pointer transition-colors">
          <Share2 size={13} /> Partager via WhatsApp
        </a>
        <button onClick={copy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-colors">
          <Copy size={13} /> Copier le lien
        </button>
      </div>
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PROFIL
// ════════════════════════════════════════════════════════════════════════════

function ProfilTab({ session, sante }: { session: Prospect; sante: any | null }) {
  type Sub = 'infos' | 'enfant' | 'securite' | 'preferences';
  const [sub, setSub] = useState<Sub>('infos');

  const [pwd,    setPwd]    = useState({ old: '', new: '', confirm: '' });
  const [show,   setShow]   = useState({ old: false, new: false, confirm: false });
  const [notifs, setNotifs] = useState({ email: true, sms: true, urgence: true, bulletin: true });
  const [twofa,  setTwofa]  = useState(false);

  const Toggle = ({ val, onToggle }: { val: boolean; onToggle: () => void }) => (
    <button onClick={onToggle}
      className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${val ? 'bg-[#0D2E5C]' : 'bg-slate-200'}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  const FieldRow = ({ label, value, editable = false }: { label: string; value: string; editable?: boolean }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-50">
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-800 mt-0.5">{value}</p>
      </div>
      {editable && (
        <button className="text-[11px] font-semibold text-[#0D2E5C] hover:underline cursor-pointer px-2">Modifier</button>
      )}
    </div>
  );

  return (
    <SectionPage title="Mon profil" sub="Informations personnelles, sécurité et préférences">

      <SubTabNav
        tabs={[
          { id: 'infos',       label: 'Informations personnelles' },
          { id: 'enfant',      label: 'Dossier de l\'enfant'     },
          { id: 'securite',    label: 'Sécurité'                 },
          { id: 'preferences', label: 'Préférences'              },
        ]}
        active={sub} onChange={setSub}
      />

      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {sub === 'infos' && (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-full bg-[#0D2E5C] flex items-center justify-center text-white font-bold text-lg">
                    {session.prenomParent[0]}{session.nomParent[0]}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">{session.prenomParent} {session.nomParent}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{session.lienParente} · Parent EPV Horizons Savants</p>
                    <Badge status={session.statut} />
                  </div>
                </div>
                <FieldRow label="Prénom"    value={session.prenomParent} editable />
                <FieldRow label="Nom"       value={session.nomParent}    editable />
                <FieldRow label="Email"     value={session.email}        editable />
                <FieldRow label="Téléphone" value={session.telephone}    editable />
                <FieldRow label="Commune"   value={`${session.commune}, Abidjan, Côte d'Ivoire`} editable />
                <FieldRow label="Lien de parenté" value={session.lienParente} />
                <FieldRow label="Code parrainage personnel" value={session.codeParrainagePersonnel} />
                <div className="flex items-center justify-between pt-4">
                  <p className="text-[10px] text-slate-400">Compte créé le {fmtDate(session.createdAt)}</p>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
                    Enregistrer les modifications
                  </button>
                </div>
              </Card>
            </div>
          )}

          {sub === 'enfant' && (
            <div className="space-y-4">
              <Card className="p-6">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-4">Identité de l'enfant</p>
                <FieldRow label="Nom complet"        value={`${session.prenomEnfant} ${session.nomEnfant}`} />
                <FieldRow label="Date de naissance"  value={fmtDate(session.dateNaissance)} />
                <FieldRow label="Classe visée"       value={SECTION_LABEL[session.sectionVisee] || session.sectionVisee} />
                <FieldRow label="Rentrée"            value="Septembre 2026" />
              </Card>
              <Card className="p-6">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-4">Données de santé</p>
                <FieldRow label="Groupe sanguin"     value={sante?.groupeSanguin || '—'} editable />
                <FieldRow label="Allergies connues"  value={sante?.allergies || '—'} editable />
                <FieldRow label="Vaccinations"       value={sante?.vaccinations || '—'} editable />
                <FieldRow label="Médecin traitant"   value={sante?.medecin || '—'} editable />
              </Card>
              <Card className="p-6">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-4">Contacts d'urgence</p>
                <FieldRow label="Contact principal"   value={`${session.prenomParent} ${session.nomParent} — ${session.telephone}`} editable />
                <FieldRow label="Contact secondaire"  value="Non renseigné" editable />
                <FieldRow label="Email de contact"    value={session.email} editable />
              </Card>
            </div>
          )}

          {sub === 'securite' && (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Lock size={15} className="text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Changer le mot de passe</p>
                    <p className="text-xs text-slate-400 mt-0.5">Sécurisez votre accès avec un nouveau mot de passe fort</p>
                  </div>
                </div>
                <div className="space-y-4 max-w-sm">
                  {([
                    { key: 'old',     label: 'Mot de passe actuel' },
                    { key: 'new',     label: 'Nouveau mot de passe' },
                    { key: 'confirm', label: 'Confirmer le nouveau mot de passe' },
                  ] as const).map(f => (
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{f.label}</label>
                      <div className="relative">
                        <input
                          type={show[f.key] ? 'text' : 'password'}
                          value={pwd[f.key]}
                          onChange={e => setPwd(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#0D2E5C] transition-colors pr-10"
                        />
                        <button type="button" onClick={() => setShow(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                          {show[f.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#0D2E5C] text-white text-xs font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors mt-2">
                    <Shield size={13} /> Mettre à jour le mot de passe
                  </button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone size={15} className="text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Double authentification (2FA)</p>
                      <p className="text-xs text-slate-400 mt-0.5">Renforcez la sécurité de votre compte avec une vérification par SMS</p>
                    </div>
                  </div>
                  <Toggle val={twofa} onToggle={() => setTwofa(!twofa)} />
                </div>
                {twofa && (
                  <div className="mt-4 p-3 rounded-md bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-500">Un code de vérification vous sera envoyé au <strong className="text-slate-700">{session.telephone}</strong> lors de chaque connexion.</p>
                  </div>
                )}
              </Card>

              <Card className="p-5">
                <div className="flex items-center gap-2.5">
                  <Info size={14} className="text-slate-400 shrink-0" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Dernière connexion : aujourd'hui à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}. Si vous ne reconnaissez pas cette activité, changez immédiatement votre mot de passe et contactez l'administration.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {sub === 'preferences' && (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Bell size={15} className="text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Notifications</p>
                    <p className="text-xs text-slate-400 mt-0.5">Gérez les alertes reçues par email et SMS</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {([
                    { key: 'email',    label: 'Notifications par email',                         sub: `Envoyées à ${session.email}` },
                    { key: 'sms',      label: 'Notifications par SMS',                           sub: `Envoyées au ${session.telephone}` },
                    { key: 'urgence',  label: 'Alertes urgentes (absences, infirmerie)',         sub: 'Toujours prioritaires' },
                    { key: 'bulletin', label: 'Bulletins & résultats académiques',               sub: 'Disponibles à chaque fin de trimestre' },
                  ] as const).map(n => (
                    <div key={n.key} className="flex items-center justify-between py-3 border-b border-slate-50">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{n.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{n.sub}</p>
                      </div>
                      <Toggle val={notifs[n.key]} onToggle={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))} />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sliders size={15} className="text-slate-400" />
                  <p className="text-sm font-semibold text-slate-800">Préférences d'affichage</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Langue de l\'interface', value: 'Français (FR)' },
                    { label: 'Format de date',          value: 'JJ/MM/AAAA' },
                    { label: 'Devise',                  value: 'FCFA (XOF)' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                      <span className="text-xs text-slate-600">{f.label}</span>
                      <span className="text-xs font-semibold text-slate-800">{f.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </SectionPage>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

const NAV: { id: ParentTab; label: string; Icon: React.FC<any> }[] = [
  { id: 'dashboard',  label: 'Tableau de bord',       Icon: LayoutGrid     },
  { id: 'parcours',   label: 'Parcours académique',   Icon: BookOpen       },
  { id: 'vie',        label: 'Vie scolaire',           Icon: Utensils       },
  { id: 'finances',   label: 'Finances & Documents',  Icon: FolderOpen     },
  { id: 'messagerie', label: 'Messagerie',             Icon: MessageSquare  },
  { id: 'parrainage', label: 'Parrainage',             Icon: Gift           },
];

export const EspaceParent: React.FC = () => {
  /* ── Tous les enfants du parent ── */
  const [allChildren, setAllChildren] = useState<Prospect[]>(() => {
    try {
      const raw = localStorage.getItem('parent_children');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });
  const [childIdx, setChildIdx] = useState(0);

  const [session, setSession] = useState<Prospect | null>(() => {
    // Priorité : enfant sélectionné → session normale
    try {
      const kids = localStorage.getItem('parent_children');
      if (kids) {
        const arr = JSON.parse(kids);
        if (arr.length > 0) return arr[0] as Prospect;
      }
    } catch {}
    const saved = localStorage.getItem('parent_session');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    const prospect: Prospect = parsed?.prospect ?? parsed;
    if (parsed?.prospect) localStorage.setItem('parent_session', JSON.stringify(prospect));
    return prospect;
  });

  /* Changer d'enfant sélectionné */
  const handleSelectChild = (idx: number) => {
    setChildIdx(idx);
    setSession(allChildren[idx]);
  };

  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [devoirs,      setDevoirs]      = useState<any[]>([]);
  const [cantine,      setCantine]      = useState<any[]>([]);
  const [evenements,   setEvenements]   = useState<any[]>([]);
  const [notes,        setNotes]        = useState<any[]>([]);
  const [absences,     setAbsences]     = useState<any[]>([]);
  const [messages,     setMessages]     = useState<any[]>([]);
  const [transport,    setTransport]    = useState<any[]>([]);
  const [sante,        setSante]        = useState<any | null>(null);
  const [bilinguisme,  setBilinguisme]  = useState<any | null>(null);
  const [paiements,    setPaiements]    = useState<any[]>([]);
  const [reduction,    setReduction]    = useState<number>(0);
  const [tarifs,       setTarifs]       = useState<Record<string,number>>(TARIFS_DEFAUT);
  const [tab,          setTab]          = useState<ParentTab>('dashboard');
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [toast,        setToast]        = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const pid = session.id;
    const load = (url: string, setter: (d: any) => void) =>
      apiFetch(url).then(r => r.ok ? r.json() : []).then(d => setter(Array.isArray(d) ? d : [])).catch(console.error);

    load('/api/rendezvous', (data: RendezVous[]) =>
      setAppointments(data.filter(r =>
        r.email?.toLowerCase() === session.email.toLowerCase() || r.telephone === session.telephone
      ))
    );
    load(`/api/devoirs?prospectId=${pid}`,       setDevoirs);
    load('/api/cantine',                          setCantine);
    load('/api/evenements',                       setEvenements);
    load(`/api/notes?prospectId=${pid}`,          setNotes);
    load(`/api/assiduite?prospectId=${pid}`,      setAbsences);
    load(`/api/messages?prospectId=${pid}`,       setMessages);
    load('/api/transport',                        setTransport);
    load(`/api/sante_eleve?prospectId=${pid}`,   (d: any[]) => setSante(d[0] || null));
    load(`/api/bilinguisme?prospectId=${pid}`,   (d: any[]) => setBilinguisme(d[0] || null));

    // Paiements réels du parent
    apiFetch(`/api/paiements?prospectId=${pid}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        setPaiements(Array.isArray(data) ? data.filter((p: any) => p.statut === 'validé') : []);
      }).catch(() => {});

    // Réduction parrainage — chercher les parrainages validés
    apiFetch('/api/parrainages')
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        const validCount = data.filter((p: any) => p.prospectIdParrain === pid && p.statut === 'valide').length;
        setReduction(Math.min(validCount * 10, 40));
      }).catch(() => {});

    // Tarifs depuis la configuration
    fetch('/api/configuration').then(r => r.json()).then(cfg => {
      if (cfg.tarifs) setTarifs(cfg.tarifs);
    }).catch(() => {});
  }, [session]);

  const handleLogout = () => {
    localStorage.removeItem('parent_session');
    localStorage.removeItem('parent_children');
    window.location.hash = '#';
  };

  const handleRdvBooked = (rdv: RendezVous) =>
    setAppointments(prev => [...prev, rdv]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Card className="p-8 max-w-sm w-full text-center">
          <User size={32} className="text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-700 mb-1">Session expirée</p>
          <p className="text-xs text-slate-400 mb-5">Veuillez vous reconnecter pour accéder à votre espace.</p>
          <button onClick={() => { window.location.hash = '#/espace-parent'; }}
            className="w-full py-2.5 rounded-md bg-[#0D2E5C] text-white text-sm font-semibold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
            Se reconnecter
          </button>
        </Card>
      </div>
    );
  }

  const initials     = `${session.prenomParent[0]}${session.nomParent[0]}`.toUpperCase();
  const unreadMsgs   = messages.filter(m => !m.lu).length;
  const pendingRdv   = appointments.filter(r => r.statut !== StatutRendezVous.ANNULE && new Date(r.dateHeure) >= new Date()).length;

  const badges: Partial<Record<ParentTab, number>> = {
    messagerie: unreadMsgs,
    finances:   pendingRdv,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">

      {/* ══ SIDEBAR ════════════════════════════════════════════════════════ */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 bottom-0 z-40 w-[220px] bg-[#0A1628] flex flex-col transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-white/8 shrink-0">
          <img src="/img/logo.jpg" alt="EPV" className="w-8 h-8 rounded-md object-contain bg-white/95 p-0.5" />
          <div>
            <p className="text-[12px] font-bold text-white leading-tight">Espace Parent</p>
            <p className="text-[9px] text-white/35 font-sans uppercase tracking-wider">EPV Horizons Savants</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5">
          <p className="text-[9px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-2">Navigation</p>
          {NAV.map(({ id, label, Icon }) => {
            const badge  = badges[id];
            const active = tab === id;
            return (
              <button key={id} onClick={() => { setTab(id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-[12.5px] font-sans transition-all cursor-pointer
                  ${active
                    ? 'bg-white/10 text-white border-l-2 border-[#F5A623]'
                    : 'text-white/45 hover:text-white/80 hover:bg-white/5'}`}>
                <Icon size={14} className="shrink-0" />
                <span className="flex-1 font-medium truncate">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="text-[9px] font-bold bg-[#F5A623] text-[#0A1628] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profil & Déconnexion */}
        <div className="px-2.5 py-3 border-t border-white/8 space-y-0.5 shrink-0">
          <button onClick={() => { setTab('profil' as ParentTab); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-[12.5px] transition-all cursor-pointer
              ${tab === 'profil' ? 'bg-white/10 text-white border-l-2 border-[#F5A623]' : 'text-white/45 hover:text-white/80 hover:bg-white/5'}`}>
            <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[11px] truncate">{session.prenomParent} {session.nomParent}</p>
              <p className="text-[9px] text-white/30 truncate">{session.email}</p>
            </div>
          </button>

          <button onClick={() => { window.location.hash = '#'; }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-white/35 hover:text-white/70 hover:bg-white/5 text-[11.5px] font-sans transition-all cursor-pointer">
            <ArrowLeft size={13} className="shrink-0" /> Retour au site
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400/70 hover:text-red-400 hover:bg-red-500/10 text-[11.5px] font-sans transition-all cursor-pointer">
            <LogOut size={13} className="shrink-0" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ══ MAIN ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col lg:ml-[220px]">

        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-4 shrink-0">
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-100 cursor-pointer transition-colors">
            <Menu size={17} className="text-slate-500" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 flex-1">
            <span className="text-slate-300">EPV</span>
            <ChevronRight size={13} className="text-slate-200" />
            <span className="font-semibold text-slate-700">
              {[...NAV, { id: 'profil', label: 'Mon profil' }].find(n => n.id === tab)?.label}
            </span>
          </div>

          {/* Notif + avatar */}
          <div className="flex items-center gap-2">
            {unreadMsgs > 0 && (
              <button onClick={() => setTab('messagerie')}
                className="relative p-2 rounded-md hover:bg-slate-100 cursor-pointer transition-colors">
                <Bell size={16} className="text-slate-400" />
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#F5A623] text-[#0A1628] text-[8px] font-bold flex items-center justify-center">
                  {unreadMsgs}
                </span>
              </button>
            )}
            <button onClick={() => setTab('profil' as ParentTab)}
              className="w-8 h-8 rounded-full bg-[#0D2E5C] flex items-center justify-center text-white text-[11px] font-bold cursor-pointer hover:bg-[#1A4F8B] transition-colors">
              {initials}
            </button>
          </div>
        </header>

        {/* ── Sélecteur d'enfants (si plusieurs) ── */}
        {allChildren.length > 1 && (
          <div className="border-b border-slate-200 bg-white px-4 md:px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap shrink-0">Enfant :</span>
            {allChildren.map((child, idx) => (
              <button
                key={child.id}
                onClick={() => handleSelectChild(idx)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0"
                style={{
                  background: childIdx === idx ? '#0D2E5C' : '#F1F5F9',
                  color:      childIdx === idx ? 'white'   : '#64748B',
                  boxShadow:  childIdx === idx ? '0 2px 8px rgba(13,46,92,0.25)' : 'none',
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ background: childIdx === idx ? 'rgba(255,255,255,0.2)' : '#E2E8F0' }}
                >
                  {idx + 1}
                </div>
                {child.prenomEnfant} {child.nomEnfant}
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded"
                  style={{
                    background: childIdx === idx ? 'rgba(255,255,255,0.15)' : '#E2E8F0',
                    color:      childIdx === idx ? 'rgba(255,255,255,0.8)' : '#94A3B8',
                  }}
                >
                  {SECTION_LABEL[child.sectionVisee] || child.sectionVisee}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={`${tab}-${session.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}>
              {tab === 'dashboard'  && <DashboardTab session={session} appointments={appointments} devoirs={devoirs} cantine={cantine} notes={notes} absences={absences} messages={messages} evenements={evenements} paiements={paiements} reduction={reduction} tarifs={tarifs} onTabChange={setTab} />}
              {tab === 'parcours'   && <ParcoursTab  session={session} devoirs={devoirs} setDevoirs={setDevoirs} notes={notes} absences={absences} bilinguisme={bilinguisme} />}
              {tab === 'vie'        && <VieScolaireTab session={session} cantine={cantine} evenements={evenements} transport={transport} sante={sante} />}
              {tab === 'finances'   && <FinancesTab  session={session} appointments={appointments} paiements={paiements} reduction={reduction} tarifs={tarifs} onRdvBooked={handleRdvBooked} onToast={setToast} />}
              {tab === 'messagerie' && <MessageTab   session={session} messages={messages} setMessages={setMessages} onToast={setToast} />}
              {tab === 'parrainage' && <ParrainageTab session={session} reduction={reduction} onToast={setToast} />}
              {(tab as string) === 'profil' && <ProfilTab session={session} sante={sante} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {toast && <Toast message={toast} type="info" onClose={() => setToast(null)} />}
    </div>
  );
};
