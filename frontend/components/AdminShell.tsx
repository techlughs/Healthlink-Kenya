"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { HomeIcon } from "@/components/DashboardShell";
import { performLogout } from "@/lib/api";

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

const BarChartIcon = (p: { className?: string }) => (
    <IconBase className={p.className}>
        <path d="M3 3v18h18" />
        <rect x="7" y="12" width="3" height="6" />
        <rect x="12" y="8" width="3" height="10" />
        <rect x="17" y="5" width="3" height="13" />
    </IconBase>
);

const BookIcon = (p: { className?: string }) => (
    <IconBase className={p.className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </IconBase>
);

const ADMIN_NAV = [
    { label: "Add Doctor", href: "/admin/dashboard", icon: HomeIcon },
    { label: "Articles", href: "/admin/articles", icon: BookIcon },
    { label: "Analytics", href: "/admin/analytics", icon: BarChartIcon },
];

interface AdminShellProps {
    email: string;
    title: string;
    children: ReactNode;
}

export default function AdminShell({ email, title, children }: AdminShellProps) {
    const pathname = usePathname();

    async function handleLogout() {
        await performLogout();
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-emerald-900/40 bg-linear-to-br from-emerald-950 via-teal-900 to-emerald-800 lg:static">
                <div className="flex items-center gap-2.5 px-5 py-5">
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

                <div className="mx-3 mb-2 rounded-lg bg-white/5 px-3 py-1.5">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-300">
                        Admin Portal
                    </p>
                </div>

                <nav className="flex-1 space-y-1 px-3">
                    {ADMIN_NAV.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
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
                            {email.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">Admin</p>
                            <p className="truncate text-xs text-teal-200">{email}</p>
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
                <header className="flex items-center gap-4 border-b bg-white px-5 py-3.5 lg:px-8">
                    <h1 className={`${display.className} text-base font-semibold text-gray-900`}>
                        {title}
                    </h1>
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