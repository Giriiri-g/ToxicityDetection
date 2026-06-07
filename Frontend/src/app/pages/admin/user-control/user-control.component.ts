import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-control.component.html',
  styleUrl: './user-control.component.scss'
})
export class UserControlComponent {
  form = { username: '', email: '', password: '', role: 'Reviewer' };
  submitting = false;
  message = '';
  isError = false;
  private messageTimeout?: ReturnType<typeof setTimeout>;
  private readonly messageTtl = 5000;

  constructor(private http: HttpClient, private auth: AuthService) {}

  submit() {
    if (!this.form.username || !this.form.email || !this.form.password) return;
    this.submitting = true;
    this.clearMessage();

    this.http.post<{ message: string }>(
      'https://localhost:5001/api/admin/users',
      { username: this.form.username, email: this.form.email, password: this.form.password, role: this.form.role },
      { headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` }) }
    ).subscribe({
      next: res => {
        this.setMessage(res.message, false);
        this.form = { username: '', email: '', password: '', role: 'Reviewer' };
        this.submitting = false;
      },
      error: err => {
        this.setMessage(err.error?.message ?? 'Failed to create account.', true);
        this.submitting = false;
      }
    });
  }

  private setMessage(message: string, isError: boolean) {
    this.message = message;
    this.isError = isError;
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    this.messageTimeout = setTimeout(() => {
      this.message = '';
      this.messageTimeout = undefined;
    }, this.messageTtl);
  }

  private clearMessage() {
    this.message = '';
    this.isError = false;
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = undefined;
    }
  }
}
