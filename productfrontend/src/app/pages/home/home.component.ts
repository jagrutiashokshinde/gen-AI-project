import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { User } from '../../models/user.model';
import { ImageUtils } from '../../shared/image-utils';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  currentUser$: Observable<User | null>;
  categories = [
    { name: 'Electronics', icon: 'fas fa-laptop', description: 'Latest gadgets and electronics' },
    { name: 'Fashion', icon: 'fas fa-tshirt', description: 'Trendy clothing and accessories' },
    { name: 'Home & Garden', icon: 'fas fa-home', description: 'Everything for your home' },
    { name: 'Sports', icon: 'fas fa-dumbbell', description: 'Sports and fitness equipment' }
  ];

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Redirect admin users to admin panel
    if (this.authService.isAdminUser()) {
      this.router.navigate(['/admin']);
      return;
    }
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products.slice(0, 4);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  shopCategory(category: string): void {
    this.router.navigate(['/products'], { queryParams: { category } });
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  getProductImage(product: Product): string {
    return ImageUtils.getProductImageUrl(product, 'medium');
  }
  
  onImageError(event: any): void {
    ImageUtils.handleImageError(event, 'medium');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  isAdminUser(): boolean {
    return this.authService.isAdminUser();
  }
}
