package com.smartcampus.services;

import com.smartcampus.models.Booking;
import com.smartcampus.repositories.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public Booking createBooking(Booking booking) {
        if (booking.getEndTime().isBefore(booking.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        
        // Ensure status is PENDING initially
        booking.setStatus("PENDING");
        
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                booking.getFacilityId(), booking.getStartTime(), booking.getEndTime()
        );
        
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Facility is already booked for the requested time frame.");
        }
        
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUsername(String username) {
        return bookingRepository.findByUsername(username);
    }

    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }

    public Booking approveBooking(String id) {
        Optional<Booking> optBooking = bookingRepository.findById(id);
        if (optBooking.isPresent()) {
            Booking booking = optBooking.get();
            
            // Re-check conflict before approving just in case
            List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                    booking.getFacilityId(), booking.getStartTime(), booking.getEndTime()
            );
            
            if (!overlapping.isEmpty()) {
                throw new IllegalArgumentException("Conflict detected! Another booking is already approved.");
            }
            
            booking.setStatus("APPROVED");
            return bookingRepository.save(booking);
        }
        throw new RuntimeException("Booking not found");
    }

    public Booking rejectBooking(String id) {
        Optional<Booking> optBooking = bookingRepository.findById(id);
        if (optBooking.isPresent()) {
            Booking booking = optBooking.get();
            booking.setStatus("REJECTED");
            return bookingRepository.save(booking);
        }
        throw new RuntimeException("Booking not found");
    }

    public boolean deleteBooking(String id) {
        if (bookingRepository.existsById(id)) {
            bookingRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
