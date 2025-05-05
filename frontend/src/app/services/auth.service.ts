import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  // Get current user state
  get currentUser(): User | null {
    return this.userSubject.value;
  }

  // Get login status
  get isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  // Login
  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(user => {
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        })
      );
  }

  // Register
  register(name: string, email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(
        tap(user => {
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        })
      );
  }

  // Logout
  logout(): void {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  // Save user preferences
  saveUserPreferences(filters: { degrees: string[], semesters: string[], subjects: string[] }): Observable<User> {
    if (!this.currentUser) {
      throw new Error('User not logged in');
    }
    
    return this.http.post<User>(`${this.apiUrl}/preferences`, filters)
      .pipe(
        tap(user => {
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        })
      );
  }
} 