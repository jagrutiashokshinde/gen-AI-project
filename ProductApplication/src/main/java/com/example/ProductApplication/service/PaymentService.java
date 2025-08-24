package com.example.ProductApplication.service;

import com.example.ProductApplication.entity.Payment;
import com.example.ProductApplication.entity.User;
import com.example.ProductApplication.repository.PaymentRepository;
import com.example.ProductApplication.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RazorpayService razorpayService;

    public Map<String, Object> createRazorpayOrder(Long userId, Double amount) throws RazorpayException {
        User user = userRepository.findById(userId).orElseThrow();
        
        // Check if user already has a pending payment for this amount
        List<Payment> pendingPayments = paymentRepository.findByUserAndStatus(user, "PENDING");
        for (Payment existingPayment : pendingPayments) {
            if (existingPayment.getTotalAmount().equals(amount)) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", existingPayment.getRazorpayOrderId());
                response.put("amount", amount * 100);
                response.put("currency", "INR");
                response.put("paymentId", existingPayment.getId());
                return response;
            }
        }
        
        String receipt = "order_" + System.currentTimeMillis();
        Order razorpayOrder = razorpayService.createOrder(amount, "INR", receipt);
        
        Payment payment = new Payment(user, amount, "RAZORPAY", "PENDING");
        payment.setRazorpayOrderId(razorpayOrder.get("id"));
        paymentRepository.save(payment);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", razorpayOrder.get("id"));
        response.put("amount", razorpayOrder.get("amount"));
        response.put("currency", razorpayOrder.get("currency"));
        response.put("paymentId", payment.getId());
        
        return response;
    }
    
    public Payment verifyAndCompletePayment(String razorpayOrderId, String paymentId, String signature, Long orderDbId) {
        System.out.println("Verifying payment for Razorpay Order ID: " + razorpayOrderId);
        
        boolean isValid = razorpayService.verifyPayment(razorpayOrderId, paymentId, signature);
        System.out.println("Payment signature verification result: " + isValid);
        
        // Find payment by razorpay order id
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
        if (payment == null) {
            System.err.println("Payment not found for Razorpay Order ID: " + razorpayOrderId);
            throw new RuntimeException("Payment not found for order: " + razorpayOrderId);
        }
        
        System.out.println("Found payment with ID: " + payment.getId());
        
        // Accept payment if we have any payment ID
        if (paymentId != null && !paymentId.isEmpty()) {
            payment.setStatus("PAID");
            payment.setOrderId(orderDbId);
            payment.setRazorpayPaymentId(paymentId);
            payment.setRazorpaySignature(signature);
            System.out.println("Payment updated to PAID status with payment ID: " + paymentId);
        } else {
            payment.setStatus("FAILED");
            System.out.println("Payment marked as FAILED - no payment ID");
        }
        
        Payment savedPayment = paymentRepository.save(payment);
        System.out.println("Payment saved with status: " + savedPayment.getStatus());
        return savedPayment;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return paymentRepository.findByUser(user);
    }

    public Payment getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId).orElse(null);
    }
}