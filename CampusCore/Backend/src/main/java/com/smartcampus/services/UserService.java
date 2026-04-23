package com.smartcampus.services;

import com.smartcampus.models.Notification;
import com.smartcampus.models.Role;
import com.smartcampus.models.User;
import com.smartcampus.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public User updateUserRole(String id, Role newRole) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Role previousRole = user.getRole();
            user.setRole(newRole);
            User updatedUser = userRepository.save(user);

            if (previousRole != newRole) {
                String message = String.format(
                        "%s was assigned the %s role.",
                        updatedUser.getUsername(),
                        newRole.name()
                );
                notificationService.createNotification(new Notification(message, newRole));
            }

            return updatedUser;
        }
        throw new RuntimeException("User not found with id: " + id);
    }
}
