import { Product } from './product.model';
import { User } from './user.model';

export interface Cart {
  id?: number;
  user: User;
  product: Product;
  quantity: number;
}

export interface CartRequest {
  userId: number;
  productId: number;
  quantity: number;
}

export interface CartResponse {
  message: string;
  cart?: Cart;
}