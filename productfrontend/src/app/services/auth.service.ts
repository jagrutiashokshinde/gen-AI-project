import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.decodeAndSetUser(response.token);
          // Force a small delay to ensure user state is updated
          setTimeout(() => {
            console.log('Login complete, current user:', this.getCurrentUser());
          }, 100);
        })
      );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    console.log('Checking admin status for user:', user); // Debug log
    return user?.roles?.some(role => 
      role.name === 'ADMIN' || role.name === 'ROLE_ADMIN'
    ) || false;
  }

  isAdminUser(): boolean {
    return this.isAdmin();
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (token) {
      this.decodeAndSetUser(token);
    }
  }

  private decodeAndSetUser(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT Payload:', payload); // Debug log
      
      let roles = [];
      if (payload.role) {
        // Handle single role as string
        const roleName = payload.role.replace('ROLE_', ''); // Remove ROLE_ prefix
        roles = [{ name: roleName }];
      } else if (payload.roles) {
        // Handle multiple roles as array
        roles = payload.roles.map((role: string) => ({ 
          name: role.replace('ROLE_', '') 
        }));
      }
      
      const user: User = {
        id: payload.userId,
        username: payload.sub,
        roles: roles
      };
      
      console.log('Decoded User:', user); // Debug log
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.logout();
    }
  }
}
