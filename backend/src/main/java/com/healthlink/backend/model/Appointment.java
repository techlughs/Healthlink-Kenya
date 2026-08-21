package com.healthlink.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointments")
public class Appointment {

    @Id
    private String id;

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    @NotBlank(message = "Doctor ID is required")
    private String doctorId;

    @NotBlank(message = "Patient name is required")
    private String patientName;

    private String doctorName;

    private String doctorSpecialty;

    @NotNull(message = "Appointment date/time is required")
    @Future(message = "Appointment must be booked for a future date/time")
    private LocalDateTime appointmentDateTime;

    private String status;

    @NotBlank(message = "Reason for visit is required")
    @Size(max = 500)
    private String reason;

    private String notes;

    @PositiveOrZero(message = "Fee cannot be negative")
    private Double fee;

    private Boolean paid;

    private Boolean refunded;
}