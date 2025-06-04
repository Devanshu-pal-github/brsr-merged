import { useEffect, useRef } from 'react';

export const useInactivityDetector = ({ timeouts, onTimeout }) => {
    const timeoutIds = useRef([]);

    const resetTimeouts = () => {
        timeoutIds.current.forEach(clearTimeout);
        timeoutIds.current = timeouts.map((timeout, index) => {
            return setTimeout(() => {
                onTimeout(index);
            }, timeout);
        });
    };

    const handleActivity = () => {
        resetTimeouts();
    };

    useEffect(() => {
        resetTimeouts();

        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
        events.forEach(event => window.addEventListener(event, handleActivity));

        return () => {
            timeoutIds.current.forEach(clearTimeout);
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [timeouts, onTimeout]);
};