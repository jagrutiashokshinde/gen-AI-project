export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imagePath?: string;
}

export interface ProductResponse {
  message: string;
  product: Product;
}