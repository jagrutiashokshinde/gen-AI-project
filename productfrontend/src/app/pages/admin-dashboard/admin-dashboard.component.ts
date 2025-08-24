import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { Order } from '../../models/order.model';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  };
  
  products: Product[] = [];
  orders: Order[] = [];
  users: User[] = [];
  
  currentView = 'dashboard';
  showProductForm = false;
  productForm!: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    
    this.initProductForm();
    this.loadStats();
  }

  initProductForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(0)]]
    });
  }

  loadStats(): void {
    // Load products count
    this.productService.getAllProducts().subscribe(products => {
      this.stats.totalProducts = products.length;
    });
    
    // Load orders and calculate revenue
    this.orderService.getAllOrders().subscribe(orders => {
      this.stats.totalOrders = orders.length;
      this.stats.totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    });
    
    // Load users count
    this.http.get<User[]>('http://localhost:8081/api/auth/admin/users').subscribe(users => {
      this.stats.totalUsers = users.length;
    });
  }

  showAddProductModal(): void {
    this.showProductForm = true;
    this.productForm.reset();
  }

  hideProductForm(): void {
    this.showProductForm = false;
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  addProduct(): void {
    if (this.productForm.valid) {
      this.isSubmitting = true;
      const formData = new FormData();
      
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('quantity', this.productForm.get('quantity')?.value);
      
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      
      this.productService.addProduct(formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.hideProductForm();
          alert('Product added successfully!');
          this.loadStats();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error adding product:', error);
          alert('Failed to add product. Please try again.');
        }
      });
    }
  }

  loadProducts(): void {
    this.currentView = 'products';
    this.productService.getAllProducts().subscribe(products => {
      this.products = products;
    });
  }

  loadOrders(): void {
    this.currentView = 'orders';
    this.orderService.getAllOrders().subscribe(orders => {
      this.orders = orders;
    });
  }

  loadUsers(): void {
    this.currentView = 'users';
    this.http.get<User[]>('http://localhost:8081/api/auth/admin/users').subscribe(users => {
      this.users = users;
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      this.productService.deleteProduct(product.id!).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== product.id);
          this.loadStats();
          alert('Product deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product.');
        }
      });
    }
  }

  updateOrderStatus(order: Order, event: any): void {
    const newStatus = event.target.value;
    this.orderService.updateOrderStatus(order.id!, newStatus).subscribe({
      next: () => {
        order.status = newStatus;
        alert('Order status updated successfully!');
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        alert('Failed to update order status.');
      }
    });
  }

  getProductImage(product: Product): string {
    return product.imagePath ? `http://localhost:8081${product.imagePath}` : 'https://via.placeholder.com/50x50/cccccc/666666?text=No+Image';
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-warning';
      case 'CONFIRMED': return 'bg-info';
      case 'SHIPPED': return 'bg-primary';
      case 'DELIVERED': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getTableTitle(): string {
    switch (this.currentView) {
      case 'products': return 'Manage Products';
      case 'orders': return 'Manage Orders';
      case 'users': return 'Manage Users';
      default: return '';
    }
  }

  backToDashboard(): void {
    this.currentView = 'dashboard';
  }
}
