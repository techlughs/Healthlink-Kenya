"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useStoredRole } from "@/lib/useStoredRole";
import AdminShell from "@/components/AdminShell";
import { useAdminAnalytics } from "@/lib/useAdminAnalytics";

const STATUS_COLORS: Record<string, string> = {
    Pending: "#f59e0b",
    Confirmed: "#14b8a6",
    Completed: "#059669",
    Cancelled: "#f87171",
};

export default function AdminAnalyticsPage() {
    const router = useRouter();
    const role = useStoredRole();

    useEffect(() => {
        if (role !== null && role !== "ADMIN") {
            router.push("/admin/login");
        }
    }, [role, router]);

    const { data, loading, error, refetch } = useAdminAnalytics();

    if (role !== "ADMIN") {
        return null;
    }

    return (
        <AdminShell email="admin@healthlink.test" title="Analytics">
            <h2 className="text-xl font-semibold text-gray-900">Platform Analytics</h2>
            <p className="mt-1 text-sm text-gray-500">
                Revenue, volume, and doctor performance across all of HealthLink.
            </p>

            {loading ? (
                <div className="mt-6 space-y-4">
                    <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
                    <div className="h-72 animate-pulse rounded-xl bg-gray-100" />
                </div>
            ) : error ? (
                <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-6 text-center">
                    <p className="text-sm text-red-600">{error}</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-2 text-xs font-medium text-emerald-600 hover:underline"
                    >
                        Retry
                    </button>
                </div>
            ) : !data || data.totalAppointments === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
                    <p className="text-sm font-medium text-gray-900">No data yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Analytics will populate once bookings start coming in.
                    </p>
                </div>
            ) : (
                <>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Stat label="Total Revenue" value={`KSh ${data.totalRevenue.toLocaleString()}`} note="From completed visits" color="border-l-emerald-600" />
                        <Stat label="Total Appointments" value={String(data.totalAppointments)} note="All-time, platform-wide" color="border-l-teal-500" />
                        <Stat label="Active Doctors" value={String(data.activeDoctors)} note="With at least one booking" color="border-l-amber-500" />
                        <Stat label="Unique Patients" value={String(data.uniquePatients)} note="Across all doctors" color="border-l-emerald-600" />
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-5">
                        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-3">
                            <h3 className="text-sm font-semibold text-gray-900">Revenue, last 6 months</h3>
                            <div className="mt-4 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.monthlyRevenue} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} width={56} />
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

                        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
                            <h3 className="text-sm font-semibold text-gray-900">Appointments by status</h3>
                            <div className="mt-2 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data.statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="46%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                                            {data.statusBreakdown.map((entry) => (
                                                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#9ca3af"} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }} />
                                        <Legend verticalAlign="bottom" height={28} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-5">
                        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-3">
                            <h3 className="text-sm font-semibold text-gray-900">Busiest days of the week</h3>
                            <div className="mt-4 h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.weekdayVolume} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                                        <Tooltip cursor={{ fill: "#f0fdfa" }} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }} />
                                        <Bar dataKey="appointments" fill="#0d9488" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
                            <h3 className="text-sm font-semibold text-gray-900">Top Doctors</h3>
                            <p className="mt-0.5 text-xs text-gray-400">By revenue from completed visits</p>
                            <div className="mt-4 space-y-3">
                                {data.topDoctors.length === 0 ? (
                                    <p className="text-sm text-gray-400">No completed visits yet.</p>
                                ) : (
                                    data.topDoctors.map((doc, i) => (
                                        <div key={doc.doctorName} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-b-0">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                                                    {i + 1}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{doc.doctorName}</p>
                                                    <p className="text-xs text-gray-400">{doc.completedVisits} completed visits</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">KSh {doc.revenue.toLocaleString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminShell>
    );
}

function Stat({ label, value, note, color }: { label: string; value: string; note: string; color: string }) {
    return (
        <div className={`rounded-xl border-l-4 ${color} bg-white p-5 shadow-sm`}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            <p className="mt-2 text-xs text-gray-400">{note}</p>
        </div>
    );
}