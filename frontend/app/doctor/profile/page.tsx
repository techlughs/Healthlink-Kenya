"use client";

import { useState, useEffect } from "react";
import { useAuthGuard, DashboardSkeleton } from "@/components/DashboardShell";
import DoctorShell from "@/components/DoctorShell";
import { useDoctorProfile } from "@/lib/Usedoctorprofile";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ALL_TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <svg
                    key={n}
                    viewBox="0 0 20 20"
                    className={`h-4 w-4 ${n <= Math.round(rating) ? "fill-amber-400" : "fill-gray-200"}`}
                >
                    <path d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.8l-5.2 2.7 1-5.8L1.6 7.6l5.8-.8L10 1.5z" />
                </svg>
            ))}
        </div>
    );
}

export default function DoctorProfilePage() {
    const auth = useAuthGuard("DOCTOR");

    if (!auth) {
        return <DashboardSkeleton />;
    }

    return <DoctorProfileContent auth={auth} />;
}

function DoctorProfileContent({ auth }: { auth: { email: string; role: string } }) {
    const { doctor, loading, error, updateProfile } = useDoctorProfile(auth.email);

    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [hospital, setHospital] = useState("");
    const [location, setLocation] = useState("");
    const [bio, setBio] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [consultationFee, setConsultationFee] = useState("");
    const [availableDays, setAvailableDays] = useState<string[]>([]);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (doctor) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing form fields when doctor data loads/changes is an intentional one-time sync
            setFullName(doctor.fullName || "");
            setPhone(doctor.phone || "");
            setSpecialty(doctor.specialty || "");
            setHospital(doctor.hospital || "");
            setLocation(doctor.location || "");
            setBio(doctor.bio || "");
            setProfileImage(doctor.profileImage || "");
            setConsultationFee(String(doctor.consultationFee ?? ""));
            setAvailableDays(doctor.availableDays || []);
            setAvailableTimes(doctor.availableTimes || []);
        }
    }, [doctor]);

    function toggleDay(day: string) {
        setAvailableDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
    }

    function toggleTime(time: string) {
        setAvailableTimes((prev) => (prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]));
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaveError("");
        setSaving(true);
        try {
            await updateProfile({
                fullName: fullName.trim(),
                phone: phone.trim(),
                specialty: specialty.trim(),
                hospital: hospital.trim(),
                location: location.trim(),
                bio: bio.trim(),
                profileImage: profileImage.trim(),
                consultationFee: Number(consultationFee) || 0,
                availableDays,
                availableTimes,
            });
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
        if (doctor) {
            setFullName(doctor.fullName || "");
            setPhone(doctor.phone || "");
            setSpecialty(doctor.specialty || "");
            setHospital(doctor.hospital || "");
            setLocation(doctor.location || "");
            setBio(doctor.bio || "");
            setProfileImage(doctor.profileImage || "");
            setConsultationFee(String(doctor.consultationFee ?? ""));
            setAvailableDays(doctor.availableDays || []);
            setAvailableTimes(doctor.availableTimes || []);
        }
        setSaveError("");
        setEditing(false);
    }

    if (loading) {
        return <DashboardSkeleton />;
    }

    const initial = (doctor?.fullName || auth.email).replace(/^Dr\.?\s*/i, "").charAt(0).toUpperCase();

    return (
        <DoctorShell auth={auth} title="My Profile">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in-up {
                    animation: fadeInUp 0.5s ease-out both;
                }
                @media (prefers-reduced-motion: reduce) {
                    .fade-in-up { animation: none; }
                }
            `}</style>

            <div className="fade-in-up" style={{ animationDelay: "0ms" }}>
                <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
                <p className="mt-1 text-sm text-gray-500">Manage how patients see you on HealthLink.</p>
            </div>

            {error && (
                <p className="fade-in-up mt-6 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </p>
            )}

            {!error && doctor && (
                <>
                    <div
                        className="fade-in-up mt-6 grid gap-4 sm:grid-cols-2"
                        style={{ animationDelay: "60ms" }}
                    >
                        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">Rating</p>
                            <div className="mt-1.5 flex items-center gap-2">
                                <StarRating rating={doctor.rating} />
                                <span className="text-sm font-semibold text-gray-900">
                                    {doctor.rating.toFixed(1)}
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Based on patient reviews</p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">Total Reviews</p>
                            <p className="mt-1 text-3xl font-semibold text-gray-900">{doctor.totalReviews}</p>
                            <p className="mt-2 text-xs text-gray-400">From your patients</p>
                        </div>
                    </div>

                    <div
                        className="fade-in-up mt-6 max-w-2xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                        style={{ animationDelay: "120ms" }}
                    >
                        <div className="relative bg-linear-to-br from-emerald-950 via-teal-900 to-emerald-800 px-6 py-8">
                            <div className="flex items-center gap-4">
                                {profileImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={profileImage}
                                        alt={doctor.fullName}
                                        className="h-16 w-16 rounded-full border-2 border-white/30 object-cover"
                                    />
                                ) : (
                                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-xl font-semibold text-white">
                                        {initial}
                                    </span>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{doctor.fullName}</h3>
                                    <p className="text-sm text-emerald-200">
                                        {doctor.specialty} · {doctor.hospital}
                                    </p>
                                    <span className="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-200">
                                        Doctor
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
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Phone
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900">{doctor.phone || "Not set"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Consultation Fee
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900">
                                                KSh {doctor.consultationFee.toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Specialty
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900">{doctor.specialty || "Not set"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Location
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900">{doctor.location || "Not set"}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Hospital
                                        </p>
                                        <p className="mt-1 text-sm text-gray-900">{doctor.hospital || "Not set"}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Bio
                                        </p>
                                        <p className="mt-1 text-sm text-gray-900">{doctor.bio || "Not set"}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Available Days
                                        </p>
                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {doctor.availableDays?.length ? (
                                                doctor.availableDays.map((d) => (
                                                    <span
                                                        key={d}
                                                        className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                                                    >
                                                        {d}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">Not set</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Available Times
                                        </p>
                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {doctor.availableTimes?.length ? (
                                                doctor.availableTimes.map((t) => (
                                                    <span
                                                        key={t}
                                                        className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700"
                                                    >
                                                        {t}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">Not set</p>
                                            )}
                                        </div>
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
                                    <div className="grid gap-4 sm:grid-cols-2">
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
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Specialty
                                            </label>
                                            <input
                                                type="text"
                                                value={specialty}
                                                onChange={(e) => setSpecialty(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Consultation Fee (KSh)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={consultationFee}
                                                onChange={(e) => setConsultationFee(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Hospital
                                            </label>
                                            <input
                                                type="text"
                                                value={hospital}
                                                onChange={(e) => setHospital(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Bio</label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            rows={3}
                                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Available Days
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {ALL_DAYS.map((day) => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleDay(day)}
                                                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                                        availableDays.includes(day)
                                                            ? "bg-emerald-600 text-white"
                                                            : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Available Times
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {ALL_TIMES.map((time) => (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    onClick={() => toggleTime(time)}
                                                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                                        availableTimes.includes(time)
                                                            ? "bg-teal-600 text-white"
                                                            : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
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
                </>
            )}
        </DoctorShell>
    );
}
