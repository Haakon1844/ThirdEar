import { useState, useEffect, useRef, useCallback } from 'react';

// Sound definitions with metadata
export const SOUND_TYPES = {
  car_horn: {
    label: 'Car Horn',
    emoji: '🚗',
    urgency: 'high',
    color: '#FF6B35',
    description: 'Vehicle horn detected nearby',
  },
  siren: {
    label: 'Emergency Siren',
    emoji: '🚨',
    urgency: 'critical',
    color: '#FF2D55',
    description: 'Emergency vehicle approaching',
  },
  dog_bark: {
    label: 'Dog Barking',
    emoji: '🐕',
    urgency: 'medium',
    color: '#FFB800',
    description: 'Dog barking detected',
  },
  smoke_alarm: {
    label: 'Smoke Alarm',
    emoji: '🔥',
    urgency: 'critical',
    color: '#FF2D55',
    description: 'Smoke alarm is sounding',
  },
  doorbell: {
    label: 'Doorbell',
    emoji: '🔔',
    urgency: 'low',
    color: '#4ECDC4',
    description: 'Someone at the door',
  },
  glass_break: {
    label: 'Glass Breaking',
    emoji: '💥',
    urgency: 'high',
    color: '#FF6B35',
    description: 'Glass breakage detected',
  },
  scream: {
    label: 'Scream / Shout',
    emoji: '📢',
    urgency: 'high',
    color: '#FF6B35',
    description: 'Loud human voice detected',
  },
};

// Simulated detection intervals (ms) — in real app, replace with TFLite/YAMNet inference
const DETECTION_CONFIG = {
  car_horn:    { minInterval: 8000,  maxInterval: 20000, confidence: () => 0.75 + Math.random() * 0.2 },
  siren:       { minInterval: 15000, maxInterval: 45000, confidence: () => 0.85 + Math.random() * 0.14 },
  dog_bark:    { minInterval: 6000,  maxInterval: 18000, confidence: () => 0.65 + Math.random() * 0.25 },
  smoke_alarm: { minInterval: 30000, maxInterval: 90000, confidence: () => 0.90 + Math.random() * 0.09 },
  doorbell:    { minInterval: 10000, maxInterval: 35000, confidence: () => 0.80 + Math.random() * 0.18 },
  glass_break: { minInterval: 20000, maxInterval: 60000, confidence: () => 0.70 + Math.random() * 0.25 },
  scream:      { minInterval: 25000, maxInterval: 70000, confidence: () => 0.68 + Math.random() * 0.27 },
};

// Confidence threshold to suppress false positives
const CONFIDENCE_THRESHOLD = 0.70;

export function useSoundDetection({ enabledSounds, onDetected, isListening }) {
  const timersRef = useRef({});
  const [lastDetected, setLastDetected] = useState(null);

  const scheduleDetection = useCallback((soundKey) => {
    if (timersRef.current[soundKey]) {
      clearTimeout(timersRef.current[soundKey]);
    }

    const cfg = DETECTION_CONFIG[soundKey];
    const delay =
      cfg.minInterval + Math.random() * (cfg.maxInterval - cfg.minInterval);

    timersRef.current[soundKey] = setTimeout(() => {
      if (!enabledSounds[soundKey]) {
        // Still reschedule even if disabled, so it fires when re-enabled
        scheduleDetection(soundKey);
        return;
      }

      const confidence = cfg.confidence();
      if (confidence >= CONFIDENCE_THRESHOLD) {
        const event = {
          id: Date.now() + '_' + soundKey,
          soundKey,
          ...SOUND_TYPES[soundKey],
          confidence: Math.round(confidence * 100),
          timestamp: new Date(),
          // Simulated direction (0-359 degrees)
          direction: Math.floor(Math.random() * 360),
        };

        setLastDetected(event);
        onDetected(event);
      }

      // Reschedule
      scheduleDetection(soundKey);
    }, delay);
  }, [enabledSounds, onDetected]);

  useEffect(() => {
    if (!isListening) {
      // Clear all timers
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
      return;
    }

    // Start detection for all sounds
    Object.keys(SOUND_TYPES).forEach(scheduleDetection);

    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
    };
  }, [isListening, scheduleDetection]);

  return { lastDetected };
}

// Direction helpers
export function getDirectionLabel(degrees) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(degrees / 45) % 8;
  return dirs[idx];
}

export function getDirectionArrow(degrees) {
  // Returns a CSS rotation for a directional arrow
  return degrees;
}
