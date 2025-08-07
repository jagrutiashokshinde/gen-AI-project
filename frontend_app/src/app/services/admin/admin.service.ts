// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

imports: [Observable,Router];
@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:8081/api/products';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get(`${this.apiUrl}`);
  }

  addProduct(product: any) {
    return this.http.post(`${this.apiUrl}/products/add`, product);
  }

  updateProduct(product: any, id: number) {
    return this.http.put(`${this.apiUrl}/update/${id}`, product);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
