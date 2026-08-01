"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthGuard, DashboardSkeleton } from "@/components/DashboardShell";
import DashboardShell from "@/components/DashboardShell";
import BookAppointmentModal from "@/components/BookAppointmentModal";
import api from "@/lib/api";
import type { Doctor } from "@/types";

export default function DoctorsPage() {
    const auth = useAuthGuard();

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [query, setQuery] = useState("");
    const [activeSpecialty, setActiveSpecialty] = useState("All");
    const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
    const [bookedDoctorName, setBookedDoctorName] = useState("");

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
                    setLoadError("We couldn't load doctors right now. Please try again shortly.");
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

    const specialties = useMemo(() => {
        const unique = Array.from(new Set(doctors.map((d) => d.specialty))).sort();
        return ["All", ...unique];
    }, [doctors]);

    const filteredDoctors = useMemo(() => {
        const term = query.trim().toLowerCase();

        return doctors.filter((doctor) => {
            const matchesSpecialty =
                activeSpecialty === "All" || doctor.specialty === activeSpecialty;

            if (!matchesSpecialty) return false;
            if (!term) return true;

            return (
                doctor.fullName.toLowerCase().includes(term) ||
                doctor.specialty.toLowerCase().includes(term) ||
                doctor.location.toLowerCase().includes(term) ||
                doctor.hospital.toLowerCase().includes(term)
            );
        });
    }, [doctors, query, activeSpecialty]);

    if (!auth) {
        return <DashboardSkeleton />;
    }

    // The backend links appointments to a real User document ID, not just an
    // email. For now we don't yet store the logged-in user's Mongo ID on the
    // frontend (only email/role), so we pass the email as a stand-in patient
    // identifier. This gets tightened up once the /api/auth/login response
    // includes the actual user ID.
    const patientId = auth.email;
    const patientName = auth.email.split("@")[0];

    return (
        <DashboardShell
            auth={auth}
            title="Find a Doctor"
            searchPlaceholder="Search by name, specialty, or location…"
            onSearchChange={setQuery}
        >
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-950 via-teal-900 to-emerald-800 px-8 py-10 text-white shadow-lg shadow-emerald-950/30">
                <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
                <div className="relative z-10">
                    <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                        Verified Doctors
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
                        Find the right doctor for you
                    </h2>
                    <p className="mt-2 max-w-md text-sm text-white/70">
                        Browse verified doctors across Kenya and book an appointment in a
                        few clicks.
                    </p>

                    <div className="mt-6 flex gap-8 text-sm text-white/60">
                        <div>
                            <p className="text-2xl font-semibold text-white">
                                {doctors.length}
                            </p>
                            <p>Verified doctors</p>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">
                                {specialties.length - 1}
                            </p>
                            <p>Specialties</p>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">24/7</p>
                            <p>Booking support</p>
                        </div>
                    </div>
                </div>
            </div>

            {bookedDoctorName && (
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 shrink-0 text-emerald-600"
                    >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <path d="m22 4-10 10-3-3" />
                    </svg>
                    <p className="text-sm font-medium text-emerald-800">
                        Appointment requested with {bookedDoctorName}. We&apos;ll notify
                        you once it&apos;s confirmed.
                    </p>
                    <button
                        onClick={() => setBookedDoctorName("")}
                        className="ml-auto text-emerald-600 hover:text-emerald-800"
                        aria-label="Dismiss"
                    >
                        ✕
                    </button>
                </div>
            )}

            {!loading && specialties.length > 1 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {specialties.map((specialty) => {
                        const active = specialty === activeSpecialty;
                        return (
                            <button
                                key={specialty}
                                onClick={() => setActiveSpecialty(specialty)}
                                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                                    active
                                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-500/30"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
                                }`}
                            >
                                {specialty}
                            </button>
                        );
                    })}
                </div>
            )}

            {loading && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-56 animate-pulse rounded-xl bg-white shadow-sm" />
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
                        <DoctorCard
                            key={doctor.id}
                            doctor={doctor}
                            onBook={() => setBookingDoctor(doctor)}
                        />
                    ))}
                </div>
            )}

            {bookingDoctor && (
                <BookAppointmentModal
                    doctor={bookingDoctor}
                    patientId={patientId}
                    patientName={patientName}
                    onClose={() => setBookingDoctor(null)}
                    onBooked={() => {
                        setBookedDoctorName(bookingDoctor.fullName);
                        setBookingDoctor(null);
                    }}
                />
            )}
        </DashboardShell>
    );
}

function DoctorCard({
    doctor,
    onBook,
}: {
    doctor: Doctor;
    onBook: () => void;
}) {
    const initials = doctor.fullName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const rating = doctor.rating && doctor.rating > 0 ? doctor.rating : null;
    const reviews = doctor.totalReviews || 0;

    return (
        <div className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="h-16 bg-linear-to-r from-emerald-600 to-teal-500" />

            <div className="px-6 pb-6">
                <div className="-mt-8 flex items-end gap-3">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-white bg-emerald-100 text-lg font-semibold text-emerald-700 shadow-sm">
                        {initials}
                    </span>
                    <div className="min-w-0 pb-1">
                        <h3 className="truncate font-semibold text-gray-900">
                            {doctor.fullName}
                        </h3>
                        <p className="truncate text-sm font-medium text-emerald-600">
                            {doctor.specialty}
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 shrink-0 text-gray-400"
                    >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="truncate">
                        {doctor.hospital} · {doctor.location}
                    </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5">
                    {rating ? (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-4 w-4 text-amber-400"
                            >
                                <path d="M12 2.75 14.9 8.7l6.55.95-4.74 4.62 1.12 6.52L12 17.77l-5.83 3.02 1.12-6.52-4.74-4.62 6.55-.95L12 2.75Z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">
                                {rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({reviews} review{reviews === 1 ? "" : "s"})
                            </span>
                        </>
                    ) : (
                        <span className="text-xs text-gray-400">No reviews yet</span>
                    )}
                </div>

                {doctor.availableDays?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {doctor.availableDays.slice(0, 3).map((day) => (
                            <span
                                key={day}
                                className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                            >
                                {day}
                            </span>
                        ))}
                        {doctor.availableDays.length > 3 && (
                            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500">
                                +{doctor.availableDays.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                        <p className="text-xs text-gray-400">Consultation fee</p>
                        <p className="text-sm font-semibold text-gray-900">
                            KSh {doctor.consultationFee.toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={onBook}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-500/30 transition group-hover:bg-emerald-700"
                    >
                        Book Appointment
                    </button>
                </div>
            </div>
        </div>
    );
}