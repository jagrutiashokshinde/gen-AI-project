import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly baseUrl = 'http://localhost:8081';
  private readonly defaultImage = 'https://via.placeholder.com/200x200/cccccc/666666?text=No+Image';

  constructor() { }

  getProductImageUrl(product: Product, size: 'small' | 'medium' | 'large' = 'medium'): string {
    if (product.imagePath) {
      return `${this.baseUrl}${product.imagePath}`;
    }
    
    // Return different placeholder sizes based on usage
    switch (size) {
      case 'small':
        return 'https://via.placeholder.com/60x60/cccccc/666666?text=No+Image';
      case 'large':
        return 'https://via.placeholder.com/500x500/cccccc/666666?text=No+Image';
      default:
        return this.defaultImage;
    }
  }

  getImageUrl(imagePath: string): string {
    return imagePath ? `${this.baseUrl}${imagePath}` : this.defaultImage;
  }

  isValidImagePath(imagePath?: string): boolean {
    return !!imagePath && imagePath.trim().length > 0;
  }
}
