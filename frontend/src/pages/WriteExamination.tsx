import { useState, useEffect } from 'react';
import { Timer } from '../components/ui/Timer';
import { QuestionViewer } from '../components/ui/QuestionViewer';
import { ProctoringPreview } from '../components/ui/ProctoringPreview';
import type { QuestionPaper } from '../types';
import api from '../api/client';

export default function WriteExamination() {
    const [paper, setPaper] = useState<QuestionPaper | null>(null);
    const [studentName, setStudentName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [livekitUrl, setLivekitUrl] = useState('');
    const [answers, setAnswers] = useState<Record<string | number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/student/api/examination');
                const data = response.data;
                setPaper(data.question_paper);
                setStudentName(data.student_name);
                setStartTime(data.time_started);
                setLivekitUrl(data.livekit_url);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to fetch examination:', err);
                setError('Failed to load examination. Please ensure you have a valid session.');
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSaveAnswer = (id: string | number, answer: string) => {
        setAnswers(prev => ({ ...prev, [id]: answer }));
    };

    const handleSubmit = async () => {
        if (confirm("Are you sure you want to submit your examination?")) {
            try {
                const response = await api.post('/student/api/submit', { answers });
                if (response.data.status === 'success') {
                    setIsSubmitted(true);
                    // Small delay before redirecting to show success state
                    setTimeout(() => {
                        window.location.replace(response.data.callback);
                    }, 2000);
                }
            } catch (err: any) {
                console.error('Submission failed:', err);
                alert(err.response?.data?.error || "Submission failed. Please check your connection.");
            }
        }
    };

    const handleTimeup = () => {
        setIsSubmitted(true);
        alert("Time is up! Your examination has been automatically submitted.");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !paper) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="bg-red-50 text-red-600 p-6 rounded-3xl max-w-md">
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p>{error || 'Something went wrong.'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 bg-red-600 text-white px-6 py-2 rounded-xl font-bold"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-3xl font-bold dark:text-white">Submission Successful</h2>
                <p className="text-gray-500 max-w-md">Your responses have been recorded. You can close this window or return to the dashboard.</p>
                <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/30">Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header with Title and Timer */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 sticky top-0 md:top-8 z-30 pt-4 md:pt-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {paper.subject_name}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">Examination in Progress</p>
                </div>

                <Timer
                    startTime={startTime}
                    durationMinutes={paper.duration_minutes}
                    onTimeup={handleTimeup}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                        <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Instructions</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
                            <li className="flex gap-2"><span>•</span> Do not refresh the page.</li>
                            <li className="flex gap-2"><span>•</span> AI Monitoring is enabled.</li>
                            <li className="flex gap-2"><span>•</span> Ensure you are in a quiet room.</li>
                        </ul>
                    </div>
                </div>

                {/* Main Examination Area */}
                <div className="lg:col-span-3">
                    <QuestionViewer
                        questions={paper.questions}
                        answers={answers}
                        onSaveAnswer={handleSaveAnswer}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>

            {/* AI Proctoring Preview */}
            <ProctoringPreview
                questionPaperId={paper.id}
                studentName={studentName}
                livekitUrl={livekitUrl}
                enabled={paper.proctoring_enabled}
            />
        </div>
    );
}
