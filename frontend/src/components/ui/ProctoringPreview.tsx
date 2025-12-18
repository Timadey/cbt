import { useAIProctoring } from '../../hooks/useAIProctoring';
import { cn } from '../../utils/cn';
import { Shield, ShieldAlert } from 'lucide-react';

interface ProctoringPreviewProps {
    questionPaperId: number | string;
    studentName: string;
    livekitUrl: string;
    enabled: boolean;
}

export function ProctoringPreview(props: ProctoringPreviewProps) {
    const { videoRef, status, isAlert } = useAIProctoring(props);

    if (!props.enabled) return null;

    return (
        <div className="fixed top-24 right-8 z-50 group">
            <div className={cn(
                "relative rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-2xl w-48 aspect-video bg-black",
                isAlert ? "border-red-500 scale-105" : "border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100"
            )}>
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />

                <div className={cn(
                    "absolute bottom-0 inset-x-0 p-2 text-[10px] font-bold text-white flex items-center gap-1.5",
                    isAlert ? "bg-red-500/80" : "bg-black/40 backdrop-blur-sm"
                )}>
                    {isAlert ? <ShieldAlert size={12} /> : <Shield size={12} className="text-blue-400" />}
                    <span className="truncate">{status}</span>
                </div>
            </div>
        </div>
    );
}
