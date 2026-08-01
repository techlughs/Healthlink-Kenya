package com.healthlink.backend.repository;

import com.healthlink.backend.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends MongoRepository<Doctor, String> {
    
    List<Doctor> findBySpecialty(String specialty);

    List<Doctor> findByLocation(String location);

    List<Doctor> findByHospital(String hospital);

    List<Doctor> findBySpecialtyAndLocation(String specialty, String location);

    Optional<Doctor> findByUserId(String userId);
}