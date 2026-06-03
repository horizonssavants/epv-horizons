/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import os from "os";
import { createServer as createViteServer } from "vite";
import pg from "pg";
import fs from "fs";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { StatutProspect, StatutRendezVous, Prospect, RendezVous, Parrainage, SectionPlace, NotificationLog } from "./src/types.js";

// ─── Neon HTTP driver — HTTPS port 443, fonctionne partout ───────────────────

const { Pool } = pg;

// Connexion via le pooler Neon (POOL_URL) ou direct (DATABASE_URL)
// Le pooler gère l'auto-réveil et est plus résilient
const pool = new Pool({
  connectionString: process.env.POOL_URL || process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,  // 5s max par tentative
  idleTimeoutMillis: 20000,
  max: 3,
});

// Wrapper avec retry automatique (Neon free-tier se réveille en ~3-5s)
async function q(text: string, params?: any[]): Promise<{ rows: any[] }> {
  const retryable = ['ETIMEDOUT','ECONNRESET','ECONNREFUSED','57P01','08006','08001'];
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      return await pool.query(text, params);
    } catch (err: any) {
      const isRetryable = retryable.includes(err.code) || err.message?.includes('timeout');
      if (attempt === 4 || !isRetryable) throw err;
      console.warn(`  DB retry ${attempt}/3 (${err.code || err.message})...`);
      await new Promise(r => setTimeout(r, attempt * 1500)); // 1.5s, 3s, 4.5s
    }
  }
  throw new Error('DB inaccessible après 4 tentatives');
}

// ─── JWT local (HS256) — aucune dépendance réseau externe ───────────────────

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'epv-dev-secret-2026'
);

async function signJWT(payload: Record<string, any>, expiresIn = '24h'): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

async function verifyJWT(token: string): Promise<any> {
  // 1. Essayer JWT local HS256
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {}
  // 2. Fallback JWKS Neon Auth (si disponible)
  if (process.env.NEON_JWKS_URL) {
    try {
      const JWKS = createRemoteJWKSet(new URL(process.env.NEON_JWKS_URL));
      const { payload } = await jwtVerify(token, JWKS);
      return payload;
    } catch {}
  }
  throw new Error('Token invalide ou expiré.');
}

// Extrait le token Bearer du header Authorization
function extractBearer(req: any): string | null {
  const auth: string = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

// ─── Hachage mot de passe (crypto.scrypt — natif Node, 0 dépendance) ─────────

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, hash) => {
      if (err) reject(err);
      else resolve(`${salt}:${hash.toString('hex')}`);
    });
  });
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, derived) => {
      if (err) reject(err);
      else {
        try { resolve(timingSafeEqual(Buffer.from(hash, 'hex'), derived)); }
        catch { resolve(false); }
      }
    });
  });
}

// ── Store OTP en mémoire ─────────────────────────────────────────────────────
interface OtpEntry {
  otp: string;
  prospectId: string;
  name: string;
  expiresAt: number;
  attempts: number;
}
const otpStore = new Map<string, OtpEntry>();
// Nettoyage automatique toutes les 5 min
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of otpStore) if (v.expiresAt < now) otpStore.delete(k);
}, 5 * 60 * 1000);

// Middleware — toute route protégée (parent ou admin)
async function requireAuth(req: any, res: any, next: any) {
  const token = extractBearer(req);
  if (!token) return res.status(401).json({ error: 'Token manquant.' });
  try {
    req.neonUser = await verifyJWT(token);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
}

// Middleware admin — vérifie l'email contre ADMIN_EMAILS
async function requireAdmin(req: any, res: any, next: any) {
  const token = extractBearer(req);
  if (!token) return res.status(401).json({ error: 'Token manquant.' });
  try {
    const payload = await verifyJWT(token);
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@horizonssavants.com')
      .split(',').map(e => e.trim().toLowerCase());
    if (!adminEmails.includes((payload.email as string || '').toLowerCase())) {
      return res.status(403).json({ error: 'Accès administrateur requis.' });
    }
    req.neonUser = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
}

// ─── Helpers row ↔ object ───────────────────────────────────────────────────

const toSnake = (s: string) => s.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`);
const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, l) => l.toUpperCase());

function rowToObj(row: any): any {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k === 'usr' ? 'user' : toCamel(k),
      v instanceof Date ? v.toISOString() : v,
    ])
  );
}
const rowsToObjs = (rows: any[]) => rows.map(rowToObj);

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Build INSERT from a JS object (camelCase keys → snake_case columns)
function buildInsert(table: string, obj: Record<string, any>) {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
  const cols = entries.map(([k]) => `"${k === 'user' ? 'usr' : toSnake(k)}"`).join(', ');
  const vals = entries.map(([, v]) => v);
  const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
  return { text: `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`, values: vals };
}

// Build UPDATE (skips id/createdAt)
function buildUpdate(table: string, id: string, obj: Record<string, any>) {
  const entries = Object.entries(obj).filter(([k, v]) => v !== undefined && k !== 'id' && k !== 'createdAt');
  const sets = entries.map(([k], i) => `"${k === 'user' ? 'usr' : toSnake(k)}" = $${i + 1}`).join(', ');
  const vals = [...entries.map(([, v]) => v), id];
  return {
    text: `UPDATE ${table} SET ${sets}, updated_at = NOW() WHERE id = $${vals.length} RETURNING *`,
    values: vals,
  };
}

// ─── Schema init + seed ──────────────────────────────────────────────────────

async function initDB() {
  const schema = fs.readFileSync(new URL('./db/schema.sql', import.meta.url), 'utf-8');
  await q(schema);

  // Seed places (capacités max uniquement — compteurs calculés dynamiquement)
  const capacites = [
    { s:'PS',  max:15 },{ s:'MS',  max:15 },{ s:'GS',  max:15 },
    { s:'CP',  max:20 },{ s:'CE1', max:20 },{ s:'CE2', max:20 },
    { s:'CM1', max:20 },{ s:'CM2', max:20 },
  ];
  for (const c of capacites) {
    await q('INSERT INTO places (section,capacite_max,inscrits_confirmes,pre_inscrits) VALUES ($1,$2,0,0) ON CONFLICT DO NOTHING',
      [c.s, c.max]);
  }

  // Tarifs dans configuration
  await q(`INSERT INTO configuration (cle, valeur, description) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [
    'tarifs',
    JSON.stringify({ PS:1350000, MS:1350000, GS:1350000, CP:1650000, CE1:1650000, CE2:1650000, CM1:1880000, CM2:1880000 }),
    'Tarifs annuels de scolarité par section (FCFA)',
  ]);

  // Frais d'inscription
  await q(`INSERT INTO configuration (cle, valeur, description) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [
    'frais_inscription', JSON.stringify(150000), 'Frais d\'inscription non remboursables (FCFA)',
  ]);

  // Reduction parrainage
  await q(`INSERT INTO configuration (cle, valeur, description) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [
    'reduction_parrainage', JSON.stringify(10), 'Réduction parrainage en % par filleul inscrit',
  ]);

  // Informations de l'établissement
  await q(`INSERT INTO configuration (cle, valeur, description) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [
    'etablissement', JSON.stringify({
      nom: 'EPV Horizons Savants',
      type: 'Maternelle & Primaire privée bilingue',
      localisation: 'Bingerville Mtn Kro, Abidjan',
      agrement: 'MENA N° 2026/SAG',
      telephone: '07 78 98 14 56 / 05 85 41 51 51',
      email: 'contact@horizonssavants.com',
      rentree: '1er Septembre 2026',
      effectifMax: '15 élèves/classe (maternelle)',
      directeur: 'Directeur Académique EPV',
    }),
    'Informations générales de l\'établissement',
  ]);

  // Liste des matières
  await q(`INSERT INTO configuration (cle, valeur, description) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [
    'matieres', JSON.stringify([
      'Français', 'Mathématiques', 'Anglais', 'Sciences', 'Éducation civique', 'Arts plastiques', 'EPS',
    ]),
    'Liste des matières scolaires',
  ]);

  // Checklist documents par section
  await q(`INSERT INTO configuration (cle, valeur, description) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [
    'checklist', JSON.stringify({
      PS:  ['Extrait de naissance original', 'Carnet de vaccination à jour', '8 photos d\'identité récentes (4×4)'],
      MS:  ['Extrait de naissance original', 'Carnet de vaccination à jour', '8 photos d\'identité récentes (4×4)'],
      GS:  ['Extrait de naissance original', 'Carnet de vaccination à jour', '8 photos d\'identité récentes (4×4)'],
      CP:  ['Extrait de naissance original', '4 photos d\'identité récentes (4×4)', 'Bulletins de l\'année précédente'],
      CE1: ['Extrait de naissance original', '4 photos d\'identité récentes (4×4)', 'Bulletins de l\'année précédente'],
      CE2: ['Extrait de naissance original', '4 photos d\'identité récentes (4×4)', 'Bulletins de l\'année précédente'],
      CM1: ['Extrait de naissance original', '4 photos d\'identité récentes (4×4)', 'Bulletins de l\'année précédente'],
      CM2: ['Extrait de naissance original', '4 photos d\'identité récentes (4×4)', 'Bulletins de l\'année précédente', 'Droit d\'examen : 3 000 FCFA'],
    }),
    'Documents requis par section pour l\'inscription',
  ]);

  // Grille tarifaire affichée (pour la page Configuration admin)
  await q(`INSERT INTO configuration (cle, valeur, description) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [
    'tarifs_display', JSON.stringify([
      { section: 'Maternelle (PS, MS, GS)',         inscription: '150 000', scolarite: '1 200 000', fournitures: '120 000', total: '1 470 000' },
      { section: 'Primaire Cycle 1 (CP, CE1, CE2)', inscription: '150 000', scolarite: '1 500 000', fournitures: '150 000', total: '1 800 000' },
      { section: 'Primaire Cycle 2 (CM1, CM2)',     inscription: '150 000', scolarite: '1 700 000', fournitures: '180 000', total: '2 030 000' },
    ]),
    'Grille tarifaire affichée sur la page de configuration',
  ]);

  // Helper seed conditionnel par table
  const isEmpty = async (table: string) => {
    const { rows } = await q(`SELECT COUNT(*) FROM ${table}`);
    return parseInt(rows[0].count) === 0;
  };

  // ─── Seed prospects si vide ───────────────────────────────────────────────
  if (!await isEmpty('prospects')) {
    // Seeder quand même les données opérationnelles si elles sont vides
    await seedOperational(isEmpty);
    return;
  }

  const p1: Prospect = {
    id: 'prospect-1', createdAt: '2026-05-10T10:00:00Z', updatedAt: '2026-05-15T12:00:00Z',
    prenomEnfant: 'Koffi', nomEnfant: 'Aka', dateNaissance: '2021-03-12', sectionVisee: 'GS',
    prenomParent: 'Jean-Baptiste', nomParent: 'Aka', lienParente: 'Père',
    telephone: '+2250707070707', email: 'jb.aka@gmail.com', commune: 'Cocody',
    source: 'Réseaux sociaux', codeParrainagePersonnel: 'EPV-AKA01',
    statut: StatutProspect.PRE_INSCRIT, notesAdmin: 'Famille motivée. S\'intéresse particulièrement au bilinguisme.',
  };
  const p2: Prospect = {
    id: 'prospect-2', createdAt: '2026-05-18T14:30:00Z', updatedAt: '2026-05-20T16:00:00Z',
    prenomEnfant: 'Awa', nomEnfant: 'Koné', dateNaissance: '2018-09-05', sectionVisee: 'CP',
    prenomParent: 'Mariam', nomParent: 'Koné', lienParente: 'Mère',
    telephone: '+2250505123456', email: 'mariam.kone@hotmail.com', commune: 'Marcory',
    source: 'Bouche-à-oreille', codeParrainagePersonnel: 'EPV-KONE01',
    statut: StatutProspect.INSCRIT, notesAdmin: 'Test d\'évaluation passé avec succès.',
  };
  const p3: Prospect = {
    id: 'prospect-3', createdAt: '2026-05-25T09:15:00Z', updatedAt: '2026-05-25T11:00:00Z',
    prenomEnfant: 'Marc-Aurèle', nomEnfant: 'N\'Guessan', dateNaissance: '2023-01-20', sectionVisee: 'PS',
    prenomParent: 'Amélie', nomParent: 'N\'Guessan', lienParente: 'Mère',
    telephone: '+2250102030405', email: 'amelie.nguessan@live.fr', commune: 'Bingerville',
    source: 'Flyer', codeParrainagePersonnel: 'EPV-NGUESSAN01',
    statut: StatutProspect.PROSPECT, notesAdmin: 'Contact établi par téléphone.',
  };
  const p4: Prospect = {
    id: 'prospect-4', createdAt: '2026-05-28T11:00:00Z', updatedAt: '2026-05-28T11:05:00Z',
    prenomEnfant: 'Emeka', nomEnfant: 'Diop', dateNaissance: '2020-05-14', sectionVisee: 'MS',
    prenomParent: 'Cheikh', nomParent: 'Diop', lienParente: 'Père',
    telephone: '+2250789888777', email: 'cheikh.diop@yahoo.fr', commune: 'Plateau',
    source: 'Affiche', codeParrainagePersonnel: 'EPV-DIOP01',
    statut: StatutProspect.PROSPECT, notesAdmin: 'Visite des locaux planifiée.',
  };

  for (const p of [p1, p2, p3, p4]) {
    await q(
      `INSERT INTO prospects (id,created_at,updated_at,prenom_enfant,nom_enfant,date_naissance,section_visee,
        prenom_parent,nom_parent,lien_parente,telephone,email,commune,source,
        code_parrainage_utilise,code_parrainage_personnel,statut,notes_admin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       ON CONFLICT DO NOTHING`,
      [p.id, p.createdAt, p.updatedAt, p.prenomEnfant, p.nomEnfant, p.dateNaissance, p.sectionVisee,
       p.prenomParent, p.nomParent, p.lienParente, p.telephone, p.email, p.commune, p.source,
       p.codeParrainageUtilise ?? null, p.codeParrainagePersonnel, p.statut, p.notesAdmin ?? null]
    );
  }

  const rdvs: RendezVous[] = [
    {
      id: 'rdv-1', prospectId: 'prospect-3', prenomParent: 'Amélie', nomParent: 'N\'Guessan',
      telephone: '+2250102030405', email: 'amelie.nguessan@live.fr',
      prenomEnfant: 'Marc-Aurèle', sectionEnfant: 'PS',
      dateHeure: '2026-06-05T10:00:00Z', typeRdv: 'Visite des locaux',
      statut: StatutRendezVous.CONFIRME, notes: 'Accompagnée du grand-père.', createdAt: '2026-05-25T11:00:00Z',
    },
    {
      id: 'rdv-2', prospectId: 'prospect-4', prenomParent: 'Cheikh', nomParent: 'Diop',
      telephone: '+2250789888777', email: 'cheikh.diop@yahoo.fr',
      prenomEnfant: 'Emeka', sectionEnfant: 'MS',
      dateHeure: '2026-06-08T15:00:00Z', typeRdv: 'Entretien pédagogique',
      statut: StatutRendezVous.PLANIFIE, notes: 'Discuter de l\'adaptation linguistique.', createdAt: '2026-05-28T11:05:00Z',
    },
  ];
  for (const r of rdvs) {
    await q(
      `INSERT INTO rendezvous (id,prospect_id,prenom_parent,nom_parent,telephone,email,prenom_enfant,section_enfant,date_heure,type_rdv,statut,notes,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT DO NOTHING`,
      [r.id, r.prospectId ?? null, r.prenomParent, r.nomParent, r.telephone, r.email,
       r.prenomEnfant ?? null, r.sectionEnfant ?? null, r.dateHeure, r.typeRdv, r.statut, r.notes ?? null, r.createdAt]
    );
  }

  await q(
    `INSERT INTO parrainages (id,code_parrain,prospect_id_parrain,prospect_id_filleul,statut,reduction_appliquee,created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
    ['parrainage-1', 'EPV-AKA01', 'prospect-1', 'prospect-3', 'valide', 10, '2026-05-25T09:15:00Z']
  );

  await q(
    `INSERT INTO notifications (id,type,timestamp,destinataire,sujet,contenu)
     VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
    ['notif-1', 'email', '2026-05-25T09:15:00Z', 'amelie.nguessan@live.fr',
     'EPV — Confirmation de pré-inscription',
     'Bonjour Amélie, votre pré-inscription est enregistrée. Code parrainage : EPV-NGUESSAN01.']
  );

  await seedOperational(isEmpty);
  console.log('  DB: données initiales et opérationnelles insérées.');
}

// Seed séparé pour données opérationnelles — peut tourner indépendamment
async function seedOperational(isEmpty: (t: string) => Promise<boolean>) {
  // ── Paiements initiaux pour prospect-2 (inscrit) ──
  if (await isEmpty('paiements')) {
  const annuelCP = 1650000;
  const trimCP = Math.round(annuelCP / 3);
  for (const [id, trim, mnt, date] of [
    ['pay-1','T1', trimCP,       '2025-09-05'],
    ['pay-2','T2', trimCP,       '2026-01-08'],
    ['pay-3','INSCRIPTION', 150000, '2025-09-01'],
  ]) {
    await q(`INSERT INTO paiements (id,prospect_id,trimestre,montant,date_paiement,mode_paiement,statut)
             VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
      [id, 'prospect-2', trim, mnt, date, 'Espèces', 'validé']);
  }
  }

  // ── Cantine — menu de la semaine ──
  if (await isEmpty('cantine')) {
    for (const [id,jour,plat,accomp,dessert] of [
      ['cant-1','Lundi',    'Riz sauce arachide + poulet grillé', 'Alloco + plantain', 'Yaourt nature'],
      ['cant-2','Mardi',    'Attiéké poisson braisé',             'Salade de légumes', 'Jus goyave'],
      ['cant-3','Mercredi', 'Riz sauce tomate + bœuf',            'Haricots verts',    'Banane'],
      ['cant-4','Jeudi',    'Foutou + sauce graine de palme',     'Crudités',          'Orange'],
      ['cant-5','Vendredi', 'Soupe de poisson + semoule',         'Légumes sautés',    'Ananas'],
    ]) await q(`INSERT INTO cantine (id,jour,plat,accomp,dessert,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) ON CONFLICT DO NOTHING`,
        [id, jour, plat, accomp, dessert]);
  }

  // ── Événements scolaires ──
  if (await isEmpty('evenements')) {
    for (const [id,titre,date,heure,lieu,type] of [
      ['evt-1','Réunion parents d\'élèves — CP/CE1','2026-06-10','17:30','Salle de réunion B','Réunion'],
      ['evt-2','Sortie pédagogique — Zoo d\'Abidjan','2026-06-14','08:00','Départ école','Sortie'],
      ['evt-3','Évaluation bilan T3 — Maternelle','2026-06-17','08:00','Classes','Examen'],
      ['evt-4','Fête de l\'école — Fin d\'année','2026-06-27','09:00','Cour principale','Fête'],
      ['evt-5','Cérémonie de remise des bulletins','2026-07-03','10:00','Amphithéâtre EPV','Cérémonie'],
      ['evt-6','Journée portes ouvertes — Rentrée 2026','2026-07-12','09:00','Campus EPV','Info'],
    ]) await q(`INSERT INTO evenements (id,titre,date,heure,lieu,type,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW()) ON CONFLICT DO NOTHING`,
        [id, titre, date, heure, lieu, type]);
  }

  // ── Notes pour prospect-2 ──
  if (await isEmpty('notes')) {
    for (const [id,pid,mat,t1,t2,coef] of [
      ['note-1','prospect-2','Français',14.5,15.5,4],
      ['note-2','prospect-2','Mathématiques',16.0,17.0,4],
      ['note-3','prospect-2','Anglais',13.0,14.5,3],
      ['note-4','prospect-2','Sciences',15.0,15.5,2],
      ['note-5','prospect-2','Éd. civique',17.5,18.0,1],
      ['note-6','prospect-2','Arts plastiques',14.0,14.0,1],
      ['note-7','prospect-2','EPS',16.0,17.0,1],
    ]) await q(`INSERT INTO notes (id,prospect_id,matiere,t1,t2,coef,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW()) ON CONFLICT DO NOTHING`,
        [id, pid, mat, t1, t2, coef]);
  }

  // ── Devoirs pour prospect-2 ──
  if (await isEmpty('devoirs')) {
    for (const [id,pid,mat,sujet,rendu,statut] of [
      ['dev-1','prospect-2','Français','Lire et résumer pages 34-36 du livre de lecture','Demain','pending'],
      ['dev-2','prospect-2','Mathématiques','Exercices 12 à 18 page 52','Vendredi','pending'],
      ['dev-3','prospect-2','Anglais','Apprendre le vocabulaire des animaux','Lundi','done'],
      ['dev-4','prospect-2','Sciences','Dessiner le cycle de l\'eau','Jeudi','pending'],
    ]) await q(`INSERT INTO devoirs (id,prospect_id,matiere,sujet,rendu,statut,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW()) ON CONFLICT DO NOTHING`,
        [id, pid, mat, sujet, rendu, statut]);
  }

  // ── Assiduité ──
  if (await isEmpty('assiduite')) {
    for (const [id,pid,date,type,motif,duree] of [
      ['ass-1','prospect-2','2026-02-14','Absence','Maladie (certificat médical)','1 jour'],
      ['ass-2','prospect-2','2026-03-08','Retard','Embouteillages','15 min'],
    ]) await q(`INSERT INTO assiduite (id,prospect_id,date,type,motif,duree,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW()) ON CONFLICT DO NOTHING`,
        [id, pid, date, type, motif, duree]);
  }

  // ── Santé + bilinguisme pour prospect-2 ──
  if (await isEmpty('sante_eleve')) {
    await q(`INSERT INTO sante_eleve (id,prospect_id,groupe_sanguin,allergies,vaccinations,medecin,infirmerie,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) ON CONFLICT DO NOTHING`,
      ['sante-2','prospect-2','A+','Aucune connue','À jour au 15/09/2025','Dr. Kouassi A. — Cocody, Abidjan',
       JSON.stringify([{ date:'01 juin 2026', heure:'10:45', description:'Légère douleur abdominale. Repos 15 min. Retour en classe.' }])]);
  }

  if (await isEmpty('bilinguisme')) {
    await q(`INSERT INTO bilinguisme (id,prospect_id,niveau,commentaire,competences,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) ON CONFLICT DO NOTHING`,
      ['bil-2','prospect-2','A2+',
       'Awa présente d\'excellentes dispositions en compréhension orale et vocabulaire.',
       JSON.stringify([
         { competence:'Compréhension orale', niveau:82 }, { competence:'Expression orale', niveau:71 },
         { competence:'Vocabulaire', niveau:88 },          { competence:'Compréhension écrite', niveau:79 },
         { competence:'Grammaire anglaise', niveau:65 },
       ])]);
  }

  // ── Message de bienvenue pour prospect-2 ──
  if (await isEmpty('messages')) {
    await q(`INSERT INTO messages (id,prospect_id,de,date,lu,contenu,created_at,updated_at) VALUES ($1,$2,$3,NOW(),$4,$5,NOW(),NOW()) ON CONFLICT DO NOTHING`,
      ['msg-welcome','prospect-2','Direction EPV Horizons Savants', false,
       'Bienvenue ! L\'inscription d\'Awa Koné pour le CP est confirmée. Consultez ses notes, devoirs et progression bilingue depuis cet espace.']);
  }

  // ── Documents téléchargeables ──
  if (await isEmpty('documents')) {
    for (const [id,titre,fichier,cat,ordre] of [
      ['doc-1','Règlement intérieur & Charte 2025/2026',      'reglement_interieur_2026.pdf', 'Réglementaire', 1],
      ['doc-2','Projet pédagogique EPV — Programme bilingue', 'projet_pedagogique.pdf',       'Réglementaire', 2],
      ['doc-3','Certificat de scolarité 2025/2026',           'certificat_scolarite.pdf',     'Administratif', 3],
      ['doc-4','Calendrier académique 2025/2026',             'calendrier_academique.pdf',    'Administratif', 4],
      ['doc-5','Liste des fournitures — Niveau CP',           'fournitures_cp.pdf',           'Scolaire',      5],
      ['doc-6','Fiche médicale & Protocole d\'urgence',       'fiche_medicale.pdf',           'Médical',       6],
    ]) await q(`INSERT INTO documents (id,titre,fichier,cat,actif,ordre,created_at,updated_at) VALUES ($1,$2,$3,$4,true,$5,NOW(),NOW()) ON CONFLICT DO NOTHING`,
        [id, titre, fichier, cat, ordre]);
  }

  // ── Comptes utilisateurs ─────────────────────────────────────────────────────
  // Toujours sync : les admins depuis .env, les parents depuis prospects existants

  // Admins depuis ADMIN_EMAILS / ADMIN_PASSWORD
  const adminEmails = (process.env.ADMIN_EMAILS || 'admin@horizonssavants.com')
    .split(',').map(e => e.trim().toLowerCase());
  const adminPwd = process.env.ADMIN_PASSWORD || 'admin2026';
  const { rows: cfgRows } = await q(`SELECT valeur FROM configuration WHERE cle = 'etablissement'`);
  const etab = cfgRows[0]?.valeur || {};
  for (const adminEmail of adminEmails) {
    const { rows: existing } = await q('SELECT id FROM users WHERE LOWER(email) = $1', [adminEmail]);
    if (existing.length === 0) {
      const hash = await hashPassword(adminPwd);
      await q(
        `INSERT INTO users (id,email,password_hash,role,nom,actif,created_at,updated_at)
         VALUES ($1,$2,$3,'admin',$4,true,NOW(),NOW()) ON CONFLICT DO NOTHING`,
        [uid('user'), adminEmail, hash, etab.directeur || 'Directeur EPV']
      );
    }
  }

  // Parents depuis prospects (email + téléphone haché)
  const { rows: allProspects } = await q('SELECT id,email,telephone,prenom_parent,nom_parent FROM prospects');
  for (const p of allProspects) {
    const { rows: existing } = await q('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [p.email]);
    if (existing.length === 0) {
      const phone = p.telephone?.replace(/[\s+\-().]/g, '') || '';
      const hash  = await hashPassword(phone);
      await q(
        `INSERT INTO users (id,email,password_hash,role,nom,prospect_id,actif,created_at,updated_at)
         VALUES ($1,$2,$3,'parent',$4,$5,true,NOW(),NOW()) ON CONFLICT DO NOTHING`,
        [uid('user'), p.email.toLowerCase(), hash, `${p.prenom_parent} ${p.nom_parent}`, p.id]
      );
    }
  }

  console.log('  DB: données opérationnelles seedées.');
}

// ─── Notifications ───────────────────────────────────────────────────────────

async function sendResendEmail(to: string, subject: string, content: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes('MY_') || !apiKey.trim()) {
    console.log(`[Email Simulation] To: ${to} | Subject: ${subject}`);
    return false;
  }
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const html = content.includes('<p>') ? content : `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px"><h2 style="color:#0D2E5C">EPV Horizons Savants</h2><div style="line-height:1.6;white-space:pre-line">${content}</div></div>`;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ from: `EPV Horizons Savants <${fromEmail}>`, to: [to], subject, html, text: content.replace(/<[^>]*>/g, '') }),
    });
    return r.ok;
  } catch { return false; }
}

async function sendWhatsAppNotification(to: string, content: string): Promise<boolean> {
  const metaToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const clean = to.trim().replace(/\s+/g, '');
  if (metaToken && metaPhoneId) {
    try {
      const r = await fetch(`https://graph.facebook.com/v17.0/${metaPhoneId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${metaToken}` },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: clean.replace('+', ''), type: 'text', text: { body: content } }),
      });
      if (r.ok) return true;
    } catch {}
  }
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  if (twilioSid && twilioAuth) {
    try {
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64')}` },
        body: new URLSearchParams({ To: `whatsapp:${clean}`, From: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886', Body: content }),
      });
      if (r.ok) return true;
    } catch {}
  }
  console.log(`[WhatsApp Simulation] To: ${to}`);
  return false;
}

async function logNotification(type: 'email' | 'whatsapp', destinataire: string, contenu: string, sujet?: string) {
  const id = uid('notif');
  await q(
    'INSERT INTO notifications (id, type, timestamp, destinataire, sujet, contenu) VALUES ($1,$2,NOW(),$3,$4,$5)',
    [id, type, destinataire, sujet ?? null, contenu]
  );
  if (type === 'email') sendResendEmail(destinataire, sujet || 'Notification EPV', contenu).catch(console.error);
  else sendWhatsAppNotification(destinataire, contenu).catch(console.error);
}

async function logAction(action: string, module: string, detail: string) {
  await q(
    'INSERT INTO logs (id, ts, usr, action, module, detail) VALUES ($1, NOW(), $2, $3, $4, $5)',
    [uid('log'), 'admin@epv.ci', action, module, detail]
  ).catch(console.error);
}

// ─── Express app ─────────────────────────────────────────────────────────────

const app = express();
const PORT = 3000;

// CORS — autoriser localhost, réseau local (192.168.x, 10.x) et APP_URL
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl, server-to-server
    const ok =
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.') ||
      /^http:\/\/10\./.test(origin) ||
      /^http:\/\/192\.168\./.test(origin) ||
      /^http:\/\/172\.(1[6-9]|2\d|3[01])\./.test(origin) ||
      (process.env.APP_URL ? origin.startsWith(process.env.APP_URL) : false);
    ok ? cb(null, true) : cb(new Error(`CORS bloqué: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ── Auth — JWT HS256, mots de passe hachés en BD ─────────────────────────────

// Normalise un numéro de téléphone ivoirien en plusieurs formes candidates
function phoneVariants(raw: string): string[] {
  const clean = raw.replace(/[\s+\-().]/g, '');
  const variants = new Set([raw, clean]);
  // avec indicatif 225
  if (clean.startsWith('225')) {
    variants.add(clean);
    variants.add(clean.slice(3));         // sans indicatif
  } else {
    variants.add('225' + clean);          // avec indicatif
  }
  // si commence par 0 (format local ivoirien 0X XX XX XX XX)
  if (clean.startsWith('0')) {
    variants.add('225' + clean);          // 225 + 0XXXXXXXXX
    variants.add('225' + clean.slice(1)); // 225 + XXXXXXXXX
  }
  return [...variants];
}

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });

  try {
    // ── 1. Chercher dans la table users ──────────────────────────────────────
    const { rows } = await q(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND actif = true', [email]
    );

    if (rows.length > 0) {
      const user = rowToObj(rows[0]);
      const candidates = phoneVariants(password);
      let valid = false;
      for (const pwd of candidates) {
        if (await verifyPassword(pwd, user.passwordHash)) { valid = true; break; }
      }

      if (valid) {
        await q('UPDATE users SET derniere_cnx = NOW(), updated_at = NOW() WHERE id = $1', [user.id]);
        const token = await signJWT({
          email: user.email, role: user.role, sub: user.email,
          ...(user.prospectId ? { prospectId: user.prospectId } : {}),
        });
        if (user.role === 'admin') {
          return res.json({ token, user: { email: user.email, name: user.nom, role: 'admin' } });
        }
        const { rows: prows } = await q('SELECT * FROM prospects WHERE id = $1', [user.prospectId]);
        const prospect = prows.length > 0 ? rowToObj(prows[0]) : null;
        return res.json({ token, user: { email: user.email, name: user.nom, role: 'parent' }, prospect });
      }
      // hash ne correspond pas → fallback prospect si c'est un parent
      if (user.role === 'admin') {
        return res.status(401).json({ error: 'Mot de passe incorrect.' });
      }
    }

    // ── 2. Fallback : vérifier dans prospects (téléphone en clair) ──────────
    const { rows: prows } = await q(
      'SELECT * FROM prospects WHERE LOWER(email) = LOWER($1)', [email]
    );
    if (prows.length === 0) {
      return res.status(404).json({ error: 'Aucun compte trouvé pour cet email.' });
    }
    const p = rowToObj(prows[0]);
    const storedPhone = (p.telephone || '').replace(/[\s+\-().]/g, '');
    const inputVariants = phoneVariants(password);
    const storedVariants = phoneVariants(p.telephone || '');
    const phoneMatch = inputVariants.some(v => storedVariants.includes(v));
    if (!phoneMatch) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    // ── 3. Créer / corriger le compte users avec le bon hash ─────────────────
    const newHash = await hashPassword(storedPhone);
    const existingUser = rows[0] ? rowToObj(rows[0]) : null;
    if (existingUser) {
      // Mettre à jour le hash stocké
      await q('UPDATE users SET password_hash = $1, derniere_cnx = NOW(), updated_at = NOW() WHERE id = $2',
        [newHash, existingUser.id]);
    } else {
      // Créer le compte
      await q(
        `INSERT INTO users (id,email,password_hash,role,nom,prospect_id,actif,created_at,updated_at)
         VALUES ($1,$2,$3,'parent',$4,$5,true,NOW(),NOW()) ON CONFLICT DO NOTHING`,
        [uid('user'), email.toLowerCase(), newHash, `${p.prenomParent} ${p.nomParent}`, p.id]
      );
    }

    const token = await signJWT({ email: p.email, role: 'parent', sub: p.email, prospectId: p.id });
    return res.json({ token, user: { email: p.email, name: `${p.prenomParent} ${p.nomParent}`, role: 'parent' }, prospect: p });
  } catch (e: any) {
    console.error('[signin]', e);
    return res.status(500).json({ error: e.message || 'Erreur serveur.' });
  }
});

// ─── Proxy images externes (évite OpaqueResponseBlocking côté navigateur) ────

app.get('/api/img-proxy', async (req, res) => {
  const url = req.query.url as string;
  if (!url || !/^https:\/\/(images\.unsplash\.com|source\.unsplash\.com|plus\.unsplash\.com)\//.test(url)) {
    return res.status(400).json({ error: 'URL non autorisée.' });
  }
  try {
    const upstream = await fetch(url);
    if (!upstream.ok) return res.status(upstream.status).end();
    const ct = upstream.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', ct);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const buf = await upstream.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch { res.status(502).end(); }
});

// ─── Gestion des utilisateurs ────────────────────────────────────────────────

// Lister tous les comptes (admin)
app.get('/api/users', requireAdmin, async (_req, res) => {
  const { rows } = await q(
    `SELECT id, email, role, nom, prospect_id, actif, derniere_cnx, created_at, updated_at
     FROM users ORDER BY role DESC, nom ASC`
  );
  res.json(rowsToObjs(rows));
});

// Créer un compte manuellement (admin)
app.post('/api/users', requireAdmin, async (req, res) => {
  const { email, password, role, nom, prospectId } = req.body;
  if (!email || !password || !nom) return res.status(400).json({ error: 'email, password et nom requis.' });
  try {
    const hash = await hashPassword(password);
    const { rows } = await q(
      `INSERT INTO users (id,email,password_hash,role,nom,prospect_id,actif,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,true,NOW(),NOW()) RETURNING id,email,role,nom,actif`,
      [uid('user'), email.toLowerCase(), hash, role || 'parent', nom, prospectId || null]
    );
    res.status(201).json(rowToObj(rows[0]));
  } catch (e: any) {
    if (e.code === '23505') return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
    res.status(500).json({ error: e.message });
  }
});

// Modifier un compte (admin : actif, nom, rôle ; ou reset mot de passe)
app.patch('/api/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { nom, actif, role, password } = req.body;
  try {
    const sets: string[] = [];
    const vals: any[] = [];
    if (nom     !== undefined) { vals.push(nom);   sets.push(`nom = $${vals.length}`); }
    if (actif   !== undefined) { vals.push(actif); sets.push(`actif = $${vals.length}`); }
    if (role    !== undefined) { vals.push(role);  sets.push(`role = $${vals.length}`); }
    if (password) {
      const hash = await hashPassword(password);
      vals.push(hash); sets.push(`password_hash = $${vals.length}`);
    }
    if (sets.length === 0) return res.status(400).json({ error: 'Aucun champ à modifier.' });
    vals.push(id);
    const { rows } = await q(
      `UPDATE users SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${vals.length}
       RETURNING id,email,role,nom,actif,derniere_cnx`,
      vals
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    res.json(rowToObj(rows[0]));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Changer son propre mot de passe (parent ou admin connecté)
app.post('/api/users/me/password', requireAuth, async (req: any, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Ancien et nouveau mot de passe requis.' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
  try {
    const { rows } = await q('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [req.neonUser.email]);
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    const user = rowToObj(rows[0]);
    const valid = await verifyPassword(oldPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Ancien mot de passe incorrect.' });
    const hash = await hashPassword(newPassword);
    await q('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, user.id]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Inscription parent (optionnel — créé automatiquement à la pré-inscription)
app.post('/api/auth/register', async (req, res) => {
  res.json({ success: true, message: 'Compte créé automatiquement à la pré-inscription.' });
});

// Déconnexion (stateless — le client efface juste son token)
app.post('/api/auth/signout', (_req, res) => res.json({ success: true }));

// Reset password — envoie un code par email
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis.' });
  try {
    const { rows } = await q('SELECT * FROM prospects WHERE LOWER(email) = LOWER($1)', [email]);
    if (rows.length === 0) return res.status(404).json({ error: 'Aucun dossier trouvé.' });
    const p = rowToObj(rows[0]);
    await logNotification('email', email,
      `Bonjour ${p.prenomParent},\n\nVotre mot de passe d'accès à l'Espace Parent est votre numéro de téléphone : ${p.telephone}\n\nEPV Horizons Savants`,
      'EPV — Rappel de votre accès Espace Parent');
    res.json({ success: true, message: 'Instructions envoyées par email.' });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ─── Auth endpoints ───────────────────────────────────────────────────────────

// Vérifie un JWT Neon Auth et retourne les infos utilisateur
app.get('/api/auth/me', requireAuth, (req: any, res) => {
  res.json({ user: req.neonUser });
});

// Vérifie si un JWT est valide
app.post('/api/auth/verify', async (req, res) => {
  const token = extractBearer(req);
  if (!token) return res.status(401).json({ valid: false });
  try {
    const payload = await verifyJWT(token);
    res.json({ valid: true, user: payload });
  } catch {
    res.status(401).json({ valid: false, error: 'Token invalide.' });
  }
});

// Data API proxy — transfère les requêtes vers Neon REST API avec le JWT du client
app.all('/api/data/*', requireAuth, async (req: any, res) => {
  const restUrl = process.env.NEON_REST_URL;
  if (!restUrl) return res.status(503).json({ error: 'NEON_REST_URL non configuré.' });

  const subPath = req.path.replace('/api/data', '');
  const query = new URLSearchParams(req.query as any).toString();
  const url = `${restUrl}${subPath}${query ? '?' + query : ''}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
        'Prefer': (req.headers.prefer as string) || '',
      },
      body: ['POST', 'PATCH', 'PUT'].includes(req.method) ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.json().catch(() => null);
    res.status(response.status).json(data);
  } catch (e) {
    console.error('Data API proxy error:', e);
    res.status(502).json({ error: 'Erreur proxy Data API.' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@horizonssavants.com' && password === 'admin2026') {
    res.json({ success: true, role: 'admin', user: { email, name: 'Directeur Académique EPV' } });
  } else {
    res.status(401).json({ success: false, error: 'Identifiants administratifs incorrects.' });
  }
});

app.post('/api/parent/login', async (req, res) => {
  const { email, telephone } = req.body;
  try {
    const { rows } = await q('SELECT * FROM prospects WHERE LOWER(email) = LOWER($1)', [email]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Aucun dossier trouvé avec cet email.' });
    const prospect = rowToObj(rows[0]) as Prospect;
    if (telephone) {
      const clean = telephone.replace(/\s+/g, '');
      const dbClean = prospect.telephone.replace(/\s+/g, '');
      if (!clean.includes(dbClean) && !dbClean.includes(clean)) {
        return res.status(401).json({ success: false, error: 'Le numéro de téléphone ne correspond pas.' });
      }
    }
    res.json({ success: true, role: 'parent', data: { prospect } });
  } catch (e) { console.error(e); res.status(500).json({ success: false, error: 'Erreur serveur.' }); }
});

// ─── OTP : envoi ─────────────────────────────────────────────────────────────
app.post('/api/parent/otp/send', async (req, res) => {
  const { telephone } = req.body;
  if (!telephone) return res.status(400).json({ error: 'Numéro WhatsApp requis.' });

  try {
    // Recherche flexible : on compare les 8 derniers chiffres
    const digits = telephone.replace(/\D/g, '').slice(-8);
    const { rows } = await q(
      `SELECT * FROM prospects WHERE REGEXP_REPLACE(telephone,'\\D','','g') LIKE $1`,
      [`%${digits}`]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Aucun dossier trouvé avec ce numéro. Contactez l'école." });

    const prospect = rowToObj(rows[0]) as Prospect;
    const otp       = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min

    otpStore.set(digits, { otp, prospectId: prospect.id, name: prospect.prenomParent, expiresAt, attempts: 0 });

    const msg = `🎓 *EPV Horizons Savants*\n\nBonjour ${prospect.prenomParent},\n\nVotre code d'accès à l'Espace Parent est :\n\n*${otp}*\n\n⏱ Valable 10 minutes.\n\n_Ne le partagez jamais._`;
    await logNotification('whatsapp', prospect.telephone, msg, 'Code OTP Espace Parent');

    // En dev : log console pour faciliter les tests
    console.log(`[OTP] ${prospect.prenomParent} ${prospect.nomParent} → ${otp}`);

    res.json({ success: true, name: prospect.prenomParent });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ─── OTP : vérification ───────────────────────────────────────────────────────
app.post('/api/parent/otp/verify', async (req, res) => {
  const { telephone, otp } = req.body;
  if (!telephone || !otp) return res.status(400).json({ error: 'Données manquantes.' });

  const digits = String(telephone).replace(/\D/g, '').slice(-8);
  const entry  = otpStore.get(digits);

  if (!entry)
    return res.status(400).json({ error: 'Aucun code OTP actif. Demandez un nouveau code.' });
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(digits);
    return res.status(400).json({ error: 'Code expiré. Demandez un nouveau code.' });
  }
  if (entry.attempts >= 5) {
    otpStore.delete(digits);
    return res.status(429).json({ error: 'Trop de tentatives. Demandez un nouveau code.' });
  }
  if (entry.otp !== String(otp).trim()) {
    entry.attempts++;
    return res.status(401).json({
      error: `Code incorrect — ${5 - entry.attempts} tentative(s) restante(s).`
    });
  }

  // ✅ Code valide — retourner TOUS les enfants du parent
  otpStore.delete(digits);

  const { rows: allRows } = await q(
    `SELECT * FROM prospects WHERE REGEXP_REPLACE(telephone,'\\D','','g') LIKE $1 ORDER BY created_at`,
    [`%${digits}`]
  );
  if (allRows.length === 0) return res.status(404).json({ error: 'Dossier introuvable.' });

  const children = allRows.map(r => rowToObj(r) as Prospect);
  res.json({ success: true, prospect: children[0], children });
});

// ─── Tous les enfants d'un parent (par téléphone) ────────────────────────────
app.get('/api/parent/children', async (req, res) => {
  const { telephone } = req.query as { telephone?: string };
  if (!telephone) return res.status(400).json({ error: 'Numéro requis.' });
  const digits = String(telephone).replace(/\D/g, '').slice(-8);
  try {
    const { rows } = await q(
      `SELECT * FROM prospects WHERE REGEXP_REPLACE(telephone,'\\D','','g') LIKE $1 ORDER BY created_at`,
      [`%${digits}`]
    );
    res.json(rows.map(r => rowToObj(r)));
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.post('/api/parent/reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    const { rows } = await q('SELECT * FROM prospects WHERE LOWER(email) = LOWER($1)', [email]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Aucun dossier trouvé.' });
    const p = rowToObj(rows[0]) as Prospect;
    const code = Math.floor(100000 + Math.random() * 900000);
    const content = `Bonjour ${p.prenomParent} ${p.nomParent},\n\nVotre code de réinitialisation est : ${code}.\n\nCordialement,\nService Technique EPV`;
    await logNotification('email', p.email, content, 'EPV — Code de réinitialisation');
    res.json({ success: true, message: 'Un code temporaire a été envoyé par email.' });
  } catch (e) { console.error(e); res.status(500).json({ success: false, error: 'Erreur serveur.' }); }
});

// ─── Places — compteurs calculés dynamiquement depuis prospects ───────────────

app.get('/api/places', async (_req, res) => {
  const { rows } = await q(`
    SELECT
      p.section,
      p.capacite_max,
      COALESCE(SUM(CASE WHEN pr.statut = $1 THEN 1 ELSE 0 END), 0) AS inscrits_confirmes,
      COALESCE(SUM(CASE WHEN pr.statut = $2 THEN 1 ELSE 0 END), 0) AS pre_inscrits
    FROM places p
    LEFT JOIN prospects pr ON pr.section_visee = p.section
      AND pr.statut NOT IN ($3, $4)
    GROUP BY p.section, p.capacite_max
    ORDER BY p.section
  `, [StatutProspect.INSCRIT, StatutProspect.PRE_INSCRIT, StatutProspect.ARCHIVE, '']);
  res.json(rows.map(r => ({
    section: r.section,
    capaciteMax: r.capacite_max,
    inscritsConfirmes: parseInt(r.inscrits_confirmes),
    preInscrits: parseInt(r.pre_inscrits),
  })));
});

// ─── Configuration (tarifs, paramètres) ──────────────────────────────────────

app.get('/api/configuration', async (_req, res) => {
  const { rows } = await q('SELECT cle, valeur FROM configuration ORDER BY cle');
  const config: Record<string, any> = {};
  rows.forEach(r => { config[r.cle] = r.valeur; });
  res.json(config);
});

app.patch('/api/configuration/:cle', requireAdmin, async (req, res) => {
  const { cle } = req.params;
  const { valeur } = req.body;
  await q('INSERT INTO configuration (cle,valeur,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (cle) DO UPDATE SET valeur=$2, updated_at=NOW()',
    [cle, JSON.stringify(valeur)]);
  res.json({ success: true });
});

// ─── Paiements ────────────────────────────────────────────────────────────────

app.get('/api/paiements', requireAuth, async (req: any, res) => {
  const user = req.neonUser;
  const adminEmails = (process.env.ADMIN_EMAILS || 'admin@horizonssavants.com')
    .split(',').map((e: string) => e.trim().toLowerCase());
  const isAdmin = adminEmails.includes((user.email || '').toLowerCase());
  const { prospectId } = req.query;
  let text = 'SELECT * FROM paiements';
  const vals: any[] = [];
  if (isAdmin) {
    if (prospectId) { text += ' WHERE prospect_id = $1'; vals.push(prospectId); }
  } else {
    // Parent : uniquement ses propres paiements
    text += ' WHERE prospect_id = $1';
    vals.push(user.prospectId);
  }
  text += ' ORDER BY date_paiement DESC';
  const { rows } = await q(text, vals);
  res.json(rowsToObjs(rows));
});

app.post('/api/paiements', requireAdmin, async (req, res) => {
  const { prospectId, trimestre, montant, datePaiement, modePaiement, reference, notes } = req.body;
  if (!prospectId || !trimestre || !montant || !datePaiement)
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  try {
    const id = uid('pay');
    const { rows } = await q(
      `INSERT INTO paiements (id,prospect_id,trimestre,montant,date_paiement,mode_paiement,reference,statut,notes,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'validé',$8,NOW(),NOW()) RETURNING *`,
      [id, prospectId, trimestre, montant, datePaiement, modePaiement || 'Espèces', reference || null, notes || null]
    );
    await logAction('CREATE', 'Paiements', `Paiement ${trimestre} enregistré pour ${prospectId}`);
    res.status(201).json(rowToObj(rows[0]));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/paiements/:id', requireAdmin, async (req, res) => {
  const { statut } = req.body;
  await q('UPDATE paiements SET statut=$1, updated_at=NOW() WHERE id=$2', [statut, req.params.id]);
  const { rows } = await q('SELECT * FROM paiements WHERE id=$1', [req.params.id]);
  res.json(rowToObj(rows[0]));
});

// ─── Prospects ────────────────────────────────────────────────────────────────

app.get('/api/prospects', requireAdmin, async (_req, res) => {
  const { rows } = await q('SELECT * FROM prospects ORDER BY created_at DESC');
  res.json(rowsToObjs(rows));
});

app.post('/api/prospects', async (req, res) => {
  const {
    prenomEnfant, nomEnfant, dateNaissance, sectionVisee,
    prenomParent, nomParent, lienParente, telephone, email, commune,
    source, codeParrainageUtilise, messageLibre,
  } = req.body;

  if (!prenomEnfant || !nomEnfant || !dateNaissance || !sectionVisee ||
      !prenomParent || !nomParent || !telephone || !email || !commune) {
    return res.status(400).json({ success: false, error: 'Veuillez remplir tous les champs obligatoires.' });
  }

  let phone = telephone.trim().replace(/\s+/g, '');
  if (!phone.startsWith('+225') && !phone.startsWith('225')) phone = '+225' + phone;
  else if (phone.startsWith('225')) phone = '+' + phone;

  let referralValid = false;
  if (codeParrainageUtilise?.trim()) {
    const code = codeParrainageUtilise.trim().toUpperCase();
    if (!/^EPV-[A-Z0-9]{3,12}$/.test(code)) {
      return res.status(400).json({ success: false, error: 'Format du code parrainage invalide.' });
    }
    referralValid = true;
  }

  try {
    const { rows: sameNameRows } = await q(
      "SELECT COUNT(*) FROM prospects WHERE UPPER(nom_parent) LIKE $1",
      ['%' + nomParent.trim().toUpperCase().replace(/[^A-Z]/g, '').substring(0, 5) + '%']
    );
    const nameClean = nomParent.trim().toUpperCase().replace(/[^A-Z]/g, '').substring(0, 5);
    const idx = parseInt(sameNameRows[0].count) + 1;
    const personalCode = `EPV-${nameClean}${idx < 10 ? '0' + idx : idx}`;
    const id = uid('prospect');

    await q(
      `INSERT INTO prospects (id,created_at,updated_at,prenom_enfant,nom_enfant,date_naissance,section_visee,
        prenom_parent,nom_parent,lien_parente,telephone,email,commune,source,
        code_parrainage_utilise,code_parrainage_personnel,statut,notes_admin)
       VALUES ($1,NOW(),NOW(),$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [id, prenomEnfant.trim(), nomEnfant.trim(), dateNaissance, sectionVisee,
       prenomParent.trim(), nomParent.trim(), lienParente, phone,
       email.trim().toLowerCase(), commune, source,
       codeParrainageUtilise ? codeParrainageUtilise.trim().toUpperCase() : null,
       personalCode, StatutProspect.PROSPECT,
       messageLibre ? `Note initiale : ${messageLibre}` : null]
    );

    // Places calculées dynamiquement depuis prospects — pas de mise à jour manuelle

    if (referralValid) {
      const code = codeParrainageUtilise.trim().toUpperCase();
      const { rows: sponsors } = await q(
        'SELECT * FROM prospects WHERE UPPER(code_parrainage_personnel) = $1', [code]
      );
      if (sponsors.length > 0) {
        const sponsor = rowToObj(sponsors[0]) as Prospect;
        await q(
          'INSERT INTO parrainages (id,code_parrain,prospect_id_parrain,prospect_id_filleul,statut,reduction_appliquee,created_at) VALUES ($1,$2,$3,$4,$5,$6,NOW())',
          [uid('parrainage'), code, sponsor.id, id, 'en_attente', 10]
        );
        await logNotification('email', sponsor.email,
          `Bonjour ${sponsor.prenomParent}, votre code ${sponsor.codeParrainagePersonnel} a été utilisé par ${prenomEnfant} ${nomEnfant}. Une réduction de 10% sera appliquée dès inscription confirmée.`,
          'EPV — Votre parrainage a été partagé !');
        await logNotification('whatsapp', sponsor.telephone,
          `EPV Horizons Savants : Votre code de parrainage ${sponsor.codeParrainagePersonnel} a été utilisé ! 10% de réduction dès confirmation d'inscription.`);
      }
    }

    const emailContent = `<h2>EPV Horizons Savants — Pré-inscription reçue</h2><p>Bonjour ${prenomParent} ${nomParent},</p><p>La pré-inscription de <strong>${prenomEnfant} ${nomEnfant}</strong> en <strong>${sectionVisee}</strong> a été enregistrée.</p><p>Votre code de parrainage : <strong>${personalCode}</strong></p><p>L'équipe EPV Horizons Savants</p>`;
    const waContent = `🌟 EPV HORIZONS SAVANTS 🌟\n\nBonjour ${prenomParent}, la pré-inscription de ${prenomEnfant} en ${sectionVisee} est reçue.\n🔑 Code parrainage : *${personalCode}*\nAccédez à votre Espace Parent : https://horizonssavants.com/#/espace-parent`;

    await logNotification('email', email, emailContent, `EPV — Pré-inscription de ${prenomEnfant} reçue`);
    await logNotification('whatsapp', phone, waContent);
    await logNotification('email', 'direction@horizonssavants.com',
      `NOUVEAU PROSPECT : ${prenomEnfant} ${nomEnfant} (${sectionVisee}) — ${prenomParent} ${nomParent} (${phone})`,
      `[ADMIN] Nouveau Prospect — ${prenomEnfant} ${nomEnfant}`);

    const { rows: newRows } = await q('SELECT * FROM prospects WHERE id = $1', [id]);

    res.status(201).json({ success: true, data: rowToObj(newRows[0]), personalReferralCode: personalCode });

    // Créer le compte utilisateur parent en arrière-plan (non bloquant)
    (async () => {
      try {
        const { rows: existUser } = await q('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        if (existUser.length === 0) {
          const cleanPhone = phone.replace(/[\s+\-().]/g, '');
          const hash = await hashPassword(cleanPhone);
          await q(
            `INSERT INTO users (id,email,password_hash,role,nom,prospect_id,actif,created_at,updated_at)
             VALUES ($1,$2,$3,'parent',$4,$5,true,NOW(),NOW()) ON CONFLICT DO NOTHING`,
            [uid('user'), email.toLowerCase(), hash, `${prenomParent} ${nomParent}`, id]
          );
        }
      } catch (e) { console.warn('[user-auto-create]', e); }
    })();
  } catch (e) { console.error(e); res.status(500).json({ success: false, error: 'Erreur serveur.' }); }
});

app.patch('/api/prospects/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  try {
    const { rows: old } = await q('SELECT * FROM prospects WHERE id = $1', [id]);
    if (old.length === 0) return res.status(404).json({ success: false, error: 'Prospect non trouvé.' });
    const oldStatut = old[0].statut;
    const section = old[0].section_visee;

    await q('UPDATE prospects SET statut = $1, updated_at = NOW() WHERE id = $2', [statut, id]);

    // Places calculées dynamiquement — pas de mise à jour manuelle nécessaire

    const { rows: updated } = await q('SELECT * FROM prospects WHERE id = $1', [id]);
    const p = rowToObj(updated[0]) as Prospect;

    // Notifications
    let emailContent = '';
    let waContent = '';
    if (statut === StatutProspect.PRE_INSCRIT) {
      emailContent = `Bonjour ${p.prenomParent} ${p.nomParent},\n\nLe dossier de ${p.prenomEnfant} est maintenant Pré-inscrit. Prenez rendez-vous pour finaliser l'inscription.\n\nL'équipe EPV`;
      waContent = `EPV : Le dossier de ${p.prenomEnfant} est validé Pré-inscrit. Réservez votre entretien physique.`;
    } else if (statut === StatutProspect.INSCRIT) {
      emailContent = `Félicitations ! L'inscription de ${p.prenomEnfant} ${p.nomEnfant} pour l'année 2026/2027 est confirmée ! 🎓\n\nL'équipe EPV Horizons Savants`;
      waContent = `🎉 EPV : L'inscription de ${p.prenomEnfant} est confirmée pour Septembre 2026 !`;

      // Valider le parrainage
      const { rows: parr } = await q(
        "SELECT * FROM parrainages WHERE prospect_id_filleul = $1 AND statut = 'en_attente'", [id]
      );
      if (parr.length > 0) {
        await q("UPDATE parrainages SET statut = 'valide' WHERE id = $1", [parr[0].id]);
        const { rows: sponsors } = await q('SELECT * FROM prospects WHERE id = $1', [parr[0].prospect_id_parrain]);
        if (sponsors.length > 0) {
          const sp = rowToObj(sponsors[0]) as Prospect;
          await logNotification('email', sp.email,
            `Félicitations ${sp.prenomParent} ! L'inscription de votre filleul ${p.prenomEnfant} est confirmée. 10% de réduction appliquée !`,
            'EPV — Réduction Parrainage Validée !');
          await logNotification('whatsapp', sp.telephone,
            `🎉 EPV Parrainage Validé ! ${p.prenomEnfant} est officiellement inscrit. 10% de réduction sur votre scolarité !`);
        }
      }

      // Message Espace Parent
      await q(
        'INSERT INTO messages (id,prospect_id,de,date,lu,contenu,created_at,updated_at) VALUES ($1,$2,$3,NOW(),$4,$5,NOW(),NOW())',
        [uid('msg'), id, 'Direction EPV Horizons Savants', false,
         `Félicitations ! L'inscription de votre enfant ${p.prenomEnfant} ${p.nomEnfant} est officiellement confirmée pour l'année scolaire 2026/2027. Bienvenue dans la famille EPV Horizons Savants !`]
      );
    }

    if (emailContent) {
      await logNotification('email', p.email, emailContent, 'EPV — Évolution de votre dossier');
      await logNotification('whatsapp', p.telephone, waContent);
    }

    await logAction('UPDATE', 'Dossier', `Statut de ${p.prenomEnfant} ${p.nomEnfant} → ${statut}`);
    res.json({ success: true, data: p });
  } catch (e) { console.error(e); res.status(500).json({ success: false, error: 'Erreur serveur.' }); }
});

// ─── Rendezvous ───────────────────────────────────────────────────────────────

// Créneaux publics — uniquement dateHeure + statut (aucune donnée personnelle)
app.get('/api/rendezvous/slots', async (_req, res) => {
  try {
    const { rows } = await q(
      "SELECT date_heure AS \"dateHeure\", statut FROM rendezvous WHERE statut != 'annule' ORDER BY date_heure ASC"
    );
    res.json(rows);
  } catch (e) { res.json([]); }
});

app.get('/api/rendezvous', requireAuth, async (req: any, res) => {
  const user = req.neonUser;
  const adminEmails = (process.env.ADMIN_EMAILS || 'admin@horizonssavants.com')
    .split(',').map((e: string) => e.trim().toLowerCase());
  const isAdmin = adminEmails.includes((user.email || '').toLowerCase());
  if (isAdmin) {
    const { rows } = await q('SELECT * FROM rendezvous ORDER BY date_heure DESC');
    res.json(rowsToObjs(rows));
  } else {
    const { rows } = await q(
      'SELECT * FROM rendezvous WHERE email = $1 ORDER BY date_heure DESC',
      [user.email]
    );
    res.json(rowsToObjs(rows));
  }
});

app.post('/api/rendezvous', async (req, res) => {
  const { prenomParent, nomParent, telephone, email, prenomEnfant, sectionEnfant, dateHeure, typeRdv, notes, prospectId } = req.body;
  if (!prenomParent || !nomParent || !telephone || !email || !dateHeure || !typeRdv) {
    return res.status(400).json({ success: false, error: 'Veuillez renseigner tous les champs.' });
  }
  let phone = telephone.trim().replace(/\s+/g, '');
  if (!phone.startsWith('+225') && !phone.startsWith('225')) phone = '+225' + phone;
  else if (phone.startsWith('225')) phone = '+' + phone;

  try {
    // Vérifier conflit de créneau (30 min)
    const { rows: conflict } = await q(
      `SELECT id FROM rendezvous WHERE statut != 'annule' AND ABS(EXTRACT(EPOCH FROM (date_heure - $1::TIMESTAMPTZ))) < 1800`,
      [dateHeure]
    );
    if (conflict.length > 0) {
      return res.status(400).json({ success: false, error: 'Ce créneau est déjà réservé. Choisissez un autre créneau.' });
    }

    const id = uid('rdv');
    await q(
      `INSERT INTO rendezvous (id,prospect_id,prenom_parent,nom_parent,telephone,email,prenom_enfant,section_enfant,date_heure,type_rdv,statut,notes,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())`,
      [id, prospectId ?? null, prenomParent.trim(), nomParent.trim(), phone,
       email.trim().toLowerCase(), prenomEnfant?.trim() ?? null, sectionEnfant ?? null,
       dateHeure, typeRdv, StatutRendezVous.CONFIRME, notes ?? null]
    );

    const dateStr = new Date(dateHeure).toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
    await logNotification('email', email,
      `<h2>EPV — Rendez-vous confirmé</h2><p>Bonjour ${prenomParent} ${nomParent},</p><p>Votre rendez-vous <strong>${typeRdv}</strong> est confirmé le <strong>${dateStr}</strong> au campus EPV Horizons Savants, Cocody.</p><p>L'équipe EPV</p>`,
      'EPV — Rendez-vous Confirmé');
    await logNotification('whatsapp', phone,
      `📅 RDV CONFIRMÉ : Bonjour ${prenomParent}, votre rdv "${typeRdv}" est le ${dateStr}. Campus EPV, Cocody.`);

    const { rows: newRows } = await q('SELECT * FROM rendezvous WHERE id = $1', [id]);
    res.status(201).json({ success: true, data: rowToObj(newRows[0]) });
  } catch (e) { console.error(e); res.status(500).json({ success: false, error: 'Erreur serveur.' }); }
});

app.patch('/api/rendezvous/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;
  try {
    const { rows: old } = await q('SELECT * FROM rendezvous WHERE id = $1', [id]);
    if (old.length === 0) return res.status(404).json({ success: false, error: 'Rendez-vous non trouvé.' });
    await q('UPDATE rendezvous SET statut = $1 WHERE id = $2', [statut, id]);
    if (statut === StatutRendezVous.ANNULE) {
      const r = rowToObj(old[0]) as RendezVous;
      const dateStr = new Date(r.dateHeure).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' });
      await logNotification('email', r.email,
        `Bonjour ${r.prenomParent}, votre rendez-vous du ${dateStr} a été annulé. Contactez-nous pour reprogrammer.`,
        'EPV — Annulation de votre Rendez-vous');
    }
    const { rows: updated } = await q('SELECT * FROM rendezvous WHERE id = $1', [id]);
    res.json({ success: true, data: rowToObj(updated[0]) });
  } catch (e) { console.error(e); res.status(500).json({ success: false, error: 'Erreur serveur.' }); }
});

// ─── Parrainages ─────────────────────────────────────────────────────────────

app.get('/api/parrainages', requireAdmin, async (_req, res) => {
  const { rows } = await q('SELECT * FROM parrainages ORDER BY created_at DESC');
  res.json(rowsToObjs(rows));
});

// ─── Notifications ────────────────────────────────────────────────────────────

app.get('/api/notifications', requireAdmin, async (_req, res) => {
  const { rows } = await q('SELECT * FROM notifications ORDER BY timestamp DESC');
  res.json(rowsToObjs(rows));
});

app.post('/api/notifications/clear', requireAdmin, async (_req, res) => {
  await q('DELETE FROM notifications');
  res.json({ success: true });
});

// ─── Contacts ─────────────────────────────────────────────────────────────────

app.get('/api/contacts', requireAdmin, async (_req, res) => {
  const { rows } = await q('SELECT * FROM contacts ORDER BY created_at DESC');
  res.json(rowsToObjs(rows));
});

app.post('/api/contacts', async (req, res) => {
  const { nom, email, telephone, objet, message } = req.body;
  if (!nom || !email || !telephone || !message) {
    return res.status(400).json({ success: false, error: 'Veuillez remplir tous les champs.' });
  }
  try {
    const id = uid('msg');
    await q(
      'INSERT INTO contacts (id,nom,email,telephone,objet,message,statut,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())',
      [id, nom.trim(), email.trim().toLowerCase(), telephone.trim(), objet || 'Information générale', message.trim(), 'A traiter']
    );
    await logNotification('email', 'direction@horizonssavants.com',
      `NOUVEAU CONTACT :\nDe : ${nom} (${telephone} | ${email})\nObjet : ${objet}\nMessage : ${message}`,
      `[Contact] ${objet} — de ${nom}`);
    const { rows } = await q('SELECT * FROM contacts WHERE id = $1', [id]);
    res.status(201).json({ success: true, data: rowToObj(rows[0]) });
  } catch (e) { console.error(e); res.status(500).json({ success: false, error: 'Erreur serveur.' }); }
});

app.patch('/api/contacts/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;
  try {
    await q('UPDATE contacts SET statut = $1 WHERE id = $2', [statut, id]);
    const { rows } = await q('SELECT * FROM contacts WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Non trouvé.' });
    res.json({ success: true, data: rowToObj(rows[0]) });
  } catch (e) { console.error(e); res.status(500).json({ success: false, error: 'Erreur serveur.' }); }
});

// ─── Messages parents ─────────────────────────────────────────────────────────

app.get('/api/messages', requireAuth, async (req: any, res) => {
  const { prospectId } = req.query;
  try {
    let text = 'SELECT * FROM messages';
    const params: any[] = [];
    if (prospectId) { text += ' WHERE prospect_id = $1'; params.push(prospectId); }
    text += ' ORDER BY date DESC';
    const { rows } = await q(text, params);
    res.json(rowsToObjs(rows));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
});

app.post('/api/messages', requireAdmin, async (req, res) => {
  const { prospectId, de, contenu } = req.body;
  try {
    const id = uid('msg');
    await q(
      'INSERT INTO messages (id,prospect_id,de,date,lu,contenu,created_at,updated_at) VALUES ($1,$2,$3,NOW(),$4,$5,NOW(),NOW())',
      [id, prospectId ?? null, de, false, contenu]
    );
    const { rows } = await q('SELECT * FROM messages WHERE id = $1', [id]);
    res.status(201).json(rowToObj(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
});

app.patch('/api/messages/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { lu } = req.body;
  try {
    await q('UPDATE messages SET lu = $1, updated_at = NOW() WHERE id = $2', [lu, id]);
    const { rows } = await q('SELECT * FROM messages WHERE id = $1', [id]);
    res.json(rowToObj(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
});

// ─── CRUD générique ───────────────────────────────────────────────────────────

// Tables publiques en lecture (espace parent, formulaires publics)
const PUBLIC_READ_TABLES  = new Set(['cantine','evenements','transport']);
// Tables accessibles aux parents authentifiés
const PARENT_TABLES = new Set(['devoirs','notes','assiduite','sante_eleve','bilinguisme']);

function crudTable(name: string, idPrefix: string) {
  const table = name;
  const isPublicRead  = PUBLIC_READ_TABLES.has(name);
  const isParentTable = PARENT_TABLES.has(name);
  const readMw  = isPublicRead ? [] : isParentTable ? [requireAuth] : [requireAdmin];
  const writeMw = isParentTable ? [requireAuth] : [requireAdmin];

  app.get(`/api/${name}`, ...readMw, async (req: any, res) => {
    try {
      const filters = Object.entries(req.query as Record<string, string>);
      let text = `SELECT * FROM ${table}`;
      const vals: any[] = [];
      if (filters.length > 0) {
        const conds = filters.map(([k, v], i) => { vals.push(v); return `${toSnake(k)} = $${i + 1}`; });
        text += ` WHERE ${conds.join(' AND ')}`;
      }
      text += ' ORDER BY created_at DESC';
      const { rows } = await q(text, vals);
      res.json(rowsToObjs(rows));
    } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
  });

  app.post(`/api/${name}`, ...writeMw, async (req: any, res) => {
    try {
      const item = { id: uid(idPrefix), ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const { text, values } = buildInsert(table, item);
      const { rows } = await q(text, values);
      await logAction('CREATE', name, `Créé dans ${name} (id: ${item.id})`);
      res.status(201).json(rowToObj(rows[0]));
    } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
  });

  app.patch(`/api/${name}/:id`, ...writeMw, async (req: any, res) => {
    try {
      const { text, values } = buildUpdate(table, req.params.id, req.body);
      const { rows } = await q(text, values);
      if (rows.length === 0) return res.status(404).json({ error: 'Non trouvé.' });
      await logAction('UPDATE', name, `Élément ${req.params.id} mis à jour`);
      res.json(rowToObj(rows[0]));
    } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
  });

  app.delete(`/api/${name}/:id`, ...writeMw, async (req: any, res) => {
    try {
      await q(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
      await logAction('DELETE', name, `Élément ${req.params.id} supprimé`);
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
  });
}

// Logs (lecture seule admin)
app.get('/api/logs', requireAdmin, async (_req, res) => {
  const { rows } = await q('SELECT id, ts, usr AS "user", action, module, detail FROM logs ORDER BY ts DESC LIMIT 500');
  res.json(rows.map(r => ({ ...r, ts: r.ts instanceof Date ? r.ts.toISOString() : r.ts })));
});

// ── Devoirs PATCH spécifique — AVANT crudTable pour éviter le conflit ──────────
app.patch('/api/devoirs/:id', requireAuth, async (req, res) => {
  const { statut } = req.body;
  try {
    await q('UPDATE devoirs SET statut = $1, updated_at = NOW() WHERE id = $2', [statut, req.params.id]);
    const { rows } = await q('SELECT * FROM devoirs WHERE id = $1', [req.params.id]);
    res.json(rowToObj(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
});

// Alias (route legacy)
app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis.' });
  try {
    const { rows } = await q('SELECT * FROM prospects WHERE LOWER(email) = LOWER($1)', [email]);
    if (rows.length > 0) {
      const p = rowToObj(rows[0]) as Prospect;
      await logNotification('email', email,
        `Bonjour ${p.prenomParent},\n\nVotre accès Espace Parent utilise votre numéro de téléphone comme mot de passe : ${p.telephone}\n\nEPV Horizons Savants`,
        'EPV — Rappel accès Espace Parent');
    }
    res.json({ success: true, message: 'Instructions envoyées par email.' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

crudTable('teachers',    'teacher');
crudTable('staff',       'staff');
crudTable('depenses',    'depense');
crudTable('newsletters', 'nl');
crudTable('articles',    'article');
crudTable('faq',         'faq');
crudTable('temoignages', 'temo');
crudTable('galerie',     'media');
crudTable('devoirs',     'devoir');
crudTable('cantine',     'cantine');
crudTable('evenements',  'event');
crudTable('notes',       'note');
crudTable('assiduite',   'assiduite');
crudTable('transport',   'transport');
crudTable('sante_eleve', 'sante');
crudTable('bilinguisme', 'bil');
crudTable('documents',    'doc');
crudTable('qr_campaigns', 'qr');

// ─── Démarrage ────────────────────────────────────────────────────────────────

async function startServer() {
  if (!process.env.DATABASE_URL) {
    console.error('\n  ❌ DATABASE_URL manquant dans .env — copiez .env.example → .env et renseignez votre URL Neon.\n');
    process.exit(1);
  }

  // ── Démarrer Express IMMÉDIATEMENT — DB initialisée en arrière-plan ──────────
  // Évite que le timeout DB bloque le démarrage du serveur (30+ secondes)
  initDB()
    .then(() => console.log('  DB: schéma et données OK'))
    .catch((e: any) => {
      console.warn('  ⚠️  DB init différée:', e.code || e.message);
      // Réessayer toutes les 15s
      const retry = setInterval(() => {
        initDB().then(() => { console.log('  DB: reconnectée ✓'); clearInterval(retry); }).catch(() => {});
      }, 15000);
    });

  if (process.env.NODE_ENV !== 'production') {
    // IP locale réelle pour que le navigateur sache où se connecter (HMR)
    const localIP = Object.values(os.networkInterfaces()).flat()
      .find(i => i?.family === 'IPv4' && !i?.internal)?.address ?? 'localhost';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { host: localIP, port: 24678 },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    const wifiIp = Object.values(os.networkInterfaces()).flat()
      .find(i => i?.family === 'IPv4' && !i.internal)?.address ?? 'réseau non détecté';
    console.log(`\n  EPV Horizons Savants — Serveur démarré`);
    console.log(`  Local   : http://localhost:${PORT}`);
    console.log(`  Réseau  : http://${wifiIp}:${PORT}\n`);
  });
}

startServer();
