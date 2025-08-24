package com.example.ProductApplication.controller;

import com.example.ProductApplication.service.OrderService;
import com.example.ProductApplication.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/purchase")
public class PurchaseController {
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private PaymentService paymentService;
    
    @PreAuthorize("hasRole('USER')")
    @PostMapping("/create-order/{userId}")
    public ResponseEntity<?> createOrderForCheckout(@PathVariable Long userId) {
        try {
            var order = orderService.createOrderFromCart(userId);
            
            // Only create Razorpay order if not already created
            Map<String, Object> razorpayOrder;
            try {
                razorpayOrder = paymentService.createRazorpayOrder(userId, order.getTotalAmount());
            } catch (Exception e) {
                // If Razorpay order already exists, return existing order info
                razorpayOrder = new HashMap<>();
                razorpayOrder.put("message", "Order already exists");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("order", order);
            response.put("razorpayOrder", razorpayOrder);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create order: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PreAuthorize("hasRole('USER')")
    @PostMapping("/complete/{orderId}")
    public ResponseEntity<?> completePurchase(@PathVariable Long orderId, @RequestBody Map<String, Object> request) {
        try {
            String razorpayOrderId = request.get("razorpay_order_id").toString();
            String paymentId = request.get("razorpay_payment_id").toString();
            String signature = request.get("razorpay_signature").toString();
            Long paymentDbId = Long.valueOf(request.get("payment_id").toString());
            
            var payment = paymentService.verifyAndCompletePayment(razorpayOrderId, paymentId, signature, paymentDbId);
            
            if ("COMPLETED".equals(payment.getStatus())) {
                orderService.updateOrderStatus(orderId, "COMPLETED");
            } else {
                orderService.updateOrderStatus(orderId, "FAILED");
            }
            
            Map<String, Object> response = new HashMap<>();
            if ("COMPLETED".equals(payment.getStatus())) {
                response.put("message", "Purchase completed successfully!");
            } else {
                response.put("message", "Purchase failed - payment verification failed");
            }
            response.put("payment", payment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Purchase completion failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
