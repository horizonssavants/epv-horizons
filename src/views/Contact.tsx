/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ContactForm } from '../components/forms/ContactForm.tsx';
import { useLang } from '../lib/LanguageContext.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Toast } from '../components/ui/Toast.tsx';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldAlert,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  ExternalLink,
} from 'lucide-react';

/* ─── Animation variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ─── Data ───────────────────────────────────────────────────── */
const whyContactReasons = [
  {
    icon: GraduationCap,
    color: 'bg-[#0D2E5C]',
    title: 'Admissions & Inscriptions',
    text: "Renseignez-vous sur les dossiers d'admission, les critères d'entrée et les ouvertures pour septembre 2026.",
  },
  {
    icon: BookOpen,
    color: 'bg-[#F5A623]',
    title: 'Questions Pédagogiques',
    text: 'Notre équipe académique répond à toutes vos interrogations sur les programmes, méthodes et curricula.',
  },
  {
    icon: HeartHandshake,
    color: 'bg-emerald-600',
    title: 'Partenariats & Visites',
    text: 'Organisez une visite guidée ou explorez nos opportunités de partenariat institutionnel.',
  },
];

const scheduleRows = [
  { label: 'Lundi · Mardi · Jeudi · Vendredi', value: '07h45 à 12h20 · 13h30 à 16h00' },
  { label: 'Pause récréative', value: '10h15 à 10h30' },
  { label: 'Mercredi', value: '08h00 à 12h30' },
  { label: 'Samedi · Dimanche', value: 'Fermé' },
];

const secretariatRows = [
  { label: 'Lundi à Vendredi', value: '07h30 à 12h30 · 13h30 à 17h30' },
  { label: 'Mercredi', value: '08h00 à 12h30' },
];

/* ─── Component ──────────────────────────────────────────────── */
export const Contact: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleContactSuccess = (msg: string) => {
    setToastMessage(msg);
  };

  return (
    <div className="select-none">

      {/* ══ HERO SECTION ══════════════════════════════════════════ */}
      <section
        className="relative pattern-topo overflow-hidden"
        style={{ backgroundColor: '#0b1d3a' }}
      >
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 110%, rgba(245,166,35,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
          <motion.span
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="inline-block font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#F5A623] mb-5"
          >
            {fr ? "Secrétariat Général d'Abidjan" : 'General Secretariat of Abidjan'}
          </motion.span>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-sans font-extrabold text-4xl md:text-6xl uppercase tracking-tight text-white leading-tight"
          >
            {fr ? 'Contactez ' : 'Contact '}
            <span className="relative inline-block px-2" style={{ color: '#F5A623' }}>
              {fr ? 'Notre Équipe' : 'Our Team'}
              <span className="absolute inset-0 -z-10 rounded-md opacity-15" style={{ backgroundColor: '#F5A623' }} />
            </span>{' '}
            {fr ? 'Académique' : 'of Academics'}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-6 font-serif text-sm md:text-base leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            {fr
              ? "Une question d'ordre pédagogique ou d'admissions pour Septembre 2026 ? Contactez-nous par courrier, par téléphone, ou visitez nos locaux à Bingerville Mtn Kro."
              : "A pedagogical or admission question for September 2026? Contact us by email, phone, or visit our premises in Bingerville Mtn Kro."}
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.34 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <div className="h-px w-12 bg-white/20" />
            <div className="h-2 w-2 rounded-full bg-[#F5A623]" />
            <div className="h-px w-12 bg-white/20" />
          </motion.div>

          {/* WhatsApp CTA */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.46 }}
            className="mt-8"
          >
            <a
              href="https://wa.me/2250778981456"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 transition-colors duration-200 text-white font-sans font-semibold text-sm px-7 py-3.5 rounded-full shadow-lg shadow-emerald-900/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.117 1.528 5.845L.057 23.428a.5.5 0 0 0 .608.625l5.703-1.493A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.796 9.796 0 0 1-5.001-1.37l-.36-.214-3.724.976.99-3.63-.234-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
              </svg>
              {fr ? 'Écrire via WhatsApp' : 'Message via WhatsApp'}
            </a>
          </motion.div>
        </div>
      </section>

      {/* ══ BODY ══════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-[#F4F8FF] to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-20">

          {/* ── Coordonnées : 3 cards ───────────────────────────── */}
          <motion.section
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} className="text-center mb-10">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-[#F5A623]">
                {fr ? 'Où nous trouver' : 'Where to find us'}
              </span>
              <h2 className="mt-2 font-sans font-extrabold text-2xl md:text-3xl text-[#0D2E5C] tracking-tight">
                {fr ? 'Nos Coordonnées' : 'Our Contact Information'}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Adresse */}
              <motion.div
                variants={fadeUp}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white p-7 h-full flex flex-col items-center text-center gap-5">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(13,46,92,0.08)' }}>
                    <MapPin size={30} className="text-[#0D2E5C]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-sm text-[#0D2E5C] mb-2 uppercase tracking-wide">
                      Adresse Physique
                    </h3>
                    <p className="font-serif text-sm text-gray-500 leading-relaxed">
                      Bingerville Mtn Kro<br />
                      Cité Côtes de Grâces<br />
                      Abidjan, Côte d'Ivoire
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card Téléphones */}
              <motion.div
                variants={fadeUp}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.12 }}
              >
                <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white p-7 h-full flex flex-col items-center text-center gap-5">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(245,166,35,0.10)' }}>
                    <Phone size={30} className="text-[#F5A623]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-sm text-[#0D2E5C] mb-2 uppercase tracking-wide">
                      Téléphones d'Admissions
                    </h3>
                    <p className="font-mono text-sm text-gray-500 leading-loose">
                      07 78 98 14 56<br />
                      05 85 41 51 51
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card Email */}
              <motion.div
                variants={fadeUp}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.24 }}
              >
                <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white p-7 h-full flex flex-col items-center text-center gap-5">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(5,150,105,0.09)' }}>
                    <Mail size={30} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-sm text-[#0D2E5C] mb-2 uppercase tracking-wide">
                      Email Électronique
                    </h3>
                    <a
                      href="mailto:contact@horizonssavants.com"
                      className="font-serif text-sm text-emerald-600 underline underline-offset-2 hover:text-emerald-700 transition-colors"
                    >
                      contact@horizonssavants.com
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* ── Horaires + Map ──────────────────────────────────── */}
          <motion.section
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Horaires card */}
            <motion.div variants={fadeUp}>
              <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(13,46,92,0.08)' }}>
                    <Clock size={20} className="text-[#0D2E5C]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-sm text-[#0D2E5C] uppercase tracking-wide">
                      Horaires d'Ouverture
                    </h3>
                    <span className="font-serif text-xs text-gray-400">Secrétariat & Cours académiques</span>
                  </div>
                </div>

                {/* Secrétariat */}
                <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#F5A623] mb-2">
                  Secrétariat
                </p>
                <table className="w-full text-xs mb-6">
                  <tbody>
                    {secretariatRows.map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? 'bg-[#F4F8FF]' : 'bg-white'}>
                        <td className="font-sans font-semibold text-[#0D2E5C] px-3 py-2 rounded-l-lg">
                          {row.label}
                        </td>
                        <td className="font-serif text-gray-500 px-3 py-2 rounded-r-lg text-right">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Cours */}
                <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#F5A623] mb-2">
                  Cours Académiques
                </p>
                <table className="w-full text-xs">
                  <tbody>
                    {scheduleRows.map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? 'bg-[#F4F8FF]' : 'bg-white'}>
                        <td className="font-sans font-semibold text-[#0D2E5C] px-3 py-2 rounded-l-lg">
                          {row.label}
                        </td>
                        <td className="font-serif text-gray-500 px-3 py-2 rounded-r-lg text-right">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Avertissement sanitaire */}
                <div className="mt-6 flex gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs leading-relaxed font-serif text-emerald-800">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                  <span>
                    <strong>Avertissement :</strong> Les visites d'orientation sans rendez-vous académique enregistré en ligne sont suspendues en période d'évaluations collectives scolaires.
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Map card */}
            <motion.div variants={fadeUp} transition={{ delay: 0.15 }}>
              <div
                className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] overflow-hidden h-full min-h-[360px] flex flex-col"
                style={{ backgroundColor: '#EBF2FF' }}
              >
                {/* Dot grid area */}
                <div
                  className="flex-1 relative flex items-center justify-center"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, rgba(13,46,92,0.12) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                    minHeight: 260,
                  }}
                >
                  {/* Animated pin */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
                      style={{ backgroundColor: '#0D2E5C' }}>
                      <MapPin size={32} className="text-[#F5A623]" />
                    </div>
                    {/* Pin stem */}
                    <div className="w-0.5 h-6 bg-[#0D2E5C] opacity-40 mt-1" />
                    <div className="w-3 h-1.5 rounded-full bg-[#0D2E5C] opacity-20 mt-0.5" />
                  </motion.div>

                  {/* Location label */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
                    <span className="font-sans font-bold text-xs text-[#0D2E5C] tracking-wide">
                      Bingerville Mtn Kro
                    </span>
                    <br />
                    <span className="font-serif text-[11px] text-gray-400">
                      Cité Côtes de Grâces, Abidjan
                    </span>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="px-6 py-5 bg-white border-t border-[#0D2E5C]/10 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-sans font-bold text-xs text-[#0D2E5C]">EPV Horizons Savants</p>
                    <p className="font-serif text-[11px] text-gray-400 mt-0.5">École Privée Abidjan, CI</p>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Bingerville+Mtn+Kro+Cité+Côtes+de+Grâces+Abidjan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-sans font-semibold text-xs text-white px-5 py-2.5 rounded-full transition-colors duration-200"
                    style={{ backgroundColor: '#0D2E5C' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5A623')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0D2E5C')}
                  >
                    <ExternalLink size={13} />
                    Ouvrir Maps
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* ── Pourquoi nous contacter ─────────────────────────── */}
          <motion.section
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} className="text-center mb-10">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-[#F5A623]">
                Vous hésitez ?
              </span>
              <h2 className="mt-2 font-sans font-extrabold text-2xl md:text-3xl text-[#0D2E5C] tracking-tight">
                Pourquoi Nous Contacter
              </h2>
              <p className="mt-3 font-serif text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                Notre équipe est disponible pour vous accompagner à chaque étape de votre démarche.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {whyContactReasons.map((reason, i) => {
                const Icon = reason.icon;
                return (
                  <motion.div
                    key={reason.title}
                    variants={fadeUp}
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 30 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.12 }}
                  >
                    <div className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white p-7 h-full flex flex-col gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${reason.color}`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-sans font-bold text-sm text-[#0D2E5C] mb-1.5">
                          {reason.title}
                        </h3>
                        <p className="font-serif text-xs text-gray-500 leading-relaxed">
                          {reason.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* ── Formulaire ──────────────────────────────────────── */}
          <motion.section
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} className="text-center mb-10">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-[#F5A623]">
                Formulaire de Contact
              </span>
              <h2 className="mt-2 font-sans font-extrabold text-2xl md:text-3xl text-[#0D2E5C] tracking-tight">
                Envoyez-Nous un Message
              </h2>
              <p className="mt-3 font-serif text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                Remplissez le formulaire ci-dessous. Notre secrétariat vous répondra sous 24h ouvrables.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="max-w-3xl mx-auto rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.10)] bg-white p-6 md:p-10"
            >
              <ContactForm onSuccess={handleContactSuccess} />
            </motion.div>
          </motion.section>

        </div>
      </div>

      {/* ── Toast ───────────────────────────────────────────────── */}
      {toastMessage && (
        <Toast message={toastMessage} type="info" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};
