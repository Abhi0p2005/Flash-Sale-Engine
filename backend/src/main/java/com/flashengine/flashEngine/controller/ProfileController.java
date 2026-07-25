package com.flashengine.flashEngine.controller;

import com.flashengine.flashEngine.dto.ProfileUpdateRequest;
import com.flashengine.flashEngine.model.Address;
import com.flashengine.flashEngine.model.User;
import com.flashengine.flashEngine.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(Authentication auth,
                                               @Valid @RequestBody ProfileUpdateRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<Address>> getAddresses(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(userService.getUserAddresses(userId));
    }

    @PostMapping("/addresses")
    public ResponseEntity<Address> addAddress(Authentication auth,
                                               @Valid @RequestBody Address address) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(userService.addAddress(userId, address));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<Address> updateAddress(Authentication auth,
                                                  @PathVariable Long id,
                                                  @Valid @RequestBody Address address) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(userService.updateAddress(id, userId, address));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        userService.deleteAddress(id, userId);
        return ResponseEntity.noContent().build();
    }
}
