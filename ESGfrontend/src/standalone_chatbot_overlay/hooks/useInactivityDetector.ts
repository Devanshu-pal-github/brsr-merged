import { useEffect, useRef, useCallback } from 'react';

export const useInactivityDetector = (
  onInactivity: (level: number) => void,
  timeouts: number[], // Array of timeouts in ms, e.g., [10000, 20000, 30000]
  isActive: boolean = true // Hook is active only if this is true
): void => {
  const inactivityTimers = useRef<NodeJS.Timeout[]>([]);
  const currentInactivityLevel = useRef<number>(0);

  const resetTimers = useCallback(() => {
    inactivityTimers.current.forEach(clearTimeout);
    inactivityTimers.current = [];
    currentInactivityLevel.current = 0;

    if (isActive && timeouts.length > 0) {
      timeouts.forEach((timeout, index) => {
        const timer = setTimeout(() => {
          currentInactivityLevel.current = index;
          onInactivity(index);
        }, timeout);
        inactivityTimers.current.push(timer);
      });
    }
  }, [onInactivity, timeouts, isActive]);

  useEffect(() => {
    if (!isActive) {
      inactivityTimers.current.forEach(clearTimeout);
      inactivityTimers.current = [];
      return;
    }

    const eventTypes = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    
    const activityHandler = () => {
      resetTimers();
    };

    eventTypes.forEach(type => window.addEventListener(type, activityHandler));
    resetTimers(); // Initial setup of timers

    return () => {
      eventTypes.forEach(type => window.removeEventListener(type, activityHandler));
      inactivityTimers.current.forEach(clearTimeout);
    };
  }, [resetTimers, isActive]);
};
