package com.example.ProductApplication.controller;

import com.example.ProductApplication.entity.Product;
import com.example.ProductApplication.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Long id) {
        return productService.getProduct(id);
    }

  @PostMapping("/products/add")
@PreAuthorize("hasRole('ADMIN')") // ensures only ADMINs can add
public ResponseEntity<Product> addProduct(@RequestBody Product product) {
    return new ResponseEntity<>(productService.saveProduct(product), HttpStatus.CREATED);
}


    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        return productService.saveProduct(product);
    }
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/delete/{id}")
public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
    productService.deleteProduct(id);
    return ResponseEntity.ok("Product deleted successfully.");
}

}
