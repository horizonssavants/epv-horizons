/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { BookOpen, GraduationCap, Clock, ShieldCheck, HelpCircle, ArrowRight, Sparkles, Database } from 'lucide-react';
import { useLang } from '../lib/LanguageContext.tsx';

export const ProgrammesPrimaire: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  return (
    <div className="relative animate-fade-in py-12 px-4 md:px-8 bg-white select-none">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Breadcrumb & Intro header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-brand-muted uppercase font-bold tracking-wider">
            <a href="#/programmes" className="hover:text-brand-blue-deep transition-colors">{fr ? 'Nos Programmes' : 'Our Programs'}</a>
            <span>/</span>
            <span className="text-brand-blue-medium">{fr ? "Cycle Primaire d'Excellence" : 'Excellence Primary Cycle'}</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-blue-medium/10 border border-brand-blue-medium/20 text-brand-blue-medium text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-brand-gold" />
            {fr ? 'Méthodes Scientifiques Actives & Éloquence Scolaire (CP au CM2)' : 'Active Scientific Methods & Academic Eloquence (CP to CM2)'}
          </span>

          <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-brand-blue-deep tracking-tight leading-tight">
            {fr ? "Programme Primaire d'Élite d'Abidjan — EPV Horizons Savants" : 'Elite Primary Program in Abidjan — EPV Horizons Savants'}
          </h1>
          <p className="font-serif text-sm md:text-base text-brand-muted leading-relaxed max-w-4xl">
            Découvrez comment notre enseignement élémentaire d'excellence d'Abidjan prépare intellectuellement et méthodologiquement les plus doués des élèves de Côte d'Ivoire à l'accès aux plus prestigieux collèges mondiaux.
          </p>
          <div className="h-1 w-20 bg-brand-blue-medium rounded-full" />
        </div>

        {/* Hero content card */}
        <Card className="bg-brand-blue-medium text-white p-6 md:p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 p-4 text-brand-gold/10 pointer-events-none select-none">
            <BookOpen size={200} strokeWidth={1} />
          </div>
          <div className="relative z-10 space-y-4 max-w-2xl font-serif">
            <p className="text-sm md:text-md italic leading-relaxed">
              « L'école primaire ne doit pas seulement transférer des faits mémorisés de façon mécanique, elle doit aiguiser la curiosité analytique, installer l'éloquence orale publique et donner le goût de l'abstraction mathématique. C'est l'essence de notre programme d'excellence académique à Abidjan. »
            </p>
            <div className="font-sans text-xs uppercase tracking-wider text-brand-gold font-bold">
              — Conseil de l'Élite Académique, EPV Horizons Savants
            </div>
          </div>
        </Card>

        {/* Long content article block (divided into clear headings for Local SEO Google Ivory Coast) */}
        <div className="font-serif text-xs md:text-sm text-brand-dark/95 space-y-6 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="font-sans font-bold text-lg md:text-xl text-brand-blue-deep">
              La Redéfinition de l'Excellence du Premier Cycle Primaire en Côte d'Ivoire
            </h2>
            <p>
              EPV Horizons Savants à Abidjan applique les exigences académiques strictes agréées par le Ministère de l'Éducation Nationale de Côte d'Ivoire. Nous croyons ferment que ce socle doit être bonifié et enrichi de méthodes actives d'autres pôles d'excellence mondiaux : Singapour pour les raisonnements de mathématiques et la Finlande pour l'accompagnement comportemental bienveillant des élèves.
            </p>
            <p>
              Sous la conduite d'un corps professoral d'élite trié sur le volet et soumis à une formation pédagogique continue intense, notre enseignement primaire garantit des classes limitées à <strong>vides de pollution de surcharge (20 élèves maximum)</strong>. Cette densité d’élite permet d'allouer à chaque enfant le temps d'assimilation requis, éradiquant l'échec et stimulant le dépassement de soi.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-blue-medium">
              1. Mathématiques d'Élite : La Méthode Concrète, Immagée, Abstraite de Singapour
            </h3>
            <p>
              Les mathématiques sont souvent sources d'anxiété scolaire en l'absence de base saine. Chez EPV Horizons Savants, nous avons brisé ce cycle en instaurant la <strong>Méthode de Singapour</strong> du CP au CM2. 
            </p>
            <p>
              Cette approche en trois étapes commence toujours par le <strong>Concret</strong> (manipulations d'objets, cubes de liaison d'Abidjan), se poursuit par l'<strong>Imagé</strong> (modélisation de barres graphiques représentant la situation), et s'achève naturellement par l'<strong>Abstrait</strong> (les notations algébriques). En installant solidement ces modélisations heuristiques, nos élèves abordent sereinement le calcul rapide complexe et la résolution logique de problèmes quotidiens.
            </p>
          </section>

          {/* Grids with classes details */}
          <section className="space-y-4 pt-2">
            <h2 className="font-sans font-bold text-md md:text-lg text-brand-blue-deep border-b border-brand-border/60 pb-1.5">
              Notre Parcours Pédagogique par Cycles du CP au CM2
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs">
              
              <div className="bg-brand-pale p-5 rounded-xl border border-brand-border/60 space-y-3">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded bg-brand-blue-medium/10 text-brand-blue-deep flex items-center justify-center font-bold text-xs shrink-0">CP</div>
                  <h4 className="font-bold text-xs text-brand-blue-deep font-sans">CPI / CP (6-7 ans)</h4>
                </div>
                <div className="text-[11px] text-brand-muted leading-relaxed font-serif space-y-2">
                  <p>
                    Le cycle de lecture phonique active et d'acquisition de l'écriture cursive impeccable en Français et en Anglais.
                  </p>
                  <p><strong>Piliers :</strong> Enseignement de la méthode d'apprentissage phonique bilingue, mathématiques actives Singapour (sommes et restes jusqu'à 100), et projets de découverte de la nature dans notre potager écologique d'Abidjan.</p>
                </div>
              </div>

              <div className="bg-brand-pale p-5 rounded-xl border border-brand-border/60 space-y-3">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded bg-brand-gold/15 text-brand-blue-deep flex items-center justify-center font-bold text-xs shrink-0">CE</div>
                  <h4 className="font-bold text-xs text-brand-blue-deep font-sans">CE1 & CE2 (7-9 ans)</h4>
                </div>
                <div className="text-[11px] text-brand-muted leading-relaxed font-serif space-y-2">
                  <p>
                    La phase de consolidation orthographique, de grammaire et de structuration du raisonnement scientifique et d'éloquence.
                  </p>
                  <p><strong>Piliers :</strong> Dictées programmées, initiation à la géométrie de précision, activités de théâtre d'expression orale pour vaincre la timidité linguistique bilingue d'Abidjan, et robotique éducative Lego Education.</p>
                </div>
              </div>

              <div className="bg-brand-pale p-5 rounded-xl border border-brand-border/60 space-y-3">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded bg-brand-blue-deep/10 text-brand-blue-deep flex items-center justify-center font-bold text-xs shrink-0">CM</div>
                  <h4 className="font-bold text-xs text-brand-blue-deep font-sans">CM1 & CM2 (9-11 ans)</h4>
                </div>
                <div className="text-[11px] text-brand-muted leading-relaxed font-serif space-y-2">
                  <p>
                    Le cycle d'élargissement critique, de bilinguisme soutenu écrit et de préparation aux concours prestigieux d'admission d'Abidjan.
                  </p>
                  <p><strong>Piliers :</strong> Analyse grammaticale avancée, mathématiques d'équations, codage Scratch, géopolitique régionale de Côte d'Ivoire et de l'Afrique, et ateliers hebdomadaires de leadership social de groupe.</p>
                </div>
              </div>

            </div>
          </section>

          <section className="space-y-3 pt-2">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-blue-medium">
              2. Bilinguisme Académique Réfléchi et Littérature
            </h3>
            <p>
              Au cycle primaire, le bilinguisme dépasse les rituels d'expression orale pour devenir académique solide. Nos cours de sciences de découvertes du monde, de technologie computationnelle STEM et d’histoire-géographie sont alternativement d'usage en Français et en Anglais. Les élèves lisent régulièrement des ouvrages de référence dans les deux langues, développent des esprits d'analyse de contes critiques et rédigent des dissertations de haut niveau. 
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-gold font-bold">
              3. STEM et Technologie Computationnelle Lego Education
            </h3>
            <p>
              EPV Horizons Savants d'Abidjan prépare ses élèves à exceller dans un univers de plus en plus numérique. Notre atelier robotique et de programmation avancée par blocs Scratch permet d’appréhender la logique mathématique appliquée. Les enfants construisent eux-mêmes leurs capteurs motorisés Lego Education, testent les boucles et les variables mécaniques et apprennent à travailler en dynamique de groupe de projet, liant la science théorique à la matérialité concrète.
            </p>
          </section>

        </div>

        {/* Highlights summary banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 font-sans text-brand-blue-deep text-center select-none">
          <div className="p-4 rounded-xl bg-brand-pale border border-brand-border/40">
            <strong className="block text-2xl font-extrabold text-brand-blue-medium">20 max</strong>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-normal block mt-1">Élèves par Classe de Primaire</span>
          </div>
          <div className="p-4 rounded-xl bg-brand-pale border border-brand-border/40">
            <strong className="block text-2xl font-extrabold text-brand-gold">100%</strong>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-normal block mt-1">Taux de Maîtrise Méthode Singapour</span>
          </div>
          <div className="p-4 rounded-xl bg-brand-pale border border-brand-border/40">
            <strong className="block text-2xl font-extrabold text-brand-green">10 d'éloquence</strong>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-normal block mt-1">Clubs de Communication et Leadership</span>
          </div>
        </div>

        {/* Call to action panel */}
        <Card className="bg-brand-gold-light/15 border border-brand-gold-light/45 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <h3 className="font-sans font-extrabold text-lg md:text-xl text-brand-blue-deep leading-tight">
              Prendre rendez-vous avec le Conseil Pédagogique d'Abidjan
            </h3>
            <p className="text-xs text-brand-muted font-serif leading-relaxed">
              Le passage du test d'évaluation gratuit est nécessaire pour valider l'excellence et le plan d'accueil individualisé de l'élève en CP, CE1, CE2, CM1 ou CM2. Planifiez votre entretien physique.
            </p>
          </div>
          <a href="#/admissions" className="shrink-0">
            <Button variant="cta" className="font-bold gap-2 px-6">
              S'inscrire aux Évaluations <ArrowRight size={14} />
            </Button>
          </a>
        </Card>

      </div>
    </div>
  );
};
