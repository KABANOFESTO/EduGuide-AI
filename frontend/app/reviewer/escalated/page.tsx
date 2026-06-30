"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";

import { useGetEmailsQuery } from "@/lib/redux/silces/EmailSlice";

export default function EscalatedPage() {
    const { data: emails = [] } = useGetEmailsQuery({ status: "REVIEW", ordering: "-escalated_at" });

    const rows = useMemo(() => {
        return (emails as Array<{
            id: number;
            sender_email: string;
            subject: string;
            classification?: { category: string; confidence_score: number } | null;
            confidence_score?: number | null;
            escalated_at?: string | null;
            assigned_to?: { username: string } | null;
        }>).map((email) => email);
    }, [emails]);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-6xl space-y-5">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                    <p className="text-sm font-semibold text-amber-700">Escalated emails need attention</p>
                    <p className="text-sm text-amber-700/80">These records are currently in the review queue.</p>
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                        <AlertTriangle className="text-amber-600" size={18} />
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Escalated Emails</h2>
                            <p className="text-sm text-slate-500">Fetched from the live email table.</p>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {rows.length === 0 ? (
                            <div className="px-6 py-10 text-center text-sm text-slate-400">
                                No escalated emails are waiting.
                            </div>
                        ) : (
                            rows.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{item.subject}</p>
                                        <p className="mt-1 text-sm text-slate-500">{item.sender_email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-slate-400">{item.classification?.category ?? "Unclassified"}</p>
                                        <p className="mt-1 text-xs text-slate-500">{Math.round(item.classification?.confidence_score ?? item.confidence_score ?? 0)}%</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
