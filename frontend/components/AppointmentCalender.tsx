"use client";

import { useState } from "react";
import type { Appointment } from "@/lib/useAppointments";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function statusDotColor(status: string) {
    switch (status?.toUpperCase()) {
        case "CONFIRMED":
            return "bg-emerald-500";
        case "PENDING":
            return "bg-amber-500";
        case "CANCELLED":
            return "bg-red-400";
        case "COMPLETED":
            return "bg-gray-400";
        default:
            return "bg-gray-300";
    }
}

function statusBadge(status: string) {
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

function sameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
}

interface AppointmentCalendarProps {
    appointments: Appointment[];
    /** Which name to show on each pill/card: the other party from this viewer's perspective */
    nameField: "doctorName" | "patientName";
    renderExtra?: (appointment: Appointment) => React.ReactNode;
}

export default function AppointmentCalendar({ appointments, nameField, renderExtra }: AppointmentCalendarProps) {
    const today = new Date();
    const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState<Date | null>(today);

    const year = cursor.getFullYear();
    const month = cursor.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { date: Date; inMonth: boolean }[] = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
        cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ date: new Date(year, month, d), inMonth: true });
    }
    while (cells.length % 7 !== 0 || cells.length < 42) {
        const last = cells[cells.length - 1].date;
        const next = new Date(last);
        next.setDate(next.getDate() + 1);
        cells.push({ date: next, inMonth: false });
        if (cells.length >= 42) break;
    }

    function appointmentsOn(date: Date) {
        return appointments
            .filter((a) => sameDay(new Date(a.appointmentDateTime), date))
            .sort((a, b) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime());
    }

    function goToMonth(delta: number) {
        setCursor(new Date(year, month + delta, 1));
    }

    function goToToday() {
        setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
        setSelectedDate(today);
    }

    const selectedAppointments = selectedDate ? appointmentsOn(selectedDate) : [];

    return (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => goToMonth(-1)}
                        aria-label="Previous month"
                        className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-50"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>
                    <h3 className="min-w-[140px] text-center text-sm font-semibold text-gray-900">
                        {MONTH_NAMES[month]} {year}
                    </h3>
                    <button
                        onClick={() => goToMonth(1)}
                        aria-label="Next month"
                        className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-50"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>
                </div>
                <button
                    onClick={goToToday}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                    Today
                </button>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/60">
                {WEEKDAYS.map((wd) => (
                    <div key={wd} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        {wd}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {cells.map(({ date, inMonth }, i) => {
                    const dayAppointments = appointmentsOn(date);
                    const isToday = sameDay(date, today);
                    const isSelected = selectedDate ? sameDay(date, selectedDate) : false;

                    return (
                        <button
                            key={i}
                            onClick={() => setSelectedDate(date)}
                            className={`relative flex min-h-[64px] flex-col items-start gap-1 border-b border-r border-gray-50 p-1.5 text-left transition sm:min-h-[84px] sm:p-2 ${
                                inMonth ? "bg-white hover:bg-gray-50" : "bg-gray-50/40 hover:bg-gray-50"
                            } ${isSelected ? "ring-2 ring-inset ring-emerald-500" : ""}`}
                        >
                            <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                                    isToday
                                        ? "bg-emerald-600 text-white"
                                        : inMonth
                                          ? "text-gray-700"
                                          : "text-gray-300"
                                }`}
                            >
                                {date.getDate()}
                            </span>
                            {dayAppointments.length > 0 && (
                                <div className="flex flex-wrap gap-0.5">
                                    {dayAppointments.slice(0, 3).map((a) => (
                                        <span key={a.id} className={`h-1.5 w-1.5 rounded-full ${statusDotColor(a.status)}`} />
                                    ))}
                                    {dayAppointments.length > 3 && (
                                        <span className="text-[9px] font-medium text-gray-400">
                                            +{dayAppointments.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="border-t border-gray-100 bg-gray-50/40 px-5 py-4">
                <p className="text-sm font-medium text-gray-900">
                    {selectedDate
                        ? selectedDate.toLocaleDateString("en-GB", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                          })
                        : "Select a date"}
                </p>

                {selectedAppointments.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-400">No appointments this day.</p>
                ) : (
                    <div className="mt-3 space-y-2">
                        {selectedAppointments.map((a) => (
                            <div key={a.id} className="rounded-lg border border-gray-100 bg-white px-3 py-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-gray-900">
                                            {a[nameField]}
                                        </p>
                                        <p className="text-xs text-gray-500">{formatTime(a.appointmentDateTime)}</p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge(a.status)}`}>
                                        {a.status}
                                    </span>
                                </div>
                                {renderExtra?.(a)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
