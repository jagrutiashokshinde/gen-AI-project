import { Product } from './product.model';
import { User } from './user.model';

export interface Order {
  id?: number;
  user: User;
  totalAmount: number;
  status: string;
  orderItems: OrderItem[];
  orderDate?: Date;
  createdAt?: Date;
}

export interface OrderItem {
  id?: number;
  order?: Order;
  product: Product;
  quantity: number;
  price: number;
}

export interface OrderResponse {
  message: string;
  order: Order;
}

export interface Payment {
  id?: number;
  userId: number;
  orderId?: number;
  amount: number;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt?: Date;
}