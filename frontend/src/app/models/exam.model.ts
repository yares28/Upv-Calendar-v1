/**
 * Exam interface matching the backend ExamDTO
 */
export interface Exam {
    id?: number;
    examDay: string;  // ISO format YYYY-MM-DD
    examHour: string; // ISO format HH:MM:SS
    durationMin: number;
    subjectCode: string;
    subjectName: string;
    acronym?: string;
    degree: string;
    courseYear: number;
    semester: number;
    examPlace?: string;
    comment?: string;
}

export interface ExamDay {
  date: Date;
  day: number;
  hasExams: boolean;
}

export interface MonthlyCalendar {
  year: number;
  month: number;
  monthName: string;
  days: ExamDay[][];
} 