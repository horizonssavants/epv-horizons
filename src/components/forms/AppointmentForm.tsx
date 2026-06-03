/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { CalendarPicker } from '../ui/CalendarPicker.tsx';
import { Calendar, User, Phone, Mail, FileText, CheckCircle } from 'lucide-react';

interface AppointmentFormProps {
  onSuccess: (appointment: any) => void;
  initialProspect?: any; // optional prepopulated details
  id?: string;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSuccess,
  initialProspect,
  id
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time details
  const [selectedDateTime, setSelectedDateTime] = useState("");

  // Fields
  const [prenomParent, setPrenomParent] = useState(initialProspect?.prenomParent || "");
  const [nomParent, setNomParent] = useState(initialProspect?.nomParent || "");
  const [telephone, setTelephone] = useState(initialProspect?.telephone || "");
  const [email, setEmail] = useState(initialProspect?.email || "");
  const [prenomEnfant, setPrenomEnfant] = useState(initialProspect?.prenomEnfant || "");
  const [sectionEnfant, setSectionEnfant] = useState(initialProspect?.sectionVisee || "PS");
  const [typeRdv, setTypeRdv] = useState<'Visite des locaux' | 'Entretien pédagogique' | 'Évaluation enfant' | 'Question administrative'>("Visite des locaux");
  const [notes, setNotes] = useState("");

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDateTime) {
      setError("Veuillez sélectionner un créneau horaire d'excellence disponible sur le calendrier.");
      return;
    }

    if (!prenomParent.trim() || !nomParent.trim() || !telephone.trim() || !email.trim()) {
      setError("Veuillez remplir vos coordonnées de contact obligatoires.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/rendezvous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenomParent,
          nomParent,
          telephone,
          email,
          prenomEnfant: prenomEnfant || undefined,
          sectionEnfant: sectionEnfant || undefined,
          dateHeure: selectedDateTime,
          typeRdv,
          notes: notes || undefined,
          prospectId: initialProspect?.id
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue lors de la réservation.");
      }

      onSuccess(result.data);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la prise de rendez-vous en ligne.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card id={id} className="p-6 md:p-8 select-none">
      <div className="border-b border-brand-border/40 pb-4 mb-6">
        <h3 className="font-sans font-bold text-lg text-brand-blue-deep flex items-center gap-2">
          <Calendar className="text-brand-gold" size={20} />
          Planifier un Rendez-vous d'Excellence
        </h3>
        <p className="text-xs text-brand-muted mt-1 leading-normal leading-relaxed">
          Planifiez votre visite physique, entretien pédagogique d'admission ou l'évaluation d'apprentissage de votre enfant en Côte d'Ivoire.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border-l-4 border-red-400 text-red-600 text-xs font-semibold leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleBooking} className="space-y-6">
        {/* Step 1: Calendar Selection */}
        <div>
          <label className="block text-xs font-bold text-brand-blue-deep uppercase tracking-wider mb-3">
            Étape 1 : Choisir la Date et l'Heure *
          </label>
          <CalendarPicker
            selectedDateTime={selectedDateTime}
            onSelectDateTime={(iso) => setSelectedDateTime(iso)}
          />
        </div>

        {/* Step 2: Informational entries */}
        <div className="border-t border-brand-border/40 pt-5 space-y-4">
          <label className="block text-xs font-bold text-brand-blue-deep uppercase tracking-wider">
            Étape 2 : Vos Coordonnées Académiques
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Objet du rendez-vous *</label>
              <select
                value={typeRdv}
                onChange={(e) => setTypeRdv(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium bg-white focus:outline-none text-xs text-brand-dark"
              >
                <option value="Visite des locaux">Visite guidée des locaux scolaires</option>
                <option value="Entretien pédagogique">Entretien pédagogique direction</option>
                <option value="Évaluation enfant">Évaluation de l'enfant (test d'excellence gratuit)</option>
                <option value="Question administrative">Clarification d'ordre administrative</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Adresse e-mail de contact *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-brand-muted" size={13} />
                <input
                  type="email"
                  required
                  value={email}
                  disabled={!!initialProspect}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom.prenom@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium disabled:bg-brand-pale focus:outline-none text-xs text-brand-dark"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Votre Prénom *</label>
              <input
                type="text"
                required
                value={prenomParent}
                disabled={!!initialProspect}
                onChange={(e) => setPrenomParent(e.target.value)}
                placeholder="Parent"
                className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium disabled:bg-brand-pale focus:outline-none text-xs text-brand-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Votre Nom *</label>
              <input
                type="text"
                required
                value={nomParent}
                disabled={!!initialProspect}
                onChange={(e) => setNomParent(e.target.value)}
                placeholder="Nom"
                className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium disabled:bg-brand-pale focus:outline-none text-xs text-brand-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Téléphone d'urgence *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-brand-muted" size={13} />
                <input
                  type="tel"
                  required
                  value={telephone}
                  disabled={!!initialProspect}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+225..."
                  className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium disabled:bg-brand-pale focus:outline-none text-xs text-brand-dark font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Section de l'enfant (optionnel)</label>
              <select
                value={sectionEnfant}
                onChange={(e) => setSectionEnfant(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium bg-white focus:outline-none text-xs text-brand-dark"
              >
                <option value="PS">Petite Section</option>
                <option value="MS">Moyenne Section</option>
                <option value="GS">Grande Section</option>
                <option value="CP">Classe de CP</option>
                <option value="CE1">Classe de CE1</option>
                <option value="CE2">Classe de CE2</option>
                <option value="CM1">Classe de CM1</option>
                <option value="CM2">Classe de CM2</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Prénom de l'enfant (optionnel)</label>
              <input
                type="text"
                value={prenomEnfant}
                onChange={(e) => setPrenomEnfant(e.target.value)}
                placeholder="Saisissez son prénom"
                className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Demandes particulières / Commentaires</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ex: Difficultés d'apprentissage, carnet scolaire précédent dispo."
                className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-brand-border/40 pt-4 flex justify-end shrink-0">
          <Button type="submit" variant="cta" className="px-8 py-3.5 text-sm font-bold shadow-md" disabled={loading}>
            <CheckCircle size={16} className="mr-1" />
            {loading ? "Confirmation du créneau..." : "Planifier mon Entretien d'Excellence"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
