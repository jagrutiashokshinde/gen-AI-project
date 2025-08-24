package com.example.ProductApplication.service;

import com.example.ProductApplication.entity.Cart;
import com.example.ProductApplication.entity.User;
import com.example.ProductApplication.entity.Product;
import com.example.ProductApplication.repository.CartRepository;
import com.example.ProductApplication.repository.UserRepository;
import com.example.ProductApplication.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;

    public Cart addToCart(Long userId, Long productId, Integer quantity) {
        User user = userRepository.findById(userId).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();
        
        Optional<Cart> existingCart = cartRepository.findByUserAndProduct(user, product);
        
        if (existingCart.isPresent()) {
            Cart cart = existingCart.get();
            cart.setQuantity(cart.getQuantity() + quantity);
            return cartRepository.save(cart);
        } else {
            Cart newCart = new Cart(user, product, quantity);
            return cartRepository.save(newCart);
        }
    }

    public List<Cart> getCartByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return cartRepository.findByUser(user);
    }

    public Cart updateCartQuantity(Long cartId, Integer quantity) {
        Cart cart = cartRepository.findById(cartId).orElseThrow();
        
        if (quantity <= 0) {
            cartRepository.delete(cart);
            return null;
        } else {
            cart.setQuantity(quantity);
            return cartRepository.save(cart);
        }
    }

    public void removeFromCart(Long cartId) {
        cartRepository.deleteById(cartId);
    }

    @Transactional
    public void clearCart(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        cartRepository.deleteByUser(user);
    }
}