"use client";

import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";

import { useGetEmailsQuery } from "@/lib/redux/silces/EmailSlice";

export default function ApprovedEmailsPage() {
    const { data: emails = [] } = useGetEmailsQuery({ status: "REPLIED", ordering: "-replied_at" });

    const rows = useMemo(() => {
        return (emails as Array<{
            id: number;
            sender_email: string;
            subject: string;
            classification?: { category: string; confidence_score: number } | null;
            ai_response?: { dispatch_status: string; approved: boolean } | null;
            review?: { review_status: string; corrected_response: string } | null;
            replied_at?: string | null;
        }>).map((email) => ({
            ...email,
            approvedAt: email.replied_at ?? "",
        }));
    }, [emails]);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-6xl">
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Approved Emails</h2>
                            <p className="text-sm text-slate-500">Messages that have been approved and dispatched.</p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={14} />
                            Live results
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">ID</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Subject</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">From</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Intent</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Dispatch</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Approved At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                                            No approved emails yet.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((email) => (
                                        <tr key={email.id}>
                                            <td className="px-6 py-4 text-sm text-slate-500">#{email.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{email.subject}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{email.sender_email}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{email.classification?.category ?? "Unclassified"}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{email.ai_response?.dispatch_status ?? "DRAFT"}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{email.approvedAt ? new Date(email.approvedAt).toLocaleString() : "-"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
