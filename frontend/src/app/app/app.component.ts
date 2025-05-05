import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      width: 100%;
      background-color: var(--color-background);
    }
  `],
  standalone: false
})
export class AppComponent {
  title = 'UPV Calendar';
}
