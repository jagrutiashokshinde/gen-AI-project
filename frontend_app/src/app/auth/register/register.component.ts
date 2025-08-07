import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    const role = this.registerForm.get('role')?.value?.toUpperCase();

    if (!['ADMIN', 'USER'].includes(role)) {
      this.errorMessage = 'Role must be either ADMIN or USER.';
      this.successMessage = '';
      return;
    }

    if (this.registerForm.valid) {
      const payload = {
        username: this.registerForm.value.username,
        password: this.registerForm.value.password,
        roles: [
          { name: role }
        ]
      };

      this.authService.register(payload).subscribe({
        next: (res) => {
          this.successMessage = 'Registration successful!';
          this.errorMessage = '';
          this.registerForm.reset();
        },
        error: (err) => {
          this.errorMessage = 'Registration failed. Try again.';
          this.successMessage = '';
        }
      });
    } else {
      this.errorMessage = 'Please fill all required fields.';
      this.successMessage = '';
    }
  }
}
