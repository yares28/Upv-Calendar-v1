export interface User {
  id: number;
  name: string;
  email: string;
  savedFilters?: {
    degrees: string[];
    semesters: string[];
    subjects: string[];
  };
} 