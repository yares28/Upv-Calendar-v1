import { Component, OnInit, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { ExamService, SubjectDTO, ExamFilters } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { Exam, MonthlyCalendar, ExamDay } from '../../models/exam.model';
import { RouterWrapperService } from '../../router-wrapper.service';
import { forkJoin, Subject as RxSubject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TooltipPositionService, TooltipPosition } from '../../services/tooltip-position.service';

// Local interface for simplifying subject display in the UI
interface Subject {
  name: string;
  acronym: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: false
})
export class LandingComponent implements OnInit, OnDestroy {
  // Theme settings
  isDarkMode: boolean = false;

  // Authentication modal settings
  showAuthModal: boolean = false;
  authMode: 'login' | 'register' = 'login';
  authForm = {
    name: '',
    email: '',
    password: ''
  };
  
  // Notification settings
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';

  // Dropdown states
  openDropdowns: { [key: string]: boolean } = {
    school: false,
    degree: false,
    semester: false,
    courseYear: false,
    subject: false
  };

  // Filter data
  schools: string[] = ['ETSINF']; // Main schools/faculties
  degrees: string[] = []; // Specific degrees under schools
  semesters: { value: number, label: string }[] = []; // Will map DB values 1/2 to display values A/B
  courseYears: number[] = [];
  subjects: Subject[] = [];
  
  // Selected filters
  selectedSchools: string[] = [];
  selectedDegrees: string[] = [];
  selectedSemesters: number[] = [];
  selectedCourseYears: number[] = [];
  selectedSubjects: string[] = [];

  // Search filters
  schoolSearch: string = '';
  degreeSearch: string = '';
  subjectSearch: string = '';
  
  // Private backing fields for search property values
  private _schoolSearch: string = '';
  private _degreeSearch: string = '';
  private _subjectSearch: string = '';

  // Filtered data for search
  filteredSchools: string[] = [];
  filteredDegrees: string[] = [];
  filteredSubjects: Subject[] = [];

  // Display mappings for semester values
  semesterDisplayMap: { [key: number]: string } = {
    1: 'A',
    2: 'B'
  };

  // Exam data
  allExams: Exam[] = [];
  filteredExams: Exam[] = [];
  filteredMonths: MonthlyCalendar[] = [];
  
  // Date selection
  selectedDate: Date | null = null;
  tooltipExams: Exam[] = [];
  showExamTooltip: boolean = false;
  tooltipPosition: TooltipPosition = {
    top: '0px',
    left: '0px',
    transform: '',
    transformOrigin: '',
    placement: 'bottom',
    arrowTransform: ''
  };
  
  // Event handler cleanup functions
  private resizeHandlerCleanup: (() => void) | null = null;
  private scrollHandlerCleanup: (() => void) | null = null;
  
  // Reference to the current selected element for repositioning
  private currentTargetElement: HTMLElement | null = null;
  
  // For unsubscribing from observables
  private destroy$ = new RxSubject<void>();
  private filterSubscription: Subscription | null = null;

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  constructor(
    private examService: ExamService,
    private authService: AuthService,
    private router: RouterWrapperService,
    private tooltipPositionService: TooltipPositionService
  ) {}

  ngOnInit(): void {
    // Check for saved theme preference
    this.loadThemePreference();
    
    // Load data from backend
    this.loadFilterData();
    
    // Set up resize handler for tooltip repositioning
    this.resizeHandlerCleanup = this.tooltipPositionService.addResizeHandler(() => {
      this.updateTooltipPosition();
    });
    
    // Set up scroll handler for tooltip repositioning
    this.scrollHandlerCleanup = this.tooltipPositionService.addScrollHandler(() => {
      this.updateTooltipPosition();
    });

    // Watch for search input changes
    this.setupSearchWatchers();
    
    // Subscribe to filter changes from the ExamService
    this.subscribeToFilterChanges();
  }
  
  ngOnDestroy(): void {
    // Clean up resize handler
    if (this.resizeHandlerCleanup) {
      this.resizeHandlerCleanup();
    }
    
    // Clean up scroll handler
    if (this.scrollHandlerCleanup) {
      this.scrollHandlerCleanup();
    }
    
    // Clean up all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Subscribe to changes in the selected filters from the ExamService
   */
  private subscribeToFilterChanges(): void {
    this.examService.selectedFilters$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters: ExamFilters) => {
        console.log('Calendar received filter update:', filters);
        
        // Update local filter state based on shared state
        if (filters.school) {
          this.selectedSchools = [filters.school];
        }
        
        if (filters.degree) {
          this.selectedDegrees = [filters.degree];
          // Load degrees for the selected school if needed
          if (this.degrees.length === 0 || !this.degrees.includes(filters.degree)) {
            this.loadSchoolDegrees();
          }
        }
        
        if (filters.year !== null) {
          this.selectedCourseYears = [filters.year];
        }
        
        if (filters.semester !== null) {
          this.selectedSemesters = filters.semester ? [parseInt(filters.semester, 10)] : [];
        }
        
        if (filters.subject) {
          this.selectedSubjects = [filters.subject];
          // Load subjects for the current filters if needed
          if (this.subjects.length === 0) {
            this.loadSubjects();
          }
        }
        
        // Apply filters to update the calendar
        this.applyFilters();
      });
  }

  loadThemePreference(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  applyTheme(): void {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  loadFilterData(): void {
    console.log('Starting to load filter data...');
    // Load all critical data in parallel but only once
    this.loadAllCriticalData();
  }
  
  private loadAllCriticalData(): void {
    // First, set default schools - this is a critical piece that shouldn't rely on API
    this.schools = ['ETSINF']; // Main school/faculty

    // Load schools from the API
    this.loadSchools();
    
    // Also load the other filter data
    this.loadSemesters();
    this.loadCourseYears();
    this.loadSubjects();
    
    // Load exam data with a small delay to prioritize filter loading
    setTimeout(() => {
      this.loadExams();
    }, 500);
  }
  
  private loadSchools(): void {
    this.examService.getAllSchools().subscribe({
      next: (data) => {
        console.log('Successfully loaded schools:', data);
        this.schools = data && data.length > 0 ? data : ['ETSINF'];
        this.updateFilteredSchools(); // Update filtered schools after loading
      },
      error: (err: Error) => {
        console.error('Error loading schools:', err);
        // Set default values for schools to prevent filtering issues
        this.schools = ['ETSINF'];
        this.updateFilteredSchools(); // Update filtered schools with defaults
        console.log('Using default schools after API error');
        
        this.showAlert('Using default school values due to server error. Some filtering options may be limited.', 'error');
      }
    });
  }
  
  private loadDegrees(): void {
    this.examService.getAllDegrees().subscribe({
      next: (data) => {
        console.log('Successfully loaded degrees:', data);
        // Always use Computer Engineering as fallback if no data
        this.degrees = data && data.length > 0 ? data : ['Computer Engineering'];
        this.updateFilteredDegrees(); // Update filtered degrees after loading
      },
      error: (err: Error) => {
        console.error('Error loading degrees:', err);
        // Set default values for degrees to prevent filtering issues
        this.degrees = ['Computer Engineering'];
        this.updateFilteredDegrees(); // Update filtered degrees with defaults
        console.log('Using default degrees after API error');
        
        this.showAlert('Using default degree values due to server error. Some filtering options may be limited.', 'error');
      }
    });
  }
  
  private loadSemesters(): void {
    this.examService.getAllSemesters().subscribe({
      next: (data: number[]) => {
        console.log('Successfully loaded semesters:', data);
        // Process semesters - convert to display format (A/B)
        this.semesters = data.map(semester => ({
          value: semester,
          label: this.semesterDisplayMap[semester] || semester.toString()
        }));
      },
      error: (err: Error) => {
        console.error('Error loading semesters:', err);
        this.showAlert('Failed to load semesters. Please try again later.', 'error');
      }
    });
  }
  
  private loadCourseYears(): void {
    this.examService.getAllCourseYears().subscribe({
      next: (data: number[]) => {
        console.log('Successfully loaded course years:', data);
        this.courseYears = data;
      },
      error: (err: Error) => {
        console.error('Error loading course years:', err);
        this.showAlert('Failed to load course years. Please try again later.', 'error');
      }
    });
  }
  
  private loadSubjects(): void {
    this.examService.getAllSubjectsWithAcronyms().subscribe({
      next: (data: any) => {
        console.log('Successfully loaded subjects with acronyms:', data);
        console.log('Subjects data type:', typeof data);
        console.log('Is subjects data an array?', Array.isArray(data));
        
        // Normalize and map the subjects data regardless of format
        let normalizedSubjects: Subject[] = [];
        
        if (data) {
          if (Array.isArray(data)) {
            // Handle array format directly
            normalizedSubjects = data.map(subject => this.normalizeSubject(subject));
          } else if (typeof data === 'object') {
            // Handle object format (possibly the backend returns an object containing the array)
            const possibleArray = Object.values(data)[0];
            if (Array.isArray(possibleArray)) {
              normalizedSubjects = possibleArray.map(subject => this.normalizeSubject(subject));
            }
          }
        }
        
        console.log('Normalized subjects:', normalizedSubjects);
        this.subjects = normalizedSubjects;
        this.updateFilteredSubjects(); // Update filtered subjects after loading
        
        // Finally load exams
        this.loadExams();
      },
      error: (err: Error) => {
        console.error('Error loading subjects with acronyms:', err);
        // Continue with empty subjects
        this.subjects = [];
        this.updateFilteredSubjects(); // Update filtered subjects with empty array
        this.showAlert('Failed to load subjects. Please try again later.', 'error');
        
        // Continue to load exams anyway
        this.loadExams();
      }
    });
  }
  
  // Helper function to normalize subject data regardless of format
  private normalizeSubject(subject: any): Subject {
    if (!subject) {
      return { name: 'Unknown', acronym: '' };
    }
    
    // If it's already a SubjectDTO or matches our Subject interface, use it directly
    if (typeof subject === 'object' && subject.hasOwnProperty('name')) {
      return {
        name: subject.name || 'Unknown',
        acronym: subject.acronym || ''
      };
    }
    
    // Handle different potential formats
    if (typeof subject === 'string') {
      return { name: subject, acronym: '' };
    }
    
    // If it's an array-like object
    if (Array.isArray(subject) || (typeof subject === 'object' && subject.length > 0)) {
      return {
        name: subject[0] || 'Unknown',
        acronym: subject[1] || ''
      };
    }
    
    console.error('Unable to normalize subject:', subject);
    return { name: 'Unknown', acronym: '' };
  }
  
  // Prevent duplicate API calls for rendering cycles
  private isLoadingExams = false;
  
  private loadExams(): void {
    if (this.isLoadingExams) return; // Prevent multiple concurrent loads
    
    this.isLoadingExams = true;
    console.log('Making API call to get all exams...');
    
    // Get the current filter state to determine what exams to load
    const filters = this.examService.getSelectedFilters();
    
    // If we have active filters, use the getFilteredExams method
    if (filters.degree || filters.year !== null || filters.semester !== null || filters.subject !== null) {
      console.log('Using active filters from shared state:', filters);
      this.examService.getFilteredExams()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            console.log('Successfully loaded filtered exams, count:', data.length);
            this.isLoadingExams = false;
            
            this.allExams = data;
            
            // Generate calendar with filtered data
            this.filteredExams = data;
            this.generateCalendar();
          },
          error: (err: Error) => {
            console.error('Error loading filtered exams:', err);
            this.isLoadingExams = false;
            this.showAlert('Failed to load exams. Please check the console for details.', 'error');
          }
        });
    } else {
      // Otherwise, load all exams
      this.examService.getAllExams()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            console.log('Successfully loaded all exams, count:', data.length);
            this.isLoadingExams = false;
            
            if (data.length === 0) {
              console.warn('No exams returned from backend!');
              this.showAlert('No exams found in the database. Please check your database connection.', 'error');
            } else {
              console.log('First exam sample:', data[0]);
            }
            
            this.allExams = data;
            
            // Apply filters (initial show all)
            this.applyFilters();
          },
          error: (err: Error) => {
            console.error('Error loading exams:', err);
            this.isLoadingExams = false;
            this.showAlert('Failed to load exams. Please check the console for details.', 'error');
          }
        });
    }
  }

  applyFilters(): void {
    console.log('Applying filters with:', {
      schools: this.selectedSchools,
      degrees: this.selectedDegrees,
      semesters: this.selectedSemesters,
      courseYears: this.selectedCourseYears,
      subjects: this.selectedSubjects
    });
    
    // Safety check - if we have no exams data, don't try to filter
    if (!this.allExams || this.allExams.length === 0) {
      console.warn('No exams data available for filtering');
      this.filteredExams = [];
      this.filteredMonths = [];
      return;
    }
    
    // If no filters are selected, show all exams
    const noFiltersSelected = (
      this.selectedSchools.length === 0 &&
      this.selectedDegrees.length === 0 &&
      this.selectedSemesters.length === 0 &&
      this.selectedCourseYears.length === 0 &&
      this.selectedSubjects.length === 0
    );
    
    if (noFiltersSelected) {
      console.log('No filters selected, showing all exams. Total count:', this.allExams.length);
      this.filteredExams = [...this.allExams];
    } else {
      // Apply filters with simplified logic (OR between same filter types)
      this.filteredExams = this.allExams.filter(exam => {
        // For any filter category, if nothing is selected, that filter passes
        // Otherwise, the exam must match at least one selected value in each category
        
        // Get the school from the degree (first part)
        const examSchool = this.getSchoolFromDegree(exam.degree);
        
        // For schools, check if the exam's school is in the selected schools
        let schoolMatch = this.selectedSchools.length === 0;
        if (!schoolMatch) {
          schoolMatch = this.selectedSchools.some(school => examSchool === school);
          
          // Special handling for ETSINF - if selected, ensure we only show data from etsinf_exams table
          if (this.selectedSchools.includes('ETSINF') && examSchool === 'ETSINF') {
            schoolMatch = true;
          }
        }
        
        // For degrees (full degree names)
        let degreeMatch = this.selectedDegrees.length === 0;
        if (!degreeMatch) {
          degreeMatch = this.selectedDegrees.includes(exam.degree);
        }
        
        // For semesters
        let semesterMatch = this.selectedSemesters.length === 0;
        if (!semesterMatch) {
          semesterMatch = this.selectedSemesters.includes(exam.semester);
        }
        
        // For course years
        let courseYearMatch = this.selectedCourseYears.length === 0;
        if (!courseYearMatch) {
          courseYearMatch = this.selectedCourseYears.includes(exam.courseYear);
        }
        
        // For subjects
        let subjectMatch = this.selectedSubjects.length === 0;
        if (!subjectMatch) {
          subjectMatch = this.selectedSubjects.includes(exam.subjectName);
        }
        
        const result = schoolMatch && degreeMatch && semesterMatch && courseYearMatch && subjectMatch;
        return result;
      });
    }
    
    console.log('After filtering, showing exams:', this.filteredExams.length);
    
    // Update shared filter state based on current local filters
    this.updateSharedFilterState();
    
    // Generate calendar after filtering
    this.generateCalendar();
  }

  /**
   * Update the shared filter state in ExamService
   */
  private updateSharedFilterState(): void {
    // Convert multiple selections to single values for shared state
    const filters: ExamFilters = {
      school: this.selectedSchools.length > 0 ? this.selectedSchools[0] : 'ETSINF',
      degree: this.selectedDegrees.length > 0 ? this.selectedDegrees[0] : null,
      year: this.selectedCourseYears.length > 0 ? this.selectedCourseYears[0] : null,
      semester: this.selectedSemesters.length > 0 ? this.selectedSemesters[0].toString() : null,
      subject: this.selectedSubjects.length > 0 ? this.selectedSubjects[0] : null
    };
    
    // Update without triggering our own subscription
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
      this.filterSubscription = null;
    }
    
    this.examService.updateSelectedFilters(filters);
    
    // Resubscribe after a short delay
    setTimeout(() => {
      this.subscribeToFilterChanges();
    }, 100);
  }

  // Helper method to extract school from degree string
  private getSchoolFromDegree(degree: string): string {
    if (!degree) return 'N/A';
    // Typically the school is the first part of the degree string
    const parts = degree.split(' ');
    return parts.length > 0 ? parts[0] : 'N/A';
  }

  // When a school is selected, load the degrees for that school
  loadSchoolDegrees(): void {
    // Reset degrees and selected degrees when changing schools
    this.degrees = [];
    this.selectedDegrees = [];
    
    // If no schools selected, do nothing
    if (this.selectedSchools.length === 0) {
      this.degrees = [];
      this.updateFilteredDegrees();
      return;
    }
    
    // Use the first selected school for now (optimization: load degrees for all selected schools)
    const selectedSchool = this.selectedSchools[0];
    
    this.examService.getDegreesBySchool(selectedSchool).subscribe({
      next: (data: string[]) => {
        console.log(`Successfully loaded degrees for ${selectedSchool}:`, data);
        this.degrees = data && data.length > 0 ? data : [];
        this.updateFilteredDegrees();
        this.applyFilters();
      },
      error: (err: Error) => {
        console.error(`Error loading degrees for ${selectedSchool}:`, err);
        // Set default values based on school
        this.degrees = selectedSchool === 'ETSINF' ? ['Computer Engineering'] : [];
        this.updateFilteredDegrees();
        console.log('Using default degrees after API error');
        this.applyFilters();
      }
    });
  }

  generateCalendar(): void {
    if (this.filteredExams.length === 0) {
      this.filteredMonths = [];
      return;
    }

    // Get unique dates for all filtered exams
    const examDates = new Set<string>();
    this.filteredExams.forEach(exam => {
      examDates.add(exam.examDay);
    });

    // Get the range of months that need to be displayed
    const dates = [...examDates].map(dateStr => new Date(dateStr));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Create calendar months
    const monthlyCalendars: MonthlyCalendar[] = [];
    const currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    
    while (currentDate <= maxDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
      
      // Generate calendar days for the month
      const days: ExamDay[][] = this.generateMonthDays(year, month, examDates);
      
      monthlyCalendars.push({
        year,
        month,
        monthName,
        days
      });
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    this.filteredMonths = monthlyCalendars;
  }

  generateMonthDays(year: number, month: number, examDates: Set<string>): ExamDay[][] {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const weeks: ExamDay[][] = [];
    let days: ExamDay[] = [];
    
    // Add empty cells for days before the 1st of the month
    const firstWeekdayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Convert to Monday-based (0 = Monday)
    for (let i = 0; i < firstWeekdayIndex; i++) {
      days.push(null as any); // Empty cell
    }
    
    // Add actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const hasExams = examDates.has(dateStr);
      
      days.push({
        date,
        day: i,
        hasExams
      });
      
      // Start a new week on Sunday (or when we reach 7 days)
      if (days.length === 7) {
        weeks.push([...days]);
        days = [];
      }
    }
    
    // Add empty cells for days after the last day of the month
    if (days.length > 0) {
      while (days.length < 7) {
        days.push(null as any); // Empty cell
      }
      weeks.push([...days]);
    }
    
    return weeks;
  }

  toggleDropdown(dropdownName: string): void {
    this.openDropdowns[dropdownName] = !this.openDropdowns[dropdownName];
  }

  isSelected(item: any, selectedList: any[]): boolean {
    // Handle different types of items
    if (typeof item === 'object' && item.value !== undefined) {
      // For objects with a value property (like semester objects)
      return selectedList.includes(item.value);
    } else if (typeof item === 'object' && item.name !== undefined) {
      // For subjects with name property
      return selectedList.includes(item.name);
    }
    // For simple strings or numbers
    return selectedList.includes(item);
  }

  toggleSelection(item: any, selectedList: any[]): void {
    let value: any;
    
    // Handle different types of items
    if (typeof item === 'object' && item.value !== undefined) {
      // For objects with a value property (like semester objects)
      value = item.value;
    } else if (typeof item === 'object' && item.name !== undefined) {
      // For subjects with name property
      value = item.name;
    } else {
      // For simple strings or numbers
      value = item;
    }
    
    const index = selectedList.indexOf(value);
    
    // Handle special case for ETSINF degree
    if (item === 'ETSINF' && selectedList === this.selectedDegrees) {
      if (index === -1) {
        // When ETSINF is selected
        selectedList.push(value);
        
        // Load sub-degrees for ETSINF
        this.examService.getDegreesBySchool('ETSINF').subscribe({
          next: (subDegrees: string[]) => {
            console.log('Loaded sub-degrees for ETSINF:', subDegrees);
            // Ensure we always have at least Computer Engineering as a fallback
            this.degrees = subDegrees.length > 0 ? subDegrees : ['Computer Engineering'];
          },
          error: (err: Error) => {
            console.error('Error loading sub-degrees for degree:', err);
            // Set fallback values
            this.degrees = ['Computer Engineering'];
            console.log('Using default sub-degrees after API error');
          }
        });
      } else {
        // When ETSINF is deselected, clear sub-degrees
        selectedList.splice(index, 1);
        this.selectedDegrees = [];
        this.degrees = [];
      }
    } else {
      // Normal toggle behavior for other items
      if (index === -1) {
        selectedList.push(value);
      } else {
        selectedList.splice(index, 1);
      }
    }
    
    this.applyFilters();
  }

  selectDate(day: ExamDay | null, event: MouseEvent): void {
    if (!day) return;
    
    this.selectedDate = day.date;
    
    if (day.hasExams) {
      // Find exams for the selected date
      const dateStr = day.date.toISOString().split('T')[0];
      this.tooltipExams = this.filteredExams.filter(exam => 
        exam.examDay === dateStr
      );
      
      // Save reference to the target element for possible repositioning
      this.currentTargetElement = event.currentTarget as HTMLElement || event.target as HTMLElement;
      
      // Calculate tooltip position
      this.updateTooltipPosition();
      
      this.showExamTooltip = true;
    } else {
      this.showExamTooltip = false;
      this.currentTargetElement = null;
    }
  }

  getExamCountForDate(date: Date): number {
    const dateStr = date.toISOString().split('T')[0];
    return this.filteredExams.filter(exam => exam.examDay === dateStr).length;
  }

  // Get display value for semester
  getSemesterDisplay(semester: number): string {
    return this.semesterDisplayMap[semester] || semester.toString();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    // Close dropdowns when clicking outside
    const dropdownContainer = (event.target as HTMLElement).closest('.dropdown-container, .filter-header, .filter-options, .checkbox-item');
    if (!dropdownContainer) {
      Object.keys(this.openDropdowns).forEach(key => {
        this.openDropdowns[key] = false;
      });
    }
    
    // Close exam tooltip when clicking outside
    const calendarDay = (event.target as HTMLElement).closest('.calendar-day-button');
    const tooltip = (event.target as HTMLElement).closest('.exam-tooltip');
    if (this.showExamTooltip && !calendarDay && !tooltip) {
      this.showExamTooltip = false;
    }
  }

  scrollToFilters(): void {
    const filtersElement = document.querySelector('.filters-section');
    if (filtersElement) {
      filtersElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openMyCalendar(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/my-calendar']);
    } else {
      this.showAlert('Please log in to view your calendar', 'error');
      this.openAuthModal();
    }
  }

  navigateToExams(): void {
    this.router.navigate(['/exams']);
  }

  openAuthModal(): void {
    this.showAuthModal = true;
  }

  closeAuthModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('auth-modal-overlay')) {
      this.showAuthModal = false;
    }
  }

  toggleAuthMode(event: Event): void {
    event.preventDefault();
    this.authMode = this.authMode === 'login' ? 'register' : 'login';
  }

  submitAuthForm(): void {
    if (this.authMode === 'login') {
      this.authService.login(this.authForm.email, this.authForm.password).subscribe({
        next: () => {
          this.showAuthModal = false;
          this.showAlert('Login successful', 'success');
        },
        error: (err: Error) => {
          console.error('Login error:', err);
          this.showAlert('Login failed. Please check your credentials and try again.', 'error');
        }
      });
    } else {
      this.authService.register(this.authForm.name, this.authForm.email, this.authForm.password).subscribe({
        next: () => {
          this.authMode = 'login';
          this.showAlert('Registration successful. Please log in.', 'success');
        },
        error: (err: Error) => {
          console.error('Registration error:', err);
          this.showAlert('Registration failed. Please try again.', 'error');
        }
      });
    }
  }

  saveCalendar(): void {
    if (!this.isLoggedIn) {
      this.showAlert('Please log in to save your calendar', 'error');
      this.openAuthModal();
      return;
    }
    
    // Example implementation - in a real app you'd save the filter preferences to the user's account
    const savedFilters = {
      degrees: this.selectedDegrees,
      subDegrees: this.selectedDegrees,
      semesters: this.selectedSemesters,
      courseYears: this.selectedCourseYears
    };
    
    // Mock API call to save the filters
    setTimeout(() => {
      this.showAlert('Your calendar preferences have been saved', 'success');
      // In a real app you'd make an API call instead
    }, 500);
  }

  exportToGoogle(): void {
    this.showAlert('Exporting to Google Calendar - feature coming soon!', 'success');
  }

  exportToICal(): void {
    this.showAlert('Exporting to iCal - feature coming soon!', 'success');
  }

  showAlert(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  /**
   * Updates the tooltip position based on the current target element
   */
  private updateTooltipPosition(): void {
    if (this.showExamTooltip && this.currentTargetElement) {
      // Find the calendar day cell that was clicked
      let dayCell = this.currentTargetElement;
      
      // Walk up the DOM to find the calendar-day-button if we clicked a child element
      while (dayCell && !dayCell.classList.contains('calendar-day-button') && dayCell.parentElement) {
        dayCell = dayCell.parentElement;
      }
      
      // Use a default tooltip size or try to measure the actual tooltip
      let tooltipWidth = 300;
      let tooltipHeight = 200;
      
      // Try to get the actual tooltip element to measure it
      const tooltipElement = document.querySelector('.exam-tooltip') as HTMLElement;
      if (tooltipElement) {
        // Get the actual dimensions of the tooltip
        const tooltipRect = tooltipElement.getBoundingClientRect();
        tooltipWidth = tooltipRect.width || tooltipWidth;
        tooltipHeight = tooltipRect.height || tooltipHeight;
      }
      
      // Calculate optimal position using our service
      this.tooltipPosition = this.tooltipPositionService.calculateTooltipPosition(
        dayCell || this.currentTargetElement,
        tooltipWidth,
        tooltipHeight
      );
    }
  }

  // Watch for changes in search inputs and filter accordingly
  private setupSearchWatchers(): void {
    // Initial population of filtered arrays
    this.updateFilteredSchools();
    this.updateFilteredDegrees();
    this.updateFilteredSubjects();

    // Set up property watchers by creating getters/setters
    Object.defineProperty(this, 'schoolSearch', {
      get: function() { return this._schoolSearch || ''; },
      set: function(val) {
        this._schoolSearch = val;
        this.updateFilteredSchools();
      }
    });

    Object.defineProperty(this, 'degreeSearch', {
      get: function() { return this._degreeSearch || ''; },
      set: function(val) {
        this._degreeSearch = val;
        this.updateFilteredDegrees();
      }
    });

    Object.defineProperty(this, 'subjectSearch', {
      get: function() { return this._subjectSearch || ''; },
      set: function(val) {
        this._subjectSearch = val;
        this.updateFilteredSubjects();
      }
    });
  }

  // Update filtered schools based on search term
  private updateFilteredSchools(): void {
    if (!this.schoolSearch) {
      this.filteredSchools = [...this.schools];
    } else {
      const search = this.schoolSearch.toLowerCase();
      this.filteredSchools = this.schools.filter(school => 
        school.toLowerCase().includes(search)
      );
    }
  }

  // Update filtered degrees based on search term
  private updateFilteredDegrees(): void {
    if (!this.degreeSearch) {
      this.filteredDegrees = [...this.degrees];
    } else {
      const search = this.degreeSearch.toLowerCase();
      this.filteredDegrees = this.degrees.filter(degree => 
        degree.toLowerCase().includes(search)
      );
    }
  }

  // Update filtered subjects based on search term
  private updateFilteredSubjects(): void {
    if (!this.subjectSearch) {
      this.filteredSubjects = [...this.subjects];
    } else {
      const search = this.subjectSearch.toLowerCase();
      this.filteredSubjects = this.subjects.filter(subject => 
        subject.name.toLowerCase().includes(search) || 
        (subject.acronym && subject.acronym.toLowerCase().includes(search))
      );
    }
  }
} 