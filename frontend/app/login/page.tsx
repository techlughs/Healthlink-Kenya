"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            const { token, role } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("email", email);

            router.push("/dashboard");
        } catch {
            setError("Invalid email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('https://images.pexels.com/photos/5452222/pexels-photo-5452222.jpeg?auto=compress&cs=tinysrgb&w=2400')",
                }}
            />

            <div className="absolute inset-0 bg-linear-to-br from-black/85 via-emerald-950/75 to-black/90" />

            <div className="pointer-events-none absolute -top-40 -left-40 h-128 w-lg rounded-full bg-emerald-600/25 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 -right-20 h-128 w-lg rounded-full bg-teal-500/20 blur-[120px]" />

            <div className="relative z-10 flex w-full max-w-5xl items-center justify-between gap-16">
                <div className="hidden max-w-md flex-col gap-6 text-white lg:flex">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-6 w-6"
                            >
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </span>
                        <span className="text-xl font-semibold tracking-tight">
                            HealthLink Kenya
                        </span>
                    </div>

                    <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
                        Healthcare,{" "}
                        <span className="bg-linear-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
                            simplified.
                        </span>
                    </h1>

                    <p className="max-w-sm text-base leading-relaxed text-white/60">
                        Book verified doctors, manage your appointments, and stay on top
                        of your health, wherever you are in Kenya.
                    </p>

                    <div className="mt-4 flex gap-8 text-sm text-white/50">
                        <div>
                            <p className="text-2xl font-semibold text-white">500+</p>
                            <p>Verified doctors</p>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">47</p>
                            <p>Counties covered</p>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">24/7</p>
                            <p>Support</p>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-2xl">
                    <div className="mb-6 flex items-center gap-2 lg:hidden">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/20">
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
                        </span>
                        <span className="font-semibold text-white">HealthLink Kenya</span>
                    </div>

                    <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
                    <p className="mt-1 text-sm text-white/50">
                        Log in to continue to your account
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        {error && (
                            <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
                                {error}
                            </p>
                        )}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-white/70">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-400/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-white/70">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-400/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-linear-to-r from-emerald-500 to-teal-400 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 disabled:opacity-50"
                        >
                            {loading ? "Logging in..." : "Log In"}
                        </button>

                        <p className="pt-1 text-center text-sm text-white/50">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="font-medium text-emerald-300 hover:text-emerald-200"
                            >
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </main>
    );
}