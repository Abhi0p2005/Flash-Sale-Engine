package com.flashengine.flashEngine.service;

import com.flashengine.flashEngine.dto.ProfileUpdateRequest;
import com.flashengine.flashEngine.model.Address;
import com.flashengine.flashEngine.model.User;
import com.flashengine.flashEngine.repository.AddressRepository;
import com.flashengine.flashEngine.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public UserService(UserRepository userRepository, AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public User updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = getUserById(userId);
        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        return userRepository.save(user);
    }

    public List<Address> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    public Address addAddress(Long userId, Address address) {
        address.setUserId(userId);
        return addressRepository.save(address);
    }

    public Address updateAddress(Long addressId, Long userId, Address updated) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        updated.setId(addressId);
        updated.setUserId(userId);
        return addressRepository.save(updated);
    }

    public void deleteAddress(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        addressRepository.delete(address);
    }
}
