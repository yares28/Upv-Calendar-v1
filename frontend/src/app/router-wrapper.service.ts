import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouterWrapperService {
  constructor(private router: Router) {}

  navigate(path: string[] | string): Promise<boolean> {
    return this.router.navigate(Array.isArray(path) ? path : [path]);
  }
}
