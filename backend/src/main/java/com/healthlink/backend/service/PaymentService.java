package com.healthlink.backend.service;

import com.healthlink.backend.model.Appointment;
import com.healthlink.backend.model.Payment;
import com.healthlink.backend.repository.AppointmentRepository;
import com.healthlink.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    private static final String RECEIPT_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final Random random = new Random();

    /**
     * Simulates the first leg of an M-Pesa STK Push: the request has been "sent"
     * to the patient's phone and is now awaiting PIN entry. In a real Daraja
     * integration this would call Safaricom's API and return a CheckoutRequestID;
     * here we generate a realistic-looking one ourselves.
     */
    public Payment initiateStkPush(Payment request) {
        request.setCheckoutRequestId("ws_CO_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());
        return paymentRepository.save(request);
    }

    /**
     * Simulates the Safaricom callback that arrives once the patient enters
     * their PIN: marks the payment as successful, generates an M-Pesa-style
     * receipt number, and flags the linked appointment as paid.
     */
    public Payment confirmPayment(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus("SUCCESS");
        payment.setMpesaReceiptNumber(generateReceiptNumber());
        payment.setCompletedAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(payment);

        appointmentRepository.findById(payment.getAppointmentId()).ifPresent(appointment -> {
            appointment.setPaid(true);
            appointmentRepository.save(appointment);
        });

        return saved;
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