import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin/admin.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  productForm!: FormGroup;
successMessage: any;

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      quantity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.adminService.addProduct(this.productForm.value).subscribe({
        next: (res) => {
          alert('✅ Product added successfully!');
          this.productForm.reset();
        },
        error: (err) => {
          alert('❌ Failed to add product!');
          console.error(err);
        }
      });
    }
  }
}
