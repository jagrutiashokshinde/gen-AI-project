import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { ImageUtils } from '../../shared/image-utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = [];
  searchQuery = '';
  loading = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.loadAllProducts();
    });
  }

  loadAllProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.filterProducts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  searchProducts(): void {
    this.filterProducts();
  }

  filterProducts(): void {
    if (!this.searchQuery.trim()) {
      this.products = [...this.allProducts];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.products = this.allProducts.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  addToCart(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user?.id || !product.id) {
      return;
    }

    const cartRequest = {
      userId: user.id,
      productId: product.id,
      quantity: 1
    };

    this.cartService.addToCart(cartRequest).subscribe({
      next: (response) => {
        alert('Product added to cart successfully!');
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert('Failed to add product to cart. Please try again.');
      }
    });
  }

  getProductImage(product: Product): string {
    return ImageUtils.getProductImageUrl(product, 'medium');
  }

  onImageError(event: any): void {
    ImageUtils.handleImageError(event, 'medium');
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
}
