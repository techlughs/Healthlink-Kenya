"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

export interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    patientName: string;
    doctorName: string;
    doctorSpecialty: string;
    appointmentDateTime: string;
    status: string;
    reason: string;
    notes?: string;
    fee: number;
    paid: boolean;
    refunded?: boolean;
}

export function useAppointments(patientId: string | null) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refetch = useCallback(() => {
        if (!patientId) return;
        setLoading(true);
        api
            .get<Appointment[]>(`/appointments/patient/${encodeURIComponent(patientId)}`)
            .then((res) => {
                setAppointments(res.data);
                setError("");
            })
            .catch(() => {
                setError("Couldn't load appointments.");
            })
            .finally(() => setLoading(false));
    }, [patientId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching appointments on mount/patientId change is an intentional one-time sync
        refetch();
    }, [refetch]);

    return { appointments, loading, error, refetch };
}

export function isUpcoming(a: Appointment): boolean {
    return (
        new Date(a.appointmentDateTime).getTime() > Date.now() &&
        a.status?.toUpperCase() !== "CANCELLED"
    );
}

export function formatApptDateTime(iso: string): string {
    const d = new Date(iso);
    const datePart = d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
    const timePart = d.toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
    });
    return `${datePart} · ${timePart}`;
}