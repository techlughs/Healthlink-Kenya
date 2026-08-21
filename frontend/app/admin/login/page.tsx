"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { scheduleTokenRefresh } from "@/lib/api";

export default function AdminLoginPage() {
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
            const response = await api.post("/auth/login", { email, password });
            const { token, refreshToken, role } = response.data;

            if (role !== "ADMIN") {
                setError("This account does not have admin access.");
                setLoading(false);
                return;
            }

            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("role", role);
            localStorage.setItem("email", email);
            scheduleTokenRefresh(token);

            router.push("/admin/dashboard");
        } catch {
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-8">
                <h1 className="text-xl font-semibold text-white">Admin Login</h1>
                <p className="mt-1 text-sm text-white/40">Restricted access</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {error && (
                        <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
                            {error}
                        </p>
                    )}

                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/60">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-400/60"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/60">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-400/60"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>
            </div>
        </main>
    );
}