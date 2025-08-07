package com.example.ProductApplication.service;

import com.example.ProductApplication.entity.User;
import com.example.ProductApplication.entity.Role;
import com.example.ProductApplication.repository.UserRepository;
import com.example.ProductApplication.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashSet;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(String username, String password, String roleName) {
    System.out.println("Registering: " + username + " with role: " + roleName);
    
    if (userRepository.findByUsername(username).isPresent()) {
        throw new RuntimeException("Username already exists.");
    }

    Role role = roleRepository.findByName(roleName);
    if (role == null) {
        throw new RuntimeException("Role not found: " + roleName);
    }

    User user = new User();
    user.setUsername(username);
    user.setPassword(passwordEncoder.encode(password));
    user.setRoles(new HashSet<>());
    user.getRoles().add(role);
    
    return userRepository.save(user);
}


    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
