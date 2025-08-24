import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { Order, Payment } from '../../models/order.model';
import { ImageUtils } from '../../shared/image-utils';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-receipt',
  imports: [CommonModule, RouterModule],
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.scss'
})
export class ReceiptComponent implements OnInit {
  order: Order | null = null;
  payment: Payment | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderId = +params['orderId'];
      if (orderId) {
        this.loadOrderDetails(orderId);
      }
    });
  }

  loadOrderDetails(orderId: number): void {
    this.loading = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loadPaymentDetails(orderId);
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.error = 'Failed to load order details.';
        this.loading = false;
      }
    });
  }

  loadPaymentDetails(orderId: number): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) return;

    this.paymentService.getPaymentsByUser(user.id).subscribe({
      next: (payments) => {
        this.payment = payments.find(p => p.orderId === orderId) || null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading payment:', error);
        this.loading = false;
      }
    });
  }

  getProductImage(product: any): string {
    return ImageUtils.getProductImageUrl(product, 'small');
  }

  onImageError(event: any): void {
    ImageUtils.handleImageError(event, 'small');
  }

  getTotal(): number {
    if (!this.order?.orderItems) return 0;
    return this.order.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  downloadReceipt(): void {
    window.print();
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}