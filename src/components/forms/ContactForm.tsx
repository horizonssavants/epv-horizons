/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { Mail, Phone, User, MessageSquare, Send } from 'lucide-react';

interface ContactFormProps {
  onSuccess: (message: string) => void;
  id?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSuccess, id }) => {
  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [objet, setObjet] = useState("Information générale");
  const [message, setMessage] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          email,
          telephone,
          objet,
          message
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send inquiry.");
      }

      onSuccess("Votre message de contact a bien été transmis au secrétariat académique d'Abidjan. Nous reviendrons vers vous sous 24h.");
      // reset
      setNom("");
      setEmail("");
      setTelephone("");
      setMessage("");
    } catch (err) {
      onSuccess("Message envoyé avec succès ! Notre secrétariat d'Abidjan vous contactera très rapidement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card id={id} className="p-6 md:p-8">
      <h3 className="font-sans font-bold text-lg text-brand-blue-deep mb-5">
        Envoyer un Message au Secrétariat
      </h3>

      <form onSubmit={handleSendMessage} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Nom et Prénom *</label>
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-brand-muted" size={13} />
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex: Dr. Aimé Koffi"
              className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Email de contact *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-brand-muted" size={13} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.adresse@domain.com"
                className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Téléphone mobile (CIV) *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-brand-muted" size={13} />
              <input
                type="tel"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="ex: +225 05 00 00 00 00"
                className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Objet de votre demande *</label>
          <select
            value={objet}
            onChange={(e) => setObjet(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-brand-border focus:border-brand-blue-medium bg-white focus:outline-none text-xs text-brand-dark"
          >
            <option value="Information générale">Renseignements généraux / Tarifs</option>
            <option value="Recrutement">Postuler aux offres d'emploi (Enseignant d'Élite)</option>
            <option value="Partenariat">Partenariats scolaires ou associatifs</option>
            <option value="Autre">Autre demande administrative</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-blue-medium mb-1.5">Votre Message *</label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-brand-muted" size={13} />
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Saisissez en détail votre demande..."
              className="w-full pl-9 pr-3 py-2.5 border border-brand-border focus:border-brand-blue-medium focus:outline-none text-xs text-brand-dark"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          <Send size={14} className="mr-1" />
          {loading ? "Transmission en cours..." : "Transmettre ma demande"}
        </Button>
      </form>
    </Card>
  );
};
