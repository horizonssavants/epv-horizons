/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum StatutProspect {
  PROSPECT = 'Prospect',
  PRE_INSCRIT = 'Pré-inscrit',
  INSCRIT = 'Inscrit',
  ARCHIVE = 'Archivé'
}

export interface Prospect {
  id: string;
  createdAt: string;
  prenomEnfant: string;
  nomEnfant: string;
  dateNaissance: string;
  sectionVisee: string; // PS, MS, GS, CP, CE1, CE2, CM1, CM2
  prenomParent: string;
  nomParent: string;
  lienParente: 'Père' | 'Mère' | 'Tuteur';
  telephone: string; // Formatted as +225...
  email: string;
  commune: string; // Cocody, Marcory, Plateau, Yopougon, Abobo, Adjame, Treichville, Port-Bouet, Koumassi, Bingerville, etc.
  source: string; // Réseaux sociaux / Bouche-à-oreille / Flyer / Affiche / Partenaire / Code parrainage / Autre
  codeParrainageUtilise?: string; // EPV-XXXXX format
  codeParrainagePersonnel: string; // EPV-NOM01 format
  statut: StatutProspect;
  notesAdmin?: string;
  updatedAt: string;
}

export enum StatutRendezVous {
  PLANIFIE = 'planifie',
  CONFIRME = 'confirme',
  ANNULE = 'annule',
  FAIT = 'fait'
}

export interface RendezVous {
  id: string;
  prospectId?: string; // Optional if booked without pre-inscription
  prenomParent: string;
  nomParent: string;
  telephone: string;
  email: string;
  prenomEnfant?: string;
  sectionEnfant?: string;
  dateHeure: string; // ISO String
  typeRdv: 'Visite des locaux' | 'Entretien pédagogique' | 'Évaluation enfant' | 'Question administrative';
  statut: StatutRendezVous;
  notes?: string;
  createdAt: string;
}

export interface Parrainage {
  id: string;
  codeParrain: string; // EPV-XXXXX
  prospectIdParrain: string; // Parent sponsor
  prospectIdFilleul: string; // Parent referred
  statut: 'en_attente' | 'valide' | 'expire';
  reductionAppliquee: number; // e.g. 10% or absolute value in FCFA (e.g., 50000 FCFA reduction)
  createdAt: string;
}

export interface SectionPlace {
  section: string; // PS, MS, GS, CP, CE1, CE2, CM1, CM2
  capaciteMax: number;
  inscritsConfirmes: number;
  preInscrits: number;
}

export interface NotificationLog {
  id: string;
  type: 'email' | 'whatsapp';
  timestamp: string;
  destinataire: string;
  sujet?: string;
  contenu: string;
  lu?: boolean;
}

export interface ParentSession {
  prospect: Prospect;
  submitedDocuments: {
    acteNaissance: boolean;
    carnetSante: boolean;
    photosProfil: boolean;
    bulletinPrecedent: boolean;
  };
}
