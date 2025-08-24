import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { ImageUtils } from '../../shared/image-utils';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  selectedQuantity = 1;
  isAddingToCart = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(id: number): void {
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.error = '';
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.error = 'Product not found or failed to load.';
      }
    });
  }

  getProductImage(): string {
    return this.product ? ImageUtils.getProductImageUrl(this.product, 'large') : 'https://via.placeholder.com/500x500/cccccc/666666?text=No+Image';
  }
  
  onImageError(event: any): void {
    ImageUtils.handleImageError(event, 'large');
  }

  getStockBadgeClass(): string {
    if (!this.product) return 'badge-secondary';
    if (this.product.quantity === 0) return 'badge bg-danger';
    if (this.product.quantity < 10) return 'badge bg-warning';
    return 'badge bg-success';
  }

  getStockText(): string {
    if (!this.product) return 'Loading...';
    if (this.product.quantity === 0) return 'Out of Stock';
    if (this.product.quantity < 10) return `Only ${this.product.quantity} left`;
    return 'In Stock';
  }

  increaseQuantity(): void {
    if (this.product && this.selectedQuantity < this.product.quantity) {
      this.selectedQuantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user?.id || !this.product?.id) {
      return;
    }

    this.isAddingToCart = true;
    const cartRequest = {
      userId: user.id,
      productId: this.product.id,
      quantity: this.selectedQuantity
    };

    this.cartService.addToCart(cartRequest).subscribe({
      next: (response) => {
        this.isAddingToCart = false;
        // Show success message or redirect to cart
        alert('Product added to cart successfully!');
      },
      error: (error) => {
        this.isAddingToCart = false;
        console.error('Error adding to cart:', error);
        alert('Failed to add product to cart. Please try again.');
      }
    });
  }

  buyNow(): void {
    this.addToCart();
    // After adding to cart, redirect to checkout
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 1000);
  }
}
