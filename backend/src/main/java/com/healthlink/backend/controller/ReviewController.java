package com.healthlink.backend.controller;

import com.healthlink.backend.model.Review;
import com.healthlink.backend.service.ReviewService;
import com.healthlink.backend.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> submitReview(@RequestBody Review review) {
        return ResponseEntity.ok(reviewService.submitReview(review));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Review>> getReviewsByDoctor(@PathVariable String doctorId) {
        return ResponseEntity.ok(reviewService.getReviewsByDoctor(doctorId));
    }

    @GetMapping("/patient/{patientId}")
public ResponseEntity<List<Review>> getReviewsByPatient(@PathVariable String patientId) {
    if (!patientId.equals(SecurityUtils.getCurrentEmail())) {
        throw new AccessDeniedException("Cannot view another patient's reviews");
    }
    return ResponseEntity.ok(reviewService.getReviewsByPatient(patientId));
}

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

   
}