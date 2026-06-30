"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

import { useGetCurrentUserQuery, useUpdateProfileMutation } from "@/lib/redux/silces/AuthSlice";

function Toggle({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (value: boolean) => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-slate-900" : "bg-slate-200"}`}
        >
            <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
            />
        </button>
    );
}

function Card({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

export default function AccountSettingsPage({
    heading,
    description,
}: {
    heading: string;
    description: string;
}) {
    const { data: me, isLoading, refetch } = useGetCurrentUserQuery(undefined);
    const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({
        username: "",
        email_notifications: true,
        in_app_notifications: true,
        auto_approve_high_confidence: false,
        two_factor_enabled: false,
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    useEffect(() => {
        if (!me) return;
        setForm((prev) => ({
            ...prev,
            username: me.username ?? "",
            email_notifications: Boolean(me.email_notifications ?? true),
            in_app_notifications: Boolean(me.in_app_notifications ?? true),
            auto_approve_high_confidence: Boolean(me.auto_approve_high_confidence ?? false),
            two_factor_enabled: Boolean(me.two_factor_enabled ?? false),
            current_password: "",
            new_password: "",
            confirm_password: "",
        }));
    }, [me]);

    const save = async () => {
        setMessage(null);
        if (form.new_password && form.new_password !== form.confirm_password) {
            setMessage("New password and confirmation do not match.");
            return;
        }

        const payload = {
            username: form.username,
            email_notifications: form.email_notifications,
            in_app_notifications: form.in_app_notifications,
            auto_approve_high_confidence: form.auto_approve_high_confidence,
            two_factor_enabled: form.two_factor_enabled,
            current_password: form.current_password || undefined,
            new_password: form.new_password || undefined,
        };

        try {
            await updateProfile(payload).unwrap();
            setMessage("Settings saved.");
            refetch();
        } catch (err) {
            const payloadErr = err as { data?: { error?: string } };
            setMessage(payloadErr.data?.error ?? "Failed to save settings.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 px-6 py-10">
                <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 text-slate-500 shadow-sm">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading settings...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">{heading}</h1>
                        <p className="mt-1 text-sm text-slate-500">{description}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        Live backend settings
                    </div>
                </div>

                {message && (
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
                        {message}
                    </div>
                )}

                <Card
                    title="Account Preferences"
                    description="These settings are stored on the authenticated user record."
                >
                    <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-900">Username</span>
                        <input
                            value={form.username}
                            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white"
                        />
                    </label>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Email notifications</p>
                            <p className="text-sm text-slate-500">Receive alerts from the pipeline.</p>
                        </div>
                        <Toggle checked={form.email_notifications} onChange={(v) => setForm((p) => ({ ...p, email_notifications: v }))} label="email notifications" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">In-app notifications</p>
                            <p className="text-sm text-slate-500">Show notifications inside the dashboard.</p>
                        </div>
                        <Toggle checked={form.in_app_notifications} onChange={(v) => setForm((p) => ({ ...p, in_app_notifications: v }))} label="in-app notifications" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Auto-approve high-confidence replies</p>
                            <p className="text-sm text-slate-500">Persist workflow preferences per account.</p>
                        </div>
                        <Toggle checked={form.auto_approve_high_confidence} onChange={(v) => setForm((p) => ({ ...p, auto_approve_high_confidence: v }))} label="auto-approve high-confidence replies" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Two-factor authentication</p>
                            <p className="text-sm text-slate-500">Track account security preference.</p>
                        </div>
                        <Toggle checked={form.two_factor_enabled} onChange={(v) => setForm((p) => ({ ...p, two_factor_enabled: v }))} label="two-factor authentication" />
                    </div>
                </Card>

                <Card title="Password" description="Change your account password using the backend auth API.">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-2">
                            <span className="text-sm font-semibold text-slate-900">Current password</span>
                            <input
                                type="password"
                                value={form.current_password}
                                onChange={(e) => setForm((prev) => ({ ...prev, current_password: e.target.value }))}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white"
                            />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-semibold text-slate-900">New password</span>
                            <input
                                type="password"
                                value={form.new_password}
                                onChange={(e) => setForm((prev) => ({ ...prev, new_password: e.target.value }))}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white"
                            />
                        </label>
                    </div>
                    <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-900">Confirm new password</span>
                        <input
                            type="password"
                            value={form.confirm_password}
                            onChange={(e) => setForm((prev) => ({ ...prev, confirm_password: e.target.value }))}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white"
                        />
                    </label>
                </Card>

                <div className="flex justify-end">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={save}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Save settings
                    </button>
                </div>
            </div>
        </div>
    );
}
