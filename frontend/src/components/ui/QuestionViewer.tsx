import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Question } from '../../types';
import { Button } from '../ui/Button';

interface QuestionViewerProps {
    questions: Record<string | number, Question>;
    onSaveAnswer: (questionId: string | number, answer: string) => void;
    onSubmit: () => void;
    answers: Record<string | number, string>;
}

export function QuestionViewer({ questions, onSaveAnswer, onSubmit, answers }: QuestionViewerProps) {
    const [currentId, setCurrentId] = useState(Object.keys(questions)[0]);
    const questionIds = Object.keys(questions);
    const currentIndex = questionIds.indexOf(currentId);
    const currentQuestion = questions[currentId];

    const handleNext = () => {
        if (currentIndex < questionIds.length - 1) {
            setCurrentId(questionIds[currentIndex + 1]);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentId(questionIds[currentIndex - 1]);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Progress */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Question {currentIndex + 1} <span className="text-gray-400 font-normal">of {questionIds.length}</span>
                    </h3>
                    <div className="h-1.5 w-32 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / questionIds.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {questionIds.map((id, idx) => (
                        <button
                            key={id}
                            onClick={() => setCurrentId(id)}
                            className={cn(
                                "w-10 h-10 rounded-xl text-sm font-semibold transition-all border",
                                currentId === id
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md scale-110 z-10"
                                    : answers[id]
                                        ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                                        : "bg-white border-gray-200 text-gray-500 hover:border-blue-400 dark:bg-gray-800 dark:border-gray-700"
                            )}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <p className="text-lg md:text-xl text-gray-800 dark:text-gray-100 leading-relaxed mb-10">
                    {currentQuestion.question}
                </p>

                <div className="grid gap-4">
                    {currentQuestion.options.map((option, idx) => {
                        const isSelected = answers[currentId] === idx.toString();
                        return (
                            <button
                                key={idx}
                                onClick={() => onSaveAnswer(currentId, idx.toString())}
                                className={cn(
                                    "flex items-center p-5 rounded-2xl border-2 transition-all text-left group",
                                    isSelected
                                        ? "bg-blue-50 border-blue-500 dark:bg-blue-900/20 shadow-sm"
                                        : "bg-gray-50 border-transparent hover:border-gray-200 dark:bg-gray-900/50 dark:hover:border-gray-600"
                                )}
                            >
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors",
                                    isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 dark:border-gray-600"
                                )}>
                                    {isSelected && <CheckCircle2 size={16} />}
                                </div>
                                <span className={cn(
                                    "text-base font-medium",
                                    isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                                )}>
                                    {option}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="rounded-2xl"
                >
                    <ChevronLeft size={20} className="mr-1" /> Previous
                </Button>

                {currentIndex === questionIds.length - 1 ? (
                    <Button
                        variant="primary"
                        onClick={onSubmit}
                        className="rounded-2xl bg-green-600 hover:bg-green-700 border-none px-8"
                    >
                        Submit Examination
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onClick={handleNext}
                        className="rounded-2xl px-8"
                    >
                        Next Question <ChevronRight size={20} className="ml-1" />
                    </Button>
                )}
            </div>
        </div>
    );
}
