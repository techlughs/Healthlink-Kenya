package com.healthlink.backend.controller;

import com.healthlink.backend.model.Payment;
import com.healthlink.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/stk-push")
    public ResponseEntity<Payment> initiateStkPush(@RequestBody Payment request) {
        return ResponseEntity.ok(paymentService.initiateStkPush(request));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Payment> confirmPayment(@PathVariable String id) {
        return ResponseEntity.ok(paymentService.confirmPayment(id));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<Payment> getPaymentByAppointment(@PathVariable String appointmentId) {
        return paymentService.getPaymentByAppointmentId(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Payment>> getPaymentsByPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(paymentService.getPaymentsByPatientId(patientId));
    }
}