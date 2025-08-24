import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  statusFilter = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe(orders => {
      this.orders = orders.sort((a, b) => (b.id || 0) - (a.id || 0));
      this.filteredOrders = [...this.orders];
    });
  }

  filterOrders(): void {
    if (this.statusFilter) {
      this.filteredOrders = this.orders.filter(order => order.status === this.statusFilter);
    } else {
      this.filteredOrders = [...this.orders];
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
