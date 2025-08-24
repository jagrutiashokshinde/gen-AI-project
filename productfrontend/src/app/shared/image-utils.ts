import { Product } from '../models/product.model';

/**
 * Utility functions for handling product images
 */
export class ImageUtils {
  private static readonly BASE_URL = 'http://localhost:8081';
  
  /**
   * Get the full URL for a product image
   * @param product The product object
   * @param size The size variant (small, medium, large)
   * @returns The complete image URL or placeholder
   */
  static getProductImageUrl(product: Product, size: 'small' | 'medium' | 'large' = 'medium'): string {
    if (product.imagePath && product.imagePath.trim()) {
      // Ensure the path starts with /
      const imagePath = product.imagePath.startsWith('/') ? product.imagePath : `/${product.imagePath}`;
      return `${this.BASE_URL}${imagePath}`;
    }
    
    return this.getPlaceholderImage(size);
  }
  
  /**
   * Get placeholder image based on size
   * @param size The size variant
   * @returns Placeholder image URL
   */
  private static getPlaceholderImage(size: 'small' | 'medium' | 'large'): string {
    const dimensions = {
      small: '60x60',
      medium: '200x200',
      large: '500x500'
    };
    
    return `https://via.placeholder.com/${dimensions[size]}/cccccc/666666?text=No+Image`;
  }
  
  /**
   * Check if an image path is valid
   * @param imagePath The image path to validate
   * @returns True if valid, false otherwise
   */
  static isValidImagePath(imagePath?: string): boolean {
    return !!(imagePath && imagePath.trim().length > 0);
  }
  
  /**
   * Handle image load errors by setting a fallback
   * @param event The error event
   * @param size The size for the fallback image
   */
  static handleImageError(event: any, size: 'small' | 'medium' | 'large' = 'medium'): void {
    event.target.src = this.getPlaceholderImage(size);
  }
}