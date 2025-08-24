package com.example.ProductApplication.controller;

import com.example.ProductApplication.entity.Cart;
import com.example.ProductApplication.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('USER')")
public class CartController {
    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long productId = Long.valueOf(request.get("productId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());
            
            Cart cart = cartService.addToCart(userId, productId, quantity);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product added to cart successfully");
            response.put("cart", cart);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add to cart: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Cart>> getCartByUser(@PathVariable Long userId) {
        List<Cart> cartItems = cartService.getCartByUser(userId);
        return ResponseEntity.ok(cartItems);
    }

    @PutMapping("/update/{cartId}")
    public ResponseEntity<?> updateCartQuantity(@PathVariable Long cartId, @RequestBody Map<String, Object> request) {
        try {
            Integer quantity = Integer.valueOf(request.get("quantity").toString());
            Cart updatedCart = cartService.updateCartQuantity(cartId, quantity);
            
            if (updatedCart == null) {
                return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
            }
            
            return ResponseEntity.ok(Map.of("message", "Cart updated successfully", "cart", updatedCart));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update cart: " + e.getMessage()));
        }
    }

    @DeleteMapping("/remove/{cartId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartId) {
        cartService.removeFromCart(cartId);
        return ResponseEntity.ok(Map.of("message", "Item removed from cart successfully"));
    }

    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(Map.of("message", "Cart cleared successfully"));
    }
}