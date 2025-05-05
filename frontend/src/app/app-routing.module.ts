import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';

const routes: Routes = [
  { 
    path: 'exams', 
    loadChildren: () => import('./exams/exams.module').then(m => m.ExamsModule) 
  },
  { 
    path: '', 
    component: LandingComponent, 
    pathMatch: 'full' 
  },
  { path: 'my-calendar', component: LandingComponent }, // Replace with actual component when created
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 