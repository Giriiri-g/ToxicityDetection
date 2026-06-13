import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  private router = inject(Router);
  private http = inject(HttpClient);

  // fields
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = 'Normal user';

  // validation errors
  usernameErrorEl?: HTMLElement | null;
  emailErrorEl?: HTMLElement | null;
  passwordErrorEl?: HTMLElement | null;
  confirmPasswordErrorEl?: HTMLElement | null;

  // optional fields
  phone = '';
  gender: 'Male' | 'Female' | 'Other' | '' = '';
  dob = '';
  bio = '';

  // swipe state
  isProfileStep = false;
  private swipeRootEl?: HTMLElement | null;

  onSubmit(): void {
    if (!this.isProfileStep) {
      this.usernameErrorEl = this.getErrorEl('error-username');
      this.emailErrorEl = this.getErrorEl('error-email');
      this.passwordErrorEl = this.getErrorEl('error-password');
      this.confirmPasswordErrorEl = this.getErrorEl('error-c-password');

      const usernameValid = this.validateUsername(this.username);
      const emailValid = this.validateEmail(this.email);
      const passwordValid = this.validatePassword(this.password);
      const confirmValid = this.confirmPassword.trim().length > 0 && this.confirmPassword === this.password;

      if (!usernameValid) this.showError(this.usernameErrorEl);
      if (!emailValid) this.showError(this.emailErrorEl);
      if (!passwordValid) this.showError(this.passwordErrorEl);
      if (!confirmValid) this.showError(this.confirmPasswordErrorEl);

      if (!usernameValid || !emailValid || !passwordValid || !confirmValid) return;

      this.isProfileStep = true;
      this.applySwipe();
      return;
    }

    // call register endpoint
    const payload = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role,
      phoneNumber: this.phone ?? '',
      gender: this.gender ?? '',
      dateOfBirth: this.dob ? this.dob : null,
      description: this.bio ?? ''
    };

    this.http.post<{ token: string }>('https://localhost:5001/api/auth/register', payload)
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Registration failed', err);
        }
      });
  }

  skip(): void {
    const payload = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role,
      phoneNumber: '',
      gender: '',
      dateOfBirth: null,
      description: ''
    };

    this.http.post<{ token: string }>('https://localhost:5001/api/auth/register', payload)
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Registration failed', err);
        }
      });
  }

  clearUsernameError(): void {
    const el = this.getErrorEl('error-username');
    if (el) el.style.display = 'none';
  }

  clearEmailError(): void {
    const el = this.getErrorEl('error-email');
    if (el) el.style.display = 'none';
  }

  clearPasswordError(): void {
    const el = this.getErrorEl('error-password');
    if (el) el.style.display = 'none';
  }

  clearConfirmPasswordError(): void {
    const el = this.getErrorEl('error-c-password');
    if (el) el.style.display = 'none';
  }

  private validateUsername(value: string): boolean {
    const v = value.trim();
    return v.length >= 6 && v.length <= 20;
  }

  private validateEmail(value: string): boolean {
    const v = value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(v);
  }

  private validatePassword(value: string): boolean {
    return value.length >= 6;
  }

  private getErrorEl(className: string): HTMLElement | null {
    return document.querySelector(`.${className}`);
  }

  private showError(el: HTMLElement | null | undefined): void {
    if (el) el.style.display = 'block';
  }

  private applySwipe(): void {
    this.swipeRootEl = document.querySelector('.signup-shell');
    if (this.swipeRootEl) {
      if (this.isProfileStep) this.swipeRootEl.classList.add('signup-shell--profile');
      else this.swipeRootEl.classList.remove('signup-shell--profile');
    }
  }
}