package com.healthlink.backend.controller;

import com.healthlink.backend.model.Doctor;
import com.healthlink.backend.model.User;
import com.healthlink.backend.service.DoctorService;
import com.healthlink.backend.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private DoctorService doctorService;

    @Data
    public static class CreateDoctorRequest {
        @NotBlank
        private String fullName;

        @NotBlank
        @Email
        private String email;

        @NotBlank
        @Size(min = 8, message = "Temporary password must be at least 8 characters")
        private String temporaryPassword;

        private String phone;

        @NotBlank
        private String specialty;

        @NotBlank
        private String location;

        @NotBlank
        private String hospital;

        private String bio;

        private double consultationFee;

        private List<String> availableDays;

        private List<String> availableTimes;
    }

    @PostMapping("/doctors")
    public ResponseEntity<Doctor> createDoctor(@Valid @RequestBody CreateDoctorRequest req) {
        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setPassword(req.getTemporaryPassword());
        user.setPhone(req.getPhone());

        User savedUser = userService.registerAsRole(user, "DOCTOR");

        Doctor doctor = new Doctor();
        doctor.setUserId(savedUser.getId());
        doctor.setFullName(req.getFullName());
        doctor.setEmail(req.getEmail());
        doctor.setPhone(req.getPhone());
        doctor.setSpecialty(req.getSpecialty());
        doctor.setLocation(req.getLocation());
        doctor.setHospital(req.getHospital());
        doctor.setBio(req.getBio());
        doctor.setConsultationFee(req.getConsultationFee());
        doctor.setAvailableDays(req.getAvailableDays());
        doctor.setAvailableTimes(req.getAvailableTimes());

        Doctor savedDoctor = doctorService.addDoctor(doctor);
        return ResponseEntity.ok(savedDoctor);
    }
}