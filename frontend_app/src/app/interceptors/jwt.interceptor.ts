// src/app/interceptors/jwt.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const jwtToken = this.authService.getToken();
    if (jwtToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${jwtToken}`
        }
      });
    }
    return next.handle(req);
  }
}
