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
@Document(collection = "appointments")

public class Appointment {
       
    @Id
    private String id;

    private String patientId;

    private String doctorId;

    private String patientName;

    private String doctorName;

    private String doctorSpecialty;

    private LocalDateTime appointmentDateTime;

    private String status; 

    private String reason;

    private String notes;

    private Double fee;

    private Boolean paid;
    
}
