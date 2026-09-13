package com.healthlink.backend.config;

import com.healthlink.backend.model.Doctor;
import com.healthlink.backend.model.User;
import com.healthlink.backend.repository.UserRepository;
import com.healthlink.backend.service.DoctorService;
import com.healthlink.backend.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DemoSeedConfig {

    @Bean
    public CommandLineRunner seedDemoAccounts(
            UserRepository userRepository,
            UserService userService,
            DoctorService doctorService,
            PasswordEncoder passwordEncoder,
            @Value("${DEMO_SEED_ENABLED:true}") boolean demoSeedEnabled,
            @Value("${DEMO_PATIENT_EMAIL:demo.patient@healthlink.com}") String demoPatientEmail,
            @Value("${DEMO_PATIENT_PASSWORD:DemoPass123}") String demoPatientPassword,
            @Value("${DEMO_DOCTOR_EMAIL:demo.doctor@healthlink.com}") String demoDoctorEmail,
            @Value("${DEMO_DOCTOR_PASSWORD:DemoPass123}") String demoDoctorPassword) {
        return args -> {
            if (!demoSeedEnabled) {
                return;
            }

            if (!userRepository.existsByEmail(demoPatientEmail)) {
                User patient = new User();
                patient.setFullName("Demo Patient");
                patient.setEmail(demoPatientEmail);
                patient.setPassword(passwordEncoder.encode(demoPatientPassword));
                patient.setPhone("0700000001");
                patient.setRole("PATIENT");
                userRepository.save(patient);
            }

            if (!userRepository.existsByEmail(demoDoctorEmail)) {
                User doctorUser = new User();
                doctorUser.setFullName("Dr. Demo Doctor");
                doctorUser.setEmail(demoDoctorEmail);
                doctorUser.setPassword(demoDoctorPassword);
                doctorUser.setPhone("0700000002");

                User savedDoctorUser = userService.registerAsRole(doctorUser, "DOCTOR");

                Doctor doctor = new Doctor();
                doctor.setUserId(savedDoctorUser.getId());
                doctor.setFullName("Dr. Demo Doctor");
                doctor.setEmail(demoDoctorEmail);
                doctor.setPhone("0700000002");
                doctor.setSpecialty("General Practice");
                doctor.setLocation("Nairobi");
                doctor.setHospital("HealthLink Demo Clinic");
                doctor.setBio("A demo doctor account for showcasing HealthLink Kenya's features.");
                doctor.setConsultationFee(1500);
                doctor.setAvailableDays(List.of("Monday", "Wednesday", "Friday"));
                doctor.setAvailableTimes(List.of("09:00", "11:00", "14:00"));

                doctorService.addDoctor(doctor);
            }
        };
    }
}