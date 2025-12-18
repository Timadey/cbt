import { Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTimer } from '../../hooks/useTimer';

interface TimerProps {
    startTime: string;
    durationMinutes: number;
    onTimeup: () => void;
    className?: string;
}

export function Timer({ startTime, durationMinutes, onTimeup, className }: TimerProps) {
    const { formattedTime, isWarning } = useTimer({
        startTime,
        durationMinutes,
        onTimeup,
    });

    if (durationMinutes === 0) return null;

    return (
        <div className={cn(
            "flex items-center space-x-3 px-6 py-3 rounded-full shadow-lg border-2 transition-colors",
            isWarning
                ? "bg-red-50 border-red-500 text-red-600 dark:bg-red-900/20 animate-pulse"
                : "bg-white border-gray-100 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white",
            className
        )}>
            <Clock size={20} className={cn(isWarning ? "text-red-500" : "text-blue-500")} />
            <span className="font-mono text-xl font-bold tracking-wider">{formattedTime}</span>
        </div>
    );
}
