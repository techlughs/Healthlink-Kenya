"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { Appointment } from "@/lib/useAppointments";

export function useDoctorAppointments(doctorId: string | null) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refetch = useCallback(() => {
        if (!doctorId) return;
        setLoading(true);
        api
            .get<Appointment[]>(`/appointments/doctor/${doctorId}`)
            .then((res) => {
                setAppointments(res.data);
                setError("");
            })
            .catch(() => {
                setError("Couldn't load appointments.");
            })
            .finally(() => setLoading(false));
    }, [doctorId]);

    useEffect(() => {
        if (doctorId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching appointments once the doctor id is known is an intentional one-time sync
            refetch();
        }
    }, [doctorId, refetch]);

    async function updateStatus(appointmentId: string, status: string) {
        await api.put(`/appointments/${appointmentId}/status`, null, {
            params: { status },
        });
        refetch();
    }

    async function addNotes(appointmentId: string, notes: string) {
        await api.put(`/appointments/${appointmentId}/notes`, null, {
            params: { notes },
        });
        refetch();
    }

    return { appointments, loading, error, refetch, updateStatus, addNotes };
}