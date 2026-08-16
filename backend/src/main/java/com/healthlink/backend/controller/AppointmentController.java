package com.healthlink.backend.controller;

import com.healthlink.backend.exception.ResourceNotFoundException;
import com.healthlink.backend.model.Appointment;
import com.healthlink.backend.service.AppointmentService;
import com.healthlink.backend.service.AuditService;
import com.healthlink.backend.service.DoctorService;
import com.healthlink.backend.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AuditService auditService;

    @PostMapping
    public ResponseEntity<Appointment> bookAppointment(
            @Valid @RequestBody Appointment appointment,
            HttpServletRequest request) {

        String email = SecurityUtils.getCurrentEmail();
        if (!appointment.getPatientId().equals(email)) {
            throw new AccessDeniedException("Cannot book an appointment for another patient");
        }
        Appointment saved = appointmentService.bookAppointment(appointment);
        auditService.log(
                email,
                "APPOINTMENT_BOOKED",
                "Booked appointment " + saved.getId() + " with doctor " + saved.getDoctorId(),
                getClientIp(request)
        );
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable String id) {
        return appointmentService.getAppointmentById(id)
                .map(this::assertOwnerOrDoctor)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        if (!SecurityUtils.hasRole("DOCTOR")) {
            throw new AccessDeniedException("Not authorized");
        }
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatientId(@PathVariable String patientId) {
        String email = SecurityUtils.getCurrentEmail();
        if (!patientId.equals(email)) {
            throw new AccessDeniedException("Cannot view another patient's appointments");
        }
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByDoctor(@PathVariable String doctorId) {
        assertIsOwningDoctor(doctorId);
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctorId(doctorId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(@PathVariable String status) {
        if (!SecurityUtils.hasRole("DOCTOR")) {
            throw new AccessDeniedException("Not authorized");
        }
        return ResponseEntity.ok(appointmentService.getAppointmentsByStatus(status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable String id,
            @RequestParam String status) {
        assertOwnerOrDoctor(appointmentService.getAppointmentById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found")));
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status));
    }

    @PutMapping("/{id}/notes")
    public ResponseEntity<Appointment> addDoctorNotes(
            @PathVariable String id,
            @RequestParam String notes) {
        if (!SecurityUtils.hasRole("DOCTOR")) {
            throw new AccessDeniedException("Only doctors can add notes");
        }
        return ResponseEntity.ok(appointmentService.addDoctorNotes(id, notes));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(
            @PathVariable String id,
            HttpServletRequest request) {
        Appointment appointment = assertOwnerOrDoctor(appointmentService.getAppointmentById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found")));
        Appointment cancelled = appointmentService.cancelAppointment(id);
        auditService.log(
                SecurityUtils.getCurrentEmail(),
                "APPOINTMENT_CANCELLED",
                "Cancelled appointment " + id + " (doctor " + appointment.getDoctorId() + ")",
                getClientIp(request)
        );
        return ResponseEntity.ok(cancelled);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable String id) {
        assertOwnerOrDoctor(appointmentService.getAppointmentById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found")));
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    private Appointment assertOwnerOrDoctor(Appointment appointment) {
        String email = SecurityUtils.getCurrentEmail();
        boolean isPatientOwner = appointment.getPatientId().equals(email);
        boolean isOwningDoctor = doctorService.getDoctorById(appointment.getDoctorId())
                .map(d -> d.getEmail().equals(email))
                .orElse(false);
        if (!isPatientOwner && !isOwningDoctor) {
            throw new AccessDeniedException("Not authorized to access this appointment");
        }
        return appointment;
    }

    private void assertIsOwningDoctor(String doctorId) {
        String email = SecurityUtils.getCurrentEmail();
        boolean isOwningDoctor = doctorService.getDoctorById(doctorId)
                .map(d -> d.getEmail().equals(email))
                .orElse(false);
        if (!isOwningDoctor) {
            throw new AccessDeniedException("Not authorized to view this doctor's appointments");
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}