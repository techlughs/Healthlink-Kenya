package com.healthlink.backend.service;

import com.healthlink.backend.exception.DoubleBookingException;
import com.healthlink.backend.exception.InvalidStatusException;
import com.healthlink.backend.exception.ResourceNotFoundException;
import com.healthlink.backend.model.Appointment;
import com.healthlink.backend.model.Doctor;
import com.healthlink.backend.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class AppointmentService {

    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"
    );

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private PaymentService paymentService;

    public Appointment bookAppointment(Appointment appointment) {
        boolean slotTaken = appointmentRepository
                .findByDoctorIdAndAppointmentDateTime(appointment.getDoctorId(), appointment.getAppointmentDateTime())
                .stream()
                .anyMatch(existing -> !"CANCELLED".equals(existing.getStatus()));

        if (slotTaken) {
            throw new DoubleBookingException(
                    "This doctor already has an appointment booked at that time. Please choose a different slot."
            );
        }

        appointment.setStatus("PENDING");
        Appointment saved = appointmentRepository.save(appointment);

        String doctorEmail = doctorService.getDoctorById(saved.getDoctorId())
                .map(Doctor::getEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        notificationService.notify(
                doctorEmail,
                "APPOINTMENT_BOOKED",
                "You have a new appointment request.",
                saved.getId()
        );

        return saved;
    }

    public Optional<Appointment> getAppointmentById(String id) {
        return appointmentRepository.findById(id);
    }

    public List<Appointment> getAppointmentsByPatientId(String patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByDoctorId(String doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getAppointmentsByStatus(String status) {
        return appointmentRepository.findByStatus(status);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment updateAppointmentStatus(String id, String status) {
        String normalized = status == null ? "" : status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(normalized)) {
            throw new InvalidStatusException(
                    "Invalid appointment status: '" + status + "'. Must be one of " + VALID_STATUSES
            );
        }
        return appointmentRepository.findById(id).map(appointment -> {
            appointment.setStatus(normalized);
            Appointment saved = appointmentRepository.save(appointment);

            if ("CONFIRMED".equals(normalized)) {
                notificationService.notify(
                        saved.getPatientId(),
                        "APPOINTMENT_CONFIRMED",
                        "Your appointment has been confirmed.",
                        saved.getId()
                );
            }

            return saved;
        }).orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    public Appointment addDoctorNotes(String id, String notes) {
        return appointmentRepository.findById(id).map(appointment -> {
            appointment.setNotes(notes);
            return appointmentRepository.save(appointment);
        }).orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    public Appointment cancelAppointment(String id) {
        return appointmentRepository.findById(id).map(appointment -> {
            appointment.setStatus("CANCELLED");

            if (Boolean.TRUE.equals(appointment.getPaid())) {
                paymentService.markRefunded(appointment.getId());
                appointment.setRefunded(true);
            }

            Appointment saved = appointmentRepository.save(appointment);

            doctorService.getDoctorById(saved.getDoctorId())
                    .map(Doctor::getEmail)
                    .ifPresent(doctorEmail -> notificationService.notify(
                            doctorEmail,
                            "APPOINTMENT_CANCELLED",
                            "An appointment has been cancelled.",
                            saved.getId()
                    ));

            return saved;
        }).orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    public void deleteAppointment(String id) {
        appointmentRepository.deleteById(id);
    }
}