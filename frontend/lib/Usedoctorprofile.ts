"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useUser } from "@/lib/useUser";

export interface DoctorProfile {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    specialty: string;
    location: string;
    hospital: string;
    bio: string;
    profileImage: string | null;
    consultationFee: number;
    availableDays: string[];
    availableTimes: string[];
    rating: number;
    totalReviews: number;
}

export function useDoctorProfile(email: string | null) {
    const { user, loading: userLoading } = useUser(email);
    const userId = user?.id ?? null;
    const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
    const [doctorLoading, setDoctorLoading] = useState(true);
    const [error, setError] = useState("");

    const refetch = useCallback(() => {
        if (!userId) return;
        setDoctorLoading(true);
        api
            .get<DoctorProfile>(`/doctors/user/${userId}`)
            .then((res) => {
                setDoctor(res.data);
                setError("");
            })
            .catch(() => {
                setError("Couldn't load your doctor profile.");
            })
            .finally(() => setDoctorLoading(false));
    }, [userId]);

    useEffect(() => {
        if (userId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching doctor profile once the user id is known is an intentional one-time sync
            refetch();
        }
    }, [userId, refetch]);

    // Still loading if the user lookup hasn't finished yet, or the doctor lookup is in flight
    const loading = userLoading || (!!userId && doctorLoading);

    async function updateProfile(
        updates: Partial<
            Pick<
                DoctorProfile,
                | "fullName"
                | "phone"
                | "specialty"
                | "location"
                | "hospital"
                | "bio"
                | "profileImage"
                | "consultationFee"
                | "availableDays"
                | "availableTimes"
            >
        >
    ) {
        if (!doctor) throw new Error("No doctor profile loaded");
        const payload = { ...doctor, ...updates };
        const res = await api.put<DoctorProfile>(`/doctors/${doctor.id}`, payload);
        setDoctor(res.data);
        return res.data;
    }

    return { doctor, loading, error, refetch, updateProfile };
}