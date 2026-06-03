import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://localhost:5001/api';

  currentUser = signal<any | null>(null);

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/auth/login`,
      { username, password },
      { withCredentials: true }
    ).pipe(
      tap(res => localStorage.setItem('token', res.token))
    );
  }

  me() {
    return this.http.get(`${this.apiUrl}/user/me`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` })
    });
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
