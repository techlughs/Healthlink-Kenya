"use client";

import { useState } from "react";
import { useAuthGuard, DashboardSkeleton } from "@/components/DashboardShell";
import DashboardShell from "@/components/DashboardShell";
import { useAppointments, isUpcoming, formatApptDateTime, type Appointment } from "@/lib/useAppointments";
import { usePatientReviews } from "@/lib/useReviews";
import { useUser } from "@/lib/useUser";
import AppointmentCalendar from "@/components/AppointmentCalender";
import MpesaPaymentModal from "@/components/MpesaPaymentModal";
import api from "@/lib/api";

type FilterTab = "all" | "upcoming" | "past" | "cancelled";
type ViewMode = "list" | "calendar";

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    className="p-0.5"
                >
                    <svg
                        viewBox="0 0 20 20"
                        className={`h-6 w-6 transition ${
                            n <= value ? "fill-amber-400" : "fill-gray-200 hover:fill-amber-200"
                        }`}
                    >
                        <path d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.8l-5.2 2.7 1-5.8L1.6 7.6l5.8-.8L10 1.5z" />
                    </svg>
                </button>
            ))}
        </div>
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

export default function AppointmentsPage() {
    const auth = useAuthGuard("PATIENT");

    if (!auth) {
        return <DashboardSkeleton />;
    }

    return <AppointmentsContent auth={auth} />;
}

function AppointmentsContent({ auth }: { auth: { email: string; role: string } }) {
    const { appointments, loading, error, refetch } = useAppointments(auth.email);
    const { submitReview, reviewedDoctorIds } = usePatientReviews(auth.email);
    const { user } = useUser(auth.email);
    const [filter, setFilter] = useState<FilterTab>("all");
    const [view, setView] = useState<ViewMode>("list");
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState("");
    const [payingAppointment, setPayingAppointment] = useState<Appointment | null>(null);

    const [reviewOpenId, setReviewOpenId] = useState<string | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [justReviewedDoctorId, setJustReviewedDoctorId] = useState<string | null>(null);

    const sorted = [...appointments].sort(
        (a, b) => new Date(b.appointmentDateTime).getTime() - new Date(a.appointmentDateTime).getTime()
    );

    const filtered = sorted.filter((a) => {
        const cancelled = a.status?.toUpperCase() === "CANCELLED";
        if (filter === "upcoming") return isUpcoming(a);
        if (filter === "past") return !isUpcoming(a) && !cancelled;
        if (filter === "cancelled") return cancelled;
        return true;
    });

    async function handleCancel(appointment: Appointment) {
        setActionError("");
        setCancellingId(appointment.id);
        try {
            await api.put(`/appointments/${appointment.id}/cancel`);
            refetch();
        } catch {
            setActionError("Couldn't cancel that appointment. Please try again.");
        } finally {
            setCancellingId(null);
        }
    }

    function openReview(appointment: Appointment) {
        setReviewOpenId(appointment.id);
        setReviewRating(0);
        setReviewComment("");
        setReviewError("");
    }

    async function handleSubmitReview(appointment: Appointment) {
        if (reviewRating === 0) {
            setReviewError("Please select a star rating.");
            return;
        }
        setReviewError("");
        setSubmittingReview(true);
        try {
            await submitReview({
                doctorId: appointment.doctorId,
                patientName: appointment.patientName,
                doctorName: appointment.doctorName,
                rating: reviewRating,
                comment: reviewComment.trim(),
            });
            setReviewOpenId(null);
            setJustReviewedDoctorId(appointment.doctorId);
            setTimeout(() => setJustReviewedDoctorId(null), 4000);
        } catch {
            setReviewError("Couldn't submit your review. Please try again.");
        } finally {
            setSubmittingReview(false);
        }
    }

    const tabs: { key: FilterTab; label: string }[] = [
        { key: "all", label: "All" },
        { key: "upcoming", label: "Upcoming" },
        { key: "past", label: "Past" },
        { key: "cancelled", label: "Cancelled" },
    ];

    return (
        <DashboardShell auth={auth} title="My Appointments">
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
                    <p className="mt-1 text-sm text-gray-500">All your visits, past and upcoming, in one place.</p>
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
                    <AppointmentCalendar appointments={appointments} nameField="doctorName" />
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
                            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <p className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</p>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
                        <p className="text-sm font-medium text-gray-900">No appointments here yet</p>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter === "all"
                                ? "Book your first visit to get started."
                                : `You don't have any ${filter} appointments.`}
                        </p>
                    </div>
                )}

                {!loading &&
                    !error &&
                    filtered.map((a, i) => {
                        const cancelled = a.status?.toUpperCase() === "CANCELLED";
                        const completed = a.status?.toUpperCase() === "COMPLETED";
                        const canCancel = isUpcoming(a) && !cancelled;
                        const alreadyReviewed =
                            reviewedDoctorIds.has(a.doctorId) || justReviewedDoctorId === a.doctorId;
                        const canReview = completed && !alreadyReviewed;
                        const reviewOpen = reviewOpenId === a.id;

                        return (
                            <div
                                key={a.id}
                                className="fade-in-up rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                                style={{ animationDelay: `${Math.min(i * 50, 350)}ms` }}
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{a.doctorName}</h4>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles(
                                                    a.status
                                                )}`}
                                            >
                                                {a.status}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">{a.doctorSpecialty}</p>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {formatApptDateTime(a.appointmentDateTime)}
                                        </p>
                                        {a.reason && (
                                            <p className="mt-1.5 text-sm text-gray-500">
                                                <span className="font-medium text-gray-700">Reason: </span>
                                                {a.reason}
                                            </p>
                                        )}
                                        {completed && alreadyReviewed && (
                                            <p className="mt-1.5 text-xs font-medium text-emerald-600">
                                                ✓ You've reviewed this doctor
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 items-center gap-3">
                                        <div className="text-right">
                                            <span className="block text-sm font-semibold text-gray-900">
                                                KSh {a.fee?.toLocaleString()}
                                            </span>
                                            {a.paid ? (
                                                <span className="text-[11px] font-medium text-emerald-600">✓ Paid</span>
                                            ) : (
                                                !cancelled && (
                                                    <span className="text-[11px] font-medium text-amber-600">Unpaid</span>
                                                )
                                            )}
                                        </div>
                                        {!a.paid && !cancelled && (
                                            <button
                                                onClick={() => setPayingAppointment(a)}
                                                className="rounded-lg bg-linear-to-r from-emerald-600 to-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-500/30 transition-[transform] duration-150 hover:scale-105 hover:from-emerald-500 hover:to-teal-400 active:scale-100"
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                        {canCancel && (
                                            <button
                                                onClick={() => handleCancel(a)}
                                                disabled={cancellingId === a.id}
                                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                            >
                                                {cancellingId === a.id ? "Cancelling…" : "Cancel"}
                                            </button>
                                        )}
                                        {canReview && (
                                            <button
                                                onClick={() => openReview(a)}
                                                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-[transform,background-color] duration-150 hover:scale-105 hover:bg-amber-600 active:scale-100"
                                            >
                                                Leave a Review
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {reviewOpen && (
                                    <div className="mt-4 border-t border-gray-100 pt-4">
                                        <p className="text-sm font-medium text-gray-700">
                                            Rate your visit with {a.doctorName}
                                        </p>
                                        <div className="mt-2">
                                            <StarPicker value={reviewRating} onChange={setReviewRating} />
                                        </div>
                                        <textarea
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            rows={3}
                                            placeholder="Share a bit about your experience (optional)"
                                            className="mt-3 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                        {reviewError && (
                                            <p className="mt-2 text-sm text-red-600">{reviewError}</p>
                                        )}
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                onClick={() => handleSubmitReview(a)}
                                                disabled={submittingReview}
                                                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                {submittingReview ? "Submitting…" : "Submit Review"}
                                            </button>
                                            <button
                                                onClick={() => setReviewOpenId(null)}
                                                disabled={submittingReview}
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

            {payingAppointment && (
                <MpesaPaymentModal
                    appointmentId={payingAppointment.id}
                    patientId={auth.email}
                    patientName={payingAppointment.patientName}
                    doctorId={payingAppointment.doctorId}
                    doctorName={payingAppointment.doctorName}
                    amount={payingAppointment.fee}
                    initialPhone={user?.phone || ""}
                    onClose={() => setPayingAppointment(null)}
                    onPaid={refetch}
                />
            )}
        </DashboardShell>
    );
}