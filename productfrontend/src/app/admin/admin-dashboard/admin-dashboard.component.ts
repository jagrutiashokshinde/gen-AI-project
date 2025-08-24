import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product.model';
import { Order } from '../../models/order.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
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
  
  recentOrders: Order[] = [];
  lowStockProducts: Product[] = [];

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentOrders();
    this.loadLowStockProducts();
  }

  loadStats(): void {
    this.productService.getAllProducts().subscribe(products => {
      this.stats.totalProducts = products.length;
    });
    
    this.orderService.getAllOrders().subscribe(orders => {
      this.stats.totalOrders = orders.length;
      this.stats.totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    });
    
    this.http.get<any[]>('http://localhost:8081/api/auth/admin/users').subscribe(users => {
      this.stats.totalUsers = users.length;
    });
  }

  loadRecentOrders(): void {
    this.orderService.getAllOrders().subscribe(orders => {
      this.recentOrders = orders.slice(0, 5);
    });
  }

  loadLowStockProducts(): void {
    this.productService.getAllProducts().subscribe(products => {
      this.lowStockProducts = products.filter(p => p.quantity < 10).slice(0, 5);
    });
  }

  getProductImage(product: Product): string {
    return product.imagePath ? `http://localhost:8081${product.imagePath}` : 'https://via.placeholder.com/40x40/cccccc/666666?text=No+Image';
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
}
