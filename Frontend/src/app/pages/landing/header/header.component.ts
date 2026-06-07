import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  // Use the token presence as the single source of truth for visibility.
  // (Me endpoint is protected but requires an async call; this keeps UI responsive.)
  protected isLoggedIn = computed(() => this.auth.isLoggedIn());

  @Output() signinclick = new EventEmitter<MouseEvent>();

  OnSignin(event: MouseEvent) {
    this.signinclick.emit(event);
    this.router.navigate(['/signin']);
  }

  OnLogout() {
    // Ensure UI toggles immediately.
    // Also clear server session cookie if backend supports it.
    // NOTE: current AuthService.logout() only clears localStorage token.
    this.auth.logout();
    this.router.navigate(['/']);
  }
}

