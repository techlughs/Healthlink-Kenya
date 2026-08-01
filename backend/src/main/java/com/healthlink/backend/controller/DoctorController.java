package com.healthlink.backend.controller;

import com.healthlink.backend.model.Doctor;
import com.healthlink.backend.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @PostMapping
    public ResponseEntity<Doctor> addDoctor(@RequestBody Doctor doctor) {
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
        return doctorService.getDoctorByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
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
    public ResponseEntity<Doctor> updateDoctor(@PathVariable String id, @RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, doctor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable String id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }
}