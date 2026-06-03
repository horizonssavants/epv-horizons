/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ProgressBarProps {
  section: string;
  inscrits: number;
  preInscrits: number;
  maxCap: number;
  id?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  section,
  inscrits,
  preInscrits,
  maxCap,
  id
}) => {
  const totalReserved = inscrits + preInscrits;
  const remainingPlaces = Math.max(0, maxCap - inscrits); // confirmed take physical spot
  const fillPercentage = Math.min(100, Math.floor((inscrits / maxCap) * 100));

  // Determine color theme based on remaining physical spots
  const getColorScheme = () => {
    if (remainingPlaces <= 3) {
      return {
        bg: 'bg-red-500',
        text: 'text-red-600',
        lightBg: 'bg-red-50',
        border: 'border-red-200'
      };
    } else if (remainingPlaces <= 6) {
      return {
        bg: 'bg-brand-gold',
        text: 'text-[#D97706]', // dark gold
        lightBg: 'bg-amber-50',
        border: 'border-amber-200'
      };
    } else {
      return {
        bg: 'bg-brand-green',
        text: 'text-brand-green',
        lightBg: 'bg-green-50',
        border: 'border-green-100'
      };
    }
  };

  const scheme = getColorScheme();

  return (
    <div id={id} className={`p-4 rounded-xl border ${scheme.border} ${scheme.lightBg} transition-all duration-300`}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-sans font-bold text-brand-blue-deep">{section}</span>
        <div className="text-right">
          <span className={`text-xs font-bold ${scheme.text}`}>
            {remainingPlaces === 0 ? "Complet" : `${remainingPlaces} places libres`}
          </span>
          <span className="text-[10px] text-brand-muted block">
            sur {maxCap} max
          </span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="relative w-full h-3 bg-brand-border rounded-full overflow-hidden mb-1.5 shadow-inner">
        {/* Confirmed places bar */}
        <div
          className={`absolute top-0 left-0 h-full ${scheme.bg} transition-all duration-500`}
          style={{ width: `${fillPercentage}%` }}
        />
        {/* Pre-inscrits pending bar (striped) */}
        {preInscrits > 0 && (
          <div
            className="absolute top-0 h-full bg-brand-blue-light/50 stripes transition-all duration-500"
            style={{
              left: `${fillPercentage}%`,
              width: `${Math.min(100 - fillPercentage, (preInscrits / maxCap) * 100)}%`,
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(26,79,139,0.15) 4px, rgba(26,79,139,0.15) 8px)'
            }}
          />
        )}
      </div>

      <div className="flex justify-between text-[10px] text-brand-muted px-1">
        <span>Inscrits finalisés: <strong>{inscrits}</strong></span>
        {preInscrits > 0 && (
          <span className="text-brand-blue-medium">Pré-inscriptions en cours: <strong>{preInscrits}</strong></span>
        )}
      </div>
    </div>
  );
};
