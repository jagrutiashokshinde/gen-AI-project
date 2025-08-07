import { Routes } from '@angular/router';
import { AddProductComponent } from './admin/add-product/add-product.component';
import { UpdateProductComponent } from './admin/update-product/update-product.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { ViewProductsComponent } from './user/view-products/view-products.component';
import { PurchaseComponent } from './user/purchase/purchase.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DeleteProductComponent } from './admin/delete-product/delete-product.component';
import { FirstComponent } from './first/first.component';
import { AdminroleComponent } from './admin/adminrole/adminrole.component';
import { UserroleComponent } from './user/userrole/userrole.component';
imports :[FormsModule,ReactiveFormsModule]
export const routes: Routes = [
  { path: 'admin/add-product', component: AddProductComponent },
  { path: 'admin/update-product', component: UpdateProductComponent },
 
  { path: 'user/view-products', component: ViewProductsComponent },
  { path: 'user/purchase', component: PurchaseComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'admin/delete-product', component: DeleteProductComponent},
  { path: 'first/jagruti', component:FirstComponent},
  {path :'admin/role', component:AdminroleComponent},
  {path:'user/role',component:UserroleComponent},
  { path: '', redirectTo: 'first/jagruti', pathMatch: 'full' },
  { path: '**', redirectTo: 'first/jagruti' }
];
