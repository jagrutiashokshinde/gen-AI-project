import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/order.model';
import { Product } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.orderService.getOrdersByUser(user.id).subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => (b.id || 0) - (a.id || 0)); // Sort by newest first
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  getProductImage(product: Product): string {
    return product.imagePath ? `http://localhost:8081${product.imagePath}` : 'https://via.placeholder.com/60x60/cccccc/666666?text=No+Image';
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

  viewOrderDetails(order: Order): void {
    // Navigate to order details or show modal
    alert(`Order Details:\nOrder ID: ${order.id}\nStatus: ${order.status}\nTotal: $${order.totalAmount}`);
  }

  cancelOrder(order: Order): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      // Implement cancel order functionality
      alert('Order cancellation feature will be implemented.');
    }
  }
}
