"use client";

import { useMemo } from "react";
import { PenLine } from "lucide-react";

import { useGetEmailsQuery } from "@/lib/redux/silces/EmailSlice";

export default function CorrectionsPage() {
    const { data: emails = [] } = useGetEmailsQuery({ status: "REVIEW", ordering: "-escalated_at" });

    const rows = useMemo(() => {
        return (emails as Array<{
            id: number;
            sender_email: string;
            subject: string;
            classification?: { category: string; confidence_score: number } | null;
            ai_response?: { generated_text: string; dispatch_status: string } | null;
            review?: { review_status: string; corrected_response: string } | null;
            escalated_at?: string | null;
        }>).map((email) => email);
    }, [emails]);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-6xl">
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Corrections</h2>
                            <p className="text-sm text-slate-500">Live review items awaiting correction or approval.</p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            <PenLine size={14} />
                            Live queue
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {rows.length === 0 ? (
                            <div className="px-6 py-10 text-center text-sm text-slate-400">
                                No corrections waiting right now.
                            </div>
                        ) : (
                            rows.map((item) => (
                                <div key={item.id} className="px-6 py-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">{item.subject}</h3>
                                            <p className="mt-1 text-sm text-slate-500">{item.sender_email}</p>
                                        </div>
                                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                            {item.classification?.category ?? "Unclassified"}
                                        </span>
                                    </div>
                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">AI Reply</p>
                                        <p className="mt-2 text-sm text-slate-700">
                                            {item.ai_response?.generated_text ?? "No AI reply available."}
                                        </p>
                                    </div>
                                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Reviewer Correction</p>
                                        <p className="mt-2 text-sm text-emerald-900">
                                            {item.review?.corrected_response ?? "Pending reviewer correction."}
                                        </p>
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
