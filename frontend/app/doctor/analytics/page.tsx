"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { useAuthGuard, DashboardSkeleton } from "@/components/DashboardShell";
import DoctorShell from "@/components/DoctorShell";
import { useDoctorProfile } from "@/lib/Usedoctorprofile";
import { useDoctorAppointments } from "@/lib/Usedoctorappointments";
import type { Appointment } from "@/lib/useAppointments";

const STATUS_COLORS: Record<string, string> = {
    PENDING: "#f59e0b",
    CONFIRMED: "#14b8a6",
    COMPLETED: "#059669",
    CANCELLED: "#f87171",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthKey(d: Date) {
    return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

function buildMonthlyRevenue(appointments: Appointment[]) {
    const now = new Date();
    const months: { key: string; label: string; revenue: number }[] = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthKey(d), revenue: 0 });
    }

    appointments
        .filter((a) => a.status?.toUpperCase() === "COMPLETED")
        .forEach((a) => {
            const d = new Date(a.appointmentDateTime);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const bucket = months.find((m) => m.key === key);
            if (bucket) bucket.revenue += a.fee || 0;
        });

    return months.map(({ label, revenue }) => ({ label, revenue }));
}

function buildStatusBreakdown(appointments: Appointment[]) {
    const counts: Record<string, number> = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
    appointments.forEach((a) => {
        const s = a.status?.toUpperCase();
        if (s && s in counts) counts[s] += 1;
    });
    return Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
            name: status.charAt(0) + status.slice(1).toLowerCase(),
            value: count,
            color: STATUS_COLORS[status],
        }));
}

function buildWeekdayVolume(appointments: Appointment[]) {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon..Sun
    appointments
        .filter((a) => a.status?.toUpperCase() !== "CANCELLED")
        .forEach((a) => {
            const jsDay = new Date(a.appointmentDateTime).getDay(); // 0=Sun..6=Sat
            const idx = jsDay === 0 ? 6 : jsDay - 1;
            counts[idx] += 1;
        });
    return WEEKDAYS.map((day, i) => ({ day, appointments: counts[i] }));
}

export default function DoctorAnalyticsPage() {
    const auth = useAuthGuard("DOCTOR");

    if (!auth) {
        return <DashboardSkeleton />;
    }

    return <DoctorAnalyticsContent auth={auth} />;
}

function DoctorAnalyticsContent({ auth }: { auth: { email: string; role: string } }) {
    const { doctor, loading: doctorLoading } = useDoctorProfile(auth.email);
    const { appointments, loading: apptsLoading } = useDoctorAppointments(doctor?.id ?? null);

    const loading = doctorLoading || (!!doctor && apptsLoading);

    if (loading) {
        return (
            <DoctorShell auth={auth} title="Analytics">
                <div className="space-y-4">
                    <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="h-72 animate-pulse rounded-xl bg-gray-100" />
                        <div className="h-72 animate-pulse rounded-xl bg-gray-100" />
                    </div>
                </div>
            </DoctorShell>
        );
    }

    const completed = appointments.filter((a) => a.status?.toUpperCase() === "COMPLETED");
    const totalRevenue = completed.reduce((sum, a) => sum + (a.fee || 0), 0);
    const uniquePatients = new Set(appointments.map((a) => a.patientId)).size;
    const avgFee = completed.length > 0 ? totalRevenue / completed.length : 0;

    const monthlyRevenue = buildMonthlyRevenue(appointments);
    const statusBreakdown = buildStatusBreakdown(appointments);
    const weekdayVolume = buildWeekdayVolume(appointments);

    const hasAnyData = appointments.length > 0;

    return (
        <DoctorShell auth={auth} title="Analytics">
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

            <div className="fade-in-up">
                <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
                <p className="mt-1 text-sm text-gray-500">
                    A look at your practice — revenue, patient volume, and scheduling patterns.
                </p>
            </div>

            {!hasAnyData ? (
                <div className="fade-in-up mt-6 rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
                    <p className="text-sm font-medium text-gray-900">No data yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Analytics will populate once patients start booking with you.
                    </p>
                </div>
            ) : (
                <>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="fade-in-up rounded-xl border-l-4 border-l-emerald-600 bg-white p-5 shadow-sm" style={{ animationDelay: "60ms" }}>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                KSh {totalRevenue.toLocaleString()}
                            </p>
                            <p className="mt-2 text-xs text-gray-400">From completed visits</p>
                        </div>
                        <div className="fade-in-up rounded-xl border-l-4 border-l-teal-500 bg-white p-5 shadow-sm" style={{ animationDelay: "110ms" }}>
                            <p className="text-sm text-gray-500">Total Appointments</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{appointments.length}</p>
                            <p className="mt-2 text-xs text-gray-400">All-time bookings</p>
                        </div>
                        <div className="fade-in-up rounded-xl border-l-4 border-l-amber-500 bg-white p-5 shadow-sm" style={{ animationDelay: "160ms" }}>
                            <p className="text-sm text-gray-500">Unique Patients</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{uniquePatients}</p>
                            <p className="mt-2 text-xs text-gray-400">Distinct patients seen</p>
                        </div>
                        <div className="fade-in-up rounded-xl border-l-4 border-l-emerald-600 bg-white p-5 shadow-sm" style={{ animationDelay: "210ms" }}>
                            <p className="text-sm text-gray-500">Avg. Fee / Visit</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                KSh {Math.round(avgFee).toLocaleString()}
                            </p>
                            <p className="mt-2 text-xs text-gray-400">Per completed visit</p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-5">
                        <div
                            className="fade-in-up rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-3"
                            style={{ animationDelay: "260ms" }}
                        >
                            <h3 className="text-sm font-semibold text-gray-900">Revenue, last 6 months</h3>
                            <div className="mt-4 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyRevenue} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 12, fill: "#6b7280" }}
                                            axisLine={{ stroke: "#e5e7eb" }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: "#6b7280" }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={56}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "#f0fdf4" }}
                                            formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, "Revenue"]}
                                            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                                        />
                                        <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div
                            className="fade-in-up rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2"
                            style={{ animationDelay: "310ms" }}
                        >
                            <h3 className="text-sm font-semibold text-gray-900">Appointments by status</h3>
                            <div className="mt-2 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusBreakdown}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="46%"
                                            innerRadius={45}
                                            outerRadius={70}
                                            paddingAngle={3}
                                        >
                                            {statusBreakdown.map((entry) => (
                                                <Cell key={entry.name} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={28}
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{ fontSize: 12 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="fade-in-up mt-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm" style={{ animationDelay: "360ms" }}>
                        <h3 className="text-sm font-semibold text-gray-900">Busiest days of the week</h3>
                        <div className="mt-4 h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weekdayVolume} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 12, fill: "#6b7280" }}
                                        axisLine={{ stroke: "#e5e7eb" }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: "#6b7280" }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={32}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "#f0fdfa" }}
                                        contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                                    />
                                    <Bar dataKey="appointments" fill="#0d9488" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </DoctorShell>
    );
}