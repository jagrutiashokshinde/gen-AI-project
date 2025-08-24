import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  currentUser$: Observable<User | null>;
  activeTab = 'dashboard';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
    }
    // Set active tab based on current route
    const currentRoute = this.router.url.split('/').pop();
    this.activeTab = currentRoute === 'admin' ? 'home' : currentRoute || 'home';
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab || 'home';
    if (tab) {
      this.router.navigate(['/admin', tab]);
    } else {
      this.router.navigate(['/admin']);
    }
  }

  switchToCustomer(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
