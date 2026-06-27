Application web complète pour la gestion de l'école primaire et maternelle **EPV Horizons Savants** (Bingerville, Abidjan).

---

## Stack technique

- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend** : Node.js + Express (server.ts compilé via esbuild)
- **Base de données** : PostgreSQL (Neon)
- **Stockage fichiers** : Cloudflare R2 (compatible S3)
- **Déploiement** : Vercel

---

## Fonctionnalités

### Site public
- Page d'accueil, programmes maternelle & primaire
- Processus d'admissions avec formulaire de pré-inscription
- FAQ, blog, galerie photos, tenues scolaires
- Support bilingue FR / EN

### Espace Parent
- Tableau de bord élève (notes, assiduité, devoirs)
- Parcours académique & bulletins PDF
- Vie scolaire (cantine, agenda, transport, santé)
- Finances & facturation trimestrielle
- Messagerie sécurisée avec l'administration
- Prise de rendez-vous en ligne
- Gestion du dossier de candidature

### Espace Admin
- Gestion des dossiers prospects (Kanban + tableaux Excel)
- Suivi des pré-inscriptions et inscriptions
- Liste des parents avec fiches enfants
- Bulletins scolaires (génération PDF)
- Gestion de la scolarité et des paiements
- Gestion de contenu (logo, slogan, réseaux sociaux, documents)
- Export CSV

---

## Installation locale

```bash
# Cloner le repo
git clone https://github.com/horizonssavants/epv-horizons.git
cd epv-horizons

# Installer les dépendances
npm install

# Variables d'environnement
cp .env.example .env
# Remplir DATABASE_URL, JWT_SECRET, R2_*, etc.

# Lancer en développement
npm run dev        # Frontend Vite
npm run server     # Backend Express
Variables d'environnement requises

DATABASE_URL=
JWT_SECRET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
Déploiement

vercel --prod
Structure du projet

src/
├── components/       # Composants UI réutilisables
├── views/            # Pages (AdminDashboard, EspaceParent, Admissions…)
├── lib/              # Auth, i18n, contextes
└── types.ts          # Types TypeScript partagés
server.ts             # API Express (routes, auth JWT, PostgreSQL)
Licence
Projet privé — © 2026 EPV Horizons Savants. Tous droits réservés.
