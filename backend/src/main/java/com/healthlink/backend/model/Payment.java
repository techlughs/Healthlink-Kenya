package com.healthlink.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    private String appointmentId;

    private String patientId;

    private String patientName;

    private String doctorId;

    private String doctorName;

    private Double amount;

    private String phoneNumber;

    private String checkoutRequestId;

    private String mpesaReceiptNumber;

    private String status; // PENDING, SUCCESS, FAILED, REFUNDED

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    private LocalDateTime refundedAt;

}