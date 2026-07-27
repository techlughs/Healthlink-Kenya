"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthGuard, DashboardSkeleton } from "@/components/DashboardShell";
import DashboardShell from "@/components/DashboardShell";
import api from "@/lib/api";
import type { Doctor } from "@/types";

export default function DoctorPage() {
    const auth = useAuthGuard();

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (!auth) return;

        let cancelled = false;

        async function loadDoctors() {
            try {
                const response = await api.get<Doctor[]>("/doctors");
                if (!cancelled) {
                    setDoctors(response.data);
                  }
                } catch {
                    // Deliberately generic: never surface raw backend/server errors
                   // (stack traces, internal messages) directly to the UI.
                   if (!cancelled) {
                    setLoadError("We couldn't load doctors right now. Please try again later.");
                   }
                } finally {
                    if (!cancelled) {
                        setLoading(false);
                    }
                }
            }

            loadDoctors();

            return () => {
                cancelled = true;
            };
        }, [auth]);

        const filteredDoctors = useMemo(() => {
            const term = query.trim().toLowerCase();
            if (!term) return doctors;

            return doctors.filter((doctor) => {
                return (
                    doctor.fullName.toLowerCase().includes(term) ||
                    doctor.specialty.toLowerCase().includes(term) ||
                    doctor.location.toLowerCase().includes(term) ||
                    doctor.hospital.toLowerCase().includes(term)
                );
            });
        }, [doctors, query]);

        if (!auth) {
            return <DashboardSkeleton />;
        }

        return (
            <DashboardShell
            auth={auth}
            title="Find a Doctor"
            searchPlaceholder="Search by name, specialty, or location…"
            onSearchChange={setQuery}
        >
            <div>
                <h2 className="text-2xl font-semibold text-gray-900">Find a Doctor</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Browse verified doctors and book an appointment that suits you.
                </p>
            </div>

            {loading && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-48 animate-pulse rounded-xl bg-white shadow-sm" />
                    ))}
                </div>
            )}

            {!loading && loadError && (
                <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-6 text-center">
                    <p className="text-sm font-medium text-red-700">{loadError}</p>
                </div>
            )}

            {!loading && !loadError && filteredDoctors.length === 0 && (
                <div className="mt-6 rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
                    <p className="text-sm font-medium text-gray-700">No doctors found</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Try a different name, specialty, or location.
                    </p>
                </div>
            )}

            {!loading && !loadError && filteredDoctors.length > 0 && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredDoctors.map((doctor) => (
                        <DoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                </div>
            )}
        </DashboardShell>
        );
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
    const initials = doctor.fullName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
    
    return (
        <div className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                    {initials}
                </span>
                <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">{doctor.fullName}</h3>
                    <p className="truncate text-sm text-emerald-600">{doctor.specialty}</p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                    <p className="text-xs text-gray-400">Consultation fee</p>
                    <p className="text-sm font-semibold text-gray-900">
                        Ksh {doctor.consultationFee.toLocaleString()}
                    </p>
                </div>
                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition group-hover:bg-emerald-700">
                    Book
                </button>
            </div>
        </div>
    );
}

