"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"] });

interface AuthInfo {
    email: string;
    role: string;
}

function IconBase({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {children}
        </svg>
    );
}

const HomeIcon = (p: { className?: string }) => (
    <IconBase className={p.className}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </IconBase>
);
const SearchIcon = (p: { className?: string }) => (
    <IconBase className={p.className}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </IconBase>
);
const CalendarIcon = (p: { className?: string }) => (
    <IconBase className={p.className}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
    </IconBase>
);
const UserIcon = (p: { className?: string }) => (
    <IconBase className={p.className}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </IconBase>
);
const BellIcon = (p: { className?: string }) => (
    <IconBase className={p.className}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </IconBase>
);
const MenuIcon = (p: { className?: string }) => (
    <IconBase className={p.className}>
        <path d="M3 6h18M3 12h18M3 18h18" />
    </IconBase>
);
const XIcon = (p: { className?: string }) => (
    <IconBase className={p.className}>
        <path d="M18 6 6 18M6 6l12 12" />
    </IconBase>
);

const PATIENT_NAV = [
    { label: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { label: "Find a Doctor", href: "/doctors", icon: SearchIcon },
    { label: "My Appointments", href: "/appointments", icon: CalendarIcon },
    { label: "My Profile", href: "/profile", icon: UserIcon },
];

export function useAuthGuard(): AuthInfo | null {
    const router = useRouter();
    const [auth, setAuth] = useState<AuthInfo | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect -- reading auth from localStorage on mount is a valid one-time sync
        setAuth({
            email: localStorage.getItem("email") || "",
            role: localStorage.getItem("role") || "",
        });
    }, [router]);

    return auth;
}

export function DashboardSkeleton() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="hidden w-64 flex-col border-r bg-white p-4 lg:flex">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-200" />
                <div className="mt-8 space-y-2">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-9 animate-pulse rounded-lg bg-gray-100" />
                    ))}
                </div>
            </div>
            <div className="flex-1 p-6">
                <div className="h-44 w-full animate-pulse rounded-2xl bg-gray-200" />
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
                    ))}
                </div>
            </div>
        </div>
    );
}

interface DashboardShellProps {
    auth: AuthInfo;
    title: string;
    searchPlaceholder?: string;
    onSearchChange?: (value: string) => void;
    children: ReactNode;
}

export default function DashboardShell({
    auth,
    title,
    searchPlaceholder = "Search doctors, appointments…",
    onSearchChange,
    children,
}: DashboardShellProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        router.push("/login");
    }

    const firstName = auth.email.split("@")[0];
    const initial = firstName.charAt(0).toUpperCase();

    return (
        <div className="flex min-h-screen bg-gray-50">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-emerald-900/40 bg-linear-to-br from-emerald-950 via-teal-900 to-emerald-800 transition-transform duration-200 lg:static lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 py-5">
                    <div className="flex items-center gap-2.5">
                        <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400">
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
                        <span className={`${display.className} text-[15px] font-semibold text-white`}>
                            HealthLink
                        </span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-md p-1 text-teal-200 hover:bg-teal-800 lg:hidden"
                        aria-label="Close menu"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 px-3">
                    {PATIENT_NAV.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition ${
                                    active
                                        ? "border-l-emerald-400 bg-white/10 text-white"
                                        : "border-l-transparent text-teal-100 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-teal-800 p-3">
                    <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                            {initial}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium capitalize text-white">{firstName}</p>
                            <p className="truncate text-xs text-teal-200">{auth.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-teal-200 transition hover:bg-teal-800/60 hover:text-white"
                    >
                        Log Out
                    </button>
                </div>
            </aside>

            <div className="flex min-h-screen flex-1 flex-col">
                <header className="flex items-center justify-between gap-4 border-b bg-white px-5 py-3.5 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-50 lg:hidden"
                            aria-label="Open menu"
                        >
                            <MenuIcon className="h-5 w-5" />
                        </button>
                        <h1 className={`${display.className} hidden text-base font-semibold text-gray-900 sm:block`}>
                            {title}
                        </h1>
                    </div>

                    <div className="flex flex-1 items-center justify-end gap-3">
                        <label className="relative hidden max-w-xs flex-1 sm:block">
                            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </label>
                        <button
                            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-50"
                            aria-label="Notifications"
                        >
                            <BellIcon className="h-5 w-5" />
                            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </button>
                    </div>
                </header>

                <main
                    className="flex-1 px-5 py-6 lg:px-8 lg:py-8"
                    style={{
                        backgroundImage: "radial-gradient(circle, #0000000a 1px, transparent 1px)",
                        backgroundSize: "22px 22px",
                    }}
                >
                    <div className="mx-auto max-w-5xl">{children}</div>
                </main>
            </div>
        </div>
    );
}