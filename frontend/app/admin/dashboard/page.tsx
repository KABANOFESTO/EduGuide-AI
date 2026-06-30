"use client";

import Link from "next/link";
import { AlertTriangle, Bot, CircleCheckBig, Mail, ShieldCheck, Users } from "lucide-react";

import { useGetAuditLogsQuery } from "@/lib/redux/silces/AuditLogSlice";
import { useGetAllUsersQuery } from "@/lib/redux/silces/AuthSlice";
import { useGetEmailDashboardQuery } from "@/lib/redux/silces/EmailSlice";
import { useGetBackendHealthQuery, useGetPipelineConfigQuery } from "@/lib/redux/silces/PipelineSlice";

function StatCard({
    label,
    value,
    sublabel,
    icon: Icon,
}: {
    label: string;
    value: string | number;
    sublabel: string;
    icon: React.ComponentType<{ size?: number }>;
}) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <Icon size={18} />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{label}</p>
            <p className="mt-1 text-xs text-slate-500">{sublabel}</p>
        </div>
    );
}

export default function AdminDashboard() {
    const { data: dashboard } = useGetEmailDashboardQuery(undefined);
    const { data: users = [] } = useGetAllUsersQuery(undefined);
    const { data: auditLogs = [] } = useGetAuditLogsQuery(undefined);
    const { data: pipeline } = useGetPipelineConfigQuery(undefined);
    const { data: health } = useGetBackendHealthQuery(undefined);

    const breakdown = dashboard?.status_breakdown ?? [];
    const reviewQueue = dashboard?.review_queue ?? 0;
    const replied = dashboard?.replied ?? 0;
    const pending = breakdown.find((item: { status?: string; total?: number }) => item.status === "PENDING")?.total ?? 0;
    const processed = breakdown.find((item: { status?: string; total?: number }) => item.status === "PROCESSED")?.total ?? 0;
    const stats = {
        users: users.length,
        emails: dashboard?.total_emails ?? 0,
        replyRate: dashboard?.total_emails ? `${Math.round((replied / dashboard.total_emails) * 100)}%` : "0%",
        pending,
        processed,
        reviewQueue,
    };

    const recentAlerts = auditLogs.slice(0, 5);

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-8 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Live operational view for the UoK email automation pipeline.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                        Dispatch mode: <span className="font-semibold text-slate-900">{pipeline?.email_dispatch_mode ?? "dry_run"}</span>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Registered Users" value={stats.users} sublabel="Live auth records" icon={Users} />
                    <StatCard label="Total Emails" value={stats.emails} sublabel="All pipeline intake" icon={Mail} />
                    <StatCard label="Review Queue" value={stats.reviewQueue} sublabel={`${stats.pending} pending / ${stats.processed} processed`} icon={AlertTriangle} />
                    <StatCard label="Reply Rate" value={stats.replyRate} sublabel="Closed-loop responses" icon={CircleCheckBig} />
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Pipeline Health</h2>
                                <p className="text-sm text-slate-500">Status sourced from the live backend.</p>
                            </div>
                            <ShieldCheck className="text-emerald-600" size={20} />
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Average confidence</p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {dashboard?.average_confidence ? (dashboard.average_confidence * 100).toFixed(1) : "0.0"}%
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Feedback rating</p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {dashboard?.average_feedback_rating ?? 0}/5
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Auto-replies</p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.processed + stats.reviewQueue}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Pipeline mode</p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">{pipeline?.enabled ? "Enabled" : "Paused"}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/admin/users" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                                Manage users
                            </Link>
                            <Link href="/admin/api-config" className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                Pipeline config
                            </Link>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                                <p className="text-sm text-slate-500">Latest audit entries from live logs.</p>
                            </div>
                            <Bot className="text-indigo-600" size={20} />
                        </div>

                        <div className="mt-5 space-y-3">
                            {recentAlerts.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                    No recent activity yet.
                                </div>
                            ) : (
                                recentAlerts.map((entry) => (
                                    <div key={entry.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                        <p className="text-sm font-semibold text-slate-900">{entry.action}</p>
                                        <p className="text-xs text-slate-500">
                                            {entry.user ?? entry.target_user ?? "System"} · {new Date(entry.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                <section className="grid gap-4 lg:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Mailbox intake</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {health?.inbound_mailbox_configured ? "Connected" : "Not connected"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            {health?.inbound_mailbox_configured
                                ? `Unread emails can be synced from ${health.inbound_mailbox_folder ?? "INBOX"}.`
                                : "Set IMAP credentials before live mailbox sync can run."}
                        </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Sync policy</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">Admin controlled</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Mailbox import is only available to admin and staff users with explicit backend permission.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Sync folder</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{health?.inbound_mailbox_folder ?? "INBOX"}</p>
                        <p className="mt-1 text-sm text-slate-500">
                            The backend imports unread messages from this folder and avoids duplicates using message IDs.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
