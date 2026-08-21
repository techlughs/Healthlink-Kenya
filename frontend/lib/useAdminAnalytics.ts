"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

export interface AdminAnalytics {
    totalRevenue: number;
    totalAppointments: number;
    uniquePatients: number;
    activeDoctors: number;
    avgFee: number;
    monthlyRevenue: { label: string; revenue: number }[];
    statusBreakdown: { name: string; value: number }[];
    weekdayVolume: { day: string; appointments: number }[];
    topDoctors: { doctorName: string; revenue: number; completedVisits: number }[];
}

export function useAdminAnalytics() {
    const [data, setData] = useState<AdminAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refetch = useCallback(() => {
        setLoading(true);
        api
            .get<AdminAnalytics>("/admin/analytics")
            .then((res) => {
                setData(res.data);
                setError("");
            })
            .catch(() => {
                setError("Couldn't load analytics.");
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching analytics once on mount is an intentional one-time sync
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}