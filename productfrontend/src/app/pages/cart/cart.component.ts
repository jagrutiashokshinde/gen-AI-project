import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Cart } from '../../models/cart.model';
import { Product } from '../../models/product.model';
import { ImageUtils } from '../../shared/image-utils';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cartItems: Cart[] = [];
  loading = false;
  isUpdating = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
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

  updateQuantity(item: Cart, newQuantity: number): void {
    if (newQuantity < 1 || !item.id) return;
    
    this.isUpdating = true;
    this.cartService.updateCartQuantity(item.id, newQuantity).subscribe({
      next: () => {
        item.quantity = newQuantity;
        this.isUpdating = false;
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.isUpdating = false;
        alert('Failed to update quantity. Please try again.');
      }
    });
  }

  removeItem(item: Cart): void {
    if (!item.id) return;
    
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      this.isUpdating = true;
      this.cartService.removeFromCart(item.id).subscribe({
        next: () => {
          this.cartItems = this.cartItems.filter(cartItem => cartItem.id !== item.id);
          this.isUpdating = false;
        },
        error: (error) => {
          console.error('Error removing item:', error);
          this.isUpdating = false;
          alert('Failed to remove item. Please try again.');
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

  getStockBadgeClass(product: Product): string {
    if (product.quantity === 0) return 'bg-danger';
    if (product.quantity < 10) return 'bg-warning';
    return 'bg-success';
  }

  getStockText(product: Product): string {
    if (product.quantity === 0) return 'Out of Stock';
    if (product.quantity < 10) return `${product.quantity} left`;
    return 'In Stock';
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
