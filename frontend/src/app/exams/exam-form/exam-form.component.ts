import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { Exam } from '../../models/exam.model';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-exam-form',
  templateUrl: './exam-form.component.html',
  styleUrls: ['./exam-form.component.scss']
})
export class ExamFormComponent implements OnInit {
  examForm!: FormGroup;
  examId: number | null = null;
  isEditing = false;
  loading = false;
  error: string | null = null;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    // Check if we're editing an existing exam
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.examId = +id;
        this.isEditing = true;
        this.loadExam(this.examId);
      }
    });
  }

  initForm(): void {
    this.examForm = this.fb.group({
      examDay: ['', [Validators.required]],
      examHour: ['', [Validators.required]],
      durationMin: [120, [Validators.required, Validators.min(1)]],
      subjectCode: ['', [Validators.required]],
      subjectName: ['', [Validators.required]],
      acronym: [''],
      degree: ['', [Validators.required]],
      courseYear: [1, [Validators.required, Validators.min(1)]],
      semester: [1, [Validators.required, Validators.min(1), Validators.max(2)]],
      examPlace: [''],
      comment: ['']
    });
  }

  loadExam(id: number): void {
    this.loading = true;
    this.examService.getExamById(id).pipe(
      catchError(error => {
        this.error = 'Failed to load exam data. Please try again later.';
        console.error('Error loading exam:', error);
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(exam => {
      if (exam) {
        // Format the date and time for the form
        const examDay = exam.examDay;
        const examHour = exam.examHour;

        this.examForm.patchValue({
          ...exam,
          examDay,
          examHour
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.examForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const examData: Exam = this.examForm.value;
    
    // Handle the API call based on whether we're creating or updating
    const request = this.isEditing
      ? this.examService.updateExam(this.examId!, examData)
      : this.examService.createExam(examData);

    request.pipe(
      catchError(error => {
        this.error = `Failed to ${this.isEditing ? 'update' : 'create'} exam. Please try again later.`;
        console.error(`Error ${this.isEditing ? 'updating' : 'creating'} exam:`, error);
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(result => {
      if (result) {
        this.router.navigate(['/exams']);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/exams']);
  }

  // Helper for form validation
  get f() {
    return this.examForm.controls;
  }
} 