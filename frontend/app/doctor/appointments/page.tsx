"use client";

import { useState } from "react";
import { useAuthGuard, DashboardSkeleton } from "@/components/DashboardShell";
import DoctorShell from "@/components/DoctorShell";
import { useDoctorProfile } from "@/lib/Usedoctorprofile";
import { useDoctorAppointments } from "@/lib/Usedoctorappointments";
import { formatApptDateTime, isUpcoming, type Appointment } from "@/lib/useAppointments";
import AppointmentCalendar  from '@/components/AppointmentCalender';

type FilterTab = "all" | "pending" | "confirmed" | "completed" | "cancelled";
type ViewMode = "list" | "calendar";

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

export default function DoctorAppointmentsPage() {
    const auth = useAuthGuard("DOCTOR");

    if (!auth) {
        return <DashboardSkeleton />;
    }

    return <DoctorAppointmentsContent auth={auth} />;
}

function DoctorAppointmentsContent({ auth }: { auth: { email: string; role: string } }) {
    const { doctor, loading: doctorLoading } = useDoctorProfile(auth.email);
    const {
        appointments,
        loading: apptsLoading,
        error,
        updateStatus,
        addNotes,
    } = useDoctorAppointments(doctor?.id ?? null);

    const loading = doctorLoading || (!!doctor && apptsLoading);

    const [filter, setFilter] = useState<FilterTab>("all");
    const [view, setView] = useState<ViewMode>("list");
    const [busyId, setBusyId] = useState<string | null>(null);
    const [actionError, setActionError] = useState("");
    const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
    const [notesOpenId, setNotesOpenId] = useState<string | null>(null);

    const sorted = [...appointments].sort(
        (a, b) => new Date(b.appointmentDateTime).getTime() - new Date(a.appointmentDateTime).getTime()
    );

    const filtered = sorted.filter((a) => {
        if (filter === "all") return true;
        return a.status?.toUpperCase() === filter.toUpperCase();
    });

    async function handleStatusChange(appointment: Appointment, status: string) {
        setActionError("");
        setBusyId(appointment.id);
        try {
            await updateStatus(appointment.id, status);
        } catch {
            setActionError("Couldn't update that appointment. Please try again.");
        } finally {
            setBusyId(null);
        }
    }

    async function handleSaveNotes(appointment: Appointment) {
        const notes = (notesDraft[appointment.id] ?? "").trim();
        if (!notes) return;
        setActionError("");
        setBusyId(appointment.id);
        try {
            await addNotes(appointment.id, notes);
            setNotesOpenId(null);
        } catch {
            setActionError("Couldn't save notes. Please try again.");
        } finally {
            setBusyId(null);
        }
    }

    const tabs: { key: FilterTab; label: string }[] = [
        { key: "all", label: "All" },
        { key: "pending", label: "Pending" },
        { key: "confirmed", label: "Confirmed" },
        { key: "completed", label: "Completed" },
        { key: "cancelled", label: "Cancelled" },
    ];

    return (
        <DoctorShell auth={auth} title="My Appointments">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in-up {
                    animation: fadeInUp 0.45s ease-out both;
                }
                @media (prefers-reduced-motion: reduce) {
                    .fade-in-up { animation: none; }
                }
            `}</style>

            <div className="fade-in-up flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">My Appointments</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage your patient bookings.</p>
                </div>
                <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                    <button
                        onClick={() => setView("list")}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                            view === "list" ? "bg-emerald-600 text-white" : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setView("calendar")}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                            view === "calendar" ? "bg-emerald-600 text-white" : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Calendar
                    </button>
                </div>
            </div>

            {view === "calendar" && (
                <div className="fade-in-up mt-5" style={{ animationDelay: "60ms" }}>
                    <AppointmentCalendar appointments={appointments} nameField="patientName" />
                </div>
            )}

            {view === "list" && (
                <>
            <div className="fade-in-up mt-5 flex gap-2 overflow-x-auto pb-1" style={{ animationDelay: "60ms" }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                            filter === tab.key
                                ? "bg-emerald-600 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-50"
                        } border border-gray-200`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {actionError && (
                <p className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                    {actionError}
                </p>
            )}

            <div className="mt-5 space-y-3">
                {loading && (
                    <div className="space-y-3">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <p className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</p>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
                        <p className="text-sm font-medium text-gray-900">No appointments here</p>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter === "all"
                                ? "You don't have any appointments yet."
                                : `No ${filter} appointments.`}
                        </p>
                    </div>
                )}

                {!loading &&
                    !error &&
                    filtered.map((a, i) => {
                        const status = a.status?.toUpperCase();
                        const canConfirm = status === "PENDING";
                        const canComplete = status === "CONFIRMED" && !isUpcoming(a);
                        const canCancel = status === "PENDING" || status === "CONFIRMED";
                        const notesOpen = notesOpenId === a.id;
                        const busy = busyId === a.id;

                        return (
                            <div
                                key={a.id}
                                className="fade-in-up rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                                style={{ animationDelay: `${Math.min(i * 50, 350)}ms` }}
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{a.patientName}</h4>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles(
                                                    a.status
                                                )}`}
                                            >
                                                {a.status}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {formatApptDateTime(a.appointmentDateTime)}
                                        </p>
                                        {a.reason && (
                                            <p className="mt-1.5 text-sm text-gray-500">
                                                <span className="font-medium text-gray-700">Reason: </span>
                                                {a.reason}
                                            </p>
                                        )}
                                        {a.notes && (
                                            <p className="mt-1.5 text-sm text-gray-500">
                                                <span className="font-medium text-gray-700">Notes: </span>
                                                {a.notes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                                        <div className="text-right">
                                            <span className="block text-sm font-semibold text-gray-900">
                                                KSh {a.fee?.toLocaleString()}
                                            </span>
                                            {a.paid ? (
                                                <span className="text-[11px] font-medium text-emerald-600">✓ Paid</span>
                                            ) : (
                                                <span className="text-[11px] font-medium text-amber-600">Unpaid</span>
                                            )}
                                        </div>
                                        {canConfirm && (
                                            <button
                                                onClick={() => handleStatusChange(a, "CONFIRMED")}
                                                disabled={busy}
                                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-[transform,background-color] duration-150 hover:scale-105 hover:bg-emerald-700 active:scale-100 disabled:opacity-50 disabled:hover:scale-100"
                                            >
                                                {busy ? "…" : "Confirm"}
                                            </button>
                                        )}
                                        {canComplete && (
                                            <button
                                                onClick={() => handleStatusChange(a, "COMPLETED")}
                                                disabled={busy}
                                                className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-900 disabled:opacity-50"
                                            >
                                                {busy ? "…" : "Mark Completed"}
                                            </button>
                                        )}
                                        {canCancel && (
                                            <button
                                                onClick={() => handleStatusChange(a, "CANCELLED")}
                                                disabled={busy}
                                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            onClick={() =>
                                                setNotesOpenId(notesOpen ? null : a.id)
                                            }
                                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                                        >
                                            {a.notes ? "Edit Notes" : "Add Notes"}
                                        </button>
                                    </div>
                                </div>

                                {notesOpen && (
                                    <div className="mt-4 border-t border-gray-100 pt-4">
                                        <textarea
                                            value={notesDraft[a.id] ?? a.notes ?? ""}
                                            onChange={(e) =>
                                                setNotesDraft((prev) => ({ ...prev, [a.id]: e.target.value }))
                                            }
                                            rows={3}
                                            placeholder="Add visit notes for this appointment…"
                                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                        <div className="mt-2 flex gap-2">
                                            <button
                                                onClick={() => handleSaveNotes(a)}
                                                disabled={busy}
                                                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                {busy ? "Saving…" : "Save Notes"}
                                            </button>
                                            <button
                                                onClick={() => setNotesOpenId(null)}
                                                className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>
                </>
            )}
        </DoctorShell>
    );
}