package com.example.ProductApplication.repository;

import com.example.ProductApplication.entity.Payment;
import com.example.ProductApplication.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUser(User user);
    List<Payment> findByStatus(String status);
    List<Payment> findByUserAndStatus(User user, String status);
    Payment findByRazorpayOrderId(String razorpayOrderId);
}