import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, catchError, finalize, of, map, takeUntil } from 'rxjs';
import { Exam } from '../../models/exam.model';
import { ExamService } from '../../services/exam.service';
import { SubjectDTO } from '../../services/exam.service';

@Component({
  selector: 'app-exams-list',
  templateUrl: './exams-list.component.html',
  styleUrls: ['./exams-list.component.scss']
})
export class ExamsListComponent implements OnInit, OnDestroy {
  // To handle unsubscribe from observables
  private destroy$ = new Subject<void>();
  
  // Exam data
  exams$: Observable<Exam[]> | undefined;
  
  // UI state
  loading = false;
  error: string | null = null;

  // Filter states
  selectedSchool: string = 'ETSINF'; // Always ETSINF
  selectedDegree: string | null = null;
  selectedYear: number | null = null;
  selectedSemester: string | null = null;
  selectedSubject: string | null = null;
  searchQuery: string = '';

  // Filter options
  schools: string[] = ['ETSINF']; // Only ETSINF
  degrees: string[] = [];
  years: number[] = [];
  semesters: number[] = [];
  subjects: SubjectDTO[] = [];

  // Search query for filters
  degreeSearch: string = '';
  subjectSearch: string = '';

  constructor(private examService: ExamService, private router: Router) { }

  ngOnInit(): void {
    // Load the initial data needed for filtering
    this.loadInitialData();
    
    // Check if there are saved filters from the calendar view
    const savedFilters = this.examService.getSelectedFilters();
    if (savedFilters.degree) {
      this.selectedDegree = savedFilters.degree;
      this.selectedYear = savedFilters.year;
      this.selectedSemester = savedFilters.semester;
      this.selectedSubject = savedFilters.subject;
      
      // Load subjects for the selected degree after the other data is loaded
      setTimeout(() => {
        if (this.selectedDegree) {
          this.loadSubjectsForCurrentFilters();
          this.applyFilters();
        }
      }, 500);
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads initial data needed for the filters
   */
  loadInitialData(): void {
    this.loading = true;
    
    // Load ETSINF exams
    this.exams$ = this.examService.findExamsBySchool('ETSINF').pipe(
      catchError(error => {
        this.error = 'Failed to load exams. Please try again later.';
        console.error('Error loading exams:', error);
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
      })
    );
    
    // Load degrees for ETSINF
    this.examService.getDegreesBySchool('ETSINF')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (degrees) => {
          this.degrees = degrees;
          console.log('Loaded degrees for ETSINF:', degrees.length);
        },
        error: (error) => {
          console.error('Error loading degrees for ETSINF:', error);
          this.degrees = [];
        }
      });
    
    // Load course years
    this.examService.getAllCourseYearsDistinct()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (years) => {
          this.years = years;
          console.log('Loaded years:', years);
        },
        error: (error) => {
          console.error('Error loading years:', error);
          this.years = [];
        }
      });
    
    // Load semesters
    this.examService.getAllSemestersDistinct()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (semesters) => {
          this.semesters = semesters.map(s => parseInt(s, 10));
          console.log('Loaded semesters:', this.semesters);
        },
        error: (error) => {
          console.error('Error loading semesters:', error);
          this.semesters = [];
        }
      });
  }

  /**
   * Called when degree selection changes
   */
  onDegreeChange(): void {
    console.log('Degree changed to:', this.selectedDegree);
    
    // Reset all dependent filters
    this.selectedYear = null;
    this.selectedSemester = null;
    this.selectedSubject = null;
    
    // Update shared filter state
    this.examService.updateSelectedFilters({
      degree: this.selectedDegree,
      year: null,
      semester: null,
      subject: null
    });
    
    // Clear subjects when no degree is selected
    if (!this.selectedDegree) {
      this.subjects = [];
      this.applyFilters(); // Apply filters to update the exams list
      return;
    }
    
    // Load subjects for the selected degree
    this.loadSubjectsForCurrentFilters();
    
    // Apply filters to update the exams list
    this.applyFilters();
  }

  /**
   * Called when year selection changes
   */
  onYearChange(): void {
    console.log('Year changed to:', this.selectedYear);
    
    // Reset dependent filters
    this.selectedSemester = null;
    this.selectedSubject = null;
    
    // Update shared filter state
    this.examService.updateSelectedFilters({
      year: this.selectedYear,
      semester: null,
      subject: null
    });
    
    // Update subjects only if a degree is selected
    if (this.selectedDegree) {
      this.loadSubjectsForCurrentFilters();
    } else {
      this.subjects = [];
    }
    
    // Apply filters to update the exams list
    this.applyFilters();
  }

  /**
   * Called when semester selection changes
   */
  onSemesterChange(): void {
    console.log('Semester changed to:', this.selectedSemester);
    
    // Reset subject filter
    this.selectedSubject = null;
    
    // Update shared filter state
    this.examService.updateSelectedFilters({
      semester: this.selectedSemester,
      subject: null
    });
    
    // Update subjects only if a degree is selected
    if (this.selectedDegree) {
      this.loadSubjectsForCurrentFilters();
    } else {
      this.subjects = [];
    }
    
    // Apply filters to update the exams list
    this.applyFilters();
  }

  /**
   * Loads subjects based on current filter selections
   */
  loadSubjectsForCurrentFilters(): void {
    if (!this.selectedDegree) {
      this.subjects = [];
      return;
    }
    
    this.loading = true;
    
    // Use the service method to get subjects by degree with optional filters
    this.examService.getSubjectsByDegree(
      this.selectedDegree,
      this.selectedYear !== null ? this.selectedYear : undefined,
      this.selectedSemester !== null ? parseInt(this.selectedSemester, 10) : undefined
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        console.log(`Loaded ${subjects.length} subjects for degree ${this.selectedDegree}`);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.subjects = [];
        this.loading = false;
      }
    });
  }

  /**
   * Apply all filters to the exams list
   */
  applyFilters(): void {
    this.loading = true;
    
    // Always start with ETSINF exams
    let filteredExams$ = this.examService.findExamsBySchool('ETSINF');
    
    this.exams$ = filteredExams$.pipe(
      map((exams: Exam[]) => {
        let filtered = exams;
        
        // Apply degree filter
        if (this.selectedDegree) {
          filtered = filtered.filter(exam => exam.degree === this.selectedDegree);
        }
        
        // Apply year filter
        if (this.selectedYear !== null) {
          filtered = filtered.filter(exam => exam.courseYear === this.selectedYear);
        }
        
        // Apply semester filter
        if (this.selectedSemester) {
          const semester = parseInt(this.selectedSemester, 10);
          filtered = filtered.filter(exam => exam.semester === semester);
        }
        
        // Apply subject filter
        if (this.selectedSubject) {
          filtered = filtered.filter(exam => exam.subjectName === this.selectedSubject);
        }
        
        // Apply search query
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          filtered = filtered.filter(exam => 
            exam.subjectName.toLowerCase().includes(query) || 
            exam.subjectCode.toLowerCase().includes(query) ||
            (exam.examPlace && exam.examPlace.toLowerCase().includes(query))
          );
        }
        
        console.log(`Filtered exams: ${filtered.length} of ${exams.length}`);
        return filtered;
      }),
      catchError(error => {
        this.error = 'Failed to apply filters. Please try again later.';
        console.error('Error applying filters:', error);
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
      })
    );
  }

  /**
   * Reset all filters to their default state
   */
  resetFilters(): void {
    // School stays as ETSINF, reset everything else
    this.selectedDegree = null;
    this.selectedYear = null;
    this.selectedSemester = null;
    this.selectedSubject = null;
    this.searchQuery = '';
    this.degreeSearch = '';
    this.subjectSearch = '';
    
    // Clear subjects
    this.subjects = [];
    
    // Load all ETSINF exams
    this.loading = true;
    this.exams$ = this.examService.findExamsBySchool('ETSINF').pipe(
      catchError(error => {
        this.error = 'Failed to load exams. Please try again later.';
        console.error('Error loading exams:', error);
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
      })
    );
  }

  // Filter helpers
  get filteredDegrees(): string[] {
    return this.degrees.filter(degree => 
      !this.degreeSearch || degree.toLowerCase().includes(this.degreeSearch.toLowerCase())
    );
  }

  get filteredSubjects(): SubjectDTO[] {
    return this.subjects.filter(subject => 
      !this.subjectSearch || subject.name.toLowerCase().includes(this.subjectSearch.toLowerCase())
    );
  }

  get filteredSemesters(): number[] {
    return this.semesters;
  }

  // Helper to extract school from degree string
  getSchoolFromDegree(degree: string): string {
    if (!degree) return 'N/A';
    const parts = degree.split(' ');
    return parts.length > 0 ? parts[0] : 'N/A';
  }

  // Navigation methods
  viewExam(examId: number): void {
    this.router.navigate(['/exams', examId]);
  }

  editExam(examId: number): void {
    this.router.navigate(['/exams', examId, 'edit']);
  }

  deleteExam(examId: number): void {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.loading = true;
      this.examService.deleteExam(examId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Reload exams after deletion
            this.applyFilters();
          },
          error: (error) => {
            this.error = 'Failed to delete exam. Please try again later.';
            console.error('Error deleting exam:', error);
            this.loading = false;
          }
        });
    }
  }

  createExam(): void {
    this.router.navigate(['/exams/create']);
  }

  // Date formatting helpers
  formatExamDate(examDay: string, examHour: string): string {
    if (!examDay || !examHour) {
      return 'Not scheduled';
    }
    
    try {
      const dateObj = new Date(`${examDay}T${examHour}`);
      
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return dateObj.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return `${examDay} ${examHour}`;
    }
  }
  
  getExamDateObject(examDay: string, examHour: string): Date | null {
    if (!examDay || !examHour) {
      return null;
    }
    
    try {
      return new Date(`${examDay}T${examHour}`);
    } catch (error) {
      console.error('Error creating date object:', error);
      return null;
    }
  }
} 