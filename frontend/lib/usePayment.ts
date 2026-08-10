"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface Payment {
    id: string;
    appointmentId: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    amount: number;
    phoneNumber: string;
    checkoutRequestId: string;
    mpesaReceiptNumber: string | null;
    status: "PENDING" | "SUCCESS" | "FAILED";
    createdAt: string;
    completedAt: string | null;
}

export function usePayment() {
    async function initiateStkPush(input: {
        appointmentId: string;
        patientId: string;
        patientName: string;
        doctorId: string;
        doctorName: string;
        amount: number;
        phoneNumber: string;
    }) {
        const res = await api.post<Payment>("/payments/stk-push", input);
        return res.data;
    }

    async function confirmPayment(paymentId: string) {
        const res = await api.post<Payment>(`/payments/${paymentId}/confirm`);
        return res.data;
    }

    return { initiateStkPush, confirmPayment };
}

export function usePaymentHistory(patientId: string | null) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(() => {
        if (!patientId) return;
        setLoading(true);
        api
            .get<Payment[]>(`/payments/patient/${encodeURIComponent(patientId)}`)
            .then((res) => {
                const sorted = [...res.data].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setPayments(sorted);
            })
            .catch(() => setPayments([]))
            .finally(() => setLoading(false));
    }, [patientId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching payment history on mount/patientId change is an intentional one-time sync
        refetch();
    }, [refetch]);

    return { payments, loading, refetch };
}