import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // ✅ Import this
import { AdminService } from '../../services/admin/admin.service';

@Component({
  selector: 'app-adminrole',
  templateUrl: './adminrole.component.html',
  styleUrls: ['./adminrole.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule] // ✅ Add ReactiveFormsModule here
})
export class AdminroleComponent implements OnInit {
  products: any[] = [];
  username: string = '';

  constructor(private router: Router, private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.extractUsernameFromToken();
  }

  loadProducts(): void {
    this.adminService.getAll().subscribe((data: any) => {
      this.products = data;
    });
  }

  goToAdd() {
    this.router.navigate(['/admin/add-product']);
  }

  goToUpdate(productId: number) {
    this.router.navigate(['/admin/update-product', productId]);
  }

  goToDelete(productId: number) {
    this.router.navigate(['/admin/delete-product', productId]);
  }

  extractUsernameFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.username = payload.sub || 'Admin';
    }
  }
}
