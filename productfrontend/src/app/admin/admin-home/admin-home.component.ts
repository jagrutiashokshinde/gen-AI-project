import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent implements OnInit {
  stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  };

  constructor(
    private router: Router,
    private productService: ProductService,
    private orderService: OrderService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadStats();
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

  navigateTo(section: string): void {
    this.router.navigate(['/admin', section]);
  }
}
