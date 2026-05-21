import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent {
  username = '';
  password = '';
  private router = inject(Router);
  private authService = inject(AuthService);

  private usernameErrorEl?: HTMLElement | null;
  private passwordErrorEl?: HTMLElement | null;

  onSubmit(): void {
    this.usernameErrorEl = this.getErrorEl('error-username');
    this.passwordErrorEl = this.getErrorEl('error-password');

    const usernameValid = this.validateUsername(this.username);
    const passwordValid = this.validatePassword(this.password);

    if (!usernameValid) {
      if (this.usernameErrorEl) this.usernameErrorEl.style.display = 'block';
    }
    if (!passwordValid) {
      if (this.passwordErrorEl) this.passwordErrorEl.style.display = 'block';
    }

    if (!usernameValid || !passwordValid) {
      // Block submit when invalid
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.authService.me().subscribe({
          next: (me: any) => {
            const role = me?.role;
            if (role === 'Admin') this.router.navigate(['/admin']);
            else if (role === 'Reviewer') this.router.navigate(['/reviewer']);
            else this.router.navigate(['/feed']);
          },
          error: () => this.router.navigate(['/feed'])
        });
      },
      error: () => alert('Invalid credentials')
    });
  }

  clearUsernameError(): void {
    const el = this.getErrorEl('error-username');
    if (el) el.style.display = 'none';
  }

  clearPasswordError(): void {
    const el = this.getErrorEl('error-password');
    if (el) el.style.display = 'none';
  }

  private validateUsername(value: string): boolean {
    const v = value.trim();
    return v.length >= 6 && v.length <= 20;
  }

  private validatePassword(value: string): boolean {
    return value.length >= 6;
  }

  private getErrorEl(className: 'error-username' | 'error-password'): HTMLElement | null {
    return document.querySelector(`.${className}`);
  }
}

