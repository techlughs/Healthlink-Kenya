"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

export interface AppUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
    phone: string;
    profileImage: string;
    enabled: boolean;
}

export function useUser(email: string | null) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refetch = useCallback(() => {
        if (!email) return;
        setLoading(true);
        api
            .get<AppUser>(`/users/email/${encodeURIComponent(email)}`)
            .then((res) => {
                setUser(res.data);
                setError("");
            })
            .catch(() => {
                setError("Couldn't load your profile.");
            })
            .finally(() => setLoading(false));
    }, [email]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching user on mount/email change is an intentional one-time sync
        refetch();
    }, [refetch]);

    async function updateProfile(updates: Partial<Pick<AppUser, "fullName" | "phone" | "profileImage">>) {
        if (!user) throw new Error("No user loaded");
        const payload = { ...user, ...updates };
        const res = await api.put<AppUser>(`/users/${user.id}`, payload);
        setUser(res.data);
        return res.data;
    }

    return { user, loading, error, refetch, updateProfile };
}