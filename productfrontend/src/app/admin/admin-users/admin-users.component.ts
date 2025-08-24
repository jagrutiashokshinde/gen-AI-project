import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { User } from '../../models/user.model';
import { Order } from '../../models/order.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  orders: Order[] = [];
  roleFilter = '';

  constructor(
    private orderService: OrderService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadOrders();
  }

  loadUsers(): void {
    this.http.get<User[]>('http://localhost:8081/api/auth/admin/users').subscribe(users => {
      this.users = users;
      this.filteredUsers = [...this.users];
    });
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe(orders => {
      this.orders = orders;
    });
  }

  filterUsers(): void {
    if (this.roleFilter) {
      this.filteredUsers = this.users.filter(user => 
        user.roles?.some(role => role.name === this.roleFilter)
      );
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  getUserOrderCount(userId: number): number {
    return this.orders.filter(order => order.user.id === userId).length;
  }

  getUserTotalSpent(userId: number): number {
    return this.orders
      .filter(order => order.user.id === userId)
      .reduce((total, order) => total + order.totalAmount, 0);
  }

  viewUserDetails(user: User): void {
    const userOrders = this.orders.filter(order => order.user.id === user.id);
    const totalSpent = this.getUserTotalSpent(user.id!);
    
    alert(`User Details:\nUsername: ${user.username}\nTotal Orders: ${userOrders.length}\nTotal Spent: $${totalSpent}`);
  }
}
