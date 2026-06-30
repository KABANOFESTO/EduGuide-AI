"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, Bot, Mail, Send } from "lucide-react";

import { useGetEmailDashboardQuery, useGetEmailsQuery } from "@/lib/redux/silces/EmailSlice";

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

export default function DashboardOverview() {
    const { data: dashboard } = useGetEmailDashboardQuery(undefined);
    const { data: emails = [] } = useGetEmailsQuery({ ordering: "-received_at", page_size: 4 });

    const stats = useMemo(() => {
        const replied = dashboard?.replied ?? 0;
        const total = dashboard?.total_emails ?? 0;
        return [
            { label: "Inbox Today", value: total, sublabel: `${dashboard?.review_queue ?? 0} awaiting review`, icon: Mail },
            { label: "Approved & Sent", value: replied, sublabel: "Live dispatch count", icon: Send },
            { label: "Auto Confidence", value: `${Math.round((dashboard?.average_confidence ?? 0) * 100)}%`, sublabel: "Backend confidence avg", icon: Bot },
            { label: "Escalated", value: dashboard?.review_queue ?? 0, sublabel: "Needs reviewer attention", icon: AlertTriangle },
        ];
    }, [dashboard]);

    const recentEmails = (emails as Array<{
        id: number;
        subject: string;
        sender_email: string;
        classification?: { category: string; confidence_score: number };
        status: string;
    }>).slice(0, 4);

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-8">
            <div className="mx-auto max-w-6xl">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </div>

                <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Recent Emails</h2>
                            <p className="text-sm text-slate-500">Live mail intake from the backend.</p>
                        </div>
                        <Link
                            href="/email_staff/inbox"
                            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            View all
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {recentEmails.length === 0 ? (
                            <div className="px-6 py-10 text-center text-sm text-slate-400">
                                No recent emails to show.
                            </div>
                        ) : (
                            recentEmails.map((email) => (
                                <div key={email.id} className="flex items-start justify-between gap-4 px-6 py-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{email.subject}</p>
                                        <p className="mt-1 text-sm text-slate-500">{email.sender_email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-slate-400">{email.classification?.category ?? "Unclassified"}</p>
                                        <p className="mt-1 text-xs text-slate-500">{email.status}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
