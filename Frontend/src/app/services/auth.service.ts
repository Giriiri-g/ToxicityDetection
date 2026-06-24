import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';

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

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  me() {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token'));
    }
    const decoded = this.decodeToken(token);
    if (!decoded) {
      return throwError(() => new Error('Invalid token'));
    }
    const username = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (username === undefined || role === undefined) {
      return throwError(() => new Error('Token does not contain required claims'));
    }
    return of({ username, role });
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