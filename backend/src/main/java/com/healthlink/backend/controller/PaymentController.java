package com.healthlink.backend.controller;

import com.healthlink.backend.model.Payment;
import com.healthlink.backend.service.PaymentService;
import com.healthlink.backend.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/stk-push")
    public ResponseEntity<Payment> initiateStkPush(@RequestBody Payment request) {
        String email = SecurityUtils.getCurrentEmail();
        if (!request.getPatientId().equals(email)) {
            throw new AccessDeniedException("Cannot initiate payment for another patient");
        }
        return ResponseEntity.ok(paymentService.initiateStkPush(request));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Payment> confirmPayment(@PathVariable String id) {
        return ResponseEntity.ok(paymentService.confirmPayment(id));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<Payment> getPaymentByAppointment(@PathVariable String appointmentId) {
        return paymentService.getPaymentByAppointmentId(appointmentId)
                .map(payment -> {
                    if (!payment.getPatientId().equals(SecurityUtils.getCurrentEmail())) {
                        throw new AccessDeniedException("Not authorized");
                    }
                    return ResponseEntity.ok(payment);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Payment>> getPaymentsByPatient(@PathVariable String patientId) {
        if (!patientId.equals(SecurityUtils.getCurrentEmail())) {
            throw new AccessDeniedException("Cannot view another patient's payments");
        }
        return ResponseEntity.ok(paymentService.getPaymentsByPatientId(patientId));
    }
}