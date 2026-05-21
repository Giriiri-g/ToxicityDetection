import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private router: Router) {}

  @Output() signinclick = new EventEmitter<MouseEvent>();

  OnSignin(event: MouseEvent) {
    this.signinclick.emit(event);
    this.router.navigate(['/signin']);
  }
}
