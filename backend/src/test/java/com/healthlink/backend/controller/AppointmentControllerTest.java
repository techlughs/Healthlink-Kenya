package com.healthlink.backend.controller;

import com.healthlink.backend.model.Appointment;
import com.healthlink.backend.model.Doctor;
import com.healthlink.backend.service.AppointmentService;
import com.healthlink.backend.service.AuditService;
import com.healthlink.backend.service.DoctorService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentControllerTest {

    @Mock
    private AppointmentService appointmentService;

    @Mock
    private DoctorService doctorService;

    @Mock
    private AuditService auditService;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private AppointmentController appointmentController;

    private static final String PATIENT_EMAIL = "mary@healthlink.com";
    private static final String OTHER_PATIENT_EMAIL = "john@healthlink.com";
    private static final String DOCTOR_EMAIL = "miriam.njoroge@healthlink.com";
    private static final String DOCTOR_ID = "6a5ad0b27c9f6a89954edbbd";

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(String email, String role) {
        var auth = new UsernamePasswordAuthenticationToken(
                email, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void patientCanViewOwnAppointments() {
        authenticateAs(PATIENT_EMAIL, "PATIENT");
        when(appointmentService.getAppointmentsByPatientId(PATIENT_EMAIL))
                .thenReturn(List.of(new Appointment()));

        var response = appointmentController.getAppointmentsByPatientId(PATIENT_EMAIL);

        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void patientCannotViewAnotherPatientsAppointments() {
        authenticateAs(OTHER_PATIENT_EMAIL, "PATIENT");

        assertThrows(AccessDeniedException.class,
                () -> appointmentController.getAppointmentsByPatientId(PATIENT_EMAIL));
    }

    @Test
    void doctorCanViewOwnAppointments() {
        authenticateAs(DOCTOR_EMAIL, "DOCTOR");
        Doctor doctor = new Doctor();
        doctor.setId(DOCTOR_ID);
        doctor.setEmail(DOCTOR_EMAIL);

        when(doctorService.getDoctorById(DOCTOR_ID)).thenReturn(Optional.of(doctor));
        when(appointmentService.getAppointmentsByDoctorId(DOCTOR_ID)).thenReturn(List.of());

        var response = appointmentController.getAppointmentsByDoctor(DOCTOR_ID);

        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void otherDoctorCannotViewSomeoneElsesAppointments() {
        authenticateAs("other.doctor@healthlink.com", "DOCTOR");
        Doctor doctor = new Doctor();
        doctor.setId(DOCTOR_ID);
        doctor.setEmail(DOCTOR_EMAIL); // belongs to Miriam, not the caller

        when(doctorService.getDoctorById(DOCTOR_ID)).thenReturn(Optional.of(doctor));

        assertThrows(AccessDeniedException.class,
                () -> appointmentController.getAppointmentsByDoctor(DOCTOR_ID));
    }

    @Test
    void patientCannotBookForSomeoneElse() {
        authenticateAs(PATIENT_EMAIL, "PATIENT");
        Appointment appointment = new Appointment();
        appointment.setPatientId(OTHER_PATIENT_EMAIL); // trying to book as someone else

        assertThrows(AccessDeniedException.class,
                () -> appointmentController.bookAppointment(appointment, httpServletRequest));
    }

    @Test
    void nonOwnerCannotCancelAppointment() {
        authenticateAs(OTHER_PATIENT_EMAIL, "PATIENT");
        Appointment appointment = new Appointment();
        appointment.setId("appt1");
        appointment.setPatientId(PATIENT_EMAIL);
        appointment.setDoctorId(DOCTOR_ID);

        when(appointmentService.getAppointmentById("appt1")).thenReturn(Optional.of(appointment));
        when(doctorService.getDoctorById(DOCTOR_ID)).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class,
                () -> appointmentController.cancelAppointment("appt1", httpServletRequest));
    }
}