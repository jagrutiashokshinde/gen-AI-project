import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { Payment } from '../../models/order.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-payments',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-payments.component.html',
  styleUrl: './admin-payments.component.scss'
})
export class AdminPaymentsComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  statusFilter = '';

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.paymentService.getAllPayments().subscribe(payments => {
      this.payments = payments;
      this.filteredPayments = [...this.payments];
    });
  }

  filterPayments(): void {
    if (this.statusFilter) {
      this.filteredPayments = this.payments.filter(payment => payment.status === this.statusFilter);
    } else {
      this.filteredPayments = [...this.payments];
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'SUCCESS': return 'bg-success';
      case 'FAILED': return 'bg-danger';
      case 'PENDING': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getTotalSuccessfulPayments(): number {
    return this.payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((total, payment) => total + payment.amount, 0);
  }

  getTotalFailedPayments(): number {
    return this.payments
      .filter(p => p.status === 'FAILED')
      .reduce((total, payment) => total + payment.amount, 0);
  }

  getSuccessfulPaymentCount(): number {
    return this.payments.filter(p => p.status === 'SUCCESS').length;
  }

  getFailedPaymentCount(): number {
    return this.payments.filter(p => p.status === 'FAILED').length;
  }

  getFormattedDate(): string {
    return new Date().toLocaleDateString();
  }
}
