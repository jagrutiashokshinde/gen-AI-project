package com.example.ProductApplication.controller;

import com.example.ProductApplication.entity.Payment;
import com.example.ProductApplication.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            
            Map<String, Object> orderData = paymentService.createRazorpayOrder(userId, amount);
            return ResponseEntity.ok(orderData);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create order: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PreAuthorize("hasRole('USER')")
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("Payment verification request: " + request);
            
            Object orderIdObj = request.get("razorpay_order_id");
            Object paymentIdObj = request.get("razorpay_payment_id");
            Object signatureObj = request.get("razorpay_signature");
            Object orderDbIdObj = request.get("orderId");
            
            if (orderIdObj == null || paymentIdObj == null || signatureObj == null || orderDbIdObj == null) {
                throw new RuntimeException("Missing required parameters: orderId=" + orderIdObj + ", paymentId=" + paymentIdObj + ", signature=" + signatureObj + ", orderDbId=" + orderDbIdObj);
            }
            
            String razorpayOrderId = orderIdObj.toString();
            String razorpayPaymentId = paymentIdObj.toString();
            String razorpaySignature = signatureObj.toString();
            Long orderDbId = Long.valueOf(orderDbIdObj.toString());
            
            System.out.println("Razorpay Order ID: " + razorpayOrderId);
            System.out.println("Razorpay Payment ID: " + razorpayPaymentId);
            System.out.println("Order DB ID: " + orderDbId);
            
            Payment payment = paymentService.verifyAndCompletePayment(razorpayOrderId, razorpayPaymentId, razorpaySignature, orderDbId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment verified successfully");
            response.put("payment", payment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Payment verification error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Payment verification failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<Payment>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Payment>> getPaymentsByUser(@PathVariable Long userId) {
        List<Payment> payments = paymentService.getPaymentsByUser(userId);
        return ResponseEntity.ok(payments);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    @GetMapping("/{paymentId}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long paymentId) {
        Payment payment = paymentService.getPaymentById(paymentId);
        if (payment != null) {
            return ResponseEntity.ok(payment);
        }
        return ResponseEntity.notFound().build();
    }
}