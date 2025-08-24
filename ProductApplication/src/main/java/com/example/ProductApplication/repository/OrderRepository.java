package com.example.ProductApplication.repository;

import com.example.ProductApplication.entity.Order;
import com.example.ProductApplication.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    List<Order> findByStatus(String status);
    List<Order> findByUserAndStatus(User user, String status);
}