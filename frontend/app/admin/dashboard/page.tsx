"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useStoredRole } from "@/lib/useStoredRole";
import AdminShell from "@/components/AdminShell";

export default function AdminDashboardPage() {
    const router = useRouter();
    const role = useStoredRole();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [temporaryPassword, setTemporaryPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [location, setLocation] = useState("");
    const [hospital, setHospital] = useState("");
    const [bio, setBio] = useState("");
    const [consultationFee, setConsultationFee] = useState("");
    const [availableDays, setAvailableDays] = useState("");
    const [availableTimes, setAvailableTimes] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (role !== null && role !== "ADMIN") {
            router.push("/admin/login");
        }
    }, [role, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSubmitting(true);

        try {
            await api.post("/admin/doctors", {
                fullName,
                email,
                temporaryPassword,
                phone,
                specialty,
                location,
                hospital,
                bio,
                consultationFee: Number(consultationFee) || 0,
                availableDays: availableDays
                    .split(",")
                    .map((d) => d.trim())
                    .filter(Boolean),
                availableTimes: availableTimes
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
            });

            setSuccess(`Doctor account created for ${fullName}.`);
            setFullName("");
            setEmail("");
            setTemporaryPassword("");
            setPhone("");
            setSpecialty("");
            setLocation("");
            setHospital("");
            setBio("");
            setConsultationFee("");
            setAvailableDays("");
            setAvailableTimes("");
        } catch {
            setError("Couldn't create the doctor account. Check the fields and try again.");
        } finally {
            setSubmitting(false);
        }
    }

    if (role !== "ADMIN") {
        return null;
    }

    return (
        <AdminShell email="admin@healthlink.test" title="Add a Doctor">
            <h2 className="text-xl font-semibold text-gray-900">Add a Doctor</h2>
            <p className="mt-1 text-sm text-gray-500">
                Creates a DOCTOR-role account and doctor listing together.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                {error && (
                    <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</p>
                )}
                {success && (
                    <p className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" value={fullName} onChange={setFullName} required />
                    <Field label="Email" type="email" value={email} onChange={setEmail} required />
                    <Field label="Temporary password" type="password" value={temporaryPassword} onChange={setTemporaryPassword} required />
                    <Field label="Phone" value={phone} onChange={setPhone} />
                    <Field label="Specialty" value={specialty} onChange={setSpecialty} required />
                    <Field label="Location" value={location} onChange={setLocation} required />
                    <Field label="Hospital" value={hospital} onChange={setHospital} required />
                    <Field label="Consultation fee (KSh)" type="number" value={consultationFee} onChange={setConsultationFee} />
                    <Field label="Available days (comma separated)" value={availableDays} onChange={setAvailableDays} placeholder="Monday, Wednesday, Friday" />
                    <Field label="Available times (comma separated)" value={availableTimes} onChange={setAvailableTimes} placeholder="09:00, 11:00, 14:00" />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                    {submitting ? "Creating..." : "Create Doctor Account"}
                </button>
            </form>
        </AdminShell>
    );
}

function Field({
    label,
    value,
    onChange,
    type = "text",
    required = false,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    required?: boolean;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                placeholder={placeholder}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
        </div>
    );
}