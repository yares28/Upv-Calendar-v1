import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ExamsListComponent } from './exams-list/exams-list.component';
import { ExamDetailComponent } from './exam-detail/exam-detail.component';
import { ExamFormComponent } from './exam-form/exam-form.component';

const routes: Routes = [
  { path: '', component: ExamsListComponent },
  { path: 'create', component: ExamFormComponent },
  { path: ':id', component: ExamDetailComponent },
  { path: ':id/edit', component: ExamFormComponent }
];

@NgModule({
  declarations: [
    ExamsListComponent,
    ExamDetailComponent,
    ExamFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(routes)
  ]
})
export class ExamsModule { } 