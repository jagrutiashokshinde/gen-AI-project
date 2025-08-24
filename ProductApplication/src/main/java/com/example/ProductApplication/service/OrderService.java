package com.example.ProductApplication.service;

import com.example.ProductApplication.entity.*;
import com.example.ProductApplication.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private ProductService productService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Order createOrderFromCart(Long userId) {
        System.out.println("Creating order for user: " + userId);
        User user = userRepository.findById(userId).orElseThrow();
        
        List<Cart> cartItems = cartService.getCartByUser(userId);
        System.out.println("Cart items: " + cartItems.size());
        
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Double totalAmount = cartItems.stream()
            .mapToDouble(cart -> cart.getProduct().getPrice() * cart.getQuantity())
            .sum();
        System.out.println("Total amount: " + totalAmount);

        Order order = new Order(user, totalAmount, "PENDING");
        order = orderRepository.save(order);
        System.out.println("Order created with ID: " + order.getId());

        List<OrderItem> orderItems = new ArrayList<>();
        for (Cart cart : cartItems) {
            OrderItem orderItem = new OrderItem(order, cart.getProduct(), 
                cart.getQuantity(), cart.getProduct().getPrice());
            OrderItem savedItem = orderItemRepository.save(orderItem);
            orderItems.add(savedItem);
            System.out.println("OrderItem saved with ID: " + savedItem.getId());
        }
        
        order.setOrderItems(orderItems);
        Order savedOrder = orderRepository.saveAndFlush(order);
        System.out.println("Order saved and flushed with " + orderItems.size() + " items");
        
        // Verify order is in database
        Order verifyOrder = orderRepository.findById(savedOrder.getId()).orElse(null);
        if (verifyOrder != null) {
            System.out.println("✅ Order verified in database with ID: " + verifyOrder.getId());
        } else {
            System.err.println("❌ Order NOT found in database after save!");
        }
        
        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return orderRepository.findByUser(user);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(status);
        return orderRepository.save(order);
    }
}