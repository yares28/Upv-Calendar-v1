import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, tap, map, of, retry, shareReplay, BehaviorSubject } from 'rxjs';
import { Exam } from '../models/exam.model';
import { environment } from 'src/environments/environment';

// Define a Subject interface that matches the backend DTO
export interface SubjectDTO {
  name: string;
  acronym: string;
}

// Define filter interface for type safety
export interface ExamFilters {
  school: string | null;
  degree: string | null;
  year: number | null;
  semester: string | null;
  subject: string | null;
}

/**
 * Service for API communication with the exam endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = `${environment.apiUrl}/api/exams`;

  // Add cache properties for frequently accessed data
  private cachedExams$: Observable<Exam[]> | null = null;
  private cachedSemesters$: Observable<number[]> | null = null;
  private cachedCourseYears$: Observable<number[]> | null = null;
  private cachedSubjects$: Observable<SubjectDTO[]> | null = null;
  private cachedDegrees$: Observable<string[]> | null = null;
  private cachedSchools$: { [key: string]: Observable<string[]> } = {};

  // Replace direct object with BehaviorSubject for reactive updates
  private selectedFiltersSubject = new BehaviorSubject<ExamFilters>({
    school: 'ETSINF',
    degree: null,
    year: null,
    semester: null,
    subject: null
  });

  // Expose an observable that components can subscribe to
  public selectedFilters$ = this.selectedFiltersSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('ExamService initialized with API URL:', this.apiUrl);
  }

  /**
   * Get all exams - cached with deduplication
   */
  getAllExams(): Observable<Exam[]> {
    console.log('Getting exams - may use cache if available');
    
    // Return cached observable if available
    if (this.cachedExams$) {
      return this.cachedExams$;
    }
    
    console.log('Fetching all exams from:', `${this.apiUrl}`);
    this.cachedExams$ = this.http.get<Exam[]>(this.apiUrl)
      .pipe(
        retry(2), // Retry up to 2 times before failing
        tap(data => {
          console.log('Received exams data, count:', data.length);
          if (data.length === 0) {
            console.warn('API returned 0 exams. This might indicate a database or API issue.');
          }
        }),
        catchError(error => {
          console.error('Error fetching exams:', error);
          if (error.status === 0) {
            console.error('Network error - could not connect to backend. Check API URL and CORS settings.');
          } else if (error.status === 404) {
            console.error('API endpoint not found. Check API URL configuration.');
          }
          this.cachedExams$ = null; // Clear cache on error
          return this.handleError(error);
        }),
        // Use shareReplay to share the result with multiple subscribers
        shareReplay(1)
      );
      
    return this.cachedExams$;
  }

  /**
   * Get a single exam by ID
   */
  getExamById(id: number): Observable<Exam> {
    console.log(`Fetching exam with ID ${id} from: ${this.apiUrl}/${id}`);
    return this.http.get<Exam>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(data => console.log(`Received exam data for ID ${id}:`, data)),
        catchError(error => {
          console.error(`Error fetching exam with ID ${id}:`, error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Create a new exam
   */
  createExam(exam: Exam): Observable<Exam> {
    console.log('Creating new exam with data:', exam);
    return this.http.post<Exam>(this.apiUrl, exam)
      .pipe(
        tap(data => console.log('Created exam data:', data)),
        catchError(error => {
          console.error('Error creating exam:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Update an existing exam
   */
  updateExam(id: number, exam: Exam): Observable<Exam> {
    console.log(`Updating exam with ID ${id}, data:`, exam);
    return this.http.put<Exam>(`${this.apiUrl}/${id}`, exam)
      .pipe(
        tap(data => console.log(`Updated exam data for ID ${id}:`, data)),
        catchError(error => {
          console.error(`Error updating exam with ID ${id}:`, error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Delete an exam
   */
  deleteExam(id: number): Observable<void> {
    console.log(`Deleting exam with ID ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => console.log(`Deleted exam with ID ${id}`)),
        catchError(error => {
          console.error(`Error deleting exam with ID ${id}:`, error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Find exams by subject code
   */
  findExamsBySubjectCode(subjectCode: string): Observable<Exam[]> {
    console.log(`Fetching exams by subject code ${subjectCode}`);
    return this.http.get<Exam[]>(`${this.apiUrl}/subject/${subjectCode}`)
      .pipe(
        tap(data => console.log(`Received exams for subject code ${subjectCode}:`, data)),
        catchError(error => {
          console.error(`Error fetching exams for subject code ${subjectCode}:`, error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Find exams by school (formerly degree)
   * When ETSINF is selected, the backend will specifically query the etsinf_exams table
   */
  findExamsBySchool(school: string): Observable<Exam[]> {
    console.log(`Fetching exams by school ${school}`);
    
    // Special handling for ETSINF school 
    if (school === 'ETSINF') {
      console.log('ETSINF school selected - using specialized ETSINF exam endpoint');
      return this.http.get<Exam[]>(`${this.apiUrl}/school/ETSINF`)
        .pipe(
          tap(data => console.log(`Received ETSINF exams, count:`, data.length)),
          catchError(error => {
            console.error(`Error fetching ETSINF exams:`, error);
            return this.handleError(error);
          })
        );
    }
    
    // For other schools, use the school endpoint
    return this.http.get<Exam[]>(`${this.apiUrl}/school/${school}`)
      .pipe(
        tap(data => console.log(`Received exams for school ${school}:`, data)),
        catchError(error => {
          console.error(`Error fetching exams for school ${school}:`, error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Find exams by course year and semester
   */
  findExamsByCourseYearAndSemester(courseYear: number, semester: number): Observable<Exam[]> {
    const params = new HttpParams()
      .set('courseYear', courseYear.toString())
      .set('semester', semester.toString());
    
    console.log(`Fetching exams by course year ${courseYear} and semester ${semester}`);
    return this.http.get<Exam[]>(`${this.apiUrl}/course`, { params })
      .pipe(
        tap(data => console.log(`Received exams for course year ${courseYear}, semester ${semester}:`, data)),
        catchError(error => {
          console.error(`Error fetching exams for course year ${courseYear}, semester ${semester}:`, error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Find exams by date range
   */
  findExamsByDateRange(startDate: string, endDate: string): Observable<Exam[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    console.log(`Fetching exams between ${startDate} and ${endDate}`);
    return this.http.get<Exam[]>(`${this.apiUrl}/daterange`, { params })
      .pipe(
        tap(data => console.log(`Received exams between ${startDate} and ${endDate}:`, data)),
        catchError(error => {
          console.error(`Error fetching exams between ${startDate} and ${endDate}:`, error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Find exams by subject name containing text
   */
  findExamsBySubjectNameContaining(query: string): Observable<Exam[]> {
    const params = new HttpParams().set('query', query);
    console.log(`Searching exams with subject name containing: ${query}`);
    return this.http.get<Exam[]>(`${this.apiUrl}/search/subject`, { params })
      .pipe(
        tap(data => console.log(`Received exams with subject name containing ${query}:`, data)),
        catchError(error => {
          console.error(`Error searching exams with subject name containing ${query}:`, error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Find exams by exam place containing text
   */
  findExamsByExamPlaceContaining(query: string): Observable<Exam[]> {
    const params = new HttpParams().set('query', query);
    console.log(`Searching exams with exam place containing: ${query}`);
    return this.http.get<Exam[]>(`${this.apiUrl}/search/place`, { params })
      .pipe(
        tap(data => console.log(`Received exams with exam place containing ${query}:`, data)),
        catchError(error => {
          console.error(`Error searching exams with exam place containing ${query}:`, error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get all unique degrees - cached with deduplication
   * These are the actual degrees (former sub-degrees)
   */
  getAllDegrees(): Observable<string[]> {
    console.log('Getting all degrees - may use cache if available');
    
    // Return cached observable if available
    if (this.cachedDegrees$) {
      return this.cachedDegrees$;
    }
    
    console.log('Fetching all degrees from:', `${this.apiUrl}/degrees/distinct`);
    this.cachedDegrees$ = this.http.get<string[]>(`${this.apiUrl}/degrees/distinct`)
      .pipe(
        tap(data => console.log('Received degrees data, count:', data.length)),
        catchError(error => {
          console.error('Error fetching degrees:', error);
          this.cachedDegrees$ = null; // Clear cache on error
          return this.handleError(error);
        }),
        shareReplay(1)
      );
      
    return this.cachedDegrees$;
  }

  /**
   * Get all unique schools (formerly degrees)
   */
  getAllSchools(): Observable<string[]> {
    console.log('Fetching all schools from:', `${this.apiUrl}/schools/distinct`);
    return this.http.get<string[]>(`${this.apiUrl}/schools/distinct`)
      .pipe(
        tap(data => console.log('Received schools data:', data)),
        catchError(error => {
          console.error('Error fetching schools:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get all unique semesters - cached with deduplication
   */
  getAllSemesters(): Observable<number[]> {
    console.log('Getting semesters - may use cache if available');
    
    // Return cached observable if available
    if (this.cachedSemesters$) {
      return this.cachedSemesters$;
    }
    
    console.log('Fetching all semesters from:', `${this.apiUrl}/semesters/distinct`);
    this.cachedSemesters$ = this.http.get<number[]>(`${this.apiUrl}/semesters/distinct`)
      .pipe(
        retry(2), // Retry up to 2 times
        tap(data => console.log('Received semesters data:', data)),
        catchError(error => {
          console.error('Error fetching semesters:', error);
          this.cachedSemesters$ = null; // Clear cache on error
          // Return default values as fallback for critical path
          console.warn('Returning default semesters [1, 2] as fallback');
          return of([1, 2]);
        }),
        shareReplay(1)
      );
      
    return this.cachedSemesters$;
  }

  /**
   * Get all unique course years - cached with deduplication
   */
  getAllCourseYears(): Observable<number[]> {
    console.log('Getting course years - may use cache if available');
    
    // Return cached observable if available
    if (this.cachedCourseYears$) {
      return this.cachedCourseYears$;
    }
    
    console.log('Fetching all course years from:', `${this.apiUrl}/courseyears/distinct`);
    this.cachedCourseYears$ = this.http.get<number[]>(`${this.apiUrl}/courseyears/distinct`)
      .pipe(
        retry(2), // Retry up to 2 times
        tap(data => console.log('Received course years data:', data)),
        catchError(error => {
          console.error('Error fetching course years:', error);
          this.cachedCourseYears$ = null; // Clear cache on error
          // Return default values as fallback for critical path
          console.warn('Returning default course years [1, 2] as fallback');
          return of([1, 2]);
        }),
        shareReplay(1)
      );
      
    return this.cachedCourseYears$;
  }

  /**
   * Get all subjects with acronyms - cached with deduplication
   * Returns distinct subjects from the database
   */
  getAllSubjectsWithAcronyms(): Observable<SubjectDTO[]> {
    console.log('Getting subjects - may use cache if available');
    
    // Return cached observable if available
    if (this.cachedSubjects$) {
      return this.cachedSubjects$;
    }
    
    console.log('Fetching all subjects with acronyms from:', `${this.apiUrl}/subjects/distinct`);
    this.cachedSubjects$ = this.http.get<any>(`${this.apiUrl}/subjects/distinct`)
      .pipe(
        retry(2), // Retry up to 2 times
        map(response => {
          console.log('Raw subjects response:', response);
          
          // Check if the response is already an array
          if (Array.isArray(response)) {
            console.log('Response is already an array, returning directly');
            return response;
          }
          
          // Check if the response has a data property that is an array
          if (response && response.data && Array.isArray(response.data)) {
            console.log('Response has data property that is an array, extracting it');
            return response.data;
          }
          
          // Try to handle other potential formats
          if (typeof response === 'object') {
            console.log('Response is an object, trying to extract values');
            const values = Object.values(response);
            if (Array.isArray(values[0])) {
              return values[0];
            }
          }
          
          console.error('Unhandled response format:', response);
          return []; // Return empty array as fallback
        }),
        tap(data => console.log('Processed subjects with acronyms data:', data)),
        catchError(error => {
          console.error('Error fetching subjects with acronyms:', error);
          this.cachedSubjects$ = null; // Clear cache on error
          // Return empty array as fallback
          console.warn('Returning empty subjects array as fallback');
          return of([]);
        }),
        shareReplay(1)
      );
      
    return this.cachedSubjects$;
  }

  /**
   * Get degrees for a specific school
   */
  getDegreesBySchool(school: string): Observable<string[]> {
    console.log(`Getting degrees for school ${school} - may use cache if available`);
    
    // Return cached observable if available for this school
    if (this.cachedSchools$[school]) {
      return this.cachedSchools$[school];
    }
    
    console.log(`Fetching degrees for school ${school} from:`, `${this.apiUrl}/degrees/bySchool/${school}`);
    this.cachedSchools$[school] = this.http.get<string[]>(`${this.apiUrl}/degrees/bySchool/${school}`)
      .pipe(
        tap(data => console.log(`Received degrees for school ${school}, count:`, data.length)),
        catchError(error => {
          console.error(`Error fetching degrees for school ${school}:`, error);
          delete this.cachedSchools$[school]; // Clear cache for this school on error
          return this.handleError(error);
        }),
        shareReplay(1)
      );
      
    return this.cachedSchools$[school];
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cachedExams$ = null;
    this.cachedSemesters$ = null;
    this.cachedCourseYears$ = null;
    this.cachedSubjects$ = null;
    this.cachedDegrees$ = null;
    this.cachedSchools$ = {};
    console.log('All caches cleared');
  }

  /**
   * Error handler for HTTP requests
   */
  private handleError(error: any) {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      
      // Add more context based on status code
      if (error.status === 0) {
        errorMessage += ' - Network error. Check if backend server is running and accessible.';
      } else if (error.status === 403 || error.status === 401) {
        errorMessage += ' - Authentication error. Check CORS configuration and credentials.';
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get all unique semesters (distinct values) - cached with deduplication
   */
  getAllSemestersDistinct(): Observable<string[]> {
    console.log('Getting distinct semesters - may use cache if available');
    
    // Return cached observable if available
    if (this.cachedSemesters$) {
      return this.cachedSemesters$.pipe(
        map(semesters => semesters.map(s => s.toString()))
      );
    }
    
    console.log('Fetching all distinct semesters from:', `${this.apiUrl}/semesters/distinct`);
    return this.http.get<string[]>(`${this.apiUrl}/semesters/distinct`)
      .pipe(
        retry(2), // Retry up to 2 times
        tap(data => console.log('Received distinct semesters data:', data)),
        catchError(error => {
          console.error('Error fetching distinct semesters:', error);
          // Return default values as fallback for critical path
          console.warn('Returning default semesters ["1", "2"] as fallback');
          return of(["1", "2"]);
        })
      );
  }

  /**
   * Get all unique course years (distinct values) - cached with deduplication
   */
  getAllCourseYearsDistinct(): Observable<number[]> {
    console.log('Getting distinct course years - may use cache if available');
    
    // Return cached observable if available
    if (this.cachedCourseYears$) {
      return this.cachedCourseYears$;
    }
    
    console.log('Fetching all distinct course years from:', `${this.apiUrl}/courseyears/distinct`);
    this.cachedCourseYears$ = this.http.get<number[]>(`${this.apiUrl}/courseyears/distinct`)
      .pipe(
        retry(2), // Retry up to 2 times
        tap(data => console.log('Received distinct course years data:', data)),
        catchError(error => {
          console.error('Error fetching distinct course years:', error);
          this.cachedCourseYears$ = null; // Clear cache on error
          // Return default values as fallback for critical path
          console.warn('Returning default course years [1, 2] as fallback');
          return of([1, 2]);
        }),
        shareReplay(1)
      );
      
    return this.cachedCourseYears$;
  }

  /**
   * Get all subjects with acronyms (distinct values) - cached with deduplication
   */
  getAllSubjectsWithAcronymsDistinct(): Observable<SubjectDTO[]> {
    console.log('Getting distinct subjects - may use cache if available');
    
    // Return cached observable if available
    if (this.cachedSubjects$) {
      return this.cachedSubjects$;
    }
    
    console.log('Fetching all distinct subjects with acronyms from:', `${this.apiUrl}/subjects/distinct`);
    this.cachedSubjects$ = this.http.get<SubjectDTO[]>(`${this.apiUrl}/subjects/distinct`)
      .pipe(
        retry(2), // Retry up to 2 times
        tap(data => console.log('Received distinct subjects with acronyms data:', data)),
        catchError(error => {
          console.error('Error fetching distinct subjects with acronyms:', error);
          this.cachedSubjects$ = null; // Clear cache on error
          // Return empty array as fallback
          console.warn('Returning empty subjects array as fallback');
          return of([]);
        }),
        shareReplay(1)
      );
      
    return this.cachedSubjects$;
  }

  /**
   * Get subjects for a specific degree, and optionally filtered by course year and semester
   * This supports the hierarchical cascading filters
   */
  getSubjectsByDegree(degree: string, courseYear?: number, semester?: number): Observable<SubjectDTO[]> {
    console.log(`Getting subjects for degree ${degree}, courseYear: ${courseYear}, semester: ${semester}`);
    
    // Build query parameters
    let params = new HttpParams();
    
    if (courseYear !== undefined) {
      params = params.set('courseYear', courseYear.toString());
    }
    
    if (semester !== undefined && semester !== null) {
      params = params.set('semester', semester.toString());
    }
    
    // Use the dedicated backend endpoint
    return this.http.get<SubjectDTO[]>(`${this.apiUrl}/subjects/byDegree/${degree}`, { params })
      .pipe(
        tap(subjects => console.log(`Received ${subjects.length} subjects for degree ${degree}`)),
        catchError(error => {
          console.error(`Error getting subjects for degree ${degree}:`, error);
          return of([]);
        })
      );
  }

  /**
   * Get the current shared filter state
   */
  getSelectedFilters(): ExamFilters {
    return this.selectedFiltersSubject.getValue();
  }

  /**
   * Update the shared filter state and notify all subscribers
   */
  updateSelectedFilters(filters: Partial<ExamFilters>): ExamFilters {
    const currentFilters = this.selectedFiltersSubject.getValue();
    const updatedFilters = { ...currentFilters, ...filters };
    this.selectedFiltersSubject.next(updatedFilters);
    console.log('Updated shared filter state:', updatedFilters);
    return updatedFilters;
  }

  /**
   * Get filtered exams based on current filter state
   * This method will apply all active filters and return matching exams
   */
  getFilteredExams(): Observable<Exam[]> {
    const filters = this.getSelectedFilters();
    console.log('Fetching filtered exams with criteria:', filters);
    
    // Start with base URL for the appropriate school
    let apiEndpoint = `${this.apiUrl}/school/${filters.school || 'ETSINF'}`;
    
    // Build params for additional filters
    let params = new HttpParams();
    
    if (filters.degree) {
      params = params.set('degree', filters.degree);
    }
    
    if (filters.year !== null) {
      params = params.set('courseYear', filters.year.toString());
    }
    
    if (filters.semester) {
      params = params.set('semester', filters.semester.toString());
    }
    
    if (filters.subject) {
      params = params.set('subject', filters.subject);
    }
    
    // Make the HTTP request with all applicable filters
    return this.http.get<Exam[]>(apiEndpoint, { params })
      .pipe(
        tap(exams => console.log(`Retrieved ${exams.length} filtered exams`)),
        catchError(error => {
          console.error('Error fetching filtered exams:', error);
          return of([]);
        })
      );
  }

  /**
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.selectedFiltersSubject.next({
      school: 'ETSINF',
      degree: null,
      year: null,
      semester: null,
      subject: null
    });
    console.log('Filters reset to defaults');
  }
} 