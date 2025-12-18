export interface Question {
    id: string | number;
    question: string;
    options: string[];
    correct_option?: string;
}

export interface QuestionPaper {
    id: number;
    subject_name: string;
    total_questions: number;
    duration_minutes: number;
    proctoring_enabled: boolean;
    questions: Record<string | number, Question>;
}

export interface ExaminationResult {
    id: number;
    student_name: string;
    time_started: string;
    score?: number;
}
