"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

function getPasswordChecks(password: string) {
    return {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };
}

function getPasswordScore(checks: ReturnType<typeof getPasswordChecks>) {
    return Object.values(checks).filter(Boolean).length;
}

export default function RegisterPage() {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
    const passwordScore = useMemo(() => getPasswordScore(passwordChecks), [passwordChecks]);

    const isPasswordValid = passwordChecks.length && passwordChecks.upper && passwordChecks.number;

    const strengthLabel =
        password.length === 0
            ? ""
            : passwordScore <= 2
            ? "Weak"
            : passwordScore === 3
            ? "Fair"
            : passwordScore === 4
            ? "Good"
            : "Strong";

    const strengthColor =
        passwordScore <= 2
            ? "bg-red-400"
            : passwordScore === 3
            ? "bg-amber-400"
            : passwordScore === 4
            ? "bg-emerald-400"
            : "bg-emerald-300";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setPasswordTouched(true);

        if (!isPasswordValid) {
            setError("Please meet the minimum password requirements below.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/users/register", {
                fullName,
                email,
                password,
                phone,
                role: "PATIENT",
            });

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 1800);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
            setLoading(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10">
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('https://images.pexels.com/photos/5452222/pexels-photo-5452222.jpeg?auto=compress&cs=tinysrgb&w=2400')",
                }}
            />
            <div className="absolute inset-0 bg-linear-to-br from-black/85 via-emerald-950/75 to-black/90"/>

            <div className="pointer-events-none absolute -top-40 -left-40 h-128 w-lg rounded-full bg-emerald-600/25 blur-[120px]"/>
            <div className="pointer-events-none absolute -bottom-40 -right-20 h-128 w-lg rounded-full bg-teal-500/20 blur-[120px]"/>

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
                             <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>  
                          </svg>
                        </span>
                        <span className="text-xl font-semibold tracking-tight">
                            HealthLink Kenya
                        </span>
                    </div>

                    <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
                        Join{" "}
                        <span className="bg-linear-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
                            HealthLink
                        </span>{" "}
                        today.
                    </h1>

                    <p className="max-w-sm text-base leading-relaxed text-white/60">
                    Create your account to book verfied doctors, manage your
                    appointments, and stay on top of your health across Kenya.
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

                <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/7 p-8 shadow-2xl backdrop-blur-2xl">
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
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                            </svg>
                        </span>
                        <span className="font-semibold text-white">HealthLink</span>
                    </div>

                    {success ? (
                        <div className="flex flex-col items-center py-6 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/40 animate-[scaleIn_0.4s_ease-out]">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-8 w-8 text-emerald-400"
                                >
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </div>
                            <h2 className="mt-4 text-xl font-semibold text-white">
                                Account created!
                            </h2>
                            <p className="mt-1 text-sm text-white/50">
                                Redirecting you to login&hellip;
                            </p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold text-white">
                                Create your account
                            </h2>
                            <p className="mt-1 text-sm text-white/50">
                                Get started with HealthLink Kenya
                            </p>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                {error && (
                                    <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
                                        {error}
                                    </p>
                                )}

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-white/70">
                                        Full Name
                                    </label>
                                    <input 
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-400/20"
                                   />
                                </div>

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
                                        Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-400/20"
                                    />
                                </div>

                                <div>
                                     <label className="mb-1.5 block text-sm font-medium text-white/70">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onBlur={() => setPasswordTouched(true)}
                                            required
                                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 pr-10 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-400/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-4.5 w-4.5"
                                                >
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                    <path d="M1 1l22 22" />
                                                </svg>
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-4.5 w-4.5"
                                                >
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {password.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-1 flex-1 gap-1 overflow-hidden rounded-full bg-white/10">
                                                    {[0, 1, 2, 3, 4].map((i) => (
                                                        <div
                                                            key={i}
                                                            className={`h-full flex-1 rounded-full transition-colors ${
                                                                i < passwordScore ? strengthColor : "bg-transparent"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-medium text-white/50">
                                                    {strengthLabel}
                                                </span>
                                            </div>

                                            <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                                <li
                                                    className={`flex items-center gap-1.5 ${
                                                        passwordChecks.length ? "text-emerald-400" : "text-white/40"
                                                    }`}
                                                >
                                                    <span>{passwordChecks.length ? "✓" : "•"}</span>
                                                    8+ characters
                                                </li>
                                                <li
                                                    className={`flex items-center gap-1.5 ${
                                                        passwordChecks.upper ? "text-emerald-400" : "text-white/40"
                                                    }`}
                                                >
                                                    <span>{passwordChecks.upper ? "✓" : "•"}</span>
                                                    Uppercase letter
                                                </li>
                                                <li
                                                    className={`flex items-center gap-1.5 ${
                                                        passwordChecks.number ? "text-emerald-400" : "text-white/40"
                                                    }`}
                                                >
                                                    <span>{passwordChecks.number ? "✓" : "•"}</span>
                                                    A number
                                                </li>
                                                <li
                                                    className={`flex items-center gap-1.5 ${
                                                        passwordChecks.special ? "text-emerald-400" : "text-white/40"
                                                    }`}
                                                >
                                                    <span>{passwordChecks.special ? "✓" : "•"}</span>
                                                    Symbol (optional)
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                    {passwordTouched && password.length > 0 && !isPasswordValid && (
                                        <p className="mt-1.5 text-xs text-red-300">
                                            Password needs at least 8 characters, an uppercase letter, and a number.
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-lg bg-linear-to-r from-emerald-500 to-teal-400 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 disabled:opacity-50"
                                >
                                    {loading ? "Creating account..." : "Create Account"}
                                </button>

                                <p className="pt-1 text-center text-sm text-white/50">
                                    Already have an account?{" "}
                                    <Link
                                        href="/login"
                                        className="font-medium text-emerald-300 hover:text-emerald-200"
                                    >
                                        Log in
                                    </Link>
                                </p>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </main>          
    );
}