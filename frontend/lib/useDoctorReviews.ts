"use client";

import { useState, useCallback } from "react";
import api from "@/lib/api";

export interface DoctorReview {
    id: string;
    patientId: string;
    doctorId: string;
    patientName: string;
    doctorName: string;
    rating: number;
    comment: string;
    reviewDate: string;
}

export function useDoctorReviews() {
    const [reviews, setReviews] = useState<DoctorReview[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchReviews = useCallback((doctorId: string) => {
        setLoading(true);
        setError("");
        api
            .get<DoctorReview[]>(`/reviews/doctor/${doctorId}`)
            .then((res) => {
                setReviews(res.data);
            })
            .catch(() => {
                setError("Couldn't load reviews right now.");
            })
            .finally(() => setLoading(false));
    }, []);

    return { reviews, loading, error, fetchReviews };
}

export function formatReviewDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}