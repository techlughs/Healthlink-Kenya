"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"] });

function Logo({ className = "h-9 w-9" }: { className?: string }) {
    return (
        <span className={`relative flex ${className} items-center justify-center rounded-lg bg-emerald-950 text-emerald-400`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
            >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        </span>
    );
}

function IconBase({ children }: { children: React.ReactNode }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
        >
            {children}
        </svg>
    );
}

const FEATURES = [
    {
        title: "Verified Doctors",
        description: "Every doctor on HealthLink is vetted and credentialed, so you always know who you're seeing.",
        icon: (
            <IconBase>
                <path d="M12 2 3 6v6c0 5 3.8 9 9 10 5.2-1 9-5 9-10V6l-9-4Z" />
                <path d="m9 12 2 2 4-4" />
            </IconBase>
        ),
    },
    {
        title: "Book in Seconds",
        description: "Pick a specialty, a doctor, and a time that works for you. No phone calls, no waiting rooms.",
        icon: (
            <IconBase>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <path d="m9 16 2 2 4-4" />
            </IconBase>
        ),
    },
    {
        title: "Secure & Private",
        description: "Your health data is encrypted and never shared. Only you and your doctor see your records.",
        icon: (
            <IconBase>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </IconBase>
        ),
    },
    {
        title: "Manage Anywhere",
        description: "Reschedule, cancel, or review past visits from your phone or laptop, wherever you are in Kenya.",
        icon: (
            <IconBase>
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M12 18h.01" />
            </IconBase>
        ),
    },
];

const STEPS = [
    {
        n: "01",
        title: "Create your account",
        description: "Sign up as a patient in under a minute — no paperwork, no clinic visit required.",
    },
    {
        n: "02",
        title: "Find the right doctor",
        description: "Browse verified doctors by specialty, location, or availability that fits your schedule.",
    },
    {
        n: "03",
        title: "Book & get care",
        description: "Confirm your appointment, meet your doctor, and manage everything from your dashboard.",
    },
];

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        function handleScroll() {
            setScrolled(window.scrollY > 12);
        }
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <main className="min-h-screen bg-white">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in-up {
                    animation: fadeInUp 0.6s ease-out both;
                }
                @media (prefers-reduced-motion: reduce) {
                    .fade-in-up { animation: none; }
                }
            `}</style>

            {/* Nav */}
            <header
                className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
                    scrolled ? "bg-white/90 shadow-sm backdrop-blur-md" : "bg-transparent"
                }`}
            >
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
                    <div className="flex items-center gap-2.5">
                        <Logo />
                        <span
                            className={`${display.className} text-[15px] font-semibold transition-colors ${
                                scrolled ? "text-gray-900" : "text-white"
                            }`}
                        >
                            HealthLink Kenya
                        </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/login"
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition sm:px-4 ${
                                scrolled
                                    ? "text-gray-700 hover:bg-gray-100"
                                    : "text-white/90 hover:bg-white/10"
                            }`}
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-lg bg-linear-to-r from-emerald-600 to-teal-500 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-500/30 transition hover:from-emerald-500 hover:to-teal-400 sm:px-4"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden px-5 pb-20 pt-32 text-white lg:px-8 lg:pb-28 lg:pt-40">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.pexels.com/photos/5452222/pexels-photo-5452222.jpeg?auto=compress&cs=tinysrgb&w=2400')",
                    }}
                />
                <div className="absolute inset-0 bg-linear-to-br from-black/85 via-emerald-950/75 to-black/90" />
                <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-600/25 blur-[120px]" />
                <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-teal-400/20 blur-[120px]" />

                <div className="relative mx-auto max-w-3xl text-center">
                    <p className="fade-in-up text-sm font-medium uppercase tracking-wider text-emerald-300">
                        Healthcare for every county in Kenya
                    </p>
                    <h1
                        className={`${display.className} fade-in-up mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl`}
                        style={{ animationDelay: "80ms" }}
                    >
                        Find a doctor.{" "}
                        <span className="bg-linear-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
                            Book in minutes.
                        </span>
                    </h1>
                    <p
                        className="fade-in-up mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
                        style={{ animationDelay: "140ms" }}
                    >
                        HealthLink connects you with verified doctors across Kenya. Browse
                        specialties, pick a time, and manage every visit from one place —
                        no queues, no phone tag.
                    </p>
                    <div
                        className="fade-in-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
                        style={{ animationDelay: "200ms" }}
                    >
                        <Link
                            href="/register"
                            className="w-full rounded-lg bg-linear-to-r from-emerald-500 to-teal-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:scale-[1.02] hover:shadow-emerald-500/40 sm:w-auto"
                        >
                            Create your account
                        </Link>
                        <Link
                            href="/login"
                            className="w-full rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto"
                        >
                            I already have an account
                        </Link>
                    </div>

                    <div
                        className="fade-in-up mt-14 flex justify-center gap-10 text-sm text-white/60 sm:gap-16"
                        style={{ animationDelay: "260ms" }}
                    >
                        <div>
                            <p className="text-2xl font-semibold text-white sm:text-3xl">500+</p>
                            <p>Verified doctors</p>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white sm:text-3xl">47</p>
                            <p>Counties covered</p>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white sm:text-3xl">24/7</p>
                            <p>Booking support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="px-5 py-20 lg:px-8 lg:py-28">
                <div className="mx-auto max-w-6xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-medium uppercase tracking-wider text-emerald-600">
                            Why HealthLink
                        </p>
                        <h2 className={`${display.className} mt-2 text-3xl font-bold text-gray-900 sm:text-4xl`}>
                            Care that fits your life
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map((f, i) => (
                            <div
                                key={f.title}
                                className="fade-in-up rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                style={{ animationDelay: `${i * 80}ms` }}
                            >
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    {f.icon}
                                </span>
                                <h3 className="mt-4 font-semibold text-gray-900">{f.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                                    {f.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="bg-gray-50 px-5 py-20 lg:px-8 lg:py-28">
                <div className="mx-auto max-w-5xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-medium uppercase tracking-wider text-emerald-600">
                            How it works
                        </p>
                        <h2 className={`${display.className} mt-2 text-3xl font-bold text-gray-900 sm:text-4xl`}>
                            Three steps to your next visit
                        </h2>
                    </div>

                    <div className="mt-14 grid gap-8 sm:grid-cols-3">
                        {STEPS.map((s, i) => (
                            <div
                                key={s.n}
                                className="fade-in-up relative"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <span
                                    className={`${display.className} text-4xl font-bold text-emerald-100`}
                                >
                                    {s.n}
                                </span>
                                <h3 className="mt-2 text-lg font-semibold text-gray-900">{s.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                                    {s.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA banner */}
            <section className="px-5 py-20 lg:px-8 lg:py-24">
                <div className="fade-in-up relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-linear-to-br from-emerald-950 via-teal-900 to-emerald-800 px-8 py-14 text-center text-white shadow-xl">
                    <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-[100px]" />
                    <h2 className={`${display.className} relative text-2xl font-bold sm:text-3xl`}>
                        Ready to take control of your health?
                    </h2>
                    <p className="relative mx-auto mt-3 max-w-md text-sm text-white/70">
                        Join thousands of patients across Kenya already booking smarter with HealthLink.
                    </p>
                    <Link
                        href="/register"
                        className="relative mt-6 inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:scale-[1.02] hover:shadow-emerald-500/40"
                    >
                        Get Started — It&apos;s Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 px-5 py-10 lg:px-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-2.5">
                        <Logo className="h-8 w-8" />
                        <span className={`${display.className} text-sm font-semibold text-gray-900`}>
                            HealthLink Kenya
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} HealthLink Kenya. Built for a healthier Kenya.
                    </p>
                </div>
            </footer>
        </main>
    );
}
