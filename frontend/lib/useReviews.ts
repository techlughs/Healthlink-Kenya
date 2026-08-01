"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

export interface Review {
    id: string;
    patientId: string;
    doctorId: string;
    patientName: string;
    doctorName: string;
    rating: number;
    comment: string;
    reviewDate: string;
}

export function usePatientReviews(patientId: string | null) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(() => {
        if (!patientId) return;
        setLoading(true);
        api
            .get<Review[]>(`/reviews/patient/${encodeURIComponent(patientId)}`)
            .then((res) => setReviews(res.data))
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    }, [patientId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching reviews on mount/patientId change is an intentional one-time sync
        refetch();
    }, [refetch]);

    async function submitReview(input: {
        doctorId: string;
        patientName: string;
        doctorName: string;
        rating: number;
        comment: string;
    }) {
        const payload = { patientId, ...input };
        const res = await api.post<Review>("/reviews", payload);
        refetch();
        return res.data;
    }

    const reviewedDoctorIds = new Set(reviews.map((r) => r.doctorId));

    return { reviews, loading, refetch, submitReview, reviewedDoctorIds };
}