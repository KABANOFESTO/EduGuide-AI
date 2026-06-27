"use client";

import { useState, FormEvent, useEffect } from "react";

/* ---------- Types ---------- */

interface Profile {
    fullName: string;
    email: string;
    department: string;
    role: string;
    status: "Active" | "Inactive";
    lastLogin: string;
}

/* ---------- InfoField ---------- */

interface InfoFieldProps {
    label: string;
    value: string;
}

function InfoField({ label, value }: InfoFieldProps) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
        </div>
    );
}

/* ---------- EditProfileModal ---------- */

interface EditProfileModalProps {
    profile: Profile;
    onClose: () => void;
    onSave: (updated: Profile) => void;
}

function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
    const [form, setForm] = useState<Profile>(profile);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Edit Profile</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-900">
                            Full name
                        </label>
                        <input
                            value={form.fullName}
                            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-900">
                            Email address
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-900">
                            Department
                        </label>
                        <input
                            value={form.department}
                            onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-900">
                            System role
                        </label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        >
                            <option>System Administrator</option>
                            <option>Registrar</option>
                            <option>Staff</option>
                            <option>Viewer</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-full bg-indigo-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
                        >
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ---------- Page ---------- */

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile>({
        fullName: "Inezaghis54",
        email: "inezaghis54@gmail.com",
        department: "Registrar's Office",
        role: "System Administrator",
        status: "Active",
        lastLogin: "Today, 08:42 AM",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [savedToast, setSavedToast] = useState(false);

    const initial = profile.fullName.charAt(0).toUpperCase();

    const handleSave = (updated: Profile) => {
        setProfile(updated);
        setIsEditing(false);
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
    };

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto flex max-w-xl flex-col gap-6">
                {/* Profile header card */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-28 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-500" />
                    <div className="px-6 pb-6">
                        <div className="-mt-10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-indigo-700 to-violet-500 text-2xl font-semibold text-white shadow-sm">
                            {initial}
                        </div>

                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">{profile.fullName}</h1>
                                <p className="text-sm text-slate-500">{profile.email}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="rounded-full bg-indigo-700 px-3 py-1 text-xs font-semibold text-white">
                                        {profile.role}
                                    </span>
                                    <span className="text-sm text-slate-400">· {profile.department}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="shrink-0 rounded-full border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Account information card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-900">Account Information</h2>

                    <div className="mt-5 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                        <InfoField label="Full name" value={profile.fullName} />
                        <InfoField label="Email address" value={profile.email} />
                        <InfoField label="Department" value={profile.department} />
                        <InfoField label="System role" value={profile.role} />
                        <InfoField label="Account status" value={profile.status} />
                        <InfoField label="Last login" value={profile.lastLogin} />
                    </div>
                </div>
            </div>

            {isEditing && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setIsEditing(false)}
                    onSave={handleSave}
                />
            )}

            {savedToast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
                    Profile updated
                </div>
            )}
        </div>
    );
}