"use client";

import { useState, useEffect } from "react";
import { useAuthGuard, DashboardSkeleton } from "@/components/DashboardShell";
import DashboardShell from "@/components/DashboardShell";
import { useUser } from "@/lib/useUser";
import { usePaymentHistory } from "@/lib/usePayment";

export default function ProfilePage() {
    const auth = useAuthGuard("PATIENT");

    if (!auth) {
        return <DashboardSkeleton />;
    }

    return <ProfileContent auth={auth} />;
}

function ProfileContent({ auth }: { auth: { email: string; role: string } }) {
    const { user, loading, error, updateProfile } = useUser(auth.email);
    const { payments, loading: paymentsLoading } = usePaymentHistory(auth.email);

    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing form fields when user data loads/changes is an intentional one-time sync
            setFullName(user.fullName || "");
            setPhone(user.phone || "");
            setProfileImage(user.profileImage || "");
        }
    }, [user]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaveError("");
        setSaving(true);
        try {
            await updateProfile({ fullName: fullName.trim(), phone: phone.trim(), profileImage: profileImage.trim() });
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setSaveError("Couldn't save your changes. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    function handleCancelEdit() {
        if (user) {
            setFullName(user.fullName || "");
            setPhone(user.phone || "");
            setProfileImage(user.profileImage || "");
        }
        setSaveError("");
        setEditing(false);
    }

    const initial = (user?.fullName || auth.email).charAt(0).toUpperCase();

    return (
        <DashboardShell auth={auth} title="My Profile">
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
                <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
                <p className="mt-1 text-sm text-gray-500">Manage your personal information.</p>
            </div>

            {loading && (
                <div className="mt-6 h-64 animate-pulse rounded-2xl bg-gray-100" />
            )}

            {!loading && error && (
                <p className="fade-in-up mt-6 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</p>
            )}

            {!loading && !error && user && (
                <div className="fade-in-up mt-6 max-w-2xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm" style={{ animationDelay: "80ms" }}>
                    <div className="relative bg-linear-to-br from-emerald-950 via-teal-900 to-emerald-800 px-6 py-8">
                        <div className="flex items-center gap-4">
                            {profileImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={profileImage}
                                    alt={user.fullName}
                                    className="h-16 w-16 rounded-full border-2 border-white/30 object-cover"
                                />
                            ) : (
                                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-xl font-semibold text-white">
                                    {initial}
                                </span>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-white">{user.fullName || "—"}</h3>
                                <p className="text-sm text-emerald-200">{user.email}</p>
                                <span className="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-200">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {saved && (
                            <p className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
                                Profile updated successfully.
                            </p>
                        )}
                        {saveError && (
                            <p className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                                {saveError}
                            </p>
                        )}

                        {!editing ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Full Name
                                    </p>
                                    <p className="mt-1 text-sm text-gray-900">{user.fullName || "Not set"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Email
                                    </p>
                                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Phone
                                    </p>
                                    <p className="mt-1 text-sm text-gray-900">{user.phone || "Not set"}</p>
                                </div>

                                <button
                                    onClick={() => setEditing(true)}
                                    className="mt-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Email can&apos;t be changed here.</p>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="e.g. 0712 345 678"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Profile Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={profileImage}
                                        onChange={(e) => setProfileImage(e.target.value)}
                                        placeholder="https://…"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {saving ? "Saving…" : "Save Changes"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {!loading && !error && user && (
                <div
                    className="fade-in-up mt-6 max-w-2xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                    style={{ animationDelay: "140ms" }}
                >
                    <div className="border-b border-gray-100 px-6 py-4">
                        <h3 className="text-sm font-semibold text-gray-900">Payment History</h3>
                        <p className="mt-0.5 text-xs text-gray-500">Your M-Pesa transactions on HealthLink.</p>
                    </div>

                    <div className="p-6">
                        {paymentsLoading && (
                            <div className="space-y-2">
                                {[0, 1].map((i) => (
                                    <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
                                ))}
                            </div>
                        )}

                        {!paymentsLoading && payments.length === 0 && (
                            <p className="text-sm text-gray-500">No payments yet.</p>
                        )}

                        {!paymentsLoading && payments.length > 0 && (
                            <div className="space-y-2">
                                {payments.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-gray-900">
                                                {p.doctorName}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {new Date(p.createdAt).toLocaleDateString("en-GB", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                                {p.mpesaReceiptNumber && (
                                                    <span className="font-mono"> · {p.mpesaReceiptNumber}</span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-semibold text-gray-900">
                                                KSh {p.amount.toLocaleString()}
                                            </p>
                                            <span
                                                className={`text-[11px] font-medium ${
                                                    p.status === "SUCCESS"
                                                        ? "text-emerald-600"
                                                        : p.status === "PENDING"
                                                          ? "text-amber-600"
                                                          : "text-red-600"
                                                }`}
                                            >
                                                {p.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </DashboardShell>
    );
}