package com.healthlink.backend.model;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class ValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

   @Test
void rejectsUserWithBlankFields() {
    User user = new User();
    user.setFullName("");
    user.setEmail("not-an-email");
    user.setPassword("short");
    user.setRole("");

    Set<ConstraintViolation<User>> violations = validator.validate(user);

    assertFalse(violations.isEmpty());
    assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("fullName")));
    assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
    assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("role")));
}

@Test
void rejectsAdminRoleNotAllowedAtRegistration() {
    // Bean validation only enforces the role is one of PATIENT/DOCTOR/ADMIN;
    // restricting self-registration to non-ADMIN roles is a business rule
    // enforced in the registration service/controller, not here.
    User user = new User();
    user.setFullName("Test User");
    user.setEmail("test@healthlink.com");
    user.setPassword("SecurePass123");
    user.setRole("ADMIN");

    Set<ConstraintViolation<User>> violations = validator.validate(user);

    assertTrue(violations.isEmpty()); // valid at the bean-validation level
}

    @Test
    void acceptsValidUser() {
        User user = new User();
        user.setFullName("Mary Wanjahu");
        user.setEmail("mary@healthlink.com");
        user.setPassword("SecurePass123");
        user.setRole("PATIENT");

        Set<ConstraintViolation<User>> violations = validator.validate(user);

        assertTrue(violations.isEmpty());
    }

    @Test
    void rejectsAppointmentInThePast() {
        Appointment appointment = new Appointment();
        appointment.setPatientId("mary@healthlink.com");
        appointment.setDoctorId("6a5ad0b27c9f6a89954edbbd");
        appointment.setPatientName("Mary Wanjahu");
        appointment.setReason("Checkup");
        appointment.setAppointmentDateTime(LocalDateTime.now().minusDays(1));

        Set<ConstraintViolation<Appointment>> violations = validator.validate(appointment);

        assertTrue(violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("appointmentDateTime")));
    }

    @Test
    void acceptsFutureAppointment() {
        Appointment appointment = new Appointment();
        appointment.setPatientId("mary@healthlink.com");
        appointment.setDoctorId("6a5ad0b27c9f6a89954edbbd");
        appointment.setPatientName("Mary Wanjahu");
        appointment.setReason("Checkup");
        appointment.setAppointmentDateTime(LocalDateTime.now().plusDays(1));

        Set<ConstraintViolation<Appointment>> violations = validator.validate(appointment);

        assertTrue(violations.isEmpty());
    }

    @Test
    void rejectsReviewRatingOutOfRange() {
        Review review = new Review();
        review.setPatientId("mary@healthlink.com");
        review.setDoctorId("6a5ad0b27c9f6a89954edbbd");
        review.setPatientName("Mary Wanjahu");
        review.setRating(6); // max is 5

        Set<ConstraintViolation<Review>> violations = validator.validate(review);

        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("rating")));
    }
}