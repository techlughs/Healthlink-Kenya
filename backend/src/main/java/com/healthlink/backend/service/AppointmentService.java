package com.healthlink.backend.service;

import com.healthlink.backend.exception.DoubleBookingException;
import com.healthlink.backend.exception.ResourceNotFoundException;
import com.healthlink.backend.model.Appointment;
import com.healthlink.backend.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

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
        return appointmentRepository.save(appointment);
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
        return appointmentRepository.findById(id).map(appointment -> {
            appointment.setStatus(status);
            return appointmentRepository.save(appointment);
        }).orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    public Appointment addDoctorNotes(String id, String notes) {
        return appointmentRepository.findById(id).map(appointment -> {
            appointment.setNotes(notes);
            appointment.setStatus("COMPLETED");
            return appointmentRepository.save(appointment);
        }).orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    public Appointment cancelAppointment(String id) {
        return appointmentRepository.findById(id).map(appointment -> {
            appointment.setStatus("CANCELLED");
            return appointmentRepository.save(appointment);
        }).orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    public void deleteAppointment(String id) {
        appointmentRepository.deleteById(id);
    }
}