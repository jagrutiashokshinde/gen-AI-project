package com.example.ProductApplication.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {
    
    @Value("${razorpay.key.id:rzp_test_key}")
    private String keyId;
    
    @Value("${razorpay.key.secret:rzp_test_secret}")
    private String keySecret;
    
    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        return new RazorpayClient(keyId, keySecret);
    }
}