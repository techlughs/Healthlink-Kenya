package com.healthlink.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @NotBlank(message = "Full name is required")
    @Size(max = 100)
    private String fullName;

    @Indexed(unique = true)
    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "PATIENT|DOCTOR", message = "Role must be PATIENT or DOCTOR")
    private String role;

    @Pattern(regexp = "^$|^[0-9+\\- ]{7,15}$", message = "Invalid phone number")
    private String phone;

    private String profileImage;

    private Boolean enabled = true;
}