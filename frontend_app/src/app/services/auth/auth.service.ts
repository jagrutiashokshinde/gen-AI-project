import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8081';

  constructor(private http: HttpClient, private router: Router) {}

  login(data: any) {
    return this.http.post(`${this.apiUrl}/api/auth/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/register`, data);
  }


  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string {
    const token = this.getToken();
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || '';
  }

  getUserId(): number {
    const token = this.getToken();
    if (!token) return 0;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || 0;
  }
  getUsernameFromToken(): string {
  const token = this.getToken();
  if (!token) return '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.username || ''; // Common field names
  } catch (e) {
    console.error('Invalid token', e);
    return '';
  }
}

}
