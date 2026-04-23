package com.smartcampus.services;

import com.smartcampus.models.Notification;
import com.smartcampus.models.Role;
import com.smartcampus.models.User;
import com.smartcampus.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FileUploadService fileUploadService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
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

    public void deleteUser(String id, String actingAdminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (actingAdminUsername != null && actingAdminUsername.equals(user.getUsername())) {
            throw new RuntimeException("You cannot delete your own admin account.");
        }

        userRepository.deleteById(id);
    }

    public User updateCurrentUserProfile(String username, String email) {
        User user = getUserByUsername(username);

        if (email != null && !email.isBlank()) {
            userRepository.findByEmail(email)
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .ifPresent(existing -> {
                        throw new RuntimeException("Email already exists");
                    });
            user.setEmail(email);
        } else {
            user.setEmail(null);
        }

        return userRepository.save(user);
    }

    public void updateCurrentUserPassword(String username, String currentPassword, String newPassword) {
        User user = getUserByUsername(username);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User updateCurrentUserPhoto(String username, MultipartFile photo) throws Exception {
        User user = getUserByUsername(username);
        String photoUrl = fileUploadService.saveFile(photo);
        user.setPhotoUrl(photoUrl);
        return userRepository.save(user);
    }
}
