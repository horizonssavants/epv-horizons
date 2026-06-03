/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { BookOpen, Calendar, Clock, Share2, ChevronRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext.tsx';

/* ─── Animation variants ──────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Tag → badge color map ───────────────────────────────────── */
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  'Pédagogie active': { bg: 'bg-brand-green/15', text: 'text-brand-green' },
  'Sciences (STEM)':  { bg: 'bg-brand-blue-light/15', text: 'text-brand-blue-medium' },
  'Vie de l\'école':  { bg: 'bg-brand-gold/15', text: 'text-brand-blue-deep' },
  'Notre Vision':     { bg: 'bg-brand-gold/15', text: 'text-brand-blue-deep' },
  'Charte Éthique':   { bg: 'bg-brand-green/15', text: 'text-brand-green' },
};

function tagColor(tag: string) {
  return TAG_COLORS[tag] ?? { bg: 'bg-brand-blue-deep/10', text: 'text-brand-blue-deep' };
}

/* ─── Author avatar ───────────────────────────────────────────── */
function AuthorAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const dim = size === 'lg' ? 'w-10 h-10 text-sm' : 'w-7 h-7 text-[10px]';
  return (
    <span
      className={`${dim} rounded-full bg-brand-blue-deep text-white font-bold font-sans flex items-center justify-center shrink-0 select-none`}
    >
      {initials}
    </span>
  );
}

export const Blog: React.FC = () => {
  const { lang } = useLang();
  const fr = lang === 'fr';
  const ALL = fr ? 'Tous' : 'All';

  const [activeArticle, setActiveArticle] = useState<any | null>(null);
  const [activeFilter, setActiveFilter]   = useState<string>('__all__');

  const isAll = activeFilter === '__all__';
  const [cmsArticles,   setCmsArticles]   = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/articles?statut=publié')
      .then(r => r.json())
      .then(data => setCmsArticles(Array.isArray(data) ? data : []))
      .catch(() => setCmsArticles([]));
  }, []);

  const articles = [
    {
      id: "bil-1",
      title: "L'importance cruciale du bilinguisme précoce dès la Petite Section",
      summary: "Pourquoi l'acquisition naturelle d'une seconde langue avant l'âge de 6 ans façonne durablement la plasticité cérébrale de l'élève.",
      date: "15 Mai 2026",
      readTime: "4 min",
      tag: "Pédagogie active",
      author: "Dr. Marc-André Kouyo",
      img: "/api/img-proxy?url=https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
      content: (
        <div className="space-y-4 font-serif leading-relaxed text-xs md:text-sm text-brand-dark/95">
          <p>
            De nombreuses études scientifiques en neurosciences s'accordent à le démontrer : le cerveau de l'enfant d'âge préscolaire possède un niveau d'élasticité synaptique extraordinaire. Entre 2 et 6 ans, l'acquisition linguistique ne relève pas d'un effort d'apprentissage théorique rébarbatif, mais d'un processus naturel d'adaptation comportementale.
          </p>
          <p>
            À <strong>EPV Horizons Savants</strong>, nous avons structuré une immersion double Français/Anglais dès la Petite Section d'Maternelle. En intégrant l'anglais à travers les jeux d'éveil, les chants d'apprentissage, et les récits de contes quotidiens, l'enfant s'approprie le vocabulaire sans barrière psychologique.
          </p>
          <blockquote className="border-l-4 border-brand-gold pl-4 italic text-brand-blue-medium py-1">
            "Le bilinguisme précoce ne surcharge pas le cerveau de l'élève ; au contraire, il le dote de meilleures facultés de mémorisation et de résolution logique de problèmes."
          </blockquote>
          <p>
            Ce biculturalisme linguistique forme le socle essentiel pour faire fleurir les compétences intellectuelles indispensables aux citoyens globaux d'Abidjan pour relever les défis de demain.
          </p>
        </div>
      )
    },
    {
      id: "sing-2",
      title: "La Méthode Mathématique active de Singapour expliquée aux parents d'Abidjan",
      summary: "Découvrez l'approche concrète en 3 étapes (Concret, Imagé, Abstrait) qui réconcilie les enfants d'élémentaire avec le raisonnement arithmétique.",
      date: "28 Avril 2026",
      readTime: "5 min",
      tag: "Sciences (STEM)",
      author: "Mme Clarisse Touré Koffi",
      img: "/api/img-proxy?url=https://images.unsplash.com/photo-1453733190148-c44698c26588?auto=format&fit=crop&w=600&q=80",
      content: (
        <div className="space-y-4 font-serif leading-relaxed text-xs md:text-sm text-brand-dark/95">
          <p>
            Pourquoi tant d'enfants redoutent-ils les mathématiques élémentaires ? La réponse réside souvent dans l'introduction trop hâtive et rigide de l'abstraction numérique pure (formules brutes, équations posées).
          </p>
          <p>
            La méthode active de <strong>Singapour</strong>, dispensée dès la classe de CP à EPV Horizons Savants, repose à l'inverse sur un triptyque d'apprentissage très progressif :
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-xs">
            <li>
              <strong>L'étape Concrète :</strong> L'enfant manipule physiquement des objets d'éveil (cubes, billes d'argile, jetons de couleur) pour appréhender les quantités réelles.
            </li>
            <li>
              <strong>L'étape Imagée :</strong> Les objets d' Abidjan sont traduits graphiquement sous forme de bandes dessinées schématiques (modélisation par blocs).
            </li>
            <li>
              <strong>L'étape Abstraite :</strong> Les symboles opératoires (+, -, &times;, &div;) sont introduits naturellement une fois le schème physique parfaitement assimilé.
            </li>
          </ol>
          <p>
            Cette progression logique permet à chaque élève d'Abidjan de bâtir des structures mentales d'excellence extrêmement stables pour aborder les sciences d'ingénieur complexes du secondaire.
          </p>
        </div>
      )
    },
    {
      id: "camp-3",
      title: "Inauguration de notre campus vert d'Excellence à Cocody Riviera M'Pouto",
      summary: "Qu'est-ce qui fait d'EPV Horizons Savants le cadre propice et sécurisé par excellence pour le développement de vos enfants.",
      date: "12 Avril 2026",
      readTime: "3 min",
      tag: "Vie de l'école",
      author: "Secrétariat Général d'Abidjan",
      img: "/api/img-proxy?url=https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
      content: (
        <div className="space-y-4 font-serif leading-relaxed text-xs md:text-sm text-brand-dark/95">
          <p>
            L'environnement physique dans lequel un enfant passe ses journées d'école agit directement sur son niveau de sérénité émotionnelle et sa concentration intellectuelle. C'est pourquoi l'architecture de notre complexe d'EPV Horizons Savants a fait l'objet d'un soin draconien.
          </p>
          <p>
            Implanté au sein d'une zone résidentielle privilégiée de <strong>Cocody Riviera M'Pouto</strong>, notre école moderne fait cohabiter la technologie d'orientation (salles entièrement climatisées, filtres à air aérés, tablettes multimédias d'éveil) avec la beauté tranquille de la nature.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Jardin pédagogique écologique autonome de fleurs locales</li>
            <li>Aires de récréation sportives équipées de pelouses amortissantes</li>
            <li>Climatisation discrète filtrante à économie d'énergie respectueuse de la santé bronchique de l'élève</li>
            <li>Contrôle d'accès par carte et veille de sécurité continue 24h/24</li>
          </ul>
          <p>
            Nous vous invitons chaleureusement à réserver votre séance de visite privée sur notre calendrier officiel en ligne afin de venir contempler par vous-même ce joyau éducatif conçu pour l'épanouissement de vos enfants.
          </p>
        </div>
      )
    },
    {
      id: "why-epv-4",
      title: "Pourquoi EPV Horizons Savants ? Notre Storytelling Fondateur d'Excellence",
      summary: "Découvrez la genèse d'un projet éducatif inédit qui redéfinit l'excellence bilingue à Abidjan pour hisser chaque enfant au sommet de son autonomie.",
      date: "05 Avril 2026",
      readTime: "6 min",
      tag: "Notre Vision",
      author: "Comité de Direction d'EPV",
      img: "/api/img-proxy?url=https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600&q=80",
      content: (
        <div className="space-y-4 font-serif leading-relaxed text-xs md:text-sm text-brand-dark/95">
          <p>
            EPV Horizons Savants n'est pas simplement une école de plus à Abidjan ; c'est le fruit d'une ambition familiale et collective de parents et d'éducateurs chevronnés. Témoins des mutations globales de l'éducation, nos fondateurs ont souhaité créer un pont solide entre le programme d'enseignement rigoureux ivoirien et les pédagogies d'avant-garde mondiales.
          </p>
          <p>
            Notre postulat d'origine est simple : tout enfant recèle un potentiel d'excellence. Le rôle de l'école est d'aménager un terreau fertilisé pour qu'il s'éveille sans frustration. Qu'il s'agisse de la structure de nos classes limitées à <strong>15 élèves au maximum</strong>, de l'immersion complète ou du recrutement de nos enseignants d'élite, chaque détail concourt à cette promesse.
          </p>
          <p className="font-bold text-[#0D2E5C]">
            « Nous croyons en une école de la bienveillance stimulante, où l'exigence académique s'accomplit dans la joie d'apprendre au quotidien. »
          </p>
          <p>
            En unissant des ressources numériques de pointe, une immersion linguistique bilingue continue franco-anglaise et un solide cadre moral ancré dans le respect d'autrui, EPV Horizons Savants se dresse comme la rampe de lancement idéale pour accompagner vos enfants vers un destin de leader éclairé.
          </p>
        </div>
      )
    },
    {
      id: "valeurs-5",
      title: "Nos 5 Valeurs Cardinales de Croissance et de comportement citoyen",
      summary: "Intégrité, curiosité, respect, persévérance et humanisme : comment nous insufflons ces repères éthiques cruciaux dans la vie scolaire.",
      date: "25 Mars 2026",
      readTime: "5 min",
      tag: "Charte Éthique",
      author: "Mme Clarisse Touré Koffi",
      img: "/api/img-proxy?url=https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80",
      content: (
        <div className="space-y-4 font-serif leading-relaxed text-xs md:text-sm text-brand-dark/95">
          <p>
            Si l'excellence académique est le moteur de notre enseignement de pointe, l'éthique de comportement en est l'indispensable boussole. À EPV Horizons Savants, nous formons des esprits aiguisés, mais aussi des cœurs généreux et intègres, prêts à s'investir positivement dans la société.
          </p>
          <p>
            Notre charte éducative et comportementale s'articule autour de 5 valeurs cardinales clés partagées quotidiennement par l'équipe pédagogique et les élèves de Côte d'Ivoire :
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>
              <strong>L'Intégrité :</strong> Préférer l'honnêteté intellectuelle et morale, développer le sens des responsabilités et le respect de la parole donnée dès la maternelle.
            </li>
            <li>
              <strong>La Curiosité :</strong> Favoriser l'audace de poser des questions heuristiques, d'expérimenter scientifiquement par l'erreur positive sans crainte du jugement.
            </li>
            <li>
              <strong>Le Respect :</strong> Cultiver une bienveillance scrupuleuse d'autrui, de la nature ivoirienne (notre potager pédagogique) et des règles communautaires.
            </li>
            <li>
              <strong>La Persévérance :</strong> Intégrer l'effort personnel régulier comme un chemin valorisant de dépassement et d'accomplissement de soi.
            </li>
            <li>
              <strong>L'Humanisme :</strong> Ouvrir les yeux de nos futurs citoyens d'Abidjan sur le monde, par l'empathie, le bilinguisme précoce et l'appréciation des différences de cultures.
            </li>
          </ul>
          <p>
            Ces valeurs ne restent pas de vains mots écrits sur un mur d'école ; elles s'incarnent à travers des ateliers d'éloquence, des projets solidaires collectifs réguliers, et nos bilans de comportement individualisés remis mensuellement dans l'Espace Parent d'EPV Horizons Savants.
          </p>
        </div>
      )
    }
  ];

  const handleShare = () => {
    alert("Partage d'article : lien d'orientation d'excellence copié dans votre presse-papiers.");
  };

  /* ─── Derived data ──────────────────────────────────────────── */
  const allTags = ['__all__', ...Array.from(new Set(articles.map((a) => a.tag)))];

  const filtered = isAll ? articles : articles.filter((a) => a.tag === activeFilter);

  const [featured, ...rest] = filtered;

  /* ─── Render ────────────────────────────────────────────────── */
  return (
    <div className="relative min-h-[70vh] bg-gradient-to-br from-[#F4F8FF] to-white select-none">

      {/* ── Decorative blobs ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -left-16 w-72 h-72 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(74,144,217,0.22) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-14">

        {/* ════════════════════════════════════════
            HEADER
        ════════════════════════════════════════ */}
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Overline */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-8 bg-brand-gold rounded-full" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold font-sans">
              {fr ? "Chroniques de l'Élite Pédagogique" : 'Chronicles of Academic Excellence'}
            </span>
            <span className="h-px w-8 bg-brand-gold rounded-full" />
          </div>

          <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-brand-blue-deep tracking-tight uppercase leading-tight">
            Le Blog{' '}
            <span className="bg-brand-gold text-brand-blue-deep px-2 rounded-sm">
              d'EPV
            </span>{' '}
            Horizons Savants
          </h1>

          <p className="mt-4 text-xs md:text-sm text-brand-muted font-serif leading-relaxed max-w-xl mx-auto">
            {fr
              ? "Astuces parentales, insights d'apprentissage bilingue et actualités d'orientation d'Abidjan écrits par nos experts-éducateurs émérites."
              : "Parenting tips, bilingual learning insights and guidance news from Abidjan written by our distinguished educator-experts."}
          </p>

          {/* Gold underline */}
          <div className="mt-5 flex justify-center">
            <div className="h-1 w-16 bg-brand-gold rounded-full" />
          </div>
        </motion.div>

        {/* ════════════════════════════════════════
            ACTUALITÉS CMS (articles publiés via admin)
        ════════════════════════════════════════ */}
        {cmsArticles.length > 0 && (
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-brand-border/40" />
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-gold">{fr ? 'Dernières actualités' : 'Latest News'}</span>
              <div className="h-px flex-1 bg-brand-border/40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cmsArticles.map((a: any) => (
                <div key={a.id} className="bg-white rounded-xl border border-brand-border/40 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-blue-deep/8 text-brand-blue-deep px-2 py-0.5 rounded-full">{a.cat}</span>
                    <span className="text-[10px] text-brand-muted ml-auto">{new Date(a.date).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })}</span>
                  </div>
                  <h3 className="font-sans font-bold text-sm text-brand-blue-deep leading-snug">{a.titre}</h3>
                  <p className="text-[11px] text-brand-muted font-serif mt-1.5">Par {a.auteur} · {a.vues || 0} vues</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════
            CATEGORY FILTER BAR
        ════════════════════════════════════════ */}
        <motion.div
          className="flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {allTags.map((tag) => {
            const active = activeFilter === tag;
            const displayLabel = tag === '__all__' ? ALL : tag;
            const { bg, text } = tagColor(tag === '__all__' ? '' : tag);
            return (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={[
                  'px-4 py-1.5 rounded-full text-[11px] font-bold font-sans uppercase tracking-wide border transition-all duration-200 cursor-pointer',
                  active
                    ? 'bg-brand-blue-deep text-white border-brand-blue-deep shadow-md scale-105'
                    : `${bg} ${text} border-transparent hover:border-brand-blue-deep/20 hover:scale-105`,
                ].join(' ')}
              >
                {displayLabel}
              </button>
            );
          })}
        </motion.div>

        {/* ════════════════════════════════════════
            MAGAZINE GRID
        ════════════════════════════════════════ */}
        {filtered.length === 0 ? (
          <p className="text-center text-brand-muted font-serif py-16">
            {fr ? "Aucun article dans cette catégorie." : "No articles in this category."}
          </p>
        ) : (
          <motion.div
            key={activeFilter}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >

            {/* ── FEATURED CARD (col-span-2) ── */}
            {featured && (
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2"
              >
                <article
                  onClick={() => setActiveArticle(featured)}
                  className="group relative rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.12)] overflow-hidden cursor-pointer h-full min-h-[420px] md:min-h-[480px]"
                >
                  {/* Full-bleed image */}
                  <img
                    src={featured.img}
                    alt={featured.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />

                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D2E5C]/90 via-[#0D2E5C]/40 to-transparent" />

                  {/* Tag badge */}
                  <div className="absolute top-5 left-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-sans uppercase tracking-wide ${tagColor(featured.tag).bg} ${tagColor(featured.tag).text} backdrop-blur-sm`}>
                      {featured.tag}
                    </span>
                  </div>

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 space-y-3">
                    <div className="flex items-center gap-4 text-white/70 text-[10px] font-sans font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-brand-gold" />
                        {featured.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {featured.readTime}
                      </span>
                    </div>

                    <h2 className="font-serif font-bold text-xl md:text-3xl text-white leading-tight drop-shadow-lg">
                      {featured.title}
                    </h2>

                    <p className="text-white/75 text-xs md:text-sm font-serif leading-relaxed line-clamp-2">
                      {featured.summary}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <AuthorAvatar name={featured.author} size="sm" />
                        <span className="text-white/80 text-[11px] font-sans font-semibold">
                          {featured.author}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-brand-gold text-[11px] font-bold font-sans group-hover:gap-2 transition-all">
                        {fr ? "Lire l'article" : 'Read article'} <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </article>
              </motion.div>
            )}

            {/* ── SECONDARY CARDS (right column) ── */}
            <motion.div variants={containerVariants} className="flex flex-col gap-6">
              {rest.slice(0, 2).map((article) => {
                const { bg, text } = tagColor(article.tag);
                return (
                  <motion.div key={article.id} variants={itemVariants} className="flex-1">
                    <article
                      onClick={() => setActiveArticle(article)}
                      className="group rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white overflow-hidden cursor-pointer h-full flex flex-col"
                    >
                      {/* Image 16/9 */}
                      <div className="relative aspect-video w-full overflow-hidden shrink-0">
                        <img
                          src={article.img}
                          alt={article.title}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-sans uppercase tracking-wide ${bg} ${text}`}>
                          {article.tag}
                        </span>
                      </div>

                      {/* Text */}
                      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3 text-[10px] text-brand-muted font-sans">
                            <span className="flex items-center gap-1">
                              <Calendar size={10} className="text-brand-gold" />
                              {article.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {article.readTime}
                            </span>
                          </div>
                          <h3 className="font-sans font-bold text-sm text-brand-blue-deep leading-snug group-hover:text-brand-gold transition-colors duration-200">
                            {article.title}
                          </h3>
                          <p className="text-[11px] text-brand-muted font-serif leading-relaxed line-clamp-2">
                            {article.summary}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-brand-border/40">
                          <div className="flex items-center gap-1.5">
                            <AuthorAvatar name={article.author} size="sm" />
                            <span className="text-[10px] text-brand-dark/80 font-sans font-semibold truncate max-w-[120px]">
                              {article.author}
                            </span>
                          </div>
                          <span className="flex items-center gap-0.5 text-brand-blue-deep group-hover:text-brand-gold text-[10px] font-bold font-sans transition-colors">
                            {fr ? 'Lire' : 'Read'} <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    </article>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* ── BOTTOM ROW — remaining articles ── */}
            {rest.slice(2).map((article) => {
              const { bg, text } = tagColor(article.tag);
              return (
                <motion.div key={article.id} variants={itemVariants}>
                  <article
                    onClick={() => setActiveArticle(article)}
                    className="group rounded-3xl shadow-[0_4px_30px_rgba(13,46,92,0.08)] bg-white overflow-hidden cursor-pointer flex flex-col h-full"
                  >
                    <div className="relative aspect-video w-full overflow-hidden shrink-0">
                      <img
                        src={article.img}
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-sans uppercase tracking-wide ${bg} ${text}`}>
                        {article.tag}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between gap-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3 text-[10px] text-brand-muted font-sans">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} className="text-brand-gold" />
                            {article.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {article.readTime}
                          </span>
                        </div>
                        <h3 className="font-sans font-bold text-sm text-brand-blue-deep leading-snug group-hover:text-brand-gold transition-colors duration-200">
                          {article.title}
                        </h3>
                        <p className="text-[11px] text-brand-muted font-serif leading-relaxed line-clamp-2">
                          {article.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-brand-border/40">
                        <div className="flex items-center gap-1.5">
                          <AuthorAvatar name={article.author} size="sm" />
                          <span className="text-[10px] text-brand-dark/80 font-sans font-semibold truncate max-w-[140px]">
                            {article.author}
                          </span>
                        </div>
                        <span className="flex items-center gap-0.5 text-brand-blue-deep group-hover:text-brand-gold text-[10px] font-bold font-sans transition-colors">
                          Lire <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </article>
                </motion.div>
              );
            })}

          </motion.div>
        )}

        {/* ════════════════════════════════════════
            ARTICLE MODAL
        ════════════════════════════════════════ */}
        {activeArticle && (
          <Modal
            isOpen={!!activeArticle}
            onClose={() => setActiveArticle(null)}
            title={activeArticle.title}
          >
            {/* Modal inner — scrollable body */}
            <div className="flex flex-col gap-5 max-h-[72vh] overflow-y-auto pr-1 no-scrollbar">

              {/* Hero image */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shrink-0 shadow-md">
                <img
                  src={activeArticle.img}
                  alt={activeArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {/* overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D2E5C]/60 to-transparent" />
                {/* tag */}
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-bold font-sans uppercase tracking-wide ${tagColor(activeArticle.tag).bg} ${tagColor(activeArticle.tag).text} backdrop-blur-sm`}>
                  {activeArticle.tag}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-brand-muted font-sans font-semibold pb-3 border-b border-brand-border/40">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-brand-gold" />
                  {activeArticle.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-brand-blue-medium" />
                  {activeArticle.readTime} {fr ? 'de lecture' : 'read'}
                </span>
                <span className="flex items-center gap-2 ml-auto">
                  <AuthorAvatar name={activeArticle.author} size="sm" />
                  <strong className="text-brand-dark">{activeArticle.author}</strong>
                </span>
              </div>

              {/* Article content */}
              {activeArticle.content}

              {/* Footer */}
              <div className="shrink-0 border-t border-brand-border/40 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-[10px] text-brand-muted italic font-serif leading-relaxed">
                  EPV Horizons Savants d'Abidjan — Éveil culturel &amp; bilingue
                </span>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    className="px-3 py-1.5 text-[10px] flex items-center gap-1"
                    onClick={handleShare}
                  >
                    <Share2 size={11} />
                    Partager
                  </Button>
                  <Button
                    variant="primary"
                    className="px-5 py-1.5 text-[10px]"
                    onClick={() => setActiveArticle(null)}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
};
