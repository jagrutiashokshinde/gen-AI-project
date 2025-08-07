package com.example.ProductApplication.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchase")
public class PurchaseController {
    @PreAuthorize("hasRole('USER')")
    @PostMapping("/{productId}")
    public String purchaseProduct(@PathVariable Long productId) {
        // Implement purchase logic here
        return "Product purchased successfully!";
    }
}
