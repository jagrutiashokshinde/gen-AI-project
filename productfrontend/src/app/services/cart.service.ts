import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cart, CartRequest, CartResponse } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8081/api/cart';
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  addToCart(cartRequest: CartRequest): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.apiUrl}/add`, cartRequest)
      .pipe(tap(() => this.updateCartCount()));
  }

  getCartByUser(userId: number): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(tap(items => this.cartCountSubject.next(items.length)));
  }

  updateCartQuantity(cartId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${cartId}`, { quantity })
      .pipe(tap(() => this.updateCartCount()));
  }

  removeFromCart(cartId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${cartId}`)
      .pipe(tap(() => this.updateCartCount()));
  }

  clearCart(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear/${userId}`)
      .pipe(tap(() => this.cartCountSubject.next(0)));
  }

  private updateCartCount(): void {
    // This will be called after cart operations to refresh count
    // In a real app, you might want to fetch the current count
  }

  setCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }
}
