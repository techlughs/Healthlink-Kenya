package com.healthlink.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doctors")
public class Doctor {

    @Id
    private String id;

    private String userId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    @Pattern(regexp = "^$|^[0-9+\\- ]{7,15}$", message = "Invalid phone number")
    private String phone;

    @NotBlank(message = "Specialty is required")
    private String specialty;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Hospital is required")
    private String hospital;

    @Size(max = 1000)
    private String bio;

    private String profileImage;

    @PositiveOrZero(message = "Consultation fee cannot be negative")
    private double consultationFee;

    private List<String> availableDays;

    private List<String> availableTimes;

    private Double rating = 0.0;

    private Integer totalReviews = 0;
}