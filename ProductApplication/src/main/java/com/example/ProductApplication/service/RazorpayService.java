package com.example.ProductApplication.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RazorpayService {
    
    @Autowired
    private RazorpayClient razorpayClient;
    
    public Order createOrder(Double amount, String currency, String receipt) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount * 100); // Amount in paise
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", receipt);
        
        return razorpayClient.orders.create(orderRequest);
    }
    
    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);
            
            return com.razorpay.Utils.verifyPaymentSignature(options, "63nnMt5EmAKzINIXmCOSskvF");
        } catch (Exception e) {
            return false;
        }
    }
}