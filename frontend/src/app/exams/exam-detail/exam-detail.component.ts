import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { Exam } from '../../models/exam.model';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-exam-detail',
  templateUrl: './exam-detail.component.html',
  styleUrls: ['./exam-detail.component.scss']
})
export class ExamDetailComponent implements OnInit {
  examId!: number;
  exam: Exam | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.examId = +id;
        this.loadExam();
      } else {
        this.error = 'No exam ID provided';
      }
    });
  }

  loadExam(): void {
    this.loading = true;
    this.examService.getExamById(this.examId).pipe(
      catchError(error => {
        this.error = 'Failed to load exam data. Please try again later.';
        console.error('Error loading exam:', error);
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(exam => {
      this.exam = exam;
    });
  }

  goToList(): void {
    this.router.navigate(['/exams']);
  }

  editExam(): void {
    this.router.navigate(['/exams', this.examId, 'edit']);
  }

  deleteExam(): void {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.loading = true;
      this.examService.deleteExam(this.examId).pipe(
        catchError(error => {
          this.error = 'Failed to delete exam. Please try again later.';
          console.error('Error deleting exam:', error);
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe(() => {
        this.router.navigate(['/exams']);
      });
    }
  }
} 