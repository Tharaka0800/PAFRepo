package com.smartcampus.repositories;

import com.smartcampus.models.Facility;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface FacilityRepository extends MongoRepository<Facility, String> {
    
    @Query("{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'type': { $regex: ?0, $options: 'i' } } ] }")
    List<Facility> searchFacilities(String query);

    List<Facility> findByType(String type);
}
