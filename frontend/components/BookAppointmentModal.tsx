"use client";

import { useState } from "react";
import api from "@/lib/api";
import type { Doctor } from "@/types";

interface BookAppointmentModalProps {
    doctor: Doctor;
    patientName: string;
    patientId: string;
    onClose: () => void;
    onBooked: () => void;
}

export default function BookAppointmentModal({
    doctor,
    patientName,
    patientId,
    onClose,
    onBooked,
}: BookAppointmentModalProps) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [reason,setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const today = new Date().toISOString().split("T")[0];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!date || !time || !reason.trim()) {
            setError("Please fill in every field.");
            return;
        }

        setSubmitting(true);

        try {
            
            const appointmentDateTime = `${date}T${time}:00`;

            await api.post("/appointments", {
                patientId,
                doctorId: doctor.id,
                patientName,
                doctorName: doctor.fullName,
                doctorSpecialty: doctor.specialty,
                appointmentDateTime,
                reason: reason.trim(),
                fee: doctor.consultationFee,
            });

            onBooked();
        } catch {
            // Generic, user-safe error message — no internal details exposed
            setError("We couldn't book this appointment. Please try again.");
        } finally {
            setSubmitting(false);
        }
     }

     return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/50 p-4"
             onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Book Appointment
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            with {doctor.fullName} . {doctor.specialty}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                        >
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                 <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {error && (
                        <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Date
                        </label>
                        <input
                            type="date"
                            min={today}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Time
                        </label>
                        <select
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                            <option value="">Select a time</option>
                            {(doctor.availableTimes?.length
                                ? doctor.availableTimes
                                : ["09:00", "10:00", "11:00", "14:00", "15:00"]
                            ).map((slot) => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Reason for visit
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            rows={3}
                            maxLength={300}
                            placeholder="Briefly describe what you'd like to discuss"
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3">
                        <span className="text-sm text-emerald-800">Consultation fee</span>
                        <span className="text-sm font-semibold text-emerald-800">
                            KSh {doctor.consultationFee.toLocaleString()}
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {submitting ? "Booking..." : "Confirm Booking"}
                    </button>
                </form>
            </div>
        </div>
     );
   }
 