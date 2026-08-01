"use client";

import Link from "next/link";
import { useAuthGuard, DashboardSkeleton } from "@/components/DashboardShell";
import DoctorShell from "@/components/DoctorShell";
import { useDoctorProfile } from "@/lib/Usedoctorprofile";
import { useDoctorAppointments } from "@/lib/Usedoctorappointments";
import { formatApptDateTime } from "@/lib/useAppointments";

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

function isToday(iso: string): boolean {
    const d = new Date(iso);
    const now = new Date();
    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );
}

function statusStyles(status: string) {
    switch (status?.toUpperCase()) {
        case "CONFIRMED":
            return "bg-emerald-50 text-emerald-700";
        case "PENDING":
            return "bg-amber-50 text-amber-700";
        case "CANCELLED":
            return "bg-red-50 text-red-700";
        case "COMPLETED":
            return "bg-gray-100 text-gray-600";
        default:
            return "bg-gray-50 text-gray-600";
    }
}

export default function DoctorDashboardPage() {
    const auth = useAuthGuard("DOCTOR");

    if (!auth) {
        return <DashboardSkeleton />;
    }

    return <DoctorDashboardContent auth={auth} />;
}

function DoctorDashboardContent({ auth }: { auth: { email: string; role: string } }) {
    const { doctor, loading: doctorLoading } = useDoctorProfile(auth.email);
    const { appointments, loading: apptsLoading } = useDoctorAppointments(doctor?.id ?? null);

    const loading = doctorLoading || (!!doctor && apptsLoading);

    if (doctorLoading) {
        return <DashboardSkeleton />;
    }

    const todaysAppointments = appointments
        .filter((a) => isToday(a.appointmentDateTime) && a.status?.toUpperCase() !== "CANCELLED")
        .sort((a, b) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime());

    const pendingCount = appointments.filter((a) => a.status?.toUpperCase() === "PENDING").length;
    const uniquePatients = new Set(appointments.map((a) => a.patientId)).size;

    const displayName = doctor?.fullName || auth.email.split("@")[0];

    return (
        <DoctorShell auth={auth} title="Dashboard">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in-up {
                    animation: fadeInUp 0.5s ease-out both;
                }
                @media (prefers-reduced-motion: reduce) {
                    .fade-in-up { animation: none; }
                }
            `}</style>

            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-950 via-teal-900 to-emerald-800 px-8 py-10 text-white shadow-lg shadow-emerald-950/30">
                <div className="relative z-10">
                    <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                        Doctor Dashboard
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
                        {getGreeting()}, {displayName}
                    </h2>
                    <p className="mt-2 max-w-md text-sm text-white/70">
                        {doctor?.specialty ? `${doctor.specialty} · ${doctor.hospital}` : "Here's what's on your schedule."}
                    </p>
                </div>
            </div>

            {!doctor && !doctorLoading && (
                <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
                    We couldn&apos;t find a doctor profile linked to your account. Contact an admin to get set up.
                </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="fade-in-up rounded-xl border-l-4 border-l-emerald-600 bg-white p-5 shadow-sm" style={{ animationDelay: "80ms" }}>
                    <p className="text-sm text-gray-500">Today&apos;s Appointments</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                        {loading ? "…" : todaysAppointments.length}
                    </p>
                    <Link
                        href="/doctor/appointments"
                        className="mt-2 inline-block text-xs font-medium text-emerald-600 hover:underline"
                    >
                        View schedule →
                    </Link>
                </div>
                <div className="fade-in-up rounded-xl border-l-4 border-l-amber-500 bg-white p-5 shadow-sm" style={{ animationDelay: "140ms" }}>
                    <p className="text-sm text-gray-500">Pending Requests</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                        {loading ? "…" : pendingCount}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">Awaiting your confirmation</p>
                </div>
                <div className="fade-in-up rounded-xl border-l-4 border-l-emerald-600 bg-white p-5 shadow-sm" style={{ animationDelay: "200ms" }}>
                    <p className="text-sm text-gray-500">Total Patients</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                        {loading ? "…" : uniquePatients}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">Across all appointments</p>
                </div>
            </div>

            <h3 className="mt-10 text-lg font-semibold text-gray-900">Today&apos;s Schedule</h3>

            <div className="mt-4 space-y-3">
                {loading && (
                    <div className="space-y-3">
                        {[0, 1].map((i) => (
                            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
                        ))}
                    </div>
                )}

                {!loading && todaysAppointments.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
                        <p className="text-sm font-medium text-gray-900">No appointments today</p>
                        <p className="mt-1 text-sm text-gray-500">Enjoy the quiet — check back tomorrow.</p>
                    </div>
                )}

                {!loading &&
                    todaysAppointments.map((a) => (
                        <div
                            key={a.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900">{a.patientName}</h4>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles(
                                            a.status
                                        )}`}
                                    >
                                        {a.status}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    {formatApptDateTime(a.appointmentDateTime)}
                                </p>
                                {a.reason && (
                                    <p className="mt-1 text-sm text-gray-500">{a.reason}</p>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </DoctorShell>
    );
}
