package com.example.ProductApplication.service;

import com.example.ProductApplication.entity.Product;
import com.example.ProductApplication.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    public Product getProduct(Long id) {
        return productRepository.findById(id).orElse(null);
    }
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
    
    public void reduceQuantity(Long productId, Long quantity) {
        Product product = productRepository.findById(productId).orElseThrow(
            () -> new RuntimeException("Product not found"));
        
        if (product.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }
        
        product.setQuantity(product.getQuantity() - quantity);
        productRepository.save(product);
    }
}
