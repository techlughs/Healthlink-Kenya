package com.healthlink.backend.controller;

import com.healthlink.backend.exception.ResourceNotFoundException;
import com.healthlink.backend.model.Doctor;
import com.healthlink.backend.service.DoctorService;
import com.healthlink.backend.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @PostMapping
    public ResponseEntity<Doctor> addDoctor(@Valid @RequestBody Doctor doctor) {
        doctor.setEmail(SecurityUtils.getCurrentEmail());
        return ResponseEntity.ok(doctorService.addDoctor(doctor));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable String id) {
        return doctorService.getDoctorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Doctor> getDoctorByUserId(@PathVariable String userId) {
        if (!SecurityUtils.isAuthenticated()) {
            throw new AccessDeniedException("Not authorized");
        }
        return doctorService.getDoctorByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<Page<Doctor>> getAllDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(doctorService.getAllDoctors(PageRequest.of(page, size)));
    }

    @GetMapping("/speciality/{specialty}")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialty(@PathVariable String specialty) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty));
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<Doctor>> getDoctorsByLocation(@PathVariable String location) {
        return ResponseEntity.ok(doctorService.getDoctorsByLocation(location));
    }

    @GetMapping("/hospital/{hospital}")
    public ResponseEntity<List<Doctor>> getDoctorsByHospital(@PathVariable String hospital) {
        return ResponseEntity.ok(doctorService.getDoctorsByHospital(hospital));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialtyAndLocation(
        @RequestParam String specialty,
        @RequestParam String location) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialtyAndLocation(specialty, location));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable String id, @Valid @RequestBody Doctor doctor) {
        assertOwnsListing(id);
        return ResponseEntity.ok(doctorService.updateDoctor(id, doctor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable String id) {
        assertOwnsListing(id);
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }

    private void assertOwnsListing(String doctorId) {
        Doctor existing = doctorService.getDoctorById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        if (!existing.getEmail().equals(SecurityUtils.getCurrentEmail())) {
            throw new AccessDeniedException("Not authorized to modify this doctor listing");
        }
    }
}