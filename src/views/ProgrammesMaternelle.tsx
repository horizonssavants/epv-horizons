/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Apple, GraduationCap, Clock, ShieldCheck, Heart, ArrowRight, Sparkles, Globe } from 'lucide-react';
import { useLang } from '../lib/LanguageContext.tsx';

export const ProgrammesMaternelle: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  return (
    <div className="relative animate-fade-in py-12 px-4 md:px-8 bg-white select-none">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Breadcrumb & Intro header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-brand-muted uppercase font-bold tracking-wider">
            <a href="#/programmes" className="hover:text-brand-blue-deep transition-colors">
              {fr ? "Nos Programmes" : "Our Programs"}
            </a>
            <span>/</span>
            <span className="text-brand-green">
              {fr ? "Cycle Maternelle d’Éveil" : "Kindergarten Cycle"}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-green/10 border border-brand-green/20 text-brand-green text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            {fr
              ? "Émergence Cognitive & Bilinguisme Immersif (PS, MS, GS)"
              : "Cognitive Emergence & Immersive Bilingualism (PS, MS, GS)"}
          </span>

          <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-brand-blue-deep tracking-tight leading-tight">
            {fr
              ? "Programme Maternelle d’Excellence à Abidjan — EPV Horizons Savants"
              : "Excellence Kindergarten Program in Abidjan — EPV Horizons Savants"}
          </h1>
          <p className="font-serif text-sm md:text-base text-brand-muted leading-relaxed max-w-4xl">
            {fr
              ? "Découvrez notre cursus de maternelle précoce agréé, conçu spécifiquement à Cocody Riviera pour éveiller l’estime de soi, propulser la socialisation bienveillante, et ancrer un bilinguisme franco-anglais d’élite dès 2 ans."
              : "Discover our accredited early kindergarten curriculum, specifically designed in Cocody Riviera to awaken self-esteem, foster caring socialization, and establish elite French-English bilingualism from age 2."}
          </p>
          <div className="h-1 w-20 bg-brand-gold rounded-full" />
        </div>

        {/* Hero image or big citation card */}
        <Card className="bg-brand-blue-deep text-white p-6 md:p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 p-4 text-brand-gold/10 pointer-events-none select-none">
            <Apple size={200} strokeWidth={1} />
          </div>
          <div className="relative z-10 space-y-4 max-w-2xl font-serif">
            <p className="text-sm md:text-md italic leading-relaxed">
              « Les premières années de vie constituent un âge d'or pour la plasticité cérébrale. C'est à cet instant précis que se dessinent les fondations d'un parcours exceptionnel. Chez EPV Horizons Savants, nous offrons à chaque enfant l'environnement idéal pour explorer son potentiel infini. »
            </p>
            <div className="font-sans text-xs uppercase tracking-wider text-brand-gold font-bold">
              — Direction Pédagogique, EPV Horizons Savants Abidjan
            </div>
          </div>
        </Card>

        {/* Long content article block (divided into clear headings for Local SEO Google Ivory Coast) */}
        <div className="font-serif text-xs md:text-sm text-brand-dark/95 space-y-6 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="font-sans font-bold text-lg md:text-xl text-brand-blue-deep">
              Pourquoi la Maternelle d'Horizons Savants est Unique en Côte d'Ivoire ?
            </h2>
            <p>
              À Abidjan, la quête d'une institution préscolaire alliant rigueur et bienveillance est une priorité pour les familles d'excellence. Le Programme Maternelle d'EPV Horizons Savants répond à ce besoin crucial en mariant adroitement les requis officiels de l'Éducation Nationale de Côte d'Ivoire avec d'immenses enrichissements internationaux. Notre école se démarque par un effectif de <strong>15 élèves maximum par classe</strong>, garantissant un suivi comportemental et d’acquisition hautement personnalisé.
            </p>
            <p>
              Notre pédagogie s'inspire activement de la philosophie Montessori, du socio-constructivisme et de la bienveillance active. Nous considérons le jeu libre dirigé, les manipulations physiques d'objets tridimensionnels et le contact régulier avec la nature comme les moteurs primaires de l'intelligence cognitive et émotionnelle de l'élève.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-blue-medium">
              1. L'Immersion Linguistique Bilingue Précoce d'Abidjan
            </h3>
            <p>
              Le cerveau préscolaire absorbe les sonorités linguistiques avec une fluidité extraordinaire. Notre cursus maternelle propose une immersion d'usage totale : la moitié de la journée d'éveil se déroule intégralement en langue anglaise, l'autre moitié en langue française. À travers des comptines théâtralisées, des récits partagés de grands contes d'Afrique et de l'Occident, et des interactions quotidiennes naturelles, nos élèves de Petite, Moyenne et Grande Sections s'approprient les structures verbales fondamentales. Ils entrent au primaire de façon bilingue spontanée, sans effort, avec une prononciation et une assurance linguistique impeccables.
            </p>
          </section>

          {/* Grids with classes details */}
          <section className="space-y-4 pt-2">
            <h2 className="font-sans font-bold text-md md:text-lg text-brand-blue-deep border-b border-brand-border/60 pb-1.5">
              Nos Trois Sections d'Éveil Pédagogique d'Élite
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
              
              <div className="bg-brand-pale p-5 rounded-xl border border-brand-border/60 space-y-3">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-xs shrink-0">PS</div>
                  <h4 className="font-bold text-xs text-brand-blue-deep font-sans">Petite Section (2-3 ans)</h4>
                </div>
                <div className="text-[11px] text-brand-muted leading-relaxed font-serif space-y-2">
                  <p>
                    L'objectif prioritaire de la Petite Section est l'affirmation sereine du langage verbal et l'acquisition d'une autonomie motrice. 
                  </p>
                  <p><strong>Ateliers Spécifiques :</strong> Motricité fine tridimensionnelle, conscience du corps, écoute et articulation, socialisation guidée, comptines d'immersion bilingue quotidienne, et repos douillet physiologiquement respecté.</p>
                </div>
              </div>

              <div className="bg-brand-pale p-5 rounded-xl border border-brand-border/60 space-y-3">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded bg-brand-gold/15 text-brand-blue-deep flex items-center justify-center font-bold text-xs shrink-0">MS</div>
                  <h4 className="font-bold text-xs text-brand-blue-deep font-sans">Moyenne Section (3-4 ans)</h4>
                </div>
                <div className="text-[11px] text-brand-muted leading-relaxed font-serif space-y-2">
                  <p>
                    La Moyenne Section structure le graphisme fin, l’appréhension spatiale des volumes, et le raisonnement logique élémentaire.
                  </p>
                  <p><strong>Ateliers Spécifiques :</strong> Tracés d'orientation, pré-phonique de l'alphabet, premier tri logique de formes géométriques, ateliers artistiques créatifs de poterie d'argile manuelle, et exploration rythmique sonore active.</p>
                </div>
              </div>

              <div className="bg-brand-pale p-5 rounded-xl border border-brand-border/60 space-y-3">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded bg-brand-blue-deep/10 text-brand-blue-deep flex items-center justify-center font-bold text-xs shrink-0">GS</div>
                  <h4 className="font-bold text-xs text-brand-blue-deep font-sans">Grande Section (5-6 ans)</h4>
                </div>
                <div className="text-[11px] text-brand-muted leading-relaxed font-serif space-y-2">
                  <p>
                    La Grande Section agit comme une passerelle d'excellence et de confiance d'Abidjan vers le cycle primaire littéraire et STEM.
                  </p>
                  <p><strong>Ateliers Spécifiques :</strong> Consolidation intense du graphisme d'écriture cursive, déchiffrage syllabique bilingue, et introduction douce à la logique computationnelle de blocs tactiles Lego Education.</p>
                </div>
              </div>

            </div>
          </section>

          <section className="space-y-3 pt-2">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-blue-medium">
              2. Développement Socio-Émotionnel et Psychomotricité Active
            </h3>
            <p>
              Pour Horizons Savants, le cœur intellectuel de l’enfant ne saurait s'épanouir sans l’équilibre du corps. Notre campus premium d'Abidjan est doté d’aires de jeux ombragées amortissantes, d’une salle de motricité spacieuse climatisée et d’outils d’éveil ludiques. Chaque élève bénéficie d’activités guidées régulières et d'ateliers de yoga pour enfants, favorisant la concentration mentale, la canalisation active de l'énergie et la conscience émotionnelle positive.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-green">
              3. Infrastructures d’Exception et Sécurité Sanitaire Rigoureuse
            </h3>
            <p>
              Situé dans un havre de paix à M'Pouto (Cocody Riviera), notre établissement maternelle respecte les normes ergonomiques et de sécurité les plus strictes au monde. Les salles de classe de maternelle sont intégralement adaptées, lumineuses, climatisées de manière douce et équipées de sanitaires intérieurs privatifs adaptés à la morphologie des petits. L'accès des parents est rigoureusement encadré, et l'enceinte entière fait l'objet d'une télésurveillance permanente CCTV assortie du contrôle strict d'un vigile d'élite d'Abidjan.
            </p>
          </section>

        </div>

        {/* Highlights summary banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 font-sans text-brand-blue-deep text-center select-none">
          <div className="p-4 rounded-xl bg-brand-pale border border-brand-border/40">
            <strong className="block text-2xl font-extrabold text-brand-green">15 max</strong>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-normal block mt-1">Élèves par Classe d'Élite</span>
          </div>
          <div className="p-4 rounded-xl bg-brand-pale border border-brand-border/40">
            <strong className="block text-2xl font-extrabold text-brand-gold">50% / 50%</strong>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-normal block mt-1">Immersion Bilingue Quotidienne</span>
          </div>
          <div className="p-4 rounded-xl bg-brand-pale border border-brand-border/40">
            <strong className="block text-2xl font-extrabold">100%</strong>
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-normal block mt-1">Salles de classe adaptées climatisées</span>
          </div>
        </div>

        {/* Call to action panel */}
        <Card className="bg-brand-gold-light/15 border border-brand-gold-light/45 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <h3 className="font-sans font-extrabold text-lg md:text-xl text-brand-blue-deep leading-tight">
              Garantir une place d'excellence en Maternelle pour Septembre 2026
            </h3>
            <p className="text-xs text-brand-muted font-serif leading-relaxed">
              En raison de la stricte limitation d'Abidjan à 15 élèves par section de maternelle, les inscriptions se clôturent promptement. Déposez votre pré-inscription d'admission en 2 minutes dès aujourd'hui.
            </p>
          </div>
          <a href="#/admissions" className="shrink-0">
            <Button variant="cta" className="font-bold gap-2 px-6">
              Déposer le Dossier parent <ArrowRight size={14} />
            </Button>
          </a>
        </Card>

      </div>
    </div>
  );
};
