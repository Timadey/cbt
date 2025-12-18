import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';

interface UseTimerProps {
    startTime: string; // ISO string
    durationMinutes: number;
    onTimeup: () => void;
}

export function useTimer({ startTime, durationMinutes, onTimeup }: UseTimerProps) {
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

    useEffect(() => {
        if (!startTime || durationMinutes <= 0) return;

        const start = dayjs(startTime);
        const end = start.add(durationMinutes, 'minute');

        const updateTimer = () => {
            const now = dayjs();
            const diff = end.diff(now, 'second');

            if (diff <= 0) {
                setRemainingSeconds(0);
                onTimeup();
                return false;
            }

            setRemainingSeconds(diff);
            return true;
        };

        updateTimer();
        const interval = setInterval(() => {
            if (!updateTimer()) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, durationMinutes, onTimeup]);

    const formatTime = useCallback(() => {
        if (remainingSeconds === null) return '--:--:--';
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;

        return [hours, minutes, seconds]
            .map(v => v.toString().padStart(2, '0'))
            .join(':');
    }, [remainingSeconds]);

    return {
        remainingSeconds,
        formattedTime: formatTime(),
        isWarning: remainingSeconds !== null && remainingSeconds < 300, // 5 minutes
    };
}
