package com.healthlink.backend.service;

import com.healthlink.backend.exception.ResourceNotFoundException;
import com.healthlink.backend.model.Doctor;
import com.healthlink.backend.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    public Doctor addDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public Optional<Doctor> getDoctorById(String id) {
        return doctorRepository.findById(id);
    }

    public Optional<Doctor> getDoctorByUserId(String userId) {
        return doctorRepository.findByUserId(userId);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Page<Doctor> getAllDoctors(Pageable pageable) {
        return doctorRepository.findAll(pageable);
    }

    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        return doctorRepository.findBySpecialty(specialty);
    }

    public List<Doctor> getDoctorsByLocation(String location) {
        return doctorRepository.findByLocation(location);
    }

    public List<Doctor> getDoctorsByHospital(String hospital) {
        return doctorRepository.findByHospital(hospital);
    }

    public List<Doctor> getDoctorsBySpecialtyAndLocation(String specialty, String location) {
        return doctorRepository.findBySpecialtyAndLocation(specialty, location);
    }

    public Doctor updateDoctor(String id, Doctor updatedDoctor) {
        return doctorRepository.findById(id).map(existingDoctor -> {
            existingDoctor.setFullName(updatedDoctor.getFullName());
            existingDoctor.setPhone(updatedDoctor.getPhone());
            existingDoctor.setSpecialty(updatedDoctor.getSpecialty());
            existingDoctor.setHospital(updatedDoctor.getHospital());
            existingDoctor.setLocation(updatedDoctor.getLocation());
            existingDoctor.setBio(updatedDoctor.getBio());
            existingDoctor.setProfileImage(updatedDoctor.getProfileImage());
            existingDoctor.setConsultationFee(updatedDoctor.getConsultationFee());
            existingDoctor.setAvailableDays(updatedDoctor.getAvailableDays());
            existingDoctor.setAvailableTimes(updatedDoctor.getAvailableTimes());
            return doctorRepository.save(existingDoctor);
        }).orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
    }

    public void deleteDoctor(String id) {
        doctorRepository.deleteById(id);
    }
}