import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    const user = {
      username: this.username,
      password: this.password
    };

    this.authService.login(user).subscribe({
      next: (res: any) => {
        const token = res.token;
        this.authService.saveToken(token);
        alert('User login successful');

        // Decode JWT to get the role
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role;

        // Navigate based on role
      

if (role === 'ROLE_ADMIN') {
  this.router.navigate(['/admin/role']);
} else if (role === 'ROLE_USER') {
  this.router.navigate(['/user/role']);
} else {
  alert('Unknown role!');
}

      },
      error: (err) => {
        console.error('Login failed:', err);
        alert('Login failed. Please check username/password.');
      }
    });
  }
}
