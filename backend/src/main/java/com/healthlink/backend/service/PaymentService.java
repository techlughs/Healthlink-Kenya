package com.healthlink.backend.service;

import com.healthlink.backend.exception.ResourceNotFoundException;
import com.healthlink.backend.model.Appointment;
import com.healthlink.backend.model.Doctor;
import com.healthlink.backend.model.Payment;
import com.healthlink.backend.repository.AppointmentRepository;
import com.healthlink.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private DoctorService doctorService;

    private static final String RECEIPT_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final Random random = new Random();

    public Payment initiateStkPush(Payment request, String requestingEmail) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        if (!appointment.getPatientId().equals(requestingEmail)) {
            throw new AccessDeniedException("Cannot pay for another patient's appointment");
        }
        Payment payment = new Payment();
        payment.setAppointmentId(appointment.getId());
        payment.setPatientId(appointment.getPatientId());
        payment.setPatientName(appointment.getPatientName());
        payment.setDoctorId(appointment.getDoctorId());
        payment.setDoctorName(appointment.getDoctorName());
        payment.setAmount(appointment.getFee());
        payment.setPhoneNumber(request.getPhoneNumber());
        payment.setCheckoutRequestId("ws_CO_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        payment.setStatus("PENDING");
        payment.setCreatedAt(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    public Optional<Payment> getPaymentById(String paymentId) {
        return paymentRepository.findById(paymentId);
    }

    public Payment confirmPayment(String paymentId, String requestingEmail) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        if (!payment.getPatientId().equals(requestingEmail)) {
            throw new AccessDeniedException("Not authorized to confirm this payment");
        }
        payment.setStatus("SUCCESS");
        payment.setMpesaReceiptNumber(generateReceiptNumber());
        payment.setCompletedAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(payment);

        appointmentRepository.findById(payment.getAppointmentId()).ifPresent(appointment -> {
            appointment.setPaid(true);
            appointmentRepository.save(appointment);
        });

        String doctorEmail = doctorService.getDoctorById(saved.getDoctorId())
                .map(Doctor::getEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        notificationService.notify(
                doctorEmail,
                "PAYMENT_RECEIVED",
                "Payment received for an appointment.",
                saved.getAppointmentId()
        );

        return saved;
    }


    public Optional<Payment> markRefunded(String appointmentId) {
        return paymentRepository.findByAppointmentId(appointmentId).map(payment -> {
            if ("SUCCESS".equals(payment.getStatus())) {
                payment.setStatus("REFUNDED");
                payment.setRefundedAt(LocalDateTime.now());
                return paymentRepository.save(payment);
            }
            return payment;
        });
    }

    public Optional<Payment> getPaymentByAppointmentId(String appointmentId) {
        return paymentRepository.findByAppointmentId(appointmentId);
    }

    public List<Payment> getPaymentsByPatientId(String patientId) {
        return paymentRepository.findByPatientId(patientId);
    }

    private String generateReceiptNumber() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(RECEIPT_CHARS.charAt(random.nextInt(RECEIPT_CHARS.length())));
        }
        return sb.toString();
    }
}