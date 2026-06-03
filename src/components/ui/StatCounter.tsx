/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

interface StatCounterProps {
  targetValue: number;
  suffix?: string;
  durationMs?: number;
  id?: string;
  sizeClass?: string;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  targetValue,
  suffix = "",
  durationMs = 1500,
  id,
  sizeClass = 'text-3xl md:text-4xl',
}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / durationMs, 1);
      
      setValue(Math.floor(progressRatio * targetValue));

      if (progress < durationMs) {
        requestAnimationFrame(step);
      } else {
        setValue(targetValue);
      }
    };

    requestAnimationFrame(step);
  }, [targetValue, durationMs]);

  return (
    <span id={id} className={`font-sans font-bold ${sizeClass} text-brand-gold tabular-nums transition-all`}>
      {value}
      {suffix}
    </span>
  );
};
