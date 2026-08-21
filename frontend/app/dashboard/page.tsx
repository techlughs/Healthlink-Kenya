"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthGuard, DashboardSkeleton } from "@/components/DashboardShell";
import DashboardShell from "@/components/DashboardShell";
import { useAppointments, isUpcoming } from "@/lib/useAppointments";
import api from "@/lib/api";
import { articleExcerpt } from "@/lib/articleFormat";

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

function PulseLine() {
    return (
        <svg
            viewBox="0 0 600 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 bottom-6 h-16 w-full opacity-70"
            aria-hidden="true"
        >
            <path
                d="M0,58 L150,58 L168,58 L180,28 L192,82 L204,12 L216,80 L228,58 L300,58 L450,58 L468,58 L480,28 L492,82 L504,12 L516,80 L528,58 L600,58"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={300}
                className="pulse-draw"
            />
            <circle cx="600" cy="58" r="4" fill="#6EE7B7" className="animate-pulse" />
        </svg>
    );
}

interface Article {
    id: string;
    title: string;
    content: string;
    coverImageUrl?: string;
    createdAt: string;
}

function useLatestArticles(limit = 3) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        api
            .get("/articles")
            .then((res) => {
                if (!cancelled) setArticles((res.data as Article[]).slice(0, limit));
            })
            .catch(() => {
                if (!cancelled) setError("Couldn't load health articles right now.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [limit]);

    return { articles, loading, error };
}

export default function DashboardPage() {
    const auth = useAuthGuard("PATIENT");

    if (!auth) {
        return <DashboardSkeleton />;
    }

    return <DashboardContent auth={auth} />;
}

function DashboardContent({ auth }: { auth: { email: string; role: string } }) {
    const firstName = auth.email.split("@")[0];
    const isPatient = auth.role === "PATIENT";

    const { appointments } = useAppointments(auth.email);
    const upcomingCount = appointments.filter(isUpcoming).length;
    const doctorsConsulted = new Set(appointments.map((a) => a.doctorId)).size;

    const { articles, loading: articlesLoading, error: articlesError } = useLatestArticles();

    return (
        <DashboardShell auth={auth} title="Dashboard">
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-950 via-teal-900 to-emerald-800 px-8 py-10 text-white shadow-lg shadow-emerald-950/30">
                <style>{`
                    @keyframes drawPulse {
                        from { stroke-dashoffset: 300; }
                        to { stroke-dashoffset: 0; }
                    }
                    .pulse-draw {
                        stroke-dasharray: 300;
                        stroke-dashoffset: 300;
                        animation: drawPulse 1.6s ease-out 0.2s forwards;
                    }
                    @media (prefers-reduced-motion: reduce) {
                        .pulse-draw { animation: none; stroke-dashoffset: 0; }
                    }
                `}</style>
                <PulseLine />
                <div className="relative z-10">
                    <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                        {isPatient ? "Patient Dashboard" : auth.role}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold capitalize sm:text-4xl">
                        {getGreeting()}, {firstName}
                    </h2>
                    <p className="mt-2 max-w-md text-sm text-white/70">
                        Here&apos;s what&apos;s next for your care on HealthLink Kenya.
                    </p>
                    <Link
                        href="/doctors"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-teal-400"
                    >
                        Book an appointment
                    </Link>
                </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border-l-4 border-l-emerald-600 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Upcoming Appointments</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{upcomingCount}</p>
                    <Link
                        href="/doctors"
                        className="mt-2 inline-block text-xs font-medium text-emerald-600 hover:underline"
                    >
                        {upcomingCount === 0 ? "Book your first visit →" : "Book another visit →"}
                    </Link>
                </div>
                <div className="rounded-xl border-l-4 border-l-emerald-600 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Doctors Consulted</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{doctorsConsulted}</p>
                    <p className="mt-2 text-xs text-gray-400">
                        {doctorsConsulted === 0
                            ? "Your visit history will show up here"
                            : "Across all your appointments"}
                    </p>
                </div>
                <div className="rounded-xl border-l-4 border-l-emerald-600 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Account Status</p>
                    <p className="mt-1 text-3xl font-semibold text-emerald-600">Active</p>
                    <p className="mt-2 text-xs text-gray-400">Verified &amp; ready to book</p>
                </div>
            </div>

            <h3 className="mt-10 text-lg font-semibold text-gray-900">Quick Actions</h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                    href="/doctors"
                    className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md"
                >
                    <h4 className="font-semibold text-gray-900">Find a Doctor</h4>
                    <p className="mt-1 text-sm text-gray-500">Browse verified doctors near you</p>
                </Link>

                <Link
                    href="/appointments"
                    className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md"
                >
                    <h4 className="font-semibold text-gray-900">My Appointments</h4>
                    <p className="mt-1 text-sm text-gray-500">View and manage your bookings</p>
                </Link>

                <Link
                    href="/profile"
                    className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md"
                >
                    <h4 className="font-semibold text-gray-900">My Profile</h4>
                    <p className="mt-1 text-sm text-gray-500">Update your personal information</p>
                </Link>
            </div>

            <div className="mt-10 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Health Articles</h3>
                {articles.length > 0 && (
                    <Link
                        href="/articles"
                        className="text-sm font-medium text-emerald-600 hover:underline"
                    >
                        View all →
                    </Link>
                )}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {articlesLoading ? (
                    <p className="text-sm text-gray-400">Loading…</p>
                ) : articlesError ? (
                    <p className="text-sm text-red-500">{articlesError}</p>
                ) : articles.length === 0 ? (
                    <p className="text-sm text-gray-400">
                        No health articles published yet — check back soon.
                    </p>
                ) : (
                    articles.map((article) => (
                        <div
                            key={article.id}
                            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                        >
                            {article.coverImageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={article.coverImageUrl}
                                    alt=""
                                    className="h-32 w-full object-cover"
                                />
                            )}
                            <div className="p-5">
                                <h4 className="font-semibold text-gray-900">{article.title}</h4>
                                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                    {articleExcerpt(article.content, 110)}
                                </p>
                                <Link
                                    href={`/articles/${article.id}`}
                                    className="mt-3 inline-block text-xs font-medium text-emerald-600 hover:underline"
                                >
                                    Read more →
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardShell>
    );
}