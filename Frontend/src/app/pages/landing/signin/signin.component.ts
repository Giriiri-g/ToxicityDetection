import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent {
  identifier = '';
  password = '';
  showPassword = false;
  isLoading = false;
  identifierError = '';
  passwordError = '';
  @Output() createaccount = new EventEmitter<MouseEvent>();

  constructor(private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  validateIdentifier(): void {
    this.identifierError = this.identifier.trim() ? '' : 'This field is required.';
  }

  validatePassword(): void {
    if (!this.password) {
      this.passwordError = 'Password is required.';
    } else if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters.';
    } else {
      this.passwordError = '';
    }
  }

  onContinue(): void {
    this.validateIdentifier();
    this.validatePassword();
    if (this.identifierError || this.passwordError) return;

    this.isLoading = true;
    // Simulate auth call
    setTimeout(() => {
      this.isLoading = false;
      console.log('Sign in:', { identifier: this.identifier, password: this.password });
      // Redirect to feed after successful login
      this.router.navigate(['/feed']);
    }, 1500);
  }

  onCreateAccount(event: MouseEvent){
    this.createaccount.emit(event);
  }
}