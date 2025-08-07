import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, NgIf, NgFor],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = signal(this.authService.isLoggedIn());
  role = signal(this.authService.getRole() || '');
  showDropdown = signal(false);

  toggleDropdown() {
    this.showDropdown.update(current => !current);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.showDropdown.set(false);
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.role.set('');
    this.showDropdown.set(false);
    this.router.navigate(['/']); // Navigate to Home
  }
}
