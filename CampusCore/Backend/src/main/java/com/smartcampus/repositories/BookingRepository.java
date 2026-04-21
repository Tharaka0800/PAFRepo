package com.smartcampus.repositories;

import com.smartcampus.models.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    
    // Check if there are overlapping APPROVED bookings for the requested facility
    @Query("{ 'facilityId': ?0, 'status': 'APPROVED', 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }")
    List<Booking> findOverlappingBookings(String facilityId, LocalDateTime reqStartTime, LocalDateTime reqEndTime);

    List<Booking> findByUsername(String username);
}
