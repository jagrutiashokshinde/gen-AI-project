import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { Cart } from '../../models/cart.model';
import { Product } from '../../models/product.model';
import { ImageUtils } from '../../shared/image-utils';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  cartItems: Cart[] = [];
  loading = false;
  isProcessing = false;
  paymentMethod = 'razorpay';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
    this.loadRazorpayScript();
  }

  loadCartItems(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.cartService.getCartByUser(user.id).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.loading = false;
      }
    });
  }

  loadRazorpayScript(): void {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }

  placeOrder(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.router.navigate(['/login']);
      return;
    }

    this.isProcessing = true;
    console.log('🛒 STEP 1: Starting order placement process...');

    // First create order
    this.orderService.createOrder(user.id).subscribe({
      next: (orderResponse) => {
        console.log('✅ STEP 2: Order created successfully with ID:', orderResponse.order.id);
        
        // Then create Razorpay order
        this.paymentService.createRazorpayOrder(user.id!, this.getTotal()).subscribe({
          next: (razorpayOrder) => {
            console.log('💳 STEP 3: Razorpay order created, initiating payment...');
            this.initiateRazorpayPayment(razorpayOrder, orderResponse.order.id!);
          },
          error: (error) => {
            console.error('Error creating Razorpay order:', error);
            this.isProcessing = false;
            alert('Failed to initiate payment. Please try again.');
          }
        });
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.isProcessing = false;
        alert('Failed to create order. Please try again.');
      }
    });
  }

  initiateRazorpayPayment(razorpayOrder: any, orderId: number): void {
    // For testing - simulate successful payment
    if (confirm('Simulate successful payment for testing?')) {
      const testResponse = {
        razorpay_payment_id: 'pay_test_' + Date.now(),
        razorpay_order_id: razorpayOrder.id,
        razorpay_signature: 'test_signature_' + Date.now()
      };
      console.log('Simulating payment success:', testResponse);
      this.verifyPayment(testResponse, orderId);
      return;
    }

    const options = {
      key: 'rzp_test_PgGnTQsPl4QAPg',
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || 'INR',
      name: 'ShopEasy',
      description: 'Order Payment',
      order_id: razorpayOrder.id,
      handler: (response: any) => {
        console.log('Razorpay handler called with:', response);
        this.verifyPayment(response, orderId);
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed');
          this.isProcessing = false;
        }
      },
      theme: {
        color: '#ff9900'
      }
    };

    console.log('Opening Razorpay with options:', options);
    if (typeof Razorpay === 'undefined') {
      alert('Razorpay not loaded. Using test mode.');
      this.verifyPayment({
        razorpay_payment_id: 'pay_test_' + Date.now(),
        razorpay_order_id: razorpayOrder.id,
        razorpay_signature: 'test_signature'
      }, orderId);
      return;
    }
    
    const rzp = new Razorpay(options);
    rzp.open();
  }

  verifyPayment(response: any, orderId: number): void {
    console.log('Full Razorpay Response:', JSON.stringify(response, null, 2));
    
    // Just check if we have any payment identifier
    const paymentId = response.razorpay_payment_id || response.payment_id || response.id;
    
    if (!paymentId) {
      console.error('No payment ID found in response');
      alert('Payment verification failed - no payment ID');
      this.isProcessing = false;
      return;
    }
    
    console.log('Payment ID found:', paymentId);
    
    const paymentData = {
      razorpay_order_id: response.razorpay_order_id || response.order_id || 'manual_order',
      razorpay_payment_id: paymentId,
      razorpay_signature: response.razorpay_signature || response.signature || 'manual_signature',
      orderId: orderId
    };
    
    console.log('Sending to backend:', paymentData);

    this.paymentService.verifyPayment(paymentData).subscribe({
      next: (verificationResponse) => {
        console.log('✅ STEP 4: Payment verified successfully!');
        console.log('🧾 STEP 5: Generating receipt for order:', orderId);
        this.isProcessing = false;
        this.clearCart();
        this.router.navigate(['/receipt', orderId]);
      },
      error: (error) => {
        console.error('❌ Payment verification failed:', error);
        this.isProcessing = false;
        alert('Payment verification failed: ' + (error.error?.error || error.message));
      }
    });
  }
  
  clearCart(): void {
    const user = this.authService.getCurrentUser();
    if (user?.id) {
      this.cartService.clearCart(user.id).subscribe({
        next: () => {
          console.log('Cart cleared successfully');
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
        }
      });
    }
  }

  getProductImage(product: Product): string {
    return ImageUtils.getProductImageUrl(product, 'small');
  }
  
  onImageError(event: any): void {
    ImageUtils.handleImageError(event, 'small');
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
}
