package com.example.ProductApplication.controller;

import com.example.ProductApplication.entity.Product;
import com.example.ProductApplication.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/add")
public ResponseEntity<?> addProduct(
        @RequestParam("name") String name,
        @RequestParam("description") String description,
        @RequestParam("price") Double price,
        @RequestParam("quantity") Long quantity,
        @RequestParam(value = "image", required = false) MultipartFile image,
        @RequestParam(value = "imagePath", required = false) String imagePath) {
    try {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setQuantity(quantity);
        
        if (image != null && !image.isEmpty()) {
            String uploadDir = "uploads/images/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(image.getInputStream(), filePath);
            product.setImagePath("/uploads/images/" + fileName);
        } else if (imagePath != null && !imagePath.isEmpty()) {
            product.setImagePath(imagePath);
        }
        
        Product savedProduct = productService.saveProduct(product);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Product added successfully");
        response.put("product", savedProduct);
        return ResponseEntity.ok(response);
    } catch (IOException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Failed to upload image: " + e.getMessage());
        return ResponseEntity.badRequest().body(error);
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Failed to add product: " + e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}



    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("quantity") Long quantity,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "imagePath", required = false) String imagePath) {
        try {
            Product product = productService.getProduct(id);
            if (product == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Product not found");
                return ResponseEntity.notFound().build();
            }
            
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setQuantity(quantity);
            
            if (image != null && !image.isEmpty()) {
                String uploadDir = "uploads/images/";
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                
                String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(image.getInputStream(), filePath);
                product.setImagePath("/uploads/images/" + fileName);
            } else if (imagePath != null && !imagePath.isEmpty()) {
                product.setImagePath(imagePath);
            }
            
            Product updatedProduct = productService.saveProduct(product);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product updated successfully");
            response.put("product", updatedProduct);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update product: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/delete/{id}")
public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
    try {
        Product product = productService.getProduct(id);
        if (product == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Product not found");
            return ResponseEntity.notFound().build();
        }
        
        productService.deleteProduct(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Product deleted successfully");
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Failed to delete product: " + e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/upload-image")
public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile image) {
    try {
        if (image.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Please select an image file");
            return ResponseEntity.badRequest().body(error);
        }
        
        String uploadDir = "uploads/images/";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(image.getInputStream(), filePath);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Image uploaded successfully");
        response.put("imagePath", "/uploads/images/" + fileName);
        return ResponseEntity.ok(response);
    } catch (IOException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Failed to upload image: " + e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

}
