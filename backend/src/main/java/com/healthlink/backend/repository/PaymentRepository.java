package com.healthlink.backend.repository;

import com.healthlink.backend.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    Optional<Payment> findByAppointmentId(String appointmentId);

    List<Payment> findByPatientId(String patientId);
}