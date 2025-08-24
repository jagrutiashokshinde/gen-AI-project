import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const customerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn() && !authService.isAdminUser()) {
    return true;
  } else if (authService.isAdminUser()) {
    router.navigate(['/admin']);
    return false;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
