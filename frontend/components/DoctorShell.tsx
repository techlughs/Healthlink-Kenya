"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { HomeIcon, CalendarIcon, UserIcon } from "@/components/DashboardShell";
import type { AuthInfo } from "@/components/DashboardShell";
import { useDoctorProfile } from "@/lib/Usedoctorprofile";
import { performLogout } from "@/lib/api";
import { useNotifications, formatNotificationTime } from "@/lib/useNotifications";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"] });

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
const AlertTriangleIcon = (p: { className?: string }) => (
    <IconBase className={p.className}>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </IconBase>
);

const BarChartIcon = (p: { className?: string }) => (
    <IconBase className={p.className}>
        <path d="M3 3v18h18" />
        <rect x="7" y="12" width="3" height="6" />
        <rect x="12" y="8" width="3" height="10" />
        <rect x="17" y="5" width="3" height="13" />
    </IconBase>
);

const DOCTOR_NAV = [
    { label: "Dashboard", href: "/doctor/dashboard", icon: HomeIcon },
    { label: "My Appointments", href: "/doctor/appointments", icon: CalendarIcon },
    { label: "Analytics", href: "/doctor/analytics", icon: BarChartIcon },
    { label: "My Profile", href: "/doctor/profile", icon: UserIcon },
];

interface DoctorShellProps {
    auth: AuthInfo;
    title: string;
    children: ReactNode;
}

export default function DoctorShell({ auth, title, children }: DoctorShellProps) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { doctor, loading: doctorLoading, error: doctorError } = useDoctorProfile(auth.email);

    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    function toggleNotifications() {
        setNotifOpen((wasOpen) => {
            const willOpen = !wasOpen;
            if (willOpen && unreadCount > 0) {
                markAllAsRead();
            }
            return willOpen;
        });
    }

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function handleLogout() {
        await performLogout();
    }

    const firstName = doctor
        ? doctor.fullName.replace(/^Dr\.?\s*/i, "")
        : auth.email.split("@")[0];
    const initial = firstName.charAt(0).toUpperCase();
    const displayName = doctorLoading ? "Loading…" : doctor?.fullName || firstName;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <style>{`
                @keyframes popIn {
                    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .pop-in {
                    animation: popIn 0.15s ease-out both;
                }
                @media (prefers-reduced-motion: reduce) {
                    .pop-in { animation: none; }
                }
            `}</style>
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

                <div className="mx-3 mb-2 rounded-lg bg-white/5 px-3 py-1.5">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-300">
                        Doctor Portal
                    </p>
                </div>

                <nav className="flex-1 space-y-1 px-3">
                    {DOCTOR_NAV.map((item) => {
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
                            <p className="truncate text-sm font-medium text-white">
                                {displayName}
                            </p>
                            <p className="truncate text-xs text-teal-200">{auth.email}</p>
                        </div>
                    </div>
                    {doctorError && (
                        <p className="mt-1 flex items-center gap-1.5 px-2 text-xs text-amber-300">
                            <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0" />
                            {doctorError}
                        </p>
                    )}
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
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={toggleNotifications}
                                className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-50"
                                aria-label="Notifications"
                            >
                                <BellIcon className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold leading-none text-white">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="pop-in absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-lg">
                                    <div className="border-b border-gray-100 px-4 py-3">
                                        <p className="text-sm font-semibold text-gray-900">
                                            Notifications
                                        </p>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="px-4 py-6 text-center text-sm text-gray-400">
                                                No notifications yet
                                            </p>
                                        ) : (
                                            notifications.slice(0, 8).map((n) => (
                                                <button
                                                    key={n.id}
                                                    onClick={() => !n.read && markAsRead(n.id)}
                                                    className={`block w-full border-b border-gray-50 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50 ${
                                                        n.read ? "" : "bg-amber-50/40"
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        {!n.read && (
                                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-sm text-gray-900">{n.message}</p>
                                                            <p className="mt-0.5 text-xs text-gray-400">
                                                                {formatNotificationTime(n.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                    <Link
                                        href="/doctor/appointments"
                                        onClick={() => setNotifOpen(false)}
                                        className="block px-4 py-2.5 text-center text-xs font-medium text-emerald-600 hover:bg-gray-50"
                                    >
                                        View all appointments
                                    </Link>
                                </div>
                            )}
                        </div>
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