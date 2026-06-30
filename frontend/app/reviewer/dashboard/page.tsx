"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, CheckCircle, Clock3, Inbox } from "lucide-react";

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

export default function ReviewDashboard() {
    const { data: dashboard } = useGetEmailDashboardQuery(undefined);
    const { data: queue = [] } = useGetEmailsQuery({ status: "REVIEW", ordering: "-received_at", page_size: 4 });

    const stats = useMemo(() => {
        return [
            { label: "Pending Review", value: dashboard?.review_queue ?? 0, sublabel: "Live backend queue", icon: Inbox },
            { label: "Reviewed Today", value: dashboard?.replied ?? 0, sublabel: "Resolved by staff/reviewer", icon: CheckCircle },
            { label: "Average Confidence", value: `${Math.round((dashboard?.average_confidence ?? 0) * 100)}%`, sublabel: "Model confidence average", icon: Clock3 },
            { label: "Escalations", value: queue.length, sublabel: "Needs human attention", icon: AlertTriangle },
        ];
    }, [dashboard, queue.length]);

    const recentQueue = (queue as Array<{
        id: number;
        subject: string;
        sender_email: string;
        classification?: { category: string; confidence_score: number };
        confidence_score?: number;
        received_at: string;
    }>).slice(0, 4);

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </div>

                <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Review Queue</h2>
                            <p className="text-sm text-slate-500">Emails escalated from the staff inbox.</p>
                        </div>
                        <Link
                            href="/reviewer/queue"
                            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            Open queue
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {recentQueue.length === 0 ? (
                            <div className="px-6 py-10 text-center text-sm text-slate-400">
                                Nothing is waiting for review.
                            </div>
                        ) : (
                            recentQueue.map((email) => (
                                <div key={email.id} className="flex items-start justify-between gap-4 px-6 py-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{email.subject}</p>
                                        <p className="mt-1 text-sm text-slate-500">{email.sender_email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-slate-400">{email.classification?.category ?? "Unclassified"}</p>
                                        <p className="mt-1 text-xs text-slate-500">{Math.round(email.classification?.confidence_score ?? email.confidence_score ?? 0)}%</p>
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
