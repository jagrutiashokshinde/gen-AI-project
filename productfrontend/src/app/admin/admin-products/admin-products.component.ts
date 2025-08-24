import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-products',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss'
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  productForm!: FormGroup;
  showAddForm = false;
  showEditForm = false;
  editingProduct: Product | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isSubmitting = false;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProducts();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(0)]]
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe(products => {
      this.products = products;
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
      this.imagePreview = null;
    }
  }

  addProduct(): void {
    if (this.productForm.valid) {
      this.isSubmitting = true;
      const formData = new FormData();
      
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('quantity', this.productForm.get('quantity')?.value);
      
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
        console.log('Image file selected:', this.selectedFile.name);
      } else {
        console.log('No image file selected');
      }
      
      console.log('Submitting product with FormData');
      
      this.productService.addProduct(formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.showAddForm = false;
          this.productForm.reset();
          this.selectedFile = null;
          this.imagePreview = null;
          this.loadProducts();
          console.log('Product added successfully:', response);
          alert('Product added successfully!');
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error adding product:', error);
          alert('Failed to add product: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.showEditForm = true;
    this.showAddForm = false;
    
    // Populate form with existing product data
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity
    });
    
    // Set current image preview if exists
    if (product.imagePath) {
      this.imagePreview = this.getProductImage(product);
    } else {
      this.imagePreview = null;
    }
    
    this.selectedFile = null;
  }
  
  updateProduct(): void {
    if (this.productForm.valid && this.editingProduct?.id) {
      this.isSubmitting = true;
      const formData = new FormData();
      
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('quantity', this.productForm.get('quantity')?.value);
      
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      
      this.productService.updateProduct(this.editingProduct.id, formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.cancelEdit();
          this.loadProducts();
          alert('Product updated successfully!');
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating product:', error);
          alert('Failed to update product: ' + (error.error?.message || error.message));
        }
      });
    }
  }
  
  cancelEdit(): void {
    this.showEditForm = false;
    this.editingProduct = null;
    this.productForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      this.productService.deleteProduct(product.id!).subscribe({
        next: () => {
          this.loadProducts();
          alert('Product deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product.');
        }
      });
    }
  }

  getProductImage(product: Product): string {
    return product.imagePath ? `http://localhost:8081${product.imagePath}` : 'https://via.placeholder.com/60x60/cccccc/666666?text=No+Image';
  }
  
  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/60x60/cccccc/666666?text=No+Image';
  }

  getStockBadgeClass(product: Product): string {
    if (product.quantity === 0) return 'bg-danger';
    if (product.quantity < 10) return 'bg-warning';
    return 'bg-success';
  }

  cancelAddProduct(): void {
    this.showAddForm = false;
    this.productForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
  }
  
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.showEditForm = false;
    this.editingProduct = null;
    this.productForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
  }
}
