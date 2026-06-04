/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Accordion } from '../components/ui/Accordion.tsx';
import { Card } from '../components/ui/Card.tsx';
import { GraduationCap, BookOpen, Clock, Apple, Star, Zap, Shield } from 'lucide-react';
import { useLang } from '../lib/LanguageContext.tsx';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const Programmes: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';

  const schoolLevels = [
    {
      title: "Petite Section (Maternelle | 2-3 ans)",
      content: (
        <div className="space-y-3 font-serif">
          <p>
            <strong>Pédagogie et Éveil :</strong> Introduction à l'acquisition du langage matériel, socialisation bienveillante intensive, motricité fine et manipulation active inspirée des méthodes Montessori.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Effectif : 15 élèves maximum par éducateur</li>
            <li>Immersion : Comptines, histoires de contes et rituels quotidiens d'éveil en Anglais (30%)</li>
            <li>Infrastructures d'Éveil : Dortoirs climatisés douillets, salle de motricité fine, aire de jeux extérieure ombragée</li>
          </ul>
        </div>
      )
    },
    {
      title: "Moyenne Section (Maternelle | 3-4 ans)",
      content: (
        <div className="space-y-3 font-serif">
          <p>
            <strong>Structures Logiques et Autonomie :</strong> Apprentissage du graphisme, exercices préparatoires d'écriture précoce de l'alphabet, exploration d'exercices spatiaux et logiques d'éveil.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Immersion Anglais : Récits partagés, vocabulaire thématique et conversations élémentaires (40% de la journée)</li>
            <li>Ateliers phares : Initiation artistique à la poterie d'argile, rythmique corporelle, parcours d'éveil sportif</li>
            <li>Pédagogie active : Conceptions mathématiques par objets d'éveil</li>
          </ul>
        </div>
      )
    },
    {
      title: "Grande Section (Maternelle | 5-6 ans)",
      content: (
        <div className="space-y-3 font-serif">
          <p>
            <strong>Passerelle vers l'Écriture Active :</strong> Consolidation intense du graphisme, déchiffrage syllabique phonique préparant à l'entrée au CP, écriture complète cursive et manipulations numériques structurées.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Bilinguisme : Journées alternées d'activités scolaires exclusives en Anglais et Français (50/50)</li>
            <li>Introduction STEM : Ateliers d'initiation innovante à la logique du codage informatique (sans écran lourd, par blocs tactiles d'éveil)</li>
            <li>Objectif : Un grand épanouissement comportemental et mental pour aborder sereinement le cycle d'école élémentaire</li>
          </ul>
        </div>
      )
    },
    {
      title: "CPI / CP (Élémentaire | 6-7 ans)",
      content: (
        <div className="space-y-3 font-serif">
          <p>
            <strong>Le Cycle Fondamental d'Excellence :</strong> Entière maîtrise du décodage fluide de lecture, écriture cursive sans fautes de structure, et mémorisation mathématique fondamentale.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Méthode Singapour : Pratique active des quatre opérations mathématiques fondamentales par la modélisation en 3 étapes (Concret → Imagé → Abstrait)</li>
            <li>Langue renforcée : Lecture de récits littéraires authentiques de Lora en français et en anglais de niveau international</li>
            <li>Projets de Découverte : Expériences guidées en sciences de la terre et botanique dans le jardin écologique de l'école</li>
          </ul>
        </div>
      )
    },
    {
      title: "CE1 & CE2 (Élémentaire | 7-9 ans)",
      content: (
        <div className="space-y-3 font-serif">
          <p>
            <strong>Consolidation et Analyse Critique :</strong> Orthographe lexicale et grammaticale rigoureuse, résolutions complexes de problèmes mathématiques à plusieurs étapes, étude géopolitique et géographique structurée.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Grammaire & Vocabulaire : Systématisation active d'évolutions de texte complexes</li>
            <li>Sciences appliquées : Expérimentations d'ingénierie et robotique pédagogique active hebdomadaire au centre multimédia</li>
            <li>Activités : Théâtre d'expression orale pour l'aisance verbale publique, piscine d'Abidjan sous surveillance d'éducateurs expérimentés</li>
          </ul>
        </div>
      )
    },
    {
      title: "CM1 & CM2 (Élémentaire | 9-11 ans)",
      content: (
        <div className="space-y-3 font-serif">
          <p>
            <strong>Cycle de Liaison et Préparation d'Élite :</strong> Enseignements littéraires de Lora enrichis, approfondissements géométriques, philosophie pour enfants, histoire d'Afrique et du Monde, programmation avancée d'algorithmes.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Littérature : Échanges argumentés basés sur des lectures intégrales régulières en Français et en Anglais</li>
            <li>Préparation intense : Entraînement aux examens d'admission prestigieux des plus grands collèges d'excellence régionaux d'Abidjan</li>
            <li>Leadership social : Prise de parole publique, sensibilisation écologique active et projets collaboratifs de citoyenneté</li>
          </ul>
        </div>
      )
    }
  ];

  const calendarEvents = [
    { period: "Août 2026", text: "Visites privées d'orientation du campus et rendez-vous d'évaluation académique sur réservation.", color: "bg-brand-blue-deep" },
    { period: "Mardi 1er Septembre 2026", text: "Grande Rentée Scolaire solennelle des élèves de Maternelle et Primaire.", color: "bg-brand-gold" },
    { period: "Octobre 2026", text: "Congés scolaires de la Toussaint (1 semaine d'activités optionnelles de loisir d'éveil).", color: "bg-brand-blue-medium" },
    { period: "Décembre 2026", text: "Vacances d'Hiver académique & grande fête artistique de fin d'année d'Abidjan.", color: "bg-brand-green" },
    { period: "Février 2027", text: "Semaine de l'entrepreneuriat et de l'innovation robotique (exposition parentale).", color: "bg-brand-blue-deep" },
    { period: "Avril 2027", text: "Congés scolaires de Pâques (fouilles archéologiques simulées sur l'aire de jeux).", color: "bg-brand-gold" },
    { period: "Juin 2027", text: "Kermesse de l'excellence académique & distribution solennelle des bulletins annuels.", color: "bg-brand-green" },
  ];

  return (
    <div className="relative bg-gradient-to-br from-[#F4F8FF] to-white min-h-screen">

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden bg-brand-blue-deep py-20 px-4 md:px-8">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #F5A623 0%, transparent 60%), radial-gradient(circle at 80% 20%, #2D8C3C 0%, transparent 55%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-br from-[#F4F8FF] to-white"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }}
        />

        <motion.div
          className="relative max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-xs font-bold uppercase tracking-[0.35em] mb-6">
            <GraduationCap size={13} />
            {fr ? "Cursus d'Excellence Agréé" : 'Accredited Excellence Curriculum'}
          </span>
          <h1 className="font-sans font-extrabold text-4xl md:text-6xl text-white uppercase tracking-tight leading-[1.05]">
            {fr ? 'Programmes' : 'Academic'}{' '}
            <span className="bg-brand-gold text-brand-blue-deep px-3 rounded-md">
              {fr ? 'Scolaires' : 'Programs'}
            </span>
            <br />{fr ? '& Pédagogie' : '& Pedagogy'}
          </h1>
          <p className="mt-6 text-sm text-white/65 font-serif leading-relaxed max-w-2xl mx-auto">
            {fr
              ? "Notre projet éducatif réconcilie exigence intellectuelle et bienveillance comportementale. L'organisation en petits collectifs d'Abidjan de 15 élèves max assure une totale assimilation académique quotidienne."
              : "Our educational project reconciles intellectual rigor with caring pedagogy. Small class sizes of 15 students maximum ensure complete daily academic assimilation."}
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-24">

        {/* ── BENTO CARDS MATERNELLE / PRIMAIRE ── */}
        <motion.section {...fadeUp}>
          <div className="text-center mb-12">
            <p className="text-brand-gold font-bold uppercase tracking-[0.35em] text-xs mb-3">{fr ? 'Nos Deux Cycles' : 'Our Two Cycles'}</p>
            <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-brand-blue-deep uppercase tracking-tight">
              {fr ? 'Une École, Deux' : 'One School, Two'}{' '}
              <span className="bg-brand-gold text-brand-blue-deep px-2">{fr ? 'Ambitions' : 'Ambitions'}</span>
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {/* Maternelle Bento Card */}
            <motion.div variants={staggerItem} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <Card className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white overflow-hidden flex flex-col h-full border-0 p-0">
                <div className="relative h-44 bg-gradient-to-br from-brand-blue-deep to-[#1a4a8a] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, #F5A623 0%, transparent 50%)' }}
                  />
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <Apple size={32} className="text-brand-gold" />
                    </div>
                    <div className="flex gap-2">
                      {['PS', 'MS', 'GS'].map(badge => (
                        <span key={badge} className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold tracking-wider">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-1 space-y-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-brand-green">2 à 6 ans · Option Bilingue Immersive</span>
                    <h2 className="font-sans font-extrabold text-xl text-brand-blue-deep leading-tight mt-1">
                      Le Cycle Maternelle · Horizons Éveil
                    </h2>
                    <p className="text-xs text-brand-muted leading-relaxed font-serif mt-3">
                      La maternelle est la fondation essentielle du devenir d'excellence de l'enfant. Notre approche s'articule autour de l'estime de soi, du respect collectif, et d'un apprentissage progressif par le mouvement tactile. Tout est pensé pour éveiller la créativité.
                    </p>
                  </div>

                  <div className="space-y-3 flex-1">
                    {[
                      { icon: Shield, text: <><strong>Espaces climatisés douillets :</strong> Salles aérées adaptées avec sanitaires intégrés pour la sécurité et propreté autonome.</> },
                      { icon: Star, text: <><strong>Double langue précoce :</strong> Conversations d'éveil, chants épurés en français et initiation d'usage en anglais parlé.</> },
                      { icon: Zap, text: <><strong>Nutrition saine :</strong> Collations saines composées de fruits d'Abidjan, sous suivi diététique académique.</> },
                    ].map(({ icon: Icon, text }, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-brand-blue-deep/[0.03] hover:bg-brand-blue-deep/[0.06] transition-colors">
                        <div className="w-6 h-6 rounded-lg bg-brand-gold/15 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={12} className="text-brand-gold" />
                        </div>
                        <span className="text-xs text-brand-muted font-sans leading-relaxed">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-brand-border/40 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-brand-blue-medium">Effectif : 15 places max / classe</span>
                    <a href="#/programmes/maternelle" className="text-brand-green hover:text-brand-blue-deep font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors">
                      Dossier détaillé →
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Primaire Bento Card */}
            <motion.div variants={staggerItem} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <Card className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white overflow-hidden flex flex-col h-full border-0 p-0">
                <div className="relative h-44 bg-gradient-to-br from-[#B07D10] to-brand-gold flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-25"
                    style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #0D2E5C 0%, transparent 55%)' }}
                  />
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <BookOpen size={32} className="text-brand-blue-deep" />
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                      {['CP', 'CE1', 'CE2', 'CM1', 'CM2'].map(badge => (
                        <span key={badge} className="px-2.5 py-0.5 rounded-full bg-brand-blue-deep/20 backdrop-blur-sm border border-brand-blue-deep/20 text-brand-blue-deep text-[10px] font-bold tracking-wider">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-1 space-y-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-brand-blue-medium">6 à 11 ans · Excellence Littéraire & STEM</span>
                    <h2 className="font-sans font-extrabold text-xl text-brand-blue-deep leading-tight mt-1">
                      Le Cycle Primaire · Horizons Académique
                    </h2>
                    <p className="text-xs text-brand-muted leading-relaxed font-serif mt-3">
                      Le cycle élémentaire scelle le passeport académique. Nous offrons les bases nationales officielles bonifiées par un enrichissement international rigoureux : résolution analytique, écriture, bilinguisme total, et projets pratiques.
                    </p>
                  </div>

                  <div className="space-y-3 flex-1">
                    {[
                      { icon: Zap, text: <><strong>Méthodes Mathématiques actives :</strong> Modélisation intuitive Singapour pour appréhender l'abstraction de la pensée.</> },
                      { icon: Star, text: <><strong>Anglais académique soutenu :</strong> Écritures, expressions orales d'éloquences publiques, lectures d'excellence.</> },
                      { icon: Shield, text: <><strong>Initiations technologiques :</strong> Manipulations de robotique active Lego Education pour le raisonnement logique.</> },
                    ].map(({ icon: Icon, text }, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-brand-gold/[0.04] hover:bg-brand-gold/[0.08] transition-colors">
                        <div className="w-6 h-6 rounded-lg bg-brand-blue-deep/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={12} className="text-brand-blue-deep" />
                        </div>
                        <span className="text-xs text-brand-muted font-sans leading-relaxed">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-brand-border/40 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-brand-blue-medium">Effectif : 20 places max / classe</span>
                    <a href="#/programmes/primaire" className="text-brand-blue-deep hover:text-brand-gold font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors">
                      Dossier détaillé →
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* ── SÉPARATEUR ── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
          <div className="w-2 h-2 rounded-full bg-brand-gold" />
          <div className="w-2 h-2 rounded-full bg-brand-blue-deep/30" />
          <div className="w-2 h-2 rounded-full bg-brand-gold" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
        </div>

        {/* ── ACCORDION SECTION ── */}
        <motion.section {...fadeUp}>
          <div className="text-center mb-12">
            <p className="text-brand-gold font-bold uppercase tracking-[0.35em] text-xs mb-3">Détail par Classe</p>
            <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-brand-blue-deep uppercase tracking-tight">
              Programme Académique par <span className="bg-brand-gold text-brand-blue-deep px-2">Niveau</span>
            </h2>
            <p className="text-xs text-brand-muted mt-4 font-serif max-w-xl mx-auto leading-relaxed">
              Cliquez sur les niveaux ci-dessous pour découvrir le projet d'excellence de la maternelle au CM2 d'Abidjan.
            </p>
          </div>

          <motion.div
            className="max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div
              variants={staggerItem}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white p-6 md:p-8"
            >
              <Accordion items={schoolLevels} />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* ── SÉPARATEUR ── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
          <div className="w-2 h-2 rounded-full bg-brand-green" />
          <div className="w-2 h-2 rounded-full bg-brand-blue-deep/30" />
          <div className="w-2 h-2 rounded-full bg-brand-green" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
        </div>

        {/* ── TIMELINE CALENDRIER ── */}
        <motion.section {...fadeUp}>
          <div className="text-center mb-12">
            <p className="text-brand-gold font-bold uppercase tracking-[0.35em] text-xs mb-3">Planification Annuelle</p>
            <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-brand-blue-deep uppercase tracking-tight">
              Calendrier <span className="bg-brand-gold text-brand-blue-deep px-2">Académique</span>
            </h2>
            <p className="text-[11px] text-brand-muted mt-3 font-serif">
              Année Scolaire 2026/2027 · Conforme au Ministère de l'Éducation de Côte d'Ivoire
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white border-0 p-8 md:p-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-3 bg-brand-green/10 rounded-2xl">
                  <Clock size={22} className="text-brand-green" />
                </div>
                <div>
                  <h3 className="font-sans font-extrabold text-lg text-brand-blue-deep">Grand Calendrier Académique</h3>
                  <span className="text-[11px] font-semibold text-brand-muted">Rentrée 2026/2027 · Provisoire</span>
                </div>
              </div>

              <motion.div
                className="relative"
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-brand-blue-deep/20 via-brand-gold/30 to-brand-green/20" />

                <div className="space-y-8">
                  {calendarEvents.map((ev, idx) => (
                    <motion.div
                      key={idx}
                      variants={staggerItem}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="relative flex items-start gap-5 pl-1"
                    >
                      <div className={`relative z-10 w-6 h-6 rounded-full ${ev.color} flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_0_3px_white,0_0_0_5px_rgba(13,46,92,0.1)]`}>
                        <div className="w-2 h-2 rounded-full bg-white/80" />
                      </div>

                      <div className="flex-1 pb-1">
                        <span className="font-sans font-extrabold text-xs text-brand-blue-deep tracking-wide uppercase block mb-1">
                          {ev.period}
                        </span>
                        <p className="text-xs text-brand-muted leading-relaxed font-serif">
                          {ev.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </Card>
          </div>
        </motion.section>

        {/* ── BOTTOM SPACING ── */}
        <div className="pb-4" />
      </div>
    </div>
  );
};
