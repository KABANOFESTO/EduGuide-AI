"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, ShieldCheck, Upload } from "lucide-react";

import { useGetCurrentUserQuery, useUpdateProfileMutation } from "@/lib/redux/silces/AuthSlice";

type CurrentUser = {
    id: number;
    username: string;
    email: string;
    role: string;
    profile_picture?: string | null;
    is_active: boolean;
};

function getImageUrl(path?: string | null) {
    if (!path) return "/profile.png";
    if (path.startsWith("http")) return path;
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
    return path.startsWith("/media/") ? `${base}${path}` : `${base}/${path.replace(/^\/+/, "")}`;
}

function Field({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
        </div>
    );
}

export default function LiveProfilePage({
    heading = "Profile",
    description = "Manage your account using the live auth backend.",
}: {
    heading?: string;
    description?: string;
}) {
    const { data: currentUser, isLoading, refetch } = useGetCurrentUserQuery(undefined);
    const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [form, setForm] = useState({
        username: "",
        current_password: "",
        new_password: "",
        confirm_password: "",
        profile_picture: null as File | null,
    });

    useEffect(() => {
        if (!currentUser) return;
        setForm((prev) => ({
            ...prev,
            username: currentUser.username,
            current_password: "",
            new_password: "",
            confirm_password: "",
            profile_picture: null,
        }));
        setPreview(null);
    }, [currentUser]);

    const initial = useMemo(() => {
        return (currentUser?.username?.charAt(0) ?? "U").toUpperCase();
    }, [currentUser]);

    const startEdit = () => {
        setMessage(null);
        setEditing(true);
    };

    const handleFile = (file?: File | null) => {
        setForm((prev) => ({ ...prev, profile_picture: file ?? null }));
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSave = async () => {
        setMessage(null);

        if (form.new_password && form.new_password !== form.confirm_password) {
            setMessage("New password and confirmation do not match.");
            return;
        }

        const body = new FormData();
        body.append("username", form.username);
        if (form.current_password) body.append("current_password", form.current_password);
        if (form.new_password) body.append("new_password", form.new_password);
        if (form.profile_picture) body.append("profile_picture", form.profile_picture);

        try {
            await updateProfile(body).unwrap();
            setMessage("Profile updated successfully.");
            setEditing(false);
            refetch();
        } catch (err) {
            const payload = err as { data?: { error?: string } };
            setMessage(payload.data?.error ?? "Unable to update profile.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 px-6 py-10">
                <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 text-slate-500 shadow-sm">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading profile...
                </div>
            </div>
        );
    }

    const user = currentUser as CurrentUser | undefined;

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">{heading}</h1>
                        <p className="mt-1 text-sm text-slate-500">{description}</p>
                    </div>
                    <button
                        type="button"
                        onClick={startEdit}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Pencil size={15} />
                        Edit profile
                    </button>
                </div>

                {message && (
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
                        {message}
                    </div>
                )}

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-32 bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-700" />
                    <div className="px-6 pb-6">
                        <div className="-mt-10 flex items-end justify-between gap-4">
                            <div className="flex items-end gap-4">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-slate-900 text-3xl font-bold text-white shadow-lg">
                                    {preview ? (
                                        <img src={preview} alt={user?.username ?? "Profile image"} className="h-full w-full object-cover" />
                                    ) : user?.profile_picture ? (
                                        <Image
                                            src={getImageUrl(user.profile_picture)}
                                            alt={user?.username ?? "Profile image"}
                                            width={80}
                                            height={80}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        initial
                                    )}
                                </div>
                                <div className="pb-1">
                                    <h2 className="text-xl font-bold text-slate-900">{user?.username}</h2>
                                    <p className="text-sm text-slate-500">{user?.email}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                                            {user?.role ?? "User"}
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user?.is_active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                            {user?.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ShieldCheck className="hidden text-emerald-600 lg:block" size={24} />
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <Field label="Username" value={user?.username ?? "-"} />
                            <Field label="Email" value={user?.email ?? "-"} />
                            <Field label="Role" value={user?.role ?? "-"} />
                            <Field label="Account status" value={user?.is_active ? "Active" : "Inactive"} />
                        </div>
                    </div>
                </section>
            </div>

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Edit Profile</h3>
                                <p className="text-sm text-slate-500">Update your name, picture, or password.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-6 grid gap-4">
                            <label className="space-y-1.5">
                                <span className="block text-xs font-semibold uppercase tracking-widest text-slate-500">Username</span>
                                <input
                                    value={form.username}
                                    onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                                />
                            </label>

                            <label className="space-y-1.5">
                                <span className="block text-xs font-semibold uppercase tracking-widest text-slate-500">Profile picture</span>
                                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                                    <Upload size={16} className="text-slate-400" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                                        className="w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white"
                                    />
                                </div>
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="space-y-1.5">
                                    <span className="block text-xs font-semibold uppercase tracking-widest text-slate-500">Current password</span>
                                    <input
                                        type="password"
                                        value={form.current_password}
                                        onChange={(e) => setForm((prev) => ({ ...prev, current_password: e.target.value }))}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                                    />
                                </label>
                                <label className="space-y-1.5">
                                    <span className="block text-xs font-semibold uppercase tracking-widest text-slate-500">New password</span>
                                    <input
                                        type="password"
                                        value={form.new_password}
                                        onChange={(e) => setForm((prev) => ({ ...prev, new_password: e.target.value }))}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                                    />
                                </label>
                            </div>
                            <label className="space-y-1.5">
                                <span className="block text-xs font-semibold uppercase tracking-widest text-slate-500">Confirm new password</span>
                                <input
                                    type="password"
                                    value={form.confirm_password}
                                    onChange={(e) => setForm((prev) => ({ ...prev, confirm_password: e.target.value }))}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={handleSave}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                Save changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
