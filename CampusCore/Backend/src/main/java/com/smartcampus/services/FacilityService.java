package com.smartcampus.services;

import com.smartcampus.models.Facility;
import com.smartcampus.repositories.FacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FacilityService {

    @Autowired
    private FacilityRepository facilityRepository;

    public Facility createFacility(Facility facility) {
        return facilityRepository.save(facility);
    }

    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    public Optional<Facility> getFacilityById(String id) {
        return facilityRepository.findById(id);
    }

    public List<Facility> searchFacilities(String query) {
        if (query == null || query.isEmpty()) {
            return facilityRepository.findAll();
        }
        return facilityRepository.searchFacilities(query);
    }

    public Optional<Facility> updateFacility(String id, Facility facilityDetails) {
        return facilityRepository.findById(id).map(existing -> {
            existing.setName(facilityDetails.getName());
            existing.setType(facilityDetails.getType());
            existing.setLocation(facilityDetails.getLocation());
            existing.setCapacity(facilityDetails.getCapacity());
            existing.setAvailable(facilityDetails.isAvailable());
            return facilityRepository.save(existing);
        });
    }

    public boolean deleteFacility(String id) {
        if (facilityRepository.existsById(id)) {
            facilityRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
